# TaskBoard Lite - Demo Script & Next Sprint Plan

---

## 8-10 Minute Demo Script

### Introduction (30 seconds)

**"Welcome to TaskBoard Lite - an AI-powered Kanban board that transforms natural language into organized, prioritized tasks. This project demonstrates modern web development practices, AI integration, and intelligent task management. Let me walk you through the key features and technical implementation."**

---

### Part 1: Core Features Demonstration (3-4 minutes)

#### 1. AI-Powered Natural Language Task Input (1 min)
**Demo:**
- Type: `"Finish book report by November 25th"`
- Show how AI extracts:
  - Clean task text: "Finish book report"
  - Due date: 2024-11-25
  - Priority: High/Medium/Low (based on configurable thresholds)
  - Days until due calculation

**Additional Examples to Demo:**
- `"Do laundry in 3 days"` → Handles relative dates
- `"Call dentist by next Tuesday"` → Understands weekday references
- `"Pay bills by 11/30"` → Parses MM/DD format
- `"Review code"` → Works without dates (defaults to Medium priority)

**Key Point:** _"The AI understands 15+ different date formats including relative dates, weekdays, and natural language expressions."_

#### 2. Real-Time Dashboard Analytics (45 seconds)
**Show the dashboard displaying:**
- Task counts per section (To-Do, In Progress, Done)
- Total tasks
- % Complete
- Average completion time (in days)
- Overdue task count
- Soonest upcoming task

**Key Point:** _"All metrics update in real-time as tasks move through the workflow. The average completion time helps identify bottlenecks in your productivity."_

#### 3. Smart Reminders Section (30 seconds)
**Demo:**
- Show the "Upcoming Tasks" section
- Displays 5 soonest tasks automatically
- Highlights overdue tasks in red
- "Due Today" tasks in yellow
- Regular upcoming tasks in teal

**Key Point:** _"Tasks are automatically sorted by urgency, so you never miss a deadline."_

#### 4. Kanban Workflow & Task Management (1 min)
**Demo each action:**
- **Edit Task:** Click pencil icon
  - Edit task name, priority, due date, and assignment date
  - Show inline validation
- **Move Between Columns:** Click arrow icons
  - To-Do → In Progress → Done
  - Undo from Done returns to In Progress (not To-Do)
- **Priority Badges:** Color-coded (Red=High, Yellow=Medium, Teal=Low)
- **Delete Task:** Trash can icon (only for Done tasks)

**Key Point:** _"The undo functionality intelligently moves tasks to In Progress because if you're undoing completion, you're actively working on it."_

#### 5. Dynamic Priority Configuration (30 seconds)
**Demo:**
- Scroll to bottom: "Priority thresholds"
- Click to edit High Priority threshold (e.g., 3 → 5 days)
- Click to edit Medium Priority threshold (e.g., 7 → 10 days)
- Show validation: High < Medium constraint
- Watch tasks automatically re-prioritize in real-time

**Key Point:** _"Users can customize priority thresholds to match their workflow. Changes recalculate all task priorities instantly."_

#### 6. AI Features (Bonus) (30 seconds)
**Demo:**
- Click **"🤖 AI Reminder"** button
  - Generates natural language reminder about upcoming tasks
- Click **"📊 AI Report"** button
  - Generates productivity insights and encouragement

**Key Point:** _"These AI agents provide personalized motivation and insights using Google Gemini API."_

---

### Part 2: Current Functionality Status (1 minute)

#### ✅ Fully Operational Features:
- **AI Task Parsing:** Google Gemini 2.5 Flash Lite integration
- **Natural Language Processing:** 15+ date format parsers (fallback NLP rules)
- **Dashboard Analytics:** 8 real-time metrics
- **Kanban Board:** Full CRUD operations with drag-like movement
- **Priority System:** User-configurable thresholds with automatic recalculation
- **Reminders:** Top 5 upcoming tasks with overdue detection
- **Local Persistence:** LocalStorage for offline functionality
- **Visual Design:** Futuristic glassmorphic UI with neon accents

