-- Migration: Template Versioning (FIXED v2)
-- Changed group_id to TEXT because 'id' is TEXT (custom format chk_...)

BEGIN;

-- 1. Add new columns
ALTER TABLE public.checklist_templates
ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
ADD COLUMN IF NOT EXISTS group_id TEXT, -- Changed from UUID to TEXT
ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ DEFAULT NOW();

-- 2. Backfill existing data
UPDATE public.checklist_templates
SET group_id = id
WHERE group_id IS NULL;

-- 3. Add Constraints
ALTER TABLE public.checklist_templates
ALTER COLUMN group_id SET NOT NULL;

-- Ensure unique version per group
CREATE UNIQUE INDEX IF NOT EXISTS idx_template_group_version 
ON public.checklist_templates(group_id, version);

-- 4. Create Indexes
CREATE INDEX IF NOT EXISTS idx_template_status 
ON public.checklist_templates(status);

CREATE INDEX IF NOT EXISTS idx_template_group 
ON public.checklist_templates(group_id);

COMMIT;
