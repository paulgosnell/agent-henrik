# Luxury Travel Sweden — Style Guide

## 1. Brand Ingredients
- **Tone**: Cinematic, editorial, Nordic-minimal. Every surface should feel curated, confident, and quietly indulgent.
- **Voice**: Sophisticated and poetic; prefers evocative nouns over adjectives. Use present tense, short sentences, and sensory verbs.
- **Layout Rhythm**: Oversized hero moments anchored by generous negative space. Follow a 12-column, 1200 px max-width system with fluid gutters (clamp-based spacing in code).

## 2. Typography
| Use | Typeface | Settings | Notes |
| --- | --- | --- | --- |
| Display / H1–H3 | **Crimson Text** (serif) | Weight 400–600, letter-spacing -0.02 em for hero, line-height 1.1–1.3 | Editorial masthead energy; keep uppercase sparingly. |
| Eyebrow / Meta | Inter (sans) | 0.7–0.8 rem, letter-spacing 0.3–0.45 rem, uppercase | Use as section cues and quick-glance metadata. |
| Body copy | Inter (sans) | 1 rem–1.1 rem, weight 300–400, line-height 1.6–1.75 | Maintain contrast by pairing with muted greys. |
| Pull quotes | Crimson Text | 1.3–1.6 rem, italic optional | Use inside testimonial cards and Stories. |

**Responsive scaling**: Headlines use `clamp()` to shift between 2.5 rem (mobile) and 7 rem (desktop). Keep copy widths to ~65 characters for legibility.

## 3. Color System
| Token | Hex | Usage |
| --- | --- | --- |
| `--color-bg` | #050607 → #111416 gradient | Global backdrop; cinematic black. |
| `--color-card-bg` | rgba(12,14,17,0.85) | Path cards, overlays, dialog panels. |
| `--color-surface` | rgba(19,22,26,0.9) | Secondary surfaces, navigation backgrounds. |
| `--color-text` | rgba(243,245,246,0.92) | Primary text. |
| `--color-text-muted` | rgba(243,245,246,0.65) | Supporting copy. |
| `--color-accent-forest` | #234B3B | Nature-forward highlights, wellness cues. |
| `--color-accent-slate` | #2B3C56 | Innovation, night, and archipelago accents. |
| Gradient accents | `linear-gradient(135deg, rgba(35,75,59,0.92), rgba(17,25,34,0.9))` | Concierge and sustainability panels. |

**Contrast**: Maintain WCAG AA ratios (≥ 4.5:1). When overlaying text on imagery, pair with gradient scrims (`rgba(0,0,0,0.45)+`).

## 4. Spatial System
- Base spacing unit: 8 px (use multiples via `clamp()` for fluid scaling).
- Section padding: `clamp(4rem, 10vw, 7rem)`.
- Card radius: 16–22 px depending on hierarchy.
- Path/Journey cards: 2.25 rem internal padding with radial highlight hovering at top-right.
- Chat / CTA chips: pill radius, min height 44 px for tap targets.

## 5. Core Components
### Hero
- Full-viewport video with blur overlay that fades to near-black before text animation.
- Typing headline animation (80 ms cadence) followed by staged reveal of subtext and CTA.

### Navigation
- Absolute positioning over hero; transitions to visible after hero animation.
- Mobile menu: glassmorphism drawer with uppercase nav items and 0.2 rem letter-spacing.

### Choose Your Path / Journey Cards
- 4-up grid (desktop), collapsing to 2-up and single column.
- Each card uses serif title, muted body, uppercase link with arrow shift on hover.

### Concierge Overlay (LIV)
- Darkened modal with 600 px max width.
- Messages: `chat-message` (AI) vs `chat-message user` with opposing alignment.
- Quick replies: pill buttons, uppercase, 0.12 rem tracking.
- Flow: greeting → 5 preference prompts → itinerary (2–3 paragraphs) → CTA.

### Contact Form
- Glass card with 2-column grid (collapses at ≤1024 px).
- Fields use uppercase labels, `var(--font-sans)` inputs, 10 px radius.
- Submit button mirrors CTA styling (pilled, uppercase, 0.35 rem tracking).

## 6. Motion & Interaction
- **Micro-interactions**: 300–400 ms ease transitions on hover; cards lift by 4–6 px.
- **Scroll indicator**: floating arrow with 2 s y-translation loop.
- **Chat reveal**: fade/scale from 0.8 → 1.0 over 0.6 s with 3.5 s delay post hero.
- **Typewriter**: 80 ms per character, caret blink at 1 s.

## 7. Imagery & Media
- Use bespoke footage or licensed cinematic clips (4k recommended) with Sweden-centric subjects: archipelago, forests, design ateliers, aurora, innovation labs.
- Photography: desaturated blacks, high contrast, minimal saturation; prefer shallow depth of field.
- Apply gradient overlays (`rgba(4,5,6,0.85)` bottom → transparent top) for legibility in Stories cards.
- Lazy-load video and large imagery via `loading="lazy"` (for supporting sections) and compressed `webm/mp4`.

## 8. Accessibility Notes
- Maintain keyboard focus states (1 px solid `rgba(255,255,255,0.7)` + subtle glow).
- Provide descriptive alt text focusing on mood + subject (e.g., “Aurora above glass cabin in Swedish Lapland”).
- Ensure CTA copy remains actionable (“Design with LIV”, “Plan Our Experience”).

## 9. Export Checklist
- Include `Crimson Text` and `Inter` via Google Fonts or self-hosted.
- Package color tokens and spacing in design tool (Figma styles or tokens JSON).
- Provide hero video poster image fallback (JPEG) in 16:9.
- Document animation timings for dev handoff (hero fade, chat delays, hover transitions).
