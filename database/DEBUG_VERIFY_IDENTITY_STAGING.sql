
-- =====================================================
-- DEBUG PROFUNDO DE IDENTIDADE (STAGING)
-- Execute no SQL Editor (acesso Admin/Superuser)
-- =====================================================

DO $$
DECLARE
  v_email text := 'arthur.sousa@checkship.com.br';
  v_user_record record;
  v_profile_record record;
  v_company_record record;
BEGIN
  RAISE NOTICE '=== INICIANDO DEBUG ===';

  -- 1. Verificar Auth User
  SELECT id, email, created_at INTO v_user_record
  FROM auth.users
  WHERE email = v_email;

  IF v_user_record.id IS NULL THEN
    RAISE NOTICE '❌ ERRO FATAL: Usuário % NÃO encontrado em auth.users', v_email;
  ELSE
    RAISE NOTICE '✅ AUTH: Usuário encontrado. ID: %', v_user_record.id;
  END IF;

  -- 2. Verificar Public Profile (Bypass RLS no Editor)
  SELECT * INTO v_profile_record
  FROM public.profiles
  WHERE email = v_email;

  IF v_profile_record.id IS NULL THEN
    RAISE NOTICE '❌ PUBLIC: Profile NÃO encontrado para este email.';
    
    -- Tenta achar pelo ID (caso email esteja desincronizado)
    IF v_user_record.id IS NOT NULL THEN
      SELECT * INTO v_profile_record FROM public.profiles WHERE id = v_user_record.id;
      IF v_profile_record.id IS NOT NULL THEN
         RAISE NOTICE '⚠️ AVISO: Profile encontrado pelo ID, mas email no profile é diferente: %', v_profile_record.email;
      END IF;
    END IF;

  ELSE
    RAISE NOTICE '✅ PUBLIC: Profile encontrado.';
    RAISE NOTICE '   - Role: %', v_profile_record.role;
    RAISE NOTICE '   - Company ID: %', v_profile_record.company_id;
    RAISE NOTICE '   - Active: %', v_profile_record.active;

    -- 3. Verificar Company
    IF v_profile_record.company_id IS NOT NULL THEN
      SELECT * INTO v_company_record
      FROM public.companies
      WHERE id = v_profile_record.company_id;

      IF v_company_record.id IS NOT NULL THEN
        RAISE NOTICE '✅ COMPANY: Empresa encontrada: % (ID: %)', v_company_record.name, v_company_record.id;
      ELSE
         RAISE NOTICE '❌ COMPANY: Profile aponta para Company ID %, mas ela NÃO EXISTE.', v_profile_record.company_id;
      END IF;
    ELSE
       RAISE NOTICE '❌ PUBLIC: Profile tem Company_ID NULL. (Isso bloqueia tudo!)';
    END IF;

  END IF;
  
  RAISE NOTICE '=== FIM DO DEBUG ===';
END $$;
