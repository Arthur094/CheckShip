
-- =====================================================
-- FIX RLS VEHICLE_TYPES - STAGING (V2 - Syntax Corrected)
-- Objetivo: Desbloquear INSERT/UPDATE na tabela vehicle_types
-- =====================================================

-- 1. Remover TODAS as policies antigas de vehicle_types
DROP POLICY IF EXISTS "Tipos de veiculo visiveis" ON public.vehicle_types;
DROP POLICY IF EXISTS "Gestores controlam tipos" ON public.vehicle_types;
DROP POLICY IF EXISTS "authenticated_select_vehicle_types" ON public.vehicle_types;
DROP POLICY IF EXISTS "authenticated_all_vehicle_types" ON public.vehicle_types;
DROP POLICY IF EXISTS "vehicle_types_select" ON public.vehicle_types;
DROP POLICY IF EXISTS "vehicle_types_all" ON public.vehicle_types;
DROP POLICY IF EXISTS "vehicle_types_insert" ON public.vehicle_types;
DROP POLICY IF EXISTS "allow_all_vehicle_types" ON public.vehicle_types;
DROP POLICY IF EXISTS "Tipos visiveis para autenticados" ON public.vehicle_types;
DROP POLICY IF EXISTS "Gestores gerenciam tipos da empresa" ON public.vehicle_types;
DROP POLICY IF EXISTS "Leitura Tipos Veiculo" ON public.vehicle_types;
DROP POLICY IF EXISTS "Insercao Tipos Veiculo" ON public.vehicle_types;
DROP POLICY IF EXISTS "Gestao Tipos Veiculo" ON public.vehicle_types;
DROP POLICY IF EXISTS "Delecao Tipos Veiculo" ON public.vehicle_types;


-- 2. Recriar Policies LIMPAS e SEGURAS

-- A) LEITURA: Todos da empresa podem ver os tipos
CREATE POLICY "Leitura Tipos Veiculo" ON public.vehicle_types FOR SELECT TO authenticated
USING (
   company_id = public.get_user_company_id()
);

-- B) INSERÇÃO: Apenas Gestores (ou users da empresa)
CREATE POLICY "Insercao Tipos Veiculo" ON public.vehicle_types FOR INSERT TO authenticated
WITH CHECK (
   company_id = public.get_user_company_id()
   AND
   public.get_user_role() = 'GESTOR'
);

-- C) ATUALIZAÇÃO: Apenas Gestores
CREATE POLICY "Gestao Tipos Veiculo" ON public.vehicle_types FOR UPDATE TO authenticated
USING (
   company_id = public.get_user_company_id()
   AND
   public.get_user_role() = 'GESTOR'
)
WITH CHECK (
   company_id = public.get_user_company_id()
   AND
   public.get_user_role() = 'GESTOR'
);

-- D) DELEÇÃO: Apenas Gestores
CREATE POLICY "Delecao Tipos Veiculo" ON public.vehicle_types FOR DELETE TO authenticated
USING (
   company_id = public.get_user_company_id()
   AND
   public.get_user_role() = 'GESTOR'
);

-- 3. AVISO FINAL (Agora dentro de bloco DO)
DO $$
BEGIN
  RAISE NOTICE '✅ Policies de vehicle_types recriadas com sucesso. Insert liberado para Gestores.';
END $$;
