-- ============================================================
-- 12. COMMUNITY CHAT MVP
-- Support for real-time community chitchat in MSIBOT Tab.
-- ============================================================

CREATE TABLE public.community_chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL CHECK (char_length(trim(message)) > 0 AND char_length(message) <= 500),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for quickly loading the latest messages
CREATE INDEX idx_community_chat_created_at ON public.community_chat_messages(created_at DESC);

-- Enable RLS
ALTER TABLE public.community_chat_messages ENABLE ROW LEVEL SECURITY;

-- Reading: Any authenticated user can read all community messages. 
-- (Kept restricted to authenticated for privacy, guest logic locks the tab anyway)
CREATE POLICY "Authenticated users can read messages" 
  ON public.community_chat_messages 
  FOR SELECT 
  USING (auth.role() = 'authenticated');

-- Inserting: Authenticated users can only insert their own messages
CREATE POLICY "Authenticated users can insert messages" 
  ON public.community_chat_messages 
  FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);

-- Deleting: Users can delete their own messages, Admins can delete any.
CREATE POLICY "Users can delete own messages or admins can delete any" 
  ON public.community_chat_messages 
  FOR DELETE 
  USING (auth.uid() = user_id OR public.is_admin());

-- Realtime Setup: Enable realtime broadcast for the chat table
ALTER PUBLICATION supabase_realtime ADD TABLE public.community_chat_messages;
