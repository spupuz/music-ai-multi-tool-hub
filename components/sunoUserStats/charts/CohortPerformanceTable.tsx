
import React from 'react';
import type { CohortPerformanceData } from '../../../types/sunoUserStatsTypes';
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
    <ChartContainer title="Song Performance by Creation Cohort" heightClassName="h-auto">
      <div className="overflow-x-auto text-xs">
        <table className="min-w-full divide-y divide-gray-600">
          <thead className="bg-gray-750">
            <tr>
              <th scope="col" className="px-1 sm:px-3 py-1 sm:py-2 text-left text-[9px] sm:text-xs font-medium text-green-300 tracking-tighter sm:tracking-wider">Cohort</th>
              <th scope="col" className="px-1 sm:px-3 py-1 sm:py-2 text-right text-[9px] sm:text-xs font-medium text-green-300 tracking-tighter sm:tracking-wider">
                <span className="sm:hidden">Qty</span>
                <span className="hidden sm:inline">Songs</span>
              </th>
              <th scope="col" className="px-1 sm:px-3 py-1 sm:py-2 text-right text-[9px] sm:text-xs font-medium text-green-300 tracking-tighter sm:tracking-wider">
                <span className="sm:hidden">Plays</span>
                <span className="hidden sm:inline">Avg Plays</span>
              </th>
              <th scope="col" className="px-1 sm:px-3 py-1 sm:py-2 text-right text-[9px] sm:text-xs font-medium text-green-300 tracking-tighter sm:tracking-wider">
                <span className="sm:hidden">Upvt</span>
                <span className="hidden sm:inline">Avg Upvotes</span>
              </th>
              <th scope="col" className="px-1 sm:px-3 py-1 sm:py-2 text-right text-[9px] sm:text-xs font-medium text-green-300 tracking-tighter sm:tracking-wider">
                <span className="sm:hidden">Cmnt</span>
                <span className="hidden sm:inline">Avg Comments</span>
              </th>
              <th scope="col" className="px-1 sm:px-3 py-1 sm:py-2 text-right text-[9px] sm:text-xs font-medium text-green-300 tracking-tighter sm:tracking-wider" title="For songs with >20 plays in cohort">
                <span className="sm:hidden">U%</span>
                <span className="hidden sm:inline">Avg Upvote %</span>
              </th>
              <th scope="col" className="px-1 sm:px-3 py-1 sm:py-2 text-right text-[9px] sm:text-xs font-medium text-green-300 tracking-tighter sm:tracking-wider" title="For songs with >20 plays in cohort">
                <span className="sm:hidden">C%</span>
                <span className="hidden sm:inline">Avg Comment %</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-gray-800 divide-y divide-gray-600">
            {cohortData.map((cohort) => (
              <tr key={cohort.cohortName}>
                <td className="px-1 sm:px-3 py-1 sm:py-2 whitespace-nowrap text-gray-200 text-[10px] sm:text-xs">{cohort.cohortName}</td>
                <td className="px-1 sm:px-3 py-1 sm:py-2 whitespace-nowrap text-gray-200 text-right text-[10px] sm:text-xs">{cohort.songCount.toLocaleString()}</td>
                <td className="px-1 sm:px-3 py-1 sm:py-2 whitespace-nowrap text-gray-200 text-right text-[10px] sm:text-xs">
                  <span className="sm:hidden">{Math.round(cohort.avgPlays || 0)}</span>
                  <span className="hidden sm:inline">{formatNumberDisplay(cohort.avgPlays)}</span>
                </td>
                <td className="px-1 sm:px-3 py-1 sm:py-2 whitespace-nowrap text-gray-200 text-right text-[10px] sm:text-xs">
                  <span className="sm:hidden">{Math.round(cohort.avgUpvotes || 0)}</span>
                  <span className="hidden sm:inline">{formatNumberDisplay(cohort.avgUpvotes)}</span>
                </td>
                <td className="px-1 sm:px-3 py-1 sm:py-2 whitespace-nowrap text-gray-200 text-right text-[10px] sm:text-xs">{formatNumberDisplay(cohort.avgComments)}</td>
                <td className="px-1 sm:px-3 py-1 sm:py-2 whitespace-nowrap text-gray-200 text-right text-[10px] sm:text-xs">{formatPercentageDisplay(cohort.avgUpvoteRate)}</td>
                <td className="px-1 sm:px-3 py-1 sm:py-2 whitespace-nowrap text-gray-200 text-right text-[10px] sm:text-xs">{formatPercentageDisplay(cohort.avgCommentRate)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ChartContainer>
  );
};

export default CohortPerformanceTable;
