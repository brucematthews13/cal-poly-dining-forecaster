import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import { latLngBounds } from 'leaflet';
import type { LatLngBoundsExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { LocationOverview } from '../../types';
import { getLevelColor, LEVEL_LABELS } from '../../types';
import { MapLegend } from './MapLegend';

// Centroid of the current dining locations, used only as the pre-fit fallback view.
const CAMPUS_CENTER: [number, number] = [35.3016, -120.6597];
const ZOOM = 15;
const MIN_ZOOM = 14;
// Bounding box covering the Cal Poly SLO campus, used to keep the map from panning off into open ocean/hills.
const CAMPUS_BOUNDS: LatLngBoundsExpression = [
  [35.2905, -120.6815],
  [35.3175, -120.6415],
];

function FlyToSelection({ location }: { location: LocationOverview | undefined }) {
  const map = useMap();
  const isFirst = useRef(true);
  useEffect(() => {
    if (!location) return;
    // Skip the initial auto-selected location so it doesn't race FitToLocations'
    // view on load — only fly for selections the user actually makes afterward.
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }
    map.flyTo([location.lat, location.lng], 17, { duration: 0.8 });
  }, [location, map]);
  return null;
}

function FitToLocations({ locations }: { locations: LocationOverview[] }) {
  const map = useMap();
  const fitted = useRef(false);
  useEffect(() => {
    if (fitted.current || locations.length === 0) return;
    const bounds = latLngBounds(locations.map((l): [number, number] => [l.lat, l.lng]));
    map.fitBounds(bounds, { padding: [24, 24] });
    fitted.current = true;
  }, [locations, map]);
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
      <MapContainer
        center={CAMPUS_CENTER}
        zoom={ZOOM}
        minZoom={MIN_ZOOM}
        scrollWheelZoom
        maxBounds={CAMPUS_BOUNDS}
        maxBoundsViscosity={1.0}
      >
        <TileLayer
          className="map-tiles-dark"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FlyToSelection location={selected} />
        <FitToLocations locations={locations} />
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
