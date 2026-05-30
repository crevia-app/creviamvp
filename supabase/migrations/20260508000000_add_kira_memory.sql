ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS dira_memory JSONB DEFAULT '{}';
