-- Add Dira AI usage tracking to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS dira_actions_used INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS dira_actions_limit INTEGER DEFAULT 5; -- Free tier: 5 actions
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS dira_usage_month TEXT DEFAULT TO_CHAR(CURRENT_DATE, 'YYYY-MM');
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS dira_tokens_used INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS dira_tokens_limit INTEGER DEFAULT 50000; -- Free tier: 50K tokens

-- Reset usage counters for new month (this will be called by a cron job or function)
CREATE OR REPLACE FUNCTION reset_dira_usage_if_new_month()
RETURNS void AS $$
BEGIN
  UPDATE public.profiles
  SET
    dira_actions_used = 0,
    dira_tokens_used = 0,
    dira_usage_month = TO_CHAR(CURRENT_DATE, 'YYYY-MM')
  WHERE dira_usage_month != TO_CHAR(CURRENT_DATE, 'YYYY-MM');
END;
$$ LANGUAGE plpgsql;

-- Update limits based on subscription (this would be called when subscription changes)
-- For now, we'll set basic limits:
-- Free: 5 actions, 50K tokens
-- Pro: 50 actions, 200K tokens
CREATE OR REPLACE FUNCTION update_dira_limits()
RETURNS void AS $$
BEGIN
  -- This is a placeholder - in production you'd check subscription status
  -- For now, everyone gets free tier limits
  UPDATE public.profiles
  SET
    dira_actions_limit = 5,
    dira_tokens_limit = 50000
  WHERE user_type = 'creator';

  UPDATE public.profiles
  SET
    dira_actions_limit = 5,
    dira_tokens_limit = 50000
  WHERE user_type = 'brand';
END;
$$ LANGUAGE plpgsql;