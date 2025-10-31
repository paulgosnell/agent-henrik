# Storyteller Discovery Flow - Complete Guide

## Overview

LIV now has a **specialized Storyteller Discovery Mode** that guides visitors through a conversational flow to discover and book meetings with Swedish creative storytellers (artists, designers, chefs, innovators, etc.).

## How It Works

### User Journey

```
Visitor clicks "Design My Journey with LIV" on a storyteller card
   ↓
LIV enters Storyteller Mode
   ↓
Stage 1: Topic Selection
   "What kind of storytellers do you want to meet?"
   (film, music, performance, fashion, design, art, writing, photography, digital media, technology, wellness)
   ↓
Stage 2: Activity Type
   "Would you like a meet & greet, workshop, or creative activity?"
   ↓
Stage 3: Storyteller Suggestions
   LIV suggests 3-5 matching storytellers from your database
   "Which one feels right, or shall I keep exploring?"
   ↓
Stage 4: Booking Details
   LIV collects: inquiry type (private/corporate), group size, dates, budget
   ↓
Stage 5: Contact Capture
   Email, name, phone
   ↓
Inquiry saved to database → Appears in admin panel
```

### Technical Flow

1. **Context Detection** (index.html:427, 441, 455)
   - Buttons have `data-liv-context-type="storyteller"`
   - Frontend detects this and enters storyteller mode

2. **Frontend State** (liv-ai.js)
   - Tracks: topic, activityType, selectedStorytellerId, inquiryType, groupSize, preferredDates, budgetRange
   - Passes state to Edge Function with each message

3. **Backend Processing** (supabase/functions/liv-chat/index.ts)
   - Loads storytellers from `stories` table where `category = 'Storyteller'`
   - Uses specialized `buildStorytellerPrompt()` function
   - Guides conversation through stages based on collected info
   - Saves inquiry to `storyteller_inquiries` table when complete

4. **Database Storage** (storyteller_inquiries table)
   - All inquiries saved with full conversation context
   - Viewable in admin panel (once integrated)
   - Status tracking: pending → reviewing → contacted_storyteller → confirmed

---

## Setup Instructions

### Step 1: Apply Database Migration

Run the migration to create the storyteller inquiry system:

```bash
cd /Users/paulgosnell/Sites/luxury-travel-sweden

# Option A: Using Supabase CLI
supabase db push
# OR run specific migration
supabase migration up add_storyteller_inquiry_system

# Option B: Via Supabase Dashboard
# Copy contents of supabase/migrations/add_storyteller_inquiry_system.sql
# Paste into: Dashboard → SQL Editor → Run
```

This creates:
- `storyteller_inquiries` table
- New columns on `stories` table: `specialty_topics`, `activity_types`, `bio`
- Updates existing storytellers with specialty data

### Step 2: Deploy Updated Edge Function

```bash
supabase functions deploy liv-chat
```

This deploys the storyteller-aware LIV AI with:
- Storyteller mode detection
- Specialized conversation prompts
- Stage-based guidance
- Inquiry capture logic

### Step 3: Test the Flow

1. Open your site in browser
2. Scroll to "Featured Storytellers" section
3. Click "Design My Journey with LIV" on any storyteller card
4. Chat should open with: *"Welcome. I help you discover and meet extraordinary storytellers..."*
5. Test the conversation flow:
   - Select a topic (e.g., "design")
   - Select activity type (e.g., "workshop")
   - Review suggestions
   - Provide booking details
   - Submit contact info

6. Verify inquiry saved:
   ```bash
   # Check database directly
   supabase db exec "SELECT * FROM storyteller_inquiries ORDER BY created_at DESC LIMIT 5;"
   ```

---

## Adding New Storytellers

### Via Supabase Dashboard

1. Go to: Dashboard → Table Editor → `stories`
2. Click "Insert row"
3. Fill in:
   - **slug**: `your-storyteller-name` (lowercase, hyphens)
   - **title**: "Meet Jane Doe - Stockholm Fashion Designer"
   - **excerpt**: Short compelling description (2-3 sentences)
   - **content**: Full biography/story (HTML formatted)
   - **hero_image_url**: Photo URL
   - **category**: `Storyteller` (must be exact)
   - **specialty_topics**: `["fashion", "design"]` (array)
   - **activity_types**: `["meet_and_greet", "workshop", "tour"]` (array)
   - **bio**: Full bio text
   - **published_at**: `2025-01-31` (current date for published)
   - **featured**: `true` (to show on homepage)
   - **display_order**: `4` (order on page)

4. Click "Save"

