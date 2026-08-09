document.addEventListener("DOMContentLoaded", () => {

    const params = new URLSearchParams(window.location.search);
    const eventId = params.get("id");

    if (!eventId) {
        alert("Event not found.");
        window.location.href = "events.html";
        return;
    }

    loadEvent();

    async function loadEvent() {

        try {

            const response = await fetch(
                `/api/events/${eventId}`
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || "Unable to load event.");
            }

            const event = data.data;

            document.getElementById("eventName").textContent = event.name;

            document.getElementById("description").textContent =
                event.description || "No description available.";

            document.getElementById("date").textContent =
                new Date(event.date).toLocaleDateString();

            document.getElementById("time").textContent =
                event.time || "N/A";

            document.getElementById("location").textContent =
                event.location || "N/A";

            document.getElementById("attendees").textContent =
                `${event.attendee_count || 0} Registered`;

            document.getElementById("registerBtn").href =
                `register.html?id=${event.id}`;

        } catch (error) {

            console.error(error);

            document.querySelector(".event-card").innerHTML = `
                <h2>Unable to load event.</h2>
                <p>Please try again later.</p>
            `;
        }
    }

});