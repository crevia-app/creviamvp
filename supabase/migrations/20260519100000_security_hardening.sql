-- ── 1. Block self-escalation on profiles ─────────────────────────────────────
-- Users can update their own row but cannot change is_admin,
-- subscription_plan, or subscription_status.
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND is_admin          = (SELECT is_admin          FROM profiles WHERE id = auth.uid())
    AND subscription_plan = (SELECT subscription_plan FROM profiles WHERE id = auth.uid())
    AND subscription_status = (SELECT subscription_status FROM profiles WHERE id = auth.uid())
  );


-- ── 2. Fix match_dira_memories — always use auth.uid(), ignore filter.user_id ─
CREATE OR REPLACE FUNCTION match_dira_memories(
  query_embedding vector(1536),
  match_count     int   default 5,
  filter          jsonb default '{}'
)
RETURNS TABLE (id uuid, content text, metadata jsonb, similarity float)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT km.id, km.content, km.metadata,
         1 - (km.embedding <=> query_embedding) AS similarity
  FROM dira_memories km
  WHERE km.user_id = auth.uid()
  ORDER BY km.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;


-- ── 3. export_my_data — GDPR / Kenya DPA right of access ─────────────────────
CREATE OR REPLACE FUNCTION export_my_data()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid UUID := auth.uid();
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'not_authenticated'; END IF;

  RETURN json_build_object(
    'profile',               (SELECT row_to_json(p)   FROM profiles p             WHERE p.id = v_uid),
    'invoices',              (SELECT json_agg(i)       FROM invoices i             WHERE i.user_id = v_uid),
    'canvases',              (SELECT json_agg(c)       FROM canvases c             WHERE c.user_id = v_uid),
    'dira_memories',         (SELECT json_agg(m)       FROM dira_memories m        WHERE m.user_id = v_uid),
    'conversation_summaries',(SELECT json_agg(s)       FROM conversation_summaries s WHERE s.user_id = v_uid),
    'exported_at',           NOW()
  );
END;
$$;

GRANT EXECUTE ON FUNCTION export_my_data() TO authenticated;


-- ── 4. delete_own_account — GDPR / Kenya DPA right to erasure ────────────────
CREATE OR REPLACE FUNCTION delete_own_account()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_uid UUID := auth.uid();
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'not_authenticated'; END IF;

  -- Remove storage objects owned by this user
  DELETE FROM storage.objects WHERE owner = v_uid;

  -- Hard-delete the auth user; cascades to profiles and all FK children
  DELETE FROM auth.users WHERE id = v_uid;
END;
$$;

GRANT EXECUTE ON FUNCTION delete_own_account() TO authenticated;
