-- ─── Add missing tables to the Supabase Realtime publication ──────────────────
--
-- Three postgres_changes subscriptions in the client have been completely silent
-- because these tables were never added to the supabase_realtime publication:
--
--   • chat_rooms        → WorkspaceInboxList subscribes to UPDATE events so the
--                         inbox bumps to the top when a new message arrives.
--                         Without this, the room list never reorders until refresh.
--
--   • chat_read_receipts → CreviaChat subscribes to * events (INSERT/UPDATE) so
--                          the "seen" ticks update live for both participants.
--                          Without this, read receipts only show after refresh.
--
--   • profiles           → CreviaChat and WorkspaceInboxList both subscribe to
--                          UPDATE events so DM partner names and avatars sync
--                          instantly when they change.
--                          Without this, old names/avatars persist until refresh.
--
-- The notifications table was added in an earlier migration (20260510100000).
-- This migration is idempotent — adding a table that is already in the
-- publication is a no-op in PostgreSQL.

ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_read_receipts;
-- profiles was already in the publication; no-op here.

-- ─── REPLICA IDENTITY FULL on notifications ────────────────────────────────────
-- The DELETE handler in use-notifications.ts reads payload.old.id to remove the
-- notification from local state. PostgreSQL's default REPLICA IDENTITY (primary
-- key only) already includes the id column, so DELETE events work as-is.
-- Setting FULL here future-proofs it in case we ever need other old-row columns.

ALTER TABLE public.notifications REPLICA IDENTITY FULL;
