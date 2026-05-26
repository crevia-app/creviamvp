-- Fix handle_new_user trigger to gracefully handle duplicate handles.
-- The old version would crash with a unique constraint violation if the email
-- prefix was already taken (e.g. user signs up via Google then tries email/password).
-- Now it appends _1, _2, etc. until it finds a free handle.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  base_handle TEXT;
  final_handle TEXT;
  counter INTEGER := 0;
BEGIN
  -- Sanitise: lowercase, replace dots/special chars with underscores
  base_handle := LOWER(
    REGEXP_REPLACE(
      COALESCE(NEW.raw_user_metadata->>'handle', SPLIT_PART(NEW.email, '@', 1)),
      '[^a-z0-9_]', '_', 'g'
    )
  );

  final_handle := base_handle;

  -- Walk until we find a handle that isn't taken
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE handle = final_handle) LOOP
    counter := counter + 1;
    final_handle := base_handle || '_' || counter;
  END LOOP;

  INSERT INTO public.profiles (id, user_type, handle, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_metadata->>'user_type', 'creator')::public.user_type,
    final_handle,
    NEW.email
  );

  RETURN NEW;
END;
$$;