#### 🚧 Future Enhancements (Next Sprint):
- **Reminder Agent:** Automated notifications via Discord/Telegram
- **User Profiles:** Authentication and multi-user support
- **External Messaging:** Webhook integration for reminders
- **Task Recurrence:** Repeat tasks (daily, weekly, monthly)

---

### Part 3: AI Agent Workflow & Technical Explanation (2-3 minutes)

#### Tools Used

**1. Google Gemini 2.5 Flash Lite API**
- **Why?** 60 requests/minute (4x higher than Gemini Pro)
- **Free Tier:** 1,500 requests/day, no credit card required
- **Performance:** ~1-2 second response time
- **Use Cases:** Task parsing, notification generation, report generation

**2. Client-Side Rate Limiting**
```javascript
// Tracks requests to avoid hitting API limits
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS_PER_MINUTE = 60;
```

**3. Fallback NLP Rules**
- 15+ regex patterns for date extraction
- Handles: weekdays, relative dates, month names, numeric formats
- Activates when AI is disabled or API fails

#### Coordination Strategies

**1. Hybrid AI + Rules Architecture**
```javascript
if (USE_AI && parseTaskWithAI) {
  // Primary: Use AI for intelligent parsing
  const aiResult = await parseTaskWithAI(text);
} else {
  // Fallback: Use rule-based NLP
  applyPriorityRule(newTask, text);
}
```

**2. Context-Aware Prompting**
The AI prompt includes:
- Current date context: `"CURRENT DATE: 2024-11-21 (Thursday, November 21, 2024)"`
- 15+ example inputs with expected outputs
- Strict JSON schema for responses
- Date validation and format enforcement

**Example Prompt Structure:**
```javascript
const prompt = `You are a task parsing assistant. Extract and output each field...

CURRENT DATE: ${todayDate}
USER TASK: "${taskText}"

EXAMPLES:
Input: "Finish by 8pm Friday"
Output: {"dueDate": "2024-11-15", "priority": "Medium", "cleanText": "Finish"}
...

ALWAYS OUTPUT ONLY:
{"dueDate": "YYYY-MM-DD" or null, "priority": "High"|"Medium"|"Low", "cleanText": "..."}`;
```

**3. Real-Time Priority Recalculation**
```javascript
function recalculateAllTaskPriorities() {
  tasks.forEach(task => {
    if (task.dueDate && task.status !== 'done') {
      const daysUntilDue = calculateDaysUntilDue(task.dueDate);
      const newPriority = computePriorityFromDue(task.dueDate);
      if (task.priority !== newPriority) {
        task.priority = newPriority;
        changed = true;
      }
    }
  });
  if (changed) saveTasks();
}
```

**4. Error Handling & Domain Security**
```javascript
// Domain whitelist prevents API key abuse
const ALLOWED_DOMAINS = ['localhost', '127.0.0.1', 'your-github-pages.io'];

// Graceful degradation on API failure
catch (error) {
  console.error('AI parsing failed:', error);
  return {
    dueDate: null,
    priority: 'Medium',
    cleanText: taskText // Fallback to original text
  };
}
```

#### Example Prompts Handled

| User Input | AI Extracts | Result |
|-----------|-------------|--------|
| `"Finish book report by November 25"` | Due: 2024-11-25, Priority: Medium | Task: "Finish book report" |
| `"Do laundry in 3 days"` | Due: 2024-11-24, Priority: High | Task: "Do laundry" |
| `"Call mom by next Tuesday"` | Due: 2024-11-26, Priority: Medium | Task: "Call mom" |
| `"Submit assignment by tomorrow"` | Due: 2024-11-22, Priority: High | Task: "Submit assignment" |
| `"Review code"` | Due: null, Priority: Medium | Task: "Review code" |

