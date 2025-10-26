# Media Library - Luxury Travel Sweden CMS

A complete media management system for the admin dashboard with drag-and-drop upload, image browsing, metadata editing, and URL copying.

## Quick Start

### 1. Run Database Setup

In Supabase SQL Editor, run:
```bash
supabase-media-setup.sql
```

### 2. Create Storage Bucket

In Supabase Dashboard:
1. Go to **Storage**
2. Create new bucket: `media`
3. Make it **Public**

### 3. Access Media Library

Navigate to:
```
/admin/media.html
```

## Features

### Upload
- **Drag & Drop** - Drag images directly onto the upload zone
- **File Picker** - Click to browse and select files
- **Multi-file Upload** - Upload multiple images at once
- **Progress Tracking** - Real-time progress for each upload
- **Instant Preview** - See thumbnails immediately
- **Validation** - Automatic file type and size checking

### Browse & Search
- **Grid Layout** - Responsive 3-4 column grid
- **Search** - Filter by filename
- **Sort** - By date, name, or size
- **Thumbnails** - Optimized image previews
- **File Count** - See total number of files

### Image Details
- **Preview Modal** - Full-size image view
- **Metadata Display**:
  - Filename
  - File size
  - Dimensions (width × height)
  - Upload date
  - Image URL
- **Copy URL** - One-click URL copying
- **Edit Fields**:
  - Alt text (for accessibility)
  - Caption (optional description)

### Actions
- **View** - Open full preview modal
- **Copy URL** - Copy image URL to clipboard
- **Delete** - Remove from storage and database
- **Edit Metadata** - Update alt text and caption

## File Requirements

### Supported Formats
- JPG / JPEG
- PNG
- WEBP
- GIF

### Size Limits
- Maximum: 10MB per file
- Recommended: Under 2MB for optimal performance

### Recommended Dimensions
- Hero images: 1920×1080 or 1600×900
- Blog images: 1200×800 or 1000×667
- Thumbnails: 800×600 or 600×400

## User Interface

### Upload Zone
```
┌─────────────────────────────────┐
│         📁                      │
│  Drag & drop images here        │
│                                 │
│         or                      │
│                                 │
│    [Choose Files]               │
│                                 │
│  Maximum 10MB • JPG, PNG, etc   │
└─────────────────────────────────┘
```

### Media Grid
```
┌─────────┬─────────┬─────────┬─────────┐
│  Image  │  Image  │  Image  │  Image  │
│  ┌───┐  │  ┌───┐  │  ┌───┐  │  ┌───┐  │
│  └───┘  │  └───┘  │  └───┘  │  └───┘  │
│ name.jpg│ pic.png │ photo..│ test.jpg│
│ 1.2 MB  │ 800 KB  │ 2.1 MB │ 500 KB  │
│ 🔗 👁️ 🗑️ │ 🔗 👁️ 🗑️ │ 🔗 👁️ 🗑️ │ 🔗 👁️ 🗑️ │
└─────────┴─────────┴─────────┴─────────┘
```

### Actions Legend
- 🔗 **Copy URL** - Copy image URL to clipboard
- 👁️ **View** - Open preview modal
- 🗑️ **Delete** - Remove image

## Technical Details

### File Structure
```
admin/
├── media.html          # Media library page (901 lines)
├── media.js            # JavaScript functionality (695 lines)
├── admin.css           # Shared admin styles
└── auth.js             # Authentication helpers

supabase-client.js      # Supabase client with Storage API
```

### Database Schema
```sql
media
├── id (UUID, primary key)
├── filename (TEXT)
├── original_filename (TEXT)
├── storage_path (TEXT, unique)
├── url (TEXT)
├── size_bytes (BIGINT)
├── mime_type (TEXT)
├── width (INTEGER)
├── height (INTEGER)
├── alt_text (TEXT)
├── caption (TEXT)
├── uploaded_by (UUID, foreign key)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)
```

### Storage Bucket
- **Name:** `media`
- **Access:** Public
- **Policies:**
  - Public read
  - Authenticated upload/update/delete

### API Methods

