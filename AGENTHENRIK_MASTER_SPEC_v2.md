# AgentHenrik.com — Consolidated Master Specification v2.0

**Version:** 2.0  
**Date:** 13 February 2026  
**Deadline:** 3 March 2026 (ITB Berlin travel trade fair)  
**Status:** Pre-build — all specs consolidated, ready for implementation  
**Author:** Paul Gosnell (P0STMAN / Chilled Sites)

---

## Document Sources

This spec consolidates and reconciles the following inputs:

| Source | Date | Key Content |
|--------|------|-------------|
| Master Brief PDF (project file) | 5 Jan 2026 | Brand positioning, 7 services, user flow, navigation |
| Masterbrief Themes (docx) | 15 Jan 2026 | 10 experience themes, Bento Grid system, Story Arc |
| Programming Masterbrief (docx) | 15 Jan 2026 | Technical spec, sitemap, page-by-page breakdown |
| Story Arc Model (docx) | 15 Jan 2026 | AI behavior spec, CMS requirements, prompt examples |
| Henrik email (9 Jan 2026) | 9 Jan 2026 | "AH page more or less the same as LTS" |
| Henrik email (25 Oct 2025) | 25 Oct 2025 | "Same as LTS but with avatar hero" |
| LTS site (index.html) | Nov 2025 | Reference implementation — 80% code reuse |
| Architecture Analysis | Nov 2025 | Sweden site codebase analysis |
| Alpha site (Vercel) | Feb 2026 | Interactive video system — REJECTED by client |

**Conflict Resolution Rule:** Where documents contradict each other, the email confirmations and later documents take precedence. The Programming Masterbrief (Jan 15) is the most technically authoritative source.

---

## 1. PROJECT OVERVIEW

### 1.1 What This Is

Agent Henrik is a global luxury underground travel curation brand. The founder (Henrik) is rebranding from BerlinAgenten (Berlin-only) to Agent Henrik (worldwide). The website is the digital flagship — part luxury cultural magazine, part AI-powered concierge portal.

### 1.2 Codebase Strategy

The site is built by recycling the Luxury Travel Sweden (LTS) codebase at a discounted rate. Per Henrik's email (9 Jan 2026): "the AH page will be more or less the same [as LTS], with the main differences being the layout for the experiences, and the Avatar cinematic hero video."

**What carries over from LTS:** Map explorer, AI concierge architecture, contact form, page structure, Supabase backend, responsive framework, animation system.

**What's new/different:** Hero video (cinematic showreel), global scope (not Sweden-only), 10 experience themes (replaces Sweden pillars), Bento Grid layout for experiences, Story Arc itinerary model, press section, expanded corporate page, Storyworld/Storyteller content model.

### 1.3 Brand Positioning

- **Identity:** A cultural curator for tastemakers
- **Core Promise:** Underground luxury journeys blending hidden culture, insider access, and storytelling
- **Differentiator:** Story Arc model (Arrival → Immersion → Climax → Reflection) — every journey is a cinematic narrative, not a logistics list

### 1.4 Target Audience

1. Affluent Millennials & Gen Z jetsetters (experiences > possessions)
2. Cultural creatives & tastemakers (designers, artists, entrepreneurs)
3. Celebrities & influencers (authentic, photogenic experiences)
4. UHNWIs (discreet, ultra-personalized)
5. Corporates & groups (cultural activations, retreats, trend-scouting)

---

## 2. TECH STACK

### 2.1 Confirmed Stack (from LTS + Programming Masterbrief)

| Layer | Technology | Notes |
|-------|-----------|-------|
| Frontend | Next.js (React) | SSR-capable, recycled from LTS |
| Styling | Tailwind CSS / custom SCSS | Per existing LTS setup |
| Animation | Framer Motion | Cinematic transitions |
| Video | HTML5 `<video>` + fallback image | Autoplay, muted, loop |
| Map | Mapbox GL JS | Custom B&W style, global pins |
| CMS/Backend | Supabase | Auth, database, storage, edge functions |
| AI Concierge | Claude API (via Supabase Edge Function) | Replaces OpenAI recommendation in brief |
| Voice (Phase 2) | ElevenLabs / Azure Neural Voice | Not Phase 1 |
| Hosting (staging) | GitHub → Netlify | For client preview |
| Hosting (production) | Client's FTP or Vercel | TBD post-approval |
| Media CDN | Cloudinary / Mux | For video + image optimization |

