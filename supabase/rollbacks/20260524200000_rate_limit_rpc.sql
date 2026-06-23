-- Rollback for: 20260524200000_rate_limit_rpc.sql
-- Removes the rate_limits table and check_rate_limit function.

DROP FUNCTION IF EXISTS public.check_rate_limit(text, text, integer, integer);
DROP TABLE IF EXISTS public.rate_limits;
