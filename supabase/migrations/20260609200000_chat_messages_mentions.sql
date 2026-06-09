-- Add optional mentions column to chat_messages.
-- Stores an array of user IDs tagged in a message (@handle).
-- Nullable so all existing rows and untagged messages are unaffected.
ALTER TABLE public.chat_messages
  ADD COLUMN IF NOT EXISTS mentions uuid[] DEFAULT NULL;
