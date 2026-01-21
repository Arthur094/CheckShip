/**
 * SCRIPT DE CORREÇÃO FINAL - CHECKLISTS E RLS
 * 
 * 1. Sincroniza metadados (garante que company_id esteja no JWT)
 * 2. Adiciona valor DEFAULT para company_id em todas as tabelas
 *    (garante que INSERTS sem company_id funcionem automaticamente)
 */

-- PARTE 1: Sincronizar user_metadata (Executar para corrigir usuários existentes)
DO $$
DECLARE
    profile_record RECORD;
BEGIN
    FOR profile_record IN 
        SELECT p.id, p.company_id, p.full_name, p.role
        FROM public.profiles p
        WHERE p.company_id IS NOT NULL
    LOOP
        UPDATE auth.users
        SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || 
            jsonb_build_object(
                'company_id', profile_record.company_id::text,
                'full_name', profile_record.full_name,
                'role', profile_record.role
            )
        WHERE id = profile_record.id;
    END LOOP;
END $$;

-- PARTE 2: Adicionar DEFAULT nas tabelas para evitar erros de INSERT
-- Isso garante que se o front não enviar company_id, o banco preenche usando o JWT

ALTER TABLE public.checklist_inspections ALTER COLUMN company_id SET DEFAULT public.get_user_company_id();
ALTER TABLE public.vehicles ALTER COLUMN company_id SET DEFAULT public.get_user_company_id();
ALTER TABLE public.vehicle_types ALTER COLUMN company_id SET DEFAULT public.get_user_company_id();
ALTER TABLE public.checklist_templates ALTER COLUMN company_id SET DEFAULT public.get_user_company_id();
ALTER TABLE public.vehicle_assignments ALTER COLUMN company_id SET DEFAULT public.get_user_company_id();
ALTER TABLE public.vehicle_checklist_assignments ALTER COLUMN company_id SET DEFAULT public.get_user_company_id();
ALTER TABLE public.checklist_records ALTER COLUMN company_id SET DEFAULT public.get_user_company_id();
ALTER TABLE public.inspection_photos ALTER COLUMN company_id SET DEFAULT public.get_user_company_id();
ALTER TABLE public.access_profiles ALTER COLUMN company_id SET DEFAULT public.get_user_company_id();
