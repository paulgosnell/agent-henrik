# Destinations Management Interface

Complete admin interface for managing destinations in the Luxury Travel Sweden CMS.

## Overview

This is a production-quality destinations management system with:

- Full CRUD operations (Create, Read, Update, Delete)
- Interactive map picker using Leaflet.js
- Image upload with drag-and-drop
- Real-time search and filtering
- Theme and season management
- Responsive design
- Clean, modern UI

## Files Structure

```
admin/
├── destinations.html          # Main admin interface
├── admin.css                  # Comprehensive admin styles
├── components/
│   └── map-picker.js         # Reusable Leaflet map picker component
└── README.md                 # This file
```

## Features

### 1. Destinations List View
- **Table Display**: Shows all destinations with image thumbnails, category, themes, seasons, and status
- **Search**: Real-time search across title, description, and slug
- **Filters**:
  - Category filter (city, seaside, province, beach, ski, park, storyteller)
  - Status filter (all, published, draft)
- **Sorting**: Alphabetically sorted by title
- **Click to Edit**: Click any row to edit that destination

### 2. Add/Edit Destination Form
- **Title**: Auto-generates slug from title
- **Slug**: URL-friendly identifier (can be customized)
- **Description**: Multi-line text area
- **Category**: Dropdown selection
- **Published Toggle**: Switch to publish/unpublish
- **Image Upload**:
  - Drag-and-drop support
  - File picker fallback
  - Image preview
  - Progress indicator
  - 10MB file size limit
  - Uploads to Supabase Storage
- **Interactive Map Picker**:
  - Click map to set location
  - Draggable marker
  - Two-way sync with lat/long inputs
  - Centered on Sweden by default
  - Manual coordinate entry
- **Themes**: Multi-select checkboxes (loaded from database)
- **Seasons**: Spring, Summer, Autumn, Winter checkboxes

### 3. Delete Functionality
- Confirmation dialog before deletion
- Shows destination name for verification
- Soft error handling

### 4. User Experience
- **Loading States**: Spinner while loading data
- **Empty States**: Helpful message when no destinations found
- **Success/Error Messages**: Toast-style alerts
- **Keyboard Shortcuts**: ESC to close modals
- **Responsive**: Works on mobile, tablet, and desktop
- **Accessible**: Proper ARIA labels and semantic HTML

## Map Picker Component

### Usage

The map picker is a reusable component that can be used in other admin pages.

```javascript
// Create and initialize
const mapPicker = new MapPicker();
mapPicker.init('map', latitude, longitude);

// Bind to input fields
mapPicker.bindInputs(latInput, lngInput);

// Get coordinates
const coords = mapPicker.getCoordinates(); // { lat, lng }

// Set marker programmatically
mapPicker.setMarker(62.0, 15.0);

// Refresh after modal opens
mapPicker.refresh();

// Clean up
mapPicker.destroy();
```

### Features
- Click to place marker
- Draggable marker
- Two-way binding with input fields
- Custom styled markers
- CartoDB Voyager tiles (clean, modern style)
- Centered on Sweden by default

## Supabase Integration

### Required Functions
The interface uses these Supabase client functions:

```javascript
// Destinations
window.Supabase.db.getDestinations(includeUnpublished)
window.Supabase.db.createDestination(data)
window.Supabase.db.updateDestination(id, data)
window.Supabase.db.deleteDestination(id)

// Themes
window.Supabase.db.getThemes()

// Storage
window.Supabase.storage.uploadFile(file)
```

### Database Schema
Destinations table should have:
- `id` (uuid, primary key)
- `title` (text)
- `slug` (text, unique)
- `description` (text)
- `category` (text)
- `latitude` (numeric)
- `longitude` (numeric)
- `image_url` (text)
- `theme_ids` (uuid array)
- `seasons` (text array)
- `published` (boolean)
- `created_at` (timestamp)
- `updated_at` (timestamp)

## Installation & Setup

1. **Ensure Supabase is configured**:
   ```javascript
   // In supabase-client.js
   const SUPABASE_URL = 'your-project-url';
   const SUPABASE_ANON_KEY = 'your-anon-key';
   ```

