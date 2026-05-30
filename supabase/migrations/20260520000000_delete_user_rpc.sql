-- ── delete_user() RPC ─────────────────────────────────────────────────────────
-- Allows an authenticated user to permanently delete their own account.
-- Deletes all user data across public tables, then removes the auth.users row.
-- SECURITY DEFINER runs with the privileges of the function owner (postgres).
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.delete_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  uid uuid := auth.uid();
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'not_authenticated';
  END IF;

  -- Dira data
  DELETE FROM public.dira_messages      WHERE conversation_id IN (
    SELECT id FROM public.dira_conversations WHERE user_id = uid
  );
  DELETE FROM public.dira_conversations WHERE user_id = uid;
  DELETE FROM public.dira_projects      WHERE user_id = uid;

  -- Canvas / invoices
  DELETE FROM public.invoice_items      WHERE invoice_id IN (
    SELECT id FROM public.invoices WHERE user_id = uid
  );
  DELETE FROM public.invoices           WHERE user_id = uid;
  DELETE FROM public.canvases           WHERE user_id = uid;

  -- Crevia Link
  DELETE FROM public.link_buttons       WHERE link_profile_id IN (
    SELECT id FROM public.link_profiles WHERE user_id = uid
  );
  DELETE FROM public.link_social_icons  WHERE link_profile_id IN (
    SELECT id FROM public.link_profiles WHERE user_id = uid
  );
  DELETE FROM public.link_featured_work WHERE link_profile_id IN (
    SELECT id FROM public.link_profiles WHERE user_id = uid
  );
  DELETE FROM public.link_profiles      WHERE user_id = uid;

  -- Workspace / messaging
  DELETE FROM public.chat_messages      WHERE sender_id = uid;
  DELETE FROM public.message_reactions  WHERE user_id = uid;
  DELETE FROM public.favorite_messages  WHERE user_id = uid;
  DELETE FROM public.deleted_messages   WHERE user_id = uid;
  DELETE FROM public.pinned_messages    WHERE pinned_by = uid;
  DELETE FROM public.chat_read_receipts WHERE user_id = uid;
  DELETE FROM public.room_encrypted_keys WHERE user_id = uid;
  DELETE FROM public.chat_room_members  WHERE user_id = uid;

  -- Campaigns / payments
  DELETE FROM public.campaign_applications WHERE creator_id = uid;
  DELETE FROM public.deliverable_submissions WHERE creator_id = uid;
  DELETE FROM public.escrow_payments    WHERE creator_id = uid OR brand_id = uid;
  DELETE FROM public.payment_transactions WHERE user_id = uid;
  DELETE FROM public.creator_payout_methods WHERE user_id = uid;

  -- Misc profile data
  DELETE FROM public.brand_favorites    WHERE user_id = uid OR creator_id = uid;
  DELETE FROM public.wishlist           WHERE user_id = uid;
  DELETE FROM public.rate_card_services WHERE rate_card_id IN (
    SELECT id FROM public.rate_cards WHERE user_id = uid
  );
  DELETE FROM public.rate_cards         WHERE user_id = uid;
  DELETE FROM public.business_settings  WHERE user_id = uid;
  DELETE FROM public.user_encryption_keys WHERE user_id = uid;
  DELETE FROM public.creator_profiles   WHERE id = uid;
  DELETE FROM public.brand_profiles     WHERE id = uid;
  DELETE FROM public.profiles           WHERE id = uid;

  -- Finally delete the auth user (cascades to auth.sessions etc.)
  DELETE FROM auth.users WHERE id = uid;
END;
$$;

GRANT EXECUTE ON FUNCTION public.delete_user() TO authenticated;
