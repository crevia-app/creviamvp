-- Create dira_conversations table
CREATE TABLE public.dira_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'New conversation',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create dira_messages table
CREATE TABLE public.dira_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.dira_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  file_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.dira_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dira_messages ENABLE ROW LEVEL SECURITY;

-- RLS policies for dira_conversations
CREATE POLICY "Users can view own conversations"
ON public.dira_conversations FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can create own conversations"
ON public.dira_conversations FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own conversations"
ON public.dira_conversations FOR UPDATE
USING (user_id = auth.uid());

CREATE POLICY "Users can delete own conversations"
ON public.dira_conversations FOR DELETE
USING (user_id = auth.uid());

-- RLS policies for dira_messages
CREATE POLICY "Users can view messages in own conversations"
ON public.dira_messages FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.dira_conversations
  WHERE id = dira_messages.conversation_id AND user_id = auth.uid()
));

CREATE POLICY "Users can create messages in own conversations"
ON public.dira_messages FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.dira_conversations
  WHERE id = dira_messages.conversation_id AND user_id = auth.uid()
));

CREATE POLICY "Users can delete messages in own conversations"
ON public.dira_messages FOR DELETE
USING (EXISTS (
  SELECT 1 FROM public.dira_conversations
  WHERE id = dira_messages.conversation_id AND user_id = auth.uid()
));

-- Add trigger for updated_at
CREATE TRIGGER update_dira_conversations_updated_at
BEFORE UPDATE ON public.dira_conversations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_dira_conversations_user_id ON public.dira_conversations(user_id);
CREATE INDEX idx_dira_messages_conversation_id ON public.dira_messages(conversation_id);