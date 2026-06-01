-- ── Canvas Access Control ────────────────────────────────────────────────────
-- Adds access_level and share_token to canvases + canvas_folders so owners
-- can choose between "Only me" (restricted) and "Anyone with the link" (link_access).

-- canvases
ALTER TABLE canvases
  ADD COLUMN IF NOT EXISTS access_level text NOT NULL DEFAULT 'restricted',
  ADD COLUMN IF NOT EXISTS share_token  uuid;

UPDATE canvases SET share_token = gen_random_uuid() WHERE share_token IS NULL;
ALTER TABLE canvases ALTER COLUMN share_token SET NOT NULL;
ALTER TABLE canvases ALTER COLUMN share_token SET DEFAULT gen_random_uuid();

CREATE UNIQUE INDEX IF NOT EXISTS idx_canvases_share_token ON canvases(share_token);

-- canvas_folders
ALTER TABLE canvas_folders
  ADD COLUMN IF NOT EXISTS access_level text NOT NULL DEFAULT 'restricted',
  ADD COLUMN IF NOT EXISTS share_token  uuid;

UPDATE canvas_folders SET share_token = gen_random_uuid() WHERE share_token IS NULL;
ALTER TABLE canvas_folders ALTER COLUMN share_token SET NOT NULL;
ALTER TABLE canvas_folders ALTER COLUMN share_token SET DEFAULT gen_random_uuid();

CREATE UNIQUE INDEX IF NOT EXISTS idx_canvas_folders_share_token ON canvas_folders(share_token);

-- ── RLS: allow the anon role to read link-accessible documents ────────────────
-- These policies fire ONLY when access_level = 'link_access', so restricted
-- documents remain fully private even to someone who knows the UUID.

DROP POLICY IF EXISTS "Public read for link-accessible canvases" ON canvases;
CREATE POLICY "Public read for link-accessible canvases"
  ON canvases
  FOR SELECT
  TO anon
  USING (access_level = 'link_access');

DROP POLICY IF EXISTS "Public read for link-accessible folders" ON canvas_folders;
CREATE POLICY "Public read for link-accessible folders"
  ON canvas_folders
  FOR SELECT
  TO anon
  USING (access_level = 'link_access');
