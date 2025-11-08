# Agent Henrik Homepage Updates - Section-by-Section Guide

**Purpose**: Transform Sweden-focused homepage into global Agent Henrik experience

**Key Branding Change**: LIV → Agent Henrik (AI concierge rebrand)

---

## Overview: What Changes

### ✅ KEEP (Minimal Changes)
- Hero video section (swap video)
- Map infrastructure (expand scope)
- Press section (already global-ready)
- AI concierge section (reprompt only)
- Journal preview grid (swap content)
- Contact form (keep structure)

### ❌ REMOVE (Sweden-Specific)
- Seasonal toggle filters
- Sweden-specific theme filters
- Category filters (provinces, ski areas, beaches)
- All 6 Sweden journey pillars
- All 6 Sweden corporate pillars
- Hardcoded storyteller profiles
- Instagram handle reference

### ➕ ADD (New for Agent Henrik)
- Region filters (Nordic, Mediterranean, Asia Pacific, Americas)
- Service type filters (7 global services)
- Global destinations on map
- 7 service cards (loaded from database)
- Corporate page link/teaser
- Press strip integration

---

## Section 1: Map Section Updates

**File**: `index.html` (Lines 203-274)

### A. Update Section Heading

```html
<!-- CURRENT -->
<div class="section-heading">
    <span class="eyebrow" data-editable="map.eyebrow">Global Destinations</span>
    <h2 data-editable="map.headline" style="white-space: nowrap;">Where will LIV take you</h2>
    <p data-editable="map.description">Tap a destination to explore...</p>
</div>

<!-- REPLACE WITH -->
<div class="section-heading">
    <span class="eyebrow">Destinations</span>
    <h2>Where will Agent Henrik take you?</h2>
    <p>Tap a destination to unlock insider access. From Beirut's rooftops to Tokyo's neon alleys, Berlin's underground to Rio's beaches, each pin reveals transformative journeys curated by Agent Henrik.</p>
</div>
```

### B. Remove Seasonal Toggle (Lines 218-223)

```html
<!-- DELETE THIS ENTIRE BLOCK -->
<div class="seasonal-toggle">
    <button type="button" class="season-btn active" data-season="spring">Spring</button>
    <button type="button" class="season-btn" data-season="summer">Summer</button>
    <button type="button" class="season-btn" data-season="autumn">Autumn</button>
    <button type="button" class="season-btn" data-season="winter">Winter</button>
</div>
```

**Why**: Seasons are too Sweden-specific. Global destinations have varied seasons. This filter doesn't scale.

### C. Replace Theme Filters with Service Type Filters (Lines 224-232)

```html
<!-- DELETE THIS -->
<div class="theme-filters">
    <button type="button" class="filter-btn active" data-filter="nature">Nature & Wellness</button>
    <button type="button" class="filter-btn active" data-filter="design">Design & Innovation</button>
    <button type="button" class="filter-btn active" data-filter="royal-culture">Royal, Art & Culture</button>
    <button type="button" class="filter-btn active" data-filter="culinary">Culinary</button>
    <button type="button" class="filter-btn active" data-filter="nightlife">Nightlife & Celebrations</button>
    <button type="button" class="filter-btn active" data-filter="legacy">Legacy & Purpose</button>
    <button type="button" class="filter-btn active" data-filter="all" id="themeToggleAll">All On</button>
</div>

<!-- REPLACE WITH -->
<div class="service-filters">
    <button type="button" class="filter-btn active" data-service="underground">Underground Luxury</button>
    <button type="button" class="filter-btn active" data-service="lifestyle">Lifestyle & Culture</button>
    <button type="button" class="filter-btn active" data-service="yacht">Yacht & Sailing</button>
    <button type="button" class="filter-btn active" data-service="brand">Brand Experiences</button>
    <button type="button" class="filter-btn active" data-service="cool-hunting">Cool Hunting</button>
    <button type="button" class="filter-btn active" data-service="storytelling">Storytelling</button>
    <button type="button" class="filter-btn active" data-service="corporate">Corporate</button>
    <button type="button" class="filter-btn active" data-service="all" id="serviceToggleAll">All Services</button>
</div>
```

### D. Remove Category Filters (Lines 233-242)

