# Phase 3: Notification System Setup

**Goal:** Send automated reminders via Email, Discord, and Telegram when tasks approach their due dates.

---

## 🎯 Objectives

- Set up Cloud Functions for backend automation
- Integrate email notifications (SendGrid/Resend)
- Integrate Discord webhook notifications
- Integrate Telegram bot notifications
- Create scheduled job to check for upcoming tasks
- Allow users to configure notification preferences

---

## 📋 Step-by-Step Implementation

### Step 3.1: Enable Firebase Cloud Functions

**Why Cloud Functions:**
- Run backend code without managing servers
- Scheduled tasks (check for due dates every hour)
- Secure API key storage
- Triggered by Firestore changes or time schedules

**Setup:**

1. **Install Firebase CLI**
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**
   ```bash
   firebase login
   ```

3. **Initialize Cloud Functions**
   ```bash
   cd KanbanBoard
   firebase init functions
   ```
   - Select your Firebase project
   - Choose JavaScript or TypeScript
   - Install dependencies: Yes
   - Creates `functions/` directory

---

### Step 3.2: Email Notification Setup

**Option A: SendGrid (Recommended)**

1. **Create SendGrid Account**
   - Visit https://signup.sendgrid.com/
   - Free tier: 100 emails/day
   - Verify your email and domain

2. **Get API Key**
   - Settings → API Keys → Create API Key
   - Name: "TaskBoard Notifications"
   - Permissions: Full Access (Mail Send)
   - Copy API key

3. **Store API Key in Firebase**
   ```bash
   firebase functions:config:set sendgrid.key="YOUR_API_KEY"
   firebase functions:config:set sendgrid.from="noreply@yourdomain.com"
   ```

**Option B: Resend (Alternative)**
- Visit https://resend.com/
- Free tier: 3,000 emails/month
- Better deliverability, modern API
- Similar setup process

**Install Dependencies:**
```bash
cd functions
npm install @sendgrid/mail
```

---

### Step 3.3: Discord Notification Setup

1. **Create Discord Webhook**
   - Open Discord server
   - Server Settings → Integrations → Webhooks
   - Create Webhook
   - Name: "TaskBoard Notifications"
   - Choose channel
   - Copy Webhook URL

2. **Store Webhook URL**
   ```bash
   firebase functions:config:set discord.webhook="YOUR_WEBHOOK_URL"
   ```

**Add to User Profile:**
```javascript
// In database.js, update user profile structure
notificationPreferences: {
  email: false,
  emailAddress: "user@example.com",
  discord: false,
  discordWebhook: "https://discord.com/api/webhooks/...",
  telegram: false,
  telegramChatId: "123456789",
  reminderThreshold: 1 // days before due date
}
```

---

### Step 3.4: Telegram Notification Setup

1. **Create Telegram Bot**
   - Open Telegram app
   - Search for "@BotFather"
   - Send `/newbot`
   - Choose name: "TaskBoard Reminder Bot"
   - Choose username: "taskboard_reminder_bot"
   - Copy bot token

2. **Store Bot Token**
   ```bash
   firebase functions:config:set telegram.token="YOUR_BOT_TOKEN"
   ```

3. **Get Chat ID**
   - Send a message to your bot
   - Visit: `https://api.telegram.org/bot<YOUR_TOKEN>/getUpdates`
   - Find `"chat":{"id":123456789}` in response
   - Users will provide this ID in settings

**Install Telegram Library:**
```bash
cd functions
npm install node-telegram-bot-api
```

---

### Step 3.5: Create Cloud Function for Reminders

**File:** `functions/index.js`

