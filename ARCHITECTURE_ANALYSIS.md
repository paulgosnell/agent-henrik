# Sweden Luxury Travel Site - Architecture Analysis

**Purpose**: Technical analysis for adapting Sweden-focused system to Agent Henrik (global scope)

**Date**: 2025-11-07

---

## Table of Contents

1. [LIV AI System Architecture](#1-liv-ai-system-architecture)
2. [Map Explorer Implementation](#2-map-explorer-implementation)
3. [Pillar/Service Content Structure](#3-pillarservice-content-structure)
4. [Form & Data Flow](#4-form--data-flow)
5. [Component Architecture](#5-component-architecture)
6. [Summary: Key Modifications for Agent Henrik](#summary-key-modifications-for-agent-henrik)

---

## 1. LIV AI System Architecture

### System Prompt Structure

**Location**: `supabase/functions/liv-chat/index.ts`

**Current Sweden-Focused Implementation:**

The system has **two distinct AI modes**:

#### A. Regular Itinerary Mode (`buildSystemPrompt`)

- **Knowledge Base Injected**: destinations (15), themes (6), admin instructions from `liv_instructions` table
- **Personality**: "Sophisticated, warm cultural insider" focused on Swedish travel
- **Core Prompt Structure**:
  ```
  - Destinations knowledge (pulled from DB)
  - Themes: Nature & Wellness, Design & Innovation, Culinary, Royal Heritage, Art & Culture, Nightlife, Legacy
  - Seasonal considerations (Sweden-specific)
  - Admin instructions (dynamic from liv_instructions table)
  - Context awareness (map click, story, experience, theme)
  - Contact capture logic (high-intent detection)
  ```

**Key Themes** (currently hardcoded in prompt):
- Hidden Nature & Wellness
- Design & Innovation
- Culinary & Storytelling
- Royal & Heritage
- Art & Culture
- Nightlife & Celebrations
- Legacy & Meaningful Travel

#### B. Storyteller Discovery Mode (`buildStorytellerPrompt`)

- **Knowledge Base**: storytellers from `stories` table (category='Storyteller')
- **Topics**: film, music, performance, fashion, design, art, writing, photography, digital media, technology, wellness
- **Activity Types**: meet & greet, workshop, creative activity
- **4-Stage Conversation Flow**:
  1. Topic selection
  2. Activity type selection
  3. Storyteller suggestions (filtered by topic)
  4. Booking details collection

---

### 🎯 KEY MODIFICATIONS NEEDED FOR AGENT HENRIK

#### System Prompt Changes

**File**: `supabase/functions/liv-chat/index.ts`

```typescript
// REPLACE Sweden-specific knowledge with global scope:
// ❌ Remove: hardcoded seasonal knowledge (Sweden-specific)
// ✅ Add: global destinations from database (all regions)
// ✅ Add: service-based filtering (not just theme-based)
// ✅ Add: press coverage as trust signals in prompt
// ✅ Modify: personality from "Swedish insider" to "Global luxury travel architect"

// NEW system prompt structure:
const systemPrompt = `You are Agent Henrik, global luxury travel architect for [Company Name].
You design transformative journeys across the world's most compelling destinations...

## Your Knowledge Base

### Available Destinations (Global):
${globalDestinationsKnowledge} // Pull from all regions, not just Sweden

### Services & Experiences:
${servicesKnowledge} // Replace themes with services structure

### Press Recognition:
${pressQuotes} // Inject credibility from press_items table

### Regional Expertise:
- **Nordic Region**: ${nordicDestinations}
- **Mediterranean**: ${medDestinations}
- **Asia Pacific**: ${asiaDestinations}
- **Americas**: ${americasDestinations}
...

## Your Approach
1. **Global perspective**: You curate experiences across all regions
2. **Service-driven**: Focus on transformation types (not geographic themes)
3. **Press-backed**: Reference media recognition to build trust
4. **Region-aware**: Understand seasonal nuances across continents
...
`;
```

#### Data Loading Changes

**Current** (Sweden-only):
```typescript
const [destinationsResult, themesResult, instructionsResult] = await Promise.all([
  supabase.from('destinations').select('*').eq('published', true),
  supabase.from('themes').select('*'),
  supabase.from('liv_instructions').select('*').eq('is_active', true)
]);
```

**Modified** (Global):
```typescript
const [destinations, services, pressItems, regions] = await Promise.all([
  supabase.from('destinations').select('*').eq('published', true), // All regions
  supabase.from('services').select('*').eq('published', true), // New table
  supabase.from('press_items').select('*').not('published_at', 'is', null).limit(5),
  supabase.from('regions').select('*').eq('published', true) // Optional: region metadata
]);
```

---

### API Integration Pattern

**Current Flow**:

**Client-side** (`liv-ai.js:547-570`):
```javascript
const response = await fetch(this.edgeFunctionUrl, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${this.supabaseAnonKey}`,
    'apikey': this.supabaseAnonKey
  },
  body: JSON.stringify({
    messages: this.conversationHistory,
    sessionId: this.sessionId,
    context: this.context,
    stream: true,
    leadInfo: this.leadInfo,
    storytellerInquiry: this.storytellerInquiry
  })
});
```

**Server-side** (Edge Function):
1. Load data: destinations, themes, instructions (or storytellers)
2. Save/update conversation to DB
3. Handle lead capture → creates record in `leads` table
4. Build system prompt with loaded data
5. Call OpenAI GPT-4o with streaming
6. Save messages to `conversation_messages` table

**Model**: `gpt-4o`
**Temperature**: `0.8`
**Max Tokens**: `2000`

**🎯 Assessment**: NO MAJOR CHANGES NEEDED - The wrapper pattern is solid. Just modify data loading as shown above.

---

### Context Management & State

**Context Object Structure** (`liv-ai.js:26-34`):

```javascript
this.context = {
  type: 'map' | 'story' | 'experience' | 'theme' | 'destination' | 'storyteller' | 'corporate',
  name: 'Stockholm', // destination/experience name
  category: 'city', // destination category
  themes: ['Design & Innovation'], // array of theme names
  location: 'Stockholm',
  season: 'Summer',
  greeting: 'Custom greeting override' // Optional
}
```

**Context Triggers** (`liv-ai.js:125-169`):
- Map marker clicks → `mapMarkerClicked` event
- Story clicks → `storyClicked` event
- Experience clicks → `experienceClicked` event
- Theme filter selections → `themeSelected` event
- `[data-open-liv]` buttons with `data-liv-context-type` and `data-liv-context-name` attributes

---

### 🎯 EXPAND CONTEXT FOR HENRIK

```javascript
// Modified context structure
this.context = {
  type: 'destination' | 'service' | 'press' | 'region' | 'corporate',
  name: 'Kyoto Temple Retreat',

  // NEW FIELDS:
  region: 'Asia Pacific', // Geographic region
  service: 'Wellness & Transformation', // Replaces themes
  press_featured: true, // If featured in press
  budget_tier: 'ultra-luxury', // Budget category

  // EXISTING:
  location: 'Kyoto, Japan',
  season: 'Spring',
  greeting: 'Optional custom greeting'
}
```

**Event Dispatching Changes**:
```javascript
// Example: Map marker click
document.dispatchEvent(new CustomEvent('mapMarkerClicked', {
  detail: {
    destination: {
      title: data.title,
      region: data.region, // NEW
      category: data.category,
      services: data.serviceKeys, // Changed from themes
      location: data.location,
      press_featured: data.press_featured // NEW
    }
  }
}));
```

---

### Conversation State Handling

**Current Storage** (Supabase tables):

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `conversations` | Chat session | `session_id`, `context` (jsonb), `lead_id`, `status`, `message_count` |
| `conversation_messages` | Individual messages | `conversation_id`, `role` (user/assistant/system), `content`, `created_at` |
| `leads` | Master contact record | `email`, `name`, `phone`, `country`, `preferences` (jsonb), `source`, `status` |
| `booking_inquiries` | Booking request | `lead_id`, `itinerary_summary`, `destinations_of_interest`, `themes_of_interest` |
| `storyteller_inquiries` | Storyteller requests | `topic_of_interest`, `activity_type`, `selected_storyteller_id` |

**🎯 Assessment**: NO SCHEMA CHANGES NEEDED

The `context` (jsonb) and `preferences` (jsonb) fields are flexible enough to support global scope. Just populate differently:

```javascript
// Example: Lead preferences for Henrik
preferences: {
  chat_context: {
    type: 'destination',
    name: 'Kyoto Temple Retreat',
    region: 'Asia Pacific',
    service: 'Wellness & Transformation',
    budget_tier: 'ultra-luxury'
  },
  interest_summary: 'Wellness journey in Asia Pacific - Ultra-luxury tier'
}
```

---

## 2. Map Explorer Implementation

### Data Structure

**Current Destinations Table** (`destinations`):

```sql
CREATE TABLE destinations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE,
  title text,
  description text,
  image_url text,
  latitude numeric,
  longitude numeric,
  category text CHECK (category IN ('city', 'seaside', 'province', 'beach', 'ski', 'park')),
  seasons text[], -- ['Spring', 'Summer', 'Autumn', 'Winter']
  theme_ids uuid[], -- References themes table
  published boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

**Map Data Transformation** (`supabase-client.js:736-790`):

```javascript
// Loads destinations + storytellers into window.destinationData
window.destinationData = {
  'stockholm': {
    title: 'Stockholm',
    description: '...',
    image: 'url',
    themes: ['Design & Innovation', 'Culinary'],
    seasons: ['Spring', 'Summer', 'Autumn', 'Winter'],
    coordinates: [18.0686, 59.3293], // [lng, lat] for Leaflet
    themeKeys: ['design-innovation', 'culinary'],
    category: 'city'
  },
  'storyteller_uuid': {
    title: 'Anna Eriksson – Film Director',
    category: 'storyteller',
    coordinates: [18.0686, 59.3293],
    // ...
  }
}
```

---

### 🎯 MODIFICATIONS FOR HENRIK

#### 1. Add `region` field to destinations table

```sql
ALTER TABLE destinations ADD COLUMN region text;
-- Values: 'Nordic', 'Mediterranean', 'Asia Pacific', 'Americas', 'Middle East', 'Africa'

-- Create index for filtering
CREATE INDEX idx_destinations_region ON destinations(region);
```

#### 2. Replace `themes` with `services`

```sql
-- Create services table (replaces themes)
CREATE TABLE services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE,
  label text, -- 'Wellness & Transformation'
  description text,
  icon_name text, -- Lucide icon
  category text, -- 'experiences', 'corporate', 'specialized'
  display_order integer DEFAULT 0,
  published boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Update destinations to reference services instead of themes
ALTER TABLE destinations ADD COLUMN service_ids uuid[];
-- Optional: keep theme_ids during transition, remove later
```

#### 3. Update map initialization for global view

**File**: `scripts.js:1190-1250`

**Current** (Sweden-focused):
```javascript
map = L.map('map', {
  center: [62, 15], // Sweden center
  zoom: 5, // Country-level zoom
  // ...
});
```

**Modified** (Global):
```javascript
map = L.map('map', {
  center: [30, 0], // Global center (slightly north of equator)
  zoom: 2, // World-level zoom
  minZoom: 2, // Prevent zooming out too far
  maxZoom: 18,
  // ... rest stays same
});
```

#### 4. Add region filtering UI

```javascript
// Add region filter controls
const regionFilters = ['All', 'Nordic', 'Mediterranean', 'Asia Pacific', 'Americas', 'Middle East', 'Africa'];

function filterByRegion(region) {
  Object.keys(markers).forEach(key => {
    const destination = destinationData[key];
    if (region === 'All' || destination.region === region) {
      markers[key].addTo(map);
    } else {
      map.removeLayer(markers[key]);
    }
  });
}
```

---

### Video Integration Per Location

**Current Status**: NOT IMPLEMENTED. Destinations only have `image_url`.

**🎯 TO ADD VIDEO SUPPORT**:

#### 1. Database changes

```sql
ALTER TABLE destinations ADD COLUMN video_url text;
ALTER TABLE destinations ADD COLUMN video_thumbnail_url text;
ALTER TABLE destinations ADD COLUMN video_autoplay boolean DEFAULT false;
```

#### 2. Map overlay card update

**File**: `scripts.js:1276-1313`

```javascript
function showMapOverlayCard(cityKey, data) {
  if (!mapOverlayCard || !data) return;

  // Add video element if video_url exists
  if (data.video_url) {
    mapCardImage.style.display = 'none'; // Hide image

    const videoHtml = `
      <video
        ${data.video_autoplay ? 'autoplay' : ''}
        muted
        loop
        playsinline
        class="map-card-video"
        poster="${data.video_thumbnail_url || data.image}"
      >
        <source src="${data.video_url}" type="video/mp4">
      </video>
    `;
    mapCardImage.insertAdjacentHTML('afterend', videoHtml);
  } else {
    // Use image as fallback
    mapCardImage.src = data.image;
    mapCardImage.alt = data.title;
    mapCardImage.style.display = 'block';
  }

  // ... rest of function
}
```

---

### Click Interaction Flow

**Current Flow** (`scripts.js:1302-1313`):

```javascript
// 1. User clicks map marker
marker.on('click', () => {
  showMapOverlayCard(cityKey, destinationData[cityKey]);
});

// 2. Overlay card displays with CTA button
// 3. User clicks "Design with LIV" button
mapCardCta.onclick = (e) => {
  e.preventDefault();
  e.stopPropagation();

  // 4. Dispatch event with destination context
  document.dispatchEvent(new CustomEvent('mapMarkerClicked', {
    detail: {
      destination: {
        title: data.title,
        category: data.category,
        themes: data.themeKeys,
        location: data.title
      }
    }
  }));

  // 5. Open LIV chat (liv-ai.js listens for mapMarkerClicked event)
  window.LivAI.openChat();
};
```

---

### 🎯 MODIFICATION FOR HENRIK

```javascript
mapCardCta.onclick = (e) => {
  e.preventDefault();
  e.stopPropagation();

  // Dispatch event with ENHANCED context
  document.dispatchEvent(new CustomEvent('mapMarkerClicked', {
    detail: {
      destination: {
        title: data.title,
        region: data.region, // NEW
        category: data.category,
        services: data.serviceKeys, // Changed from themes
        location: data.location, // Full location string
        press_featured: data.press_featured, // NEW
        budget_tier: data.budget_tier // NEW (if applicable)
      }
    }
  }));

  // Close overlay and open chat
  mapOverlayCard.classList.remove('show');
  window.LivAI.openChat();
};
```

**Event Listener** (`liv-ai.js:127-136`):
```javascript
document.addEventListener('mapMarkerClicked', (event) => {
  const { destination } = event.detail;
  this.openChatWithContext({
    type: 'map',
    name: destination.title,
    region: destination.region, // NEW
    category: destination.category,
    services: destination.services, // Changed from themes
    location: destination.location,
    press_featured: destination.press_featured // NEW
  });
});
```

---

### Map Data → AI Connection

**Flow Diagram**:
```
User clicks marker
  ↓
showMapOverlayCard() displays card
  ↓
User clicks "Design with LIV" CTA
  ↓
mapMarkerClicked event dispatched
  ↓
liv-ai.js listener captures event
  ↓
openChatWithContext() called with destination data
  ↓
Context stored in this.context
  ↓
Message sent to Edge Function with context
  ↓
Edge Function injects context into system prompt
  ↓
AI response personalized to destination
```

**Example AI Response** (with context):
```
User clicked: "Kyoto Temple Retreat" (Asia Pacific, Wellness & Transformation)

AI Prompt Injection:
"The visitor has just clicked on 'Kyoto Temple Retreat' on the map (a wellness destination
in Asia Pacific). They are clearly interested in transformation experiences in this region."

AI Response:
"Ah, Kyoto — a perfect choice for transformation. I see you're drawn to Asia Pacific's
wellness sanctuaries. Shall we design a 7-day journey that weaves temple meditation,
private tea ceremonies, and forest bathing into a complete reset?"
```

---

## 3. Pillar/Service Content Structure

### Current Implementation

**Three Separate Content Systems:**

#### A. `experiences` table (6 core offerings)

```sql
CREATE TABLE experiences (
  id uuid PRIMARY KEY,
  slug text UNIQUE,
  title text,
  excerpt text, -- 1-2 sentences for card
  description text, -- Full rich HTML content
  image_url text,
  icon_name text, -- Lucide icon (e.g., 'mountain', 'sparkles')
  category text CHECK (category IN ('nature', 'design', 'royal-culture', 'culinary', 'nightlife', 'legacy')),
  theme_ids uuid[], -- References themes
  published boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

**Example Data**:
| slug | title | category | icon_name |
|------|-------|----------|-----------|
| `hidden-nature-wellness` | Hidden Nature & Wellness | nature | leaf |
| `design-innovation` | Design & Innovation | design | lightbulb |
| `culinary-storytelling` | Culinary & Storytelling | culinary | chef-hat |

#### B. `pillars` table (flexible content blocks)

```sql
CREATE TABLE pillars (
  id uuid PRIMARY KEY,
  slug text UNIQUE,
  title text,
  excerpt text,
  content text, -- Rich HTML
  hero_image_url text,
  icon_name text,
  section text CHECK (section IN ('experiences', 'corporate', 'services')),
  category text, -- For filtering
  display_order integer DEFAULT 0,
  published boolean DEFAULT true,
  cta_text text DEFAULT 'Design with LIV',
  liv_context_type text DEFAULT 'experience', -- For LIV personalization
  liv_context_name text, -- Passed to LIV when clicked
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

**Purpose**: Flexible content system for homepage sections (Experiences, Corporate & Incentives, Services)

#### C. `corporate_offerings` table (6 corporate types)

```sql
CREATE TABLE corporate_offerings (
  id uuid PRIMARY KEY,
  slug text UNIQUE,
  title text,
  excerpt text,
  description text,
  image_url text,
  icon_name text,
  category text CHECK (category IN ('leadership', 'innovation', 'celebration', 'purpose', 'wellness', 'incentive')),
  published boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

**Example Data**:
| slug | title | category |
|------|-------|----------|
| `leadership-retreat` | Leadership Retreats | leadership |
| `innovation-immersion` | Innovation Immersion | innovation |
| `celebration-events` | Celebration & Events | celebration |

---

### 🎯 CONSOLIDATION FOR HENRIK

**RECOMMENDATION**: Merge into single `services` table for simplicity and consistency.

#### Proposed `services` table

```sql
CREATE TABLE services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE,
  title text,
  excerpt text, -- 1-2 sentences for card display
  description text, -- Rich HTML content for modal/detail page
  hero_image_url text,
  icon_name text, -- Lucide icon identifier

  -- New fields for Henrik's global scope
  service_type text CHECK (service_type IN (
    'experience',
    'corporate',
    'specialized',
    'wellness',
    'adventure',
    'cultural',
    'transformation'
  )),

  region_availability text[], -- ['Nordic', 'Global', 'Asia Pacific'] or NULL for all
  press_mentions integer DEFAULT 0, -- Count of press items mentioning this service

  -- Keep flexibility
  category text, -- Subcategory within service_type
  tags text[], -- Flexible tagging: ['luxury', 'meditation', 'exclusive']

  published boolean DEFAULT true,
  featured boolean DEFAULT false, -- Highlight on homepage
  display_order integer DEFAULT 0,

  -- LIV integration
  liv_context_type text DEFAULT 'service',
  liv_context_name text, -- Passed to LIV AI

  -- SEO
  meta_description text,
  meta_keywords text[],

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX idx_services_service_type ON services(service_type);
CREATE INDEX idx_services_published ON services(published);
CREATE INDEX idx_services_featured ON services(featured);
```

#### Migration strategy

1. **Merge existing data**:
```sql
-- Insert from experiences
INSERT INTO services (slug, title, excerpt, description, image_url, icon_name, service_type, category, published, display_order, liv_context_type, liv_context_name)
SELECT slug, title, excerpt, description, image_url, icon_name, 'experience', category, published, display_order, 'experience', title
FROM experiences;

-- Insert from corporate_offerings
INSERT INTO services (slug, title, excerpt, description, image_url, icon_name, service_type, category, published, display_order, liv_context_type, liv_context_name)
SELECT slug, title, excerpt, description, image_url, icon_name, 'corporate', category, published, display_order, 'corporate', title
FROM corporate_offerings;

-- Insert from pillars (where section = 'services')
INSERT INTO services (slug, title, excerpt, description, hero_image_url, icon_name, service_type, category, published, display_order, liv_context_type, liv_context_name)
SELECT slug, title, excerpt, content, hero_image_url, icon_name, 'specialized', category, published, display_order, liv_context_type, liv_context_name
FROM pillars
WHERE section = 'services';
```

2. **Update frontend queries**:
```javascript
// OLD:
const experiences = await Supabase.db.getExperiences();
const corporate = await Supabase.db.getCorporateOfferings();

// NEW:
const services = await supabaseClient
  .from('services')
  .select('*')
  .eq('published', true)
  .order('display_order');

// Filter by type:
const experiences = services.filter(s => s.service_type === 'experience');
const corporate = services.filter(s => s.service_type === 'corporate');
```

---

### Content Schema: Key Fields

| Field | Purpose | Example |
|-------|---------|---------|
| `excerpt` | Card display (1-2 sentences) | "Transform through mindfulness retreats and wellness immersions." |
| `description` | Full rich HTML content | `<p>Our wellness journeys combine...</p>` |
| `icon_name` | Lucide icon identifier | `'mountain'`, `'sparkles'`, `'heart-pulse'` |
| `service_type` | Primary categorization | `'experience'`, `'corporate'`, `'wellness'` |
| `region_availability` | Geographic scope | `['Nordic', 'Asia Pacific']` or `NULL` for global |
| `liv_context_type` | LIV AI context type | `'service'` |
| `liv_context_name` | Passed to LIV for personalization | `'Wellness & Transformation'` |

---

### Modal Presentation System

**Current Status**: NOT IMPLEMENTED. Cards display inline with excerpt, no modal system for full content.

**🎯 RECOMMENDATION FOR HENRIK**: Add modal system for service details

#### HTML Structure

```html
<!-- Service Card -->
<div class="service-card" data-service-id="wellness-transformation">
  <img src="..." alt="...">
  <h3>Wellness & Transformation</h3>
  <p class="excerpt">Transform through mindfulness...</p>
  <button class="btn-learn-more">Learn More</button>
  <button class="btn-design-liv" data-open-liv data-liv-context-type="service" data-liv-context-name="Wellness & Transformation">
    Design with Henrik
  </button>
</div>

<!-- Service Modal -->
<div id="serviceModal" class="modal">
  <div class="modal-content">
    <button class="modal-close" id="serviceModalClose">&times;</button>
    <img id="serviceModalImage" src="" alt="">
    <h2 id="serviceModalTitle"></h2>
    <div id="serviceModalContent"></div>
    <button id="serviceModalCTA" class="btn-primary">Design This Experience</button>
  </div>
</div>
```

#### JavaScript Implementation

```javascript
// Show service modal
function showServiceModal(serviceId) {
  // Fetch service data
  const service = servicesData.find(s => s.slug === serviceId);
  if (!service) return;

  const modal = document.getElementById('serviceModal');
  document.getElementById('serviceModalImage').src = service.hero_image_url;
  document.getElementById('serviceModalTitle').textContent = service.title;
  document.getElementById('serviceModalContent').innerHTML = service.description;

  // Setup CTA button to open LIV with context
  document.getElementById('serviceModalCTA').onclick = () => {
    window.LivAI.openChatWithContext({
      type: 'service',
      name: service.liv_context_name || service.title,
      service: service.service_type,
      category: service.category
    });
    modal.classList.remove('show');
  };

  modal.classList.add('show');
}

// Close modal
document.getElementById('serviceModalClose').addEventListener('click', () => {
  document.getElementById('serviceModal').classList.remove('show');
});

// Attach to "Learn More" buttons
document.querySelectorAll('.btn-learn-more').forEach(btn => {
  btn.addEventListener('click', (e) => {
    const card = e.target.closest('.service-card');
    const serviceId = card.getAttribute('data-service-id');
    showServiceModal(serviceId);
  });
});
```

---

## 4. Form & Data Flow

### Lead Capture Flow

**Trigger Points** (`liv-ai.js:470-538`):

1. **Email auto-detection**: Regex scans user messages for email addresses
   ```javascript
   const emailRegex = /\b[^\s@]+@[^\s@]+\.[^\s@]+\b/;
   const emailMatch = message.match(emailRegex);
   ```

2. **High-intent keywords**:
   ```javascript
   const highIntentKeywords = [
     'send me', 'email me', 'book', 'pricing', 'price',
     'available', 'availability', 'cost', 'dates', 'reserve',
     'reservation', 'interested in', 'quote', 'itinerary',
     'details', 'more information', 'get in touch', 'contact',
     'ready to', 'how much', 'budget'
   ];
   ```

3. **Manual trigger**: Floating "Get Custom Itinerary" button after engagement
   - Shows after 2+ messages
   - Only if no lead info captured yet

4. **Post-AI response**: Form appears 3 seconds after AI responds to high-intent message

---

### Contact Form Implementation

**Form HTML** (`liv-ai.js:290-329`):

```javascript
showContactForm(prefilledEmail = null) {
  const formHtml = `
    <div class="chat-message ai">
      <p>${message}</p>
    </div>
    <div class="chat-contact-form" id="contactForm">
      <div class="form-group">
        <label for="leadName">Name</label>
        <input type="text" id="leadName" placeholder="Your name" />
      </div>
      <div class="form-group">
        <label for="leadEmail">Email *</label>
        <input type="email" id="leadEmail" placeholder="your@email.com"
               value="${prefilledEmail || ''}"
               ${prefilledEmail ? 'readonly' : ''} required />
      </div>
      <div class="form-group">
        <label for="leadPhone">Phone (optional)</label>
        <input type="tel" id="leadPhone" placeholder="+46 xxx xxx xxx" />
      </div>
      <div class="form-group">
        <label for="leadCountry">Country (optional)</label>
        <input type="text" id="leadCountry" placeholder="Your country" />
      </div>
      <button class="btn-submit-contact" id="submitContact">Submit</button>
      <button class="btn-skip-contact" id="skipContact">Maybe later</button>
    </div>
  `;
}
```

**Form Submission** (`liv-ai.js:334-372`):

```javascript
async handleContactSubmit() {
  // 1. Validate email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    alert('Please enter a valid email address');
    return;
  }

  // 2. Store lead info locally
  this.leadInfo = {
    name: name || undefined,
    email,
    phone: phone || undefined,
    country: country || undefined
  };

  // 3. Remove form, show confirmation
  document.getElementById('contactForm')?.remove();
  this.appendMessage('ai', `Thank you${name ? ', ' + name : ''}! I've got your details.`);

  // 4. Immediately save to database
  await this.saveLead();

  // 5. Clear context after capturing lead
  this.context = null;
}
```

---

### Lead Creation & Storage

**Edge Function Flow** (`supabase/functions/liv-chat/index.ts:120-152`):

#### Step 1: Check if lead exists

```typescript
const { data: existingLead, error: leadCheckError } = await supabase
  .from('leads')
  .select('id')
  .eq('email', leadInfo.email)
  .single();

if (existingLead) {
  leadId = existingLead.id;
  console.log('✅ Found existing lead:', leadId);
}
```

#### Step 2: Create new lead with preferences

```typescript
if (!existingLead) {
  // Build preferences object with context information
  const preferences = {
    chat_context: {
      type: context.type || 'general',
      name: context.name || null,
      category: context.category || null,
      themes: context.themes || null,
      season: context.season || null,
      location: context.location || null
    },
    // Human-readable summary
    interest_summary: generateInterestSummary(context)
  };

  // Add storyteller inquiry details if available
  if (storytellerInquiry) {
    preferences.storyteller_inquiry = {
      topic: storytellerInquiry.topic || null,
      activity_type: storytellerInquiry.activityType || null,
      inquiry_type: storytellerInquiry.inquiryType || null,
      group_size: storytellerInquiry.groupSize || null,
      preferred_dates: storytellerInquiry.preferredDates || null,
      budget_range: storytellerInquiry.budgetRange || null
    };
  }

  const { data: newLead, error: insertError } = await supabase
    .from('leads')
    .insert({
      email: leadInfo.email,
      name: leadInfo.name || null,
      phone: leadInfo.phone || null,
      country: leadInfo.country || null,
      source: 'liv_chat',
      first_conversation_id: conversationId,
      preferences: preferences
    })
    .select()
    .single();

  leadId = newLead?.id;
  console.log('✅ Created new lead:', leadId, 'with preferences:', preferences);
}
```

**Interest Summary Examples**:
- `"Destination: Stockholm"`
- `"Experience: Design & Innovation"`
- `"Storyteller: Film industry professionals"`
- `"Theme: Wellness & Nature"`

#### Step 3: Link conversation to lead

```typescript
if (conversationId && leadId) {
  await supabase
    .from('conversations')
    .update({
      lead_id: leadId,
      status: 'converted' // Changed from 'active'
    })
    .eq('id', conversationId);
}
```

---

### Draft Itinerary Attachment

**CURRENT STATUS**: NOT IMPLEMENTED

The system currently captures:
- Conversation history in `conversation_messages` table
- Context in `conversations.context` (jsonb)
- User preferences in `leads.preferences` (jsonb)

**BUT**: No automatic itinerary generation or attachment to enquiry form.

---

### 🎯 TO IMPLEMENT ITINERARY DRAFT

#### Step 1: Add generation method to client

**File**: `liv-ai.js`

```javascript
/**
 * Generate itinerary draft from conversation
 */
async generateItinerary() {
  try {
    console.log('🗺️ Generating itinerary draft...');

    // Send conversation to AI with special prompt
    const response = await fetch(this.edgeFunctionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.supabaseAnonKey}`,
        'apikey': this.supabaseAnonKey
      },
      body: JSON.stringify({
        messages: [
          ...this.conversationHistory,
          {
            role: 'system',
            content: `Based on this conversation, create a concise 3-7 day itinerary summary.
            Format as bullet points with:
            - Day-by-day breakdown
            - Specific destinations mentioned
            - Key experiences discussed
            - Estimated timing
            Be specific and reference actual places/activities from the conversation.`
          }
        ],
        stream: false,
        sessionId: this.sessionId,
        context: this.context
      })
    });

    const data = await response.json();
    const draft = data.choices?.[0]?.message?.content;

    if (draft) {
      this.itineraryDraft = draft;
      console.log('✅ Itinerary draft generated');

      // Display draft to user
      this.appendMessage('ai',
        `Here's a draft itinerary based on our conversation:\n\n${draft}\n\n` +
        `Shall I send you the full detailed proposal?`
      );

      return draft;
    }
  } catch (error) {
    console.error('❌ Error generating itinerary:', error);
    return null;
  }
}
```

#### Step 2: Trigger generation before contact form

```javascript
async handleSendMessage() {
  // ... existing message handling ...

  // Detect high-intent keywords
  const highIntentDetected = hasHighIntent(message);

  if (highIntentDetected && !this.leadInfo) {
    // Generate itinerary first
    await this.generateItinerary();

    // Then show contact form after AI responds (3 seconds delay)
    setTimeout(() => {
      if (!this.leadInfo && !document.getElementById('contactForm')) {
        this.showContactForm();
      }
    }, 3000);
  }
}
```

#### Step 3: Include in booking inquiry

**Edge Function** (`supabase/functions/liv-chat/index.ts`):

```typescript
// After lead is created, create booking inquiry if itinerary exists
if (leadId && context && itineraryDraft) {
  // Extract destinations mentioned in conversation
  const destinationsOfInterest = extractDestinationsFromMessages(messages, destinations);

  // Extract themes/services discussed
  const themesOfInterest = context.themes || context.services || [];

  await supabase.from('booking_inquiries').insert({
    lead_id: leadId,
    conversation_id: conversationId,
    email: leadInfo.email,
    name: leadInfo.name || null,

    // Itinerary details
    itinerary_summary: itineraryDraft, // AI-generated draft
    destinations_of_interest: destinationsOfInterest,
    themes_of_interest: themesOfInterest,

    // Initial metadata from context
    special_requests: extractSpecialRequests(messages),

    status: 'pending'
  });

  console.log('✅ Booking inquiry created with itinerary draft');
}
```

#### Helper functions

```typescript
function extractDestinationsFromMessages(messages, destinations) {
  const mentioned = [];
  const destinationNames = destinations.map(d => d.title.toLowerCase());

  messages.forEach(msg => {
    if (msg.role === 'user' || msg.role === 'assistant') {
      destinationNames.forEach((name, idx) => {
        if (msg.content.toLowerCase().includes(name)) {
          mentioned.push(destinations[idx].title);
        }
      });
    }
  });

  return [...new Set(mentioned)]; // Remove duplicates
}

function extractSpecialRequests(messages) {
  const requests = [];
  const keywords = ['private jet', 'yacht', 'chef', 'helicopter', 'exclusive', 'vip'];

  messages.forEach(msg => {
    if (msg.role === 'user') {
      keywords.forEach(keyword => {
        if (msg.content.toLowerCase().includes(keyword)) {
          requests.push(msg.content);
        }
      });
    }
  });

  return requests.join('\n\n');
}
```

---

### Supabase Submission Tables

#### Complete Table Relationships

```
leads (master contact)
  ├── conversations (chat sessions)
  │     └── conversation_messages (individual messages)
  │
  ├── booking_inquiries (travel booking requests)
  │
  └── storyteller_inquiries (storyteller connection requests)
```

#### Table Details

**`leads`**:
```sql
id uuid PRIMARY KEY
email text UNIQUE
name text
phone text
country text
preferences jsonb -- {chat_context, interest_summary, storyteller_inquiry}
source text DEFAULT 'liv_chat'
status text CHECK (new, contacted, qualified, converted, closed)
notes text
first_conversation_id uuid REFERENCES conversations(id)
created_at timestamptz
updated_at timestamptz
contacted_at timestamptz
converted_at timestamptz
```

**`conversations`**:
```sql
id uuid PRIMARY KEY
session_id text UNIQUE -- Client-generated
lead_id uuid REFERENCES leads(id)
context jsonb -- {type, name, region, service, themes, location}
started_at timestamptz
last_message_at timestamptz
message_count integer
status text CHECK (active, converted, closed)
tags text[]
```

**`booking_inquiries`**:
```sql
id uuid PRIMARY KEY
lead_id uuid REFERENCES leads(id)
conversation_id uuid REFERENCES conversations(id)
email text
name text
phone text
travel_dates_start date
travel_dates_end date
group_size integer
budget_range text
destinations_of_interest text[] -- Extracted from conversation
themes_of_interest text[] -- Extracted from context
special_requests text
itinerary_summary text -- AI-generated or user-described
status text CHECK (pending, reviewing, quoted, booked, cancelled)
created_at timestamptz
updated_at timestamptz
```

**`storyteller_inquiries`**:
```sql
id uuid PRIMARY KEY
conversation_id uuid REFERENCES conversations(id)
lead_id uuid REFERENCES leads(id)
email text
name text
phone text
company text
selected_storyteller_id uuid REFERENCES stories(id)
storyteller_name text
topic_of_interest text -- film, music, etc.
activity_type text -- meet_and_greet, workshop, creative_activity
inquiry_type text CHECK (private, corporate)
group_size integer
preferred_dates text
budget_range text
special_requests text
conversation_summary text
ai_suggestions text[] -- Storytellers suggested during chat
status text CHECK (pending, reviewing, contacted_storyteller, confirmed, declined, completed)
internal_notes text
created_at timestamptz
updated_at timestamptz
```

---

### 🎯 Assessment for Henrik

**NO SCHEMA CHANGES NEEDED**

All tables use flexible `jsonb` fields for context and preferences, which support global scope:

```javascript
// Example: Henrik's lead with Asia Pacific wellness interest
{
  email: "client@example.com",
  preferences: {
    chat_context: {
      type: "destination",
      name: "Kyoto Temple Retreat",
      region: "Asia Pacific",
      service: "Wellness & Transformation",
      budget_tier: "ultra-luxury"
    },
    interest_summary: "Wellness journey in Asia Pacific - Ultra-luxury tier"
  },
  source: "agent_henrik_chat"
}
```

**Only change**: Update `source` field for tracking:
- `'liv_chat'` → `'agent_henrik_chat'`

---

## 5. Component Architecture

### Header/Footer Component System

**File**: `component-loader.js`

#### How It Works

**Step 1: Define components**
```javascript
const COMPONENTS = {
  header: {
    url: '/components/header.html',
    placeholder: '#header-placeholder'
  },
  footer: {
    url: '/components/footer.html',
    placeholder: '#footer-placeholder'
  }
};
```

**Step 2: Fetch and inject HTML**
```javascript
async function loadComponent(name, config) {
  const placeholder = document.querySelector(config.placeholder);
  const response = await fetch(config.url);
  const html = await response.text();

  // Replace placeholder with actual component HTML
  placeholder.outerHTML = html;

  // Dispatch event for other scripts to initialize
  document.dispatchEvent(new CustomEvent(`component-loaded:${name}`, {
    detail: { name, placeholder: config.placeholder }
  }));
}
```

**Step 3: Initialize all components on page load**
```javascript
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadAllComponents);
} else {
  loadAllComponents();
}
```

#### Usage in HTML Pages

```html
<!DOCTYPE html>
<html>
<head>
  <title>Luxury Travel</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <!-- Header placeholder -->
  <div id="header-placeholder"></div>

  <!-- Page content -->
  <main>
    <h1>Welcome</h1>
  </main>

  <!-- Footer placeholder -->
  <div id="footer-placeholder"></div>

  <!-- Load component system FIRST -->
  <script src="component-loader.js"></script>

  <!-- Then load page scripts -->
  <script src="scripts.js"></script>
