
-- =====================================================
-- EMERGENCY FIX - STAGING (DESBLOQUEIO DE LEITURA) - V2
-- Execute este script para permitir que o App leia o perfil
-- =====================================================

-- 1. FORÇAR FUNÇÕES BLINDADAS (SECURITY DEFINER)
-- Isso garante que as funções leiam a tabela sem disparar RLS recursivo
CREATE OR REPLACE FUNCTION public.get_user_company_id()
RETURNS UUID AS $$
BEGIN
  RETURN (SELECT company_id FROM public.profiles WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text AS $$
BEGIN
  RETURN (SELECT role FROM public.profiles WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;


-- 2. FAXINA GERAL NAS POLICIES DE PROFILES
-- Removemos qualquer resquício de policy antiga que possa estar causando loop
DROP POLICY IF EXISTS "Profiles da mesma empresa" ON public.profiles;
DROP POLICY IF EXISTS "Usuario atualiza proprio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Gestores gerenciam profiles da empresa" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_all_gestor" ON public.profiles;
DROP POLICY IF EXISTS "Emergency_Read_Policy" ON public.profiles;
DROP POLICY IF EXISTS "Emergency_Update_Own" ON public.profiles;
DROP POLICY IF EXISTS "Emergency_Manager_All" ON public.profiles;


-- 3. RECRIAR POLICIES SIMPLIFICADAS (GARANTIDAS)

-- A) LEITURA: Regra simples e direta.
CREATE POLICY "Emergency_Read_Policy" ON public.profiles FOR SELECT TO authenticated
USING (
    id = auth.uid() 
    OR 
    company_id = public.get_user_company_id()
);

-- B) UPDATE: Apenas o próprio usuário
CREATE POLICY "Emergency_Update_Own" ON public.profiles FOR UPDATE TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- C) GESTÃO: Apenas Gestor da empresa
CREATE POLICY "Emergency_Manager_All" ON public.profiles FOR ALL TO authenticated
USING (
    public.get_user_role() = 'GESTOR' 
    AND 
    company_id = public.get_user_company_id()
)
WITH CHECK (
    public.get_user_role() = 'GESTOR' 
    AND 
    company_id = public.get_user_company_id()
);

-- 4. AVISO FINAL (Agora dentro de bloco DO para evitar erro de sintaxe)
DO $$
BEGIN
  RAISE NOTICE '✅ RLS de Profiles resetado com sucesso. App desbloqueado.';
END $$;
