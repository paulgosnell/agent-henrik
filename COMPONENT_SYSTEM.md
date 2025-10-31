# Shared Component System

## Overview

A JavaScript-based component system has been implemented to solve the problem of duplicated and inconsistent headers/footers across multiple HTML pages.

## What Was Done

### 1. Created Component Files
- `/components/header.html` - Shared navigation header
- `/components/footer.html` - Shared footer with newsletter, social links, theme toggle, etc.

### 2. Created Component Loader
- `component-loader.js` - Automatically loads components into pages
- Runs on DOM load
- Dispatches events when components are ready
- Re-initializes Lucide icons after loading

### 3. Updated All Pages
The following pages now use the component system:
- ✅ index.html
- ✅ our-story.html
- ✅ our-services.html
- ✅ our-team.html
- ✅ booking-process.html
- ✅ journal.html
- ✅ journal-post.html

## How It Works

Each page now has:

```html
<head>
    ...
    <!-- Component Loader - Load shared header/footer -->
    <script src="component-loader.js"></script>
</head>
<body>
    <!-- Header loaded from /components/header.html -->
    <div id="header-placeholder"></div>

    <!-- Page content here -->

    <!-- Footer loaded from /components/footer.html -->
    <div id="footer-placeholder"></div>
</body>
```

On page load, the component loader:
1. Fetches `/components/header.html` and `/components/footer.html`
2. Injects the HTML into the placeholder divs
3. Fires events that other scripts can listen to
4. Re-initializes icons and other dynamic elements

## Benefits

✅ **Single source of truth** - Update header/footer once, changes reflect everywhere
✅ **Consistency** - All pages now have identical navigation and footer
✅ **Easy maintenance** - Edit `/components/header.html` or `/components/footer.html` to update all pages
✅ **No build process** - Works on any static hosting
✅ **Version control friendly** - Components are separate files that can be tracked independently

## Making Updates

### Update Navigation
Edit `/components/header.html` - changes apply to all pages immediately

### Update Footer
Edit `/components/footer.html` - changes apply to all pages immediately

### Add New Page
Include in the `<head>`:
```html
<script src="/component-loader.js"></script>
```

Include in the `<body>`:
```html
<div id="header-placeholder"></div>
<!-- your content -->
<div id="footer-placeholder"></div>
```

## Component Events

The component loader dispatches these events:
- `component-loaded:header` - Header is loaded
- `component-loaded:footer` - Footer is loaded
- `components-loaded` - All components are ready

Listen to these events if you need to run code after components load:

```javascript
document.addEventListener('components-loaded', function(event) {
    console.log('All components ready!');
    // Run your code here
});
```

## Compatibility

- ✅ Works with inline editor system
- ✅ Works with Supabase integration
- ✅ Works with LIV chat
- ✅ Works with theme toggle
- ✅ Works with all existing scripts

## Files Created/Modified

### New Files
- `/components/header.html`
- `/components/footer.html`
- `/component-loader.js`
- `/update-pages-with-components.py` (utility script - can be deleted)

### Modified Files
- `index.html`
- `our-story.html`
- `our-services.html`
- `our-team.html`
- `booking-process.html`
- `journal.html`
- `journal-post.html`

## Next Steps

As requested, pages should be reorganized from flat files to folder structure:
- `/our-story.html` → `/our-story/index.html`
- `/our-services.html` → `/our-services/index.html`
- etc.

This will provide cleaner URLs like `/our-story/` instead of `/our-story.html`.

After restructuring, component paths should use absolute paths (already done in header/footer components).
