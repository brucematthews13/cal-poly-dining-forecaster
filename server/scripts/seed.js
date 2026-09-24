/**
 * Cal Poly Dining Forecaster — Seed Data Generator
 *
 * Generates 8 weeks of realistic synthetic busyness data for all 11 dining locations.
 * Models real college dining patterns: breakfast, lunch peak, afternoon lull, dinner rush.
 *
 * Coordinates are real pins supplied directly by the user (verified on campus),
 * not geocoded — do not "correct" them without new pins.
 */

const { getDb } = require('../db');

// ============ DINING LOCATIONS ============

const LOCATIONS = [
  {
    id: 1, name: 'Vista Grande', type: 'dining_hall',
    building: null, lat: 35.29916947962588, lng: -120.65597436950576, capacity: 400,
    description: 'All-you-care-to-eat dining complex serving the yakʼitʸutʸu residential neighborhood.',
  },
  {
    id: 2, name: '1901 Marketplace', type: 'food_hall',
    building: null, lat: 35.29954973020662, lng: -120.65961384667528, capacity: 350,
    description: 'Central multi-vendor food hall with a rotating lineup of national and local concepts.',
  },
  {
    id: 3, name: 'Campus Market', type: 'market',
    building: null, lat: 35.303302533682796, lng: -120.66276500581023, capacity: 40,
    description: 'Grocery and grab-and-go convenience store for snacks, beverages, and essentials.',
  },
  {
    id: 4, name: 'Subway at Kennedy Library', type: 'quick_service',
    building: '35', lat: 35.300953300131155, lng: -120.66332908332016, capacity: 40,
    description: 'Made-to-order sandwiches inside the Robert E. Kennedy Library.',
  },
  {
    id: 5, name: "Julian's Library", type: 'cafe',
    building: '35', lat: 35.30203697826458, lng: -120.66353796468992, capacity: 50,
    description: 'Coffee shop inside Kennedy Library — a favorite for study breaks.',
  },
  {
    id: 6, name: 'Shake Smart', type: 'quick_service',
    building: null, lat: 35.29883848652843, lng: -120.65993623893806, capacity: 30,
    description: 'Protein shakes, smoothies, and healthy grab-and-go bites.',
  },
  {
    id: 7, name: 'Starbucks (UU)', type: 'cafe',
    building: '65', lat: 35.30016672348545, lng: -120.65884687584582, capacity: 60,
    description: 'Full Starbucks menu inside the University Union.',
  },
  {
    id: 8, name: 'Market at UU', type: 'market',
    building: '65', lat: 35.30039174561103, lng: -120.65848800519703, capacity: 40,
    description: 'Convenience market in the University Union neighborhood.',
  },
  {
    id: 9, name: 'Scout Coffee Co.', type: 'cafe',
    building: null, lat: 35.29845980506702, lng: -120.65600378057893, capacity: 35,
    description: 'Local roaster coffee shop near the yakʼitʸutʸu neighborhood.',
  },
  {
    id: 10, name: 'Hilltop', type: 'dining_hall',
    building: null, lat: 35.307355184097595, lng: -120.65922718587373, capacity: 200,
    description: 'Dining hall serving Poly Canyon Village, including an Einstein Bros. Bagels stall.',
  },
  {
    id: 11, name: 'Subway at PCV', type: 'quick_service',
    building: null, lat: 35.307223197757274, lng: -120.65933900246988, capacity: 40,
    description: 'Made-to-order sandwiches serving the Poly Canyon Village neighborhood.',
  },
];

// ============ OPERATING HOURS ============
// day_of_week: 0=Sun, 1=Mon, ..., 6=Sat

/**
 * Real hours pulled from https://dineoncampus.com/calpoly/hours-of-operation
 * (week of Sep 20, 2026). Where a physical location houses multiple vendors
 * (e.g. Vista Grande, 1901 Marketplace, Campus Market, Hilltop), each day
 * below is the min open / max close across every vendor at that location.
 * Some entries wrap past midnight (close < open) — handled below and in
 * server/index.js's isLocationOpen.
 */
