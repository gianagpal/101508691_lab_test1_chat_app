$("#signupForm").on("submit", async function (e) {
  e.preventDefault();

  const data = {
    username: $(this).find("[name=username]").val().trim(),
    firstname: $(this).find("[name=firstname]").val().trim(),
    lastname: $(this).find("[name=lastname]").val().trim(),
    password: $(this).find("[name=password]").val()
  };

  const res = await fetch("/api/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });

  const json = await res.json();
  const $msg = $("#msg");
  $msg.removeClass("d-none alert-success alert-danger");

  if (res.ok) {
    $msg.addClass("alert-success").text("Signup successful! Redirecting to login...");
    setTimeout(() => (window.location.href = "/login"), 800);
  } else {
    $msg.addClass("alert-danger").text(json.message || "Signup failed");
  }
});
