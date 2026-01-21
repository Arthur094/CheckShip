-- Migração para corrigir o esquema do módulo de inspeção

-- 1. Corrigir tabela vehicle_assignments
-- O frontend espera uma coluna 'active' para filtrar atribuições válidas.
ALTER TABLE vehicle_assignments 
ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true;

-- 2. Corrigir tabela checklist_inspections
-- A lógica do frontend depende desses nomes de colunas específicos que estavam faltando.
-- Preferimos adicionar essas colunas para corresponder ao código frontend existente em vez de refatorar o código.

ALTER TABLE checklist_inspections 
ADD COLUMN IF NOT EXISTS answers JSONB DEFAULT '{}'::jsonb;

ALTER TABLE checklist_inspections 
ADD COLUMN IF NOT EXISTS checklist_template_id UUID REFERENCES checklist_templates(id);

ALTER TABLE checklist_inspections 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'in_progress';

ALTER TABLE checklist_inspections 
ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE checklist_inspections 
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

ALTER TABLE checklist_inspections 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE checklist_inspections 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- Garantir que user_id exista e seja uma chave estrangeira para auth.users (se ainda não estiver presente)
-- ALTER TABLE checklist_inspections ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- 3. Criar tabela profiles e gatilhos de segurança
-- Isso garante que cada usuário autenticado tenha um perfil público
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  role TEXT DEFAULT 'MOTORISTA', -- 'GESTOR', 'MOTORISTA', 'OPERADOR'
  document TEXT,                 -- Adicionado com base nos requisitos
  phone TEXT,                    -- Adicionado com base nos requisitos
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 4. Criar Função de Gatilho para criação automática de perfil
-- Cria automaticamente um perfil quando um usuário se cadastra via Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, phone)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    COALESCE(new.raw_user_meta_data->>'role', 'MOTORISTA'),
    new.phone -- Sincronizar telefone do auth.users
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Criar Gatilho
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 6. Corrigir FK de checklist_inspections para Auditoria/Exclusão
-- Garantir que inspector_id exista (usado pelo frontend)
ALTER TABLE checklist_inspections
ADD COLUMN IF NOT EXISTS inspector_id UUID;

-- Atualizar Chave Estrangeira para SET NULL ao excluir para preservar histórico de auditoria
ALTER TABLE checklist_inspections
DROP CONSTRAINT IF EXISTS checklist_inspections_inspector_id_fkey;

ALTER TABLE checklist_inspections
ADD CONSTRAINT checklist_inspections_inspector_id_fkey
FOREIGN KEY (inspector_id) REFERENCES public.profiles(id)
ON DELETE SET NULL;
