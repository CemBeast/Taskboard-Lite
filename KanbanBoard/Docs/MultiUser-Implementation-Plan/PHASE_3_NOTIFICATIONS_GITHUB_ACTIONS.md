# Phase 3: Free Automated Notifications with GitHub Actions

**Goal:** Send automated reminders via Email, Discord, and Telegram when tasks approach their due dates - **100% FREE**

---

## 🎯 Objectives

- Set up GitHub Actions for automated task checking
- Integrate email notifications (SendGrid/Resend)
- Integrate Discord webhook notifications
- Integrate Telegram bot notifications
- Create scheduled workflow to check for upcoming tasks
- Allow users to configure notification preferences
- **Total Cost: $0/month** ✅

---

## 💡 Why GitHub Actions?

### Advantages:
- ✅ **Completely FREE** for public repositories
- ✅ **FREE** for private repos (2,000 minutes/month - more than enough)
- ✅ Scheduled workflows (cron jobs)
- ✅ Can call any external API
- ✅ No credit card required
- ✅ No billing setup needed
- ✅ Runs even when your computer is off

### How It Works:
1. GitHub Action runs every hour (scheduled)
2. Script connects to your Firestore database
3. Queries for tasks due within threshold
4. Sends notifications via SendGrid/Discord/Telegram
5. Updates task `notificationSent` flag

---

## 📋 Step-by-Step Implementation

### Step 3.1: Set Up Firebase Service Account

**Why:** GitHub Actions needs credentials to access your Firestore database

1. **Go to Firebase Console**
   - Project Settings (gear icon) → Service Accounts
   - Click "Generate new private key"
   - Save the JSON file securely

2. **Add to GitHub Secrets**
   - Go to your GitHub repository
   - Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Name: `FIREBASE_SERVICE_ACCOUNT`
   - Value: Paste the entire JSON content
   - Click "Add secret"

---

### Step 3.2: Get API Keys for Notification Services

#### SendGrid Setup (Email - FREE 100/day)

1. **Create Account**
   - Visit https://signup.sendgrid.com/
   - Verify your email

2. **Create API Key**
   - Settings → API Keys → Create API Key
   - Name: "GitHub Actions Notifications"
   - Permissions: Full Access (Mail Send)
   - Copy the key

3. **Add to GitHub Secrets**
   - Name: `SENDGRID_API_KEY`
   - Value: Your API key

4. **Configure Sender**
   - Settings → Sender Authentication
   - Verify your email address or domain
   - Note: `SENDGRID_FROM_EMAIL` (e.g., "noreply@yourdomain.com")

#### Discord Setup (FREE - Unlimited)

1. **Create Webhook** (each user does this for their own channel)
   - Open Discord → Server Settings
   - Integrations → Webhooks → New Webhook
   - Copy webhook URL

2. **Store in User Profile**
   - Users enter their webhook in app settings
   - Stored in Firestore: `users/{userId}/notificationPreferences/discordWebhook`

#### Telegram Setup (FREE - Unlimited)

1. **Create Bot**
   - Open Telegram → Search "@BotFather"
   - Send `/newbot`
   - Follow prompts
   - Copy bot token

2. **Add to GitHub Secrets**
   - Name: `TELEGRAM_BOT_TOKEN`
   - Value: Your bot token

3. **Get User Chat IDs**
   - Users start chat with bot
   - Visit: `https://api.telegram.org/bot<TOKEN>/getUpdates`
   - Find `chat.id` in response
   - Users enter this in app settings

---

### Step 3.3: Create Notification Script

**File:** `scripts/check-reminders.js` (new file in project root)