### 2.2 Global Site Rules

- UI colors: **Black & White only** (no colored UI elements)
- Media: **Full color** cinematic photography and video
- Typography: Serif display headlines + clean sans-serif body
- Animations: Slow, cinematic — no fast transitions
- All pages: Desktop, tablet, mobile responsive
- Dark/Light mode toggle: UI only, persistent via localStorage/cookie
- GDPR compliant throughout

---

## 3. VISUAL IDENTITY

### 3.1 Typography

**Headlines (Serif — luxury, timeless):**
- Font: `Cormorant Garamond` (primary) or `Playfair Display` (fallback)
- H1: 72px desktop / 48px mobile
- H2: 48px desktop / 36px mobile
- H3: 36px desktop / 28px mobile
- Weights: 300 (Light), 400 (Regular), 600 (SemiBold)

**Body/UI (Sans-serif — modern, clear):**
- Font: `Inter` (primary) or `DM Sans` (fallback)
- Body Large: 20px
- Body: 16px
- Body Small: 14px
- Button/Nav: 14px uppercase, 1px letter-spacing
- Weights: 300, 400, 500, 600

### 3.2 Color System

| Token | Value | Usage |
|-------|-------|-------|
| Pure Black | `#000000` | Primary backgrounds, text |
| Pure White | `#FFFFFF` | Primary text on dark, backgrounds |
| Charcoal | `#1A1A1A` | Hover states, subtle backgrounds |
| Soft White | `#F5F5F5` | Off-white sections |
| Champagne/Gold | Accent only | Sparingly — deep blacks, soft neutrals dominate |

### 3.3 Design Language

- Inspired by luxury magazines (Wallpaper*, Monocle, Condé Nast Traveler)
- High negative space
- Calm, premium visual tone
- Cinematic hover states: slow zoom, gradient fades, soft opacity shifts
- Photography/video treatment: filmic, editorial, documentary-style (NOT generic stock)

### 3.4 Spacing System

- Base unit: 8px
- Scale: 8, 16, 24, 32, 48, 64, 96, 128, 192px
- Container max-width: 1440px
- Content max-width: 1200px
- Section padding: 128px vertical desktop / 64px mobile

### 3.5 Motion

- Easing: `cubic-bezier(0.4, 0, 0.2, 1)`
- Duration: 400–600ms for most transitions
- Page transitions: Fade + slight vertical slide (20px)
- Hover: Subtle scale (1.02) or opacity (0.8)

---

## 4. SITEMAP (COMPLETE)

Source: Programming Masterbrief (Jan 15) — this is the definitive page structure.

```
/                                   Homepage
├── /explore                        Storyworld Map (interactive)
│   └── /explore/[storyworld-slug]  Storyworld detail pages
├── /experiences                    Experience themes landing (Bento Grid)
│   ├── /experiences/authentic-stories
│   ├── /experiences/culture-creativity
│   ├── /experiences/culinary-journeys
│   ├── /experiences/insider-access
│   ├── /experiences/celebration-nightlife
│   ├── /experiences/adventure-nature
│   ├── /experiences/transformation
│   ├── /experiences/wellbeing-longevity
│   ├── /experiences/innovation-future
│   └── /experiences/epic-moments
├── /storytellers                   Storyteller index
│   └── /storytellers/[slug]        Individual storyteller profiles
├── /liv                            AI Concierge dedicated page
├── /journal                        Insider Journal (editorial hub)
│   ├── /journal/[category]         Category filtered view
│   └── /journal/[article-slug]     Individual articles
├── /press                          Press & Media archive
├── /contact                        Consultation form
├── /about
│   ├── /about/story                Brand story
│   ├── /about/team                 Team profiles
│   ├── /about/services             Services overview
│   ├── /about/booking-process      How it works
│   └── /about/pricing-faq          Pricing & FAQ
└── /legal
    ├── /legal/terms                Terms & Conditions
    ├── /legal/data-protection      Privacy Policy (GDPR)
    └── /legal/imprint              Imprint (mandatory)
```

