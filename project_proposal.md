Part 1: Executive Summary & Vision

Executive Summary

Problem Statement:
Students, early-career developers, and small teams often struggle to keep their personal or collaborative projects organized. While Kanban tools like Trello or Jira exist, they typically require manual task creation, prioritization, and follow-up. This manual effort leads to overlooked deadlines, scattered focus, and reduced productivity — especially for individuals or small groups without a dedicated project manager.

Solution Approach:
TaskBoard – AI-Assisted Kanban Board introduces a web-based task management platform enhanced by multi-agent coordination patterns. Instead of relying on users to handle every detail, specialized software agents collaborate: a Task Parser Agent converts natural-language input into structured tasks, a Priority Agent dynamically adjusts priorities, a Reminder Agent flags urgent deadlines, and a Report Agent summarizes progress weekly. The agents interact through a central coordinator, demonstrating practical, scalable multi-agent design.

Value Proposition:
This solution goes beyond traditional Kanban boards by embedding intelligence directly into the workflow. It reduces the cognitive load of task management, increases adherence to deadlines, and provides clear visibility into progress trends. Unlike conventional tools that are either overly manual or expensive to extend with automation, TaskBoard is approachable, extensible, and demonstrates how multi-agent systems can meaningfully improve common productivity software.

Success Vision:
A successful project delivers a functional, web-deployed Kanban application where these agents collaborate seamlessly. The MVP enables simple yet powerful workflows: typing “Finish project draft by Friday” automatically creates a prioritized task; upcoming deadlines trigger reminders; and weekly reports summarize progress. Success also includes a clean, responsive React UI, a stable Node/Express backend, and well-documented multi-agent modules — making the system both usable and demonstrable as a capstone portfolio piece.

⸻

Target Audience & Use Cases

Primary Users:
	•	Individual developers and students managing class or side projects
	•	Small business teams needing lightweight task organization
	•	Early-stage startups seeking affordable productivity tools with built-in automation

Core Use Cases:
	1.	Quick Task Capture: A student types “Complete lab report by Friday” in natural language; the Task Parser Agent structures it into a task with a due date.
	2.	Dynamic Prioritization: As deadlines near, the Priority Agent automatically promotes certain tasks to “High Priority” status.
	3.	Deadline Monitoring: The Reminder Agent flags a warning two days before due dates and shows badges on urgent tasks.
	4.	Progress Reporting: At the end of the week, the Report Agent generates a dashboard summarizing completed vs. pending tasks.

Real-World Application:
TaskBoard reflects real productivity challenges in industry: distributed teams and independent workers need better automation for managing workloads. Integrating AI-driven multi-agent patterns demonstrates how web apps can evolve to meet industry expectations for smart, context-aware tools.

⸻

Portfolio Positioning

Career Relevance:
This project highlights React + Node full-stack development skills, combined with multi-agent coordination — both in-demand competencies for web engineers and developers working on collaborative platforms. By showcasing agent-driven design, you demonstrate an understanding of distributed, scalable architectures that are relevant for modern SaaS products and workflow automation tools.

Demonstration Value:
Employers or graduate programs will see not just another CRUD-based web app but a coordinated, agent-driven system that bridges the gap between traditional web development and intelligent automation. The integration of rule-based (and later AI-enhanced) agents showcases adaptability and problem-solving skills.

⸻

Track Specialization Identification

Primary Track Focus:
☑ Web Development Track: Focus on frontend/backend integration, API design, real-time task coordination, and extensibility for agent-driven workflows.

Track Description:
The project leverages the Web Development track by combining a responsive React frontend with a modular Node.js backend. Specialized agents are implemented as backend services that interact through a central coordinator, demonstrating how web-based architectures can support intelligent multi-agent patterns. This approach differentiates it from standard web apps by emphasizing coordinated, event-driven logic rather than simple request-response flows.

