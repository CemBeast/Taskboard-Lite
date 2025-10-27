const STORAGE_KEY = "taskboard-lite-v1";
let tasks = loadTasks();

// Helper to extract the main task description (strips 'by ...' or 'due: ...' phrases)
function extractCleanTaskText(text) {
  // Remove 'by <date>' (including by Month DD, by MM/DD, by YYYY-MM-DD, by tomorrow)
  let clean = text.replace(/\bby\s+([a-zA-Z]+\s+\d{1,2}|\d{1,2}[\/\-]\d{1,2}([\/\-]\d{2,4})?|\d{4}-\d{1,2}-\d{1,2}|tomorrow)\b/gi, "");
  // Remove 'due: <date>' or 'due <date>'
  clean = clean.replace(/\bdue\s*[:=]?\s*(\d{4}-\d{2}-\d{2})\b/gi, "");
  // Remove leftover 'by', 'due', or extra spaces
  clean = clean.replace(/\bby\b|\bdue\b/gi, "");
  // Collapse whitespace, trim
  clean = clean.replace(/\s+/g, ' ').trim();
  // Capitalize first letter of each word
  clean = clean.replace(/\b\w/g, c => c.toUpperCase());
  return clean;
}

const form = document.getElementById("task-form");
const input = document.getElementById("task-input");

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;

  // Pass the original, not cleaned, to the prioritizer so 'by...', 'in X days', etc are found
  const newTask = {
    id: Date.now(),
    text: '', // will assign below
    originalText: text, // keep the full user string if ever needed (hidden)
    status: "todo",
  };
  applyPriorityRule(newTask, text);
  // Only after all parsing, clean the label for display
  newTask.text = extractCleanTaskText(text);
  tasks.push(newTask);
  saveTasks();
  render();
  input.value = "";
});

function moveTask(id, newStatus) {
  const task = tasks.find(t => t.id === id);
  if (task) {
    task.status = newStatus;
    saveTasks();
    render();
  }
}

function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  saveTasks();
  render();
}

function render() {
  ["todo", "progress", "done"].forEach(status => {
    const list = document.getElementById(`${status}-list`);
    list.innerHTML = "";
    tasks
      .filter(t => t.status === status)
      .slice()
      .sort((a, b) => priorityRank(a.priority) - priorityRank(b.priority))
      .forEach(t => {
        const li = document.createElement("li");
        li.className = "task";
        // Render text + meta badge (priority + due + days)
        li.innerHTML = `
          <span>${t.text}</span>
          <div class="meta">
            <span class="badge ${badgeClass(t.priority)}">Priority: ${t.priority}</span>
            ${t.dueDate ? `<span class="badge">${t.dueDate}</span>` : ""}
            ${t.daysUntilDue !== null && t.dueDate ? `<span class="badge">Days left: ${t.daysUntilDue}</span>` : ""}
          </div>
          <div>
            ${status !== "todo" ? `<button onclick="moveTask(${t.id}, 'todo')">↩️</button>` : ""}
            ${status !== "progress" ? `<button onclick="moveTask(${t.id}, 'progress')">🚧</button>` : ""}
            ${status !== "done" ? `<button onclick="moveTask(${t.id}, 'done')">✅</button>` : ""}
            <button onclick="deleteTask(${t.id})">🗑️</button>
          </div>
        `;
        list.appendChild(li);
      });
  });
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function loadTasks() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
}

// ===== Rule-based Priority Agent =====
// Looks for "due: YYYY-MM-DD" in task text.
// Priority is based on days to due date: High (<3), Medium (<7), Low otherwise.

function extractDueDate(text) {
  const m = /due\s*:\s*(\d{4}-\d{2}-\d{2})/i.exec(text || "");
  if (!m) return null;
  const d = new Date(m[1] + "T00:00:00");
  return isNaN(d.getTime()) ? null : d;
}

function computePriorityFromDue(dueDate) {
  if (!dueDate) return "Low";
  const today = new Date(); today.setHours(0,0,0,0);
  const days = Math.floor((dueDate - today) / (1000*60*60*24));
  if (days < 3) return "High";
  if (days < 7) return "Medium";
  return "Low";
}

