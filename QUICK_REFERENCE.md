# Quick Reference Card - Luxury Travel Sweden CMS

**Print this page and keep it handy!**

---

## 🔑 Login

**Admin Dashboard:** `/admin/login.html`
**Your Email:** [Write your email here]
**Your Password:** [Keep this secure!]

---

## ⌨️ Keyboard Shortcuts

| Action | Windows/Linux | Mac |
|--------|---------------|-----|
| Enable inline editing | `Ctrl + E` | `Cmd + E` |
| Save inline edits | `Ctrl + S` | `Cmd + S` |
| Cancel edits | `Esc` | `Esc` |

---

## 📍 Admin Pages

| Page | URL | Purpose |
|------|-----|---------|
| Dashboard | `/admin/index.html` | Home & stats |
| Destinations | `/admin/destinations.html` | Manage map locations |
| Blog Posts | `/admin/posts.html` | Write articles |
| Stories | `/admin/stories.html` | Manage stories |
| Media Library | `/admin/media.html` | Upload images |

---

## 🎯 Common Tasks

### Add a New Destination
1. Go to `/admin/destinations.html`
2. Click **"Add Destination"**
3. Fill in title, description
4. **Click on map** to set location
5. Select category, themes, seasons
6. Upload image (optional)
7. Click **"Save Destination"**

### Write a Blog Post
1. Go to `/admin/posts.html`
2. Click **"Create New Post"**
3. Enter title
4. Use toolbar to format text
5. Upload hero image
6. Set publish date
7. Click **"Publish"**

### Upload an Image
1. Go to `/admin/media.html`
2. **Drag image** onto upload area
3. Wait for upload to complete
4. Click image to **copy URL**
5. Use URL in posts/destinations

### Edit Website Text
1. **Press Ctrl+E** (or Cmd+E on Mac)
2. Yellow borders appear around editable text
3. **Click text** to edit
4. Make your changes
5. Click **"Save Changes"** button
6. Page reloads with new text

---

## 🆘 Troubleshooting

| Problem | Solution |
|---------|----------|
| Can't login | Check email/password, try password reset |
| Images won't upload | Check storage bucket is configured |
| Inline editing not working | Make sure you're logged in first |
| Map not showing | Clear browser cache, refresh page |
| Changes not saving | Check internet connection |

---

## 📞 Getting Help

**Documentation:**
- Quick Start: `START_HERE.md`
- Full Guide: `CLIENT_USER_GUIDE.md`
- Deployment: `DEPLOYMENT_GUIDE.md`

**Supabase Support:**
- Docs: https://supabase.com/docs
- Discord: https://discord.supabase.com

---

## 🔒 Supabase Dashboard

**URL:** https://supabase.com/dashboard
**Project ID:** `fjnfsabvuiyzuzfhxzcc`

**What you can do:**
- View database tables
- Create/reset admin users
- Configure storage
- View logs
- Monitor usage

---

## 📊 Database Tables

| Table | Purpose | Records |
|-------|---------|---------|
| `themes` | Travel themes | 6 |
| `destinations` | Map locations | 17 |
| `blog_posts` | Blog articles | 0 (add yours!) |
| `stories` | Travel stories | 0 (add yours!) |
| `static_content` | Website text | 37 |
| `press_quotes` | Testimonials | 0 (add yours!) |
| `media` | Uploaded files | 0 (add yours!) |

---

## 🎨 Destination Categories

Choose one when adding destination:
- **city** - Major cities (Stockholm, Gothenburg)
- **seaside** - Coastal areas (Archipelago, Gotland)
- **province** - Regions (Dalarna, Lapland)
- **beach** - Beach destinations
- **ski** - Ski resorts
- **park** - National parks
- **storyteller** - Cultural experiences

---

## 🌈 Themes

Choose themes that match your destination:
- **Nature & Wellness** - Outdoor, spa, wellness
- **Design & Innovation** - Architecture, tech
- **Culinary** - Food, restaurants, dining
- **Royal, Art & Culture** - History, museums
- **Nightlife & Celebrations** - Events, entertainment
- **Legacy & Purpose** - Sustainability, community

---

## 📅 Seasons

Select applicable seasons:
- Spring
- Summer
- Autumn
- Winter

---

## 💡 Pro Tips

### Destinations
- Use high-quality images (1920x1280px ideal)
- Write concise descriptions (2-3 sentences)
- Select 2-3 themes per destination
- Click directly on map for accurate coordinates

### Blog Posts
- Add hero images (16:9 ratio works best)
- Use headings to organize content
- Link to related destinations
- Preview before publishing

### Inline Editing
- Log in to admin first (required)
- Edit text directly on live site
- Changes save to all pages
- Refresh to see updates

### Media Library
- Organize with descriptive filenames
- Use search to find images quickly
- Copy URL with one click
- Delete unused files to save space

---

## 📱 Mobile Access

Admin dashboard works on mobile devices:
- Use tablet for best experience
- Map picker works with touch
- Image upload via camera
- All features accessible

---

## 🔄 Publishing Workflow

### For Destinations
1. Create as draft (unpublished)
2. Add all details
3. Upload image
4. Preview on map
5. Toggle "Published" on

### For Blog Posts
1. Write content
2. Add images
3. Link destinations
4. Set publish date
5. Save as draft
6. Review
7. Set publish date to NOW

---

## 💾 Storage Limits (Free Tier)

- **Database:** 500MB
- **Files:** 1GB
- **Bandwidth:** 50GB/month

**Your current usage:** Check Supabase dashboard

---

## ⚡ Performance Tips

- Optimize images before upload (use tinypng.com)
- Limit blog posts to 2000 words
- Archive old posts if needed
- Clean up unused media files

---

## 🎓 Training Resources

**5-Minute Quick Start:**
1. Read START_HERE.md
2. Create admin account
3. Login to dashboard
4. Add test destination
5. Enable inline editing

**Full Training (30 min):**
- Watch all admin pages
- Practice adding content
- Learn inline editing
- Upload test images

---

## ✅ Monthly Maintenance

Once a month:
- [ ] Review and update old blog posts
- [ ] Add seasonal destinations
- [ ] Update press quotes
- [ ] Clean up unused media
- [ ] Check for broken images
- [ ] Update static content as needed

---

## 🌟 Best Practices

1. **Always log out** when done
2. **Save frequently** while editing
3. **Preview before publishing**
4. **Use consistent image sizes**
5. **Write descriptive alt text**
6. **Test on mobile** after changes
7. **Keep this reference handy**

---

**Need more help?** Read the full guides in the documentation folder!

**Ready to start?** Go to `/admin/login.html` and begin managing your content!

---

**Version:** 1.0
**Last Updated:** October 26, 2025
**Status:** Production-Ready ✅
