# Agent Henrik - Tasks

## Build Status: Next.js Rebuild Complete (Phase 1-8)
All pages, components, database, and AI concierge rebuilt in Next.js.
Ready for visual testing and content refinement.

---

## Ready for Testing
- [x] Next.js scaffold + Tailwind v4 + Supabase
- [x] Database migrations (ah_themes, ah_storyworlds, ah_storytellers, ah_journal_articles, ah_press_items, ah_services, ah_inquiries, ah_newsletter_subscribers)
- [x] Seed data (10 themes, 10 storyworlds, 7 services, 3 articles, 5 press items, 3 storytellers)
- [x] Layout (header, footer, theme toggle, dark/light mode)
- [x] Homepage (hero video, themes bento grid, map teaser, press strip, corporate split, journal preview, newsletter)
- [x] Experiences (/experiences bento grid + /experiences/[slug] split-screen detail)
- [x] Map Explorer (/explore Leaflet map + /explore/[slug] storyworld detail)
- [x] Storytellers (/storytellers grid + /storytellers/[slug] detail)
- [x] Journal (/journal grid + /journal/[slug] article)
- [x] Press (/press grid)
- [x] Contact (/contact form submits to Supabase)
- [x] AI Concierge (Agent Henrik chat, floating button, /liv dedicated page)
- [x] About pages (story, team, services, booking-process, pricing-faq)
- [x] Legal pages (terms, data-protection, imprint)
- [x] Newsletter signup (wired to Supabase)
- [x] Custom 404 page
- [x] Favicon + Apple Touch Icon
- [x] SEO metadata (per-page titles, descriptions, OG tags)
- [x] Story Arc Model integrated into AI system prompt

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
- [ ] Test AI concierge end-to-end
- [ ] Verify contact form email notifications (Supabase webhook or Resend)
- [ ] Verify RLS policies on all ah_ tables
- [ ] Performance audit (Lighthouse)
- [ ] Responsive testing across devices
- [ ] Commit + push to GitHub
- [ ] Vercel deployment

### Phase 2+ (Post-Launch)
- [ ] Voice mode for AI concierge (TTS with Henrik's voice)
- [ ] Instagram feed integration
- [ ] User accounts + saved itineraries
- [ ] Budget simulator
- [ ] Analytics tracking (page views)
