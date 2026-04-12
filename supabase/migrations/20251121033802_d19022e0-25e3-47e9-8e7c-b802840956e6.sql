
-- Create enum types
CREATE TYPE public.user_type AS ENUM ('creator', 'brand');
CREATE TYPE public.verification_status AS ENUM ('pending', 'verified', 'rejected');
CREATE TYPE public.verification_method AS ENUM ('id', 'social');
CREATE TYPE public.campaign_status AS ENUM ('draft', 'active', 'completed', 'cancelled');
CREATE TYPE public.application_status AS ENUM ('pending', 'accepted', 'rejected', 'completed');
CREATE TYPE public.message_status AS ENUM ('sent', 'delivered', 'read');

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  user_type public.user_type NOT NULL,
  handle TEXT UNIQUE NOT NULL,
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  verification_status public.verification_status DEFAULT 'pending',
  verification_method public.verification_method,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Creator profiles
CREATE TABLE public.creator_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  creator_types TEXT[] DEFAULT '{}',
  goals TEXT[] DEFAULT '{}',
  social_links JSONB DEFAULT '{}',
  portfolio_url TEXT,
  follower_count INTEGER DEFAULT 0,
  engagement_rate DECIMAL(5,2),
  profile_views INTEGER DEFAULT 0,
  campaign_clicks INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Brand profiles
CREATE TABLE public.brand_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  business_type TEXT,
  goals TEXT[] DEFAULT '{}',
  logo_url TEXT,
  company_description TEXT,
  website_url TEXT,
  social_links JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Campaigns
CREATE TABLE public.campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  budget DECIMAL(10,2),
  requirements TEXT,
  deliverables TEXT[] DEFAULT '{}',
  platforms TEXT[] DEFAULT '{}',
  industry TEXT,
  region TEXT,
  deadline TIMESTAMP WITH TIME ZONE,
  status public.campaign_status DEFAULT 'draft',
  views INTEGER DEFAULT 0,
  applications_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Campaign applications
CREATE TABLE public.campaign_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE NOT NULL,
  creator_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  proposal TEXT,
  proposed_price DECIMAL(10,2),
  status public.application_status DEFAULT 'pending',
  ai_match_score DECIMAL(5,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(campaign_id, creator_id)
);

-- Messages
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  receiver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  status public.message_status DEFAULT 'sent',
  is_flagged BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Creator wishlist (saved campaigns)
CREATE TABLE public.wishlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(creator_id, campaign_id)
);

-- Brand favorites (saved creators)
CREATE TABLE public.brand_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  creator_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(brand_id, creator_id)
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creator_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_favorites ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- RLS Policies for creator_profiles
CREATE POLICY "Creator profiles viewable by everyone"
  ON public.creator_profiles FOR SELECT
  USING (true);

CREATE POLICY "Creators can update own profile"
  ON public.creator_profiles FOR UPDATE
  USING (profile_id = auth.uid());

CREATE POLICY "Creators can insert own profile"
  ON public.creator_profiles FOR INSERT
  WITH CHECK (profile_id = auth.uid());

-- RLS Policies for brand_profiles
CREATE POLICY "Brand profiles viewable by everyone"
  ON public.brand_profiles FOR SELECT
  USING (true);

CREATE POLICY "Brands can update own profile"
  ON public.brand_profiles FOR UPDATE
  USING (profile_id = auth.uid());

CREATE POLICY "Brands can insert own profile"
  ON public.brand_profiles FOR INSERT
  WITH CHECK (profile_id = auth.uid());

-- RLS Policies for campaigns
CREATE POLICY "Active campaigns viewable by everyone"
  ON public.campaigns FOR SELECT
  USING (status = 'active' OR brand_id = auth.uid());

CREATE POLICY "Brands can create campaigns"
  ON public.campaigns FOR INSERT
  WITH CHECK (brand_id = auth.uid());

CREATE POLICY "Brands can update own campaigns"
  ON public.campaigns FOR UPDATE
  USING (brand_id = auth.uid());

CREATE POLICY "Brands can delete own campaigns"
  ON public.campaigns FOR DELETE
  USING (brand_id = auth.uid());

-- RLS Policies for campaign_applications
CREATE POLICY "Applications viewable by campaign owner and applicant"
  ON public.campaign_applications FOR SELECT
  USING (
    creator_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.campaigns WHERE campaigns.id = campaign_id AND campaigns.brand_id = auth.uid())
  );

CREATE POLICY "Creators can apply to campaigns"
  ON public.campaign_applications FOR INSERT
  WITH CHECK (creator_id = auth.uid());

CREATE POLICY "Creators can update own applications"
  ON public.campaign_applications FOR UPDATE
  USING (creator_id = auth.uid());

CREATE POLICY "Brands can update applications on their campaigns"
  ON public.campaign_applications FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.campaigns WHERE campaigns.id = campaign_id AND campaigns.brand_id = auth.uid())
  );

-- RLS Policies for messages
CREATE POLICY "Users can view their messages"
  ON public.messages FOR SELECT
  USING (sender_id = auth.uid() OR receiver_id = auth.uid());

CREATE POLICY "Users can send messages"
  ON public.messages FOR INSERT
  WITH CHECK (sender_id = auth.uid());

-- RLS Policies for wishlist
CREATE POLICY "Creators can view own wishlist"
  ON public.wishlist FOR SELECT
  USING (creator_id = auth.uid());

CREATE POLICY "Creators can add to wishlist"
  ON public.wishlist FOR INSERT
  WITH CHECK (creator_id = auth.uid());

CREATE POLICY "Creators can remove from wishlist"
  ON public.wishlist FOR DELETE
  USING (creator_id = auth.uid());

-- RLS Policies for brand_favorites
CREATE POLICY "Brands can view own favorites"
  ON public.brand_favorites FOR SELECT
  USING (brand_id = auth.uid());

CREATE POLICY "Brands can add favorites"
  ON public.brand_favorites FOR INSERT
  WITH CHECK (brand_id = auth.uid());

CREATE POLICY "Brands can remove favorites"
  ON public.brand_favorites FOR DELETE
  USING (brand_id = auth.uid());

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_creator_profiles_updated_at BEFORE UPDATE ON public.creator_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_brand_profiles_updated_at BEFORE UPDATE ON public.brand_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON public.campaigns
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_campaign_applications_updated_at BEFORE UPDATE ON public.campaign_applications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();