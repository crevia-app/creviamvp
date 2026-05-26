import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  generateUserKeyPair,
  backupPrivateKeyV1,
  restorePrivateKey,
  restorePrivateKeyV1,
  isV2Key,
} from "@/lib/e2e-crypto";
import { idbGetPrivateKey, idbStorePrivateKey, idbStorePublicKeyJwk, idbClear } from "@/lib/indexeddb-crypto";

export type E2EEStatus = "idle" | "initializing" | "ready" | "needs_recovery_password" | "error";

export interface UseInitializeE2EEResult {
  status: E2EEStatus;
  error: Error | null;
  retry: () => void;
  // Raised when the user is on a NEW device and has a v2 (password-protected) backup.
  // Show a recovery password modal and call provideRecoveryPassword() with the input.
  needsRecoveryPassword: boolean;
  // Raised when the user's backup was silently auto-restored from the legacy v1 scheme
  // (userId-wrapped). Show a migration prompt so they can set a real recovery password.
  needsMigration: boolean;
  // Call this from the recovery password modal when the user submits their password.
  provideRecoveryPassword: (password: string) => Promise<void>;
  // Call this after the user completes migration (sets a recovery password via key-migration.ts).
  clearMigrationFlag: () => void;
}

const TAG = "[E2EE Init]";