```javascript
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const sgMail = require('@sendgrid/mail');
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

admin.initializeApp();
const db = admin.firestore();

// Initialize SendGrid
sgMail.setApiKey(functions.config().sendgrid.key);

// Initialize Telegram Bot
const telegramBot = new TelegramBot(functions.config().telegram.token);

// ===== SCHEDULED REMINDER CHECK =====
// Runs every hour to check for tasks approaching due dates

exports.checkTaskReminders = functions.pubsub
  .schedule('every 1 hours')
  .timeZone('America/Los_Angeles') // Set your timezone
  .onRun(async (context) => {
    console.log('🔔 Running scheduled reminder check...');
    
    try {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];
      
      // Find tasks due within threshold and not yet notified
      const tasksSnapshot = await db.collection('tasks')
        .where('dueDate', '==', tomorrowStr)
        .where('status', '!=', 'done')
        .where('notificationSent', '==', false)
        .get();
      
      console.log(`📊 Found ${tasksSnapshot.size} tasks due tomorrow`);
      
      // Process each task
      const promises = [];
      tasksSnapshot.forEach(doc => {
        promises.push(sendTaskReminder(doc.id, doc.data()));
      });
      
      await Promise.all(promises);
      console.log('✅ Reminder check complete');
      
    } catch (error) {
      console.error('❌ Error checking reminders:', error);
    }
  });

// ===== SEND REMINDER FUNCTION =====

async function sendTaskReminder(taskId, task) {
  console.log(`📤 Sending reminder for task: ${task.text}`);
  
  try {
    // Get user preferences
    const userDoc = await db.collection('users').doc(task.userId).get();
    if (!userDoc.exists) {
      console.log('⚠️ User not found:', task.userId);
      return;
    }
    
    const user = userDoc.data();
    const prefs = user.notificationPreferences || {};
    
    // Send notifications based on preferences
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
    
    await Promise.all(promises);
    
    // Mark task as notified
    await db.collection('tasks').doc(taskId).update({
      notificationSent: true,
      lastNotificationSent: admin.firestore.FieldValue.serverTimestamp()
    });
    
    console.log(`✅ Reminders sent for task: ${task.text}`);
    
  } catch (error) {
    console.error(`❌ Error sending reminders for task ${taskId}:`, error);
  }
}

// ===== EMAIL NOTIFICATION =====

async function sendEmailNotification(email, task) {
  const msg = {
    to: email,
    from: functions.config().sendgrid.from,
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
    console.log(`✉️ Email sent to ${email}`);
  } catch (error) {
    console.error(`❌ Email send failed:`, error);
    throw error;
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
    await axios.post(webhookUrl, {
      embeds: [embed]
    });
    console.log('💬 Discord notification sent');
  } catch (error) {
    console.error('❌ Discord send failed:', error);
    throw error;
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
  
  try {
    await telegramBot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
    console.log('📱 Telegram notification sent');
  } catch (error) {
    console.error('❌ Telegram send failed:', error);
    throw error;
  }
}

// ===== HELPER FUNCTIONS =====

function getPriorityColor(priority) {
  switch (priority) {
    case 'High': return '#ef4444'; // red
    case 'Medium': return '#f59e0b'; // yellow
    case 'Low': return '#10b981'; // green
    default: return '#6b7280'; // gray
  }
}

function getPriorityColorHex(priority) {
  switch (priority) {
    case 'High': return 0xef4444; // red
    case 'Medium': return 0xf59e0b; // yellow
    case 'Low': return 0x10b981; // green
    default: return 0x6b7280; // gray
  }
}
```

---

### Step 3.6: Add Settings UI for Notifications

**File:** `settings.html` (new file)

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Notification Settings - TaskBoard</title>
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
      <input type="text" id="telegram-chat-id" placeholder="Telegram Chat ID">
      <a href="#" onclick="showTelegramHelp()">How to get chat ID?</a>
    </div>
    
    <div class="settings-section">
      <h2>Reminder Timing</h2>
      <label>
        Send reminders
        <select id="reminder-threshold">
          <option value="0">On due date</option>
          <option value="1" selected>1 day before</option>
          <option value="2">2 days before</option>
          <option value="3">3 days before</option>
          <option value="7">1 week before</option>
        </select>
        due date
      </label>
    </div>
    
    <button onclick="saveSettings()">Save Settings</button>
    <button onclick="testNotifications()">Test Notifications</button>
  </div>

  <script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-auth-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore-compat.js"></script>
  <script src="firebase-config.js"></script>
  <script src="settings.js"></script>
