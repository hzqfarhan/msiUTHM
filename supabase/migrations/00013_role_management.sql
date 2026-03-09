-- ============================================================
-- 13. ROLE MANAGEMENT & MODERATION
-- Updating profile roles and extending with email/provider.
-- ============================================================

-- 1. Drop the existing 'user' / 'admin' only constraint (default PostgreSQL naming)
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

-- 2. Map legacy 'user' values to 'member' seamlessly without losing data
UPDATE public.profiles 
SET role = 'member' 
WHERE role = 'user';

-- 3. Re-apply the expanded role constraint
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('student', 'member', 'staff', 'moderator', 'admin'));

-- 4. Add new profile fields for admin dashboards
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS provider TEXT;

-- 5. Add moderator helper function bypassing RLS for performant deletion checks (Step 6 later)
CREATE OR REPLACE FUNCTION public.is_moderator_or_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'moderator')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
