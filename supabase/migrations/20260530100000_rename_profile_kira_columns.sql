-- Rename kira_* profile columns to dira_* to match the Kira → Dira rebrand.
-- Uses DO block so each rename is idempotent (skips if already renamed).

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'kira_actions_used') THEN
    ALTER TABLE public.profiles RENAME COLUMN kira_actions_used TO dira_actions_used;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'kira_actions_limit') THEN
    ALTER TABLE public.profiles RENAME COLUMN kira_actions_limit TO dira_actions_limit;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'kira_usage_month') THEN
    ALTER TABLE public.profiles RENAME COLUMN kira_usage_month TO dira_usage_month;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'kira_tokens_used') THEN
    ALTER TABLE public.profiles RENAME COLUMN kira_tokens_used TO dira_tokens_used;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'kira_tokens_limit') THEN
    ALTER TABLE public.profiles RENAME COLUMN kira_tokens_limit TO dira_tokens_limit;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'kira_memory') THEN
    ALTER TABLE public.profiles RENAME COLUMN kira_memory TO dira_memory;
  END IF;
END $$;
