-- Create unique partial indexes to ensure one active document type per entity
-- This prevents duplicates like having two 'CNH' entries for the same driver.

-- 1. Unique index for Drivers (profile_id)
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_driver_doc 
ON public.management_documents(profile_id, document_type) 
WHERE profile_id IS NOT NULL;

-- 2. Unique index for Vehicles (vehicle_id)
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_vehicle_doc 
ON public.management_documents(vehicle_id, document_type) 
WHERE vehicle_id IS NOT NULL;

-- 3. Unique index for Trailers (trailer_id)
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_trailer_doc 
ON public.management_documents(trailer_id, document_type) 
WHERE trailer_id IS NOT NULL;
