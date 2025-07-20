const synth = window.speechSynthesis;
let recognition;
if ('webkitSpeechRecognition' in window) {
  recognition = new webkitSpeechRecognition();
  recognition.lang = 'en-US';
  recognition.continuous = false;
  recognition.interimResults = false;
}

function toggleChatbot() {
  const bot = document.getElementById('chatbotContainer');
  bot.classList.toggle('hidden');
  if (!bot.classList.contains('hidden')) {
    speak("Hello! What can I do for you today?");
    showBotMsg("Hello! What can I do for you today?");
  }
}

function handleChat(event) {
  if (event.key === 'Enter') processUserInput();
}

function processUserInput() {
  const input = document.getElementById('chatInput');
  const msg = input.value.trim();
  if (!msg) return;
  showUserMsg(msg);
  respondToMessage(msg.toLowerCase());
  input.value = '';
}

function showUserMsg(msg) {
  const chatLog = document.getElementById('chatLog');
  chatLog.innerHTML += `<div class="self-end bg-blue-600 text-white px-3 py-2 rounded-xl max-w-[80%]">${msg}</div>`;
  chatLog.scrollTop = chatLog.scrollHeight;
}

function showBotMsg(msg) {
  const chatLog = document.getElementById('chatLog');
  chatLog.innerHTML += `<div class="self-start bg-gray-600 px-3 py-2 rounded-xl max-w-[80%]">${msg}</div>`;
  chatLog.scrollTop = chatLog.scrollHeight;
}

function speak(text) {
  const utter = new SpeechSynthesisUtterance(text);
  synth.speak(utter);
}

function respondToMessage(msg) {
  let response = "";
  msg = msg.toLowerCase().trim();

  if (msg.startsWith("add ")) {
    const task = msg.substring(4).trim();
    if (task.length > 2) {
      tasks.todo.push({ text: task, timestamp: new Date().toLocaleString() });
      saveTasks();
      renderTasks();
      response = `Task "${task}" added to your todo list.`;
    } else {
      response = "Please specify a longer task.";
    }

  } else if (msg.startsWith("delete ") || msg.startsWith("remove ")) {
    const toDelete = msg.replace(/^(delete|remove)\s+/i, "").trim();
    const index = tasks.todo.findIndex(t => t.text.toLowerCase() === toDelete);

    if (index !== -1) {
      const removed = tasks.todo.splice(index, 1);
      saveTasks();
      renderTasks();
      response = `Task "${removed[0].text}" deleted from your todo list.`;
    } else {
      response = `I couldn't find a task called "${toDelete}".`;
    }

  } else if (msg.includes("hello") || msg.includes("hi")) {
    response = "Hi there! How can I help you today?";

  } else if (msg.includes("how are you")) {
    response = "I'm just a bot, but I'm ready to help!";

  } else if (msg.includes("what can you do")) {
    response = "I can add tasks, delete tasks, show your tasks, and remind you. Just ask!";

  } else if (msg.includes("show") && msg.includes("task")) {
    response = `You have ${tasks.todo.length} tasks in Todo, ${tasks.completed.length} completed, and ${tasks.archived.length} archived.`;

  } else {
    response = "I'm not sure what you meant. Try saying 'Add buy milk' or 'Delete buy milk'.";
  }

  showBotMsg(response);
  speak(response);
}


function startVoiceInput() {
  if (!recognition) {
    alert("Voice input not supported in this browser.");
    return;
  }
  recognition.start();
  recognition.onresult = function(event) {
    document.getElementById('chatInput').value = event.results[0][0].transcript;
    processUserInput();
  };
}