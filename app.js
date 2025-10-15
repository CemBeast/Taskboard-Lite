const STORAGE_KEY = "taskboard-lite-v1";
let tasks = loadTasks();

const form = document.getElementById("task-form");
const input = document.getElementById("task-input");

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;

  const newTask = {
    id: Date.now(),
    text,
    status: "todo",
  };
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
    tasks.filter(t => t.status === status).forEach(t => {
      const li = document.createElement("li");
      li.className = "task";
      li.innerHTML = `
        <span>${t.text}</span>
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

render();