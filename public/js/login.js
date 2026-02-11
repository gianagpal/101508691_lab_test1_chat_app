function setSession(token, user) {
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
}

$("#loginForm").on("submit", async function (e) {
  e.preventDefault();

  const data = {
    username: $(this).find("[name=username]").val().trim(),
    password: $(this).find("[name=password]").val()
  };

  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });

  const json = await res.json();

  const $msg = $("#msg");
  $msg.removeClass("d-none alert-success alert-danger");

  if (res.ok) {
    setSession(json.token, json.user);
    $msg.addClass("alert-success").text("Login successful! Redirecting...");
    setTimeout(() => (window.location.href = "/rooms"), 600);
  } else {
    $msg.addClass("alert-danger").text(json.message || "Login failed");
  }
});
