const DAY_INDEX = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

const CAMPUS_TIME_ZONE = 'America/Los_Angeles';

const formatter = new Intl.DateTimeFormat('en-US', {
  timeZone: CAMPUS_TIME_ZONE,
  weekday: 'short',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

/**
 * Cal Poly's dining hours/data are all defined in campus local time
 * (America/Los_Angeles). Hosts often run their server clock in UTC, so
 * `new Date().getDay()/getHours()` would silently use the wrong day/hour —
 * this always resolves "now" in campus time regardless of server timezone.
 */
function getCampusNow(date = new Date()) {
  const parts = Object.fromEntries(formatter.formatToParts(date).map((p) => [p.type, p.value]));
  return {
    dayOfWeek: DAY_INDEX[parts.weekday],
    hour: parseInt(parts.hour, 10),
    minute: parseInt(parts.minute, 10),
  };
}

module.exports = { getCampusNow };
