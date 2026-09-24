import { memo, type ComponentType } from 'react';
import { motion } from 'framer-motion';
import { Coffee, ShoppingBasket, Sandwich, Store, UtensilsCrossed } from 'lucide-react';
import type { LocationOverview } from '../../types';
import { getLevelColor } from '../../types';

const TYPE_ICONS: Record<string, ComponentType<{ size?: number }>> = {
  dining_hall: UtensilsCrossed,
  cafe: Coffee,
  market: ShoppingBasket,
  quick_service: Sandwich,
  food_hall: Store,
};

interface LocationCardProps {
  location: LocationOverview;
  selected: boolean;
  onSelect: (id: number) => void;
}

export const LocationCard = memo(function LocationCard({ location, selected, onSelect }: LocationCardProps) {
  const Icon = TYPE_ICONS[location.type] ?? UtensilsCrossed;
  const color = getLevelColor(location.current_level);

  return (
    <motion.button
      type="button"
      className={`location-card glass-card ${selected ? 'location-card-selected' : ''}`}
      onClick={() => onSelect(location.id)}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      layout
    >
      <div className="location-card-icon" style={{ color }}>
        <Icon size={18} />
      </div>
      <div className="location-card-info">
        <span className="location-card-name">{location.name}</span>
        <span className="location-card-meta">
          {location.is_open ? (location.wait_minutes === 0 ? 'No wait' : `~${location.wait_minutes} min wait`) : 'Closed'}
        </span>
      </div>
      <span
        className={`busyness-dot level-${Math.round(Math.max(1, Math.min(5, location.current_level)))} ${location.current_level >= 4 ? 'pulsing' : ''}`}
      />
    </motion.button>
  );
});
