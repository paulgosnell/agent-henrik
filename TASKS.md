# Agent Henrik - Tasks

> **STAGING OFF (30 Jun 2026, ~19:20):** No payment received. Staging disabled via `STAGING_DISABLED=true` on Vercel. Email sent to all 3 addresses. **Do not implement fixes until payment confirmed.** Restore: `vercel env rm STAGING_DISABLED production --scope p0stman --yes` then redeploy.

## Build Status: Feature Parity with LTS — Complete
All 5 phases implemented: DB migrations, contact/lead capture, admin CRM with site switcher, map filters, voice mode.
Client feedback round 1 (45 items) fully addressed.

---

## Payment Fix Sprint (30 Jun 2026) — AWAITING EUR 2,000

**Trigger:** Henrik accepted offer (email sent 30 Jun). Pay EUR 1,750 + EUR 250 → we fix → launch.
**Repos:** Agent Henrik (`agent-henrik`) + LTS (`luxury-travel-sweden-nextjs`)
**Timeline:** Start on payment receipt. Target: fixes live on staging same day + next day.

### Fix 1 — Berlin TV Tower clip (video regen)
**Henrik ask:** "Dark" meant dark-haired European man, not a Black man. Match his reference look.
**Refs:** Pinterest inspirations from 25 Jun email — https://pin.it/7eszgMSGD (bearded, leather jacket) + https://pin.it/6k5bp1hce (blond, long coat)
**Prep done:** Veo script + prompt exist in `scripts/generate-veo-videos.mjs` (`clip-2b-berlin-tv-tower`, `useRefs: false`)

- [ ] Update prompt — explicitly "two European/Caucasian men", "dark-haired bearded man (not Black)", blond man per refs. Keep: Alexanderplatz, Fernsehturm, no clock.
- [ ] Backup current clip → `videos/hero-v4/backups/clip-2b-berlin-tv-tower-v1.mp4`
- [ ] Regen: `GEMINI_API_KEY=... node scripts/generate-veo-videos.mjs clip-2b-berlin-tv-tower`
- [ ] Upload to Supabase `videos/hero-v4/clip-2b-berlin-tv-tower.mp4` (same filename — no code change)
- [ ] Review take; regen again if AI still mis-casts (~2 min / ~$0.30 per attempt)

**Est:** 30–45 min (mostly generation + review)

### Fix 2 — Opening voice + music + loop (EUR 250 scope)
**Henrik ask:** Voice on opening clip, then music. Muted by default. Visible "Sound On" button. Preference in localStorage. Hero loops continuously.
**Music:** https://pixabay.com/music/synthwave-electronic-114952/ — hard beats from **7.5s** when phrase "there is something I need to show you" ends (~5s into `clip-00`, 6s duration)
**Primary file:** `src/components/hero/hero-video.tsx`

