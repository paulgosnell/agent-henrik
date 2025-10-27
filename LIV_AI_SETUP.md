# LIV AI Setup Guide

This guide will help you deploy the AI-powered LIV (Luxury Itinerary Visionary) concierge to your Luxury Travel Sweden website.

## Overview

LIV AI transforms your website's chat agent from a scripted conversation into an intelligent AI-powered concierge using OpenAI's GPT-4o model. LIV can:

- **Understand context** from where visitors click (map locations, stories, experiences)
- **Create bespoke itineraries** based on visitor preferences
- **Provide proactive recommendations** using your destination and theme database
- **Maintain natural conversations** that feel human and sophisticated
- **Stream responses in real-time** for an engaging user experience

## Architecture

```
Visitor clicks map/story/experience
    ↓
Context captured (location, themes, category)
    ↓
LIV AI chat opens with personalized greeting
    ↓
Frontend (liv-ai.js) sends message + context
    ↓
Supabase Edge Function (liv-chat)
    ↓
Loads destinations/themes from Supabase DB
    ↓
Builds intelligent system prompt
    ↓
Calls OpenAI GPT-4o API
    ↓
Streams response back to visitor
```

## Prerequisites

1. **Supabase Project** (already configured ✅)
2. **OpenAI Account** with API access
3. **Supabase CLI** installed locally

## Step 1: Get Your OpenAI API Key

1. Go to [platform.openai.com](https://platform.openai.com)
2. Sign up or log in
3. Navigate to **API Keys** section
4. Click **Create new secret key**
5. Name it "Luxury Travel Sweden - LIV AI"
6. Copy the key (starts with `sk-...`)
7. **Important**: Save this key securely - you won't see it again!

### Cost Estimate
With GPT-4o:
- Input: ~$2.50 per 1M tokens
- Output: ~$10 per 1M tokens
- Average conversation: ~5,000 tokens = **$0.06 per conversation**
- Very affordable for luxury travel market!

## Step 2: Install Supabase CLI

If you don't have it already:

```bash
# macOS
brew install supabase/tap/supabase

# Windows (PowerShell)
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase

# Linux
brew install supabase/tap/supabase
```

Verify installation:
```bash
supabase --version
```

## Step 3: Link Your Supabase Project

Navigate to your project directory:
```bash
cd /Users/paulgosnell/Sites/luxury-travel-sweden
```

Link to your Supabase project:
```bash
supabase link --project-ref fjnfsabvuiyzuzfhxzcc
```

You'll be prompted to log in to Supabase - use your Supabase dashboard credentials.

## Step 4: Set Environment Variables

Set your OpenAI API key as a Supabase secret:

```bash
supabase secrets set OPENAI_API_KEY=sk-your-actual-api-key-here
```

Verify it's set:
```bash
supabase secrets list
```

You should see:
- `OPENAI_API_KEY` (set)
- `SUPABASE_URL` (automatically available)
- `SUPABASE_SERVICE_ROLE_KEY` (automatically available)

## Step 5: Deploy the Edge Function

Deploy the LIV chat Edge Function:

```bash
supabase functions deploy liv-chat
```

You should see output like:
```
Deploying function liv-chat...
Function URL: https://fjnfsabvuiyzuzfhxzcc.supabase.co/functions/v1/liv-chat
✓ Deployed function liv-chat
```

## Step 6: Enable CORS (Important!)

The Edge Function needs to accept requests from your website:

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard/project/fjnfsabvuiyzuzfhxzcc)
2. Navigate to **Settings** → **API**
3. Scroll to **CORS Configuration**
4. Add your website domain(s):
   - `http://localhost:3000` (for local testing)
   - `https://yourdomain.com` (your production domain)
   - Or use `*` for all domains (less secure, but easier for testing)

## Step 7: Test the Integration

### Local Testing

1. Open your website locally
2. Click on a map marker (e.g., Stockholm)
3. Click "Design Journey with LIV"
4. You should see:
   - LIV chat opens
   - A personalized greeting appears (context-aware)
   - You can type messages and get AI responses

### Debugging

Open browser console (F12) and check for:

✅ Good signs:
```
✅ Supabase client initialized
✅ LIV AI initialized
```

❌ Problems:
```
❌ Failed to fetch
❌ 401 Unauthorized
❌ CORS error
```

### Common Issues

**1. "Failed to fetch" or "Network error"**
- Check your internet connection
- Verify Edge Function is deployed: `supabase functions list`
- Check function logs: `supabase functions logs liv-chat`