Track Integration Justification:
By implementing the agents as independent backend modules and integrating them with the React-based UI, this project demonstrates advanced web engineering competencies: state management, API endpoints for agent actions, asynchronous event handling, and scalable coordination patterns. It reflects industry-ready skills in building intelligent web platforms and aligns perfectly with the Web Development specialization.

Part 2: Technical Architecture & Multi-Agent Design

Agent Architecture Design

The TaskBoard – AI-Assisted Kanban Board employs a multi-agent system (MAS) approach in which each agent has a distinct, specialized responsibility but contributes to a shared user-facing workflow. The agents communicate via a coordinator layer running on the backend.

Agent Specifications

The Task Parser Agent is responsible for converting a user’s natural-language input into structured task objects. For example, when a user types “Finish report by Friday,” this agent identifies the task title, sets the due date, and prepares it as a JSON object that the rest of the system can use. It receives raw text as input and returns a well-formed task object with fields such as title, description, due date, and metadata. If the parser cannot interpret the input (for example, if the text is incomplete), it creates a default task with only a title and logs the issue for later review.

The Priority Agent evaluates each task to determine its urgency. Using simple rules at first—such as promoting tasks due within three days to “High Priority”—and potentially more advanced heuristics later, it updates the priority field of each task. It works with the output of the Parser and also responds to user edits or historical completion data. If the Priority Agent fails to respond, the system falls back to a default priority level, and the event is logged for debugging.

The Reminder Agent monitors all active tasks for upcoming deadlines. It continuously scans the shared datastore for tasks whose due dates are approaching and produces alerts or badges in the interface. If the agent is unavailable or delayed, the Coordinator applies a passive fallback—such as simply marking overdue tasks—and records the failure in the system log.

The Report Agent generates weekly summaries of progress. It compiles data such as how many tasks were completed versus how many remain pending, and it highlights trends like increasing workloads or consistently delayed tasks. The output is a structured summary that the frontend uses to render a dashboard. If the agent cannot produce a new report for any reason, the system serves the most recent valid report with a warning note and logs the incident.

⸻

System Coordination Pattern

Workflow Explanation (Textual in place of diagram):
	1.	User Interaction: A user enters a new task or updates an existing one in the React UI.
	2.	Coordinator Trigger: The backend Coordinator service receives the event and first invokes the Task Parser Agent if the input is unstructured text.
	3.	Task Normalization: The parsed task object is stored temporarily in the Coordinator and passed to the Priority Agent, which sets initial priority.
	4.	Data Store Update: Coordinator writes the updated task into the shared JSON-based datastore and signals the frontend via a REST or WebSocket endpoint to update the Kanban board.
	5.	Ongoing Monitoring:
	•	Reminder Agent periodically scans the shared store for approaching deadlines and pushes notifications back through Coordinator.
	•	Report Agent is triggered on schedule (e.g., weekly) to aggregate task history and produce visual summaries.
	6.	Failure & Conflict Handling: If an agent fails or produces conflicting suggestions (e.g., two agents propose different priorities), the Coordinator records both outcomes in the shared log and applies a deterministic priority order (e.g., Priority Agent overrides Reminder’s flags for sorting tasks).

This event-driven, loosely coupled architecture ensures agents can be added, removed, or replaced without breaking the system.

⸻

Scalability Considerations

The architecture is designed for incremental scalability:
	•	Phase 1 (MVP) – JSON Storage:
For speed, clarity, and AI-assistant friendliness, all application state (tasks, users for demo mode, event logs) is persisted as JSON files behind Coordinator APIs. This keeps development friction low, makes state inspection trivial, and simplifies automated code generation via AI tools.
	•	Phase 2 (Scale-Up) – Database Migration:
As concurrency, multi-user needs, and data volume grow, the system will migrate to a database while preserving agent interfaces. Candidate backends include:
	•	MongoDB (document-oriented, aligns closely with existing JSON schemas),
	•	Firebase (managed backend with real-time updates and auth integration), or
	•	PostgreSQL (relational guarantees, strong transactional semantics, and mature analytics).
