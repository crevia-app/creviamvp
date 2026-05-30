-- Rename Kira to Dira: tables, indexes, and functions in the live database.

-- 1. Rename tables (IF EXISTS guards make this idempotent)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'kira_messages') THEN
    ALTER TABLE public.kira_messages RENAME TO dira_messages;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'kira_projects') THEN
    ALTER TABLE public.kira_projects RENAME TO dira_projects;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'kira_memories') THEN
    ALTER TABLE public.kira_memories RENAME TO dira_memories;
  END IF;
END $$;

-- 2. Rename indexes (only if the old name still exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_kira_messages_conversation_id') THEN
    ALTER INDEX public.idx_kira_messages_conversation_id RENAME TO idx_dira_messages_conversation_id;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'kira_memories_embedding_idx') THEN
    ALTER INDEX public.kira_memories_embedding_idx RENAME TO dira_memories_embedding_idx;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_kira_memories_user_id') THEN
    ALTER INDEX public.idx_kira_memories_user_id RENAME TO idx_dira_memories_user_id;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_kira_memories_created_at') THEN
    ALTER INDEX public.idx_kira_memories_created_at RENAME TO idx_dira_memories_created_at;
  END IF;
END $$;

-- 3. Recreate consume_dira_action (replaces consume_kira_action)
CREATE OR REPLACE FUNCTION public.consume_dira_action(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_used    INTEGER;
  v_limit   INTEGER;
  v_month   TEXT;
BEGIN
  SELECT dira_actions_used, dira_actions_limit, dira_usage_month
    INTO v_used, v_limit, v_month
    FROM public.profiles
   WHERE id = p_user_id
     FOR UPDATE;

  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  IF v_month IS DISTINCT FROM TO_CHAR(CURRENT_DATE, 'YYYY-MM') THEN
    UPDATE public.profiles
       SET dira_actions_used = 0,
           dira_usage_month  = TO_CHAR(CURRENT_DATE, 'YYYY-MM')
     WHERE id = p_user_id;
    v_used := 0;
  END IF;

  IF v_used >= v_limit THEN
    RETURN FALSE;
  END IF;

  UPDATE public.profiles
     SET dira_actions_used = v_used + 1
   WHERE id = p_user_id;

  RETURN TRUE;
END;
$$;

DROP FUNCTION IF EXISTS public.consume_kira_action(UUID);

-- 4. Recreate match_dira_memories (replaces match_kira_memories)
CREATE OR REPLACE FUNCTION public.match_dira_memories(
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

DROP FUNCTION IF EXISTS public.match_kira_memories(vector, int, jsonb);

-- 5. Recreate reset_dira_usage_if_new_month (replaces reset_kira_usage_if_new_month)
CREATE OR REPLACE FUNCTION public.reset_dira_usage_if_new_month()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles
  SET
    dira_actions_used = 0,
    dira_tokens_used  = 0,
    dira_usage_month  = TO_CHAR(CURRENT_DATE, 'YYYY-MM')
  WHERE dira_usage_month != TO_CHAR(CURRENT_DATE, 'YYYY-MM');
END;
$$;

DROP FUNCTION IF EXISTS public.reset_kira_usage_if_new_month();

-- 6. Recreate update_dira_limits trigger function (replaces update_kira_limits)
CREATE OR REPLACE FUNCTION public.update_dira_limits()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NEW.subscription_plan = 'free' OR NEW.subscription_plan IS NULL THEN
    NEW.dira_actions_limit := 5;
    NEW.dira_tokens_limit  := 50000;
  ELSIF NEW.subscription_plan = 'pro' THEN
    NEW.dira_actions_limit := 40;
    NEW.dira_tokens_limit  := 200000;
  ELSIF NEW.subscription_plan = 'business' THEN
    NEW.dira_actions_limit := 200;
    NEW.dira_tokens_limit  := 1000000;
  END IF;
  RETURN NEW;
END;
$$;

DROP FUNCTION IF EXISTS public.update_kira_limits();
