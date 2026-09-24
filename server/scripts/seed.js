/**
 * Cal Poly Dining Forecaster — Seed Data Generator
 *
 * Generates 8 weeks of realistic synthetic busyness data for all 11 dining locations.
 * Models real college dining patterns: breakfast, lunch peak, afternoon lull, dinner rush.
 */

const { getDb } = require('../db');

// ============ DINING LOCATIONS ============

const LOCATIONS = [
  {
    id: 1, name: 'Vista Grande Dining Pavilion', type: 'dining_hall',
    building: '114', lat: 35.2997, lng: -120.6595, capacity: 400,
    description: 'Modern three-story dining complex featuring multiple food platforms, a demo kitchen, and indoor/outdoor seating.',
  },
  {
    id: 2, name: '1901 Marketplace', type: 'food_hall',
    building: null, lat: 35.2990, lng: -120.6620, capacity: 350,
    description: 'Central multi-vendor food hall featuring Chick-fil-A, Panda Express, Red Radish, and more.',
  },
  {
    id: 3, name: '805 Kitchen', type: 'buffet',
    building: '19', lat: 35.3005, lng: -120.6610, capacity: 300,
    description: 'All-you-care-to-eat buffet with rotating menus including Mediterranean, sustainable eats, and action stations.',
  },
  {
    id: 4, name: '805 Café', type: 'cafe',
    building: '19', lat: 35.3006, lng: -120.6608, capacity: 60,
    description: 'Coffee, teas, pastries, and grab-and-go items in the 805 Kitchen atrium.',
  },
  {
    id: 5, name: 'The Avenue', type: 'food_hall',
    building: '65', lat: 35.3003, lng: -120.6585, capacity: 250,
    description: 'University Union food court with multiple dining concepts and health-conscious options.',
  },
  {
    id: 6, name: 'Mustang Station', type: 'quick_service',
    building: null, lat: 35.2985, lng: -120.6590, capacity: 120,
    description: 'Quick-service dining with a variety of fast and convenient meal options.',
  },
  {
    id: 7, name: 'Campus Market', type: 'market',
    building: '24', lat: 35.3010, lng: -120.6600, capacity: 40,
    description: 'Grocery and grab-and-go convenience store for snacks, beverages, and essentials.',
  },
  {
    id: 8, name: 'Poly Deli', type: 'quick_service',
    building: null, lat: 35.3008, lng: -120.6575, capacity: 80,
    description: 'Fresh sandwiches, wraps, and deli items made to order.',
  },
  {
    id: 9, name: "Julian's Café", type: 'cafe',
    building: '35', lat: 35.3020, lng: -120.6590, capacity: 50,
    description: 'Cozy coffee shop inside Kennedy Library — perfect for study breaks.',
  },
  {
    id: 10, name: 'Hilltop Grocery', type: 'grocery',
    building: null, lat: 35.2975, lng: -120.6625, capacity: 30,
    description: 'Mini grocery near the residence halls with fresh produce and essentials.',
  },
  {
    id: 11, name: 'Einstein Bros Bagels', type: 'cafe',
    building: null, lat: 35.3015, lng: -120.6570, capacity: 70,
    description: 'Fresh bagels, coffee, and breakfast items to fuel your morning.',
  },
];

// ============ OPERATING HOURS ============
// day_of_week: 0=Sun, 1=Mon, ..., 6=Sat

function getHoursForLocation(locId) {
  const weekday = { open: '07:00', close: '21:00' };
  const weekend = { open: '09:00', close: '20:00' };
  const cafeWeekday = { open: '06:30', close: '18:00' };
  const cafeWeekend = { open: '08:00', close: '16:00' };
  const marketWeekday = { open: '07:00', close: '22:00' };
  const marketWeekend = { open: '10:00', close: '20:00' };

  const schedules = {
    1: { weekday: { open: '07:00', close: '21:00' }, weekend: { open: '09:00', close: '20:00' } },
    2: { weekday: { open: '07:30', close: '21:00' }, weekend: { open: '09:00', close: '20:00' } },
    3: { weekday: { open: '07:00', close: '20:30' }, weekend: { open: '08:30', close: '19:30' } },
    4: { weekday: cafeWeekday, weekend: cafeWeekend },
    5: { weekday: { open: '07:30', close: '20:00' }, weekend: { open: '10:00', close: '18:00' } },
    6: { weekday, weekend },
    7: { weekday: marketWeekday, weekend: marketWeekend },
    8: { weekday: { open: '07:30', close: '16:00' }, weekend: { open: null, close: null } }, // closed weekends
    9: { weekday: cafeWeekday, weekend: { open: '09:00', close: '17:00' } },
    10: { weekday: marketWeekday, weekend: marketWeekend },
    11: { weekday: { open: '06:30', close: '15:00' }, weekend: { open: null, close: null } }, // closed weekends
  };

  const sched = schedules[locId] || { weekday, weekend };
  const hours = [];

  for (let day = 0; day < 7; day++) {
    const isWeekend = day === 0 || day === 6;
    const h = isWeekend ? sched.weekend : sched.weekday;
    if (h.open && h.close) {
      hours.push({ day_of_week: day, open_time: h.open, close_time: h.close });
    }
  }
  return hours;
}

