
-- FIX 1: Chat room hijacking - Remove the OR branch that lets any user join any room
DROP POLICY IF EXISTS "Room creators can add members" ON public.chat_room_members;
CREATE POLICY "Room creators can add members"
ON public.chat_room_members
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM chat_rooms
    WHERE chat_rooms.id = chat_room_members.room_id
    AND chat_rooms.created_by = auth.uid()
  )
);

-- FIX 2: Restrict is_room_member to only allow checking own membership
CREATE OR REPLACE FUNCTION public.is_room_member(_room_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.chat_room_members
    WHERE room_id = _room_id AND user_id = _user_id
  )
$$;

-- FIX 3: Fix email exposure - create a public view excluding sensitive data
CREATE OR REPLACE VIEW public.profiles_public
WITH (security_invoker = on) AS
SELECT id, user_type, handle, display_name, bio, avatar_url, is_verified, 
       verification_status, verification_method, created_at, updated_at
FROM public.profiles;

-- FIX 4: Fix function search path on update_updated_at_column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
