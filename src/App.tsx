import { useEffect, useState } from 'react';
import { Header } from './components/layout/Header';
import { LocationSidebar } from './components/layout/LocationSidebar';
import { InsightsBar } from './components/layout/InsightsBar';
import { CampusMap } from './components/map/CampusMap';
import { LocationDetail } from './components/location/LocationDetail';
import { HourlyForecastChart } from './components/charts/HourlyForecastChart';
import { WeeklyTrendChart } from './components/charts/WeeklyTrendChart';
import { BestTimeCard } from './components/charts/BestTimeCard';
import { FloatingReportButton } from './components/report/FloatingReportButton';
import { ReportModal } from './components/report/ReportModal';
import { Toast } from './components/ui/Toast';
import { useLocations } from './hooks/useLocations';
import { useLocationDetail } from './hooks/useLocationDetail';

function App() {
  const { locations, loading, error, refetch } = useLocations();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedDay, setSelectedDay] = useState(new Date().getDay());
  const [reportOpen, setReportOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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

          <CampusMap locations={locations} selectedId={selectedId} onSelect={setSelectedId} />

          <div className="app-charts">
            <LocationDetail location={selectedLocation} />
            <HourlyForecastChart
              forecast={forecast}
              loading={detailLoading}
              selectedDay={selectedDay}
              onDayChange={setSelectedDay}
            />
            <WeeklyTrendChart weekly={weekly} loading={detailLoading} />
            <BestTimeCard bestTime={bestTime} loading={detailLoading} />
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
  );
}

export default App;
