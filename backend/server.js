// server.js
require("dotenv").config();
const path = require("path");
const express = require("express");
const bcrypt = require("bcryptjs");
const db = require("./db");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "../frontend")));

app.get("/", (req, res) => res.redirect("/home.html"));

app.post("/api/signup", (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are required." });
  }
  try {
    const existing = db
      .prepare("SELECT id FROM users WHERE email = ?")
      .get(email);
    if (existing) {
      return res
        .status(409)
        .json({ success: false, message: "That email is already registered." });
    }
    const hashedPassword = bcrypt.hashSync(password, 10);
    db.prepare(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
    ).run(name, email, hashedPassword);
    return res.json({ success: true, message: "Account created!" });
  } catch (err) {
    console.error("Signup error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong." });
  }
});

app.post("/api/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res
      .status(400)
      .json({ success: false, message: "Email and password are required." });
  }
  try {
    const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
    if (!user)
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password." });

    const passwordMatches = bcrypt.compareSync(password, user.password);
    if (!passwordMatches)
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password." });

    return res.json({ success: true, message: `Welcome back, ${user.name}!` });
  } catch (err) {
    console.error("Login error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong." });
  }
});

app.get("/api/events", (req, res) => {
  const search = req.query.search || "";
  try {
    const events = db
      .prepare(
        `SELECT e.*,
          (SELECT COUNT(*) FROM attendees a WHERE a.event_id = e.id) AS attendee_count
         FROM events e
         WHERE e.name LIKE ?
         ORDER BY e.date ASC`,
      )
      .all(`%${search}%`);
    return res.json({ success: true, data: events });
  } catch (err) {
    console.error("List events error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong." });
  }
});

app.get("/api/events/:id", (req, res) => {
  try {
    const event = db
      .prepare("SELECT * FROM events WHERE id = ?")
      .get(req.params.id);
    if (!event)
      return res
        .status(404)
        .json({ success: false, message: "Event not found." });
    return res.json({ success: true, data: event });
  } catch (err) {
    console.error("Get event error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong." });
  }
});

app.post("/api/events", (req, res) => {
  const { name, description, date, time, location } = req.body;
  if (!name || !description || !date || !time || !location) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are required." });
  }
  try {
    const result = db
      .prepare(
        "INSERT INTO events (name, description, date, time, location) VALUES (?, ?, ?, ?, ?)",
      )
      .run(name, description, date, time, location);
    const event = db
      .prepare("SELECT * FROM events WHERE id = ?")
      .get(result.lastInsertRowid);
    return res.json({ success: true, message: "Event created!", data: event });
  } catch (err) {
    console.error("Create event error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong." });
  }
});

app.put("/api/events/:id", (req, res) => {
  try {
    const existing = db
      .prepare("SELECT * FROM events WHERE id = ?")
      .get(req.params.id);
    if (!existing)
      return res
        .status(404)
        .json({ success: false, message: "Event not found." });

    const {
      name = existing.name,
      description = existing.description,
      date = existing.date,
      time = existing.time,
      location = existing.location,
    } = req.body;

    db.prepare(
      "UPDATE events SET name=?, description=?, date=?, time=?, location=? WHERE id=?",
    ).run(name, description, date, time, location, req.params.id);

    const updated = db
      .prepare("SELECT * FROM events WHERE id = ?")
      .get(req.params.id);
    return res.json({
      success: true,
      message: "Event updated!",
      data: updated,
    });
  } catch (err) {
    console.error("Update event error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong." });
  }
});

app.delete("/api/events/:id", (req, res) => {
  try {
    const existing = db
      .prepare("SELECT id FROM events WHERE id = ?")
      .get(req.params.id);
    if (!existing)
      return res
        .status(404)
        .json({ success: false, message: "Event not found." });
    db.prepare("DELETE FROM events WHERE id = ?").run(req.params.id);
    return res.json({ success: true, message: "Event deleted." });
  } catch (err) {
    console.error("Delete event error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong." });
  }
});

app.post("/api/events/:id/register", (req, res) => {
  const { name, email, phone, ticketType } = req.body;
  if (!name || !email || !phone || !ticketType) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are required." });
  }
  try {
    const event = db
      .prepare("SELECT id FROM events WHERE id = ?")
      .get(req.params.id);
    if (!event)
      return res
        .status(404)
        .json({ success: false, message: "Event not found." });

    const result = db
      .prepare(
        "INSERT INTO attendees (event_id, name, email, phone, ticket_type) VALUES (?, ?, ?, ?, ?)",
      )
      .run(req.params.id, name, email, phone, ticketType);

    const attendee = db
      .prepare("SELECT * FROM attendees WHERE id = ?")
      .get(result.lastInsertRowid);
    return res.json({
      success: true,
      message: "Registration confirmed!",
      data: attendee,
    });
  } catch (err) {
    console.error("Register attendee error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong." });
  }
});

app.get("/api/events/:id/attendees", (req, res) => {
  const search = req.query.search || "";
  try {
    const attendees = db
      .prepare(
        `SELECT * FROM attendees
         WHERE event_id = ? AND (name LIKE ? OR email LIKE ?)
         ORDER BY registered_at DESC`,
      )
      .all(req.params.id, `%${search}%`, `%${search}%`);
    return res.json({ success: true, data: attendees });
  } catch (err) {
    console.error("List attendees error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong." });
  }
});

app.get("/api/attendees", (req, res) => {
  const search = req.query.search || "";

  try {
    const attendees = db
      .prepare(
        `
      SELECT
        attendees.*,
        events.name AS event_name
      FROM attendees
      JOIN events
        ON attendees.event_id = events.id
      WHERE
        attendees.name LIKE ?
        OR attendees.email LIKE ?
      ORDER BY attendees.registered_at DESC
    `,
      )
      .all(`%${search}%`, `%${search}%`);

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

app.get("/api/events/:id/stats", (req, res) => {
  try {
    const total = db
      .prepare("SELECT COUNT(*) AS count FROM attendees WHERE event_id = ?")
      .get(req.params.id).count;
    const checkedIn = db
      .prepare(
        "SELECT COUNT(*) AS count FROM attendees WHERE event_id = ? AND status = 'checked_in'",
      )
      .get(req.params.id).count;
    return res.json({
      success: true,
      data: { total, checkedIn, pending: total - checkedIn },
    });
  } catch (err) {
    console.error("Attendee stats error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong." });
  }
});

app.delete("/api/attendees/:id", (req, res) => {
  try {
    const existing = db
      .prepare("SELECT id FROM attendees WHERE id = ?")
      .get(req.params.id);
    if (!existing)
      return res
        .status(404)
        .json({ success: false, message: "Attendee not found." });
    db.prepare("DELETE FROM attendees WHERE id = ?").run(req.params.id);
    return res.json({ success: true, message: "Attendee removed." });
  } catch (err) {
    console.error("Delete attendee error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong." });
  }
});

app.get("/api/dashboard/summary", (req, res) => {
  try {
    const totalEvents = db
      .prepare("SELECT COUNT(*) AS count FROM events")
      .get().count;
    const totalAttendees = db
      .prepare("SELECT COUNT(*) AS count FROM attendees")
      .get().count;
    const recentEvents = db
      .prepare(
        `SELECT e.id, e.name, e.date, e.location,
          (SELECT COUNT(*) FROM attendees a WHERE a.event_id = e.id) AS attendee_count
         FROM events e ORDER BY e.created_at DESC LIMIT 5`,
      )
      .all();
    return res.json({
      success: true,
      data: { totalEvents, totalAttendees, recentEvents },
    });
  } catch (err) {
    console.error("Dashboard summary error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong." });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
