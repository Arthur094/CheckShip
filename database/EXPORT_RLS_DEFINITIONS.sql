
-- =====================================================
-- EXPORTAR DEFINIÇÕES DE RLS
-- Execute este script no SQL Editor de PRODUÇÃO
-- Ele vai mostrar o código real por trás das policies "misteriosas"
-- =====================================================

SELECT 
    policyname as "Nome",
    cmd as "Comando",
    qual as "Regra USING (Ver)",
    with_check as "Regra CHECK (Gravar)"
FROM pg_policies
WHERE tablename = 'checklist_inspections';
