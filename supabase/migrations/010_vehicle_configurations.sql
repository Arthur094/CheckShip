
-- Create vehicle_configurations table
CREATE TABLE IF NOT EXISTS public.vehicle_configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('RIGID', 'ARTICULATED')),
    plates_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add column to vehicles
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vehicles' AND column_name = 'vehicle_configuration_id') THEN
        ALTER TABLE public.vehicles ADD COLUMN vehicle_configuration_id UUID REFERENCES public.vehicle_configurations(id);
    END IF;
END $$;

-- Enable RLS
ALTER TABLE public.vehicle_configurations ENABLE ROW LEVEL SECURITY;

-- Create Policies
DROP POLICY IF EXISTS "Public read access for vehicle_configurations" ON public.vehicle_configurations;
CREATE POLICY "Public read access for vehicle_configurations"
ON public.vehicle_configurations FOR SELECT
TO public
USING (true);

-- Insert Seed Data
INSERT INTO public.vehicle_configurations (name, category, plates_count)
SELECT 'VUC / ¾', 'RIGID', 0
WHERE NOT EXISTS (SELECT 1 FROM public.vehicle_configurations WHERE name = 'VUC / ¾');

INSERT INTO public.vehicle_configurations (name, category, plates_count)
SELECT 'Toco', 'RIGID', 0
WHERE NOT EXISTS (SELECT 1 FROM public.vehicle_configurations WHERE name = 'Toco');

INSERT INTO public.vehicle_configurations (name, category, plates_count)
SELECT 'Truck', 'RIGID', 0
WHERE NOT EXISTS (SELECT 1 FROM public.vehicle_configurations WHERE name = 'Truck');

INSERT INTO public.vehicle_configurations (name, category, plates_count)
SELECT 'Bitruck', 'RIGID', 0
WHERE NOT EXISTS (SELECT 1 FROM public.vehicle_configurations WHERE name = 'Bitruck');

INSERT INTO public.vehicle_configurations (name, category, plates_count)
SELECT 'Carreta Simples 1:1', 'ARTICULATED', 1
WHERE NOT EXISTS (SELECT 1 FROM public.vehicle_configurations WHERE name = 'Carreta Simples 1:1');

INSERT INTO public.vehicle_configurations (name, category, plates_count)
SELECT 'Bitrem 1:2', 'ARTICULATED', 2
WHERE NOT EXISTS (SELECT 1 FROM public.vehicle_configurations WHERE name = 'Bitrem 1:2');

INSERT INTO public.vehicle_configurations (name, category, plates_count)
SELECT 'Rodotrem 1:3', 'ARTICULATED', 3
WHERE NOT EXISTS (SELECT 1 FROM public.vehicle_configurations WHERE name = 'Rodotrem 1:3');
