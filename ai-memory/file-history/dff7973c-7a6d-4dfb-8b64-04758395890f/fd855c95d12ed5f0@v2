-- Add accent_color to invoices for Pro theme customisation.
-- Defaults to Crevia Gold so all existing invoices are unchanged.
ALTER TABLE public.invoices
  ADD COLUMN IF NOT EXISTS accent_color TEXT DEFAULT '#B07D3A';
