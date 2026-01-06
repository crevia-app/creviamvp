-- Create invoices table
CREATE TABLE public.invoices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invoice_number TEXT NOT NULL,
  client_name TEXT NOT NULL,
  client_email TEXT,
  client_address TEXT,
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
  subtotal NUMERIC NOT NULL DEFAULT 0,
  tax_rate NUMERIC DEFAULT 0,
  tax_amount NUMERIC DEFAULT 0,
  discount_amount NUMERIC DEFAULT 0,
  total NUMERIC NOT NULL DEFAULT 0,
  notes TEXT,
  terms TEXT,
  currency TEXT DEFAULT 'KES',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create invoice items table
CREATE TABLE public.invoice_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity NUMERIC NOT NULL DEFAULT 1,
  unit_price NUMERIC NOT NULL,
  total NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create contracts table
CREATE TABLE public.contracts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  client_name TEXT NOT NULL,
  client_email TEXT,
  contract_type TEXT NOT NULL DEFAULT 'custom' CHECK (contract_type IN ('sponsorship', 'content_creation', 'brand_ambassador', 'ugc', 'affiliate', 'custom')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'signed', 'active', 'completed', 'cancelled')),
  start_date DATE,
  end_date DATE,
  value NUMERIC,
  currency TEXT DEFAULT 'KES',
  content TEXT,
  deliverables TEXT[],
  payment_terms TEXT,
  exclusivity BOOLEAN DEFAULT false,
  exclusivity_details TEXT,
  usage_rights TEXT,
  termination_clause TEXT,
  creator_signature TEXT,
  creator_signed_at TIMESTAMP WITH TIME ZONE,
  client_signature TEXT,
  client_signed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create rate cards table
CREATE TABLE public.rate_cards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  share_slug TEXT UNIQUE,
  theme TEXT DEFAULT 'professional',
  currency TEXT DEFAULT 'KES',
  valid_from DATE,
  valid_until DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create rate card services table
CREATE TABLE public.rate_card_services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  rate_card_id UUID NOT NULL REFERENCES public.rate_cards(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  service_name TEXT NOT NULL,
  description TEXT,
  base_price NUMERIC NOT NULL,
  price_type TEXT DEFAULT 'fixed' CHECK (price_type IN ('fixed', 'hourly', 'per_post', 'per_video', 'negotiable')),
  turnaround_days INTEGER,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_card_services ENABLE ROW LEVEL SECURITY;

-- Invoices policies
CREATE POLICY "Users can view own invoices" ON public.invoices FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own invoices" ON public.invoices FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own invoices" ON public.invoices FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own invoices" ON public.invoices FOR DELETE USING (auth.uid() = user_id);

-- Invoice items policies
CREATE POLICY "Users can view own invoice items" ON public.invoice_items FOR SELECT USING (EXISTS (SELECT 1 FROM public.invoices WHERE invoices.id = invoice_items.invoice_id AND invoices.user_id = auth.uid()));
CREATE POLICY "Users can create own invoice items" ON public.invoice_items FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.invoices WHERE invoices.id = invoice_items.invoice_id AND invoices.user_id = auth.uid()));
CREATE POLICY "Users can update own invoice items" ON public.invoice_items FOR UPDATE USING (EXISTS (SELECT 1 FROM public.invoices WHERE invoices.id = invoice_items.invoice_id AND invoices.user_id = auth.uid()));
CREATE POLICY "Users can delete own invoice items" ON public.invoice_items FOR DELETE USING (EXISTS (SELECT 1 FROM public.invoices WHERE invoices.id = invoice_items.invoice_id AND invoices.user_id = auth.uid()));

-- Contracts policies
CREATE POLICY "Users can view own contracts" ON public.contracts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own contracts" ON public.contracts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own contracts" ON public.contracts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own contracts" ON public.contracts FOR DELETE USING (auth.uid() = user_id);

-- Rate cards policies
CREATE POLICY "Users can view own rate cards" ON public.rate_cards FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Public rate cards are viewable by everyone" ON public.rate_cards FOR SELECT USING (is_public = true);
CREATE POLICY "Users can create own rate cards" ON public.rate_cards FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own rate cards" ON public.rate_cards FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own rate cards" ON public.rate_cards FOR DELETE USING (auth.uid() = user_id);

-- Rate card services policies
CREATE POLICY "Users can view own rate card services" ON public.rate_card_services FOR SELECT USING (EXISTS (SELECT 1 FROM public.rate_cards WHERE rate_cards.id = rate_card_services.rate_card_id AND rate_cards.user_id = auth.uid()));
CREATE POLICY "Public rate card services are viewable" ON public.rate_card_services FOR SELECT USING (EXISTS (SELECT 1 FROM public.rate_cards WHERE rate_cards.id = rate_card_services.rate_card_id AND rate_cards.is_public = true));
CREATE POLICY "Users can create own rate card services" ON public.rate_card_services FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.rate_cards WHERE rate_cards.id = rate_card_services.rate_card_id AND rate_cards.user_id = auth.uid()));
CREATE POLICY "Users can update own rate card services" ON public.rate_card_services FOR UPDATE USING (EXISTS (SELECT 1 FROM public.rate_cards WHERE rate_cards.id = rate_card_services.rate_card_id AND rate_cards.user_id = auth.uid()));
CREATE POLICY "Users can delete own rate card services" ON public.rate_card_services FOR DELETE USING (EXISTS (SELECT 1 FROM public.rate_cards WHERE rate_cards.id = rate_card_services.rate_card_id AND rate_cards.user_id = auth.uid()));

-- Create updated_at triggers
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON public.invoices FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_contracts_updated_at BEFORE UPDATE ON public.contracts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_rate_cards_updated_at BEFORE UPDATE ON public.rate_cards FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();