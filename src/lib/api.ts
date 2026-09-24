// API client for Cal Poly Dining Forecaster
import type { LocationOverview, HourlyForecast, WeeklyTrend, BestTimeResult, CrowdReport } from '../types';

const API_BASE = '/api';

async function fetchJSON<T>(url: string): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API error ${res.status}: ${text}`);
  }
  return res.json();
}

export async function getLocations(): Promise<LocationOverview[]> {
  return fetchJSON<LocationOverview[]>('/locations');
}

export async function getLocationOverview(): Promise<LocationOverview[]> {
  return fetchJSON<LocationOverview[]>('/overview');
}

export async function getForecast(locationId: number, dayOfWeek: number): Promise<HourlyForecast[]> {
  return fetchJSON<HourlyForecast[]>(`/locations/${locationId}/forecast?day=${dayOfWeek}`);
}

export async function getWeeklyTrend(locationId: number): Promise<WeeklyTrend[]> {
  return fetchJSON<WeeklyTrend[]>(`/locations/${locationId}/weekly`);
}

export async function getBestTime(locationId: number, dayOfWeek: number): Promise<BestTimeResult> {
  return fetchJSON<BestTimeResult>(`/locations/${locationId}/best-time?day=${dayOfWeek}`);
}

export async function submitReport(report: CrowdReport): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_BASE}/report`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(report),
  });
  return res.json();
}
