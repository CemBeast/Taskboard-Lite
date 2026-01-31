# TaskBoard – AI-Assisted Kanban Board — Project Phase Implementation

## Course: CptS 483 Special Topic - Coding with Agentic AI  
## Student: Cem Beyenal  
## Track: Web Dev  
## Project Phase: Weeks 8–14 (Individual Project)

---

## 📋 Project Overview

TaskBoard is a web-based Kanban app that bakes automation into everyday task management using a small team of coordinating software agents. Instead of forcing users to manually create and maintain tasks, the system parses natural-language input into structured tasks, auto-prioritizes based on urgency, issues reminders ahead of deadlines, and generates weekly progress summaries—coordinated by a central backend “Coordinator.”

**Problem.** Students and small teams often lose time and momentum to manual task entry, triage, and follow-ups—resulting in missed deadlines and scattered focus. Existing Kanban tools are either too manual or too heavy to extend.

**Solution & Success Vision.** Deliver a functional React + Node app where agents collaborate: typing “Finish project draft by Friday” creates a prioritized task; near-due items trigger reminders; and weekly reports summarize done vs. pending. An MVP ships with a clean, responsive UI, stable Node/Express backend, JSON persistence (with a path to Mongo/Postgres), and well-documented agent modules.

### Target Users
- Individual developers and students  
- Small teams/startups that want lightweight task organization with built-in automation

### Core Use Cases
1. Quick task capture from natural language (e.g., “Complete lab report by Friday”).  
2. Dynamic prioritization as deadlines approach.  
3. Deadline monitoring with reminders/urgency badges.  
4. Weekly progress reporting (completed vs. pending).

---

## 🎯 Project Goals & Success Criteria

### Core Features (Must Complete)
- [ ] Kanban CRUD with drag-and-drop columns (To-Do/In-Progress/Done) and JSON persistence.  
- [ ] Coordinator service with event endpoints; agents integrated only via Coordinator.  
- [ ] Priority Agent (rule-based) that updates priority on create/update.  
- [ ] Reminder Agent that scans due dates and emits alerts.  
- [ ] Report Agent that produces weekly summaries and simple charts.  
- [ ] Gen-AI Task Parser for add-task only, with confirmation & safe fallback.  
- [ ] Basic unit/integration/E2E tests and project docs.

### Stretch Goals (If Time Permits)
- [ ] Repository adapter for MongoDB (feature-flagged swap from JSON).  
- [ ] External notifications (Slack/email) via Coordinator.  
- [ ] Tagging/filters, dark mode, keyboard shortcuts.

### Success Metrics
- **Functional Completeness.** App runs locally, persists tasks, and demonstrates full lifecycle: parse → prioritize → remind → report. (MVP = v0.4; Final = v1.0).  
- **Multi-Agent Coordination.** Agents are decoupled and event-driven via Coordinator; deterministic conflict policy; failure fallbacks logged.  
- **Professional Quality.** ESLint/Prettier, tests (unit/integration/E2E), CI on PRs, schema validation, structured logs, versioned releases.  
- **Portfolio Readiness.** Clean React UI, Node/Express backend, documented agents, and a demo script proving end-to-end automation.

---

## 🏗️ Technical Architecture

### Technology Stack
- **Primary Language:** TypeScript (frontend & backend)  
- **Frameworks:** React (Vite) + Node.js/Express  
- **Database/Storage:** JSON files for MVP; pluggable adapters for MongoDB/PostgreSQL later  
- **Key Libraries:** React DnD (or similar) for drag-and-drop, node-cron, Chart.js, Jest, React Testing Library  
- **Deployment:** Local dev; optional cloud deploy later (feature-flag friendly)

### Multi-Agent System Design

#### Agent: Task Parser Agent
- **Primary Responsibility:** Convert natural-language input → structured task.  
- **Input:** Raw text (e.g., “Finish report by Friday”).  
- **Output:** `{ title, description?, dueDate?, metadata }`.  
- **AI Tool:** External LLM (optional) with guardrails; fallback to rule-based parser + user confirm.

#### Agent: Priority Agent
- **Primary Responsibility:** Set/update priority via rules (e.g., due < 3 days → High).  
- **Input:** Parsed or edited task.  
- **Output:** Task with computed `priority`.  
- **AI Tool:** Rule-based (deterministic).

