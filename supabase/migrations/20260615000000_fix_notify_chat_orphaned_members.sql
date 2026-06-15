-- Fix: notify_chat_message trigger fails with FK violation when a room member's
-- auth.users record has been deleted (orphaned member). The FOR loop now JOINs
-- auth.users so it silently skips members who no longer have a valid auth record.

CREATE OR REPLACE FUNCTION public.notify_chat_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_member_id   uuid;
  v_sender_name text;
  v_existing_id uuid;
  v_title       text;
  v_body        text;
BEGIN
  SELECT COALESCE(display_name, handle, 'Someone')
  INTO   v_sender_name
  FROM   public.profiles
  WHERE  id = NEW.sender_id;

  CASE NEW.message_type
    WHEN 'text'     THEN
      v_title := v_sender_name || ' sent you a message';
      v_body  := CASE
                   WHEN NEW.is_encrypted THEN '🔒 Encrypted message'
                   ELSE LEFT(COALESCE(NEW.content, ''), 120)
                 END;
    WHEN 'voice'    THEN
      v_title := v_sender_name || ' sent a voice note';
      v_body  := '🎤 Voice note';
    WHEN 'file'     THEN
      v_title := v_sender_name || ' sent a file';
      v_body  := '📎 ' || COALESCE(NEW.file_name, 'Attachment');
    WHEN 'invoice'  THEN
      v_title := v_sender_name || ' sent an invoice';
      v_body  := '🧾 Invoice attached';
    WHEN 'contract' THEN
      v_title := v_sender_name || ' sent a contract';
      v_body  := '📋 Contract attached';
    ELSE
      RETURN NEW;
  END CASE;

  -- JOIN auth.users to skip members whose auth account no longer exists,
  -- preventing a FK violation that would roll back the entire message insert.
  FOR v_member_id IN
    SELECT crm.user_id
    FROM   public.chat_room_members crm
    JOIN   auth.users au ON au.id = crm.user_id
    WHERE  crm.room_id = NEW.room_id
      AND  crm.user_id != NEW.sender_id
  LOOP
    SELECT id INTO v_existing_id
    FROM   public.notifications
    WHERE  user_id = v_member_id
      AND  type    = 'message'
      AND  (data->>'room_id') = NEW.room_id::text
      AND  read    = false
      AND  created_at > now() - interval '30 minutes'
    LIMIT 1;

    IF v_existing_id IS NOT NULL THEN
      UPDATE public.notifications
      SET    title      = v_sender_name || ' sent more messages',
             body       = v_body,
             created_at = now()
      WHERE  id = v_existing_id;
    ELSE
      INSERT INTO public.notifications (user_id, type, title, body, data)
      VALUES (v_member_id, 'message', v_title, v_body,
              jsonb_build_object('room_id', NEW.room_id::text));
    END IF;
  END LOOP;

  RETURN NEW;
END;
$$;
