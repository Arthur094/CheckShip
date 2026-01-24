
-- =====================================================
-- SCRIPT DE SINCRONIZAÇÃO DE STORAGE
-- Execute este script no SQL Editor do Supabase STAGING
-- =====================================================

-- 1. Criar Bucket 'checklist-photos' (se não existir)
INSERT INTO storage.buckets (id, name, public)
VALUES ('checklist-photos', 'checklist-photos', false)
ON CONFLICT (id) DO NOTHING;

-- 2. Remover Policies antigas (para evitar duplicação/conflito)
DROP POLICY IF EXISTS "Fotos acessiveis para autenticados" ON storage.objects;
DROP POLICY IF EXISTS "Fotos upload para autenticados" ON storage.objects;
DROP POLICY IF EXISTS "Fotos update para autenticados" ON storage.objects;
DROP POLICY IF EXISTS "Fotos delete para autenticados" ON storage.objects;

-- 3. Criar Policies de Acesso (Segurança)

-- Visualizar: Qualquer usuário logado pode ver as fotos (simplificação para App)
-- Melhoria futura: restringir por empresa se os nomes dos arquivos contiverem path previsível ou metadados.
CREATE POLICY "Fotos acessiveis para autenticados"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'checklist-photos');

-- Upload: Usuário logado pode subir fotos
CREATE POLICY "Fotos upload para autenticados"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'checklist-photos' AND auth.role() = 'authenticated');

-- Update: Usuário dono (quem subiu) pode editar
CREATE POLICY "Fotos update para autenticados"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'checklist-photos' AND owner = auth.uid());

-- Delete: Usuário dono pode deletar
CREATE POLICY "Fotos delete para autenticados"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'checklist-photos' AND owner = auth.uid());
