
-- 1. Create management_documents table
CREATE TABLE IF NOT EXISTS public.management_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE,
    trailer_id UUID REFERENCES public.trailers(id) ON DELETE CASCADE,
    
    document_type TEXT NOT NULL, -- CNH, CIV, CRLV, NR_20, NR_35, MOPP, ASO, CCT, CIPP, CVT, AET_FEDERAL, AET_ESTADUAL
    issue_date DATE,
    expiry_date DATE NOT NULL,
    file_url TEXT,
    status TEXT NOT NULL DEFAULT 'VIGENTE', -- VIGENTE, ALERTA, VENCIDO, EM_RENOVACAO
    
    renewal_anticipation_days INTEGER DEFAULT 30,
    observation TEXT,
    
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    
    -- Constraint to ensure the document is linked to exactly one entity
    CONSTRAINT either_entity CHECK (
        (profile_id IS NOT NULL AND vehicle_id IS NULL AND trailer_id IS NULL) OR
        (profile_id IS NULL AND vehicle_id IS NOT NULL AND trailer_id IS NULL) OR
        (profile_id IS NULL AND vehicle_id IS NULL AND trailer_id IS NOT NULL)
    )
);

-- 2. Create checklist_denied_attempts table
CREATE TABLE IF NOT EXISTS public.checklist_denied_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE SET NULL,
    trailer_id UUID REFERENCES public.trailers(id) ON DELETE SET NULL,
    
    denial_reasons JSONB NOT NULL, -- e.g. [{"doc": "CNH", "expiry": "2026-01-01"}]
    
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Storage Setup
INSERT INTO storage.buckets (id, name, public) 
VALUES ('management-documents', 'management-documents', true)
ON CONFLICT (id) DO NOTHING;

-- 4. Enable RLS
ALTER TABLE public.management_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklist_denied_attempts ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for management_documents
CREATE POLICY "Enable all access for authenticated users on management_documents"
ON public.management_documents FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 6. RLS Policies for checklist_denied_attempts
CREATE POLICY "Enable all access for authenticated users on checklist_denied_attempts"
ON public.checklist_denied_attempts FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 7. Storage Policies
CREATE POLICY "Public Read Access for Management Documents"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'management-documents');

CREATE POLICY "Authenticated users can upload Management Documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'management-documents');

CREATE POLICY "Authenticated users can update/delete Management Documents"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'management-documents');

CREATE POLICY "Authenticated users can delete Management Documents"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'management-documents');

-- 8. Indexes
CREATE INDEX IF NOT EXISTS idx_management_documents_profile_id ON public.management_documents(profile_id);
CREATE INDEX IF NOT EXISTS idx_management_documents_vehicle_id ON public.management_documents(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_management_documents_trailer_id ON public.management_documents(trailer_id);
CREATE INDEX IF NOT EXISTS idx_management_documents_expiry_date ON public.management_documents(expiry_date);
CREATE INDEX IF NOT EXISTS idx_checklist_denied_attempts_created_at ON public.checklist_denied_attempts(created_at);
