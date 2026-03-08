
-- Create contract-uploads storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('contract-uploads', 'contract-uploads', false)
ON CONFLICT (id) DO NOTHING;

-- RLS: Authenticated users can upload to their own folder
CREATE POLICY "Users can upload contract files"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'contract-uploads' AND (storage.foldername(name))[1] = auth.uid()::text);

-- RLS: Users can read their own files
CREATE POLICY "Users can read own contract files"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'contract-uploads' AND (storage.foldername(name))[1] = auth.uid()::text);

-- RLS: Users can delete their own files
CREATE POLICY "Users can delete own contract files"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'contract-uploads' AND (storage.foldername(name))[1] = auth.uid()::text);
