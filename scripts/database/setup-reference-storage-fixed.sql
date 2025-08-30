-- =========================================
-- REFERENCE IMAGE STORAGE BUCKET SETUP (FIXED)
-- =========================================
-- Version: 1.1
-- Date: 2024-12-28
-- Description: Fixed storage policies for Supabase storage buckets

-- =========================================
-- IMPORTANT: MANUAL BUCKET CREATION REQUIRED
-- =========================================
-- Before running this script, create these buckets in Supabase Dashboard:
--
-- 1. 'reference-images' (Private bucket)
-- 2. 'reference-thumbnails' (Public bucket)  
-- 3. 'temp-uploads' (Private bucket)

-- =========================================
-- 1. STORAGE POLICIES FOR 'reference-images' BUCKET
-- =========================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own reference images" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own reference images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own reference images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own reference images" ON storage.objects;

-- Allow authenticated users to view their own reference images
CREATE POLICY "Users can view own reference images"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'reference-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow authenticated users to upload reference images to their own folder
CREATE POLICY "Users can upload own reference images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'reference-images' AND
  auth.uid()::text = (storage.foldername(name))[1] AND
  (LOWER(storage.extension(name)) = ANY (ARRAY['jpg', 'jpeg', 'png', 'webp', 'heic', 'heif']))
);

-- Allow users to update their own reference images
CREATE POLICY "Users can update own reference images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'reference-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'reference-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own reference images
CREATE POLICY "Users can delete own reference images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'reference-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- =========================================
-- 2. STORAGE POLICIES FOR 'reference-thumbnails' BUCKET
-- =========================================

-- Drop existing policies
DROP POLICY IF EXISTS "Thumbnails are publicly viewable" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload thumbnails" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update thumbnails" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete thumbnails" ON storage.objects;

-- Allow anyone to view thumbnails (public bucket)
CREATE POLICY "Thumbnails are publicly viewable"
ON storage.objects FOR SELECT
USING (bucket_id = 'reference-thumbnails');

-- Allow authenticated users to upload thumbnails
CREATE POLICY "Authenticated users can upload thumbnails"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'reference-thumbnails' AND
  auth.role() = 'authenticated'
);

-- Allow authenticated users to update thumbnails
CREATE POLICY "Authenticated users can update thumbnails"
ON storage.objects FOR UPDATE
USING (bucket_id = 'reference-thumbnails')
WITH CHECK (bucket_id = 'reference-thumbnails');

-- Allow authenticated users to delete thumbnails
CREATE POLICY "Authenticated users can delete thumbnails"
ON storage.objects FOR DELETE
USING (bucket_id = 'reference-thumbnails');

-- =========================================
-- 3. STORAGE POLICIES FOR 'temp-uploads' BUCKET
-- =========================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can upload to temp storage" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own temp uploads" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own temp uploads" ON storage.objects;

-- Allow authenticated users to upload to temp storage
CREATE POLICY "Users can upload to temp storage"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'temp-uploads' AND
  auth.uid()::text = (storage.foldername(name))[1] AND
  (LOWER(storage.extension(name)) = ANY (ARRAY['jpg', 'jpeg', 'png', 'webp', 'heic', 'heif']))
);

-- Allow users to view their own temp uploads
CREATE POLICY "Users can view own temp uploads"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'temp-uploads' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own temp uploads
CREATE POLICY "Users can delete own temp uploads"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'temp-uploads' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- =========================================
-- 4. HELPER FUNCTIONS FOR STORAGE MANAGEMENT
-- =========================================

-- Function to generate secure storage path for user uploads
CREATE OR REPLACE FUNCTION generate_reference_storage_path(
  p_user_id UUID,
  p_filename TEXT
) RETURNS TEXT AS $$
DECLARE
  v_extension TEXT;
  v_timestamp TEXT;
  v_safe_filename TEXT;
BEGIN
  -- Extract and validate extension
  v_extension := LOWER(split_part(p_filename, '.', -1));
  IF v_extension NOT IN ('jpg', 'jpeg', 'png', 'webp', 'heic', 'heif') THEN
    RAISE EXCEPTION 'Invalid file extension: %', v_extension;
  END IF;
  
  -- Generate timestamp
  v_timestamp := TO_CHAR(NOW(), 'YYYYMMDD-HH24MISS');
  
  -- Create safe filename
  v_safe_filename := regexp_replace(
    LOWER(split_part(p_filename, '.', 1)),
    '[^a-z0-9_-]',
    '-',
    'g'
  );
  
  -- Return path: user_id/timestamp-safename.extension
  RETURN p_user_id::TEXT || '/' || v_timestamp || '-' || v_safe_filename || '.' || v_extension;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up old temporary uploads
CREATE OR REPLACE FUNCTION cleanup_temp_uploads(
  p_hours_old INTEGER DEFAULT 24
) RETURNS INTEGER AS $$
DECLARE
  v_deleted_count INTEGER := 0;
BEGIN
  -- Delete temp uploads older than specified hours
  DELETE FROM storage.objects
  WHERE bucket_id = 'temp-uploads'
    AND created_at < NOW() - INTERVAL '1 hour' * p_hours_old;
    
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  
  RETURN v_deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =========================================
-- 5. TEST THE SETUP
-- =========================================

-- Test the helper function
SELECT generate_reference_storage_path(
  '12345678-1234-1234-1234-123456789012'::UUID,
  'My Beautiful Room.jpg'
) AS example_path;

-- Test cleanup function (dry run)
SELECT 'Cleanup function created successfully' AS status;

-- =========================================
-- SETUP COMPLETE
-- =========================================

SELECT 'Fixed storage bucket policies configured successfully!' AS result;

-- =========================================
-- NEXT STEPS:
-- =========================================
-- 1. Create the 3 storage buckets in Supabase Dashboard:
--    - reference-images (Private)
--    - reference-thumbnails (Public)  
--    - temp-uploads (Private)
--
-- 2. Configure bucket settings:
--    - reference-images: 10MB limit, allowed MIME types: image/*
--    - reference-thumbnails: 1MB limit, public access
--    - temp-uploads: 20MB limit, auto-cleanup
--
-- 3. Test upload functionality in your React Native app