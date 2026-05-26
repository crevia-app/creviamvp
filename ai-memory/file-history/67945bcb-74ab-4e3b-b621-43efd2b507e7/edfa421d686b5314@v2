-- Admin portal RLS: only accounts with is_admin = true can access admin tables.
-- Frontend checks are not sufficient — these policies enforce access at the DB level.

-- Helper: returns true if the calling user is an admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT is_admin FROM public.profiles WHERE id = auth.uid()),
    false
  );
$$;

-- verification_requests
ALTER TABLE public.verification_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can read verification_requests"  ON public.verification_requests;
DROP POLICY IF EXISTS "Admins can update verification_requests" ON public.verification_requests;

CREATE POLICY "Admins can read verification_requests"
ON public.verification_requests FOR SELECT
TO authenticated
USING (public.is_admin());

CREATE POLICY "Admins can update verification_requests"
ON public.verification_requests FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- support_tickets
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own tickets"      ON public.support_tickets;
DROP POLICY IF EXISTS "Users can insert own tickets"    ON public.support_tickets;
DROP POLICY IF EXISTS "Admins can read all tickets"     ON public.support_tickets;
DROP POLICY IF EXISTS "Admins can update tickets"       ON public.support_tickets;

CREATE POLICY "Users can read own tickets"
ON public.support_tickets FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "Users can insert own tickets"
ON public.support_tickets FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can update tickets"
ON public.support_tickets FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- admin_notifications
ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage admin_notifications" ON public.admin_notifications;

CREATE POLICY "Admins can manage admin_notifications"
ON public.admin_notifications FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- app_settings
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage app_settings" ON public.app_settings;
DROP POLICY IF EXISTS "Anyone can read app_settings"   ON public.app_settings;

CREATE POLICY "Anyone can read app_settings"
ON public.app_settings FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can manage app_settings"
ON public.app_settings FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Prevent users from setting their own is_admin flag
DROP POLICY IF EXISTS "Users cannot self-escalate to admin" ON public.profiles;
CREATE POLICY "Users cannot self-escalate to admin"
ON public.profiles FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (
  id = auth.uid()
  AND (
    -- Only admins can change the is_admin field
    is_admin = (SELECT is_admin FROM public.profiles WHERE id = auth.uid())
    OR public.is_admin()
  )
);