#### Agent: Reminder Agent
- **Primary Responsibility:** Monitor approaching deadlines and raise alerts/badges.  
- **Input:** Shared store scan (scheduled).  
- **Output:** Reminder events (`task:reminder`).  
- **AI Tool:** Rule-based scheduler.

#### Agent: Report Agent
- **Primary Responsibility:** Weekly summaries and trends (completed vs. pending, cycle time).  
- **Input:** Task history.  
- **Output:** Aggregated report object for dashboard charts.  
- **AI Tool:** Rule-based aggregation.

**Coordination Pattern.** All agents are hub-and-spoke behind the Coordinator. They subscribe to events (`task:created`, `task:updated`, `task:deadlineApproaching`) and publish results back; conflicts are resolved deterministically and all outcomes are logged.

### Architecture Diagram
_Add later_: `docs/architecture-diagram.png` (Coordinator ↔ Agents ↔ Repository; React UI via REST/WebSocket).

---

## 📅 Sprint Progress

### Sprint 1: Foundations & Kanban CRUD (Week 8)
**Goal:** Repo/CI, Coordinator skeleton, JSON persistence, basic Kanban UI, AI log.  
**Status:** Plan established; deliver v0.1 with working CRUD + JSON.

### Sprint 2: Priority Agent & Data Access Abstraction (Week 9)
**Goal:** Rule-based Priority Agent; finalize repository interface; UI priority signals; lifecycle tests.  
**Status:** Planned for v0.2.

### Sprint 3: Reminder Agent & Notifications UI (Week 10)
**Goal:** node-cron scans, reminder events, badges/panel, simple per-user settings.  
**Status:** Planned for v0.3.

### Sprint 4: Report Agent & Weekly Dashboard (Week 11)
**Goal:** Aggregation, charts, performance pass, accessibility sweep, docs update.  
**Status:** Planned for v0.4.

### Sprint 5: AI Parser & Guardrails (Week 12)
**Goal:** LLM endpoint with schema validation, confirmation UI, robust fallbacks, tests.  
**Status:** Planned for v0.5.

### Sprint 6: Scale Readiness & Optional DB Pilot (Week 13)
**Goal:** Mongo adapter behind feature flag, optional dual-write, ops docs.  
**Status:** Planned for v0.6.

### Sprint 7: Polish, Hardening, Final Presentation (Week 14)
**Goal:** Stability, security basics, usability polish, docs/walkthroughs, v1.0 tag.  
**Status:** Planned for final.

---

## 🎤 Week 15: Live Presentation (5 minutes)
**Format:**  
- 0:30 — Overview & problem/solution  
- 2:30 — Demo: add (AI parse) → prioritize → remind → report  
- 1:00 — Agent coordination & fallbacks  
- 0:30 — Reflection & next steps

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20+ and pnpm or npm  
- GitHub account (for Actions/CI)  
- (Optional) MongoDB for stretch goal; (Optional) OpenAI/LLM key for AI parser

### Installation
```bash
# Clone repository
git clone <YOUR_REPO_URL>
cd KanbanBoard

## Run this command to set up the server
python3 -m http.server 8080

# Load by running this into browser
http://localhost:8080/
```

### Testing
```bash
# Run tests
pnpm test       # or: npm test
```
_Test suite includes unit (agents), integration (Coordinator flows), and E2E smoke checks._

---

## 📚 Documentation

See `.context/` for living docs:
- `.context/project-context.md` — architecture decisions & rationale  
- `.context/ai-coordination-strategy.md` — agent roles, events, conflict policy  
- `.context/development-tracking.md` — sprints, daily logs, problems/solutions

Additional diagrams and API docs live in `docs/`.

---

## 🤖 AI Coordination Summary

- **Primary Development Agent:** Cursor (code generation for FE/BE)  
- **Architecture/Design Support:** ChatGPT (frontend), Claude (backend) as structured fallbacks  
- **Coordination Approach:** All AI interventions appended to a shared JSONL log; deterministic human-in-the-loop review before merge (CI-gated).

---

## 📝 License
_TODO: Select a license (e.g., MIT) and add `LICENSE` file._

---

## 👤 Contact
Cem Beyenal — <your@email>

**Course:** CptS 483 Special Topic - Coding with Agentic AI  
**Instructor:** _[Instructor Name]_  
**Semester:** Fall 2025
