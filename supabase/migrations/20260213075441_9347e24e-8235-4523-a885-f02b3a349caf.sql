
-- Create chat_rooms table for 1:1 and group conversations
CREATE TABLE public.chat_rooms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT,
  is_group BOOLEAN NOT NULL DEFAULT false,
  created_by UUID NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create chat_room_members table
CREATE TABLE public.chat_room_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(room_id, user_id)
);

-- Create chat_messages table
CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  content TEXT,
  message_type TEXT NOT NULL DEFAULT 'text',
  file_url TEXT,
  file_name TEXT,
  file_type TEXT,
  file_size INTEGER,
  invoice_id UUID REFERENCES public.invoices(id),
  contract_id UUID REFERENCES public.contracts(id),
  is_encrypted BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create chat_read_receipts table
CREATE TABLE public.chat_read_receipts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  last_read_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(room_id, user_id)
);

-- Enable RLS
ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_room_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_read_receipts ENABLE ROW LEVEL SECURITY;

-- RLS: chat_rooms - members can view rooms they belong to
CREATE POLICY "Members can view their rooms" ON public.chat_rooms
FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.chat_room_members WHERE room_id = chat_rooms.id AND user_id = auth.uid())
);

CREATE POLICY "Authenticated users can create rooms" ON public.chat_rooms
FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Room creators can update rooms" ON public.chat_rooms
FOR UPDATE USING (created_by = auth.uid());

-- RLS: chat_room_members
CREATE POLICY "Members can view room members" ON public.chat_room_members
FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.chat_room_members AS m WHERE m.room_id = chat_room_members.room_id AND m.user_id = auth.uid())
);

CREATE POLICY "Room creators can add members" ON public.chat_room_members
FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.chat_rooms WHERE id = chat_room_members.room_id AND created_by = auth.uid())
  OR user_id = auth.uid()
);

CREATE POLICY "Members can leave rooms" ON public.chat_room_members
FOR DELETE USING (user_id = auth.uid());

-- RLS: chat_messages
CREATE POLICY "Members can view room messages" ON public.chat_messages
FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.chat_room_members WHERE room_id = chat_messages.room_id AND user_id = auth.uid())
);

CREATE POLICY "Members can send messages" ON public.chat_messages
FOR INSERT WITH CHECK (
  sender_id = auth.uid() AND
  EXISTS (SELECT 1 FROM public.chat_room_members WHERE room_id = chat_messages.room_id AND user_id = auth.uid())
);

-- RLS: chat_read_receipts
CREATE POLICY "Users can manage their read receipts" ON public.chat_read_receipts
FOR ALL USING (user_id = auth.uid());

-- Enable realtime for chat_messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_room_members;

-- Update trigger for chat_rooms
CREATE TRIGGER update_chat_rooms_updated_at
BEFORE UPDATE ON public.chat_rooms
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
