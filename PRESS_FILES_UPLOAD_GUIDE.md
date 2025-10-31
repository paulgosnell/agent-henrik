# Press Files Upload Guide

## Files to Upload

You have 5 press files on your Desktop that need to be uploaded to Supabase Storage:

### Images (for thumbnails):
1. **press1.jpg** - Panorama Stockholm cityscape
2. **press2.png** - SALT Magazine covers
3. **press3.png** - Railtripping logo

### PDFs (for links):
4. **press1.pdf** - Panorama Stockholm article PDF
5. **press3.pdf** - Railtripping article PDF

---

## Upload Instructions

### Step 1: Go to Supabase Storage Dashboard

```
https://supabase.com/dashboard/project/fjnfsabvuiyzuzfhxzcc/storage/buckets/media
```

### Step 2: Create Folders (if they don't exist)

1. Click into the "media" bucket
2. Create folder: **`press-images`**
3. Create folder: **`press-pdfs`**

### Step 3: Upload Images

1. Open the **`press-images`** folder
2. Click "Upload Files"
3. Select and upload:
   - `/Users/paulgosnell/Desktop/press1.jpg`
   - `/Users/paulgosnell/Desktop/press2.png`
   - `/Users/paulgosnell/Desktop/press3.png`

### Step 4: Upload PDFs

1. Open the **`press-pdfs`** folder
2. Click "Upload Files"
3. Select and upload:
   - `/Users/paulgosnell/Desktop/press1.pdf`
   - `/Users/paulgosnell/Desktop/press3.pdf`

### Step 5: Get Public URLs

After uploading, click on each file and click "Get URL" or "Copy URL". You'll get URLs like:

```
https://fjnfsabvuiyzuzfhxzcc.supabase.co/storage/v1/object/public/media/press-images/press1.jpg
https://fjnfsabvuiyzuzfhxzcc.supabase.co/storage/v1/object/public/media/press-images/press2.png
https://fjnfsabvuiyzuzfhxzcc.supabase.co/storage/v1/object/public/media/press-images/press3.png
https://fjnfsabvuiyzuzfhxzcc.supabase.co/storage/v1/object/public/media/press-pdfs/press1.pdf
https://fjnfsabvuiyzuzfhxzcc.supabase.co/storage/v1/object/public/media/press-pdfs/press3.pdf
```

---

## Update HTML

### Step 6: Replace Placeholders in index.html

Find these placeholders in `index.html` (around line 556-587) and replace:

#### Panel 1 (Panorama Stockholm):
```html
<!-- REPLACE THIS: -->
<a href="PRESS1_PDF_URL_HERE" ...>
  <img src="PRESS1_IMAGE_URL_HERE" ...>

<!-- WITH YOUR URLS: -->
<a href="https://fjnfsabvuiyzuzfhxzcc.supabase.co/storage/v1/object/public/media/press-pdfs/press1.pdf" ...>
  <img src="https://fjnfsabvuiyzuzfhxzcc.supabase.co/storage/v1/object/public/media/press-images/press1.jpg" ...>
```

#### Panel 2 (SALT Magazine):
```html
<!-- REPLACE THIS: -->
<img src="PRESS2_IMAGE_URL_HERE" ...>

<!-- WITH YOUR URL: -->
<img src="https://fjnfsabvuiyzuzfhxzcc.supabase.co/storage/v1/object/public/media/press-images/press2.png" ...>
```

**Note**: Panel 2 link is already set to: `https://railtripping.com/en/railtripping-to-the-arctic-circle-sweden/`

#### Panel 3 (Railtripping):
```html
<!-- REPLACE THIS: -->
<a href="PRESS3_PDF_URL_HERE" ...>
  <img src="PRESS3_IMAGE_URL_HERE" ...>

<!-- WITH YOUR URLS: -->
<a href="https://fjnfsabvuiyzuzfhxzcc.supabase.co/storage/v1/object/public/media/press-pdfs/press3.pdf" ...>
  <img src="https://fjnfsabvuiyzuzfhxzcc.supabase.co/storage/v1/object/public/media/press-images/press3.png" ...>
```

---

## Quick Command (After Upload)

Once you have the URLs, I can help you replace the placeholders with a single command. Just provide the URLs and I'll update the HTML for you!

---

## Current Status

### ✅ Completed:
- HTML structure created with 3 press panels
- CSS styling with hover effects
- Light/dark theme support
- Panel 2 link set to Railtripping URL

### ⏳ Pending:
- Upload 5 files to Supabase Storage
- Replace placeholder URLs in HTML
- Commit and push changes

### 📝 Panel Content (already set):

**Panel 1**: Panorama Stockholm
- Title: "Featured in Panorama Stockholm"
- Description: "Discover Stockholm through our curated luxury experiences"
- Link: Will open press1.pdf
- Image: press1.jpg

**Panel 2**: SALT Magazine
- Title: "Featured in SALT Magazine"
- Description: "Railtripping to the Arctic Circle through Sweden"
- Link: https://railtripping.com/en/railtripping-to-the-arctic-circle-sweden/
- Image: press2.png

**Panel 3**: Railtripping
- Title: "Featured by Railtripping"
- Description: "The journey matters - exploring Sweden by rail"
- Link: Will open press3.pdf
- Image: press3.png

---

## Alternative: Use Inline Editor

After pushing changes, you can also update the URLs via the inline editor:
1. Open the site
2. Click the pencil icon
3. Click on each image/link
4. Paste the Supabase URLs
5. Save changes

This will save directly to your `static_content` table!
