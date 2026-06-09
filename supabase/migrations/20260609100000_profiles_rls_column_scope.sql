-- Security fix: scope profiles SELECT policy to prevent cross-tenant PII exposure.
--
-- The original "Public profiles are viewable by everyone" policy used USING (true),
-- which allowed any authenticated user to query every row including email,
-- subscription_plan, is_admin, and usage metrics of all other users.
--
-- Fix:
--   1. Replace the broad policy with an owner+admin gate on the profiles table.
--   2. Create a SECURITY DEFINER view (profiles_public) that exposes only
--      the safe social columns — used by chat, @mentions, workspace members.
--   3. Admins still reach the full table via the is_admin() policy.

-- ── 1. Drop the over-broad policy ────────────────────────────────────────────
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

-- ── 2. Replacement policies ───────────────────────────────────────────────────
-- Own row: full column access (needed for useSubscription, settings pages, etc.)
DROP POLICY IF EXISTS "Users read own full profile" ON public.profiles;
CREATE POLICY "Users read own full profile"
ON public.profiles FOR SELECT
TO authenticated
USING (id = auth.uid());

-- Admin read-all: admins can still read every profile for the admin portal
DROP POLICY IF EXISTS "Admins read all profiles" ON public.profiles;
CREATE POLICY "Admins read all profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (public.is_admin());

-- ── 3. Safe public view for cross-user social queries ────────────────────────
-- Exposes only the columns needed by chat / @mentions / workspace member lists.
-- security_invoker = false (SECURITY DEFINER semantics): the view runs as its
-- owner and bypasses the table's restrictive RLS so social lookups still work,
-- while the sensitive columns (email, subscription_plan, is_admin, etc.) are
-- simply not present in the view definition.
DROP VIEW IF EXISTS public.profiles_public;

CREATE VIEW public.profiles_public AS
SELECT
  id,
  display_name,
  handle,
  avatar_url,
  user_type,
  is_verified,
  created_at
FROM public.profiles;

ALTER VIEW public.profiles_public SET (security_invoker = false);

GRANT SELECT ON public.profiles_public TO authenticated;
GRANT SELECT ON public.profiles_public TO anon;
