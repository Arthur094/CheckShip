
-- =================================================================
-- SCRIPT DE SINCRONIZAÇÃO DE SCHEMA (SEM DADOS)
-- =================================================================

-- 1. Remover Foreign Keys que impedem alteração de tipo ou bloqueiam importação
-- (Necessário para permitir que o schema do Staging aceite IDs alphanuméricos de Prod se necessário futuramente,
-- e para resolver dependências cíclicas).
ALTER TABLE public.vehicle_checklist_assignments DROP CONSTRAINT IF EXISTS vehicle_checklist_assignments_checklist_template_id_fkey;
ALTER TABLE public.checklist_inspections DROP CONSTRAINT IF EXISTS checklist_inspections_checklist_template_id_fkey;
ALTER TABLE public.profile_checklist_permissions DROP CONSTRAINT IF EXISTS profile_checklist_permissions_checklist_template_id_fkey;
ALTER TABLE public.vehicle_type_checklists DROP CONSTRAINT IF EXISTS vehicle_type_checklists_checklist_template_id_fkey;
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- 2. Converter IDs para TEXT 
-- (Prod usa IDs alphanuméricos ex: 'chk_...', então Staging deve suportar isso para compatibilidade futura de código)
ALTER TABLE public.checklist_templates ALTER COLUMN id TYPE TEXT;
ALTER TABLE public.vehicle_checklist_assignments ALTER COLUMN checklist_template_id TYPE TEXT;
ALTER TABLE public.checklist_inspections ALTER COLUMN checklist_template_id TYPE TEXT;
ALTER TABLE public.profile_checklist_permissions ALTER COLUMN checklist_template_id TYPE TEXT;
ALTER TABLE public.vehicle_type_checklists ALTER COLUMN checklist_template_id TYPE TEXT;

-- 3. Adicionar Colunas Faltantes (Paridade de Funcionalidades)

-- 3.1 checklist_templates
ALTER TABLE public.checklist_templates ADD COLUMN IF NOT EXISTS subject TEXT;
ALTER TABLE public.checklist_templates ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.checklist_templates ADD COLUMN IF NOT EXISTS structure JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.checklist_templates ADD COLUMN IF NOT EXISTS target_vehicle_types JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.checklist_templates ADD COLUMN IF NOT EXISTS assigned_user_ids JSONB DEFAULT '[]'::jsonb;

-- 3.2 vehicle_types
ALTER TABLE public.vehicle_types ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true;

-- 3.3 vehicles
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS current_km NUMERIC;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS renavam TEXT;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS crlv_expiry DATE;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS color TEXT;

-- 3.4 checklist_inspections
ALTER TABLE public.checklist_inspections ADD COLUMN IF NOT EXISTS responses JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.checklist_inspections ADD COLUMN IF NOT EXISTS data_json JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.checklist_inspections ADD COLUMN IF NOT EXISTS odometer_reading TEXT;
ALTER TABLE public.checklist_inspections ADD COLUMN IF NOT EXISTS analysis_status TEXT;
ALTER TABLE public.checklist_inspections ADD COLUMN IF NOT EXISTS analysis_current_step INTEGER;
ALTER TABLE public.checklist_inspections ADD COLUMN IF NOT EXISTS analysis_total_steps INTEGER;
ALTER TABLE public.checklist_inspections ADD COLUMN IF NOT EXISTS analysis_first_result TEXT;
ALTER TABLE public.checklist_inspections ADD COLUMN IF NOT EXISTS analysis_first_by UUID;
ALTER TABLE public.checklist_inspections ADD COLUMN IF NOT EXISTS analysis_first_at TIMESTAMPTZ;
ALTER TABLE public.checklist_inspections ADD COLUMN IF NOT EXISTS analysis_first_reason TEXT;
ALTER TABLE public.checklist_inspections ADD COLUMN IF NOT EXISTS analysis_second_result TEXT;
ALTER TABLE public.checklist_inspections ADD COLUMN IF NOT EXISTS analysis_second_by UUID;
ALTER TABLE public.checklist_inspections ADD COLUMN IF NOT EXISTS analysis_second_at TIMESTAMPTZ;
ALTER TABLE public.checklist_inspections ADD COLUMN IF NOT EXISTS analysis_second_reason TEXT;

-- 3.5 profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS force_password_change BOOLEAN DEFAULT false;


-- 4. Restaurar Foreign Keys
-- (Recria as FKs adequadas para os novos tipos)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'vehicle_checklist_assignments_checklist_template_id_fkey') THEN
        ALTER TABLE public.vehicle_checklist_assignments 
        ADD CONSTRAINT vehicle_checklist_assignments_checklist_template_id_fkey 
        FOREIGN KEY (checklist_template_id) REFERENCES public.checklist_templates(id) ON DELETE CASCADE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'checklist_inspections_checklist_template_id_fkey') THEN
        ALTER TABLE public.checklist_inspections 
        ADD CONSTRAINT checklist_inspections_checklist_template_id_fkey 
        FOREIGN KEY (checklist_template_id) REFERENCES public.checklist_templates(id) ON DELETE SET NULL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'profile_checklist_permissions_checklist_template_id_fkey') THEN
        ALTER TABLE public.profile_checklist_permissions 
        ADD CONSTRAINT profile_checklist_permissions_checklist_template_id_fkey 
        FOREIGN KEY (checklist_template_id) REFERENCES public.checklist_templates(id) ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'vehicle_type_checklists_checklist_template_id_fkey') THEN
        ALTER TABLE public.vehicle_type_checklists 
        ADD CONSTRAINT vehicle_type_checklists_checklist_template_id_fkey 
        FOREIGN KEY (checklist_template_id) REFERENCES public.checklist_templates(id) ON DELETE CASCADE;
    END IF;
EXCEPTION
    WHEN OTHERS THEN RAISE NOTICE 'Não foi possível recriar FKs agora. Verifique a consistência dos dados existentes. Erro: %', SQLERRM;
END $$;
