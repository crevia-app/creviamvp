-- ────────────────────────────────────────────────────────────
-- Attachment RLS Fix  (2026-05-12)
-- Allow invoice/contract recipients to read records shared with them
-- ────────────────────────────────────────────────────────────

-- Invoices: client can read invoices where their email matches client_email
DROP POLICY IF EXISTS "Clients can view invoices addressed to them" ON public.invoices;

CREATE POLICY "Clients can view invoices addressed to them"
  ON public.invoices FOR SELECT
  USING (
    client_email IS NOT NULL
    AND client_email = (
      SELECT email FROM public.profiles WHERE id = auth.uid()
    )
  );

-- Contracts: client can read contracts where their email matches client_email
DROP POLICY IF EXISTS "Clients can view contracts addressed to them" ON public.contracts;

CREATE POLICY "Clients can view contracts addressed to them"
  ON public.contracts FOR SELECT
  USING (
    client_email IS NOT NULL
    AND client_email = (
      SELECT email FROM public.profiles WHERE id = auth.uid()
    )
  );

-- Invoice items: client can read items for invoices they can see
DROP POLICY IF EXISTS "Clients can view invoice items" ON public.invoice_items;

CREATE POLICY "Clients can view invoice items"
  ON public.invoice_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.invoices
      WHERE invoices.id = invoice_items.invoice_id
        AND invoices.client_email = (
          SELECT email FROM public.profiles WHERE id = auth.uid()
        )
    )
  );
