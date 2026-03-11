# Agent Henrik - Project Summary

## Overview
Agent Henrik is a global luxury travel curation platform built for a real person (Henrik Tidefjard) who offers bespoke, high-end travel experiences in cities around the world. The brand aesthetic is James Bond meets luxury concierge - underground culture, insider access, storytelling encounters.

Sister site to **Luxury Travel Sweden** (same client, shared Supabase backend). Luxury Travel Sweden focuses on Sweden-only destinations; Agent Henrik is the global expansion covering 10 cities: Berlin, Beirut, Hong Kong, Rio de Janeiro, Abisko, Mykonos, Bucharest, Lofoten, Vancouver Island, Salalah.

**Live URL:** https://agenthenrik.com (currently points to old vanilla site on LiteSpeed)
**Staging URL:** https://agent-henrik-alpha.vercel.app (Next.js rebuild)
**Admin CMS:** https://agent-henrik-alpha.vercel.app/admin (shared auth with LTS)
**Deadline:** ITB Berlin, 3 March 2026
**Master Spec:** `AGENTHENRIK_MASTER_SPEC_v2.md`

## Current Status
**Feature complete.** All development work delivered. Client reviewing staging site (delivery email sent 16 Feb 2026). Remaining work is content population (client), hero video (Paul), DNS cutover, and Instagram account going public.

Henrik attempted to pull voice mode (Phase 2 per his own spec) into Phase 1 scope — pushed back with spec section references. Watch for further scope creep.

## Tech Stack
- **Framework:** Next.js 16 (App Router) + TypeScript
- **Styling:** Tailwind CSS v4 with CSS variables for dark/light theming
- **Database:** Supabase (PostgreSQL + Auth + Storage)
- **AI Concierge:** OpenAI GPT-4o via `/api/concierge` route (Story Arc Model)
- **AI Content Generator:** OpenAI GPT-4o via `/api/admin/generate-content`
- **Maps:** Leaflet.js with CARTO tiles (dynamic import, no SSR)
- **Rich Text:** Tiptap (journal articles only)
- **Instagram:** StormLikes embed (currently placeholder — account private)
- **Icons:** Lucide React
- **Fonts:** Cormorant Garamond (serif) + Inter (sans) via next/font
- **Hosting:** Vercel (auto-deploys from GitHub push)
- **Repo:** GitHub (private) - paulgosnell/agent-henrik

## Core Pages
- **Homepage** — Hero video, themes bento grid, map teaser, press strip, corporate split, journal preview, newsletter signup, Instagram feed
- **/explore** — Full-viewport Leaflet world map with styled popups + /explore/[slug] storyworld detail
- **/experiences** — Bento grid of 10 themes + /experiences/[slug] split-screen detail
- **/storytellers** — Grid + detail pages with AI concierge context passing
- **/journal** — Editorial grid with categories + article pages (rich text)
- **/press** — Press coverage grid + editorial pull quotes
- **/contact** — Lead capture form with dynamic testimonials
- **/liv** — AI concierge overlay (floating panel with close/back)
- **/about/*** — Story, team, services, booking process, pricing FAQ
- **/legal/*** — Terms, data protection, imprint

## Admin CMS + CRM
- **Auth** — Cookie-based Supabase auth, middleware-protected, shared with LTS
- **CRUD** — All 6 content types (themes, storyworlds, storytellers, journal, press, services)
- **Image Upload** — Drag & drop with client-side optimization (resize, WebP, compression)
- **AI Content Generator** — Built into every form, generates copy for empty fields using GPT-4o
- **SEO Metadata** — Editable meta title/description on all pages (dynamic + static)
- **CRM** — Inquiries with status pipeline, notes, CSV export
- **Conversations** — AI concierge sessions saved and viewable
- **Dashboard** — Content counts and quick links

## AI Concierge
- Story Arc Model: Arrival > Immersion > Climax > Reflection
- 10 theme behaviour profiles with tone, emphasis, and guardrails
- Intent detection and multi-theme blending
- Context-aware (receives storyworld_id, theme_id, storyteller_id from CTAs)
- Conversations saved to database for CRM review
- Floating button site-wide + dedicated /liv page

## Database
- **Project ID:** fjnfsabvuiyzuzfhxzcc
- All tables prefixed with `ah_` (ah_themes, ah_storyworlds, ah_storytellers, ah_journal_articles, ah_press_items, ah_services, ah_inquiries, ah_inquiry_notes, ah_concierge_sessions, ah_page_meta)
- Shared Supabase instance with Luxury Travel Sweden
- Dark mode is default theme
