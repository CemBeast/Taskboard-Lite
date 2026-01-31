const STORAGE_KEY_PREFIX = "taskboard-lite-v1";
const USE_AI = true; // Set to true to use AI, false to use NLP rules

// Add debug mode at top
const DEBUG_MODE = false;

// Helper function to get user-specific storage key
function getUserStorageKey() {
  if (!currentUser) {
    console.warn('⚠️ No user logged in, using default storage key');
    return STORAGE_KEY_PREFIX;
  }
  return `${STORAGE_KEY_PREFIX}-${currentUser.uid}`;
}

// ===== AUTHENTICATION CHECK =====
let currentUser = null;
let tasks = [];

auth.onAuthStateChanged((user) => {
  if (user) {
    console.log('✅ Logged in:', user.email);
    currentUser = user;
    
    // Display user email
    const userEmailEl = document.getElementById('user-email');
    if (userEmailEl) {
      userEmailEl.textContent = user.email;
    }
    
    // Initialize app after authentication
    tasks = loadTasks();
    ensurePriorityLockFlag();
    render();
    
    // Load notification settings UI
    renderNotificationSettings();
    
    // Check for upcoming tasks (automatic notification on load)
    setTimeout(() => {
      checkForUpcomingTasks();
    }, 1000); // Wait 1 second after load to check
  } else {
    console.log('❌ Not logged in, redirecting...');
    window.location.href = 'auth.html';
  }
});

// Logout function
window.logout = async function() {
  if (confirm('Are you sure you want to sign out?')) {
    try {
      await auth.signOut();
      console.log('✅ User logged out');
      window.location.href = 'auth.html';
    } catch (error) {
      console.error('❌ Logout error:', error);
      alert('Failed to logout. Please try again.');
    }
  }
};

// ===== NOTIFICATION SYSTEM =====

// Get user-specific notification settings key
function getNotificationSettingsKey() {
  if (!currentUser) return 'notification-settings-default';
  return `notification-settings-${currentUser.uid}`;
}

// Load notification settings
function loadNotificationSettings() {
  const key = getNotificationSettingsKey();
  const settings = localStorage.getItem(key);
  return settings ? JSON.parse(settings) : { enabled: false, time: '09:00', daysAhead: 1 };
}

// Save notification settings
function saveNotificationSettings(settings) {
  const key = getNotificationSettingsKey();
  localStorage.setItem(key, JSON.stringify(settings));
  console.log('💾 Notification settings saved:', settings);
}

// Request notification permission
async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    alert('This browser does not support notifications');
    return false;
  }
  
  if (Notification.permission === 'granted') {
    return true;
  }
  
  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  
  return false;
}

// Check for upcoming tasks and send notification
function checkForUpcomingTasks() {
  const settings = loadNotificationSettings();
  
  if (!settings.enabled) {
    console.log('🔕 Notifications disabled by user');
    return;
  }
  
  if (Notification.permission !== 'granted') {
    console.log('⚠️ Notification permission not granted');
    return;
  }
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const daysAhead = settings.daysAhead || 1;
  
  // Find tasks due within the specified days
  const upcomingTasks = tasks.filter(t => {
    if (!t.dueDate || t.status === 'done') return false;
    
    const dueDate = new Date(t.dueDate + 'T00:00:00');
    dueDate.setHours(0, 0, 0, 0);
    
    const diffDays = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
    return diffDays <= daysAhead && diffDays >= 0;
  });
  
  if (upcomingTasks.length === 0) {
    console.log('✅ No tasks due soon');
    new Notification('TaskBoard Lite', {
      body: '✅ All clear! No tasks due soon.',
      icon: '🎯',
      tag: 'taskboard-reminder'
    });
    return;
  }
  
  // Group by days until due
  const tasksByDays = {};
  upcomingTasks.forEach(t => {
    const dueDate = new Date(t.dueDate + 'T00:00:00');
    dueDate.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
    if (!tasksByDays[diffDays]) tasksByDays[diffDays] = [];
    tasksByDays[diffDays].push(t);
  });
  
  // Send notifications
  Object.keys(tasksByDays).forEach(days => {
    const dayTasks = tasksByDays[days];
    const dayLabel = days == 0 ? 'today' : days == 1 ? 'tomorrow' : `in ${days} days`;
    
    dayTasks.forEach(task => {
      new Notification(`⚠️ Task due ${dayLabel}`, {
        body: `${task.text}\nPriority: ${task.priority || 'Not set'}`,
        icon: '🔔',
        tag: `task-${task.id}`,
        requireInteraction: false
      });
    });
  });
  
  console.log(`🔔 Sent ${upcomingTasks.length} notification(s)`);
}

