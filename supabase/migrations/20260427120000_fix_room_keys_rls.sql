-- Fix: allow authenticated room members to see ALL room_encrypted_keys entries
-- for rooms they belong to.
--
-- Why this matters: the client-side guard that prevents generating a second room
-- key queries room_encrypted_keys to check whether any key already exists for a
-- room. With the old policy (user_id = auth.uid()), a user who has no entry yet
-- always sees zero rows and incorrectly assumes the room is brand-new, causing
-- a second room key to be generated. Since each wrapped key is useless without
-- the recipient's private key, exposing another member's encrypted blob is safe.

DROP POLICY IF EXISTS "room_keys_select" ON public.room_encrypted_keys;

CREATE POLICY "room_keys_select"
  ON public.room_encrypted_keys
  FOR SELECT
  TO authenticated
  USING (
    -- own entry
    user_id = auth.uid()
    OR
    -- any entry for a room the current user belongs to
    public.is_room_member(room_id, auth.uid())
  );
