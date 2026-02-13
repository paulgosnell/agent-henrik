# Agent Henrik - Project Summary

## Overview
Agent Henrik is a global luxury travel curation platform built for a real person (Henrik) who offers bespoke, high-end travel experiences in cities around the world. The brand aesthetic is James Bond meets luxury concierge - underground culture, insider access, storytelling encounters.

Sister site to **Luxury Travel Sweden** (same client, shared Supabase backend). Luxury Travel Sweden focuses on Sweden-only destinations; Agent Henrik is the global expansion covering cities like Berlin, Beirut, Tokyo, Rio, New York, and more.

## Core Features

### Homepage Flow
1. **Hero Section** - Full-screen showreel video of Henrik visiting cities (AI-generated avatar). Destination dropdown overlay: "Where do you want to go?"
2. **Interactive Map** - Leaflet.js world map with destination markers, filterable by season, experience theme, and category
3. **Six Pillars** - Experience categories (Nature, Design, Culture, Culinary, Nightlife, Legacy) loaded from CMS
4. **Corporate Section** - 5 corporate experience types (Leadership, Innovation, Celebration, Culture, Wellness)
5. **Storytellers** - Featured local guides and cultural insiders
6. **LIV AI Concierge** - GPT-4 powered 6-step conversation that builds a draft itinerary
7. **Journal** - Blog posts / editorial content
8. **Press** - Media coverage and quotes
9. **Contact Form** - Lead capture with itinerary draft pre-fill from LIV

### LIV AI Concierge
Context-aware AI chat that guides users through trip planning:
- Collects: trip type, themes, duration, group size, season, special wishes
- Generates draft itinerary
- Pre-fills contact form with conversation summary
- Backend: OpenAI GPT-4 via Supabase Edge Function

### Admin CMS
Full content management at `/admin/` covering destinations, blog posts, storytellers, press, media uploads, team members, FAQs, pricing, services, booking process, and LIV AI settings.

## Architecture
- Vanilla HTML/CSS/JS (no framework, no build step)
- Supabase for everything backend (auth, DB, storage, edge functions)
- Netlify hosting
- Shared database with Luxury Travel Sweden (filtered by `site` field)
- Dark/light theme support via CSS variables
