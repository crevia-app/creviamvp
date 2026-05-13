-- Store where on the document the creator placed their signature (x, y, w, h in px)
ALTER TABLE public.contracts
  ADD COLUMN IF NOT EXISTS signature_position JSONB;
