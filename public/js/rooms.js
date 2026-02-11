function requireAuth() {
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");
  if (!token || !user) window.location.href = "/login";
  return { token, user: JSON.parse(user) };
}

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("room");
  localStorage.removeItem("dmUser");
  window.location.href = "/login";
}

const { token, user } = requireAuth();
$("#whoami").text(`Logged in as: ${user.username}`);
$("#logoutBtn").on("click", logout);

const socket = io({ auth: { token } });

socket.on("rooms:list", (rooms) => {
  $("#roomsList").empty();
  rooms.forEach((r) => {
    const btn = $(`<button class="btn btn-outline-primary">${r}</button>`);
    btn.on("click", () => {
      localStorage.setItem("room", r);
      localStorage.removeItem("dmUser");
      window.location.href = "/chat";
    });
    $("#roomsList").append(btn);
  });
});

// ✅ Updated endpoint
(async () => {
  const res = await fetch("/api/users", {
    headers: { Authorization: `Bearer ${token}` }
  });

  const json = await res.json();

  $("#usersList").empty();
  (json.users || [])
    .filter(u => u.username !== user.username)
    .forEach(u => {
      const item = $(`
        <button class="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
          <span>${u.username}</span>
          <span class="badge text-bg-secondary">DM</span>
        </button>
      `);

      item.on("click", () => {
        localStorage.setItem("dmUser", u.username);
        localStorage.removeItem("room");
        window.location.href = "/chat";
      });

      $("#usersList").append(item);
    });
})();
