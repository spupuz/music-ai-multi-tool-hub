import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import StatsPage from '../StatsPage';

// Regression guard for minified React error #310:
// "Rendered more hooks than during the previous render."
//
// StatsPage calls six useMemo hooks after its data arrives. If any early
// return (`if (loading)` / `if (error)` / `if (!stats)`) sits above them,
// the hook count changes between renders and React throws #310.
// The component is rendered here across the loading -> success and
// loading -> error transitions, which is exactly when the crash occurred
// in production.

vi.mock('react-chartjs-2', () => ({
  Line: () => <div data-testid="mock-line-chart" />,
}));

vi.mock('react-simple-maps', () => ({
  ComposableMap: ({ children }: any) => <div>{children}</div>,
  Geographies: ({ children }: any) => <div>{typeof children === 'function' ? children({ geographies: [] }) : children}</div>,
  Geography: () => null,
  Sphere: () => null,
  Graticule: () => null,
}));

vi.mock('@/components/sunoUserStats/charts/chartSetup', () => ({}));

const WORKER_URL = 'https://gemini-proxy.spupuz.workers.dev';

const SUCCESS_PAYLOAD = {
  total: { uniques: 1234, pageviews: 5678 },
  liveCount: 3,
  countries: { IT: 42, US: 17, XX: 5 },
  timeline: [
    { date: '2026-10-01', uniques: 10 },
    { date: '2026-10-02', uniques: 20 },
  ],
};

const jsonResponse = (body: unknown) =>
  Promise.resolve(new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  }));

let errorSpy: ReturnType<typeof vi.spyOn>;
let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  // React logs #310 through console.error; fail loudly if it reappears.
  consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  errorSpy = vi.spyOn(console, 'error');
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('StatsPage hooks ordering', () => {
  it('does not throw #310 on the loading -> success transition', async () => {
    vi.stubGlobal('fetch', vi.fn().mockImplementation(() => jsonResponse(SUCCESS_PAYLOAD)));

    const { container } = render(<StatsPage {...({} as any)} />);

    // Initial render: `loading` is true and the early return fires.
    await waitFor(() => {
      expect(container.querySelector('.glass-card')).not.toBeNull();
    });

    const messages = errorSpy.mock.calls.flat().join(' ');
    expect(messages).not.toMatch(/#310|more hooks than during the previous render/i);
  });

  it('does not throw #310 on the loading -> error transition', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('nope', { status: 500 })));

    const { getByText } = render(<StatsPage {...({} as any)} />);

    await waitFor(() => {
      expect(getByText(/^Error:/)).toBeTruthy();
    });

    const messages = errorSpy.mock.calls.flat().join(' ');
    expect(messages).not.toMatch(/#310|more hooks than during the previous render/i);
  });

  it('survives repeated remounts (StrictMode-style double render)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockImplementation(() => jsonResponse(SUCCESS_PAYLOAD)));

    for (let i = 0; i < 3; i++) {
      const { unmount } = render(<StatsPage {...({} as any)} />);
      unmount();
    }

    const messages = errorSpy.mock.calls.flat().join(' ');
    expect(messages).not.toMatch(/#310|more hooks than during the previous render/i);
  });

  it('requests the worker stats endpoint', async () => {
    const fetchMock = vi.fn().mockImplementation(() => jsonResponse(SUCCESS_PAYLOAD));
    vi.stubGlobal('fetch', fetchMock);

    render(<StatsPage {...({} as any)} />);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(`${WORKER_URL}/stats`);
    });
  });
});