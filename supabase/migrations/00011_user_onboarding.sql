-- ============================================================
-- 11. USER ONBOARDING FIELDS
-- Add onboarding fields to existing profiles table
-- ============================================================

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS community_role TEXT CHECK (community_role IN ('student', 'staff', 'alumni', 'community')),
ADD COLUMN IF NOT EXISTS faculty TEXT,
ADD COLUMN IF NOT EXISTS batch TEXT,
ADD COLUMN IF NOT EXISTS volunteering_interests TEXT[],
ADD COLUMN IF NOT EXISTS notification_preferences JSONB,
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;
