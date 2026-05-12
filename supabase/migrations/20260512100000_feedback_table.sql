-- Feedback & feature requests from users
CREATE TABLE IF NOT EXISTS feedback (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        REFERENCES profiles(id) ON DELETE SET NULL,
  type        TEXT        NOT NULL DEFAULT 'thought' CHECK (type IN ('thought', 'feature')),
  title       TEXT,
  message     TEXT        NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Authenticated users can submit feedback
CREATE POLICY "feedback_insert" ON feedback
  FOR INSERT WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

-- Only authenticated users can read (for admin panel later)
CREATE POLICY "feedback_select" ON feedback
  FOR SELECT USING (auth.uid() IS NOT NULL);
