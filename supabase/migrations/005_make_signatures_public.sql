-- Make signatures bucket public for read access
UPDATE storage.buckets
SET public = true
WHERE id = 'signatures';

-- Ensure policy allows public read access
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'signatures' );
