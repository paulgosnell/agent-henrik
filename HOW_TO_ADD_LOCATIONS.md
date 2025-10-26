# How to Add Locations to the Map

**Quick Guide for Adding New Destinations**

---

## 🗺️ The Interactive Map Picker

Your admin dashboard has a **built-in interactive map** that makes it super easy to add new locations. No need to look up coordinates manually!

---

## 📍 Step-by-Step: Adding a New Location

### 1. Login to Admin Dashboard
- Go to `/admin/login.html`
- Enter your email and password
- Click "Login"

### 2. Navigate to Destinations
- Click **"Destinations"** in the sidebar menu
- Or go directly to `/admin/destinations.html`

### 3. Click "Add New Destination"
- Look for the green **"+ Add New Destination"** button at the top right
- Click it to open the form

### 4. Use the Interactive Map Picker

**This is where the magic happens!** You'll see:

```
┌─────────────────────────────────────────────┐
│  INTERACTIVE MAP                            │
│                                             │
│     [  🗺️  Map of Sweden  ]                │
│                                             │
│  Click anywhere to place a marker!          │
│                                             │
│  Latitude:  [59.3293]  (auto-fills!)        │
│  Longitude: [18.0686]  (auto-fills!)        │
└─────────────────────────────────────────────┘
```

**How It Works:**

#### Option A: Click on the Map (Recommended)
1. **Look at the map** - It shows Sweden by default
2. **Click anywhere** on the map where you want to add a location
3. A **red marker** appears where you clicked
4. The **Latitude and Longitude fields auto-fill** with the exact coordinates
5. You can **click again** to move the marker to a different spot
6. The coordinates update in real-time!

#### Option B: Type Coordinates Manually
1. If you already know the coordinates, type them in:
   - **Latitude:** e.g., `59.3293` (Stockholm)
   - **Longitude:** e.g., `18.0686` (Stockholm)
2. The marker will appear on the map automatically
3. The map will center on your coordinates

#### Option C: Drag the Marker
1. After placing a marker, you can **click and drag it**
2. Move it to the exact spot you want
3. Coordinates update as you drag!

---

## 🎯 Example: Adding Stockholm Archipelago

Let me walk you through adding a real destination:

### Step 1: Open Add Destination Modal
Click **"+ Add New Destination"** button

### Step 2: Fill in Basic Info
- **Title:** `Stockholm Archipelago`
- **Description:** `A stunning collection of 30,000 islands, offering pristine nature and Swedish summer charm.`

### Step 3: Set Location Using Map
1. **Look at the map** - You'll see Sweden
2. **Zoom in** on Stockholm area (use mouse wheel or +/- buttons)
3. **Click on the archipelago** (east of Stockholm, in the water)
4. Watch the coordinates auto-fill:
   - Latitude: `59.4372`
   - Longitude: `18.9515`

### Step 4: Choose Category
Select: **Seaside**

### Step 5: Select Seasons
Check: ✅ Spring ✅ Summer ✅ Autumn

### Step 6: Choose Themes
Select: ✅ Nature & Wellness

### Step 7: Upload Image (Optional)
Click "Choose File" and select a photo of the archipelago

### Step 8: Publish
Toggle **"Published"** to ON

### Step 9: Save
Click **"Save Destination"**

**Done!** The new location now appears on your map! 🎉

---

## 🌍 Finding Coordinates for Any Location

