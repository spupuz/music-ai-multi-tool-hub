import React, { useState, useMemo } from 'react';
import type { TagStat, GenreStat } from '@/types/sunoUserStatsTypes';
import ChartContainer from './ChartContainer';

interface PerformanceTableProps<T extends { name: string; count: number; avgPlays: number; avgUpvotes: number; avgComments: number; avgUpvoteRate?: number; avgCommentRate?: number; }> {
  title: string;
  data: T[];
  itemTypeLabel: string; // "Tag" or "Genre"
  topN?: number;
}

const PerformanceTable = <T extends { name: string; count: number; avgPlays: number; avgUpvotes: number; avgComments: number; avgUpvoteRate?: number; avgCommentRate?: number; }>({
  title,
  data,
  itemTypeLabel,
  topN = 10,
}: PerformanceTableProps<T>) => {
  
  type SortableColumn = 'name' | 'count' | 'avgPlays' | 'avgUpvotes' | 'avgComments' | 'avgUpvoteRate' | 'avgCommentRate';
  const [sortColumn, setSortColumn] = useState<SortableColumn>('avgPlays');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const sortedData = useMemo(() => {
    return [...data]
      .sort((a, b) => {
        let aVal = a[sortColumn];
        let bVal = b[sortColumn];

        if (typeof aVal === 'string' && typeof bVal === 'string') {
          return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        }
        
        // Handle potentially undefined or null numeric values by treating them as -Infinity for sorting
        const numA = (typeof aVal === 'number' && !isNaN(aVal)) ? aVal : (sortDirection === 'asc' ? Infinity : -Infinity);
        const numB = (typeof bVal === 'number' && !isNaN(bVal)) ? bVal : (sortDirection === 'asc' ? Infinity : -Infinity);

        return sortDirection === 'asc' ? numA - numB : numB - numA;
      })
      .slice(0, topN);
  }, [data, sortColumn, sortDirection, topN]);

  const handleSort = (column: SortableColumn) => {
    if (sortColumn === column) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('desc');
    }
  };

  const SortArrow: React.FC<{ column: SortableColumn }> = ({ column }) => {
    const isAsc = sortColumn === column && sortDirection === 'asc';
    const isDesc = sortColumn === column && sortDirection === 'desc';
    return (
      <span className="inline-flex flex-col shrink-0">
        <svg className={`w-2 h-2 ${isAsc ? 'text-orange-500' : 'opacity-40'}`} viewBox="0 0 8 8" fill="currentColor"><path d="M4 1 L7 6 H1 Z" /></svg>
        <svg className={`w-2 h-2 ${isDesc ? 'text-orange-500' : 'opacity-40'}`} viewBox="0 0 8 8" fill="currentColor"><path d="M4 7 L7 2 H1 Z" /></svg>
      </span>
    );
  };

  const thClasses = "px-2 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-white/10 transition-colors whitespace-nowrap";

  if (sortedData.length === 0) {
    return <p className="text-gray-400 text-xs italic py-2 text-center">No data available for {title.toLowerCase()}.</p>;
  }

  return (
    <div className="glass-card p-6 border-gray-200 dark:border-white/5 bg-white dark:bg-white/5 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 blur-3xl pointer-events-none"></div>
      
      <div className="mb-6 flex items-center gap-3">
        <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></div>
        <h3 className="text-sm font-bold text-gray-900 dark:text-white">{title}</h3>
      </div>

      <div className="overflow-x-auto custom-scrollbar rounded-2xl border border-gray-200 dark:border-white/5 bg-white dark:bg-transparent">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-white/5 border-collapse">
          <thead className="bg-gray-50 dark:bg-white/5">
            <tr>
              <th scope="col" className={thClasses} onClick={() => handleSort('name')}>
                <div className="flex items-center gap-2 group/header">
                  <span className={sortColumn === 'name' ? 'text-orange-500' : 'group-hover/header:text-gray-700 dark:group-hover/header:text-gray-200'}>{itemTypeLabel}</span>
                  <SortArrow column="name"/>
                </div>
              </th>
              <th scope="col" className={`${thClasses} text-right`} onClick={() => handleSort('avgPlays')}>
                <div className="flex items-center justify-end gap-2 group/header">
                  <span className={sortColumn === 'avgPlays' ? 'text-orange-500' : 'group-hover/header:text-gray-700 dark:group-hover/header:text-gray-200'}>Plays</span>
                  <SortArrow column="avgPlays"/>
                </div>
              </th>
              <th scope="col" className={`${thClasses} text-right`} onClick={() => handleSort('avgUpvotes')}>
                <div className="flex items-center justify-end gap-2 group/header">
                  <span className={sortColumn === 'avgUpvotes' ? 'text-orange-500' : 'group-hover/header:text-gray-700 dark:group-hover/header:text-gray-200'}>Upvotes</span>
                  <SortArrow column="avgUpvotes"/>
                </div>
              </th>
              <th scope="col" className={`${thClasses} text-right`} onClick={() => handleSort('avgComments')}>
                <div className="flex items-center justify-end gap-2 group/header">
                  <span className={sortColumn === 'avgComments' ? 'text-orange-500' : 'group-hover/header:text-gray-700 dark:group-hover/header:text-gray-200'}>Comments</span>
                  <SortArrow column="avgComments"/>
                </div>
              </th>
              <th scope="col" className={`${thClasses} text-right hidden lg:table-cell`} onClick={() => handleSort('avgUpvoteRate')}>
                <div className="flex items-center justify-end gap-2 group/header">
                  <span className={sortColumn === 'avgUpvoteRate' ? 'text-orange-500' : 'group-hover/header:text-gray-700 dark:group-hover/header:text-gray-200'}>Upvotes%</span>
                  <SortArrow column="avgUpvoteRate"/>
                </div>
              </th>
              <th scope="col" className={`${thClasses} text-right hidden lg:table-cell`} onClick={() => handleSort('avgCommentRate')}>
                <div className="flex items-center justify-end gap-2 group/header">
                  <span className={sortColumn === 'avgCommentRate' ? 'text-orange-500' : 'group-hover/header:text-gray-700 dark:group-hover/header:text-gray-200'}>Comments%</span>
                  <SortArrow column="avgCommentRate"/>
                </div>
              </th>
              <th scope="col" className={`${thClasses} text-right`} onClick={() => handleSort('count')}>
                <div className="flex items-center justify-end gap-2 group/header">
                  <span className={sortColumn === 'count' ? 'text-orange-500' : 'group-hover/header:text-gray-700 dark:group-hover/header:text-gray-200'}>Nodes</span>
                  <SortArrow column="count"/>
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-white/5">
            {sortedData.map((item) => (
              <tr key={item.name} className="group hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white truncate max-w-[100px]" title={item.name}>{item.name}</td>
                <td className="px-2 py-3 whitespace-nowrap text-right text-sm text-gray-700 dark:text-gray-300 tabular-nums">{(item.avgPlays as number).toFixed(1)}</td>
                <td className="px-2 py-3 whitespace-nowrap text-right text-sm text-gray-700 dark:text-gray-300 tabular-nums">{(item.avgUpvotes as number).toFixed(1)}</td>
                <td className="px-2 py-3 whitespace-nowrap text-right text-sm text-gray-700 dark:text-gray-300 tabular-nums">{(item.avgComments as number).toFixed(1)}</td>
                <td className="px-2 py-3 whitespace-nowrap text-right text-sm font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums hidden lg:table-cell">{item.avgUpvoteRate !== undefined ? `${item.avgUpvoteRate.toFixed(1)}%` : '---'}</td>
                <td className="px-2 py-3 whitespace-nowrap text-right text-sm font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums hidden lg:table-cell">{item.avgCommentRate !== undefined ? `${item.avgCommentRate.toFixed(1)}%` : '---'}</td>
                <td className="px-4 py-3 whitespace-nowrap text-right text-sm text-gray-700 dark:text-gray-300 tabular-nums">{item.count.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};


interface TagGenrePerformanceTablesProps {
  tagStats: TagStat[];
  genreStats: GenreStat[];
  topN?: number;
}

const TagGenrePerformanceTables: React.FC<TagGenrePerformanceTablesProps> = ({ tagStats, genreStats, topN = 10 }) => {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
      <PerformanceTable
        title={`Tag Performance`}
        data={tagStats}
        itemTypeLabel="Tag"
        topN={topN}
      />
      <PerformanceTable
        title={`Derived Genre Performance`}
        data={genreStats}
        itemTypeLabel="Genre"
        topN={topN}
      />
    </div>
  );
};

// ⚡ Bolt: Wrapped in React.memo to prevent unnecessary re-renders and re-sorts
// when the parent StatChartsArea updates its state (e.g. selectedPeriod)
// but this component's props remain unchanged.
export default React.memo(TagGenrePerformanceTables);