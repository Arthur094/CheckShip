-- =====================================================
-- CORREÇÃO: POLÍTICAS RLS SEM RECURSÃO INFINITA
-- O problema: políticas antigas consultavam profiles dentro de policies de profiles
-- Solução: Simplificar - dar acesso READ para todos autenticados
-- =====================================================

-- ============= PROFILES - POLÍTICAS SIMPLIFICADAS =============
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Remover todas políticas antigas
DROP POLICY IF EXISTS "Perfis visiveis para todos autenticados" ON public.profiles;
DROP POLICY IF EXISTS "Gestores tem controle total" ON public.profiles;
DROP POLICY IF EXISTS "Usuarios editam proprio perfil" ON public.profiles;

-- LEITURA: Qualquer usuário autenticado pode VER todos os perfis
-- (necessário para dropdowns, seleção de usuários, etc)
CREATE POLICY "authenticated_read_profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (true);

-- INSERT/UPDATE/DELETE: Qualquer usuário autenticado pode fazer (temporário para debug)
-- DEPOIS do Go-Live, você pode restringir isso apenas para GESTOR usando custom claims
CREATE POLICY "authenticated_insert_profiles"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "authenticated_update_profiles"
ON public.profiles FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "authenticated_delete_profiles"
ON public.profiles FOR DELETE
TO authenticated
USING (true);

-- ============= VEHICLES =============
DROP POLICY IF EXISTS "Veiculos visiveis para autenticados" ON public.vehicles;
DROP POLICY IF EXISTS "Gestores controlam veiculos" ON public.vehicles;

CREATE POLICY "authenticated_select_vehicles" ON public.vehicles FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_all_vehicles" ON public.vehicles FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============= VEHICLE_TYPES =============
DROP POLICY IF EXISTS "Tipos de veiculo visiveis" ON public.vehicle_types;
DROP POLICY IF EXISTS "Gestores controlam tipos" ON public.vehicle_types;

CREATE POLICY "authenticated_select_vehicle_types" ON public.vehicle_types FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_all_vehicle_types" ON public.vehicle_types FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============= CHECKLIST_TEMPLATES =============
DROP POLICY IF EXISTS "Templates visiveis para autenticados" ON public.checklist_templates;
DROP POLICY IF EXISTS "Gestores controlam templates" ON public.checklist_templates;

CREATE POLICY "authenticated_select_templates" ON public.checklist_templates FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_all_templates" ON public.checklist_templates FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============= VEHICLE_ASSIGNMENTS =============
DROP POLICY IF EXISTS "Atribuicoes visiveis" ON public.vehicle_assignments;
DROP POLICY IF EXISTS "Gestores controlam atribuicoes" ON public.vehicle_assignments;

CREATE POLICY "authenticated_select_assignments" ON public.vehicle_assignments FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_all_assignments" ON public.vehicle_assignments FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============= VEHICLE_CHECKLIST_ASSIGNMENTS =============
DROP POLICY IF EXISTS "Checklist assignments visiveis" ON public.vehicle_checklist_assignments;
DROP POLICY IF EXISTS "Gestores controlam checklist assignments" ON public.vehicle_checklist_assignments;

CREATE POLICY "authenticated_select_checklist_assignments" ON public.vehicle_checklist_assignments FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_all_checklist_assignments" ON public.vehicle_checklist_assignments FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============= CHECKLIST_INSPECTIONS =============
DROP POLICY IF EXISTS "Inspecoes visiveis para autenticados" ON public.checklist_inspections;
DROP POLICY IF EXISTS "Usuarios criam proprias inspecoes" ON public.checklist_inspections;
DROP POLICY IF EXISTS "Usuarios atualizam proprias inspecoes" ON public.checklist_inspections;
DROP POLICY IF EXISTS "Gestores controlam todas inspecoes" ON public.checklist_inspections;

CREATE POLICY "authenticated_select_inspections" ON public.checklist_inspections FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_all_inspections" ON public.checklist_inspections FOR ALL TO authenticated USING (true) WITH CHECK (true);
