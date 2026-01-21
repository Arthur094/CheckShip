-- =====================================================
-- SCRIPT CORREÇÃO RECURSÃO INFINITA
-- Execute em Staging e Produção
-- =====================================================

-- 1. Dropar policies problemáticas de profiles
DROP POLICY IF EXISTS "Profiles da mesma empresa" ON public.profiles;
DROP POLICY IF EXISTS "Gestores gerenciam profiles da empresa" ON public.profiles;
DROP POLICY IF EXISTS "Ler próprio perfil" ON public.profiles;

-- 2. Melhorar a função auxiliar para garantir Bypass RLS
-- Ao definir search_path e SECURITY DEFINER, garantimos que roda como admin
CREATE OR REPLACE FUNCTION public.get_user_company_id()
RETURNS UUID AS $$
BEGIN
  -- Esta query deve rodar como o dono da função (postgres) que tem BYPASSRLS
  RETURN (SELECT company_id FROM public.profiles WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

-- 3. Recriar policies separadas para evitar confusão do otimizador

-- Policy 1: O usuário SEMPRE pode ver seu próprio perfil (Sem join, sem função, sem recursão)
CREATE POLICY "Ver proprio perfil"
ON public.profiles FOR SELECT
TO authenticated
USING (id = auth.uid());

-- Policy 2: Ver perfis da mesma empresa
-- O Postgres aplicará (Policy 1 OR Policy 2)
CREATE POLICY "Ver profiles da empresa"
ON public.profiles FOR SELECT
TO authenticated
USING (
  -- Verifica se o company_id do registro alvo é igual ao do usuário
  company_id = public.get_user_company_id()
  -- E garante que não é o próprio usuário (já coberto pela p1, evita redundância)
  AND id != auth.uid() 
);

-- Policy 3: Gestores (Atualização/Insert/Delete)
CREATE POLICY "Gestores total profiles empresa"
ON public.profiles FOR ALL
TO authenticated
USING (
  company_id = public.get_user_company_id()
  AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'GESTOR'
)
WITH CHECK (
  company_id = public.get_user_company_id()
  AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'GESTOR'
);

-- Atualização do próprio perfil
CREATE POLICY "Atualizar proprio perfil"
ON public.profiles FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());