---

### Part 4: Technical Highlights & Challenges Overcome (2 minutes)

#### Technical Highlights

**1. Zero-Configuration Local Development**
```bash
python3 -m http.server 8080
# OR simply open index.html (with limited AI features)
```

**2. Stateful Local Persistence**
- Uses `localStorage` for instant load times
- No backend required for basic functionality
- Tasks persist across sessions

**3. Futuristic Glassmorphic UI**
- CSS custom properties for theming
- Neon glow effects with `box-shadow`
- Responsive grid layout
- Color-coded priority system (semantic colors)

**4. Intelligent Task Migration**
```javascript
function migrateTaskTexts() {
  // Automatically cleans up old task formats on page load
  tasks.forEach(task => {
    const clean = extractCleanTaskText(task.originalText || task.text);
    if (task.text !== clean) {
      task.text = clean;
      changed = true;
    }
  });
}
```

**5. Real-Time Validation**
- Priority threshold constraints: `0 < High < Medium`
- Date format validation: `YYYY-MM-DD`
- Automatic sorting by priority and due date

#### Challenges Overcome

**1. CORS Issues with File Protocol**
- **Problem:** Opening `index.html` as `file://` blocked Gemini API calls
- **Solution:** Documented HTTP server setup (`python3 -m http.server`)
- **Learning:** Browser security prevents `file://` from making external requests

**2. Gemini API Model Availability**
- **Problem:** Initial model `gemini-2.0-flash-lite` was experimental and unstable
- **Solution:** Created `check-models.html` utility to test available models
- **Result:** Migrated to `gemini-2.5-flash-lite` (60 req/min vs 15 req/min)

**3. AI Response Format Inconsistency**
- **Problem:** AI sometimes wrapped JSON in markdown (` ```json ... ``` `)
- **Solution:** Robust JSON extraction with regex fallback
```javascript
let jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
if (!jsonMatch) {
  // Try parsing entire response
  jsonMatch = [JSON.stringify(JSON.parse(aiResponse))];
}
```

**4. Task Text Cleaning Edge Cases**
- **Problem:** "Finish task by next Tuesday" showed full phrase, not just "Finish task"
- **Solution:** Multi-stage regex cleaning:
  1. Remove `by next week/month/year`
  2. Remove `by <weekday>`
  3. Remove `by <date>`
  4. Remove leftover `by/due` keywords
  5. Capitalize only first letter

**5. Priority Recalculation Race Conditions**
- **Problem:** Editing thresholds didn't immediately update task priorities
- **Solution:** Centralized `recalculateAllTaskPriorities()` called on:
  - Page load
  - Threshold changes
  - Task edits
  - Status changes

**6. Average Completion Time Accuracy**
- **Problem:** Used task `id` (timestamp) instead of actual creation date
- **Solution:** Added explicit `createdDate` field
- **Benefit:** Users can now edit assignment dates for testing scenarios

**7. Rate Limiting Without Backend**
- **Problem:** No server-side rate limiting for API calls
- **Solution:** Client-side tracking with 60-second rolling window
```javascript
function checkRateLimit() {
  if (now - lastRequestTime > RATE_LIMIT_WINDOW) {
    requestCount = 0;
  }
  if (requestCount > MAX_REQUESTS_PER_MINUTE) {
    throw new Error('Rate limit exceeded. Wait 60 seconds.');
  }
}
```

---

### Closing Statement (15 seconds)

**"TaskBoard Lite demonstrates a production-ready web application with AI integration, intelligent UX, and modern design principles. The hybrid AI + rules architecture ensures reliability even when external services fail. Thank you!"**

---

---

## Next Sprint Plan (1-2 Minutes)

### Goal: External Notification System with User Profiles

#### Feature 1: Reminder Agent with Discord/Telegram Integration

**Objective:** Send automated task reminders to users via Discord or Telegram when tasks are due or overdue.

