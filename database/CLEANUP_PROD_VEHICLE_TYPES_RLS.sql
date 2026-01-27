
-- =====================================================
-- LIMPEZA DE SEGURANÇA - VEHICLE TYPES (PRODUÇÃO)
-- Removendo policies permissivas antigas
-- =====================================================

-- 1. Remove policy que libera TUDO 
DROP POLICY IF EXISTS "vehicle_types_all" ON public.vehicle_types;

-- 2. Remove policy que libera LEITURA irrestrita
DROP POLICY IF EXISTS "vehicle_types_select" ON public.vehicle_types;

-- Observação:
-- As policies corretas que DEVEM ficar são:
-- 1. "Tipos da mesma empresa"
-- 2. "Gestores gerenciam tipos da empresa"
