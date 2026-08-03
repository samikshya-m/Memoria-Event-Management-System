document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");

  const inputs = form.querySelectorAll("input");

  const nameInput = inputs[0];
  const emailInput = inputs[1];
  const passwordInput = inputs[2];
  const confirmPasswordInput = inputs[3];
  const termsInput = inputs[4];

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    const terms = termsInput.checked;

    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    if (!terms) {
      alert("You must agree to the Terms & Conditions.");
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Signup failed.");
        return;
      }

      alert(data.message || "Account created!");
      window.location.href = "login.html";
    } catch (error) {
      console.error("Signup error:", error);
      alert("Something went wrong.");
    }
  });
});