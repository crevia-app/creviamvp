-- ── Workspace Poll Votes ──────────────────────────────────────────────────────
-- Stores one vote per user per poll message.
-- poll_message_id references the chat_messages row whose message_type = 'poll'.

CREATE TABLE IF NOT EXISTS workspace_poll_votes (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_message_id uuid        NOT NULL REFERENCES chat_messages(id) ON DELETE CASCADE,
  user_id         uuid        NOT NULL REFERENCES auth.users(id)    ON DELETE CASCADE,
  option_id       text        NOT NULL,
  created_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (poll_message_id, user_id)   -- one vote per user per poll
);

ALTER TABLE workspace_poll_votes ENABLE ROW LEVEL SECURITY;

-- Any authenticated user can read, insert, update, or delete their own votes.
CREATE POLICY "Authenticated users can manage poll votes"
  ON workspace_poll_votes
  FOR ALL
  USING  (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() = user_id);

-- Real-time broadcasts — allow authenticated users to receive change events.
ALTER PUBLICATION supabase_realtime ADD TABLE workspace_poll_votes;