### Navigation

**Main Nav (top-right, premium minimal):**
Explore | Journeys | Journal | Press | Contact

**Footer Nav (discreet, legal):**
About | Imprint | Terms | Data Protection | Newsletter Signup | Social Icons (Instagram, YouTube, LinkedIn)

---

## 5. HOMEPAGE (/)

### 5.1 Hero Video Section

**This is the single biggest differentiator from LTS.** Client confirmed: single constant looping video, NOT the interactive per-city trigger system that was built on the alpha site.

| Property | Value |
|----------|-------|
| Autoplay | YES |
| Muted | YES |
| Loop | YES (entire video) |
| Controls | NO |
| Click-to-pause | NO |
| Fallback | Static poster image |
| Mobile | Autoplay (muted), fallback if blocked |
| Layout | Full viewport (100vh) |
| Z-layers | Video (z-1), UI overlay (z-2) |

**Video Content (when produced):**

1. **Opening Scene (constant anchor):** Henrik in Berlin industrial factory (Kraftwerk-style), white smoking jacket, champagne glass, camera 360° orbit, ~6–8 seconds. Raises hand → "follow me" → walks into darkness.

2. **Destination Vignettes (sequential, modular):** Each 4–5 seconds:
   - Hong Kong — skyline
   - Beirut — panorama
   - Abisko — northern lights
   - Vancouver Island — rainforest coast
   - Rio — Ipanema beach
   - Berlin — nightlife
   - Bucharest — parliament
   - Mykonos — infinity pool
   - Lofoten — arctic fjords
   - Salalah — green mountains + mist

3. **Closing:** Fades to black → overlay text: "Your Insider Journey Begins Here"

**MVP approach (pre-video):** Use a placeholder cinematic video or the LTS hero pattern with Agent Henrik branding overlaid.

**Hero Overlay UI:**
- Top-left: Agent Henrik logo
- Top-right: Navigation menu
- Bottom-center CTA: "Start Explore →"
- Below CTA: "Scroll to Experience" (arrow animation)

### 5.2 Remaining Homepage Sections (below hero)

These sections follow the LTS pattern adapted for global scope:

1. **Experience Themes Teaser** — Preview of 10 themes (link to /experiences)
2. **Map Explorer Teaser** — Interactive world map preview (link to /explore)
3. **Press Strip** — "As seen in" monochrome logos (NYT, Forbes, Condé Nast Traveler, Wallpaper*)
4. **Corporate & Groups Teaser** — "For Individuals | For Brands & Groups" split
5. **Journal Preview** — Latest 3 editorial pieces
6. **Newsletter Signup** — "Join the Insider Circle"
7. **Instagram Module** — Embedded or API-fed grid
8. **Footer**

---

## 6. EXPLORE — STORYWORLD MAP (/explore)

### 6.1 Map Page

- Full-width interactive world map (Mapbox GL JS)
- Custom black & white map style
- Pins represent Storyworlds (destinations/regions)
- Hover: reveal Storyworld name
- Click: navigate to /explore/[storyworld-slug]

**Map Configuration:**
```javascript
center: [30, 0]    // Global center (not Sweden's [62, 15])
zoom: 2             // Zoomed out for world view
minZoom: 2
maxZoom: 18
```

### 6.2 Storyworld Detail Page (/explore/[slug])

- Hero image/video (cinematic)
- Storyworld name
- Atmosphere / Arrival mood
- Immersion zones
- Climax moments
- Reflection moments
- Suggested themes
- CTA: "Create My Journey with Agent Henrik"
- Clicking CTA opens AI concierge with storyworld_id, themes, mood metadata

### 6.3 Destinations (Phase 1)

