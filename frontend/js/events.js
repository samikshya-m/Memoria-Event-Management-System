document.addEventListener("DOMContentLoaded", () => {
  const eventsContainer = document.getElementById("eventsContainer");
  const searchInput = document.getElementById("searchInput");

  let events = [];

  async function loadEvents(search = "") {
    try {
      const response = await fetch(
        `http://localhost:3000/api/events?search=${encodeURIComponent(search)}`,
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to load events.");
      }

      events = data.data;
      renderEvents(events);
    } catch (error) {
      console.error("ERROR:", error);
      alert(error.message);

      eventsContainer.innerHTML = `
    <div class="event-card">
      <h2>Unable to load events</h2>
      <p>${error.message}</p>
    </div>
  `;
    }
  }

  function renderEvents(list) {
    if (list.length === 0) {
      eventsContainer.innerHTML = `
        <div class="event-card">
          <h2>No Events Found</h2>
          <p>There are currently no events available.</p>
        </div>
      `;
      return;
    }

    eventsContainer.innerHTML = "";

    list.forEach((event) => {
      const card = document.createElement("div");
      card.className = "event-card";

      const date = new Date(event.date).toLocaleDateString();

      card.innerHTML = `
        <div class="event-icon">
          <i class="fa-solid fa-calendar-days"></i>
        </div>

        <h2>${event.name}</h2>

        <p>${event.description || ""}</p>

        <div class="info">
          <p>
            <i class="fa-solid fa-calendar"></i>
            ${date}
          </p>

          <p>
            <i class="fa-solid fa-clock"></i>
            ${event.time || ""}
          </p>

          <p>
            <i class="fa-solid fa-location-dot"></i>
            ${event.location || ""}
          </p>
        </div>

        <div class="buttons">
          <a href="viewEvent.html?id=${event.id}" class="view-btn">
            View
          </a>

          <a href="register.html?id=${event.id}" class="register-btn">
            Register
          </a>
        </div>
      `;

      eventsContainer.appendChild(card);
    });
  }

  searchInput.addEventListener("input", () => {
    loadEvents(searchInput.value.trim());
  });

  loadEvents();
});