#### Upload File
```javascript
const result = await window.Supabase.storage.uploadFile(file);
// Returns: { path, url, mediaId }
```

#### Get All Files
```javascript
const files = await window.Supabase.storage.getMediaFiles();
// Returns: Array of media records
```

#### Delete File
```javascript
await window.Supabase.storage.deleteFile(storagePath);
// Deletes from storage and database
```

#### Get Public URL
```javascript
const url = window.Supabase.storage.getPublicUrl(path);
// Returns: Public URL string
```

## Workflow Examples

### Upload Images for Blog Post

1. Open media library (`/admin/media.html`)
2. Drag images from your desktop
3. Wait for upload to complete
4. Click 🔗 to copy URL
5. Paste URL in blog post editor

### Add Alt Text for SEO

1. Click image or 👁️ button
2. Enter descriptive alt text
3. Optionally add caption
4. Click "Save Changes"

### Find and Delete Old Images

1. Use search to filter by name
2. Sort by "Oldest first"
3. Review images
4. Click 🗑️ to delete unused images
5. Confirm deletion

### Copy Multiple URLs

1. Open first image
2. Click "Copy URL"
3. Close preview
4. Open next image
5. Repeat

## Integration

### Using in Blog Posts

The media library provides URLs that can be used in content:

```html
<!-- In blog post HTML -->
<img src="https://your-project.supabase.co/storage/v1/object/public/media/..."
     alt="Northern lights over Swedish Lapland">
```

### Programmatic Access

```javascript
// Load all media
const media = await window.Supabase.storage.getMediaFiles();

// Filter images
const blogImages = media.filter(m =>
    m.mime_type.startsWith('image/')
);

// Get specific image
const heroImage = media.find(m =>
    m.original_filename === 'hero.jpg'
);
```

## Responsive Design

The media library adapts to different screen sizes:

- **Desktop (>768px):** 3-4 column grid
- **Tablet (768px):** 2-3 column grid
- **Mobile (<480px):** 1 column grid

## Performance

### Optimizations
- Lazy loading images
- Thumbnail generation
- Progress tracking
- Efficient search/filter
- Indexed database queries

### Best Practices
1. Compress images before uploading
2. Use WebP format when possible
3. Resize large images
4. Add descriptive filenames
5. Include alt text for SEO

## Troubleshooting

### Upload fails
- Check file size (max 10MB)
- Verify file format (JPG, PNG, WEBP, GIF)
- Ensure storage bucket exists
- Check storage policies

### Images not displaying
- Verify bucket is public
- Check browser console for errors
- Confirm URL is accessible
- Review RLS policies

### Cannot delete
- Ensure you're authenticated
- Check delete policy exists
- Verify user permissions

## Security

### Access Control
- **Upload:** Authenticated users only
- **View:** Public access
- **Edit:** Authenticated users only
- **Delete:** Authenticated users only

### Data Protection
- Row Level Security (RLS) enabled
- Storage policies enforced
- User attribution tracked
- Secure file sanitization

## Maintenance

### Regular Tasks
1. Review uploaded files monthly
2. Delete unused images
3. Check storage quota
4. Verify alt text coverage
5. Monitor file sizes

### Storage Monitoring
```sql
-- Check storage usage
SELECT
    COUNT(*) as total_files,
    SUM(size_bytes) / 1024 / 1024 as total_mb,
    AVG(size_bytes) / 1024 as avg_kb
FROM media;
```

## Support Files

- **MEDIA_LIBRARY_SETUP.md** - Detailed setup guide
- **supabase-media-setup.sql** - Database setup script
- **admin/media.html** - Media library interface
- **admin/media.js** - JavaScript functionality

## Future Enhancements

Possible additions:
- Image cropping tool
- Bulk operations
- Advanced filters
- Folder organization
- Image optimization
- CDN integration
- Usage analytics

## Credits

Built for Luxury Travel Sweden CMS using:
- Vanilla JavaScript
- Supabase Storage API
- Modern CSS Grid
- Responsive design

---

**Ready to use!** Navigate to `/admin/media.html` to start managing your media.
