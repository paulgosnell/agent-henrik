# Agent Henrik Build Plan - Action Brief for Claude Code

**Project**: Adapt Sweden Luxury Travel site to Agent Henrik (global luxury travel)

**Context**: Sweden site is complete and approved. We're recycling 80% of the codebase. This doc outlines the 20% delta needed for Agent Henrik.

**Total Estimated Time**: 15-20 hours

---

## What Already Exists (DO NOT REBUILD)

✅ AI chat system (LIV concierge with Claude API)  
✅ Map infrastructure (Leaflet + Supabase)  
✅ Form system with draft itinerary auto-attach  
✅ Lead capture flow  
✅ Supabase integration  
✅ Component loader (header/footer)  
✅ Inline editor system  
✅ Service worker + caching  

**Architecture Reference**: See `ARCHITECTURE_ANALYSIS.md` for full system details

---

## Build Order

### **Phase 1: Database Schema (1-2 hours)**

**File**: `supabase/migrations/[timestamp]_agent_henrik_schema.sql`

```sql
-- Add region support to destinations
ALTER TABLE destinations ADD COLUMN region text;
CREATE INDEX idx_destinations_region ON destinations(region);

-- Create services table (replaces hardcoded themes)
CREATE TABLE services (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  excerpt text,
  description text,
  service_type text CHECK (service_type IN (
    'underground',      -- Underground Luxury Journeys
    'lifestyle',        -- Lifestyle & Culture Tours
    'yacht',           -- Sea Holidays (Yachts & Sailing)
    'brand',           -- Brand Experience Travel
    'cool-hunting',    -- Cool Hunting Expeditions
    'storytelling',    -- Storytelling Encounters
    'corporate'        -- Corporate & Group Experiences
  )),
  region_availability text[], -- e.g., ['Nordic', 'Mediterranean', 'Asia Pacific']
  published boolean DEFAULT true,
  display_order integer DEFAULT 0,
  video_url text,
  image_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_services_published ON services(published);
CREATE INDEX idx_services_type ON services(service_type);

-- Create press items table
CREATE TABLE press_items (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  source text NOT NULL, -- e.g., 'New York Times', 'Forbes', 'Condé Nast Traveler'
  quote text,           -- Pull quote for testimonials
  published_at date,
  pdf_url text,         -- Link to full article/clipping
  thumbnail_url text,   -- B&W image that reveals color on hover
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_press_published ON press_items(published_at DESC);

-- Enhance destinations table
ALTER TABLE destinations ADD COLUMN service_ids uuid[]; -- Array of service IDs
ALTER TABLE destinations ADD COLUMN video_url text;     -- Cinematic intro video
ALTER TABLE destinations ADD COLUMN press_featured boolean DEFAULT false;

-- Create corporate inquiries table
CREATE TABLE corporate_inquiries (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  company text NOT NULL,
  contact_name text NOT NULL,
  email text NOT NULL,
  phone text,
  experience_type text CHECK (experience_type IN ('innovation-retreat', 'trend-scouting', 'brand-activation', 'incentive', 'other')),
  group_size integer,
  details text,
  source text DEFAULT 'Corporate Page',
  status text DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'proposal_sent', 'closed')),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_corporate_inquiries_status ON corporate_inquiries(status);
```

**Action**: Run migration, then seed initial data (see Phase 4)

---

### **Phase 2: LIV AI Reprompting (3-4 hours)**

**File**: `supabase/functions/liv-chat/index.ts`

#### Changes Required:

**1. Update data loading** (find the Promise.all section around line 200-250):

```typescript
// REPLACE this:
const [destinationsResult, themesResult, instructionsResult] = await Promise.all([
  supabase.from('destinations').select('*').eq('published', true),
  supabase.from('themes').select('*'),
  supabase.from('liv_instructions').select('*').eq('is_active', true)
]);

// WITH this:
const [destinations, services, pressItems, instructions] = await Promise.all([
  supabase.from('destinations').select('*').eq('published', true), // All regions
  supabase.from('services').select('*').eq('published', true).order('display_order'),
  supabase.from('press_items').select('*').not('published_at', 'is', null).order('published_at', { ascending: false }).limit(6),
  supabase.from('liv_instructions').select('*').eq('is_active', true)
]);
```

**2. Rebuild system prompt function** (find `buildSystemPrompt` function):

```typescript
function buildSystemPrompt(destinations, services, pressItems, instructions, context, hasContactInfo) {
  
  // Build press knowledge for credibility
  const pressKnowledge = pressItems.map(p =>
    `- "${p.quote}" — ${p.source} (${p.title})`
  ).join('\n');

  // Build services knowledge (replaces themes)
  const servicesKnowledge = services.map(s =>
    `### ${s.title} (${s.service_type})
${s.description}
Available regions: ${s.region_availability?.join(', ') || 'Global'}
`
  ).join('\n\n');

  // Build destination knowledge grouped by region
  const destinationsByRegion = destinations.reduce((acc, d) => {
    const region = d.region || 'Other';
    if (!acc[region]) acc[region] = [];
    acc[region].push(d);
    return acc;
  }, {});

  const destinationsKnowledge = Object.entries(destinationsByRegion)
    .map(([region, dests]) => `
