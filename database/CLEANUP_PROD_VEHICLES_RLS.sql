
-- =====================================================
-- LIMPEZA DE SEGURANÇA - VEHICLES (PRODUÇÃO)
-- Removendo policies permissivas antigas
-- =====================================================

-- 1. Remove policy que libera TUDO 
DROP POLICY IF EXISTS "vehicles_all" ON public.vehicles;

-- 2. Remove policy que libera LEITURA irrestrita
DROP POLICY IF EXISTS "vehicles_select" ON public.vehicles;

-- Observação:
-- As policies corretas que DEVEM ficar são:
-- 1. "Veiculos da mesma empresa"
-- 2. "Gestores gerenciam veiculos da empresa"