</body>
</html>
```

#### Event System for Initialization

**Listening for component load**:
```javascript
// Wait for footer to load before initializing theme toggle
document.addEventListener('component-loaded:footer', () => {
  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', handleThemeToggle);
    console.log('✅ Theme toggle initialized');
  }
});
```

**Component files**:
- `/components/header.html` - Navigation, logo, menu
- `/components/footer.html` - Links, theme toggle, login

---

### 🎯 Assessment for Henrik

**NO CHANGES NEEDED**

The component loader is framework-agnostic and reusable. Just update the HTML component files:

1. **Update branding in `/components/header.html`**:
   - Change logo
   - Update navigation links
   - Modify site title

2. **Update `/components/footer.html`**:
   - Update company info
   - Update social links
   - Keep theme toggle functionality

---

### Inline Editor System

**File**: `inline-editor.js`

#### How Content is Made Editable

**Step 1: Mark elements with `data-editable` attribute**

```html
<!-- Homepage example -->
<section class="hero">
  <h1 data-editable="hero_title">Luxury Travel Sweden</h1>
  <p data-editable="hero_subtitle">Extraordinary journeys through Nordic landscapes</p>
  <a href="#" class="cta" data-editable="hero_cta_text">Explore Now</a>
</section>

<section class="about">
  <h2 data-editable="about_title">Our Story</h2>
  <p data-editable="about_intro">We craft bespoke experiences...</p>
