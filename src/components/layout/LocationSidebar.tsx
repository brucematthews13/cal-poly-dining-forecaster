import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { LocationCard } from '../location/LocationCard';
import { Skeleton } from '../ui/Skeleton';
import type { LocationOverview } from '../../types';

type SortMode = 'name' | 'busiest' | 'quietest';

interface LocationSidebarProps {
  locations: LocationOverview[];
  loading: boolean;
  selectedId: number | null;
  onSelect: (id: number) => void;
}

const TYPE_FILTERS: { value: string; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'dining_hall', label: 'Dining Halls' },
  { value: 'cafe', label: 'Cafés' },
  { value: 'food_hall', label: 'Food Halls' },
  { value: 'quick_service', label: 'Quick Service' },
  { value: 'market', label: 'Market' },
  { value: 'grocery', label: 'Grocery' },
  { value: 'buffet', label: 'Buffet' },
];

export function LocationSidebar({ locations, loading, selectedId, onSelect }: LocationSidebarProps) {
  const [sort, setSort] = useState<SortMode>('name');
  const [typeFilter, setTypeFilter] = useState('all');

  const filtered = useMemo(() => {
    let list = locations;
    if (typeFilter !== 'all') {
      list = list.filter((l) => l.type === typeFilter);
    }
    const sorted = [...list];
    if (sort === 'name') sorted.sort((a, b) => a.name.localeCompare(b.name));
    if (sort === 'busiest') sorted.sort((a, b) => b.current_level - a.current_level);
    if (sort === 'quietest') sorted.sort((a, b) => a.current_level - b.current_level);
    return sorted;
  }, [locations, sort, typeFilter]);

  return (
    <aside className="app-sidebar">
      <div className="sidebar-controls">
        <select className="select" value={sort} onChange={(e) => setSort(e.target.value as SortMode)}>
          <option value="name">Sort: Name</option>
          <option value="busiest">Sort: Busiest first</option>
          <option value="quietest">Sort: Quietest first</option>
        </select>
        <select className="select" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
          {TYPE_FILTERS.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
      </div>

      <div className="sidebar-list">
        {loading && locations.length === 0
          ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} height={64} className="animate-fade-in" />)
          : filtered.map((loc, i) => (
              <motion.div
                key={loc.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: Math.min(i * 0.03, 0.3), duration: 0.3 }}
              >
                <LocationCard location={loc} selected={loc.id === selectedId} onSelect={onSelect} />
              </motion.div>
            ))}
      </div>
    </aside>
  );
}
