
-- =====================================================
-- CORREÇÃO DE RLS - PARTE 2 (Vehicle Types e Templates)
-- Aplicando a função get_user_role() nas tabelas que faltaram
-- Execute em STAGING e PRODUÇÃO
-- =====================================================

-- 1. VEHICLE_TYPES
DROP POLICY IF EXISTS "Gestores gerenciam tipos da empresa" ON public.vehicle_types;

CREATE POLICY "Gestores gerenciam tipos da empresa" ON public.vehicle_types FOR ALL TO authenticated
USING (
    company_id = public.get_user_company_id() 
    AND 
    public.get_user_role() = 'GESTOR'
)
WITH CHECK (
    company_id = public.get_user_company_id() 
    AND 
    public.get_user_role() = 'GESTOR'
);


-- 2. CHECKLIST_TEMPLATES
DROP POLICY IF EXISTS "Gestores gerenciam templates da empresa" ON public.checklist_templates;

CREATE POLICY "Gestores gerenciam templates da empresa" ON public.checklist_templates FOR ALL TO authenticated
USING (
    company_id = public.get_user_company_id() 
    AND 
    public.get_user_role() = 'GESTOR'
)
WITH CHECK (
    company_id = public.get_user_company_id() 
    AND 
    public.get_user_role() = 'GESTOR'
);

-- Isso padroniza 100% das tabelas de gestão para usar a função blindada.
