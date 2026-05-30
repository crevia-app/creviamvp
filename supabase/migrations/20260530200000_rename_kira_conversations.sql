-- Rename kira_conversations → dira_conversations (missed in the initial rename migration).

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'kira_conversations') THEN
    ALTER TABLE public.kira_conversations RENAME TO dira_conversations;
  END IF;
END $$;
