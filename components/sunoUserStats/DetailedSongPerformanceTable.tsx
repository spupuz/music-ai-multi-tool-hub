

import React, { useState, useMemo, useCallback } from 'react';
import type { SunoClip } from '../../types';
import type { SongInteractionPoint } from '../../types/sunoUserStatsTypes';

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
    <div className="bg-gray-100 dark:bg-gray-850 p-3 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
      <div className="mb-4 flex flex-col sm:flex-row gap-2 items-center">
        <input
          type="text"
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          placeholder="Filter by Title or Artist within current view..."
          className="flex-grow w-full sm:w-auto px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white focus:ring-green-500 focus:border-green-500 text-sm"
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
                      <a href={song.suno_song_url || `https://suno.com/song/${song.id}`} target="_blank" rel="noopener noreferrer" className="hover:text-green-600 dark:hover:text-green-400 hover:underline">
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
                  <td className={`px-3 py-2 whitespace-nowrap text-sm text-right ${song.upvotesDelta && song.upvotesDelta > 0 ? 'text-green-600 dark:text-green-400' : (song.upvotesDelta && song.upvotesDelta < 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-400')}`}>{formatDelta(song.upvotesDelta)}</td>
                  <td className={`px-3 py-2 whitespace-nowrap text-sm text-right ${song.playsDelta && song.playsDelta > 0 ? 'text-green-600 dark:text-green-400' : (song.playsDelta && song.playsDelta < 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-400')}`}>{formatDelta(song.playsDelta)}</td>
                  <td className={`px-3 py-2 whitespace-nowrap text-sm text-right ${song.commentsDelta && song.commentsDelta > 0 ? 'text-green-600 dark:text-green-400' : (song.commentsDelta && song.commentsDelta < 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-400')}`}>{formatDelta(song.commentsDelta)}</td>
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
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">Displaying all {filteredAndSortedSongs.length} results. Scroll within the table to see more.</p>
      )}
    </div>
  );
};

export default DetailedSongPerformanceTable;
