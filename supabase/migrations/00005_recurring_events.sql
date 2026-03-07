-- ============================================================
-- Recurring Events — add recurrence fields to events table
-- ============================================================

-- Add recurrence columns
ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS recurrence_type TEXT NOT NULL DEFAULT 'none'
    CHECK (recurrence_type IN ('none', 'weekly', 'monthly')),
  ADD COLUMN IF NOT EXISTS recurrence_byweekday INT[],
  ADD COLUMN IF NOT EXISTS recurrence_until DATE;

-- Index for querying recurring events
CREATE INDEX IF NOT EXISTS idx_events_recurrence
  ON public.events (recurrence_type) WHERE recurrence_type != 'none';
