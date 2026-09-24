import { useEffect, useState, useCallback } from 'react';
import { getLocationOverview } from '../lib/api';
import type { LocationOverview } from '../types';

const POLL_MS = 30000;

export function useLocations() {
  const [locations, setLocations] = useState<LocationOverview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    try {
      const data = await getLocationOverview();
      setLocations(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load locations');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
    const interval = setInterval(refetch, POLL_MS);
    return () => clearInterval(interval);
  }, [refetch]);

  return { locations, loading, error, refetch };
}