</section>
```

**Step 2: Content loads from Supabase on page load**

```javascript
async function loadStaticContent() {
  const content = await window.Supabase.db.getStaticContent();
  // content = {
  //   'hero_title': 'Luxury Travel Sweden',
  //   'hero_subtitle': 'Extraordinary journeys...',
  //   ...
  // }

  document.querySelectorAll('[data-editable]').forEach(el => {
    const key = el.getAttribute('data-editable');

    // Store original value
    InlineEditor.originalValues[key] = content[key] || el.innerHTML;

    // Update element with database value
    if (content[key]) {
      if (/<[a-z][\s\S]*>/i.test(content[key])) {
        el.innerHTML = content[key]; // Has HTML tags
      } else {
        el.textContent = content[key]; // Plain text
      }
    }
  });
}
```

**Step 3: Enable edit mode for authenticated users**

```javascript
function enableEditMode() {
  const editableElements = document.querySelectorAll('[data-editable]');

  editableElements.forEach(el => {
    // Make editable
    el.contentEditable = true;
    el.classList.add('editable-active');

    // Track changes
    el.addEventListener('input', () => {
      const key = el.getAttribute('data-editable');
      InlineEditor.trackedChanges[key] = el.innerHTML;
      updateSaveButton();
    });
  });
}
```

**Step 4: Save changes back to Supabase**

```javascript
async function saveChanges() {
  const updates = {};

  // Collect all changes
  Object.keys(InlineEditor.trackedChanges).forEach(key => {
    updates[key] = InlineEditor.trackedChanges[key];
  });

  // Batch update to database
  await window.Supabase.db.batchUpdateStaticContent(updates);

  // Clear tracked changes
  InlineEditor.trackedChanges = {};
  updateOriginalValues();

  showNotification('✅ Changes saved successfully');
}
```

#### Database Storage

**`static_content` table**:

```sql
CREATE TABLE static_content (
  key text PRIMARY KEY,              -- 'hero_title'
  value text,                        -- 'Luxury Travel Sweden'
  section text,                      -- 'homepage', 'about', 'services'
  description text,                  -- For admin reference
  content_type text DEFAULT 'text',  -- 'text', 'html', 'markdown'
  updated_at timestamptz DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id)
);
```

**Example data**:

| key | value | section | description |
|-----|-------|---------|-------------|
| `hero_title` | `Luxury Travel Sweden` | homepage | Main hero heading |
| `hero_subtitle` | `Extraordinary journeys...` | homepage | Hero subheading |
| `about_intro` | `We craft bespoke...` | about | About section intro |
| `footer_copyright` | `© 2025 Luxury Travel` | global | Footer copyright text |

#### Authentication & Permissions

**Check authentication**:
```javascript
async function initInlineEditor() {
  // Check if user is logged in
  const user = await window.Supabase.auth.getUser();
  InlineEditor.isAuthenticated = !!user;

  if (InlineEditor.isAuthenticated) {
    // Create edit mode toggle button
    createEditorUI();
  } else {
    // Show "LOGIN TO EDIT" link in footer (for non-auth users)
    console.log('🔒 Not authenticated - edit mode hidden');
  }
}
```

**Row-level security** (RLS):
```sql
-- Only authenticated users can update static content
CREATE POLICY "Authenticated users can update static content"
ON static_content
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Everyone can read static content
CREATE POLICY "Anyone can read static content"
ON static_content
FOR SELECT
TO anon, authenticated
USING (true);
```

#### UI Elements

**Edit Mode Toggle Button** (only visible when authenticated):
```html
<button id="editModeBtn" class="edit-mode-btn">
  <span class="edit-mode-icon">✏️</span>
  <span class="edit-mode-text">Edit Mode: OFF</span>