function getHoursForLocation(locId) {
  // day_of_week: 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
  const DAY = (sun, monThu, fri, sat) => [sun, monThu, monThu, monThu, monThu, fri, sat];
  const EVERY = (h) => DAY(h, h, h, h);
  const CLOSED = null;

  const schedules = {
    1: DAY({ open: '08:00', close: '22:00' }, { open: '06:30', close: '22:00' }, { open: '06:30', close: '22:00' }, { open: '08:00', close: '22:00' }), // Vista Grande
    2: DAY({ open: '11:00', close: '21:00' }, { open: '07:00', close: '21:00' }, { open: '07:00', close: '21:00' }, { open: '11:00', close: '21:00' }), // 1901 Marketplace
    3: DAY(CLOSED, { open: '07:00', close: '16:30' }, { open: '07:00', close: '16:00' }, CLOSED), // Campus Market
    4: EVERY({ open: '07:00', close: '02:00' }), // Subway at Kennedy Library — open past midnight every night
    5: DAY(CLOSED, { open: '08:00', close: '20:00' }, { open: '08:00', close: '17:00' }, CLOSED), // Julian's Library
    6: DAY({ open: '09:00', close: '21:00' }, { open: '07:00', close: '22:00' }, { open: '07:00', close: '22:00' }, { open: '09:00', close: '21:00' }), // Shake Smart
    7: DAY({ open: '08:00', close: '17:30' }, { open: '06:30', close: '21:00' }, { open: '06:30', close: '20:00' }, { open: '08:00', close: '17:30' }), // Starbucks (UU)
    8: DAY(CLOSED, { open: '08:00', close: '16:00' }, { open: '08:00', close: '16:00' }, CLOSED), // Market at UU
    9: DAY({ open: '07:30', close: '15:00' }, { open: '06:30', close: '16:00' }, { open: '06:30', close: '15:00' }, { open: '07:30', close: '15:00' }), // Scout Coffee Co.
    10: DAY({ open: '09:00', close: '17:00' }, { open: '07:00', close: '19:00' }, { open: '07:00', close: '17:00' }, { open: '09:00', close: '17:00' }), // Hilltop (incl. Einstein Bros. Bagels)
    11: [ // Subway at PCV
      { open: '09:00', close: '22:00' }, // Sun
      { open: '09:00', close: '22:00' }, // Mon
      { open: '09:00', close: '22:00' }, // Tue
      { open: '09:00', close: '22:00' }, // Wed
      { open: '09:00', close: '22:00' }, // Thu
      { open: '09:00', close: '22:00' }, // Fri
      { open: '09:00', close: '24:00' }, // Sat — open until midnight
    ],
  };

  const sched = schedules[locId];
  const hours = [];

  for (let day = 0; day < 7; day++) {
    const h = sched[day];
    if (h && h.open && h.close) {
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
    case 1: // Vista Grande — main res-hall dining complex, lunch and dinner both surge
      if (hour >= 11 && hour <= 13) return 0.3;
      if (hour >= 17 && hour <= 19) return 0.2;
      return -0.1;
    case 2: // 1901 Marketplace — popular food hall, consistently busy
      if (hour >= 11 && hour <= 13) return 0.5;
      if (hour >= 17 && hour <= 19) return 0.3;
      return 0.1;
    case 3: // Campus Market — grab-and-go, spikes at odd hours
      if (hour >= 14 && hour <= 16) return 0.5;
      return -0.5;
    case 4: // Subway at Kennedy Library — rides the library study crowd
      if (hour >= 12 && hour <= 14) return 0.3;
      if (hour >= 18 && hour <= 21) return 0.4;
      return -0.2;
    case 5: // Julian's Library — library crowd, morning + study sessions
      if (hour >= 8 && hour <= 10) return 0.9;
      if (hour >= 13 && hour <= 16) return 0.5;
      return -0.2;
    case 6: // Shake Smart — post-workout afternoon bump
      if (hour >= 14 && hour <= 17) return 0.6;
      if (hour >= 7 && hour <= 9) return -0.3;
      return -0.1;
    case 7: // Starbucks (UU) — classic morning coffee rush
      if (hour >= 7 && hour <= 9) return 0.8;
      if (hour >= 14 && hour <= 16) return 0.3; // afternoon coffee
      return -0.3;
    case 8: // UU Market — steady, slight lunch bump
      if (hour >= 11 && hour <= 13) return 0.2;
      return 0;
    case 9: // Scout Coffee Co. — morning study crowd, chill boutique vibe otherwise
      if (hour >= 8 && hour <= 10) return 0.6;
      return -0.4;
    case 10: // Hilltop — PCV residents' dinner spot, breakfast bump too
      if (hour >= 7 && hour <= 9) return 0.3;
      if (hour >= 18 && hour <= 20) return 0.6;
      return -0.1;
    case 11: // Subway (PCV) — the late-night option for that neighborhood
      if (hour >= 18 && hour <= 21) return 0.5;
      if (hour >= 21) return 0.3;
      return -0.2;
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
          let closeHour = parseInt(todayHours.close_time.split(':')[0]);
          if (closeHour <= openHour) closeHour += 24; // hours wrap past midnight (e.g. 07:00 - 02:00)

          for (let h = openHour; h < closeHour; h++) {
            const hour = h % 24;
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
