

import React, { useState, useMemo } from 'react';
import type { SunoClip } from '@/types';
import type { SongInteractionPoint } from '@/types/sunoUserStatsTypes';
import Button from '@/components/common/Button';

const LOGO_SVG_STRING = `<svg viewBox='0 0 100 100' fill='none' xmlns='http://www.w3.org/2000/svg'><path d='M50 10 L85 27.5 V72.5 L50 90 L15 72.5 V27.5 L50 10 Z' stroke='#059669' stroke-width='8' fill='transparent'/><circle cx='50' cy='35' r='7' fill='#14B8A6'/><circle cx='35' cy='65' r='6' fill='#14B8A6'/><circle cx='65' cy='65' r='6' fill='#14B8A6'/><line x1='50' y1='35' x2='35' y2='65' stroke='#10B981' stroke-width='5' stroke-linecap='round'/><line x1='50' y1='35' x2='65' y2='65' stroke='#10B981' stroke-width='5' stroke-linecap='round'/><line x1='38' y1='63' x2='62' y2='63' stroke='#10B981' stroke-width='5' stroke-linecap='round'/></svg>`;
const FALLBACK_IMAGE_DATA_URI = `data:image/svg+xml;base64,${btoa(LOGO_SVG_STRING)}`;

interface DetailedSongPerformanceTableProps {
  songs: SunoClip[];
  songInteractionHistory: Record<string, SongInteractionPoint[]>;
  onAnalyzeSong: (song: SunoClip) => void; // New prop for triggering modal
  activeTableFilters: { type: string; value: string } | null; // New prop for filtering
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
  if (plays === 0) return null; // Avoid division by zero; can't calculate rate if no plays
  return parseFloat(((upvotes / plays) * 100).toFixed(1));
};

const calculateCommentRate = (plays: number, comments: number): number | null => {
    if (plays === 0) return null;
    return parseFloat(((comments / plays) * 100).toFixed(2)); // Higher precision for potentially smaller numbers
};

