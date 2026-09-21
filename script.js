// Cole aqui a URL /exec do seu Web App do Apps Script.
const API_URL = "COLE_AQUI_A_URL_DO_APPS_SCRIPT";

const messagesEl = document.querySelector("#messages");
const form = document.querySelector("#messageForm");
const nameInput = document.querySelector("#name");
const messageInput = document.querySelector("#message");
const statusEl = document.querySelector("#status");
const refreshButton = document.querySelector("#refreshButton");

let jsonpCounter = 0;

nameInput.value = localStorage.getItem("mural_nome") || "";

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function loadMessages() {
  if (API_URL.includes("COLE_AQUI")) {
    messagesEl.innerHTML = '<div class="state">Configure a URL do Apps Script em <code>script.js</code>.</div>';
    return;
  }

  const callbackName = `muralCallback_${++jsonpCounter}`;
  const script = document.createElement("script");

  window[callbackName] = (data) => {
    delete window[callbackName];
    script.remove();

    if (!data.ok) {
      messagesEl.innerHTML = '<div class="state">Não foi possível carregar as mensagens.</div>';
      return;
    }

    renderMessages(data.messages);
  };

  script.onerror = () => {
    delete window[callbackName];
    script.remove();
    messagesEl.innerHTML = '<div class="state">Erro ao conectar com o servidor.</div>';
  };

  script.src = `${API_URL}?action=list&callback=${encodeURIComponent(callbackName)}&_=${Date.now()}`;
  document.body.appendChild(script);
}

function renderMessages(messages) {
  if (!messages.length) {
    messagesEl.innerHTML = '<div class="state">Ainda não há mensagens. Seja o primeiro.</div>';
    return;
  }

  messagesEl.innerHTML = messages.map(item => `
    <article class="message">
      <div class="message-header">
        <span class="name">${escapeHtml(item.name)}:</span>
        <time class="time">${escapeHtml(item.time)}</time>
      </div>
      <p class="text">${escapeHtml(item.message)}</p>
    </article>
  `).join("");

  messagesEl.scrollTop = messagesEl.scrollHeight;
}

async function sendMessage(name, message) {
  const params = new URLSearchParams({
    action: "send",
    name,
    message
  });

  // O Apps Script recebe a mensagem por GET. Isso evita depender de
  // cabeçalhos CORS na resposta do Content Service.
  await fetch(`${API_URL}?${params.toString()}`, {
    method: "GET",
    mode: "no-cors",
    cache: "no-store"
  });
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const name = nameInput.value.trim();
  const message = messageInput.value.trim();

  if (!name || !message) return;

  localStorage.setItem("mural_nome", name);
  form.querySelector("button").disabled = true;
  statusEl.textContent = "Enviando...";

  try {
    await sendMessage(name, message);
    messageInput.value = "";
    statusEl.textContent = "Mensagem enviada.";
    setTimeout(loadMessages, 500);
  } catch (error) {
    statusEl.textContent = "Não foi possível enviar a mensagem.";
  } finally {
    form.querySelector("button").disabled = false;
    messageInput.focus();
  }
});

refreshButton.addEventListener("click", loadMessages);
messageInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    form.requestSubmit();
  }
});

loadMessages();
setInterval(loadMessages, 10000);
