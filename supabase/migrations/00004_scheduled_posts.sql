-- ============================================================
-- Scheduled Posts — lazy publish for announcements
-- Adds status, publish_at, expires_at columns.
-- ============================================================

-- Add new columns
ALTER TABLE public.announcements
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'published'
    CHECK (status IN ('draft', 'scheduled', 'published', 'archived')),
  ADD COLUMN IF NOT EXISTS publish_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;

-- Index for efficient filtering
CREATE INDEX IF NOT EXISTS idx_announcements_status
  ON public.announcements (status, publish_at, expires_at);

-- Backfill: set existing published announcements
UPDATE public.announcements SET status = 'published' WHERE is_published = true AND status IS DISTINCT FROM 'published';
UPDATE public.announcements SET status = 'draft' WHERE is_published = false AND status IS DISTINCT FROM 'draft';
