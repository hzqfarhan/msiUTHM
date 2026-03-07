-- ============================================================
-- MSI UTHM Companion — Initial Database Schema
-- Run this in Supabase SQL Editor or as a migration.
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- 1. PROFILES (auto-created on auth signup)
-- ============================================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  avatar_url TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auto-create profile on new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to check admin role (SECURITY DEFINER bypasses RLS to prevent infinite recursion)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (
    public.is_admin()
  );

-- ============================================================
-- 2. MOSQUES
-- ============================================================
CREATE TABLE public.mosques (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT,
  lat NUMERIC,
  lng NUMERIC,
  timezone TEXT NOT NULL DEFAULT 'Asia/Kuala_Lumpur',
  zone_code TEXT NOT NULL DEFAULT 'JHR01',
  contact_info JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.mosques ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read mosques" ON public.mosques
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage mosques" ON public.mosques
  FOR ALL USING (
    public.is_admin()
  );

-- ============================================================
-- 3. PRAYER TIMES CACHE
-- ============================================================
CREATE TABLE public.prayer_times_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mosque_id UUID NOT NULL REFERENCES public.mosques(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  subuh TIME NOT NULL,
  syuruk TIME NOT NULL,
  zohor TIME NOT NULL,
  asar TIME NOT NULL,
  maghrib TIME NOT NULL,
  isyak TIME NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(mosque_id, date)
);

CREATE INDEX idx_prayer_times_date ON public.prayer_times_cache(mosque_id, date);

ALTER TABLE public.prayer_times_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read prayer times" ON public.prayer_times_cache
  FOR SELECT USING (true);

CREATE POLICY "Service can manage prayer times" ON public.prayer_times_cache
  FOR ALL USING (
    public.is_admin()
  );

-- ============================================================
-- 4. IQAMAH SETTINGS
-- ============================================================
CREATE TABLE public.iqamah_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mosque_id UUID NOT NULL REFERENCES public.mosques(id) ON DELETE CASCADE,
  prayer_name TEXT NOT NULL,
  offset_minutes INT NOT NULL DEFAULT 10,
  fixed_time TIME,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(mosque_id, prayer_name)
);

ALTER TABLE public.iqamah_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read iqamah settings" ON public.iqamah_settings
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage iqamah settings" ON public.iqamah_settings
  FOR ALL USING (
    public.is_admin()
  );

-- ============================================================
-- 5. EVENTS
-- ============================================================
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mosque_id UUID NOT NULL REFERENCES public.mosques(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ,
  location TEXT,
  poster_url TEXT,
  tags TEXT[] DEFAULT '{}',
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_by UUID REFERENCES public.profiles(id),
  max_participants INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_events_start ON public.events(mosque_id, start_at);
CREATE INDEX idx_events_published ON public.events(is_published, start_at);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read published events" ON public.events
  FOR SELECT USING (is_published = true);

CREATE POLICY "Admins can read all events" ON public.events
  FOR SELECT USING (
    public.is_admin()
  );

CREATE POLICY "Admins can manage events" ON public.events
  FOR ALL USING (
    public.is_admin()
  );

-- ============================================================
-- 6. EVENT RSVPS
-- ============================================================
CREATE TABLE public.event_rsvps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  guest_name TEXT,
  guest_phone TEXT,
  status TEXT NOT NULL DEFAULT 'confirmed',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(event_id, user_id)
);

CREATE INDEX idx_rsvps_event ON public.event_rsvps(event_id);

ALTER TABLE public.event_rsvps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own RSVPs" ON public.event_rsvps
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own RSVP" ON public.event_rsvps
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own RSVP" ON public.event_rsvps
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all RSVPs" ON public.event_rsvps
  FOR SELECT USING (
    public.is_admin()
  );

-- ============================================================
-- 7. EVENT CHECKINS
-- ============================================================
CREATE TABLE public.event_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  checked_in_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(event_id, user_id)
);

ALTER TABLE public.event_checkins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own checkins" ON public.event_checkins
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own checkin" ON public.event_checkins
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all checkins" ON public.event_checkins
  FOR SELECT USING (
    public.is_admin()
  );

