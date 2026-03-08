-- Add UNIQUE constraint to mosque_id in donation_info
-- This is required for upsert operations to work correctly.

ALTER TABLE public.donation_info ADD CONSTRAINT donation_info_mosque_id_key UNIQUE (mosque_id);
