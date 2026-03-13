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
- **StormLikes embed needs CSS overrides** to match site design — hide branding, force grid layout, square aspect ratio. Scoped under `.instagram-feed` class.

## Leaflet Map
- **Dynamic import required** — `next/dynamic` with `ssr: false` (Leaflet uses `window`).
- **Must call `map.invalidateSize()`** after mount with a short delay (100ms). Without this, tiles don't load for areas outside the initial container size.
- **Scroll wheel zoom disabled** to prevent hijacking page scroll. Users zoom with pinch or double-click.
- **Z-index management:** Leaflet panes set to `z-index: 1`, popup pane to `z-index: 40`. Header is `z-50` so it stays on top.
- Tile URLs: CARTO dark/light variants (`basemaps.cartocdn.com`).
- Popup styling requires CSS overrides (not Tailwind classes) because Leaflet injects its own DOM. Use `.storyworld-popup .leaflet-popup-content-wrapper` etc.
- Set `width` on `.leaflet-popup-content-wrapper` in CSS to control popup width — the React `maxWidth` prop is unreliable.
- **Popup edge cutoff fix** — Add `autoPanPaddingTopLeft` and `autoPanPaddingBottomRight` props to `<Popup>` to prevent popups at map edges (e.g. Abisko) from being clipped.

## Header (LTS Nav Pattern)
- **Text "MENU" / "CLOSE" button** + fullscreen dark overlay with large uppercase nav links (not hamburger icon).
- **Three-state header** via IntersectionObserver on `#hero`: `pinned` (transparent over hero), `show` (solid blur on scroll), `hidden` (slides off on scroll down).
- **CSS sibling combinators** hide logo + MENU button when header is hidden (`.nav-header.hidden ~ .site-logo`).
- **Light mode** via `[data-theme="light"] .nav-header.show` selectors — inverts logo, darkens MENU text.
- **Logo filter gotcha:** AH logo is white on transparent. No `filter: invert()` in dark mode. Only `invert(1)` in light mode when header scrolls solid.
- **Luxury hover effect** on nav links: `translateX(8px)` + `letter-spacing: 0.08em` on hover.
- Escape key closes menu, `body.nav-open` locks scroll.

## Back Navigation
- **Global BackLink component** in `layout-shell.tsx` — uses `router.back()` for browser-native navigation, appears at bottom of every non-homepage page automatically. Excluded from homepage and `/liv` (fullscreen overlay).
- **No top back links** — Henrik doesn't want them. Only bottom. Centralised via layout, not per-page.
- **BackLink must be inside `<main>`** not after it — otherwise `min-h-screen` on main creates a viewport-height gap above the back button.

