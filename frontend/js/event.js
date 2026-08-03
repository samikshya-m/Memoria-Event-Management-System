document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.querySelector(".search-box input");
  const tbody = document.querySelector("table tbody");
  const totalEventsEl = document.querySelector(".count-box strong");

  let events = [];

  async function loadEvents(search = "") {
    try {
      const response = await fetch(
        `http://localhost:3000/api/events?search=${encodeURIComponent(search)}`
      );
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to load events");
      }

      events = data.data || [];
      renderEvents(events);
      if (totalEventsEl) totalEventsEl.textContent = String(events.length).padStart(2, "0");
    } catch (error) {
      console.error("List events error:", error);
      tbody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align:center; padding:20px;">
            Failed to load events
          </td>
        </tr>
      `;
    }
  }

  function renderEvents(list) {
    if (!list.length) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align:center; padding:20px;">
            No events found
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = list
      .map((event) => {
        const dateText = event.date ? new Date(event.date).toLocaleDateString() : "";
        return `
          <tr data-id="${event.id}">
            <td>
              <div class="event-name">
                <div class="event-icon">
                  <i class="fa-solid fa-star"></i>
                </div>
                <div>
                  <strong>${event.name || ""}</strong>
                  <small>${event.description || ""}</small>
                </div>
              </div>
            </td>
            <td>${dateText}</td>
            <td>${event.time || ""}</td>
            <td>${event.location || ""}</td>
            <td><span class="attendee-count">${event.attendee_count ?? 0}</span></td>
            <td>
              <div class="action-buttons">
                <a href="viewEvent.html?id=${event.id}" class="view-btn">View</a>
                <a href="addEvent.html?id=${event.id}" class="edit-btn">Edit</a>
                <button class="delete-btn" data-id="${event.id}">Delete</button>
              </div>
            </td>
          </tr>
        `;
      })
      .join("");

    document.querySelectorAll(".delete-btn").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const id = btn.dataset.id;
        if (!confirm("Are you sure you want to delete this event?")) return;

        try {
          const response = await fetch(`http://localhost:3000/api/events/${id}`, {
            method: "DELETE",
          });
          const data = await response.json();

          if (!response.ok || !data.success) {
            throw new Error(data.message || "Delete failed");
          }

          await loadEvents(searchInput.value.trim());
        } catch (error) {
          console.error("Delete event error:", error);
          alert(error.message || "Something went wrong.");
        }
      });
    });
  }

  searchInput.addEventListener("input", () => {
    loadEvents(searchInput.value.trim());
  });

  loadEvents();
});