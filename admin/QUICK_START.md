# Destinations Manager - Quick Start Guide

Get started with the Luxury Travel Sweden Destinations Management Interface in minutes!

## Access

Open in your browser:
```
http://localhost:8000/admin/destinations.html
```
Or replace with your actual server URL.

## Quick Walkthrough

### 1. View Destinations

When you first open the page, you'll see:
- **Search bar**: Type to search destinations by name, slug, or description
- **Category filter**: Filter by destination type
- **Status filter**: Show all, published only, or drafts only
- **Add New Destination button**: Create a new destination
- **Destinations table**: All your destinations in a sortable list

### 2. Add a New Destination

Click **"Add New Destination"** button:

#### Step-by-step:

1. **Enter Title**
   - Example: `Stockholm`
   - Slug auto-generates as `stockholm`

2. **Add Description**
   - Compelling description of the destination
   - Example: `Sweden's vibrant capital city, where historic charm meets modern Scandinavian design...`

3. **Select Category**
   - Choose from: city, seaside, province, beach, ski, park, storyteller

4. **Set Location on Map**
   - Click anywhere on the map to place a marker
   - Or enter coordinates manually
   - Marker is draggable after placement
   - Map shows Sweden by default (zoom in as needed)

5. **Upload Image**
   - Click upload area or drag & drop an image
   - Preview appears immediately
   - Image uploads when you save
   - Maximum 10MB

6. **Select Themes** (optional)
   - Check boxes for relevant themes
   - Examples: Nature, Culture, Adventure, Culinary, etc.

7. **Choose Seasons** (optional)
   - Select when this destination is best to visit
   - Spring, Summer, Autumn, Winter

8. **Publish Toggle**
   - Turn ON to make visible on website
   - Turn OFF to keep as draft

9. **Click "Save Destination"**
   - Success message appears
   - Destination appears in list

### 3. Edit a Destination

Two ways to edit:
1. Click on any row in the table
2. Click the edit button (pencil icon) on the right

The form opens pre-filled with current data. Make changes and click "Save Destination".

### 4. Delete a Destination

1. Click the delete button (trash icon)
2. Confirmation dialog appears
3. Click "Delete" to confirm (or "Cancel" to abort)
4. Destination is permanently removed

### 5. Search & Filter

**Search**: Type in the search box to filter by:
- Title
- Description
- Slug

**Category Filter**: Select a category to show only destinations of that type

**Status Filter**:
- **All**: Show everything
- **Published**: Only live destinations
- **Draft**: Unpublished destinations

Filters combine - use search + category + status together!

## Map Picker Tips

### Click to Place
- Click anywhere on the map
- Marker appears at that location
- Coordinates update automatically

### Drag to Move
- Click and drag the marker
- Coordinates update as you drag

### Manual Entry
- Enter latitude and longitude directly
- Marker moves to those coordinates
- Valid ranges:
  - Latitude: -90 to 90
  - Longitude: -180 to 180

### Sweden Coordinates (for reference)
- Stockholm: `59.329323, 18.068581`
- Gothenburg: `57.708870, 11.974560`
- Malmö: `55.604981, 13.003822`
- Kiruna: `67.855800, 20.225282`

## Image Upload Tips

### Best Practices
- Use high-resolution images (1920x1080 or better)
- Landscape orientation (16:9 ratio) works best
- JPG, PNG, or WebP format
- Compress images before upload for faster loading

### Drag & Drop
1. Have image file ready
2. Drag file over upload area
3. Drop file
4. Preview appears

### Click to Upload
1. Click upload area
2. File picker opens
3. Select image
4. Preview appears

### Remove Image
- Click "Remove Image" button
- Upload area resets
- Can upload different image

## Keyboard Shortcuts

- **ESC**: Close any open modal
- **Click outside modal**: Also closes modal

## Common Tasks

### Duplicate a Destination
1. Open destination to edit
2. Copy all fields manually
3. Change title and slug to make unique
4. Save as new destination

### Bulk Publish
Currently manual:
1. Open each destination
2. Toggle published ON
3. Save

### Find Unpublished Destinations
1. Set status filter to "Draft"
2. All unpublished destinations appear

## Troubleshooting

### "Failed to load destinations"
- Check Supabase configuration in `supabase-client.js`
- Verify internet connection
- Check browser console for errors

### Map not showing
- Wait for modal to fully open
- Try closing and reopening modal
- Check browser console for Leaflet errors

### Image upload fails
- Check file size (must be under 10MB)
- Verify file type (JPG, PNG, WebP only)
- Check Supabase Storage configuration

### Changes not saving
- Check all required fields are filled (marked with *)
- Verify coordinates are set
- Check browser console for errors

## Data Requirements

### Required Fields (marked with *)
- Title
- Slug (auto-generated but can be edited)
- Description
- Category
- Location (latitude & longitude)

### Optional Fields
- Image
- Themes
- Seasons
- Published status (defaults to OFF)

## Next Steps

1. **Add your first destination** - Try Stockholm or your favorite location
2. **Upload beautiful images** - Visual appeal is key
3. **Tag with themes** - Helps users discover destinations
4. **Publish when ready** - Toggle published ON to make live

## Need Help?

Check the full documentation in `README.md` for:
- Technical details
- API integration
- Customization options
- Advanced features

---

Happy destination managing! 🗺️
