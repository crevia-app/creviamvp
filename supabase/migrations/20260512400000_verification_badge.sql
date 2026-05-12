-- ────────────────────────────────────────────────────────────
-- Verification Badge System  (2026-05-12)
-- ────────────────────────────────────────────────────────────

-- 1. Admin flag on profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT false;

-- Mark the founder as admin (update email if different)
UPDATE public.profiles
SET is_admin = true
WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'anthony.onyango@student.moringaschool.com'
);

-- 2. verification_requests table
CREATE TABLE IF NOT EXISTS public.verification_requests (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status            TEXT        NOT NULL DEFAULT 'pending'
                                CHECK (status IN ('pending', 'approved', 'rejected')),
  instagram_handle  TEXT,
  tiktok_handle     TEXT,
  youtube_handle    TEXT,
  twitter_handle    TEXT,
  follower_count    INTEGER,
  reason            TEXT        NOT NULL,
  reviewer_notes    TEXT,
  reviewed_by       UUID        REFERENCES public.profiles(id) ON DELETE SET NULL,
  reviewed_at       TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.verification_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "verreq_insert_own"    ON public.verification_requests;
DROP POLICY IF EXISTS "verreq_select"        ON public.verification_requests;
DROP POLICY IF EXISTS "verreq_update_admin"  ON public.verification_requests;

CREATE POLICY "verreq_insert_own"
  ON public.verification_requests FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "verreq_select"
  ON public.verification_requests FOR SELECT
  USING (
    user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "verreq_update_admin"
  ON public.verification_requests FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true));


-- 3. approve_verification RPC  (admin only, SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.approve_verification(
  p_request_id UUID,
  p_notes      TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Caller must be admin
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true) THEN
    RAISE EXCEPTION 'not_admin';
  END IF;

  -- Get the user being approved
  SELECT user_id INTO v_user_id
  FROM verification_requests
  WHERE id = p_request_id AND status = 'pending';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'request_not_found_or_already_reviewed';
  END IF;

  -- Mark request approved
  UPDATE verification_requests
  SET status       = 'approved',
      reviewer_notes = p_notes,
      reviewed_by  = auth.uid(),
      reviewed_at  = NOW()
  WHERE id = p_request_id;

  -- Set profile as verified
  UPDATE profiles
  SET is_verified        = true,
      verification_status = 'verified'
  WHERE id = v_user_id;

  RETURN jsonb_build_object('success', true, 'user_id', v_user_id);
END;
$$;


-- 4. reject_verification RPC  (admin only)
CREATE OR REPLACE FUNCTION public.reject_verification(
  p_request_id UUID,
  p_notes      TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true) THEN
    RAISE EXCEPTION 'not_admin';
  END IF;

  UPDATE verification_requests
  SET status         = 'rejected',
      reviewer_notes = p_notes,
      reviewed_by    = auth.uid(),
      reviewed_at    = NOW()
  WHERE id = p_request_id AND status = 'pending';

  RETURN jsonb_build_object('success', true);
END;
$$;
