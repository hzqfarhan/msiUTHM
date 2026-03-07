-- ============================================================
-- Fix Infinite Recursion for Existing Tables
-- Run this if the tables already exist to only update the policies
-- ============================================================

-- 1. Create the helper function that bypasses RLS
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Drop existing recursive policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage mosques" ON public.mosques;
DROP POLICY IF EXISTS "Service can manage prayer times" ON public.prayer_times_cache;
DROP POLICY IF EXISTS "Admins can manage iqamah settings" ON public.iqamah_settings;
DROP POLICY IF EXISTS "Admins can read all events" ON public.events;
DROP POLICY IF EXISTS "Admins can manage events" ON public.events;
DROP POLICY IF EXISTS "Admins can view all RSVPs" ON public.event_rsvps;
DROP POLICY IF EXISTS "Admins can view all checkins" ON public.event_checkins;
DROP POLICY IF EXISTS "Admins can manage announcements" ON public.announcements;
DROP POLICY IF EXISTS "Admins can manage facilities" ON public.facilities;
DROP POLICY IF EXISTS "Admins can manage feedback" ON public.feedback_reports;
DROP POLICY IF EXISTS "Admins can manage opportunities" ON public.volunteer_opportunities;
DROP POLICY IF EXISTS "Admins can view all signups" ON public.volunteer_signups;
DROP POLICY IF EXISTS "Admins can read analytics" ON public.analytics_events;
DROP POLICY IF EXISTS "Admins can manage donation info" ON public.donation_info;

-- 3. Recreate policies using the safe helper function
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins can manage mosques" ON public.mosques FOR ALL USING (public.is_admin());
CREATE POLICY "Service can manage prayer times" ON public.prayer_times_cache FOR ALL USING (public.is_admin());
CREATE POLICY "Admins can manage iqamah settings" ON public.iqamah_settings FOR ALL USING (public.is_admin());
CREATE POLICY "Admins can read all events" ON public.events FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins can manage events" ON public.events FOR ALL USING (public.is_admin());
CREATE POLICY "Admins can view all RSVPs" ON public.event_rsvps FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins can view all checkins" ON public.event_checkins FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins can manage announcements" ON public.announcements FOR ALL USING (public.is_admin());
CREATE POLICY "Admins can manage facilities" ON public.facilities FOR ALL USING (public.is_admin());
CREATE POLICY "Admins can manage feedback" ON public.feedback_reports FOR ALL USING (public.is_admin());
CREATE POLICY "Admins can manage opportunities" ON public.volunteer_opportunities FOR ALL USING (public.is_admin());
CREATE POLICY "Admins can view all signups" ON public.volunteer_signups FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins can read analytics" ON public.analytics_events FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins can manage donation info" ON public.donation_info FOR ALL USING (public.is_admin());