## Map Side Drawer
- **Use React state + absolute overlay** instead of Leaflet popups — matches LTS pattern, better UX.
- Desktop: slides in from right (`slideInRight` animation), `width: 380px`, `top: 80px` to clear header.
- Mobile: becomes bottom sheet (full width, snaps to bottom, 70% max-height).
- Drawer is a sibling to `MapContainer` inside a relative wrapper (not inside Leaflet's DOM).
- **Don't use `max-h-[70vh] overflow-y-auto`** on detail page content panels — creates an iframe-like scroll. Let content flow naturally.

## AI Concierge
- `/api/concierge/route.ts` calls OpenAI GPT-4o server-side (switched from Claude).
- OPENAI_API_KEY is set in Vercel (all environments).
- System prompt at `src/lib/concierge/system-prompt.ts` includes Story Arc Model, 10 theme profiles, intent detection, response templates.
- `/liv` page renders as a fixed overlay (z-50) with close/back button. Not embedded in page flow.
- Context passed via URL params: `/liv?theme=authentic-stories` or `/liv?storyworld=berlin`.
- Conversations saved to `ah_concierge_sessions` table via fire-and-forget upsert.
- Floating button infers context from current pathname (e.g. on `/experiences/culinary-journeys` it passes theme context).
- **Chat z-index layering:** Floating chat needs `z-[60]` to render above header (`z-50`). Concierge button at `z-[55]`.
- **Blurred glass overlay:** Use `backdrop-blur-xl` + `bg-background/80` for blurred transparent effect on chat and overlays. Border opacity at `/50` for subtlety.

## Hero Video
- **Multi-clip sequential playback** with dual video elements and crossfade transitions. **Plays once, then fades to black with text overlay** (no looping).
- **26 clips total:** Henrik arrival (6s) → 9 cityscapes (3s each) → Henrik rooftop (6s) → 14 experience shots (1.5s each) → Henrik corridor (6s). Total: ~66s.
- **Timer-based advancement** with per-clip durations (not `ended` events).
- **Henrik avatar clips** generated via Grok Imagine (grok.com web UI) — preserves his real face. Hosted on AH Supabase `videos` bucket.
- **VO3 cityscapes** hosted on `api.chilledsites.com` — all 9 destinations.
- **VO3 luxury scenes** also on ChilledSites — cocktail bar, nightclub, spa, yacht deck, fine dining.
- **Pexels clips** on AH Supabase `videos` bucket (`fjnfsabvuiyzuzfhxzcc.supabase.co`, `henrik/` prefix).
- **Crossfade background must be solid black** (not a poster image) — otherwise the poster flashes between clip transitions during the opacity crossfade.
- **Text overlay appears after last clip** with 2s fade-in transition for cinematic feel.
- Autoplay, muted, playsInline.

## Bento Grid
- 10 theme cards in a 3-column grid.
- Layout must interleave large (col-span-2) and medium (col-span-1) cards to avoid gaps.
- Pattern: large + medium | medium + large | then remaining fill.

## Admin CMS
- **LayoutShell pattern** — Client component at `src/components/layout/layout-shell.tsx` checks `usePathname()` for `/admin` prefix. Admin routes get no public chrome (header/footer/concierge). Public routes get the full site layout.
- **Admin layout** — Client component that checks pathname === "/admin/login" to bypass sidebar for the login page.
- **Auth** — Cookie-based via Supabase. Middleware at `middleware.ts` protects `/admin/*` routes, redirects to `/admin/login`.
- **Shared Supabase auth** — LTS and Agent Henrik share the same auth. Client's existing LTS login works for the Agent Henrik CMS.
- **Image upload** — Client-side optimization via Canvas API: resize to max 1920x1080, convert to WebP at 82% quality. Uploads to `media` bucket under `henrik/` prefix with `site='henrik'` in media table.
- **AI content generator** — `/api/admin/generate-content` route with per-content-type context and per-field instructions. Uses OpenAI GPT-4o. Component is `AiGenerate` — expandable panel in each form, generates only empty fields, preserves existing content.
- **Tiptap rich text** — Only used for journal article `content` field. Minimal toolbar: bold, italic, headings, lists.

## Instagram Feed
- **StormLikes embed** (`stormlikes.com/js/embed.min.js`) — free third-party service, same as LTS.
- Component at `src/components/instagram/instagram-feed.tsx`, theme-aware (reloads on `data-theme` attribute change).
- **Currently using placeholders** — @agenthenrik Instagram account is private, so StormLikes returns nothing. Swap comment in `src/app/page.tsx` when account goes public.
- CSS overrides in `globals.css` under `.instagram-feed` — grid layout, hidden branding, square aspect ratio, hover scale.

## Client Management
- **Henrik is prone to scope creep.** Voice mode (TTS, microphone, waveform) is explicitly Phase 2 in his own spec (Sections 9.2 and 18) but he asked about it as if it were Phase 1. Always reference spec section numbers when pushing back.
- **Delivery emails should map directly to spec sections** to leave no room for ambiguity.
- **The masterbrief spec is at `AGENTHENRIK_MASTER_SPEC_v2.md`** — this is the single source of truth for what's in scope.

## AI Concierge Output
- **Story Arc Model must be HIDDEN from AI output.** Henrik wants it used internally for reasoning/structure but the output should be Day-based format like LTS (Day 1: Title, bullet points). Terms like "Arrival", "Immersion", "Climax", "Reflection" must never appear in user-facing itineraries. Users don't care about the psychological framework — they want clean, readable travel plans.
- **Dynamic greeting required.** Chat must reference the destination/theme/storyteller the user was viewing. Currently greeting is static.

## Client Feedback Management
- **Use Google Sheets tracker** for all client amends — not MD files. Henrik gets frustrated when items are missed.
- Tracker: https://docs.google.com/spreadsheets/d/1GndxpfXhmqE37IhCIoBZMa-jXUx8VXAEYmeQqrzGGjY/edit
- 45 items captured from 3 docs (March 2026 feedback round)
- Categories: CAN DO, PUSHBACK, ALREADY DONE, ACKNOWLEDGED, RESPOND

## Image Carousel
- Client component with `useState` for current index, absolute positioning for layered images with opacity transitions.
- Handles single image (no controls) and multiple images (arrows + dots) gracefully.
- Component at `src/components/ui/image-carousel.tsx`.
- Both `ah_themes` and `ah_storyworlds` have `images text[]` columns for gallery photos.

## Google Sheets API (via gws)
- `gws sheets spreadsheets values batchUpdate` requires `--params '{"spreadsheetId":"..."}' --json '...'` — NOT `--spreadsheet` flag.
- For complex JSON with quotes, write to a temp file and use `$(cat /tmp/file.json)`.

## ChilledSites MCP
- Must be in `~/.claude/settings.json` under `mcpServers` for Claude Code access (separate from Claude Desktop config).
- Requires session restart after adding — MCP servers initialize at session start.
- **Tool schema changes require full session restart** — rebuilding the MCP server code is not enough; the running MCP process must be reloaded for Claude to see new/changed tool parameters.
- Has video generation capability via VO3.

## Grok Imagine (Henrik Avatar Video)
- **grok.com/imagine web UI preserves real faces** from reference photos — the API (`image_url` single param) does NOT. Face-locking is a UI-only feature as of March 2026.
- **Key prompt technique:** Start with `"Use the reference image for face and appearance only. Do not recreate the reference photo as a scene."` — prevents the reference being used as the opening frame.
- **Avoid "rim lighting" / "halo"** in prompts — creates unwanted glowing aura around the subject. Use `"soft overhead downlights"` or `"natural ambient lighting"` instead.
- **Use "natural pace"** instead of "slow motion" — slow-mo Henrik clips feel jarring when intercut with fast-paced 1.5s experience montage shots.
- **10-second max duration** at grok.com — use simplified single-sequence prompts, not multi-shot timelines with timestamps (compresses too much action).
- **Upload clearest face shot** as primary reference (well-lit, direct gaze, no phone/selfie). Multiple face angles help lock likeness.
- **Two-step pipeline possible via API:** (1) compose still with `grok-imagine-image` + `images` array (up to 3 refs), (2) animate with `grok-imagine-video` + single `image_url`. But web UI is simpler and better for face preservation.
- **xAI API key** available in p0stman-next `.env.production` (shared across projects). Has literal `\n"` corruption from Vercel env pull — strip with `sed 's/\\n//g' | tr -d '"'`.
- **Cost:** ~$0.105 per 15s video generation, ~$0.02 per image generation.

## OpenAI Realtime API (Voice Mode)
- **Voice options:** alloy (neutral), echo/ash/ballad/verse (male), coral/sage/shimmer (female). **Echo** chosen for refined male voice matching Henrik's brand.
- **currentText state** can remain for internal transcript building but should NOT be rendered — remove JSX display of live streaming text during voice chat to avoid UI clutter while user is speaking. Completed transcript history stays visible.

## Video Generation (VO3 via ChilledSites)
- **Landscape/atmosphere-only prompts** work better than avatar-centric — VO3 can't maintain consistent characters across clips.
- **Sequential clip playback with crossfades** is better than one stitched video — allows independent regeneration, lighter initial load, and more premium transitions.
- 10 destination clips at ~6s each = ~60s total loop for hero section.
- Prompts are in Google Sheet "Video Prompts" tab.
- **VO3 prompt best practices:** 150-300 chars optimal. Use pro cinematography terms (slow dolly, crane shot, tracking). End with "(no text overlays) (no subtitles) (no music) (no sound)". One dominant action per clip.
- **DO NOT use** "anamorphic lens", "35mm film texture", "film grain", or vintage film aesthetics — causes unwanted border vignette and grainy artifacts.
- **DO NOT include** ambient audio descriptions (city hum, waves, music) — videos autoplay muted on website. Wasted prompt space.
- **Use clean language:** "sharp crystal clear digital cinematography" instead of film-style descriptors.
- **Keep camera motion simple and linear** — avoid "accelerates", "dramatic reveal", or complex multi-phase movements. VO3 interprets these as reverse/rewind effects. Use "continuous steady forward movement" or "slow dolly" with one direction only.
- **Hero video structure** per spec section 5.1: Opening (aerial cityscape montage, 2-3s per clip), Middle (luxury experience moments — nightlife, dining, champagne, cultural immersion, 4-5s per clip), Closing (fade to black with text overlay, done in code). Pure cityscapes alone feel static — need the energy/experience clips in the middle.
- **VO3 minimum duration is 6s** — for shorter playback, generate at 6s and trim via hero component playback duration (not file trimming).
- **Output is 720p** — upscale to 4K with Topaz Video AI after generation.
- **NEVER pipe base64 image data through Bash stdout** — it gets injected into conversation context and causes persistent `"Could not process image"` API errors that crash the session. Save to disk or pass URLs directly to MCP tools.
- **Veo 3.1 does NOT preserve real person's face from reference images.** Reference images get uploaded and processed (referenceImageCount: 1, status: processing), but Veo generates a generic face matching the text description, not the reference photo. Character-consistent video with a real person's likeness is NOT achievable via VO3/Veo. For Henrik avatar videos, alternatives: (1) real footage filmed by Henrik, (2) post-generation face-swap via Akool/DeepSwap/Runway, (3) image-to-video with Henrik photo as start frame (face morphs after 2-3s), (4) skip avatar entirely.
- **Reference image video pipeline status (March 2026):** The full chain works — MCP sends base64 to api-v1 gateway, which forwards to generate-video edge function, which uploads to Gemini Files API and submits to Vertex AI. But two blockers remain: (a) Supabase edge function timeout (~150s) kills synchronous polling before Vertex completes (2-5 min), and (b) no `/v1/generate/video/status` route exists in api-v1 for external polling. `asyncMode: true` in the request body gets a 202 back with operationName, but nobody polls for the result. Fix needed: add status polling route to ChilledSites api-v1.
- **MCP base64 transport corruption fixed** — `referenceImagePaths` param added to MCP generate_video tool (reads local files server-side). Requires session restart to pick up new schema. Built at `/Users/paulgosnell/Sites/chilledsites-lite/mcp-server/dist/index.js`.

## AI Concierge — Prompt & Rendering
- **Markdown must be rendered** — LTS uses `markdownToHtml()` (converts `**bold**` and `*italic*` to HTML). AH was showing raw asterisks. Fixed in `chat-message.tsx` with `dangerouslySetInnerHTML`.
- **Brevity is luxury** — Henrik hates walls of text. System prompt must enforce: 2-4 sentences for conversational replies, max 2-3 lines per day in itineraries, ONE question at a time.
- **Booking flow must match LTS** — Chat → ask email → collect name/dates/group/budget → "You'll hear back within 24 hours" → clean end. Do NOT say "forwarded to concierge" until you have their email.
- **max_tokens raised to 1500** from 1024 to avoid itinerary truncation.

## TypeScript + Web Audio API
- **Float32Array<ArrayBufferLike> vs Float32Array<ArrayBuffer>** — `copyToChannel()` expects `Float32Array<ArrayBuffer>` but typed array operations produce `Float32Array<ArrayBufferLike>`. Fix: wrap in `new Float32Array(float32.buffer.slice(0)) as Float32Array<ArrayBuffer>` to create a concrete ArrayBuffer copy.

## Back Navigation
- **Global BackLink component** in `layout-shell.tsx` — uses `router.back()` for browser-native navigation, appears at bottom of every non-homepage page automatically. Excluded from homepage and `/liv` (fullscreen overlay).
- **No top back links** — Henrik doesn't want them. Only bottom. Centralised via layout, not per-page.

## Header Clearance
- **Detail pages need `pt-36` (144px)** to clear the fixed header with breathing room. The unscrolled header is ~104px (logo 56px + py-6 padding 48px). `pt-28` clears but looks cramped. Index/content pages use `pt-20` which works because they have headings that provide visual spacing.

## Newsletter & Email Notifications
- **Newsletter signups** go to shared `leads` table with `site='henrik'`, `source='newsletter'` via `/api/subscribe` route using `createAdminClient()`.
- **Contact form emails** — dual insert to `leads` + `booking_inquiries` already triggers `notify-booking-inquiry` Supabase edge function via database webhook.
- **No additional Resend/email infrastructure needed** — piggybacks on shared LTS Supabase webhooks + Resend setup. Both edge functions (`notify-new-lead`, `notify-booking-inquiry`) already handle `site === 'henrik'` with Agent Henrik branding.

## Legal Pages
- **Content adapted from LTS `static_content` table** — LTS stores legal content as JSON blobs with `parseContent()`. AH hardcodes the adapted text directly in page components (simpler, legal text rarely changes).
- **Legal entity is Luxury Travel Sweden AB** — Agent Henrik is a brand, not a separate company. Imprint references "Agent Henrik, a brand of Luxury Travel Sweden AB" with same org number (556856-7837) and VAT.
- **Contact email:** henrik@agenthenrik.com (not info@luxurytravelsweden.com)

## OG Image (Next.js Convention)
- **`opengraph-image.tsx`** in `src/app/` — Next.js auto-generates OG image at build time using `ImageResponse` from `next/og`.
- **Edge runtime required** (`export const runtime = "edge"`).
- **Custom fonts via fetch** — load from Google Fonts CDN (`fonts.gstatic.com`), get `.ttf` as `arrayBuffer()`, pass to `fonts` array in `ImageResponse` options.
- **Twitter image** — separate `twitter-image.tsx` file (same pattern). Next.js serves both at `/opengraph-image` and `/twitter-image`.

## Common Pitfalls
- Always hard refresh (Cmd+Shift+R) after deploys — Vercel CDN caching can show stale content.
- The `agenthenrik.com` domain does NOT point to Vercel. It's still on LiteSpeed (old site). Staging is at `agent-henrik-alpha.vercel.app`.
- Press items limited to 3 on homepage (intentional).