**${region} Region:**
${dests.map(d => `- ${d.title}: ${d.excerpt}`).join('\n')}
`).join('\n');

  // Build context-aware intro
  let contextIntro = '';
  if (context?.type === 'destination' && context?.name) {
    contextIntro = `\n## Current Context\nThe user is exploring **${context.name}** in the ${context.region || 'Unknown'} region.`;
    if (context.press_featured) {
      contextIntro += ' This destination has been featured in international press.';
    }
  }

  // Contact info guidance
  const contactInfoGuidance = hasContactInfo 
    ? '\n## Lead Status\nYou already have their contact information. Focus on refining their journey.'
    : `\n## Contact Collection\nWhen the conversation shows clear intent (specific dates, group size, budget discussion), naturally ask: "To craft your personalized itinerary, may I have your name and email?"`;

  return `You are Agent Henrik, a global luxury travel architect and cultural curator.

## Your Identity
You design transformative journeys across the world's most compelling destinations. You blend hidden culture, insider access, and storytelling to create exclusive narrative experiences. You are sophisticated yet warm, editorial yet conversational.

## Your Global Expertise

### Press Recognition
Your work has been featured in:
${pressKnowledge}

### Services & Transformations
You offer seven core experience types:
${servicesKnowledge}

### Destinations Knowledge
${destinationsKnowledge}

## Regional Seasonal Awareness
- **Nordic**: Northern Lights (Oct-Mar), Midnight Sun (Jun-Jul), Design Week (Sep)
- **Mediterranean**: Peak summer (Jun-Sep), Mild winters, Cultural festivals (year-round)
- **Asia Pacific**: Cherry blossoms (Mar-Apr), Monsoon awareness, Festival seasons
- **Americas**: Seasonal diversity, Cultural events, Natural wonders

${contextIntro}

${contactInfoGuidance}

## Your Conversational Approach
1. **Be context-aware**: Reference the destination or service they clicked on
2. **Ask open-ended questions**: Duration, travel style, group composition, what excites them
3. **Paint pictures**: Use editorial language, not transactional
4. **Build trust**: Reference press recognition naturally when relevant
5. **Service-driven**: Focus on transformation type, not just geography
6. **Lead gently**: After 3-4 exchanges showing intent, collect contact info

## Itinerary Structure
When creating draft itineraries, use this story arc:
- **Day 1-2**: Arrival → Immersion (cultural grounding)
- **Day 3-4**: Climax (peak experiences, insider access)
- **Day 5**: Reflection (meaningful encounters, integration)

Keep itineraries editorial and immersive, never transactional.

${instructions.map(i => i.instruction).join('\n\n')}
`;
}
```

**Testing**: After deployment, test conversation with:
- Map click on new global destination
- Service card click
- General inquiry
- Verify press quotes appear naturally
- Verify regional awareness in responses

---

### **Phase 3: Map Reconfiguration (2-3 hours)**

**File**: `scripts.js`

#### 3A. Change Map Initialization

Find the map initialization (around line 1210) and change:

```javascript
// CHANGE FROM:
map = L.map('map', {
  center: [62, 15],  // Sweden
  zoom: 5,
  minZoom: 4
});

