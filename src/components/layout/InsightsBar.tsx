import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { LocationOverview } from '../../types';

interface InsightsBarProps {
  locations: LocationOverview[];
}

export function InsightsBar({ locations }: InsightsBarProps) {
  const insights = useMemo(() => {
    const open = locations.filter((l) => l.is_open);
    if (open.length === 0) return [];

    const quietest = [...open].sort((a, b) => a.current_level - b.current_level)[0];
    const busiest = [...open].sort((a, b) => b.current_level - a.current_level)[0];

    const messages: string[] = [];
    if (quietest) messages.push(`🟢 Quietest right now: ${quietest.name} (Level ${quietest.current_level.toFixed(1)})`);
    if (busiest) messages.push(`🔴 Busiest right now: ${busiest.name} (Level ${busiest.current_level.toFixed(1)})`);
    messages.push(`🐴 ${open.length} of ${locations.length} dining locations are open right now.`);
    return messages;
  }, [locations]);

  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (insights.length < 2) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % insights.length), 5000);
    return () => clearInterval(id);
  }, [insights.length]);

  if (insights.length === 0) return <div className="app-insights" />;

  return (
    <div className="app-insights">
      <AnimatePresence mode="wait">
        <motion.span
          key={index}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.3 }}
          className="insight-text"
        >
          {insights[index]}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}
