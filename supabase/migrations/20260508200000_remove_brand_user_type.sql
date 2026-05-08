-- Stage 3: remove brand/creator portal split
-- All users are now a single unified type. Normalise any existing brand rows to creator
-- and lock the column default so new signups always get creator.

UPDATE public.profiles
SET user_type = 'creator'
WHERE user_type = 'brand';

ALTER TABLE public.profiles
  ALTER COLUMN user_type SET DEFAULT 'creator';

-- brand_profiles rows are left intact (data preserved) but new users will never
-- have a brand_profiles row created. creator_profiles remains the canonical
-- extended-profile table for all users.
