-- ── security_events table ────────────────────────────────────────────────────
-- Structured audit log for authentication failures, rate limit hits,
-- ownership violations, and other suspicious activity.

CREATE TABLE IF NOT EXISTS public.security_events (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type  text        NOT NULL, -- 'auth_failure' | 'rate_limit' | 'forbidden' | 'api_error' | 'suspicious'
  user_id     uuid        REFERENCES auth.users(id) ON DELETE SET NULL,
  ip_address  text,
  endpoint    text,
  detail      text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX security_events_created_at_idx  ON public.security_events (created_at DESC);
CREATE INDEX security_events_event_type_idx  ON public.security_events (event_type);
CREATE INDEX security_events_ip_address_idx  ON public.security_events (ip_address);
CREATE INDEX security_events_user_id_idx     ON public.security_events (user_id);

ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;

-- Only admins can read the log; writes come from service-role (edge functions) only
CREATE POLICY "Admins can read security events"
  ON public.security_events FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true));


-- ── log_security_event RPC ────────────────────────────────────────────────────
-- Called by edge functions (service-role context) to write a security event.
-- SECURITY DEFINER so the function always has insert rights regardless of caller.

CREATE OR REPLACE FUNCTION public.log_security_event(
  p_event_type  text,
  p_user_id     uuid    DEFAULT NULL,
  p_ip_address  text    DEFAULT NULL,
  p_endpoint    text    DEFAULT NULL,
  p_detail      text    DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.security_events (event_type, user_id, ip_address, endpoint, detail)
  VALUES (p_event_type, p_user_id, p_ip_address, p_endpoint, p_detail);
END;
$$;

GRANT EXECUTE ON FUNCTION public.log_security_event(text, uuid, text, text, text) TO service_role;


-- ── check_suspicious_activity RPC ────────────────────────────────────────────
-- Returns TRUE if an identifier (user_id or IP) has generated more than
-- p_threshold security events in the last p_window_minutes minutes.
-- Used to detect brute force, scraping, and repeated abuse attempts.

CREATE OR REPLACE FUNCTION public.check_suspicious_activity(
  p_identifier    text,    -- user_id (uuid string) or IP address
  p_window_minutes integer DEFAULT 10,
  p_threshold     integer  DEFAULT 10
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count integer;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM public.security_events
  WHERE (user_id::text = p_identifier OR ip_address = p_identifier)
    AND created_at >= now() - (p_window_minutes * interval '1 minute');

  RETURN v_count >= p_threshold;
END;
$$;

GRANT EXECUTE ON FUNCTION public.check_suspicious_activity(text, integer, integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.check_suspicious_activity(text, integer, integer) TO authenticated;


-- ── Auto-purge events older than 90 days ─────────────────────────────────────
-- Keeps the table from growing unbounded. Runs as a pg_cron job if available,
-- otherwise the RPC below can be called manually or via a scheduled edge function.

CREATE OR REPLACE FUNCTION public.purge_old_security_events()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_deleted integer;
BEGIN
  DELETE FROM public.security_events WHERE created_at < now() - interval '90 days';
  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RETURN v_deleted;
END;
$$;

GRANT EXECUTE ON FUNCTION public.purge_old_security_events() TO service_role;
