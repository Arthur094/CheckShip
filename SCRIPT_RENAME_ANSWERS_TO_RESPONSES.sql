-- SCRIPT: Renomear coluna 'answers' para 'responses' na tabela checklist_inspections
-- Objetivo: Corrigir incompatibilidade entre código e schema do banco

-- Opção 1: Se a coluna se chama 'answers', renomeie para 'responses'
ALTER TABLE checklist_inspections 
RENAME COLUMN answers TO responses;

-- Opção 2: Se a coluna 'answers' não existir e 'responses' também não, crie 'responses'
-- (Descomente se necessário)
-- ALTER TABLE checklist_inspections 
-- ADD COLUMN IF NOT EXISTS responses JSONB;

-- Verificar o resultado
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'checklist_inspections' 
  AND column_name IN ('answers', 'responses');
