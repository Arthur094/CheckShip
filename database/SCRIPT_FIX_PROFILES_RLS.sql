-- =====================================================
-- SCRIPT: Corrigir RLS da Tabela Profiles
-- 
-- Este script resolve o problema de recursão infinita
-- usando user_metadata do JWT ao invés de consultar
-- a tabela profiles.
--
-- EXECUTE PRIMEIRO NO STAGING, DEPOIS EM PRODUÇÃO
-- =====================================================

-- PARTE 1: Sincronizar user_metadata dos usuários existentes
-- Isso adiciona o company_id ao raw_user_meta_data de cada usuário

DO $$
DECLARE
    profile_record RECORD;
BEGIN
    FOR profile_record IN 
        SELECT p.id, p.company_id, p.full_name, p.role, p.document
        FROM public.profiles p
        WHERE p.company_id IS NOT NULL
    LOOP
        -- Atualizar o user_metadata no auth.users
        UPDATE auth.users
        SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || 
            jsonb_build_object(
                'company_id', profile_record.company_id::text,
                'full_name', profile_record.full_name,
                'role', profile_record.role
            )
        WHERE id = profile_record.id;
        
        RAISE NOTICE 'Atualizado user_metadata para: %', profile_record.id;
    END LOOP;
END $$;

-- PARTE 2: Dropar policies antigas da tabela profiles
DROP POLICY IF EXISTS "Ver proprio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Ver profiles da empresa" ON public.profiles;
DROP POLICY IF EXISTS "Gestores total profiles empresa" ON public.profiles;
DROP POLICY IF EXISTS "Atualizar proprio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Profiles da mesma empresa" ON public.profiles;
DROP POLICY IF EXISTS "Gestores gerenciam profiles da empresa" ON public.profiles;
DROP POLICY IF EXISTS "Usuarios visualizam todos" ON public.profiles;
DROP POLICY IF EXISTS "Usuarios atualizam proprio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Gestores tem controle total" ON public.profiles;
DROP POLICY IF EXISTS "Usuario atualiza proprio perfil" ON public.profiles;

-- PARTE 3: Criar função auxiliar que lê do JWT (sem consultar tabela)
CREATE OR REPLACE FUNCTION public.get_my_company_id()
RETURNS UUID AS $$
BEGIN
  -- Lê company_id diretamente do user_metadata no JWT
  RETURN (
    SELECT (auth.jwt()->'user_metadata'->>'company_id')::uuid
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- PARTE 4: Criar novas policies RLS

-- 4.1: Qualquer usuário autenticado pode ver seu próprio perfil
CREATE POLICY "profiles_select_own"
ON public.profiles FOR SELECT
TO authenticated
USING (id = auth.uid());

-- 4.2: Usuários podem ver perfis da mesma empresa (lendo do JWT)
CREATE POLICY "profiles_select_company"
ON public.profiles FOR SELECT
TO authenticated
USING (
  company_id = public.get_my_company_id()
);

-- 4.3: Usuários podem atualizar seu próprio perfil
CREATE POLICY "profiles_update_own"
ON public.profiles FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- 4.4: Gestores podem inserir/atualizar/deletar perfis da empresa
-- Nota: Verificamos role do JWT ao invés de consultar tabela
CREATE POLICY "profiles_all_gestor"
ON public.profiles FOR ALL
TO authenticated
USING (
  company_id = public.get_my_company_id()
  AND (auth.jwt()->'user_metadata'->>'role') = 'GESTOR'
)
WITH CHECK (
  company_id = public.get_my_company_id()
  AND (auth.jwt()->'user_metadata'->>'role') = 'GESTOR'
);

-- PARTE 5: Reativar RLS na tabela profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- PARTE 6: Verificação
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd
FROM pg_policies 
WHERE tablename = 'profiles';
