

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

import { LOGO_SVG_STRING, FALLBACK_IMAGE_DATA_URI, TOOL_CATEGORY_UI, LOCAL_STORAGE_PLAYLIST_HEIGHT_KEY, DEFAULT_PLAYLIST_HEIGHT_PX, MIN_PLAYLIST_HEIGHT_PX, MAX_PLAYLIST_HEIGHT_PX, MIN_SNIPPET_DURATION_SECONDS, MAX_SNIPPET_DURATION_SECONDS, LOCAL_CLICK_CONFIRM_NEEDED, LOCAL_CLICK_TIMEOUT_MS, EQ_PRESETS_FOR_UI } from '@/components/SunoMusicPlayer/constants';
import { PlayCountIcon, UpvoteCountIcon, CommentCountIcon, ClipsIcon, FollowersIcon, TotalPlaysIcon, TotalUpvotesIcon, TotalCommentsProfileIcon, PlaylistIcon, CsvExportIcon, FileTxtIcon, FileCsvIcon, TrashIcon, SaveIcon, LoadIcon, RefreshIcon, PlaylistRemoveIcon, LyricsPlayerIcon, InfoPlayerIcon, SharePlayerIcon, KeyboardIcon, AppendIcon } from '@/components/SunoMusicPlayer/Icons';
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
    clearPlayerCacheClickCount, handleClearPlayerCache, getClearPlayerCacheButtonText,
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
    handleClearSongInfoCache, getClearSongInfoCacheButtonText, clearSongInfoCacheClickCount,
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
    <div className="w-full max-w-5xl mx-auto bg-white dark:bg-gray-900 shadow-2xl rounded-lg p-4 md:p-6 border-2 border-green-500 dark:border-green-600 text-gray-900 dark:text-gray-200 flex flex-col transition-colors duration-300">
      <header className="mb-6 text-center">
        <h1 className="text-4xl font-extrabold text-green-600 dark:text-green-400">Music Shuffler</h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Enter a Suno Username/Playlist URL or a list of Suno/Riffusion/Producer.AI URLs (one per line). Fetch/Load replaces the queue, Add to Queue appends.
        </p>
      </header>
      <div className="mb-6 flex flex-col sm:flex-row items-stretch gap-2">
        <textarea
          value={identifierInput}
          onChange={handleIdentifierInputChange}
          onKeyDown={handleIdentifierInputKeyDown}
          placeholder="Enter Suno Username (@user), Suno Playlist URL, or a list of Suno/Riffusion/Producer.AI URLs (one per line)..."
          className="flex-grow px-4 py-2.5 bg-gray-100 dark:bg-gray-800 border-2 border-green-500 rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 text-gray-900 dark:text-white sm:text-sm resize-y min-h-[50px]"
          rows={3}
          aria-label="Suno Username, Playlist URL, or list of Song URLs"
        />
        <div className="flex flex-col sm:flex-row sm:items-stretch gap-2">
          <button onClick={handleMainButtonClick} disabled={isFetchingOrLoading || !identifierInput.trim()} className="px-6 py-2.5 bg-green-500 text-black font-semibold rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-900 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:text-gray-500 dark:disabled:text-gray-400 transition-colors flex items-center justify-center flex-grow sm:flex-grow-0">
            {isFetchingOrLoading && !fetchProgress.includes('Appending') ? <><Spinner size="w-5 h-5 mr-2" color="text-black" /> Fetching...</> : mainButtonText}
          </button>
          <button onClick={handleAppendSongs} disabled={isFetchingOrLoading || !identifierInput.trim()} className="px-4 py-2.5 bg-teal-600 text-white font-semibold rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-900 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:text-gray-500 dark:disabled:text-gray-400 transition-colors flex items-center justify-center gap-2 flex-grow sm:flex-grow-0">
            {isFetchingOrLoading && fetchProgress.includes('Appending') ? <Spinner size="w-5 h-5" /> : <AppendIcon className="w-4 h-4" />}
            Add to Queue
          </button>
        </div>
      </div>

      {isFetchingOrLoading && fetchProgress && <div className="mb-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-md text-sm text-green-600 dark:text-green-300 text-center animate-pulse" role="status">{fetchProgress}</div>}
      {!isFetchingOrLoading && dataManagementStatus && <div className="mb-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-md text-sm text-yellow-700 dark:text-yellow-200 text-center" role="status">{dataManagementStatus}</div>}
      {(uiError || playerError) && <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-md text-sm text-center" role="alert">{uiError || playerError}</div>}

      {currentIdentifierType !== 'playlist' && profileDetail && (<> <ProfileInfoBox detail={profileDetail} /> {currentIdentifierType === 'user' && lastFetchedTimestamp && (<p className="text-xs text-gray-500 dark:text-gray-400 text-center -mt-4 mb-4"> Data last fetched: {new Date(lastFetchedTimestamp).toLocaleString()} </p>)} </>)}
      {currentIdentifierType === 'playlist' && playlistDetail && (<> <PlaylistInfoBox detail={playlistDetail} /> {lastFetchedTimestamp && (<p className="text-xs text-gray-500 dark:text-gray-400 text-center -mt-4 mb-4"> Data last fetched: {new Date(lastFetchedTimestamp).toLocaleString()} </p>)} </>)}

      {playlistAnalysis && (
        <details className="mb-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700" open={showAnalysis} onToggle={(e) => setShowAnalysis((e.target as HTMLDetailsElement).open)}>
          <summary className="p-4 text-lg font-semibold text-green-700 dark:text-green-300 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 rounded-t-lg transition-colors flex justify-between items-center">
            <span>
              {currentIdentifierType === 'playlist' ? 'Playlist Analysis' : 'Song List Analysis'}
            </span>
            <span className={`transform transition-transform duration-200 ${showAnalysis ? 'rotate-180' : ''}`}>▼</span>
          </summary>
          <div className="p-4 border-t border-gray-300 dark:border-gray-600 space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="bg-gray-200 dark:bg-gray-700 p-3 rounded-lg"><p className="text-xs text-gray-600 dark:text-gray-400">Total Plays</p><p className="text-xl font-bold text-gray-900 dark:text-white">{playlistAnalysis.totalPlays.toLocaleString()}</p></div>
              <div className="bg-gray-200 dark:bg-gray-700 p-3 rounded-lg"><p className="text-xs text-gray-600 dark:text-gray-400">Total Upvotes</p><p className="text-xl font-bold text-gray-900 dark:text-white">{playlistAnalysis.totalUpvotes.toLocaleString()}</p></div>
              <div className="bg-gray-200 dark:bg-gray-700 p-3 rounded-lg"><p className="text-xs text-gray-600 dark:text-gray-400">Total Comments</p><p className="text-xl font-bold text-gray-900 dark:text-white">{playlistAnalysis.totalComments.toLocaleString()}</p></div>
              <div className="bg-gray-200 dark:bg-gray-700 p-3 rounded-lg"><p className="text-xs text-gray-600 dark:text-gray-400">Avg. Plays/Song</p><p className="text-xl font-bold text-gray-900 dark:text-white">{playlistAnalysis.avgPlays.toFixed(1)}</p></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <h4 className="font-semibold text-green-700 dark:text-green-200 mb-2">Most Common Tags</h4>
                <ul className="space-y-1 bg-gray-200 dark:bg-gray-700 p-2 rounded-md max-h-40 overflow-y-auto">
                  {playlistAnalysis.mostCommonTags.length > 0 ? playlistAnalysis.mostCommonTags.map(tag => <li key={tag.name} className="flex justify-between items-center text-gray-800 dark:text-gray-300"><span>{tag.name}</span> <span className="font-mono text-green-700 dark:text-green-400 bg-gray-300 dark:bg-gray-800 px-1.5 py-0.5 rounded-sm">{tag.count}</span></li>) : <li className="text-gray-500 dark:text-gray-400 italic">No common tags found.</li>}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-green-700 dark:text-green-200 mb-2">Most Common Genres</h4>
                <ul className="space-y-1 bg-gray-200 dark:bg-gray-700 p-2 rounded-md max-h-40 overflow-y-auto">
                  {playlistAnalysis.mostCommonGenres.length > 0 ? playlistAnalysis.mostCommonGenres.map(genre => <li key={genre.name} className="flex justify-between items-center text-gray-800 dark:text-gray-300"><span>{genre.name}</span> <span className="font-mono text-green-700 dark:text-green-400 bg-gray-300 dark:bg-gray-800 px-1.5 py-0.5 rounded-sm">{genre.count}</span></li>) : <li className="text-gray-500 dark:text-gray-400 italic">No common genres found.</li>}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-green-700 dark:text-green-200 mb-2">Most Featured Artists</h4>
                <ul className="space-y-1 bg-gray-200 dark:bg-gray-700 p-2 rounded-md max-h-40 overflow-y-auto">
                  {playlistAnalysis.mostFeaturedArtists.length > 0 ? playlistAnalysis.mostFeaturedArtists.map(artist => (
                    <li key={artist.handle} className="flex justify-between items-center text-gray-800 dark:text-gray-300">
                      {artist.profileUrl ? (
                        <a
                          href={artist.profileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline truncate"
                          title={artist.name}
                        >
                          {artist.name}
                        </a>
                      ) : (
                        <span className="truncate" title={artist.name}>
                          {artist.name}
                        </span>
                      )}
                      <span className="font-mono text-green-700 dark:text-green-400 bg-gray-300 dark:bg-gray-800 px-1.5 py-0.5 rounded-sm flex-shrink-0 ml-2">
                        {artist.count}
                      </span>
                    </li>
                  )) : (
                    <li className="text-gray-500 dark:text-gray-400 italic">No artists featured.</li>
                  )}
                </ul>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-green-700 dark:text-green-200 mb-2 text-center">Song Creation Timeline</h4>
              <div className="h-64 bg-gray-200 dark:bg-gray-700 p-2 rounded-md">
                <PlaylistCreationDateChart data={playlistAnalysis.creationDateDistribution} fontColor={document.documentElement.classList.contains('dark') ? '#e5e7eb' : '#1f2937'} gridColor={document.documentElement.classList.contains('dark') ? '#374151' : '#d1d5db'} />
              </div>
            </div>
          </div>
        </details>
      )}

      {showDataManagement && (<div className="mt-2 mb-6 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"> <h3 className="text-md font-semibold text-green-700 dark:text-green-300 mb-2">Data Management</h3> <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2"> <button onClick={handleClearPlayerCache} disabled={isFetchingOrLoading || (!profileDetail && !playlistDetail) || currentIdentifierType === 'custom_list'} className="flex-1 py-1.5 px-3 border border-red-500 text-red-600 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-700 hover:text-red-800 dark:hover:text-white rounded-md text-xs font-medium disabled:opacity-50 transition-colors"> {getClearPlayerCacheButtonText()} </button> <button onClick={handleClearSongInfoCache} disabled={isFetchingOrLoading} className="flex-1 py-1.5 px-3 border border-orange-500 text-orange-600 dark:text-orange-300 hover:bg-orange-100 dark:hover:bg-orange-700 hover:text-orange-800 dark:hover:text-white rounded-md text-xs font-medium disabled:opacity-50 transition-colors"> {getClearSongInfoCacheButtonText()} </button> <button onClick={handleClearAllHubDataFromPlayer} disabled={isFetchingOrLoading && clearAllHubDataClickCount < (2)} className="flex-1 py-1.5 px-3 bg-gray-200 dark:bg-gray-700 hover:bg-red-100 dark:hover:bg-red-800 text-gray-800 dark:text-gray-200 hover:text-red-800 dark:hover:text-white border border-red-600 rounded-md text-xs font-medium shadow-sm transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed lg:col-span-1" aria-label="Clear all locally stored hub data"> {getClearAllHubDataButtonText()} </button> </div> </div>)}

      <div className="mb-6">
        <button onClick={() => setShowPlaylistManagement(!showPlaylistManagement)} className="w-full text-left text-md font-medium text-green-600 dark:text-green-400 hover:text-green-500 dark:hover:text-green-300 py-2 px-1 mb-2 flex justify-between items-center" aria-expanded={showPlaylistManagement} aria-controls="playlist-management-panel">
          Playlist Import/Export & Local Saves
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-4 h-4 transform transition-transform ${showPlaylistManagement ? 'rotate-180' : ''}`}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
        </button>
        {showPlaylistManagement && (
          <div id="playlist-management-panel" className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 space-y-3 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              <button onClick={handleExportCurrentPlaylistToFile} className="py-1.5 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-md flex items-center justify-center"><FileTxtIcon />Export Current to TXT</button>
              <input type="file" ref={fileInputTxtRef} onChange={handleImportPlaylistFromTxtFile} accept=".txt" style={{ display: 'none' }} id="import-txt-playlist" />
              <label htmlFor="import-txt-playlist" className="py-1.5 px-3 bg-teal-600 hover:bg-teal-500 text-white rounded-md flex items-center justify-center cursor-pointer"><FileTxtIcon />Import from TXT</label>
              <input type="file" ref={fileInputCsvRef} onChange={handleImportPlaylistFromCsvFile} accept=".csv" style={{ display: 'none' }} id="import-csv-playlist" />
              <label htmlFor="import-csv-playlist" className="py-1.5 px-3 bg-teal-600 hover:bg-teal-500 text-white rounded-md flex items-center justify-center cursor-pointer"><FileCsvIcon />Import from CSV</label>
            </div>
            <div className="pt-2 border-t border-gray-300 dark:border-gray-600">
              <h4 className="text-sm font-medium text-green-700 dark:text-green-300 mb-1.5">Local Named Playlists</h4>
              <div className="flex flex-col sm:flex-row gap-2 mb-2">
                <input type="text" value={newPlaylistName} onChange={(e) => setNewPlaylistName(e.target.value)} placeholder="Enter playlist name..." className="flex-grow px-2 py-1.5 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm placeholder-gray-500 focus:ring-green-500 focus:border-green-500 text-gray-900 dark:text-white" />
                <button onClick={() => { handleSaveCurrentPlaylistLocally(newPlaylistName); setNewPlaylistName(''); }} disabled={!newPlaylistName.trim()} className="py-1.5 px-3 bg-green-600 hover:bg-green-500 text-white dark:text-black rounded-md flex items-center justify-center disabled:opacity-50"><SaveIcon />Save Current as New</button>
              </div>
              {savedCustomPlaylists.length > 0 && (
                <div className="max-h-32 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-500 scrollbar-track-gray-200 dark:scrollbar-track-gray-700 space-y-1.5">
                  {savedCustomPlaylists.map(p => (
                    <div key={p.id} className="flex justify-between items-center p-1.5 bg-gray-200 dark:bg-gray-700 rounded-md">
                      <div className="flex-grow min-w-0">
                        <span className="text-gray-800 dark:text-gray-200 truncate" title={p.name}>{p.name}</span>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {p.updatedAt ? `Updated: ${new Date(p.updatedAt).toLocaleDateString()}` : `Created: ${new Date(p.createdAt).toLocaleDateString()}`}
                        </p>
                      </div>
                      <div className="flex-shrink-0 flex items-center space-x-1.5">
                        <button onClick={() => handleLoadClick(p.id)} className="py-1 px-2 bg-blue-500 hover:bg-blue-400 text-white dark:text-black rounded min-w-[3.5rem] text-center" title="Load Playlist (replaces queue)">
                          {loadConfirm.id === p.id && loadConfirm.count > 0 ? `Load? (${3 - loadConfirm.count})` : <LoadIcon className="w-3.5 h-3.5 mx-auto" />}
                        </button>
                        <button onClick={() => handleAppendClick(p.id)} className="py-1 px-2 bg-teal-500 hover:bg-teal-400 text-white dark:text-black rounded min-w-[3.5rem] text-center" title="Append content from input area to this playlist">
                          {appendConfirm.id === p.id && appendConfirm.count > 0 ? `Add? (${3 - appendConfirm.count})` : <AppendIcon className="w-4 h-4 mx-auto" />}
                        </button>
                        <button onClick={() => handleUpdateClick(p.id)} className="py-1 px-2 bg-yellow-500 hover:bg-yellow-400 text-white dark:text-black rounded min-w-[3.5rem] text-center" title="Overwrite this playlist with the songs currently in your queue">
                          {updateConfirm.id === p.id && updateConfirm.count > 0 ? `Sure? (${3 - updateConfirm.count})` : <RefreshIcon className="w-3.5 h-3.5 mx-auto" />}
                        </button>
                        <button onClick={() => handleDeleteClick(p.id)} className="py-1 px-2 bg-red-500 hover:bg-red-400 text-white rounded min-w-[3.5rem] text-center" title="Delete Playlist">
                          {deleteConfirm.id === p.id && deleteConfirm.count > 0 ? `Del? (${3 - deleteConfirm.count})` : <TrashIcon className="w-3.5 h-3.5 mx-auto" />}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {savedCustomPlaylists.length > 0 && <button onClick={handleClearAllSavedPlaylists} className="mt-2 w-full py-1 px-2 bg-red-700 hover:bg-red-600 text-white rounded-md text-xs">{getClearAllSavedPlaylistsButtonText()}</button>}
            </div>
            <div className="pt-2 mt-2 border-t border-gray-300 dark:border-gray-600">
              <h4 className="text-sm font-medium text-red-600 dark:text-red-400 mb-1.5">Danger Zone</h4>
              <button
                onClick={handleClearQueue}
                disabled={isFetchingOrLoading || playerState.queue.length === 0}
                className="w-full py-1.5 px-3 bg-red-700 hover:bg-red-600 text-white rounded-md text-xs font-medium disabled:opacity-50"
              >
                {getClearQueueButtonText()}
              </button>
            </div>
          </div>
        )}
      </div>

      {playerState.currentSong && (
        <div className="mb-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <a href={playerState.currentSong.suno_song_url || `https://suno.com/song/${playerState.currentSong.id}`} target="_blank" rel="noopener noreferrer" className="flex-shrink-0">
              <img
                src={playerState.currentSong.image_url || FALLBACK_IMAGE_DATA_URI}
                alt={playerState.currentSong.title}
                className="w-24 h-24 rounded-md object-cover border-2 border-green-500 shadow-md hover:opacity-80 transition-opacity"
                onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_IMAGE_DATA_URI; }}
              />
            </a>
            <div className="flex-1 text-center sm:text-left min-w-0">
              <a href={playerState.currentSong.suno_song_url || `https://suno.com/song/${playerState.currentSong.id}`} target="_blank" rel="noopener noreferrer" className="hover:underline">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white truncate" title={playerState.currentSong.title}>{playerState.currentSong.title}</h3>
              </a>
              <a href={playerState.currentSong.suno_creator_url || `https://suno.com/@${playerState.currentSong.handle}`} target="_blank" rel="noopener noreferrer" className="hover:underline">
                <p className="text-sm text-gray-600 dark:text-gray-400 truncate" title={playerState.currentSong.display_name || `@${playerState.currentSong.handle}`}>by {playerState.currentSong.display_name || `@${playerState.currentSong.handle}`}</p>
              </a>
              <div className="text-xs text-gray-500 dark:text-gray-500 mt-1 flex items-center justify-center sm:justify-start gap-x-2 gap-y-0.5 flex-wrap"> <span><PlayCountIcon /> {playerState.currentSong.play_count?.toLocaleString() || 'N/A'}</span> <span><UpvoteCountIcon /> {playerState.currentSong.upvote_count?.toLocaleString() || 'N/A'}</span> <span><CommentCountIcon /> {playerState.currentSong.comment_count?.toLocaleString() || 'N/A'}</span> </div>
            </div>
            <div className="flex-shrink-0 flex flex-col sm:flex-row gap-2 mt-2 sm:mt-0">
              <button onClick={handleShowLyrics} title="Show Lyrics" className="p-1.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-md text-green-700 dark:text-green-300"><LyricsPlayerIcon /></button>
              <button onClick={handleShowMetadata} title="Song Info" className="p-1.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-md text-green-700 dark:text-green-300"><InfoPlayerIcon /></button>
              <button onClick={handleShareSong} title={copyShareLinkStatus || "Share Song"} className="p-1.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-md text-green-700 dark:text-green-300"><SharePlayerIcon /></button>
            </div>
          </div>
          {copyShareLinkStatus && <p className="text-xs text-center mt-1 text-purple-600 dark:text-purple-300">{copyShareLinkStatus}</p>}
        </div>
      )}

      <AudioVisualizer analyserNodes={analyserNodes} isPlaying={playerState.status === PlaybackStatus.Playing} />

      <div className="flex items-center justify-between mb-4"> <div className="text-xs text-gray-500 dark:text-gray-400">{formatTime(playerState.currentTime)}</div> <input type="range" min="0" max={playerState.duration || 0} value={playerState.currentTime} onChange={handleSeekSlider} className="flex-grow mx-3 h-2 bg-gray-300 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-500 focus:outline-none focus:ring-1 focus:ring-green-400" aria-label="Seek slider" /> <div className="text-xs text-gray-500 dark:text-gray-400">{formatTime(playerState.duration)}</div> </div>

      <div className="flex items-center justify-center gap-3 mb-6">
        <button onClick={previousTrack} className="p-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-full focus:outline-none focus:ring-2 focus:ring-green-500" aria-label="Previous Track"> <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" /></svg> </button>
        <button onClick={togglePlayPause} className="p-4 bg-green-500 hover:bg-green-600 text-black rounded-full focus:outline-none focus:ring-2 focus:ring-green-400 shadow-lg" aria-label={playerState.status === PlaybackStatus.Playing ? "Pause" : "Play"} > {playerState.status === PlaybackStatus.Playing ? <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-6 h-6"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg> : <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-6 h-6"><path d="M8 5v14l11-7z" /></svg>} </button>
        <button onClick={() => nextTrack(false)} className="p-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-full focus:outline-none focus:ring-2 focus:ring-green-500" aria-label="Next Track"> <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" /></svg> </button>
        <button onClick={toggleShuffle} className={`p-3 rounded-full ${playerState.isShuffle ? 'bg-green-500 text-black' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'} hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-green-500`} aria-pressed={playerState.isShuffle} aria-label="Toggle shuffle">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12M18 6l-2-2m2 2l-2 2M6 18l2 2m-2-2l2-2" />
          </svg>
        </button>
      </div>

      <div className="flex items-center justify-between text-xs mb-4">
        <div className="flex items-center gap-2"> <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-gray-500 dark:text-gray-400"><path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" /></svg> <input type="range" min="0" max="1" step="0.01" value={playerState.volume} onChange={handleVolumeChangeSlider} className="w-24 h-1.5 bg-gray-400 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-green-500" aria-label="Volume control" /> </div>
        <div className="flex gap-2 items-center">
          <label htmlFor="snippetModeCheckbox" className="text-gray-600 dark:text-gray-400 cursor-pointer hover:text-green-600 dark:hover:text-green-300">Snippet Mode ({playerState.snippetDurationConfig}s):</label>
          <input type="checkbox" id="snippetModeCheckbox" checked={playerState.isSnippetMode} onChange={toggleSnippetMode} className="form-checkbox h-3.5 w-3.5 text-green-500 bg-gray-200 dark:bg-gray-700 border-gray-400 dark:border-gray-600 rounded focus:ring-green-400 focus:ring-offset-0" />
          <input type="number" value={playerState.snippetDurationConfig} onChange={(e) => setSnippetDurationConfig(parseInt(e.target.value, 10))} min={MIN_SNIPPET_DURATION_SECONDS} max={MAX_SNIPPET_DURATION_SECONDS} className="w-12 px-1 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white focus:ring-green-400 focus:border-green-400" aria-label="Snippet duration in seconds" />

          <button onClick={() => setShowEq(!showEq)} className={`p-1.5 rounded-md ${showEq ? 'bg-green-500 text-black' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'} hover:opacity-80`} aria-label="Toggle equalizer" aria-expanded={showEq}> <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" /></svg> </button>
          <button onClick={() => setShowShortcutsModal(true)} className="p-1.5 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:opacity-80" aria-label="Show Keyboard Shortcuts"> <KeyboardIcon /> </button>
        </div>
      </div>

      {showEq && (
        <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600">
          <div className="flex flex-wrap justify-center gap-2 mb-3"> {Object.entries(EQ_PRESETS_FOR_UI).map(([key, { label }]) => (<button key={key} onClick={() => applyEqPreset(key)} className="px-2 py-1 text-xs bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-300 rounded-md"> {label} </button>))} </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-x-3 gap-y-2 text-xs"> {playerState.eqBands.map(band => (<div key={band.id}> <label htmlFor={band.id} className="block text-gray-600 dark:text-gray-400 text-center mb-0.5">{band.frequency < 1000 ? `${band.frequency}Hz` : `${band.frequency / 1000}kHz`}</label> <input type="range" id={band.id} min="-12" max="12" step="0.1" value={band.gain} onChange={e => setEqGain(band.id, parseFloat(e.target.value))} className="w-full h-1.5 bg-gray-400 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-green-500" /> <p className="text-center text-gray-700 dark:text-gray-300 mt-0.5">{band.gain.toFixed(1)} dB</p> </div>))} </div>
        </div>
      )}

      <div className="mt-4 flex flex-col sm:flex-row justify-between items-start gap-3">
        <button onClick={() => setShowPlaylist(!showPlaylist)} className="w-full sm:w-auto text-left text-md font-medium text-green-600 dark:text-green-400 hover:text-green-500 dark:hover:text-green-300 py-1 px-1 flex items-center" aria-expanded={showPlaylist} aria-controls="playlist-panel"> <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-4 h-4 mr-1 transform transition-transform ${showPlaylist ? 'rotate-180' : ''}`}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg> Playlist ({playerState.queue.length} songs) </button>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <select value={sortCriteria} onChange={(e) => setSortCriteria(e.target.value as SortCriteriaHook)} className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white focus:ring-green-500 focus:border-green-500 flex-grow sm:flex-grow-0" aria-label="Sort playlist by"> <option value="default">Default Order</option> <option value="play_count">Most Plays</option> <option value="upvote_count">Most Upvotes</option> <option value="created_at">Newest First</option> <option value="title">Title (A-Z)</option> </select>
          <input type="text" value={filterQuery} onChange={(e) => setFilterQuery(e.target.value)} placeholder="Filter playlist..." className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white focus:ring-green-500 focus:border-green-500 flex-grow sm:flex-grow-0" aria-label="Filter playlist" />
          <button onClick={handleExportPlaylistCsv} title="Export current playlist view to CSV" className="p-1.5 text-xs bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md disabled:opacity-50" disabled={playerState.queue.length === 0}> <CsvExportIcon /> </button>
        </div>
      </div>
      {showPlaylist && (
        <div ref={playlistContainerRef} id="playlist-panel" className="mt-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-850 overflow-hidden relative" style={{ height: playlistHeight }}>
          <ul className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-200 dark:scrollbar-track-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {playerState.queue.map(song => (
              <li
                key={song.id}
                draggable={!playerState.isShuffle}
                onDragStart={e => onDragStartHandler(e, song.id)}
                onDragOver={e => onDragOverHandler(e, song.id)}
                onDragLeave={onDragLeaveHandler}
                onDrop={e => onDropHandler(e, song.id)}
                onDragEnd={onDragEndHandler}
                className={`p-2 flex items-center gap-3 transition-colors relative 
                                    ${playerState.isShuffle
                    ? 'cursor-not-allowed'
                    : 'hover:bg-gray-200 dark:hover:bg-gray-700 cursor-grab active:cursor-grabbing'}
                                    ${playerState.currentSong?.id === song.id ? 'bg-green-100 dark:bg-green-700 bg-opacity-40' : ''} 
                                    ${dropIndicator?.targetId === song.id ? (dropIndicator.position === 'before' ? 'border-t-2 border-blue-400' : 'border-b-2 border-blue-400') : ''} 
                                    ${draggedItemId === song.id ? 'opacity-50' : ''}`
                }
                title={playerState.isShuffle ? "Drag & drop reordering is disabled in Shuffle mode." : "Drag to reorder playlist."}
              >
                <img
                  src={song.image_url || FALLBACK_IMAGE_DATA_URI}
                  alt={song.title}
                  className="w-10 h-10 rounded object-cover flex-shrink-0 border border-gray-300 dark:border-gray-600"
                  onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_IMAGE_DATA_URI; }}
                />
                <div className="flex-1 min-w-0" onClick={() => playSong(song)}> <p className="text-sm text-gray-900 dark:text-white truncate font-medium" title={song.title}>{song.title}</p> <p className="text-xs text-gray-500 dark:text-gray-400 truncate" title={song.display_name || `@${song.handle}`}>{song.display_name || `@${song.handle}`}</p> </div>
                <div className="text-xs text-gray-500 dark:text-gray-500 flex-shrink-0 flex flex-col sm:flex-row items-end sm:items-center gap-x-2 gap-y-0.5"> <span title="Plays"><PlayCountIcon /> {song.play_count?.toLocaleString() || 'N/A'}</span> <span title="Upvotes"><UpvoteCountIcon /> {song.upvote_count?.toLocaleString() || 'N/A'}</span> <span title="Comments"><CommentCountIcon /> {song.comment_count?.toLocaleString() || 'N/A'}</span> </div>
                <button onClick={() => removeSongFromQueue(song.id)} className="ml-2 p-1 hover:bg-red-100 dark:hover:bg-red-700 rounded-full focus:outline-none focus:ring-1 focus:ring-red-400 text-red-500 dark:text-red-400" aria-label={`Remove ${song.title} from playlist`}> <PlaylistRemoveIcon /> </button>
              </li>
            ))}
            {playerState.queue.length === 0 && (<li className="p-3 text-center text-gray-500 dark:text-gray-500 text-sm">No songs in the current playlist view.</li>)}
          </ul>
          {playlistContainerRef.current && <div onMouseDown={handleMouseDownResize} className="absolute bottom-0 left-0 w-full h-2.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 cursor-ns-resize flex items-center justify-center" title="Resize Playlist"><div className="w-10 h-1 bg-gray-400 dark:bg-gray-500 rounded-full"></div></div>}
        </div>
      )}

      {showLyricsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={() => setShowLyricsModal(false)}>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-xl max-h-[80vh] flex flex-col border border-green-500" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold text-green-700 dark:text-green-300">Lyrics for "{playerState.currentSong?.title}"</h3>
              <button onClick={() => setShowLyricsModal(false)} className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white">&times;</button>
            </div>
            {lyricsSourceField && <p className="text-xs text-gray-500 dark:text-gray-500 mb-2">Source: <code className="bg-gray-100 dark:bg-gray-700 p-0.5 rounded">{`metadata.${lyricsSourceField}`}</code></p>}
            <pre className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap overflow-y-auto flex-grow p-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-200 dark:scrollbar-track-gray-800">{lyricsToDisplay}</pre>
            <button onClick={handleCopyLyrics} disabled={!lyricsToDisplay || lyricsToDisplay === "Lyrics not available for this song." || !!copyLyricsStatus} className="mt-3 py-1.5 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-md text-sm disabled:opacity-60">{copyLyricsStatus || "Copy Lyrics"}</button>
          </div>
        </div>
      )}

      {showMetadataModal && playerState.currentSong && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={() => setShowMetadataModal(false)}>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-xl max-h-[80vh] flex flex-col border border-green-500" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-3"> <h3 className="text-lg font-semibold text-green-700 dark:text-green-300">Song Info: {playerState.currentSong.title}</h3> <button onClick={() => setShowMetadataModal(false)} className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white">&times;</button> </div>
            <div className="overflow-y-auto text-xs text-gray-700 dark:text-gray-300 space-y-1.5 pr-2 scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-200 dark:scrollbar-track-gray-800">
              <p><strong className="text-green-600 dark:text-green-200">Tags:</strong> {playerState.currentSong.metadata?.tags || 'N/A'}</p>
              <p><strong className="text-green-600 dark:text-green-200">Model:</strong> {playerState.currentSong.model_name || 'N/A'}</p>
              <p><strong className="text-green-600 dark:text-green-200">Full Prompt (GPT Description):</strong> <pre className="whitespace-pre-wrap bg-gray-100 dark:bg-gray-900 p-1 rounded border border-gray-300 dark:border-gray-700 max-h-24 overflow-y-auto">{playerState.currentSong.metadata?.gpt_description_prompt || 'N/A'}</pre></p>
              <p><strong className="text-green-600 dark:text-green-200">Created:</strong> {new Date(playerState.currentSong.created_at).toLocaleString()}</p>
              <p><strong className="text-green-600 dark:text-green-200">Duration:</strong> {playerState.currentSong.metadata?.duration ? `${playerState.currentSong.metadata.duration.toFixed(1)}s` : 'N/A'}</p>
            </div>
          </div>
        </div>
      )}
      <KeyboardShortcutsModal isOpen={showShortcutsModal} onClose={() => setShowShortcutsModal(false)} />
      <div className="mt-6 pt-4 border-t border-gray-300 dark:border-gray-700 text-center"><p className="text-sm text-gray-500 dark:text-gray-400"><strong className="text-yellow-600 dark:text-yellow-300">Troubleshooting Tip:</strong> If audio playback issues occur (e.g., no sound, visualizer not working), ensure your browser has permission to play audio and try interacting with the page (clicking a button) before playing. If issues persist, refreshing the page or clearing data for this specific tool (via Data Management) can often help.</p></div>
    </div>
  );
};

export default SunoMusicPlayerTool;
