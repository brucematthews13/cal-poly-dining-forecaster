const { getDb } = require('../db');

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function formatHour(h) {
  if (h === 0) return '12 AM';
  if (h < 12) return `${h} AM`;
  if (h === 12) return '12 PM';
  return `${h - 12} PM`;
}

/**
 * Get hourly forecast for a location on a given day of week.
 * Blends precomputed averages with recent crowdsource data.
 */
function getForecast(locationId, dayOfWeek) {
  const db = getDb();

  const averages = db.prepare(`
    SELECT hour, avg_level, sample_count
    FROM busyness_averages
    WHERE location_id = ? AND day_of_week = ?
    ORDER BY hour
  `).all(locationId, dayOfWeek);

  // Check for recent crowdsource data (last 7 days)
  const recentCrowd = db.prepare(`
    SELECT hour, AVG(level) as avg_level, COUNT(*) as cnt
    FROM busyness_records
    WHERE location_id = ? AND day_of_week = ? AND source = 'crowdsource'
      AND timestamp >= datetime('now', '-7 days')
    GROUP BY hour
  `).all(locationId, dayOfWeek);

  const crowdMap = {};
  for (const r of recentCrowd) {
    crowdMap[r.hour] = r;
  }

  return averages.map(avg => {
    let predicted = avg.avg_level;
    let confidence = Math.min(0.95, 0.5 + (avg.sample_count / 100));

    // Blend with crowdsource if available (30% weight)
    if (crowdMap[avg.hour]) {
      const crowd = crowdMap[avg.hour];
      predicted = predicted * 0.7 + crowd.avg_level * 0.3;
      confidence = Math.min(0.98, confidence + 0.1);
    }

    return {
      hour: avg.hour,
      predicted_level: Math.round(predicted * 10) / 10,
      confidence: Math.round(confidence * 100) / 100,
      label: formatHour(avg.hour),
    };
  });
}

/**
 * Get weekly trend for a location (average busyness per day of week).
 */
function getWeeklyTrend(locationId) {
  const db = getDb();

  const trends = db.prepare(`
    SELECT day_of_week, ROUND(AVG(avg_level), 2) as avg_level
    FROM busyness_averages
    WHERE location_id = ?
    GROUP BY day_of_week
    ORDER BY day_of_week
  `).all(locationId);

  return trends.map(t => ({
    day_of_week: t.day_of_week,
    day_name: DAY_NAMES[t.day_of_week],
    avg_level: t.avg_level,
  }));
}

/**
 * Get best and worst times to visit a location on a given day.
 */
function getBestTime(locationId, dayOfWeek) {
  const db = getDb();

  // Get operating hours for this day
  const hours = db.prepare(`
    SELECT open_time, close_time FROM operating_hours
    WHERE location_id = ? AND day_of_week = ?
  `).get(locationId, dayOfWeek);

  if (!hours) {
    return { best_slots: [], avoid_slots: [] };
  }

  const forecast = getForecast(locationId, dayOfWeek);

  const sorted = [...forecast].sort((a, b) => a.predicted_level - b.predicted_level);

  const best_slots = sorted.slice(0, 3).map(s => ({
    hour: s.hour,
    label: s.label,
    predicted_level: s.predicted_level,
  }));

  const avoid_slots = sorted.slice(-3).reverse().map(s => ({
    hour: s.hour,
    label: s.label,
    predicted_level: s.predicted_level,
  }));

  return { best_slots, avoid_slots };
}

/**
 * Get the current estimated busyness for a location.
 * Uses forecast + recent reports to estimate current level.
 */
function getCurrentLevel(locationId) {
  const db = getDb();
  const now = new Date();
  const dayOfWeek = now.getDay();
  const hour = now.getHours();

  // Check for very recent crowdsource reports (last 30 minutes)
  const recent = db.prepare(`
    SELECT AVG(level) as avg_level, COUNT(*) as cnt
    FROM busyness_records
    WHERE location_id = ? AND source = 'crowdsource'
      AND timestamp >= datetime('now', '-30 minutes')
  `).get(locationId);

  if (recent && recent.cnt >= 2) {
    return Math.round(recent.avg_level * 10) / 10;
  }

  // Fall back to historical average for this hour
  const avg = db.prepare(`
    SELECT avg_level FROM busyness_averages
    WHERE location_id = ? AND day_of_week = ? AND hour = ?
  `).get(locationId, dayOfWeek, hour);

  return avg ? avg.avg_level : 1;
}

module.exports = { getForecast, getWeeklyTrend, getBestTime, getCurrentLevel, formatHour };
