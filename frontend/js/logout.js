document.addEventListener("DOMContentLoaded", () => {
  const logoutBtn = document.getElementById("logoutBtn");

  if (!logoutBtn) return;

  logoutBtn.addEventListener("click", (e) => {
    e.preventDefault();

    const confirmLogout = confirm("Are you sure you want to logout?");

    if (!confirmLogout) return;

    // Remove stored login data (if you add any later)
    localStorage.removeItem("user");
    sessionStorage.clear();

    alert("Logged out successfully.");

    window.location.href = "login.html";
  });
});