| Destination | Region | Hero Vignette |
|------------|--------|---------------|
| Berlin | Europe | Nightlife |
| Beirut | Middle East | Panorama/rooftops |
| Hong Kong | Asia Pacific | Skyline |
| Rio de Janeiro | Americas | Ipanema beach |
| Abisko (Sweden) | Nordic | Northern lights |
| Mykonos | Mediterranean | Infinity pool |
| Bucharest | Europe | Architecture |
| Lofoten | Nordic | Arctic fjords |
| Vancouver Island | Americas | Rainforest coast |
| Salalah | Middle East | Green mountains |

---

## 7. EXPERIENCES — 10 THEMES (/experiences)

Source: Masterbrief Themes (Jan 15). These replace the 6 Sweden-specific pillars from LTS.

### 7.1 Theme Landing Page — Bento Grid Layout

Design reference: https://artlist.io/video-templates/bento-slides/1001706

- Mixed tile sizes: 2 large hero + 3 medium + 5 smaller
- Each tile: image or looping micro-video background
- Slow cinematic hover states (soft zoom, gradient fades)
- High-contrast luxury typography

**Each Tile Contains:**
- Theme title
- Short emotional tagline
- 2–3 micro activity bullets (optional)
- Two CTAs: [ Explore Theme ] and [ Design With Agent Henrik ]

### 7.2 The 10 Themes

| # | Theme | Definition | Key Activities |
|---|-------|-----------|----------------|
| 1 | Authentic Stories | Real people, heritage, rituals, cultural connection | Day-in-the-life, home meals, story walks, heritage villages |
| 2 | Culture & Creativity | Artistic, cultural, design and lifestyle scenes | Studio visits, design tours, street culture, creative collectives |
| 3 | Culinary Journeys | Culture through food, flavor, tradition | Chef's table, foraging, fire cooking, market workshops |
| 4 | Insider Access | Private, invitation-only, hidden/elite worlds | Secret bar tours, private ateliers, after-hours museums |
| 5 | Celebration & Nightlife | Curated nightlife, rooftop parties, festivals | VIP club circuits, beach celebrations, festival travel |
| 6 | Adventure & Nature | Wild landscapes, peaceful natural environments | Sailing, Arctic expeditions, mountain treks, forest rituals |
| 7 | Transformation | Introspection, meaning, personal evolution | Ancestry journeys, sunrise walks, silence retreats |
| 8 | Wellbeing & Longevity | Holistic mind-body optimization | Breathwork, longevity labs, sound therapy, detox rituals |
| 9 | Innovation & Future | Emerging tech, future culture, creative innovation | Hub visits, coolhunting, tech lab tours, design-thinking |
| 10 | Epic Moments | Cinematic peak emotional experiences | Helicopter flights, desert stargazing, private concerts |

### 7.3 Theme Subpages (/experiences/[theme])

Split-screen layout. Design reference: https://artlist.io/video-templates/multiframe-intro/1001486

**Left Side — Bento Slide Media Panel:**
- Modular image/video slides
- Slow transitions for cinematic immersion
- AI-generated mood visuals per theme

**Right Side — Information Panel:**
- Theme definition
- What the theme includes
- Example activities
- Purpose statement
- Suggested destinations
- Story Arc example (How This Journey Unfolds):
  - Arrival: short paragraph
  - Immersion: short paragraph
  - Climax: short paragraph
  - Reflection: short paragraph
- CTA: "Design Your Journey with Agent Henrik"

---

## 8. STORY ARC MODEL (CORE SYSTEM REQUIREMENT)

This is mandatory logic embedded across the entire platform.

### 8.1 The Four Phases

| Phase | Purpose | Emotion | Examples |
|-------|---------|---------|----------|
| Arrival | Introduce mood and world | "Something meaningful is beginning" | Welcome dinner, sunset walk, cultural welcome drink |
| Immersion | Deep engagement with theme/culture | "I'm inside this world now" | Studio visits, markets, nightlife, culinary immersion |
| Climax | Emotional/experiential high point | "I'll never forget this" | Private rooftop celebration, helicopter flight, secret party |
| Reflection | Slow down, integrate, closure | "I understand what this meant" | Quiet breakfast, journaling, farewell moment |

