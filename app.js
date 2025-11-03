const STORAGE_KEY = "taskboard-lite-v1";
let tasks = loadTasks();

// Helper to extract the main task description (strips 'by ...' or 'due: ...' phrases)
function extractCleanTaskText(text) {
  // Remove 'by <date>', e.g. dates, weekdays
  let clean = text.replace(/\bby\s+(next\s+)?(sunday|monday|tuesday|wednesday|thursday|friday|saturday)\b/gi, "");
  clean = clean.replace(/\bby\s+([a-zA-Z]+\s+\d{1,2}|\d{1,2}[\/\-]\d{1,2}([\/\-]\d{2,4})?|\d{4}-\d{1,2}-\d{1,2}|tomorrow)\b/gi, "");
  clean = clean.replace(/\bdue\s*[:=]?\s*(\d{4}-\d{2}-\d{2})\b/gi, "");
  clean = clean.replace(/\(\s*in\s+\d+\s*(day|week|month|year)s?\s*\)/gi, "");
  clean = clean.replace(/in\s+\d+\s*(day|week|month|year)s?/gi, "");
  // Remove leftover 'by', 'due', parentheses, or extra spaces
  clean = clean.replace(/\bby\b|\bdue\b|[()]/gi, "");
  clean = clean.replace(/\s+/g, ' ').trim();
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
    originalText: text, // keep the full user string if ever needed (it is hidden)
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
    // If we're undoing from 'done', and current status is 'done' and newStatus is not 'done', always set to 'in-progress'
    if (task.status === 'done' && newStatus !== 'done') {
      task.status = 'progress';
      delete task.completedDate;
    } else {
      task.status = newStatus;
      if (newStatus === "done") {
        if (!task.completedDate) {
          const d = new Date();
          task.completedDate = d.toISOString().slice(0, 10);
        }
      } else {
        delete task.completedDate;
      }
    }
    saveTasks();
    render();
  }
}

function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  saveTasks();
  render();
}

let editingTaskId = null;

function formatDateYYYYMMDD(d) {
  if (!d) return '';
  const dateObj = (typeof d === 'string') ? new Date(d) : d;
  return dateObj.toISOString().slice(0, 10);
}

function renderDashboard() {
  const section = document.getElementById('dashboard-section');
  if (!section) return;
  const todoCount = tasks.filter(t=>t.status==='todo').length;
  const progCount = tasks.filter(t=>t.status==='progress').length;
  const doneCount = tasks.filter(t=>t.status==='done').length;
  const total = tasks.length;
  const pctDone = total ? Math.round(100*doneCount/total) : 0;
  const avgCompletion = calcAvgCompletionDays();
  const overdue = countOverdueTasks();
  let soonest = getSoonestTasks();
  let soonestLabel = soonest.length ? soonest[0].text : '—';
  let soonestDue = soonest.length && soonest[0].dueDate ? soonest[0].dueDate : '';

  section.innerHTML = `
    <div class="dashboard-grid">
      <div class="dash-block"><div class="dash-title">To-Do</div><div class="dash-value">${todoCount}</div></div>
      <div class="dash-block"><div class="dash-title">In Progress</div><div class="dash-value">${progCount}</div></div>
      <div class="dash-block"><div class="dash-title">Done</div><div class="dash-value dash-done">${doneCount}</div></div>
      <div class="dash-block"><div class="dash-title">Total Tasks</div><div class="dash-value">${total}</div></div>
      <div class="dash-block"><div class="dash-title">% Complete</div><div class="dash-value">${pctDone}%</div></div>
      <div class="dash-block"><div class="dash-title">Avg Completion (days)</div><div class="dash-value">${avgCompletion!==null?avgCompletion:'—'}</div></div>
      <div class="dash-block"><div class="dash-title">Overdue</div><div class="dash-value dash-overdue">${overdue}</div></div>
      <div class="dash-block dash-wide"><div class="dash-title">Soonest Upcoming Task</div><div class="dash-value-small">${soonestLabel} ${soonestDue?`<span class='dashboard-soonest-date'>(Due ${soonestDue})</span>`:''}</div></div>
    </div>
  `;
}

