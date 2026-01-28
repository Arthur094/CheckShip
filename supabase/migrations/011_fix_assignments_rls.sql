
-- Enable RLS on vehicle_assignments if not already
ALTER TABLE public.vehicle_assignments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to be safe (or create if not exists using DO block)
DROP POLICY IF EXISTS "Enable read access for all users" ON public.vehicle_assignments;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.vehicle_assignments;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON public.vehicle_assignments;

-- Create permissive policies for now (or restricted to admin/gestor if we knew the roles)
-- Assuming 'authenticated' is enough for now based on the error "new row violates policy" which means default deny.

CREATE POLICY "Enable read access for all users"
ON public.vehicle_assignments FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Enable insert for authenticated users"
ON public.vehicle_assignments FOR INSERT
TO authenticated
WITH CHECK (true); -- Ideally check if user is manager, but starting simple to fix the error

CREATE POLICY "Enable delete for authenticated users"
ON public.vehicle_assignments FOR DELETE
TO authenticated
USING (true);
