-- ============================================================
-- Phase D: Audit Log + Granular Roles + Volunteer Shifts + Push Subscriptions
-- ============================================================

-- ============================
-- D1: Audit Log
-- ============================
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  entity_table TEXT NOT NULL,
  entity_id UUID,
  before_data JSONB,
  after_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_entity
  ON public.audit_logs (entity_table, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created
  ON public.audit_logs (created_at DESC);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can read audit logs
CREATE POLICY "Admins can read audit logs"
  ON public.audit_logs FOR SELECT
  USING (public.is_admin());

-- Audit trigger function
CREATE OR REPLACE FUNCTION public.audit_trigger_func()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.audit_logs (actor_user_id, action, entity_table, entity_id, after_data)
    VALUES (auth.uid(), 'INSERT', TG_TABLE_NAME, NEW.id, to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.audit_logs (actor_user_id, action, entity_table, entity_id, before_data, after_data)
    VALUES (auth.uid(), 'UPDATE', TG_TABLE_NAME, NEW.id, to_jsonb(OLD), to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.audit_logs (actor_user_id, action, entity_table, entity_id, before_data)
    VALUES (auth.uid(), 'DELETE', TG_TABLE_NAME, OLD.id, to_jsonb(OLD));
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach triggers to key tables
DROP TRIGGER IF EXISTS audit_events ON public.events;
CREATE TRIGGER audit_events
  AFTER INSERT OR UPDATE OR DELETE ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();

DROP TRIGGER IF EXISTS audit_announcements ON public.announcements;
CREATE TRIGGER audit_announcements
  AFTER INSERT OR UPDATE OR DELETE ON public.announcements
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();

DROP TRIGGER IF EXISTS audit_facilities ON public.facilities;
CREATE TRIGGER audit_facilities
  AFTER INSERT OR UPDATE OR DELETE ON public.facilities
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();


-- ============================
-- D2: Granular Admin Roles
-- ============================

-- Expand role constraint (drop old, add new)
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('admin', 'editor', 'moderator', 'user'));

-- Helper functions for role checks
CREATE OR REPLACE FUNCTION public.is_editor_or_above()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'editor')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_moderator_or_above()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'editor', 'moderator')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update policies: editors can manage events/announcements/facilities
DROP POLICY IF EXISTS "Admins can manage events" ON public.events;
CREATE POLICY "Editors can manage events" ON public.events
  FOR ALL USING (public.is_editor_or_above());

DROP POLICY IF EXISTS "Admins can manage announcements" ON public.announcements;
CREATE POLICY "Editors can manage announcements" ON public.announcements
  FOR ALL USING (public.is_editor_or_above());

DROP POLICY IF EXISTS "Admins can manage facilities" ON public.facilities;
CREATE POLICY "Editors can manage facilities" ON public.facilities
  FOR ALL USING (public.is_editor_or_above());

-- Moderators can manage feedback
DROP POLICY IF EXISTS "Admins can manage feedback" ON public.feedback_reports;
CREATE POLICY "Moderators can manage feedback" ON public.feedback_reports
  FOR ALL USING (public.is_moderator_or_above());


-- ============================
-- D3: Volunteer Shifts + Capacity
-- ============================
CREATE TABLE IF NOT EXISTS public.volunteer_shifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id UUID NOT NULL REFERENCES public.volunteer_opportunities(id) ON DELETE CASCADE,
  shift_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  capacity INT NOT NULL DEFAULT 10,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.volunteer_shift_signups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shift_id UUID NOT NULL REFERENCES public.volunteer_shifts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (shift_id, user_id)
);

ALTER TABLE public.volunteer_shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.volunteer_shift_signups ENABLE ROW LEVEL SECURITY;

-- Everyone can read shifts
CREATE POLICY "Anyone can view shifts"
  ON public.volunteer_shifts FOR SELECT USING (true);

-- Editors+ can manage shifts
CREATE POLICY "Editors can manage shifts"
  ON public.volunteer_shifts FOR ALL USING (public.is_editor_or_above());

-- Authenticated users can view signups
CREATE POLICY "Users can view their signups"
  ON public.volunteer_shift_signups FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

-- Users can insert their own signup
CREATE POLICY "Users can signup"
  ON public.volunteer_shift_signups FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own signup
CREATE POLICY "Users can cancel signup"
  ON public.volunteer_shift_signups FOR DELETE
  USING (auth.uid() = user_id);

-- Atomic signup RPC with capacity check
CREATE OR REPLACE FUNCTION public.signup_for_shift(p_shift_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_capacity INT;
  v_current INT;
BEGIN
  SELECT capacity INTO v_capacity FROM public.volunteer_shifts WHERE id = p_shift_id;
  IF v_capacity IS NULL THEN
    RAISE EXCEPTION 'Shift not found';
  END IF;

  SELECT COUNT(*) INTO v_current FROM public.volunteer_shift_signups WHERE shift_id = p_shift_id;
  IF v_current >= v_capacity THEN
    RETURN FALSE; -- Full
  END IF;

  INSERT INTO public.volunteer_shift_signups (shift_id, user_id) VALUES (p_shift_id, auth.uid());
  RETURN TRUE;
EXCEPTION
  WHEN unique_violation THEN
    RETURN FALSE; -- Already signed up
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================
-- D4: Push Subscriptions
-- ============================
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  session_id TEXT,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth_key TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (endpoint)
);

ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can manage their own subscriptions
CREATE POLICY "Users can manage own push subscriptions"
  ON public.push_subscriptions FOR ALL
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Admins can read all for broadcasting
CREATE POLICY "Admins can read all push subscriptions"
  ON public.push_subscriptions FOR SELECT
  USING (public.is_admin());


-- ============================
-- D5: Event Check-in Tokens (for QR)
-- ============================
CREATE TABLE IF NOT EXISTS public.event_checkin_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '7 days'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.event_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  session_id TEXT,
  checked_in_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Unique constraint: one check-in per user per event
CREATE UNIQUE INDEX IF NOT EXISTS idx_event_checkins_user
  ON public.event_checkins (event_id, user_id) WHERE user_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_event_checkins_session
  ON public.event_checkins (event_id, session_id) WHERE session_id IS NOT NULL;

ALTER TABLE public.event_checkin_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_checkins ENABLE ROW LEVEL SECURITY;

-- Anyone can read tokens (needed for check-in page)
CREATE POLICY "Anyone can read checkin tokens"
  ON public.event_checkin_tokens FOR SELECT USING (true);

-- Editors+ can create tokens
CREATE POLICY "Editors can manage checkin tokens"
  ON public.event_checkin_tokens FOR ALL USING (public.is_editor_or_above());

-- Anyone can insert checkins (anonymous or logged in)
CREATE POLICY "Anyone can checkin"
  ON public.event_checkins FOR INSERT WITH CHECK (true);

-- Admins can read all checkins
CREATE POLICY "Admins can read checkins"
  ON public.event_checkins FOR SELECT USING (public.is_admin());