```javascript
const admin = require('firebase-admin');
const sgMail = require('@sendgrid/mail');
const axios = require('axios');

// Initialize Firebase Admin with service account
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Initialize SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// ===== MAIN FUNCTION =====
async function checkAndSendReminders() {
  console.log('🔔 Starting reminder check...');
  
  try {
    // Calculate tomorrow's date
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    
    console.log(`📅 Checking for tasks due on: ${tomorrowStr}`);
    
    // Query Firestore for tasks due tomorrow
    const tasksSnapshot = await db.collection('tasks')
      .where('dueDate', '==', tomorrowStr)
      .where('status', '!=', 'done')
      .where('notificationSent', '==', false)
      .get();
    
    console.log(`📊 Found ${tasksSnapshot.size} tasks requiring notifications`);
    
    // Process each task
    const promises = [];
    tasksSnapshot.forEach(doc => {
      promises.push(sendTaskReminder(doc.id, doc.data()));
    });
    
    await Promise.all(promises);
    console.log('✅ All reminders processed successfully');
    
  } catch (error) {
    console.error('❌ Error in reminder check:', error);
    process.exit(1); // Exit with error code for GitHub Actions
  }
}

// ===== SEND REMINDER FOR SINGLE TASK =====
async function sendTaskReminder(taskId, task) {
  console.log(`📤 Processing task: ${task.text}`);
  
  try {
    // Get user preferences
    const userDoc = await db.collection('users').doc(task.userId).get();
    
    if (!userDoc.exists) {
      console.log(`⚠️ User not found for task: ${taskId}`);
      return;
    }
    
    const user = userDoc.data();
    const prefs = user.notificationPreferences || {};
    
    // Send notifications based on user preferences
    const promises = [];
    
    if (prefs.email && prefs.emailAddress) {
      promises.push(sendEmailNotification(prefs.emailAddress, task));
    }
    
    if (prefs.discord && prefs.discordWebhook) {
      promises.push(sendDiscordNotification(prefs.discordWebhook, task));
    }
    
    if (prefs.telegram && prefs.telegramChatId) {
      promises.push(sendTelegramNotification(prefs.telegramChatId, task));
    }
    
    // Wait for all notifications to send
    await Promise.all(promises);
    
    // Mark task as notified
    await db.collection('tasks').doc(taskId).update({
      notificationSent: true,
      lastNotificationSent: admin.firestore.FieldValue.serverTimestamp()
    });
    
    console.log(`✅ Notifications sent for: ${task.text}`);
    
  } catch (error) {
    console.error(`❌ Error sending reminders for task ${taskId}:`, error);
    // Don't throw - continue with other tasks
  }
}

// ===== EMAIL NOTIFICATION =====
async function sendEmailNotification(email, task) {
  const msg = {
    to: email,
    from: process.env.SENDGRID_FROM_EMAIL,
    subject: `⏰ Task Due Tomorrow: ${task.text}`,
    text: `
Hi there!

This is a reminder that your task is due tomorrow:

📋 Task: ${task.text}
📅 Due Date: ${task.dueDate}
⚡ Priority: ${task.priority}
📊 Status: ${task.status}

Don't forget to complete it!

---
TaskBoard Lite - Your AI-Powered Task Manager
    `,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #6366f1;">⏰ Task Reminder</h2>
        <p>Hi there!</p>
        <p>This is a reminder that your task is due tomorrow:</p>
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>📋 Task:</strong> ${task.text}</p>
          <p><strong>📅 Due Date:</strong> ${task.dueDate}</p>
          <p><strong>⚡ Priority:</strong> <span style="color: ${getPriorityColor(task.priority)}">${task.priority}</span></p>
          <p><strong>📊 Status:</strong> ${task.status}</p>
        </div>
        <p>Don't forget to complete it!</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
        <p style="color: #6b7280; font-size: 12px;">TaskBoard Lite - Your AI-Powered Task Manager</p>
      </div>
    `
  };
  
  try {
    await sgMail.send(msg);
    console.log(`  ✉️ Email sent to ${email}`);
  } catch (error) {
    console.error(`  ❌ Email failed for ${email}:`, error.message);
  }
}

