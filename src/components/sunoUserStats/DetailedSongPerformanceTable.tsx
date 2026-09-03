
import React, { useState, useMemo } from 'react';
import type { SunoClip } from '@/types';
import type { SongInteractionPoint } from '@/types/sunoUserStatsTypes';
import Button from '@/components/common/Button';

const LOGO_SVG_STRING = `<svg viewBox='0 0 100 100' fill='none' xmlns='http://www.w3.org/2000/svg'><path d='M50 10 L85 27.5 V72.5 L50 90 L15 72.5 V27.5 L50 10 Z' stroke='#059669' stroke-width='8' fill='transparent'/><circle cx='50' cy='35' r='7' fill='#10B981'/><circle cx='35' cy='65' r='6' fill='#10B981'/><circle cx='65' cy='65' r='6' fill='#10B981'/><line x1='50' y1='35' x2='35' y2='65' stroke='#10B981' stroke-width='5' stroke-linecap='round'/><line x1='50' y1='35' x2='65' y2='65' stroke='#10B981' stroke-width='5' stroke-linecap='round'/><line x1='38' y1='63' x2='62' y2='63' stroke='#10B981' stroke-width='5' stroke-linecap='round'/></svg>`;
const FALLBACK_IMAGE_DATA_URI = `data:image/svg+xml;base64,${btoa(LOGO_SVG_STRING)}`;

interface DetailedSongPerformanceTableProps {
  songs: SunoClip[];
  songInteractionHistory: Record<string, SongInteractionPoint[]>;
  onAnalyzeSong: (song: SunoClip) => void;
  activeTableFilters: { type: string; value: string } | null;
}

type SortableColumn = 'title' | 'plays' | 'upvotes' | 'comments' | 'created_at' | 'duration' | 'upvoteRate' | 'commentRate' | 'playsPerDay' | 'upvotesPerDay' | 'commentsPerDay' | 'playsDelta' | 'upvotesDelta' | 'commentsDelta';
type SortDirection = 'asc' | 'desc';

interface SongPerformanceData extends SunoClip {
  upvoteRate: number | null;
  commentRate: number | null;
  playsPerDay: number | null;
  upvotesPerDay: number | null;
  commentsPerDay: number | null;
  playsDelta: number | null;
  upvotesDelta: number | null;
  commentsDelta: number | null;
}

const calculateUpvoteRate = (plays: number, upvotes: number): number | null => {
  if (plays === 0) return null;
  return parseFloat(((upvotes / plays) * 100).toFixed(1));
};

const calculateCommentRate = (plays: number, comments: number): number | null => {
    if (plays === 0) return null;
    return parseFloat(((comments / plays) * 100).toFixed(2));
};

const calculatePerDayMetric = (value: number, createdAt: string): number | null => {
    const createdDate = new Date(createdAt);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - createdDate.getTime());
    const diffDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    return parseFloat((value / diffDays).toFixed(2));
};

const calculateDelta = (history: SongInteractionPoint[] | undefined, metric: 'plays' | 'upvotes' | 'comment_count'): number | null => {
  if (!history || history.length < 2) return null;
  const latest = history[history.length - 1]?.[metric] ?? 0;
  const previous = history[history.length - 2]?.[metric] ?? 0;
  return latest - previous;
};

const formatDelta = (delta: number | null): string => {
  if (delta === null) return 'N/A';
  if (delta === 0) return '0';
  return delta > 0 ? `+${delta.toLocaleString()}` : delta.toLocaleString();
};