```html
<!-- DELETE THIS ENTIRE BLOCK -->
<div class="category-filters">
    <button type="button" class="category-filter-btn active" data-category="province">Provinces</button>
    <button type="button" class="category-filter-btn active" data-category="city">Cities & towns</button>
    <button type="button" class="category-filter-btn active" data-category="seaside">Seaside Towns & Summer Hotspots</button>
    <button type="button" class="category-filter-btn active" data-category="beach">Beaches</button>
    <button type="button" class="category-filter-btn active" data-category="ski">Ski areas</button>
    <button type="button" class="category-filter-btn active" data-category="park">National parks</button>
    <button type="button" class="category-filter-btn active" data-category="storyteller">Storytellers</button>
    <button type="button" class="category-toggle-all active" id="categoryToggleAll">All On</button>
</div>
```

**Why**: These are pure Sweden geography categories. Not relevant to global scope.

### E. Final Map Controls Structure

```html
<div class="map-controls">
    <!-- Region Filters (already added in Phase 3 of build plan) -->
    <div class="region-filters" id="regionFilters">
        <!-- Buttons dynamically inserted by JS -->
    </div>
    
    <!-- Service Type Filters (NEW) -->
    <div class="service-filters" id="serviceFilters">
        <button type="button" class="filter-btn active" data-service="underground">Underground Luxury</button>
        <button type="button" class="filter-btn active" data-service="lifestyle">Lifestyle & Culture</button>
        <button type="button" class="filter-btn active" data-service="yacht">Yacht & Sailing</button>
        <button type="button" class="filter-btn active" data-service="brand">Brand Experiences</button>
        <button type="button" class="filter-btn active" data-service="cool-hunting">Cool Hunting</button>
        <button type="button" class="filter-btn active" data-service="storytelling">Storytelling</button>
        <button type="button" class="filter-btn active" data-service="corporate">Corporate</button>
        <button type="button" class="filter-btn active" data-service="all" id="serviceToggleAll">All Services</button>
    </div>
</div>
```

### F. Update Map Card CTA Text (Line 266)

```html
<!-- CURRENT -->
<button type="button" class="map-card-cta" data-open-liv>Design My Journey with LIV</button>

<!-- REPLACE WITH -->
<button type="button" class="map-card-cta" data-open-liv>Explore with Agent Henrik</button>
```

---

## Section 2: Journeys/Services Section Updates

**File**: `index.html` (Lines 276-391)

### Complete Section Replacement

```html
<!-- DELETE LINES 276-391 (entire current section) -->

<!-- REPLACE WITH -->
<section class="section" id="journeys">
    <div class="section-inner">
        <div class="section-heading">
            <span class="eyebrow">Services</span>
            <h2>Seven transformations that define luxury travel</h2>
            <p>For cultural tastemakers who seek more than destinations — who want access to the world's hidden vanguard. Our journeys blend insider access, editorial storytelling, and uncompromising luxury.</p>
        </div>
        
        <div class="services-grid" id="servicesGrid">
            <!-- Services loaded dynamically from Supabase -->
            <!-- Fallback: 7 service cards will be inserted here -->
        </div>
        
        <div style="text-align: center; margin-top: 3rem;">
            <a href="/journeys.html" class="story-cta-view-all">VIEW ALL SERVICES</a>
        </div>
    </div>
</section>
```

### JavaScript to Load Services

**File**: `scripts.js` (add new function)

