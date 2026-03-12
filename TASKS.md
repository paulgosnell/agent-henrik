# Agent Henrik - Tasks

## Build Status: Client Feedback Round 1 — In Progress
Feature complete. Client (Henrik) submitted 3 feedback documents on 9 March 2026.
45 feedback items tracked in Google Sheet: https://docs.google.com/spreadsheets/d/1GndxpfXhmqE37IhCIoBZMa-jXUx8VXAEYmeQqrzGGjY/edit

**Current score: 33 Done / 7 PUSHBACK / 5 ALREADY DONE**

---

## Active: Feedback Round 1 Implementation

### Done (this round)
- [x] System prompt rewrite — Story Arc hidden from output, Day-based format, intent detection, theme profiles, blending, conversion hooks
- [x] Dynamic greeting — chat references destination/theme/storyteller by name
- [x] 3 hero CTAs — Explore Storyworld / Find Experience / Meet Storytellers
- [x] Homepage reorder — Hero > Map > Experiences > Storytellers > Concierge > Journal > Newsletter > Press > Instagram > Contact
- [x] Removed "As Seen In" logo strip and "For Individuals and Corporates" section
- [x] Added Storytellers section to homepage (up to 6)
- [x] Added AH Concierge teaser section to homepage
- [x] Added Press & Media section to homepage
- [x] Added Contact section to homepage with Henrik's details
- [x] Storyworld detail — split layout (photo left, scrollable info right), removed Story Arc
- [x] Theme detail — removed Story Arc section
- [x] Footer restructured to match LTS (4 columns, Henrik contact, social icons)
- [x] Back/Return navigation on all detail pages (explicit href, not router.back)
- [x] Journal categories updated (Client Journeys, Destination Reports, Travel Trends, Insider Interviews)
- [x] Map popup cutoff fix — autoPanPadding for edge pins like Abisko
- [x] Image carousel component — works on theme + storyworld detail pages, up to 5 images
- [x] `images[]` column added to ah_themes and ah_storyworlds + admin CMS fields
- [x] Suggested destinations on theme detail pages (reverse lookup from storyworld suggested_theme_ids)
- [x] Storyteller categories — category column, filter UI on index page, admin CMS dropdown
- [x] Press page split into Videos and Press Clippings sections
- [x] YouTube embed support via PressCard modal
- [x] Constants updated (nav items, footer links, YouTube URL, investment levels, journal categories)
- [x] Updated map teaser text
- [x] Talk to us link in concierge

### PUSHBACK items (documented in sheet with reasons)
- A1/A2: Hero video production — not web dev scope, player is ready
- G1: Voice mode — Phase 2 per spec sections 9.2 + 18
- J2: Chat-to-contact integration — complex, Phase 2
- M1: Cinematic avatar storyboards — production scope
- N3: Map filter description text — filters not built yet
- C3: Season/Category/Type filter system on map — would need new data model

### Respond to Henrik
- K5: CMS credentials — his LTS login works at agenthenrik.com/admin

---

## Next Up: Hero Video Generation (VO3 via ChilledSites MCP)

### Context
Henrik wants 10 destination vignette videos (4-6s each) playing as the hero. 6 clips already generated and live (Berlin, Hong Kong, Rio, Mykonos, Beirut, Bucharest). Hero component updated to multi-clip sequential playback with crossfade transitions.

### Remaining
- [ ] Generate 4 remaining destination clips (Abisko, Lofoten, Salalah, Vancouver Island)
- [ ] Henrik avatar video — VO3 can't do face matching from reference images; needs alternative approach (real footage, face-swap tool, or skip)

### Henrik Avatar Options (decided: needs discussion with client)
1. **Real footage** — Henrik films 2-3 short clips on phone (most authentic)
2. **AI face swap** — Generate VO3 video of generic man, swap face via Akool/DeepSwap/Runway
3. **Skip avatar** — Keep pure destination atmosphere clips (hero works well without his face)

### ChilledSites MCP Status
- MCP configured with local build at `/Users/paulgosnell/Sites/chilledsites-lite/mcp-server/dist/index.js`
- `referenceImagePaths` param added but needs session restart to pick up new tool schema
- Reference image pipeline works end-to-end via curl, but Supabase edge function 504s on sync polling (~150s timeout vs 2-5 min generation)
- Needs: `/v1/generate/video/status` route in api-v1 for external polling (ChilledSites platform fix)

---

## Completed (Pre-Feedback)
- [x] Next.js scaffold + Tailwind v4 + Supabase
- [x] All database migrations (ah_ tables, inquiry notes, concierge sessions, page meta)
- [x] Seed data (10 themes, 10 storyworlds, 7 services, 3 articles, 5 press, 3 storytellers)
- [x] Full layout (header, footer, theme toggle, dark/light)
- [x] All pages (homepage, experiences, explore, storytellers, journal, press, contact, about, legal, liv)
- [x] AI Concierge (OpenAI GPT-4o, floating button, /liv overlay, context passing)
- [x] Admin CMS (auth, CRUD for all 6 types, rich text, image upload, AI generator, SEO meta)
- [x] Admin CRM (inquiries pipeline, notes, CSV export, conversation viewer)
- [x] Leaflet map with styled popups
- [x] Instagram module (placeholder mode while @agenthenrik is private)
- [x] Vercel deployment + staging at agent-henrik-alpha.vercel.app

## Before Launch
- [x] Update hero component for sequential video playback (6 clips live with crossfade)
- [x] Push all feedback changes to staging
- [ ] Generate 4 remaining hero videos (Abisko, Lofoten, Salalah, Vancouver Island)
- [ ] Decide on Henrik avatar approach (real footage vs face-swap vs skip)
- [ ] Point agenthenrik.com DNS to Vercel
- [ ] New OG image for social sharing
- [ ] Client content population via CMS
- [ ] Make @agenthenrik Instagram public

## Phase 2+ (Post-Launch)
- [ ] Voice mode for AI concierge (TTS with Henrik's voice)
- [ ] Map filter system (Season/Category/Type toggles)
- [ ] Chat-to-contact form integration
- [ ] Live Instagram feed (swap to StormLikes when public)
- [ ] User accounts + saved itineraries
- [ ] Budget simulator
- [ ] Analytics tracking
- [ ] Email notifications on new inquiry
