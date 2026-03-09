-- ============================================================
-- 14. CHAT MODERATION RLS
-- Allows moderators to delete any message in the community chat.
-- ============================================================

-- Drop the previous strict delete policy
DROP POLICY IF EXISTS "Users can delete own messages or admins can delete any" 
  ON public.community_chat_messages;

-- Create the new expanded delete policy utilizing our new helper
CREATE POLICY "Users can delete own messages or mods can delete any" 
  ON public.community_chat_messages 
  FOR DELETE 
  USING (auth.uid() = user_id OR public.is_moderator_or_admin());