### 8.2 CMS Requirements

Every Theme AND every Storyworld must store structured fields for:
- `arrival_elements` (array)
- `immersion_elements` (array)
- `climax_elements` (array)
- `reflection_elements` (array)

These are NOT just editorial text — they are structured inputs consumed by the AI concierge.

### 8.3 AI Requirements

The AI concierge MUST:
- Always output itineraries in Arrival → Immersion → Climax → Reflection structure
- Never omit a section
- Merge multiple themes within a single arc (not as separate lists)
- Use CMS story arc fields as primary content source
- Fall back to general knowledge only when CMS fields are missing
- End every response with a CTA pointing to next step

---

## 9. AI CONCIERGE (Agent Henrik / formerly "LIV")

### 9.1 Access Points

- Dedicated page: /liv (or /concierge)
- Modal/drawer launch from: Storyworld pages, Theme pages, Storyteller pages, Journal articles, Global CTA
- NOT triggered from hero video (confirmed via email)

### 9.2 UI

- Chat window with text input
- Streaming responses
- Microphone button for voice mode (Phase 2)
- Waveform animation when speaking (Phase 2)
- Toggle chat/voice (Phase 2)

### 9.3 AI Personality

```
Identity: Agent Henrik — global luxury travel architect and cultural curator
Tone: Editorial, insider, mysterious — luxury cultural journalism, not sales copy
Voice keywords per theme: see Theme Behavior Profiles in section 9.5
```

### 9.4 Conversation Flow

1. Receive context (storyworld_id, theme, mood metadata) from where user clicked
2. Ask max 3 questions before generating first draft:
   - Where (or which destination)?
   - How many days?
   - Vibe/intensity (elegant vs wild, slow vs fast)?
3. Generate story arc itinerary draft
4. End with CTA: "Want me to turn this into a detailed draft with budget tiers?"
5. If booking intent detected: "Shall I route this to a human concierge for pricing & availability?"

### 9.5 Theme Behavior Profiles

| Theme | Tone Keywords | Emphasize | Avoid/Guardrails |
|-------|--------------|-----------|-----------------|
| Authentic Stories | human, intimate, local, real | people, rituals, heritage | touristy, staged, checklist |
| Culture & Creativity | editorial, curated, scene-driven | art, design, architecture, music | — |
| Culinary Journeys | sensory, crafted, ritual | markets, chef encounters, local ingredients | — |
| Insider Access | private, hidden, invitation-only | speakeasies, rooftops, backstage | No illegal entry implications |
| Celebration & Nightlife | electric, joyful, high-energy | milestones, VIP flows, music-led | No reckless behavior; suggest safe logistics |
| Adventure & Nature | wild, clean, expansive, grounded | landscapes, water, mountains, silence | — |
| Transformation | reflective, meaningful, symbolic | rituals, silence, identity, journaling | — |
| Wellbeing & Longevity | restorative, precision, balanced | recovery, breathwork, mind-body | No medical advice; "wellness experiences" only |
| Innovation & Future | forward-looking, curious, insightful | startups, labs, future cities | — |
| Epic Moments | cinematic, awe, signature | one big highlight, symbolic acts | — |

### 9.6 Intent Detection

| Intent | Signals | Response Type |
|--------|---------|--------------|
| Inspiration | "ideas", "inspire", "options" | Short options + 1 question |
| Theme Explore | "tell me about", "what's included" | Definition + includes + 5 activities + CTA |
| Draft Itinerary | "plan", "create", "build" | Full story arc journey |
| Compare Destinations | "which destination", "where should I go" | 3 destinations + rationale + arc for top pick |
| Booking Intent | "price", "book", "availability" | Story arc + handoff CTA |
| Multi-Theme Blend | "combine", "blend", "mix" | Single merged story arc |

### 9.7 Output Templates

**Story Arc Journey (default):**
```
Arrival: 2–4 sentences
Immersion: 3–5 sentences
Climax: 2–4 sentences
Reflection: 2–4 sentences
CTA: 1 line
```

