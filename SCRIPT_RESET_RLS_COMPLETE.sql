-- =====================================================
-- RESET COMPLETO DE RLS - REMOVE TODAS POLÍTICAS
-- Execute este script para limpar TUDO e começar do zero
-- =====================================================

-- PASSO 1: DESABILITAR RLS TEMPORARIAMENTE (limpa cache)
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_types DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklist_templates DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_assignments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_checklist_assignments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklist_inspections DISABLE ROW LEVEL SECURITY;

-- PASSO 2: REMOVER TODAS AS POLÍTICAS (forçar remoção)
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT schemaname, tablename, policyname 
              FROM pg_policies 
              WHERE schemaname = 'public') LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I CASCADE', 
                      r.policyname, r.schemaname, r.tablename);
    END LOOP;
END $$;

-- PASSO 3: REABILITAR RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklist_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_checklist_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklist_inspections ENABLE ROW LEVEL SECURITY;

-- PASSO 4: CRIAR POLÍTICAS SIMPLES (SEM RECURSÃO)

-- PROFILES
CREATE POLICY "profiles_select" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "profiles_insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "profiles_update" ON public.profiles FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "profiles_delete" ON public.profiles FOR DELETE TO authenticated USING (true);

-- VEHICLES
CREATE POLICY "vehicles_select" ON public.vehicles FOR SELECT TO authenticated USING (true);
CREATE POLICY "vehicles_all" ON public.vehicles FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- VEHICLE_TYPES
CREATE POLICY "vehicle_types_select" ON public.vehicle_types FOR SELECT TO authenticated USING (true);
CREATE POLICY "vehicle_types_all" ON public.vehicle_types FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- CHECKLIST_TEMPLATES
CREATE POLICY "templates_select" ON public.checklist_templates FOR SELECT TO authenticated USING (true);
CREATE POLICY "templates_all" ON public.checklist_templates FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- VEHICLE_ASSIGNMENTS
CREATE POLICY "assignments_select" ON public.vehicle_assignments FOR SELECT TO authenticated USING (true);
CREATE POLICY "assignments_all" ON public.vehicle_assignments FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- VEHICLE_CHECKLIST_ASSIGNMENTS
CREATE POLICY "checklist_assign_select" ON public.vehicle_checklist_assignments FOR SELECT TO authenticated USING (true);
CREATE POLICY "checklist_assign_all" ON public.vehicle_checklist_assignments FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- CHECKLIST_INSPECTIONS
CREATE POLICY "inspections_select" ON public.checklist_inspections FOR SELECT TO authenticated USING (true);
CREATE POLICY "inspections_all" ON public.checklist_inspections FOR ALL TO authenticated USING (true) WITH CHECK (true);
