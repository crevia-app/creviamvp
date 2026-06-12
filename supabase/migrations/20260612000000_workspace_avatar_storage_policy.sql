-- Allow admins/owners to upload workspace avatars to chat-files bucket.
-- The existing INSERT policy requires the first path segment to equal auth.uid(),
-- but workspace avatars use the path workspace-avatars/<roomId>-<ts>.<ext>,
-- which never matches — causing a 400 RLS violation on every upload attempt.

-- INSERT: any authenticated user can upload to workspace-avatars/ folder.
-- Front-end already gates this behind isAdminOrCreator.
CREATE POLICY "Workspace members can upload workspace avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'chat-files' AND
  (storage.foldername(name))[1] = 'workspace-avatars'
);

-- SELECT: allow any authenticated user to read workspace avatars so the
-- image URL returned by getPublicUrl actually loads for all room members.
CREATE POLICY "Anyone can view workspace avatars"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'chat-files' AND
  (storage.foldername(name))[1] = 'workspace-avatars'
);

-- UPDATE: needed because the upload uses upsert: true.
CREATE POLICY "Workspace members can update workspace avatars"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'chat-files' AND
  (storage.foldername(name))[1] = 'workspace-avatars'
)
WITH CHECK (
  bucket_id = 'chat-files' AND
  (storage.foldername(name))[1] = 'workspace-avatars'
);
