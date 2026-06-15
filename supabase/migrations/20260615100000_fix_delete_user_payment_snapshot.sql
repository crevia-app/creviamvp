-- Fix delete_user(): payment_transactions has no user_id column.
-- Users are linked to transactions indirectly via escrow_payments.creator_id/brand_id.
-- Fix 1: snapshot SELECT now JOINs through escrow_payments.
-- Fix 2: explicit DELETE of payment_transactions by user_id is removed entirely —
--        the ON DELETE CASCADE on payment_transactions.escrow_id already handles it
--        when escrow_payments rows are deleted below.

CREATE OR REPLACE FUNCTION public.delete_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  uid            uuid := auth.uid();
  v_email        text;
  v_display_name text;
  v_plan         text;
  v_invoices     jsonb;
  v_canvases     jsonb;
  v_payments     jsonb;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'not_authenticated';
  END IF;

  -- ── Snapshot before deletion ──────────────────────────────────────────
  SELECT p.email, p.display_name, p.subscription_plan
    INTO v_email, v_display_name, v_plan
    FROM public.profiles p
    WHERE p.id = uid;

  SELECT COALESCE(
    jsonb_agg(
      row_to_json(i)::jsonb || jsonb_build_object(
        'items', (
          SELECT COALESCE(jsonb_agg(row_to_json(ii)), '[]'::jsonb)
          FROM public.invoice_items ii WHERE ii.invoice_id = i.id
        )
      )
    ), '[]'::jsonb)
  INTO v_invoices
  FROM public.invoices i WHERE i.user_id = uid;

  SELECT COALESCE(jsonb_agg(row_to_json(c)), '[]'::jsonb)
  INTO v_canvases
  FROM public.canvases c WHERE c.user_id = uid;

  -- payment_transactions has no user_id; join through escrow_payments instead.
  SELECT COALESCE(jsonb_agg(row_to_json(pt)), '[]'::jsonb)
  INTO v_payments
  FROM public.payment_transactions pt
  JOIN public.escrow_payments ep ON ep.id = pt.escrow_id
  WHERE ep.creator_id = uid OR ep.brand_id = uid;

  INSERT INTO public.deleted_users
    (user_id, email, display_name, plan_at_deletion, payment_history, invoices, canvases)
  VALUES
    (uid, v_email, v_display_name, v_plan, v_payments, v_invoices, v_canvases);

  -- ── Hard-delete ───────────────────────────────────────────────────────
  -- Dira data
  DELETE FROM public.dira_messages WHERE conversation_id IN (
    SELECT id FROM public.dira_conversations WHERE user_id = uid
  );
  DELETE FROM public.dira_conversations WHERE user_id = uid;
  DELETE FROM public.dira_projects      WHERE user_id = uid;
  DELETE FROM public.dira_memories      WHERE user_id = uid;
  DELETE FROM public.conversation_summaries WHERE user_id = uid;

  -- Canvas / invoices
  DELETE FROM public.invoice_items WHERE invoice_id IN (
    SELECT id FROM public.invoices WHERE user_id = uid
  );
  DELETE FROM public.invoices  WHERE user_id = uid;
  DELETE FROM public.canvases  WHERE user_id = uid;

  -- Crevia Link
  DELETE FROM public.link_buttons WHERE profile_id IN (
    SELECT id FROM public.link_profiles WHERE user_id = uid
  );
  DELETE FROM public.link_social_icons WHERE profile_id IN (
    SELECT id FROM public.link_profiles WHERE user_id = uid
  );
  DELETE FROM public.link_featured_work WHERE profile_id IN (
    SELECT id FROM public.link_profiles WHERE user_id = uid
  );
  DELETE FROM public.link_profiles WHERE user_id = uid;

  -- Workspace / messaging
  DELETE FROM public.chat_messages       WHERE sender_id = uid;
  DELETE FROM public.message_reactions   WHERE user_id = uid;
  DELETE FROM public.favorite_messages   WHERE user_id = uid;
  DELETE FROM public.deleted_messages    WHERE user_id = uid;
  DELETE FROM public.pinned_messages     WHERE pinned_by = uid;
  DELETE FROM public.chat_read_receipts  WHERE user_id = uid;
  DELETE FROM public.room_encrypted_keys WHERE user_id = uid;
  DELETE FROM public.chat_room_members   WHERE user_id = uid;
  DELETE FROM public.notifications       WHERE user_id = uid;

  -- Campaigns / payments
  -- payment_transactions rows cascade automatically when escrow_payments are deleted.
  DELETE FROM public.campaign_applications   WHERE creator_id = uid;
  DELETE FROM public.deliverable_submissions WHERE creator_id = uid;
  DELETE FROM public.escrow_payments         WHERE creator_id = uid OR brand_id = uid;
  DELETE FROM public.creator_payout_methods  WHERE user_id = uid;

  -- Misc profile data
  DELETE FROM public.brand_favorites    WHERE user_id = uid OR creator_id = uid;
  DELETE FROM public.wishlist           WHERE user_id = uid;
  DELETE FROM public.rate_card_services WHERE rate_card_id IN (
    SELECT id FROM public.rate_cards WHERE user_id = uid
  );
  DELETE FROM public.rate_cards            WHERE user_id = uid;
  DELETE FROM public.business_settings     WHERE user_id = uid;
  DELETE FROM public.user_encryption_keys  WHERE user_id = uid;
  DELETE FROM public.saved_clients         WHERE user_id = uid;

  DELETE FROM public.creator_profiles WHERE profile_id = uid;
  DELETE FROM public.brand_profiles   WHERE profile_id = uid;
  DELETE FROM public.profiles         WHERE id = uid;

  -- Remove auth user (cascades to auth.sessions etc.)
  DELETE FROM auth.users WHERE id = uid;
END;
$$;

GRANT EXECUTE ON FUNCTION public.delete_user() TO authenticated;
