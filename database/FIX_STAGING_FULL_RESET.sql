
-- =====================================================
-- FIX GERAL DE INFRAESTRUTURA - STAGING (V3 - CORRIGIDO)
-- Conserta: Trigger de Novos Usuários + Empresa Padrão + Seu Profile
-- Correção: Removida a coluna 'plan' que não existe no Staging
-- =====================================================

DO $$
DECLARE
  v_company_id UUID;
  v_user_id UUID := '0061d495-cfe1-4872-98e7-ebb5b8bc3b4c'; -- Seu ID
  v_email TEXT := 'arthur.sousa@checkship.com.br';
BEGIN

  -- 1. GARANTIR QUE A EMPRESA PADRÃO EXISTE (Sem coluna 'plan')
  INSERT INTO public.companies (name, slug, active)
  VALUES ('CheckShip Staging HQ', 'checkship-staging-hq', true)
  ON CONFLICT (slug) DO UPDATE SET active = true
  RETURNING id INTO v_company_id;

  RAISE NOTICE '✅ Empresa Padrão Garantida: % (ID: %)', 'CheckShip Staging HQ', v_company_id;

  -- 2. CORRIGIR A TRIGGER DE NOVOS USUÁRIOS
  EXECUTE format('
    CREATE OR REPLACE FUNCTION public.handle_new_user()
    RETURNS TRIGGER AS $func$
    DECLARE
      v_default_company UUID := %L; 
      v_target_company UUID;
    BEGIN
      -- Busca empresa pelo slug ou usa a padrão
      SELECT id INTO v_target_company 
      FROM public.companies 
      WHERE slug = COALESCE(new.raw_user_meta_data->>''company_slug'', ''checkship-staging-hq'');
      
      IF v_target_company IS NULL THEN
        v_target_company := v_default_company;
      END IF;

      INSERT INTO public.profiles (id, email, full_name, role, company_id, active)
      VALUES (
        new.id,
        new.email,
        COALESCE(new.raw_user_meta_data->>''full_name'', ''Novo Usuário''),
        COALESCE(new.raw_user_meta_data->>''role'', ''MOTORISTA''),
        v_target_company,
        true
      )
      ON CONFLICT (id) DO UPDATE SET
        company_id = EXCLUDED.company_id,
        role = EXCLUDED.role;
        
      RETURN new;
    END;
    $func$ LANGUAGE plpgsql SECURITY DEFINER;', v_company_id);

  RAISE NOTICE '✅ Trigger handle_new_user atualizada.';


  -- 3. FORÇAR A CRIAÇÃO/CORREÇÃO DO SEU PROFILE
  INSERT INTO public.profiles (id, email, role, company_id, full_name, active)
  VALUES (
    v_user_id,
    v_email,
    'GESTOR', 
    v_company_id, 
    'Arthur Sousa (Staging)',
    true
  )
  ON CONFLICT (id) DO UPDATE SET
    role = 'GESTOR',
    company_id = v_company_id,
    active = true;

  RAISE NOTICE '✅ Seu Profile (Arthur) foi recriado com sucesso!';

END $$;
