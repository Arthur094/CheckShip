
-- =====================================================
-- SCRIPT DE SINCRONIZAÇÃO DE RLS (SEGURANÇA)
-- Execute este script no SQL Editor do Supabase STAGING
-- =====================================================

-- 1. Habilitar RLS em todas as tabelas (Segurança por Padrão)
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.vehicle_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.checklist_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.vehicle_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.vehicle_checklist_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.checklist_inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.access_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.checklist_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.inspection_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.profile_checklist_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.companies ENABLE ROW LEVEL SECURITY;


-- 2. Recriar Função Auxiliar
CREATE OR REPLACE FUNCTION public.get_user_company_id()
RETURNS UUID AS $$
BEGIN
  RETURN (SELECT company_id FROM public.profiles WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;


-- 3. Limpar Policies Antigas e Recriar (Garante Paridade)

-- PROFILES
DROP POLICY IF EXISTS "Profiles da mesma empresa" ON public.profiles;
DROP POLICY IF EXISTS "Usuario atualiza proprio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Gestores gerenciam profiles da empresa" ON public.profiles;

CREATE POLICY "Profiles da mesma empresa" ON public.profiles FOR SELECT TO authenticated
USING (company_id = public.get_user_company_id() OR id = auth.uid());

CREATE POLICY "Usuario atualiza proprio perfil" ON public.profiles FOR UPDATE TO authenticated
USING (id = auth.uid()) WITH CHECK (id = auth.uid());

CREATE POLICY "Gestores gerenciam profiles da empresa" ON public.profiles FOR ALL TO authenticated
USING (company_id = public.get_user_company_id() AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'GESTOR')
WITH CHECK (company_id = public.get_user_company_id() AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'GESTOR');


-- VEHICLES
DROP POLICY IF EXISTS "Veiculos da mesma empresa" ON public.vehicles;
DROP POLICY IF EXISTS "Gestores gerenciam veiculos da empresa" ON public.vehicles;

CREATE POLICY "Veiculos da mesma empresa" ON public.vehicles FOR SELECT TO authenticated
USING (company_id = public.get_user_company_id());

CREATE POLICY "Gestores gerenciam veiculos da empresa" ON public.vehicles FOR ALL TO authenticated
USING (company_id = public.get_user_company_id() AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'GESTOR')
WITH CHECK (company_id = public.get_user_company_id() AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'GESTOR');


-- CHECKLIST_INSPECTIONS
DROP POLICY IF EXISTS "Inspecoes da mesma empresa" ON public.checklist_inspections;
DROP POLICY IF EXISTS "Usuarios criam inspecoes na empresa" ON public.checklist_inspections;
DROP POLICY IF EXISTS "Usuarios atualizam proprias inspecoes" ON public.checklist_inspections;
DROP POLICY IF EXISTS "Gestores gerenciam inspecoes da empresa" ON public.checklist_inspections;

CREATE POLICY "Inspecoes da mesma empresa" ON public.checklist_inspections FOR SELECT TO authenticated
USING (company_id = public.get_user_company_id());

CREATE POLICY "Usuarios criam inspecoes na empresa" ON public.checklist_inspections FOR INSERT TO authenticated
WITH CHECK (company_id = public.get_user_company_id() AND inspector_id = auth.uid());

CREATE POLICY "Usuarios atualizam proprias inspecoes" ON public.checklist_inspections FOR UPDATE TO authenticated
USING (inspector_id = auth.uid() AND company_id = public.get_user_company_id())
WITH CHECK (inspector_id = auth.uid() AND company_id = public.get_user_company_id());

CREATE POLICY "Gestores gerenciam inspecoes da empresa" ON public.checklist_inspections FOR ALL TO authenticated
USING (company_id = public.get_user_company_id() AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'GESTOR')
WITH CHECK (company_id = public.get_user_company_id() AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'GESTOR');


-- COMPANIES
DROP POLICY IF EXISTS "Companies visiveis para autenticados" ON public.companies;
DROP POLICY IF EXISTS "Apenas admins gerenciam companies" ON public.companies;

CREATE POLICY "Companies visiveis para autenticados" ON public.companies FOR SELECT TO authenticated USING (true);
-- (Política de Admin omitida por segurança/simplicidade neste momento, focando no app funcional)