The Coordinator abstracts persistence behind a data access layer, so agents remain unchanged during the migration. This decoupling lets us adopt MongoDB for flexible schemas, Firebase when real-time sync and turnkey auth are prioritized, or Postgres when relational integrity and complex queries are paramount.
	•	Process & Ops:
Agents start as in-process modules within a Node backend and can later be split into microservices behind the Coordinator when demand warrants. Because communication is event-driven, agent execution won’t block the UI, and scale can be achieved via horizontal replication of the Coordinator with sticky sessions or a shared queue if needed.

⸻

Technology Stack & MCP Integration

Programming Languages:
	•	Frontend: React (JavaScript/TypeScript) for a responsive, component-driven UI.
	•	Backend & Agents: Node.js (JavaScript/TypeScript) for unified language across stack, easy integration with web APIs and JSON storage.
	•	Testing: Jest for backend logic; React Testing Library for frontend components.

MCP (Model Context Protocol) Implementation:
	•	Agents interact with one another via a Coordinator interface that acts as the MCP hub.
	•	Event-based MCP pattern: Each agent subscribes to specific event types and publishes its own outputs. This aligns with scalable MAS designs where agents operate on consistent context without direct inter-agent dependency.
	•	Enables future integration with external LLM APIs for more sophisticated parsing and prioritization without redesigning the architecture.

External APIs/Services:
	•	Optional integration of email or Slack APIs for out-of-app reminders.
	•	Optional OpenAI (or similar) API to enhance natural-language parsing in Task Parser Agent.
	•	Future analytics dashboard could use charting libraries (e.g., Chart.js or D3) for progress visualization.

Database / Storage:
	•	MVP uses JSON files for persistence:
	•	Each agent reads and writes via Coordinator to maintain a consistent schema.
	•	JSON logs allow AI coding assistants to reason about system state.
	•	Migration path to MongoDB or PostgreSQL is planned once scalability demands it.

Testing Strategy:
	•	Unit Tests: Validate each agent’s input/output behavior (e.g., Parser creates correct task fields).
	•	Integration Tests: Simulate task lifecycle (create → prioritize → reminder → report) to ensure agents coordinate correctly.
	•	End-to-End Tests: Use sample user sessions to verify that frontend reflects backend agent actions accurately.
	•	Failure Injection: Deliberately disable one agent during tests to ensure Coordinator’s fallback mechanisms work.

⸻

Professional Practices Integration

AI Coding Workflow:
	•	Cursor is the primary coding agent for generating both frontend and backend code.
	•	If Cursor fails to generate acceptable code:
	•	ChatGPT will be used for frontend code assistance.
	•	Claude will be used for backend code assistance.
	•	If all fail, fallback to another AI service (e.g., Gemini or Grok).
	•	Shared Log File: All agents (Cursor, ChatGPT, Claude) append a structured entry after each coding prompt. This historical log supports debugging, reproducibility, and traceability.

Error Handling:
	•	Coordinator detects missing or malformed outputs from agents.
	•	Fallback logic (e.g., default priority, default notification) keeps the system functional.
	•	Logged warnings facilitate later debugging.

Monitoring & Logging:
	•	Structured logs are maintained both for internal MAS events (task created, priority changed, reminder issued) and for AI coding interventions.
	•	Logs stored alongside JSON datastore for transparency and portability.

Documentation Standards:
	•	All code includes inline comments explaining functionality.
	•	README and system-level docs describe setup, agent responsibilities, and coordination protocols.
	•	Change logs in codebase reflect which AI generated or modified each component.

Code Quality:
	•	Consistent linting (ESLint/Prettier) to maintain readability and professional standards.
	•	Modular design: each agent as a separate Node.js module with clearly defined interfaces.
	•	Version control (Git/GitHub) tracks all commits and supports collaborative AI-human development.