**Day-by-Day (only if explicitly requested):**
```
Arrival (Day 1): content
Immersion (Day 2–3): content
Climax (Day 3–4): content
Reflection (Final Day): content
CTA: 1 line
```

### 9.8 Global AI Rules

- Write in cinematic, premium tone; avoid generic travel-brochure wording
- Never invent real-time availability, prices, or partner names unless in CMS
- Avoid hard claims ("best", "only"); use "curated", "signature", "selected"
- No medical claims in wellness content
- No illegal guidance; "Insider Access" = curated/private but lawful
- Include safety note for late-night/solo travel contexts
- Prefer CMS-provided elements; fall back to general knowledge if missing
- Never store audio (GDPR)

---

## 10. STORYTELLERS (/storytellers)

### 10.1 Index Page
- Grid layout with portrait image, name, role per storyteller

### 10.2 Detail Page (/storytellers/[slug])
- Portrait
- Biography
- Signature experiences
- Linked Storyworlds/Themes
- CTA: "Design with Agent Henrik"

### 10.3 AI Context
When user arrives via a storyteller page, concierge receives: storyteller_id, experiences, destinations.

---

## 11. JOURNAL (/journal)

Magazine-style editorial hub. Black & white frames with full-color cinematic photography.

### 11.1 Categories
- City Spotlights (deep dive destinations)
- Scene Reports (subcultures, nightlife, hidden scenes)
- Insider Interviews (artists, chefs, designers, entrepreneurs)
- Trend Watch (emerging cultural trends)

### 11.2 Article Page
- Title, hero image, rich text content, embedded media
- CTA: "Want to live this story? Book your journey."
- Optional: "As featured in…" notes for press-referenced stories
- CTA: "Design My Journey with Agent Henrik"

### 11.3 Content Workflow
AI generates drafts → refined and curated by Henrik or editor.

---

## 12. PRESS & MEDIA (/press)

### 12.1 Homepage Integration
- "As seen in" strip with monochrome logos (NYT, Forbes, Condé Nast Traveler, Wallpaper*)
- Positioned after hero or near footer
- Minimal, discreet

### 12.2 Dedicated Press Page
- Editorial grid of publication covers (PDF thumbnails)
- Covers: default B&W → reveal color on hover
- Click: opens clipping or article summary
- Embedded YouTube features/interviews
- Large pull-quotes styled as editorial typography

### 12.3 Connect Form Integration
2–3 powerful testimonial quotes just before form submission:
- "Redefines what luxury travel means." – Forbes
- "The most exclusive cultural journeys in the world." – NYT
(Clean luxurious text only, no logos)

---

## 13. CORPORATE & GROUPS

### 13.1 Navigation Split
"For Individuals | For Brands & Groups"

### 13.2 Tone
Professional, strategic, but stylish and editorial (not generic MICE)

### 13.3 Content
- Innovation retreats with startup founders
- Trend-scouting expeditions in street markets
- Brand activations in underground venues
- Incentive yacht journeys for top performers

### 13.4 Flow
Overview → case-study style (editorial tone) → emphasis on exclusivity & brand storytelling → subsection for Agencies & Event Planners

### 13.5 CTA
Consultation form with: group size, purpose (retreat, incentive, launch, scouting)

---

## 14. CONTACT (/contact)

### 14.1 Form Fields
- Name
- Email
- Phone (optional)
- Destination (pre-filled if coming from Map Explorer)
- Travel dates (optional)
- Group size
- Investment Level: Boutique | Premium | Ultra-Exclusive
  - Boutique → unique, stylish insider journeys
  - Premium → luxury, private access, tailored refinement
  - Ultra-Exclusive → rare encounters, yachts, "money-can't-buy" access
- Preferences / journey notes
- Hidden field: AI-generated draft itinerary (auto-attached if concierge session exists)

### 14.2 Confirmation
"Thank you. Your story curator will contact you within 24 hours with your Insider Journey."

---

## 15. FOOTER (Global)

