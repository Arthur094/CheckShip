-- Add trailer_type column to trailers table
-- Values: 'CARRETA' (default) or 'DOLLY'
-- This determines which documents are required

ALTER TABLE public.trailers 
ADD COLUMN IF NOT EXISTS trailer_type TEXT DEFAULT 'CARRETA';

-- Add comment for documentation
COMMENT ON COLUMN public.trailers.trailer_type IS 'Type of trailer: CARRETA or DOLLY. Determines required documents.';
