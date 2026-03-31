import React, { useState, useEffect, useCallback, ChangeEvent, useRef } from 'react';
import { fetchSunoSongsByUsername, fetchSunoPlaylistById } from '@/services/sunoService';
import type { SunoClip, SunoProfileDetail, SunoPlaylistDetail, SavedCustomPlaylist, PlaylistAnalysis } from '@/types';
import { PlaybackStatus } from '@/types';
import Spinner from '@/components/Spinner';
import AudioVisualizer from '@/components/AudioVisualizer/AudioVisualizer';
import type { ToolProps } from '@/Layout';
import { useSunoAudioPlayer } from '@/hooks/useSunoAudioPlayer';
import { SortCriteriaHook } from '@/hooks/suno/useSunoQueue';
import PlaylistCreationDateChart from '@/components/sunoUserStats/charts/PlaylistCreationDateChart';
import Button from '@/components/common/Button';
import Select from '@/components/common/Select';

import { LOGO_SVG_STRING, FALLBACK_IMAGE_DATA_URI, TOOL_CATEGORY_UI, LOCAL_STORAGE_PLAYLIST_HEIGHT_KEY, DEFAULT_PLAYLIST_HEIGHT_PX, MIN_PLAYLIST_HEIGHT_PX, MAX_PLAYLIST_HEIGHT_PX, MIN_SNIPPET_DURATION_SECONDS, MAX_SNIPPET_DURATION_SECONDS, LOCAL_CLICK_CONFIRM_NEEDED, LOCAL_CLICK_TIMEOUT_MS, EQ_PRESETS_FOR_UI } from '@/components/SunoMusicPlayer/constants';
import { PlayCountIcon, UpvoteCountIcon, CommentCountIcon, ClipsIcon, FollowersIcon, TotalPlaysIcon, TotalUpvotesIcon, TotalCommentsProfileIcon, PlaylistIcon, CsvExportIcon, FileTxtIcon, FileCsvIcon, TrashIcon, SaveIcon, LoadIcon, RefreshIcon, PlaylistRemoveIcon, LyricsPlayerIcon, InfoPlayerIcon, SharePlayerIcon, KeyboardIcon, AppendIcon, ChevronDownIcon, PlayIcon, PauseIcon, SkipBackIcon, SkipForwardIcon, ShuffleIcon } from '@/components/Icons';
import KeyboardShortcutsModal from '@/components/SunoMusicPlayer/KeyboardShortcutsModal';
import { ProfileInfoBox, PlaylistInfoBox } from '@/components/SunoMusicPlayer/InfoBoxes';


