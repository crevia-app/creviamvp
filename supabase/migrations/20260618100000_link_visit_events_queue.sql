-- Replace the hot-row UPDATE pattern for visit counting with an insert-only
-- events table. Concurrent inserts on different rows never block each other,
-- eliminating the Postgres row lock that serialises high-traffic link visits.
-- A pg_cron job aggregates and flushes to link_profiles.total_visits every minute.

-- 1. Staging table — one lightweight row per visit
CREATE TABLE IF NOT EXISTS public.link_visit_events (
  id         uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id uuid        NOT NULL REFERENCES public.link_profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS link_visit_events_profile_id_idx
  ON public.link_visit_events (profile_id);

-- 2. RLS: anon/authenticated can insert; no reads needed
ALTER TABLE public.link_visit_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_insert_visit_events"
  ON public.link_visit_events
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

GRANT INSERT ON public.link_visit_events TO anon;
GRANT INSERT ON public.link_visit_events TO authenticated;

-- 3. Flush function: one aggregated UPDATE per profile, then clear the queue
CREATE OR REPLACE FUNCTION public.flush_link_visit_events()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.link_profiles lp
  SET total_visits = lp.total_visits + counts.n
  FROM (
    SELECT profile_id, COUNT(*) AS n
    FROM public.link_visit_events
    GROUP BY profile_id
  ) counts
  WHERE lp.id = counts.profile_id;

  DELETE FROM public.link_visit_events;
END;
$$;

-- 4. Run the flush every minute
SELECT cron.schedule(
  'flush-link-visit-events',
  '* * * * *',
  'SELECT public.flush_link_visit_events()'
);