// Manual check reminders button
window.checkRemindersNow = async function() {
  const settings = loadNotificationSettings();
  
  if (!settings.enabled) {
    const enable = confirm('Notifications are disabled. Would you like to enable them?');
    if (enable) {
      const granted = await requestNotificationPermission();
      if (granted) {
        settings.enabled = true;
        saveNotificationSettings(settings);
        renderNotificationSettings();
      } else {
        alert('Please allow notifications in your browser settings');
        return;
      }
    } else {
      return;
    }
  }
  
  if (Notification.permission !== 'granted') {
    const granted = await requestNotificationPermission();
    if (!granted) {
      alert('Please allow notifications in your browser settings');
      return;
    }
  }
  
  checkForUpcomingTasks();
};

// Test notification button (for debugging)
window.sendTestNotification = async function() {
  console.log('=== NOTIFICATION DEBUG ===');
  
  // Check if browser supports notifications
  if (!('Notification' in window)) {
    alert('❌ Your browser does not support notifications.\n\nTry:\n- Chrome\n- Firefox\n- Safari\n- Edge');
    console.error('Notification API not supported');
    return;
  }
  console.log('✅ Browser supports notifications');
  
  // Check current permission status
  console.log('Current permission:', Notification.permission);
  
  if (Notification.permission === 'denied') {
    alert('❌ Notifications are BLOCKED!\n\nTo fix:\n1. Click the lock icon 🔒 in address bar\n2. Find "Notifications"\n3. Change to "Allow"\n4. Refresh the page');
    return;
  }
  
  if (Notification.permission !== 'granted') {
    console.log('Requesting permission...');
    alert('You will now be asked to allow notifications.\n\nClick "Allow" when the browser asks!');
    
    const permission = await Notification.requestPermission();
    console.log('Permission result:', permission);
    
    if (permission !== 'granted') {
      alert('❌ Permission denied!\n\nTo enable:\n1. Click lock icon 🔒 in address bar\n2. Allow notifications\n3. Refresh page');
      return;
    }
  }
  
  console.log('✅ Permission granted, sending test notification...');
  
  try {
    const notification = new Notification('🎯 TaskBoard Test', {
      body: 'Success! This is where notifications appear.\nCheck the corner of your screen!',
      requireInteraction: false,
      silent: false
    });
    
    console.log('✅ Notification created:', notification);
    
    notification.onclick = function() {
      console.log('Notification clicked!');
      window.focus();
    };
    
    alert('✅ Test notification sent!\n\n📍 Look at the CORNER of your screen:\n• Mac: Top-right\n• Windows: Bottom-right\n• Linux: Top-right\n\nIt appears OUTSIDE the browser window!');
  } catch (error) {
    console.error('❌ Error creating notification:', error);
    alert('❌ Error: ' + error.message);
  }
};

// Toggle notifications on/off
window.toggleNotifications = async function(enabled) {
  const settings = loadNotificationSettings();
  
  if (enabled) {
    const granted = await requestNotificationPermission();
    if (!granted) {
      alert('Please allow notifications in your browser settings');
      document.getElementById('notification-enabled').checked = false;
      return;
    }
  }
  
  settings.enabled = enabled;
  saveNotificationSettings(settings);
  console.log(`🔔 Notifications ${enabled ? 'enabled' : 'disabled'}`);
};

// Update notification time
window.updateNotificationTime = function(time) {
  const settings = loadNotificationSettings();
  settings.time = time;
  saveNotificationSettings(settings);
};

// Update days ahead
window.updateDaysAhead = function(days) {
  const settings = loadNotificationSettings();
  settings.daysAhead = parseInt(days) || 1;
  saveNotificationSettings(settings);
};

// Render notification settings UI
function renderNotificationSettings() {
  const settings = loadNotificationSettings();
  const settingsEl = document.getElementById('notification-settings-container');
  
  if (settingsEl) {
    document.getElementById('notification-enabled').checked = settings.enabled;
    document.getElementById('notification-time').value = settings.time;
    document.getElementById('notification-days').value = settings.daysAhead;
  }
};

