-- =====================================================
-- SCRIPT COMPLEMENTAR - TABELAS FALTANTES
-- Execute no SQL Editor do Supabase Staging
-- =====================================================

-- =====================================================
-- 1. TABELA: checklist_records
-- =====================================================
CREATE TABLE IF NOT EXISTS public.checklist_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  checklist_inspection_id UUID REFERENCES public.checklist_inspections(id) ON DELETE CASCADE,
  field_id TEXT,
  field_name TEXT,
  field_type TEXT,
  value JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 2. TABELA: inspection_photos
-- =====================================================
CREATE TABLE IF NOT EXISTS public.inspection_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  checklist_inspection_id UUID REFERENCES public.checklist_inspections(id) ON DELETE CASCADE,
  field_id TEXT,
  photo_url TEXT NOT NULL,
  storage_path TEXT,
  caption TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 3. TABELA: profile_checklist_permissions
-- =====================================================
CREATE TABLE IF NOT EXISTS public.profile_checklist_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  checklist_template_id UUID REFERENCES public.checklist_templates(id) ON DELETE CASCADE,
  can_apply BOOLEAN DEFAULT true,
  can_view BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(profile_id, checklist_template_id)
);

-- =====================================================
-- 4. TABELA: vehicle_type_checklists
-- =====================================================
CREATE TABLE IF NOT EXISTS public.vehicle_type_checklists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_type_id UUID REFERENCES public.vehicle_types(id) ON DELETE CASCADE,
  checklist_template_id UUID REFERENCES public.checklist_templates(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(vehicle_type_id, checklist_template_id)
);

-- =====================================================
-- ÍNDICES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_checklist_records_inspection ON public.checklist_records(checklist_inspection_id);
CREATE INDEX IF NOT EXISTS idx_inspection_photos_inspection ON public.inspection_photos(checklist_inspection_id);
CREATE INDEX IF NOT EXISTS idx_profile_checklist_permissions_profile ON public.profile_checklist_permissions(profile_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_type_checklists_type ON public.vehicle_type_checklists(vehicle_type_id);

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- checklist_records
ALTER TABLE public.checklist_records ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Records visiveis para autenticados" ON public.checklist_records;
CREATE POLICY "Records visiveis para autenticados"
ON public.checklist_records FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Usuarios criam proprios records" ON public.checklist_records;
CREATE POLICY "Usuarios criam proprios records"
ON public.checklist_records FOR INSERT
TO authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Gestores controlam records" ON public.checklist_records;
CREATE POLICY "Gestores controlam records"
ON public.checklist_records FOR ALL
TO authenticated
USING ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'GESTOR' )
WITH CHECK ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'GESTOR' );

-- inspection_photos
ALTER TABLE public.inspection_photos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Photos visiveis para autenticados" ON public.inspection_photos;
CREATE POLICY "Photos visiveis para autenticados"
ON public.inspection_photos FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Usuarios criam proprias photos" ON public.inspection_photos;
CREATE POLICY "Usuarios criam proprias photos"
ON public.inspection_photos FOR INSERT
TO authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Gestores controlam photos" ON public.inspection_photos;
CREATE POLICY "Gestores controlam photos"
ON public.inspection_photos FOR ALL
TO authenticated
USING ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'GESTOR' )
WITH CHECK ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'GESTOR' );

-- profile_checklist_permissions
ALTER TABLE public.profile_checklist_permissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permissions visiveis" ON public.profile_checklist_permissions;
CREATE POLICY "Permissions visiveis"
ON public.profile_checklist_permissions FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Gestores controlam permissions" ON public.profile_checklist_permissions;
CREATE POLICY "Gestores controlam permissions"
ON public.profile_checklist_permissions FOR ALL
TO authenticated
USING ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'GESTOR' )
WITH CHECK ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'GESTOR' );

-- vehicle_type_checklists
ALTER TABLE public.vehicle_type_checklists ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Type checklists visiveis" ON public.vehicle_type_checklists;
CREATE POLICY "Type checklists visiveis"
ON public.vehicle_type_checklists FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Gestores controlam type checklists" ON public.vehicle_type_checklists;
CREATE POLICY "Gestores controlam type checklists"
ON public.vehicle_type_checklists FOR ALL
TO authenticated
USING ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'GESTOR' )
WITH CHECK ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'GESTOR' );

-- =====================================================
-- FIM DO SCRIPT COMPLEMENTAR
-- =====================================================
