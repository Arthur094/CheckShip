-- Migration: Create branches table and link to vehicles
-- Date: 2026-01-28

-- Create branches table
CREATE TABLE IF NOT EXISTS public.branches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    active BOOLEAN DEFAULT true,
    company_id UUID REFERENCES public.companies(id),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Add branch_id to vehicles
ALTER TABLE public.vehicles 
ADD COLUMN IF NOT EXISTS branch_id UUID REFERENCES public.branches(id);

-- Enable RLS
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Authenticated users can view branches"
ON public.branches FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert branches"
ON public.branches FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update branches"
ON public.branches FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete branches"
ON public.branches FOR DELETE
TO authenticated
USING (true);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_vehicles_branch_id ON public.vehicles(branch_id);
