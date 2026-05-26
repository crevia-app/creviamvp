-- ── support_tickets ─────────────────────────────────────────────────────────
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

-- Users can read their own tickets
CREATE POLICY "Users can read own support tickets"
  ON public.support_tickets FOR SELECT
  USING (
    auth.uid() = user_id
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- Users can insert their own tickets (user_id must match caller)
CREATE POLICY "Users can create own support tickets"
  ON public.support_tickets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Only admins can update tickets (e.g. close, reply)
CREATE POLICY "Admins can update support tickets"
  ON public.support_tickets FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true));

-- Only admins can delete tickets
CREATE POLICY "Admins can delete support tickets"
  ON public.support_tickets FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true));


-- ── app_settings ─────────────────────────────────────────────────────────────
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Anyone (including anonymous visitors) can read settings like pricing, maintenance mode
CREATE POLICY "Public can read app settings"
  ON public.app_settings FOR SELECT
  USING (true);

-- Only admins can write settings
CREATE POLICY "Admins can write app settings"
  ON public.app_settings FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true));

CREATE POLICY "Admins can update app settings"
  ON public.app_settings FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true));

CREATE POLICY "Admins can delete app settings"
  ON public.app_settings FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true));


-- ── webhook_events ───────────────────────────────────────────────────────────
-- Written only by the paystack-webhook edge function (service role key —
-- bypasses RLS). Regular users have no business reading raw webhook payloads.
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read webhook events"
  ON public.webhook_events FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true));
