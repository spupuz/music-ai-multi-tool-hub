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
    if (sortColumn !== column) return <span className="opacity-30">↕️</span>;
    return sortDirection === 'asc' ? <span aria-label="sorted ascending">🔼</span> : <span aria-label="sorted descending">🔽</span>;
  };

  const thClasses = "px-0.5 sm:px-2 py-1 text-left text-[9px] sm:text-xs font-medium text-gray-300 uppercase tracking-tighter sm:tracking-wider cursor-pointer select-none hover:bg-gray-700 transition-colors";

  if (sortedData.length === 0) {
    return <p className="text-gray-400 text-xs italic py-2 text-center">No data available for {title.toLowerCase()}.</p>;
  }

  return (
    <div className="glass-card p-6 border-white/5 bg-white/5 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 blur-3xl pointer-events-none"></div>
      
      <div className="mb-6 flex items-center gap-3">
        <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></div>
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/80">{title}</h3>
      </div>

      <div className="overflow-x-auto custom-scrollbar rounded-2xl border border-white/5 bg-white/2">
        <table className="min-w-full divide-y divide-white/5 border-collapse">
          <thead className="bg-[#0a0a0a]/80 backdrop-blur-md">
            <tr>
              <th scope="col" className={thClasses} onClick={() => handleSort('name')}>
                <div className="flex items-center gap-2 group/header px-4">
                  <span className={sortColumn === 'name' ? 'text-orange-500' : 'group-hover/header:text-gray-300'}>{itemTypeLabel}</span>
                  <SortArrow column="name"/>
                </div>
              </th>
              <th scope="col" className={`${thClasses} text-right`} onClick={() => handleSort('avgPlays')}>
                <div className="flex items-center justify-end gap-2 group/header px-2">
                  <span className={sortColumn === 'avgPlays' ? 'text-orange-500' : 'group-hover/header:text-gray-300'}>Flux</span>
                  <SortArrow column="avgPlays"/>
                </div>
              </th>
              <th scope="col" className={`${thClasses} text-right`} onClick={() => handleSort('avgUpvotes')}>
                <div className="flex items-center justify-end gap-2 group/header px-2">
                  <span className={sortColumn === 'avgUpvotes' ? 'text-orange-500' : 'group-hover/header:text-gray-300'}>Affinity</span>
                  <SortArrow column="avgUpvotes"/>
                </div>
              </th>
              <th scope="col" className={`${thClasses} text-right`} onClick={() => handleSort('avgComments')}>
                <div className="flex items-center justify-end gap-2 group/header px-2">
                  <span className={sortColumn === 'avgComments' ? 'text-orange-500' : 'group-hover/header:text-gray-300'}>Echoes</span>
                  <SortArrow column="avgComments"/>
                </div>
              </th>
              <th scope="col" className={`${thClasses} text-right hidden lg:table-cell`} onClick={() => handleSort('avgUpvoteRate')}>
                <div className="flex items-center justify-end gap-2 group/header px-2">
                  <span className={sortColumn === 'avgUpvoteRate' ? 'text-orange-500' : 'group-hover/header:text-gray-300'}>Affinity%</span>
                  <SortArrow column="avgUpvoteRate"/>
                </div>
              </th>
              <th scope="col" className={`${thClasses} text-right hidden lg:table-cell`} onClick={() => handleSort('avgCommentRate')}>
                <div className="flex items-center justify-end gap-2 group/header px-2">
                  <span className={sortColumn === 'avgCommentRate' ? 'text-orange-500' : 'group-hover/header:text-gray-300'}>Echo%</span>
                  <SortArrow column="avgCommentRate"/>
                </div>
              </th>
              <th scope="col" className={`${thClasses} text-right`} onClick={() => handleSort('count')}>
                <div className="flex items-center justify-end gap-2 group/header px-4">
                  <span className={sortColumn === 'count' ? 'text-orange-500' : 'group-hover/header:text-gray-300'}>Nodes</span>
                  <SortArrow column="count"/>
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {sortedData.map((item) => (
              <tr key={item.name} className="group hover:bg-white/5 transition-colors">
                <td className="px-4 py-3 whitespace-nowrap text-[10px] font-black text-white/90 uppercase tracking-widest truncate max-w-[100px]" title={item.name}>{item.name}</td>
                <td className="px-2 py-3 whitespace-nowrap text-right text-[10px] font-black text-gray-300 tracking-widest">{(item.avgPlays as number).toFixed(1)}</td>
                <td className="px-2 py-3 whitespace-nowrap text-right text-[10px] font-black text-gray-300 tracking-widest">{(item.avgUpvotes as number).toFixed(1)}</td>
                <td className="px-2 py-3 whitespace-nowrap text-right text-[10px] font-black text-gray-300 tracking-widest">{(item.avgComments as number).toFixed(1)}</td>
                <td className="px-2 py-3 whitespace-nowrap text-right text-[10px] font-black text-green-500/80 tracking-widest hidden lg:table-cell">{item.avgUpvoteRate !== undefined ? `${item.avgUpvoteRate.toFixed(1)}%` : '---'}</td>
                <td className="px-2 py-3 whitespace-nowrap text-right text-[10px] font-black text-green-500/60 tracking-widest hidden lg:table-cell">{item.avgCommentRate !== undefined ? `${item.avgCommentRate.toFixed(1)}%` : '---'}</td>
                <td className="px-4 py-3 whitespace-nowrap text-right text-[10px] font-black text-gray-400 tracking-widest">{item.count.toLocaleString()}</td>
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
        title={`Neural Tag Performance`}
        data={tagStats}
        itemTypeLabel="Signal Tag"
        topN={topN}
      />
      <PerformanceTable
        title={`Derived Genre Performance`}
        data={genreStats}
        itemTypeLabel="Signal Genre"
        topN={topN}
      />
    </div>
  );
};

export default TagGenrePerformanceTables;