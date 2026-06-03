-- ═══════════════════════════════════════════════════════════════════════════
-- Pricing V2  —  2026-06-03
--
-- Changes applied:
--   1. Free Dira:     40/month  →  15/month
--   2. Pro  Dira:     40/month  →  500/month
--   3. Business Dira: 200/month →  unlimited (NULL = no limit in the RPC)
--   4. Free invoices: 40/month  →  3/month
--   5. Free canvases: 40/month  →  6/month (drafts)
--   6. BUG FIX: add 'business' to all paid-plan whitelists (was missing, causing
--      business users to hit the 40-invoice/canvas limit — live production bug)
--   7. E-signatures: new counter columns + trigger (Free: 1/month)
--   8. Workspace creation: new counter columns + trigger
--      (Free: 0 — join only, cannot create; Pro: 10/month; Business+: unlimited)
--   9. Rebuild consume_dira_action() to treat NULL limit as unlimited
--
-- Zero-regression guarantees:
--   • Existing invoices/canvases are NOT touched — triggers only fire on INSERT/UPDATE
--   • Legacy plan keys (creative_pro, brand_workspace) whitelisted everywhere
--   • DMs (chat_rooms with name IS NULL) are never blocked by workspace trigger
-- ═══════════════════════════════════════════════════════════════════════════


-- ── 1. DIRA LIMIT UPDATES ─────────────────────────────────────────────────

ALTER TABLE public.profiles
  ALTER COLUMN dira_actions_limit SET DEFAULT 15;

-- Free / inactive users: bring down to 15
UPDATE public.profiles
   SET dira_actions_limit = 15
 WHERE (subscription_plan IS NULL OR subscription_plan = 'free'
        OR subscription_status NOT IN ('active', 'trialing'))
   AND (dira_actions_limit IS NOT NULL AND dira_actions_limit <= 40);

-- Pro users: raise to 500
UPDATE public.profiles
   SET dira_actions_limit = 500
 WHERE subscription_plan IN ('pro', 'creative_pro')
   AND subscription_status IN ('active', 'trialing');

-- Business users: NULL = unlimited
UPDATE public.profiles
   SET dira_actions_limit = NULL
 WHERE subscription_plan IN ('business', 'brand_workspace')
   AND subscription_status IN ('active', 'trialing');


-- ── 2. consume_dira_action — NULL limit = unlimited ───────────────────────