// TO:
map = L.map('map', {
  center: [30, 0],   // Global view
  zoom: 2,
  minZoom: 2,
  maxZoom: 18
});
```

#### 3B. Add Region Filtering

Add this new function after map initialization:

```javascript
// Add region filter UI
function initializeRegionFilters() {
  const regions = ['All', 'Nordic', 'Mediterranean', 'Asia Pacific', 'Americas'];
  const filterContainer = document.getElementById('regionFilters');
  
  if (!filterContainer) return;
  
  regions.forEach(region => {
    const btn = document.createElement('button');
    btn.textContent = region;
    btn.className = 'region-filter-btn';
    btn.dataset.region = region;
    if (region === 'All') btn.classList.add('active');
    
    btn.addEventListener('click', () => {
      document.querySelectorAll('.region-filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      filterByRegion(region);
    });
    
    filterContainer.appendChild(btn);
  });
}

function filterByRegion(region) {
  if (!destinationData || !markers) return;
  
  Object.entries(markers).forEach(([key, marker]) => {
    const destination = destinationData[key];
    if (region === 'All' || destination.region === region) {
      marker.addTo(map);
    } else {
      map.removeLayer(marker);
    }
  });
}

// Call after map loads
initializeRegionFilters();
```

#### 3C. Update Event Dispatching

Find the marker click handler and update the event detail:

```javascript
// FIND marker click handler (around line 1300) and UPDATE:
marker.on('click', function() {
  document.dispatchEvent(new CustomEvent('mapMarkerClicked', {
    detail: {
      destination: {
        title: data.title,
        region: data.region,                     // NEW
        category: data.category,
        services: data.service_ids,              // Changed from theme_ids
        location: data.location,
        press_featured: data.press_featured,     // NEW
        video_url: data.video_url                // NEW
      }
    }
  }));
  
  // Optional: Play destination video before opening chat
  if (data.video_url) {
    playDestinationVideo(data.video_url, () => {
      openChatWithContext(data);
    });
  } else {
    openChatWithContext(data);
  }
});
```

#### 3D. HTML Update

**File**: `index.html`

Add region filter container before the map section:

```html
<!-- Add before map section -->
<div class="region-filters" id="regionFilters">
  <!-- Buttons will be dynamically inserted -->
</div>
```

#### 3E. CSS Update

**File**: `styles.css`

```css
.region-filters {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 2rem;
  padding: 2rem 0;
}

.region-filter-btn {
  padding: 0.5rem 1.5rem;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.region-filter-btn.active,
.region-filter-btn:hover {
  background: white;
  color: black;
  border-color: white;
}

@media (max-width: 768px) {
  .region-filters {
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  .region-filter-btn {
    padding: 0.4rem 1rem;
    font-size: 0.75rem;
  }
}
```

---

### **Phase 4: Content Population (2-3 hours)**

**File**: `supabase/seed_henrik_content.sql`

```sql
-- Insert 7 core services
INSERT INTO services (slug, title, excerpt, description, service_type, region_availability, display_order, image_url) VALUES
('underground-luxury', 'Underground Luxury Journeys', 'Hidden speakeasies, rooftop dinners, secret parties', 'Exclusive access to the world''s most secretive cultural experiences. From hidden speakeasies in Tokyo to rooftop gatherings in Beirut, we unlock doors that don''t officially exist.', 'underground', ARRAY['Global'], 1, '/images/services/underground.jpg'),

('lifestyle-culture', 'Lifestyle & Culture Tours', 'Gourmet tastings, art studios, nightlife, creative scenes', 'Immersive journeys through local culture: Michelin kitchens, underground galleries, alternative art spaces, designer studios, and the pulse of authentic nightlife.', 'lifestyle', ARRAY['Global'], 2, '/images/services/lifestyle.jpg'),

('yacht-sailing', 'Sea Holidays', 'Boutique sailing, private charters, hidden coves', 'Mediterranean freedom aboard carefully selected vessels. Private charters to secluded coves, overnight sailing under stars, access to coastal experiences beyond standard itineraries.', 'yacht', ARRAY['Mediterranean'], 3, '/images/services/yacht.jpg'),

('brand-experience', 'Brand Experience Travel', 'Influencer journeys, launches, cultural activations', 'Curated experiences for brands and influencers seeking authentic narratives. We design journeys that photograph beautifully while delivering genuine cultural immersion.', 'brand', ARRAY['Global'], 4, '/images/services/brand.jpg'),

('cool-hunting', 'Cool Hunting Expeditions', 'Tokyo, Berlin, Mexico City, Seoul trend scouting', 'Explore emerging cultural capitals with insider access to the creative vanguard. Meet designers, taste before trends break, visit studios before they''re discovered.', 'cool-hunting', ARRAY['Asia Pacific', 'Americas', 'Nordic'], 5, '/images/services/cool-hunting.jpg'),

('storytelling', 'Storytelling Encounters', 'Curated meetings with chefs, artists, filmmakers, entrepreneurs', 'Intimate encounters with cultural creators. Private dinners with Michelin chefs, studio visits with emerging artists, conversations with visionaries shaping their fields.', 'storytelling', ARRAY['Global'], 6, '/images/services/storytelling.jpg'),

('corporate', 'Corporate & Group Experiences', 'Incentive trips, retreats, innovation scouting', 'Cultural activations for companies and agencies. Innovation retreats in Seoul, trend-scouting in Mexico City markets, team incentives that inspire rather than reward.', 'corporate', ARRAY['Global'], 7, '/images/services/corporate.jpg');

-- Insert 6 hero destinations
INSERT INTO destinations (slug, title, excerpt, description, region, latitude, longitude, category, service_ids, published, video_url, press_featured) VALUES

('beirut-rooftops', 'Beirut Rooftops', 'Sunset cultural mixology at the edge of the Mediterranean', 'Experience Beirut''s renaissance through rooftop gatherings where East meets West. Golden hour overlooking the Mediterranean, conversations with local artists, underground music scenes, and culinary fusion that tells the story of a city''s resilience.', 'Mediterranean', 33.8886, 35.4955, 'city', (SELECT ARRAY_AGG(id) FROM services WHERE service_type IN ('underground', 'lifestyle', 'storytelling')), true, '/video/destinations/beirut-intro.mp4', true),

('tokyo-neon', 'Tokyo Neon Alleys', 'Fast, vibrant nightlife energy in the world''s coolest city', 'Navigate Tokyo''s hidden nightlife through neon-lit alleyways. Exclusive izakayas, underground clubs, designer bars in unmarked buildings, and encounters with the city''s creative rebels.', 'Asia Pacific', 35.6762, 139.6503, 'city', (SELECT ARRAY_AGG(id) FROM services WHERE service_type IN ('underground', 'lifestyle', 'cool-hunting')), true, '/video/destinations/tokyo-intro.mp4', true),

('berlin-underground', 'Berlin Underground', 'Raw, strobe-lit, edgy techno cathedral experiences', 'Access Berlin''s legendary underground club culture. From Berghain to secret warehouse parties, experience the city that never sleeps through the lens of its counterculture pioneers.', 'Nordic', 52.5200, 13.4050, 'city', (SELECT ARRAY_AGG(id) FROM services WHERE service_type IN ('underground', 'lifestyle', 'cool-hunting')), true, '/video/destinations/berlin-intro.mp4', false),

('croatia-yacht', 'Croatian Adriatic', 'Sailing, exclusivity, hidden coves along the Dalmatian coast', 'Boutique sailing through the Adriatic''s most pristine waters. Private charters to islands where luxury meets authenticity, overnight anchoring in secluded bays, access to coastal villages before they trend.', 'Mediterranean', 43.5081, 16.4402, 'coastal', (SELECT ARRAY_AGG(id) FROM services WHERE service_type = 'yacht'), true, '/video/destinations/croatia-intro.mp4', false),

('swedish-mountain', 'Swedish Mountain', 'Mystical, crisp Nordic light under the midnight sun', 'Experience Sweden''s northern wilderness under impossible light. Glass igloos beneath aurora borealis, forest bathing with wellness experts, encounters with Sami culture, and design-forward lodges in absolute silence.', 'Nordic', 67.8558, 20.2253, 'nature', (SELECT ARRAY_AGG(id) FROM services WHERE service_type IN ('lifestyle', 'storytelling')), true, '/video/destinations/sweden-intro.mp4', true),

('rio-ipanema', 'Rio de Janeiro', 'Tropical, sensual, iconic Ipanema Beach with Dois Irmãos mountain', 'Rio beyond the postcard: underground samba clubs, favela art tours led by local artists, beachfront encounters with cultural creators, and the pulse of a city that dances its philosophy.', 'Americas', -22.9868, -43.2048, 'coastal', (SELECT ARRAY_AGG(id) FROM services WHERE service_type IN ('underground', 'lifestyle', 'storytelling')), true, '/video/destinations/rio-intro.mp4', true);

-- Insert press items
INSERT INTO press_items (title, source, quote, published_at, pdf_url, thumbnail_url, display_order) VALUES
('The New Face of Luxury Travel', 'New York Times', 'Redefines what luxury travel means in the 21st century', '2024-06-15', '/press/pdfs/nyt-2024.pdf', '/press/thumbs/nyt.jpg', 1),
('Underground Luxury', 'Forbes', 'The most exclusive cultural journeys in the world', '2024-08-22', '/press/pdfs/forbes-2024.pdf', '/press/thumbs/forbes.jpg', 2),
('Cultural Curation at Its Finest', 'Condé Nast Traveler', 'Where insider access meets editorial storytelling', '2024-09-10', '/press/pdfs/conde-nast-2024.pdf', '/press/thumbs/conde-nast.jpg', 3),
('Design-Led Travel Experiences', 'Wallpaper*', 'Cinematic journeys for the culturally curious', '2024-07-03', '/press/pdfs/wallpaper-2024.pdf', '/press/thumbs/wallpaper.jpg', 4);
```

**Run seed**: `psql -d [database] -f supabase/seed_henrik_content.sql`

---

### **Phase 5: Press Section (3-4 hours)**

#### 5A. Homepage Press Strip

**File**: `index.html`

Add after hero video section:

```html
<!-- Press Recognition Strip -->
<section class="press-strip">
  <div class="container">
    <p class="press-label">As featured in</p>
    <div class="press-logos">
      <img src="/images/press/nyt-logo.svg" alt="New York Times" class="press-logo">
      <img src="/images/press/forbes-logo.svg" alt="Forbes" class="press-logo">
      <img src="/images/press/conde-nast-logo.svg" alt="Condé Nast Traveler" class="press-logo">
      <img src="/images/press/wallpaper-logo.svg" alt="Wallpaper*" class="press-logo">
    </div>
  </div>
</section>
```

**CSS** (add to `styles.css`):

```css
.press-strip {
  background: #000;
  padding: 3rem 0;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.press-label {
  text-align: center;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 2rem;
}

.press-logos {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 4rem;
  flex-wrap: wrap;
}

.press-logo {
  height: 2rem;
  opacity: 0.6;
  transition: opacity 0.3s ease;
  filter: grayscale(1) brightness(0) invert(1);
}

.press-logo:hover {
  opacity: 1;
}

@media (max-width: 768px) {
  .press-logos {
    gap: 2rem;
  }
  .press-logo {
    height: 1.5rem;
  }
}
```

#### 5B. Dedicated Press Page

**File**: `press.html` (new)

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Press & Media — Agent Henrik</title>
  <meta name="description" content="Media coverage and press recognition of Agent Henrik's luxury travel curation.">
  
  <link rel="stylesheet" href="styles.css">
  <script src="component-loader.js"></script>
</head>
<body>
  <div id="header-placeholder"></div>

  <main>
    <!-- Press Hero -->
    <section class="press-hero">
      <div class="container">
        <h1>Press & Recognition</h1>
        <p class="press-intro">Global media coverage of our transformative travel experiences</p>
      </div>
    </section>

    <!-- Press Grid -->
    <section class="press-grid-section">
      <div class="container">
        <div class="press-grid" id="pressGrid">
          <!-- Loaded dynamically from Supabase -->
        </div>
      </div>
    </section>

    <!-- Pull Quotes -->
    <section class="press-quotes">
      <div class="container">
        <blockquote class="press-quote">
          <p>"Redefines what luxury travel means in the 21st century"</p>
          <cite>— New York Times</cite>
        </blockquote>
        <blockquote class="press-quote">
          <p>"The most exclusive cultural journeys in the world"</p>
          <cite>— Forbes</cite>
        </blockquote>
        <blockquote class="press-quote">
          <p>"Where insider access meets editorial storytelling"</p>
          <cite>— Condé Nast Traveler</cite>
        </blockquote>
      </div>
    </section>
  </main>

  <div id="footer-placeholder"></div>

  <script src="supabase-client.js"></script>
  <script src="press.js"></script>
</body>
</html>
```

**File**: `press.js` (new)

```javascript
// Load press items from Supabase
async function loadPressItems() {
  if (!window.supabaseClient) {
    console.error('Supabase client not available');
    return;
  }

  const { data: pressItems, error } = await window.supabaseClient
    .from('press_items')
    .select('*')
    .not('published_at', 'is', null)
    .order('published_at', { ascending: false });

  if (error) {
    console.error('Error loading press:', error);
    return;
  }

  renderPressGrid(pressItems);
}

function renderPressGrid(items) {
  const grid = document.getElementById('pressGrid');
  if (!grid) return;

  grid.innerHTML = items.map(item => `
    <article class="press-card" data-press-id="${item.id}">
      <div class="press-thumbnail">
        <img src="${item.thumbnail_url}" alt="${item.title}">
      </div>
      <div class="press-content">
        <h3 class="press-title">${item.title}</h3>
        <p class="press-source">${item.source}</p>
        <p class="press-date">${formatDate(item.published_at)}</p>
        ${item.pdf_url ? `<a href="${item.pdf_url}" target="_blank" class="press-read-link">Read Article →</a>` : ''}
      </div>
    </article>
  `).join('');
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
}

// Initialize on load
document.addEventListener('DOMContentLoaded', loadPressItems);
```

**CSS** (add to `styles.css`):

```css
.press-hero {
  padding: 8rem 0 4rem;
  text-align: center;
}

.press-hero h1 {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.press-intro {
  font-size: 1.25rem;
  color: rgba(255, 255, 255, 0.7);
  max-width: 40rem;
  margin: 0 auto;
}

.press-grid-section {
  padding: 4rem 0;
}

.press-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
}

.press-card {
  background: #0a0c0e;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: transform 0.3s ease, border-color 0.3s ease;
  cursor: pointer;
}

.press-card:hover {
  transform: translateY(-0.5rem);
  border-color: rgba(255, 255, 255, 0.3);
}

.press-thumbnail {
  aspect-ratio: 3/4;
  overflow: hidden;
  background: #000;
}

.press-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: grayscale(1);
  transition: filter 0.5s ease;
}

.press-card:hover .press-thumbnail img {
  filter: grayscale(0);
}

.press-content {
  padding: 1.5rem;
}

.press-title {
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
}

.press-source {
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 0.25rem;
}

.press-date {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.4);
  margin-bottom: 1rem;
}

.press-read-link {
  display: inline-block;
  font-size: 0.875rem;
  color: white;
  text-decoration: none;
  border-bottom: 1px solid white;
  transition: opacity 0.3s ease;
}

.press-read-link:hover {
  opacity: 0.6;
}

/* Pull Quotes Section */
.press-quotes {
  padding: 6rem 0;
  background: linear-gradient(to bottom, #000, #0a0c0e);
}

.press-quote {
  max-width: 50rem;
  margin: 0 auto 4rem;
  text-align: center;
  font-family: serif;
  font-size: 2rem;
  line-height: 1.4;
  font-style: italic;
}

.press-quote:last-child {
  margin-bottom: 0;
}

.press-quote cite {
  display: block;
  margin-top: 1rem;
  font-size: 1rem;
  font-style: normal;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  color: rgba(255, 255, 255, 0.6);
}

@media (max-width: 768px) {
  .press-quote {
    font-size: 1.5rem;
  }
}
```

#### 5C. Update Navigation

**File**: `/components/header.html`

```html
<nav class="main-nav">
  <a href="/index.html">Explore</a>
  <a href="/journeys.html">Journeys</a>
  <a href="/corporate.html">Corporate</a>
  <a href="/journal.html">Journal</a>
  <a href="/press.html">Press</a>
  <a href="/contact.html">Contact</a>
</nav>
```

---

### **Phase 6: Corporate Section (2-3 hours)**

**File**: `corporate.html` (new)

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Corporate & Group Experiences — Agent Henrik</title>
  <meta name="description" content="Cultural activations, innovation retreats, and brand experiences for companies and agencies.">
  
  <link rel="stylesheet" href="styles.css">
  <script src="component-loader.js"></script>
</head>
<body>
  <div id="header-placeholder"></div>

  <main>
    <!-- Corporate Hero -->
    <section class="corporate-hero">
      <div class="container">
        <h1>For Brands & Groups</h1>
        <p class="corporate-intro">Cultural activations that inspire, retreats that transform, experiences that elevate your brand narrative.</p>
      </div>
    </section>

    <!-- Corporate Offerings -->
    <section class="corporate-offerings">
      <div class="container">
        <div class="offering-grid">
          
          <article class="offering-card">
            <div class="offering-number">01</div>
            <h3>Innovation Retreats</h3>
            <p>Seoul startup founders, Berlin design studios, Stockholm innovation labs. Meet the minds shaping tomorrow.</p>
            <ul class="offering-examples">
              <li>3-5 day immersive programs</li>
              <li>Direct access to founders and creators</li>
              <li>Workshop facilitation available</li>
            </ul>
          </article>

          <article class="offering-card">
            <div class="offering-number">02</div>
            <h3>Trend-Scouting Expeditions</h3>
            <p>Mexico City street markets, Tokyo underground culture, Beirut emerging art scene. Spot trends before they break.</p>
            <ul class="offering-examples">
              <li>2-4 day intensive scouting</li>
              <li>Curated encounters with tastemakers</li>
              <li>Post-trip trend reports</li>
            </ul>
          </article>

          <article class="offering-card">
            <div class="offering-number">03</div>
            <h3>Brand Activations</h3>
            <p>Launch products in Berlin underground clubs, host experiences in hidden speakeasies, create narratives that photograph beautifully.</p>
            <ul class="offering-examples">
              <li>Venue sourcing & curation</li>
              <li>Cultural authenticity guaranteed</li>
              <li>Influencer coordination</li>
            </ul>
          </article>

          <article class="offering-card">
            <div class="offering-number">04</div>
            <h3>Incentive Journeys</h3>
            <p>Reward top performers with experiences they'll never forget. Mediterranean yacht charters, exclusive access, transformative encounters.</p>
            <ul class="offering-examples">
              <li>Fully customizable itineraries</li>
              <li>Group sizes: 8-50 participants</li>
              <li>Ultra-luxury tier available</li>
            </ul>
          </article>

        </div>
      </div>
    </section>

    <!-- For Agencies Section -->
    <section class="agencies-section">
      <div class="container">
        <h2>For Agencies & Event Planners</h2>
        <p class="agencies-intro">We help you design unforgettable experiences for your clients. Consider us your cultural intelligence partner.</p>
        
        <div class="agencies-benefits">
          <div class="benefit">
            <h4>White Label Services</h4>
            <p>Deliver under your brand while we handle ground operations and insider access.</p>
          </div>
          <div class="benefit">
            <h4>Regional Expertise</h4>
            <p>Deep networks across Nordic, Mediterranean, Asia Pacific, and Americas.</p>
          </div>
          <div class="benefit">
            <h4>Rapid Response</h4>
            <p>From brief to delivery in days, not weeks. We understand agency timelines.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="corporate-cta">
      <div class="container">
        <h2>Let's Design Your Experience</h2>
        <p>Every corporate journey begins with a conversation.</p>
        
        <form class="corporate-enquiry-form" id="corporateEnquiryForm">
          <div class="form-row">
            <input type="text" name="company" placeholder="Company Name" required>
            <input type="text" name="contact_name" placeholder="Your Name" required>
          </div>
          <div class="form-row">
            <input type="email" name="email" placeholder="Email" required>
            <input type="tel" name="phone" placeholder="Phone">
          </div>
          <div class="form-row">
            <select name="experience_type" required>
              <option value="">Experience Type</option>
              <option value="innovation-retreat">Innovation Retreat</option>
              <option value="trend-scouting">Trend-Scouting Expedition</option>
              <option value="brand-activation">Brand Activation</option>
              <option value="incentive">Incentive Journey</option>
              <option value="other">Other / Consultation</option>
            </select>
            <input type="number" name="group_size" placeholder="Group Size" min="1">
          </div>
          <textarea name="details" placeholder="Tell us about your goals and vision..." rows="4"></textarea>
          
          <button type="submit" class="submit-btn">Request Consultation</button>
        </form>
      </div>
    </section>
  </main>

  <div id="footer-placeholder"></div>
  
  <script src="supabase-client.js"></script>
  <script src="corporate-form.js"></script>
</body>
</html>
```

**File**: `corporate-form.js` (new)

```javascript
document.getElementById('corporateEnquiryForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const formData = new FormData(e.target);
  const data = Object.fromEntries(formData);
  
  // Submit to Supabase
  const { error } = await window.supabaseClient
    .from('corporate_inquiries')
    .insert([{
      company: data.company,
      contact_name: data.contact_name,
      email: data.email,
      phone: data.phone,
      experience_type: data.experience_type,
      group_size: parseInt(data.group_size) || null,
      details: data.details,
      source: 'Corporate Page'
    }]);

  if (error) {
    console.error('Error submitting:', error);
    alert('Sorry, there was an error. Please try again or email us directly.');
    return;
  }

  // Success
  e.target.reset();
  alert('Thank you! We\'ll be in touch within 24 hours.');
});
```

**CSS** (add to `styles.css`):

```css
.corporate-hero {
  padding: 8rem 0 4rem;
  text-align: center;
}

.corporate-hero h1 {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.corporate-intro {
  font-size: 1.25rem;
  color: rgba(255, 255, 255, 0.7);
  max-width: 50rem;
  margin: 0 auto;
}

.corporate-offerings {
  padding: 4rem 0;
}

.offering-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.offering-card {
  background: #0a0c0e;
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 2rem;
  transition: border-color 0.3s ease;
}

.offering-card:hover {
  border-color: rgba(255, 255, 255, 0.3);
}

.offering-number {
  font-size: 3rem;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.2);
  margin-bottom: 1rem;
}

.offering-card h3 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
}

.offering-card p {
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 1.5rem;
}

.offering-examples {
  list-style: none;
  padding: 0;
}

.offering-examples li {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.6);
  padding-left: 1.5rem;
  position: relative;
  margin-bottom: 0.5rem;
}

.offering-examples li::before {
  content: "→";
  position: absolute;
  left: 0;
}

.agencies-section {
  padding: 6rem 0;
  background: linear-gradient(to bottom, #000, #0a0c0e);
  text-align: center;
}

.agencies-section h2 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.agencies-intro {
  font-size: 1.25rem;
  color: rgba(255, 255, 255, 0.7);
  max-width: 45rem;
  margin: 0 auto 3rem;
}

.agencies-benefits {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 3rem;
  max-width: 60rem;
  margin: 0 auto;
}

.benefit h4 {
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
}

.benefit p {
  color: rgba(255, 255, 255, 0.6);
}

.corporate-cta {
  padding: 6rem 0;
  text-align: center;
}

.corporate-cta h2 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.corporate-cta > p {
  font-size: 1.125rem;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 3rem;
}

.corporate-enquiry-form {
  max-width: 50rem;
  margin: 0 auto;
  text-align: left;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
}

.corporate-enquiry-form input,
.corporate-enquiry-form select,
.corporate-enquiry-form textarea {
  width: 100%;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 1rem;
}

.corporate-enquiry-form textarea {
  grid-column: 1 / -1;
  resize: vertical;
}

.submit-btn {
  width: 100%;
  padding: 1rem 2rem;
  background: white;
  color: black;
  border: none;
  font-size: 1rem;
  cursor: pointer;
  transition: opacity 0.3s ease;
}

.submit-btn:hover {
  opacity: 0.8;
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}
```

---

### **Phase 7: Context Updates (1-2 hours)**

**File**: `liv-ai.js`

Find the context initialization (around line 26-34) and update:

```javascript
// UPDATE this.context structure:
this.context = {
  type: 'destination' | 'service' | 'region' | 'corporate',
  name: 'Destination or Service Name',
  
  // NEW FIELDS:
  region: 'Mediterranean',           // Geographic region
  service: 'Underground Luxury',     // Primary service type
  press_featured: false,             // If featured in press
  budget_tier: 'premium',            // Budget category
  
  // EXISTING:
  location: 'Beirut',
  season: 'Summer',
  greeting: 'Optional custom greeting'
};
```

Find the event listeners (around line 125-169) and update to pass new context fields:

```javascript
// Update mapMarkerClicked listener
document.addEventListener('mapMarkerClicked', (e) => {
  const destination = e.detail.destination;
  this.openChatWithContext({
    type: 'destination',
    name: destination.title,
    region: destination.region,                  // NEW
    service: destination.services?.[0],          // NEW
    press_featured: destination.press_featured,  // NEW
    location: destination.location,
    category: destination.category,
    greeting: `You're exploring ${destination.title}`
  });
});
```

---

### **Phase 8: Hero Video Integration**

#### Option A: MVP Placeholder (Use First - 1 hour)

**File**: `index.html`

Replace current hero section with:

```html
<section class="hero-sequence">
  <video autoplay muted loop playsinline>
    <source src="https://fjnfsabvuiyzuzfhxzcc.supabase.co/storage/v1/object/public/video/Luxury%20Travel%20Sweden%20intro%2040%20second%20HI-RES%20master.mp4" type="video/mp4">
  </video>
  
  <div class="hero-overlay">
    <div class="hero-branding">
      <h1>Agent Henrik</h1>
      <p class="hero-subtitle">Global Luxury Travel Architect</p>
      <p class="hero-tagline">Your Insider Journey Begins Here</p>
    </div>
    <div class="hero-cta">
      <button class="explore-btn" onclick="document.getElementById('map')?.scrollIntoView({ behavior: 'smooth' })">
        Start Explore →
      </button>
    </div>
  </div>
</section>
```

**CSS** (add to `styles.css`):

```css
.hero-sequence {
  position: relative;
  height: 100vh;
  overflow: hidden;
}

.hero-sequence video {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hero-overlay {
  position: relative;
  z-index: 2;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  background: linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.6));
}

.hero-branding h1 {
  font-size: 4rem;
  margin-bottom: 1rem;
  letter-spacing: 0.1em;
}

.hero-subtitle {
  font-size: 1.5rem;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 0.5rem;
}

.hero-tagline {
  font-size: 1.125rem;
  color: rgba(255, 255, 255, 0.6);
  font-style: italic;
  margin-bottom: 3rem;
}

.hero-cta .explore-btn {
  padding: 1rem 3rem;
  background: white;
  color: black;
  border: none;
  font-size: 1rem;
  cursor: pointer;
  transition: opacity 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.hero-cta .explore-btn:hover {
  opacity: 0.8;
}

@media (max-width: 768px) {
  .hero-branding h1 {
    font-size: 2.5rem;
  }
  .hero-subtitle {
    font-size: 1.125rem;
  }
}
```

#### Option B: Full Video Sequence (Implement When Footage Ready - 4-6 hours)

See separate doc: `HERO_VIDEO_SEQUENCE_IMPLEMENTATION.md` (to be created when video ready)

---

### **Phase 9: Branding Updates (1 hour)**

**File**: `/components/header.html`

Update logo and branding:

```html
<header class="site-header">
  <div class="container">
    <div class="header-logo">
      <a href="/index.html">
        <h1>Agent Henrik</h1>
      </a>
    </div>
    
    <nav class="main-nav">
      <a href="/index.html">Explore</a>
      <a href="/journeys.html">Journeys</a>
      <a href="/corporate.html">Corporate</a>
      <a href="/journal.html">Journal</a>
      <a href="/press.html">Press</a>
      <a href="/contact.html">Contact</a>
    </nav>
  </div>
</header>
```

**File**: `/components/footer.html`

Update footer content:

```html
<footer class="site-footer">
  <div class="container">
    <div class="footer-content">
      <div class="footer-branding">
        <h3>Agent Henrik</h3>
        <p>Global Luxury Travel Architect</p>
      </div>
      
      <nav class="footer-nav">
        <a href="/about.html">About</a>
        <a href="/imprint.html">Imprint</a>
        <a href="/terms.html">Terms & Conditions</a>
        <a href="/privacy.html">Privacy Policy</a>
      </nav>
      
      <div class="footer-newsletter">
        <h4>Join the Insider Circle</h4>
        <form class="newsletter-form">
          <input type="email" placeholder="Your email" required>
          <button type="submit">Subscribe</button>
        </form>
      </div>
      
      <div class="footer-social">
        <a href="#" aria-label="Instagram">Instagram</a>
        <a href="#" aria-label="YouTube">YouTube</a>
        <a href="#" aria-label="LinkedIn">LinkedIn</a>
      </div>
    </div>
    
    <div class="footer-copyright">
      <p>&copy; 2025 Agent Henrik. All rights reserved.</p>
    </div>
  </div>
</footer>
```

---

## Testing Checklist

After implementation, verify:

- [ ] Database migrations ran successfully
- [ ] All 7 services seeded correctly
- [ ] 6 destinations appear on map with correct regions
- [ ] Press items display on homepage and press page
- [ ] Map centers at [30, 0] with zoom 2
- [ ] Region filters work correctly
- [ ] Map marker clicks trigger AI chat with correct context
- [ ] LIV AI personality is "Agent Henrik" (not Sweden-focused)
- [ ] Press quotes appear in AI system prompt
- [ ] Services appear in AI system prompt
- [ ] Regional seasonal awareness works
- [ ] Corporate form submits to database
- [ ] Press page loads and renders correctly
- [ ] B&W to color hover effect works on press thumbnails
- [ ] Navigation includes all new pages
- [ ] Hero video displays correctly
- [ ] Mobile responsive on all new pages

---

## Deployment Steps

1. **Database**:
   ```bash
   psql -d [database] -f supabase/migrations/[timestamp]_agent_henrik_schema.sql
   psql -d [database] -f supabase/seed_henrik_content.sql
   ```

2. **Edge Function**:
   ```bash
   supabase functions deploy liv-chat
   ```

3. **Static Assets**:
   - Upload press logos to `/images/press/`
   - Upload press thumbnails to `/press/thumbs/`
   - Upload hero video (if ready)
   - Upload destination videos (if ready)

4. **DNS/Domain** (if needed):
   - Update domain to point to Agent Henrik
   - Update SSL certificates

---

## Optional Enhancements (Future Phase 2)

- [ ] Destination video intros (10-20 sec per city)
- [ ] Full hero video sequence (factory + 6 vignettes)
- [ ] Investment level tiers in form (Boutique/Premium/Ultra-Exclusive)
- [ ] Itinerary draft preview before email capture
- [ ] Service detail modals
- [ ] Region-specific seasonal knowledge expansion
- [ ] Newsletter subscription backend
- [ ] About page with cinematic portrait

---

**Document Version**: 1.0  
**Created**: 2025-11-07  
**For**: Claude Code Implementation  
**Project**: Agent Henrik Global Expansion
