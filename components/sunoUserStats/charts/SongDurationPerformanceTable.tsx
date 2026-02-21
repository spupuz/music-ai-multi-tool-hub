
import React from 'react';
import type { SongDurationPerformanceData } from '../../../types/sunoUserStatsTypes';
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
    <ChartContainer title="Song Performance by Duration Bucket" heightClassName="h-auto">
      <div className="overflow-x-auto text-xs">
        <table className="min-w-full divide-y divide-gray-600">
          <thead className="bg-gray-750">
            <tr>
              <th scope="col" className="px-3 py-2 text-left font-medium text-green-300 tracking-wider">Duration Bucket</th>
              <th scope="col" className="px-3 py-2 text-right font-medium text-green-300 tracking-wider">Songs</th>
              <th scope="col" className="px-3 py-2 text-right font-medium text-green-300 tracking-wider">Avg Plays</th>
              <th scope="col" className="px-3 py-2 text-right font-medium text-green-300 tracking-wider">Avg Upvotes</th>
              <th scope="col" className="px-3 py-2 text-right font-medium text-green-300 tracking-wider">Avg Comments</th>
              <th scope="col" className="px-3 py-2 text-right font-medium text-green-300 tracking-wider" title="For songs with >20 plays in this bucket">Avg Upvote %</th>
            </tr>
          </thead>
          <tbody className="bg-gray-800 divide-y divide-gray-600">
            {durationPerformanceData.map((bucket) => (
              <tr key={bucket.bucketName}>
                <td className="px-3 py-2 whitespace-nowrap text-gray-200">{bucket.bucketName}</td>
                <td className="px-3 py-2 whitespace-nowrap text-gray-200 text-right">{bucket.songCount.toLocaleString()}</td>
                <td className="px-3 py-2 whitespace-nowrap text-gray-200 text-right">{formatNumberDisplay(bucket.avgPlays)}</td>
                <td className="px-3 py-2 whitespace-nowrap text-gray-200 text-right">{formatNumberDisplay(bucket.avgUpvotes)}</td>
                <td className="px-3 py-2 whitespace-nowrap text-gray-200 text-right">{formatNumberDisplay(bucket.avgComments)}</td>
                <td className="px-3 py-2 whitespace-nowrap text-gray-200 text-right">{formatPercentageDisplay(bucket.avgUpvoteRate)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ChartContainer>
  );
};

export default SongDurationPerformanceTable;
