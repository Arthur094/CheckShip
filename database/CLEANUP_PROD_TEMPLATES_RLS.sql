
-- =====================================================
-- LIMPEZA DE SEGURANÇA - TEMPLATES (PRODUÇÃO)
-- Removendo policies permissivas que quebram o isolamento
-- =====================================================

-- 1. Remove policy que libera TUDO (insegura)
DROP POLICY IF EXISTS "templates_all" ON public.checklist_templates;

-- 2. Remove policy que libera LEITURA irrestrita (insegura)
DROP POLICY IF EXISTS "templates_select" ON public.checklist_templates;

-- Observação:
-- As policies corretas que DEVEM ficar são:
-- 1. "Templates da mesma empresa"
-- 2. "Gestores gerenciam templates da empresa"