```javascript
// Load services from Supabase
async function loadServices() {
    if (!window.supabaseClient) {
        console.error('Supabase client not available');
        return;
    }

    const { data: services, error } = await window.supabaseClient
        .from('services')
        .select('*')
        .eq('published', true)
        .order('display_order');

    if (error) {
        console.error('Error loading services:', error);
        return;
    }

    renderServicesGrid(services);
}

function renderServicesGrid(services) {
    const grid = document.getElementById('servicesGrid');
    if (!grid) return;

    grid.innerHTML = services.map(service => `
        <article class="service-card" data-service="${service.slug}">
            <div class="service-media" aria-hidden="true">
                <img src="${service.image_url}" alt="${service.title}" decoding="async" loading="lazy">
            </div>
            <div class="service-body">
                <div class="service-icon" aria-hidden="true">
                    <i data-lucide="${getServiceIcon(service.service_type)}"></i>
                </div>
                <div class="service-copy">
                    <h3>${service.title}</h3>
                    <p>${service.excerpt}</p>
                    <button type="button" class="read-more-btn">Read more</button>
                    <button type="button" class="service-cta" data-open-liv data-liv-context-type="service" data-liv-context-name="${service.title}">
                        Explore with Agent Henrik
                    </button>
                </div>
            </div>
        </article>
    `).join('');

    // Reinitialize Lucide icons
    if (window.lucide) {
        lucide.createIcons();
    }
}

function getServiceIcon(serviceType) {
    const iconMap = {
        'underground': 'eye-off',
        'lifestyle': 'coffee',
        'yacht': 'sailboat',
        'brand': 'sparkles',
        'cool-hunting': 'compass',
        'storytelling': 'book-open',
        'corporate': 'briefcase'
    };
    return iconMap[serviceType] || 'circle';
}

// Call on page load
document.addEventListener('DOMContentLoaded', loadServices);
```

### CSS Updates

**File**: `styles.css`

```css
/* Rename .pillars-grid to .services-grid */
.services-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 2rem;
    margin-top: 3rem;
}

.service-card {
    background: #0a0c0e;
    border: 1px solid rgba(255, 255, 255, 0.1);
    transition: border-color 0.3s ease, transform 0.3s ease;
    overflow: hidden;
}

.service-card:hover {
    border-color: rgba(255, 255, 255, 0.3);
    transform: translateY(-0.25rem);
}

.service-media {
    aspect-ratio: 16/9;
    overflow: hidden;
    background: #000;
}

.service-media img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s ease;
}

.service-card:hover .service-media img {
    transform: scale(1.05);
}

.service-body {
    padding: 2rem;
}

.service-icon {
    width: 3rem;
    height: 3rem;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 50%;
    margin-bottom: 1rem;
}

.service-icon svg {
    width: 1.5rem;
    height: 1.5rem;
    color: white;
}

.service-copy h3 {
    font-size: 1.5rem;
    margin-bottom: 1rem;
}

.service-copy p {
    color: rgba(255, 255, 255, 0.7);
    margin-bottom: 1.5rem;
    line-height: 1.6;
}

.read-more-btn {
    background: transparent;
    border: none;
    color: rgba(255, 255, 255, 0.6);
    font-size: 0.875rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    cursor: pointer;
    margin-bottom: 1rem;
    padding: 0;
}

.read-more-btn:hover {
    color: white;
}

.service-cta {
    width: 100%;
    padding: 1rem;
    background: white;
    color: black;
    border: none;
    font-size: 0.875rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    cursor: pointer;
    transition: opacity 0.3s ease;
}

.service-cta:hover {
    opacity: 0.8;
}

@media (max-width: 768px) {
    .services-grid {
        grid-template-columns: 1fr;
    }
}
```

---

## Section 3: Corporate Section Updates

**File**: `index.html` (Lines 393-490)

### Simplify to Teaser/Link

```html
<!-- DELETE LINES 393-490 (entire current corporate section with 6 pillar cards) -->

<!-- REPLACE WITH -->
<section class="section" id="corporate">
    <div class="section-inner">
        <div class="dual-columns">
            <div class="headline-block">
                <span class="eyebrow">For Brands & Groups</span>
                <h2>Cultural activations that inspire</h2>
                <p>Innovation retreats in Seoul, trend-scouting in Mexico City, brand activations in Berlin's underground. We design corporate journeys that reward, engage, and inspire through experiences no traditional DMC can offer.</p>
                <div class="cta-group" style="margin-top:2rem;">
                    <a href="/corporate.html" class="primary">Explore Corporate Services</a>
                    <a href="#contact">Request Consultation</a>
                </div>
            </div>
            <div class="accent-card">
                <h4 style="font-family: var(--font-serif); font-size: 1.4rem; margin-bottom:1rem;">Services for Organizations</h4>
                <ul>
                    <li><span>Innovation Retreats</span>Seoul startup founders, Berlin design studios, Stockholm innovation labs</li>
                    <li><span>Trend-Scouting</span>Mexico City markets, Tokyo underground, Beirut art scene</li>
                    <li><span>Brand Activations</span>Underground club launches, hidden speakeasy experiences</li>
                    <li><span>Incentive Journeys</span>Mediterranean yacht charters, exclusive cultural access</li>
                </ul>
            </div>
        </div>
    </div>
</section>
```