### Method 1: Use Google Maps (Easy!)
1. Go to [Google Maps](https://maps.google.com)
2. Search for your destination (e.g., "Abisko National Park")
3. **Right-click** on the exact spot
4. Click **"Copy coordinates"**
5. You'll get something like: `68.3547, 18.8211`
6. First number = Latitude, Second = Longitude
7. Paste into your form!

### Method 2: Use the Map Picker (Easiest!)
1. In the admin form, **find the general area** on the map
2. **Zoom in** to see more detail
3. **Click on the exact spot**
4. Coordinates fill in automatically!
5. No need for Google Maps!

---

## 📋 Common Locations and Their Coordinates

Copy these if you want to add popular Swedish destinations:

| Location | Latitude | Longitude | Category |
|----------|----------|-----------|----------|
| **Stockholm** | 59.3293 | 18.0686 | City |
| **Gothenburg** | 57.7089 | 11.9746 | City |
| **Malmö** | 55.6050 | 13.0038 | City |
| **Kiruna** | 67.8558 | 20.2253 | City |
| **Visby (Gotland)** | 57.6348 | 18.2948 | City |
| **Abisko National Park** | 68.3547 | 18.8211 | Park |
| **Ice Hotel (Jukkasjärvi)** | 67.8558 | 20.6006 | Storyteller |
| **Åre Ski Resort** | 63.3989 | 13.0819 | Ski |
| **Marstrand** | 57.8867 | 11.5798 | Seaside |
| **Österlen** | 55.5122 | 14.1562 | Province |

---

## 🎨 Map Features Explained

### Zoom Controls
- **+ Button:** Zoom in (more detail)
- **- Button:** Zoom out (wider view)
- **Mouse Wheel:** Scroll to zoom

### Pan (Move the Map)
- **Click and Drag** the map to move around
- Explore different areas of Sweden

### Map Layers
The map uses CartoDB tiles - clean, modern, easy to read

### Marker
- **Red pin** shows your selected location
- **Click anywhere** to move it
- **Drag** to fine-tune position

---

## ✅ Validation & Tips

### Coordinates Must Be Valid
- **Latitude:** Between -90 and 90
- **Longitude:** Between -180 and 180
- **Sweden's Range:**
  - Latitude: ~55 to 69 (south to north)
  - Longitude: ~11 to 24 (west to east)

### Pro Tips

1. **Zoom In First**
   - Get close to your exact location before clicking
   - More accurate coordinates

2. **Use Satellite View**
   - The map shows roads and cities
   - Perfect for finding exact spots

3. **Click Multiple Times**
   - Made a mistake? Just click again!
   - The marker moves to your new click

4. **Check Your Work**
   - After saving, visit your public website
   - Verify the marker appears in the right place

5. **Edit Anytime**
   - Click "Edit" next to any destination
   - Move the marker if it's not quite right

---

## 🔍 Troubleshooting

### Problem: Map Won't Load
**Solution:**
- Check your internet connection
- Refresh the page
- Clear browser cache

### Problem: Can't Click on Map
**Solution:**
- Make sure you've scrolled to the map section
- The map should show Sweden by default
- Try refreshing the modal

### Problem: Coordinates Not Filling In
**Solution:**
- Wait a moment after clicking
- Try clicking again
- Check browser console for errors (F12)

### Problem: Marker in Wrong Place
**Solution:**
- Click again to move it
- Or edit the coordinates manually
- Or drag the marker to correct position

### Problem: How Do I Delete a Marker?
**Solution:**
- You can't delete, only move
- Just click where you want it instead
- To remove a destination entirely, click "Delete" button

---

## 📱 Mobile / Tablet

The map picker works on touch devices too!

- **Tap** to place marker
- **Pinch to zoom** in/out
- **Drag** to pan the map
- **Touch and hold** to drag marker

Works best on tablets, but functional on large phones.

---

## 🎓 Video Tutorial (Coming Soon)

For a visual walkthrough, we recommend:
1. Login to admin
2. Click "Add Destination"
3. Play around with the map picker
4. It's very intuitive!

**You can't break anything** - so feel free to experiment!

---

## 📊 What Happens After You Add a Location?

1. **Database Updated** - Location saved to Supabase
2. **Map Refreshes** - New marker appears on public site
3. **Visitors Can Click** - Popup shows your description
4. **Filters Work** - Location appears in category/season/theme filters
5. **Search Enabled** - Visitors can search for it

---

## 🌟 Best Practices

### Location Names
- Use official names: "Stockholm" not "Stockhom"
- Be specific: "Abisko National Park" not just "Abisko"

### Descriptions
- Keep it concise (2-3 sentences)
- Highlight what's special
- Mention best seasons if relevant

### Categories
Choose the most fitting category:
- **City** - Urban destinations
- **Seaside** - Coastal areas, archipelagos
- **Province** - Regions, countryside
- **Beach** - Specific beach locations
- **Ski** - Ski resorts, winter sports
- **Park** - National parks, nature reserves
- **Storyteller** - Unique experiences, cultural sites

### Seasons
Check seasons when destination is best to visit:
- ✅ **Spring** (Mar-May)
- ✅ **Summer** (Jun-Aug)
- ✅ **Autumn** (Sep-Nov)
- ✅ **Winter** (Dec-Feb)

### Themes
Select 2-3 relevant themes:
- Nature & Wellness
- Design & Innovation
- Culinary
- Royal, Art & Culture
- Nightlife & Celebrations
- Legacy & Purpose

---

## 🚀 Quick Reference

**To add a location:**
1. Admin Dashboard → Destinations
2. Click "+ Add New Destination"
3. **Click on map** where you want the marker
4. Fill in title and description
5. Choose category, seasons, themes
6. Upload image (optional)
7. Toggle "Published" ON
8. Click "Save Destination"

**To edit a location:**
1. Find destination in list
2. Click "Edit" button
3. **Click new spot on map** to move marker
4. Update any other details
5. Click "Save Changes"

**To move a marker:**
1. Edit the destination
2. **Click new spot** on the map
3. Or **drag the red marker**
4. Or type new coordinates
5. Save changes

---

## 💡 Remember

- **The map picker is INTERACTIVE** - just click!
- **Coordinates auto-fill** - no math needed
- **You can always edit** - nothing is permanent
- **Zoom in for precision** - get it exactly right

---

**Need more help?** Check out:
- [CLIENT_USER_GUIDE.md](CLIENT_USER_GUIDE.md) - Full admin guide
- [QUICK_REFERENCE.md](QUICK_REFERENCE.md) - Quick tips
- [START_HERE.md](START_HERE.md) - Getting started

**Ready to add locations?** Go to `/admin/destinations.html` and start clicking on the map! 🗺️
