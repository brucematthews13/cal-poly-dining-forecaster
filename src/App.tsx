import { lazy, Suspense, useEffect, useState } from 'react';
import { Header } from './components/layout/Header';
import { LocationSidebar } from './components/layout/LocationSidebar';
import { InsightsBar } from './components/layout/InsightsBar';
import { LocationDetail } from './components/location/LocationDetail';
import { FloatingReportButton } from './components/report/FloatingReportButton';
import { ReportModal } from './components/report/ReportModal';
import { Toast } from './components/ui/Toast';
import { Skeleton } from './components/ui/Skeleton';
import { SplashScreen } from './components/ui/SplashScreen';
import { useLocations } from './hooks/useLocations';
import { useLocationDetail } from './hooks/useLocationDetail';

// Leaflet and Recharts are the two heaviest dependencies — neither is needed
// for first paint, so both are split into their own chunks.
const CampusMap = lazy(() => import('./components/map/CampusMap').then((m) => ({ default: m.CampusMap })));
const ChartsPanel = lazy(() => import('./components/charts/ChartsPanel'));

function MapFallback() {
  return (
    <div className="app-map">
      <Skeleton height="100%" />
    </div>
  );
}

function ChartsFallback() {
  return (
    <>
      {[0, 1, 2].map((i) => (
        <div key={i} className="glass-card chart-card">
          <Skeleton height={160} />
        </div>
      ))}
    </>
  );
}

function App() {
  const { locations, loading, error, refetch } = useLocations();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedDay, setSelectedDay] = useState(new Date().getDay());
  const [reportOpen, setReportOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showSplash = loading && locations.length === 0;

  useEffect(() => {
    if (selectedId == null && locations.length > 0) {
      setSelectedId(locations[0].id);
    }
  }, [locations, selectedId]);

  const selectedLocation = locations.find((l) => l.id === selectedId);
  const { forecast, weekly, bestTime, loading: detailLoading } = useLocationDetail(selectedId, selectedDay);

  function handleReportSuccess(message: string) {
    setToastMessage(message);
    refetch();
  }

  return (
    <>
      <SplashScreen visible={showSplash} />
      <div className="app-layout">
        <Header onReportClick={() => setReportOpen(true)} />

        <main className="app-main">
          <LocationSidebar
            locations={locations}
            loading={loading}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />

          <div className="app-content">
            {error && <div className="app-error">Couldn't reach the server: {error}</div>}

            <Suspense fallback={<MapFallback />}>
              <CampusMap locations={locations} selectedId={selectedId} onSelect={setSelectedId} />
            </Suspense>

            <div className="app-charts">
              <LocationDetail location={selectedLocation} />
              <Suspense fallback={<ChartsFallback />}>
                <ChartsPanel
                  forecast={forecast}
                  weekly={weekly}
                  bestTime={bestTime}
                  loading={detailLoading}
                  selectedDay={selectedDay}
                  onDayChange={setSelectedDay}
                />
              </Suspense>
            </div>
          </div>
        </main>

        <InsightsBar locations={locations} />

        <FloatingReportButton onClick={() => setReportOpen(true)} />
        <ReportModal
          open={reportOpen}
          onClose={() => setReportOpen(false)}
          locations={locations}
          defaultLocationId={selectedId}
          onSuccess={handleReportSuccess}
        />
        <Toast message={toastMessage} onDismiss={() => setToastMessage(null)} />
      </div>
    </>
  );
}

export default App;
