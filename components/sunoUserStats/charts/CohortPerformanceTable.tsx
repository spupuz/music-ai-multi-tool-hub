
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
              <th scope="col" className="px-3 py-2 text-left font-medium text-green-300 tracking-wider">Cohort</th>
              <th scope="col" className="px-3 py-2 text-right font-medium text-green-300 tracking-wider">Songs</th>
              <th scope="col" className="px-3 py-2 text-right font-medium text-green-300 tracking-wider">Avg Plays</th>
              <th scope="col" className="px-3 py-2 text-right font-medium text-green-300 tracking-wider">Avg Upvotes</th>
              <th scope="col" className="px-3 py-2 text-right font-medium text-green-300 tracking-wider">Avg Comments</th>
              <th scope="col" className="px-3 py-2 text-right font-medium text-green-300 tracking-wider" title="For songs with >20 plays in cohort">Avg Upvote %</th>
              <th scope="col" className="px-3 py-2 text-right font-medium text-green-300 tracking-wider" title="For songs with >20 plays in cohort">Avg Comment %</th>
            </tr>
          </thead>
          <tbody className="bg-gray-800 divide-y divide-gray-600">
            {cohortData.map((cohort) => (
              <tr key={cohort.cohortName}>
                <td className="px-3 py-2 whitespace-nowrap text-gray-200">{cohort.cohortName}</td>
                <td className="px-3 py-2 whitespace-nowrap text-gray-200 text-right">{cohort.songCount.toLocaleString()}</td>
                <td className="px-3 py-2 whitespace-nowrap text-gray-200 text-right">{formatNumberDisplay(cohort.avgPlays)}</td>
                <td className="px-3 py-2 whitespace-nowrap text-gray-200 text-right">{formatNumberDisplay(cohort.avgUpvotes)}</td>
                <td className="px-3 py-2 whitespace-nowrap text-gray-200 text-right">{formatNumberDisplay(cohort.avgComments)}</td>
                <td className="px-3 py-2 whitespace-nowrap text-gray-200 text-right">{formatPercentageDisplay(cohort.avgUpvoteRate)}</td>
                <td className="px-3 py-2 whitespace-nowrap text-gray-200 text-right">{formatPercentageDisplay(cohort.avgCommentRate)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ChartContainer>
  );
};

export default CohortPerformanceTable;
