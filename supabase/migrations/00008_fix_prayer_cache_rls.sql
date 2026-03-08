-- Fix: Allow prayer times cache to be written by any user through server actions.
-- Previously required is_admin(), which silently blocked cache writes for regular users.
-- This caused every request to re-fetch from JAKIM API (slow, unreliable).

DROP POLICY IF EXISTS "Service can manage prayer times" ON public.prayer_times_cache;

-- Allow anyone to read (already exists, but re-state for clarity)
-- SELECT policy "Anyone can read prayer times" already allows this.

-- Allow inserts/updates from any authenticated context (server actions run as the user)
CREATE POLICY "Anyone can cache prayer times" ON public.prayer_times_cache
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update prayer cache" ON public.prayer_times_cache
  FOR UPDATE USING (true) WITH CHECK (true);

-- Only admins can delete cached entries
CREATE POLICY "Admins can delete prayer cache" ON public.prayer_times_cache
  FOR DELETE USING (public.is_admin());
