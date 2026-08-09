document.addEventListener("DOMContentLoaded", () => {

    const params = new URLSearchParams(window.location.search);
    const eventId = params.get("id");

    const form = document.getElementById("registerForm");
    const eventTitle = document.getElementById("eventTitle");

    if (!eventId) {
        alert("Event not found.");
        window.location.href = "events.html";
        return;
    }

    loadEvent();

    async function loadEvent() {

        try {

            const response = await fetch(`/api/events/${eventId}`);
            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message);
            }

            eventTitle.textContent = data.data.name;

        } catch (error) {

            console.error(error);

            eventTitle.textContent = "Unable to load event.";

        }

    }

    form.addEventListener("submit", async (e) => {

        e.preventDefault();

        const attendee = {

            name: document.getElementById("name").value.trim(),

            email: document.getElementById("email").value.trim(),

            phone: document.getElementById("phone").value.trim(),

            ticketType: document.getElementById("ticketType").value

        };

        if (
            !attendee.name ||
            !attendee.email ||
            !attendee.phone
        ) {

            alert("Please fill in all fields.");
            return;

        }

        try {

            const response = await fetch(`/api/events/${eventId}/register`, {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(attendee)

            });

            const data = await response.json();

            if (!response.ok || !data.success) {

                throw new Error(data.message);

            }

            alert("Registration Successful! 🎉");

            form.reset();

            window.location.href = "events.html";

        } catch (error) {

            console.error(error);

            alert(error.message || "Registration failed.");

        }

    });

});