const SunoMusicPlayerTool: React.FC<ToolProps> = ({ trackLocalEvent }) => {
  const {
    identifierInput, setIdentifierInput,
    currentIdentifier, currentIdentifierType,
    isFetchingOrLoading, fetchProgress, uiError,
    profileDetail, playlistDetail, playlistAnalysis,
    originalSongsList,
    sortCriteria, setSortCriteria,
    filterQuery, setFilterQuery,
    lastFetchedTimestamp, mainButtonText,
    showDataManagement,
    clearSongInfoCacheClickCount, handleClearSongInfoCache, getClearSongInfoCacheButtonText,
    clearProfileCacheClickCount, handleClearProfileCache, getClearProfileCacheButtonText,
    clearAllHubDataClickCount, handleClearAllHubDataFromPlayer, getClearAllHubDataButtonText,
    dataManagementStatus,
    playerState, analyserNodes, playSong, togglePlayPause, nextTrack, previousTrack,
    seek, setVolume, setEqGain, applyEqPreset, toggleShuffle, toggleSnippetMode, formatTime,
    setSnippetDurationConfig,
    isLoading: isPlayerLoading, error: playerError,
    handleMainButtonClick,
    handleAppendSongs,
    parseInput,
    handleReorderQueue,
    handleExportPlaylistCsv,
    savedCustomPlaylists, handleExportCurrentPlaylistToFile, handleImportPlaylistFromTxtFile, handleImportPlaylistFromCsvFile,
    handleSaveCurrentPlaylistLocally, handleUpdateSavedPlaylistLocally, handleAppendToSavedPlaylistLocally, handleLoadSavedPlaylistLocally, handleDeleteSavedPlaylistLocally,
    handleClearAllSavedPlaylists, getClearAllSavedPlaylistsButtonText, clearAllSavedPlaylistsClickCount,
    removeSongFromQueue,
    handleClearQueue, getClearQueueButtonText,
  } = useSunoAudioPlayer({ trackLocalEvent });

  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [dropIndicator, setDropIndicator] = useState<{ targetId: string; position: 'before' | 'after' } | null>(null);
  const [showEq, setShowEq] = useState(false);
  const [showPlaylist, setShowPlaylist] = useState(true);
  const [showAnalysis, setShowAnalysis] = useState(true);
  const [showPlaylistManagement, setShowPlaylistManagement] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const fileInputTxtRef = useRef<HTMLInputElement>(null);
  const fileInputCsvRef = useRef<HTMLInputElement>(null);

  const [playlistHeight, setPlaylistHeight] = useState<string>(`${DEFAULT_PLAYLIST_HEIGHT_PX}px`);
  const [isResizing, setIsResizing] = useState<boolean>(false);
  const initialDragDataRef = useRef<{ startY: number; initialHeight: number } | null>(null);
  const playlistContainerRef = useRef<HTMLDivElement | null>(null);

  const [showLyricsModal, setShowLyricsModal] = useState(false);
  const [lyricsToDisplay, setLyricsToDisplay] = useState('');
  const [lyricsSourceField, setLyricsSourceField] = useState<'prompt' | 'gpt_description_prompt' | null>(null);
  const [showMetadataModal, setShowMetadataModal] = useState(false);
  const [copyShareLinkStatus, setCopyShareLinkStatus] = useState('');
  const [copyLyricsStatus, setCopyLyricsStatus] = useState('');
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);

  // New state for 3-click confirm
  const [updateConfirm, setUpdateConfirm] = useState<{ id: string | null; count: number }>({ id: null, count: 0 });
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string | null; count: number }>({ id: null, count: 0 });
  const [loadConfirm, setLoadConfirm] = useState<{ id: string | null; count: number }>({ id: null, count: 0 });
  const [appendConfirm, setAppendConfirm] = useState<{ id: string | null; count: number }>({ id: null, count: 0 });
  const updateConfirmTimeoutRef = useRef<number | null>(null);
  const deleteConfirmTimeoutRef = useRef<number | null>(null);
  const loadConfirmTimeoutRef = useRef<number | null>(null);
  const appendConfirmTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (updateConfirmTimeoutRef.current) clearTimeout(updateConfirmTimeoutRef.current);
      if (deleteConfirmTimeoutRef.current) clearTimeout(deleteConfirmTimeoutRef.current);
      if (loadConfirmTimeoutRef.current) clearTimeout(loadConfirmTimeoutRef.current);
      if (appendConfirmTimeoutRef.current) clearTimeout(appendConfirmTimeoutRef.current);
    };
  }, []);

  const resetAllConfirms = () => {
    setUpdateConfirm({ id: null, count: 0 });
    setDeleteConfirm({ id: null, count: 0 });
    setLoadConfirm({ id: null, count: 0 });
    setAppendConfirm({ id: null, count: 0 });
    if (updateConfirmTimeoutRef.current) clearTimeout(updateConfirmTimeoutRef.current);
    if (deleteConfirmTimeoutRef.current) clearTimeout(deleteConfirmTimeoutRef.current);
    if (loadConfirmTimeoutRef.current) clearTimeout(loadConfirmTimeoutRef.current);
    if (appendConfirmTimeoutRef.current) clearTimeout(appendConfirmTimeoutRef.current);
  };

  const handleLoadClick = (playlistId: string) => {
    if (loadConfirm.id !== playlistId) resetAllConfirms();

    if (playerState.queue.length === 0) {
      handleLoadSavedPlaylistLocally(playlistId);
      return;
    }

    if (loadConfirmTimeoutRef.current) clearTimeout(loadConfirmTimeoutRef.current);
    if (loadConfirm.id === playlistId) {
      const newCount = loadConfirm.count + 1;
      if (newCount >= LOCAL_CLICK_CONFIRM_NEEDED) {
        handleLoadSavedPlaylistLocally(playlistId);
        setLoadConfirm({ id: null, count: 0 });
      } else {
        setLoadConfirm({ id: playlistId, count: newCount });
        loadConfirmTimeoutRef.current = window.setTimeout(() => setLoadConfirm({ id: null, count: 0 }), LOCAL_CLICK_TIMEOUT_MS);
      }
    } else {
      setLoadConfirm({ id: playlistId, count: 1 });
      loadConfirmTimeoutRef.current = window.setTimeout(() => setLoadConfirm({ id: null, count: 0 }), LOCAL_CLICK_TIMEOUT_MS);
    }
  };

  const handleAppendClick = (playlistId: string) => {
    if (appendConfirm.id !== playlistId) resetAllConfirms();

    if (appendConfirmTimeoutRef.current) clearTimeout(appendConfirmTimeoutRef.current);
    if (appendConfirm.id === playlistId) {
      const newCount = appendConfirm.count + 1;
      if (newCount >= LOCAL_CLICK_CONFIRM_NEEDED) {
        handleAppendToSavedPlaylistLocally(playlistId, identifierInput);
        setAppendConfirm({ id: null, count: 0 });
      } else {
        setAppendConfirm({ id: playlistId, count: newCount });
        appendConfirmTimeoutRef.current = window.setTimeout(() => setAppendConfirm({ id: null, count: 0 }), LOCAL_CLICK_TIMEOUT_MS);
      }
    } else {
      setAppendConfirm({ id: playlistId, count: 1 });
      appendConfirmTimeoutRef.current = window.setTimeout(() => setAppendConfirm({ id: null, count: 0 }), LOCAL_CLICK_TIMEOUT_MS);
    }
  };

  const handleUpdateClick = (playlistId: string) => {
    if (updateConfirm.id !== playlistId) resetAllConfirms();

    if (updateConfirmTimeoutRef.current) clearTimeout(updateConfirmTimeoutRef.current);
    if (updateConfirm.id === playlistId) {
      const newCount = updateConfirm.count + 1;
      if (newCount >= LOCAL_CLICK_CONFIRM_NEEDED) {
        handleUpdateSavedPlaylistLocally(playlistId);
        setUpdateConfirm({ id: null, count: 0 });
      } else {
        setUpdateConfirm({ id: playlistId, count: newCount });
        updateConfirmTimeoutRef.current = window.setTimeout(() => setUpdateConfirm({ id: null, count: 0 }), LOCAL_CLICK_TIMEOUT_MS);
      }
    } else {
      setUpdateConfirm({ id: playlistId, count: 1 });
      updateConfirmTimeoutRef.current = window.setTimeout(() => setUpdateConfirm({ id: null, count: 0 }), LOCAL_CLICK_TIMEOUT_MS);
    }
  };

  const handleDeleteClick = (playlistId: string) => {
    if (deleteConfirm.id !== playlistId) resetAllConfirms();

    if (deleteConfirmTimeoutRef.current) clearTimeout(deleteConfirmTimeoutRef.current);
    if (deleteConfirm.id === playlistId) {
      const newCount = deleteConfirm.count + 1;
      if (newCount >= LOCAL_CLICK_CONFIRM_NEEDED) {
        handleDeleteSavedPlaylistLocally(playlistId);
        setDeleteConfirm({ id: null, count: 0 });
      } else {
        setDeleteConfirm({ id: playlistId, count: newCount });
        deleteConfirmTimeoutRef.current = window.setTimeout(() => setDeleteConfirm({ id: null, count: 0 }), LOCAL_CLICK_TIMEOUT_MS);
      }
    } else {
      setDeleteConfirm({ id: playlistId, count: 1 });
      deleteConfirmTimeoutRef.current = window.setTimeout(() => setDeleteConfirm({ id: null, count: 0 }), LOCAL_CLICK_TIMEOUT_MS);
    }
  };


  useEffect(() => {
    const savedHeight = localStorage.getItem(LOCAL_STORAGE_PLAYLIST_HEIGHT_KEY);
    if (savedHeight) {
      const numericHeight = parseInt(savedHeight, 10);
      const currentMaxHeight = typeof window !== 'undefined' ? Math.max(300, window.innerHeight * 0.7) : MAX_PLAYLIST_HEIGHT_PX;
      if (!isNaN(numericHeight) && numericHeight >= MIN_PLAYLIST_HEIGHT_PX && numericHeight <= currentMaxHeight) {
        setPlaylistHeight(savedHeight);
      } else if (!isNaN(numericHeight) && numericHeight > currentMaxHeight) {
        setPlaylistHeight(`${currentMaxHeight}px`);
      }
    }
  }, []);

  const handleMouseDownResize = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (playlistContainerRef.current) {
      initialDragDataRef.current = {
        startY: e.clientY,
        initialHeight: playlistContainerRef.current.offsetHeight,
      };
      setIsResizing(true);
    }
  }, []);

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      if (!playlistContainerRef.current || !initialDragDataRef.current) return;

      const deltaY = e.clientY - initialDragDataRef.current.startY;
      let newHeight = initialDragDataRef.current.initialHeight + deltaY;
      newHeight = Math.max(MIN_PLAYLIST_HEIGHT_PX, Math.min(newHeight, MAX_PLAYLIST_HEIGHT_PX));
      setPlaylistHeight(`${newHeight}px`);
    };

    const handleUp = () => {
      setIsResizing(false);
      if (playlistContainerRef.current) {
        localStorage.setItem(LOCAL_STORAGE_PLAYLIST_HEIGHT_KEY, playlistContainerRef.current.style.height);
      }
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMove);
      document.addEventListener('mouseup', handleUp);
      window.addEventListener('blur', handleUp);
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'ns-resize';
    }

    return () => {
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleUp);
      window.removeEventListener('blur', handleUp);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };
  }, [isResizing]);


  const handleIdentifierInputChange = (event: ChangeEvent<HTMLTextAreaElement>) => setIdentifierInput(event.target.value);
  const handleIdentifierInputKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => { if (event.key === 'Enter' && !event.shiftKey && !isFetchingOrLoading && identifierInput.trim()) { event.preventDefault(); handleMainButtonClick(); } };
  const handleVolumeChangeSlider = (event: ChangeEvent<HTMLInputElement>) => setVolume(parseFloat(event.target.value));
  const handleSeekSlider = (event: ChangeEvent<HTMLInputElement>) => seek(parseFloat(event.target.value));

  const handleShowLyrics = () => {
    if (playerState.currentSong?.metadata) {
      let lyricsText = playerState.currentSong.metadata.prompt || '';
      let source: 'prompt' | 'gpt_description_prompt' | null = 'prompt';

      const isPromptLikelyLyrics = lyricsText.includes('\n') || lyricsText.length > 50 || !(/^\[.*\](\s*\[.*\])*$/.test(lyricsText.trim()));

      if (!isPromptLikelyLyrics || !lyricsText.trim()) {
        lyricsText = playerState.currentSong.metadata.gpt_description_prompt || '';
        source = 'gpt_description_prompt';
      }

      if (!lyricsText.trim()) {
        lyricsText = "Lyrics not available for this song.";
        source = null;
      }

      setLyricsToDisplay(lyricsText);
      setLyricsSourceField(source);
      setShowLyricsModal(true);
      trackLocalEvent(TOOL_CATEGORY_UI, 'lyricsModalOpened');
    }
  };

  const handleCopyLyrics = () => {
    if (lyricsToDisplay && lyricsToDisplay !== "Lyrics not available for this song.") {
      navigator.clipboard.writeText(lyricsToDisplay)
        .then(() => { setCopyLyricsStatus("Lyrics Copied!"); setTimeout(() => setCopyLyricsStatus(""), 2000); })
        .catch(() => { setCopyLyricsStatus("Copy Failed!"); setTimeout(() => setCopyLyricsStatus(""), 2000); });
    }
  };

  const handleShowMetadata = () => {
    if (playerState.currentSong) {
      setShowMetadataModal(true);
      trackLocalEvent(TOOL_CATEGORY_UI, 'metadataModalOpened');
    }
  };

  const handleShareSong = () => {
    if (playerState.currentSong?.suno_song_url) {
      const shuffleStatus = playerState.isShuffle ? "Shuffle On" : "Shuffle Off";
      const snippetStatus = playerState.isSnippetMode ? `Snippet Mode (${playerState.snippetDurationConfig}s)` : "Snippet Mode Off";
      const siteLink = "https://tools.checktrend.info";
      const shareMessage = `Listening to "${playerState.currentSong.title}" by ${playerState.currentSong.display_name || `@${playerState.currentSong.handle}`} via Suno Music Shuffler (${siteLink}) (Mode: ${shuffleStatus}, ${snippetStatus}): ${playerState.currentSong.suno_song_url}`;

      navigator.clipboard.writeText(shareMessage)
        .then(() => { setCopyShareLinkStatus("Link Copied!"); setTimeout(() => setCopyShareLinkStatus(""), 2000); })
        .catch(() => { setCopyShareLinkStatus("Copy Failed!"); setTimeout(() => setCopyShareLinkStatus(""), 2000); });
      trackLocalEvent(TOOL_CATEGORY_UI, 'songShared');
    }
  };

  const EQ_PRESETS_FOR_UI: Record<string, { label: string }> = { flat: { label: "Flat" }, bassBoost: { label: "Bass Boost" }, vocalClarity: { label: "Vocal Clarity" }, trebleBoost: { label: "Treble Boost" }, rock: { label: "Rock" }, electronic: { label: "Electronic" }, };
  const onDragStartHandler = (e: React.DragEvent<HTMLLIElement>, songId: string) => { if (playerState.isShuffle) return; e.dataTransfer.setData('text/plain', songId); e.dataTransfer.effectAllowed = 'move'; setDraggedItemId(songId); e.currentTarget.style.opacity = '0.5'; };
  const onDragOverHandler = (e: React.DragEvent<HTMLLIElement>, targetSongId: string) => { if (playerState.isShuffle || !draggedItemId || draggedItemId === targetSongId) return; e.preventDefault(); const rect = e.currentTarget.getBoundingClientRect(); const midpoint = rect.top + rect.height / 2; const position = e.clientY < midpoint ? 'before' : 'after'; if (!dropIndicator || dropIndicator.targetId !== targetSongId || dropIndicator.position !== position) setDropIndicator({ targetId: targetSongId, position }); };
  const onDragLeaveHandler = (e: React.DragEvent<HTMLLIElement>) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setDropIndicator(null); };
  const onDropHandler = (e: React.DragEvent<HTMLLIElement>, dropTargetSongId: string) => { if (playerState.isShuffle || !draggedItemId || !dropIndicator) return; e.preventDefault(); const draggedIdFromData = e.dataTransfer.getData('text/plain'); if (draggedIdFromData === draggedItemId && draggedItemId !== dropTargetSongId) handleReorderQueue(draggedItemId, dropIndicator.targetId, dropIndicator.position === 'before'); setDraggedItemId(null); setDropIndicator(null); e.currentTarget.style.opacity = '1'; };
  const onDragEndHandler = (e: React.DragEvent<HTMLLIElement>) => { setDraggedItemId(null); setDropIndicator(null); e.currentTarget.style.opacity = '1'; };

  return (
    <div className="w-full max-w-full glass-card p-2 sm:p-6 md:p-10 border-white/10 text-gray-900 dark:text-gray-200 transition-all duration-500 animate-fadeIn overflow-hidden">
      <header className="mb-2 md:mb-12 text-center pt-0 md:pt-4 px-4 animate-fadeIn">
        <h1 className="text-xl sm:text-4xl md:text-6xl font-black uppercase tracking-tighter text-emerald-600 dark:text-emerald-500 leading-none italic mb-1 md:mb-4">Music Shuffler</h1>
        <p className="mt-1 md:mt-4 text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.4em] text-gray-500 dark:text-gray-400 max-w-xl mx-auto opacity-70">
            Neural Audio Streamer • AI-generated musical landscapes
        </p>
      </header>
      <div className="mb-8 flex flex-col items-stretch gap-4">
        <textarea
          value={identifierInput}
          onChange={handleIdentifierInputChange}
          onKeyDown={handleIdentifierInputKeyDown}
          placeholder="Enter @username, playlist URL, or song URLs (one per line)..."
          className="flex-grow px-4 py-2 bg-white/10 dark:bg-black/20 border border-white/20 rounded-2xl shadow-inner placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-green-500/20 focus:border-green-500 text-sm sm:text-base font-bold resize-y min-h-[60px] transition-all h-20 md:h-auto"
          rows={3}
          aria-label="Suno Username, Playlist URL, or list of Song URLs"
        />
        <div className="flex flex-col sm:flex-row sm:items-stretch gap-2 md:gap-3">
          <Button 
            onClick={handleMainButtonClick} 
            disabled={isFetchingOrLoading || !identifierInput.trim()} 
            variant="primary"
            size="md"
            className="flex-grow sm:flex-grow-0 sm:min-w-[160px] font-black uppercase tracking-widest text-[8px] sm:text-sm h-10 md:h-auto py-2 sm:py-0 whitespace-nowrap"
            backgroundColor="#10b981"
            loading={isFetchingOrLoading && !fetchProgress.includes('Appending')}
            startIcon={<LoadIcon className="w-5 h-5"/>}
          >
            {isFetchingOrLoading && !fetchProgress.includes('Appending') ? 'Fetching' : mainButtonText}
          </Button>
          <Button 
            onClick={handleAppendSongs} 
            disabled={isFetchingOrLoading || !identifierInput.trim()} 
            variant="ghost"
            size="md"
            startIcon={<AppendIcon className="w-5 h-5" />}
            className="flex-grow sm:flex-grow-0 sm:min-w-[160px] font-black uppercase tracking-widest border-white/10 hover:bg-white/10 text-[8px] sm:text-sm h-10 md:h-auto py-2 sm:py-0"
            loading={isFetchingOrLoading && fetchProgress.includes('Appending')}
          >
            Add Queue
          </Button>
        </div>
      </div>

      {isFetchingOrLoading && fetchProgress && <div className="mb-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-md text-sm text-green-600 dark:text-green-300 text-center animate-pulse" role="status">{fetchProgress}</div>}
      {!isFetchingOrLoading && dataManagementStatus && <div className="mb-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-md text-sm text-yellow-700 dark:text-yellow-200 text-center" role="status">{dataManagementStatus}</div>}
      {(uiError || playerError) && <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-md text-sm text-center" role="alert">{uiError || playerError}</div>}

      {currentIdentifierType !== 'playlist' && profileDetail && (<> <ProfileInfoBox detail={profileDetail} /> {currentIdentifierType === 'user' && lastFetchedTimestamp && (<p className="text-xs text-gray-500 dark:text-gray-400 text-center -mt-4 mb-4"> Data last fetched: {new Date(lastFetchedTimestamp).toLocaleString()} </p>)} </>)}
      {currentIdentifierType === 'playlist' && playlistDetail && (<> <PlaylistInfoBox detail={playlistDetail} /> {lastFetchedTimestamp && (<p className="text-xs text-gray-500 dark:text-gray-400 text-center -mt-4 mb-4"> Data last fetched: {new Date(lastFetchedTimestamp).toLocaleString()} </p>)} </>)}

      {playlistAnalysis && (
        <details className="mb-8 glass-card border-white/10 overflow-hidden" open={showAnalysis} onToggle={(e) => setShowAnalysis((e.target as HTMLDetailsElement).open)}>
          <summary className="p-6 text-xs font-black uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-400 cursor-pointer hover:bg-white/10 dark:hover:bg-white/5 rounded-t-3xl transition-all flex justify-between items-center group">
            <span>
              {currentIdentifierType === 'playlist' ? 'Playlist Analysis' : 'Song List Analysis'}
            </span>
            <span className={`transform transition-transform duration-500 opacity-40 group-hover:opacity-100 ${showAnalysis ? 'rotate-180' : ''}`}>
               <ChevronDownIcon className="w-4 h-4" />
            </span>
          </summary>
          <div className="p-6 border-t border-white/10 space-y-8 animate-fadeIn">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/5 dark:bg-black/20 p-4 rounded-2xl border border-white/5 text-center">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Total Plays</p>
                <p className="text-2xl font-black text-gray-900 dark:text-white tabular-nums">{playlistAnalysis.totalPlays.toLocaleString()}</p>
              </div>
              <div className="bg-white/5 dark:bg-black/20 p-4 rounded-2xl border border-white/5 text-center">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Total Upvotes</p>
                <p className="text-2xl font-black text-gray-900 dark:text-white tabular-nums">{playlistAnalysis.totalUpvotes.toLocaleString()}</p>
              </div>
              <div className="bg-white/5 dark:bg-black/20 p-4 rounded-2xl border border-white/5 text-center">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Total Comments</p>
                <p className="text-2xl font-black text-gray-900 dark:text-white tabular-nums">{playlistAnalysis.totalComments.toLocaleString()}</p>
              </div>
              <div className="bg-white/5 dark:bg-black/20 p-4 rounded-2xl border border-white/5 text-center">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Avg. Plays</p>
                <p className="text-2xl font-black text-gray-900 dark:text-white tabular-nums">{playlistAnalysis.avgPlays.toFixed(0)}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
              <div className="space-y-4">
                <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-green-700 dark:text-green-400">Top Tags</h4>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-2 scrollbar-thin">
                  {playlistAnalysis.mostCommonTags.length > 0 ? playlistAnalysis.mostCommonTags.map(tag => (
                    <div key={tag.name} className="flex justify-between items-center bg-slate-50/50 dark:bg-black/10 p-2.5 rounded-xl border border-gray-100 dark:border-white/5 group hover:border-green-500/30 transition-all">
                      <span className="font-bold text-gray-700 dark:text-gray-300 truncate">{tag.name}</span>
                      <span className="font-black text-[10px] text-green-600 dark:text-green-500 bg-green-500/10 px-2 py-0.5 rounded-lg">{tag.count}</span>
                    </div>
                  )) : <p className="text-gray-500 italic text-xs">No tags found</p>}
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-green-700 dark:text-green-400">Genres</h4>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-2 scrollbar-thin">
                  {playlistAnalysis.mostCommonGenres.length > 0 ? playlistAnalysis.mostCommonGenres.map(genre => (
                    <div key={genre.name} className="flex justify-between items-center bg-slate-50/50 dark:bg-black/10 p-2.5 rounded-xl border border-gray-100 dark:border-white/5 group hover:border-green-500/30 transition-all">
                      <span className="font-bold text-gray-700 dark:text-gray-300 truncate">{genre.name}</span>
                      <span className="font-black text-[10px] text-green-600 dark:text-green-500 bg-green-500/10 px-2 py-0.5 rounded-lg">{genre.count}</span>
                    </div>
                  )) : <p className="text-gray-500 italic text-xs">No genres found</p>}
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-green-700 dark:text-green-400">Artists</h4>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-2 scrollbar-thin">
                  {playlistAnalysis.mostFeaturedArtists.length > 0 ? playlistAnalysis.mostFeaturedArtists.map(artist => (
                    <div key={artist.handle} className="flex justify-between items-center bg-slate-50/50 dark:bg-black/10 p-2.5 rounded-xl border border-gray-100 dark:border-white/5 group hover:border-green-500/30 transition-all">
                      <span className="font-bold text-gray-700 dark:text-gray-300 truncate">{artist.name}</span>
                       <span className="font-black text-[10px] text-green-600 dark:text-green-500 bg-green-500/10 px-2 py-0.5 rounded-lg">{artist.count}</span>
                    </div>
                  )) : <p className="text-gray-500 italic text-xs">No artists featured</p>}
                </div>
              </div>
            </div>

            <div className="pt-4">
              <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400 text-center mb-6">Timeline Analysis</h4>
              <div className="h-64 p-4 glass-card border-gray-100 dark:border-white/5 bg-slate-50/50 dark:bg-black/20 rounded-3xl">
                <PlaylistCreationDateChart data={playlistAnalysis.creationDateDistribution} fontColor={document.documentElement.classList.contains('dark') ? '#9ca3af' : '#4b5563'} gridColor={document.documentElement.classList.contains('dark') ? '#37415122' : '#d1d5db22'} />
              </div>
            </div>
          </div>
        </details>
      )}

      {showDataManagement && (
        <div className="mt-2 mb-8 p-2 md:p-6 glass-card border-white/10 animate-fadeIn"> 
          <h3 className="text-sm font-black uppercase tracking-[0.2em] text-red-600 dark:text-red-400 mb-4 md:mb-6">System Management</h3> 
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-4"> 
            <Button 
              onClick={handleClearProfileCache} 
              disabled={isFetchingOrLoading} 
              variant="ghost"
              size="sm"
              className="w-full justify-start border-red-500/30 text-red-700 dark:text-red-400 hover:bg-red-500/10 font-bold shadow-none"
              title="Clears cached User IDs and Playlist Metadata"
              startIcon={<RefreshIcon className="w-3.5 h-3.5" />}
            > 
              {getClearProfileCacheButtonText()} 
            </Button> 
            <Button 
              onClick={handleClearSongInfoCache} 
              disabled={isFetchingOrLoading} 
              variant="ghost"
              size="sm"
              className="w-full justify-start border-orange-500/30 text-orange-700 dark:text-orange-400 hover:bg-orange-500/10 font-bold shadow-none"
              title="Clears cached individual song details and stream URLs"
              startIcon={<RefreshIcon className="w-3.5 h-3.5" />}
            > 
              {getClearSongInfoCacheButtonText()} 
            </Button> 
            <Button 
              onClick={handleClearAllHubDataFromPlayer} 
              disabled={isFetchingOrLoading && clearAllHubDataClickCount < (2)} 
              variant="ghost"
              size="sm"
              className="w-full justify-start border-red-600/30 text-red-600 dark:text-red-500 hover:bg-red-600 hover:text-white font-bold shadow-none"
              title="WARNING: Clears ALL application data and reloads"
              startIcon={<TrashIcon className="w-3.5 h-3.5" />}
            > 
              {getClearAllHubDataButtonText()} 
            </Button> 
          </div> 
        </div>
      )}

      <div className="mb-10">
        <Button 
          onClick={() => setShowPlaylistManagement(!showPlaylistManagement)} 
          variant="ghost"
          size="lg"
          className="w-full text-left text-xs font-black uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 dark:hover:text-emerald-300 py-6 px-10 glass-card border-white/10 mb-2 flex justify-between items-center group transition-all" 
          aria-expanded={showPlaylistManagement}
        >
          <span>Library & Export <span className="opacity-40 italic ml-2">Archives</span></span>
          <ChevronDownIcon className={`w-5 h-5 transform transition-transform duration-500 ${showPlaylistManagement ? 'rotate-180' : ''}`} />
        </Button>
        {showPlaylistManagement && (
          <div className="p-6 glass-card border-white/10 space-y-6 animate-fadeIn">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <Button 
                onClick={handleExportCurrentPlaylistToFile} 
                variant="ghost" 
                className="w-full justify-start border-white/10 hover:bg-white/10 font-bold text-xs uppercase tracking-widest py-3 shadow-none"
                startIcon={<FileTxtIcon className="w-4 h-4 ml-1" />}
              >
                Export TXT
              </Button>
              <input type="file" ref={fileInputTxtRef} onChange={handleImportPlaylistFromTxtFile} accept=".txt" style={{ display: 'none' }} id="import-txt-playlist" />
              <label htmlFor="import-txt-playlist" className="flex items-center justify-start p-3 border border-white/10 hover:bg-white/10 rounded-2xl cursor-pointer text-xs font-black uppercase tracking-widest transition-all gap-3">
                <FileTxtIcon className="w-4 h-4 ml-1 opacity-60"/> Import TXT
              </label>
              <input type="file" ref={fileInputCsvRef} onChange={handleImportPlaylistFromCsvFile} accept=".csv" style={{ display: 'none' }} id="import-csv-playlist" />
              <label htmlFor="import-csv-playlist" className="flex items-center justify-start p-3 border border-white/10 hover:bg-white/10 rounded-2xl cursor-pointer text-xs font-black uppercase tracking-widest transition-all gap-3">
                <FileCsvIcon className="w-4 h-4 ml-1 opacity-60"/> Import CSV
              </label>
            </div>
            
            <div className="pt-6 border-t border-white/10">
              <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400 mb-4 text-center">Local Library</h4>
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <input 
                  type="text" 
                  value={newPlaylistName} 
                  onChange={(e) => setNewPlaylistName(e.target.value)} 
                  placeholder="New Playlist Name..." 
                  className="flex-grow px-4 py-3 bg-white/10 dark:bg-black/20 border border-white/10 rounded-2xl text-sm font-bold placeholder-gray-500 focus:ring-4 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all" 
                />
                <Button 
                  onClick={() => { handleSaveCurrentPlaylistLocally(newPlaylistName); setNewPlaylistName(''); }} 
                  disabled={!newPlaylistName.trim()} 
                  variant="primary"
                  className="font-black uppercase tracking-widest px-6"
                  backgroundColor="#10b981"
                  size="lg"
                  startIcon={<SaveIcon className="w-4 h-4" />}
                >
                  Save New
                </Button>
              </div>
              
              {savedCustomPlaylists.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto pr-2 scrollbar-thin">
                  {savedCustomPlaylists.map(p => (
                    <div key={p.id} className="flex flex-col p-4 bg-white/5 dark:bg-black/20 border border-white/10 rounded-3xl hover:border-green-500/30 transition-all group">
                      <div className="mb-4">
                        <span className="text-sm font-black text-gray-900 dark:text-white truncate block" title={p.name}>{p.name}</span>
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-600 mt-1">
                          {p.updatedAt ? `Updated: ${new Date(p.updatedAt).toLocaleDateString()}` : `Created: ${new Date(p.createdAt).toLocaleDateString()}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button onClick={() => handleLoadClick(p.id)} variant="ghost" size="sm" className="flex-1 text-[10px] font-black uppercase tracking-widest bg-blue-500/10 border-blue-500/20 text-blue-600 hover:bg-blue-500 hover:text-white" title="Load Playlist">
                          {loadConfirm.id === p.id && loadConfirm.count > 0 ? `?? (${3 - loadConfirm.count})` : "Load"}
                        </Button>
                        <Button onClick={() => handleAppendClick(p.id)} variant="ghost" size="sm" className="flex-1 text-[10px] font-black uppercase tracking-widest bg-teal-500/10 border-teal-500/20 text-teal-600 hover:bg-teal-500 hover:text-white" title="Append to Playlist">
                          {appendConfirm.id === p.id && appendConfirm.count > 0 ? `?? (${3 - appendConfirm.count})` : "Add"}
                        </Button>
                        <Button onClick={() => handleUpdateClick(p.id)} variant="ghost" size="sm" className="flex-1 text-[10px] font-black uppercase tracking-widest bg-yellow-500/10 border-yellow-500/20 text-yellow-600 hover:bg-yellow-500 hover:text-black" title="Update Playlist">
                          {updateConfirm.id === p.id && updateConfirm.count > 0 ? `?? (${3 - updateConfirm.count})` : "Refresh"}
                        </Button>
                        <Button onClick={() => handleDeleteClick(p.id)} variant="ghost" size="sm" className="flex-1 text-[10px] font-black uppercase tracking-widest bg-red-500/10 border-red-500/20 text-red-600 hover:bg-red-500 hover:text-white" title="Delete">
                          {deleteConfirm.id === p.id && deleteConfirm.count > 0 ? `?? (${3 - deleteConfirm.count})` : "Del"}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {savedCustomPlaylists.length > 0 && (
                <Button onClick={handleClearAllSavedPlaylists} variant="ghost" className="mt-6 w-full border-red-500/20 text-red-600 hover:bg-red-500/10 font-black uppercase tracking-widest text-xs py-3">
                  {getClearAllSavedPlaylistsButtonText()}
                </Button>
              )}
            </div>
            
            <div className="pt-6 border-t border-white/10">
              <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-red-600 dark:text-red-400 mb-4 text-center">Safety</h4>
              <Button
                onClick={handleClearQueue}
                disabled={isFetchingOrLoading || playerState.queue.length === 0}
                variant="ghost"
                className="w-full border-red-600 text-red-600 dark:text-red-500 hover:bg-red-600 hover:text-white font-black uppercase tracking-widest text-xs py-3"
              >
                {getClearQueueButtonText()}
              </Button>
            </div>
          </div>
        )}
      </div>

      {playerState.currentSong && (
        <div className="mb-8 p-4 sm:p-8 glass-card border-white/10 shadow-2xl animate-fadeIn relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
          <div className="flex flex-col sm:flex-row items-center gap-8 relative z-10">
            <a href={playerState.currentSong.suno_song_url || `https://suno.com/song/${playerState.currentSong.id}`} target="_blank" rel="noopener noreferrer" className="flex-shrink-0 group/img">
              <div className="relative">
                <img
                  src={playerState.currentSong.image_url || FALLBACK_IMAGE_DATA_URI}
                  alt={playerState.currentSong.title}
                  className="w-36 h-36 rounded-3xl object-cover border-2 border-white/10 shadow-2xl transition-all duration-500 group-hover/img:scale-105 group-hover/img:border-emerald-500/50"
                  onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_IMAGE_DATA_URI; }}
                />
                <div className="absolute inset-0 rounded-3xl bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                   <PlayCountIcon className="w-10 h-10 text-white opacity-80" />
                </div>
              </div>
            </a>
            <div className="flex-1 text-center sm:text-left min-w-0 space-y-3">
              <a href={playerState.currentSong.suno_song_url || `https://suno.com/song/${playerState.currentSong.id}`} target="_blank" rel="noopener noreferrer" className="inline-block max-w-full">
                <h3 className="text-xl sm:text-3xl md:text-4xl font-black text-gray-900 dark:text-white truncate uppercase tracking-tighter italic leading-tight" title={playerState.currentSong.title}>{playerState.currentSong.title}</h3>
              </a>
              <a href={playerState.currentSong.suno_creator_url || `https://suno.com/@${playerState.currentSong.handle}`} target="_blank" rel="noopener noreferrer" className="block opacity-60 hover:opacity-100 transition-opacity">
                <p className="text-[11px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-500 truncate" title={playerState.currentSong.display_name || `@${playerState.currentSong.handle}`}>by {playerState.currentSong.display_name || `@${playerState.currentSong.handle}`}</p>
              </a>
              <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 flex items-center justify-center sm:justify-start gap-6 pt-2"> 
                <span className="flex items-center gap-2"><PlayCountIcon className="w-3.5 h-3.5" /> {playerState.currentSong.play_count?.toLocaleString() || '0'}</span> 
                <span className="flex items-center gap-2"><UpvoteCountIcon className="w-3.5 h-3.5" /> {playerState.currentSong.upvote_count?.toLocaleString() || '0'}</span> 
                <span className="flex items-center gap-2"><CommentCountIcon className="w-3.5 h-3.5" /> {playerState.currentSong.comment_count?.toLocaleString() || '0'}</span> 
              </div>
            </div>
            <div className="flex-shrink-0 flex sm:flex-col gap-3">
              <Button onClick={handleShowLyrics} variant="ghost" size="sm" className="p-4 border-white/10 hover:bg-white/10 rounded-2xl text-emerald-600 dark:text-emerald-400 shadow-none" title="Lyrics" startIcon={<LyricsPlayerIcon />} />
              <Button onClick={handleShowMetadata} variant="ghost" size="sm" className="p-4 border-white/10 hover:bg-white/10 rounded-2xl text-emerald-600 dark:text-emerald-400 shadow-none" title="Metadata" startIcon={<InfoPlayerIcon />} />
              <Button onClick={handleShareSong} variant="ghost" size="sm" className="p-4 border-white/10 hover:bg-white/10 rounded-2xl text-emerald-600 dark:text-emerald-400 shadow-none" title={copyShareLinkStatus || "Share"} startIcon={<SharePlayerIcon />} />
            </div>
          </div>
          {copyShareLinkStatus && (
            <div className="absolute bottom-4 right-8 animate-fadeIn">
              <p className="text-[10px] font-black uppercase tracking-widest text-purple-600 dark:text-purple-400">{copyShareLinkStatus}</p>
            </div>
          )}
        </div>
      )}

      <AudioVisualizer analyserNodes={analyserNodes} isPlaying={playerState.status === PlaybackStatus.Playing} />

      <div className="flex items-center justify-between mb-4"> <div className="text-xs text-gray-500 dark:text-gray-400">{formatTime(playerState.currentTime)}</div> <input type="range" min="0" max={playerState.duration || 0} value={playerState.currentTime} onChange={handleSeekSlider} className="flex-grow mx-3 h-2 bg-gray-300 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-500 focus:outline-none focus:ring-1 focus:ring-green-400" aria-label="Seek slider" /> <div className="text-xs text-gray-500 dark:text-gray-400">{formatTime(playerState.duration)}</div> </div>

      <div className="flex items-center justify-center gap-8 mb-8 mt-4">
        <Button onClick={previousTrack} variant="ghost" className="p-6 bg-slate-200/50 dark:bg-black/20 hover:bg-slate-300 dark:hover:bg-white/10 rounded-full border-gray-200 dark:border-white/10 shadow-xl" aria-label="Previous Track"> <SkipBackIcon className="w-6 h-6" /> </Button>
        <Button onClick={togglePlayPause} variant="primary" className="p-10 bg-emerald-500 hover:bg-emerald-400 text-black rounded-full shadow-[0_0_40px_rgba(16,185,129,0.3)] hover:scale-105 active:scale-95 transition-all" aria-label={playerState.status === PlaybackStatus.Playing ? "Pause" : "Play"} > {playerState.status === PlaybackStatus.Playing ? <PauseIcon className="w-10 h-10" /> : <PlayIcon className="w-10 h-10" />} </Button>
        <Button onClick={() => nextTrack(false)} variant="ghost" className="p-6 bg-slate-200/50 dark:bg-black/20 hover:bg-slate-300 dark:hover:bg-white/10 rounded-full border-gray-200 dark:border-white/10 shadow-xl" aria-label="Next Track"> <SkipForwardIcon className="w-6 h-6" /> </Button>
        <Button onClick={toggleShuffle} variant="ghost" className={`p-6 rounded-full border ${playerState.isShuffle ? 'bg-emerald-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.4)] border-emerald-500' : 'bg-slate-200/50 dark:bg-black/20 border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-400'}`} aria-pressed={playerState.isShuffle} aria-label="Toggle shuffle">
          <ShuffleIcon className="w-6 h-6" />
        </Button>
      </div>

      <div className="flex items-center justify-between text-xs mb-4">
        <div className="flex items-center gap-2"> <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-gray-500 dark:text-gray-400"><path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" /></svg> <input type="range" min="0" max="1" step="0.01" value={playerState.volume} onChange={handleVolumeChangeSlider} className="w-24 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-green-500" aria-label="Volume control" /> </div>
        <div className="flex gap-2 items-center">
          <label htmlFor="snippetModeCheckbox" className="text-gray-600 dark:text-gray-400 cursor-pointer hover:text-green-600 dark:hover:text-green-300">Snippet Mode ({playerState.snippetDurationConfig}s):</label>
          <input type="checkbox" id="snippetModeCheckbox" checked={playerState.isSnippetMode} onChange={toggleSnippetMode} className="form-checkbox h-3.5 w-3.5 text-green-500 bg-gray-200 dark:bg-gray-700 border-gray-400 dark:border-gray-600 rounded focus:ring-green-400 focus:ring-offset-0" />
          <input type="number" value={playerState.snippetDurationConfig} onChange={(e) => setSnippetDurationConfig(parseInt(e.target.value, 10))} min={MIN_SNIPPET_DURATION_SECONDS} max={MAX_SNIPPET_DURATION_SECONDS} className="w-12 px-1 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white focus:ring-green-400 focus:border-green-400" aria-label="Snippet duration in seconds" />

          <Button onClick={() => setShowEq(!showEq)} variant="ghost" size="xs" className={`p-2 rounded-xl transition-all shadow-none ${showEq ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20' : 'bg-white/5 border-white/10 text-gray-400'} hover:opacity-80`} aria-label="Toggle equalizer" aria-expanded={showEq} startIcon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" /></svg>} />
          <Button onClick={() => setShowShortcutsModal(true)} variant="ghost" size="xs" className="p-2 rounded-xl bg-white/5 border-white/10 text-gray-400 hover:opacity-80 shadow-none" aria-label="Show Keyboard Shortcuts" startIcon={<KeyboardIcon className="w-4 h-4" />} />
        </div>
      </div>

      {showEq && (
        <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600">
          <div className="flex flex-wrap justify-center gap-3 mb-6"> 
            {Object.entries(EQ_PRESETS_FOR_UI).map(([key, { label }]) => (
              <Button 
                key={key} 
                onClick={() => applyEqPreset(key)} 
                variant="ghost" 
                size="xs" 
                className="px-4 py-2 bg-white/5 border-white/10 hover:bg-emerald-500/20 text-gray-400 hover:text-emerald-400 rounded-xl transition-all font-black uppercase tracking-widest text-[9px]"
              > 
                {label} 
              </Button>
            ))} 
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-x-3 gap-y-2 text-xs"> {playerState.eqBands.map(band => (<div key={band.id}> <label htmlFor={band.id} className="block text-gray-600 dark:text-gray-400 text-center mb-0.5">{band.frequency < 1000 ? `${band.frequency}Hz` : `${band.frequency / 1000}kHz`}</label> <input type="range" id={band.id} min="-12" max="12" step="0.1" value={band.gain} onChange={e => setEqGain(band.id, parseFloat(e.target.value))} className="w-full h-1.5 bg-gray-400 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-green-500" /> <p className="text-center text-gray-700 dark:text-gray-300 mt-0.5">{band.gain.toFixed(1)} dB</p> </div>))} </div>
        </div>
      )}

      <div className="mt-8 flex flex-col sm:flex-row justify-between items-start gap-4">
        <Button onClick={() => setShowPlaylist(!showPlaylist)} variant="ghost" className="w-full sm:w-auto text-left text-xs font-black uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 dark:hover:text-emerald-300 py-3 px-4 border-white/10" aria-expanded={showPlaylist} aria-controls="playlist-panel"> <ChevronDownIcon className={`w-4 h-4 mr-2 transform transition-transform ${showPlaylist ? 'rotate-180' : ''}`} /> Queue List ({playerState.queue.length}) </Button>
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
            className="px-4 py-2.5 bg-white/10 dark:bg-black/20 border border-white/20 rounded-xl placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-green-500/20 focus:border-green-500 text-gray-900 dark:text-white sm:text-sm font-bold flex-grow transition-all" 
            aria-label="Filter playlist" 
          />
          <Button 
            onClick={handleExportPlaylistCsv} 
            title="Export current list to CSV" 
            variant="ghost"
            size="sm"
            className="p-3 border-white/10 hover:bg-white/10 rounded-xl shadow-none"
            disabled={playerState.queue.length === 0}
            startIcon={<CsvExportIcon className="w-4 h-4" />}
          />
        </div>
      </div>
      {showPlaylist && (
        <div ref={playlistContainerRef} id="playlist-panel" className="mt-4 glass-card border-white/10 overflow-hidden relative" style={{ height: playlistHeight }}>
          <ul className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 hover:scrollbar-thumb-white/20 divide-y divide-white/5">
            {playerState.queue.map(song => (
              <li
                key={song.id}
                draggable={!playerState.isShuffle}
                onDragStart={e => onDragStartHandler(e, song.id)}
                onDragOver={e => onDragOverHandler(e, song.id)}
                onDragLeave={onDragLeaveHandler}
                onDrop={e => onDropHandler(e, song.id)}
                onDragEnd={onDragEndHandler}
                className={`p-4 flex items-center gap-4 transition-all duration-300 relative group
                                    ${playerState.isShuffle
                    ? 'cursor-not-allowed opacity-80'
                    : 'hover:bg-white/10 cursor-grab active:cursor-grabbing'}
                                    ${playerState.currentSong?.id === song.id ? 'bg-green-500/10 dark:bg-green-500/5' : ''} 
                                    ${dropIndicator?.targetId === song.id ? (dropIndicator.position === 'before' ? 'border-t-4 border-green-500/50' : 'border-b-4 border-green-500/50') : ''} 
                                    ${draggedItemId === song.id ? 'opacity-30' : ''}`
                }
              >
                <div className="relative flex-shrink-0">
                  <img
                    src={song.image_url || FALLBACK_IMAGE_DATA_URI}
                    alt={song.title}
                    className={`w-12 h-12 rounded-xl object-cover border border-white/10 transition-all duration-500 ${playerState.currentSong?.id === song.id ? 'border-green-500/50 scale-110 shadow-lg' : ''}`}
                    onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_IMAGE_DATA_URI; }}
                  />
                  {playerState.currentSong?.id === song.id && playerState.status === PlaybackStatus.Playing && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-black animate-pulse"></div>
                  )}
                </div>
                <div className="flex-1 min-w-0 cursor-pointer" onClick={() => playSong(song)}> 
                  <p className={`text-sm truncate font-black uppercase tracking-tight transition-colors ${playerState.currentSong?.id === song.id ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-900 dark:text-white group-hover:text-emerald-500'}`} title={song.title}>{song.title}</p> 
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-600 truncate mt-0.5" title={song.display_name || `@${song.handle}`}>{song.display_name || `@${song.handle}`}</p> 
                </div>
                <div className="hidden sm:flex text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-600 flex-shrink-0 items-center gap-4"> 
                   <span className="flex items-center gap-1"><PlayCountIcon className="w-3 h-3" /> {song.play_count?.toLocaleString() || '0'}</span> 
                   <span className="flex items-center gap-1"><UpvoteCountIcon className="w-3 h-3" /> {song.upvote_count?.toLocaleString() || '0'}</span> 
                </div>
                <Button onClick={() => removeSongFromQueue(song.id)} variant="ghost" size="xs" className="ml-4 p-3 hover:bg-red-500/20 rounded-xl text-red-500 dark:text-red-400 transition-all opacity-0 group-hover:opacity-100 border-none shadow-none" aria-label={`Remove ${song.title}`} startIcon={<TrashIcon className="w-4 h-4" />} />
              </li>
            ))}
            {playerState.queue.length === 0 && (<li className="p-12 text-center text-gray-500 dark:text-gray-600 text-xs font-black uppercase tracking-[0.2em] italic">Queue is empty</li>)}
          </ul>
          {playlistContainerRef.current && <div onMouseDown={handleMouseDownResize} className="absolute bottom-0 left-0 w-full h-3 bg-white/5 dark:bg-black/20 hover:bg-green-500/20 cursor-ns-resize flex items-center justify-center transition-colors"><div className="w-12 h-1 bg-white/20 rounded-full"></div></div>}
        </div>
      )}

      {showLyricsModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn" onClick={() => setShowLyricsModal(false)}>
          <div className="glass-card p-8 border-white/20 shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col relative overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-black uppercase tracking-tighter italic text-emerald-500">Lyrics</h2>
              <Button onClick={() => setShowLyricsModal(false)} variant="ghost" size="sm" className="p-2 hover:bg-white/10 text-gray-500 hover:text-white transition-all rounded-xl">
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </Button>
            </div>
            <div className="mb-8">
              <h3 className="text-2xl font-black uppercase tracking-tighter text-gray-900 dark:text-white">Lyrics Breakdown</h3>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-green-600 dark:text-green-500 mt-1">{playerState.currentSong?.title}</p>
            </div>
            
            <div className="flex-grow overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10 hover:scrollbar-thumb-white/20 mb-8">
              <pre className="text-base font-bold text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed opacity-90">{lyricsToDisplay}</pre>
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-white/10">
               {lyricsSourceField && <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-600">Source: <span className="text-green-600/50">{lyricsSourceField}</span></p>}
               <Button onClick={handleCopyLyrics} disabled={!lyricsToDisplay || lyricsToDisplay === "Lyrics not available for this song." || !!copyLyricsStatus} variant="primary" size="lg" className="min-w-[160px] font-black uppercase tracking-widest" backgroundColor="#10b981">
                 {copyLyricsStatus || "Copy Lyrics"}
               </Button>
            </div>
          </div>
        </div>
      )}

      {showMetadataModal && playerState.currentSong && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn" onClick={() => setShowMetadataModal(false)}>
          <div className="glass-card p-4 sm:p-8 border-white/20 shadow-2xl w-full max-w-xl max-h-[85vh] flex flex-col relative" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-black uppercase tracking-tighter italic text-emerald-500">Metadata</h2>
              <Button onClick={() => setShowMetadataModal(false)} variant="ghost" size="sm" className="p-2 hover:bg-white/10 text-gray-500 hover:text-white transition-all rounded-xl">
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </Button>
            </div>
            <div className="mb-8">
              <h3 className="text-2xl font-black uppercase tracking-tighter text-gray-900 dark:text-white">Track Intel</h3>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-green-600 dark:text-green-500 mt-1">{playerState.currentSong.title}</p>
            </div>
            
            <div className="overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-white/10 space-y-6">
              <div className="space-y-4">
                <div className="bg-white/5 dark:bg-black/20 p-4 rounded-2xl border border-white/5">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Style tags</p>
                  <p className="text-sm font-bold text-gray-900 dark:text-white leading-relaxed">{playerState.currentSong.metadata?.tags || 'None identified'}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 dark:bg-black/20 p-4 rounded-2xl border border-white/5 text-center">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Model</p>
                    <p className="text-sm font-black text-gray-900 dark:text-white">{playerState.currentSong.model_name || 'N/A'}</p>
                  </div>
                  <div className="bg-white/5 dark:bg-black/20 p-4 rounded-2xl border border-white/5 text-center">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Duration</p>
                    <p className="text-sm font-black text-gray-900 dark:text-white">{playerState.currentSong.metadata?.duration ? `${playerState.currentSong.metadata.duration.toFixed(1)}s` : 'N/A'}</p>
                  </div>
                </div>
                
                <div className="bg-white/5 dark:bg-black/20 p-4 rounded-2xl border border-white/5">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Generation Prompt</p>
                  <pre className="text-xs font-bold text-gray-800 dark:text-gray-300 whitespace-pre-wrap max-h-32 overflow-y-auto scrollbar-thin opacity-80 italic">{playerState.currentSong.metadata?.gpt_description_prompt || 'N/A'}</pre>
                </div>

                <div className="text-center pt-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-gray-600">Generated on {new Date(playerState.currentSong.created_at).toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <KeyboardShortcutsModal isOpen={showShortcutsModal} onClose={() => setShowShortcutsModal(false)} />
      <div className="mt-12 pt-8 border-t border-white/10 text-center">
        <div className="max-w-2xl mx-auto p-6 glass-card border-white/5 hover:border-white/10 transition-all group">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-yellow-600 dark:text-yellow-500 mb-4 inline-flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>
            Troubleshooting Intel
          </p>
          <p className="text-xs font-bold text-gray-500 dark:text-gray-400 italic leading-relaxed opacity-70 group-hover:opacity-100 transition-opacity">
            If audio issues occur, ensure your browser has permission to play audio. Interact with the page before playing. If persistent, try refreshing or clearing data via System Management.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SunoMusicPlayerTool;