export function useInitializeE2EE(userId: string): UseInitializeE2EEResult {
  const [status, setStatus] = useState<E2EEStatus>("idle");
  const [error, setError] = useState<Error | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [needsRecoveryPassword, setNeedsRecoveryPassword] = useState(false);
  const [needsMigration, setNeedsMigration] = useState(false);

  // Holds Supabase backup data while we wait for the user to type their password.
  const pendingRecoveryRef = useRef<{
    encryptedPrivateKey: string;
    keySalt: string;
    publicKey: string | null;
  } | null>(null);

  useEffect(() => {
    if (!userId) return;

    let cancelled = false;

    const run = async () => {
      setStatus("initializing");
      setError(null);

      try {
        // ── Step 1: Check IndexedDB ───────────────────────────────────────────
        const cachedPrivateKey = await idbGetPrivateKey(userId);

        // ── Step 2: Check Supabase ────────────────────────────────────────────
        const { data, error: fetchError } = await supabase
          .from("user_encryption_keys")
          .select("public_key, encrypted_private_key, key_salt")
          .eq("user_id", userId)
          .maybeSingle();

        if (cancelled) return;

        if (fetchError) {
          const isNetworkError = !fetchError.code && !fetchError.status;
          if (isNetworkError) {
            throw new Error(`Network error fetching encryption keys: ${fetchError.message}`);
          }
          console.warn(`${TAG} Supabase fetch warning (non-fatal):`, fetchError.message);
        }

        const hasSupabaseRecord = !!data && !fetchError;

        // ── Happy path: IDB + Supabase both have data ─────────────────────────
        if (hasSupabaseRecord && cachedPrivateKey) {
          console.log(`${TAG} ✅ Already initialised`);
          if (!cancelled) setStatus("ready");
          return;
        }

        // ── Cross-device recovery: Supabase has backup, IDB is empty ─────────
        if (hasSupabaseRecord && !cachedPrivateKey) {
          const { public_key, encrypted_private_key, key_salt } = data!;

          if (encrypted_private_key && key_salt) {
            if (isV2Key(encrypted_private_key)) {
              // v2 key: cannot restore without the user's recovery password.
              // Park the data in a ref, update status, and wait for UI input.
              console.log(`${TAG} 🔐 v2 backup detected — recovery password required`);
              pendingRecoveryRef.current = {
                encryptedPrivateKey: encrypted_private_key,
                keySalt: key_salt,
                publicKey: public_key ?? null,
              };
              if (!cancelled) {
                setNeedsRecoveryPassword(true);
                setStatus("needs_recovery_password");
              }
              return;
            } else {
              // v1 key: auto-restore using userId as the PBKDF2 input (backward compat).
              // Flag for migration immediately after — the user needs to set a real password.
              console.log(`${TAG} 🔄 v1 backup detected — auto-restoring, migration required`);
              await restorePrivateKeyV1(userId, encrypted_private_key, key_salt);
              if (public_key) {
                try { await idbStorePublicKeyJwk(userId, JSON.parse(public_key)); } catch { /* non-fatal */ }
              }
              console.log(`${TAG} ✅ v1 key restored — flagging for migration`);
              if (!cancelled) {
                setStatus("ready");
                setNeedsMigration(true);
              }
              return;
            }
          }

          // Remote record exists but backup columns are empty (legacy row with no backup).
          // Fall through to regenerate.
          console.log(`${TAG} ⚠️ Remote record has no private key backup — regenerating...`);
        }

        // ── Key generation: no usable keys found anywhere ─────────────────────
        // This only runs for brand-new users (no Supabase record at all).
        // Existing users will always hit one of the paths above.
        console.log(`${TAG} 🔑 Generating new RSA-OAEP key pair...`);
        const { publicKeyJwk, privateKey } = await generateUserKeyPair();

        await idbStorePrivateKey(userId, privateKey);
        await idbStorePublicKeyJwk(userId, publicKeyJwk);

        // New users: use a v1 backup (userId-keyed, no v2: prefix) so the key is
        // auto-restorable on a new device before they set a recovery password.
        // The migration prompt (needsMigration: true) will upgrade them to v2.
        const { encryptedKey, saltBase64 } = await backupPrivateKeyV1(userId, privateKey);

        const { error: upsertError } = await supabase
          .from("user_encryption_keys")
          .upsert(
            {
              user_id: userId,
              public_key: JSON.stringify(publicKeyJwk),
              encrypted_private_key: encryptedKey,
              key_salt: saltBase64,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "user_id" }
          );

        if (upsertError) {
          throw new Error(`Failed to save encryption keys: ${upsertError.message}`);
        }

        console.log(`${TAG} ✅ New key pair generated and synced`);
        if (!cancelled) {
          setStatus("ready");
          setNeedsMigration(true); // prompt them to set a recovery password immediately
        }
      } catch (err) {
        if (cancelled) return;
        console.error(`${TAG} ❌ Initialisation failed:`, err);

        const isCorruptedState =
          err instanceof DOMException &&
          (err.name === "InvalidStateError" || err.name === "UnknownError");

        if (isCorruptedState) {
          console.error(`${TAG} 💥 Corrupted IDB state — clearing and redirecting`);
          try {
            localStorage.clear();
            sessionStorage.clear();
            await idbClear();
          } catch { /* best-effort */ }
          window.location.replace("/auth");
          return;
        }

        const wrapped = err instanceof Error ? err : new Error(String(err));
        setError(wrapped);
        setStatus("error");
      }
    };

    run();
    return () => { cancelled = true; };
  }, [userId, attempt]);

  // Called from the recovery password modal on a new device with a v2 backup.
  const provideRecoveryPassword = useCallback(async (password: string) => {
    const pending = pendingRecoveryRef.current;
    if (!pending) {
      console.error(`${TAG} provideRecoveryPassword called with no pending recovery data`);
      return;
    }

    setError(null);
    setStatus("initializing");

    try {
      await restorePrivateKey(
        userId,
        password,
        pending.encryptedPrivateKey,
        pending.keySalt
      );

      if (pending.publicKey) {
        try { await idbStorePublicKeyJwk(userId, JSON.parse(pending.publicKey)); } catch { /* non-fatal */ }
      }

      pendingRecoveryRef.current = null;
      setNeedsRecoveryPassword(false);
      setStatus("ready");
      console.log(`${TAG} ✅ v2 key restored with recovery password`);
    } catch (err) {
      // A DOMException (OperationError) from crypto.subtle.decrypt means wrong password.
      const isWrongPassword =
        err instanceof DOMException ||
        (err instanceof Error && err.name === "OperationError");

      setError(
        new Error(isWrongPassword
          ? "Incorrect recovery password. Please try again."
          : `Restore failed: ${err instanceof Error ? err.message : String(err)}`
        )
      );
      // Keep status at needs_recovery_password so the modal stays open.
      setStatus("needs_recovery_password");
    }
  }, [userId]);

  const clearMigrationFlag = useCallback(() => setNeedsMigration(false), []);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  return {
    status,
    error,
    retry,
    needsRecoveryPassword,
    needsMigration,
    provideRecoveryPassword,
    clearMigrationFlag,
  };
}
