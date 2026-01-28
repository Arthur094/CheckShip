
-- Add validation columns to checklist_templates
ALTER TABLE public.checklist_templates 
ADD COLUMN IF NOT EXISTS validate_docs BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS validate_user_docs BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS validate_vehicle_docs BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS validate_trailer_docs BOOLEAN DEFAULT false;

-- Commentary for documentation
COMMENT ON COLUMN public.checklist_templates.validate_docs IS 'Master switch for document validation on this checklist template';
COMMENT ON COLUMN public.checklist_templates.validate_user_docs IS 'Whether to validate Driver documents (CNH)';
COMMENT ON COLUMN public.checklist_templates.validate_vehicle_docs IS 'Whether to validate Vehicle documents (CRLV, CIV)';
COMMENT ON COLUMN public.checklist_templates.validate_trailer_docs IS 'Whether to validate Trailer documents (CRLV, CIV)';
