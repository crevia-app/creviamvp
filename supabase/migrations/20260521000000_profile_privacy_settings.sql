-- Add profile_public and do_not_disturb to profiles.
-- profile_public: controls whether the public /username page is visible to non-owners.
-- do_not_disturb: suppresses the notification bell badge and realtime notification updates.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS profile_public BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS do_not_disturb BOOLEAN DEFAULT false;

