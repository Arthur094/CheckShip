-- Migration: Adicionar configuração de timestamp nos templates
-- Feature: Horário dos Itens
-- Data: 2026-01-26

BEGIN;

-- 1. Adicionar coluna na tabela de templates
ALTER TABLE public.checklist_templates
ADD COLUMN IF NOT EXISTS show_item_timestamps BOOLEAN DEFAULT false;

-- 2. Não precisamos alterar a tabela de inspeções porque o JSONB 'answers'
--    já aceita novos campos dinamicamente sem mudança de schema.
--    O campo 'answered_at' será salvo dentro do objeto JSON de cada resposta.

COMMIT;
