import { useEffect } from 'react';

const WORKER_URL = 'https://gemini-proxy.spupuz.workers.dev';

export function useTelemetry() {
  useEffect(() => {
    const reportVisit = async () => {
      const getSafeUrl = () => window.location.pathname;
      const getSafeReferrer = () => {
        if (!document.referrer) return '';
        try {
          return new URL(document.referrer).origin;
        } catch {
          return '';
        }
      };

      try {
        await fetch(`${WORKER_URL}/telemetry`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            timestamp: new Date().toISOString(),
            url: getSafeUrl(),
            referrer: getSafeReferrer(),
          }),
        });
      } catch (err) {
        console.error('Telemetry reporting failed:', err);
      }
    };

    reportVisit();
  }, []);
}
