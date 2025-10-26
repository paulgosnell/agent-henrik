# Inline Editor Guide - Luxury Travel Sweden

## Overview

The inline editing system allows you to edit static content directly on your website without accessing the admin panel or database. Simply click, edit, and save - it's that easy!

## Features

- ✅ **Direct editing** - Click on any text and start typing
- ✅ **Visual indicators** - See exactly what's editable with highlighted borders
- ✅ **Change tracking** - Know what's been modified before saving
- ✅ **Batch saving** - Save all changes at once to the database
- ✅ **Keyboard shortcuts** - Speed up your workflow
- ✅ **Unsaved changes warning** - Never lose your work accidentally
- ✅ **Authentication required** - Only logged-in users can edit

## How to Use

### 1. Login First

Before you can edit, you need to be logged in:
- Navigate to `/admin/login.html`
- Enter your credentials
- You'll be redirected back to the main site

### 2. Enable Edit Mode

**Option A: Click the button**
- Look for the "Edit Mode: OFF" button in the bottom-right corner
- Click it to enable edit mode
- Button will turn green and show "Edit Mode: ON"

**Option B: Keyboard shortcut**
- Press `Ctrl + E` (or `Cmd + E` on Mac) to toggle edit mode

### 3. Edit Content

Once edit mode is enabled:
- All editable elements will have blue dashed borders
- Hover over any element to see it highlighted
- Click inside the text to start editing
- Type your changes directly
- Elements you've changed will have orange borders

### 4. Save Changes

**Option A: Click the Save button**
- A "Save Changes" button appears above the edit mode button
- Shows the number of unsaved changes: "Save Changes (3)"
- Click to save all changes to the database

**Option B: Keyboard shortcut**
- Press `Ctrl + S` (or `Cmd + S` on Mac) to save instantly

### 5. Review and Reload

- You'll see a success notification
- You'll be asked if you want to reload the page
- Click "OK" to see your updated content

## What Can You Edit?

The following sections have editable content:

### Hero Section
- `hero.headline.line1` - Main headline (line 1)
- `hero.headline.line2` - Main headline (line 2)
- `hero.cta.explore` - "Start Explore" button text
- `hero.cta.design` - "Design My Journey" button text
- `hero.cta.enter` - "Enter the Experience" button text

### Map Section
- `map.eyebrow` - Section label
- `map.headline` - Section headline
- `map.description` - Section description

### Six Pillars Section
- `pillars.eyebrow` - Section label
- `pillars.headline` - Section headline
- `pillars.description` - Section description

### Corporate Section
- `corporate.eyebrow` - Section label
- `corporate.headline` - Section headline
- `corporate.description` - Section description

### Storytellers Section
- `stories.eyebrow` - Section label
- `stories.headline` - Section headline
- `stories.description` - Section description
- `stories.subheadline` - Secondary headline

### Concierge Section
- `concierge.eyebrow` - Section label
- `concierge.headline` - Section headline
- `concierge.description` - Section description

### Journal Section
- `journal.eyebrow` - Section label
- `journal.headline` - Section headline
- `journal.description` - Section description

### Press Section
- `press.eyebrow` - Section label
- `press.headline` - Section headline
- `press.description` - Section description

### Instagram Section
- `instagram.eyebrow` - Section label
- `instagram.headline` - Section headline
- `instagram.description` - Section description

### Contact Section
- `contact.eyebrow` - Section label
- `contact.headline` - Section headline
- `contact.description` - Section description

### Footer
- `footer.newsletter.title` - Newsletter section title
- `footer.newsletter.description` - Newsletter description
- `footer.copyright` - Copyright text
- `footer.tagline` - Footer tagline

## Keyboard Shortcuts

- **Ctrl/Cmd + E** - Toggle edit mode on/off
- **Ctrl/Cmd + S** - Save all changes
- **Escape** - Exit edit mode (with confirmation if there are unsaved changes)

## Best Practices

1. **Edit in short sessions** - Make a few changes, save, and reload to verify
2. **Use clear, concise copy** - Keep headlines punchy and descriptions scannable
3. **Maintain brand voice** - Keep the luxurious, sophisticated tone
4. **Test on mobile** - After editing, check how changes look on mobile devices
5. **Save frequently** - Don't make too many changes before saving

## Troubleshooting

### "Login to Edit" button appears
**Solution:** You need to log in first at `/admin/login.html`

### Changes aren't saving
**Solution:**
- Check your internet connection
- Verify you're logged in (refresh the page)
- Check browser console for errors (F12)
- Contact your developer if issues persist

### Edit mode button not appearing
**Solution:**
- Make sure `inline-editor.js` is loaded (check browser console)
- Verify Supabase is configured correctly
- Clear browser cache and reload

### Text looks different after editing
**Solution:**
- Some formatting (bold, italic) may be lost when editing
- Contact your developer to restore formatting if needed

### Can't exit edit mode
**Solution:**
- Press Escape key
- If that doesn't work, reload the page (unsaved changes will be lost)

## Technical Details

### How It Works

1. **Authentication Check** - System verifies you're logged in via Supabase
2. **Content Loading** - Fetches current content from `static_content` table
3. **Edit Mode** - Makes elements with `data-editable` attributes editable
4. **Change Tracking** - Monitors all changes in memory
5. **Batch Save** - Sends all changes to Supabase in one request
6. **Database Update** - Updates `static_content` table with new values

### Database Structure

Content is stored in the `static_content` table with:
- `key` - Unique identifier (e.g., "hero.headline.line1")
- `value` - The actual text content
- `updated_at` - Timestamp of last update

### Security

- Only authenticated users can enable edit mode
- All saves require valid Supabase authentication
- Changes are validated before being saved to the database
- Row Level Security (RLS) policies protect the data

## Support

If you encounter any issues or need help:
1. Check the troubleshooting section above
2. Review the browser console for error messages (F12)
3. Contact your developer with specific details about the issue

## Tips for Success

- **Start small** - Edit one section at a time
- **Save often** - Use Ctrl/Cmd + S frequently
- **Preview changes** - Always reload to see the final result
- **Keep backups** - Your developer can restore previous versions if needed
- **Stay consistent** - Maintain the same tone and style across all sections

---

**Need to add more editable sections?** Contact your developer to add `data-editable` attributes to additional HTML elements.

**Want to edit complex content?** For blog posts, destinations, and stories, use the dedicated admin panel instead.
