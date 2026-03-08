
-- Tighten the INSERT policy: only room members/creators can insert room keys
DROP POLICY "Authenticated users can insert room keys" ON public.room_encrypted_keys;

CREATE POLICY "Room members can insert room keys"
  ON public.room_encrypted_keys FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.chat_rooms
      WHERE chat_rooms.id = room_encrypted_keys.room_id
      AND chat_rooms.created_by = auth.uid()
    )
    OR
    public.is_room_member(room_id, auth.uid())
  );
