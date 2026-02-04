-- Add additional trailer identification fields
ALTER TABLE public.trailers 
ADD COLUMN IF NOT EXISTS chassi TEXT,
ADD COLUMN IF NOT EXISTS renavam TEXT;

-- Add comments for documentation
COMMENT ON COLUMN public.trailers.chassi IS 'Chassis number of the trailer';
COMMENT ON COLUMN public.trailers.renavam IS 'RENAVAM registration number';