-- ============================================================
-- 8. ANNOUNCEMENTS
-- ============================================================
CREATE TABLE public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mosque_id UUID NOT NULL REFERENCES public.mosques(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT,
  category TEXT NOT NULL DEFAULT 'general' CHECK (category IN ('general', 'urgent', 'event', 'facilities')),
  image_url TEXT,
  is_published BOOLEAN NOT NULL DEFAULT true,
  pinned BOOLEAN NOT NULL DEFAULT false,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_announcements_published ON public.announcements(mosque_id, is_published, created_at DESC);

ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read published announcements" ON public.announcements
  FOR SELECT USING (is_published = true);

CREATE POLICY "Admins can manage announcements" ON public.announcements
  FOR ALL USING (
    public.is_admin()
  );

-- ============================================================
-- 9. FACILITIES
-- ============================================================
CREATE TABLE public.facilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mosque_id UUID NOT NULL REFERENCES public.mosques(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  location_hint TEXT,
  photos TEXT[] DEFAULT '{}',
  has_wheelchair_access BOOLEAN NOT NULL DEFAULT false,
  opening_hours TEXT,
  lat NUMERIC,
  lng NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.facilities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read facilities" ON public.facilities
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage facilities" ON public.facilities
  FOR ALL USING (
    public.is_admin()
  );

-- ============================================================
-- 10. FEEDBACK REPORTS
-- ============================================================
CREATE TABLE public.feedback_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mosque_id UUID NOT NULL REFERENCES public.mosques(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  category TEXT,
  description TEXT NOT NULL,
  photo_url TEXT,
  facility_id UUID REFERENCES public.facilities(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'acknowledged', 'resolved')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_feedback_status ON public.feedback_reports(mosque_id, status);

ALTER TABLE public.feedback_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can submit feedback" ON public.feedback_reports
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can view own feedback" ON public.feedback_reports
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage feedback" ON public.feedback_reports
  FOR ALL USING (
    public.is_admin()
  );

-- ============================================================
-- 11. VOLUNTEER OPPORTUNITIES
-- ============================================================
CREATE TABLE public.volunteer_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mosque_id UUID NOT NULL REFERENCES public.mosques(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  event_id UUID REFERENCES public.events(id) ON DELETE SET NULL,
  slots_needed INT,
  deadline TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.volunteer_opportunities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active opportunities" ON public.volunteer_opportunities
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage opportunities" ON public.volunteer_opportunities
  FOR ALL USING (
    public.is_admin()
  );

-- ============================================================
-- 12. VOLUNTEER SIGNUPS
-- ============================================================
CREATE TABLE public.volunteer_signups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id UUID NOT NULL REFERENCES public.volunteer_opportunities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(opportunity_id, user_id)
);

ALTER TABLE public.volunteer_signups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own signups" ON public.volunteer_signups
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own signup" ON public.volunteer_signups
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own signup" ON public.volunteer_signups
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all signups" ON public.volunteer_signups
  FOR SELECT USING (
    public.is_admin()
  );

-- ============================================================
-- 13. PUSH SUBSCRIPTIONS
-- ============================================================
CREATE TABLE public.push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  keys JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, endpoint)
);

ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own subscriptions" ON public.push_subscriptions
  FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- 14. ANALYTICS EVENTS
-- ============================================================
CREATE TABLE public.analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name TEXT NOT NULL,
  session_id TEXT,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  page_path TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_analytics_name ON public.analytics_events(event_name, created_at);
CREATE INDEX idx_analytics_session ON public.analytics_events(session_id);

ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Anyone can insert analytics (including anonymous)
CREATE POLICY "Anyone can insert analytics" ON public.analytics_events
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can read analytics" ON public.analytics_events
  FOR SELECT USING (
    public.is_admin()
  );

-- ============================================================
-- 15. DONATION INFO
-- ============================================================
CREATE TABLE public.donation_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mosque_id UUID NOT NULL REFERENCES public.mosques(id) ON DELETE CASCADE,
  bank_name TEXT,
  account_number TEXT,
  account_name TEXT,
  qr_image_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.donation_info ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read donation info" ON public.donation_info
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage donation info" ON public.donation_info
  FOR ALL USING (
    public.is_admin()
  );

-- ============================================================
-- Updated_at trigger function
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.mosques FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.iqamah_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.announcements FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.facilities FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.feedback_reports FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.volunteer_opportunities FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.donation_info FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
