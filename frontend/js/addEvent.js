document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const eventId = params.get("id");
  const form = document.getElementById("eventForm");

  if (eventId) {
    loadEvent();
  }
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const event = {
      name: document.getElementById("eventName").value.trim(),
      description: document.getElementById("description").value.trim(),
      date: document.getElementById("date").value,
      time: document.getElementById("time").value,
      location: document.getElementById("location").value.trim(),
    };

    if (
      !event.name ||
      !event.description ||
      !event.date ||
      !event.time ||
      !event.location
    ) {
      alert("Please fill in all fields.");
      return;
    }

    try {
      const url = eventId
        ? `http://localhost:3000/api/events/${eventId}`
        : "http://localhost:3000/api/events";

      const method = eventId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(event),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Operation failed.");
        return;
      }

      alert(
        eventId ? "Event updated successfully!" : "Event created successfully!",
      );

      form.reset();

      window.location.href = "event.html";
    } catch (error) {
      console.error(error);
      alert("Something went wrong.");
    }
  });
  async function loadEvent() {
    try {
      const response = await fetch(
        `/api/events/${eventId}`,
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message);
        return;
      }

      document.getElementById("eventName").value = data.data.name;
      document.getElementById("description").value = data.data.description;
      document.getElementById("date").value = data.data.date;
      document.getElementById("time").value = data.data.time;
      document.getElementById("location").value = data.data.location;
    } catch (error) {
      console.error(error);
    }
  }
});
