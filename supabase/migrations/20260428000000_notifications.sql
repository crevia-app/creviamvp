-- ─── notifications ────────────────────────────────────────────────────────────
-- Stores per-user in-app notifications. Triggered by DB-level events so
-- delivery is reliable regardless of which client initiated the action.

CREATE TABLE IF NOT EXISTS public.notifications (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type       text        NOT NULL DEFAULT 'system',
  title      text        NOT NULL,
  body       text,
  data       jsonb       NOT NULL DEFAULT '{}'::jsonb,
  read       boolean     NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id
  ON public.notifications(user_id);

-- Partial index speeds up the unread-count query significantly.
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread
  ON public.notifications(user_id, created_at DESC)
  WHERE read = false;

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "notif_select_own" ON public.notifications;
DROP POLICY IF EXISTS "notif_update_own" ON public.notifications;

-- Users may only see their own notifications.
CREATE POLICY "notif_select_own"
  ON public.notifications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Users may mark their own notifications as read (only the read column matters).
CREATE POLICY "notif_update_own"
  ON public.notifications FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- No user-level INSERT policy — only SECURITY DEFINER trigger functions write here.


-- ─── Trigger: new chat message ────────────────────────────────────────────────
-- Notifies all room members (except the sender) when a message is sent.
-- Messages from the same room are grouped into a single unread notification
-- for 30 minutes to prevent notification spam in fast-moving chats.

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
BEGIN
  -- Skip system / voiceNote / file messages — only text gets a push.
  IF NEW.message_type IS NOT NULL AND NEW.message_type != 'text' THEN
    RETURN NEW;
  END IF;

  SELECT COALESCE(display_name, handle, 'Someone')
  INTO   v_sender_name
  FROM   public.profiles
  WHERE  id = NEW.sender_id;

  FOR v_member_id IN
    SELECT user_id
    FROM   public.chat_room_members
    WHERE  room_id = NEW.room_id
      AND  user_id != NEW.sender_id
  LOOP
    -- Look for an existing unread notification for the same room within 30 min.
    SELECT id INTO v_existing_id
    FROM   public.notifications
    WHERE  user_id = v_member_id
      AND  type    = 'message'
      AND  (data->>'room_id') = NEW.room_id::text
      AND  read    = false
      AND  created_at > now() - interval '30 minutes'
    LIMIT 1;

    IF v_existing_id IS NOT NULL THEN
      -- Bump the existing notification so it surfaces at the top.
      UPDATE public.notifications
      SET    title      = v_sender_name || ' sent more messages',
             created_at = now()
      WHERE  id = v_existing_id;
    ELSE
      INSERT INTO public.notifications (user_id, type, title, body, data)
      VALUES (
        v_member_id,
        'message',
        v_sender_name || ' sent you a message',
        CASE
          WHEN NEW.is_encrypted THEN '🔒 Encrypted message'
          ELSE LEFT(COALESCE(NEW.content, ''), 120)
        END,
        jsonb_build_object('room_id', NEW.room_id::text)
      );
    END IF;
  END LOOP;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_chat_message ON public.chat_messages;
CREATE TRIGGER trg_notify_chat_message
  AFTER INSERT ON public.chat_messages
  FOR EACH ROW EXECUTE FUNCTION public.notify_chat_message();


-- ─── Trigger: contract status change ─────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.notify_contract_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO public.notifications (user_id, type, title, body, data)
    SELECT
      p.id,
      'contract',
      CASE NEW.status
        WHEN 'signed'   THEN 'Contract signed'
        WHEN 'expired'  THEN 'Contract expired'
        ELSE                 'Contract updated'
      END,
      COALESCE(NEW.title, 'Untitled contract'),
      jsonb_build_object('contract_id', NEW.id::text)
    FROM public.profiles p
    WHERE p.id = NEW.user_id
       OR p.id = NEW.client_id
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_contract_status ON public.contracts;
CREATE TRIGGER trg_notify_contract_status
  AFTER UPDATE ON public.contracts
  FOR EACH ROW EXECUTE FUNCTION public.notify_contract_status();


-- ─── Trigger: invoice status change ──────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.notify_invoice_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO public.notifications (user_id, type, title, body, data)
    SELECT
      p.id,
      'invoice',
      CASE NEW.status
        WHEN 'paid'     THEN 'Invoice paid'
        WHEN 'overdue'  THEN 'Invoice overdue'
        ELSE                 'Invoice updated'
      END,
      COALESCE(NEW.invoice_number, 'Invoice') || ' — ' ||
        to_char(COALESCE(NEW.total, 0), 'FM999,999,990.00'),
      jsonb_build_object('invoice_id', NEW.id::text)
    FROM public.profiles p
    WHERE p.id = NEW.user_id
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_invoice_status ON public.invoices;
CREATE TRIGGER trg_notify_invoice_status
  AFTER UPDATE ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION public.notify_invoice_status();