### Topic Categories Available

```javascript
const topics = [
  'film',
  'music',
  'performance',
  'fashion',
  'design',
  'art',       // visual art
  'writing',
  'photography',
  'digital_media',
  'technology',
  'wellness'
];
```

### Activity Types Available

```javascript
const activityTypes = [
  'meet_and_greet',    // 1-2 hour conversation
  'workshop',          // Half-day or full-day hands-on
  'creative_activity', // Collaborative project
  'consultation',      // Professional advice session
  'performance',       // Live performance/show
  'tour'              // Studio tour, location visit
];
```

### Example Storyteller Entry

```sql
INSERT INTO stories (
  slug,
  title,
  excerpt,
  content,
  hero_image_url,
  category,
  specialty_topics,
  activity_types,
  bio,
  published_at,
  featured,
  display_order
) VALUES (
  'maria-forsberg-textile-artist',
  'Maria Forsberg - Textile Artist & Sustainability Pioneer',
  'Maria weaves centuries-old Swedish textile traditions with cutting-edge sustainable practices, creating art that tells stories of land, legacy, and environmental consciousness.',
  '<p>Maria Forsberg is a Stockholm-based textile artist whose work bridges traditional Swedish craftsmanship with contemporary sustainability. Her studio, nestled in the heart of Södermalm, is part workshop, part gallery, part laboratory for textile innovation.</p><p>With 20 years of experience, Maria has collaborated with major Swedish fashion houses, exhibited internationally, and mentored emerging designers in sustainable textile practices.</p>',
  'https://your-image-url.jpg',
  'Storyteller',
  ARRAY['design', 'fashion', 'art', 'wellness'],
  ARRAY['meet_and_greet', 'workshop', 'tour'],
  'Maria weaves centuries-old Swedish textile traditions with cutting-edge sustainable practices.',
  NOW(),
  true,
  4
);
```

---

## Admin Panel Integration

### Viewing Storyteller Inquiries

Create a new admin page: `admin/storyteller-inquiries.html`

```javascript
// Load inquiries
const { data: inquiries } = await supabase
  .from('storyteller_inquiries')
  .select(`
    *,
    lead:leads(name, email, phone),
    storyteller:stories!selected_storyteller_id(title, slug)
  `)
  .order('created_at', { ascending: false });

// Display in table
inquiries.forEach(inquiry => {
  console.log(`
    ${inquiry.lead.name} (${inquiry.lead.email})
    Interested in: ${inquiry.topic_of_interest}
    Activity: ${inquiry.activity_type}
    Selected: ${inquiry.storyteller?.title || 'Not yet selected'}
    Status: ${inquiry.status}
    Created: ${inquiry.created_at}
  `);
});
```

### Update Inquiry Status

```javascript
// Mark as contacted
await supabase
  .from('storyteller_inquiries')
  .update({
    status: 'contacted_storyteller',
    contacted_at: new Date().toISOString(),
    internal_notes: 'Reached out to storyteller, awaiting response'
  })
  .eq('id', inquiryId);
```

---

## Conversation Examples

### Example 1: Design Workshop Request

**User clicks**: Trend Stefan card → "Design My Journey with LIV"

**LIV**: Welcome! I help you discover and meet extraordinary storytellers — creative minds who shape Sweden's cultural scene. What kind of storytellers have you always wanted to meet? Those in film, music, fashion, design, art, wellness, or another creative field?

**User**: Design

**LIV**: Beautiful choice! I can suggest storytellers who truly bring that world to life. Would you like to connect through a meet & greet, a hands-on workshop, or a collaborative creative activity?

**User**: Workshop

**LIV**: Perfect! I think you'll love these three storytellers whose work carries the spirit you're looking for:

**Trend Stefan** - Recognized as one of Sweden's foremost trend scouts, Stefan reveals hidden design gems and emerging studios that define Stockholm's innovative spirit. His workshops dive deep into Swedish design philosophy and process.

**Maria Forsberg** - A textile artist who bridges traditional Swedish craftsmanship with sustainability. Her hands-on workshops teach ancient weaving techniques with modern materials.

**Henrik Tidefjärd** - Founded Luxury Travel Sweden to showcase the intersection of design, nature, and culture. Offers immersive sessions on experience design and Swedish luxury.

Which one feels right, or shall I keep exploring?

**User**: Trend Stefan sounds perfect

**LIV**: Wonderful! We'll do our best to make this encounter happen. To coordinate with Trend Stefan, I need a few details:

Is this a private workshop or a group/corporate event?

**User**: Private, just me

