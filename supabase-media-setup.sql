-- ==========================================
-- MEDIA LIBRARY SETUP SQL
-- Luxury Travel Sweden CMS
-- ==========================================
--
-- Run this SQL in Supabase SQL Editor to set up the media library
--
-- BEFORE RUNNING THIS:
-- 1. Create a storage bucket named 'media' in Supabase Dashboard
-- 2. Make the bucket PUBLIC
-- 3. Then run this SQL script
--

-- ==========================================
-- CREATE MEDIA TABLE
-- ==========================================

-- Create media table to store file metadata
CREATE TABLE IF NOT EXISTS media (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    filename TEXT NOT NULL,
    original_filename TEXT NOT NULL,
    storage_path TEXT NOT NULL UNIQUE,
    url TEXT NOT NULL,
    size_bytes BIGINT NOT NULL,
    mime_type TEXT,
    width INTEGER,
    height INTEGER,
    alt_text TEXT,
    caption TEXT,
    uploaded_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- CREATE INDEXES
-- ==========================================

-- Index for sorting by upload date (most common query)
CREATE INDEX IF NOT EXISTS idx_media_created_at ON media(created_at DESC);

-- Index for finding files by storage path
CREATE INDEX IF NOT EXISTS idx_media_storage_path ON media(storage_path);

-- Index for finding files by uploader
CREATE INDEX IF NOT EXISTS idx_media_uploaded_by ON media(uploaded_by);

-- ==========================================
-- ENABLE ROW LEVEL SECURITY
-- ==========================================

ALTER TABLE media ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- CREATE RLS POLICIES FOR MEDIA TABLE
-- ==========================================

-- Policy: Anyone can view media (public read access)
DROP POLICY IF EXISTS "Anyone can view media" ON media;
CREATE POLICY "Anyone can view media"
ON media FOR SELECT
USING (true);

-- Policy: Authenticated users can insert media
DROP POLICY IF EXISTS "Authenticated users can insert media" ON media;
CREATE POLICY "Authenticated users can insert media"
ON media FOR INSERT
TO authenticated
WITH CHECK (true);

-- Policy: Authenticated users can update media metadata
DROP POLICY IF EXISTS "Authenticated users can update media" ON media;
CREATE POLICY "Authenticated users can update media"
ON media FOR UPDATE
TO authenticated
USING (true);

-- Policy: Authenticated users can delete media
DROP POLICY IF EXISTS "Authenticated users can delete media" ON media;
CREATE POLICY "Authenticated users can delete media"
ON media FOR DELETE
TO authenticated
USING (true);

-- ==========================================
-- CREATE STORAGE POLICIES
-- ==========================================

-- Policy: Public read access to media bucket
DROP POLICY IF EXISTS "Public read access" ON storage.objects;
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'media');

-- Policy: Authenticated users can upload to media bucket
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'media');

-- Policy: Authenticated users can update files in media bucket
DROP POLICY IF EXISTS "Authenticated users can update" ON storage.objects;
CREATE POLICY "Authenticated users can update"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'media');

-- Policy: Authenticated users can delete from media bucket
DROP POLICY IF EXISTS "Authenticated users can delete" ON storage.objects;
CREATE POLICY "Authenticated users can delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'media');

-- ==========================================
-- CREATE TRIGGER FOR UPDATED_AT
-- ==========================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_media_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at on media updates
DROP TRIGGER IF EXISTS trigger_update_media_updated_at ON media;
CREATE TRIGGER trigger_update_media_updated_at
    BEFORE UPDATE ON media
    FOR EACH ROW
    EXECUTE FUNCTION update_media_updated_at();

-- ==========================================
-- VERIFICATION QUERIES
-- ==========================================

-- Check that the table was created
SELECT 'Media table created' AS status, COUNT(*) AS row_count FROM media;

-- Check indexes
SELECT 'Indexes created' AS status,
       COUNT(*) AS index_count
FROM pg_indexes
WHERE tablename = 'media';

-- Check RLS policies
SELECT 'RLS policies created' AS status,
       COUNT(*) AS policy_count
FROM pg_policies
WHERE tablename = 'media';

-- Check storage policies
SELECT 'Storage policies created' AS status,
       COUNT(*) AS policy_count
FROM storage.policies
WHERE bucket_id = 'media';

-- ==========================================
-- SETUP COMPLETE
-- ==========================================

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✓ Media library database setup complete!';
    RAISE NOTICE '';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Verify storage bucket "media" exists and is PUBLIC';
    RAISE NOTICE '2. Navigate to /admin/media.html in your browser';
    RAISE NOTICE '3. Upload test images to verify everything works';
    RAISE NOTICE '';
    RAISE NOTICE 'For detailed setup instructions, see MEDIA_LIBRARY_SETUP.md';
END $$;
