
-- =====================================================
-- CHECAR FUNCTIONS E TRIGGERS
-- Execute para ver se as automações existem
-- =====================================================

-- 1. Listar Funções da schema 'public'
SELECT routine_name, routine_definition 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
ORDER BY routine_name;

-- 2. Listar Triggers
SELECT event_object_table as table_name, trigger_name, action_statement as definition
FROM information_schema.triggers
WHERE event_object_schema = 'public'
ORDER BY table_name;
