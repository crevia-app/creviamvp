-- Idempotency guard for webhook_events.
-- Prevents duplicate processing when Paystack retries a webhook delivery.
-- The unique key is (source, event_type, reference): same payment event from
-- the same provider with the same transaction reference can only exist once.
-- NULL references (events that carry no reference, e.g. subscription.disable)
-- are excluded from the constraint — PostgreSQL does not enforce UNIQUE across NULL values.

ALTER TABLE public.webhook_events
  ADD CONSTRAINT webhook_events_source_event_reference_unique
  UNIQUE (source, event_type, reference);
