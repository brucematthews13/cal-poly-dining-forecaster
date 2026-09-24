const express = require('express');
const cors = require('cors');
const { getDb } = require('./db');
const { getForecast, getWeeklyTrend, getBestTime, getCurrentLevel } = require('./services/forecast');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// ============ Rate limiting (simple in-memory) ============
const reportLimits = new Map();

function isRateLimited(ip, locationId) {
  const key = `${ip}:${locationId}`;
  const lastReport = reportLimits.get(key);
  if (lastReport && Date.now() - lastReport < 15 * 60 * 1000) {
    return true;
  }
  reportLimits.set(key, Date.now());
  return false;
}

// ============ Helper ============
function getWaitMinutes(level) {
  const map = { 1: 0, 2: 5, 3: 10, 4: 18, 5: 28 };
  return map[Math.round(Math.max(1, Math.min(5, level)))] || 0;
}

function isLocationOpen(db, locationId) {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const hours = db.prepare(`
    SELECT open_time, close_time FROM operating_hours
    WHERE location_id = ? AND day_of_week = ?
  `).get(locationId, dayOfWeek);

  if (!hours) return false;
  return currentTime >= hours.open_time && currentTime < hours.close_time;
}

// ============ ROUTES ============

// GET /api/locations — All locations with metadata
app.get('/api/locations', (req, res) => {
  const db = getDb();
  const locations = db.prepare('SELECT * FROM locations ORDER BY id').all();
  res.json(locations);
});

// GET /api/locations/:id — Single location details
app.get('/api/locations/:id', (req, res) => {
  const db = getDb();
  const location = db.prepare('SELECT * FROM locations WHERE id = ?').get(req.params.id);
  if (!location) return res.status(404).json({ error: 'Location not found' });

  const hours = db.prepare(
    'SELECT * FROM operating_hours WHERE location_id = ? ORDER BY day_of_week'
  ).all(req.params.id);

  res.json({ ...location, operating_hours: hours });
});

// GET /api/locations/:id/forecast?day=0-6 — Hourly forecast
app.get('/api/locations/:id/forecast', (req, res) => {
  const dayOfWeek = parseInt(req.query.day) ?? new Date().getDay();
  const forecast = getForecast(parseInt(req.params.id), dayOfWeek);
  res.json(forecast);
});

// GET /api/locations/:id/weekly — Weekly trend
app.get('/api/locations/:id/weekly', (req, res) => {
  const trend = getWeeklyTrend(parseInt(req.params.id));
  res.json(trend);
});

// GET /api/locations/:id/best-time?day=0-6 — Best time recommendations
app.get('/api/locations/:id/best-time', (req, res) => {
  const dayOfWeek = parseInt(req.query.day) ?? new Date().getDay();
  const result = getBestTime(parseInt(req.params.id), dayOfWeek);
  res.json(result);
});

// GET /api/overview — Current busyness for ALL locations
app.get('/api/overview', (req, res) => {
  const db = getDb();
  const locations = db.prepare('SELECT * FROM locations ORDER BY id').all();
  const now = new Date();
  const dayOfWeek = now.getDay();

  const overview = locations.map(loc => {
    const currentLevel = getCurrentLevel(loc.id);
    const isOpen = isLocationOpen(db, loc.id);
    const hours = db.prepare(
      'SELECT * FROM operating_hours WHERE location_id = ? AND day_of_week = ?'
    ).get(loc.id, dayOfWeek);

    return {
      ...loc,
      current_level: Math.round(currentLevel * 10) / 10,
      is_open: isOpen,
      hours_today: hours || null,
      wait_minutes: getWaitMinutes(currentLevel),
    };
  });

  res.json(overview);
});

// GET /api/overview/heatmap — Aggregated heatmap data
app.get('/api/overview/heatmap', (req, res) => {
  const db = getDb();
  const locations = db.prepare('SELECT id, name, lat, lng FROM locations').all();

  const heatData = locations.map(loc => ({
    ...loc,
    level: getCurrentLevel(loc.id),
  }));

  res.json(heatData);
});

// POST /api/report — Submit anonymous crowd report
app.post('/api/report', (req, res) => {
  const { location_id, level } = req.body;

  if (!location_id || !level || level < 1 || level > 5) {
    return res.status(400).json({ success: false, message: 'Invalid report. Provide location_id and level (1-5).' });
  }

  const ip = req.ip || req.connection.remoteAddress || 'unknown';

  if (isRateLimited(ip, location_id)) {
    return res.status(429).json({
      success: false,
      message: 'You can only report once per location every 15 minutes.',
    });
  }

  const db = getDb();
  const now = new Date();

  db.prepare(`
    INSERT INTO busyness_records (location_id, timestamp, day_of_week, hour, minute, level, source)
    VALUES (?, ?, ?, ?, ?, ?, 'crowdsource')
  `).run(location_id, now.toISOString(), now.getDay(), now.getHours(), now.getMinutes(), Math.round(level));

  // Re-aggregate averages for this location + day + hour
  db.prepare(`
    INSERT OR REPLACE INTO busyness_averages (location_id, day_of_week, hour, avg_level, sample_count)
    SELECT location_id, day_of_week, hour, ROUND(AVG(level), 2), COUNT(*)
    FROM busyness_records
    WHERE location_id = ? AND day_of_week = ? AND hour = ?
    GROUP BY location_id, day_of_week, hour
  `).run(location_id, now.getDay(), now.getHours());

  res.json({ success: true, message: 'Thanks for helping fellow Mustangs! 🐴' });
});

// ============ START ============
app.listen(PORT, () => {
  console.log(`\n🍽️  Cal Poly Dining Forecaster API running on http://localhost:${PORT}\n`);
});
