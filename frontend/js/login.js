document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");

  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email || !password) {
      alert("Please enter both email and password.");
      return;
    }

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        alert(data.message);
        return;
      }

      // Save logged in user
      localStorage.setItem("role", data.role);
      localStorage.setItem("name", data.name);

      // Redirect based on role
      if (data.role === "admin") {
        window.location.href = "dashboard.html";
      } else {
        window.location.href = "events.html";
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Something went wrong.");
    }
  });
});
