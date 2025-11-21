-- Create profiles table if it doesn't exist already
-- Note: This table already exists based on types, but we need to ensure it has proper structure

-- Create a function to automatically create a profile when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, user_type, handle, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_metadata->>'user_type', 'creator')::public.user_type,
    COALESCE(NEW.raw_user_metadata->>'handle', SPLIT_PART(NEW.email, '@', 1)),
    NEW.email
  );
  RETURN NEW;
END;
$$;

-- Create trigger to auto-create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();