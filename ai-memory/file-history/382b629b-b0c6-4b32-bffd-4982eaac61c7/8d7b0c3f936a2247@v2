---
name: Security Architecture — E2EE Key Backup
description: v1 vs v2 key backup scheme, migration path, and key files involved
type: project
originSessionId: 5575c1c2-2ae2-40d7-b4ef-59c8f88d8717
---
E2EE private keys are backed up encrypted to Supabase.

**v1 (legacy, broken):** Used userId as the PBKDF2 password — userId is in every JWT so the backup was effectively unencrypted against an attacker with DB access. v1 keys auto-restore and trigger migration.

**v2 (current):** PBKDF2 with 210,000 iterations using a user-chosen recovery password. versioned with isV2Key() check.

Key files:
- `src/lib/e2e-crypto.ts` — crypto primitives, v1/v2 split, backupPrivateKey(password), restorePrivateKey(userId, password), backupPrivateKeyV1, restorePrivateKeyV1
- `src/lib/key-migration.ts` — migrateToPasswordScheme(), assessRecoveryPassword()
- `src/hooks/use-initialize-e2ee.ts` — new-device guard, v1 auto-restore + migration flag, v2 blocks on recovery password. Emits: needsMigration, needsRecoveryPassword, provideRecoveryPassword, clearMigrationFlag
- `src/hooks/use-e2e-encryption.ts` — fallback restore path, v2 returns null on wrong password rather than silently failing
- `src/components/auth/RecoveryPasswordModal.tsx` — non-dismissible, shown when v2 backup exists on new device
- `src/components/auth/SetRecoveryPasswordDialog.tsx` — migration prompt with strength meter

**Why:** Original scheme was a security vulnerability: userId is public, so encrypted backup was trivially decryptable.

**How to apply:** Never use userId or any non-secret as a PBKDF2 password. Any new key storage must go through v2 path.
