-- Remove duplicates, keeping only the most recently updated row for each mosque_id
DELETE FROM public.donation_info
WHERE id NOT IN (
    SELECT DISTINCT ON (mosque_id) id
    FROM public.donation_info
    ORDER BY mosque_id, updated_at DESC
);

-- Add UNIQUE constraint to mosque_id in donation_info
-- This is required for upsert operations to work correctly
ALTER TABLE public.donation_info ADD CONSTRAINT donation_info_mosque_id_key UNIQUE (mosque_id);
