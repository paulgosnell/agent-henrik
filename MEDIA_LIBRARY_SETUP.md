# Media Library Setup Guide

This guide will help you set up the media library for the Luxury Travel Sweden CMS admin dashboard.

## Overview

The media library allows you to:
- Upload images via drag-and-drop or file picker
- Browse uploaded images in a grid layout
- Search and sort images
- View image details and metadata
- Copy image URLs to clipboard
- Edit alt text and captions
- Delete images

## Prerequisites

- Supabase project set up and configured
- Admin authentication working
- `supabase-client.js` properly configured

## Setup Steps

### 1. Create Storage Bucket

1. Go to your Supabase Dashboard
2. Navigate to **Storage** in the sidebar
3. Click **New Bucket**
4. Enter the bucket name: `media`
5. Make the bucket **Public** (check the "Public bucket" option)
6. Click **Create Bucket**

### 2. Set Up Storage Policies

After creating the bucket, you need to set up security policies:

1. Click on the `media` bucket
2. Go to **Policies** tab
3. Add the following policies:

#### Policy 1: Allow Public Read Access
```sql
-- Policy Name: Public read access
-- Allowed operation: SELECT
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'media');
```

#### Policy 2: Allow Authenticated Upload
```sql
-- Policy Name: Authenticated users can upload
-- Allowed operation: INSERT
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'media');
```

#### Policy 3: Allow Authenticated Delete
```sql
-- Policy Name: Authenticated users can delete
-- Allowed operation: DELETE
CREATE POLICY "Authenticated users can delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'media');
```

### 3. Create Media Table

Create a table to store media metadata in your database:

1. Go to **SQL Editor** in Supabase Dashboard
2. Run this SQL:

```sql
-- Create media table
CREATE TABLE media (
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

-- Create index for faster queries
CREATE INDEX idx_media_created_at ON media(created_at DESC);
CREATE INDEX idx_media_storage_path ON media(storage_path);

-- Enable Row Level Security
ALTER TABLE media ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Anyone can view media"
ON media FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can insert media"
ON media FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update media"
ON media FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete media"
ON media FOR DELETE
TO authenticated
USING (true);
```

### 4. Verify Setup

Test that everything is configured correctly:

1. Navigate to `/admin/media.html` in your browser
2. Log in with admin credentials
3. Try uploading a test image
4. Verify the image appears in the grid
5. Test search, sort, and preview features

## File Structure

```
admin/
├── media.html          # Media library page
├── media.js            # Media library functionality
├── admin.css           # Shared admin styles
└── auth.js             # Authentication helpers

supabase-client.js      # Supabase client with storage helpers
```

## Usage

### Uploading Images

**Drag and Drop:**
1. Drag image files from your computer
2. Drop them onto the upload zone
3. Watch the upload progress

**File Picker:**
1. Click "Choose Files" button
2. Select one or more images
3. Click "Open"

**File Requirements:**
- Maximum file size: 10MB per file
- Supported formats: JPG, PNG, WEBP, GIF
- Multiple files can be uploaded at once

### Managing Images

**Search:**
- Type in the search box to filter by filename
- Search is case-insensitive

**Sort:**
- Use the sort dropdown to organize images:
  - Newest first (default)
  - Oldest first
  - Name (A-Z)
  - Name (Z-A)
  - Largest first
  - Smallest first

**Copy URL:**
- Click the 🔗 button to copy image URL to clipboard
- URL is copied and ready to paste into content

**View Details:**
- Click the 👁️ button or click on the image
- Opens preview modal with full details
- Shows filename, size, dimensions, upload date
- Edit alt text and caption
- Copy URL or delete image

**Delete:**
- Click the 🗑️ button on the grid item, or
- Click "Delete Image" in the preview modal
- Confirm deletion when prompted
- Image is deleted from storage and database

### Alt Text and Captions

For better accessibility and SEO:

