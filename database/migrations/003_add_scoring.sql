-- Migration: Adicionar sistema de pontuação
-- Feature: Sistema de Pontuação (Scoring)
-- Data: 2026-01-26

BEGIN;

-- 1. Na tabela de TEMPLATES, adicionar se a pontuação está ativa
ALTER TABLE public.checklist_templates
ADD COLUMN IF NOT EXISTS scoring_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS min_score_to_pass NUMERIC(5,2) DEFAULT 70.0; -- Ex: 70% para aprovar

-- 2. Na tabela de INSPEÇÕES, adicionar o resultado do cálculo
ALTER TABLE public.checklist_inspections
ADD COLUMN IF NOT EXISTS score NUMERIC(5,2), -- Ex: 95.50
ADD COLUMN IF NOT EXISTS max_possible_score NUMERIC(5,2),
ADD COLUMN IF NOT EXISTS active_score BOOLEAN DEFAULT false; -- Se esse checklist conta para o ranking

-- 3. Índices para performance em rankings
CREATE INDEX IF NOT EXISTS idx_checklist_inspections_score ON public.checklist_inspections(score);
CREATE INDEX IF NOT EXISTS idx_checklist_inspections_active_score ON public.checklist_inspections(active_score);

COMMIT;
