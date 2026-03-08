
-- Table for storing user public encryption keys
CREATE TABLE public.user_encryption_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  public_key text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.user_encryption_keys ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can read public keys (needed for key exchange)
CREATE POLICY "Authenticated users can view public keys"
  ON public.user_encryption_keys FOR SELECT
  TO authenticated
  USING (true);

-- Users can insert their own key
CREATE POLICY "Users can insert own public key"
  ON public.user_encryption_keys FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Users can update their own key
CREATE POLICY "Users can update own public key"
  ON public.user_encryption_keys FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- Table for storing encrypted room keys per member
CREATE TABLE public.room_encrypted_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  encrypted_by uuid NOT NULL,
  encrypted_key text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(room_id, user_id)
);

ALTER TABLE public.room_encrypted_keys ENABLE ROW LEVEL SECURITY;

-- Room members can view their own encrypted key
CREATE POLICY "Users can view own room keys"
  ON public.room_encrypted_keys FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Room members can insert keys (when creating rooms or adding members)
CREATE POLICY "Authenticated users can insert room keys"
  ON public.room_encrypted_keys FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow updating room keys (for key rotation)
CREATE POLICY "Users can update own room keys"
  ON public.room_encrypted_keys FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());
