-- Fix chat_messages invoice_id and contract_id FKs to use SET NULL on deletion.
-- Without this, deleting a user fails because their invoices/contracts can't be
-- removed while chat_messages still references them.
ALTER TABLE public.chat_messages
  DROP CONSTRAINT IF EXISTS chat_messages_invoice_id_fkey;

ALTER TABLE public.chat_messages
  ADD CONSTRAINT chat_messages_invoice_id_fkey
  FOREIGN KEY (invoice_id)
  REFERENCES public.invoices(id)
  ON DELETE SET NULL;

ALTER TABLE public.chat_messages
  DROP CONSTRAINT IF EXISTS chat_messages_contract_id_fkey;

ALTER TABLE public.chat_messages
  ADD CONSTRAINT chat_messages_contract_id_fkey
  FOREIGN KEY (contract_id)
  REFERENCES public.contracts(id)
  ON DELETE SET NULL;