**User Stories:**
1. As a user, I want to receive Discord notifications 1 day before a task is due
2. As a user, I want daily Telegram summaries of overdue tasks
3. As a user, I want to configure notification preferences (timing, frequency, channel)

**Technical Implementation:**

**Option A: Discord Webhook Integration**
```javascript
async function sendDiscordReminder(task) {
  const webhookUrl = user.discordWebhook; // From user profile
  await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      embeds: [{
        title: `⏰ Task Reminder: ${task.text}`,
        description: `Due: ${task.dueDate}\nPriority: ${task.priority}`,
        color: task.priority === 'High' ? 0xff5c7a : 0xffdf6a
      }]
    })
  });
}
```

**Option B: Telegram Bot API**
```javascript
async function sendTelegramReminder(task) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = user.telegramChatId;
  const message = `⏰ *${task.text}*\nDue: ${task.dueDate}\nPriority: ${task.priority}`;
  
  await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
      parse_mode: 'Markdown'
    })
  });
}
```

#### Feature 2: User Profile & Authentication System

**Objective:** Add user accounts to store preferences and enable multi-user support.

**Implementation:**
- **Frontend:** Login/signup forms
- **Backend:** Node.js + Express + MongoDB (or Firebase Auth)
- **Storage:** Move from `localStorage` to database (MongoDB/PostgreSQL)

**User Profile Schema:**
```javascript
const UserProfile = {
  userId: String,
  email: String,
  discordWebhook: String (optional),
  telegramChatId: String (optional),
  notificationPreferences: {
    enabled: Boolean,
    channels: ['discord', 'telegram'],
    timing: 'daily' | 'on-due-date' | 'custom',
    customTimes: ['09:00', '18:00']
  },
  tasks: [TaskSchema]
};
```

---

### Technical Challenges to Tackle

#### Challenge 1: Backend Server Setup ⚠️ **HIGH PRIORITY**

**Problem:** Current app is 100% frontend. Webhook/API calls expose secrets.

**Solution:**
1. Create Node.js/Express backend
2. Move API keys to `.env` file
3. Implement `/api/notify` endpoint
4. Deploy backend to Render/Railway/Heroku

**Files to Create:**
- `server/index.js` - Express server
- `server/routes/notifications.js` - Notification endpoints
- `server/models/User.js` - User schema
- `server/middleware/auth.js` - JWT authentication
- `.env` - Environment variables (API keys, DB credentials)

**Estimated Time:** 4-6 hours

---

#### Challenge 2: Webhook Security & Validation ⚠️ **SECURITY CRITICAL**

**Problem:** Discord webhooks can be abused if exposed. Need to secure endpoints.

**Solutions:**
1. **Webhook URL Validation:** Verify Discord/Telegram webhook format before saving
2. **Rate Limiting:** Prevent spam (max 10 notifications/hour/user)
3. **User-Specific Webhooks:** Store in database, not client-side
4. **HMAC Signatures:** Validate requests are from your backend

```javascript
// Rate limiting example
const rateLimit = require('express-rate-limit');

const notificationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 notifications per user per hour
  keyGenerator: (req) => req.user.userId
});

app.post('/api/notify', authenticate, notificationLimiter, sendNotification);
```

**Estimated Time:** 2-3 hours

---

#### Challenge 3: Scheduled Task Checking (Cron Jobs) ⚠️ **MEDIUM PRIORITY**

**Problem:** Need to check for due tasks every hour/day and send notifications.

**Solution:** Implement cron jobs to scan database for tasks

**Option A: Node-Cron**
```javascript
const cron = require('node-cron');

// Check for due tasks every hour
cron.schedule('0 * * * *', async () => {
  console.log('Checking for due tasks...');
  const users = await User.find({ 'notificationPreferences.enabled': true });
  
  for (const user of users) {
    const dueTasks = user.tasks.filter(task => 
      task.status !== 'done' && 
      isTaskDueSoon(task, 24) // Due within 24 hours
    );
    
    if (dueTasks.length > 0) {
      await sendNotifications(user, dueTasks);
    }
  }
});
```

