
-- Create a security definer function to check room membership without triggering RLS
CREATE OR REPLACE FUNCTION public.is_room_member(_room_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.chat_room_members
    WHERE room_id = _room_id AND user_id = _user_id
  )
$$;

-- Drop the recursive SELECT policy
DROP POLICY IF EXISTS "Members can view room members" ON public.chat_room_members;

-- Recreate without recursion
CREATE POLICY "Members can view room members"
ON public.chat_room_members
FOR SELECT
USING (public.is_room_member(room_id, auth.uid()));

-- Also fix chat_rooms SELECT policy that references chat_room_members
DROP POLICY IF EXISTS "Members can view their rooms" ON public.chat_rooms;
CREATE POLICY "Members can view their rooms"
ON public.chat_rooms
FOR SELECT
USING (public.is_room_member(id, auth.uid()));

-- Fix chat_messages SELECT policy
DROP POLICY IF EXISTS "Members can view room messages" ON public.chat_messages;
CREATE POLICY "Members can view room messages"
ON public.chat_messages
FOR SELECT
USING (public.is_room_member(room_id, auth.uid()));

-- Fix chat_messages INSERT policy
DROP POLICY IF EXISTS "Members can send messages" ON public.chat_messages;
CREATE POLICY "Members can send messages"
ON public.chat_messages
FOR INSERT
WITH CHECK (sender_id = auth.uid() AND public.is_room_member(room_id, auth.uid()));

-- Fix chat_room_members INSERT policy
DROP POLICY IF EXISTS "Room creators can add members" ON public.chat_room_members;
CREATE POLICY "Room creators can add members"
ON public.chat_room_members
FOR INSERT
WITH CHECK (
  (EXISTS (SELECT 1 FROM chat_rooms WHERE id = chat_room_members.room_id AND created_by = auth.uid()))
  OR (user_id = auth.uid())
);