1. Click on an image to open the preview
2. Enter descriptive alt text (e.g., "Northern lights over Swedish Lapland")
3. Optionally add a caption
4. Click "Save Changes"

## Integration with Content Editors

To use media library images in blog posts or stories:

1. Open the media library
2. Find the image you want to use
3. Click the copy URL button (🔗)
4. Paste the URL in your content editor's image field

## Troubleshooting

### Images not uploading

**Check:**
- Storage bucket is created and named `media`
- Bucket is set to public
- Upload policies are configured correctly
- File size is under 10MB
- File format is supported (JPG, PNG, WEBP, GIF)

**Solution:**
```sql
-- Verify storage policies exist
SELECT * FROM storage.policies WHERE bucket_id = 'media';

-- Re-create upload policy if needed
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'media');
```

### Images not displaying

**Check:**
- Bucket is set to public
- Read policy exists
- Media table has entries

**Solution:**
```sql
-- Verify media records exist
SELECT COUNT(*) FROM media;

-- Check if URLs are accessible
SELECT url FROM media LIMIT 5;
```

### Cannot delete images

**Check:**
- Delete policy is configured
- User is authenticated

**Solution:**
```sql
-- Re-create delete policy
CREATE POLICY "Authenticated users can delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'media');
```

### Dimensions not showing

**Note:** Image dimensions are calculated on the client side and saved to the database. If dimensions show as "Unknown":

- Wait a few seconds after upload
- Refresh the page
- Dimensions should populate automatically

## Performance Optimization

### Image Optimization Tips

Before uploading images:

1. **Resize large images** - Keep width under 2000px for most uses
2. **Compress images** - Use tools like TinyPNG or ImageOptim
3. **Use WebP format** - Better compression than JPG/PNG
4. **Remove metadata** - Strip EXIF data to reduce file size

### Recommended Image Sizes

- **Blog hero images:** 1920×1080 or 1600×900
- **Blog inline images:** 1200×800 or 1000×667
- **Thumbnails:** 800×600 or 600×400
- **Icons/logos:** 400×400 or smaller

### Storage Limits

Supabase Free Tier:
- 1GB storage included
- ~200-500 images depending on size

Monitor your usage:
1. Go to Supabase Dashboard
2. Navigate to Storage
3. Check bucket size in Settings

## Security Notes

### Best Practices

1. **Never upload sensitive information** in images
2. **Review images before uploading** for inappropriate content
3. **Use descriptive filenames** without special characters
4. **Add alt text** for accessibility
5. **Regularly audit** uploaded files

### RLS Policies

The media table has Row Level Security (RLS) enabled:

- **Public Read:** Anyone can view media records
- **Authenticated Write:** Only logged-in users can upload
- **Authenticated Update:** Only logged-in users can edit metadata
- **Authenticated Delete:** Only logged-in users can delete

This ensures content is publicly accessible while maintaining control over modifications.

## Advanced Features

### Custom Filename Sanitization

The upload function automatically sanitizes filenames:
- Removes special characters
- Replaces spaces with hyphens
- Adds timestamp prefix to prevent conflicts
- Converts to lowercase

Example: `My Image (1).jpg` → `1234567890-my-image--1-.jpg`

### Upload Progress Tracking

Each file shows real-time upload progress:
- File preview thumbnail
- Upload percentage
- Status messages
- Success/error indicators

### Automatic Dimension Detection

Image dimensions are automatically:
- Detected on client-side
- Saved to database
- Displayed in grid and preview
- Used for responsive layouts

## Support

For issues or questions:

1. Check the browser console for errors
2. Verify Supabase configuration
3. Review this setup guide
4. Check Supabase Dashboard for errors

## Next Steps

After setting up the media library:

1. Upload some test images
2. Integrate with blog/story editors
3. Add image selection widgets to content forms
4. Consider adding image cropping/editing features
5. Set up automated image optimization pipeline

---

**Setup Complete!** Your media library is ready to use.
