
-- =====================================================
-- NUCLEAR OPTION - STAGING (DESABILITAR SEGURANÇA)
-- Execute este script para remover TODAS as barreiras de RLS
-- (Apenas para teste de diagnóstico no Staging)
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '🚨 INICIANDO OPERAÇÃO NUCLEAR NO STAGING 🚨';
    
    -- 1. Desabilitar RLS nas tabelas críticas
    ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
    ALTER TABLE public.vehicle_types DISABLE ROW LEVEL SECURITY;
    ALTER TABLE public.checklist_templates DISABLE ROW LEVEL SECURITY;
    ALTER TABLE public.companies DISABLE ROW LEVEL SECURITY;

    RAISE NOTICE '🔓 SEGURANÇA DESATIVADA para Profiles, Types, Templates e Companies.';
    RAISE NOTICE '👉 Tente usar o App agora.';
    RAISE NOTICE '⚠️ IMPORTANTE: Se funcionar, sabemos que o problema ERA apenas a regra de bloqueio.';
    RAISE NOTICE '⚠️ Se CONTINUAR falhando (0 rows), então seu Usuário/Empresa NÃO EXISTEM no banco.';

END $$;
