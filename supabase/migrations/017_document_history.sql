
-- 1. Create management_document_history table
CREATE TABLE IF NOT EXISTS public.management_document_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES public.management_documents(id) ON DELETE CASCADE,
    
    issue_date DATE,
    expiry_date DATE,
    file_url TEXT,
    status TEXT, -- VIGENTE, ALERTA, VENCIDO, EM_RENOVACAO
    observation TEXT,
    
    changed_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Enable RLS
ALTER TABLE public.management_document_history ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies
CREATE POLICY "Enable all access for authenticated users on management_document_history"
ON public.management_document_history FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 4. Indexes
CREATE INDEX IF NOT EXISTS idx_doc_history_document_id ON public.management_document_history(document_id);
CREATE INDEX IF NOT EXISTS idx_doc_history_created_at ON public.management_document_history(created_at);
