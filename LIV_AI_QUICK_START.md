# LIV AI Quick Start

Get your AI-powered concierge running in **5 simple steps**:

## 1️⃣ Get OpenAI API Key
1. Visit [platform.openai.com](https://platform.openai.com)
2. Create account or log in
3. Go to **API Keys** → **Create new secret key**
4. Copy the key (starts with `sk-...`)

**Cost**: ~$0.06 per conversation with GPT-4o

---

## 2️⃣ Install Supabase CLI

**macOS:**
```bash
brew install supabase/tap/supabase
```

**Windows:**
```powershell
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

---

## 3️⃣ Link & Configure

```bash
cd /Users/paulgosnell/Sites/luxury-travel-sweden

# Link to your Supabase project
supabase link --project-ref fjnfsabvuiyzuzfhxzcc

# Set your OpenAI key
supabase secrets set OPENAI_API_KEY=sk-your-actual-key-here
```

---

## 4️⃣ Deploy Edge Function

```bash
supabase functions deploy liv-chat
```

You should see: ✅ **Deployed function liv-chat**

---

## 5️⃣ Enable CORS

1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/fjnfsabvuiyzuzfhxzcc)
2. **Settings** → **API** → **CORS Configuration**
3. Add your domain(s):
   - `http://localhost:3000` (testing)
   - `https://yourdomain.com` (production)
   - Or `*` (allow all - easier for testing)

---

## ✅ Test It!

1. Open your website
2. Click a map marker (e.g., Stockholm)
3. Click "Design Journey with LIV"
4. LIV should greet you with context: *"I see Stockholm has caught your eye..."*
5. Type a message and watch AI respond in real-time!

---

## 🐛 Troubleshooting

**"Failed to fetch"**
```bash
# Check function is deployed
supabase functions list

# View logs
supabase functions logs liv-chat
```

**"401 Unauthorized"**
```bash
# Verify secret is set
supabase secrets list

# Redeploy
supabase functions deploy liv-chat
```

**"CORS error"**
- Add your domain to CORS settings (Step 5)
- Clear browser cache

---

## 📊 Monitor Usage

**OpenAI costs:**
[platform.openai.com/usage](https://platform.openai.com/usage)

**Edge Function logs:**
```bash
supabase functions logs liv-chat --tail
```

**Supabase dashboard:**
[supabase.com/dashboard/project/fjnfsabvuiyzuzfhxzcc/functions](https://supabase.com/dashboard/project/fjnfsabvuiyzuzfhxzcc/functions)

---

## 🎨 Customize LIV

Edit personality/tone:
1. Open `supabase/functions/liv-chat/index.ts`
2. Find `buildSystemPrompt` function
3. Modify the prompt text
4. Redeploy: `supabase functions deploy liv-chat`

---

**Full documentation**: See [LIV_AI_SETUP.md](LIV_AI_SETUP.md)
