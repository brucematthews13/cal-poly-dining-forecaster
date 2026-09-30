const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'data', 'dining.db');

let db;

function getDb() {
  if (!db) {
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initSchema();
  }
  return db;
}

function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS locations (
      id          INTEGER PRIMARY KEY,
      name        TEXT NOT NULL,
      type        TEXT NOT NULL,
      building    TEXT,
      lat         REAL NOT NULL,
      lng         REAL NOT NULL,
      capacity    INTEGER DEFAULT 100,
      description TEXT,
      image_url   TEXT
    );

    CREATE TABLE IF NOT EXISTS operating_hours (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      location_id INTEGER REFERENCES locations(id),
      day_of_week INTEGER NOT NULL,
      open_time   TEXT NOT NULL,
      close_time  TEXT NOT NULL,
      UNIQUE(location_id, day_of_week)
    );

    CREATE TABLE IF NOT EXISTS busyness_records (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      location_id INTEGER REFERENCES locations(id),
      timestamp   TEXT NOT NULL,
      day_of_week INTEGER NOT NULL,
      hour        INTEGER NOT NULL,
      minute      INTEGER NOT NULL,
      level       INTEGER NOT NULL,
      source      TEXT DEFAULT 'synthetic',
      created_at  TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS busyness_averages (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      location_id INTEGER REFERENCES locations(id),
      day_of_week INTEGER NOT NULL,
      hour        INTEGER NOT NULL,
      avg_level   REAL NOT NULL,
      sample_count INTEGER NOT NULL,
      UNIQUE(location_id, day_of_week, hour)
    );

    CREATE INDEX IF NOT EXISTS idx_busyness_location_day
      ON busyness_records(location_id, day_of_week, hour);
    CREATE INDEX IF NOT EXISTS idx_averages_location_day
      ON busyness_averages(location_id, day_of_week);
  `);
}

module.exports = { getDb, DB_PATH };
