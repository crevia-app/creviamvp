-- Add payment_details JSONB column to invoices
ALTER TABLE public.invoices
  ADD COLUMN IF NOT EXISTS payment_details JSONB;
