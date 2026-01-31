# Ask Board- Project Phase Implementation

## Course: CptS 483 Special Topic - Coding with Agentic AI
## Student: Cem Beyenal
## Track: Web Dev 
## Project Phase: Weeks 8-14 (Individual Project)

---

## 📋 Project Overview

askBoard is a web-based Kanban app that bakes automation into everyday task management using a small team of coordinating software agents. Instead of forcing users to manually create and maintain tasks, the system parses natural-language input into structured tasks, auto-prioritizes based on urgency, issues reminders ahead of deadlines, and generates weekly progress summaries—coordinated by a central backend “Coordinator.”  ￼

Problem. Students and small teams often lose time and momentum to manual task entry, triage, and follow-ups—resulting in missed deadlines and scattered focus. Existing Kanban tools are either too manual or too heavy to extend.  ￼

Solution & Success Vision. Deliver a functional React + Node app where agents collaborate: typing “Finish project draft by Friday” creates a prioritized task; near-due items trigger reminders; and weekly reports summarize done vs. pending. An MVP ships with a clean, responsive UI, stable Node/Express backend, JSON persistence (with a path to Mongo/Postgres), and well-documented agent modules.  ￼

### Target Users
• Individual developers and students
• Small teams/startups that want lightweight task organization with built-in automation
• Anyone who wants an organizational tool to help them complete tasks

### Core Use Cases
1.	**AI-Powered Task Parsing**: Quick task capture from natural language (e.g., "Complete lab report by Friday") using Google Gemini AI.
2.	**Dynamic Prioritization**: Auto-prioritization based on due dates and customizable thresholds.
3.	**Smart Reminders**: AI-generated contextual reminders for upcoming tasks.
4.	**Progress Insights**: AI-powered weekly progress reports and productivity analytics.
5.	**Deadline Monitoring**: Visual badges and notifications for urgent tasks.

### ✨ Current Features

#### 🤖 AI-Powered Features
- **Natural Language Task Input**: Type "Buy milk by tomorrow" and AI extracts date, priority, and clean text
- **Smart Reminders**: Click "🤖 AI Reminder" for contextual notifications about upcoming tasks
- **Productivity Reports**: Click "📊 AI Report" for AI-generated insights on your progress
- **Flexible Date Parsing**: Understands "tomorrow", "next Friday", "in 3 days", "by 11/15", etc.

#### 📊 Dashboard & Analytics
- Real-time task statistics (To-Do, In Progress, Done counts)
- Average completion time calculation
- Overdue task counter
- Soonest upcoming task display with visual indicators

#### 🎯 Task Management
- Three-column Kanban board (To-Do, In Progress, Done)
- Visual priority badges (High/Medium/Low)
- Customizable priority thresholds (click to edit)
- Task editing with date picker
- Completion date tracking

#### 🚨 Smart Alerts
- **Overdue tasks**: Red background + "Overdue" badge
- **Due today**: Yellow background + "Due Today" badge  
- Days remaining counter for upcoming tasks
- Reminders section showing 5 soonest tasks

#### 💾 Data Persistence
- All tasks saved to browser localStorage
- Priority thresholds saved and persisted
- Task history maintained

---

## 🎯 Project Goals & Success Criteria

### Core Features (Must Complete)
•	✅ Kanban CRUD with three columns (To-Do/In-Progress/Done) and localStorage persistence
•	✅ **AI-Powered Task Parser** using Google Gemini 2.0 Flash-Lite for natural language understanding
•	✅ **Priority Agent** (AI-enhanced) that auto-assigns priority based on due dates and customizable thresholds
•	✅ **Dashboard** with real-time statistics (task counts, avg completion time, overdue tasks)
•	✅ **Reminder System** showing 5 soonest upcoming tasks with visual indicators
•	✅ **AI Reminder Agent** that generates contextual notifications for upcoming tasks
•	✅ **AI Report Agent** that produces productivity insights and analysis
•	✅ **Overdue Detection** with red highlighting for past-due tasks
•	✅ **Due Today Detection** with yellow highlighting for tasks due today
•	✅ Comprehensive date parsing (natural language: "by tomorrow", "by Friday", "in 3 days", etc.)
•	✅ Editable priority thresholds with real-time task recalculation
•	🔄 Coordinator service with event endpoints (in progress)
•	🔄 Basic unit/integration/E2E tests and project docs (in progress)

### Stretch Goals (If Time Permits)
•	Repository adapter for MongoDB (feature-flagged swap from JSON).
•	External notifications (Slack/email) via Coordinator.
•	Tagging/filters, dark mode, keyboard shortcuts.

### Success Metrics
- **Functional Completeness**: App runs locally, persists tasks, and demonstrates full lifecycle: parse → prioritize → remind → report.
- **Multi-Agent Coordination**: Agents are decoupled and event-driven via Coordinator; deterministic conflict policy; failure fallbacks logged. 
- **Professional Quality**: ESLint/Prettier, tests (unit/integration/E2E), CI on PRs, schema validation, structured logs, versioned releases.
- **Portfolio Readiness**: Clean React UI, Node/Express backend, documented agents, and a demo script proving end-to-end automation.

