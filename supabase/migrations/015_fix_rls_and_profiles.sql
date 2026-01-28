
-- 1. Add avatar_url to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- 2. Setup RLS for checklist assignments (Vehicle)
ALTER TABLE public.vehicle_checklist_assignments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "allow_all_checklist_assignments" ON public.vehicle_checklist_assignments;
CREATE POLICY "allow_all_checklist_assignments" 
ON public.vehicle_checklist_assignments FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- 3. Setup RLS for checklist permissions (User)
ALTER TABLE public.profile_checklist_permissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "allow_all_checklist_permissions" ON public.profile_checklist_permissions;
CREATE POLICY "allow_all_checklist_permissions" 
ON public.profile_checklist_permissions FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- 4. Setup RLS for vehicle type checklist assignments
ALTER TABLE public.vehicle_type_checklist_assignments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "allow_all_type_checklist_assignments" ON public.vehicle_type_checklist_assignments;
CREATE POLICY "allow_all_type_checklist_assignments" 
ON public.vehicle_type_checklist_assignments FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);
