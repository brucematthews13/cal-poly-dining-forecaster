import { memo } from 'react';
import { MapPin } from 'lucide-react';
import type { LocationOverview } from '../../types';
import { BusynessGauge } from './BusynessGauge';
import { WaitTimeEstimate } from './WaitTimeEstimate';
import { OpenBadge } from '../ui/Badge';
import { Skeleton } from '../ui/Skeleton';

export const LocationDetail = memo(function LocationDetail({ location }: { location: LocationOverview | undefined }) {
  if (!location) {
    return (
      <div className="glass-card chart-card location-detail">
        <Skeleton height={16} width="60%" />
        <Skeleton height={88} width={88} round className="animate-fade-in" />
      </div>
    );
  }

  return (
    <div className="glass-card chart-card location-detail">
      <div className="location-detail-header">
        <div>
          <h4>{location.name}</h4>
          <span className="location-detail-meta">
            <MapPin size={12} />
            {location.building ? `Bldg ${location.building}` : location.type.replace('_', ' ')}
          </span>
        </div>
        <OpenBadge isOpen={location.is_open} />
      </div>
      <div className="location-detail-body">
        <BusynessGauge level={location.current_level} size={80} />
        <div className="location-detail-stats">
          <WaitTimeEstimate minutes={location.wait_minutes} level={location.current_level} />
          {location.hours_today && (
            <span className="location-detail-hours">
              {location.hours_today.open_time} – {location.hours_today.close_time} today
            </span>
          )}
        </div>
      </div>
    </div>
  );
});
