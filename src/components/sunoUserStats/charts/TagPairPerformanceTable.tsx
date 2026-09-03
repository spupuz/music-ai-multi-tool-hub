
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
    const isAsc = sortColumn === column && sortDirection === 'asc';
    const isDesc = sortColumn === column && sortDirection === 'desc';
    return (
      <span className="inline-flex flex-col shrink-0">
        <svg className={`w-2 h-2 ${isAsc ? 'text-blue-500' : 'opacity-40'}`} viewBox="0 0 8 8" fill="currentColor"><path d="M4 1 L7 6 H1 Z" /></svg>
        <svg className={`w-2 h-2 ${isDesc ? 'text-blue-500' : 'opacity-40'}`} viewBox="0 0 8 8" fill="currentColor"><path d="M4 7 L7 2 H1 Z" /></svg>
      </span>
    );
  };
  
  const thClasses = "px-2 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-white/10 transition-colors whitespace-nowrap";

  if (!tagPairData || tagPairData.length === 0) {
    return <p className="text-gray-400 text-center py-4">No tag pair performance data available (min. 3 songs per pair required).</p>;
  }

  return (
    <div className="glass-card p-6 border-gray-200 dark:border-white/5 bg-white dark:bg-white/5 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl pointer-events-none"></div>
      
      <div className="mb-6 flex items-center gap-3">
        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
        <h3 className="text-sm font-bold text-gray-900 dark:text-white">Tag Correlation Analysis (Top {topN})</h3>
      </div>

      <div className="overflow-x-auto custom-scrollbar rounded-2xl border border-gray-200 dark:border-white/5 bg-white dark:bg-transparent">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-white/5 border-collapse">
          <thead className="bg-gray-50 dark:bg-white/5">
            <tr>
              <th scope="col" className={thClasses} onClick={() => handleSort('tagPair')} aria-sort={sortColumn === 'tagPair' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}>
                <div className="flex items-center gap-2 group/header">
                  <span className={sortColumn === 'tagPair' ? 'text-blue-500' : 'group-hover/header:text-gray-700 dark:group-hover/header:text-gray-200'}>Tag Pair</span>
                  <SortArrow column="tagPair" />
                </div>
              </th>
              <th scope="col" className={`${thClasses} text-right`} onClick={() => handleSort('songCount')} aria-sort={sortColumn === 'songCount' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}>
                <div className="flex items-center justify-end gap-2 group/header">
                  <span className={sortColumn === 'songCount' ? 'text-blue-500' : 'group-hover/header:text-gray-700 dark:group-hover/header:text-gray-200'}>Nodes</span>
                  <SortArrow column="songCount" />
                </div>
              </th>
              <th scope="col" className={`${thClasses} text-right`} onClick={() => handleSort('avgPlays')} aria-sort={sortColumn === 'avgPlays' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}>
                <div className="flex items-center justify-end gap-2 group/header">
                  <span className={sortColumn === 'avgPlays' ? 'text-blue-500' : 'group-hover/header:text-gray-700 dark:group-hover/header:text-gray-200'}>Plays</span>
                  <SortArrow column="avgPlays" />
                </div>
              </th>
              <th scope="col" className={`${thClasses} text-right`} onClick={() => handleSort('avgUpvotes')} aria-sort={sortColumn === 'avgUpvotes' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}>
                <div className="flex items-center justify-end gap-2 group/header">
                  <span className={sortColumn === 'avgUpvotes' ? 'text-blue-500' : 'group-hover/header:text-gray-700 dark:group-hover/header:text-gray-200'}>Upvotes</span>
                  <SortArrow column="avgUpvotes" />
                </div>
              </th>
              <th scope="col" className={`${thClasses} text-right`} onClick={() => handleSort('avgComments')} aria-sort={sortColumn === 'avgComments' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}>
                <div className="flex items-center justify-end gap-2 group/header">
                  <span className={sortColumn === 'avgComments' ? 'text-blue-500' : 'group-hover/header:text-gray-700 dark:group-hover/header:text-gray-200'}>Comments</span>
                  <SortArrow column="avgComments" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-white/5">
            {sortedAndFilteredData.map((item) => (
              <tr key={item.tagPair} className="group hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white truncate max-w-[150px]" title={item.tagPair}>{item.tagPair}</td>
                <td className="px-4 py-3 whitespace-nowrap text-right text-sm text-gray-700 dark:text-gray-300 tabular-nums">{item.songCount.toLocaleString()}</td>
                <td className="px-4 py-3 whitespace-nowrap text-right text-sm text-gray-700 dark:text-gray-300 tabular-nums">{item.avgPlays.toFixed(1)}</td>
                <td className="px-4 py-3 whitespace-nowrap text-right text-sm text-gray-700 dark:text-gray-300 tabular-nums">{item.avgUpvotes.toFixed(1)}</td>
                <td className="px-4 py-3 whitespace-nowrap text-right text-sm text-gray-700 dark:text-gray-300 tabular-nums">{item.avgComments.toFixed(1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ⚡ Bolt: Wrapped in React.memo to prevent unnecessary re-renders and re-sorts
// when the parent StatChartsArea updates its state (e.g. selectedPeriod)
// but this component's props remain unchanged.
export default React.memo(TagPairPerformanceTable);
