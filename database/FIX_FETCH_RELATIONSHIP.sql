
-- =====================================================
-- FIX FETCH RELATIONSHIP - STAGING
-- Objetivo: Desbloquear tabelas relacionadas (Junction & Templates)
-- Erro Atual: "Could not find a relationship..." (400)
-- Causa: RLS bloqueando a visibilidade da Foreign Key nas tabelas filhas.
-- =====================================================

-- 1. TABELA DE JUNÇÃO: vehicle_type_checklist_assignments
-- Se o RLS bloqueia aqui, o Supabase não consegue fazer o JOIN.

ALTER TABLE public.vehicle_type_checklist_assignments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Junction Read" ON public.vehicle_type_checklist_assignments;
DROP POLICY IF EXISTS "Junction Write" ON public.vehicle_type_checklist_assignments;

-- Permitir leitura se a empresa bater (via vehicle_type ou checklist_template - simplificamos pegando do user)
CREATE POLICY "Junction Read" ON public.vehicle_type_checklist_assignments FOR SELECT TO authenticated
USING (
    company_id = public.get_user_company_id()
);

-- Permitir escrita para usuários da empresa (Simplificado para evitar erro de Role)
CREATE POLICY "Junction Write" ON public.vehicle_type_checklist_assignments FOR ALL TO authenticated
USING (company_id = public.get_user_company_id())
WITH CHECK (company_id = public.get_user_company_id());


-- 2. TABELA DE TEMPLATES: checklist_templates
ALTER TABLE public.checklist_templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Templates Read" ON public.checklist_templates;
DROP POLICY IF EXISTS "Templates Write" ON public.checklist_templates;

-- Leitura
CREATE POLICY "Templates Read" ON public.checklist_templates FOR SELECT TO authenticated
USING (
    company_id = public.get_user_company_id()
);

-- Escrita (Simplificado)
CREATE POLICY "Templates Write" ON public.checklist_templates FOR ALL TO authenticated
USING (company_id = public.get_user_company_id())
WITH CHECK (company_id = public.get_user_company_id());


-- 3. (Bônus) Trigger de Auto-Company para a Junção também
-- Caso o frontend tente salvar relação sem mandar company_id
CREATE OR REPLACE FUNCTION public.set_auto_company_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.company_id IS NULL THEN
    NEW.company_id := public.get_user_company_id();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_set_company_junction ON public.vehicle_type_checklist_assignments;
CREATE TRIGGER trg_set_company_junction
BEFORE INSERT ON public.vehicle_type_checklist_assignments
FOR EACH ROW
EXECUTE FUNCTION public.set_auto_company_id();


DO $$
BEGIN
  RAISE NOTICE '✅ Tabelas relacionadas (Junction e Templates) desbloqueadas. O fetch deve funcionar agora.';
END $$;