⸻

Summary

This technical architecture defines a practical, extensible multi-agent system suitable for demonstrating both web development competency and intelligent coordination patterns.
By blending modular agents, MCP-style event coordination, JSON-based shared storage, and a log-driven AI coding workflow, the project showcases modern practices in both software engineering and human-AI collaboration.
It is fully aligned with capstone expectations and provides a strong platform for future enhancements (e.g., cloud deployment, advanced AI-driven prioritization, or scaling to multi-user teams).

Part 3: Individual Project Management & Development Planning

Timeline & Sprint Planning (Weeks 8–14)

Strategy: work in small, consistent increments (one focused feature per session), keep the main repo as the source of truth, and publish weekly snapshots to the assignment repo.

⸻

Week 8 — Sprint 1: Foundations & Kanban CRUD (MVP skeleton)

Goals: establish the scaffolding, JSON persistence, and a usable Kanban.
	•	Repo & CI/CD: Initialize main repo (taskboard), set up Node/React workspaces, ESLint/Prettier, Jest + React Testing Library, GitHub Actions (lint + tests on PRs), Vite or CRA for dev server.
	•	Coordinator Skeleton: Create backend Coordinator (Express) with event endpoints: task:created, task:updated, task:deleted.
	•	JSON Persistence (Phase 1): Implement a thin repository interface (read/write JSON files under /data) for tasks and logs.
	•	Kanban UI: Columns (To-Do, In-Progress, Done), create/edit/delete tasks, drag-and-drop between columns.
	•	Dev Log: Add /ai_log/entries.jsonl and a helper script to append entries after each AI-assisted change.
	•	Sprint 1 Demo Prep: Tag release v0.1, publish to assignment repo with a brief CHANGELOG and demo script.

Definition of Done: app runs locally, tasks persist to JSON, basic tests pass, demo-able Kanban.

⸻

Week 9 — Sprint 2: Priority Agent & Data Access Abstraction

Goals: implement rule-based prioritization and lock in storage abstraction for later DB migration.
	•	Priority Agent (Rule-based): Rule set (e.g., due in <3 days → High, <7 days → Medium, otherwise Low).
	•	Coordinator Hooks: On task:created|updated, call Priority Agent, update priority field before persist.
	•	Conflict Policy v1: If UI overrides priority, UI is authoritative; agent suggestions become hints.
	•	Repository Interface: Finalize TaskRepo interface (JSON impl now; DB impl later), no agent talks directly to disk/DB.
	•	UI Signals: Priority badges, sorting toggles, priority filter.
	•	Integration Tests: Lifecycle tests (create → prioritize → persist → render).
	•	Sprint 2 Demo Prep: Tag v0.2, publish snapshot with notes on the future DB swap.

Definition of Done: Priority Agent works deterministically; storage abstraction isolates persistence.

⸻

Week 10 — Sprint 3: Reminder Agent & Notifications UI

Goals: deadline monitoring and user-visible reminders.
	•	Reminder Agent: Use node-cron (or setInterval) to scan due dates, emit alerts (24h/48h presets).
	•	Notification Layer: Coordinator event task:reminder.
	•	UI Badges & Panel: Urgent badges on cards; “Reminders” panel with dismiss/acknowledge.
	•	Settings (MVP): Per-user reminder window (hardcode or simple JSON user config).
	•	E2E Smoke Test: Create task due tomorrow → see alert in UI reliably.
	•	Sprint 3 Demo Prep: Tag v0.3, demo reminders and acknowledge flow.

Definition of Done: reminders show predictably and persist; dismissals are logged.

⸻

Week 11 — Sprint 4: Report Agent & Weekly Dashboard

