export function MapLegend() {
  return (
    <div className="map-legend glass-card">
      <span className="map-legend-title">Busyness</span>
      <div className="map-legend-scale">
        {[1, 2, 3, 4, 5].map((level) => (
          <span key={level} className={`busyness-dot level-${level}`} />
        ))}
      </div>
      <div className="map-legend-labels">
        <span>Empty</span>
        <span>Packed</span>
      </div>
    </div>
  );
}
