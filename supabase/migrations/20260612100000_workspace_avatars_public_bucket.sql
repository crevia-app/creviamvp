-- Dedicated public bucket for workspace avatars.
-- chat-files is private so getPublicUrl() returns inaccessible URLs for it;
-- workspace avatars are non-sensitive and must load without auth headers.

INSERT INTO storage.buckets (id, name, public)
VALUES ('workspace-avatars', 'workspace-avatars', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Anyone can read (public bucket, but RLS still required)
CREATE POLICY "Public read workspace avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'workspace-avatars');

-- Authenticated users can upload
CREATE POLICY "Authenticated upload workspace avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'workspace-avatars');

-- Authenticated users can update (for upsert)
CREATE POLICY "Authenticated update workspace avatars"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'workspace-avatars')
WITH CHECK (bucket_id = 'workspace-avatars');

-- Authenticated users can delete their own uploads
CREATE POLICY "Authenticated delete workspace avatars"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'workspace-avatars');