// Helper to extract the main task description (strips 'by ...' or 'due: ...' phrases)
function extractCleanTaskText(text) {
  // Remove 'by next week/month/year' first (before weekday parsing)
  let clean = text.replace(/\bby\s+next\s+(week|month|year)\b/gi, "");
  // Remove 'by <date>', e.g. dates, weekdays
  clean = clean.replace(/\bby\s+(next\s+)?(sunday|monday|tuesday|wednesday|thursday|friday|saturday)\b/gi, "");
  clean = clean.replace(/\bby\s+today\b/gi, ""); // Remove 'by today' specifically
  clean = clean.replace(/\bby\s+([a-zA-Z]+\s+\d{1,2}|\d{1,2}[\/\-]\d{1,2}([\/\-]\d{2,4})?|\d{4}-\d{1,2}-\d{1,2}|tomorrow)\b/gi, "");
  clean = clean.replace(/\bdue\s*[:=]?\s*(\d{4}-\d{2}-\d{2})\b/gi, "");
  clean = clean.replace(/\(\s*in\s+\d+\s*(day|week|month|year)s?\s*\)/gi, "");
  clean = clean.replace(/in\s+\d+\s*(day|week|month|year)s?/gi, "");
  // Remove leftover 'by', 'due', parentheses, or extra spaces
  clean = clean.replace(/\bby\b|\bdue\b|[()]/gi, "");
  clean = clean.replace(/\s+/g, ' ').trim();
  if (clean.length > 0) {
    clean = clean.charAt(0).toUpperCase() + clean.slice(1);
  }
  return clean;
}

