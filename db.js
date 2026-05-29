const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, 'contacts.db');
const db = new Database(DB_PATH);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS contacts (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    name      TEXT    NOT NULL,
    phone     TEXT,
    email     TEXT,
    address   TEXT,
    notes     TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_contacts_name  ON contacts(name);
  CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);
`);

module.exports = db;