**2. "401 Unauthorized" or "Invalid API Key"**
- Verify OpenAI API key: `supabase secrets list`
- Make sure you copied the full key (starts with `sk-`)
- Redeploy: `supabase functions deploy liv-chat`

**3. "CORS error"**
- Add your domain to CORS settings (Step 6)
- Clear browser cache
- Try in incognito mode

**4. "AI response is generic / not context-aware"**
- Check browser console for CustomEvent dispatch
- Verify destinations are loaded from Supabase
- Check Edge Function logs for context data

## Step 8: Monitor Usage

### View Edge Function Logs
```bash
supabase functions logs liv-chat --tail
```

### Check OpenAI Usage
1. Go to [platform.openai.com/usage](https://platform.openai.com/usage)
2. Monitor API costs
3. Set up billing alerts (recommended: $50/month for luxury travel)

### Supabase Dashboard
1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/fjnfsabvuiyzuzfhxzcc)
2. Navigate to **Edge Functions** → **liv-chat**
3. View invocations, errors, and performance

## Step 9: Customize LIV's Personality (Optional)

The AI system prompt is in `supabase/functions/liv-chat/index.ts`.

To modify LIV's personality:

1. Edit `supabase/functions/liv-chat/index.ts`
2. Find the `buildSystemPrompt` function
3. Modify the prompt text (e.g., tone, style, approach)
4. Redeploy: `supabase functions deploy liv-chat`

Example customizations:
- Make LIV more formal/casual
- Add specific brand guidelines
- Include additional destination details
- Change greeting style

## Files Modified/Created

### New Files:
- ✅ `supabase/functions/liv-chat/index.ts` - Edge Function for AI chat
- ✅ `liv-ai.js` - Frontend AI chat controller
- ✅ `LIV_AI_SETUP.md` - This file

### Modified Files:
- ✅ `index.html` - Added `liv-ai.js` script
- ✅ `scripts.js` - Added context event dispatching for map markers

## Context Entry Points

LIV AI automatically captures context from these entry points:

### 1. Map Markers
When visitor clicks a map marker → LIV knows:
- Destination name
- Category (city, seaside, province, etc.)
- Themes (Design, Nature, Culinary, etc.)
- Seasons (Spring, Summer, Autumn, Winter)

### 2. Stories (Future)
Add to story CTAs:
```javascript
button.onclick = () => {
  document.dispatchEvent(new CustomEvent('storyClicked', {
    detail: { story: { title: 'Story Name' } }
  }));
};
```

### 3. Experiences (Future)
Add to experience CTAs:
```javascript
button.onclick = () => {
  document.dispatchEvent(new CustomEvent('experienceClicked', {
    detail: {
      experience: {
        title: 'Experience Name',
        themes: ['Design', 'Culture']
      }
    }
  }));
};
```

### 4. Theme Filters (Future)
When visitor clicks a theme filter:
```javascript
document.dispatchEvent(new CustomEvent('themeSelected', {
  detail: { theme: 'Hidden Nature & Wellness' }
}));
```

## Scaling Considerations

### Rate Limiting
The Edge Function has no built-in rate limiting. Consider adding:
```typescript
// Add to index.ts
const rateLimiter = new Map();
const MAX_REQUESTS_PER_MINUTE = 10;
```

### Caching
For frequently asked questions, consider:
- Caching common responses
- Using OpenAI embeddings for FAQ matching
- Implementing conversation memory

### Cost Management
Monitor costs and consider:
- Setting OpenAI spending limits
- Implementing conversation length limits
- Using GPT-3.5-turbo for simpler queries (cheaper)

## Support

### Supabase Support
- [Supabase Documentation](https://supabase.com/docs)
- [Edge Functions Guide](https://supabase.com/docs/guides/functions)
- [Community Discord](https://discord.supabase.com)

### OpenAI Support
- [OpenAI Documentation](https://platform.openai.com/docs)
- [API Reference](https://platform.openai.com/docs/api-reference)
- [Community Forum](https://community.openai.com)

## Next Steps

1. ✅ Deploy the Edge Function (Step 5)
2. ✅ Test with map markers
3. 📝 Add context to story/experience CTAs
4. 📝 Monitor usage and costs
5. 📝 Customize LIV's personality as needed
6. 📝 Implement conversation handoff to booking form

## Success Indicators

You'll know it's working when:
- ✅ Visitors click map markers and LIV opens with context-aware greeting
- ✅ LIV mentions specific destinations, themes, and seasons
- ✅ Responses are personalized and sophisticated
- ✅ Conversations flow naturally without scripted prompts
- ✅ AI suggests specific itineraries from your database

---

**Questions?** Contact your development team or check the Supabase/OpenAI documentation above.
