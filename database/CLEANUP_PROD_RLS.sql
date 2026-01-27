
-- =====================================================
-- LIMPEZA DE SEGURANÇA (PRODUÇÃO)
-- ATENÇÃO: Essas policies estão permitindo acesso total!
-- Vamos remove-las para garantir o isolamento entre empresas.
-- =====================================================

-- 1. Remove policy que libera TUDO para qualquer um
DROP POLICY IF EXISTS "inspections_all" ON public.checklist_inspections;

-- 2. Remove policies que liberam LEITURA de tudo
DROP POLICY IF EXISTS "inspections_select" ON public.checklist_inspections;
DROP POLICY IF EXISTS "Allow authenticated users to read inspections" ON public.checklist_inspections;

-- O que sobra são apenas as 4 policies corretas:
-- 1. "Inspecoes da mesma empresa"
-- 2. "Usuarios criam inspecoes na empresa"
-- 3. "Usuarios atualizam proprias inspecoes"
-- 4. "Gestores gerenciam inspecoes da empresa"