const calculatePerDayMetric = (value: number, createdAt: string): number | null => {
    const createdDate = new Date(createdAt);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - createdDate.getTime());
    const diffDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24))); // Ensure at least 1 day to avoid division by zero
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
          // This is a basic check. Genre derivation might be more complex in the charts.
          // Assuming genre filter value is a simple string matching a part of the tags.
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

      if (aSortValue < bSortValue) {
        return sortDirection === 'asc' ? -1 : 1;
      }
      if (aSortValue > bSortValue) {
        return sortDirection === 'asc' ? 1 : -1;
      }
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

  const thClasses = "px-3 py-2.5 text-left text-xs font-medium text-gray-700 dark:text-green-300 uppercase tracking-wider cursor-pointer select-none hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors";

  if (songs.length === 0) {
    return <p className="text-center text-gray-500 dark:text-gray-400 py-4">No songs available to display in the table.</p>;
  }

  const getActiveFilterText = () => {
    if (!activeTableFilters) return null;
    let typeLabel = activeTableFilters.type.replace(/([A-Z])/g, ' $1'); // Add space before caps
    typeLabel = typeLabel.charAt(0).toUpperCase() + typeLabel.slice(1); // Capitalize first letter
    return `Filtered by: ${typeLabel} = ${activeTableFilters.value}`;
  };


  return (
    <div className="glass-card p-6 border-white/5 bg-white/5 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 blur-3xl pointer-events-none"></div>
      
      <div className="mb-8 flex flex-col sm:flex-row gap-6 items-center">
        <div className="relative flex-grow group w-full">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg className="h-3 w-3 text-gray-500 group-hover:text-green-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            placeholder="Search neural signals by title or handle..."
            className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/5 rounded-2xl placeholder-gray-600 text-[10px] font-black uppercase tracking-widest text-white focus:outline-none focus:border-green-500/30 focus:ring-1 focus:ring-green-500/20 transition-all"
            aria-label="Filter songs table"
          />
        </div>
        {activeTableFilters && (
          <div className="flex items-center gap-3 px-4 py-2 bg-yellow-500/5 border border-yellow-500/20 rounded-xl animate-in fade-in slide-in-from-right-4">
             <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse"></div>
             <span className="text-[8px] font-black uppercase tracking-[0.2em] text-yellow-500/80">
                Active Buffer: {getActiveFilterText()}
             </span>
          </div>
        )}
      </div>

      <div className="overflow-hidden rounded-3xl border border-white/5 bg-white/2">
        <div className="max-h-[70vh] overflow-y-auto custom-scrollbar"> 
          <table className="min-w-full divide-y divide-white/5 border-collapse">
            <thead className="sticky top-0 z-20 bg-[#0a0a0a] backdrop-blur-md"> 
              <tr>
                <th className="px-6 py-5 text-left text-[8px] font-black text-gray-500 uppercase tracking-[0.3em] w-16" scope="col">Node</th>
                {[
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
                  { id: 'commentsDelta', label: 'Echo Δ' }
                ].map((col) => (
                  <th 
                    key={col.id}
                    className="px-4 py-5 text-left text-[8px] font-black text-gray-500 uppercase tracking-[0.2em] cursor-pointer hover:bg-white/5 transition-colors whitespace-nowrap" 
                    scope="col" 
                    onClick={() => handleSort(col.id as SortableColumn)} 
                    aria-sort={sortColumn === col.id ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
                  >
                    <div className="flex items-center gap-2 group/header">
                      <span className={sortColumn === col.id ? 'text-green-500' : 'group-hover/header:text-gray-300'}>{col.label}</span>
                      <SortArrow column={col.id as SortableColumn} />
                    </div>
                  </th>
                ))}
                <th className="px-6 py-5 text-right text-[8px] font-black text-gray-500 uppercase tracking-[0.3em] w-24" scope="col">Ops</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredAndSortedSongs.map((song) => (
                <tr key={song.id} className="group hover:bg-white/5 transition-all duration-300">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <a href={song.suno_song_url || `https://suno.com/song/${song.id}`} target="_blank" rel="noopener noreferrer" className="block relative h-12 w-12 group/thumb">
                      <div className="absolute inset-0 bg-green-500/20 rounded-xl blur-sm opacity-0 group-hover/thumb:opacity-100 transition-opacity"></div>
                      <img 
                        src={song.image_url || FALLBACK_IMAGE_DATA_URI} 
                        alt={song.title} 
                        className="h-12 w-12 object-cover rounded-xl border border-white/10 shadow-lg relative z-10 grayscale-[0.5] group-hover:grayscale-0 transition-all" 
                        onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_IMAGE_DATA_URI; }}/>
                    </a>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex flex-col max-w-xs">
                      <a href={song.suno_song_url || `https://suno.com/song/${song.id}`} target="_blank" rel="noopener noreferrer" className="text-[11px] font-black text-white tracking-widest uppercase truncate hover:text-green-500 transition-colors" title={song.title}>
                        {song.title}
                      </a>
                      <span className="text-[8px] font-black uppercase tracking-[0.2em] text-gray-500 truncate" title={song.display_name}>ID: {song.handle}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-[10px] font-black text-gray-300 tracking-widest text-right">{song.upvote_count.toLocaleString()}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-[10px] font-black text-gray-300 tracking-widest text-right">{song.play_count.toLocaleString()}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-[10px] font-black text-gray-300 tracking-widest text-right">{song.comment_count.toLocaleString()}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-[9px] font-black text-gray-500 uppercase tracking-widest">{new Date(song.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-[10px] font-black text-gray-400 tracking-widest text-right">
                    {song.metadata?.duration ? `${Math.floor(song.metadata.duration / 60)}:${String(Math.floor(song.metadata.duration % 60)).padStart(2, '0')}` : '---'}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-[10px] font-black text-green-500/80 tracking-widest text-right">{song.upvoteRate !== null ? `${song.upvoteRate.toFixed(1)}%` : '---'}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-[10px] font-black text-green-500/60 tracking-widest text-right">{song.commentRate !== null ? `${song.commentRate.toFixed(2)}%` : '---'}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-[10px] font-black text-gray-400 tracking-widest text-right">{song.playsPerDay !== null ? song.playsPerDay.toFixed(1) : '---'}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-[10px] font-black text-gray-400 tracking-widest text-right">{song.upvotesPerDay !== null ? song.upvotesPerDay.toFixed(1) : '---'}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-[10px] font-black text-gray-400 tracking-widest text-right">{song.commentsPerDay !== null ? song.commentsPerDay.toFixed(1) : '---'}</td>
                  <td className={`px-4 py-4 whitespace-nowrap text-[10px] font-black tracking-widest text-right ${song.upvotesDelta && song.upvotesDelta > 0 ? 'text-green-500' : (song.upvotesDelta && song.upvotesDelta < 0 ? 'text-red-500' : 'text-gray-600')}`}>{formatDelta(song.upvotesDelta)}</td>
                  <td className={`px-4 py-4 whitespace-nowrap text-[10px] font-black tracking-widest text-right ${song.playsDelta && song.playsDelta > 0 ? 'text-green-500' : (song.playsDelta && song.playsDelta < 0 ? 'text-red-500' : 'text-gray-600')}`}>{formatDelta(song.playsDelta)}</td>
                  <td className={`px-4 py-4 whitespace-nowrap text-[10px] font-black tracking-widest text-right ${song.commentsDelta && song.commentsDelta > 0 ? 'text-green-500' : (song.commentsDelta && song.commentsDelta < 0 ? 'text-red-500' : 'text-gray-600')}`}>{formatDelta(song.commentsDelta)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <Button 
                      onClick={() => onAnalyzeSong(song)} 
                      variant="ghost" 
                      size="xs" 
                      className="font-black uppercase tracking-widest text-[8px] py-2 px-4 border-white/5 hover:bg-green-500/10 hover:text-green-400 hover:border-green-500/20 shadow-xl"
                    >
                      Inspect
                    </Button>
                  </td>
                </tr>
              ))}
              {filteredAndSortedSongs.length === 0 && (
                <tr>
                  <td colSpan={16} className="px-3 py-4 text-center text-sm text-gray-500 dark:text-gray-400"> {/* Colspan updated */}
                    {activeTableFilters ? `No songs match the current filter: ${getActiveFilterText()}` : "No songs match your filter criteria."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {filteredAndSortedSongs.length > 20 && (
        <p className="text-[8px] font-black uppercase tracking-[0.4em] text-gray-600 text-center mt-6 animate-pulse">
           Buffer Overflow: Signal integrity maintained for {filteredAndSortedSongs.length} entries.
        </p>
      )}
    </div>
  );
};

export default DetailedSongPerformanceTable;