// Parses date strings like 'by 11/2', 'by 2025-11-02', 'by Nov 4', 'by November 11', 'by tomorrow', etc.
function extractDueDateAdvanced(text) {
  // Try 'due: YYYY-MM-DD' first (preserves old behavior)
  let match = /due\s*[:=]?\s*(\d{4}-\d{1,2}-\d{1,2})/i.exec(text || "");
  if (match) {
    const d = new Date(match[1] + "T00:00:00");
    if (!isNaN(d.getTime())) return d;
  }
  // Try MM/DD or MM/DD/YYYY
  match = /by\s+(\d{1,2})[\/-](\d{1,2})([\/-](\d{2,4}))?/i.exec(text || "");
  if (match) {
    // Year fallback: this year, or next year if already passed
    const year = match[4]
      ? (match[4].length === 2 ? 2000 + parseInt(match[4]) : parseInt(match[4]))
      : (() => {
        const now = new Date();
        let candidate = new Date(now.getFullYear(), parseInt(match[1])-1, parseInt(match[2]));
        return candidate < now ? now.getFullYear()+1 : now.getFullYear();
      })();
    const d = new Date(year, parseInt(match[1])-1, parseInt(match[2]));
    if (!isNaN(d.getTime())) return d;
  }
  // Try 'by Month DD'
  match = /by\s+([a-zA-Z]+)\s+(\d{1,2})/i.exec(text || "");
  if (match) {
    const monthNames = ["january","february","march","april","may","june","july","august","september","october","november","december"];
    const monthIdx = monthNames.findIndex(m => m.startsWith(match[1].toLowerCase()));
    if (monthIdx >= 0) {
      const now = new Date();
      let d = new Date(now.getFullYear(), monthIdx, parseInt(match[2]));
      // If passed, use next year
      if (d < now) d = new Date(now.getFullYear()+1, monthIdx, parseInt(match[2]));
      if (!isNaN(d.getTime())) return d;
    }
  }
  // Try 'by tomorrow'
  if (/by\s+tomorrow/i.test(text || "")) {
    const now = new Date();
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate()+1);
    return d;
  }
  // Try 'in X days/weeks/months/years'
  match = /in\s+(\d+)\s*(day|week|month|year)s?/i.exec(text || "");
  if (match) {
    const num = parseInt(match[1]);
    const unit = match[2].toLowerCase();
    const now = new Date();
    let result = new Date(now);
    if (unit === "day") result.setDate(now.getDate() + num);
    if (unit === "week") result.setDate(now.getDate() + num * 7);
    if (unit === "month") result.setMonth(now.getMonth() + num);
    if (unit === "year") result.setFullYear(now.getFullYear() + num);
    if (!isNaN(result.getTime())) return result;
  }
  // Add more NLP rules easily here
  return null;
}

function applyPriorityRule(task, rawText) {
  // Advanced NLP parser for due date; use rawText if provided
  const due = extractDueDateAdvanced(rawText !== undefined ? rawText : task.text);
  task.dueDate = due ? due.toISOString().slice(0,10) : null;
  task.priority = computePriorityFromDue(due);
  // Calculate daysUntilDue only if due exists
  if (due) {
    const today = new Date(); today.setHours(0,0,0,0);
    const timeDiff = due - today; // ms
    const dayDiff = Math.round(timeDiff / (1000*60*60*24));
    task.daysUntilDue = dayDiff;
  } else {
    task.daysUntilDue = null;
  }
}

function priorityRank(p) {
  return p === "High" ? 0 : p === "Medium" ? 1 : 2;
}

function badgeClass(p) {
  if (p === "High") return "high";
  if (p === "Medium") return "med";
  return "low";
}

// Inside your task template:
const metaHtml = `
  <div class="meta">
    <span class="badge ${badgeClass(task.priority)}">Priority: ${task.priority}</span>
    ${task.dueDate ? `<span class="badge">${task.dueDate}</span>` : ""}
  </div>
`;

// Migration for cleaning up old tasks
function migrateTaskTexts() {
  let changed = false;
  tasks.forEach(task => {
    // Use the original input if available for cleaning
    const raw = task.originalText || task.text;
    const clean = extractCleanTaskText(raw);
    if (task.text !== clean && clean.length > 0) {
      task.text = clean;
      changed = true;
    }
  });
  if (changed) {
    saveTasks();
    render();
  }
}

// Run migration on load
migrateTaskTexts();

render();