**Why**: Corporate deserves its own dedicated page. Homepage should tease and link, not show all 6 detailed offerings.

---

## Section 4: Storytellers Section

**File**: `index.html` (Lines 491-553)

### Option A: Remove Entirely (Recommended)

```html
<!-- DELETE LINES 491-553 -->
```

**Why**: Storytellers are service-specific, not homepage heroes. They belong on the "Storytelling Encounters" service detail page.

### Option B: Generic Teaser (If Client Insists)

```html
<!-- REPLACE LINES 491-553 WITH -->
<section class="section" id="storytelling-preview">
    <div class="section-inner">
        <div class="section-heading">
            <span class="eyebrow">Storytelling Encounters</span>
            <h2>Meet the cultural creators</h2>
            <p>Private dinners with Michelin chefs, studio visits with emerging artists, conversations with visionaries shaping their fields. Every journey includes intimate encounters with cultural tastemakers.</p>
        </div>
        
        <div style="text-align: center; margin-top: 2rem;">
            <a href="/journeys.html#storytelling" class="primary">Explore Storytelling Encounters</a>
        </div>
    </div>
</section>
```

**Recommendation**: Go with Option A (remove). Storytellers will be featured within the Storytelling Encounters service page.

---

## Section 5: AI Concierge Section Updates

**File**: `index.html` (Lines 556-580)

### Rebrand LIV → Agent Henrik

```html
<!-- CURRENT -->
<section class="section" id="concierge">
    <div class="section-inner">
        <div class="dual-columns">
            <div class="headline-block">
                <span class="eyebrow">CONCIERGE</span>
                <h3>Meet LIV — Luxury Itinerary Visionary.</h3>
                <p>Embedded across the experience, LIV begins your dialogue...</p>
                <div class="cta-group" style="margin-top:2rem;">
                    <a href="#" class="primary" data-open-liv>Design My Journey with LIV</a>
                    <a href="#contact">Talk to us</a>
                </div>
            </div>
            <div class="accent-card liv-experience-card">
                <h4>Experience LIV</h4>
                <p>"Share your vision—Nordic forests, design studios..."</p>
                ...
            </div>
        </div>
    </div>
</section>

<!-- REPLACE WITH -->
<section class="section" id="concierge">
    <div class="section-inner">
        <div class="dual-columns">
            <div class="headline-block">
                <span class="eyebrow">AI Concierge</span>
                <h3>Your journey begins with Agent Henrik</h3>
                <p>An AI-powered cultural curator embedded across the experience. Agent Henrik initiates your dialogue, sketches the first draft of your itinerary, and invites you to pass the narrative to our human curators for refinement.</p>
                <div class="cta-group" style="margin-top:2rem;">
                    <a href="#" class="primary" data-open-liv>Start Conversation</a>
                    <a href="#contact">Talk to a human curator</a>
                </div>
            </div>
            <div class="accent-card henrik-experience-card">
                <h4 style="font-family: var(--font-serif); font-size: 1.4rem; margin-bottom:1rem;">How Agent Henrik Works</h4>
                <p style="font-style: italic; margin-bottom: 1.5rem; color: rgba(255,255,255,0.85);">"Tell me your vision—underground Tokyo, Beirut rooftops, Mediterranean sailing—and I'll compose your opening itinerary in moments."</p>
                <ul>
                    <li><span>Global Curation</span>Agent Henrik weaves your preferences into narrative itineraries across six continents.</li>
                    <li><span>Instant Drafts</span>Receive a tailored itinerary preview within seconds, ready to refine or approve.</li>
                    <li><span>Seamless Handoff</span>Pass your draft to our human curators who add insider access and bespoke touches.</li>
                    <li><span>24-Hour Response</span>From first conversation to confirmed itinerary, we move at your pace.</li>
                </ul>
            </div>
        </div>
    </div>
</section>
```

### CSS Update

```css
/* Rename class */
.henrik-experience-card {
    /* Same styles as .liv-experience-card */
}
```

---

## Section 6: Journal Section

