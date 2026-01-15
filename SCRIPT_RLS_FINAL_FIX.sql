-- =====================================================
-- RESET RLS - ULTRA SIMPLES
-- Remove TODAS políticas manualmente, uma por uma
-- =====================================================

-- DESABILITAR RLS TEMPORARIAMENTE
ALTER TABLE IF EXISTS public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.vehicles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.vehicle_types DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.checklist_templates DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.vehicle_assignments DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.vehicle_checklist_assignments DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.checklist_inspections DISABLE ROW LEVEL SECURITY;

-- REMOVER POLÍTICAS ANTIGAS (TODAS AS VARIAÇÕES POSSÍVEIS)
-- Profiles
DROP POLICY IF EXISTS "Perfis visiveis para todos autenticados" ON public.profiles;
DROP POLICY IF EXISTS "Gestores tem controle total" ON public.profiles;
DROP POLICY IF EXISTS "Usuarios editam proprio perfil" ON public.profiles;
DROP POLICY IF EXISTS "authenticated_read_profiles" ON public.profiles;
DROP POLICY IF EXISTS "authenticated_insert_profiles" ON public.profiles;
DROP POLICY IF EXISTS "authenticated_update_profiles" ON public.profiles;
DROP POLICY IF EXISTS "authenticated_delete_profiles" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete" ON public.profiles;

-- Vehicles
DROP POLICY IF EXISTS "Veiculos visiveis para autenticados" ON public.vehicles;
DROP POLICY IF EXISTS "Gestores controlam veiculos" ON public.vehicles;
DROP POLICY IF EXISTS "authenticated_select_vehicles" ON public.vehicles;
DROP POLICY IF EXISTS "authenticated_all_vehicles" ON public.vehicles;
DROP POLICY IF EXISTS "vehicles_select" ON public.vehicles;
DROP POLICY IF EXISTS "vehicles_all" ON public.vehicles;

-- Vehicle Types
DROP POLICY IF EXISTS "Tipos de veiculo visiveis" ON public.vehicle_types;
DROP POLICY IF EXISTS "Gestores controlam tipos" ON public.vehicle_types;
DROP POLICY IF EXISTS "authenticated_select_vehicle_types" ON public.vehicle_types;
DROP POLICY IF EXISTS "authenticated_all_vehicle_types" ON public.vehicle_types;
DROP POLICY IF EXISTS "vehicle_types_select" ON public.vehicle_types;
DROP POLICY IF EXISTS "vehicle_types_all" ON public.vehicle_types;

-- Templates
DROP POLICY IF EXISTS "Templates visiveis para autenticados" ON public.checklist_templates;
DROP POLICY IF EXISTS "Gestores controlam templates" ON public.checklist_templates;
DROP POLICY IF EXISTS "authenticated_select_templates" ON public.checklist_templates;
DROP POLICY IF EXISTS "authenticated_all_templates" ON public.checklist_templates;
DROP POLICY IF EXISTS "templates_select" ON public.checklist_templates;
DROP POLICY IF EXISTS "templates_all" ON public.checklist_templates;

-- Vehicle Assignments
DROP POLICY IF EXISTS "Atribuicoes visiveis" ON public.vehicle_assignments;
DROP POLICY IF EXISTS "Gestores controlam atribuicoes" ON public.vehicle_assignments;
DROP POLICY IF EXISTS "authenticated_select_assignments" ON public.vehicle_assignments;
DROP POLICY IF EXISTS "authenticated_all_assignments" ON public.vehicle_assignments;
DROP POLICY IF EXISTS "assignments_select" ON public.vehicle_assignments;
DROP POLICY IF EXISTS "assignments_all" ON public.vehicle_assignments;

-- Checklist Assignments
DROP POLICY IF EXISTS "Checklist assignments visiveis" ON public.vehicle_checklist_assignments;
DROP POLICY IF EXISTS "Gestores controlam checklist assignments" ON public.vehicle_checklist_assignments;
DROP POLICY IF EXISTS "authenticated_select_checklist_assignments" ON public.vehicle_checklist_assignments;
DROP POLICY IF EXISTS "authenticated_all_checklist_assignments" ON public.vehicle_checklist_assignments;
DROP POLICY IF EXISTS "checklist_assign_select" ON public.vehicle_checklist_assignments;
DROP POLICY IF EXISTS "checklist_assign_all" ON public.vehicle_checklist_assignments;

-- Inspections
DROP POLICY IF EXISTS "Inspecoes visiveis para autenticados" ON public.checklist_inspections;
DROP POLICY IF EXISTS "Usuarios criam proprias inspecoes" ON public.checklist_inspections;
DROP POLICY IF EXISTS "Usuarios atualizam proprias inspecoes" ON public.checklist_inspections;
DROP POLICY IF EXISTS "Gestores controlam todas inspecoes" ON public.checklist_inspections;
DROP POLICY IF EXISTS "authenticated_select_inspections" ON public.checklist_inspections;
DROP POLICY IF EXISTS "authenticated_all_inspections" ON public.checklist_inspections;
DROP POLICY IF EXISTS "inspections_select" ON public.checklist_inspections;
DROP POLICY IF EXISTS "inspections_all" ON public.checklist_inspections;

-- REABILITAR RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklist_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_checklist_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklist_inspections ENABLE ROW LEVEL SECURITY;

-- CRIAR POLÍTICAS NOVAS E SIMPLES
CREATE POLICY "allow_all_profiles" ON public.profiles FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_vehicles" ON public.vehicles FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_vehicle_types" ON public.vehicle_types FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_templates" ON public.checklist_templates FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_assignments" ON public.vehicle_assignments FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_checklist_assignments" ON public.vehicle_checklist_assignments FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_inspections" ON public.checklist_inspections FOR ALL TO authenticated USING (true) WITH CHECK (true);
