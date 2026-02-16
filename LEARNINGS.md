# Agent Henrik - Learnings & Gotchas

## Architecture (Next.js Rebuild)
- **Next.js App Router** with TypeScript, Tailwind CSS v4, Supabase
- **Local dev:** `npm run dev` (runs on localhost:3000)
- **Shared database** - Same Supabase instance as Luxury Travel Sweden. All Agent Henrik tables prefixed with `ah_`.
- **Old vanilla site** still live at agenthenrik.com (LiteSpeed hosting). New build is at agent-henrik-alpha.vercel.app (Vercel).
- **Old files** preserved in `_legacy/` folder for reference.

## Deployment (Vercel)
- **Framework MUST be set to "nextjs"** in Vercel project settings. Was previously "Other" (static HTML) from the old vanilla build, causing 404s.
- **Environment variables:** Set via Vercel dashboard or API. Do NOT use `echo "value" | vercel env add` as it adds trailing newlines that corrupt values. Use the Vercel REST API or dashboard instead.
- **Vercel env pull** can overwrite `.env.local` — be careful running CLI commands that auto-pull.
- Auto-deploys from `git push origin main`.
- `npx vercel ls --yes` to check deployment status.

## Logo
- Logo file: `public/logo.png` (764x281px, white text on transparent background)
- **Must use plain `<img>` tag** — Next.js `Image` component's intrinsic sizing conflicts with CSS height constraints.
- **Must set explicit width AND height** via inline styles (not just CSS classes), because `width: auto` on an img means "use natural width" (764px), not "calculate from height".
- Uses `invert-0 dark:invert` for dark/light theme visibility.

## CSS Gotchas
- **Global `min-height` on images breaks Leaflet.** Any CSS rule like `img { min-height: 100px }` or `img { position: relative }` applied to all images will corrupt Leaflet tile positioning. MUST exclude `.leaflet-tile` and scope with `.leaflet-container img { min-height: 0 !important }`.
- **Tailwind v4 utility classes may not override** Next.js Image component inline styles. When in doubt, use inline `style={{}}` props for guaranteed sizing.
- Dark mode is default (`:root` defines dark colors). Light mode via `[data-theme="light"]` selector.
- Tailwind `dark:` variant uses `prefers-color-scheme`, NOT the `data-theme` attribute. Be careful mixing them.

## Leaflet Map
- **Dynamic import required** — `next/dynamic` with `ssr: false` (Leaflet uses `window`).
- **Must call `map.invalidateSize()`** after mount with a short delay (100ms). Without this, tiles don't load for areas outside the initial container size.
- **Scroll wheel zoom disabled** to prevent hijacking page scroll. Users zoom with pinch or double-click.
- **Z-index management:** Leaflet panes set to `z-index: 1`, popup pane to `z-index: 40`. Header is `z-50` so it stays on top.
- Tile URLs: CARTO dark/light variants (`basemaps.cartocdn.com`).
- Popup styling requires CSS overrides (not Tailwind classes) because Leaflet injects its own DOM. Use `.storyworld-popup .leaflet-popup-content-wrapper` etc.
- Set `width` on `.leaflet-popup-content-wrapper` in CSS to control popup width — the React `maxWidth` prop is unreliable.

## Header
- Transparent on homepage hero only. Solid `bg-background/95` with backdrop blur on all inner pages.
- Shrinks on scroll: logo 56px -> 36px, padding py-6 -> py-2.
- Uses `usePathname()` to detect homepage vs inner pages.

## AI Concierge
- `/api/concierge/route.ts` calls Claude API server-side.
- **ANTHROPIC_API_KEY not yet set in Vercel** — concierge won't work on staging until added.
- System prompt at `src/lib/concierge/system-prompt.ts` includes Story Arc Model, 10 theme profiles, intent detection, response templates.
- `/liv` page renders as a fixed overlay (z-50) with close/back button. Not embedded in page flow.
- Context passed via URL params: `/liv?theme=authentic-stories` or `/liv?storyworld=berlin`.

## Hero Video
- Current hero video: `agent-henrik_video_3.mp4` hosted on `api.chilledsites.com` (p0stman Supabase storage).
- Poster image fallback for mobile/slow connections.
- Autoplay, muted, loop, playsInline.

## Bento Grid
- 10 theme cards in a 3-column grid.
- Layout must interleave large (col-span-2) and medium (col-span-1) cards to avoid gaps.
- Pattern: large + medium | medium + large | then remaining fill.

## Common Pitfalls
- Always hard refresh (Cmd+Shift+R) after deploys — Vercel CDN caching can show stale content.
- The `agenthenrik.com` domain does NOT point to Vercel. It's still on LiteSpeed (old site). Staging is at `agent-henrik-alpha.vercel.app`.
- Press items limited to 3 on homepage (intentional).
