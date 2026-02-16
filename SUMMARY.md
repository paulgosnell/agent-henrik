# Agent Henrik - Project Summary

## Overview
Agent Henrik is a global luxury travel curation platform built for a real person (Henrik Tidefjard) who offers bespoke, high-end travel experiences in cities around the world. The brand aesthetic is James Bond meets luxury concierge - underground culture, insider access, storytelling encounters.

Sister site to **Luxury Travel Sweden** (same client, shared Supabase backend). Luxury Travel Sweden focuses on Sweden-only destinations; Agent Henrik is the global expansion covering cities like Berlin, Beirut, Tokyo, Rio, New York, and more.

**Live URL:** https://agenthenrik.com (currently points to old vanilla site on LiteSpeed)
**Staging URL:** https://agent-henrik-alpha.vercel.app (Next.js rebuild)
**Deadline:** ITB Berlin, 3 March 2026

## Tech Stack (Next.js Rebuild)
- **Framework:** Next.js (App Router) + TypeScript
- **Styling:** Tailwind CSS v4 with CSS variables for dark/light theming
- **Database:** Supabase (PostgreSQL + Auth + Storage + Edge Functions)
- **AI Concierge:** Claude API via `/api/concierge` route (Story Arc Model)
- **Maps:** Leaflet.js with CARTO tiles (dynamic import, no SSR)
- **Icons:** Lucide React
- **Fonts:** Cormorant Garamond (serif) + Inter (sans) via next/font
- **Hosting:** Vercel (auto-deploys from GitHub push)
- **Repo:** GitHub (private) - paulgosnell/agent-henrik

## Core Pages
- **Homepage** - Hero video, themes bento grid, map teaser, press strip, corporate split, journal preview, newsletter signup
- **/explore** - Full-viewport Leaflet world map with styled popups + /explore/[slug] storyworld detail
- **/experiences** - Bento grid of 10 themes + /experiences/[slug] split-screen detail
- **/storytellers** - Grid + detail pages
- **/journal** - Editorial grid + article pages
- **/press** - Press coverage grid
- **/contact** - Lead capture form (submits to Supabase)
- **/liv** - AI concierge overlay (floating panel with close/back)
- **/about/*** - Story, team, services, booking process, pricing FAQ
- **/legal/*** - Terms, data protection, imprint

## AI Concierge (Agent Henrik)
- Story Arc Model: Arrival, Immersion, Climax, Reflection structure
- 10 theme behavior profiles with tone, emphasis, and guardrails
- Intent detection and multi-theme blending
- Context-aware (receives storyworld_id, theme_id from CTAs)
- Floating button site-wide + dedicated /liv page as overlay panel

## Database
- **Project ID:** fjnfsabvuiyzuzfhxzcc
- All tables prefixed with `ah_` (ah_themes, ah_storyworlds, ah_storytellers, etc.)
- Shared Supabase instance with Luxury Travel Sweden
- Dark mode is default theme
