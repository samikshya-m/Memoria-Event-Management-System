require("dotenv").config();
const path = require("path");
const express = require("express");
const bcrypt = require("bcryptjs");
const cors = require("cors");

const { get, all, run, init } = require("./db");

const app = express();
app.use(cors());
const PORT = process.env.PORT || 3000;

init().catch(console.error);

app.use(express.json());
app.use(express.static(path.join(__dirname, "../frontend")));

app.get("/", (req, res) => {
  res.redirect("/home.html");
});

/* ===========================
   SIGNUP
=========================== */

app.post("/api/signup", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "All fields are required.",
    });
  }

  try {
    const existing = await get("SELECT id FROM users WHERE email=?", [email]);

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Email already exists.",
      });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    await run("INSERT INTO users(name,email,password) VALUES(?,?,?)", [
      name,
      email,
      hashedPassword,
    ]);

    res.json({
      success: true,
      message: "Account created!",
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});

/* ===========================
   LOGIN
=========================== */

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email and password are required.",
    });
  }

  try {
    const user = await get("SELECT * FROM users WHERE email=?", [email]);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const match = bcrypt.compareSync(password, user.password);

    if (!match) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    res.json({
      success: true,
      message: `Welcome back, ${user.name}!`,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: "Something went wrong.",
    });
  }
});

/* ===========================
   GET ALL EVENTS
=========================== */

app.get("/api/events", async (req, res) => {
  const search = req.query.search || "";

  try {
    const events = await all(
      `
SELECT
e.*,
(
SELECT COUNT(*)
FROM attendees a
WHERE a.event_id=e.id
) AS attendee_count
FROM events e
WHERE e.name LIKE ?
ORDER BY e.date ASC
`,
      [`%${search}%`],
    );

    res.json({
      success: true,
      data: events,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: "Something went wrong.",
    });
  }
});

/* ===========================
   GET SINGLE EVENT
=========================== */

app.get("/api/events/:id", async (req, res) => {
  try {
    const event = await get("SELECT * FROM events WHERE id=?", [req.params.id]);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found.",
      });
    }

    res.json({
      success: true,
      data: event,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: "Something went wrong.",
    });
  }
});

/* ===========================
   CREATE EVENT
=========================== */

app.post("/api/events", async (req, res) => {
  const { name, description, date, time, location } = req.body;

  if (!name || !description || !date || !time || !location) {
    return res.status(400).json({
      success: false,
      message: "All fields are required.",
    });
  }

  try {
    const result = await run(
      `INSERT INTO events
      (name, description, date, time, location)
      VALUES (?, ?, ?, ?, ?)`,
      [name, description, date, time, location],
    );

    const event = await get("SELECT * FROM events WHERE id = ?", [
      result.lastInsertRowid,
    ]);

    res.json({
      success: true,
      message: "Event created!",
      data: event,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: "Something went wrong.",
    });
  }
});

/* ===========================
   UPDATE EVENT
=========================== */

app.put("/api/events/:id", async (req, res) => {
  try {
    const existing = await get("SELECT * FROM events WHERE id = ?", [
      req.params.id,
    ]);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Event not found.",
      });
    }

    const {
      name = existing.name,
      description = existing.description,
      date = existing.date,
      time = existing.time,
      location = existing.location,
    } = req.body;

    await run(
      `UPDATE events
       SET name = ?, description = ?, date = ?, time = ?, location = ?
       WHERE id = ?`,
      [name, description, date, time, location, req.params.id],
    );

    const updated = await get("SELECT * FROM events WHERE id = ?", [
      req.params.id,
    ]);

    res.json({
      success: true,
      message: "Event updated!",
      data: updated,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: "Something went wrong.",
    });
  }
});

/* ===========================
   DELETE EVENT
=========================== */

app.delete("/api/events/:id", async (req, res) => {
  try {
    const existing = await get("SELECT id FROM events WHERE id = ?", [
      req.params.id,
    ]);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Event not found.",
      });
    }

    await run("DELETE FROM events WHERE id = ?", [req.params.id]);

    res.json({
      success: true,
      message: "Event deleted.",
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: "Something went wrong.",
    });
  }
});

app.post("/api/events/:id/register", async (req, res) => {
  const { name, email, phone, ticketType } = req.body;

  if (!name || !email || !phone || !ticketType) {
    return res.status(400).json({
      success: false,
      message: "All fields are required.",
    });
  }

  try {
    const event = await get(
      "SELECT id FROM events WHERE id = ?",
      [req.params.id]
    );

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found.",
      });
    }

    const result = await run(
      `INSERT INTO attendees
      (event_id, name, email, phone, ticket_type)
      VALUES (?, ?, ?, ?, ?)`,
      [req.params.id, name, email, phone, ticketType]
    );

    const attendee = await get(
      "SELECT * FROM attendees WHERE id = ?",
      [result.lastInsertRowid]
    );

    res.json({
      success: true,
      message: "Registration confirmed!",
      data: attendee,
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: "Something went wrong.",
    });
  }
});

app.get("/api/events/:id/attendees", async (req, res) => {

  const search = req.query.search || "";

  try {

    const attendees = await all(
      `SELECT *
       FROM attendees
       WHERE event_id = ?
       AND (name LIKE ? OR email LIKE ?)
       ORDER BY registered_at DESC`,
      [req.params.id, `%${search}%`, `%${search}%`]
    );

    res.json({
      success: true,
      data: attendees,
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      success: false,
      message: "Something went wrong.",
    });

  }

});

app.get("/api/dashboard/summary", async (req, res) => {

  try {

    const totalEvents = (await get(
      "SELECT COUNT(*) AS count FROM events"
    )).count;

    const totalAttendees = (await get(
      "SELECT COUNT(*) AS count FROM attendees"
    )).count;

    const recentEvents = await all(`
      SELECT
      e.id,
      e.name,
      e.date,
      e.location,
      (
        SELECT COUNT(*)
        FROM attendees a
        WHERE a.event_id=e.id
      ) AS attendee_count
      FROM events e
      ORDER BY e.created_at DESC
      LIMIT 5
    `);

    res.json({
      success: true,
      data: {
        totalEvents,
        totalAttendees,
        recentEvents,
      },
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      success: false,
      message: "Something went wrong.",
    });

  }

});

app.delete("/api/attendees/:id", async (req, res) => {

  try {

    const attendee = await get(
      "SELECT id FROM attendees WHERE id=?",
      [req.params.id]
    );

    if (!attendee) {
      return res.status(404).json({
        success: false,
        message: "Attendee not found.",
      });
    }

    await run(
      "DELETE FROM attendees WHERE id=?",
      [req.params.id]
    );

    res.json({
      success: true,
      message: "Attendee deleted.",
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      success: false,
      message: "Something went wrong.",
    });

  }

});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});