function render() {
  renderDashboard();
  renderReminders();
  ["todo", "progress", "done"].forEach(status => {
    const list = document.getElementById(`${status}-list`);
    list.innerHTML = "";
    tasks
      .filter(t => t.status === status)
      .slice()
      .sort((a, b) => {
        const prio = priorityRank(a.priority) - priorityRank(b.priority);
        if (prio !== 0) return prio;
        if ((a.daysUntilDue !== null && b.daysUntilDue !== null)) {
          return a.daysUntilDue - b.daysUntilDue;
        }
        if (a.daysUntilDue !== null && b.daysUntilDue === null) return -1;
        if (a.daysUntilDue === null && b.daysUntilDue !== null) return 1;
        return a.id - b.id;
      })
      .forEach(t => {
        const li = document.createElement("li");
        li.className = "task";
        if (editingTaskId === t.id) {
          li.innerHTML = `<form class="edit-form" onsubmit="saveEdit(${t.id}); return false;" style="display:flex; gap:0.4em; align-items:center;">
            <input type="text" id="edit-text-${t.id}" value="${t.text}" style="width:34%" disabled>
            <select id="edit-prio-${t.id}" style="width:25%">
              <option value="High" ${t.priority==='High'?'selected':''}>High</option>
              <option value="Medium" ${t.priority==='Medium'?'selected':''}>Medium</option>
              <option value="Low" ${t.priority==='Low'?'selected':''}>Low</option>
            </select>
            <input type="date" id="edit-date-${t.id}" value="${t.dueDate ? formatDateYYYYMMDD(t.dueDate) : ''}" style="width:25%">
            <button type="submit">Save</button>
            <button type="button" onclick="cancelEdit()">Cancel</button>
          </form>`;
        } else {
          li.innerHTML = `
          <span class="task-title">${t.text}</span>
          <div class="details">
            <span class="badge ${badgeClass(t.priority)}">Priority: ${t.priority}</span>
            ${t.dueDate ? `<span class="badge badge-date">Due: ${t.dueDate}</span>` : ""}
            ${status !== "done" && t.daysUntilDue !== null && t.dueDate ? `<span class="badge badge-days">Days left: ${t.daysUntilDue}</span>` : ""}
            ${status === "done" && t.completedDate ? `<span class="badge badge-completed">Completed: ${t.completedDate}</span>` : ""}
          </div>
          <div class="actions">
            <button class="icon-btn" title="Edit" onclick="editTask(${t.id})">
              <svg class="icon" viewBox="0 0 20 20"><path d="M4 13.5V16h2.5L15.81 6.69a1 1 0 0 0 0-1.41l-1.09-1.09a1 1 0 0 0-1.41 0L4 13.5z" stroke="var(--brand)"/></svg>
            </button>
            ${status !== "todo" ? `<button class="icon-btn" title="Move to To-Do" onclick="moveTask(${t.id}, 'todo')">
              <svg class="icon" viewBox="0 0 20 20"><path d="M15 9v6a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V9" stroke="var(--brand-2)"/><path d="M7 10l3-3 3 3M10 3v8" stroke="var(--brand-2)"/></svg>
            </button>` : ""}
            ${status !== "progress" ? `<button class="icon-btn" title="Move to In Progress" onclick="moveTask(${t.id}, 'progress')">
              <svg class="icon" viewBox="0 0 20 20"><circle cx="10" cy="10" r="7.5" stroke="var(--accent)" /><path d="M10 5.5v4l3 3" stroke="var(--accent)"/></svg>
            </button>` : ""}
            ${status !== "done" ? `<button class="icon-btn" title="Mark as Done" onclick="moveTask(${t.id}, 'done')">
              <svg class="icon" viewBox="0 0 20 20"><path d="M5 11l4 4 6-8" stroke="var(--ok)"/></svg>
            </button>` : ""}
            <button class="icon-btn" title="Delete" onclick="deleteTask(${t.id})">
              <svg class="icon" viewBox="0 0 20 20"><rect x="6.5" y="8.5" width="1" height="5" rx=".5" fill="var(--danger)"/><rect x="12.5" y="8.5" width="1" height="5" rx=".5" fill="var(--danger)"/><rect x="8" y="2.5" width="4" height="2" rx="1" fill="var(--panel)" stroke="var(--danger)"/><rect x="4" y="5" width="12" height="10" rx="2" stroke="var(--danger)" fill="none" /></svg>
            </button>
          </div>
          `;
        }
        list.appendChild(li);
      });
  });
  renderPriorityThresholds();
}

