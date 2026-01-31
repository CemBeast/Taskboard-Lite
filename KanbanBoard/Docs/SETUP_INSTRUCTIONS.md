# Setup Instructions

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd course-project-CemBeast/KanbanBoard
```

### 2. Set Up AI Agent (Required for AI features)

The AI agent file is not included in the repository for security reasons.

**Step-by-step:**

1. **Copy the template:**
   ```bash
   cp aiAgent.example.js aiAgent.js
   ```

2. **Get your free API key:**
   - Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Sign in with your Google account
   - Click "Create API Key"
   - Copy your API key

3. **Add your API key:**
   - Open `aiAgent.js`
   - Find line 6: `const GEMINI_API_KEY = 'YOUR_API_KEY_HERE';`
   - Replace `'YOUR_API_KEY_HERE'` with your actual API key
   - Save the file

4. **Update allowed domains (optional):**
   - Find line 10: `const ALLOWED_DOMAINS = [...]`
   - Add any additional domains where you'll host this app
   - Example: `['localhost', '127.0.0.1', 'myapp.github.io']`

### 3. Open the App

Simply open `index.html` in your web browser:

```bash
open index.html  # macOS
start index.html # Windows
xdg-open index.html # Linux
```

Or use a local server (recommended):

```bash
# Python 3
python3 -m http.server 8000

# Then visit: http://localhost:8000
```

## ✨ Features

- **AI Task Parsing:** Type natural language like "Buy groceries by tomorrow"
- **AI Reminders:** Get smart notifications about upcoming tasks
- **AI Reports:** Productivity insights and analysis
- **Priority Management:** Customizable thresholds
- **Dashboard:** Real-time statistics

## 🔧 Configuration

### Enable/Disable AI

In `app.js`, line 2:

```javascript
const USE_AI = true;  // Set to false to use rule-based NLP instead
```

### Adjust Priority Thresholds

Click on the numbers at the bottom of the page to edit:
- High Priority: ≤ X days
- Medium Priority: ≤ Y days
- Low Priority: > Y days

## 📝 Important Notes

**Security:**
- Never commit `aiAgent.js` with your actual API key
- The `.gitignore` is already configured to ignore it
- For production use, set up API key restrictions in [Google Cloud Console](https://console.cloud.google.com/apis/credentials)

**Free Tier Limits:**
- 15 requests per minute
- 1,500 requests per day
- No credit card required

## 🐛 Troubleshooting

### "API key not valid"
- Make sure you copied the entire key without extra spaces
- Check that you replaced the placeholder in `aiAgent.js`
- Generate a new key if needed

### AI features not working
- Check browser console (F12) for error messages
- Verify `aiAgent.js` exists (not just `aiAgent.example.js`)
- Make sure `USE_AI = true` in `app.js`

### "Domain not authorized"
- Add your domain to `ALLOWED_DOMAINS` in `aiAgent.js`
- For local development, use `localhost` or `127.0.0.1`

## 📚 Documentation

- [AI_SETUP.md](AI_SETUP.md) - Detailed AI setup guide
- [SECURITY.md](SECURITY.md) - Security best practices
- [AIAgent_Features.md](AIAgent_Features.md) - Feature documentation

## 🤝 Contributing

If you're sharing this project:
1. Never commit your actual `aiAgent.js` file
2. Update `aiAgent.example.js` with any new features
3. Test with `USE_AI = false` to ensure NLP fallback works

---

**Need help?** Open an issue or check the documentation files!

