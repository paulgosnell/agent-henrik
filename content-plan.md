# Asset & CMS Delivery Plan

## 1. Asset Roadmap
| Stream | Purpose | Format & Specs | Source / Owner | Status |
| --- | --- | --- | --- | --- |
| Hero Reel | Cinematic opener (landing video) | 4K MP4/H.265 & WebM, 30–45 s loop, graded in cinematic contrast; poster JPG 1920×1080 | Commissioned drone + steadicam shoot (Stockholm archipelago, Lapland aurora) | Pre-production |
| Section B-Roll | Journeys teasers & backgrounds | 10–15 s clips per pillar, 1080p optimized, subtler motion | Bespoke shoot / licensed footage (Art & Culture, Design labs, Royal palaces) | Shot list pending |
| Lifestyle Photography | Hero cards, testimonials, About imagery | RAW + retouched TIFF, delivery as 3200px JPG + WebP; portrait & landscape variants | Photographer partner: Ingrid Dahl | Scheduling |
| Editorial Portraits | Founder, guides, featured creatives | 3/4 portrait, 2000 px+, neutral background | Internal shoot w/ art director | TBD |
| Story Illustrations | Section hero overlays, Stories cards | Vector/AI-assisted illustrations, layered SVG or high-res PNG | Motion designer collaboration | Concepting |
| Icons & UI Glyphs | Concierge symbol, CTA arrows, sustainability markers | SVG icon set (stroke 1.5 px) | Internal design team | In progress |
| Press Logos | “As Seen In” strip | SVG or monochrome PNG, transparent background | Publisher-supplied | License confirmation |
| Audio Cues | Subtle hover chimes, LIV notification ping | WAV / OGG, ≤0.5 s, -20 LUFS | Sound designer | Briefing |

**Optimization Checklist**
- Deliver all imagery in double-density (2×) variants with WebP/AVIF fallbacks.
- Provide color graded LUT to maintain tonal consistency across shoots.
- Supply subtitles or descriptive text for video to ensure accessibility and SEO.

## 2. Production Timeline (Suggested)
1. **Week 1–2**: Scout & script hero reel + journey b-roll; confirm licensing + model releases.
2. **Week 3**: Shoot photography + motion; parallel logo asset clearance.
3. **Week 4**: Edit + grade media, export optimized formats, deliver poster frames.
4. **Week 5**: Final QA—naming conventions, metadata, upload to CDN (Supabase / Cloudinary) with alt text.

## 3. Content Operations Guidelines
- Naming convention: `lts_[collection]_[slug]_[variation].[ext]` (e.g., `lts_story-lapland_hero.webp`).
- Store raw masters separately from web-optimized exports; version using semantic tags (`v1`, `v2` for graded passes).
- Maintain alt text and caption library in CMS for accessibility + SEO reuse.

## 4. CMS Information Architecture
### Collections
1. **Journeys**
   - Fields: `title`, `slug`, `pillar(s)` (multi-select), `summary`, `heroAsset`, `gallery` (media array), `itineraryHighlights` (ordered blocks), `ctaLabel`, `ctaLink`, `seoMeta`.
   - Blocks per highlight: `headline`, `description`, `location`, `experienceType`, `mediaRef`.
   - Relationships: link to related Stories, Testimonials, and LIV prompts.

2. **Pillars** (Reference)
   - Fields: `name`, `slug`, `icon`, `description`, `priority`.
   - Used to drive filters and theme chips within Journeys & LIV suggestions.

3. **Stories (Editorial)**
   - Fields: `title`, `slug`, `kicker`, `synopsis`, `heroAsset`, `bodyRichText`, `featuredPullQuote`, `author`, `seasonTag`, `readingTime`, `seoMeta`.
   - Support for embedded galleries and audio snippets.

4. **Press Mentions**
   - Fields: `publication`, `logo`, `quote`, `articleLink`, `publishDate`, `tier` (A/B), `seoMeta`.
   - Displayed in As Seen In strip and press detail page.

5. **Testimonials**
   - Fields: `quote`, `attribution`, `attributionTitle`, `region`, `relatedJourney` (reference).

6. **Concierge Prompts (LIV)**
   - Fields: `promptId`, `intro`, `question`, `options`, `answerKey`, `handoffCopy`.
   - Enables ongoing tuning of AI dialogue without code deployment.

7. **Contact / CTA Config**
   - Fields: `fitHeadline`, `corporateHeadline`, `responseTimeCopy`, `formRecipients` (emails), `successMessage`.

### Taxonomy & Tagging
- `seasonTag`: Winter Sun, Summer Light, Autumn Harvest, Spring Bloom.
- `regionTag`: Stockholm, Lapland, Gothenburg, Archipelago, West Coast.
- `experienceTone`: Restorative, Celebratory, Innovative, Heritage, Immersive.

### Editorial Workflow
- Draft → Curated → Published status flags.
- Version history per Stories and Journeys to capture itinerary iterations.
- Automated triggers: When LIV handoff occurs, create `Lead` entry referencing selected journey themes, attach itinerary draft.

## 5. Integration Notes
- Recommended CMS: Sanity, Storyblok, or Contentful (supports modular content & references).
- Host media on CDN with signed URLs; persist references in CMS via asset IDs.
- Expose GraphQL or REST endpoints consumed by front-end sections (Journeys grid, Stories cards, Press).
- Maintain webhook pipeline: Publish → trigger build (if static) or purge CDN caches.
