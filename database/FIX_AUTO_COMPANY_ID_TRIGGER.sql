
-- =====================================================
-- FIX FINAL: AUTO-COMPLETE COMPANY_ID (V2 - Syntax Corrected)
-- Problema: O Frontend está enviando company_id = NULL.
-- Solução: Trigger que injeta a empresa do usuário antes de salvar.
-- ISso faz o RLS passar e os dados ficarem consistentes.
-- =====================================================

-- 1. Função Genérica para preencher company_id
CREATE OR REPLACE FUNCTION public.set_auto_company_id()
RETURNS TRIGGER AS $$
BEGIN
  -- Se não veio company_id, tenta pegar do usuário logado
  IF NEW.company_id IS NULL THEN
    NEW.company_id := public.get_user_company_id();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Trigger para Vehicle Types
DROP TRIGGER IF EXISTS trg_set_company_vehicle_types ON public.vehicle_types;

CREATE TRIGGER trg_set_company_vehicle_types
BEFORE INSERT ON public.vehicle_types
FOR EACH ROW
EXECUTE FUNCTION public.set_auto_company_id();

-- 3. (Preventivo) Trigger para Checklist Templates
DROP TRIGGER IF EXISTS trg_set_company_checklists ON public.checklist_templates;

CREATE TRIGGER trg_set_company_checklists
BEFORE INSERT ON public.checklist_templates
FOR EACH ROW
EXECUTE FUNCTION public.set_auto_company_id();


-- 4. Aviso Final (Corrigido dentro do DO block)
DO $$
BEGIN
  RAISE NOTICE '✅ Triggers de Auto-Company configuradas. Agora o banco corrige o NULL do Frontend.';
END $$;
