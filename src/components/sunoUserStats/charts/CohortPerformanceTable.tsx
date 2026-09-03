
import React from 'react';
import type { CohortPerformanceData } from '@/types/sunoUserStatsTypes';
import ChartContainer from './ChartContainer';

interface CohortPerformanceTableProps {
  cohortData: CohortPerformanceData[];
}

const CohortPerformanceTable: React.FC<CohortPerformanceTableProps> = ({ cohortData }) => {
  if (!cohortData || cohortData.length === 0) {
    return <p className="text-gray-400 text-center py-4">No cohort performance data available.</p>;
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
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl pointer-events-none"></div>
      
      <div className="mb-6 flex items-center gap-3">
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
        <h3 className="text-sm font-bold text-gray-900 dark:text-white">Cohort Analysis</h3>
      </div>

      <div className="overflow-x-auto custom-scrollbar rounded-2xl border border-gray-200 dark:border-white/5 bg-white dark:bg-transparent">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-white/5 border-collapse">
          <thead className="bg-gray-50 dark:bg-white/5">
            <tr>
              <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">Period</th>
              <th scope="col" className="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400">Song Count</th>
              <th scope="col" className="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400">Avg Plays</th>
              <th scope="col" className="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400">Avg Upvotes</th>
              <th scope="col" className="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400">Avg Comments</th>
              <th scope="col" className="px-4 py-3 text-right text-xs font-semibold text-emerald-600 dark:text-emerald-400" title="For songs with >20 plays in cohort">Upvotes%</th>
              <th scope="col" className="px-4 py-3 text-right text-xs font-semibold text-emerald-600 dark:text-emerald-400" title="For songs with >20 plays in cohort">Comments%</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-white/5">
            {cohortData.map((cohort) => (
              <tr key={cohort.cohortName} className="group hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{cohort.cohortName}</td>
                <td className="px-4 py-3 whitespace-nowrap text-right text-sm text-gray-700 dark:text-gray-300 tabular-nums">{cohort.songCount.toLocaleString()}</td>
                <td className="px-4 py-3 whitespace-nowrap text-right text-sm text-gray-700 dark:text-gray-300 tabular-nums">{formatNumberDisplay(cohort.avgPlays)}</td>
                <td className="px-4 py-3 whitespace-nowrap text-right text-sm text-gray-700 dark:text-gray-300 tabular-nums">{formatNumberDisplay(cohort.avgUpvotes)}</td>
                <td className="px-4 py-3 whitespace-nowrap text-right text-sm text-gray-700 dark:text-gray-300 tabular-nums">{formatNumberDisplay(cohort.avgComments)}</td>
                <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">{formatPercentageDisplay(cohort.avgUpvoteRate)}</td>
                <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">{formatPercentageDisplay(cohort.avgCommentRate)}</td>
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
export default React.memo(CohortPerformanceTable);
