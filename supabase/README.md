# Supabase Setup Guide - Luxury Travel Sweden

## 🎯 Overview

This guide will walk you through setting up Supabase as the backend for your luxury travel website.

**What you'll set up:**
- PostgreSQL database with all tables
- Row Level Security (RLS) for data protection
- Authentication for admin users
- Storage bucket for media uploads
- API keys for frontend connection

**Time required:** ~20 minutes

---

## 📋 Prerequisites

- Email address for Supabase account
- Admin email for first user account

---

## Step 1: Create Supabase Project

### 1.1 Sign Up

1. Go to [https://supabase.com](https://supabase.com)
2. Click **"Start your project"**
3. Sign up with GitHub, Google, or email
4. Verify your email

### 1.2 Create New Project

1. Click **"New Project"**
2. Choose your organization (or create one)
3. Fill in project details:
   - **Name:** `luxury-travel-sweden`
   - **Database Password:** Generate a strong password (save this!)
   - **Region:** Choose closest to your users (e.g., `West EU (London)` or `US East (N. Virginia)`)
   - **Pricing Plan:** Free (perfect for your needs)
4. Click **"Create new project"**
5. Wait ~2 minutes for project to initialize

---

## Step 2: Run Database Migrations

### 2.1 Open SQL Editor

1. In your Supabase dashboard, click **"SQL Editor"** in the left sidebar
2. Click **"New query"**

### 2.2 Create Schema

1. Open the file `schema.sql` from this folder
2. Copy the entire contents
3. Paste into the SQL Editor
4. Click **"Run"** (or press Cmd+Enter / Ctrl+Enter)
5. You should see success messages in the Results panel

**Expected output:**
```
✅ Luxury Travel Sweden schema created successfully!

Tables created:
- themes
- destinations
- blog_posts
- stories
- static_content
- press_quotes
- media
```

### 2.3 Seed Initial Data

1. Click **"New query"** again
2. Open the file `seed.sql` from this folder
3. Copy the entire contents
4. Paste into the SQL Editor
5. Click **"Run"**

**Expected output:**
```
✅ Seed data inserted successfully!

Summary:
- 6 themes created
- 18 destinations created
- 12 static content keys created
```

---

## Step 3: Verify Tables Created

1. Click **"Table Editor"** in the left sidebar
2. You should see all tables listed:
   - themes (6 rows)
   - destinations (18 rows)
   - blog_posts (0 rows - ready for content)
   - stories (0 rows - ready for content)
   - static_content (12 rows)
   - press_quotes (3 rows)
   - media (0 rows - ready for uploads)

3. Click on **destinations** table
4. Verify you see all 18 destinations (Stockholm, Gothenburg, Lapland, etc.)

---

## Step 4: Configure Storage for Media Uploads

### 4.1 Create Storage Bucket

1. Click **"Storage"** in the left sidebar
2. Click **"Create a new bucket"**
3. Fill in details:
   - **Name:** `media`
   - **Public bucket:** ✅ **Check this!** (images need to be publicly accessible)
   - **Allowed MIME types:** Leave empty (allow all)
   - **File size limit:** 10 MB (or your preference)
4. Click **"Create bucket"**

### 4.2 Configure Bucket Policies

1. Click on the **"media"** bucket
2. Click **"Policies"** tab
3. Click **"New policy"**
4. Select template: **"Allow public access to files in a bucket"**
5. Review the policy (should allow SELECT for everyone)
6. Click **"Review"** then **"Save policy"**

**Alternatively, use this SQL policy:**
```sql
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'media' );

CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'media' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can update"
ON storage.objects FOR UPDATE
USING ( bucket_id = 'media' AND auth.role() = 'authenticated' );

CREATE POLICY "Authenticated users can delete"
ON storage.objects FOR DELETE
USING ( bucket_id = 'media' AND auth.role() = 'authenticated' );
```

---

## Step 5: Get API Credentials

### 5.1 Get Project URL and Keys

1. Click **"Settings"** (gear icon) in the left sidebar
2. Click **"API"** under Project Settings
3. Copy these values (you'll need them for your frontend):

**Copy these:**
```
Project URL: https://YOUR_PROJECT_ID.supabase.co
anon (public) key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

⚠️ **IMPORTANT:**
- `anon key` - Safe to use in frontend (public)
- `service_role key` - **NEVER expose in frontend!** (admin only)

### 5.2 Save Credentials

Create a file `.env.local` in your project root (don't commit this!):

```bash
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Or if not using a build tool, update `supabase-client.js` directly (see Step 7).

---

## Step 6: Create Admin User

### 6.1 Enable Email Auth

1. Go to **Authentication** → **Providers**
2. Ensure **Email** is enabled (should be by default)
3. Configure email settings if needed (or use Supabase defaults)

### 6.2 Create First Admin User

**Option A: Via Dashboard (Recommended)**

1. Go to **Authentication** → **Users**
2. Click **"Add user"** → **"Create new user"**
3. Fill in:
   - **Email:** your-admin-email@example.com
   - **Password:** Create a strong password
   - **Auto Confirm User:** ✅ **Check this!**
4. Click **"Create user"**

**Option B: Via SQL**

```sql
-- In SQL Editor
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'your-email@example.com',
  crypt('your-password-here', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
);
```

---

## Step 7: Test Database Connection

### 7.1 Test from Browser Console

Open your browser console and paste:

```javascript
// Replace with your actual credentials
const SUPABASE_URL = 'https://YOUR_PROJECT_ID.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key-here';

// Load Supabase client
const script = document.createElement('script');
script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
script.onload = async () => {
  const { createClient } = supabase;
  const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // Test: Fetch themes
  const { data, error } = await client
    .from('themes')
    .select('*');

  if (error) {
    console.error('❌ Error:', error);
  } else {
    console.log('✅ Success! Themes:', data);
  }

  // Test: Fetch destinations
  const { data: destinations } = await client
    .from('destinations')
    .select('*');

  console.log('✅ Destinations:', destinations);
};
document.head.appendChild(script);
```

You should see:
```
✅ Success! Themes: Array(6)
✅ Destinations: Array(18)
```

---

## Step 8: Verify Row Level Security

### 8.1 Test Public Access

```javascript
// Public should be able to READ published destinations
const { data, error } = await supabaseClient
  .from('destinations')
  .select('*');

console.log('Public can read:', data.length, 'destinations');
// Should return 18 destinations
```

### 8.2 Test Protected Access

```javascript
// Public should NOT be able to INSERT
const { data, error } = await supabaseClient
  .from('destinations')
  .insert({ title: 'Test', slug: 'test' });

console.log('Error (expected):', error);
// Should return: "new row violates row-level security policy"
```

### 8.3 Test Authenticated Access

```javascript
// Login as admin
const { data: { user }, error: authError } = await supabaseClient.auth.signInWithPassword({
  email: 'your-admin@example.com',
  password: 'your-password'
});

console.log('Logged in as:', user.email);

// Now try inserting
const { data, error } = await supabaseClient
  .from('destinations')
  .insert({
    slug: 'test-destination',
    title: 'Test Destination',
    description: 'Test',
    latitude: 59.3293,
    longitude: 18.0686,
    category: 'city',
    seasons: ['Summer'],
    theme_ids: []
  });

console.log('Insert result:', data);
// Should succeed!

// Clean up
await supabaseClient.from('destinations').delete().eq('slug', 'test-destination');
```

---

## Step 9: Configure Realtime (Optional)

If you want real-time updates (e.g., when admin adds destination, it appears on map immediately):

1. Go to **Database** → **Replication**
2. Find the tables you want to enable realtime for:
   - destinations
   - blog_posts
   - stories
   - static_content
3. Toggle **"Realtime"** to ON for each

---

## Step 10: Database Maintenance (Optional but Recommended)

### Enable Point-in-Time Recovery (PITR)

For production, enable automatic backups:

1. Go to **Settings** → **Database**
2. Scroll to **"Point-in-time Recovery"**
3. Click **"Enable PITR"** (requires paid plan, but highly recommended for production)

### Set up Database Backups

Free tier includes:
- Daily backups (kept for 7 days)
- Point-in-time recovery (paid plans)

---

## 📊 Summary Checklist

Before moving to frontend integration:

- [ ] Supabase project created
- [ ] Database schema created (`schema.sql` executed)
- [ ] Seed data loaded (`seed.sql` executed)
- [ ] All 7 tables visible in Table Editor
- [ ] 6 themes and 18 destinations visible in data
- [ ] Storage bucket "media" created and set to public
- [ ] API credentials copied (Project URL + anon key)
- [ ] Admin user account created
- [ ] Test connection successful (themes/destinations fetched)
- [ ] RLS policies verified (public can read, auth can write)

---

## 🔑 Important Credentials Summary

**Save these somewhere secure:**

```
Project URL: https://YOUR_PROJECT_ID.supabase.co
Anon Key: eyJhbGc...
Service Role Key: eyJhbGc... (NEVER expose publicly!)

Admin Email: your-admin@example.com
Admin Password: [your password]

Database Password: [generated password from setup]
```

---

## 🆘 Troubleshooting

### Problem: Schema.sql fails to run

**Solution:**
- Make sure you're in a new, empty project
- If tables already exist, drop them first:
  ```sql
  DROP TABLE IF EXISTS media CASCADE;
  DROP TABLE IF EXISTS press_quotes CASCADE;
  DROP TABLE IF EXISTS static_content CASCADE;
  DROP TABLE IF EXISTS stories CASCADE;
  DROP TABLE IF EXISTS blog_posts CASCADE;
  DROP TABLE IF EXISTS destinations CASCADE;
  DROP TABLE IF EXISTS themes CASCADE;
  ```

### Problem: Can't insert destinations (permission denied)

**Solution:**
- Verify RLS policies exist: `SELECT * FROM pg_policies WHERE tablename = 'destinations';`
- Make sure you're authenticated before trying to insert
- Check user role: `SELECT auth.role();` should return `'authenticated'`

### Problem: Images won't upload to Storage

**Solution:**
- Verify bucket is set to **public**
- Check Storage policies allow INSERT for authenticated users
- Verify file size under limit

### Problem: Can't log in with admin account

**Solution:**
- Check user exists: Go to Authentication → Users
- Verify email is confirmed (email_confirmed_at is set)
- Try password reset if needed

---

## 🚀 Next Steps

Once Supabase is set up:

1. ✅ Update `supabase-client.js` with your credentials
2. ✅ Test frontend connection
3. ✅ Build admin dashboard
4. ✅ Integrate with existing map
5. ✅ Add inline editing

Continue to the main README for frontend integration instructions!

---

## 📞 Support

- **Supabase Docs:** [https://supabase.com/docs](https://supabase.com/docs)
- **Discord Community:** [https://discord.supabase.com](https://discord.supabase.com)
- **Status Page:** [https://status.supabase.com](https://status.supabase.com)

---

**Setup complete!** 🎉 Your Supabase backend is ready for the admin dashboard and frontend integration.
