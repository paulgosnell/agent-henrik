# Agent Henrik - Tasks

## Build Status: Next.js Rebuild — Visual Testing Phase
All pages, components, database, and AI concierge rebuilt in Next.js.
Deployed to staging. Currently fixing visual/UX issues from testing.

---

## Completed
- [x] Next.js scaffold + Tailwind v4 + Supabase
- [x] Database migrations (all ah_ tables)
- [x] Seed data (10 themes, 10 storyworlds, 7 services, 3 articles, 5 press items, 3 storytellers)
- [x] Layout (header, footer, theme toggle, dark/light mode)
- [x] Homepage (hero video, themes bento, map teaser, press strip, corporate, journal, newsletter)
- [x] Experiences (/experiences bento grid + /experiences/[slug] detail)
- [x] Map Explorer (/explore Leaflet map + /explore/[slug] storyworld detail)
- [x] Storytellers, Journal, Press, Contact pages
- [x] AI Concierge (Agent Henrik chat, floating button, /liv overlay page)
- [x] About pages + Legal pages
- [x] Newsletter signup, 404 page, favicon, SEO metadata
- [x] Story Arc Model integrated into AI system prompt
- [x] Vercel deployment (framework config, env vars)
- [x] Fix broken Unsplash placeholder images
- [x] Hero video (CDN-hosted mp4)
- [x] Logo sizing (plain img tag, explicit dimensions, excluded from min-height CSS)
- [x] Header: solid bg on inner pages, transparent on homepage hero only
- [x] Header: shrink on scroll (logo + padding)
- [x] Concierge /liv page: floating overlay panel with close/back button
- [x] Bento grid: interleaved large+medium cards to fill 3-col grid
- [x] Map popups: redesigned with hero image, atmosphere, tags, CTAs
- [x] Map: popup widened to 480px via CSS override
- [x] Map: Leaflet tiles fixed (excluded from global img CSS rules)
- [x] Map: invalidateSize() on mount for tile loading
- [x] Map: z-index below header, scroll-wheel zoom disabled

## Active Issues
- [ ] Map tiles still showing gaps on some viewport sizes (may need further invalidateSize tuning)
- [ ] Concierge chat panel on mobile could use further responsive testing

## Before Launch (Pre-ITB Berlin, 3 March 2026)

### Content
- [ ] Replace Unsplash placeholder images with actual media
- [ ] Hero video production (cinematic avatar scenes per storyboard)
- [ ] Storyteller profiles — add real profiles
- [ ] Journal articles — write real editorial content
- [ ] Press items — add actual press coverage
- [ ] About/Team page — real team member profiles
- [ ] Legal pages — client to provide final copy
- [ ] OG image — design proper social sharing image

### Technical
- [ ] Set ANTHROPIC_API_KEY in Vercel environment
- [ ] Test AI concierge end-to-end on staging
- [ ] Verify contact form email notifications (Supabase webhook or Resend)
- [ ] Performance audit (Lighthouse)
- [ ] Responsive testing across devices (mobile, tablet, desktop)
- [ ] Point agenthenrik.com DNS to Vercel (currently on LiteSpeed)

### Phase 2+ (Post-Launch)
- [ ] Voice mode for AI concierge (TTS with Henrik's voice)
- [ ] Instagram feed integration
- [ ] User accounts + saved itineraries
- [ ] Budget simulator
- [ ] Analytics tracking (page views per global CLAUDE.md pattern)
