
-- =====================================================
-- DIAGNÓSTICO COMPARATIVO - PRODUCTION vs STAGING
-- Execute este script EM AMBOS os ambientes e compare os resultados.
-- Ele lista exatamente quais regras de segurança estão ativas.
-- =====================================================

DO $$
DECLARE
  r record;
BEGIN
  RAISE NOTICE '=======================================================';
  RAISE NOTICE 'RELATÓRIO DE SEGURANÇA (RLS & FUNÇÕES)';
  RAISE NOTICE '=======================================================';
  RAISE NOTICE '';

  RAISE NOTICE '--- 1. FUNÇÕES AUXILIARES (Definição) ---';
  FOR r IN (
    SELECT routine_name, security_type, external_language
    FROM information_schema.routines
    WHERE routine_schema = 'public' 
    AND routine_name IN ('get_user_company_id', 'get_user_role')
  ) LOOP
    RAISE NOTICE 'Função: % | Tipo: % | Lang: %', r.routine_name, r.security_type, r.external_language;
  END LOOP;
  RAISE NOTICE '';

  RAISE NOTICE '--- 2. POLICIES: PROFILES ---';
  FOR r IN (
    SELECT policyname, cmd, roles, qual::text as using_rule, with_check::text as check_rule
    FROM pg_policies 
    WHERE tablename = 'profiles'
    ORDER BY policyname
  ) LOOP
    RAISE NOTICE '[%] cmd: % | roles: %', r.policyname, r.cmd, r.roles;
    RAISE NOTICE '   USING: %', r.using_rule;
    RAISE NOTICE '   CHECK: %', r.check_rule;
    RAISE NOTICE '---------------------------------------------------';
  END LOOP;
  RAISE NOTICE '';

  RAISE NOTICE '--- 3. POLICIES: VEHICLE_TYPES ---';
  FOR r IN (
    SELECT policyname, cmd, roles, qual::text as using_rule, with_check::text as check_rule
    FROM pg_policies 
    WHERE tablename = 'vehicle_types'
    ORDER BY policyname
  ) LOOP
    RAISE NOTICE '[%] cmd: % | roles: %', r.policyname, r.cmd, r.roles;
    RAISE NOTICE '   USING: %', r.using_rule;
    RAISE NOTICE '   CHECK: %', r.check_rule;
    RAISE NOTICE '---------------------------------------------------';
  END LOOP;

  RAISE NOTICE '';
  RAISE NOTICE '=== FIM DO RELATÓRIO ===';
END $$;
