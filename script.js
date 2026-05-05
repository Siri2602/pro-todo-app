/* =========================================================
 * To-Do App 🚀
 * Features: task management, priority, search/filter,
 *           progress tracking, localStorage persistence.
 * ========================================================= */

const STORAGE_KEY = "todo.tasks.v1";

/** @type {{id:string,text:string,priority:'low'|'medium'|'high',completed:boolean,createdAt:number}[]} */
let tasks = [];
let currentFilter = "all";
let searchQuery = "";

// ---------- DOM ----------
const taskForm        = document.getElementById("taskForm");
const taskInput       = document.getElementById("taskInput");
const prioritySelect  = document.getElementById("prioritySelect");
const taskList        = document.getElementById("taskList");
const searchInput     = document.getElementById("searchInput");
const filterButtons   = document.querySelectorAll(".filter-btn");
const taskCount       = document.getElementById("taskCount");
const clearCompleted  = document.getElementById("clearCompleted");
const progressText    = document.getElementById("progressText");
const progressPercent = document.getElementById("progressPercent");
const progressFill    = document.getElementById("progressFill");

// ---------- Storage ----------
function loadTasks() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        tasks = raw ? JSON.parse(raw) : [];
    } catch {
        tasks = [];
    }
}
function saveTasks() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

// ---------- Helpers ----------
function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
function escapeHtml(str) {
    return str.replace(/[&<>"']/g, (c) => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[c]));
}

// ---------- CRUD ----------
function addTask(text, priority) {
    tasks.unshift({
        id: uid(),
        text: text.trim(),
        priority,
        completed: false,
        createdAt: Date.now(),
    });
    saveTasks();
    render();
}
function toggleTask(id) {
    const t = tasks.find((t) => t.id === id);
    if (t) {
        t.completed = !t.completed;
        saveTasks();
        render();
    }
}
function deleteTask(id) {
    tasks = tasks.filter((t) => t.id !== id);
    saveTasks();
    render();
}
function clearCompletedTasks() {
    tasks = tasks.filter((t) => !t.completed);
    saveTasks();
    render();
}

// ---------- Filter / search ----------
function getVisibleTasks() {
    return tasks.filter((t) => {
        if (currentFilter === "active"    && t.completed)        return false;
        if (currentFilter === "completed" && !t.completed)       return false;
        if (["high", "medium", "low"].includes(currentFilter) &&
            t.priority !== currentFilter)                        return false;
        if (searchQuery && !t.text.toLowerCase().includes(searchQuery)) return false;
        return true;
    });
}

// ---------- Render ----------
function render() {
    const visible = getVisibleTasks();

    if (visible.length === 0) {
        taskList.innerHTML = `<li class="empty-state">
            ${tasks.length === 0
                ? "✨ No tasks yet. Add one above to get started!"
                : "No tasks match your search/filter."}
        </li>`;
    } else {
        taskList.innerHTML = visible.map((t) => `
            <li class="task-item priority-${t.priority} ${t.completed ? "completed" : ""}"
                data-id="${t.id}">
                <input type="checkbox" class="task-checkbox" ${t.completed ? "checked" : ""} />
                <span class="task-text">${escapeHtml(t.text)}</span>
                <span class="task-priority">${t.priority}</span>
                <button class="task-delete" title="Delete">✕</button>
            </li>
        `).join("");
    }

    // Counts & progress
    const total     = tasks.length;
    const done      = tasks.filter((t) => t.completed).length;
    const remaining = total - done;
    const pct       = total === 0 ? 0 : Math.round((done / total) * 100);

    taskCount.textContent       = `${remaining} ${remaining === 1 ? "task" : "tasks"} left`;
    progressText.textContent    = `${done} of ${total} tasks completed`;
    progressPercent.textContent = `${pct}%`;
    progressFill.style.width    = `${pct}%`;
}

// ---------- Events ----------
taskForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = taskInput.value.trim();
    if (!text) return;
    addTask(text, prioritySelect.value);
    taskInput.value = "";
    taskInput.focus();
});

taskList.addEventListener("click", (e) => {
    const item = e.target.closest(".task-item");
    if (!item) return;
    const id = item.dataset.id;
    if (e.target.classList.contains("task-checkbox")) toggleTask(id);
    else if (e.target.classList.contains("task-delete")) deleteTask(id);
});

searchInput.addEventListener("input", (e) => {
    searchQuery = e.target.value.trim().toLowerCase();
    render();
});

filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
        filterButtons.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        currentFilter = btn.dataset.filter;
        render();
    });
});

clearCompleted.addEventListener("click", () => {
    if (!tasks.some((t) => t.completed)) return;
    if (confirm("Remove all completed tasks?")) clearCompletedTasks();
});

// ---------- Init ----------
loadTasks();
render();

