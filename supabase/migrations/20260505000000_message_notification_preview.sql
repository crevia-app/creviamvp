-- RPC called client-side immediately after a chat message is inserted.
-- The client has the plaintext before encryption; this patches the
-- "🔒 Encrypted message" body that the trigger writes with the real preview.
-- SECURITY DEFINER bypasses RLS so the sender can update recipients' notifications.
CREATE OR REPLACE FUNCTION public.update_message_notification_preview(
  p_room_id  uuid,
  p_preview  text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.notifications
  SET body = LEFT(p_preview, 120)
  WHERE type        = 'message'
    AND (data->>'room_id')::uuid = p_room_id
    AND created_at  > NOW() - INTERVAL '5 seconds';
END;
$$;

GRANT EXECUTE ON FUNCTION public.update_message_notification_preview(uuid, text) TO authenticated;