```
Explore          About            Legal            Extras
─────────        ─────            ─────            ──────
Storyworld Map   Our Story        Terms            Newsletter signup
Experiences      Our Team         Data Protection  Dark/Light toggle
Storytellers     Our Services     Imprint
Journal          Booking Process
Design with AH   Pricing & FAQ
```

Social: Instagram | YouTube | LinkedIn

---

## 16. DATABASE SCHEMA

### 16.1 New/Modified Tables

**themes** (replaces hardcoded Sweden pillars)
```sql
CREATE TABLE themes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  definition text,
  tagline text,
  includes text[],
  activities text[],
  purpose text,
  arrival_elements text[],
  immersion_elements text[],
  climax_elements text[],
  reflection_elements text[],
  tone_keywords text[],
  emphasize text[],
  avoid text[],
  image_url text,
  video_url text,
  display_order integer DEFAULT 0,
  published boolean DEFAULT true
);
```

**storyworlds** (destinations/regions)
```sql
CREATE TABLE storyworlds (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  region text,
  atmosphere text,
  arrival_mood text,
  immersion_zones text[],
  climax_moments text[],
  reflection_moments text[],
  suggested_theme_ids uuid[],
  hero_image_url text,
  hero_video_url text,
  latitude decimal,
  longitude decimal,
  published boolean DEFAULT true,
  display_order integer DEFAULT 0
);
```

**storytellers**
```sql
CREATE TABLE storytellers (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  role text,
  bio text,
  portrait_url text,
  signature_experiences text[],
  linked_storyworld_ids uuid[],
  linked_theme_ids uuid[],
  published boolean DEFAULT true
);
```

**press_items**
```sql
CREATE TABLE press_items (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  source text NOT NULL,
  quote text,
  published_at date,
  pdf_url text,
  thumbnail_url text,
  video_url text,
  display_order integer DEFAULT 0
);
```

**journal_articles**
```sql
CREATE TABLE journal_articles (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  category text,
  hero_image_url text,
  content text,
  excerpt text,
  published_at timestamptz,
  published boolean DEFAULT false
);
```

**services** (for the 7 core service types from Master Brief PDF)
```sql
CREATE TABLE services (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  description text,
  service_type text,
  region_availability text[],
  image_url text,
  video_url text,
  display_order integer DEFAULT 0,
  published boolean DEFAULT true
);
```

**inquiries** (contact form submissions)
```sql
CREATE TABLE inquiries (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  destination text,
  travel_dates text,
  group_size integer,
  investment_level text,
  preferences text,
  notes text,
  ai_draft_itinerary text,
  source_storyworld_id uuid,
  source_theme_id uuid,
  created_at timestamptz DEFAULT now()
);
```

---

## 17. IMPLEMENTATION PHASES

