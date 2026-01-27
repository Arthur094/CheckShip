-- Migration: Create signatures bucket for digital signatures storage
-- Run this in Supabase SQL Editor

-- Note: Storage buckets are typically created via Dashboard or API
-- This SQL creates the necessary policies for the bucket

-- First, create the bucket via Dashboard:
-- 1. Go to Storage > Create bucket
-- 2. Name: "signatures"
-- 3. Public: OFF (we'll use signed URLs or authenticated access)

-- Create storage policies for the signatures bucket

-- Allow authenticated users to upload signatures
CREATE POLICY "Authenticated users can upload signatures"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'signatures');

-- Allow authenticated users to read signatures
CREATE POLICY "Authenticated users can read signatures"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'signatures');

-- Allow users to update their own signatures (optional)
CREATE POLICY "Users can update signatures"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'signatures')
WITH CHECK (bucket_id = 'signatures');

-- Allow users to delete signatures (optional, for cleanup)
CREATE POLICY "Users can delete signatures"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'signatures');
