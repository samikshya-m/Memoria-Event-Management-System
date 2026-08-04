require("dotenv").config();
const { createClient } = require("@libsql/client");

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function get(sql, args = []) {
  const result = await db.execute({ sql, args });
  return result.rows[0];
}

async function all(sql, args = []) {
  const result = await db.execute({ sql, args });
  return result.rows;
}

async function init() {
  await db.execute(`
CREATE TABLE IF NOT EXISTS users (
id INTEGER PRIMARY KEY AUTOINCREMENT,
name TEXT NOT NULL,
email TEXT UNIQUE NOT NULL,
password TEXT NOT NULL,
role TEXT NOT NULL DEFAULT 'user',
created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
`);

  await db.execute(`
CREATE TABLE IF NOT EXISTS events (
id INTEGER PRIMARY KEY AUTOINCREMENT,
name TEXT NOT NULL,
description TEXT,
date TEXT NOT NULL,
time TEXT,
location TEXT,
created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
`);

  await db.execute(`
CREATE TABLE IF NOT EXISTS attendees (
id INTEGER PRIMARY KEY AUTOINCREMENT,
event_id INTEGER NOT NULL,
name TEXT NOT NULL,
email TEXT NOT NULL,
phone TEXT,
ticket_type TEXT,
status TEXT NOT NULL DEFAULT 'pending',
registered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
)
`);
  console.log(`✅ Database connected successfully (Turso)`);
}

async function run(sql, args = []) {
  const result = await db.execute({ sql, args });
  return {
    // Turso returns this as a BigInt — JSON.stringify cannot
    // serialize BigInt, so convert it to a plain Number here.
    lastInsertRowid:
      result.lastInsertRowid != null ? Number(result.lastInsertRowid) : null,
    changes: result.rowsAffected,
  };
}

module.exports = {
  db,
  get,
  all,
  run,
  init,
};
