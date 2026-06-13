-- Backfill: hide "powered by crevia" branding for all existing paid users.
-- show_crevia_branding defaults to true for everyone; paid plans should be false.
UPDATE public.link_profiles
SET show_crevia_branding = false
WHERE user_id IN (
  SELECT id FROM public.profiles
  WHERE subscription_plan IN ('pro', 'creative_pro', 'business', 'brand_workspace')
);
