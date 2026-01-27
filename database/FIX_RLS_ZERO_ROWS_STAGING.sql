
-- =====================================================
-- FIX DEFINITIVO DE RLS - STAGING (Anti-Zero-Rows)
-- Execute este script para corrigir o acesso ao profile
-- =====================================================

-- 1. GARANTIR FUNÇÕES "SECURITY DEFINER" (Bypassa RLS)
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


-- 2. LIMPAR TUDO DA TABELA PROFILES
DROP POLICY IF EXISTS "Profiles da mesma empresa" ON public.profiles;
DROP POLICY IF EXISTS "Usuario atualiza proprio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Gestores gerenciam profiles da empresa" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete" ON public.profiles;


-- 3. RECRIAR POLICIES "LIMPAS" (Sem Recursão)

-- A) LEITURA: User lê a si mesmo OU alguém da empresa
CREATE POLICY "Leitura de Profiles" ON public.profiles FOR SELECT TO authenticated
USING (
    id = auth.uid()  -- Sempre libera a si mesmo
    OR 
    company_id = public.get_user_company_id() -- Libera colegas da empresa
);

-- B) UPDATE: Apenas si mesmo
CREATE POLICY "Update Proprio" ON public.profiles FOR UPDATE TO authenticated
USING (id = auth.uid()) 
WITH CHECK (id = auth.uid());

-- C) GESTÃO TOTAL: Apenas Gestores (usando função segura)
CREATE POLICY "Gestores Gerenciam Tudo" ON public.profiles FOR ALL TO authenticated
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

-- 4. VERIFICAÇÃO PÓS-FIX
DO $$
BEGIN
  RAISE NOTICE 'Policies recriadas com sucesso. Tente logar novamente.';
END $$;