Goals: weekly summaries, charts, and a stable MVP presentation.
	•	Report Agent: Weekly job aggregates completed vs. pending, average cycle time, burndown trend (simple).
	•	Dashboard: Charts (e.g., Chart.js) for weekly summary, trend line, and priority distribution.
	•	Performance Pass: Basic profiling and memoization (React) to keep UI snappy with 500+ tasks.
	•	Accessibility Sweep: Keyboard navigation for card actions; ARIA labels on Kanban columns.
	•	Documentation (MVP): Update README (install/run/test), architecture overview, agents’ responsibilities, and event list.
	•	Final Presentation (Interim): Tag v0.4, demo a full task lifecycle + agents in action.

Definition of Done: stable weekly report, clear dashboard visuals, MVP narrative ready.

⸻

Week 12 — Sprint 5: AI Task Parser (Gen-AI addition) & Prompt Guardrails

Goals: introduce generative AI only for task creation (per your success criteria) and keep others rule-based.
	•	AI Parser (LLM) Integration: Endpoint /agents/parser/ai that converts natural text → structured task (title, due date, tags).
	•	Prompt Template & Guardrails: Deterministic schema; date normalization; reject ambiguous outputs, fallback to default.
	•	Safety Fallbacks: If AI fails/timeouts → use rule-based parser (very simple) + user edit prompt.
	•	Confidence & Review: Display parsed fields for user confirmation before commit.
	•	Unit & E2E: Test common phrases, edge cases (“Friday” across weekends), and ambiguous inputs.
	•	Sprint 5 Demo Prep: Tag v0.5, demo AI add-task flow end-to-end.

Definition of Done: AI-assisted task creation is reliable with safe fallbacks and user confirmation.

⸻

Week 13 — Sprint 6: Scale Readiness & Optional DB Pilot

Goals: prep for scale and optionally pilot a DB backend while keeping JSON as primary.
	•	Repository Adapters: Implement one DB adapter (choose MongoDB for JSON-native fit) behind TaskRepo.
	•	Dual-Write (Optional): In dev mode, dual-write to JSON + Mongo to validate parity for a subset of operations.
	•	Read Switch (Feature Flag): Env flag DATA_BACKEND=json|mongo for non-breaking toggling.
	•	Operational Docs: Migration checklist, backup/restore procedures, and seeding scripts.
	•	External Notifications (Optional): Slack/email via Coordinator (feature-flagged).
	•	Sprint 6 Demo Prep: Tag v0.6, show adapter swap (JSON → Mongo) with zero agent changes.

Definition of Done: DB adapter is functional behind the abstraction; JSON remains the default.

⸻

Week 14 — Sprint 7: Polish, Hardening, and Final Presentation

Goals: reliability, usability, and professional packaging.
	•	Stability & Bugfixes: Resolve backlog issues, flaky tests, race conditions, and logging noise.
	•	Security Basics: Input validation, rate limiting on agent endpoints, sanitize all user text.
	•	Usability & Fit-and-Finish: Empty states, loading states, keyboard shortcuts (quick add), dark mode (optional).
	•	Docs & Walkthroughs: Architecture diagram (optional), sequence narratives, API reference, and How to Contribute.
	•	Release & Handoff: Tag v1.0, publish final build; weekly assignment repo updated with Week14_Final.
	•	Final Presentation: Live demo script: create → AI parse → prioritize → remind → report.

Definition of Done: production-ready MVP with polished UX, clear documentation, and a confident demo story.

⸻

Individual Development Plan

Personal Role & Responsibilities
I am the sole developer and product owner: requirements, architecture, implementation, tests, docs, and demos. I own the Coordinator, all four agents (Parser, Priority, Reminder, Report), UI, storage abstraction, and deployment/config. I also operate the workflow (branching, CI, releases, assignment snapshots).

