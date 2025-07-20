const STORAGE_KEY = 'taskflow_user';
const TASKS_KEY = 'taskflow_tasks';
let currentTab = 'todo';
let tasks = { todo: [], completed: [], archived: [] };

window.addEventListener('DOMContentLoaded', () => {
  const user = JSON.parse(localStorage.getItem(STORAGE_KEY));
  if (!user) window.location.href = 'index.html';
  document.getElementById('userName').textContent = user.name;
  document.getElementById('avatar').src = `https://ui-avatars.com/api/?background=0D8ABC&color=fff&name=${user.name}`;
  loadTasks();
});

function loadTasks() {
  const saved = localStorage.getItem(TASKS_KEY);
  if (saved) {
    tasks = JSON.parse(saved);
    renderTasks();
  } else {
    fetch('https://dummyjson.com/todos')
      .then(res => res.json())
      .then(data => {
        tasks.todo = data.todos.slice(0, 5).map(todo => ({
          text: todo.todo,
          timestamp: new Date().toLocaleString()
        }));
        saveTasks();
        renderTasks();
      });
  }
}

function saveTasks() {
  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
}

function renderTasks() {
  const list = document.getElementById('taskList');
  list.innerHTML = '';
  const active = tasks[currentTab];

  ['todo', 'completed', 'archived'].forEach(type => {
    document.getElementById(`count${capitalize(type)}`).textContent = tasks[type].length;
  });

  active.forEach((task, i) => {
    const card = document.createElement('div');
    card.className = 'relative bg-gray-700 p-4 rounded shadow-md';

    card.innerHTML = `
      <button onclick="deleteTask('${currentTab}', ${i})"
              class="absolute top-2 right-2 text-white hover:text-red-400 text-lg leading-none font-bold"
              title="Delete this task">×</button>

      <p class="text-white">${task.text}</p>
      <small class="block text-gray-300 mt-1">Last modified: ${task.timestamp}</small>
      ${getButtons(currentTab, i)}
    `;
    list.appendChild(card);
  });

  // Progress bar update
  const total = tasks.todo.length + tasks.completed.length;
  const done = tasks.completed.length;
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);

  document.getElementById('progressBar').style.width = `${percent}%`;
  document.getElementById('progressPercent').textContent = `${percent}%`;
}

function getButtons(type, i) {
  const btnBase = "text-sm px-3 py-1 rounded shadow flex items-center gap-1";

  let buttons = '';

  if (type === 'todo') {
    buttons += `<button onclick="move('todo','completed',${i})" class="${btnBase} bg-green-600 text-white hover:bg-green-700">✔️ Mark as completed</button>`;
    buttons += `<button onclick="move('todo','archived',${i})" class="${btnBase} bg-white text-black hover:bg-gray-200">📦 Archive</button>`;
  } else if (type === 'completed') {
    buttons += `<button onclick="move('completed','todo',${i})" class="${btnBase} bg-blue-600 text-white hover:bg-blue-700">↩️ Move to Todo</button>`;
    buttons += `<button onclick="move('completed','archived',${i})" class="${btnBase} bg-white text-black hover:bg-gray-200">📦 Archive</button>`;
  } else if (type === 'archived') {
    buttons += `<button onclick="move('archived','todo',${i})" class="${btnBase} bg-blue-600 text-white hover:bg-blue-700">↩️ Move to Todo</button>`;
    buttons += `<button onclick="move('archived','completed',${i})" class="${btnBase} bg-green-600 text-white hover:bg-green-700">✔️ Mark as completed</button>`;
  }

  return `<div class="flex gap-2 mt-3 flex-wrap">${buttons}</div>`;
}

function move(from, to, i) {
  const t = tasks[from][i];
  t.timestamp = new Date().toLocaleString();
  tasks[to].push(t);
  tasks[from].splice(i, 1);
  saveTasks();
  renderTasks();
}

function deleteTask(type, index) {
  tasks[type].splice(index, 1);
  saveTasks();
  renderTasks();
}

function switchTab(tab) {
  currentTab = tab;

  ['todo', 'completed', 'archived'].forEach(t => {
    const btn = document.getElementById(`tab-${t}`);
    if (t === tab) {
      btn.classList.remove('bg-white', 'text-black');
      btn.classList.add('bg-indigo-500', 'text-white', 'scale-95');
    } else {
      btn.classList.remove('bg-indigo-500', 'text-white', 'scale-95');
      btn.classList.add('bg-white', 'text-black');
    }
  });

  renderTasks();
}

function addTask() {
  const val = document.getElementById('taskInput').value.trim();
  if (!val) return;
  tasks.todo.push({ text: val, timestamp: new Date().toLocaleString() });
  document.getElementById('taskInput').value = '';
  saveTasks();
  switchTab('todo');
}

function signOut() {
  localStorage.clear();
  window.location.href = 'index.html';
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}