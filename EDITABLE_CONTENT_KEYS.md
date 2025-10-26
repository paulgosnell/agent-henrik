# Editable Content Keys Reference

This document lists all the editable content keys in the Luxury Travel Sweden website. These keys are used in both the HTML (`data-editable` attributes) and the Supabase `static_content` table.

## Complete List of Editable Elements

### Hero Section

| Key | Description | Current Default Value |
|-----|-------------|----------------------|
| `hero.headline.line1` | Hero headline (first line) | "Sweden, Composed For You" |
| `hero.headline.line2` | Hero headline (second line) | "Curated by Insiders" |
| `hero.cta.explore` | Explore button text | "START EXPLORE" |
| `hero.cta.design` | Design journey button text | "DESIGN MY JOURNEY WITH LIV" |
| `hero.cta.enter` | Enter experience button text | "ENTER THE EXPERIENCE" |

### Map/Destinations Section

| Key | Description | Current Default Value |
|-----|-------------|----------------------|
| `map.eyebrow` | Section label | "Explore Sweden & Beyond" |
| `map.headline` | Section headline | "Tap a destination to discover your journey" |
| `map.description` | Section description | "Tap a destination to explore a region, city, place or hidden gem. Whether you're drawn to Stockholm's history, Lapland's auroras, or the archipelago's private islands, each pin opens the gateway to your journey with help of LIV." |

### Six Pillars Section

| Key | Description | Current Default Value |
|-----|-------------|----------------------|
| `pillars.eyebrow` | Section label | "Experiences" |
| `pillars.headline` | Section headline | "Six pillars to compose your narrative." |
| `pillars.description` | Section description | "For discerning travelers who want more than a holiday — who want to step into Sweden's soul. Our journeys are cinematic narratives, curated with exclusive access, emotional storytelling, and ultra-luxury comfort." |

### Corporate & Incentives Section

| Key | Description | Current Default Value |
|-----|-------------|----------------------|
| `corporate.eyebrow` | Section label | "Corporate & Incentives" |
| `corporate.headline` | Section headline | "Create experiences that move the company culture forward" |
| `corporate.description` | Section description | "Sweden is not only a destination — it is a stage for creativity, inspiration, and transformation. We design corporate journeys that reward, engage, and inspire through experiences no traditional DMC can offer." |

### Storytellers Section

| Key | Description | Current Default Value |
|-----|-------------|----------------------|
| `stories.eyebrow` | Section label | "Featured Storytellers" |
| `stories.headline` | Section headline | "Experience Sweden Beyond the Ordinary" |
| `stories.description` | Main description | "Led by local storytellers — from Sami elders and Michelin chefs to artists, designers, and innovators — each encounter offers an authentic glimpse into Swedish life, culture, and creativity. Whether you travel solo or with others, our curated experiences, workshops, and destinations promise meaningful connections and stories that stay with you long after the journey ends." |
| `stories.subheadline` | Secondary headline | "You need inspiration? Take a peek at our curated selection of storytellers, destinations, workshops, and businesses for eventful, meaningful trips." |

### Concierge Section

| Key | Description | Current Default Value |
|-----|-------------|----------------------|
| `concierge.eyebrow` | Section label | "CONCIERGE" |
| `concierge.headline` | Section headline | "Meet LIV — Luxury Itinerary Visionary." |
| `concierge.description` | Section description | "Embedded across the experience, LIV begins your dialogue, sketches the first draft of your itinerary, and invites you to pass the narrative to our human curators for refinement." |

### Journal Section

| Key | Description | Current Default Value |
|-----|-------------|----------------------|
| `journal.eyebrow` | Section label | "Journal" |
| `journal.headline` | Section headline | "Editorial previews from the Journal." |
| `journal.description` | Section description | "Editorial previews from our latest scoops." |

### Press & Media Section

| Key | Description | Current Default Value |
|-----|-------------|----------------------|
| `press.eyebrow` | Section label | "Press & Media" |
| `press.headline` | Section headline | "What Media Says About Us" |
| `press.description` | Section description | "Our work has been recognized by the world's leading voices in luxury and travel." |

### Instagram Section

| Key | Description | Current Default Value |
|-----|-------------|----------------------|
| `instagram.eyebrow` | Section label | "Follow Our Discoveries" |
| `instagram.headline` | Section headline | "@LuxuryTravelSweden" |
| `instagram.description` | Section description (contains link) | "Follow us on Instagram" |

### Contact Section

| Key | Description | Current Default Value |
|-----|-------------|----------------------|
| `contact.eyebrow` | Section label | "CONTACT" |
| `contact.headline` | Section headline | "Ready to create your Swedish adventure?" |
| `contact.description` | Section description | "Share your ambitions and we will reply within 24 hours with the next steps, schedule a call, or deliver a curated dossier. Every enquiry is handled by a personal curator, who will design a bespoke narrative just for you." |

### Footer

| Key | Description | Current Default Value |
|-----|-------------|----------------------|
| `footer.newsletter.title` | Newsletter section title | "Stay Inspired" |
| `footer.newsletter.description` | Newsletter description | "Join our community and receive exclusive stories, insider tips, and curated experiences from Sweden." |
| `footer.copyright` | Copyright text | "© 2025 Luxury Travel Sweden" |
| `footer.tagline` | Footer tagline | "Crafted with passion in Sweden" |

## Total Count

**37 editable elements** across the entire website.

## Database Setup

To initialize these values in Supabase, you can run:

```sql
-- Example inserts for static_content table
INSERT INTO static_content (key, value) VALUES
  ('hero.headline.line1', 'Sweden, Composed For You'),
  ('hero.headline.line2', 'Curated by Insiders'),
  ('hero.cta.explore', 'START EXPLORE'),
  ('hero.cta.design', 'DESIGN MY JOURNEY WITH LIV'),
  ('hero.cta.enter', 'ENTER THE EXPERIENCE'),
  -- ... add all other keys
ON CONFLICT (key) DO NOTHING;
```

Or use the Supabase admin panel to manually add each key-value pair.

## Usage in Code

### HTML (data-editable attribute)
```html
<h2 data-editable="pillars.headline">Six pillars to compose your narrative.</h2>
```

### JavaScript (accessing via Supabase)
```javascript
const content = await window.Supabase.db.getStaticContent();
console.log(content['pillars.headline']); // "Six pillars to compose your narrative."
```

### Updating via Inline Editor
The inline editor automatically handles updates when users edit and save content.

## Best Practices

1. **Key Naming Convention**: Use dot notation (section.type.variant)
   - Section: Hero, map, pillars, corporate, etc.
   - Type: headline, description, eyebrow, cta, etc.
   - Variant: line1, line2, primary, secondary, etc.

2. **Keep Values Short**: Long content should be stored in separate tables (blog_posts, destinations, etc.)

3. **Default Values**: Always provide default values in the HTML as fallback

4. **Character Limits**: Consider adding validation for very short fields (like CTAs)

## Adding New Editable Elements

To make a new element editable:

1. **Add HTML attribute**:
   ```html
   <p data-editable="new.section.text">Default text here</p>
   ```

2. **Add to database**:
   ```sql
   INSERT INTO static_content (key, value)
   VALUES ('new.section.text', 'Default text here');
   ```

3. **Update this reference**: Add the new key to this document

4. **Test**: Enable edit mode and verify the element is editable

## Notes

- Keys are case-sensitive
- Use only alphanumeric characters, dots, and underscores
- Avoid special characters in keys
- Keep key names descriptive but concise
- Document any new keys added to the system
