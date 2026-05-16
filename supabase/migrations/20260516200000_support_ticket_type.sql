ALTER TABLE public.support_tickets ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'general';
