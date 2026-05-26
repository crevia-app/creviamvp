-- ============================================================
-- Feature gating: 2 invoices + 2 contracts per month for free users
-- Pattern mirrors consume_kira_action (atomic FOR UPDATE + monthly reset)
-- ============================================================

-- ── 1. Usage counters on profiles ────────────────────────────
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS invoices_used_this_month  INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS invoices_usage_month      TEXT,
  ADD COLUMN IF NOT EXISTS contracts_used_this_month INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS contracts_usage_month     TEXT;

-- ── 2. BEFORE INSERT trigger: invoices ───────────────────────
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

  -- Unknown user → allow (RLS handles auth)
  IF NOT FOUND THEN RETURN NEW; END IF;

  -- Paid plans: unlimited
  IF v_plan IN ('creative_pro', 'brand_workspace') THEN RETURN NEW; END IF;

  -- Monthly reset
  IF v_month IS DISTINCT FROM TO_CHAR(CURRENT_DATE, 'YYYY-MM') THEN
    UPDATE profiles
       SET invoices_used_this_month = 0,
           invoices_usage_month     = TO_CHAR(CURRENT_DATE, 'YYYY-MM')
     WHERE id = NEW.user_id;
    v_used := 0;
  END IF;

  IF v_used >= 2 THEN
    RAISE EXCEPTION 'invoice_limit_reached'
      USING HINT = 'Free plan allows 2 invoices per month. Upgrade to Pro for unlimited.';
  END IF;

  UPDATE profiles
     SET invoices_used_this_month = invoices_used_this_month + 1
   WHERE id = NEW.user_id;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_invoice_limit ON public.invoices;
CREATE TRIGGER trg_enforce_invoice_limit
  BEFORE INSERT ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION public.enforce_invoice_limit();

-- ── 3. BEFORE INSERT trigger: contracts ──────────────────────
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
  SELECT subscription_plan, contracts_used_this_month, contracts_usage_month
    INTO v_plan, v_used, v_month
    FROM profiles
   WHERE id = NEW.user_id
     FOR UPDATE;

  IF NOT FOUND THEN RETURN NEW; END IF;

  IF v_plan IN ('creative_pro', 'brand_workspace') THEN RETURN NEW; END IF;

  IF v_month IS DISTINCT FROM TO_CHAR(CURRENT_DATE, 'YYYY-MM') THEN
    UPDATE profiles
       SET contracts_used_this_month = 0,
           contracts_usage_month     = TO_CHAR(CURRENT_DATE, 'YYYY-MM')
     WHERE id = NEW.user_id;
    v_used := 0;
  END IF;

  IF v_used >= 2 THEN
    RAISE EXCEPTION 'contract_limit_reached'
      USING HINT = 'Free plan allows 2 contracts per month. Upgrade to Pro for unlimited.';
  END IF;

  UPDATE profiles
     SET contracts_used_this_month = contracts_used_this_month + 1
   WHERE id = NEW.user_id;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_contract_limit ON public.contracts;
CREATE TRIGGER trg_enforce_contract_limit
  BEFORE INSERT ON public.contracts
  FOR EACH ROW EXECUTE FUNCTION public.enforce_contract_limit();

-- ── 4. Read-only gate checks for the UI ──────────────────────
-- Returns { allowed, used, limit, remaining } so the UI can gate
-- the Create button before attempting an insert.

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
  v_limit CONSTANT INTEGER := 2;
BEGIN
  SELECT subscription_plan, invoices_used_this_month, invoices_usage_month
    INTO v_plan, v_used, v_month
    FROM profiles
   WHERE id = auth.uid();

  IF NOT FOUND THEN
    RETURN json_build_object('allowed', false, 'used', 0, 'limit', v_limit, 'remaining', 0);
  END IF;

  IF v_plan IN ('creative_pro', 'brand_workspace') THEN
    RETURN json_build_object('allowed', true, 'used', v_used, 'limit', null, 'remaining', null);
  END IF;

  IF v_month IS DISTINCT FROM TO_CHAR(CURRENT_DATE, 'YYYY-MM') THEN
    v_used := 0;
  END IF;

  RETURN json_build_object(
    'allowed',    v_used < v_limit,
    'used',       v_used,
    'limit',      v_limit,
    'remaining',  GREATEST(0, v_limit - v_used)
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.can_create_contract()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_plan  TEXT;
  v_used  INTEGER;
  v_month TEXT;
  v_limit CONSTANT INTEGER := 2;
BEGIN
  SELECT subscription_plan, contracts_used_this_month, contracts_usage_month
    INTO v_plan, v_used, v_month
    FROM profiles
   WHERE id = auth.uid();

  IF NOT FOUND THEN
    RETURN json_build_object('allowed', false, 'used', 0, 'limit', v_limit, 'remaining', 0);
  END IF;

  IF v_plan IN ('creative_pro', 'brand_workspace') THEN
    RETURN json_build_object('allowed', true, 'used', v_used, 'limit', null, 'remaining', null);
  END IF;

  IF v_month IS DISTINCT FROM TO_CHAR(CURRENT_DATE, 'YYYY-MM') THEN
    v_used := 0;
  END IF;

  RETURN json_build_object(
    'allowed',    v_used < v_limit,
    'used',       v_used,
    'limit',      v_limit,
    'remaining',  GREATEST(0, v_limit - v_used)
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.can_create_invoice()  TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_create_contract() TO authenticated;
