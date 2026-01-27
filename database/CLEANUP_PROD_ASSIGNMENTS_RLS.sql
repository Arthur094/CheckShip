
-- =====================================================
-- LIMPEZA DE SEGURANÇA - VEHICLE ASSIGNMENTS (PRODUÇÃO)
-- Removendo policies permissivas antigas
-- =====================================================

-- 1. Remove policy que libera TUDO 
DROP POLICY IF EXISTS "assignments_all" ON public.vehicle_assignments;

-- 2. Remove policy que libera LEITURA irrestrita
DROP POLICY IF EXISTS "assignments_select" ON public.vehicle_assignments;

-- Observação:
-- As policies corretas que DEVEM ficar são:
-- 1. "Assignments da mesma empresa"
-- 2. "Gestores gerenciam assignments da empresa"
