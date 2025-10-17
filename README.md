# Luxury Travel Sweden — Prototype Overview

## Experience Highlights
- **Cinematic hero** with autoplay video, fade-to-black overlay, and staged typewriter headline.
- **Choose Your Path grid** guiding guests toward Journeys, Corporate & Incentives, Concierge (LIV), and Stories.
- **Journeys pillars** outlining seven experiential dimensions with editorial copy.
- **Corporate, Concierge, Sustainability** sections with dual-column storytelling and gradient panels.
- **Stories, Press, Testimonials** previews curated for trust and editorial credibility.
- **LIV concierge flow** that asks six questions, generates a narrative itinerary (2–3 paragraphs), and offers handoff to human curators + enquiry form.
- **Contact module** featuring dual CTAs and a pre-populated enquiry form that captures drafts from LIV.

## Files & Structure
| File | Purpose |
| --- | --- |
| `pitch.html` | Main prototype page including hero, sections, concierge script, and enquiry form. |
| `style-guide.md` | Visual + typographic system, motion cues, and component specs. |
| `content-plan.md` | Asset roadmap and CMS schema for Journeys, Stories, Press, and LIV prompts. |
| `brief.md` | Original project requirements for reference. |

## Quick Start
1. Open `pitch.html` directly in a modern browser (Chrome, Safari, Edge).
2. Let the hero video finish to trigger the typewriter sequence and reveal navigation + concierge.
3. Launch LIV by clicking the ❋ button or “Design with LIV.”
4. Walk through the prompts; when you confirm the handoff, scroll to the contact section to review the attached draft itinerary and summary.

## Customising the Prototype
- **Media assets**: replace hero video source at the top of `pitch.html`. Add additional poster images or background styles per section.
- **Copy & sections**: edit markup within each `<section>` to refine narratives. Eyebrow labels rely on the `.eyebrow` utility.
- **LIV flow**: adjust prompts and narrative logic inside the `livSteps` array and the `buildItineraryDraft` function in the inline `<script>`.
- **Enquiry form**: integrate with your preferred CRM or form handler by replacing the `handleFormSubmit` function.

## Next Steps (Suggested)
- Build hi-fi wireframes / motion prototype in Figma using the style guide tokens.
- Source bespoke media per the asset roadmap (`content-plan.md`).
- Connect LIV flow to an AI backend (OpenAI Assistants, proprietary concierge) and persist itineraries to CMS.
- Implement CMS-powered content feeds (Journeys, Stories, Press) once the structure is configured.
- Add global navigation transitions (sticky, color invert) for scroll depth cues.

## Accessibility & Performance Notes
- All CTAs and chips meet ≥44 px tap target.
- Provide descriptive `alt` text for imagery and poster frames for autoplay media.
- Consider lazy loading additional sections (IntersectionObserver) and deferring non-critical JS for production.
