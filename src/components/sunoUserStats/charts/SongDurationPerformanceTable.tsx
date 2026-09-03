
import React from 'react';
import type { SongDurationPerformanceData } from '@/types/sunoUserStatsTypes';
import ChartContainer from './ChartContainer';

interface SongDurationPerformanceTableProps {
  durationPerformanceData: SongDurationPerformanceData[];
}

const SongDurationPerformanceTable: React.FC<SongDurationPerformanceTableProps> = ({ durationPerformanceData }) => {
  if (!durationPerformanceData || durationPerformanceData.length === 0) {
    return <p className="text-gray-400 text-center py-4">No song duration performance data available.</p>;
  }

  const formatNumberDisplay = (num: number | null, precision: number = 1): string => {
    if (num === null || typeof num === 'undefined' || isNaN(num)) return 'N/A';
    return num.toFixed(precision);
  };
  
  const formatPercentageDisplay = (num: number | null): string => {
    if (num === null || typeof num === 'undefined' || isNaN(num)) return 'N/A';
    return `${num.toFixed(1)}%`;
  };

  return (
    <div className="glass-card p-6 border-gray-200 dark:border-white/5 bg-white dark:bg-white/5 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 blur-3xl pointer-events-none"></div>
      
      <div className="mb-6 flex items-center gap-3">
        <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse"></div>
        <h3 className="text-sm font-bold text-gray-900 dark:text-white">Duration Performance</h3>
      </div>

      <div className="overflow-x-auto custom-scrollbar rounded-2xl border border-gray-200 dark:border-white/5 bg-white dark:bg-transparent">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-white/5 border-collapse">
          <thead className="bg-gray-50 dark:bg-white/5">
            <tr>
              <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">Duration Range</th>
              <th scope="col" className="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400">Songs</th>
              <th scope="col" className="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400">Avg Plays</th>
              <th scope="col" className="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400">Avg Upvotes</th>
              <th scope="col" className="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400">Avg Comments</th>
              <th scope="col" className="px-4 py-3 text-right text-xs font-semibold text-emerald-600 dark:text-emerald-400" title="For songs with >20 plays in this bucket">Upvotes%</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-white/5">
            {durationPerformanceData.map((bucket) => (
              <tr key={bucket.bucketName} className="group hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{bucket.bucketName}</td>
                <td className="px-4 py-3 whitespace-nowrap text-right text-sm text-gray-700 dark:text-gray-300 tabular-nums">{bucket.songCount.toLocaleString()}</td>
                <td className="px-4 py-3 whitespace-nowrap text-right text-sm text-gray-700 dark:text-gray-300 tabular-nums">{formatNumberDisplay(bucket.avgPlays)}</td>
                <td className="px-4 py-3 whitespace-nowrap text-right text-sm text-gray-700 dark:text-gray-300 tabular-nums">{formatNumberDisplay(bucket.avgUpvotes)}</td>
                <td className="px-4 py-3 whitespace-nowrap text-right text-sm text-gray-700 dark:text-gray-300 tabular-nums">{formatNumberDisplay(bucket.avgComments)}</td>
                <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">{formatPercentageDisplay(bucket.avgUpvoteRate)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ⚡ Bolt: Wrapped in React.memo to prevent unnecessary re-renders
// when the parent StatChartsArea updates its state (e.g. selectedPeriod)
// but this component's props remain unchanged.
export default React.memo(SongDurationPerformanceTable);
