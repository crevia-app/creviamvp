-- ────────────────────────────────────────────────────────────
-- RLS Security Fixes  (2026-05-12)
-- ────────────────────────────────────────────────────────────

-- ── 1. workspace_invites ─────────────────────────────────────
DROP POLICY IF EXISTS "invite_select_authenticated"  ON workspace_invites;
DROP POLICY IF EXISTS "invite_update_accept"         ON workspace_invites;
DROP POLICY IF EXISTS "invite_select_own"            ON workspace_invites;
DROP POLICY IF EXISTS "invite_update_accept_own"     ON workspace_invites;

CREATE POLICY "invite_select_own"
  ON workspace_invites FOR SELECT
  USING (
    invited_by = auth.uid()
    OR used_by  = auth.uid()
    OR room_id  IN (
      SELECT id FROM chat_rooms WHERE created_by = auth.uid()
    )
  );

CREATE POLICY "invite_update_accept_own"
  ON workspace_invites FOR UPDATE
  USING  (used_by IS NULL)
  WITH CHECK (used_by = auth.uid());


-- ── 2. feedback ──────────────────────────────────────────────
DROP POLICY IF EXISTS "feedback_select"     ON feedback;
DROP POLICY IF EXISTS "feedback_select_own" ON feedback;

CREATE POLICY "feedback_select_own"
  ON feedback FOR SELECT
  USING (user_id = auth.uid());


-- ── 3. chat_messages UPDATE ──────────────────────────────────
DROP POLICY IF EXISTS "Senders can update own messages" ON chat_messages;

CREATE POLICY "Senders can update own messages"
  ON chat_messages FOR UPDATE
  USING (sender_id = auth.uid())
  WITH CHECK (
    sender_id = auth.uid()
    AND room_id = room_id
  );


-- ── 4. notifications: explicit INSERT denial ─────────────────
DROP POLICY IF EXISTS "notif_insert_deny" ON notifications;

CREATE POLICY "notif_insert_deny"
  ON notifications FOR INSERT
  WITH CHECK (false);
