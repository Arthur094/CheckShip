-- Add signature columns to checklist_inspections table

ALTER TABLE checklist_inspections
ADD COLUMN IF NOT EXISTS driver_signature_url TEXT,
ADD COLUMN IF NOT EXISTS analyst_signature_url TEXT;

-- Add comments for documentation
COMMENT ON COLUMN checklist_inspections.driver_signature_url IS 'URL of the driver signature image in storage';
COMMENT ON COLUMN checklist_inspections.analyst_signature_url IS 'URL of the analyst/manager signature image in storage';
