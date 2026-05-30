-- Performance indexes on hot query columns
CREATE INDEX IF NOT EXISTS idx_invoices_user_id              ON public.invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status               ON public.invoices(status);
CREATE INDEX IF NOT EXISTS idx_canvases_user_id              ON public.canvases(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_clients_user_id         ON public.saved_clients(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_room_members_user_id     ON public.chat_room_members(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_room_members_room_id     ON public.chat_room_members(room_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_room_id         ON public.chat_messages(room_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at      ON public.chat_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_handle               ON public.profiles(handle);
CREATE INDEX IF NOT EXISTS idx_dira_memories_user_id         ON public.dira_memories(user_id);
CREATE INDEX IF NOT EXISTS idx_dira_memories_created_at      ON public.dira_memories(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_workspace_invites_token       ON public.workspace_invites(token);
