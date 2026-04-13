-- Add Kira AI usage tracking to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS kira_actions_used INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS kira_actions_limit INTEGER DEFAULT 5; -- Free tier: 5 actions
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS kira_usage_month TEXT DEFAULT TO_CHAR(CURRENT_DATE, 'YYYY-MM');
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS kira_tokens_used INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS kira_tokens_limit INTEGER DEFAULT 50000; -- Free tier: 50K tokens

-- Reset usage counters for new month (this will be called by a cron job or function)
CREATE OR REPLACE FUNCTION reset_kira_usage_if_new_month()
RETURNS void AS $$
BEGIN
  UPDATE public.profiles
  SET
    kira_actions_used = 0,
    kira_tokens_used = 0,
    kira_usage_month = TO_CHAR(CURRENT_DATE, 'YYYY-MM')
  WHERE kira_usage_month != TO_CHAR(CURRENT_DATE, 'YYYY-MM');
END;
$$ LANGUAGE plpgsql;

-- Update limits based on subscription (this would be called when subscription changes)
-- For now, we'll set basic limits:
-- Free: 5 actions, 50K tokens
-- Pro: 50 actions, 200K tokens
CREATE OR REPLACE FUNCTION update_kira_limits()
RETURNS void AS $$
BEGIN
  -- This is a placeholder - in production you'd check subscription status
  -- For now, everyone gets free tier limits
  UPDATE public.profiles
  SET
    kira_actions_limit = 5,
    kira_tokens_limit = 50000
  WHERE user_type = 'creator';

  UPDATE public.profiles
  SET
    kira_actions_limit = 5,
    kira_tokens_limit = 50000
  WHERE user_type = 'brand';
END;
$$ LANGUAGE plpgsql;