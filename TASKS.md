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
Henrik wants 10 destination vignette videos (4-6s each) playing as the hero. His storyboard doc specifies cinematic scenes for all 10 destinations. We're generating landscape-only versions via VO3 (no avatar — VO3 can't maintain consistent characters across clips).

### Setup Required
1. **ChilledSites MCP is now configured** in `~/.claude/settings.json` — restart session to load it
2. VO3 prompts are ready in Google Sheet "Video Prompts" tab (10 prompts, research-optimized)
3. VO3 best practices documented in "VO3 Best Practices" tab

### Video Generation Workflow
1. Restart Claude Code session (loads ChilledSites MCP)
2. Test one video first (Hong Kong) at 4s/720p to validate quality
3. If good, generate all 10 at 6s each
4. Upload videos to ChilledSites/Supabase storage
5. Update hero component to play clips sequentially with crossfade transitions
6. Each clip ~6s = ~60s total loop, individual files (not stitched)

### Hero Component Changes Needed
- Current: single `<video>` tag with one MP4 file
- Target: array of video sources, sequential playback with CSS crossfade transitions
- Preload clip 2+ while clip 1 plays for seamless experience
- File: `src/components/hero/hero-video.tsx`

### Google Sheet (3 tabs)
- **Feedback Items** — 45 rows, all tracked with status
- **Video Prompts** — 10 destination prompts, VO3-optimized
- **VO3 Best Practices** — prompt engineering reference from research

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
- [ ] Generate 10 hero videos via VO3 (ChilledSites MCP)
- [ ] Update hero component for sequential video playback
- [ ] Push all feedback changes to staging
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
