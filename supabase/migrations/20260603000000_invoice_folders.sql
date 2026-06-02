-- ── Invoice Folders ──────────────────────────────────────────────────────────
-- Mirrors the canvas_folders pattern so the frontend can use an identical
-- folder-navigation architecture for both modules.

CREATE TABLE IF NOT EXISTS invoice_folders (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name       text        NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE invoice_folders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own invoice folders"
  ON invoice_folders FOR ALL
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Add folder_id to invoices — nullable so all existing invoices default to root
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS folder_id uuid
  REFERENCES invoice_folders(id) ON DELETE SET NULL;

-- Index for fast folder-filtered queries
CREATE INDEX IF NOT EXISTS invoices_folder_id_idx ON invoices(folder_id);
