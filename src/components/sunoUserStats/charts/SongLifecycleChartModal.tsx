
import React, { useEffect, useRef } from 'react';
import { Chart } from 'chart.js/auto';
import 'chartjs-adapter-date-fns';
import type { SunoClip } from '@/types';
import type { SongInteractionPoint } from '@/types/sunoUserStatsTypes';
import { getBaseChartOptions } from '@/utils/chartUtils';

interface SongLifecycleChartModalProps {
  song: SunoClip;
  history: SongInteractionPoint[];
  onClose: () => void;
}

const SongLifecycleChartModal: React.FC<SongLifecycleChartModalProps> = ({ song, history, onClose }) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (chartRef.current && history.length > 0) {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
      const ctx = chartRef.current.getContext('2d');
      if (ctx) {
        const baseOptions = getBaseChartOptions('#e5e7eb', '#374151');
        chartInstanceRef.current = new Chart(ctx, {
          type: 'line',
          data: {
            labels: history.map(p => new Date(p.timestamp)),
            datasets: [
              {
                label: 'Plays',
                data: history.map(p => p.plays),
                borderColor: '#4CAF50',
                backgroundColor: 'rgba(76, 175, 80, 0.2)',
                tension: 0.1,
                fill: false,
                yAxisID: 'yPlays',
              },
              {
                label: 'Upvotes',
                data: history.map(p => p.upvotes),
                borderColor: '#2196F3',
                backgroundColor: 'rgba(33, 150, 243, 0.2)',
                tension: 0.1,
                fill: false,
                yAxisID: 'yUpvotesComments',
              },
              {
                label: 'Comments',
                data: history.map(p => p.comment_count),
                borderColor: '#FFC107',
                backgroundColor: 'rgba(255, 193, 7, 0.2)',
                tension: 0.1,
                fill: false,
                yAxisID: 'yUpvotesComments',
              },
            ],
          },
          options: {
            ...baseOptions,
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            plugins: {
              ...baseOptions.plugins,
              legend: { ...baseOptions.plugins?.legend, display: true, position: 'top' },
              title: { display: true, text: `Lifecycle: ${song.title}`, color: '#e5e7eb', font: {size: 16} },
            },
            scales: {
              ...baseOptions.scales,
              x: {
                ...(baseOptions.scales?.x as object),
                type: 'time',
                time: { unit: 'day', tooltipFormat: 'MMM dd, yyyy HH:mm', displayFormats: {day: 'MMM dd'} },
                title: { display: true, text: 'Date of Snapshot', color: '#e5e7eb' },
              },
              yPlays: {
                ...(baseOptions.scales?.y as object),
                type: 'linear',
                display: true,
                position: 'left',
                title: { display: true, text: 'Total Plays', color: '#4CAF50' },
                grid: { drawOnChartArea: true, color: '#2a3b4d' }, // Main grid for plays
                ticks: { color: '#4CAF50' }
              },
              yUpvotesComments: {
                ...(baseOptions.scales?.y as object),
                type: 'linear',
                display: true,
                position: 'right',
                title: { display: true, text: 'Upvotes / Comments', color: '#FFC107' },
                grid: { drawOnChartArea: false }, // No grid for this axis to avoid clutter
                ticks: { color: '#FFC107'}
              },
            },
          } as any,
        });
      }
    }
    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [history, song.title]);

  const daysSinceCreation = Math.max(0, Math.floor((new Date().getTime() - new Date(song.created_at).getTime()) / (1000 * 60 * 60 * 24)));
  const firstPoint = history[0];
  const lastPoint = history[history.length - 1];
  
  let avgDailyPlays: number | null = null;
  let avgDailyUpvotes: number | null = null;
  let avgDailyComments: number | null = null;
  let peakPlaysIncrease: number | null = null;
  let peakUpvotesIncrease: number | null = null;
  let peakCommentsIncrease: number | null = null;

  if (history.length > 0 && daysSinceCreation > 0) {
    avgDailyPlays = (lastPoint.plays - (firstPoint?.plays || 0)) / daysSinceCreation;
    avgDailyUpvotes = (lastPoint.upvotes - (firstPoint?.upvotes || 0)) / daysSinceCreation;
    avgDailyComments = (lastPoint.comment_count - (firstPoint?.comment_count || 0)) / daysSinceCreation;
  } else if (history.length > 0 && daysSinceCreation === 0) { // Song created today
    avgDailyPlays = lastPoint.plays;
    avgDailyUpvotes = lastPoint.upvotes;
    avgDailyComments = lastPoint.comment_count;
  }

  if (history.length >= 2) {
    for (let i = 1; i < history.length; i++) {
      const playsDelta = history[i].plays - history[i-1].plays;
      const upvotesDelta = history[i].upvotes - history[i-1].upvotes;
      const commentsDelta = history[i].comment_count - history[i-1].comment_count;
      if (peakPlaysIncrease === null || playsDelta > peakPlaysIncrease) peakPlaysIncrease = playsDelta;
      if (peakUpvotesIncrease === null || upvotesDelta > peakUpvotesIncrease) peakUpvotesIncrease = upvotesDelta;
      if (peakCommentsIncrease === null || commentsDelta > peakCommentsIncrease) peakCommentsIncrease = commentsDelta;
    }
  }


  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="lifecycle-modal-title">
      <div className="bg-gray-850 p-4 sm:p-6 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col border border-green-500" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-3">
          <h2 id="lifecycle-modal-title" className="text-xl font-semibold text-green-300">Song Lifecycle Analysis</h2>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-gray-700 text-gray-400 hover:text-white" aria-label="Close modal">&times;</button>
        </div>
        <div className="flex-shrink-0 mb-3">
          <p className="text-sm text-gray-400">Song: <strong className="text-green-200">{song.title}</strong> by @{song.handle}</p>
          <p className="text-xs text-gray-500">Created: {new Date(song.created_at).toLocaleDateString()} ({daysSinceCreation} days ago)</p>
        </div>
        <div className="flex-grow h-64 sm:h-80 md:h-96 mb-3">
          {history.length > 1 ? (
            <canvas ref={chartRef} aria-label="Song lifecycle chart"></canvas>
          ) : (
            <p className="text-center text-gray-500 h-full flex items-center justify-center">Not enough data points (need at least 2 snapshots) to display lifecycle trend.</p>
          )}
        </div>
        <div className="flex-shrink-0 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-gray-300">
          <div className="bg-gray-700 p-2 rounded"><strong className="text-green-200">Avg. Daily Plays:</strong> {avgDailyPlays !== null ? avgDailyPlays.toFixed(2) : 'N/A'}</div>
          <div className="bg-gray-700 p-2 rounded"><strong className="text-green-200">Avg. Daily Upvotes:</strong> {avgDailyUpvotes !== null ? avgDailyUpvotes.toFixed(2) : 'N/A'}</div>
          <div className="bg-gray-700 p-2 rounded"><strong className="text-green-200">Avg. Daily Comments:</strong> {avgDailyComments !== null ? avgDailyComments.toFixed(2) : 'N/A'}</div>
          <div className="bg-gray-700 p-2 rounded"><strong className="text-green-200">Peak Plays Increase (period):</strong> {peakPlaysIncrease !== null ? peakPlaysIncrease.toLocaleString() : 'N/A'}</div>
          <div className="bg-gray-700 p-2 rounded"><strong className="text-green-200">Peak Upvotes Increase (period):</strong> {peakUpvotesIncrease !== null ? peakUpvotesIncrease.toLocaleString() : 'N/A'}</div>
          <div className="bg-gray-700 p-2 rounded"><strong className="text-green-200">Peak Comments Increase (period):</strong> {peakCommentsIncrease !== null ? peakCommentsIncrease.toLocaleString() : 'N/A'}</div>
        </div>
      </div>
    </div>
  );
};

export default SongLifecycleChartModal;
