
-- =====================================================
-- LIMPEZA DE SEGURANÇA - VEHICLE CHECKLIST ASSIGNMENTS (PRODUÇÃO)
-- Removendo policies permissivas antigas
-- =====================================================

-- 1. Remove policy que libera TUDO 
DROP POLICY IF EXISTS "checklist_assign_all" ON public.vehicle_checklist_assignments;

-- 2. Remove policy que libera LEITURA irrestrita
DROP POLICY IF EXISTS "checklist_assign_select" ON public.vehicle_checklist_assignments;

-- Observação:
-- As policies corretas que DEVEM ficar são:
-- 1. "Checklist assignments da mesma empresa"
-- 2. "Gestores gerenciam checklist assignments"
