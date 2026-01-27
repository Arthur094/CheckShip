
-- =====================================================
-- DIAGNÓSTICO V2 - FORMATO TABELA
-- (Melhor para visualizar no Supabase Dashboard)
-- =====================================================

SELECT 
    '1. FUNCTION' as categoria,
    routine_name as nome,
    security_type || ' / ' || external_language as detalhes,
    '---' as regra_using,
    '---' as regra_check
FROM information_schema.routines
WHERE routine_schema = 'public' 
  AND routine_name IN ('get_user_company_id', 'get_user_role')

UNION ALL

SELECT 
    '2. POLICY (' || tablename || ')' as categoria,
    policyname as nome,
    cmd || ' (' || array_to_string(roles, ',') || ')' as detalhes,
    qual::text as regra_using,
    with_check::text as regra_check
FROM pg_policies 
WHERE tablename IN ('profiles', 'vehicle_types')

ORDER BY categoria, nome;
