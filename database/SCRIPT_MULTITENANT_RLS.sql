-- =====================================================
-- SCRIPT MULTI-TENANT - RLS POLICIES
-- Execute APÓS o SCRIPT_MULTITENANT_STRUCTURE.sql
-- =====================================================

-- =====================================================
-- FUNÇÃO AUXILIAR: Buscar company_id do usuário atual
-- =====================================================
CREATE OR REPLACE FUNCTION public.get_user_company_id()
RETURNS UUID AS $$
BEGIN
  RETURN (SELECT company_id FROM public.profiles WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- =====================================================
-- PROFILES - RLS com company_id
-- =====================================================
DROP POLICY IF EXISTS "Gestores tem controle total" ON public.profiles;
DROP POLICY IF EXISTS "Usuarios visualizam todos" ON public.profiles;
DROP POLICY IF EXISTS "Usuarios atualizam proprio perfil" ON public.profiles;

-- Usuários veem apenas profiles da sua empresa
CREATE POLICY "Profiles da mesma empresa"
ON public.profiles FOR SELECT
TO authenticated
USING (company_id = public.get_user_company_id() OR id = auth.uid());

-- Usuários atualizam próprio perfil
CREATE POLICY "Usuario atualiza proprio perfil"
ON public.profiles FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Gestores gerenciam profiles da empresa
CREATE POLICY "Gestores gerenciam profiles da empresa"
ON public.profiles FOR ALL
TO authenticated
USING (
  company_id = public.get_user_company_id()
  AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'GESTOR'
)
WITH CHECK (
  company_id = public.get_user_company_id()
  AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'GESTOR'
);

-- =====================================================
-- VEHICLES - RLS com company_id
-- =====================================================
DROP POLICY IF EXISTS "Veiculos visiveis para autenticados" ON public.vehicles;
DROP POLICY IF EXISTS "Gestores controlam veiculos" ON public.vehicles;

CREATE POLICY "Veiculos da mesma empresa"
ON public.vehicles FOR SELECT
TO authenticated
USING (company_id = public.get_user_company_id());

CREATE POLICY "Gestores gerenciam veiculos da empresa"
ON public.vehicles FOR ALL
TO authenticated
USING (
  company_id = public.get_user_company_id()
  AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'GESTOR'
)
WITH CHECK (
  company_id = public.get_user_company_id()
  AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'GESTOR'
);

-- =====================================================
-- VEHICLE_TYPES - RLS com company_id
-- =====================================================
DROP POLICY IF EXISTS "Tipos visiveis para autenticados" ON public.vehicle_types;
DROP POLICY IF EXISTS "Gestores controlam tipos" ON public.vehicle_types;

CREATE POLICY "Tipos da mesma empresa"
ON public.vehicle_types FOR SELECT
TO authenticated
USING (company_id = public.get_user_company_id());

CREATE POLICY "Gestores gerenciam tipos da empresa"
ON public.vehicle_types FOR ALL
TO authenticated
USING (
  company_id = public.get_user_company_id()
  AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'GESTOR'
)
WITH CHECK (
  company_id = public.get_user_company_id()
  AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'GESTOR'
);

-- =====================================================
-- CHECKLIST_TEMPLATES - RLS com company_id
-- =====================================================
DROP POLICY IF EXISTS "Templates visiveis para autenticados" ON public.checklist_templates;
DROP POLICY IF EXISTS "Gestores controlam templates" ON public.checklist_templates;

CREATE POLICY "Templates da mesma empresa"
ON public.checklist_templates FOR SELECT
TO authenticated
USING (company_id = public.get_user_company_id());

CREATE POLICY "Gestores gerenciam templates da empresa"
ON public.checklist_templates FOR ALL
TO authenticated
USING (
  company_id = public.get_user_company_id()
  AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'GESTOR'
)
WITH CHECK (
  company_id = public.get_user_company_id()
  AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'GESTOR'
);

-- =====================================================
-- VEHICLE_ASSIGNMENTS - RLS com company_id
-- =====================================================
DROP POLICY IF EXISTS "Assignments visiveis para autenticados" ON public.vehicle_assignments;
DROP POLICY IF EXISTS "Gestores controlam assignments" ON public.vehicle_assignments;

CREATE POLICY "Assignments da mesma empresa"
ON public.vehicle_assignments FOR SELECT
TO authenticated
USING (company_id = public.get_user_company_id());

CREATE POLICY "Gestores gerenciam assignments da empresa"
ON public.vehicle_assignments FOR ALL
TO authenticated
USING (
  company_id = public.get_user_company_id()
  AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'GESTOR'
)
WITH CHECK (
  company_id = public.get_user_company_id()
  AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'GESTOR'
);

-- =====================================================
-- VEHICLE_CHECKLIST_ASSIGNMENTS - RLS com company_id
-- =====================================================
DROP POLICY IF EXISTS "Checklist assignments visiveis" ON public.vehicle_checklist_assignments;
DROP POLICY IF EXISTS "Gestores controlam checklist assignments" ON public.vehicle_checklist_assignments;

CREATE POLICY "Checklist assignments da mesma empresa"
ON public.vehicle_checklist_assignments FOR SELECT
TO authenticated
USING (company_id = public.get_user_company_id());

CREATE POLICY "Gestores gerenciam checklist assignments"
ON public.vehicle_checklist_assignments FOR ALL
TO authenticated
USING (
  company_id = public.get_user_company_id()
  AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'GESTOR'
)
WITH CHECK (
  company_id = public.get_user_company_id()
  AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'GESTOR'
);

-- =====================================================
-- CHECKLIST_INSPECTIONS - RLS com company_id
-- =====================================================
DROP POLICY IF EXISTS "Inspecoes visiveis para autenticados" ON public.checklist_inspections;
DROP POLICY IF EXISTS "Usuarios criam proprias inspecoes" ON public.checklist_inspections;
DROP POLICY IF EXISTS "Usuarios atualizam proprias inspecoes" ON public.checklist_inspections;
DROP POLICY IF EXISTS "Gestores controlam inspecoes" ON public.checklist_inspections;

CREATE POLICY "Inspecoes da mesma empresa"
ON public.checklist_inspections FOR SELECT
TO authenticated
USING (company_id = public.get_user_company_id());

CREATE POLICY "Usuarios criam inspecoes na empresa"
ON public.checklist_inspections FOR INSERT
TO authenticated
WITH CHECK (
  company_id = public.get_user_company_id()
  AND inspector_id = auth.uid()
);

CREATE POLICY "Usuarios atualizam proprias inspecoes"
ON public.checklist_inspections FOR UPDATE
TO authenticated
USING (inspector_id = auth.uid() AND company_id = public.get_user_company_id())
WITH CHECK (inspector_id = auth.uid() AND company_id = public.get_user_company_id());

CREATE POLICY "Gestores gerenciam inspecoes da empresa"
ON public.checklist_inspections FOR ALL
TO authenticated
USING (
  company_id = public.get_user_company_id()
  AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'GESTOR'
)
WITH CHECK (
  company_id = public.get_user_company_id()
  AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'GESTOR'
);

-- =====================================================
-- ACCESS_PROFILES - RLS com company_id
-- =====================================================
DROP POLICY IF EXISTS "Access profiles visiveis" ON public.access_profiles;
DROP POLICY IF EXISTS "Gestores controlam access profiles" ON public.access_profiles;

CREATE POLICY "Access profiles da mesma empresa"
ON public.access_profiles FOR SELECT
TO authenticated
USING (company_id = public.get_user_company_id() OR company_id IS NULL);

CREATE POLICY "Gestores gerenciam access profiles"
ON public.access_profiles FOR ALL
TO authenticated
USING (
  company_id = public.get_user_company_id()
  AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'GESTOR'
)
WITH CHECK (
  company_id = public.get_user_company_id()
  AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'GESTOR'
);

-- =====================================================
-- CHECKLIST_RECORDS - RLS com company_id
-- =====================================================
DROP POLICY IF EXISTS "Records visiveis para autenticados" ON public.checklist_records;
DROP POLICY IF EXISTS "Usuarios criam proprios records" ON public.checklist_records;
DROP POLICY IF EXISTS "Gestores controlam records" ON public.checklist_records;

CREATE POLICY "Records da mesma empresa"
ON public.checklist_records FOR SELECT
TO authenticated
USING (company_id = public.get_user_company_id());

CREATE POLICY "Usuarios criam records na empresa"
ON public.checklist_records FOR INSERT
TO authenticated
WITH CHECK (company_id = public.get_user_company_id());

CREATE POLICY "Gestores gerenciam records"
ON public.checklist_records FOR ALL
TO authenticated
USING (
  company_id = public.get_user_company_id()
  AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'GESTOR'
)
WITH CHECK (
  company_id = public.get_user_company_id()
  AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'GESTOR'
);

-- =====================================================
-- INSPECTION_PHOTOS - RLS com company_id
-- =====================================================
DROP POLICY IF EXISTS "Photos visiveis para autenticados" ON public.inspection_photos;
DROP POLICY IF EXISTS "Usuarios criam proprias photos" ON public.inspection_photos;
DROP POLICY IF EXISTS "Gestores controlam photos" ON public.inspection_photos;

CREATE POLICY "Photos da mesma empresa"
ON public.inspection_photos FOR SELECT
TO authenticated
USING (company_id = public.get_user_company_id());

CREATE POLICY "Usuarios criam photos na empresa"
ON public.inspection_photos FOR INSERT
TO authenticated
WITH CHECK (company_id = public.get_user_company_id());

CREATE POLICY "Gestores gerenciam photos"
ON public.inspection_photos FOR ALL
TO authenticated
USING (
  company_id = public.get_user_company_id()
  AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'GESTOR'
)
WITH CHECK (
  company_id = public.get_user_company_id()
  AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'GESTOR'
);

-- =====================================================
-- FIM DO SCRIPT MULTI-TENANT - RLS POLICIES
-- =====================================================
