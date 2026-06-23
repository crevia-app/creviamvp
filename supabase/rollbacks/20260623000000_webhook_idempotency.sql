-- Rollback for: 20260623000000_webhook_idempotency.sql
-- Removes the unique constraint added to webhook_events.
-- Run this if the constraint causes an unexpected issue in production.

ALTER TABLE public.webhook_events
  DROP CONSTRAINT IF EXISTS webhook_events_source_event_reference_unique;
