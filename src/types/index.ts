// TypeScript types for Cal Poly Dining Forecaster

export interface DiningLocation {
  id: number;
  name: string;
  type: 'dining_hall' | 'cafe' | 'market' | 'quick_service' | 'food_hall';
  building: string | null;
  lat: number;
  lng: number;
  capacity: number;
  description: string;
  image_url: string | null;
}

export interface OperatingHours {
  id: number;
  location_id: number;
  day_of_week: number; // 0=Sun, 1=Mon, ..., 6=Sat
  open_time: string;   // 'HH:MM'
  close_time: string;
}

export interface BusynessRecord {
  id: number;
  location_id: number;
  timestamp: string;
  day_of_week: number;
  hour: number;
  minute: number;
  level: number; // 1-5
  source: 'synthetic' | 'crowdsource';
}

export interface BusynessAverage {
  location_id: number;
  day_of_week: number;
  hour: number;
  avg_level: number;
  sample_count: number;
}

export interface HourlyForecast {
  hour: number;
  predicted_level: number;
  confidence: number;
  label: string; // '7 AM', '12 PM', etc.
  sample_count: number; // total samples (synthetic + real) baked into this hour's average
  real_sample_count: number; // of those, how many came from real crowd reports
}

export interface WeeklyTrend {
  day_of_week: number;
  day_name: string;
  avg_level: number;
}

export interface BestTimeSlot {
  hour: number;
  label: string;
  predicted_level: number;
}

export interface BestTimeResult {
  best_slots: BestTimeSlot[];
  avoid_slots: BestTimeSlot[];
}

export interface LocationOverview extends DiningLocation {
  current_level: number;
  is_open: boolean;
  hours_today: OperatingHours | null;
  wait_minutes: number;
}

export interface CrowdReport {
  location_id: number;
  level: number; // 1-5
}

export interface InsightMessage {
  type: 'quietest' | 'busiest' | 'recommendation';
  icon: string;
  message: string;
}

// Busyness level helpers
export const LEVEL_LABELS: Record<number, string> = {
  1: 'Empty',
  2: 'Calm',
  3: 'Moderate',
  4: 'Busy',
  5: 'Packed',
};

export const LEVEL_EMOJIS: Record<number, string> = {
  1: '😌',
  2: '🙂',
  3: '😐',
  4: '😰',
  5: '🤯',
};

export const LEVEL_COLORS: Record<number, string> = {
  1: '#22c55e',
  2: '#84cc16',
  3: '#eab308',
  4: '#f97316',
  5: '#ef4444',
};

export const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
export const DAY_NAMES_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function formatHour(hour: number): string {
  if (hour === 0) return '12 AM';
  if (hour < 12) return `${hour} AM`;
  if (hour === 12) return '12 PM';
  return `${hour - 12} PM`;
}

export function getWaitMinutes(level: number): number {
  const waitMap: Record<number, number> = { 1: 0, 2: 5, 3: 10, 4: 18, 5: 28 };
  return waitMap[level] ?? 0;
}

export function getLevelColor(level: number): string {
  return LEVEL_COLORS[Math.round(Math.max(1, Math.min(5, level)))] ?? LEVEL_COLORS[3];
}
