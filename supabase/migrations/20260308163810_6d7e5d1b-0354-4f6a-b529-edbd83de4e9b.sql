
-- Message reactions table
CREATE TABLE public.message_reactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID NOT NULL REFERENCES public.chat_messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  emoji TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(message_id, user_id, emoji)
);

ALTER TABLE public.message_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can add reactions to messages in their rooms"
ON public.message_reactions FOR INSERT TO authenticated
WITH CHECK (
  user_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.chat_messages cm
    WHERE cm.id = message_reactions.message_id
    AND public.is_room_member(cm.room_id, auth.uid())
  )
);

CREATE POLICY "Users can view reactions in their rooms"
ON public.message_reactions FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.chat_messages cm
    WHERE cm.id = message_reactions.message_id
    AND public.is_room_member(cm.room_id, auth.uid())
  )
);

CREATE POLICY "Users can remove own reactions"
ON public.message_reactions FOR DELETE TO authenticated
USING (user_id = auth.uid());

-- Pinned messages table
CREATE TABLE public.pinned_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID NOT NULL REFERENCES public.chat_messages(id) ON DELETE CASCADE,
  room_id UUID NOT NULL REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
  pinned_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(message_id)
);

ALTER TABLE public.pinned_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Room members can pin messages"
ON public.pinned_messages FOR INSERT TO authenticated
WITH CHECK (
  pinned_by = auth.uid() AND public.is_room_member(room_id, auth.uid())
);

CREATE POLICY "Room members can view pins"
ON public.pinned_messages FOR SELECT TO authenticated
USING (public.is_room_member(room_id, auth.uid()));

CREATE POLICY "Room members can unpin"
ON public.pinned_messages FOR DELETE TO authenticated
USING (public.is_room_member(room_id, auth.uid()));

-- Favorite messages table
CREATE TABLE public.favorite_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID NOT NULL REFERENCES public.chat_messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(message_id, user_id)
);

ALTER TABLE public.favorite_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can favorite messages"
ON public.favorite_messages FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view own favorites"
ON public.favorite_messages FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can unfavorite"
ON public.favorite_messages FOR DELETE TO authenticated
USING (user_id = auth.uid());

-- Deleted messages tracking (for "delete for me")
CREATE TABLE public.deleted_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID NOT NULL REFERENCES public.chat_messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(message_id, user_id)
);

ALTER TABLE public.deleted_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can delete for self"
ON public.deleted_messages FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view own deletions"
ON public.deleted_messages FOR SELECT TO authenticated
USING (user_id = auth.uid());

-- Add deleted_for_everyone column to chat_messages
ALTER TABLE public.chat_messages ADD COLUMN deleted_for_everyone BOOLEAN NOT NULL DEFAULT false;

-- Allow message senders to update their own messages (for delete for everyone)
CREATE POLICY "Senders can update own messages"
ON public.chat_messages FOR UPDATE TO authenticated
USING (sender_id = auth.uid());

-- Enable realtime for reactions
ALTER PUBLICATION supabase_realtime ADD TABLE public.message_reactions;
