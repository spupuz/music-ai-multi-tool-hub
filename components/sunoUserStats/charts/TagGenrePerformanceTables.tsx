import React, { useState, useMemo } from 'react';
import type { TagStat, GenreStat } from '../../../types/sunoUserStatsTypes';
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
    if (sortColumn !== column) return <span className="opacity-30">↕️</span>;
    return sortDirection === 'asc' ? <span aria-label="sorted ascending">🔼</span> : <span aria-label="sorted descending">🔽</span>;
  };

  const thClasses = "px-1 sm:px-2 py-1.5 text-left text-[10px] sm:text-xs font-medium text-gray-300 uppercase tracking-normal sm:tracking-wider cursor-pointer select-none hover:bg-gray-700 transition-colors";

  if (sortedData.length === 0) {
    return <p className="text-gray-400 text-xs italic py-2 text-center">No data available for {title.toLowerCase()}.</p>;
  }

  return (
    <ChartContainer title={title} heightClassName="h-auto min-h-[200px]">
      <div className="overflow-x-auto text-xs">
        <table className="min-w-full divide-y divide-gray-600">
          <thead className="bg-gray-700">
            <tr>
              <th scope="col" className={thClasses} onClick={() => handleSort('name')}>{itemTypeLabel} <SortArrow column="name"/></th>
              <th scope="col" className={`${thClasses} text-right`} onClick={() => handleSort('avgPlays')}>Avg Plays <SortArrow column="avgPlays"/></th>
              <th scope="col" className={`${thClasses} text-right`} onClick={() => handleSort('avgUpvotes')}>Avg Upvotes <SortArrow column="avgUpvotes"/></th>
              <th scope="col" className={`${thClasses} text-right`} onClick={() => handleSort('avgComments')}>Avg Comments <SortArrow column="avgComments"/></th>
              <th scope="col" className={`${thClasses} text-right hidden lg:table-cell`} onClick={() => handleSort('avgUpvoteRate')}>Avg Upvote% <SortArrow column="avgUpvoteRate"/></th>
              <th scope="col" className={`${thClasses} text-right hidden lg:table-cell`} onClick={() => handleSort('avgCommentRate')}>Avg Cmnt% <SortArrow column="avgCommentRate"/></th>
              <th scope="col" className={`${thClasses} text-right`} onClick={() => handleSort('count')}>Songs <SortArrow column="count"/></th>
            </tr>
          </thead>
          <tbody className="bg-gray-750 divide-y divide-gray-600">
            {sortedData.map((item) => (
              <tr key={item.name}>
                <td className="px-1 sm:px-2 py-1.5 whitespace-nowrap text-gray-200 text-[11px] sm:text-xs truncate max-w-[80px] sm:max-w-[100px]" title={item.name}>{item.name}</td>
                <td className="px-1 sm:px-2 py-1.5 whitespace-nowrap text-gray-200 text-right text-[11px] sm:text-xs">{(item.avgPlays as number).toFixed(1)}</td>
                <td className="px-1 sm:px-2 py-1.5 whitespace-nowrap text-gray-200 text-right text-[11px] sm:text-xs">{(item.avgUpvotes as number).toFixed(1)}</td>
                <td className="px-1 sm:px-2 py-1.5 whitespace-nowrap text-gray-200 text-right text-[11px] sm:text-xs">{(item.avgComments as number).toFixed(1)}</td>
                <td className="px-1 sm:px-2 py-1.5 whitespace-nowrap text-gray-200 text-right text-[11px] sm:text-xs hidden lg:table-cell">{item.avgUpvoteRate !== undefined ? `${item.avgUpvoteRate.toFixed(1)}%` : 'N/A'}</td>
                <td className="px-1 sm:px-2 py-1.5 whitespace-nowrap text-gray-200 text-right text-[11px] sm:text-xs hidden lg:table-cell">{item.avgCommentRate !== undefined ? `${item.avgCommentRate.toFixed(1)}%` : 'N/A'}</td>
                <td className="px-1 sm:px-2 py-1.5 whitespace-nowrap text-gray-300 text-right text-[11px] sm:text-xs">{item.count.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ChartContainer>
  );
};


interface TagGenrePerformanceTablesProps {
  tagStats: TagStat[];
  genreStats: GenreStat[];
  topN?: number;
}

const TagGenrePerformanceTables: React.FC<TagGenrePerformanceTablesProps> = ({ tagStats, genreStats, topN = 10 }) => {
  return (
    <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-8">
      <PerformanceTable
        title={`Tag Performance (Top ${topN} by Sort)`}
        data={tagStats}
        itemTypeLabel="Tag"
        topN={topN}
      />
      <PerformanceTable
        title={`Genre Performance (Top ${topN} by Sort)`}
        data={genreStats}
        itemTypeLabel="Genre (Derived)"
        topN={topN}
      />
    </div>
  );
};

export default TagGenrePerformanceTables;