</button>
```

**Save Changes Button** (appears when changes are made):
```html
<button id="saveChangesBtn" class="save-changes-btn">
  <span class="save-icon">💾</span>
  <span class="save-text">Save Changes</span>
</button>
```

**Visual indicators**:
- Editable elements get yellow outline when in edit mode
- Unsaved changes warning on page exit
- Success/error notifications after save

#### Features

1. **Authentication check** before editing
2. **Visual indicators** for editable elements
3. **Change tracking** with original value comparison
4. **Batch saving** for performance
5. **Unsaved changes warning** on page navigation
6. **Success/error notifications**
7. **Keyboard shortcuts**: Ctrl+E (toggle edit mode), Ctrl+S (save)

---

### 🎯 Assessment for Henrik

**NO CHANGES NEEDED**

The inline editor is content-agnostic. Just:

1. **Update content values** in `static_content` table:
```sql
UPDATE static_content SET value = 'Agent Henrik' WHERE key = 'hero_title';
UPDATE static_content SET value = 'Global luxury travel architecture' WHERE key = 'hero_subtitle';
```

2. **Add new editable content** by marking HTML elements:
```html
<h2 data-editable="henrik_tagline">Designing transformative journeys worldwide</h2>
```

The system will automatically make it editable for authenticated users.

---

## Summary: Key Modifications for Agent Henrik

### Critical Changes Required

#### 1. System Prompt (Edge Function)

**File**: `supabase/functions/liv-chat/index.ts`

**Changes**:
- ❌ Remove Sweden-specific seasonal knowledge
- ✅ Add global destinations grouped by region
- ✅ Replace themes with services framework
- ✅ Inject press quotes as credibility signals
- ✅ Change personality: "Swedish insider" → "Global luxury architect"

**Code location**: `buildSystemPrompt()` function

---

#### 2. Database Schema

**Add `region` column**:
```sql
ALTER TABLE destinations ADD COLUMN region text;
CREATE INDEX idx_destinations_region ON destinations(region);
```

**Create `services` table** (consolidate pillars/experiences/corporate):
```sql
CREATE TABLE services (
  id uuid PRIMARY KEY,
  slug text UNIQUE,
  title text,
  excerpt text,
  description text,
  service_type text CHECK (service_type IN ('experience', 'corporate', 'specialized', 'wellness', 'adventure')),
  region_availability text[],
  category text,
  published boolean DEFAULT true,
  display_order integer DEFAULT 0,
  liv_context_type text DEFAULT 'service',
  liv_context_name text
);
```

**Update destinations**:
```sql
ALTER TABLE destinations ADD COLUMN service_ids uuid[];
-- Optional during transition: keep theme_ids, migrate gradually
```

---

#### 3. Map Implementation

**File**: `scripts.js`

**Changes**:
```javascript
// Change map center/zoom for global view (line ~1210)
map = L.map('map', {
  center: [30, 0],  // Changed from [62, 15] (Sweden)
  zoom: 2,          // Changed from 5
  minZoom: 2
});
```

**Add region filtering**:
```javascript
function filterByRegion(region) {
  Object.keys(markers).forEach(key => {
    const destination = destinationData[key];
    if (region === 'All' || destination.region === region) {
      markers[key].addTo(map);
    } else {
      map.removeLayer(markers[key]);
    }
  });
}
```

---

#### 4. Context Object

**File**: `liv-ai.js`

**Expand context structure**:
```javascript
// Add to openChatWithContext() calls:
this.openChatWithContext({
  type: 'destination',
  name: destination.title,
  region: destination.region,           // NEW
  service: destination.primaryService,  // NEW (replaces themes)
  press_featured: destination.pressFeatured, // NEW
  budget_tier: destination.budgetTier,  // NEW
  location: destination.location,
  season: destination.season
});
```

---

#### 5. Event Dispatching

**File**: `scripts.js` (map marker clicks)

**Update event detail**:
```javascript
document.dispatchEvent(new CustomEvent('mapMarkerClicked', {
  detail: {
    destination: {
      title: data.title,
      region: data.region,              // NEW
      category: data.category,
      services: data.serviceKeys,       // Changed from themes
      location: data.location,
      press_featured: data.press_featured // NEW
    }
  }
}));
```

---

### No Changes Needed

✅ **API wrapper pattern** - Solid architecture, reusable
✅ **Database tables** - Flexible jsonb fields support global scope
✅ **Component loader system** - Framework-agnostic
✅ **Inline editor system** - Content-agnostic
✅ **Lead capture flow** - Works for any context
✅ **Conversation storage** - Supports flexible context/preferences

---

### Optional Enhancements

**Consider adding** (not required, but valuable):

1. **Video integration** for destinations:
   ```sql
   ALTER TABLE destinations ADD COLUMN video_url text;
   ALTER TABLE destinations ADD COLUMN video_thumbnail_url text;
   ```

2. **Itinerary draft generation** before email capture:
   - Generate AI summary of conversation
   - Display to user before contact form
   - Store in `booking_inquiries.itinerary_summary`

3. **Modal system** for service details:
   - Full content display before opening chat
   - Better UX than inline cards

4. **Press integration** in chat interface:
   - Show press quotes during conversation
   - Build trust and credibility
   - "As featured in Forbes, Condé Nast..."

5. **Regional seasonal knowledge**:
   - Replace Sweden-specific seasons with region-aware logic
   - Mediterranean: Summer peak, mild winters
   - Nordic: Northern lights winter, midnight sun summer
   - Asia Pacific: Monsoon awareness, festival seasons

---

## Implementation Priority

### Phase 1: Core Data (Week 1)
1. Add `region` column to destinations
2. Create `services` table
3. Migrate existing content to services
4. Update map center/zoom

### Phase 2: AI Adaptation (Week 2)
5. Modify system prompt for global scope
6. Update data loading in Edge Function
7. Expand context object structure
8. Test conversation flows

### Phase 3: Frontend Updates (Week 2-3)
9. Add region filtering to map
10. Update event dispatching
11. Update service card displays
12. Test all LIV triggers

### Phase 4: Polish (Week 3-4)
13. Add video support (optional)
14. Implement itinerary draft generation (optional)
15. Create service detail modals (optional)
16. Integrate press mentions into chat (optional)

---

## Files to Modify

| File | Changes | Priority |
|------|---------|----------|
| `supabase/functions/liv-chat/index.ts` | System prompt, data loading | **Critical** |
| Database schema | Add region, create services table | **Critical** |
| `scripts.js` | Map center/zoom, region filtering | **High** |
| `liv-ai.js` | Expand context object | **High** |
| `supabase-client.js` | Update data transformation | **Medium** |
| `/components/header.html` | Branding update | **Medium** |
| `/components/footer.html` | Company info | **Low** |
| `static_content` table | Update content values | **Low** |

---

## Code Snippets for Quick Reference

### System Prompt Template (Henrik)

```typescript
function buildSystemPrompt(destinations, services, pressItems, instructions, context, hasContactInfo) {
  const pressKnowledge = pressItems.map(p =>
    `- ${p.title} (${p.source})`
  ).join('\n');

  const servicesKnowledge = services.map(s =>
    `- **${s.title}** (${s.service_type}): ${s.excerpt}`
  ).join('\n');

  return `You are Agent Henrik, global luxury travel architect.
You design transformative journeys across the world's most compelling destinations.

## Your Knowledge Base

### Press Recognition:
${pressKnowledge}

### Services & Transformations:
${servicesKnowledge}

### Available Destinations:
${destinationsKnowledge}

## Your Personality
- Global perspective with deep regional expertise
- Service-driven: focus on transformation, not just geography
- Press-backed credibility
- Sophisticated yet warm

${contextIntro}
${contactInfoGuidance}
...
`;
}
```

### Region Filtering (Map)

```javascript
// Add filter UI
const regionButtons = ['All', 'Nordic', 'Mediterranean', 'Asia Pacific', 'Americas'];
const filterContainer = document.getElementById('regionFilters');

regionButtons.forEach(region => {
  const btn = document.createElement('button');
  btn.textContent = region;
  btn.onclick = () => filterByRegion(region);
  filterContainer.appendChild(btn);
});

function filterByRegion(region) {
  Object.entries(markers).forEach(([key, marker]) => {
    const dest = destinationData[key];
    if (region === 'All' || dest.region === region) {
      marker.addTo(map);
    } else {
      map.removeLayer(marker);
    }
  });
}
```

---

## Testing Checklist

- [ ] Map displays global view (zoom 2, center [30, 0])
- [ ] Region filtering works correctly
- [ ] Map marker clicks pass region + services in context
- [ ] LIV AI receives enhanced context
- [ ] System prompt includes global destinations
- [ ] Press items appear in AI knowledge base
- [ ] Lead capture stores region/service preferences
- [ ] Booking inquiries include correct metadata
- [ ] Service cards display with new schema
- [ ] Component loader works with updated branding
- [ ] Inline editor functions with new content

---

**Document Version**: 1.0
**Last Updated**: 2025-11-07
**Prepared For**: Agent Henrik Global Expansion