**File**: `index.html` (Lines 601-637)

### Update Heading Only (Content Loads from DB)

```html
<!-- CURRENT -->
<div class="section-heading">
    <span class="eyebrow" data-editable="journal.eyebrow">Journal</span>
    <h2 data-editable="journal.headline">Editorial previews from the Journal.</h2>
    <p data-editable="journal.description">Editorial previews from our latest scoops.</p>
</div>

<!-- REPLACE WITH -->
<div class="section-heading">
    <span class="eyebrow">Journal</span>
    <h2>Stories from the cultural vanguard</h2>
    <p>Deep dives into underground scenes, insider interviews, and trend reports from the world's most compelling destinations.</p>
</div>
```

**Note**: Placeholder articles (Lapland, Stockholm, Archipelago) will be replaced when journal content is populated in Supabase.

---

## Section 7: Press Section

**File**: `index.html` (Lines 639-664)

### Already Correct! Just Update Heading

```html
<!-- CURRENT -->
<div class="section-heading">
    <span class="eyebrow">Press & Media</span>
    <h2 style="white-space: nowrap;">What Media Says About Us</h2>
    <p>Our work has been recognized by the world's leading voices in luxury and travel.</p>
</div>

<!-- KEEP AS-IS (already global-ready) -->
```

Press logos and panels load from database, so no changes needed here.

---

## Section 8: Instagram Section

**File**: `index.html` (Lines 667-682)

### Update Handle

```html
<!-- CURRENT -->
<div class="section-heading">
    <span class="eyebrow">Follow Our Discoveries</span>
    <h2>@LuxuryTravelSweden</h2>
    <p><a href="https://www.instagram.com/LuxuryTravelSweden/" target="_blank">Follow us on Instagram</a></p>
</div>

<!-- REPLACE WITH -->
<div class="section-heading">
    <span class="eyebrow">Follow Our Journeys</span>
    <h2>@AgentHenrik</h2>
    <p><a href="https://www.instagram.com/AgentHenrik/" target="_blank" rel="noopener noreferrer">Follow us on Instagram</a></p>
</div>
```

**Note**: Update Instagram API endpoint in the fetch call (line 773) to pull from Agent Henrik's account.

---

## Section 9: Contact Form Section

**File**: `index.html` (Lines 808-864)

### Update CTA Text

```html
<!-- CURRENT (line 858) -->
<button type="submit">Submit Enquiry</button>

<!-- KEEP AS-IS (generic enough) -->

<!-- But update confirmation message if needed -->
<!-- Line 861 confirmation could reference Agent Henrik -->
```

**Recommendation**: Contact form is already generic. No changes needed unless you want to add Agent Henrik branding to confirmation message.

---

## Global Find & Replace Operations

Perform these across **all files**:

### 1. Rebrand LIV → Agent Henrik

**Find**: `LIV`  
**Replace**: `Agent Henrik`

**Exceptions** (keep as LIV):
- CSS class names (`.liv-experience-card`)
- JavaScript variable names (`livAI`, `openLIV`)
- File names (`liv-ai.js`)

**Target locations**:
- Button text: "Design My Journey with LIV" → "Explore with Agent Henrik"
- Section headings: "Meet LIV" → "Meet Agent Henrik"
- Description text: "LIV begins your dialogue" → "Agent Henrik initiates your dialogue"

### 2. Update Data Attributes

**Find**: `data-open-liv`  
**Keep as-is** (this is a technical trigger, not user-facing)

**Find**: `data-liv-context-type`  
**Keep as-is**

### 3. Chat Interface Updates

**File**: `index.html` (Lines 871-888)

```html
<!-- CURRENT -->
<div class="chat-overlay" id="chatOverlay">
    <div class="chat-container">
        <button class="close-chat" id="closeChat">×</button>
        <div class="chat-header">
            <h2 class="chat-title">LIV</h2>
            <p class="chat-subtitle">Your Luxury Itinerary Visionary</p>
        </div>
        <div class="chat-messages" id="chatMessages">
            <div class="chat-message ai">
                <p>Welcome. I'm LIV — Luxury Itinerary Visionary...</p>
            </div>
        </div>
        ...
    </div>
</div>

<!-- REPLACE WITH -->
<div class="chat-overlay" id="chatOverlay">
    <div class="chat-container">
        <button class="close-chat" id="closeChat">×</button>
        <div class="chat-header">
            <h2 class="chat-title">Agent Henrik</h2>
            <p class="chat-subtitle">Your Global Luxury Travel Architect</p>
        </div>
        <div class="chat-messages" id="chatMessages">
            <div class="chat-message ai">
                <p>Welcome. I'm Agent Henrik — your global luxury travel architect. Where shall we begin your journey?</p>
            </div>
        </div>
        ...
    </div>
</div>
```

