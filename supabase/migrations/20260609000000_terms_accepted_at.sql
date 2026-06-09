-- Add terms_accepted_at to profiles
-- Stores the exact timestamp a user agreed to Terms of Use + Privacy Policy.
-- NULL = not yet recorded (existing users get it set silently on next login).
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMPTZ DEFAULT NULL;