- [ ] Download Pixabay MP3 → `public/audio/hero-music.mp3` (or Supabase `videos/` bucket)
- [ ] Remove end-of-montage behaviour — loop back to clip 0 instead of `setEnded(true)` / fade-to-black
- [ ] Keep headline CTAs visible throughout OR show only after first full loop (decide on implementation — Henrik didn't specify; default: hide overlay during montage, show after first loop)
- [ ] Add hidden `<audio ref>` for background track
- [ ] On clip 0: video carries embedded Veo voice — unmute video element when sound enabled
- [ ] Sync music: when opening phrase ends (~5s mark), set `audio.currentTime = 7.5` and play
- [ ] Add `Sound On` / `Sound Off` toggle (Lucide `Volume2` / `VolumeX`), fixed bottom-left of hero, z-20
- [ ] localStorage key: `ah-hero-sound` (`"on"` | `"off"`, default `"off"`)
- [ ] Respect autoplay policy: always start muted; only unmute after user clicks Sound On OR restored preference from localStorage on subsequent visits
- [ ] Music continues across montage loop (don't restart each loop unless clip 0 restarts — fade music in at phrase end, loop music track independently)

**Est:** 2–3 hours

### Fix 3 — Agent Henrik mobile hero responsiveness
**Henrik ask:** Hero must fill mobile viewport; face visible without scrolling. Standard responsive, not optional.
**Root cause (likely):** `h-screen` = `100vh` ignores mobile browser chrome. Legacy site used `100dvh`. Opening clip may crop face with `object-cover` centre framing.
**Files:** `src/components/hero/hero-video.tsx`, possibly `src/app/globals.css`

- [ ] Replace `h-screen` with `h-[100dvh] min-h-[100svh]` (fallback `min-h-screen`)
- [ ] Mobile video framing: `object-cover object-[center_25%] sm:object-center` (tune after watching clip-00 on iPhone)
- [ ] Ensure hero section is not inside a scrollable container; verify `overflow-hidden` on section
- [ ] Test: iPhone Safari, Chrome Android, DevTools responsive mode
- [ ] Also apply Fix 3 to AH if menu visibility issue found (AH header missing `updateFromScroll()` on mount — LTS has it at `header.tsx:63`)

**Est:** 1 hour

### Fix 4 — LTS mobile menu + footer links
**Henrik ask:** Menu icon and footer links missing on LTS landing page (mobile). Flagged 18 Jun + 30 Jun.
**Repo:** `/Users/paulgosnell/Sites/luxury-travel-sweden-nextjs` — deploy to `luxurytravelsweden.com`
**Files to check:** `components/layout/header.tsx`, `components/layout/footer.tsx`, `app/globals.css`, `app/page.tsx`

**Investigation checklist (do first on real mobile / DevTools):**
- [ ] Confirm MENU button visible on homepage hero (white text on light video = invisible?)
- [ ] Check `nav-header.hidden` not stuck on initial load (add `updateFromScroll()` on mount like LTS already has)
- [ ] Check footer Explore/About/Legal links render in `grid-cols-2` mobile layout
- [ ] Check `whiteSpace: nowrap` on map h2 (`app/page.tsx:89`) causing horizontal overflow / layout break
- [ ] z-index stack: menu-toggle 99999, nav-menu 9999, LIV 10000 — menu should win when closed; verify nothing covers MENU on mobile
- [ ] Compare against working desktop; git diff recent header/footer changes

**Est:** 1–2 hours (depends on root cause)

### Launch checklist (after fixes on staging)
- [ ] Email Henrik: staging links (AH + LTS), point-by-point confirmation
- [ ] Henrik final sign-off
- [ ] `npx vercel domains add agenthenrik.com --scope p0stman`
- [ ] DNS at Miss Hosting → Vercel
- [ ] OneUptime monitor for agenthenrik.com

### Execution order on payment
1. Acknowledge payment receipt (email)
2. **Day 1 (today):** Fix 2 code + Fix 3 mobile + download music (parallel with Fix 1 Veo regen)
3. **Day 1:** Upload TV tower clip, deploy AH staging
4. **Day 2:** Fix 4 LTS mobile, deploy LTS, full QA both sites
5. Email Henrik for sign-off → DNS cutover

---

## Done (Recent Sessions)

### Session 30 Jun 2026
- [x] Onboarded project context (SUMMARY.md, TASKS.md, CLAUDE.md)
- [x] Read Henrik email thread via `gog gmail` (hello@p0stman.com, thread `19f1781659317c92`)
- [x] Drafted + sent acceptance email (EUR 2,000 offer, 4 fixes confirmed in writing)
- [x] Payment Fix Sprint plan documented (4 fixes, files, execution order)
- [x] SUMMARY.md + MEMORY.md updated for stand-by state

### LTS Feature Parity
- [x] Database migrations (seasons, category on storyworlds; lat/long/show_on_map on storytellers)
- [x] Contact form → shared `leads` + `booking_inquiries` tables with `site='henrik'`
- [x] In-chat lead capture (email detection, lead form overlay, dual INSERT)
- [x] Admin CRM with site switcher (Henrik / Sweden redirect)
- [x] Map filters (seasons, categories, themes) with color-coded pins
- [x] Storyteller pins on map
- [x] Voice mode (OpenAI Realtime API, echo male voice, ephemeral token, PCM16 audio)
- [x] Admin preview buttons on all DataTable pages

### UI Overhaul
- [x] LTS-style fullscreen nav overlay (text MENU/CLOSE, three-state header, luxury hover effects)
- [x] Global back link at bottom of all pages (router.back, centralised in layout-shell)
- [x] Removed all top back links (Henrik's preference)
- [x] Map side drawer replaces Leaflet popups (slide-in card, mobile bottom sheet)
- [x] Header auto-hide on scroll down (IntersectionObserver on #hero)
- [x] Header flash fix (removed premature updateFromScroll before IntersectionObserver fires)
- [x] Detail page header clearance fixed (pt-36)
- [x] Experience detail scroll fix (removed iframe-like overflow)

### Hero Video
- [x] Multi-clip sequential playback with crossfade transitions (26 clips total)
- [x] All 9 VO3 destination cityscapes in opening (3s each)
- [x] 5 VO3 luxury experience clips + 9 Pexels clips in middle section (1.5s each)
- [x] 3 Henrik avatar clips via Grok Imagine (arrival 6s, rooftop 6s, corridor 6s)
- [x] Plays once then fades to black with text overlay (no looping)
- [x] Solid black crossfade background (no poster image flash)
- [x] Timer-based clip advancement with per-clip durations

### Voice Mode
- [x] Echo (male) voice — matches Henrik's brand
- [x] Removed realtime streaming text display during voice chat
- [x] Transcript history shows after each exchange

### Homepage
- [x] Mini interactive Leaflet map in "Explore the Storyworld" section (replaces static image)
- [x] CMS site switcher — Henrik/Sweden redirect (opens LTS admin in new tab)

### Henrik Avatar (Solved)
- [x] Grok Imagine via grok.com web UI preserves real faces from reference photos
- [x] 3 clips generated: arrival, rooftop bar, corridor "follow me"
- [x] Integrated into hero montage (opening, midpoint, closing)

---

### Legal & SEO
- [x] Legal pages (terms, data-protection, imprint) — adapted from LTS, full content
- [x] OG image for social sharing (opengraph-image.tsx + twitter-image.tsx)
- [x] robots.ts with AI crawler rules
- [x] sitemap.ts (dynamic from CMS content)
- [x] Homepage metadata (title + description)
- [x] Newsletter capture → shared `leads` table via `/api/subscribe`

### Chat Overlay
- [x] Chat z-index fix (z-[60] renders above header z-50)
- [x] Blurred transparent glass effect on floating chat (backdrop-blur-xl + bg-background/80)

### Adjustment 2 (33 items from Henrik's 10-hour review)
- [x] All homepage reordering, section removal, spacing fixes (R2-B1 through R2-B9)
- [x] Map blown up full section, new filter categories (R2-C1, R2-C2)
- [x] Photo carousel on detail pages (R2-D1 — already done)
- [x] Storyteller category filter always visible (R2-D2)
- [x] Full AI concierge prompt overhaul — sales triggers, trust phrases, closing style (R2-E1 through R2-E6)
- [x] Story Arc visible in CMS (R2-E7 — already done)
- [x] About pages CMS-driven via ah_page_meta (R2-G1 through R2-G5)
- [x] Legal pages CMS-driven with HTML paste support (R2-G6, R2-G7)
- [x] YouTube channel link on press page (R2-B5b)
- [x] Concierge Instructions CMS — Henrik can fine-tune AI behavior (promote/avoid/knowledge/tone/general)
- [x] Per-item concierge_context on storyworlds, themes, storytellers

### Remaining from Adjustment 2
- [ ] R2-F1: Voice alternatives — test ash/onyx/fable for smoother male voice
- [x] J2: Contact form integrated with AI chat as final step (chat CTA → /contact with prefilled params)

### Hero Video v2 — Grok Imagine Batch (14 clips from Henrik's 24 Mar feedback)
- [x] Reviewed Henrik's detailed per-clip feedback email (24 Mar)
- [x] Researched Grok Imagine latest prompting best practices
- [x] Created "Grok Prompts v2" tab in Google Sheet with 14 refined prompts
- [x] Generate all 14 clips via Grok Imagine (0, 1, 2, 2b, 3, 4, 5, 6, 7, 8, 10, 11, 12, 13)
- [x] Upload all clips to Supabase storage (grok-v2-*.mp4)
- [x] Integrate new clips into hero-video.tsx
- [x] Remove clips Henrik flagged (Santorini, Monaco yacht, concert, random cities)
- [x] Created "FINAL - Video Prompts" tab in Google Sheet (single source of truth)
- [x] Emailed Henrik for review (17 Apr 2026)
- [x] Henrik feedback received (27 Apr 2026) — clip-by-clip review

### Hero Video v3 — xAI API Batch (27 Apr 2026, addressing Henrik's 27 Apr feedback)
- [x] Analysed Henrik's clip-by-clip email (3 flips, 4 tweaks, 2 major redos, 3 concept changes, 2 killed)
- [x] Cross-referenced all v2 prompts against feedback in Google Sheet
- [x] Researched Grok Imagine best practices (3 parallel research agents)
- [x] Created v3 prompt formula (shot type first, architecture descriptions, gaze direction, hands occupied)
- [x] Added "V3 Prompts (27 Apr)" tab to Google Sheet with all 11 new prompts
- [x] Discovered xAI direct video API — no browser automation needed
- [x] Built batch generation script (scripts/generate-hero-videos.sh)
- [x] Generated all 12 clips via xAI API ($3.60 total, ~12 min)
- [x] Redid clip 0 (factory) x2 — fixed hand gesture, then fixed background architecture
- [x] Redid clip 10 (club closing) — simplified to behind-shot walking through open doorway
- [x] Uploaded all clips to Supabase videos/hero-v3/ bucket
- [x] Updated hero-video.tsx with 15-clip v3 running order
- [x] Deployed to staging
- [x] Emailed Henrik for review (27 Apr 2026)
- [x] Saved reusable Grok video gen tool to ~/.claude/rules/grok-video-gen.md
- [ ] Henrik v3 feedback and sign-off (awaiting response)

### Hero Video v4 — Veo 3.1 final round (18 Jun 2026, Henrik's 20 May final list)
Switched pipeline xAI Grok -> Google Veo 3.1 (reference_images asset preservation = far better Henrik likeness). New script `scripts/generate-veo-videos.mjs` (ports AccountsOS Veo client). Finals in `videos/hero-v4/`, backups in `videos/hero-v4/backups/`. Deployed to staging.
- [x] clip-00 factory opening — door artefact removed + camera movement added
- [x] clip-2b TV tower — Weltzeituhr clock removed (used clock-free take; Veo re-adds clocks)
- [x] clip-05 Cox Bay — bowtie removed (open-collar linen)
- [x] clip-10 club closing — camera movement + corrected avatar (turn-to-camera). Take E primary, Take D backup
- [x] Removed Dinner Toast (insert-b-private-dining) clip per request — hero now 14 clips
- [x] Hong Kong stock swap — real Victoria Peak Pexels footage (his link), 4K->720p
- [x] Lofoten + São Paulo stock swaps — DONE 25 Jun. He re-sent via WeTransfer (Rio, São Paulo, Lofoten). Downloaded via WeTransfer API, trimmed to 720p/24fps, swapped in.
- [x] Rio swap — real Christ/Sugarloaf sunset footage replaces the generic AI skyline (3rd clip)
- [x] São Paulo swap — real Octávio Frias bridge footage replaces the AI Hotel Fasano Rio clip (flagged to Henrik, can be repositioned)
- [x] Club closing trim — cut before the turn-around, fast fade (his "too hard/Jason Statham" note)
- [x] TV Tower regen — two Berlin men (dark bearded + leather jacket, blond + long coat), clock-free, no Henrik refs. Old avatar version backed up to videos/hero-v4/backups/clip-2b-berlin-tv-tower-avatar.mp4
- [x] Voice on opening — initially advised DROP; now **in scope** (+EUR 250) per 30 Jun deal → see Payment Fix Sprint Fix 2
- [ ] Payment Fix Sprint (4 fixes) → sign-off → DNS cutover

---

## Pre-Launch Sweep (25 Apr 2026)
- [x] Full code + content readiness audit (all routes 200, build clean, no placeholders)
- [x] Refactored /about/services and /about/team to read CMS subtitle/body/image with fallback
- [x] Seeded ah_page_meta rows for /about/services and /about/team (Henrik can now edit founder bio + services intro from admin)
- [x] Seeded ah_concierge_instructions with 15 baseline rows across all 5 categories — rebranded for global Agent Henrik (no Liv name, no Sweden defaults, no lorem ipsum)
- [x] Confirmed sitemap, robots, OG all reference agenthenrik.com (production domain)
- [x] Confirmed Vercel env vars all present in production
- [x] Sent firm sign-off email to Henrik with 30 Apr 2026 deadline

## HARD STOP (30 Apr 2026) — superseded 30 Jun 2026
Original hard stop lifted when Henrik accepted EUR 2,000 deal (1,750 balance + 250 voice/music) with 4 scoped fixes. Standing by for payment — see Payment Fix Sprint above.

**Project stats:** 29 working days, 295 commits, 6 months. £20k+ at market rates, delivered for £3,000.

## Blocked Until Payment
- [ ] Henrik to pay EUR 2,000 (EUR 1,750 balance + EUR 250 voice/music) — offer accepted 30 Jun, awaiting transfer
- [ ] Fixes prepped in Payment Fix Sprint section above — execute on receipt

### Chase Log
- 30 Jun 2026 (~19:20): No payment by EOD. Staging taken offline (`STAGING_DISABLED=true`, 503 maintenance page). Email sent to all 3 addresses confirming disable + restore path on EUR 2,000 payment.
- 30 Jun 2026 (17:42): Follow-up — "I'll be switching the hosting off soon as no payment received." No reply.
- 30 Jun 2026 (09:49): Henrik replied positively on hero ("wow factor", Rio/São Paulo/Lofoten fantastic) but 4 items remain: TV tower casting, voice+music (+EUR 250), AH mobile hero, LTS mobile menu/footer.
- 30 Jun 2026 (10:00): Paul hard stop — no more amends without payment, server switch-off threatened.
- 30 Jun 2026 (10:15): Henrik counter — don't switch off server, mobile + voice are delivery requirements not amends. Offers EUR 2,000 same-day if Paul confirms in writing.
- 30 Jun 2026 (10:51): Paul accepted offer in writing. Confirmed all 4 fixes on payment. Work starts today/tomorrow.
- 30 Apr 2026: Final delivery email with hard stop (all 3 addresses)
- 7 May 2026: Friendly follow-up with invoice PDF attached (all 3 addresses, reply to 30 Apr thread)
- 14 May 2026: Final notice email + WhatsApp nudge. Deadline: Fri 16 May EOD. If no reply, project closes.
- 16 May 2026: Henrik replied overnight (4 emails). Disputed payment terms with quasi-legal language, sent round 5 video feedback + Pexels clips via WeTransfer, added new LTS scope (gallery, meta CMS). Reply sent citing Clause 1.2 (Delivery defined as "deliver and give access"), Clause 8.1 (contract expired 30 Mar), industry standard 2-3 revision rounds, and "merely technical implementation" clause. Hard stop maintained. LTS quick wins (Nazraana CMS access, meta descriptions) to be done as goodwill. Photo gallery quoted separately.
- 16 May 2026 (later): Henrik doubled down on every point. Claimed staging ≠ delivery, 30 Mar was not a release, corrections are "completing specification not revisions", pre-announced further CMS testing/warranty claims. Formal termination notice sent under Clause 8.2. Deadline: 30 May 2026. Pay EUR 1,750 = get everything + one final video round included. Don't pay = platform taken offline, no IP transfer, both walk away.
- 20 May 2026 (AM): Re-sent termination email to berlinagenten.com (no reply to earlier sends).
- 20 May 2026 (PM): Henrik replied (luxurytravelsweden.com). Agreed to pay EUR 1,750 but attached conditions: full clip-by-clip re-brief of nearly every hero video (new AI generations, drone movements, landmark reworks, new clips), CMS warranty claims, LTS gallery request. Misread "integrate Pexels clips" as green light for all amends. Reply sent quoting his own words back, clarifying: Pexels swaps only, no AI regen, additional amends quoted after payment. CMS bugs yes, new features no. LTS separate. Hard stop maintained.
- 20 May 2026 (later): Henrik sent "final compromise" list: 7 items including AI regens (factory door fix, HK replace, clock removal, bowtie removal, club camera movement), Pexels swaps (Lofoten, Sao Paulo), plus CMS warranty confirmation request and LTS gallery quote. Tone much softer, wants to pay and launch. Confirmed all other clips accepted.
- 21 May 2026: Reply sent explaining AI video technical limitations (generates impressions not copies, every regen is a dice roll, best clip Beirut still doesn't look like Beirut). Offer unchanged: pay EUR 1,750, Pexels/Dropbox integration + clip removal included, further AI work quoted separately. Hard stop maintained.
- 20 May 2026 (17:06): Henrik's final email of the day. 5 rapid-fire emails in one afternoon. Built strongest paper trail yet: quoted Paul's pre-project pitch ("AI Builder expert", "replace 30-man agency", "we can do that within the budget"), argued video was always the central deliverable, framed all revisions as "completing spec not changing brief", acknowledged project grew beyond estimate but said that's Paul's miscalculation not his. Tone notably softer than 16 May: wants to avoid legal, wants "realistic final completion plan." Still hasn't paid. Decision: no reply. Position stated 4x, ball is in his court. Next action is a bank transfer or 30 May passes.
- 18 Jun 2026: Final video round delivered. Agreed to do the one last amends round to close out and get paid. Regenerated 4 AI clips on new Veo 3.1 pipeline (factory door+camera, TV tower clock removed, Cox Bay bowtie removed, club closing camera+avatar), removed Dinner Toast, swapped Hong Kong to his real Pexels footage. 6 of 8 list items done and live on staging. Lofoten + São Paulo blocked: his 16 May WeTransfer expired 19 May. Email sent to all 3 addresses (msg 19edbb88d922b0a9): staging link, point-by-point rundown, backup-take options, request to re-send the 2 missing clips, and path to launch = review + re-send + settle EUR 1,750.
- 25 Jun 2026 (12:57): Henrik reviewed staging (luxurytravelsweden.com). Best tone yet: "it all looks very good now, I am very glad... the beginning and the end is much much better." Accepted most; sent the 3 missing clips via WeTransfer (Rio, São Paulo, Lofoten); added small adjustments. Paul chose "do everything to close it." Same day: downloaded the WeTransfer (via API, his link always expires fast), did all swaps + club trim + TV-tower 2-men regen, deployed to staging, replied point-by-point (all 3 addresses, threaded). Voice on opening advised dropped. Reply ends: hero complete, settle EUR 1,750 → launch. Outstanding items now: his review + payment only.
- 24 Jun 2026 (11:49): Henrik replied (luxurytravelsweden.com) — cooperative holding note, no argument. "Sorry for my delay, last crazy week before summer. Let me do it tomorrow morning. Out in the Finnish forest on an inspection journey, busy 8am to midnight." Promises to review staging Thu 25 Jun AM. No payment, no sign-off yet, but engaged and positive tone. Decision: no reply, let him review. NOTE: his 18 Jun email also flagged an LTS mobile bug (menu + footer links gone on mobile, footer subpages "essential"). Holding the LTS fix as leverage on the AH payment — see MEMORY.md / lts-fix-leverage. Line if he pushes: "finish AH, then we look at LTS."
- 26 May 2026 (16:42): Henrik replied (luxurytravelsweden.com) — 4 days before deadline. Soft tone, no payment, no acknowledgement of Clause 8.2 termination, no acceptance of the offer on the table. 5 moves: (1) "did you actually read my points" re-engagement opener, (2) restated contract reframe ("your opinion on revision rounds/commits/hours is irrelevant from a contractual perspective"), (3) NEW LTS leverage lever — claims he "deliberately chose not to enforce the original LTS cinematic hero video commitment" and "we could easily start discussing the original LTS commitments in detail as well" (veiled threat to reopen a delivered project), (4) flattery setup for more video work, (5) actual ask: "focus on fulfilling the agreed delivery professionally". Decision unchanged: no reply. Hold to 30 May deadline.

## On Payment + Sign-Off (Launch Day Actions)
- [ ] `npx vercel domains add agenthenrik.com --scope p0stman`
- [ ] `npx vercel domains inspect agenthenrik.com --scope p0stman` to get DNS records
- [ ] Update DNS at Miss Hosting → Vercel
- [ ] Confirm/add OneUptime monitor for agenthenrik.com

## Light Content (Henrik to populate post-launch via CMS)
- [ ] Add 4–7 more storytellers (currently 3 of 10 destinations covered)
- [ ] Set storyteller lat/long + show_on_map=true to populate map filter
- [ ] Add more journal articles (currently 3)
- [ ] Add published_at dates to ah_press_items
- [ ] Lengthen theme `definition` fields (currently 31–51 chars, may look thin)
- [ ] Make @agenthenrik Instagram public + swap to StormLikes feed

## Phase 2+ (Post-Launch)
- [ ] Live Instagram feed (swap to StormLikes when public)
- [ ] User accounts + saved itineraries
- [ ] Budget simulator
- [ ] Analytics tracking
- [x] Grok Imagine API multi-reference support — now available and in use (reference_images array, up to 7)
