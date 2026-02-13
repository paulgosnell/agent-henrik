# Agent Henrik - Project Rules

## Project Type
**Client project** via p0stman (digital product agency).
Sister site to [Luxury Travel Sweden](../luxury-travel-sweden/) - same client, shared Supabase database.

## What This Is
Agent Henrik is a global luxury travel curation platform. Henrik is a real person who offers bespoke, high-end luxury travel experiences in cities around the world. The brand positioning is James Bond meets luxury concierge - underground culture, insider access, storytelling encounters.

**Live URL:** https://agenthenrik.com
**Staging URL:** https://agent-henrik-alpha.vercel.app/

## Tech Stack
- **Framework:** Next.js 16 with App Router + TypeScript
- **Styling:** Tailwind CSS v4 + CSS variables (dark/light theme)
- **Database:** Supabase (PostgreSQL + Auth + Storage + Edge Functions)
- **AI Concierge:** Claude API (Sonnet 4.5) via `/api/concierge` route
- **Maps:** Leaflet.js + react-leaflet with CARTO B&W tiles
- **Icons:** Lucide React
- **Fonts:** Cormorant Garamond (serif) + Inter (sans) via next/font/google
- **Hosting:** Vercel (auto-deploys from GitHub)
- **Repo:** GitHub (private) - paulgosnell/agent-henrik

## Multi-Site Architecture
The Supabase database is shared with Luxury Travel Sweden.
- Legacy tables use `site` field filter (`'henrik'` vs `'sweden'`)
- New Agent Henrik tables are prefixed with `ah_` (no site filter needed)

## Project Structure
```
src/
├── app/
│   ├── layout.tsx              # Root layout (fonts, theme, header/footer/concierge)
│   ├── page.tsx                # Homepage (hero, themes, map teaser, press, journal)
│   ├── explore/                # Storyworld Map + detail pages
│   ├── experiences/            # Bento Grid + theme detail pages
│   ├── storytellers/           # Index + detail pages
│   ├── journal/                # Article index + detail pages
│   ├── press/page.tsx          # Press & media
│   ├── contact/page.tsx        # Contact form
│   ├── liv/page.tsx            # AI concierge dedicated page
│   ├── about/                  # Story, team, services, booking-process, pricing-faq
│   ├── legal/                  # Terms, data-protection, imprint
│   └── api/concierge/route.ts  # AI concierge API (calls Claude)
├── components/
│   ├── layout/                 # Header, footer, theme toggle
│   ├── hero/                   # Fullscreen video hero
│   ├── map/                    # Leaflet map (dynamic import, no SSR)
│   ├── experiences/            # Bento grid + theme cards
│   ├── concierge/              # Chat window, message, floating button
│   ├── journal/                # Article cards
│   ├── press/                  # Logo strip, press cards
│   ├── contact/                # Contact form
│   └── ui/                     # Section wrapper, CTA button, story arc display
├── lib/
│   ├── supabase/               # Client (browser), server (RSC), types
│   ├── concierge/              # System prompt builder
│   └── constants.ts            # Nav items, social links, config
└── styles/
    └── globals.css             # Tailwind + CSS variables + animations
_legacy/                        # Old vanilla HTML/CSS/JS files (reference only)
```

## Database (Supabase)
**Project ID:** fjnfsabvuiyzuzfhxzcc

**Agent Henrik Tables (new, `ah_` prefix):**
- `ah_themes` — 10 experience themes with Story Arc fields
- `ah_storyworlds` — 10 global destinations with lat/long, narrative structure
- `ah_storytellers` — Profiles with linked storyworlds/themes
- `ah_journal_articles` — Journal/blog articles with category
- `ah_press_items` — Press coverage with PDF, thumbnail, video
- `ah_services` — 7 core service types
- `ah_inquiries` — Contact form submissions

**Legacy Tables (still used by LTS, filter by `site = 'henrik'`):**
- `destinations`, `themes`, `pillars`, `press_items`, `blog_posts`, `stories`, etc.

## Story Arc Model
Every journey follows: **Arrival > Immersion > Climax > Reflection**
- Stored as array fields on themes and storyworlds
- AI concierge outputs itineraries in this structure
- Displayed via `StoryArc` component

## 10 Experience Themes
authentic-stories, culture-creativity, culinary-journeys, insider-access, celebration-nightlife, adventure-nature, transformation, wellbeing-longevity, innovation-future, epic-moments

## 10 Storyworld Destinations
Berlin, Beirut, Hong Kong, Rio de Janeiro, Abisko, Mykonos, Bucharest, Lofoten, Vancouver Island, Salalah

## Important Notes
- **Dark mode is default** — always test both themes
- **No emojis** — use Lucide React icons
- **Never hardcode content** — load from Supabase where possible
- **Map uses Leaflet** (not Mapbox) with CARTO dark/light tiles
- **Concierge context passing** — pages pass `theme_id`, `storyworld_id`, or `storyteller_id` to chat via URL params
- **Video hosting** — hero videos stored on api.chilledsites.com (p0stman Supabase storage)
- **Hosting is Vercel** — staging at agent-henrik-alpha.vercel.app
- **Master spec** — full requirements in `AGENTHENRIK_MASTER_SPEC_v2.md`
