-- =====================================================
-- SCRIPT DE CRIAÇÃO COMPLETA DO BANCO - CHECKSHIP STAGING
-- Execute este script no SQL Editor do Supabase
-- =====================================================

-- =====================================================
-- 1. TABELA: vehicle_types
-- =====================================================
CREATE TABLE IF NOT EXISTS public.vehicle_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 2. TABELA: vehicles
-- =====================================================
CREATE TABLE IF NOT EXISTS public.vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plate TEXT NOT NULL UNIQUE,
  model TEXT,
  brand TEXT,
  year INTEGER,
  vehicle_type_id UUID REFERENCES public.vehicle_types(id),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 3. TABELA: profiles (usuários)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  role TEXT DEFAULT 'MOTORISTA',
  document TEXT,
  phone TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 4. TABELA: access_profiles (perfis de acesso)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.access_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  is_admin BOOLEAN DEFAULT false,
  can_apply_checklists BOOLEAN DEFAULT false,
  can_approve_checklists BOOLEAN DEFAULT false,
  can_view_others_incomplete BOOLEAN DEFAULT false,
  can_reopen_completed BOOLEAN DEFAULT false,
  can_delete_checklists BOOLEAN DEFAULT false,
  can_comment_evaluations BOOLEAN DEFAULT false,
  can_view_history BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Adicionar FK de profiles para access_profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS access_profile_id UUID REFERENCES public.access_profiles(id);

-- =====================================================
-- 5. TABELA: checklist_templates
-- =====================================================
CREATE TABLE IF NOT EXISTS public.checklist_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  fields JSONB DEFAULT '[]'::jsonb,
  active BOOLEAN DEFAULT true,
  requires_analysis BOOLEAN DEFAULT false,
  analysis_approvals_count INTEGER DEFAULT 1,
  analysis_first_approver UUID,
  analysis_second_approver UUID,
  analysis_has_timer BOOLEAN DEFAULT false,
  analysis_timer_minutes INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 6. TABELA: vehicle_assignments (motorista -> veículo)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.vehicle_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, vehicle_id)
);

-- =====================================================
-- 7. TABELA: vehicle_checklist_assignments (veículo -> checklist)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.vehicle_checklist_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE,
  checklist_template_id UUID REFERENCES public.checklist_templates(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(vehicle_id, checklist_template_id)
);

-- =====================================================
-- 8. TABELA: checklist_inspections
-- =====================================================
CREATE TABLE IF NOT EXISTS public.checklist_inspections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inspector_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE SET NULL,
  checklist_template_id UUID REFERENCES public.checklist_templates(id) ON DELETE SET NULL,
  answers JSONB DEFAULT '{}'::jsonb,
  status TEXT DEFAULT 'in_progress',
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  analysis_status TEXT DEFAULT NULL,
  analysis_current_step INTEGER DEFAULT 0,
  analysis_total_steps INTEGER DEFAULT 1,
  analysis_first_result TEXT,
  analysis_first_by UUID,
  analysis_first_at TIMESTAMPTZ,
  analysis_first_reason TEXT,
  analysis_second_result TEXT,
  analysis_second_by UUID,
  analysis_second_at TIMESTAMPTZ,
  analysis_second_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 9. TRIGGER: Criar profile automático para novos usuários
-- =====================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, phone)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    COALESCE(new.raw_user_meta_data->>'role', 'MOTORISTA'),
    new.phone
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- =====================================================
-- 10. ÍNDICES para performance
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_vehicles_plate ON public.vehicles(plate);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_checklist_inspections_status ON public.checklist_inspections(status);
CREATE INDEX IF NOT EXISTS idx_checklist_inspections_analysis_status ON public.checklist_inspections(analysis_status);
CREATE INDEX IF NOT EXISTS idx_profiles_access_profile_id ON public.profiles(access_profile_id);

-- =====================================================
-- 11. Perfis de acesso padrão
-- =====================================================
INSERT INTO public.access_profiles (name, is_admin, can_apply_checklists, can_approve_checklists)
VALUES 
  ('Administrador', true, true, true),
  ('Gestor', false, true, true),
  ('Motorista', false, true, false)
ON CONFLICT DO NOTHING;

-- =====================================================
-- FIM DO SCRIPT DE CRIAÇÃO
-- =====================================================
