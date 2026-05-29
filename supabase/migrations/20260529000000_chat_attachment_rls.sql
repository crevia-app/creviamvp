-- ============================================================
-- Migration: chat_attachment_rls
-- Purpose:   Allow chat room members to view invoices and
--            canvases that have been shared inside a chat room.
--
-- Problem:   The original RLS policies on `invoices` and
--            `canvases` only allowed the owner (user_id) to
--            SELECT their own rows.  When User A shares an
--            invoice or canvas in a chat room, User B (a
--            member of that room) is the recipient.
--            AttachmentBubble queries the table on tap and
--            receives null → the preview opens empty.
--
-- Fix:       Add a second SELECT policy (additive OR logic)
--            that also grants access when the viewer is a
--            confirmed member of any room that contains a
--            message referencing the invoice / canvas.
-- ============================================================

-- ── invoices ─────────────────────────────────────────────────
CREATE POLICY "Room members can view shared invoices"
ON public.invoices
FOR SELECT
USING (
  auth.uid() = user_id
  OR EXISTS (
    SELECT 1
    FROM   public.chat_messages   cm
    JOIN   public.chat_room_members crm ON crm.room_id = cm.room_id
    WHERE  cm.invoice_id  = invoices.id
    AND    crm.user_id    = auth.uid()
  )
);

-- ── canvases ─────────────────────────────────────────────────
CREATE POLICY "Room members can view shared canvases"
ON public.canvases
FOR SELECT
USING (
  auth.uid() = user_id
  OR EXISTS (
    SELECT 1
    FROM   public.chat_messages   cm
    JOIN   public.chat_room_members crm ON crm.room_id = cm.room_id
    WHERE  cm.contract_id = canvases.id
    AND    crm.user_id    = auth.uid()
  )
);
