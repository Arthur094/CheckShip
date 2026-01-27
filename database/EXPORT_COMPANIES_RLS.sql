
-- =====================================================
-- EXPORTAR DEFINIÇÕES DE RLS - COMPANIES
-- Execute este script no SQL Editor de PRODUÇÃO
-- Vamos ver a regra de "Admins"
-- =====================================================

SELECT 
    policyname as "Nome",
    cmd as "Comando",
    qual as "Regra USING (Ver)",
    with_check as "Regra CHECK (Gravar)"
FROM pg_policies
WHERE tablename = 'companies';
