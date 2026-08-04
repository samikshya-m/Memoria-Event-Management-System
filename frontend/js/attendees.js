document.addEventListener("DOMContentLoaded", () => {

    const tbody = document.getElementById("attendeesTable");
    const total = document.getElementById("totalAttendees");
    const search = document.getElementById("searchInput");

    let attendees = [];

    async function loadAttendees() {

        try {

            const response = await fetch("http://localhost:3000/api/attendees");
            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message);
            }

            attendees = data.data;

            total.textContent = attendees.length;

            render(attendees);

        } catch (err) {

            console.error(err);

            tbody.innerHTML = `
                <tr>
                    <td colspan="6">
                        Failed to load attendees.
                    </td>
                </tr>
            `;
        }

    }

    function render(list) {

        tbody.innerHTML = "";

        if (list.length === 0) {

            tbody.innerHTML = `
                <tr>
                    <td colspan="6">
                        No attendees found.
                    </td>
                </tr>
            `;

            return;
        }

        list.forEach(attendee => {

            tbody.innerHTML += `
                <tr>

                    <td>${attendee.name}</td>

                    <td>${attendee.email}</td>

                    <td>${attendee.phone}</td>

                    <td>${attendee.event_name}</td>

                    <td>${attendee.ticket_type}</td>

                    <td>${attendee.status}</td>

                </tr>
            `;

        });

    }

    search.addEventListener("input", () => {

        const keyword = search.value.toLowerCase();

        const filtered = attendees.filter(a =>

            a.name.toLowerCase().includes(keyword) ||

            a.email.toLowerCase().includes(keyword) ||

            a.event_name.toLowerCase().includes(keyword)

        );

        render(filtered);

    });

    loadAttendees();

});