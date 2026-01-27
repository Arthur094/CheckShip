
-- =====================================================
-- SINCRONIZAÇÃO RLS - COMPANIES (STAGING)
-- Adicionando permissão para Gestores editarem sua empresa
-- (Substituindo a lógica complexa de Prod por uma Standard Limpa)
-- =====================================================

-- 1. Garante que a policy de leitura pública existe (igual Prod)
-- (Já deve existir, mas por garantia...)
DROP POLICY IF EXISTS "Companies visiveis para autenticados" ON public.companies;
CREATE POLICY "Companies visiveis para autenticados" ON public.companies FOR SELECT TO authenticated USING (true);


-- 2. Adiciona a Permissão de EDIÇÃO para GESTORES
-- Diferente da Prod (ALL), aqui vamos liberar apenas UPDATE para maior segurança.
-- Gestores não devem poder DELETAR a empresa inteira pelo App.

DROP POLICY IF EXISTS "Gestores editam sua empresa" ON public.companies;

CREATE POLICY "Gestores editam sua empresa" ON public.companies FOR UPDATE TO authenticated
USING (
  -- O ID da empresa sendo editada deve ser o mesmo do usuário logado
  id = public.get_user_company_id() 
  AND 
  -- O usuário deve ter role de GESTOR
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'GESTOR'
)
WITH CHECK (
  id = public.get_user_company_id() 
  AND 
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'GESTOR'
);

-- Nota: Se futuramente precisar de DELETE, criamos uma policy específica.
