
-- ARQUIVO CORRIGIDO (Versão Clean)
-- Se o anterior deu erro de sintaxe, use este.

-- 1. REMOVER POLICIES ANTIGAS
DROP POLICY IF EXISTS "profiles_select" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete" ON public.profiles;
DROP POLICY IF EXISTS "profiles_all_gestor" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_company" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;

-- 2. RECRIAR POLICIES LIMPAS

-- A) LEITURA
DROP POLICY IF EXISTS "Profiles da mesma empresa" ON public.profiles;
CREATE POLICY "Profiles da mesma empresa" ON public.profiles FOR SELECT TO authenticated
USING (company_id = public.get_user_company_id() OR id = auth.uid());

-- B) UPDATE PESSOAL
DROP POLICY IF EXISTS "Usuario atualiza proprio perfil" ON public.profiles;
CREATE POLICY "Usuario atualiza proprio perfil" ON public.profiles FOR UPDATE TO authenticated
USING (id = auth.uid()) WITH CHECK (id = auth.uid());

-- C) GESTAO DA EMPRESA
DROP POLICY IF EXISTS "Gestores gerenciam profiles da empresa" ON public.profiles;
CREATE POLICY "Gestores gerenciam profiles da empresa" ON public.profiles FOR ALL TO authenticated
USING (company_id = public.get_user_company_id() AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'GESTOR')
WITH CHECK (company_id = public.get_user_company_id() AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'GESTOR');