Estimated total: 15–20 hours (at Paul's AI-assisted velocity).

### Phase 1: Database & Schema (1–2 hours)
- Run migrations for all new tables
- Seed 10 themes with full story arc elements
- Seed 10 storyworld destinations
- Seed placeholder press items
- Seed 7 service types

### Phase 2: Hero Video Simplification (1–2 hours)
- Strip interactive video system from alpha
- Implement single looping fullscreen video (LTS pattern)
- Add overlay UI: logo, nav, CTA, scroll indicator
- Use placeholder video until Henrik's cinematic showreel is ready

### Phase 3: AI Concierge Reprompting (3–4 hours)
- Rebrand LIV → Agent Henrik
- Replace Sweden knowledge with global destinations
- Inject story arc as mandatory output structure
- Load themes + storyworlds from database into system prompt
- Implement intent detection logic
- Add theme behavior profiles (tone, emphasis, guardrails)
- Wire context passing from storyworld/theme/storyteller pages

### Phase 4: Map Reconfiguration (2–3 hours)
- Change center from Sweden [62, 15] to global [30, 0]
- Zoom from 5 to 2
- Load 10 storyworld pins from database
- Add region filtering
- Storyworld click → detail page navigation

### Phase 5: Experiences Section (2–3 hours)
- Build Bento Grid landing page with 10 theme tiles
- Build split-screen theme subpages (media left, info right)
- Wire CMS data to all fields including story arc sections
- Connect "Design with Agent Henrik" CTAs to concierge

### Phase 6: Homepage Content Swap (2 hours)
- Remove Sweden-specific sections (seasonal filters, province categories)
- Add experience themes teaser
- Add press strip
- Add corporate teaser
- Add journal preview
- Add newsletter signup
- Add Instagram module placeholder

### Phase 7: Press Section (1–2 hours)
- Homepage logo strip (B&W, hover reveals)
- Dedicated /press page with editorial grid
- PDF viewer modal
- Testimonial quotes before contact form

### Phase 8: New Pages (2–3 hours)
- Corporate & Groups page with form
- About pages (story, team, services, booking process, pricing FAQ)
- Contact page with full form + AI draft attachment
- Journal index + article template
- Legal pages (terms, data protection, imprint)

### Phase 9: Branding & Deploy (1 hour)
- Update all header/footer branding
- Navigation system (premium minimal header + discreet footer)
- Push to GitHub
- Deploy to Netlify for client preview
- Test responsive across devices

---

## 18. WHAT'S EXCLUDED (PHASE 2+)

- User accounts / saved itineraries
- Moodboard Trip Builder
- Event Calendar (Art Basel, Biennale, Fashion Weeks)
- Easter Egg gamification
- AI Budget Simulator (Phase 1 uses Investment Levels instead)
- Insider Circle Membership (Phase 1 = newsletter only)
- AI Personalization & Invisible Profiling
- Voice mode for AI concierge (ElevenLabs/Azure)
- Payments / booking system
- Audio storage

---

## 19. KEY DECISIONS LOG

| Decision | Source | Date |
|----------|--------|------|
| Site should look "more or less the same as LTS" | Henrik email | 9 Jan 2026 |
| Main differentiator is hero video + experience layout | Henrik email | 9 Jan 2026 |
| Hero = single looping video, NOT interactive city selector | Henrik email + rejection of alpha | Jan 2026 |
| AI concierge NOT connected to hero section | Architecture decision | Feb 2026 |
| AI concierge accessed from contextual touchpoints (panels, sections) | LTS pattern | Nov 2025 |
| Deploy to GitHub → Netlify for preview | Confirmed | Oct 2025 |
| Claude API for AI (not OpenAI as suggested in brief) | Existing LTS implementation | Nov 2025 |
| 10 themes replace 6 Sweden pillars + 7 service types coexist | Masterbrief Themes vs Master Brief PDF | Jan 2026 |
| Story Arc is mandatory on all AI outputs | Story Arc Model doc | 15 Jan 2026 |
| Deadline: 3 March 2026 (ITB Berlin trade fair) | Henrik email | 2 Feb 2026 |

---

## 20. OPEN QUESTIONS

1. **10 themes vs 7 services:** The Master Brief PDF lists 7 service types (Underground Luxury Journeys, Lifestyle Tours, Sea Holidays, Brand Travel, Cool Hunting, Storytelling Encounters, Corporate). The Masterbrief Themes doc lists 10 emotional themes. These appear to coexist — themes = emotional motivations, services = product categories. Confirm with Henrik or implement both.

2. **Storyworlds vs Destinations:** Programming Masterbrief uses "Storyworlds" as the concept name for destination regions. This is more than a city — it's a narrative world. Confirm naming convention.

3. **Hero video assets:** Video not yet produced. Current plan: use placeholder (LTS-style or stock cinematic) for trade fair deadline, replace with Henrik's showreel when ready.

4. **Press logos/clippings:** Need to confirm which publications are real vs aspirational. Brief mentions NYT, Forbes, Condé Nast Traveler, Wallpaper* — are these confirmed features?

5. **Dark/Light mode:** Programming Masterbrief specifies this. LTS doesn't have it. Priority for Phase 1?

6. **4th attachment (video brief):** Massive document with 10 video briefs. Not included here due to size. Covers hero video production detail — not blocking for web build.

---

*End of specification. This document supersedes all previous build specs and plans.*
