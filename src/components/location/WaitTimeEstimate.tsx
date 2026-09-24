import { Clock } from 'lucide-react';
import { getLevelColor } from '../../types';

export function WaitTimeEstimate({ minutes, level }: { minutes: number; level: number }) {
  const color = getLevelColor(level);
  return (
    <div className="wait-time" style={{ color }}>
      <Clock size={16} />
      <span>{minutes === 0 ? 'No wait' : `~${minutes} min wait`}</span>
    </div>
  );
}