const DetailedSongPerformanceTable: React.FC<DetailedSongPerformanceTableProps> = ({ songs, songInteractionHistory, onAnalyzeSong, activeTableFilters }) => {
  const [filterText, setFilterText] = useState('');
  const [sortColumn, setSortColumn] = useState<SortableColumn>('created_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const enhancedSongs = useMemo<SongPerformanceData[]>(() => {
    return songs.map(song => ({
      ...song,
      upvoteRate: calculateUpvoteRate(song.play_count || 0, song.upvote_count || 0),
      commentRate: calculateCommentRate(song.play_count || 0, song.comment_count || 0),
      playsPerDay: calculatePerDayMetric(song.play_count || 0, song.created_at),
      upvotesPerDay: calculatePerDayMetric(song.upvote_count || 0, song.created_at),
      commentsPerDay: calculatePerDayMetric(song.comment_count || 0, song.created_at),
      playsDelta: calculateDelta(songInteractionHistory[song.id], 'plays'),
      upvotesDelta: calculateDelta(songInteractionHistory[song.id], 'upvotes'),
      commentsDelta: calculateDelta(songInteractionHistory[song.id], 'comment_count'),
    }));
  }, [songs, songInteractionHistory]);

  const filteredAndSortedSongs = useMemo(() => {
    let processedSongs = [...enhancedSongs];

    if (filterText.trim()) {
      const lowerFilter = filterText.toLowerCase();
      processedSongs = processedSongs.filter(song =>
        song.title.toLowerCase().includes(lowerFilter) ||
        song.display_name.toLowerCase().includes(lowerFilter) ||
        song.handle.toLowerCase().includes(lowerFilter)
      );
    }
    
    if (activeTableFilters) {
      processedSongs = processedSongs.filter(song => {
        if (activeTableFilters.type === 'tag') {
          return song.metadata?.tags?.toLowerCase().includes(activeTableFilters.value.toLowerCase());
        }
        if (activeTableFilters.type === 'genre') {
          const tagsString = song.metadata?.tags?.toLowerCase() || "";
          return tagsString.includes(activeTableFilters.value.toLowerCase());
        }
        if (activeTableFilters.type === 'dayOfWeek') {
          return new Date(song.created_at).getDay() === parseInt(activeTableFilters.value);
        }
        if (activeTableFilters.type === 'hourOfDay') {
          return new Date(song.created_at).getHours() === parseInt(activeTableFilters.value);
        }
        return true;
      });
    }

    processedSongs.sort((a, b) => {
      let aSortValue: number | string | Date;
      let bSortValue: number | string | Date;

      switch (sortColumn) {
        case 'title':
          aSortValue = a.title.toLowerCase();
          bSortValue = b.title.toLowerCase();
          break;
        case 'created_at':
          aSortValue = new Date(a.created_at);
          bSortValue = new Date(b.created_at);
          break;
        case 'duration':
          aSortValue = a.metadata?.duration || 0;
          bSortValue = b.metadata?.duration || 0;
          break;
        case 'plays':
          aSortValue = a.play_count || 0;
          bSortValue = b.play_count || 0;
          break;
        case 'upvotes':
          aSortValue = a.upvote_count || 0;
          bSortValue = b.upvote_count || 0;
          break;
        case 'comments':
          aSortValue = a.comment_count || 0;
          bSortValue = b.comment_count || 0;
          break;
        case 'upvoteRate':
        case 'commentRate':
        case 'playsPerDay':
        case 'upvotesPerDay':
        case 'commentsPerDay':
        case 'playsDelta':
        case 'upvotesDelta':
        case 'commentsDelta':
          const rawA = a[sortColumn];
          const rawB = b[sortColumn];
          aSortValue = (rawA === null || typeof rawA === 'undefined') 
                       ? (sortDirection === 'asc' ? Infinity : -Infinity) 
                       : Number(rawA);
          bSortValue = (rawB === null || typeof rawB === 'undefined') 
                       ? (sortDirection === 'asc' ? Infinity : -Infinity) 
                       : Number(rawB);
          break;
        default: 
          return 0;
      }

      if (aSortValue < bSortValue) return sortDirection === 'asc' ? -1 : 1;
      if (aSortValue > bSortValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return processedSongs;
  }, [enhancedSongs, filterText, sortColumn, sortDirection, activeTableFilters]);

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
        <svg className={`w-2 h-2 ${isAsc ? 'text-emerald-400' : 'opacity-40'}`} viewBox="0 0 8 8" fill="currentColor"><path d="M4 1 L7 6 H1 Z" /></svg>
        <svg className={`w-2 h-2 ${isDesc ? 'text-emerald-400' : 'opacity-40'}`} viewBox="0 0 8 8" fill="currentColor"><path d="M4 7 L7 2 H1 Z" /></svg>
      </span>
    );
  };

  const getActiveFilterText = () => {
    if (!activeTableFilters) return null;
    let typeLabel = activeTableFilters.type.replace(/([A-Z])/g, ' $1');
    typeLabel = typeLabel.charAt(0).toUpperCase() + typeLabel.slice(1);
    return `Filtered by: ${typeLabel} = ${activeTableFilters.value}`;
  };

  if (songs.length === 0) {
    return <p className="text-center text-gray-500 dark:text-gray-400 py-4">No songs available to display in the table.</p>;
  }

  const columns = [
    { id: 'title', label: 'Song' },
    { id: 'upvotes', label: 'Upvotes' },
    { id: 'plays', label: 'Plays' },
    { id: 'comments', label: 'Comments' },
    { id: 'created_at', label: 'Created' },
    { id: 'duration', label: 'Duration' },
    { id: 'upvoteRate', label: 'Upvotes%' },
    { id: 'commentRate', label: 'Comments%' },
    { id: 'playsPerDay', label: 'Plays/Day' },
    { id: 'upvotesPerDay', label: 'Upvotes/Day' },
    { id: 'commentsPerDay', label: 'Comments/Day' },
    { id: 'upvotesDelta', label: 'Upvotes Δ' },
    { id: 'playsDelta', label: 'Plays Δ' },
    { id: 'commentsDelta', label: 'Comments Δ' },
  ];

  return (
    <div className="glass-card p-4 sm:p-6 border-gray-200 dark:border-white/5 bg-white dark:bg-white/5 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl pointer-events-none"></div>
      <div className="mb-4 sm:mb-8 flex flex-col sm:flex-row gap-4 sm:gap-6 items-center">
        <div className="relative flex-grow group w-full">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg className="h-4 w-4 text-gray-500 group-hover:text-emerald-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            placeholder="Search songs..."
            className="w-full pl-10 pr-4 py-3 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/5 rounded-2xl text-sm placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500/20 focus:ring-1 focus:ring-emerald-500/10 transition-all"
            aria-label="Filter songs table"
          />
        </div>
        {activeTableFilters && (
          <div className="flex items-center gap-3 px-4 py-2 bg-yellow-500/5 border border-yellow-500/20 rounded-xl">
             <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse"></div>
<span className="text-xs font-medium text-yellow-600 dark:text-yellow-400">
                Active Filter: {getActiveFilterText()}
              </span>
          </div>
        )}
      </div>
      <div className="overflow-hidden rounded-2xl sm:rounded-3xl border border-gray-200 dark:border-white/5 bg-white/[0.02]">
        <div className="max-h-[75vh] overflow-auto custom-scrollbar"> 
          <table className="min-w-full divide-y divide-gray-200 dark:divide-white/10 border-collapse table-auto">
            <thead className="sticky top-0 z-30 bg-[#0a0a0a] backdrop-blur-md"> 
              <tr>
                <th className="sticky left-0 z-40 bg-[#0a0a0a] px-4 sm:px-6 py-5 text-left text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider w-12 sm:w-16 border-r border-white/5" scope="col">#</th>
                {columns.map((col) => (
                  <th 
                    key={col.id}
                    className={`px-4 py-5 text-left text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-white/5 transition-colors whitespace-nowrap ${col.id === 'title' ? 'sticky left-12 sm:left-16 z-40 bg-[#0a0a0a] border-r border-white/10 shadow-[2px_0_5px_rgba(0,0,0,0.3)]' : ''}`} 
                    scope="col" 
                    onClick={() => handleSort(col.id as SortableColumn)} 
                    aria-sort={sortColumn === col.id ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
                  >
                    <div className="flex items-center gap-2 group/header">
                      <span className={sortColumn === col.id ? 'text-emerald-400' : 'group-hover/header:text-gray-300'}>{col.label}</span>
                      <SortArrow column={col.id as SortableColumn} />
                    </div>
                  </th>
                ))}
                <th className="px-4 py-5 text-right text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider w-24" scope="col">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-white/5">
              {filteredAndSortedSongs.map((song) => (
                <tr key={song.id} className="group hover:bg-gray-100 dark:hover:bg-white/5 transition-all duration-300">
                  <td className="sticky left-0 z-20 bg-[#0a0a0a] group-hover:bg-gray-900/40 px-4 sm:px-6 py-4 whitespace-nowrap border-r border-white/5">
                    <a href={song.suno_song_url || `https://suno.com/song/${song.id}`} target="_blank" rel="noopener noreferrer" className="block relative h-10 w-10 sm:h-12 sm:w-12 group/thumb">
                      <div className="absolute inset-0 bg-emerald-500/10 rounded-xl blur-sm opacity-0 group-hover/thumb:opacity-100 transition-opacity"></div>
                      <img loading="lazy" decoding="async" 
                        src={song.image_url || FALLBACK_IMAGE_DATA_URI} 
                        alt={song.title} 
                        className="h-10 w-10 sm:h-12 sm:w-12 object-cover rounded-xl border border-white/10 shadow-lg relative z-10 grayscale-[0.3] group-hover:grayscale-0 transition-all" 
                        onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_IMAGE_DATA_URI; }}/>
                    </a>
                  </td>
                  <td className="sticky left-12 sm:left-16 z-20 bg-[#0a0a0a] group-hover:bg-gray-900/40 px-4 py-4 whitespace-nowrap border-r border-white/10 shadow-[2px_0_5px_rgba(0,0,0,0.3)]">
                    <div className="flex flex-col max-w-[120px] sm:max-w-xs overflow-hidden">
                      <a href={song.suno_song_url || `https://suno.com/song/${song.id}`} target="_blank" rel="noopener noreferrer" className="text-xs sm:text-sm font-semibold text-white truncate hover:text-emerald-400 transition-colors" title={song.title}>
                        {song.title}
                      </a>
                      <span className="text-[10px] font-medium text-gray-400 truncate" title={song.handle}>@{song.handle}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300 tabular-nums text-right">{song.upvote_count.toLocaleString()}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300 tabular-nums text-right">{song.play_count.toLocaleString()}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300 tabular-nums text-right">{song.comment_count.toLocaleString()}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{new Date(song.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300 tabular-nums text-right">
                    {song.metadata?.duration ? `${Math.floor(song.metadata.duration / 60)}:${String(Math.floor(song.metadata.duration % 60)).padStart(2, '0')}` : '---'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums text-right">{song.upvoteRate !== null ? `${song.upvoteRate.toFixed(1)}%` : '---'}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums text-right">{song.commentRate !== null ? `${song.commentRate.toFixed(2)}%` : '---'}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300 tabular-nums text-right">{song.playsPerDay !== null ? song.playsPerDay.toFixed(1) : '---'}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300 tabular-nums text-right">{song.upvotesPerDay !== null ? song.upvotesPerDay.toFixed(1) : '---'}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300 tabular-nums text-right">{song.commentsPerDay !== null ? song.commentsPerDay.toFixed(1) : '---'}</td>
                  <td className={`px-4 py-3 whitespace-nowrap text-sm font-medium tabular-nums text-right ${song.upvotesDelta && song.upvotesDelta > 0 ? 'text-emerald-600 dark:text-emerald-400' : (song.upvotesDelta && song.upvotesDelta < 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400')}`}>{formatDelta(song.upvotesDelta)}</td>
                  <td className={`px-4 py-3 whitespace-nowrap text-sm font-medium tabular-nums text-right ${song.playsDelta && song.playsDelta > 0 ? 'text-emerald-600 dark:text-emerald-400' : (song.playsDelta && song.playsDelta < 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400')}`}>{formatDelta(song.playsDelta)}</td>
                  <td className={`px-4 py-3 whitespace-nowrap text-sm font-medium tabular-nums text-right ${song.commentsDelta && song.commentsDelta > 0 ? 'text-emerald-600 dark:text-emerald-400' : (song.commentsDelta && song.commentsDelta < 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400')}`}>{formatDelta(song.commentsDelta)}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-right">
                    <Button 
                      onClick={() => onAnalyzeSong(song)} 
                      variant="ghost" 
                      size="xs" 
                      className="text-xs font-semibold py-2 px-4 border-gray-200 dark:border-white/5 hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400 shadow-xl transition-all duration-300"
                    >
                      Inspect
                    </Button>
                  </td>
                </tr>
              ))}
              {filteredAndSortedSongs.length === 0 && (
                <tr>
                  <td colSpan={16} className="px-3 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                    {activeTableFilters ? `No songs match the current filter: ${getActiveFilterText()}` : "No match found."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {filteredAndSortedSongs.length > 20 && (
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-6">
           Verified {filteredAndSortedSongs.length} songs.
        </p>
      )}
    </div>
  );
};

// ⚡ Bolt: Wrapped in React.memo to prevent expensive re-renders of this large table
// when parent component updates but the table's props haven't changed.
export default React.memo(DetailedSongPerformanceTable);
