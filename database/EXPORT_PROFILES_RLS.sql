
-- =====================================================
-- EXPORTAR DEFINIÇÕES DE RLS - PROFILES
-- Execute este script no SQL Editor de PRODUÇÃO
-- Vamos analisar a sopa de letrinhas (profiles_*)
-- =====================================================

SELECT 
    policyname as "Nome",
    cmd as "Comando",
    qual as "Regra USING (Ver)",
    with_check as "Regra CHECK (Gravar)"
FROM pg_policies
WHERE tablename = 'profiles';
