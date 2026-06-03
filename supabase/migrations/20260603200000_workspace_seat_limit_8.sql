-- Raise workspace seat limit to 8 for all paid plans.
-- Previously: pro = 1, business = 3. Now all paid plans = 8.

CREATE OR REPLACE FUNCTION accept_workspace_invite(p_token TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_invite        workspace_invites%ROWTYPE;
  v_user_id       UUID := auth.uid();
  v_room_creator  UUID;
  v_creator_plan  TEXT;
  v_seat_limit    INT;
  v_member_count  INT;
BEGIN
  SELECT * INTO v_invite
  FROM workspace_invites
  WHERE token = p_token
    AND expires_at > NOW();

  IF NOT FOUND THEN
    RAISE EXCEPTION 'invalid_or_expired_invite';
  END IF;

  -- Already a member → idempotent
  IF EXISTS (
    SELECT 1 FROM chat_room_members
    WHERE chat_room_members.room_id = v_invite.room_id
      AND chat_room_members.user_id = v_user_id
  ) THEN
    RETURN v_invite.room_id;
  END IF;

  -- Look up the workspace creator's plan
  SELECT created_by INTO v_room_creator
  FROM chat_rooms WHERE id = v_invite.room_id;

  SELECT COALESCE(subscription_plan, 'free') INTO v_creator_plan
  FROM profiles WHERE id = v_room_creator;

  -- Map plan → seat limit
  v_seat_limit := CASE v_creator_plan
    WHEN 'enterprise'      THEN 100
    WHEN 'free'            THEN 1
    ELSE 8   -- pro, creative_pro, business, brand_workspace
  END;

  -- Count current members
  SELECT COUNT(*) INTO v_member_count
  FROM chat_room_members WHERE room_id = v_invite.room_id;

  IF v_member_count >= v_seat_limit THEN
    RAISE EXCEPTION 'seat_limit_reached';
  END IF;

  INSERT INTO chat_room_members (room_id, user_id, role)
  VALUES (v_invite.room_id, v_user_id, 'member')
  ON CONFLICT (room_id, user_id) DO NOTHING;

  UPDATE workspace_invites
  SET used_by = v_user_id, accepted_at = NOW()
  WHERE id = v_invite.id AND used_by IS NULL;

  RETURN v_invite.room_id;
END;
$$;

GRANT EXECUTE ON FUNCTION accept_workspace_invite(TEXT) TO authenticated;
