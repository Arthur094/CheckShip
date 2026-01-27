
-- =====================================================
-- CORREÇÃO DE RECURSÃO INFINITA (RLS FIX)
-- Execute em STAGING e PRODUÇÃO
-- =====================================================

-- 1. Criar helper function para ler Role sem disparar RLS (Security Definer)
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text AS $$
BEGIN
  RETURN (SELECT role FROM public.profiles WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 2. Corrigir Policy de Profiles para usar a função e evitar Loop
DROP POLICY IF EXISTS "Gestores gerenciam profiles da empresa" ON public.profiles;

CREATE POLICY "Gestores gerenciam profiles da empresa" ON public.profiles FOR ALL TO authenticated
USING (
    company_id = public.get_user_company_id() 
    AND 
    public.get_user_role() = 'GESTOR' -- Usa a função blindada
)
WITH CHECK (
    company_id = public.get_user_company_id() 
    AND 
    public.get_user_role() = 'GESTOR'
);

-- 3. (Opcional mas Recomendado) Otimizar as outras tabelas para usar a função também
-- Isso evita subqueries repetitivas, embora não causem loop se a profile estiver corrigida.

-- VEHICLES
DROP POLICY IF EXISTS "Gestores gerenciam veiculos da empresa" ON public.vehicles;
CREATE POLICY "Gestores gerenciam veiculos da empresa" ON public.vehicles FOR ALL TO authenticated
USING (company_id = public.get_user_company_id() AND public.get_user_role() = 'GESTOR')
WITH CHECK (company_id = public.get_user_company_id() AND public.get_user_role() = 'GESTOR');

-- CHECKLIST_INSPECTIONS
DROP POLICY IF EXISTS "Gestores gerenciam inspecoes da empresa" ON public.checklist_inspections;
CREATE POLICY "Gestores gerenciam inspecoes da empresa" ON public.checklist_inspections FOR ALL TO authenticated
USING (company_id = public.get_user_company_id() AND public.get_user_role() = 'GESTOR')
WITH CHECK (company_id = public.get_user_company_id() AND public.get_user_role() = 'GESTOR');

-- VEHICLE_ASSIGNMENTS
DROP POLICY IF EXISTS "Gestores gerenciam assignments da empresa" ON public.vehicle_assignments;
CREATE POLICY "Gestores gerenciam assignments da empresa" ON public.vehicle_assignments FOR ALL TO authenticated
USING (company_id = public.get_user_company_id() AND public.get_user_role() = 'GESTOR')
WITH CHECK (company_id = public.get_user_company_id() AND public.get_user_role() = 'GESTOR');

-- COMPANIES
DROP POLICY IF EXISTS "Gestores editam sua empresa" ON public.companies;
CREATE POLICY "Gestores editam sua empresa" ON public.companies FOR UPDATE TO authenticated
USING (id = public.get_user_company_id() AND public.get_user_role() = 'GESTOR')
WITH CHECK (id = public.get_user_company_id() AND public.get_user_role() = 'GESTOR');
