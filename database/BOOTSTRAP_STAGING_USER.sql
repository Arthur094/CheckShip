
-- =====================================================
-- BOOTSTRAP STAGING (Criação do Primeiro Usuário) - CORRIGIDO
-- Execute este script no SQL Editor do Staging
-- =====================================================

DO $$
DECLARE
  v_user_id uuid := '0061d495-cfe1-4872-98e7-ebb5b8bc3b4c'; -- Seu UID (auth.users)
  v_email text := 'arthur.sousa@checkship.com.br';
  v_company_id uuid;
BEGIN

  -- 1. Criar uma Empresa Inicial (CORRIGIDO: Sem coluna 'document')
  -- Usei apenas as colunas que confirmamos existirem no schema
  INSERT INTO public.companies (name, slug, active)
  VALUES ('CheckShip Staging HQ', 'checkship-staging-hq', true)
  ON CONFLICT (slug) DO UPDATE SET active = true -- Se já existir, pega o ID
  RETURNING id INTO v_company_id;

  -- 2. Vincular o Usuário como GESTOR
  INSERT INTO public.profiles (
    id, 
    email, 
    role, 
    company_id, 
    full_name,
    active
  )
  VALUES (
    v_user_id,
    v_email,
    'GESTOR',     -- A Chave Mestra!
    v_company_id,
    'Arthur Sousa (Staging)',
    true
  )
  ON CONFLICT (id) DO UPDATE 
  SET role = 'GESTOR', company_id = v_company_id; 
  -- Se o profile já existir (por tentativa anterior), atualiza para Gestor

  RAISE NOTICE 'Sucesso! Usuário % agora é GESTOR da Empresa %.', v_email, v_company_id;

END $$;
