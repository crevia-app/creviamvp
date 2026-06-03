-- Fix workspaces that were created with is_group=false.
-- All named chat_rooms are workspaces and must have is_group=true so that
-- getRoomDisplayName returns room.name instead of falling through to the DM branch.
UPDATE public.chat_rooms
SET    is_group = true
WHERE  name IS NOT NULL
AND    is_group = false;
