-- ============================================================
-- Infaq & Sumbangan — Extended Schema
-- Adds donation methods (multiple) and donation campaigns
-- Existing donation_info table is preserved as global settings
-- ============================================================

-- 1. DONATION METHODS — multiple payment methods per mosque
-- Supports: DuitNow QR, bank transfer, external link
CREATE TABLE public.donation_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mosque_id UUID NOT NULL REFERENCES public.mosques(id) ON DELETE CASCADE,
  method_type TEXT NOT NULL CHECK (method_type IN ('duitnow_qr', 'bank_transfer', 'external_link')),
  label TEXT NOT NULL,             -- e.g. "Akaun Tabung Masjid", "DuitNow QR"
  bank_name TEXT,                  -- for bank_transfer
  account_number TEXT,             -- for bank_transfer
  account_name TEXT,               -- for bank_transfer
  reference_note TEXT,             -- e.g. "Rujukan: INFAQ-MSI"
  qr_image_url TEXT,               -- for duitnow_qr (Supabase Storage URL)
  external_url TEXT,               -- for external_link
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.donation_methods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active donation methods" ON public.donation_methods
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage donation methods" ON public.donation_methods
  FOR ALL USING (public.is_admin());

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.donation_methods
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- 2. DONATION CAMPAIGNS — fundraising appeals
CREATE TABLE public.donation_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mosque_id UUID NOT NULL REFERENCES public.mosques(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  target_amount DECIMAL(12,2),       -- optional target
  current_amount DECIMAL(12,2) DEFAULT 0,  -- manually updated by admin
  start_date DATE,
  end_date DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.donation_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active campaigns" ON public.donation_campaigns
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage campaigns" ON public.donation_campaigns
  FOR ALL USING (public.is_admin());

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.donation_campaigns
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- 3. Add extra columns to existing donation_info if not present
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'donation_info' AND column_name = 'title') THEN
    ALTER TABLE public.donation_info ADD COLUMN title TEXT DEFAULT 'Infaq & Sumbangan';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'donation_info' AND column_name = 'intro_text') THEN
    ALTER TABLE public.donation_info ADD COLUMN intro_text TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'donation_info' AND column_name = 'disclaimer_text') THEN
    ALTER TABLE public.donation_info ADD COLUMN disclaimer_text TEXT DEFAULT 'Ini hanya maklumat rujukan. Tiada pemprosesan bayaran dilakukan melalui aplikasi ini.';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'donation_info' AND column_name = 'contact_name') THEN
    ALTER TABLE public.donation_info ADD COLUMN contact_name TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'donation_info' AND column_name = 'contact_phone') THEN
    ALTER TABLE public.donation_info ADD COLUMN contact_phone TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'donation_info' AND column_name = 'contact_email') THEN
    ALTER TABLE public.donation_info ADD COLUMN contact_email TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'donation_info' AND column_name = 'is_active') THEN
    ALTER TABLE public.donation_info ADD COLUMN is_active BOOLEAN DEFAULT true;
  END IF;
END $$;

-- 4. Storage bucket for QR images (no-op if already exists)
-- Run this in Supabase Dashboard > Storage > New Bucket:
--   Name: donation-qr
--   Public: true
-- Then add RLS:
--   Anyone can read: FOR SELECT USING (true)
--   Admins can upload: FOR INSERT WITH CHECK (public.is_admin())
