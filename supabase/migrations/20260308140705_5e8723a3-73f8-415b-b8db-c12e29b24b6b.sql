
ALTER TABLE public.contracts DROP CONSTRAINT IF EXISTS contracts_contract_type_check;
ALTER TABLE public.contracts ADD CONSTRAINT contracts_contract_type_check CHECK (contract_type IN ('sponsorship', 'content_creation', 'brand_ambassador', 'ugc', 'affiliate', 'custom', 'uploaded'));
