
-- Create escrow payments table for 50/50 split system
CREATE TABLE public.escrow_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE,
  application_id UUID REFERENCES public.campaign_applications(id) ON DELETE CASCADE,
  brand_id UUID NOT NULL REFERENCES public.profiles(id),
  creator_id UUID NOT NULL REFERENCES public.profiles(id),
  total_amount DECIMAL(10,2) NOT NULL,
  first_payment_amount DECIMAL(10,2) NOT NULL,
  second_payment_amount DECIMAL(10,2) NOT NULL,
  first_payment_status TEXT DEFAULT 'pending' CHECK (first_payment_status IN ('pending', 'paid', 'released', 'refunded')),
  second_payment_status TEXT DEFAULT 'pending' CHECK (second_payment_status IN ('pending', 'paid', 'released', 'refunded')),
  payment_method TEXT CHECK (payment_method IN ('mpesa', 'card')),
  mpesa_phone TEXT,
  card_last_four TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create payment transactions table for tracking individual transactions
CREATE TABLE public.payment_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  escrow_id UUID REFERENCES public.escrow_payments(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('deposit', 'release', 'refund')),
  payment_phase TEXT NOT NULL CHECK (payment_phase IN ('first', 'second')),
  amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  payment_method TEXT CHECK (payment_method IN ('mpesa', 'card')),
  transaction_reference TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create creator payout methods table
CREATE TABLE public.creator_payout_methods (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  method_type TEXT NOT NULL CHECK (method_type IN ('mpesa', 'card', 'bank')),
  is_default BOOLEAN DEFAULT false,
  mpesa_phone TEXT,
  mpesa_name TEXT,
  card_holder_name TEXT,
  card_last_four TEXT,
  card_expiry TEXT,
  bank_name TEXT,
  bank_account_number TEXT,
  bank_account_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.escrow_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creator_payout_methods ENABLE ROW LEVEL SECURITY;

-- Escrow payments policies
CREATE POLICY "Brands can view their escrow payments"
ON public.escrow_payments FOR SELECT
USING (auth.uid() = brand_id);

CREATE POLICY "Creators can view their escrow payments"
ON public.escrow_payments FOR SELECT
USING (auth.uid() = creator_id);

CREATE POLICY "Brands can create escrow payments"
ON public.escrow_payments FOR INSERT
WITH CHECK (auth.uid() = brand_id);

CREATE POLICY "Brands can update their escrow payments"
ON public.escrow_payments FOR UPDATE
USING (auth.uid() = brand_id);

-- Payment transactions policies
CREATE POLICY "Users can view their payment transactions"
ON public.payment_transactions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.escrow_payments ep
    WHERE ep.id = escrow_id
    AND (ep.brand_id = auth.uid() OR ep.creator_id = auth.uid())
  )
);

CREATE POLICY "System can insert payment transactions"
ON public.payment_transactions FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.escrow_payments ep
    WHERE ep.id = escrow_id
    AND (ep.brand_id = auth.uid() OR ep.creator_id = auth.uid())
  )
);

-- Creator payout methods policies
CREATE POLICY "Creators can view their payout methods"
ON public.creator_payout_methods FOR SELECT
USING (auth.uid() = creator_id);

CREATE POLICY "Creators can manage their payout methods"
ON public.creator_payout_methods FOR INSERT
WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can update their payout methods"
ON public.creator_payout_methods FOR UPDATE
USING (auth.uid() = creator_id);

CREATE POLICY "Creators can delete their payout methods"
ON public.creator_payout_methods FOR DELETE
USING (auth.uid() = creator_id);

-- Create trigger for updated_at
CREATE TRIGGER update_escrow_payments_updated_at
BEFORE UPDATE ON public.escrow_payments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_creator_payout_methods_updated_at
BEFORE UPDATE ON public.creator_payout_methods
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
