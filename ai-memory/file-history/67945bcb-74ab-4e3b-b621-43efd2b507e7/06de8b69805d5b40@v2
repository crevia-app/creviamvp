-- Invoice branding columns on business_settings
-- invoice_accent_color: default theme colour for new invoices
-- invoice_payment_details: saved payment info auto-filled into new invoices

ALTER TABLE public.business_settings
  ADD COLUMN IF NOT EXISTS invoice_accent_color text DEFAULT '#B07D3A',
  ADD COLUMN IF NOT EXISTS invoice_payment_details jsonb;
