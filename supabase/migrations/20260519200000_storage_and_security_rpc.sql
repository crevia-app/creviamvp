-- ── 1. Fix voice-notes upload: enforce owner folder ──────────────────────────
DROP POLICY IF EXISTS "Authenticated users can upload voice notes" ON storage.objects;

CREATE POLICY "Authenticated users can upload voice notes"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'voice-notes'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- ── 2. Fix avatars upload: enforce owner folder ───────────────────────────────
DROP POLICY IF EXISTS "Users can upload own avatars"   ON storage.objects;
DROP POLICY IF EXISTS "Users can update own avatars"   ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update their avatars" ON storage.objects;

CREATE POLICY "Users can upload own avatars"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can update own avatars"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- ── 3. Security overview RPC for admin portal ─────────────────────────────────
CREATE OR REPLACE FUNCTION admin_security_overview()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true
  ) THEN
    RAISE EXCEPTION 'unauthorized';
  END IF;

  RETURN json_build_object(
    'admin_users', (
      SELECT json_agg(json_build_object('id', id, 'display_name', display_name, 'email', email))
      FROM profiles WHERE is_admin = true
    ),
    'total_users', (SELECT COUNT(*) FROM profiles),
    'recent_signups_7d', (
      SELECT COUNT(*) FROM auth.users
      WHERE created_at >= NOW() - INTERVAL '7 days'
    ),
    'recent_auth_events', (
      SELECT json_agg(e ORDER BY e.created_at DESC)
      FROM (
        SELECT
          id,
          created_at,
          ip_address,
          payload->>'action'    AS action,
          payload->>'actor_username' AS email
        FROM auth.audit_log_entries
        WHERE created_at >= NOW() - INTERVAL '7 days'
        ORDER BY created_at DESC
        LIMIT 50
      ) e
    )
  );
END;
$$;

GRANT EXECUTE ON FUNCTION admin_security_overview() TO authenticated;
