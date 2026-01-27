
-- =====================================================
-- FIX FATAL: CRIAR TABELA DESAPARECIDA (V2 - TEXT ID FIX)
-- Erro Anterior: Type Mismatch (UUID vs TEXT) no checklist_template_id
-- =====================================================

-- 1. CRIAR A TABELA (Com tipos compatíveis)
CREATE TABLE IF NOT EXISTS public.vehicle_type_checklist_assignments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Vehicle Type é UUID
    vehicle_type_id UUID NOT NULL REFERENCES public.vehicle_types(id) ON DELETE CASCADE,
    
    -- Checklist Template é TEXT (Conforme erro 42804)
    checklist_template_id TEXT NOT NULL REFERENCES public.checklist_templates(id) ON DELETE CASCADE,
    
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,

    -- Garantir unicidade
    UNIQUE(vehicle_type_id, checklist_template_id)
);

-- Index para performance
CREATE INDEX IF NOT EXISTS idx_vtca_vehicle_type ON public.vehicle_type_checklist_assignments(vehicle_type_id);
CREATE INDEX IF NOT EXISTS idx_vtca_template ON public.vehicle_type_checklist_assignments(checklist_template_id);
CREATE INDEX IF NOT EXISTS idx_vtca_company ON public.vehicle_type_checklist_assignments(company_id);


-- 2. CONFIGURAR SEGURANÇA (RLS)
ALTER TABLE public.vehicle_type_checklist_assignments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Junction Read" ON public.vehicle_type_checklist_assignments;
DROP POLICY IF EXISTS "Junction Write" ON public.vehicle_type_checklist_assignments;

-- Policy de Leitura
CREATE POLICY "Junction Read" ON public.vehicle_type_checklist_assignments FOR SELECT TO authenticated
USING (
    company_id = public.get_user_company_id()
);

-- Policy de Escrita
CREATE POLICY "Junction Write" ON public.vehicle_type_checklist_assignments FOR ALL TO authenticated
USING (company_id = public.get_user_company_id())
WITH CHECK (company_id = public.get_user_company_id());


-- 3. TRIGGER AUTO-COMPANY
DROP TRIGGER IF EXISTS trg_set_company_junction ON public.vehicle_type_checklist_assignments;

CREATE TRIGGER trg_set_company_junction
BEFORE INSERT ON public.vehicle_type_checklist_assignments
FOR EACH ROW
EXECUTE FUNCTION public.set_auto_company_id();


DO $$
BEGIN
  RAISE NOTICE '✅ Tabela Recriada (Com ID TEXT): vehicle_type_checklist_assignments';
  RAISE NOTICE '✅ RLS e Triggers configurados.';
END $$;
