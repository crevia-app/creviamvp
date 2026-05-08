ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS kira_memory JSONB DEFAULT '{}';
