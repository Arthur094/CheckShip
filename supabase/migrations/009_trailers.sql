
-- Create trailers table
CREATE TABLE IF NOT EXISTS public.trailers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plate TEXT NOT NULL,
    active BOOLEAN DEFAULT true,
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    
    -- Documents (CIV, CIPP, CVT, CRLV)
    civ_date DATE,
    civ_expiry DATE,
    civ_file_url TEXT,
    
    cipp_date DATE,
    cipp_expiry DATE,
    cipp_file_url TEXT,
    
    cvt_date DATE,
    cvt_expiry DATE,
    cvt_file_url TEXT,
    
    crlv_date DATE,
    crlv_expiry DATE,
    crlv_file_url TEXT,
    
    created_at TIMESTAMPTZ DEFAULT now(),
    
    -- Ensure plate is unique within the system (or company context)
    CONSTRAINT trailers_plate_unique UNIQUE (plate)
);

-- Add trailer_id to vehicles
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'vehicles' AND COLUMN_NAME = 'trailer_id') THEN
        ALTER TABLE public.vehicles ADD COLUMN trailer_id UUID REFERENCES public.trailers(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Enable RLS
ALTER TABLE public.trailers ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Authenticated users can select trailers"
ON public.trailers FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert trailers"
ON public.trailers FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update trailers"
ON public.trailers FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete trailers"
ON public.trailers FOR DELETE
TO authenticated
USING (true);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_vehicles_trailer_id ON public.vehicles(trailer_id);
CREATE INDEX IF NOT EXISTS idx_trailers_company_id ON public.trailers(company_id);

-- Storage Setup (Trailer Documents)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('trailer-documents', 'trailer-documents', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies
CREATE POLICY "Public Access for Trailer Documents"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'trailer-documents');

CREATE POLICY "Authenticated users can upload Trailer Documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'trailer-documents');

CREATE POLICY "Authenticated users can update/delete Trailer Documents"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'trailer-documents');

CREATE POLICY "Authenticated users can delete Trailer Documents"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'trailer-documents');
