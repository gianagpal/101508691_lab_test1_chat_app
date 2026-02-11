
function requireAuth() {
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");
  if (!token || !user) window.location.href = "/login";
  return { token, me: JSON.parse(user) };
}

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("room");
  localStorage.removeItem("dmUser");
  window.location.href = "/login";
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatTime(dt) {
  if (!dt) return "";
  return new Date(dt).toLocaleString();
}

function appendMessage({ from, text, time, isMine }) {
  const bubble = $(`
    <div class="mb-2 d-flex ${isMine ? "justify-content-end" : "justify-content-start"}">
      <div class="p-2 rounded-3 ${isMine ? "bg-primary text-white" : "bg-white border"}" style="max-width: 75%;">
        <div class="small fw-semibold">${escapeHtml(from)}</div>
        <div>${escapeHtml(text)}</div>
        <div class="small opacity-75 text-end">${escapeHtml(time || "")}</div>
      </div>
    </div>
  `);
  $("#chatBox").append(bubble);
  $("#chatBox").scrollTop($("#chatBox")[0].scrollHeight);
}

function appendSystem(text) {
  const el = $(`<div class="text-center text-muted small my-2">${escapeHtml(text)}</div>`);
  $("#chatBox").append(el);
  $("#chatBox").scrollTop($("#chatBox")[0].scrollHeight);
}

const { token, me } = requireAuth();
$("#logoutBtn").on("click", logout);

// ✅ always show logged in user
$("#loggedInAs").text(`Logged in as: ${me.username}`);

const room = localStorage.getItem("room");
const dmUser = localStorage.getItem("dmUser");
if (!room && !dmUser) window.location.href = "/rooms";

const socket = io({ auth: { token } });

let typingTimer = null;
let isTyping = false;

function setTitle() {
  if (room) {
    $("#chatTitle").text(`Room: ${room}`);
    $("#chatHeaderTitle").text(`Room: ${room}`);
    $("#chatHeaderMeta").text("");

    $("#leaveBtn")
      .removeClass("d-none")
      .off("click")
      .on("click", () => socket.emit("room:leave"));
  } else {
    $("#chatTitle").text(`DM: ${dmUser}`);
    $("#chatHeaderTitle").text(`DM: ${dmUser}`);
    $("#chatHeaderMeta").text("");

    $("#leaveBtn").addClass("d-none");
  }
}
setTitle();

async function loadHistory() {
  $("#chatBox").empty();

  if (room) {
    const res = await fetch(`/api/messages/room/${encodeURIComponent(room)}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const json = await res.json();

    (json.messages || []).forEach(m => {
      appendMessage({
        from: m.from_user,
        text: m.message,
        time: formatTime(m.date_sent),
        isMine: m.from_user === me.username
      });
    });
  } else {
    const res = await fetch(`/api/messages/private/${encodeURIComponent(dmUser)}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const json = await res.json();

    (json.messages || []).forEach(m => {
      appendMessage({
        from: m.from_user,
        text: m.message,
        time: formatTime(m.date_sent),
        isMine: m.from_user === me.username
      });
    });
  }
}
loadHistory();

socket.on("connect", () => {
  if (room) socket.emit("room:join", room);
});

socket.on("room:system", (text) => appendSystem(text));

socket.on("room:message", (m) => {
  if (m.room !== room) return;
  appendMessage({
    from: m.from_user,
    text: m.message,
    time: formatTime(m.date_sent),
    isMine: m.from_user === me.username
  });
});

socket.on("room:left", (r) => {
  appendSystem(`You left ${r}`);
  localStorage.removeItem("room");
  window.location.href = "/rooms";
});

socket.on("private:message", (m) => {
  const isInThread =
    (m.from_user === me.username && m.to_user === dmUser) ||
    (m.from_user === dmUser && m.to_user === me.username);

  if (!isInThread) return;

  appendMessage({
    from: m.from_user,
    text: m.message,
    time: formatTime(m.date_sent),
    isMine: m.from_user === me.username
  });
});

socket.on("private:typing", ({ from_user, isTyping }) => {
  if (!dmUser) return;
  if (from_user !== dmUser) return;
  $("#typing").text(isTyping ? `${from_user} is typing...` : "");
});

$("#sendForm").on("submit", (e) => {
  e.preventDefault();
  const text = $("#msgInput").val().trim();
  if (!text) return;

  if (room) {
    socket.emit("room:message", { room, message: text });
  } else {
    socket.emit("private:message", { to_user: dmUser, message: text });
    socket.emit("private:typing", { to_user: dmUser, isTyping: false });
    isTyping = false;
    $("#typing").text("");
  }

  $("#msgInput").val("");
});

$("#msgInput").on("input", () => {
  if (!dmUser) return;

  if (!isTyping) {
    isTyping = true;
    socket.emit("private:typing", { to_user: dmUser, isTyping: true });
  }

  clearTimeout(typingTimer);
  typingTimer = setTimeout(() => {
    isTyping = false;
    socket.emit("private:typing", { to_user: dmUser, isTyping: false });
  }, 700);
});
