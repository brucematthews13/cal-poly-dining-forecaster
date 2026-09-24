import { useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import type { LocationOverview } from '../../types';
import { getLevelColor, LEVEL_LABELS } from '../../types';
import { MapLegend } from './MapLegend';

const CAMPUS_CENTER: [number, number] = [35.3005, -120.66];
const ZOOM = 16;

function FlyToSelection({ location }: { location: LocationOverview | undefined }) {
  const map = useMap();
  useEffect(() => {
    if (location) {
      map.flyTo([location.lat, location.lng], 17, { duration: 0.8 });
    }
  }, [location, map]);
  return null;
}

interface CampusMapProps {
  locations: LocationOverview[];
  selectedId: number | null;
  onSelect: (id: number) => void;
}

export function CampusMap({ locations, selectedId, onSelect }: CampusMapProps) {
  const selected = locations.find((l) => l.id === selectedId);

  return (
    <div className="app-map">
      <MapContainer center={CAMPUS_CENTER} zoom={ZOOM} scrollWheelZoom>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        <FlyToSelection location={selected} />
        {locations.map((loc) => {
          const level = Math.round(Math.max(1, Math.min(5, loc.current_level)));
          const color = getLevelColor(loc.current_level);
          const isSelected = loc.id === selectedId;
          return (
            <CircleMarker
              key={loc.id}
              center={[loc.lat, loc.lng]}
              radius={isSelected ? 13 : 9}
              pathOptions={{
                color: isSelected ? 'var(--cp-gold-light)' : color,
                fillColor: color,
                fillOpacity: loc.is_open ? 0.85 : 0.3,
                weight: isSelected ? 3 : 1.5,
                className: level >= 4 ? 'marker-pulse' : undefined,
              }}
              eventHandlers={{ click: () => onSelect(loc.id) }}
            >
              <Popup>
                <div className="map-popup">
                  <strong>{loc.name}</strong>
                  <span>
                    {loc.is_open ? `${LEVEL_LABELS[level]} · Level ${loc.current_level.toFixed(1)}` : 'Closed now'}
                  </span>
                  {loc.is_open && (
                    <span>{loc.wait_minutes === 0 ? 'No wait' : `~${loc.wait_minutes} min wait`}</span>
                  )}
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
      <MapLegend />
    </div>
  );
}
