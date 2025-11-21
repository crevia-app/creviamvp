-- Add file attachment support to messages
ALTER TABLE public.messages 
ADD COLUMN IF NOT EXISTS file_url TEXT,
ADD COLUMN IF NOT EXISTS file_name TEXT,
ADD COLUMN IF NOT EXISTS file_type TEXT,
ADD COLUMN IF NOT EXISTS file_size INTEGER;

-- Create storage bucket for chat files
INSERT INTO storage.buckets (id, name, public)
VALUES ('chat-files', 'chat-files', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for chat files
CREATE POLICY "Users can upload their own chat files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'chat-files' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view chat files in their conversations"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'chat-files' AND
  (
    auth.uid()::text = (storage.foldername(name))[1] OR
    EXISTS (
      SELECT 1 FROM public.messages
      WHERE file_url LIKE '%' || storage.objects.name AND
      (receiver_id = auth.uid() OR sender_id = auth.uid())
    )
  )
);