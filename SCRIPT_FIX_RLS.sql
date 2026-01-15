-- CORREÇÃO DE POLÍTICAS DE ACESSO (RLS) PARA PROFILES
-- O problema de "usuários não aparecendo" ocorre porque o RLS foi ativado, mas sem políticas.

-- 1. Habilitar o RLS (garantindo que esteja ativo)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. Política de LEITURA:
-- "Gestores podem ver todos os perfis"
-- "Usuários autenticados podem ver o próprio perfil OU perfis para fins de listagem básica (dependendo da regra de negócio)"
-- Neste caso de emergência, vamos liberar LEITURA para autenticados para que as listas funcionem para todos.
DROP POLICY IF EXISTS "Perfis visiveis para todos autenticados" ON public.profiles;
CREATE POLICY "Perfis visiveis para todos autenticados"
ON public.profiles FOR SELECT
TO authenticated
USING (true);

-- 3. Política de COMPLETA para GESTORES:
-- Gestores podem Inserir, Atualizar e Excluir qualquer perfil.
DROP POLICY IF EXISTS "Gestores tem controle total" ON public.profiles;
CREATE POLICY "Gestores tem controle total"
ON public.profiles FOR ALL
TO authenticated
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'GESTOR'
)
WITH CHECK (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'GESTOR'
);

-- 4. Política de UPDATE para o próprio usuário:
-- Um usuário pode atualizar seus próprios dados (opcional, mas comum)
DROP POLICY IF EXISTS "Usuarios editam proprio perfil" ON public.profiles;
CREATE POLICY "Usuarios editam proprio perfil"
ON public.profiles FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());
