-- ============================================================
-- Fix: Allow anyone (including unauthenticated) to submit feedback
-- The previous policy required auth.uid() IS NOT NULL, which blocks
-- anonymous feedback submissions.
-- ============================================================

DROP POLICY IF EXISTS "Authenticated users can submit feedback" ON public.feedback_reports;

CREATE POLICY "Anyone can submit feedback" ON public.feedback_reports
  FOR INSERT WITH CHECK (true);
