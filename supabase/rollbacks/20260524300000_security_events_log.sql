-- Rollback for: 20260524300000_security_events_log.sql
-- Removes the security_events table and log_security_event function.

DROP FUNCTION IF EXISTS public.log_security_event(text, uuid, text, text, text);
DROP TABLE IF EXISTS public.security_events;
