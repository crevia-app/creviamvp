-- Step 2: Sync the free-tier default with the client PLAN_LIMITS constant (10, not 5).
-- The original migration set this to 5; use-subscription.ts says 10.
-- The RPC in this file reads kira_actions_limit, so this must be correct first.
ALTER TABLE public.profiles
  ALTER COLUMN kira_actions_limit SET DEFAULT 10;

UPDATE public.profiles
   SET kira_actions_limit = 10
 WHERE kira_actions_limit = 5;

-- Step 3: Atomic Kira action gate.
--
-- Why atomic: a simple read-then-write check has a race condition. Two concurrent
-- requests can both read "9 used / 10 limit", both pass, and both fire — giving
-- the user 11 actions. FOR UPDATE locks the row so only one request runs at a time.
--
-- Returns TRUE  → action is allowed, counter has been incremented.
-- Returns FALSE → daily limit reached, caller must return HTTP 429.
--
-- Monthly reset is handled inline: if the stored month differs from today's month,
-- the counter is zeroed before the check. No cron job required.

CREATE OR REPLACE FUNCTION public.consume_kira_action(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_used    INTEGER;
  v_limit   INTEGER;
  v_month   TEXT;
BEGIN
  SELECT kira_actions_used, kira_actions_limit, kira_usage_month
    INTO v_used, v_limit, v_month
    FROM public.profiles
   WHERE id = p_user_id
     FOR UPDATE;

  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  -- Reset counter when the calendar month rolls over
  IF v_month IS DISTINCT FROM TO_CHAR(CURRENT_DATE, 'YYYY-MM') THEN
    UPDATE public.profiles
       SET kira_actions_used = 0,
           kira_usage_month  = TO_CHAR(CURRENT_DATE, 'YYYY-MM')
     WHERE id = p_user_id;
    v_used := 0;
  END IF;

  IF v_used >= v_limit THEN
    RETURN FALSE;
  END IF;

  UPDATE public.profiles
     SET kira_actions_used = v_used + 1
   WHERE id = p_user_id;

  RETURN TRUE;
END;
$$;
