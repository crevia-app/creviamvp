-- ── canvas_folders table ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.canvas_folders (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT        NOT NULL,
  user_id      UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  workspace_id UUID,                              -- optional workspace scope
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.canvas_folders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own canvas folders"
  ON public.canvas_folders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own canvas folders"
  ON public.canvas_folders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own canvas folders"
  ON public.canvas_folders FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own canvas folders"
  ON public.canvas_folders FOR DELETE
  USING (auth.uid() = user_id);

-- ── folder_id on canvases ─────────────────────────────────────────────
-- ON DELETE SET NULL: deleting a folder moves its canvases back to root
ALTER TABLE public.canvases
  ADD COLUMN IF NOT EXISTS folder_id UUID
    REFERENCES public.canvas_folders(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS canvases_folder_id_idx ON public.canvases(folder_id);