2. **Access the admin interface**:
   ```
   http://localhost:8000/admin/destinations.html
   ```
   Or your server URL.

3. **Required CDN dependencies** (already included):
   - Supabase JS Client
   - Leaflet.js 1.9.4
   - Leaflet CSS

## Styling

The admin interface uses a dark theme with these design tokens:

- **Colors**: Dark background with blue accents
- **Typography**: System font stack for optimal performance
- **Spacing**: Consistent 8px grid
- **Shadows**: Layered depth for modals and cards
- **Transitions**: Smooth 200ms animations
- **Border Radius**: 8px default, 4px small, 12px large

### Customization
To customize the theme, edit CSS variables in `admin.css`:

```css
:root {
  --admin-bg: #0f1419;
  --admin-primary: #4a9eff;
  --admin-success: #34a853;
  --admin-danger: #ea4335;
  /* etc... */
}
```

## Best Practices

### When Adding a Destination
1. Fill in title (slug auto-generates)
2. Write a compelling description
3. Select appropriate category
4. Click on map to set exact location
5. Upload a high-quality image
6. Select relevant themes
7. Choose applicable seasons
8. Toggle "Published" when ready to go live
9. Click "Save Destination"

### Image Guidelines
- **Format**: JPG, PNG, or WebP
- **Size**: Under 10MB
- **Dimensions**: Recommended 1920x1080 or higher
- **Aspect Ratio**: 16:9 works best
- **Content**: High-quality photos showcasing the destination

### Slug Guidelines
- Auto-generated from title
- URL-friendly (lowercase, hyphens)
- Unique per destination
- Can be manually edited before saving
- Used in destination URLs

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Keyboard Shortcuts

- `ESC` - Close any open modal
- Click outside modal - Close modal

## Error Handling

The interface includes comprehensive error handling:

- **Network errors**: Displayed via alert messages
- **Validation errors**: Inline form validation
- **Upload errors**: File type and size validation
- **Missing data**: Graceful degradation with empty states

## Performance

- **Lazy loading**: Map only initializes when modal opens
- **Efficient rendering**: Only re-renders filtered items
- **Image optimization**: Supabase CDN handles image delivery
- **Minimal dependencies**: Only essential libraries loaded

## Security

- **Authentication**: Implement auth check before allowing access
- **Authorization**: Validate user permissions server-side
- **Input validation**: Client and server-side validation required
- **XSS protection**: All user input is sanitized
- **File upload**: Type and size validation

## Future Enhancements

Possible improvements:
- [ ] Bulk operations (delete multiple, publish multiple)
- [ ] Advanced filters (by theme, season)
- [ ] Export/import destinations
- [ ] Duplicate destination feature
- [ ] Revision history
- [ ] Rich text editor for descriptions
- [ ] Multiple image upload
- [ ] Image gallery
- [ ] SEO fields (meta description, keywords)
- [ ] Auto-save drafts
- [ ] Undo/redo functionality

## Troubleshooting

### Map not displaying
- Check that Leaflet CSS and JS are loaded
- Ensure modal is visible before initializing map
- Call `mapPicker.refresh()` after modal opens

### Images not uploading
- Verify Supabase Storage bucket exists and is public
- Check file size (must be under 10MB)
- Ensure correct storage permissions in Supabase

### Themes not loading
- Verify themes table has data
- Check Supabase configuration
- Review browser console for errors

### Destinations not saving
- Check all required fields are filled
- Verify network connection
- Review browser console for validation errors
- Ensure Supabase credentials are correct

## Support

For issues or questions:
1. Check browser console for errors
2. Verify Supabase configuration
3. Review network requests in DevTools
4. Check that all CDN resources loaded successfully

## Credits

- **Map**: Leaflet.js with CartoDB tiles
- **Database**: Supabase
- **Icons**: Unicode emoji (no dependencies)
- **Design**: Custom admin theme

---

**Built for Luxury Travel Sweden** | Version 1.0.0
