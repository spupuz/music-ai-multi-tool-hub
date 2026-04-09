
import React, { useState, useMemo } from 'react';
import type { TagPairPerformanceData } from '@/types/sunoUserStatsTypes';
import ChartContainer from './ChartContainer';

interface TagPairPerformanceTableProps {
  tagPairData: TagPairPerformanceData[];
  topN?: number;
}

type SortableTagPairColumn = 'tagPair' | 'songCount' | 'avgPlays' | 'avgUpvotes' | 'avgComments';
type SortDirection = 'asc' | 'desc';

const TagPairPerformanceTable: React.FC<TagPairPerformanceTableProps> = ({ tagPairData, topN = 10 }) => {
  const [sortColumn, setSortColumn] = useState<SortableTagPairColumn>('songCount');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const sortedAndFilteredData = useMemo(() => {
    return [...tagPairData]
      .sort((a, b) => {
        let aVal = a[sortColumn];
        let bVal = b[sortColumn];

        if (typeof aVal === 'string' && typeof bVal === 'string') {
          return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        }
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
        }
        return 0;
      })
      .slice(0, topN);
  }, [tagPairData, sortColumn, sortDirection, topN]);

  const handleSort = (column: SortableTagPairColumn) => {
    if (sortColumn === column) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('desc');
    }
  };

  const SortArrow: React.FC<{ column: SortableTagPairColumn }> = ({ column }) => {
    if (sortColumn !== column) return <span className="opacity-30">↕️</span>;
    return sortDirection === 'asc' ? <span aria-label="sorted ascending">🔼</span> : <span aria-label="sorted descending">🔽</span>;
  };
  
  const thClasses = "px-0.5 sm:px-3 py-1 sm:py-2 text-left text-[9px] sm:text-xs font-medium text-emerald-300 uppercase tracking-tighter sm:tracking-wider cursor-pointer select-none hover:bg-gray-700 transition-colors";

  if (!tagPairData || tagPairData.length === 0) {
    return <p className="text-gray-400 text-center py-4">No tag pair performance data available (min. 3 songs per pair required).</p>;
  }

  return (
    <div className="glass-card p-6 border-white/5 bg-white/5 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl pointer-events-none"></div>
      
      <div className="mb-6 flex items-center gap-3">
        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/80">Tag Correlation Analysis (Top {topN})</h3>
      </div>

      <div className="overflow-x-auto custom-scrollbar rounded-2xl border border-white/5 bg-white/2">
        <table className="min-w-full divide-y divide-white/5 border-collapse">
          <thead className="bg-[#0a0a0a]/80 backdrop-blur-md">
            <tr>
              <th scope="col" className={thClasses} onClick={() => handleSort('tagPair')} aria-sort={sortColumn === 'tagPair' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}>
                <div className="flex items-center gap-2 group/header px-6">
                  <span className={sortColumn === 'tagPair' ? 'text-blue-500' : 'group-hover/header:text-gray-300'}>Neural Pair</span>
                  <SortArrow column="tagPair" />
                </div>
              </th>
              <th scope="col" className={`${thClasses} text-right`} onClick={() => handleSort('songCount')} aria-sort={sortColumn === 'songCount' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}>
                <div className="flex items-center justify-end gap-2 group/header px-4">
                  <span className={sortColumn === 'songCount' ? 'text-blue-500' : 'group-hover/header:text-gray-300'}>Nodes</span>
                  <SortArrow column="songCount" />
                </div>
              </th>
              <th scope="col" className={`${thClasses} text-right`} onClick={() => handleSort('avgPlays')} aria-sort={sortColumn === 'avgPlays' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}>
                <div className="flex items-center justify-end gap-2 group/header px-4">
                  <span className={sortColumn === 'avgPlays' ? 'text-blue-500' : 'group-hover/header:text-gray-300'}>Flux</span>
                  <SortArrow column="avgPlays" />
                </div>
              </th>
              <th scope="col" className={`${thClasses} text-right`} onClick={() => handleSort('avgUpvotes')} aria-sort={sortColumn === 'avgUpvotes' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}>
                <div className="flex items-center justify-end gap-2 group/header px-4">
                  <span className={sortColumn === 'avgUpvotes' ? 'text-blue-500' : 'group-hover/header:text-gray-300'}>Affinity</span>
                  <SortArrow column="avgUpvotes" />
                </div>
              </th>
              <th scope="col" className={`${thClasses} text-right`} onClick={() => handleSort('avgComments')} aria-sort={sortColumn === 'avgComments' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}>
                <div className="flex items-center justify-end gap-2 group/header px-6">
                  <span className={sortColumn === 'avgComments' ? 'text-blue-500' : 'group-hover/header:text-gray-300'}>Echoes</span>
                  <SortArrow column="avgComments" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {sortedAndFilteredData.map((item) => (
              <tr key={item.tagPair} className="group hover:bg-white/5 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-[10px] font-black text-white/90 uppercase tracking-widest truncate max-w-[150px]" title={item.tagPair}>{item.tagPair}</td>
                <td className="px-4 py-4 whitespace-nowrap text-right text-[10px] font-black text-gray-400 tracking-widest">{item.songCount.toLocaleString()}</td>
                <td className="px-4 py-4 whitespace-nowrap text-right text-[10px] font-black text-gray-300 tracking-widest">{item.avgPlays.toFixed(1)}</td>
                <td className="px-4 py-4 whitespace-nowrap text-right text-[10px] font-black text-gray-300 tracking-widest">{item.avgUpvotes.toFixed(1)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-[10px] font-black text-gray-300 tracking-widest">{item.avgComments.toFixed(1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TagPairPerformanceTable;
