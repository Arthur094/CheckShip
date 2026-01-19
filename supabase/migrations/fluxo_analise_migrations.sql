-- =====================================================
-- FLUXO DE ANÁLISE - MIGRAÇÕES DE BANCO DE DADOS
-- Execute este script no Supabase SQL Editor
-- =====================================================

-- =====================================================
-- MIGRAÇÃO 1: Criar tabela access_profiles
-- =====================================================
CREATE TABLE IF NOT EXISTS access_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  is_admin BOOLEAN DEFAULT false,
  -- Permissões de Checklists Realizados
  can_apply_checklists BOOLEAN DEFAULT false,
  can_approve_checklists BOOLEAN DEFAULT false,
  can_view_others_incomplete BOOLEAN DEFAULT false,
  can_reopen_completed BOOLEAN DEFAULT false,
  can_delete_checklists BOOLEAN DEFAULT false,
  can_comment_evaluations BOOLEAN DEFAULT false,
  can_view_history BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- MIGRAÇÃO 2: Campos de Fluxo de Análise em checklist_templates
-- =====================================================
ALTER TABLE checklist_templates 
ADD COLUMN IF NOT EXISTS requires_analysis BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS analysis_approvals_count INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS analysis_first_approver UUID,
ADD COLUMN IF NOT EXISTS analysis_second_approver UUID,
ADD COLUMN IF NOT EXISTS analysis_has_timer BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS analysis_timer_minutes INTEGER;

-- Adicionar constraint para validar 1 ou 2 aprovações
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'checklist_templates_analysis_approvals_count_check'
  ) THEN
    ALTER TABLE checklist_templates 
    ADD CONSTRAINT checklist_templates_analysis_approvals_count_check 
    CHECK (analysis_approvals_count IS NULL OR analysis_approvals_count BETWEEN 1 AND 2);
  END IF;
END $$;

-- =====================================================
-- MIGRAÇÃO 3: Campos de Análise em checklist_inspections
-- =====================================================
ALTER TABLE checklist_inspections 
ADD COLUMN IF NOT EXISTS analysis_status TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS analysis_current_step INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS analysis_total_steps INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS analysis_first_result TEXT,
ADD COLUMN IF NOT EXISTS analysis_first_by UUID,
ADD COLUMN IF NOT EXISTS analysis_first_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS analysis_first_reason TEXT,
ADD COLUMN IF NOT EXISTS analysis_second_result TEXT,
ADD COLUMN IF NOT EXISTS analysis_second_by UUID,
ADD COLUMN IF NOT EXISTS analysis_second_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS analysis_second_reason TEXT;

-- Comentários explicativos
COMMENT ON COLUMN checklist_inspections.analysis_status IS 'NULL, pending, approved, rejected';
COMMENT ON COLUMN checklist_inspections.analysis_first_result IS 'approved ou rejected';
COMMENT ON COLUMN checklist_inspections.analysis_second_result IS 'approved ou rejected';

-- =====================================================
-- MIGRAÇÃO 4: Vincular profiles a access_profiles
-- =====================================================
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS access_profile_id UUID REFERENCES access_profiles(id);

-- =====================================================
-- ÍNDICES para performance
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_checklist_inspections_analysis_status 
ON checklist_inspections(analysis_status);

CREATE INDEX IF NOT EXISTS idx_profiles_access_profile_id 
ON profiles(access_profile_id);

-- =====================================================
-- Perfil padrão para testes (opcional)
-- =====================================================
INSERT INTO access_profiles (name, is_admin, can_apply_checklists, can_approve_checklists)
VALUES ('Gestor', false, true, true)
ON CONFLICT DO NOTHING;
