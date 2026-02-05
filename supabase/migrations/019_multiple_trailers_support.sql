-- Migration: Support for multiple trailers per vehicle
-- A vehicle can have up to 3 trailers depending on its configuration
-- A trailer can only be linked to one vehicle at a time

-- Step 1: Add new columns for multiple trailers
ALTER TABLE public.vehicles
ADD COLUMN IF NOT EXISTS trailer_id_1 UUID REFERENCES public.trailers(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS trailer_id_2 UUID REFERENCES public.trailers(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS trailer_id_3 UUID REFERENCES public.trailers(id) ON DELETE SET NULL;

-- Step 2: Migrate existing data from trailer_id to trailer_id_1
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vehicles' AND column_name = 'trailer_id') THEN
        UPDATE public.vehicles
        SET trailer_id_1 = trailer_id
        WHERE trailer_id IS NOT NULL;
    END IF;
END $$;

-- Step 3: Remove old trailer_id column
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vehicles' AND column_name = 'trailer_id') THEN
        ALTER TABLE public.vehicles DROP COLUMN trailer_id;
    END IF;
END $$;

-- Step 4: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_vehicles_trailer_id_1 ON public.vehicles(trailer_id_1);
CREATE INDEX IF NOT EXISTS idx_vehicles_trailer_id_2 ON public.vehicles(trailer_id_2);
CREATE INDEX IF NOT EXISTS idx_vehicles_trailer_id_3 ON public.vehicles(trailer_id_3);

-- Step 5: Create function to validate trailer exclusivity
-- This ensures a trailer cannot be in multiple vehicles at the same time
CREATE OR REPLACE FUNCTION check_trailer_exclusivity()
RETURNS TRIGGER AS $$
DECLARE
    trailer_ids UUID[];
    trailer_id UUID;
    conflict_vehicle_id UUID;
    conflict_slot TEXT;
BEGIN
    -- Collect all non-null trailer IDs from the new record
    trailer_ids := ARRAY[]::UUID[];
    
    IF NEW.trailer_id_1 IS NOT NULL THEN
        trailer_ids := array_append(trailer_ids, NEW.trailer_id_1);
    END IF;
    IF NEW.trailer_id_2 IS NOT NULL THEN
        trailer_ids := array_append(trailer_ids, NEW.trailer_id_2);
    END IF;
    IF NEW.trailer_id_3 IS NOT NULL THEN
        trailer_ids := array_append(trailer_ids, NEW.trailer_id_3);
    END IF;
    
    -- Check for duplicates within the same vehicle
    IF array_length(trailer_ids, 1) IS NOT NULL AND 
       array_length(trailer_ids, 1) != (SELECT COUNT(DISTINCT unnest) FROM unnest(trailer_ids)) THEN
        RAISE EXCEPTION 'A trailer cannot be assigned to multiple slots in the same vehicle';
    END IF;
    
    -- Check if any trailer is already assigned to another vehicle
    FOREACH trailer_id IN ARRAY trailer_ids
    LOOP
        -- Check trailer_id_1 slot
        SELECT id INTO conflict_vehicle_id
        FROM public.vehicles
        WHERE id != NEW.id AND trailer_id_1 = trailer_id;
        
        IF conflict_vehicle_id IS NOT NULL THEN
            RAISE EXCEPTION 'Trailer is already assigned to another vehicle (slot 1)';
        END IF;
        
        -- Check trailer_id_2 slot
        SELECT id INTO conflict_vehicle_id
        FROM public.vehicles
        WHERE id != NEW.id AND trailer_id_2 = trailer_id;
        
        IF conflict_vehicle_id IS NOT NULL THEN
            RAISE EXCEPTION 'Trailer is already assigned to another vehicle (slot 2)';
        END IF;
        
        -- Check trailer_id_3 slot
        SELECT id INTO conflict_vehicle_id
        FROM public.vehicles
        WHERE id != NEW.id AND trailer_id_3 = trailer_id;
        
        IF conflict_vehicle_id IS NOT NULL THEN
            RAISE EXCEPTION 'Trailer is already assigned to another vehicle (slot 3)';
        END IF;
    END LOOP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 6: Create trigger to enforce exclusivity
DROP TRIGGER IF EXISTS trigger_check_trailer_exclusivity ON public.vehicles;
CREATE TRIGGER trigger_check_trailer_exclusivity
    BEFORE INSERT OR UPDATE ON public.vehicles
    FOR EACH ROW
    EXECUTE FUNCTION check_trailer_exclusivity();

-- Step 7: Add helpful comments
COMMENT ON COLUMN public.vehicles.trailer_id_1 IS 'First trailer slot (Carreta 1)';
COMMENT ON COLUMN public.vehicles.trailer_id_2 IS 'Second trailer slot (Carreta 2) - Only for Bitrem and Rodotrem';
COMMENT ON COLUMN public.vehicles.trailer_id_3 IS 'Third trailer slot (Carreta 3) - Only for Rodotrem';
