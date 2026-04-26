-- Add encrypted private key backup for cross-device E2E encryption
-- The private key is encrypted client-side with PBKDF2-derived key before storage
-- Supabase never sees the plaintext private key
ALTER TABLE public.user_encryption_keys
  ADD COLUMN IF NOT EXISTS encrypted_private_key text,
  ADD COLUMN IF NOT EXISTS key_salt text;
