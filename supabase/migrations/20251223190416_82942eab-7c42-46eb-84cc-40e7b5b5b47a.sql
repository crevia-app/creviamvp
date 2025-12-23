-- Create kira_conversations table
CREATE TABLE public.kira_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'New conversation',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create kira_messages table
CREATE TABLE public.kira_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.kira_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  file_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.kira_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kira_messages ENABLE ROW LEVEL SECURITY;

-- RLS policies for kira_conversations
CREATE POLICY "Users can view own conversations"
ON public.kira_conversations FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can create own conversations"
ON public.kira_conversations FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own conversations"
ON public.kira_conversations FOR UPDATE
USING (user_id = auth.uid());

CREATE POLICY "Users can delete own conversations"
ON public.kira_conversations FOR DELETE
USING (user_id = auth.uid());

-- RLS policies for kira_messages
CREATE POLICY "Users can view messages in own conversations"
ON public.kira_messages FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.kira_conversations
  WHERE id = kira_messages.conversation_id AND user_id = auth.uid()
));

CREATE POLICY "Users can create messages in own conversations"
ON public.kira_messages FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.kira_conversations
  WHERE id = kira_messages.conversation_id AND user_id = auth.uid()
));

CREATE POLICY "Users can delete messages in own conversations"
ON public.kira_messages FOR DELETE
USING (EXISTS (
  SELECT 1 FROM public.kira_conversations
  WHERE id = kira_messages.conversation_id AND user_id = auth.uid()
));

-- Add trigger for updated_at
CREATE TRIGGER update_kira_conversations_updated_at
BEFORE UPDATE ON public.kira_conversations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_kira_conversations_user_id ON public.kira_conversations(user_id);
CREATE INDEX idx_kira_messages_conversation_id ON public.kira_messages(conversation_id);