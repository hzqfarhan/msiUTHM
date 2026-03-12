-- ============================================================
-- 17. IMPROVE CHAT RLS ROBUSTNESS
-- Use auth.uid() IS NOT NULL instead of auth.role() = 'authenticated'
-- for better reliability across different auth providers/sessions.
-- ============================================================

-- 1. Profiles Table Updates
DROP POLICY IF EXISTS "Authenticated users can view all profiles" ON public.profiles;

CREATE POLICY "Authenticated users can view all profiles" 
  ON public.profiles 
  FOR SELECT 
  USING (auth.uid() IS NOT NULL);

-- 2. Community Chat Messages Table Updates
DROP POLICY IF EXISTS "Authenticated users can read messages" ON public.community_chat_messages;

CREATE POLICY "Authenticated users can read messages" 
  ON public.community_chat_messages 
  FOR SELECT 
  USING (auth.uid() IS NOT NULL);

-- Ensure INSERT also uses the more robust check
DROP POLICY IF EXISTS "Authenticated users can insert messages" ON public.community_chat_messages;

CREATE POLICY "Authenticated users can insert messages" 
  ON public.community_chat_messages 
  FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);