CREATE OR REPLACE FUNCTION public.consume_dira_action(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_used    INTEGER;
  v_limit   INTEGER;   -- NULL means unlimited
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

  -- NULL limit = Business / unlimited plan: increment and allow unconditionally
  IF v_limit IS NULL THEN
    UPDATE public.profiles
       SET dira_actions_used = COALESCE(dira_actions_used, 0) + 1
     WHERE id = p_user_id;
    RETURN TRUE;
  END IF;

  -- Monthly reset
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


-- ── 3. enforce_invoice_limit — 3 for free, business bug fix ──────────────

CREATE OR REPLACE FUNCTION public.enforce_invoice_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_plan  TEXT;
  v_used  INTEGER;
  v_month TEXT;
BEGIN
  SELECT subscription_plan, invoices_used_this_month, invoices_usage_month
    INTO v_plan, v_used, v_month
    FROM profiles
   WHERE id = NEW.user_id
     FOR UPDATE;

  IF NOT FOUND THEN RETURN NEW; END IF;

  -- All paid plans: unlimited (business was previously missing — fixed here)
  IF v_plan IN ('pro', 'business', 'enterprise', 'creative_pro', 'brand_workspace') THEN
    RETURN NEW;
  END IF;

  -- Monthly reset for free users
  IF v_month IS DISTINCT FROM TO_CHAR(CURRENT_DATE, 'YYYY-MM') THEN
    UPDATE profiles
       SET invoices_used_this_month = 0,
           invoices_usage_month     = TO_CHAR(CURRENT_DATE, 'YYYY-MM')
     WHERE id = NEW.user_id;
    v_used := 0;
  END IF;

  IF v_used >= 3 THEN
    RAISE EXCEPTION 'invoice_limit_reached'
      USING HINT = 'Free plan allows 3 invoices per month. Upgrade to Pro for unlimited.';
  END IF;

  UPDATE profiles
     SET invoices_used_this_month = invoices_used_this_month + 1
   WHERE id = NEW.user_id;

  RETURN NEW;
END;
$$;

-- Reflect new limit in the helper RPC used by the frontend
CREATE OR REPLACE FUNCTION public.can_create_invoice()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_plan  TEXT;
  v_used  INTEGER;
  v_month TEXT;
  v_limit CONSTANT INTEGER := 3;
BEGIN
  SELECT subscription_plan, invoices_used_this_month, invoices_usage_month
    INTO v_plan, v_used, v_month
    FROM profiles
   WHERE id = auth.uid();

  IF NOT FOUND THEN
    RETURN json_build_object('allowed', false, 'used', 0, 'limit', v_limit, 'remaining', 0);
  END IF;

  IF v_plan IN ('pro', 'business', 'enterprise', 'creative_pro', 'brand_workspace') THEN
    RETURN json_build_object('allowed', true, 'used', v_used, 'limit', null, 'remaining', null);
  END IF;

  IF v_month IS DISTINCT FROM TO_CHAR(CURRENT_DATE, 'YYYY-MM') THEN
    v_used := 0;
  END IF;

  RETURN json_build_object(
    'allowed',   v_used < v_limit,
    'used',      v_used,
    'limit',     v_limit,
    'remaining', GREATEST(0, v_limit - v_used)
  );
END;
$$;


-- ── 4. enforce_contract_limit — 6 for free, business bug fix ─────────────

CREATE OR REPLACE FUNCTION public.enforce_contract_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_plan  TEXT;
  v_used  INTEGER;
  v_month TEXT;
BEGIN
  SELECT subscription_plan, canvases_used_this_month, canvases_usage_month
    INTO v_plan, v_used, v_month
    FROM profiles
   WHERE id = NEW.user_id
     FOR UPDATE;

  IF NOT FOUND THEN RETURN NEW; END IF;

  IF v_plan IN ('pro', 'business', 'enterprise', 'creative_pro', 'brand_workspace') THEN
    RETURN NEW;
  END IF;

  IF v_month IS DISTINCT FROM TO_CHAR(CURRENT_DATE, 'YYYY-MM') THEN
    UPDATE profiles
       SET canvases_used_this_month = 0,
           canvases_usage_month     = TO_CHAR(CURRENT_DATE, 'YYYY-MM')
     WHERE id = NEW.user_id;
    v_used := 0;
  END IF;

  IF v_used >= 6 THEN
    RAISE EXCEPTION 'canvas_limit_reached'
      USING HINT = 'Free plan allows 6 canvas drafts per month. Upgrade to Pro for unlimited.';
  END IF;

  UPDATE profiles
     SET canvases_used_this_month = canvases_used_this_month + 1
   WHERE id = NEW.user_id;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.can_create_canvas()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_plan  TEXT;
  v_used  INTEGER;
  v_month TEXT;
  v_limit CONSTANT INTEGER := 6;
BEGIN
  SELECT subscription_plan, canvases_used_this_month, canvases_usage_month
    INTO v_plan, v_used, v_month
    FROM profiles
   WHERE id = auth.uid();

  IF NOT FOUND THEN
    RETURN json_build_object('allowed', false, 'used', 0, 'limit', v_limit, 'remaining', 0);
  END IF;

  IF v_plan IN ('pro', 'business', 'enterprise', 'creative_pro', 'brand_workspace') THEN
    RETURN json_build_object('allowed', true, 'used', v_used, 'limit', null, 'remaining', null);
  END IF;

  IF v_month IS DISTINCT FROM TO_CHAR(CURRENT_DATE, 'YYYY-MM') THEN
    v_used := 0;
  END IF;

  RETURN json_build_object(
    'allowed',   v_used < v_limit,
    'used',      v_used,
    'limit',     v_limit,
    'remaining', GREATEST(0, v_limit - v_used)
  );
END;
$$;


-- ── 5. E-SIGNATURE LIMIT (new infrastructure) ─────────────────────────────

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS esignatures_used_this_month INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS esignatures_usage_month      TEXT;

-- Fires on canvases UPDATE when creator_signature transitions NULL → non-NULL
-- (the moment the canvas owner places their final binding signature)
CREATE OR REPLACE FUNCTION public.enforce_esignature_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_plan  TEXT;
  v_used  INTEGER;
  v_month TEXT;
BEGIN
  -- Only fire on the initial signature placement (NULL → value)
  IF OLD.creator_signature IS NOT NULL THEN RETURN NEW; END IF;
  IF NEW.creator_signature IS NULL      THEN RETURN NEW; END IF;

  SELECT subscription_plan, esignatures_used_this_month, esignatures_usage_month
    INTO v_plan, v_used, v_month
    FROM profiles
   WHERE id = NEW.user_id
     FOR UPDATE;

  IF NOT FOUND THEN RETURN NEW; END IF;

  -- Paid plans: unlimited
  IF v_plan IN ('pro', 'business', 'enterprise', 'creative_pro', 'brand_workspace') THEN
    RETURN NEW;
  END IF;

  -- Monthly reset
  IF v_month IS DISTINCT FROM TO_CHAR(CURRENT_DATE, 'YYYY-MM') THEN
    UPDATE profiles
       SET esignatures_used_this_month = 0,
           esignatures_usage_month     = TO_CHAR(CURRENT_DATE, 'YYYY-MM')
     WHERE id = NEW.user_id;
    v_used := 0;
  END IF;

  -- Free: 1 finalized e-signature per month
  IF v_used >= 1 THEN
    RAISE EXCEPTION 'esignature_limit_reached'
      USING HINT = 'Free plan allows 1 finalized e-signature per month. Upgrade to Pro for unlimited.';
  END IF;

  UPDATE profiles
     SET esignatures_used_this_month = esignatures_used_this_month + 1
   WHERE id = NEW.user_id;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_esignature_limit ON public.canvases;
CREATE TRIGGER trg_enforce_esignature_limit
  BEFORE UPDATE ON public.canvases
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_esignature_limit();


-- ── 6. WORKSPACE CREATION LIMIT (new infrastructure) ─────────────────────

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS workspaces_created_this_month INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS workspaces_usage_month         TEXT;

-- Fires on chat_rooms INSERT for named rooms only.
-- DMs have name IS NULL and are never blocked.
-- Free: 0  (cannot create any workspace — join-only)
-- Pro:  10 per month
-- Business+: unlimited
CREATE OR REPLACE FUNCTION public.enforce_workspace_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_plan  TEXT;
  v_used  INTEGER;
  v_month TEXT;
  v_limit INTEGER;
BEGIN
  -- DMs have no name — never blocked
  IF NEW.name IS NULL THEN RETURN NEW; END IF;

  SELECT subscription_plan, workspaces_created_this_month, workspaces_usage_month
    INTO v_plan, v_used, v_month
    FROM profiles
   WHERE id = NEW.created_by
     FOR UPDATE;

  -- No profile row (e.g. system-created rooms): allow
  IF NOT FOUND THEN RETURN NEW; END IF;

  -- Unlimited for Business and above
  IF v_plan IN ('business', 'enterprise', 'brand_workspace') THEN
    UPDATE profiles
       SET workspaces_created_this_month = workspaces_created_this_month + 1
     WHERE id = NEW.created_by;
    RETURN NEW;
  END IF;

  -- Pro: 10 per month
  IF v_plan IN ('pro', 'creative_pro') THEN
    v_limit := 10;
  ELSE
    -- Free: join-only, zero creation allowed
    v_limit := 0;
  END IF;

  -- Monthly reset
  IF v_month IS DISTINCT FROM TO_CHAR(CURRENT_DATE, 'YYYY-MM') THEN
    UPDATE profiles
       SET workspaces_created_this_month = 0,
           workspaces_usage_month        = TO_CHAR(CURRENT_DATE, 'YYYY-MM')
     WHERE id = NEW.created_by;
    v_used := 0;
  END IF;

  IF v_used >= v_limit THEN
    IF v_limit = 0 THEN
      RAISE EXCEPTION 'workspace_creation_not_allowed'
        USING HINT = 'Free plan does not allow workspace creation. Upgrade to Pro.';
    ELSE
      RAISE EXCEPTION 'workspace_limit_reached'
        USING HINT = 'Pro plan allows 10 workspaces per month. Upgrade to Business for unlimited.';
    END IF;
  END IF;

  UPDATE profiles
     SET workspaces_created_this_month = workspaces_created_this_month + 1
   WHERE id = NEW.created_by;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_workspace_limit ON public.chat_rooms;
CREATE TRIGGER trg_enforce_workspace_limit
  BEFORE INSERT ON public.chat_rooms
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_workspace_limit();
