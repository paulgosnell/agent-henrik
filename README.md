# Agent Henrik - Global Luxury Travel Platform

**Status:** Production-Ready | **Version:** 1.0

---

## Overview

Agent Henrik is a global luxury travel curation platform featuring:

- **Interactive Map** - Explore destinations worldwide
- **LIV AI Concierge** - GPT-4 powered travel planning assistant
- **Complete CMS** - Manage all content via admin panel
- **Multi-site Architecture** - Shares database with Luxury Travel Sweden

---

## Tech Stack

- **Frontend:** Vanilla HTML/CSS/JS, Leaflet.js maps
- **Backend:** Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- **AI:** OpenAI GPT-4 via Edge Function
- **Hosting:** Netlify

---

## Quick Start

### Admin Panel
1. Go to `/admin/login.html`
2. Login with your credentials
3. Manage destinations, press, content, etc.

### Local Development
```bash
python3 -m http.server 8000
# Open http://localhost:8000
```

---

## Project Structure

```
/
├── index.html          # Homepage
├── corporate.html      # Corporate services page
├── press.html          # Press & media page
├── scripts.js          # Main application logic
├── supabase-client.js  # Database client
├── liv-ai.js           # AI chat system
├── styles.css          # All styles
│
├── admin/              # Admin CMS panel
├── components/         # Shared header/footer
├── supabase/           # Database migrations & edge functions
│
└── [content pages]/    # our-story, our-team, journal, etc.
```

---

## Environment Variables (Netlify)

- `OPENAI_API_KEY` - For LIV AI chat

---

## Database

All content is filtered by `site` field:
- `'henrik'` - Agent Henrik content
- `'sweden'` - Luxury Travel Sweden content

See `/supabase/README.md` for database setup.
