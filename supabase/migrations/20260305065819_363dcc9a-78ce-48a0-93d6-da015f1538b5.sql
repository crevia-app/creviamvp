
-- Create voice-notes storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('voice-notes', 'voice-notes', true);

-- Allow authenticated users to upload voice notes
CREATE POLICY "Authenticated users can upload voice notes"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'voice-notes');

-- Allow anyone to read voice notes (public bucket)
CREATE POLICY "Anyone can read voice notes"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'voice-notes');

-- Allow users to delete their own voice notes
CREATE POLICY "Users can delete own voice notes"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'voice-notes' AND (storage.foldername(name))[1] = auth.uid()::text);