**LIV**: Perfect. When were you hoping to connect with him? Do you have specific dates in mind, or a preferred season?

**User**: Next month, flexible on dates

**LIV**: Excellent. What's your budget range for this experience? This helps us tailor the workshop to your expectations.

**User**: Mid-range to premium

**LIV**: Fantastic. To finalize this and connect you with Trend Stefan, may I have your email address? We'll send you detailed information about the workshop and coordinate the booking within 24-48 hours.

**User**: jane@example.com

**LIV**: Thank you, Jane! I've got everything we need. We'll reach out to Trend Stefan and get back to you within 24-48 hours with:
- Available dates
- Workshop details and itinerary
- Pricing confirmation
- Next steps to confirm

Looking forward to creating this meaningful encounter for you! 🇸🇪

---

## Monitoring & Analytics

### Key Metrics to Track

```sql
-- Inquiry volume by topic
SELECT
  topic_of_interest,
  COUNT(*) as count
FROM storyteller_inquiries
GROUP BY topic_of_interest
ORDER BY count DESC;

-- Most requested storytellers
SELECT
  s.title,
  COUNT(si.id) as inquiry_count
FROM stories s
LEFT JOIN storyteller_inquiries si ON s.id = si.selected_storyteller_id
WHERE s.category = 'Storyteller'
GROUP BY s.title
ORDER BY inquiry_count DESC;

-- Conversion rate (inquiries that selected a storyteller)
SELECT
  COUNT(*) FILTER (WHERE selected_storyteller_id IS NOT NULL) * 100.0 / COUNT(*) as conversion_rate
FROM storyteller_inquiries;

-- Inquiry status breakdown
SELECT
  status,
  COUNT(*) as count
FROM storyteller_inquiries
GROUP BY status;
```

---

## Troubleshooting

### Issue: LIV doesn't enter storyteller mode

**Check**:
1. Button has `data-liv-context-type="storyteller"` attribute
2. Frontend console shows: `context.type = "storyteller"`
3. Edge Function logs show: `isStorytellerMode = true`

**Fix**: Update button HTML
```html
<button type="button" data-open-liv data-liv-context-type="storyteller" data-liv-context-name="Your Storyteller Name">
  Design My Journey with LIV
</button>
```

### Issue: No storytellers appear in suggestions

**Check**:
1. `stories` table has entries with `category = 'Storyteller'`
2. Stories have `published_at` not null
3. Stories have `specialty_topics` array populated

**Fix**: Run migration again or manually update:
```sql
UPDATE stories
SET specialty_topics = ARRAY['design', 'fashion']
WHERE slug = 'your-storyteller-slug';
```

### Issue: Inquiries not saving to database

**Check**:
1. Migration applied successfully
2. Table `storyteller_inquiries` exists
3. Edge Function has permissions (uses service_role_key)
4. Check Edge Function logs: `supabase functions logs liv-chat --tail`

**Debug**:
```bash
supabase functions logs liv-chat --tail
# Look for errors like:
# "relation storyteller_inquiries does not exist"
# "permission denied"
```

---

## Next Steps

### Recommended Enhancements

1. **Email Notifications**
   - Send email to admin when new inquiry arrives
   - Send confirmation email to visitor
   - Notify storyteller of interest

2. **Storyteller Profiles**
   - Create dedicated profile pages for each storyteller
   - Add portfolio/work samples
   - Include calendar availability

3. **Pricing Integration**
   - Add pricing tiers to activities
   - Show estimated costs during conversation
   - Generate instant quotes

4. **Booking Calendar**
   - Integrate with storyteller calendars
   - Show available time slots
   - Enable direct booking

5. **Review System**
   - Collect feedback after encounters
   - Display testimonials on storyteller profiles
   - Build social proof

---

## Files Modified

### Created
- `supabase/migrations/add_storyteller_inquiry_system.sql` - Database schema
- `STORYTELLER_FLOW_GUIDE.md` - This documentation

### Modified
- `supabase/functions/liv-chat/index.ts` - Edge Function with storyteller mode
- `liv-ai.js` - Frontend storyteller state tracking

### Existing (No Changes Needed)
- `index.html` - Already has storyteller context triggers
- `styles.css` - Chat styling works for storyteller mode

---

## Questions?

- **Setup issues**: Check migration logs and Edge Function deployment
- **Flow customization**: Edit `buildStorytellerPrompt()` in Edge Function
- **Adding fields**: Modify `storyteller_inquiries` table schema
- **UI changes**: Update welcome message in `resetConversation()`

The storyteller flow is now fully integrated and ready to use! 🎨🇸🇪
