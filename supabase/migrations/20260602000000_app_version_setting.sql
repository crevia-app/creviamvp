-- Ensures the app_settings table has a stable app_version row that the
-- CI/CD pipeline updates on every deploy. The frontend useVersionCheck hook
-- subscribes to this via Realtime to detect schema/bundle mismatches.

DO $$
BEGIN
  -- Add updated_at if the table was created without it
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'app_settings' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE app_settings ADD COLUMN updated_at timestamptz NOT NULL DEFAULT now();
  END IF;
END $$;

-- Seed the initial version row (no-op if it already exists)
INSERT INTO app_settings (key, value)
VALUES ('app_version', 'initial')
ON CONFLICT (key) DO NOTHING;

-- Enable Realtime so useVersionCheck receives live updates
ALTER PUBLICATION supabase_realtime ADD TABLE app_settings;