// ===== DISCORD NOTIFICATION =====
async function sendDiscordNotification(webhookUrl, task) {
  const embed = {
    title: '⏰ Task Reminder',
    description: `Your task **${task.text}** is due tomorrow!`,
    color: getPriorityColorHex(task.priority),
    fields: [
      {
        name: '📅 Due Date',
        value: task.dueDate,
        inline: true
      },
      {
        name: '⚡ Priority',
        value: task.priority,
        inline: true
      },
      {
        name: '📊 Status',
        value: task.status,
        inline: true
      }
    ],
    timestamp: new Date().toISOString(),
    footer: {
      text: 'TaskBoard Lite'
    }
  };
  
  try {
    await axios.post(webhookUrl, { embeds: [embed] });
    console.log('  💬 Discord notification sent');
  } catch (error) {
    console.error('  ❌ Discord failed:', error.message);
  }
}

// ===== TELEGRAM NOTIFICATION =====
async function sendTelegramNotification(chatId, task) {
  const message = `
⏰ *Task Reminder*

Your task is due tomorrow!

📋 *Task:* ${task.text}
📅 *Due Date:* ${task.dueDate}
⚡ *Priority:* ${task.priority}
📊 *Status:* ${task.status}

Don't forget to complete it!
  `;
  
  const url = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`;
  
  try {
    await axios.post(url, {
      chat_id: chatId,
      text: message,
      parse_mode: 'Markdown'
    });
    console.log('  📱 Telegram notification sent');
  } catch (error) {
    console.error('  ❌ Telegram failed:', error.message);
  }
}

// ===== HELPER FUNCTIONS =====
function getPriorityColor(priority) {
  switch (priority) {
    case 'High': return '#ef4444';
    case 'Medium': return '#f59e0b';
    case 'Low': return '#10b981';
    default: return '#6b7280';
  }
}

function getPriorityColorHex(priority) {
  switch (priority) {
    case 'High': return 0xef4444;
    case 'Medium': return 0xf59e0b;
    case 'Low': return 0x10b981;
    default: return 0x6b7280;
  }
}

// Run the main function
checkAndSendReminders()
  .then(() => {
    console.log('🎉 Reminder check completed successfully');
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });
```

---

### Step 3.4: Create package.json for Dependencies

**File:** `package.json` (update or create in project root)

```json
{
  "name": "taskboard-lite-notifications",
  "version": "1.0.0",
  "description": "Automated task notifications",
  "scripts": {
    "check-reminders": "node scripts/check-reminders.js"
  },
  "dependencies": {
    "firebase-admin": "^12.0.0",
    "@sendgrid/mail": "^8.1.0",
    "axios": "^1.6.0"
  }
}
```

---

### Step 3.5: Create GitHub Actions Workflow

**File:** `.github/workflows/check-reminders.yml`

```yaml
name: Check Task Reminders

on:
  schedule:
    # Runs every hour at minute 0
    - cron: '0 * * * *'
  
  # Allow manual trigger from Actions tab
  workflow_dispatch:

jobs:
  check-reminders:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm install
      
      - name: Run reminder check
        run: npm run check-reminders
        env:
          FIREBASE_SERVICE_ACCOUNT: ${{ secrets.FIREBASE_SERVICE_ACCOUNT }}
          SENDGRID_API_KEY: ${{ secrets.SENDGRID_API_KEY }}
          SENDGRID_FROM_EMAIL: ${{ secrets.SENDGRID_FROM_EMAIL }}
          TELEGRAM_BOT_TOKEN: ${{ secrets.TELEGRAM_BOT_TOKEN }}
      
      - name: Log completion
        if: success()
        run: echo "✅ Reminder check completed successfully"
      
      - name: Log failure
        if: failure()
        run: echo "❌ Reminder check failed"
```

**Cron Schedule Options:**
```yaml
# Every hour
- cron: '0 * * * *'

# Every 2 hours
- cron: '0 */2 * * *'

# Every day at 9 AM UTC
- cron: '0 9 * * *'

# Every day at 9 AM and 6 PM UTC
- cron: '0 9,18 * * *'
```

---

### Step 3.6: Add GitHub Secrets

**In your GitHub repository:**

Settings → Secrets and variables → Actions → New repository secret

**Add these secrets:**

1. **FIREBASE_SERVICE_ACCOUNT**
   - Value: Entire JSON content from Firebase service account key
   
2. **SENDGRID_API_KEY**
   - Value: Your SendGrid API key
   
3. **SENDGRID_FROM_EMAIL**
   - Value: Your verified sender email (e.g., "noreply@yourdomain.com")
   
4. **TELEGRAM_BOT_TOKEN**
   - Value: Your Telegram bot token

---

### Step 3.7: Add Settings UI for Notifications

**File:** `settings.html` (same as before, but simpler explanation)

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Notification Settings</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div class="container">
    <h1>🔔 Notification Settings</h1>
    <a href="index.html">← Back to Tasks</a>
    
    <div class="settings-section">
      <h2>Email Notifications</h2>
      <label>
        <input type="checkbox" id="email-enabled">
        Enable email notifications
      </label>
      <input type="email" id="email-address" placeholder="your@email.com">
      <p class="help-text">We'll email you 1 day before tasks are due</p>
    </div>
    
    <div class="settings-section">
      <h2>Discord Notifications</h2>
      <label>
        <input type="checkbox" id="discord-enabled">
        Enable Discord notifications
      </label>
      <input type="text" id="discord-webhook" placeholder="Discord Webhook URL">
      <a href="#" onclick="showDiscordHelp()">How to get webhook URL?</a>
    </div>
    
    <div class="settings-section">
      <h2>Telegram Notifications</h2>
      <label>
        <input type="checkbox" id="telegram-enabled">
        Enable Telegram notifications
      </label>
      <input type="text" id="telegram-chat-id" placeholder="Your Chat ID">
      <a href="#" onclick="showTelegramHelp()">How to get chat ID?</a>
    </div>
    
    <button onclick="saveSettings()">Save Settings</button>
  </div>

  <script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-auth-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore-compat.js"></script>
  <script src="firebase-config.js"></script>
  <script src="settings.js"></script>
</body>
</html>
```

**File:** `settings.js`

```javascript
let currentUser = null;

auth.onAuthStateChanged(async (user) => {
  if (user) {
    currentUser = user;
    await loadSettings();
  } else {
    window.location.href = 'auth.html';
  }
});

async function loadSettings() {
  const userDoc = await db.collection('users').doc(currentUser.uid).get();
  if (!userDoc.exists) return;
  
  const prefs = userDoc.data().notificationPreferences || {};
  
  document.getElementById('email-enabled').checked = prefs.email || false;
  document.getElementById('email-address').value = prefs.emailAddress || currentUser.email;
  document.getElementById('discord-enabled').checked = prefs.discord || false;
  document.getElementById('discord-webhook').value = prefs.discordWebhook || '';
  document.getElementById('telegram-enabled').checked = prefs.telegram || false;
  document.getElementById('telegram-chat-id').value = prefs.telegramChatId || '';
}

async function saveSettings() {
  const prefs = {
    email: document.getElementById('email-enabled').checked,
    emailAddress: document.getElementById('email-address').value,
    discord: document.getElementById('discord-enabled').checked,
    discordWebhook: document.getElementById('discord-webhook').value,
    telegram: document.getElementById('telegram-enabled').checked,
    telegramChatId: document.getElementById('telegram-chat-id').value
  };
  
  try {
    await db.collection('users').doc(currentUser.uid).update({
      notificationPreferences: prefs
    });
    alert('✅ Settings saved!');
  } catch (error) {
    console.error('Error saving settings:', error);
    alert('❌ Failed to save settings');
  }
}

function showDiscordHelp() {
  alert(`To get a Discord Webhook URL:
1. Open your Discord server
2. Server Settings → Integrations → Webhooks
3. Click "New Webhook"
4. Choose a channel and copy the webhook URL`);
}

function showTelegramHelp() {
  alert(`To get your Telegram Chat ID:
1. Start a chat with your bot
2. Send any message
3. Visit: https://api.telegram.org/bot<YOUR_TOKEN>/getUpdates
4. Find "chat":{"id":YOUR_CHAT_ID} in the response`);
}
```

---

### Step 3.8: Test the Workflow

#### Test Locally First:
```bash
# Install dependencies
npm install

# Set environment variables (temporarily)
export FIREBASE_SERVICE_ACCOUNT='{"type":"service_account",...}'
export SENDGRID_API_KEY='your-key'
export SENDGRID_FROM_EMAIL='noreply@yourdomain.com'
export TELEGRAM_BOT_TOKEN='your-token'

# Run the script
npm run check-reminders
```

#### Test on GitHub:
1. **Commit and push your changes**
   ```bash
   git add .
   git commit -m "Add automated notifications with GitHub Actions"
   git push
   ```

2. **Manual trigger**
   - Go to GitHub repository
   - Actions tab
   - Select "Check Task Reminders" workflow
   - Click "Run workflow" button
   - Select branch and run

3. **Check logs**
   - Click on the running workflow
   - View logs to see if it worked

---

## 🧪 Testing Checklist

- [ ] Firebase service account JSON added to GitHub secrets
- [ ] SendGrid API key configured
- [ ] Telegram bot token configured
- [ ] `scripts/check-reminders.js` created
- [ ] `.github/workflows/check-reminders.yml` created
- [ ] `package.json` updated with dependencies
- [ ] Pushed to GitHub
- [ ] Workflow appears in Actions tab
- [ ] Manual workflow run succeeds
- [ ] Test task created with due date tomorrow
- [ ] Notification received via email
- [ ] Notification received via Discord (if configured)
- [ ] Notification received via Telegram (if configured)
- [ ] Task marked as `notificationSent: true`
- [ ] No duplicate notifications sent

---

## 🚨 Common Issues & Solutions

### Issue: "Error: Cannot find module 'firebase-admin'"
**Solution:** Make sure `npm install` runs in the workflow before the script

### Issue: "Unauthorized: Firebase service account invalid"
**Solution:** Check that the entire JSON is in the secret, including curly braces

### Issue: "SendGrid 403 Forbidden"
**Solution:** Verify your sender email in SendGrid settings

### Issue: "Workflow doesn't run on schedule"
**Solution:** 
- Scheduled workflows only run on the default branch (usually `main`)
- GitHub Actions need to be enabled in repository settings
- First scheduled run happens after the workflow file is merged to default branch

### Issue: "Exceeding GitHub Actions minutes"
**Solution:** Don't worry - checking tasks takes < 1 minute, you have 2,000 minutes/month free

---

## 💰 Cost Breakdown

### GitHub Actions (FREE)
- ✅ **Public repos:** Unlimited minutes
- ✅ **Private repos:** 2,000 minutes/month free
- ✅ **Your usage:** ~720 minutes/month (1 min × 24 hours × 30 days)
- ✅ **Cost:** $0/month

### SendGrid (FREE)
- ✅ 100 emails/day free
- ✅ Cost: $0/month

### Discord (FREE)
- ✅ Unlimited webhooks
- ✅ Cost: $0/month

### Telegram (FREE)
- ✅ Unlimited messages
- ✅ Cost: $0/month

### Firebase Firestore (FREE TIER)
- ✅ 50K reads/day
- ✅ Your usage: ~720 reads/month (1 query × 24 hours × 30 days)
- ✅ Cost: $0/month

**TOTAL COST: $0/month** 🎉

---

## 📊 Success Metrics

By end of Phase 3, you should have:
- ✅ Automated hourly task checking
- ✅ Email notifications working
- ✅ Discord notifications working
- ✅ Telegram notifications working
- ✅ Users can configure their preferences
- ✅ No duplicate notifications
- ✅ **Everything running 100% free**

---

## 🎓 What You Learned

- GitHub Actions workflows and scheduling
- Firebase Admin SDK usage
- External API integration (SendGrid, Discord, Telegram)
- Secrets management in GitHub
- Serverless automation patterns
- **How to build production features for free!**

---

## 🔜 Next Steps

- Add notification logs to track delivery
- Allow users to customize reminder timing (1 day, 2 days, etc.)
- Add weekly summary emails
- Implement notification retry logic
- Add email templates with better styling

---

**Document Created:** Sprint 6  
**AI Assistant:** Claude Sonnet 4.5  
**Status:** Ready for Implementation  
**Cost:** $0/month Forever! 🎉