const form = document.getElementById("task-form");
const input = document.getElementById("task-input");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;

  // Disable input while processing
  input.disabled = true;
  const submitBtn = form.querySelector('button');
  const originalBtnText = submitBtn.textContent;
  submitBtn.textContent = 'Processing...';

  try {
    const newTask = {
      id: Date.now(), // This is the creation timestamp
      text: '', // will assign below
      originalText: text, // keep the full user string if ever needed
      status: "todo",
      createdDate: new Date().toISOString().split('T')[0], // Store creation date
      priorityLocked: true, // lock priority until user edits task
      manualPriority: false // indicator flips to true only when user explicitly changes priority
    };

    console.log('📥 Creating new task from input:', text);
    console.log('🕐 Task created at:', new Date(newTask.id).toLocaleString());

    if (USE_AI && typeof parseTaskWithAI === 'function') {
      console.log('🤖 Using AI to parse task...');
      // Use AI to parse task
      const aiResult = await parseTaskWithAI(text);
      console.log('✅ AI parsing complete:', aiResult);
      
      // Ensure only first letter is capitalized
      let cleanText = aiResult.cleanText || text;
      if (cleanText.length > 0) {
        cleanText = cleanText.charAt(0).toUpperCase() + cleanText.slice(1).toLowerCase();
      }
      newTask.text = cleanText;
      
      if (aiResult.dueDate) {
        newTask.dueDate = aiResult.dueDate;
        const dueDate = new Date(aiResult.dueDate + 'T00:00:00');
        const today = new Date(); 
        today.setHours(0, 0, 0, 0);
        newTask.daysUntilDue = Math.round((dueDate - today) / (1000*60*60*24));
        
        // Calculate priority based on current thresholds
        newTask.priority = computePriorityFromDue(dueDate);
        console.log('📅 Due date set:', aiResult.dueDate, '(', newTask.daysUntilDue, 'days until due)', 'Priority:', newTask.priority);
      } else {
        newTask.dueDate = null;
        newTask.daysUntilDue = null;
        newTask.priority = "Low"; // No due date = Low priority
        console.log('📅 No due date found, priority set to Low');
      }
    } else {
      console.log('⚙️ Using fallback NLP rules...');
      // Fallback to NLP rules
      applyPriorityRule(newTask, text);
      newTask.text = extractCleanTaskText(text);
    }

    console.log('💾 Saving task:', newTask);
    tasks.push(newTask);
    saveTasks();
    render();
    input.value = "";
    console.log('✨ Task added successfully!');
  } catch (error) {
    console.error('❌ Error processing task:', error);
    alert('Failed to process task. Please try again.');
  } finally {
    // Re-enable input
    input.disabled = false;
    submitBtn.textContent = originalBtnText;
  }
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
  // Recalculate priorities and update daysUntilDue for all tasks
  // This ensures priorities reflect current thresholds and time changes
  recalculateAllTaskPriorities();
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
          li.innerHTML = `<form class="edit-form" id="edit-form-${t.id}" onsubmit="console.log('Form submit triggered!'); saveEdit(event, ${t.id}); return false;" style="display: flex; flex-direction: column; gap:1em; align-items: flex-start;">
          <label style="font-size:.97em; color:#bccaff; font-weight:700; margin-bottom:3px;">Task
            <input type="text" name="text" data-field="text" id="edit-text-${t.id}" value="${t.text}" style="width:260px; margin-top:3px;">
          </label>
          <label style="font-size:.97em; color:#bccaff; font-weight:700; margin-bottom:3px;">Priority
            <select name="priority" data-field="priority" id="edit-prio-${t.id}" style="width:160px; margin-top:3px;">
              <option value="High" ${t.priority==='High'?'selected':''}>High</option>
              <option value="Medium" ${t.priority==='Medium'?'selected':''}>Medium</option>
              <option value="Low" ${t.priority==='Low'?'selected':''}>Low</option>
            </select>
          </label>
          <label style="font-size:.97em; color:#bccaff; font-weight:700; margin-bottom:3px;">Due Date
            <input type="date" name="dueDate" data-field="dueDate" id="edit-date-${t.id}" value="${t.dueDate ? formatDateYYYYMMDD(t.dueDate) : ''}" style="width:170px; margin-top:3px;">
          </label>
          <label style="font-size:.97em; color:#bccaff; font-weight:700; margin-bottom:3px;">Assigned
            <input type="date" name="createdDate" data-field="createdDate" id="edit-created-${t.id}" value="${t.createdDate ? formatDateYYYYMMDD(t.createdDate) : ''}" style="width:170px; margin-top:3px;" title="Edit Date Assigned">
          </label>
          <div style="display:flex; gap:10px; margin-top:5px;">
            <button type="submit">Save</button>
            <button type="button" onclick="cancelEdit()">Cancel</button>
          </div>
        </form>`;
        } else {
          const overdue = isTaskOverdue(t);
          const dueToday = isTaskDueToday(t);
          // Determine task class: overdue takes priority, then due today
          let taskClass = "task";
          if (overdue) {
            taskClass = "task task-overdue";
          } else if (dueToday) {
            taskClass = "task task-due-today";
          }
          li.className = taskClass;
          li.innerHTML = `
          <span class="task-title">${t.text}</span>
          ${DEBUG_MODE ? `<div class="meta" style="color:#8895bf; font-size:12px; margin:3px 0 0 1px;"><strong>Debug:</strong> Assigned: ${t.createdDate ? t.createdDate : '[N/A]'} &nbsp; | &nbsp; Due: ${t.dueDate ? t.dueDate : '[N/A]'}</div>` : ''}
          <div class="details">
            <span class="badge ${badgeClass(t.priority)}">Priority: ${t.priority}</span>
            ${t.dueDate ? `<span class="badge badge-date">Due: ${t.dueDate}</span>` : ""}
            <span class="badge badge-created" title="Date Assigned">Assigned: ${t.createdDate ? formatDateYYYYMMDD(t.createdDate) : ''}</span>
            ${status !== "done" && t.daysUntilDue !== null && t.dueDate ? (
              overdue 
                ? `<span class="badge badge-overdue">Overdue</span>` 
                : dueToday
                ? `<span class="badge badge-due-today">Due Today</span>`
                : `<span class="badge badge-days">Days left: ${t.daysUntilDue}</span>`
            ) : ""}
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
            ${status === "done" ? `<button class="icon-btn" title="Delete" onclick="deleteTask(${t.id})">
              <svg class="icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="var(--danger)" stroke-width="2">
                <rect x="4" y="8" width="16" height="10" rx="2" fill="none"/>
                <path d="M9 11v4M12 11v4M15 11v4"/>
                <path d="M8 8V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                <line x1="2" y1="8" x2="22" y2="8"/>
              </svg>
            </button>` : ""}
            ${status !== "done" ? `<button class="icon-btn" title="Delete" onclick="deleteTask(${t.id})">
              <svg class="icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="var(--danger)" stroke-width="2">
                <rect x="4" y="8" width="16" height="10" rx="2" fill="none"/>
                <path d="M9 11v4M12 11v4M15 11v4"/>
                <path d="M8 8V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                <line x1="2" y1="8" x2="22" y2="8"/>
              </svg>
            </button>` : ""}
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

// Test that saveEdit is accessible
console.log('✅ saveEdit function attached to window:', typeof window.saveEdit);

window.saveEdit = function(evt, id) {
  console.log('🔥 saveEdit FUNCTION CALLED! Event:', evt, 'ID:', id);
  
  if (evt && typeof evt.preventDefault === 'function') {
    evt.preventDefault();
    evt.stopPropagation();
  }
  
  const task = tasks.find(t => t.id === id);
  if (!task) {
    console.error('❌ Task not found:', id);
    return;
  }
  
  console.log('📝 saveEdit called for task:', task.text, 'Current priority:', task.priority);
  
  // Get form element
  const formEl =
    (evt && evt.currentTarget) ||
    (evt && evt.target && typeof evt.target.closest === 'function' ? evt.target.closest('form') : null) ||
    document.getElementById(`edit-form-${id}`);
  
  if (!formEl) {
    console.error('❌ Edit form not found for task:', id);
    return;
  }
  
  console.log('📋 Form element found:', formEl);
  
  // Get the priority dropdown directly
  const prioritySelect = document.getElementById(`edit-prio-${id}`);
  const selectedPriority = prioritySelect ? prioritySelect.value : null;
  
  console.log('🎯 Priority dropdown value:', selectedPriority);
  console.log('🎯 Original priority:', task.priority);
  
  // Update text
  const textInput = document.getElementById(`edit-text-${id}`);
  const newText = textInput ? textInput.value.trim() : task.text;
  if (newText && newText !== task.text) {
    task.text = newText;
  }
  
  // Update due date
  const dateInput = document.getElementById(`edit-date-${id}`);
  const dateStr = dateInput ? dateInput.value : null;
  task.dueDate = dateStr ? dateStr : null;
  
  // Update assigned date
  const createdInput = document.getElementById(`edit-created-${id}`);
  const createdStr = createdInput ? createdInput.value : null;
  if (createdStr) {
    task.createdDate = createdStr;
  }
  
  // Priority handling - ALWAYS apply the selected priority
  if (selectedPriority) {
    const originalPriority = task.priority;
    task.priority = selectedPriority;
    task.priorityLocked = true;
    
    if (selectedPriority !== originalPriority) {
      task.manualPriority = true;
      console.log(`✏️ Priority manually changed from ${originalPriority} to ${selectedPriority} for task: ${task.text}`);
    } else {
      console.log(`➡️ Priority unchanged: ${selectedPriority}`);
    }
  }
  
  console.log('💾 Saving task with priority:', task.priority);
  
  saveTasks();
  editingTaskId = null;
  render();
  
  console.log('✅ Task saved and rendered');
};

function saveTasks() {
  const storageKey = getUserStorageKey();
  localStorage.setItem(storageKey, JSON.stringify(tasks));
  console.log(`💾 Saved ${tasks.length} tasks for user: ${storageKey}`);
}

function loadTasks() {
  const storageKey = getUserStorageKey();
  const loadedTasks = JSON.parse(localStorage.getItem(storageKey) || "[]");
  console.log(`📂 Loaded ${loadedTasks.length} tasks for user: ${storageKey}`);
  return loadedTasks;
}

function ensurePriorityLockFlag() {
  let changed = false;
  tasks.forEach(task => {
    if (task.priorityLocked === undefined) {
      task.priorityLocked = true;
      changed = true;
    }
    if (task.manualPriority === undefined) {
      task.manualPriority = false;
      changed = true;
    }
  });
  if (changed) {
    saveTasks();
  }
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
  const stored = JSON.parse(localStorage.getItem(PRIORITY_SETTINGS_KEY));
  if (stored) {
    // Migrate old format (with low) to new format (without low)
    if (stored.low !== undefined) {
      delete stored.low;
      savePriorityThresholds(stored);
    }
    return stored;
  }
  return { high: 3, med: 7 };
}
function savePriorityThresholds(obj) {
  localStorage.setItem(PRIORITY_SETTINGS_KEY, JSON.stringify(obj));
}
let priorityThresholds = loadPriorityThresholds();

// Update computePriorityFromDue to use user thresholds
// Anything above Medium threshold defaults to Low priority
function computePriorityFromDue(dueDate) {
  if (!dueDate) return "Low";
  const today = new Date(); today.setHours(0,0,0,0);
  const days = Math.floor((dueDate - today) / (1000*60*60*24));
  if (days <= priorityThresholds.high) return "High";
  if (days <= priorityThresholds.med) return "Medium";
  return "Low"; // Everything above Medium threshold is Low priority
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
  // Try 'by today' - check early to avoid conflicts with weekday/month parsing
  if (/by\s+today\b/i.test(text || "")) {
    const now = new Date();
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return d;
  }
  // Try 'by tomorrow'
  if (/by\s+tomorrow\b/i.test(text || "")) {
    const now = new Date();
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate()+1);
    return d;
  }
  // Try 'by next week'
  if (/by\s+next\s+week\b/i.test(text || "")) {
    const now = new Date();
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7);
    return d;
  }
  // Try 'by next month'
  if (/by\s+next\s+month\b/i.test(text || "")) {
    const now = new Date();
    const d = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
    return d;
  }
  // Try 'by next year'
  if (/by\s+next\s+year\b/i.test(text || "")) {
    const now = new Date();
    const d = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
    return d;
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
  // Note: Must check after "by next week/month/year" to avoid conflicts
  match = /by\s+(next\s+)?(sunday|monday|tuesday|wednesday|thursday|friday|saturday)\b/i.exec(text || "");
  if (match) {
    const weekdays = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    const now = new Date();
    const todayIdx = now.getDay();
    const targetIdx = weekdays.findIndex(day => day.startsWith(match[2].toLowerCase()));
    let daysToAdd = (targetIdx - todayIdx + 7) % 7;
    // If no 'next' and daysToAdd is 0 (today), go to next week's day
    if (!match[1] && daysToAdd === 0) daysToAdd = 7;
    // If 'next ...', always get the week after (add 7 days to the base calculation)
    if (match[1]) {
      daysToAdd = daysToAdd === 0 ? 7 : daysToAdd + 7;
    }
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + daysToAdd);
    if (!isNaN(d.getTime())) return d;
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
    const dueDate = new Date(due); dueDate.setHours(0,0,0,0);
    const timeDiff = dueDate - today; // ms
    const dayDiff = Math.round(timeDiff / (1000*60*60*24));
    task.daysUntilDue = dayDiff;
  } else {
    task.daysUntilDue = null;
  }
}

function isTaskOverdue(task) {
  if (!task.dueDate || task.status === 'done') return false;
  const today = new Date(); today.setHours(0,0,0,0);
  const dueDate = new Date(task.dueDate + 'T00:00:00');
  dueDate.setHours(0,0,0,0);
  return dueDate < today;
}

function isTaskDueToday(task) {
  if (!task.dueDate || task.status === 'done') return false;
  const today = new Date(); today.setHours(0,0,0,0);
  const dueDate = new Date(task.dueDate + 'T00:00:00');
  dueDate.setHours(0,0,0,0);
  return dueDate.getTime() === today.getTime();
}

function updateTaskOverdueStatus() {
  // Update daysUntilDue for all tasks to ensure accurate overdue detection
  const today = new Date(); today.setHours(0,0,0,0);
  tasks.forEach(task => {
    if (task.dueDate && task.status !== 'done') {
      const dueDate = new Date(task.dueDate + 'T00:00:00');
      dueDate.setHours(0,0,0,0);
      const timeDiff = dueDate - today;
      task.daysUntilDue = Math.round(timeDiff / (1000*60*60*24));
    }
  });
}

function recalculateAllTaskPriorities() {
  // Only refresh daysUntilDue counters; priority never auto-adjusts after creation/edit
  let changed = false;
  const today = new Date(); today.setHours(0,0,0,0);
  
  tasks.forEach(task => {
    if (task.dueDate) {
      const dueDate = new Date(task.dueDate + 'T00:00:00');
      dueDate.setHours(0,0,0,0);
      const timeDiff = dueDate - today;
      const newDaysUntilDue = Math.round(timeDiff / (1000*60*60*24));
      
      if (task.daysUntilDue !== newDaysUntilDue) {
        task.daysUntilDue = newDaysUntilDue;
        changed = true;
      }
    }
  });
  
  if (changed) {
    saveTasks();
  }
  
  return changed;
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

// Recalculate all task priorities on page load
recalculateAllTaskPriorities();

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
    const overdue = isTaskOverdue(t);
    const dueToday = isTaskDueToday(t);
    li.innerHTML = `
      <strong>${t.text}</strong>
      <span class="reminder-due">${t.dueDate ? `Due: ${t.dueDate}` : ''}</span>
      ${t.daysUntilDue !== null && t.dueDate ? (
        overdue 
          ? `<span class="reminder-days">(Overdue)</span>` 
          : dueToday
          ? `<span class="reminder-days">(Due Today)</span>`
          : `<span class="reminder-days">(${t.daysUntilDue} days left)</span>`
      ) : ''}
    `;
    // Set reminder class: overdue takes priority, then due today
    if (overdue) {
      li.className = 'reminder-task reminder-overdue';
    } else if (dueToday) {
      li.className = 'reminder-task reminder-due-today';
    } else {
      li.className = 'reminder-task';
    }
    list.appendChild(li);
  });
}

function calcAvgCompletionDays() {
  // Find tasks that are 'done' and have a completedDate
  const completed = tasks.filter(t => t.status === 'done' && t.completedDate);
  if (completed.length === 0) return null;
  let totalDays = 0;
  let count = 0;
  completed.forEach(t => {
    let startDate;
    if (t.createdDate) {
      startDate = new Date(t.createdDate);
    } else if (t.id) {
      startDate = new Date(Number(t.id));
    }
    const completedDate = new Date(t.completedDate);
    let days = Math.round((completedDate - startDate)/(1000*60*60*24));
    // Only count positive intervals, 0 = same-day
    if (!isNaN(days) && days >= 0) {
      totalDays += days;
      count++;
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
  // Set editable spans for high and med only
  // Update high priority span (editable)
  disp.querySelector('[data-prio="high"]').innerHTML = `<span class="priority-num" data-edit="high">${priorityThresholds.high}</span>`;
  // Update med priority span (editable)
  disp.querySelector('[data-prio="med"]').innerHTML = `<span class="priority-num" data-edit="med">${priorityThresholds.med}</span>`;
  // Update low priority display (non-editable, shows med threshold value)
  const lowDisplay = disp.querySelector('[data-prio="low-display"]');
  if (lowDisplay) {
    lowDisplay.textContent = priorityThresholds.med;
  }
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
        if (prio==='high') high = parseInt(input.value||oldVal,10);
        if (prio==='med') med = parseInt(input.value||oldVal,10);
        const err = document.getElementById("priority-error");
        if (!(high > 0 && med > high)) {
          err.textContent = 'Require: 0 < High < Medium (days)';
          err.style.display = '';
          input.focus();
          return;
        }
        err.textContent = '';
        err.style.display = 'none';
        priorityThresholds = { high, med };
        savePriorityThresholds(priorityThresholds);
        // Recalculate all task priorities based on new thresholds
        recalculateAllTaskPriorities();
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

// AI Agent Functions for Notifications and Reports
window.showAINotification = async function() {
  if (!USE_AI || typeof generateNotification !== 'function') {
    alert('AI is not enabled. Set USE_AI = true in app.js and configure your API key in aiAgent.js');
    return;
  }
  
  const upcoming = getSoonestTasks().slice(0, 5);
  if (upcoming.length === 0) {
    alert('No upcoming tasks with due dates!');
    return;
  }
  
  try {
    const message = await generateNotification(upcoming);
    alert('🤖 AI Reminder:\n\n' + message);
  } catch (error) {
    console.error('Failed to generate notification:', error);
    alert('Failed to generate AI notification. Check console for details.');
  }
};

window.showAIReport = async function() {
  if (!USE_AI || typeof generateReport !== 'function') {
    alert('AI is not enabled. Set USE_AI = true in app.js and configure your API key in aiAgent.js');
    return;
  }
  
  const stats = {
    total: tasks.length,
    todo: tasks.filter(t => t.status === 'todo').length,
    progress: tasks.filter(t => t.status === 'progress').length,
    done: tasks.filter(t => t.status === 'done').length,
    overdue: countOverdueTasks(),
    avgCompletion: calcAvgCompletionDays() || 'N/A'
  };
  
  try {
    const report = await generateReport(stats);
    alert('📊 AI Productivity Report:\n\n' + report);
  } catch (error) {
    console.error('Failed to generate report:', error);
    alert('Failed to generate AI report. Check console for details.');
  }
};

// render(); // Commented out - now called after authentication in auth.onAuthStateChanged()
