import { useEffect } from 'react';

const WORKER_URL = 'https://gemini-proxy.spupuz.workers.dev';

export function useTelemetry() {
  useEffect(() => {
    const reportVisit = async () => {
      // Avoid reporting in development if needed, or keep for testing
      // if (import.meta.env.DEV) return;

      try {
        await fetch(`${WORKER_URL}/telemetry`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            timestamp: new Date().toISOString(),
            url: window.location.href,
            referrer: document.referrer,
          }),
        });
      } catch (err) {
        console.error('Telemetry reporting failed:', err);
      }
    };

    reportVisit();
  }, []);
}
