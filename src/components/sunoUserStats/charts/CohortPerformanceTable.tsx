
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
    <div className="glass-card p-6 border-white/5 bg-white/5 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 blur-3xl pointer-events-none"></div>
      
      <div className="mb-6 flex items-center gap-3">
        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/80">Temporal Cohort Analysis</h3>
      </div>

      <div className="overflow-x-auto custom-scrollbar rounded-2xl border border-white/5 bg-white/2">
        <table className="min-w-full divide-y divide-white/5 border-collapse">
          <thead className="bg-[#0a0a0a]/80 backdrop-blur-md">
            <tr>
              <th scope="col" className="px-6 py-4 text-left text-[8px] font-black text-gray-500 uppercase tracking-[0.3em]">Temporal Node</th>
              <th scope="col" className="px-4 py-4 text-right text-[8px] font-black text-gray-500 uppercase tracking-[0.2em]">Signal Count</th>
              <th scope="col" className="px-4 py-4 text-right text-[8px] font-black text-gray-500 uppercase tracking-[0.2em]">Avg Flux</th>
              <th scope="col" className="px-4 py-4 text-right text-[8px] font-black text-gray-500 uppercase tracking-[0.2em]">Avg Affinity</th>
              <th scope="col" className="px-4 py-4 text-right text-[8px] font-black text-gray-500 uppercase tracking-[0.2em]">Avg Echoes</th>
              <th scope="col" className="px-4 py-4 text-right text-[8px] font-black text-green-500/60 uppercase tracking-[0.2em]" title="For songs with >20 plays in cohort">Affinity%</th>
              <th scope="col" className="px-6 py-4 text-right text-[8px] font-black text-green-500/60 uppercase tracking-[0.2em]" title="For songs with >20 plays in cohort">Echo%</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {cohortData.map((cohort) => (
              <tr key={cohort.cohortName} className="group hover:bg-white/5 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-[10px] font-black text-white/90 uppercase tracking-widest">{cohort.cohortName}</td>
                <td className="px-4 py-4 whitespace-nowrap text-right text-[10px] font-black text-gray-400 tracking-widest">{cohort.songCount.toLocaleString()}</td>
                <td className="px-4 py-4 whitespace-nowrap text-right text-[10px] font-black text-gray-300 tracking-widest">{formatNumberDisplay(cohort.avgPlays)}</td>
                <td className="px-4 py-4 whitespace-nowrap text-right text-[10px] font-black text-gray-300 tracking-widest">{formatNumberDisplay(cohort.avgUpvotes)}</td>
                <td className="px-4 py-4 whitespace-nowrap text-right text-[10px] font-black text-gray-300 tracking-widest">{formatNumberDisplay(cohort.avgComments)}</td>
                <td className="px-4 py-4 whitespace-nowrap text-right text-[10px] font-black text-green-500/80 tracking-widest">{formatPercentageDisplay(cohort.avgUpvoteRate)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-[10px] font-black text-green-500/60 tracking-widest">{formatPercentageDisplay(cohort.avgCommentRate)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CohortPerformanceTable;
