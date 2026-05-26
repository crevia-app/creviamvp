/**
 * Key scheme migration: v1 (userId-wrapped) → v2 (password-wrapped).
 *
 * Safe to call multiple times — it is idempotent. If the key is already v2,
 * it re-encrypts under the new password (useful for password rotation later).
 *
 * Prerequisites:
 *   - The user must be authenticated (supabase.auth.getUser() returns a user).
 *   - The user's private key must be in IndexedDB. This is always true on
 *     their original device, and also true after a v1 auto-restore on a new
 *     device (useInitializeE2EE handles that before surfacing needsMigration).
 *
 * Throws if:
 *   - The private key is not in IDB (migration must run on a device that has it).
 *   - The Supabase update fails (network error / RLS violation).
 */

import { supabase } from "@/integrations/supabase/client";
import { backupPrivateKey, isV2Key } from "./e2e-crypto";
import { idbGetPrivateKey } from "./indexeddb-crypto";

export type KeyScheme = "v2" | "v1" | "none";

// ── Scheme detection ──────────────────────────────────────────────────────────

export async function checkKeyScheme(userId: string): Promise<KeyScheme> {
  const { data } = await supabase
    .from("user_encryption_keys")
    .select("encrypted_private_key")
    .eq("user_id", userId)
    .maybeSingle();

  if (!data?.encrypted_private_key) return "none";
  return isV2Key(data.encrypted_private_key) ? "v2" : "v1";
}

// ── Migration ─────────────────────────────────────────────────────────────────

export async function migrateToPasswordScheme(
  userId: string,
  newPassword: string
): Promise<void> {
  const privateKey = await idbGetPrivateKey(userId);
  if (!privateKey) {
    throw new Error(
      "Private key not found in local storage. " +
      "Migration must be performed on your original device, or after signing in on a new device."
    );
  }

  // Re-encrypt under the new password (v2 scheme, 210k PBKDF2 iterations).
  const { encryptedKey, saltBase64 } = await backupPrivateKey(newPassword, privateKey);

  const { error } = await supabase
    .from("user_encryption_keys")
    .update({
      encrypted_private_key: encryptedKey,
      key_salt: saltBase64,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId);

  if (error) {
    throw new Error(`Failed to save recovery backup: ${error.message}`);
  }
}

// ── Password validation helpers ───────────────────────────────────────────────

export interface PasswordStrength {
  score: number; // 0–4 (like zxcvbn)
  feedback: string;
}

export function assessRecoveryPassword(password: string): PasswordStrength {
  if (password.length < 12) {
    return { score: 0, feedback: "Must be at least 12 characters." };
  }
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasDigit = /\d/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);
  const varietyCount = [hasUpper, hasLower, hasDigit, hasSymbol].filter(Boolean).length;

  if (varietyCount < 2) return { score: 1, feedback: "Add numbers or symbols to strengthen it." };
  if (varietyCount < 3) return { score: 2, feedback: "Good. Adding symbols would make it stronger." };
  if (password.length < 16) return { score: 3, feedback: "Strong. 16+ characters would make it excellent." };
  return { score: 4, feedback: "Excellent password." };
}
