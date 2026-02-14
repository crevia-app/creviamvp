
-- Fix: Allow room creators to see their own rooms (needed before members are added)
DROP POLICY IF EXISTS "Members can view their rooms" ON public.chat_rooms;
CREATE POLICY "Members can view their rooms"
ON public.chat_rooms
FOR SELECT
USING (public.is_room_member(id, auth.uid()) OR created_by = auth.uid());
