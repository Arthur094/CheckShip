
-- =====================================================
-- FIX RLS VEHICLE_TYPES - STAGING (V3 - SIMPLIFICADO)
-- Objetivo: Desbloquear INSERT removendo verificação de Role
-- Motivo: Pode haver conflito de Case Sensitive (Gestor vs GESTOR)
-- =====================================================

-- 1. Limpeza
DROP POLICY IF EXISTS "Insercao Tipos Veiculo" ON public.vehicle_types;
DROP POLICY IF EXISTS "Leitura Tipos Veiculo" ON public.vehicle_types;
DROP POLICY IF EXISTS "Gestao Tipos Veiculo" ON public.vehicle_types;
DROP POLICY IF EXISTS "Delecao Tipos Veiculo" ON public.vehicle_types;

-- 2. Recriar Policies (Tenancy Only)

-- A) LEITURA: Ver sua empresa
CREATE POLICY "Leitura Tipos Veiculo" ON public.vehicle_types FOR SELECT TO authenticated
USING (
   company_id = public.get_user_company_id()
);

-- B) INSERÇÃO: Quem tem empresa, pode criar (ignora se é Gestor ou Motorista por enquanto)
-- Isso elimina o risco da função get_user_role() estar retornando algo inesperado.
CREATE POLICY "Insercao Tipos Veiculo" ON public.vehicle_types FOR INSERT TO authenticated
WITH CHECK (
   company_id = public.get_user_company_id()
);

-- C) ATUALIZAÇÃO: Idem
CREATE POLICY "Gestao Tipos Veiculo" ON public.vehicle_types FOR UPDATE TO authenticated
USING (
   company_id = public.get_user_company_id()
)
WITH CHECK (
   company_id = public.get_user_company_id()
);

-- D) DELEÇÃO: Idem
CREATE POLICY "Delecao Tipos Veiculo" ON public.vehicle_types FOR DELETE TO authenticated
USING (
   company_id = public.get_user_company_id()
);

DO $$
BEGIN
  RAISE NOTICE '✅ RLS Simplificado aplicado em vehicle_types. Checagem de Role removida.';
END $$;
