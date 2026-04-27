-- E2EE tables: idempotent recreation after database wipe.
-- Run this in the Supabase SQL editor or via `supabase db push`.

-- ─── user_encryption_keys ────────────────────────────────────────────────────
-- Stores each user's RSA-OAEP public key and their AES-encrypted private key
-- backup (encrypted client-side before upload; Supabase never sees plaintext).

CREATE TABLE IF NOT EXISTS public.user_encryption_keys (
  id                   uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              uuid        NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  public_key           text        NOT NULL,
  encrypted_private_key text,
  key_salt             text,
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_encryption_keys ENABLE ROW LEVEL SECURITY;

-- Drop and recreate policies to ensure a clean state after a wipe.
DROP POLICY IF EXISTS "e2ee_keys_select"  ON public.user_encryption_keys;
DROP POLICY IF EXISTS "e2ee_keys_insert"  ON public.user_encryption_keys;
DROP POLICY IF EXISTS "e2ee_keys_update"  ON public.user_encryption_keys;

-- Any authenticated user can read public keys — required for key exchange.
-- The encrypted_private_key column is only useful to its owner (same SELECT
-- policy is intentional: the ciphertext is useless to anyone else).
CREATE POLICY "e2ee_keys_select"
  ON public.user_encryption_keys
  FOR SELECT
  TO authenticated
  USING (true);

-- Users may only insert a row for themselves.
CREATE POLICY "e2ee_keys_insert"
  ON public.user_encryption_keys
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Users may only update their own row.
CREATE POLICY "e2ee_keys_update"
  ON public.user_encryption_keys
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ─── room_encrypted_keys ─────────────────────────────────────────────────────
-- Stores the per-room AES key, wrapped (RSA-OAEP) once per member.

CREATE TABLE IF NOT EXISTS public.room_encrypted_keys (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id       uuid        NOT NULL REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
  user_id       uuid        NOT NULL,
  encrypted_by  uuid        NOT NULL,
  encrypted_key text        NOT NULL,
  created_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (room_id, user_id)
);

ALTER TABLE public.room_encrypted_keys ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "room_keys_select"  ON public.room_encrypted_keys;
DROP POLICY IF EXISTS "room_keys_insert"  ON public.room_encrypted_keys;
DROP POLICY IF EXISTS "room_keys_update"  ON public.room_encrypted_keys;

-- A user may only read the key entry addressed to them.
CREATE POLICY "room_keys_select"
  ON public.room_encrypted_keys
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Only room members (or the room creator) may insert wrapped keys.
-- This prevents non-members from injecting keys into a room.
CREATE POLICY "room_keys_insert"
  ON public.room_encrypted_keys
  FOR INSERT
  TO authenticated
  WITH CHECK (
    encrypted_by = auth.uid()
    AND (
      EXISTS (
        SELECT 1 FROM public.chat_rooms
        WHERE chat_rooms.id = room_encrypted_keys.room_id
          AND chat_rooms.created_by = auth.uid()
      )
      OR public.is_room_member(room_encrypted_keys.room_id, auth.uid())
    )
  );

-- A user may update only their own row (key rotation / redistribution).
CREATE POLICY "room_keys_update"
  ON public.room_encrypted_keys
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
