# API Key Security Guide

## ⚠️ Current Risk Assessment

### Free Tier (No Billing)
Your Gemini API key on the free tier **CANNOT incur costs** because:
- ✅ No credit card required
- ✅ No billing enabled
- ✅ Hard limits: 15 req/min, 1,500 req/day

### What Someone Could Do With Your Key:
- Use up your daily quota (annoying, but not costly)
- Use it for their own projects
- Get your key rate-limited if they spam requests
- **Cannot charge you money** (free tier)

### If You Upgrade to Paid:
- ⚠️ **YES, they could incur costs!**
- This is why production apps need proper security

## 🛡️ Security Measures Implemented

### 1. Domain Restriction (Basic)
The code now checks if it's running on allowed domains:

```javascript
const ALLOWED_DOMAINS = ['localhost', '127.0.0.1', 'your-github-pages-domain.github.io'];
```

**To update:** Add your actual domain(s) to this list in `aiAgent.js`

**Note:** This is client-side only, so it can be bypassed by someone with technical skills.

### 2. Google Cloud Console Restrictions (Recommended)

Set up **API key restrictions** in Google Cloud:

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Find your API key
3. Click "Edit API key"
4. Under "Application restrictions":
   - **HTTP referrers:** Add your website URL(s)
     - `http://localhost:*/*` (for development)
     - `https://yourdomain.com/*` (for production)
5. Under "API restrictions":
   - Select "Restrict key"
   - Only enable "Generative Language API"
6. Save

This prevents your key from working on other websites!

## 🔒 Best Practices

### For School Projects / Personal Use:
✅ **Current setup is fine** - just add domain restrictions in Google Cloud
✅ Use the free tier (no costs possible)
✅ Don't commit the key to public GitHub (use `.gitignore`)

### For Production / Public Websites:
You need a **backend proxy**. Here's why:

**Problem:** API keys in frontend code can always be extracted
**Solution:** Hide the key on a backend server

## 🏗️ Production Setup (Backend Proxy)

If you want to make this truly secure for a public website:

### Option 1: Simple Backend (Node.js + Express)

Create a backend server that holds your API key:

```javascript
// backend/server.js
const express = require('express');
const app = express();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY; // Store in environment variable

app.post('/api/parse-task', async (req, res) => {
  const { taskText } = req.body;
  
  // Call Gemini API with YOUR key (hidden from client)
  const response = await fetch(geminiURL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({...})
  });
  
  res.json(await response.json());
});

app.listen(3000);
```

Then your frontend calls YOUR server instead of Gemini directly:

```javascript
// frontend
async function parseTaskWithAI(taskText) {
  const response = await fetch('/api/parse-task', {
    method: 'POST',
    body: JSON.stringify({ taskText })
  });
  return await response.json();
}
```

### Option 2: Serverless Functions (Free)
- **Vercel Functions**
- **Netlify Functions**  
- **Cloudflare Workers**

All have free tiers and can hide your API key.

## 📁 Protecting Your Key in Git

### Step 1: Create `.gitignore`
Add this to your `.gitignore` file:

```
aiAgent.js
.env
config.js
```

### Step 2: Create a Template
Rename `aiAgent.js` to `aiAgent.example.js` and replace key with placeholder:

```javascript
const GEMINI_API_KEY = 'YOUR_API_KEY_HERE';
```

Commit the example, not the actual key.

### Step 3: Add Instructions
Tell others to:
1. Copy `aiAgent.example.js` to `aiAgent.js`
2. Add their own API key

## 🎯 Summary

### Current Setup (School Project):
- **Safe for free tier** - no costs possible
- **Risk:** Quota abuse only
- **Mitigation:** Domain restrictions in Google Cloud Console

### For Public Production:
- **Need:** Backend proxy to hide API key
- **Why:** Anyone can extract keys from frontend code
- **How:** Use serverless functions or Node.js backend

## 🔗 Resources

- [Google Cloud API Key Best Practices](https://cloud.google.com/docs/authentication/api-keys)
- [Restrict API Keys](https://console.cloud.google.com/apis/credentials)
- [Vercel Serverless Functions](https://vercel.com/docs/functions)
- [Netlify Functions](https://www.netlify.com/products/functions/)

---

**For your class project:** The current setup with domain restrictions is perfectly fine! 

**For a real product:** Implement a backend proxy before launch.

