import React from 'react';
import { SunoClip, PlaybackStatus } from '@/types';
import { SortCriteriaHook } from '@/hooks/suno/useSunoQueue';
import Button from '@/components/common/Button';
import Select from '@/components/common/Select';
import { 
  ChevronDownIcon, 
  PlayCountIcon, 
  UpvoteCountIcon, 
  CommentCountIcon, 
  PlaylistRemoveIcon, 
  CsvExportIcon,
  TrashIcon
} from '@/components/Icons';

interface QueueManagerProps {
  uiMode: 'classic' | 'architect';
  queue: SunoClip[];
  currentSong: SunoClip | null;
  playbackStatus: PlaybackStatus;
  isShuffle: boolean;
  sortCriteria: SortCriteriaHook;
  setSortCriteria: (criteria: SortCriteriaHook) => void;
  filterQuery: string;
  setFilterQuery: (query: string) => void;
  playlistHeight: string;
  playlistContainerRef: React.RefObject<HTMLDivElement | null>;
  handleMouseDownResize: (e: React.MouseEvent<HTMLDivElement>) => void;
  playSong: (song: SunoClip) => void;
  removeSongFromQueue: (songId: string) => void;
  handleExportPlaylistCsv: () => void;
  onDragStart: (e: React.DragEvent<HTMLLIElement>, songId: string) => void;
  onDragOver: (e: React.DragEvent<HTMLLIElement>, targetSongId: string) => void;
  onDragLeave: (e: React.DragEvent<HTMLLIElement>) => void;
  onDrop: (e: React.DragEvent<HTMLLIElement>, dropTargetSongId: string) => void;
  onDragEnd: (e: React.DragEvent<HTMLLIElement>) => void;
  draggedItemId: string | null;
  dropIndicator: { targetId: string; position: 'before' | 'after' } | null;
  showPlaylist: boolean;
  setShowPlaylist: (show: boolean) => void;
  FALLBACK_IMAGE_DATA_URI: string;
}

