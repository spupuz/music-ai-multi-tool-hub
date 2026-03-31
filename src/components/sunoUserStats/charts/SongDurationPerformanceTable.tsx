
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
    <div className="glass-card p-6 border-white/5 bg-white/5 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 blur-3xl pointer-events-none"></div>
      
      <div className="mb-6 flex items-center gap-3">
        <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse"></div>
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/80">Temporal Span Performance</h3>
      </div>

      <div className="overflow-x-auto custom-scrollbar rounded-2xl border border-white/5 bg-white/2">
        <table className="min-w-full divide-y divide-white/5 border-collapse">
          <thead className="bg-[#0a0a0a]/80 backdrop-blur-md">
            <tr>
              <th scope="col" className="px-6 py-4 text-left text-[8px] font-black text-gray-500 uppercase tracking-[0.3em]">Temporal Bucket</th>
              <th scope="col" className="px-4 py-4 text-right text-[8px] font-black text-gray-500 uppercase tracking-[0.2em]">Nodes</th>
              <th scope="col" className="px-4 py-4 text-right text-[8px] font-black text-gray-500 uppercase tracking-[0.2em]">Avg Flux</th>
              <th scope="col" className="px-4 py-4 text-right text-[8px] font-black text-gray-500 uppercase tracking-[0.2em]">Avg Affinity</th>
              <th scope="col" className="px-4 py-4 text-right text-[8px] font-black text-gray-500 uppercase tracking-[0.2em]">Avg Echoes</th>
              <th scope="col" className="px-6 py-4 text-right text-[8px] font-black text-green-500/60 uppercase tracking-[0.2em]" title="For songs with >20 plays in this bucket">Affinity%</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {durationPerformanceData.map((bucket) => (
              <tr key={bucket.bucketName} className="group hover:bg-white/5 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-[10px] font-black text-white/90 uppercase tracking-widest">{bucket.bucketName}</td>
                <td className="px-4 py-4 whitespace-nowrap text-right text-[10px] font-black text-gray-400 tracking-widest">{bucket.songCount.toLocaleString()}</td>
                <td className="px-4 py-4 whitespace-nowrap text-right text-[10px] font-black text-gray-300 tracking-widest">{formatNumberDisplay(bucket.avgPlays)}</td>
                <td className="px-4 py-4 whitespace-nowrap text-right text-[10px] font-black text-gray-300 tracking-widest">{formatNumberDisplay(bucket.avgUpvotes)}</td>
                <td className="px-4 py-4 whitespace-nowrap text-right text-[10px] font-black text-gray-300 tracking-widest">{formatNumberDisplay(bucket.avgComments)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-[10px] font-black text-green-500/80 tracking-widest">{formatPercentageDisplay(bucket.avgUpvoteRate)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SongDurationPerformanceTable;