---

## 🏗️ Technical Architecture

### Technology Stack

#### Frontend (Current MVP)
- **Primary Language**: JavaScript (ES6+)
- **Framework**: Vanilla JS with modern DOM APIs
- **AI Integration**: Google Gemini 2.0 Flash-Lite API
- **Styling**: CSS3 with futuristic/neon theme
- **Data Persistence**: Browser localStorage
- **Deployment**: GitHub Pages + Local

#### Backend (Future)
- **Language**: TypeScript
- **Framework**: Node.js + Express
- **Database**: JSON files → MongoDB/PostgreSQL (feature-flagged)
- **Key Libraries**: node-cron, Chart.js, Jest
- **Deployment**: Cloud (TBD)

### Multi-Agent System Design

#### Agent 1: Priority Agent
•	Primary Responsibility: Convert natural-language input → structured task.
•	Input: Raw text (e.g., “Finish report by Friday”).
•	Output: { title, description?, dueDate?, metadata }.
•	AI Tool: External LLM (optional) with guardrails; fallback to rule-based parser + user confirm.  ￼

#### Agent 2: Reminder Agent
•	Primary Responsibility: Set/update priority via rules (e.g., due < 3 days → High).
•	Input: Parsed or edited task.
•	Output: Task with computed priority.
•	AI Tool: Rule-based (deterministic).

#### Agent 3: Report Agent
•	Primary Responsibility: Weekly summaries and trends (completed vs. pending, cycle time).
•	Input: Task history.
•	Output: Aggregated report object for dashboard charts.
•	AI Tool: Rule-based aggregation.  

Coordination Pattern. All agents are hub-and-spoke behind the Coordinator. They subscribe to events (task:created, task:updated, task:deadlineApproaching) and publish results back; conflicts are resolved deterministically and all outcomes are logged.  

### Architecture Diagram
[Insert architecture diagram or link to diagram in docs/ folder]

---

## 📅 Sprint Progress

### Sprint 1: Foundation & Core Setup + Priority Agent & Data Access (Weeks 8-9)
**Goal**: Repo/CI, Coordinator skeleton, JSON persistence, basic Kanban UI, AI log, rule-based Priority Agent; finalize repository interface; UI priority signals; lifecycle tests.

**Completed**:
- [✓] [Completed task 1]
- [✓] [Completed task 2]

**In Progress**:
- [Major work item currently being implemented]

**Challenges**:
- [Challenge faced and how you addressed it]

**AI Coordination**: [Brief note on which agents you used and how - details in `.context/ai-coordination-strategy.md`]

---

### Sprint 2: Reminder Agent & Notification UI (Week 10)
**Goal**: node-cron scans, reminder events, badges/panel, simple per-user settings

**Status**: [Not started / In progress / Complete]

---

### Sprint 3: Report Agent & Weekly Dashboard (Week 11)
**Goal**: Aggregation, charts, performance pass, accessibility sweep, docs update.

**Status**: [Not started / In progress / Complete]

---

### Sprint 4: AI Parser & Guardrailes (Week 12)
**Goal**: LLM endpoint with schema validation, confirmation UI, robust fallbacks, tests.

**Status**: [Not started / In progress / Complete]

---

### Sprint 5: Scale Readiness & Optional DB Pilot (Week 13)
**Goal**: Mongo adapter behind feature flag, optional dual-write, ops docs.

**Status**: [Not started / In progress / Complete]

---

### Sprint 6: Final Polish & Presentation Preparation (Week 14)
**Goal**: Finalize all features, comprehensive testing, polish UI/UX, prepare presentation

**Status**: [Not started / In progress / Complete]

---

## 🎤 Week 15: Live Presentation (5 minutes)
**Format**: Live demonstration during class
- 30 seconds: Project overview
- 2-3 minutes: Core functionality demo
- 1 minute: AI coordination approach
- 30 seconds: Reflection and learning

---

## 🚀 Getting Started

### Prerequisites
•	Node.js 20+ and pnpm or npm (for future backend)
•	GitHub account (for Actions/CI)
•	**Google Gemini API Key** (Free - required for AI task parsing)
•	Web browser (Chrome, Firefox, Safari, or Edge)
•	(Optional) MongoDB for stretch goal

### Quick Start (Try Online)

Visit **https://cembeast.github.io/Taskboard-Lite/** to test the live version!

### Local Installation

#### Step 1: Clone the Repository

```bash
git clone https://github.com/WSU-CptS483/course-project-CemBeast.git
cd course-project-CemBeast/KanbanBoard
```

#### Step 2: Set Up AI API (Required for AI Features)

The Kanban board uses **Google Gemini AI** for intelligent task parsing. Follow these steps:

1. **Get a Free API Key:**
   - Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
   - Sign in with your Google account
   - Click **"Create API Key"**
   - Copy your API key

2. **Configure the API Key:**
   ```bash
   # Copy the template file
   cp aiAgent.example.js aiAgent.js
   
   # Open aiAgent.js in your editor
   # Replace 'YOUR_API_KEY_HERE' on line 6 with your actual API key
   ```

3. **Update Allowed Domains (Optional):**
   - In `aiAgent.js`, find line 10: `const ALLOWED_DOMAINS = [...]`
   - Add any additional domains where you'll host the app

4. **Verify API Setup:**
   - Open `simple-test.html` in your browser
   - Paste your API key and click "TEST API KEY NOW"
   - You should see **✅ SUCCESS** message

**📋 Detailed AI Setup Guide:** See [KanbanBoard/AI_SETUP.md](KanbanBoard/AI_SETUP.md) for complete instructions.

#### Step 3: Run the Application

**Option A: Simple File Open** (Works immediately)
```bash
# Open the main app
open index.html
# Or on Windows: start index.html
# Or on Linux: xdg-open index.html
```

**Option B: Local Server** (Recommended for testing)
```bash
# Navigate to KanbanBoard directory
cd KanbanBoard

# Start a local server
python3 -m http.server 8000

# Open in browser
# Visit: http://localhost:8000
```

#### Step 4: Test AI Features

1. **Add a task with natural language:**
   - Type: `"Buy groceries by tomorrow"`
   - The AI will extract the due date and set priority automatically

2. **Try the AI buttons:**
   - Click **🤖 AI Reminder** for smart notifications
   - Click **📊 AI Report** for productivity insights

3. **Test various date formats:**
   - `"Finish homework by Friday"`
   - `"Call dentist in 3 days"`
   - `"Submit report by next Monday"`

### Configuration

#### Enable/Disable AI Mode

In `app.js`, line 2:
```javascript
const USE_AI = true;  // Set to false to use rule-based NLP instead
```

#### Customize Priority Thresholds

Click the threshold numbers at the bottom of the Kanban board to edit:
- **High Priority:** ≤ X days
- **Medium Priority:** ≤ Y days  
- **Low Priority:** > Y days

### Free Tier Limits

Google Gemini API (Free):
- ✅ No credit card required
- ✅ 15 requests per minute
- ✅ 1,500 requests per day
- ✅ Perfect for personal/educational use

### Troubleshooting

#### API Key Not Working

1. **Enable Generative Language API:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com)
   - Make sure you're in the correct project
   - Click "ENABLE"

2. **Check API Key Format:**
   - Should start with `AIza`
   - About 39 characters long
   - No spaces or quotes

3. **Test Your Setup:**
   - Open `simple-test.html` in your browser
   - Paste your API key
   - Click "TEST API KEY NOW"
   - Should see success message in 2-3 seconds

4. **Still Not Working?**
   - Create a new API key at [Google AI Studio](https://aistudio.google.com/app/apikey)
   - Check browser console (F12) for error messages
   - See [KanbanBoard/DEBUG_STEPS.md](KanbanBoard/DEBUG_STEPS.md) for detailed troubleshooting

#### Browser Console Errors

Press `F12` (or `Cmd+Option+J` on Mac) to see detailed error messages.

#### Need Help?

- 📚 [Detailed Setup Guide](KanbanBoard/AI_SETUP.md)
- 🔒 [Security Best Practices](KanbanBoard/SECURITY.md)
- 🐛 [Debug Steps](KanbanBoard/DEBUG_STEPS.md)

### Testing
```bash
# Run tests
[test commands]
```

---

## 📚 Documentation

Detailed documentation is maintained in the `.context/` folder:
- **`.context/project-context.md`**: Architecture decisions, design patterns, tech stack rationale
- **`.context/ai-coordination-strategy.md`**: AI agent roles, coordination patterns, successful workflows
- **`.context/development-tracking.md`**: Detailed sprint progress, daily logs, problems/solutions

Additional technical documentation (diagrams, API docs) may be in the `docs/` folder.

---

## 🤖 AI Coordination Summary

### Primary Development Agent
**Tool**: Cursor
**Used For**: Code generation

### Architecture & Design Agent
**Tool**: ChatGPT & Claude
**Used For**: Design Frontend (ChatGPT) and Backend (Claude)

### Domain Expert Agent
**Tool**: ChatGPT/Claude
**Used For**: TypeScript Documentation for Frontend / Backend

**Coordination Approach**: [All AI interventions appended to a shared JSONL log; deterministic human-in-the-loop review before merge (CI-gated).   - see `.context/ai-coordination-strategy.md` for details]

---

## 📝 License
[Choose an appropriate license for your project]

---

## 👤 Contact
Cem Beyenal - cem.beyenal@wsu.edu

**Course**: CptS 483 Special Topic - Coding with Agentic AI  
**Instructor**: Jeremy Thompson 
**Semester**: Fall 2025


