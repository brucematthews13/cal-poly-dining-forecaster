import { useEffect, useState } from 'react';
import { Megaphone } from 'lucide-react';

interface HeaderProps {
  onReportClick: () => void;
}

export function Header({ onReportClick }: HeaderProps) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(id);
  }, []);

  return (
    <header className="app-header">
      <div className="app-title">
        <img src="/logo.png" alt="Campus Dining logo" className="app-title-logo" />
        <div>
          <h1>Cal Poly Dining Forecaster</h1>
          <span className="app-subtitle">Predict busy times across campus</span>
        </div>
      </div>
      <div className="app-header-right">
        <span className="app-clock">
          {now.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
          {' · '}
          {now.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
        </span>
        <button type="button" className="btn btn-primary" onClick={onReportClick}>
          <Megaphone size={16} />
          Report Busyness
        </button>
      </div>
    </header>
  );
}
