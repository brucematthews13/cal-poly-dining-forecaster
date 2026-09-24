import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { getLevelColor } from '../../types';
import type { WeeklyTrend } from '../../types';
import { Skeleton } from '../ui/Skeleton';

interface WeeklyTrendChartProps {
  weekly: WeeklyTrend[];
  loading: boolean;
}

function ChartTooltip({ active, payload }: { active?: boolean; payload?: { payload: WeeklyTrend }[] }) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;
  return (
    <div className="chart-tooltip glass-card-static">
      <strong>{point.day_name}</strong>
      <span>Avg level {point.avg_level.toFixed(1)}</span>
    </div>
  );
}

export function WeeklyTrendChart({ weekly, loading }: WeeklyTrendChartProps) {
  const today = new Date().getDay();

  return (
    <div className="glass-card chart-card">
      <div className="chart-card-header">
        <h4>Weekly Trend</h4>
      </div>
      {loading ? (
        <Skeleton height={160} />
      ) : (
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={weekly} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis
              dataKey="day_name"
              tickFormatter={(v: string) => v.slice(0, 3)}
              tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis domain={[0, 5]} tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} width={20} />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
            <Bar dataKey="avg_level" radius={[6, 6, 0, 0]} animationDuration={600}>
              {weekly.map((day) => (
                <Cell
                  key={day.day_of_week}
                  fill={getLevelColor(day.avg_level)}
                  opacity={day.day_of_week === today ? 1 : 0.55}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
