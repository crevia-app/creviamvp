import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { generateUserKeyPair, backupPrivateKey, restorePrivateKey } from "@/lib/e2e-crypto";
import { idbGetPrivateKey, idbStorePrivateKey, idbStorePublicKeyJwk, idbClear } from "@/lib/indexeddb-crypto";

export type E2EEStatus = "idle" | "initializing" | "ready" | "error";

export interface UseInitializeE2EEResult {
  status: E2EEStatus;
  error: Error | null;
  retry: () => void;
}

const TAG = "[E2EE Init]";

export function useInitializeE2EE(userId: string): UseInitializeE2EEResult {
  // This line fires on every render — if you see it with an empty userId, the
  // auth state hasn't resolved yet. Once userId is set, the effect below runs.
  console.log(`${TAG} hook called — userId: "${userId || "(not set yet)"}"`);

  const [status, setStatus] = useState<E2EEStatus>("idle");
  const [error, setError] = useState<Error | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!userId) {
      console.log(`${TAG} useEffect skipped — no userId yet`);
      return;
    }
    console.log(`${TAG} useEffect fired — starting init for userId: ${userId}`);

    let cancelled = false;

    const run = async () => {
      setStatus("initializing");
      setError(null);

      try {
        // ── Step 1: Check IndexedDB ───────────────────────────────────────────
        console.log(`${TAG} Checking IndexedDB for existing private key...`);
        const cachedPrivateKey = await idbGetPrivateKey(userId);
        console.log(`${TAG} IndexedDB result:`, cachedPrivateKey ? "✅ Private key found" : "❌ No private key");

        // ── Step 2: Check Supabase ────────────────────────────────────────────
        console.log(`${TAG} Syncing with Supabase — fetching key record...`);
        const { data, error: fetchError } = await supabase
          .from("user_encryption_keys")
          .select("public_key, encrypted_private_key, key_salt")
          .eq("user_id", userId)
          .maybeSingle();

        if (cancelled) return;

        if (fetchError) {
          // Hard network errors (no code/status) are unrecoverable at this point.
          const isNetworkError = !fetchError.code && !fetchError.status;
          if (isNetworkError) {
            throw new Error(`Network error fetching encryption keys: ${fetchError.message}`);
          }
          console.warn(`${TAG} Supabase fetch warning (non-fatal):`, fetchError.message);
        }

        const hasSupabaseRecord = !!data && !fetchError;
        console.log(`${TAG} Supabase record:`, hasSupabaseRecord ? "✅ Found" : "❌ Not found");

        // ── Happy path: IDB + Supabase both have data ─────────────────────────
        if (hasSupabaseRecord && cachedPrivateKey) {
          console.log(`${TAG} ✅ Already initialised — private key in IDB, public key in Supabase`);
          if (!cancelled) setStatus("ready");
          return;
        }

        // ── Cross-device recovery: Supabase has backup, IDB is empty ─────────
        if (hasSupabaseRecord && !cachedPrivateKey) {
          const { public_key, encrypted_private_key, key_salt } = data!;

          if (encrypted_private_key && key_salt) {
            console.log(`${TAG} 🔄 Cross-device recovery — restoring private key from Supabase backup...`);
            await restorePrivateKey(userId, encrypted_private_key, key_salt);
            // Cache the public JWK locally so initUserKeys (called from chat) won't
            // treat the missing public-userId IDB entry as a signal to regenerate keys.
            if (public_key) {
              try {
                await idbStorePublicKeyJwk(userId, JSON.parse(public_key));
              } catch {
                // non-fatal — initUserKeys still works via the private key
              }
            }
            console.log(`${TAG} ✅ Private key restored to IndexedDB`);
            if (!cancelled) setStatus("ready");
            return;
          }

          // Remote record exists but backup columns are empty (legacy row).
          // Fall through to regenerate and overwrite via upsert.
          console.log(`${TAG} ⚠️ Remote record has no private key backup — regenerating...`);
        }

        // ── Key generation: no usable keys found anywhere ─────────────────────
        console.log(`${TAG} 🔑 Generating new RSA-OAEP key pair (extractable: true)...`);
        const { publicKeyJwk, privateKey } = await generateUserKeyPair();
        console.log(`${TAG} ✅ Key pair generated`);

        console.log(`${TAG} 💾 Storing private key in IndexedDB...`);
        await idbStorePrivateKey(userId, privateKey);
        await idbStorePublicKeyJwk(userId, publicKeyJwk);
        console.log(`${TAG} ✅ Private key stored in IndexedDB`);

        console.log(`${TAG} 🔒 Encrypting private key backup (PBKDF2 + AES-256-GCM)...`);
        const { encryptedKey, saltBase64 } = await backupPrivateKey(userId, privateKey);
        console.log(`${TAG} ✅ Private key encrypted for cloud backup`);

        console.log(`${TAG} ☁️  Syncing public key + encrypted backup to Supabase...`);
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

        console.log(`${TAG} ✅ E2EE initialisation complete — keys synced to Supabase`);
        if (!cancelled) setStatus("ready");
      } catch (err) {
        if (cancelled) return;

        console.error(`${TAG} ❌ Initialisation failed:`, err);

        // IDB InvalidStateError / UnknownError = corrupted browser database.
        // The only safe recovery is to wipe all local state and redirect to login.
        const isCorruptedState =
          err instanceof DOMException &&
          (err.name === "InvalidStateError" || err.name === "UnknownError");

        if (isCorruptedState) {
          console.error(`${TAG} 💥 Corrupted IDB state — clearing local storage and redirecting to login`);
          try {
            localStorage.clear();
            sessionStorage.clear();
            await idbClear();
          } catch {
            // best-effort cleanup
          }
          window.location.replace("/auth");
          return;
        }

        const wrapped = err instanceof Error ? err : new Error(String(err));
        setError(wrapped);
        setStatus("error");
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [userId, attempt]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  return { status, error, retry };
}
