-- Migration: Release Workflows (Feature 6)

BEGIN;

-- 1. Table: Workflows (Catalog)
CREATE TABLE IF NOT EXISTS public.workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Table: Workflow Stages (Definition of Checklists in a Workflow)
CREATE TABLE IF NOT EXISTS public.workflow_stages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID REFERENCES public.workflows(id) ON DELETE CASCADE,
    checklist_template_id TEXT REFERENCES public.checklist_templates(id) ON DELETE CASCADE,
    required BOOLEAN DEFAULT true,
    sequence_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Table: Workflow Executions (The instance run by a driver)
CREATE TABLE IF NOT EXISTS public.workflow_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL, -- Human readable code e.g. FLX-123456
    workflow_id UUID REFERENCES public.workflows(id),
    user_id UUID REFERENCES auth.users(id),
    vehicle_id UUID REFERENCES public.vehicles(id),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Table: Workflow Execution Items (Tracking status of each checklist in the flow)
CREATE TABLE IF NOT EXISTS public.workflow_execution_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    execution_id UUID REFERENCES public.workflow_executions(id) ON DELETE CASCADE,
    checklist_template_id TEXT REFERENCES public.checklist_templates(id),
    inspection_id UUID REFERENCES public.checklist_inspections(id), -- Link to the actual inspection report (nullable until done)
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. RLS Policies

-- Enable RLS
ALTER TABLE public.workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_execution_items ENABLE ROW LEVEL SECURITY;

-- Workflows & Stages (Read: Authenticated, Write: Admins)
CREATE POLICY "Workflows viewable by authenticated" ON public.workflows FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Workflows manageable by admins" ON public.workflows FOR ALL USING (
    exists (select 1 from public.profiles where id = auth.uid() and role IN ('ADMIN_MASTER', 'GESTOR'))
);

CREATE POLICY "Stages viewable by authenticated" ON public.workflow_stages FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Stages manageable by admins" ON public.workflow_stages FOR ALL USING (
    exists (select 1 from public.profiles where id = auth.uid() and role IN ('ADMIN_MASTER', 'GESTOR'))
);

-- Executions (Read: All, Write: Creator/Admin)
CREATE POLICY "Executions viewable by authenticated" ON public.workflow_executions FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Executions insertable by authenticated" ON public.workflow_executions FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Executions updatable by owner or admin" ON public.workflow_executions FOR UPDATE USING (
    auth.uid() = user_id OR 
    exists (select 1 from public.profiles where id = auth.uid() and role IN ('ADMIN_MASTER', 'GESTOR'))
);

-- Execution Items (Read: All, Write: Creator/Admin)
CREATE POLICY "Items viewable by authenticated" ON public.workflow_execution_items FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Items insertable by authenticated" ON public.workflow_execution_items FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Items updatable by authenticated" ON public.workflow_execution_items FOR UPDATE USING (auth.role() = 'authenticated'); -- Simplified for driver updates during flow

-- 6. Indexes
CREATE INDEX IF NOT EXISTS idx_workflow_active ON public.workflows(active);
CREATE INDEX IF NOT EXISTS idx_stages_workflow ON public.workflow_stages(workflow_id);
CREATE INDEX IF NOT EXISTS idx_execution_user ON public.workflow_executions(user_id);
CREATE INDEX IF NOT EXISTS idx_execution_vehicle ON public.workflow_executions(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_execution_status ON public.workflow_executions(status);
CREATE INDEX IF NOT EXISTS idx_items_execution ON public.workflow_execution_items(execution_id);

COMMIT;
