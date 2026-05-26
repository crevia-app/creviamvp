-- Fix chat-files storage SELECT policy.
-- The original policy referenced public.messages (old table) instead of
-- public.chat_messages (the actual table), so receivers could never generate
-- signed URLs and images/videos were permanently stuck on the loading skeleton.

DROP POLICY IF EXISTS "Users can view chat files in their conversations" ON storage.objects;

CREATE POLICY "Users can view chat files in their conversations"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'chat-files' AND
  (
    -- file owner (uploader) always has access
    auth.uid()::text = (storage.foldername(name))[1]
    OR
    -- any member of the chat room that contains this file
    EXISTS (
      SELECT 1
      FROM public.chat_messages cm
      JOIN public.chat_room_members crm ON crm.room_id = cm.room_id
      WHERE cm.file_url = name
        AND crm.user_id = auth.uid()
    )
  )
);
