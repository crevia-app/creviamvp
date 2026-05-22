-- ── Admin upgrade notifications ───────────────────────────────────────────
-- Stores in-app notifications for the admin when a user upgrades their plan.
-- Written by the paystack-webhook edge function (service_role, bypasses RLS).
-- Read/updated only by admins.
-- ──────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.admin_notifications (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type       text NOT NULL DEFAULT 'upgrade',
  user_id    uuid,
  user_email text,
  user_name  text,
  plan       text,
  amount     numeric,
  currency   text DEFAULT 'KES',
  read       boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;

-- Admins can read and update (mark as read)
CREATE POLICY "admin_read_admin_notifications"
  ON public.admin_notifications
  FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "admin_update_admin_notifications"
  ON public.admin_notifications
  FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- Enable realtime for the admin live channel
ALTER PUBLICATION supabase_realtime ADD TABLE public.admin_notifications;
