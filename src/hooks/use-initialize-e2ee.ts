import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { generateUserKeyPair, backupPrivateKey, restorePrivateKey } from "@/lib/e2e-crypto";
import { idbGetPrivateKey, idbStorePrivateKey, idbClear } from "@/lib/indexeddb-crypto";

export type E2EEStatus = "idle" | "initializing" | "ready" | "error";

export interface UseInitializeE2EEResult {
  status: E2EEStatus;
  error: Error | null;
  retry: () => void;
}

export function useInitializeE2EE(userId: string): UseInitializeE2EEResult {
  const [status, setStatus] = useState<E2EEStatus>("idle");
  const [error, setError] = useState<Error | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!userId) return;

    let cancelled = false;

    const run = async () => {
      setStatus("initializing");
      setError(null);

      try {
        // ── Step 1: Check for an existing private key in IndexedDB ──────────
        const cachedPrivateKey = await idbGetPrivateKey(userId);

        // ── Step 2: Fetch the Supabase record ────────────────────────────────
        // Use maybeSingle() so that a missing row returns null instead of 406.
        const { data, error: fetchError } = await (supabase
          .from("user_encryption_keys" as any)
          .select("public_key, encrypted_private_key, key_salt")
          .eq("user_id", userId)
          .maybeSingle() as any);

        if (cancelled) return;

        // PostgREST error codes: PGRST116 = "single row expected, 0 found"
        // We treat any fetch error other than network errors as "no record".
        const isNetworkError =
          fetchError && !fetchError.code && !fetchError.status;
        if (isNetworkError) {
          throw new Error(`Network error fetching encryption keys: ${fetchError.message}`);
        }

        const hasSupabaseRecord = !!data && !fetchError;

        // ── Happy path: local key + remote record both present ───────────────
        if (hasSupabaseRecord && cachedPrivateKey) {
          if (!cancelled) setStatus("ready");
          return;
        }

        // ── Cross-device recovery: remote backup exists, IDB is empty ────────
        if (hasSupabaseRecord && !cachedPrivateKey) {
          const { encrypted_private_key, key_salt } = data as {
            encrypted_private_key: string | null;
            key_salt: string | null;
          };

          if (encrypted_private_key && key_salt) {
            // Decrypt and cache the private key locally — no new keypair needed
            await restorePrivateKey(userId, encrypted_private_key, key_salt);
            if (!cancelled) setStatus("ready");
            return;
          }
          // Remote record exists but has no backup (legacy row) — fall through
          // to regenerate and overwrite via upsert below.
        }

        // ── Key generation: no usable keys found anywhere ────────────────────
        const { publicKeyJwk, privateKey } = await generateUserKeyPair();

        // Store private key locally first — local is authoritative
        await idbStorePrivateKey(userId, privateKey);

        // Encrypt the private key for Supabase backup (client-side, AES-256-GCM)
        const { encryptedKey, saltBase64 } = await backupPrivateKey(userId, privateKey);

        const { error: upsertError } = await (supabase
          .from("user_encryption_keys" as any)
          .upsert(
            {
              user_id: userId,
              public_key: JSON.stringify(publicKeyJwk),
              encrypted_private_key: encryptedKey,
              key_salt: saltBase64,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "user_id" }
          ) as any);

        if (upsertError) {
          throw new Error(`Failed to save encryption keys: ${upsertError.message}`);
        }

        if (!cancelled) setStatus("ready");
      } catch (err) {
        if (cancelled) return;

        // IDB InvalidStateError / UnknownError = corrupted browser database.
        // The only safe recovery is to wipe local state and force a fresh login.
        const isCorruptedState =
          err instanceof DOMException &&
          (err.name === "InvalidStateError" || err.name === "UnknownError");

        if (isCorruptedState) {
          try {
            localStorage.clear();
            sessionStorage.clear();
            await idbClear();
          } catch {
            // best-effort cleanup
          }
          window.location.replace("/login");
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