function editTask(id) {
  editingTaskId = id;
  render();
}

function cancelEdit() {
  editingTaskId = null;
  render();
}

window.editTask = editTask;
window.cancelEdit = cancelEdit;

window.saveEdit = function(id) {
  const t = tasks.find(t => t.id === id);
  if (!t) return;
  // Only allow editing priority and date (not label here)
  const prio = document.getElementById("edit-prio-"+id).value;
  const dateStr = document.getElementById("edit-date-"+id).value;
  t.priority = prio;
  t.dueDate = dateStr || null;
  if (dateStr) {
    const d = new Date(dateStr);
    const today = new Date(); today.setHours(0,0,0,0);
    t.daysUntilDue = Math.round((d - today) / (1000*60*60*24));
    // Optionally: re-derive priority from due date (uncomment if you want)
    // t.priority = computePriorityFromDue(d);
  } else {
    t.daysUntilDue = null;
    t.dueDate = null;
  }
  saveTasks();
  editingTaskId = null;
  render();
};

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

// Priority thresholds
const PRIORITY_SETTINGS_KEY = "taskboard-priority-thresholds-v1";
function loadPriorityThresholds() {
  return JSON.parse(localStorage.getItem(PRIORITY_SETTINGS_KEY) ||
    JSON.stringify({ high: 3, med: 7, low: 14 }));
}
function savePriorityThresholds(obj) {
  localStorage.setItem(PRIORITY_SETTINGS_KEY, JSON.stringify(obj));
}
let priorityThresholds = loadPriorityThresholds();

