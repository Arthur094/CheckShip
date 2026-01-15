-- =====================================================
-- POLÍTICAS RLS COMPLETAS PARA CHECKSHIP
-- Executar este script para liberar acesso do Admin a todas tabelas
-- =====================================================

-- ============= PROFILES =============
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Perfis visiveis para todos autenticados" ON public.profiles;
CREATE POLICY "Perfis visiveis para todos autenticados"
ON public.profiles FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Gestores tem controle total" ON public.profiles;
CREATE POLICY "Gestores tem controle total"
ON public.profiles FOR ALL
TO authenticated
USING ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'GESTOR' )
WITH CHECK ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'GESTOR' );

-- ============= VEHICLES =============
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Veiculos visiveis para autenticados" ON public.vehicles;
CREATE POLICY "Veiculos visiveis para autenticados"
ON public.vehicles FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Gestores controlam veiculos" ON public.vehicles;
CREATE POLICY "Gestores controlam veiculos"
ON public.vehicles FOR ALL
TO authenticated
USING ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'GESTOR' )
WITH CHECK ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'GESTOR' );

-- ============= VEHICLE_TYPES =============
ALTER TABLE public.vehicle_types ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Tipos de veiculo visiveis" ON public.vehicle_types;
CREATE POLICY "Tipos de veiculo visiveis"
ON public.vehicle_types FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Gestores controlam tipos" ON public.vehicle_types;
CREATE POLICY "Gestores controlam tipos"
ON public.vehicle_types FOR ALL
TO authenticated
USING ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'GESTOR' )
WITH CHECK ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'GESTOR' );

-- ============= CHECKLIST_TEMPLATES =============
ALTER TABLE public.checklist_templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Templates visiveis para autenticados" ON public.checklist_templates;
CREATE POLICY "Templates visiveis para autenticados"
ON public.checklist_templates FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Gestores controlam templates" ON public.checklist_templates;
CREATE POLICY "Gestores controlam templates"
ON public.checklist_templates FOR ALL
TO authenticated
USING ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'GESTOR' )
WITH CHECK ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'GESTOR' );

-- ============= VEHICLE_ASSIGNMENTS =============
ALTER TABLE public.vehicle_assignments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Atribuicoes visiveis" ON public.vehicle_assignments;
CREATE POLICY "Atribuicoes visiveis"
ON public.vehicle_assignments FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Gestores controlam atribuicoes" ON public.vehicle_assignments;
CREATE POLICY "Gestores controlam atribuicoes"
ON public.vehicle_assignments FOR ALL
TO authenticated
USING ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'GESTOR' )
WITH CHECK ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'GESTOR' );

-- ============= VEHICLE_CHECKLIST_ASSIGNMENTS =============
ALTER TABLE public.vehicle_checklist_assignments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Checklist assignments visiveis" ON public.vehicle_checklist_assignments;
CREATE POLICY "Checklist assignments visiveis"
ON public.vehicle_checklist_assignments FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Gestores controlam checklist assignments" ON public.vehicle_checklist_assignments;
CREATE POLICY "Gestores controlam checklist assignments"
ON public.vehicle_checklist_assignments FOR ALL
TO authenticated
USING ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'GESTOR' )
WITH CHECK ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'GESTOR' );

-- ============= CHECKLIST_INSPECTIONS =============
ALTER TABLE public.checklist_inspections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Inspecoes visiveis para autenticados" ON public.checklist_inspections;
CREATE POLICY "Inspecoes visiveis para autenticados"
ON public.checklist_inspections FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Usuarios criam proprias inspecoes" ON public.checklist_inspections;
CREATE POLICY "Usuarios criam proprias inspecoes"
ON public.checklist_inspections FOR INSERT
TO authenticated
WITH CHECK (inspector_id = auth.uid());

DROP POLICY IF EXISTS "Usuarios atualizam proprias inspecoes" ON public.checklist_inspections;
CREATE POLICY "Usuarios atualizam proprias inspecoes"
ON public.checklist_inspections FOR UPDATE
TO authenticated
USING (inspector_id = auth.uid())
WITH CHECK (inspector_id = auth.uid());

DROP POLICY IF EXISTS "Gestores controlam todas inspecoes" ON public.checklist_inspections;
CREATE POLICY "Gestores controlam todas inspecoes"
ON public.checklist_inspections FOR ALL
TO authenticated
USING ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'GESTOR' )
WITH CHECK ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'GESTOR' );
