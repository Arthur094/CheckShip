-- =====================================================
-- SCRIPT MULTI-TENANT - FASE 4
-- Execute no SQL Editor do Supabase STAGING primeiro
-- =====================================================

-- =====================================================
-- 1. CRIAR TABELA COMPANIES
-- =====================================================
CREATE TABLE IF NOT EXISTS public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  primary_color TEXT DEFAULT '#1e3a5f',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para busca por slug
CREATE INDEX IF NOT EXISTS idx_companies_slug ON public.companies(slug);

-- RLS para companies
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Companies visiveis para autenticados"
ON public.companies FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Apenas admins gerenciam companies"
ON public.companies FOR ALL
TO authenticated
USING ( 
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'GESTOR'
  OR
  (SELECT is_admin FROM public.access_profiles ap 
   JOIN public.profiles p ON p.access_profile_id = ap.id 
   WHERE p.id = auth.uid()) = true
)
WITH CHECK (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'GESTOR'
  OR
  (SELECT is_admin FROM public.access_profiles ap 
   JOIN public.profiles p ON p.access_profile_id = ap.id 
   WHERE p.id = auth.uid()) = true
);

-- =====================================================
-- 2. CRIAR EMPRESA PADRÃO "Transportadora Rolim"
-- =====================================================
INSERT INTO public.companies (name, slug, primary_color)
VALUES ('Transportadora Rolim', 'transportadorarolim', '#1e3a5f')
ON CONFLICT (slug) DO NOTHING;

-- =====================================================
-- 3. ADICIONAR company_id NAS TABELAS PRINCIPAIS
-- =====================================================

-- profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);

-- vehicles
ALTER TABLE public.vehicles 
ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);

-- vehicle_types
ALTER TABLE public.vehicle_types 
ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);

-- checklist_templates
ALTER TABLE public.checklist_templates 
ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);

-- vehicle_assignments
ALTER TABLE public.vehicle_assignments 
ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);

-- vehicle_checklist_assignments
ALTER TABLE public.vehicle_checklist_assignments 
ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);

-- checklist_inspections
ALTER TABLE public.checklist_inspections 
ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);

-- checklist_records
ALTER TABLE public.checklist_records 
ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);

-- inspection_photos
ALTER TABLE public.inspection_photos 
ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);

-- access_profiles
ALTER TABLE public.access_profiles 
ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);

-- profile_checklist_permissions
ALTER TABLE public.profile_checklist_permissions 
ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);

-- (Tabela vehicle_type_checklists ignorada)

-- =====================================================
-- 4. CRIAR ÍNDICES PARA company_id
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_profiles_company ON public.profiles(company_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_company ON public.vehicles(company_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_types_company ON public.vehicle_types(company_id);
CREATE INDEX IF NOT EXISTS idx_checklist_templates_company ON public.checklist_templates(company_id);
CREATE INDEX IF NOT EXISTS idx_checklist_inspections_company ON public.checklist_inspections(company_id);
CREATE INDEX IF NOT EXISTS idx_access_profiles_company ON public.access_profiles(company_id);

-- =====================================================
-- 5. VINCULAR DADOS EXISTENTES À EMPRESA PADRÃO
-- =====================================================
UPDATE public.profiles 
SET company_id = (SELECT id FROM public.companies WHERE slug = 'transportadorarolim')
WHERE company_id IS NULL;

UPDATE public.vehicles 
SET company_id = (SELECT id FROM public.companies WHERE slug = 'transportadorarolim')
WHERE company_id IS NULL;

UPDATE public.vehicle_types 
SET company_id = (SELECT id FROM public.companies WHERE slug = 'transportadorarolim')
WHERE company_id IS NULL;

UPDATE public.checklist_templates 
SET company_id = (SELECT id FROM public.companies WHERE slug = 'transportadorarolim')
WHERE company_id IS NULL;

UPDATE public.vehicle_assignments 
SET company_id = (SELECT id FROM public.companies WHERE slug = 'transportadorarolim')
WHERE company_id IS NULL;

UPDATE public.vehicle_checklist_assignments 
SET company_id = (SELECT id FROM public.companies WHERE slug = 'transportadorarolim')
WHERE company_id IS NULL;

UPDATE public.checklist_inspections 
SET company_id = (SELECT id FROM public.companies WHERE slug = 'transportadorarolim')
WHERE company_id IS NULL;

UPDATE public.checklist_records 
SET company_id = (SELECT id FROM public.companies WHERE slug = 'transportadorarolim')
WHERE company_id IS NULL;

UPDATE public.inspection_photos 
SET company_id = (SELECT id FROM public.companies WHERE slug = 'transportadorarolim')
WHERE company_id IS NULL;

UPDATE public.access_profiles 
SET company_id = (SELECT id FROM public.companies WHERE slug = 'transportadorarolim')
WHERE company_id IS NULL;

UPDATE public.profile_checklist_permissions 
SET company_id = (SELECT id FROM public.companies WHERE slug = 'transportadorarolim')
WHERE company_id IS NULL;

-- (Tabela vehicle_type_checklists removida pois não existe em produção)

-- =====================================================
-- 6. ATUALIZAR TRIGGER handle_new_user PARA INCLUIR company_id
-- =====================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_company_id UUID;
BEGIN
  -- Buscar company_id pelo slug passado nos metadados ou usar padrão
  SELECT id INTO v_company_id 
  FROM public.companies 
  WHERE slug = COALESCE(new.raw_user_meta_data->>'company_slug', 'transportadorarolim');
  
  -- Se não encontrar, usar empresa padrão
  IF v_company_id IS NULL THEN
    SELECT id INTO v_company_id FROM public.companies WHERE slug = 'transportadorarolim';
  END IF;

  INSERT INTO public.profiles (id, email, full_name, role, phone, company_id)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    COALESCE(new.raw_user_meta_data->>'role', 'MOTORISTA'),
    new.phone,
    v_company_id
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FIM DO SCRIPT MULTI-TENANT - ESTRUTURA
-- =====================================================
