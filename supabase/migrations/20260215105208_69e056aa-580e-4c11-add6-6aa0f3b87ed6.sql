
-- Create business_settings table for invoice/contract settings
CREATE TABLE public.business_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  business_name TEXT,
  business_email TEXT,
  business_phone TEXT,
  business_address TEXT,
  logo_url TEXT,
  tax_id TEXT,
  default_currency TEXT DEFAULT 'KES',
  default_tax_rate NUMERIC DEFAULT 0,
  default_payment_terms TEXT DEFAULT 'Payment is due within 30 days of invoice date.',
  bank_name TEXT,
  bank_account_name TEXT,
  bank_account_number TEXT,
  mpesa_till_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.business_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own settings"
ON public.business_settings FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own settings"
ON public.business_settings FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings"
ON public.business_settings FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own settings"
ON public.business_settings FOR DELETE
USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_business_settings_updated_at
BEFORE UPDATE ON public.business_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
