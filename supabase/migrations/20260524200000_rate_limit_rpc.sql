-- ── rate_limits table ────────────────────────────────────────────────────────
-- Stores sliding-window request counts per (user/IP identifier, endpoint).
-- window_key is the unix epoch floored to the window boundary, so each window
-- gets exactly one row that is upserted atomically.

CREATE TABLE IF NOT EXISTS public.rate_limits (
  identifier   text    NOT NULL,
  endpoint     text    NOT NULL,
  window_key   bigint  NOT NULL,
  request_count integer NOT NULL DEFAULT 0,
  PRIMARY KEY (identifier, endpoint, window_key)
);

ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;
-- No user-level access — only service-role (edge functions) reads/writes this table.

-- ── check_rate_limit RPC ──────────────────────────────────────────────────────
-- Atomically increments the counter for the current window and returns whether
-- the caller is still within the allowed limit.
--
-- Returns TRUE  → request is allowed.
-- Returns FALSE → rate limit exceeded; caller should return HTTP 429.
--
-- p_user_id     : identifier (user UUID or IP string)
-- p_endpoint    : logical name of the endpoint being protected
-- p_limit       : max requests allowed per window
-- p_window_secs : window size in seconds (e.g. 60, 3600, 86400)

CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_user_id     text,
  p_endpoint    text,
  p_limit       integer,
  p_window_secs integer
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_window_key bigint;
  v_count      integer;
BEGIN
  -- Floor current epoch to the window boundary
  v_window_key := floor(extract(epoch from now()) / p_window_secs)::bigint;

  -- Upsert: first request in this window inserts (count=1);
  -- subsequent requests increment atomically.
  INSERT INTO public.rate_limits (identifier, endpoint, window_key, request_count)
  VALUES (p_user_id, p_endpoint, v_window_key, 1)
  ON CONFLICT (identifier, endpoint, window_key)
  DO UPDATE SET request_count = rate_limits.request_count + 1
  RETURNING request_count INTO v_count;

  -- Prune previous windows to keep the table small
  DELETE FROM public.rate_limits
  WHERE identifier = p_user_id
    AND endpoint   = p_endpoint
    AND window_key < v_window_key - 1;

  RETURN v_count <= p_limit;
END;
$$;

GRANT EXECUTE ON FUNCTION public.check_rate_limit(text, text, integer, integer) TO service_role;
