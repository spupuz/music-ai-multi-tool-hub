import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';

import type { SongTrendData, SongEngagementData } from '@/types/sunoUserStatsTypes';
import type { SunoClip } from '@/types';

// Regression guard for the PR #129 refactor that replaced `.map()` calls with
// single-pass `for` loops over pre-allocated arrays when building the parallel
// `labels` / `data` arrays Chart.js consumes.
//
// A hand-written index loop is only equivalent to `.map()` if every index is
// written and the length is preserved. An off-by-one, a missing `values[i] =`
// line, or a swapped label/value would silently render wrong charts instead of
// throwing, so these tests assert the extracted arrays exactly match what
// `.map()` produces -- including the empty-input case (where a loop that still
// runs, or one that pre-sizes to the wrong length, breaks).

interface CapturedChart {
  type: string;
  data: { labels: unknown[]; datasets: Array<{ data: unknown[] }> };
  options: any;
}

const captured: CapturedChart[] = [];

vi.mock('chart.js', () => {
  class Chart {
    type: string;
    data: any;
    options: any;
    constructor(_ctx: unknown, config: any) {
      this.type = config.type;
      this.data = config.data;
      this.options = config.options;
      captured.push({ type: config.type, data: config.data, options: config.options });
    }
    update() {}
    destroy() {}
  }
  return { Chart };
});

vi.mock('@/components/sunoUserStats/charts/chartSetup', () => ({}));

import PlaylistCreationDateChart from '../PlaylistCreationDateChart';
import SongTrendChart from '../SongTrendChart';
import TopCommentedSongsChart from '../TopCommentedSongsChart';
import TopEngagingSongsChart from '../TopEngagingSongsChart';

const makeClip = (over: Partial<SunoClip> = {}): SunoClip => ({
  id: 'clip-1',
  title: 'Song One',
  comment_count: 1,
  ...over,
} as SunoClip);

let getContextSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  captured.length = 0;
  // jsdom has no canvas backend, so getContext('2d') returns null and the
  // components bail out before constructing a Chart. Provide a stub context so
  // the real code path runs and the Chart config becomes observable.
  getContextSpy = vi
    .spyOn(HTMLCanvasElement.prototype, 'getContext')
    .mockReturnValue({} as unknown as CanvasRenderingContext2D);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('chart parallel-array extraction (PR #129 single-pass loops)', () => {
  describe('PlaylistCreationDateChart', () => {
    it('extracts labels and counts in the same order as .map()', async () => {
      const data = [
        { month: '2026-01', count: 5 },
        { month: '2026-02', count: 12 },
        { month: '2026-03', count: 0 },
      ];

      render(<PlaylistCreationDateChart data={data} />);

      await waitFor(() => expect(captured).toHaveLength(1));
      // Guards against a vacuous pass: if getContext were never reached, the
      // assertions below would be testing an empty array.
      expect(getContextSpy).toHaveBeenCalled();
      expect(captured[0].data.labels).toEqual(data.map(d => d.month));
      expect(captured[0].data.datasets[0].data).toEqual(data.map(d => d.count));
    });

    it('preserves zero counts instead of dropping them', async () => {
      const data = [
        { month: '2026-01', count: 0 },
        { month: '2026-02', count: 7 },
      ];

      render(<PlaylistCreationDateChart data={data} />);

      await waitFor(() => expect(captured).toHaveLength(1));
      expect(captured[0].data.datasets[0].data).toHaveLength(2);
      expect(captured[0].data.datasets[0].data).toEqual([0, 7]);
    });

    it('renders the empty-state message and builds no chart for empty input', () => {
      const { getByText } = render(<PlaylistCreationDateChart data={[]} />);

      expect(getByText(/No creation date data available/i)).toBeTruthy();
      expect(captured).toHaveLength(0);
      expect(getContextSpy).not.toHaveBeenCalled();
    });
  });

  describe('SongTrendChart', () => {
    it('extracts song titles and increases in the same order as .map()', async () => {
      const data: SongTrendData[] = [
        { song: makeClip({ id: 'a', title: 'Low' }), increase: 3 },
        { song: makeClip({ id: 'b', title: 'High' }), increase: 41 },
        { song: makeClip({ id: 'c', title: 'Mid' }), increase: 17 },
      ];

      render(<SongTrendChart data={data} valueLabel="Increase" />);

      await waitFor(() => expect(captured).toHaveLength(1));
      // The component filters, sorts by `increase` desc, then slices to topN
      // before extracting -- the loop must mirror that same processed order.
      const expected = [...data].sort((a, b) => b.increase - a.increase);
      expect(captured[0].data.labels).toEqual(expected.map(d => d.song.title));
      expect(captured[0].data.datasets[0].data).toEqual(expected.map(d => d.increase));
    });

    it('computes suggestedMax from the same max as the .map() version', async () => {
      const data: SongTrendData[] = [
        { song: makeClip({ id: 'a', title: 'A' }), increase: 40 },
        { song: makeClip({ id: 'b', title: 'B' }), increase: 100 },
        { song: makeClip({ id: 'c', title: 'C' }), increase: 0 },
      ];

      render(<SongTrendChart data={data} valueLabel="Increase" />);

      await waitFor(() => expect(captured).toHaveLength(1));

      const maxIncrease = data.map(d => d.increase).reduce((m, v) => (v > m ? v : m), 0);
      expect(captured[0].options.scales.y.suggestedMax).toBe(
        maxIncrease + Math.ceil(maxIncrease * 0.05),
      );
      expect(captured[0].options.scales.y.suggestedMax).toBe(105);
    });

    it('filters invalid rows before extracting, keeping labels and data aligned', async () => {
      const data = [
        { song: makeClip({ id: 'a', title: 'Valid A' }), increase: 5 },
        null,
        { song: makeClip({ id: 'b', title: 'Valid B' }), increase: 9 },
      ] as unknown as SongTrendData[];

      render(<SongTrendChart data={data} valueLabel="Increase" />);

      await waitFor(() => expect(captured).toHaveLength(1));
      // Sorted by increase desc: B then A.
      expect(captured[0].data.labels).toEqual(['Valid B', 'Valid A']);
      expect(captured[0].data.datasets[0].data).toEqual([9, 5]);
    });
  });

  describe('TopCommentedSongsChart', () => {
    it('drops zero-comment rows so labels and counts stay aligned', async () => {
      const songs = [
        makeClip({ id: 'a', title: 'With comments', comment_count: 12 }),
        // Zero-count rows are filtered out upstream, so they must not reach
        // the extraction loop and shift labels out of step with counts.
        makeClip({ id: 'b', title: 'Zero comments', comment_count: 0 }),
      ];

      render(<TopCommentedSongsChart songs={songs} />);

      await waitFor(() => expect(captured).toHaveLength(1));
      expect(captured[0].data.datasets[0].data).toEqual(
        songs.filter(s => (s.comment_count || 0) > 0).map(s => s.comment_count || 0),
      );
      expect(captured[0].data.labels).toEqual(['With comments']);
      expect(captured[0].data.datasets[0].data).toEqual([12]);
    });

    it('extracts titles and counts in the same order as .map()', async () => {
      const songs = [
        makeClip({ id: 'a', title: 'Alpha', comment_count: 4 }),
        makeClip({ id: 'b', title: 'Beta', comment_count: 30 }),
        makeClip({ id: 'c', title: 'Gamma', comment_count: 15 }),
      ];

      render(<TopCommentedSongsChart songs={songs} />);

      await waitFor(() => expect(captured).toHaveLength(1));
      const expected = [...songs].sort((a, b) => b.comment_count - a.comment_count);
      expect(captured[0].data.labels).toEqual(expected.map(s => s.title));
      expect(captured[0].data.datasets[0].data).toEqual(expected.map(s => s.comment_count));
    });
  });

  describe('TopEngagingSongsChart', () => {
    it('extracts titles and upvote rates in the same order as .map()', async () => {
      const data: SongEngagementData[] = [
        { song: makeClip({ id: 'a', title: 'Engaged A' }), upvoteRate: 88 },
        { song: makeClip({ id: 'b', title: 'Engaged B' }), upvoteRate: 12 },
      ];

      render(<TopEngagingSongsChart data={data} />);

      await waitFor(() => expect(captured).toHaveLength(1));
      const expected = [...data].sort((a, b) => b.upvoteRate - a.upvoteRate);
      expect(captured[0].data.labels).toEqual(expected.map(d => d.song.title));
      expect(captured[0].data.datasets[0].data).toEqual(expected.map(d => d.upvoteRate));
    });

    it('drops rows whose upvoteRate is not a number before extracting', async () => {
      const data = [
        { song: makeClip({ id: 'a', title: 'Numeric' }), upvoteRate: 55 },
        { song: makeClip({ id: 'b', title: 'Not a number' }), upvoteRate: 'nope' },
      ] as unknown as SongEngagementData[];

      render(<TopEngagingSongsChart data={data} />);

      await waitFor(() => expect(captured).toHaveLength(1));
      expect(captured[0].data.labels).toEqual(['Numeric']);
      expect(captured[0].data.datasets[0].data).toEqual([55]);
    });
  });
});