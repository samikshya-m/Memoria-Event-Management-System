document.addEventListener("DOMContentLoaded", () => {
  const role = localStorage.getItem("role");


// if (role !== "admin") {
//     window.location.href = "events.html";
//     return;
// }

  loadDashboard();

  async function loadDashboard() {
    try {
      const response = await fetch(
        "/api/dashboard/summary",
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message);
        return;
      }

      document.getElementById("totalEvents").textContent =
        data.data.totalEvents;

      document.getElementById("totalAttendees").textContent =
        data.data.totalAttendees;

      document.getElementById("totalRegistrations").textContent =
        data.data.totalAttendees;

      const today = new Date();
      let upcoming = 0;

      const tbody = document.getElementById("recentEventsTable");
      tbody.innerHTML = "";

      data.data.recentEvents.forEach((event) => {
        const eventDate = new Date(event.date);

        if (eventDate >= today) {
          upcoming++;
        }

        const status = eventDate >= today ? "Upcoming" : "Completed";

        const statusClass = eventDate >= today ? "upcoming" : "completed";

        tbody.innerHTML += `
          <tr>
            <td>${event.name}</td>
            <td>${event.date}</td>
            <td>${event.location}</td>
            <td>${event.attendee_count}</td>
            <td>
              <span class="status ${statusClass}">
                ${status}
              </span>
            </td>
          </tr>
        `;
      });

      document.getElementById("upcomingEvents").textContent = upcoming;
    } catch (error) {
      console.error(error);
      alert("Failed to load dashboard.");
    }
  }
});
