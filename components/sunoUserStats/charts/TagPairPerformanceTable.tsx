
import React, { useState, useMemo } from 'react';
import type { TagPairPerformanceData } from '../../../types/sunoUserStatsTypes';
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
  
  const thClasses = "px-0.5 sm:px-3 py-1 sm:py-2 text-left text-[9px] sm:text-xs font-medium text-green-300 uppercase tracking-tighter sm:tracking-wider cursor-pointer select-none hover:bg-gray-700 transition-colors";

  if (!tagPairData || tagPairData.length === 0) {
    return <p className="text-gray-400 text-center py-4">No tag pair performance data available (min. 3 songs per pair required).</p>;
  }

  return (
    <ChartContainer title={`Top Performing Tag Pairs (Top ${topN})`} heightClassName="h-auto">
      <div className="overflow-x-auto text-xs">
        <table className="min-w-full divide-y divide-gray-600">
          <thead className="bg-gray-750">
            <tr>
              <th scope="col" className={thClasses} onClick={() => handleSort('tagPair')} aria-sort={sortColumn === 'tagPair' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}>
                <span className="sm:hidden">Tags</span>
                <span className="hidden sm:inline">Tag Pair</span>
                <SortArrow column="tagPair" />
              </th>
              <th scope="col" className={`${thClasses} text-right`} onClick={() => handleSort('songCount')} aria-sort={sortColumn === 'songCount' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}>
                <span className="sm:hidden">Qty</span>
                <span className="hidden sm:inline">Songs</span>
                <SortArrow column="songCount" />
              </th>
              <th scope="col" className={`${thClasses} text-right`} onClick={() => handleSort('avgPlays')} aria-sort={sortColumn === 'avgPlays' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}>
                <span className="sm:hidden">Plays</span>
                <span className="hidden sm:inline">Avg Plays</span>
                <SortArrow column="avgPlays" />
              </th>
              <th scope="col" className={`${thClasses} text-right`} onClick={() => handleSort('avgUpvotes')} aria-sort={sortColumn === 'avgUpvotes' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}>
                <span className="sm:hidden">Upvt</span>
                <span className="hidden sm:inline">Avg Upvotes</span>
                <SortArrow column="avgUpvotes" />
              </th>
              <th scope="col" className={`${thClasses} text-right`} onClick={() => handleSort('avgComments')} aria-sort={sortColumn === 'avgComments' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}>
                <span className="sm:hidden">Cmnt</span>
                <span className="hidden sm:inline">Avg Comments</span>
                <SortArrow column="avgComments" />
              </th>
            </tr>
          </thead>
          <tbody className="bg-gray-800 divide-y divide-gray-600">
            {sortedAndFilteredData.map((item) => (
              <tr key={item.tagPair}>
                <td className="px-0.5 sm:px-3 py-1 sm:py-2 whitespace-nowrap text-gray-200 text-[10px] sm:text-xs truncate max-w-[80px] sm:max-w-[150px]" title={item.tagPair}>{item.tagPair}</td>
                <td className="px-0.5 sm:px-3 py-1 sm:py-2 whitespace-nowrap text-gray-200 text-right text-[10px] sm:text-xs">{item.songCount.toLocaleString()}</td>
                <td className="px-0.5 sm:px-3 py-1 sm:py-2 whitespace-nowrap text-gray-200 text-right text-[10px] sm:text-xs">
                  <span className="sm:hidden">{Math.round(item.avgPlays)}</span>
                  <span className="hidden sm:inline">{item.avgPlays.toFixed(1)}</span>
                </td>
                <td className="px-0.5 sm:px-3 py-1 sm:py-2 whitespace-nowrap text-gray-200 text-right text-[10px] sm:text-xs">
                  <span className="sm:hidden">{Math.round(item.avgUpvotes)}</span>
                  <span className="hidden sm:inline">{item.avgUpvotes.toFixed(1)}</span>
                </td>
                <td className="px-0.5 sm:px-3 py-1 sm:py-2 whitespace-nowrap text-gray-200 text-right text-[10px] sm:text-xs">{item.avgComments.toFixed(1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ChartContainer>
  );
};

export default TagPairPerformanceTable;