Development Tools & Workflow
	•	Repos:
	•	Main: taskboard (source of truth).
	•	Assignment: weekly snapshots (tag → export → push minimal diffs).
	•	Branching: main (stable), feat/*, fix/*. PRs must pass CI (lint/tests) before merge.
	•	Releases: weekly tags (v0.1…v1.0) align with sprints.
	•	Issue Tracking: GitHub Projects (Kanban) for backlog → in-progress → done.
	•	AI Assistants:
	•	Cursor = primary for both FE/BE.
	•	Fallbacks: ChatGPT (frontend), Claude (backend); last resort: Gemini/Grok.
	•	Shared AI Log: every AI session appends an entry (prompt, intent, diff summary, tests result).
	•	Progress Tracking: Close issues with commit references; weekly summary in docs/weekly-notes/week-XX.md.

Development Methodology
	•	Solo Agile (Scrumban): small batch size, strict WIP limits (≤2 active tasks).
	•	Acceptance Criteria per issue; short sessions focused on one outcome.
	•	Weekly Review & Demo: end of each sprint, tag + notes + assignment snapshot.
	•	Risk-Driven Iteration: de-risk core flows early (JSON repo, agent coordination, UI state).

Self-Management Strategy
	•	Timeboxing: multiple short blocks across the week; prioritize one feature per session.
	•	Stand-Up Note (solo): each morning: yesterday/today/blockers; update in weekly-notes.
	•	Accountability: commit daily when working; maintain PR discipline even solo (self-review checklist).
	•	Focus Aids: turn off notifications during 60–90 min build blocks; stop at “green tests.”

⸻

Scope & Feasibility Analysis

Core Features 
	•	Functional Kanban board with create/edit/delete and drag-and-drop columns.
	•	Coordinator with event endpoints; agents integrated via Coordinator (no direct agent-to-agent calls).
	•	JSON storage (Phase 1) behind a repository abstraction.
	•	Rule-based agents: Priority, Reminder, Report.
	•	Gen-AI Task Parser for adding tasks only (your success criterion), with confirmation UI and safe fallbacks.
	•	Tests & Docs: basic unit/integration/E2E coverage, README, and runbook.

Stretch Goals 
	•	DB adapter (MongoDB) behind the repository interface; feature-flagged toggle.
	•	External notifications (Slack/email) via Coordinator.
	•	Tagging, filters, analytics enhancements (cycle time per tag, heatmaps).
	•	Dark mode and keyboard shortcuts.
	•	Authentication (demo account is fine for MVP).

Scope Boundaries 
	•	Mobile apps (native or cross-platform).
	•	Enterprise features: SSO, org/roles/permissions, payments/billing.
	•	Real-time multi-tenant concurrency at large scale (beyond simple demos).
	•	Complex AI autonomy beyond task creation—other agents remain rule-based this term.

Feasibility Validation 
	•	The system is modular: Coordinator + four agents + UI can progress in parallel with small PRs.
	•	JSON-first storage eliminates DB overhead early; the repository abstraction eliminates migration risk later.
	•	Rule-based Priority/Reminder/Report keep complexity low while demonstrating coordination patterns.
	•	The AI Parser is scoped to a single, high-impact use case (adding tasks), with deterministic schema, guardrails, and user confirmation to avoid blocking flows.
	•	Weekly releases (v0.1–v1.0) ensure steady progress, visibility, and time for polish.

Top Risks & Mitigations
	•	LLM parsing ambiguity: require confirmation, fallback to default minimal task.
	•	Reminder timing drift in dev: centralize time source, test with mock clocks.
	•	Data migration surprises: dual-write (optional), parity tests before switching reads.
	•	Scope creep: enforce WIP limits, keep agents rule-based (except Parser), defer integrations behind flags.
	•	Testing debt: include tests in each PR; never merge red CI.

⸻

Part 4: Foundation Phase Integration & Reflection

Concept Integration

Assignment 1 Connection – Building on the AI Tool Ecosystem
This project extends the exploration of AI tools conducted during the Foundation Phase. Earlier investigations focused on understanding the capabilities and limitations of various AI assistants for documentation, code generation, and debugging. In this capstone, those insights have been transformed into a practical development ecosystem in which Cursor serves as the primary coding assistant, with ChatGPT and Claude as structured fallback tools. All interactions are recorded in a shared development log, creating a reproducible and auditable record of human–AI collaboration.

Assignment 2 Evolution – Advancing Beyond Track-Specific System Architecture
The web development architecture introduced during Assignment 2 provided a foundation for separating frontend and backend concerns. This project advances that foundation by introducing an event-driven, MCP-style Coordinator that integrates not only the frontend and backend but also multiple specialized agents. A repository abstraction layer separates application logic from data persistence, initially relying on JSON for simplicity and later supporting migration to databases such as MongoDB, Firebase, or PostgreSQL. This demonstrates architectural foresight and adaptability beyond the baseline track-specific design.

Assignment 3 Advancement – Expanding Multi-Agent Coordination Skills
The multi-agent prototype developed during Assignment 3 was relatively limited, involving a small number of agents exchanging direct calls. The current project evolves this approach by implementing a hub-and-spoke model in which all agents communicate exclusively with a centralized Coordinator. This approach improves modularity, facilitates conflict resolution through deterministic policies, and supports scalable integration of additional agents as the system grows.

Assignment 4 Enhancement – Building on MCP-Integrated Coordination Expertise
Assignment 4 introduced the Model Context Protocol (MCP) for structured, context-driven interaction among components. The current project applies MCP principles throughout the architecture. Each agent subscribes to well-defined events—such as task:created, task:updated, and task:deadlineApproaching—and publishes results back to the Coordinator. This approach ensures reproducibility, loose coupling, and maintainability while reflecting the lessons learned about MCP in the Foundation Phase.

Track-Specific Integration – Demonstrating Advanced Web Development Competency
The project showcases advanced competency in the web development track through the following elements:
	•	A React-based frontend with drag-and-drop Kanban columns, task priority badges, reminder notifications, and a dashboard powered by charting libraries for weekly summaries.
	•	A Node.js/Express backend implementing the Coordinator, exposing REST and WebSocket endpoints, and maintaining a pluggable repository layer that abstracts data persistence.
	•	MCP-style coordination ensuring that agents communicate via standardized events rather than direct coupling.
	•	Code validation practices applied to API inputs and agent outputs to maintain consistency and improve reliability.

These elements collectively demonstrate expertise in both full-stack web development and multi-agent coordination.

⸻

Professional Growth Demonstration

Skill Progression (Weeks 1–7 to Capstone)
The progression from early Foundation Phase assignments to the capstone highlights significant growth. Initial activities involved familiarization with AI tools and basic architectural concepts. Subsequent assignments introduced multi-agent coordination and MCP-based design patterns. The capstone project combines these skills into a cohesive, event-driven multi-agent system integrated with a web application, demonstrating the transition from conceptual learning to applied, production-style implementation.

Professional Practices – Application of Industry Patterns
Two industry-standard patterns are central to this project’s professional practices:
	1.	Code Validation: All task objects and agent outputs undergo schema validation before being processed or stored, ensuring robustness, safety, and simplified debugging.
	2.	MCP Coordination: Agents interact only through the Coordinator’s event hub, allowing for modular development, reproducibility, and future scalability.

By adhering to these practices, the project reflects professional-level engineering standards.

Quality Standards – Demonstrating Professional-Level Development
The project applies a variety of established quality standards, including:
	•	Consistent code style and linting enforced via ESLint and Prettier.
	•	Comprehensive testing at unit, integration, end-to-end, and failure-injection levels to ensure system reliability.
	•	Structured logging of agent decisions and AI-assisted code changes for transparency and traceability.
	•	Version control using a GitHub-based workflow with pull requests, weekly tags, and assignment snapshots to maintain a verifiable history of progress.
	•	Clear documentation including a project README, architectural notes, and an AI development log for future maintainers.

These practices demonstrate a disciplined, professional approach to software engineering and provide a strong foundation for future scalability and maintainability.