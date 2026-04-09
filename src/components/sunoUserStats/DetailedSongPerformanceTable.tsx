
import React, { useState, useMemo } from 'react';
import type { SunoClip } from '@/types';
import type { SongInteractionPoint } from '@/types/sunoUserStatsTypes';
import Button from '@/components/common/Button';
import { useTheme } from '@/context/ThemeContext';

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
  const { uiMode } = useTheme();

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
    if (sortColumn !== column) return <span className="opacity-30">↕️</span>;
    return sortDirection === 'asc' ? <span aria-label="sorted ascending">🔼</span> : <span aria-label="sorted descending">🔽</span>;
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

  // ── CLASSIC MODE ──────────────────────────────────────────────────
  if (uiMode === 'classic') {
    const thClasses = "px-3 py-2.5 text-left text-xs font-medium text-gray-700 dark:text-emerald-300 uppercase tracking-wider cursor-pointer select-none hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors";
    return (
      <div className="bg-gray-100 dark:bg-gray-850 p-3 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
        <div className="mb-4 flex flex-col sm:flex-row gap-2 items-center">
          <input
            type="text"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            placeholder="Filter by Title or Artist within current view..."
            className="flex-grow w-full sm:w-auto px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white focus:ring-emerald-500 focus:border-emerald-500 text-sm"
            aria-label="Filter songs table"
          />
          {activeTableFilters && (
            <span className="text-xs text-yellow-700 dark:text-yellow-300 bg-yellow-100 dark:bg-gray-700 px-2 py-1 rounded-md whitespace-nowrap">
               {getActiveFilterText()}
            </span>
          )}
        </div>
        <div className="overflow-x-auto">
          <div className="max-h-[70vh] overflow-y-auto"> 
            <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-600">
              <thead className="sticky top-0 z-10 bg-gray-100 dark:bg-gray-750"> 
                <tr>
                  <th className={`${thClasses} w-12`} scope="col">Cover</th>
                  <th className={thClasses} scope="col" onClick={() => handleSort('title')} aria-sort={sortColumn === 'title' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}>Title <SortArrow column="title" /></th>
                  <th className={thClasses} scope="col" onClick={() => handleSort('upvotes')} aria-sort={sortColumn === 'upvotes' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}>Upvotes <SortArrow column="upvotes" /></th>
                  <th className={thClasses} scope="col" onClick={() => handleSort('plays')} aria-sort={sortColumn === 'plays' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}>Plays <SortArrow column="plays" /></th>
                  <th className={thClasses} scope="col" onClick={() => handleSort('comments')} aria-sort={sortColumn === 'comments' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}>Comments <SortArrow column="comments" /></th>
                  <th className={thClasses} scope="col" onClick={() => handleSort('created_at')} aria-sort={sortColumn === 'created_at' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}>Created <SortArrow column="created_at" /></th>
                  <th className={thClasses} scope="col" onClick={() => handleSort('duration')} aria-sort={sortColumn === 'duration' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}>Duration <SortArrow column="duration" /></th>
                  <th className={thClasses} scope="col" onClick={() => handleSort('upvoteRate')} aria-sort={sortColumn === 'upvoteRate' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}>Upvote% <SortArrow column="upvoteRate" /></th>
                  <th className={thClasses} scope="col" onClick={() => handleSort('commentRate')} aria-sort={sortColumn === 'commentRate' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}>Cmnt% <SortArrow column="commentRate" /></th>
                  <th className={thClasses} scope="col" onClick={() => handleSort('playsPerDay')} aria-sort={sortColumn === 'playsPerDay' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}>Plays/Day <SortArrow column="playsPerDay" /></th>
                  <th className={thClasses} scope="col" onClick={() => handleSort('upvotesPerDay')} aria-sort={sortColumn === 'upvotesPerDay' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}>Upvt/Day <SortArrow column="upvotesPerDay" /></th>
                  <th className={thClasses} scope="col" onClick={() => handleSort('commentsPerDay')} aria-sort={sortColumn === 'commentsPerDay' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}>Cmnt/Day <SortArrow column="commentsPerDay" /></th>
                  <th className={thClasses} scope="col" onClick={() => handleSort('upvotesDelta')} aria-sort={sortColumn === 'upvotesDelta' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}>Upvotes Δ <SortArrow column="upvotesDelta" /></th>
                  <th className={thClasses} scope="col" onClick={() => handleSort('playsDelta')} aria-sort={sortColumn === 'playsDelta' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}>Plays Δ <SortArrow column="playsDelta" /></th>
                  <th className={thClasses} scope="col" onClick={() => handleSort('commentsDelta')} aria-sort={sortColumn === 'commentsDelta' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}>Comments Δ <SortArrow column="commentsDelta" /></th>
                  <th className={`${thClasses} w-20`} scope="col">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
                {filteredAndSortedSongs.map((song) => (
                  <tr key={song.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-3 py-2 whitespace-nowrap">
                      <a href={song.suno_song_url || `https://suno.com/song/${song.id}`} target="_blank" rel="noopener noreferrer" title={`View ${song.title} on Suno`}>
                        <img 
                          src={song.image_url || FALLBACK_IMAGE_DATA_URI} 
                          alt={song.title} 
                          className="w-10 h-10 object-cover rounded border border-gray-300 dark:border-gray-500" 
                          onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_IMAGE_DATA_URI; }}/>
                      </a>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 max-w-xs truncate">
                      <div className="font-medium truncate" title={song.title}>
                        <a href={song.suno_song_url || `https://suno.com/song/${song.id}`} target="_blank" rel="noopener noreferrer" className="hover:text-emerald-600 dark:hover:text-emerald-400 hover:underline">
                          {song.title}
                        </a>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate" title={song.display_name}>by {song.display_name} (@{song.handle})</div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300 text-right">{song.upvote_count.toLocaleString()}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300 text-right">{song.play_count.toLocaleString()}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300 text-right">{song.comment_count.toLocaleString()}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{new Date(song.created_at).toLocaleDateString()}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 text-right">
                      {song.metadata?.duration ? `${Math.floor(song.metadata.duration / 60)}:${String(Math.floor(song.metadata.duration % 60)).padStart(2, '0')}` : 'N/A'}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300 text-right">{song.upvoteRate !== null ? `${song.upvoteRate.toFixed(1)}%` : 'N/A'}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300 text-right">{song.commentRate !== null ? `${song.commentRate.toFixed(2)}%` : 'N/A'}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300 text-right">{song.playsPerDay !== null ? song.playsPerDay.toFixed(2) : 'N/A'}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300 text-right">{song.upvotesPerDay !== null ? song.upvotesPerDay.toFixed(2) : 'N/A'}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300 text-right">{song.commentsPerDay !== null ? song.commentsPerDay.toFixed(2) : 'N/A'}</td>
                    <td className={`px-3 py-2 whitespace-nowrap text-sm text-right ${song.upvotesDelta && song.upvotesDelta > 0 ? 'text-emerald-600 dark:text-emerald-400' : (song.upvotesDelta && song.upvotesDelta < 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-400')}`}>{formatDelta(song.upvotesDelta)}</td>
                    <td className={`px-3 py-2 whitespace-nowrap text-sm text-right ${song.playsDelta && song.playsDelta > 0 ? 'text-emerald-600 dark:text-emerald-400' : (song.playsDelta && song.playsDelta < 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-400')}`}>{formatDelta(song.playsDelta)}</td>
                    <td className={`px-3 py-2 whitespace-nowrap text-sm text-right ${song.commentsDelta && song.commentsDelta > 0 ? 'text-emerald-600 dark:text-emerald-400' : (song.commentsDelta && song.commentsDelta < 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-400')}`}>{formatDelta(song.commentsDelta)}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm">
                      <button 
                        onClick={() => onAnalyzeSong(song)} 
                        className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 text-xs py-0.5 px-1.5 border border-indigo-500 rounded hover:bg-indigo-100 dark:hover:bg-indigo-700 transition-colors"
                        title="Analyze song lifecycle"
                      >
                        Analyze
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredAndSortedSongs.length === 0 && (
                  <tr>
                    <td colSpan={16} className="px-3 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                      {activeTableFilters ? `No songs match the current filter: ${getActiveFilterText()}` : "No songs match your filter criteria."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        {filteredAndSortedSongs.length > 20 && (
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">Displaying all {filteredAndSortedSongs.length} results. Scroll within the table to see more.</p>
        )}
      </div>
    );
  }

  // ── ARCHITECT MODE ────────────────────────────────────────────────
  const columns = [
    { id: 'title', label: 'Signal Identifier' },
    { id: 'upvotes', label: 'Affinity' },
    { id: 'plays', label: 'Flux' },
    { id: 'comments', label: 'Echoes' },
    { id: 'created_at', label: 'Genesis' },
    { id: 'duration', label: 'Span' },
    { id: 'upvoteRate', label: 'Affinity%' },
    { id: 'commentRate', label: 'Echo%' },
    { id: 'playsPerDay', label: 'Flux/Cycle' },
    { id: 'upvotesPerDay', label: 'Affinity/Cycle' },
    { id: 'commentsPerDay', label: 'Echo/Cycle' },
    { id: 'upvotesDelta', label: 'Affinity Δ' },
    { id: 'playsDelta', label: 'Flux Δ' },
    { id: 'commentsDelta', label: 'Echo Δ' },
  ];

  return (
    <div className="glass-card p-4 sm:p-6 border-white/5 bg-white/5 shadow-2xl relative overflow-hidden">
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
            placeholder="Search neural signals..."
            className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest placeholder-gray-600 text-white focus:outline-none focus:border-emerald-500/20 focus:ring-1 focus:ring-emerald-500/10 transition-all"
            aria-label="Filter songs table"
          />
        </div>
        {activeTableFilters && (
          <div className="flex items-center gap-3 px-4 py-2 bg-yellow-500/5 border border-yellow-500/20 rounded-xl">
             <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse"></div>
             <span className="text-[8px] font-black uppercase tracking-[0.2em] text-yellow-500/80">
                Active Filter: {getActiveFilterText()}
             </span>
          </div>
        )}
      </div>
      <div className="overflow-hidden rounded-2xl sm:rounded-3xl border border-white/5 bg-white/[0.02]">
        <div className="max-h-[75vh] overflow-auto custom-scrollbar"> 
          <table className="min-w-full divide-y divide-white/10 border-collapse table-auto">
            <thead className="sticky top-0 z-30 bg-[#0a0a0a] backdrop-blur-md"> 
              <tr>
                <th className="sticky left-0 z-40 bg-[#0a0a0a] px-4 sm:px-6 py-5 text-left text-[8px] sm:text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] w-12 sm:w-16 border-r border-white/5" scope="col">Node</th>
                {columns.map((col) => (
                  <th 
                    key={col.id}
                    className={`px-4 py-5 text-left text-[8px] sm:text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] cursor-pointer hover:bg-white/5 transition-colors whitespace-nowrap ${col.id === 'title' ? 'sticky left-12 sm:left-16 z-40 bg-[#0a0a0a] border-r border-white/10 shadow-[2px_0_5px_rgba(0,0,0,0.3)]' : ''}`} 
                    scope="col" 
                    onClick={() => handleSort(col.id as SortableColumn)} 
                    aria-sort={sortColumn === col.id ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
                  >
                    <div className="flex items-center gap-2 group/header">
                      <span className={sortColumn === col.id ? 'text-emerald-500' : 'group-hover/header:text-gray-300'}>{col.label}</span>
                      <SortArrow column={col.id as SortableColumn} />
                    </div>
                  </th>
                ))}
                <th className="px-6 py-5 text-right text-[8px] sm:text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] w-24" scope="col">Ops</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredAndSortedSongs.map((song) => (
                <tr key={song.id} className="group hover:bg-white/5 transition-all duration-300">
                  <td className="sticky left-0 z-20 bg-[#0a0a0a] group-hover:bg-gray-900/40 px-4 sm:px-6 py-4 whitespace-nowrap border-r border-white/5">
                    <a href={song.suno_song_url || `https://suno.com/song/${song.id}`} target="_blank" rel="noopener noreferrer" className="block relative h-10 w-10 sm:h-12 sm:w-12 group/thumb">
                      <div className="absolute inset-0 bg-emerald-500/10 rounded-xl blur-sm opacity-0 group-hover/thumb:opacity-100 transition-opacity"></div>
                      <img 
                        src={song.image_url || FALLBACK_IMAGE_DATA_URI} 
                        alt={song.title} 
                        className="h-10 w-10 sm:h-12 sm:w-12 object-cover rounded-xl border border-white/10 shadow-lg relative z-10 grayscale-[0.3] group-hover:grayscale-0 transition-all" 
                        onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_IMAGE_DATA_URI; }}/>
                    </a>
                  </td>
                  <td className="sticky left-12 sm:left-16 z-20 bg-[#0a0a0a] group-hover:bg-gray-900/40 px-4 py-4 whitespace-nowrap border-r border-white/10 shadow-[2px_0_5px_rgba(0,0,0,0.3)]">
                    <div className="flex flex-col max-w-[120px] sm:max-w-xs overflow-hidden">
                      <a href={song.suno_song_url || `https://suno.com/song/${song.id}`} target="_blank" rel="noopener noreferrer" className="text-[10px] sm:text-[11px] font-black text-white tracking-widest uppercase truncate hover:text-emerald-500 transition-colors" title={song.title}>
                        {song.title}
                      </a>
                      <span className="text-[8px] font-black uppercase tracking-[0.2em] text-gray-600 truncate" title={song.handle}>@{song.handle}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-[10px] font-black text-gray-300 tracking-widest text-right">{song.upvote_count.toLocaleString()}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-[10px] font-black text-gray-300 tracking-widest text-right">{song.play_count.toLocaleString()}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-[10px] font-black text-gray-300 tracking-widest text-right">{song.comment_count.toLocaleString()}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-[9px] font-black text-gray-500 uppercase tracking-widest">{new Date(song.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-[10px] font-black text-gray-400 tracking-widest text-right">
                    {song.metadata?.duration ? `${Math.floor(song.metadata.duration / 60)}:${String(Math.floor(song.metadata.duration % 60)).padStart(2, '0')}` : '---'}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-[10px] font-black text-emerald-500/80 tracking-widest text-right">{song.upvoteRate !== null ? `${song.upvoteRate.toFixed(1)}%` : '---'}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-[10px] font-black text-emerald-500/60 tracking-widest text-right">{song.commentRate !== null ? `${song.commentRate.toFixed(2)}%` : '---'}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-[10px] font-black text-gray-400 tracking-widest text-right">{song.playsPerDay !== null ? song.playsPerDay.toFixed(1) : '---'}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-[10px] font-black text-gray-400 tracking-widest text-right">{song.upvotesPerDay !== null ? song.upvotesPerDay.toFixed(1) : '---'}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-[10px] font-black text-gray-400 tracking-widest text-right">{song.commentsPerDay !== null ? song.commentsPerDay.toFixed(1) : '---'}</td>
                  <td className={`px-4 py-4 whitespace-nowrap text-[10px] font-black tracking-widest text-right ${song.upvotesDelta && song.upvotesDelta > 0 ? 'text-emerald-500' : (song.upvotesDelta && song.upvotesDelta < 0 ? 'text-red-500' : 'text-gray-600')}`}>{formatDelta(song.upvotesDelta)}</td>
                  <td className={`px-4 py-4 whitespace-nowrap text-[10px] font-black tracking-widest text-right ${song.playsDelta && song.playsDelta > 0 ? 'text-emerald-500' : (song.playsDelta && song.playsDelta < 0 ? 'text-red-500' : 'text-gray-600')}`}>{formatDelta(song.playsDelta)}</td>
                  <td className={`px-4 py-4 whitespace-nowrap text-[10px] font-black tracking-widest text-right ${song.commentsDelta && song.commentsDelta > 0 ? 'text-emerald-500' : (song.commentsDelta && song.commentsDelta < 0 ? 'text-red-500' : 'text-gray-600')}`}>{formatDelta(song.commentsDelta)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <Button 
                      onClick={() => onAnalyzeSong(song)} 
                      variant="ghost" 
                      size="xs" 
                      className="font-black uppercase tracking-widest text-[8px] py-2 px-4 border-white/5 hover:bg-emerald-500/10 hover:text-emerald-400 shadow-xl transition-all duration-300"
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
        <p className="text-[8px] font-black uppercase tracking-[0.4em] text-gray-600 text-center mt-6">
           Dataset integrity verified for {filteredAndSortedSongs.length} signal points.
        </p>
      )}
    </div>
  );
};

export default DetailedSongPerformanceTable;