### 4. Update Floating Button

**File**: `index.html` (Lines 947-951)

```html
<!-- CURRENT -->
<div class="ai-concierge-wrapper">
    <button class="ai-concierge-btn" id="aiConciergeBtn" aria-label="Launch LIV concierge - AI travel curator">
        ✦
    </button>
</div>

<!-- REPLACE WITH -->
<div class="ai-concierge-wrapper">
    <button class="ai-concierge-btn" id="aiConciergeBtn" aria-label="Launch Agent Henrik - AI travel architect">
        ✦
    </button>
</div>
```

---

## JavaScript Filter Updates

**File**: `scripts.js`

### Remove Old Filter Handlers

Find and remove:
- Seasonal toggle handler
- Theme filter handler  
- Category filter handler

### Add New Service Filter Handler

```javascript
// Service type filtering
function initializeServiceFilters() {
    const filterButtons = document.querySelectorAll('[data-service]');
    
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const service = btn.dataset.service;
            
            if (service === 'all') {
                // Toggle all on/off
                const allActive = btn.classList.contains('active');
                filterButtons.forEach(b => {
                    if (allActive) {
                        b.classList.remove('active');
                    } else {
                        b.classList.add('active');
                    }
                });
            } else {
                btn.classList.toggle('active');
            }
            
            filterDestinationsByService();
        });
    });
}

function filterDestinationsByService() {
    const activeServices = Array.from(document.querySelectorAll('[data-service].active'))
        .map(btn => btn.dataset.service)
        .filter(s => s !== 'all');
    
    if (!destinationData || !markers) return;
    
    Object.entries(markers).forEach(([key, marker]) => {
        const destination = destinationData[key];
        const matchesService = activeServices.length === 0 || 
            destination.service_ids?.some(id => {
                // Match service ID to service type
                // This requires loading services data
                return true; // Implement matching logic
            });
        
        if (matchesService) {
            marker.addTo(map);
        } else {
            map.removeLayer(marker);
        }
    });
}

// Initialize on load
document.addEventListener('DOMContentLoaded', initializeServiceFilters);
```

---

## Summary Checklist

After implementing all changes:

- [ ] Hero video replaced with Agent Henrik factory intro
- [ ] Map centered globally (zoom 2, center [30, 0])
- [ ] Region filters added (Nordic, Mediterranean, Asia Pacific, Americas)
- [ ] Service type filters replace theme filters
- [ ] Seasonal toggle removed
- [ ] Category filters removed
- [ ] 6 Sweden journey pillars replaced with 7 global services (database-loaded)
- [ ] 6 Sweden corporate pillars replaced with teaser linking to /corporate.html
- [ ] Storyteller profiles removed (or generic teaser added)
- [ ] All "LIV" references → "Agent Henrik" (except technical code)
- [ ] Chat interface updated with Agent Henrik branding
- [ ] Instagram handle updated to @AgentHenrik
- [ ] Journal section heading updated (content from database)
- [ ] Press section kept as-is (already global)
- [ ] Contact form kept as-is (already generic)
- [ ] Floating button aria-label updated
- [ ] CSS classes renamed (.services-grid, .service-card, etc.)
- [ ] JavaScript filter handlers updated

---

## Files Modified

1. `index.html` - Homepage structure
2. `scripts.js` - Filter logic, service loading
3. `styles.css` - Service card styling
4. `liv-ai.js` - Chat interface text (greeting message)
5. `/components/header.html` - Navigation updates (if needed)

---

**Document Version**: 1.0  
**Created**: 2025-11-07  
**Purpose**: Homepage section-by-section updates for Agent Henrik  
**Next**: Implement changes, then proceed with full build plan
