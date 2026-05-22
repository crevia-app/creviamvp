-- ── Subscription payments & cancel support ────────────────────────────────
-- subscription_payments: records each successful Paystack charge for billing history
-- profiles: adds subscription_code + email_token needed to cancel via Paystack API
-- ──────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.subscription_payments (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  email       text,
  plan        text,
  amount      numeric,
  currency    text DEFAULT 'KES',
  reference   text,
  status      text DEFAULT 'success',
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.subscription_payments ENABLE ROW LEVEL SECURITY;

-- Users can only see their own payments
CREATE POLICY "users_read_own_subscription_payments"
  ON public.subscription_payments
  FOR SELECT
  USING (user_id = auth.uid());

-- Admins can see all
CREATE POLICY "admin_read_all_subscription_payments"
  ON public.subscription_payments
  FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- Store Paystack subscription identifiers needed to cancel
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS subscription_code  text,
  ADD COLUMN IF NOT EXISTS subscription_email_token text;