export const QueueManager: React.FC<QueueManagerProps> = ({
  uiMode, queue, currentSong, playbackStatus, isShuffle, sortCriteria, setSortCriteria,
  filterQuery, setFilterQuery, playlistHeight, playlistContainerRef, handleMouseDownResize,
  playSong, removeSongFromQueue, handleExportPlaylistCsv,
  onDragStart, onDragOver, onDragLeave, onDrop, onDragEnd, draggedItemId, dropIndicator,
  showPlaylist, setShowPlaylist, FALLBACK_IMAGE_DATA_URI
}) => {
  if (uiMode === 'classic') {
    return (
      <>
        <div className="mt-4 flex flex-col sm:flex-row justify-between items-start gap-3">
          <button onClick={() => setShowPlaylist(!showPlaylist)} className="w-full sm:w-auto text-left text-md font-bold text-green-600 dark:text-green-600 hover:text-green-500 py-2 px-2 flex items-center uppercase tracking-widest" aria-expanded={showPlaylist} aria-controls="playlist-panel">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={`w-4 h-4 mr-2 transform transition-transform ${showPlaylist ? 'rotate-180' : ''}`}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
            Playlist ({queue.length} songs)
          </button>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <select 
              value={sortCriteria} 
              onChange={(e) => setSortCriteria(e.target.value as SortCriteriaHook)} 
              className="px-3 py-1.5 text-xs bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-green-600 rounded-md text-gray-900 dark:text-white focus:ring-green-600 focus:border-green-600 flex-grow sm:flex-grow-0 font-bold"
              aria-label="Sort playlist by"
            >
              <option value="default">Default Order</option>
              <option value="play_count">Most Plays</option>
              <option value="upvote_count">Most Upvotes</option>
              <option value="created_at">Newest First</option>
              <option value="title">Title (A-Z)</option>
            </select>
            <input 
              type="text" 
              value={filterQuery} 
              onChange={(e) => setFilterQuery(e.target.value)} 
              placeholder="Filter playlist..." 
              className="px-3 py-1.5 text-xs bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-green-600 rounded-md placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white focus:ring-green-600 focus:border-green-600 flex-grow sm:flex-grow-0 font-bold"
              aria-label="Filter playlist"
            />
            <button 
              onClick={handleExportPlaylistCsv} 
              title="Export current playlist view to CSV" 
              className="p-2 text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-bold border-2 border-indigo-700/30 rounded-md disabled:opacity-50 transition-colors uppercase tracking-widest"
              disabled={queue.length === 0}
            >
              <CsvExportIcon />
            </button>
          </div>
        </div>
        {showPlaylist && (
          <div ref={playlistContainerRef} id="playlist-panel" className="mt-2 border-2 border-gray-200 dark:border-green-600 rounded-lg bg-gray-50 dark:bg-gray-850 overflow-hidden relative shadow-inner" style={{ height: playlistHeight }}>
            <ul className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-200 dark:scrollbar-track-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {queue.map(song => (
                <li
                  key={song.id}
                  draggable={!isShuffle}
                  onDragStart={e => onDragStart(e, song.id)}
                  onDragOver={e => onDragOver(e, song.id)}
                  onDragLeave={onDragLeave}
                  onDrop={e => onDrop(e, song.id)}
                  onDragEnd={onDragEnd}
                  className={`p-3 flex items-center gap-4 transition-all relative 
                                      ${isShuffle ? 'cursor-not-allowed' : 'hover:bg-gray-200 dark:hover:bg-gray-700 cursor-grab active:cursor-grabbing border-l-4 border-transparent hover:border-green-600'}
                                      ${currentSong?.id === song.id ? 'bg-green-100 dark:bg-green-700 bg-opacity-40 border-l-4 border-green-600' : ''} 
                                      ${dropIndicator?.targetId === song.id ? (dropIndicator.position === 'before' ? 'border-t-4 border-indigo-500' : 'border-b-4 border-indigo-500') : ''} 
                                      ${draggedItemId === song.id ? 'opacity-50' : ''}`
                  }
                  title={isShuffle ? "Drag & drop reordering is disabled in Shuffle mode." : "Drag to reorder playlist."}
                >
                  <img
                    src={song.image_url || FALLBACK_IMAGE_DATA_URI}
                    alt={song.title}
                    className="w-10 h-10 rounded object-cover flex-shrink-0 border-2 border-gray-300 dark:border-gray-600"
                    onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_IMAGE_DATA_URI; }}
                  />
                  <div className="flex-1 min-w-0" onClick={() => playSong(song)}> 
                    <p className="text-sm text-gray-900 dark:text-white truncate font-bold uppercase tracking-tight" title={song.title}>{song.title}</p> 
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate font-semibold" title={song.display_name || `@${song.handle}`}>{song.display_name || `@${song.handle}`}</p> 
                  </div>
                  <div className="text-xs text-gray-700 dark:text-gray-400 font-bold flex-shrink-0 flex flex-col sm:flex-row items-end sm:items-center gap-x-2 gap-y-0.5"> 
                    <span title="Plays" className="flex items-center gap-1"><PlayCountIcon className="w-3.5 h-3.5" /> {song.play_count?.toLocaleString() || 'N/A'}</span> 
                    <span title="Upvotes" className="flex items-center gap-1"><UpvoteCountIcon className="w-3.5 h-3.5" /> {song.upvote_count?.toLocaleString() || 'N/A'}</span> 
                  </div>
                  <button onClick={() => removeSongFromQueue(song.id)} className="ml-2 p-2 bg-white dark:bg-gray-800 border-2 border-red-200 dark:border-red-900 hover:bg-red-600 hover:text-white hover:border-red-700 rounded-lg text-red-600 dark:text-red-400 transition-all focus:outline-none focus:ring-2 focus:ring-red-600" aria-label={`Remove ${song.title} from playlist`}> 
                    <PlaylistRemoveIcon /> 
                  </button>
                </li>
              ))}
              {queue.length === 0 && (<li className="p-3 text-center text-gray-500 dark:text-gray-500 text-sm font-bold italic uppercase tracking-widest">Queue is empty</li>)}
            </ul>
            <div onMouseDown={handleMouseDownResize} className="absolute bottom-0 left-0 w-full h-2.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 cursor-ns-resize flex items-center justify-center" title="Resize Playlist">
              <div className="w-10 h-1 bg-gray-400 dark:bg-gray-500 rounded-full"></div>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <>
      <div className="mt-8 flex flex-col sm:flex-row justify-between items-start gap-4">
        <Button onClick={() => setShowPlaylist(!showPlaylist)} variant="ghost" className="w-full sm:w-auto text-left text-xs font-black uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 dark:hover:text-emerald-300 py-3 px-4 border-white/10" aria-expanded={showPlaylist} aria-controls="playlist-panel">
          <ChevronDownIcon className={`w-4 h-4 mr-2 transform transition-transform ${showPlaylist ? 'rotate-180' : ''}`} /> 
          Queue List ({queue.length}) 
        </Button>
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto overflow-visible">
          <Select 
            id="sortCriteria"
            options={[
              { value: 'default', label: 'Default Order' },
              { value: 'play_count', label: 'Most Plays' },
              { value: 'upvote_count', label: 'Most Upvotes' },
              { value: 'created_at', label: 'Newest First' },
              { value: 'title', label: 'Title (A-Z)' }
            ]}
            value={sortCriteria}
            onChange={(val) => setSortCriteria(val as SortCriteriaHook)}
            containerClassName="flex-grow sm:min-w-[160px]"
          />
          <input 
            type="text" 
            value={filterQuery} 
            onChange={(e) => setFilterQuery(e.target.value)} 
            placeholder="Filter list..." 
            className="px-4 py-2.5 bg-white/10 dark:bg-black/20 border border-white/20 rounded-xl placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 text-gray-900 dark:text-white sm:text-sm font-bold flex-grow transition-all" 
            aria-label="Filter playlist" 
          />
          <Button 
            onClick={handleExportPlaylistCsv} 
            title="Export current list to CSV" 
            variant="ghost"
            size="sm"
            className="p-3 border-white/10 hover:bg-white/10 rounded-xl shadow-none"
            disabled={queue.length === 0}
            startIcon={<CsvExportIcon className="w-4 h-4" />}
          />
        </div>
      </div>
      {showPlaylist && (
        <div ref={playlistContainerRef} id="playlist-panel" className="mt-4 glass-card border-white/10 overflow-hidden relative" style={{ height: playlistHeight }}>
          <ul className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 hover:scrollbar-thumb-white/20 divide-y divide-white/5">
            {queue.map(song => (
              <li
                key={song.id}
                draggable={!isShuffle}
                onDragStart={e => onDragStart(e, song.id)}
                onDragOver={e => onDragOver(e, song.id)}
                onDragLeave={onDragLeave}
                onDrop={e => onDrop(e, song.id)}
                onDragEnd={onDragEnd}
                className={`p-4 flex items-center gap-4 transition-all duration-300 relative group
                                    ${isShuffle ? 'cursor-not-allowed opacity-80' : 'hover:bg-white/10 cursor-grab active:cursor-grabbing'}
                                    ${currentSong?.id === song.id ? 'bg-emerald-500/10 dark:bg-emerald-500/5' : ''} 
                                    ${dropIndicator?.targetId === song.id ? (dropIndicator.position === 'before' ? 'border-t-4 border-emerald-500/50' : 'border-b-4 border-emerald-500/50') : ''} 
                                    ${draggedItemId === song.id ? 'opacity-30' : ''}`
                }
              >
                <div className="relative flex-shrink-0">
                  <img
                    src={song.image_url || FALLBACK_IMAGE_DATA_URI}
                    alt={song.title}
                    className={`w-12 h-12 rounded-xl object-cover border border-white/10 transition-all duration-500 ${currentSong?.id === song.id ? 'border-emerald-500/50 scale-110 shadow-lg' : ''}`}
                    onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_IMAGE_DATA_URI; }}
                  />
                  {currentSong?.id === song.id && playbackStatus === PlaybackStatus.Playing && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white dark:border-black animate-pulse"></div>
                  )}
                </div>
                <div className="flex-1 min-w-0 cursor-pointer" onClick={() => playSong(song)}> 
                  <p className={`text-sm truncate font-black uppercase tracking-tight transition-colors ${currentSong?.id === song.id ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-900 dark:text-white group-hover:text-emerald-500'}`} title={song.title}>{song.title}</p> 
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-600 truncate mt-0.5" title={song.display_name || `@${song.handle}`}>{song.display_name || `@${song.handle}`}</p> 
                </div>
                <div className="hidden sm:flex text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-600 flex-shrink-0 items-center gap-4"> 
                   <span className="flex items-center gap-1"><PlayCountIcon className="w-3 h-3" /> {song.play_count?.toLocaleString() || '0'}</span> 
                   <span className="flex items-center gap-1"><UpvoteCountIcon className="w-3 h-3" /> {song.upvote_count?.toLocaleString() || '0'}</span> 
                </div>
                <Button onClick={() => removeSongFromQueue(song.id)} variant="ghost" size="xs" className="ml-4 p-3 hover:bg-red-500/20 rounded-xl text-red-500 dark:text-red-400 transition-all opacity-0 group-hover:opacity-100 border-none shadow-none" aria-label={`Remove ${song.title}`} startIcon={<TrashIcon className="w-4 h-4" />} />
              </li>
            ))}
            {queue.length === 0 && (<li className="p-12 text-center text-gray-500 dark:text-gray-600 text-xs font-black uppercase tracking-[0.2em] italic">Queue is empty</li>)}
          </ul>
          <div onMouseDown={handleMouseDownResize} className="absolute bottom-0 left-0 w-full h-3 bg-white/5 dark:bg-black/20 hover:bg-emerald-500/10 cursor-ns-resize flex items-center justify-center transition-colors"><div className="w-12 h-1 bg-white/20 rounded-full"></div></div>
        </div>
      )}
    </>
  );
};
