import { useEffect, useState } from 'react';
import { getForecast, getWeeklyTrend, getBestTime } from '../lib/api';
import type { HourlyForecast, WeeklyTrend, BestTimeResult } from '../types';

export function useLocationDetail(locationId: number | null, dayOfWeek: number) {
  const [forecast, setForecast] = useState<HourlyForecast[]>([]);
  const [weekly, setWeekly] = useState<WeeklyTrend[]>([]);
  const [bestTime, setBestTime] = useState<BestTimeResult>({ best_slots: [], avoid_slots: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (locationId == null) return;
    let cancelled = false;
    setLoading(true);

    Promise.all([
      getForecast(locationId, dayOfWeek),
      getWeeklyTrend(locationId),
      getBestTime(locationId, dayOfWeek),
    ])
      .then(([f, w, b]) => {
        if (cancelled) return;
        setForecast(f);
        setWeekly(w);
        setBestTime(b);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [locationId, dayOfWeek]);

  return { forecast, weekly, bestTime, loading };
}
