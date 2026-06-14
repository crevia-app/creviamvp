-- Grant anon + authenticated SELECT on all public Crevia Link tables.
-- Without this, the PostgREST anon role returns 401 on public profile pages
-- even though RLS policies have USING (true).
GRANT SELECT ON public.link_profiles     TO anon, authenticated;
GRANT SELECT ON public.link_buttons      TO anon, authenticated;
GRANT SELECT ON public.link_social_icons TO anon, authenticated;
GRANT SELECT ON public.link_featured_work TO anon, authenticated;
