import { memo } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import type { BestTimeResult } from '../../types';
import { getLevelColor } from '../../types';
import { Skeleton } from '../ui/Skeleton';

export const BestTimeCard = memo(function BestTimeCard({ bestTime, loading }: { bestTime: BestTimeResult; loading: boolean }) {
  return (
    <div className="glass-card chart-card best-time-card">
      <div className="chart-card-header">
        <h4>Best Times</h4>
      </div>
      {loading ? (
        <Skeleton height={160} />
      ) : (
        <div className="best-time-lists">
          <div className="best-time-list">
            <span className="best-time-list-title good">
              <CheckCircle2 size={14} /> Go now
            </span>
            {bestTime.best_slots.map((slot) => (
              <div key={slot.hour} className="best-time-slot">
                <span>{slot.label}</span>
                <span style={{ color: getLevelColor(slot.predicted_level) }}>{slot.predicted_level.toFixed(1)}</span>
              </div>
            ))}
          </div>
          <div className="best-time-list">
            <span className="best-time-list-title bad">
              <XCircle size={14} /> Avoid
            </span>
            {bestTime.avoid_slots.map((slot) => (
              <div key={slot.hour} className="best-time-slot">
                <span>{slot.label}</span>
                <span style={{ color: getLevelColor(slot.predicted_level) }}>{slot.predicted_level.toFixed(1)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});
