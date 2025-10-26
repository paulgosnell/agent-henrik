# Media Library Quick Start

## 5-Minute Setup

### Step 1: Run SQL Setup (1 min)
```bash
1. Open Supabase Dashboard → SQL Editor
2. Paste contents of: supabase-media-setup.sql
3. Click "Run"
4. Wait for "Setup complete!" message
```

### Step 2: Create Storage Bucket (1 min)
```bash
1. Supabase Dashboard → Storage
2. Click "New Bucket"
3. Name: media
4. Check "Public bucket"
5. Click "Create Bucket"
```

### Step 3: Test Upload (3 min)
```bash
1. Navigate to: /admin/media.html
2. Login with admin credentials
3. Drag an image onto the upload zone
4. Wait for upload to complete
5. See image appear in grid
```

**Done!** Your media library is ready.

---

## Daily Usage

### Upload Images
```
1. Open /admin/media.html
2. Drag files OR click "Choose Files"
3. Wait for upload complete
```

### Copy Image URL
```
1. Find your image in the grid
2. Click the 🔗 button
3. Paste URL where needed
```

### Add Alt Text
```
1. Click on image thumbnail
2. Enter alt text in modal
3. Click "Save Changes"
```

### Delete Images
```
1. Click 🗑️ button on image
2. Confirm deletion
3. Image removed from storage
```

---

## Keyboard Shortcuts

- **Escape** - Close preview modal
- **Ctrl/Cmd + V** - Paste copied URL

---

## File Requirements

### Formats
✓ JPG, JPEG, PNG, WEBP, GIF

### Size Limit
✓ Maximum 10MB per file
✓ Recommended: Under 2MB

### Dimensions
✓ Hero images: 1920×1080
✓ Blog images: 1200×800
✓ Thumbnails: 800×600

---

## Common Tasks

### Batch Upload
```
1. Select multiple files (Ctrl/Cmd + Click)
2. Drag all files at once
3. Watch progress for each file
```

### Find Specific Image
```
1. Type filename in search box
2. Results filter automatically
3. Click to open preview
```

### Sort by Date
```
1. Use sort dropdown
2. Select "Newest first" or "Oldest first"
3. Grid reorders automatically
```

---

## Troubleshooting

### Upload Fails
- Check file size (< 10MB)
- Verify file format (JPG, PNG, etc)
- Ensure you're logged in

### Image Not Showing
- Refresh the page
- Check browser console
- Verify bucket is public

### Cannot Delete
- Ensure you're logged in as admin
- Check console for errors
- Verify delete policy exists

---

## URL Format

Uploaded images use this URL pattern:
```
https://[project].supabase.co/storage/v1/object/public/media/[timestamp]-[filename]
```

Example:
```
https://xyz.supabase.co/storage/v1/object/public/media/1698765432-mountain-lake.jpg
```

---

## Grid Actions

Each image shows 3 action buttons:

| Icon | Action | Description |
|------|--------|-------------|
| 🔗 | Copy URL | Copy image URL to clipboard |
| 👁️ | View | Open full preview modal |
| 🗑️ | Delete | Remove image from storage |

---

## Preview Modal

When you click an image, you'll see:

1. **Full-size preview** - Large image display
2. **File details** - Name, size, dimensions, date
3. **Image URL** - With copy button
4. **Edit fields** - Alt text and caption
5. **Actions** - Save changes or delete

---

## Best Practices

### Before Uploading
1. Compress large images
2. Use descriptive filenames
3. Remove sensitive metadata
4. Check image quality

### After Uploading
1. Add alt text immediately
2. Add caption if needed
3. Copy URL for content
4. Test URL in browser

### Maintenance
1. Delete unused images monthly
2. Review file sizes regularly
3. Check storage quota
4. Verify alt text coverage

---

## Storage Quota

**Supabase Free Tier:**
- 1GB storage included
- ~200-500 images (depending on size)

**Monitor Usage:**
```sql
-- Run in SQL Editor
SELECT
    COUNT(*) as files,
    SUM(size_bytes)/1024/1024 as mb_used
FROM media;
```

---

## Integration Example

### Use in Blog Post
```html
<img src="[COPIED_URL]" alt="Northern lights over Swedish Lapland">
```

### Use in Content Editor
```
1. Click 🔗 to copy URL
2. Paste in image URL field
3. Add alt text
4. Save content
```

---

## Support Resources

- **Full Setup Guide:** MEDIA_LIBRARY_SETUP.md
- **Technical Details:** MEDIA_LIBRARY_README.md
- **SQL Script:** supabase-media-setup.sql

---

## Quick Reference

**Access:** `/admin/media.html`

**Upload:** Drag & drop or click "Choose Files"

**Search:** Type in search box to filter

**Sort:** Use dropdown to reorder

**Copy URL:** Click 🔗 button

**View Details:** Click image or 👁️ button

**Delete:** Click 🗑️ button and confirm

---

**That's it!** You're ready to manage media files.
