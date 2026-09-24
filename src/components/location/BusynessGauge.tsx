import { useEffect } from 'react';
import { motion, animate, useMotionValue, useTransform } from 'framer-motion';
import { getLevelColor, LEVEL_LABELS } from '../../types';

interface BusynessGaugeProps {
  level: number;
  size?: number;
}

function useCountUp(target: number) {
  const value = useMotionValue(target);
  useEffect(() => {
    const controls = animate(value, target, { duration: 0.6, ease: [0.16, 1, 0.3, 1] });
    return controls.stop;
  }, [target, value]);
  return value;
}

export function BusynessGauge({ level, size = 88 }: BusynessGaugeProps) {
  const clamped = Math.max(1, Math.min(5, level));
  const color = getLevelColor(clamped);
  const pct = clamped / 5;
  const radius = (size - 10) / 2;
  const circumference = 2 * Math.PI * radius;
  const animatedLevel = useCountUp(clamped);
  const displayLevel = useTransform(animatedLevel, (v) => v.toFixed(1));

  return (
    <div className="gauge" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={7}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={7}
          strokeLinecap="round"
          strokeDasharray={circumference}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference * (1 - pct) }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          style={{ filter: `drop-shadow(0 0 6px ${color})` }}
        />
      </svg>
      <div className="gauge-label">
        <motion.span className="gauge-level" style={{ color }}>{displayLevel}</motion.span>
        <span className="gauge-text">{LEVEL_LABELS[Math.round(clamped)]}</span>
      </div>
    </div>
  );
}
