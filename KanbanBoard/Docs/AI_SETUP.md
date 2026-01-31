# AI Agent Setup Guide

This Kanban board now uses **Google Gemini AI** for intelligent task parsing, notifications, and reporting!

## 🚀 Quick Setup (5 minutes)

### Step 1: Get Your Free API Key

1. Go to **[Google AI Studio](https://makersuite.google.com/app/apikey)**
2. Sign in with your Google account
3. Click **"Create API Key"**
4. Copy your API key

### Step 2: Add API Key to Project

Open `aiAgent.js` and replace the placeholder:

```javascript
const GEMINI_API_KEY = 'YOUR_API_KEY_HERE'; // Replace with your actual key
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
```

**Note:** We use `gemini-1.5-flash` (the latest fast model). If you want more accuracy, you can change it to `gemini-1.5-pro`.

### Step 3: Enable/Disable AI

In `app.js`, at the top:

```javascript
const USE_AI = true;  // Set to true for AI, false for NLP rules
```

## ✨ What the AI Does

### 1. **Task Parsing**
The AI understands natural language like:
- "Buy groceries by tomorrow"
- "Finish project report due next Friday"
- "Call mom this weekend"
- "Submit assignment in 3 days"

It extracts:
- ✅ Due date (in YYYY-MM-DD format)
- ✅ Priority (High/Medium/Low)
- ✅ Clean task text (removes date phrases)

### 2. **Notifications** (Future)
Generate smart reminders:
```javascript
const message = await generateNotification(upcomingTasks);
// "You have 3 urgent tasks today! Focus on 'Finish project report' first..."
```

### 3. **Reports** (Future)
Generate productivity insights:
```javascript
const report = await generateReport(dashboardStats);
// "Great progress! You've completed 15 tasks with an average of 2.3 days..."
```

## 📊 Free Tier Limits

- **15 requests per minute**
- **1,500 requests per day**
- **No credit card required**

For a personal Kanban board, this is more than enough!

## 🔧 Troubleshooting

### "API key not valid"
- Make sure you copied the entire key
- Check for extra spaces or quotes
- Generate a new key if needed

### "Quota exceeded"
- You've hit the free tier limit
- Wait a minute or try the next day
- Consider caching results

### AI not working / Using NLP instead
- Check `USE_AI = true` in `app.js`
- Open browser console (F12) to see errors
- Verify `aiAgent.js` is loaded before `app.js` in `index.html`

## 🛡️ Security Note

**Important:** Your API key is visible in the code. For production apps:
1. Use a backend server to hide the key
2. Set up API key restrictions in Google Cloud Console
3. Only allow your domain to use the key

For a school project / personal use, this is fine!

## 🎯 Next Steps

### Add Notification Agent
Create a button to generate AI notifications:

```javascript
// Add this to your HTML
<button onclick="showAINotification()">Get AI Reminder</button>

// Add this to app.js
async function showAINotification() {
  const upcoming = getSoonestTasks();
  const message = await generateNotification(upcoming);
  alert(message);
}
```

### Add Report Agent
Generate weekly reports:

```javascript
async function showAIReport() {
  const stats = {
    total: tasks.length,
    todo: tasks.filter(t => t.status === 'todo').length,
    progress: tasks.filter(t => t.status === 'progress').length,
    done: tasks.filter(t => t.status === 'done').length,
    overdue: countOverdueTasks(),
    avgCompletion: calcAvgCompletionDays()
  };
  const report = await generateReport(stats);
  alert(report);
}
```

## 📚 Resources

- [Gemini API Documentation](https://ai.google.dev/docs)
- [API Key Management](https://makersuite.google.com/app/apikey)
- [Gemini Pricing](https://ai.google.dev/pricing) (Free tier info)

---

**Need help?** Check the browser console (F12) for error messages!