// ============ BUSYNESS PATTERNS ============

/**
 * Returns a base busyness level (1-5) for a given hour based on typical
 * college dining patterns. Location-specific modifiers are applied on top.
 */
function getBasePattern(hour, dayOfWeek) {
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

  // Weekend patterns are generally flatter and quieter
  if (isWeekend) {
    if (hour < 9 || hour >= 20) return 1;
    if (hour >= 10 && hour <= 13) return 2.8; // brunch
    if (hour >= 17 && hour <= 19) return 2.5; // dinner
    return 1.8;
  }

  // Weekday patterns
  if (hour < 7 || hour >= 21) return 1;
  if (hour >= 7 && hour < 8) return 2.0;     // early breakfast
  if (hour >= 8 && hour < 9) return 2.8;     // breakfast rush
  if (hour >= 9 && hour < 10) return 2.2;    // post-breakfast
  if (hour >= 10 && hour < 11) return 2.0;   // mid-morning
  if (hour >= 11 && hour < 12) return 3.5;   // lunch starts
  if (hour === 12) return 4.8;               // PEAK lunch
  if (hour === 13) return 4.2;               // late lunch
  if (hour >= 14 && hour < 16) return 1.8;   // afternoon lull
  if (hour === 16) return 2.0;               // pre-dinner
  if (hour === 17) return 3.0;               // early dinner
  if (hour === 18) return 3.8;               // dinner peak
  if (hour === 19) return 3.2;               // late dinner
  if (hour === 20) return 2.0;               // winding down
  return 1.5;
}

/**
 * Location-specific modifiers to make each venue feel unique.
 */
function getLocationModifier(locId, hour, dayOfWeek) {
  switch (locId) {
    case 1: // Vista Grande — large dining hall, lunch is insane
      if (hour >= 11 && hour <= 13) return 0.3;
      return -0.1;
    case 2: // 1901 Marketplace — popular food hall, consistently busy
      if (hour >= 11 && hour <= 13) return 0.5;
      if (hour >= 17 && hour <= 19) return 0.3;
      return 0.1;
    case 3: // 805 Kitchen — buffet, steady lunch crowd
      if (hour >= 11 && hour <= 13) return 0.4;
      return 0;
    case 4: // 805 Café — morning coffee rush
      if (hour >= 7 && hour <= 9) return 0.8;
      if (hour >= 14 && hour <= 16) return 0.3; // afternoon coffee
      return -0.3;
    case 5: // The Avenue — student hub
      if (hour >= 11 && hour <= 13) return 0.2;
      return 0;
    case 6: // Mustang Station — quick, spread out
      return -0.2;
    case 7: // Campus Market — spikes at odd hours
      if (hour >= 14 && hour <= 16) return 0.5;
      return -0.5;
    case 8: // Poly Deli — lunch-only spike
      if (hour >= 11 && hour <= 13) return 0.6;
      return -0.4;
    case 9: // Julian's Café — library crowd, morning + study sessions
      if (hour >= 8 && hour <= 10) return 0.9;
      if (hour >= 13 && hour <= 16) return 0.5;
      return -0.2;
    case 10: // Hilltop Grocery — low traffic, evening spikes
      if (hour >= 18 && hour <= 20) return 0.3;
      return -0.6;
    case 11: // Einstein Bros — breakfast heavy
      if (hour >= 7 && hour <= 9) return 1.0;
      return -0.3;
    default:
      return 0;
  }
}

/**
 * Day-of-week modifier: MWF busier (more classes), T/Th slightly less, weekends quiet
 */
