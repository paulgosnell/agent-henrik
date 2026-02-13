# Agent Henrik - Learnings & Gotchas

## Architecture
- **No build step** - This is vanilla HTML/CSS/JS, NOT Next.js. No npm, no bundler. Just serve files directly.
- **Local dev:** `python3 -m http.server 8000` from project root
- **Shared database** - Same Supabase instance as Luxury Travel Sweden. Always filter by `site = 'henrik'`. Forgetting this will show Swedish content on the global site.
- **Site detection** is hostname-based in `supabase-client.js` - defaults to 'henrik' unless hostname contains "luxury-travel-sweden"

## Hero Video
- Current hero video: `agent-henrik_video_3.mp4` hosted on `api.chilledsites.com` (p0stman Supabase storage)
- Video is ~8 seconds, autoplays muted, hero content fades in at 7s
- A backup/fallback video (`agent-henrik_video_1.mp4`) plays on loop when user scrolls back to hero
- Skip Intro button available bottom-right
- Video is preloaded via `<link rel="preload">` in head

## Service Worker
- Cache version is in `service-worker.js` (currently v4)
- **Must bump version** after any CSS/JS changes or users will see stale content
- Only caches images, not HTML/JS/CSS

## Large Files
- `scripts.js` (160 KB) and `styles.css` (171 KB) are monolithic - be careful with edits
- `scripts.js` contains: theme management, nav scroll behavior, press loading, hero dropdown, map init, LIV conversation flow, pillar modals, corporate section, storytellers, journal, contact form, and more
- Search carefully before adding duplicate functionality

## CSS Theming
- Dark mode is default (`:root` defines dark colors)
- Light mode via `[data-theme="light"]` selector
- Map tiles swap between dark/light CARTO variants
- All colors use CSS variables

## Admin Panel
- Full CMS at `/admin/` with its own CSS (`admin.css`) and JS (`admin.js`, `auth.js`)
- Has its own component loader (`admin-component-loader.js`) for sidebar
- Separate from main site - changes to admin don't affect frontend

## LIV AI
- Edge function at `supabase/functions/liv-chat/index.ts`
- OpenAI API key stored as Supabase secret (not in repo)
- Context-aware: different greetings based on where user clicks (map marker, pillar, storyteller, etc.)
- 6-step guided conversation builds itinerary draft
- Draft pre-fills the contact form hidden field

## Deployment
- Hosted on **Vercel** (staging: agent-henrik-alpha.vercel.app)
- README says Netlify but actual deployment is Vercel
- Push to GitHub -> Vercel auto-builds
- No build command needed (static files)
- Environment variables set in Vercel dashboard

## Common Pitfalls
- Don't forget to update `sitemap.xml` when adding new pages
- `robots.txt` exists - check it allows crawling of new pages
- Press items limited to 3 on homepage (intentional, see git log)
- Lucide icons loaded via CDN in `<head>` - must be available before `scripts.js` runs
- `component-loader.js` has cache-busting query param - update when header/footer change
