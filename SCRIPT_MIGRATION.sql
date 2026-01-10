-- Migration to fix Inspection Module Schema

-- 1. Fix vehicle_assignments table
-- The frontend expects an 'active' column to filter valid assignments.
ALTER TABLE vehicle_assignments 
ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true;

-- 2. Fix checklist_inspections table
-- The frontend logic relies on these specific column names which were missing.
-- We prefer adding these columns to match the existing frontend code rather than refactoring the code.

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

-- Ensure user_id exists and is a foreign key to auth.users (if not already present)
-- ALTER TABLE checklist_inspections ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
