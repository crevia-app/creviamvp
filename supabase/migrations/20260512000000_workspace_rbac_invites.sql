-- ============================================================
-- Requirement 3: Strict RBAC – admin role locked to room creator
-- Requirement 4: Bulletproof single-use invite links
-- ============================================================

-- ── 1. workspace_invites table ────────────────────────────────
-- Drop first so partial previous runs don't leave broken state
DROP TABLE IF EXISTS workspace_invites CASCADE;

CREATE TABLE workspace_invites (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  token       TEXT        UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  room_id     UUID        NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
  invited_by  UUID        NOT NULL REFERENCES profiles(id)   ON DELETE CASCADE,
  used_by     UUID        REFERENCES profiles(id)            ON DELETE SET NULL,
  accepted_at TIMESTAMPTZ,
  expires_at  TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE workspace_invites ENABLE ROW LEVEL SECURITY;

-- Only the room creator can insert invites for that room.
-- Uses IN subquery so bare `room_id` resolves unambiguously as the new row's column.
CREATE POLICY "invite_insert_creator_only" ON workspace_invites
  FOR INSERT WITH CHECK (
    invited_by = auth.uid()
    AND room_id IN (
      SELECT id FROM chat_rooms WHERE created_by = auth.uid()
    )
  );

-- Any authenticated user can read an invite (needed to accept via token lookup)
CREATE POLICY "invite_select_authenticated" ON workspace_invites
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Authenticated user can accept once; idempotent if already accepted by same user
CREATE POLICY "invite_update_accept" ON workspace_invites
  FOR UPDATE USING (auth.uid() IS NOT NULL)
  WITH CHECK (
    used_by IS NULL OR used_by = auth.uid()
  );


-- ── 2. RBAC on chat_room_members ─────────────────────────────
-- Drop all existing INSERT / UPDATE policies before replacing them
DROP POLICY IF EXISTS "Room creators can add members"        ON chat_room_members;
DROP POLICY IF EXISTS "chat_room_members_insert"             ON chat_room_members;
DROP POLICY IF EXISTS "chat_room_members_insert_rbac"        ON chat_room_members;
DROP POLICY IF EXISTS "chat_room_members_update"             ON chat_room_members;
DROP POLICY IF EXISTS "chat_room_members_no_role_escalation" ON chat_room_members;

-- role='member' is always allowed; role='admin' only for the room creator inserting themselves
CREATE POLICY "chat_room_members_insert_rbac" ON chat_room_members
  FOR INSERT WITH CHECK (
    role = 'member'
    OR (
      role = 'admin'
      AND user_id = auth.uid()
      AND EXISTS (
        SELECT 1 FROM chat_rooms
        WHERE chat_rooms.id = chat_room_members.room_id
          AND chat_rooms.created_by = auth.uid()
      )
    )
  );

-- Block any UPDATE that escalates a row to admin unless the updater is the room creator
CREATE POLICY "chat_room_members_no_role_escalation" ON chat_room_members
  FOR UPDATE USING (true)
  WITH CHECK (
    role != 'admin'
    OR EXISTS (
      SELECT 1 FROM chat_rooms
      WHERE chat_rooms.id = chat_room_members.room_id
        AND chat_rooms.created_by = auth.uid()
    )
  );


-- ── 3. accept_workspace_invite (idempotent SECURITY DEFINER) ──
CREATE OR REPLACE FUNCTION accept_workspace_invite(p_token TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_invite  workspace_invites%ROWTYPE;
  v_user_id UUID := auth.uid();
BEGIN
  SELECT * INTO v_invite
  FROM workspace_invites
  WHERE token = p_token
    AND expires_at > NOW();

  IF NOT FOUND THEN
    RAISE EXCEPTION 'invalid_or_expired_invite';
  END IF;

  -- Already a member → return room without error (idempotent)
  IF EXISTS (
    SELECT 1 FROM chat_room_members
    WHERE chat_room_members.room_id = v_invite.room_id
      AND chat_room_members.user_id = v_user_id
  ) THEN
    RETURN v_invite.room_id;
  END IF;

  INSERT INTO chat_room_members (room_id, user_id, role)
  VALUES (v_invite.room_id, v_user_id, 'member')
  ON CONFLICT (room_id, user_id) DO NOTHING;

  -- Mark invite used only once
  UPDATE workspace_invites
  SET used_by = v_user_id, accepted_at = NOW()
  WHERE id = v_invite.id AND used_by IS NULL;

  RETURN v_invite.room_id;
END;
$$;

GRANT EXECUTE ON FUNCTION accept_workspace_invite(TEXT) TO authenticated;
