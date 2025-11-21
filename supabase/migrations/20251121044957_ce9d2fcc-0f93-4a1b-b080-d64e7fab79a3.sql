-- Create link_profiles table for Crevia Link
CREATE TABLE public.link_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  username TEXT NOT NULL UNIQUE,
  profile_picture TEXT,
  display_name TEXT,
  bio TEXT,
  theme TEXT DEFAULT 'dark',
  layout TEXT DEFAULT 'centered',
  background JSONB DEFAULT '{"type": "solid", "value": "#000000"}'::jsonb,
  show_verified_badge BOOLEAN DEFAULT true,
  show_crevia_branding BOOLEAN DEFAULT true,
  contact_enabled BOOLEAN DEFAULT true,
  contact_email TEXT,
  seo_title TEXT,
  seo_description TEXT,
  seo_image TEXT,
  total_visits INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create link_buttons table
CREATE TABLE public.link_buttons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES public.link_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  subtitle TEXT,
  url TEXT NOT NULL,
  icon TEXT,
  style TEXT DEFAULT 'filled',
  order_index INTEGER NOT NULL,
  visible BOOLEAN DEFAULT true,
  clicks INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create link_social_icons table
CREATE TABLE public.link_social_icons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES public.link_profiles(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  url TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create link_featured_work table
CREATE TABLE public.link_featured_work (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES public.link_profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  url TEXT NOT NULL,
  thumbnail TEXT,
  title TEXT,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.link_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.link_buttons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.link_social_icons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.link_featured_work ENABLE ROW LEVEL SECURITY;

-- RLS Policies for link_profiles
CREATE POLICY "Link profiles are viewable by everyone"
  ON public.link_profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can create their own link profile"
  ON public.link_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own link profile"
  ON public.link_profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own link profile"
  ON public.link_profiles FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for link_buttons
CREATE POLICY "Link buttons are viewable by everyone"
  ON public.link_buttons FOR SELECT
  USING (true);

CREATE POLICY "Users can manage their own link buttons"
  ON public.link_buttons FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.link_profiles
    WHERE link_profiles.id = link_buttons.profile_id
    AND link_profiles.user_id = auth.uid()
  ));

-- RLS Policies for link_social_icons
CREATE POLICY "Social icons are viewable by everyone"
  ON public.link_social_icons FOR SELECT
  USING (true);

CREATE POLICY "Users can manage their own social icons"
  ON public.link_social_icons FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.link_profiles
    WHERE link_profiles.id = link_social_icons.profile_id
    AND link_profiles.user_id = auth.uid()
  ));

-- RLS Policies for link_featured_work
CREATE POLICY "Featured work is viewable by everyone"
  ON public.link_featured_work FOR SELECT
  USING (true);

CREATE POLICY "Users can manage their own featured work"
  ON public.link_featured_work FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.link_profiles
    WHERE link_profiles.id = link_featured_work.profile_id
    AND link_profiles.user_id = auth.uid()
  ));

-- Create trigger for updated_at
CREATE TRIGGER update_link_profiles_updated_at
  BEFORE UPDATE ON public.link_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();