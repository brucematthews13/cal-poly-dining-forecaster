import { memo } from 'react';
import { Area, AreaChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { DAY_NAMES_SHORT, getLevelColor } from '../../types';
import type { HourlyForecast } from '../../types';
import { Skeleton } from '../ui/Skeleton';

interface HourlyForecastChartProps {
  forecast: HourlyForecast[];
  loading: boolean;
  selectedDay: number;
  onDayChange: (day: number) => void;
}

function ChartTooltip({ active, payload }: { active?: boolean; payload?: { payload: HourlyForecast }[] }) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;
  return (
    <div className="chart-tooltip glass-card-static">
      <strong>{point.label}</strong>
      <span>Level {point.predicted_level.toFixed(1)}</span>
      <span>{Math.round(point.confidence * 100)}% confidence</span>
      <span className="chart-tooltip-source">
        {point.real_sample_count > 0
          ? `${point.real_sample_count} of ${point.sample_count} samples are real reports`
          : `Simulated (0 real reports yet)`}
      </span>
    </div>
  );
}

export const HourlyForecastChart = memo(function HourlyForecastChart({ forecast, loading, selectedDay, onDayChange }: HourlyForecastChartProps) {
  const now = new Date();
  const currentHourLabel = forecast.find((f) => f.hour === now.getHours())?.label;
  const realReportCount = forecast.reduce((sum, f) => sum + f.real_sample_count, 0);

  return (
    <div className="glass-card chart-card">
      <div className="chart-card-header">
        <div>
          <h4>Hourly Forecast</h4>
          {!loading && forecast.length > 0 && (
            <span className="chart-data-badge">
              {realReportCount > 0
                ? `📊 Includes ${realReportCount} real report${realReportCount === 1 ? '' : 's'}`
                : '🧪 Simulated data — no real reports yet'}
            </span>
          )}
        </div>
        <div className="day-tabs" role="tablist" aria-label="Day of week">
          {DAY_NAMES_SHORT.map((d, i) => (
            <button
              key={d}
              type="button"
              role="tab"
              aria-selected={i === selectedDay}
              className={`day-tab ${i === selectedDay ? 'day-tab-active' : ''}`}
              onClick={() => onDayChange(i)}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <Skeleton height={160} />
      ) : forecast.length === 0 ? (
        <div className="chart-empty">No data for this day</div>
      ) : (
        <ResponsiveContainer width="100%" height={160}>
          <AreaChart data={forecast} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="forecastGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={getLevelColor(4)} stopOpacity={0.5} />
                <stop offset="100%" stopColor={getLevelColor(1)} stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis dataKey="label" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} interval={2} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 5]} tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} width={20} />
            <Tooltip content={<ChartTooltip />} />
            {currentHourLabel && (
              <ReferenceLine x={currentHourLabel} stroke="var(--cp-gold-light)" strokeDasharray="4 2" />
            )}
            <Area
              type="monotone"
              dataKey="predicted_level"
              stroke="var(--cp-gold-light)"
              strokeWidth={2}
              fill="url(#forecastGradient)"
              animationDuration={600}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
});