**Option B: Cloud Functions (Serverless)**
- Use Firebase Functions or AWS Lambda
- Trigger: CloudScheduler (every hour/day)
- Pros: No server maintenance, auto-scaling
- Cons: Cold start latency

**Estimated Time:** 3-4 hours

---

#### Challenge 4: Database Migration from LocalStorage ⚠️ **HIGH PRIORITY**

**Problem:** Need to move from client-side `localStorage` to server-side database.

**Solution:**

**Step 1: Export Current Tasks**
```javascript
// Add export button to UI
function exportTasks() {
  const data = localStorage.getItem('taskboard-lite-v1');
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'tasks-export.json';
  a.click();
}
```

**Step 2: Backend API for Task Sync**
```javascript
// POST /api/tasks - Create task
// GET /api/tasks - Fetch all user tasks
// PATCH /api/tasks/:id - Update task
// DELETE /api/tasks/:id - Delete task
```

**Step 3: Frontend API Client**
```javascript
// Replace localStorage calls with API calls
async function saveTasks() {
  await fetch('/api/tasks', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${userToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(tasks)
  });
}
```

**Estimated Time:** 5-7 hours

---

#### Challenge 5: Real-Time Updates (WebSockets) ⚠️ **LOW PRIORITY (BONUS)**

**Problem:** If editing tasks on mobile, desktop won't update automatically.

**Solution:** Implement WebSocket for real-time sync

**Option A: Socket.io**
```javascript
// Server
io.on('connection', (socket) => {
  socket.on('task:update', (task) => {
    socket.broadcast.emit('task:updated', task);
  });
});

// Client
socket.on('task:updated', (task) => {
  const index = tasks.findIndex(t => t.id === task.id);
  if (index !== -1) {
    tasks[index] = task;
    render();
  }
});
```

**Estimated Time:** 4-6 hours

---

### Sprint Timeline (2 Weeks)

**Week 1: Backend & Authentication**
- Day 1-2: Node.js/Express server setup
- Day 3-4: User authentication (JWT)
- Day 5-7: Database integration (MongoDB/PostgreSQL)

**Week 2: Notifications & Testing**
- Day 8-9: Discord/Telegram webhook integration
- Day 10-11: Cron jobs for scheduled reminders
- Day 12-13: Testing & bug fixes
- Day 14: Deployment & documentation

---

### Success Metrics

1. **Users can create accounts** ✅
2. **Users can link Discord/Telegram** ✅
3. **Automated reminders sent successfully** ✅
4. **Zero webhook abuse incidents** ✅ (security)
5. **<2 second notification latency** ✅ (performance)

---

### Resources Needed

**APIs:**
- Discord Webhook API (free)
- Telegram Bot API (free)
- MongoDB Atlas (free tier: 512MB)

**Deployment:**
- Backend: Railway/Render (free tier)
- Database: MongoDB Atlas (free)
- Frontend: Netlify/Vercel (free)

**Libraries:**
- `express` - Web server
- `mongoose` - MongoDB ORM
- `jsonwebtoken` - JWT auth
- `bcrypt` - Password hashing
- `node-cron` - Scheduled tasks
- `dotenv` - Environment variables

---

### Risk Mitigation

| Risk | Mitigation Strategy |
|------|---------------------|
| **API Rate Limits** | Implement exponential backoff, queue notifications |
| **Webhook Failures** | Retry logic (3 attempts), fallback to email |
| **Database Downtime** | Cache tasks locally, sync when online |
| **Security Breach** | HTTPS only, JWT expiration, rate limiting |
| **Scope Creep** | Strict MVP: Discord/Telegram only, no SMS |

---

**End of Sprint Plan**

