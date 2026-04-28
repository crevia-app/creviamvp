-- Atomic visit increment — SECURITY DEFINER bypasses RLS so anonymous visitors can increment
CREATE OR REPLACE FUNCTION public.increment_link_visit(profile_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.link_profiles
  SET total_visits = total_visits + 1
  WHERE id = profile_id;
END;
$$;

-- Atomic click increment — same pattern
CREATE OR REPLACE FUNCTION public.increment_button_click(button_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.link_buttons
  SET clicks = clicks + 1
  WHERE id = button_id;
END;
$$;
