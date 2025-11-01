# Instagram Feed Setup Guide

## Overview
The homepage now displays your latest 3 Instagram posts automatically. This guide explains how to connect your Instagram account.

## Quick Setup (5 minutes)

### Step 1: Create Facebook App
1. Go to [Facebook Developers](https://developers.facebook.com/apps/)
2. Click "Create App"
3. Select "Other" as use case
4. Select "Business" as app type
5. Fill in app details:
   - App Name: "Luxury Travel Sweden Instagram"
   - App Contact Email: your email
6. Click "Create App"

### Step 2: Add Instagram Basic Display
1. In your app dashboard, click "Add Products"
2. Find "Instagram Basic Display" and click "Set Up"
3. Scroll down to "User Token Generator"
4. Click "Add or Remove Instagram Testers"
5. In the popup:
   - Go to "Instagram Testers" tab
   - Click "Add Instagram Testers"
   - Enter your Instagram username: `luxurytravelsweden`
   - Click "Submit"

### Step 3: Accept Tester Invitation
1. Log into Instagram on web: [instagram.com](https://instagram.com/)
2. Go to Settings → Apps and Websites → Tester Invites
3. Accept the invitation from your Facebook app

### Step 4: Generate Access Token
1. Return to Facebook Developers → Instagram Basic Display
2. Under "User Token Generator":
   - Click "Generate Token" next to your Instagram account
3. Authorize the app in the popup
4. **Copy the generated token** (it's a long string of characters)

### Step 5: Configure in CMS
1. Go to your admin panel: [/admin/instagram-setup.html](/admin/instagram-setup.html)
2. Paste the token into the "Access Token" field
3. Click "Save Token"
4. Click "Test Connection" to verify it works
5. Visit your homepage to see your Instagram posts!

## Important Notes

### Token Expiration
- Access tokens expire after **60 days**
- You'll need to regenerate and update the token every 2 months
- The system will gracefully fall back to a message if the token expires

### Privacy
- Only **public posts** from your Instagram account will be displayed
- The feed shows the 3 most recent posts
- Posts are cached for 1 hour to improve performance

### What's Displayed
- Latest 3 Instagram images
- First line of caption (truncated to 50 characters)
- Clickable links to view full posts on Instagram
- Hover to see captions

## Troubleshooting

### "Instagram access token not configured"
- Make sure you've saved the token in the admin panel
- Try regenerating the token from Facebook Developers

### "Failed to fetch from Instagram"
- Check that the token hasn't expired (60 days)
- Verify your Instagram account is public or the app has access
- Make sure you accepted the tester invitation

### No posts showing
- Ensure you have at least 3 public posts on Instagram
- Wait a few minutes after posting new content
- Clear the cache by saving the token again

## Long-Lived Tokens (Optional)

For tokens that last 60 days instead of 1 hour:

1. Use the generated token from above
2. Make this API call (replace `{token}` with your token and `{app-secret}` with your app secret):

```bash
https://graph.instagram.com/access_token
  ?grant_type=ig_exchange_token
  &client_secret={app-secret}
  &access_token={token}
```

3. Use the returned `access_token` in the CMS

## Support

If you encounter issues:
1. Check the browser console for error messages
2. Use the "Test Connection" button in the admin panel
3. Verify all steps were completed correctly
4. Contact support if problems persist

---

**Last Updated:** January 2025
