-- Raise free-plan limits: invoices and contracts from 2 → 20 per month

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

  IF v_plan IN ('creative_pro', 'brand_workspace') THEN RETURN NEW; END IF;

  IF v_month IS DISTINCT FROM TO_CHAR(CURRENT_DATE, 'YYYY-MM') THEN
    UPDATE profiles
       SET invoices_used_this_month = 0,
           invoices_usage_month     = TO_CHAR(CURRENT_DATE, 'YYYY-MM')
     WHERE id = NEW.user_id;
    v_used := 0;
  END IF;

  IF v_used >= 20 THEN
    RAISE EXCEPTION 'invoice_limit_reached'
      USING HINT = 'Free plan allows 20 invoices per month. Upgrade to Pro for unlimited.';
  END IF;

  UPDATE profiles
     SET invoices_used_this_month = invoices_used_this_month + 1
   WHERE id = NEW.user_id;

  RETURN NEW;
END;
$$;

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

  IF v_used >= 20 THEN
    RAISE EXCEPTION 'contract_limit_reached'
      USING HINT = 'Free plan allows 20 contracts per month. Upgrade to Pro for unlimited.';
  END IF;

  UPDATE profiles
     SET contracts_used_this_month = contracts_used_this_month + 1
   WHERE id = NEW.user_id;

  RETURN NEW;
END;
$$;

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
  v_limit CONSTANT INTEGER := 20;
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
  v_limit CONSTANT INTEGER := 20;
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
