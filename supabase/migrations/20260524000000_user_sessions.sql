-- Track active device sessions per user for plan-based device limits
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  device_id        text NOT NULL,
  device_name      text,
  last_active_at   timestamptz NOT NULL DEFAULT now(),
  created_at       timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT user_sessions_user_device_unique UNIQUE (user_id, device_id)
);

ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own sessions"
  ON public.user_sessions FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Register a device session and enforce plan limits.
-- Returns: { status: 'ok' } | { status: 'limit_exceeded', limit: int, plan: text }
CREATE OR REPLACE FUNCTION public.register_device_session(
  p_device_id   text,
  p_device_name text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id        uuid;
  v_plan           text;
  v_sub_status     text;
  v_limit          int;
  v_session_count  int;
  v_is_existing    boolean;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('status', 'error', 'message', 'Not authenticated');
  END IF;

  SELECT
    COALESCE(subscription_plan, 'free'),
    COALESCE(subscription_status, 'inactive')
  INTO v_plan, v_sub_status
  FROM public.profiles
  WHERE id = v_user_id;

  -- Device limits: free=1, pro=2, business/enterprise=6
  v_limit := CASE
    WHEN v_plan IN ('business', 'brand_workspace', 'enterprise')
         AND v_sub_status IN ('active', 'trialing') THEN 6
    WHEN v_plan IN ('pro', 'creative_pro')
         AND v_sub_status IN ('active', 'trialing') THEN 2
    ELSE 1
  END;

  -- Already registered? Just refresh last_active and return ok
  SELECT EXISTS(
    SELECT 1 FROM public.user_sessions
    WHERE user_id = v_user_id AND device_id = p_device_id
  ) INTO v_is_existing;

  IF v_is_existing THEN
    UPDATE public.user_sessions
    SET last_active_at = now(),
        device_name    = COALESCE(p_device_name, device_name)
    WHERE user_id = v_user_id AND device_id = p_device_id;
    RETURN jsonb_build_object('status', 'ok');
  END IF;

  -- Count existing sessions
  SELECT COUNT(*) INTO v_session_count
  FROM public.user_sessions
  WHERE user_id = v_user_id;

  IF v_session_count >= v_limit THEN
    RETURN jsonb_build_object(
      'status', 'limit_exceeded',
      'limit',   v_limit,
      'plan',    v_plan
    );
  END IF;

  INSERT INTO public.user_sessions (user_id, device_id, device_name)
  VALUES (v_user_id, p_device_id, p_device_name);

  RETURN jsonb_build_object('status', 'ok');
END;
$$;

-- Remove session on sign-out
CREATE OR REPLACE FUNCTION public.remove_device_session(p_device_id text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.user_sessions
  WHERE user_id = auth.uid() AND device_id = p_device_id;
END;
$$;
