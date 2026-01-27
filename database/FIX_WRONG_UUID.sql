
-- =====================================================
-- FIX FINAL DE VERDADE (CORREÇÃO DE TYPO NO ID)
-- Descobrimos que o ID correto tem 'f' e não '1'
-- =====================================================

DO $$
DECLARE
  -- O ID QUE VIMOS NO CONSOLE DO BROWSER (CORRETO)
  v_real_user_id UUID := '006fd495-cfe1-4872-98e7-ebb5b8bc3b4c'; 
  
  -- O ID QUE USAMOS ERRADO NOS SCRIPTS ANTERIORES
  v_wrong_user_id UUID := '0061d495-cfe1-4872-98e7-ebb5b8bc3b4c';
  
  v_company_id UUID;
BEGIN

  RAISE NOTICE '🕵️‍♂️ Corrigindo Identidade...';

  -- 1. Buscar a Empresa Padrão (que já criamos)
  SELECT id INTO v_company_id FROM public.companies WHERE slug = 'checkship-staging-hq';
  
  -- Se não achar, cria de novo (segurança)
  IF v_company_id IS NULL THEN
    INSERT INTO public.companies (name, slug, active)
    VALUES ('CheckShip Staging HQ', 'checkship-staging-hq', true)
    RETURNING id INTO v_company_id;
  END IF;

  -- 2. Criar o Profile para o USUÁRIO REAL (006f)
  INSERT INTO public.profiles (id, email, full_name, role, company_id, active)
  VALUES (
    v_real_user_id,
    'arthur.sousa@checkship.com.br',
    'Arthur Sousa (Real)',
    'GESTOR', 
    v_company_id, 
    true
  )
  ON CONFLICT (id) DO UPDATE SET
    role = 'GESTOR',
    company_id = v_company_id,
    active = true;

  RAISE NOTICE '✅ Profile REAL criado para o ID %', v_real_user_id;

  -- 3. (Opcional) Limpar o usuário errado para não confundir
  DELETE FROM public.profiles WHERE id = v_wrong_user_id;


  -- 4. REATIVAR RLS (Já que achamos o erro, podemos voltar a segurança)
  -- É mais seguro do que deixar tudo aberto
  ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.vehicle_types ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.checklist_templates ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
  
  RAISE NOTICE '🔒 RLS Reativado com segurança.';

END $$;