function getDayModifier(dayOfWeek) {
  const modifiers = {
    0: -0.8, // Sunday
    1: 0.2,  // Monday
    2: 0,    // Tuesday
    3: 0.3,  // Wednesday — busiest
    4: 0.1,  // Thursday
    5: -0.3, // Friday — people leaving
    6: -0.6, // Saturday
  };
  return modifiers[dayOfWeek] || 0;
}

// ============ SEED FUNCTION ============

function seed() {
  const db = getDb();
  console.log('🌱 Seeding Cal Poly Dining Forecaster database...\n');

  // Clear existing data
  db.exec('DELETE FROM busyness_averages');
  db.exec('DELETE FROM busyness_records');
  db.exec('DELETE FROM operating_hours');
  db.exec('DELETE FROM locations');

  // Insert locations
  const insertLoc = db.prepare(`
    INSERT INTO locations (id, name, type, building, lat, lng, capacity, description, image_url)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, NULL)
  `);

  for (const loc of LOCATIONS) {
    insertLoc.run(loc.id, loc.name, loc.type, loc.building, loc.lat, loc.lng, loc.capacity, loc.description);
    console.log(`  📍 Added: ${loc.name}`);
  }

  // Insert operating hours
  const insertHours = db.prepare(`
    INSERT OR REPLACE INTO operating_hours (location_id, day_of_week, open_time, close_time)
    VALUES (?, ?, ?, ?)
  `);

  for (const loc of LOCATIONS) {
    const hours = getHoursForLocation(loc.id);
    for (const h of hours) {
      insertHours.run(loc.id, h.day_of_week, h.open_time, h.close_time);
    }
  }
  console.log('\n  🕐 Added operating hours for all locations');

  // Generate busyness records (8 weeks of data)
  const insertRecord = db.prepare(`
    INSERT INTO busyness_records (location_id, timestamp, day_of_week, hour, minute, level, source)
    VALUES (?, ?, ?, ?, ?, ?, 'synthetic')
  `);

  const WEEKS = 8;
  let recordCount = 0;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - (WEEKS * 7));

  console.log(`\n  📊 Generating ${WEEKS} weeks of synthetic data...`);

  const insertMany = db.transaction(() => {
    for (let week = 0; week < WEEKS; week++) {
      for (let day = 0; day < 7; day++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + (week * 7) + day);
        const dayOfWeek = currentDate.getDay();

        for (const loc of LOCATIONS) {
          const hours = getHoursForLocation(loc.id);
          const todayHours = hours.find(h => h.day_of_week === dayOfWeek);
          if (!todayHours) continue;

          const openHour = parseInt(todayHours.open_time.split(':')[0]);
          const closeHour = parseInt(todayHours.close_time.split(':')[0]);

          for (let hour = openHour; hour < closeHour; hour++) {
            // Generate 2-3 readings per hour
            const readings = 2 + Math.floor(Math.random() * 2);
            for (let r = 0; r < readings; r++) {
              const minute = Math.floor(Math.random() * 60);
              const base = getBasePattern(hour, dayOfWeek);
              const locMod = getLocationModifier(loc.id, hour, dayOfWeek);
              const dayMod = getDayModifier(dayOfWeek);
              const noise = (Math.random() - 0.5) * 1.0; // ±0.5

              let level = Math.round(base + locMod + dayMod + noise);
              level = Math.max(1, Math.min(5, level));

              const ts = new Date(currentDate);
              ts.setHours(hour, minute, 0, 0);

              insertRecord.run(loc.id, ts.toISOString(), dayOfWeek, hour, minute, level);
              recordCount++;
            }
          }
        }
      }
    }
  });

  insertMany();
  console.log(`  ✅ Generated ${recordCount.toLocaleString()} busyness records`);

  // Compute averages
  console.log('\n  🧮 Computing busyness averages...');
  db.exec(`
    INSERT OR REPLACE INTO busyness_averages (location_id, day_of_week, hour, avg_level, sample_count)
    SELECT
      location_id,
      day_of_week,
      hour,
      ROUND(AVG(level), 2),
      COUNT(*)
    FROM busyness_records
    GROUP BY location_id, day_of_week, hour
  `);

  const avgCount = db.prepare('SELECT COUNT(*) as cnt FROM busyness_averages').get();
  console.log(`  ✅ Computed ${avgCount.cnt} average entries`);

  console.log('\n🎉 Seed complete!\n');
}

// Run if executed directly
if (require.main === module) {
  seed();
}

module.exports = { seed };
