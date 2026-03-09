-- ============================================================
-- 15. PROFILES RLS FOR COMMUNITY CHAT
-- Allow authenticated users to view profiles so they can see names and avatars in chat.
-- ============================================================

CREATE POLICY "Authenticated users can view all profiles" 
  ON public.profiles 
  FOR SELECT 
  USING (auth.role() = 'authenticated');
