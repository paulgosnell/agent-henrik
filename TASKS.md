# Agent Henrik - Tasks

## Build Status: Feature Parity with LTS — Complete
All 5 phases implemented: DB migrations, contact/lead capture, admin CRM with site switcher, map filters, voice mode.
Client feedback round 1 (45 items) fully addressed.

---

## Done (Recent Sessions)

### LTS Feature Parity
- [x] Database migrations (seasons, category on storyworlds; lat/long/show_on_map on storytellers)
- [x] Contact form → shared `leads` + `booking_inquiries` tables with `site='henrik'`
- [x] In-chat lead capture (email detection, lead form overlay, dual INSERT)
- [x] Admin CRM with site switcher (Henrik / Sweden redirect)
- [x] Map filters (seasons, categories, themes) with color-coded pins
- [x] Storyteller pins on map
- [x] Voice mode (OpenAI Realtime API, echo male voice, ephemeral token, PCM16 audio)
- [x] Admin preview buttons on all DataTable pages

### UI Overhaul
- [x] LTS-style fullscreen nav overlay (text MENU/CLOSE, three-state header, luxury hover effects)
- [x] Global back link at bottom of all pages (router.back, centralised in layout-shell)
- [x] Removed all top back links (Henrik's preference)
- [x] Map side drawer replaces Leaflet popups (slide-in card, mobile bottom sheet)
- [x] Header auto-hide on scroll down (IntersectionObserver on #hero)
- [x] Header flash fix (removed premature updateFromScroll before IntersectionObserver fires)
- [x] Detail page header clearance fixed (pt-36)
- [x] Experience detail scroll fix (removed iframe-like overflow)

### Hero Video
- [x] Multi-clip sequential playback with crossfade transitions (26 clips total)
- [x] All 9 VO3 destination cityscapes in opening (3s each)
- [x] 5 VO3 luxury experience clips + 9 Pexels clips in middle section (1.5s each)
- [x] 3 Henrik avatar clips via Grok Imagine (arrival 6s, rooftop 6s, corridor 6s)
- [x] Plays once then fades to black with text overlay (no looping)
- [x] Solid black crossfade background (no poster image flash)
- [x] Timer-based clip advancement with per-clip durations

### Voice Mode
- [x] Echo (male) voice — matches Henrik's brand
- [x] Removed realtime streaming text display during voice chat
- [x] Transcript history shows after each exchange

### Homepage
- [x] Mini interactive Leaflet map in "Explore the Storyworld" section (replaces static image)
- [x] CMS site switcher — Henrik/Sweden redirect (opens LTS admin in new tab)

### Henrik Avatar (Solved)
- [x] Grok Imagine via grok.com web UI preserves real faces from reference photos
- [x] 3 clips generated: arrival, rooftop bar, corridor "follow me"
- [x] Integrated into hero montage (opening, midpoint, closing)

---

### Legal & SEO
- [x] Legal pages (terms, data-protection, imprint) — adapted from LTS, full content
- [x] OG image for social sharing (opengraph-image.tsx + twitter-image.tsx)
- [x] robots.ts with AI crawler rules
- [x] sitemap.ts (dynamic from CMS content)
- [x] Homepage metadata (title + description)
- [x] Newsletter capture → shared `leads` table via `/api/subscribe`

### Chat Overlay
- [x] Chat z-index fix (z-[60] renders above header z-50)
- [x] Blurred transparent glass effect on floating chat (backdrop-blur-xl + bg-background/80)

### Adjustment 2 (33 items from Henrik's 10-hour review)
- [x] All homepage reordering, section removal, spacing fixes (R2-B1 through R2-B9)
- [x] Map blown up full section, new filter categories (R2-C1, R2-C2)
- [x] Photo carousel on detail pages (R2-D1 — already done)
- [x] Storyteller category filter always visible (R2-D2)
- [x] Full AI concierge prompt overhaul — sales triggers, trust phrases, closing style (R2-E1 through R2-E6)
- [x] Story Arc visible in CMS (R2-E7 — already done)
- [x] About pages CMS-driven via ah_page_meta (R2-G1 through R2-G5)
- [x] Legal pages CMS-driven with HTML paste support (R2-G6, R2-G7)
- [x] YouTube channel link on press page (R2-B5b)
- [x] Concierge Instructions CMS — Henrik can fine-tune AI behavior (promote/avoid/knowledge/tone/general)
- [x] Per-item concierge_context on storyworlds, themes, storytellers

### Remaining from Adjustment 2
- [ ] R2-F1: Voice alternatives — test ash/onyx/fable for smoother male voice
- [x] J2: Contact form integrated with AI chat as final step (chat CTA → /contact with prefilled params)

### Hero Video v2 — Grok Imagine Batch (14 clips from Henrik's 24 Mar feedback)
- [x] Reviewed Henrik's detailed per-clip feedback email (24 Mar)
- [x] Researched Grok Imagine latest prompting best practices
- [x] Created "Grok Prompts v2" tab in Google Sheet with 14 refined prompts
- [ ] Generate #0 OPENING — Kraftwerk Berlin (CRITICAL)
- [ ] Generate #1 — Victoria Peak, Hong Kong (redo)
- [ ] Generate #2 — Palace of the Parliament, Bucharest (redo)
- [ ] Generate #2b — Fernsehturm, Berlin (redo)
- [ ] Generate #3 — Abisko Northern Lights, from behind (redo)
- [ ] Generate #4 — Hotel Fasano, Rio de Janeiro (redo — summer outfit)
- [ ] Generate #5 — Cox Bay, Vancouver Island (NEW — missing)
- [ ] Generate #6 — Beirut Arrival, airplane window (redo)
- [ ] Generate #7 — Zuma Mykonos (redo)
- [ ] Generate #8 — Reinebringen, Lofoten (needs avatar)
- [ ] Generate #10 — Kraftwerk Berlin Nightclub (new — doors opening)
- [ ] Generate #11 CLOSING — Kraftwerk Berlin (CRITICAL)
- [ ] Generate #12 — Burj Khalifa, Dubai (NEW)
- [ ] Generate #13 — Tom of Finland, Berlin Underground (NEW — Henrik's bold request)
- [ ] Integrate new clips into hero-video.tsx and upload to ChilledSites storage
- [ ] Remove clips Henrik flagged (Santorini, Monaco yacht, concert, random cities)

---

## Before Launch
- [ ] Point agenthenrik.com DNS to Vercel
- [ ] Client content population via CMS
- [ ] Make @agenthenrik Instagram public + swap to StormLikes feed

## Phase 2+ (Post-Launch)
- [ ] Live Instagram feed (swap to StormLikes when public)
- [ ] User accounts + saved itineraries
- [ ] Budget simulator
- [ ] Analytics tracking
- [ ] Grok Imagine API multi-reference support (when available — currently UI-only)