</body>
</html>
```

**File:** `settings.js` (new file)

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
  document.getElementById('email-address').value = prefs.emailAddress || '';
  document.getElementById('discord-enabled').checked = prefs.discord || false;
  document.getElementById('discord-webhook').value = prefs.discordWebhook || '';
  document.getElementById('telegram-enabled').checked = prefs.telegram || false;
  document.getElementById('telegram-chat-id').value = prefs.telegramChatId || '';
  document.getElementById('reminder-threshold').value = prefs.reminderThreshold || 1;
}

async function saveSettings() {
  const prefs = {
    email: document.getElementById('email-enabled').checked,
    emailAddress: document.getElementById('email-address').value,
    discord: document.getElementById('discord-enabled').checked,
    discordWebhook: document.getElementById('discord-webhook').value,
    telegram: document.getElementById('telegram-enabled').checked,
    telegramChatId: document.getElementById('telegram-chat-id').value,
    reminderThreshold: parseInt(document.getElementById('reminder-threshold').value)
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

async function testNotifications() {
  // Create a test task to trigger notification
  alert('🧪 Test notification will be sent to enabled channels');
  // Implement test notification logic
}

function showDiscordHelp() {
  alert(`
To get a Discord Webhook URL:
1. Open your Discord server
2. Server Settings → Integrations → Webhooks
3. Click "New Webhook"
4. Choose a channel and copy the webhook URL
  `);
}

function showTelegramHelp() {
  alert(`
To get your Telegram Chat ID:
1. Start a chat with @BotFather
2. Create a new bot with /newbot
3. Send a message to your bot
4. Visit: https://api.telegram.org/bot<TOKEN>/getUpdates
5. Find "chat":{"id":YOUR_CHAT_ID}
  `);
}
```

---

### Step 3.7: Deploy Cloud Functions

```bash
# Deploy all functions
firebase deploy --only functions

# Deploy specific function
firebase deploy --only functions:checkTaskReminders

# View logs
firebase functions:log
```

---

## 🧪 Testing Checklist

- [ ] Cloud Functions project initialized
- [ ] SendGrid/Resend API key configured
- [ ] Discord webhook created and stored
- [ ] Telegram bot created and token stored
- [ ] Cloud Function code written and tested locally
- [ ] Settings UI created for user preferences
- [ ] Users can configure notification channels
- [ ] Scheduled function runs every hour
- [ ] Email notifications send successfully
- [ ] Discord notifications post to correct channel
- [ ] Telegram messages send to user
- [ ] Tasks marked as `notificationSent` after reminder
- [ ] No duplicate notifications sent

---

## 🚨 Common Issues & Solutions

### Issue: "Cloud Functions not deploying"
**Solution:** Ensure Firebase CLI is latest version: `npm install -g firebase-tools`

### Issue: "SendGrid API error 403"
**Solution:** Verify sender email domain, complete sender authentication in SendGrid

### Issue: "Discord webhook invalid"
**Solution:** Check webhook URL format, ensure webhook wasn't deleted in Discord

### Issue: "Telegram bot not responding"
**Solution:** Verify bot token, ensure bot is not blocked by user

### Issue: "Scheduled function not running"
**Solution:** Check Cloud Scheduler in GCP Console, ensure billing is enabled

---

## 📊 Success Metrics

By end of Phase 3, you should have:
- ✅ Cloud Functions deployed and running
- ✅ Scheduled job checking for due tasks every hour
- ✅ Email notifications working
- ✅ Discord notifications working
- ✅ Telegram notifications working
- ✅ Users can configure their preferences
- ✅ No duplicate notifications

---

## 🔜 Next Steps

Once Phase 3 is complete:
- **Phase 4:** Final integration and testing
- **Phase 5:** Deployment and monitoring

---

**Document Created:** Sprint 6  
**AI Assistant:** Claude Sonnet 4.5  
**Status:** Planning Phase

