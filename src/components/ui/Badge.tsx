import { LEVEL_LABELS } from '../../types';

export function OpenBadge({ isOpen }: { isOpen: boolean }) {
  return <span className={`badge ${isOpen ? 'badge-open' : 'badge-closed'}`}>{isOpen ? 'Open' : 'Closed'}</span>;
}

export function LevelBadge({ level }: { level: number }) {
  const rounded = Math.round(Math.max(1, Math.min(5, level)));
  return <span className={`badge badge-level-${rounded}`}>{LEVEL_LABELS[rounded]}</span>;
}