// Update computePriorityFromDue to use user thresholds
function computePriorityFromDue(dueDate) {
  if (!dueDate) return "Low";
  const today = new Date(); today.setHours(0,0,0,0);
  const days = Math.floor((dueDate - today) / (1000*60*60*24));
  if (days <= priorityThresholds.high) return "High";
  if (days <= priorityThresholds.med) return "Medium";
  if (days <= priorityThresholds.low) return "Low";
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
  // Try 'by <weekday>' or 'by next <weekday>'
  match = /by\s+(next\s+)?(sunday|monday|tuesday|wednesday|thursday|friday|saturday)/i.exec(text || "");
  if (match) {
    const weekdays = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    const now = new Date();
    const todayIdx = now.getDay();
    const targetIdx = weekdays.findIndex(day => day.startsWith(match[2].toLowerCase()));
    let daysToAdd = (targetIdx - todayIdx + 7) % 7;
    // If no 'next' and daysToAdd is 0 (today), go to next week's day
    if (!match[1] && daysToAdd === 0) daysToAdd = 7;
    // If 'next ...', always get the week after
    if (match[1]) daysToAdd = daysToAdd === 0 ? 7 : daysToAdd + 7;
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + daysToAdd);
    if (!isNaN(d.getTime())) return d;
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

function getSoonestTasks() {
  // Only tasks with a due date, not done
  return tasks
    .filter(t => t.status !== 'done' && t.dueDate)
    .slice()
    .sort((a, b) => {
      // Earliest due date first
      return new Date(a.dueDate) - new Date(b.dueDate);
    })
    .slice(0, 5);
}

function renderReminders() {
  const list = document.getElementById('reminders-list');
  if (!list) return;
  list.innerHTML = '';
  const soonest = getSoonestTasks();
  if (soonest.length === 0) {
    list.innerHTML = '<li class="none">No upcoming tasks with due dates!</li>';
    return;
  }
  soonest.forEach(t => {
    const li = document.createElement('li');
    li.innerHTML = `
      <strong>${t.text}</strong>
      <span class="reminder-due">${t.dueDate ? `Due: ${t.dueDate}` : ''}</span>
      ${t.daysUntilDue !== null && t.dueDate ? `<span class="reminder-days">(${t.daysUntilDue} days left)</span>` : ''}
    `;
    li.className = 'reminder-task';
    list.appendChild(li);
  });
}

function calcAvgCompletionDays() {
  // Find tasks that are 'done' and have a completedDate and dueDate
  const completed = tasks.filter(t => t.status === 'done' && t.completedDate);
  if (completed.length === 0) return null;
  let totalDays = 0;
  let count = 0;
  completed.forEach(t => {
    if (t.completedDate) {
      // Prefer dueDate if present, else use task id (creation) as start
      let startDate = t.dueDate ? new Date(t.dueDate) : new Date(Number(t.id));
      let endDate = new Date(t.completedDate);
      let days = Math.round((endDate - startDate)/(1000*60*60*24));
      if (!isNaN(days)) {
        totalDays += Math.abs(days);
        count++;
      }
    }
  });
  return count === 0 ? null : (totalDays / count).toFixed(2);
}

function countOverdueTasks() {
  const today = new Date(); today.setHours(0,0,0,0);
  return tasks.filter(t => t.status !== 'done' && t.dueDate && new Date(t.dueDate) < today).length;
}

function renderPriorityThresholds() {
  const disp = document.getElementById('priority-display');
  if (!disp) return;
  // Set editable spans for high, med, and low
  disp.querySelector('[data-prio="high"]').innerHTML = `<span class="priority-num" data-edit="high">${priorityThresholds.high}</span>`;
  disp.querySelector('[data-prio="med"]').innerHTML = `<span class="priority-num" data-edit="med">${priorityThresholds.med}</span>`;
  disp.querySelector('[data-prio="low"]').innerHTML = `<span class="priority-num" data-edit="low">${priorityThresholds.low}</span>`;
  document.querySelectorAll('.priority-num').forEach(span => {
    span.onclick = function() {
      if (disp.querySelector('input')) return; // Only 1 edit at a time
      const prio = this.getAttribute('data-edit');
      const oldVal = priorityThresholds[prio];
      const input = document.createElement('input');
      input.type = 'number';
      input.value = oldVal;
      input.min = 1;
      input.className = 'priority-edit-input';
      input.style.width = '54px';
      input.onblur = input.onkeydown = evt => {
        if (evt.type === 'keydown' && evt.key !== 'Enter') return;
        let high = parseInt(disp.querySelector('[data-edit="high"] input')?.value||priorityThresholds.high, 10);
        let med = parseInt(disp.querySelector('[data-edit="med"] input')?.value||priorityThresholds.med, 10);
        let low = parseInt(disp.querySelector('[data-edit="low"] input')?.value||priorityThresholds.low, 10);
        if (prio==='high') high = parseInt(input.value||oldVal,10);
        if (prio==='med') med = parseInt(input.value||oldVal,10);
        if (prio==='low') low = parseInt(input.value||oldVal,10);
        const err = document.getElementById("priority-error");
        if (!(high > 0 && med > high && low > med)) {
          err.textContent = 'Require: 0 < High < Medium < Low (days)';
          err.style.display = '';
          input.focus();
          return;
        }
        err.textContent = '';
        err.style.display = 'none';
        priorityThresholds = { high, med, low };
        savePriorityThresholds(priorityThresholds);
        renderPriorityThresholds();
        render(); // Re-render rest of UI (for prio update)
      };
      this.replaceWith(input);
      input.focus();
      input.select();
    };
  });
}

document.addEventListener('DOMContentLoaded', () => {
  renderPriorityThresholds();
});

render();
