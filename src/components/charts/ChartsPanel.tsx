import { memo } from 'react';
import { HourlyForecastChart } from './HourlyForecastChart';
import { WeeklyTrendChart } from './WeeklyTrendChart';
import { BestTimeCard } from './BestTimeCard';
import type { HourlyForecast, WeeklyTrend, BestTimeResult } from '../../types';

interface ChartsPanelProps {
  forecast: HourlyForecast[];
  weekly: WeeklyTrend[];
  bestTime: BestTimeResult;
  loading: boolean;
  selectedDay: number;
  onDayChange: (day: number) => void;
}

// Grouped so the recharts bundle can be code-split behind React.lazy —
// it isn't needed for first paint and is the single largest dependency.
export const ChartsPanel = memo(function ChartsPanel({
  forecast,
  weekly,
  bestTime,
  loading,
  selectedDay,
  onDayChange,
}: ChartsPanelProps) {
  return (
    <>
      <HourlyForecastChart forecast={forecast} loading={loading} selectedDay={selectedDay} onDayChange={onDayChange} />
      <WeeklyTrendChart weekly={weekly} loading={loading} />
      <BestTimeCard bestTime={bestTime} loading={loading} />
    </>
  );
});

export default ChartsPanel;
