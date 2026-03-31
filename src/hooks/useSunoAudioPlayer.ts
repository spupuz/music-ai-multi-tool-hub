import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Howl, Howler } from 'howler';
import type { SunoClip, RiffusionSongData, EqualizerBand, PlayerState, SunoProfileDetail, SunoPlaylistDetail, SunoMusicPlayerStoredData, SavedCustomPlaylist, PlaylistAnalysis } from '@/types';
import { PlaybackStatus } from '@/types';
import { fetchSunoClipById, fetchSunoSongsByUsername, fetchSunoPlaylistById, extractSunoSongIdFromPath as extractSunoSongIdFromPathFromService, resolveSunoUrlToPotentialSongId } from '@/services/sunoService';
import { fetchRiffusionSongData, extractRiffusionSongId } from '@/services/riffusionService';
import { downloadSunoPlaylistAsCsv } from '@/services/csvExportService';
import { usePlaylistAnalysis } from './suno/usePlaylistAnalysis';
import { useSunoAudioSystem } from './suno/useSunoAudioSystem';
import { useSunoDataManagement } from './suno/useSunoDataManagement';
import { useSunoInputProcessor } from './suno/useSunoInputProcessor';
import { useSunoQueue, SortCriteriaHook } from './suno/useSunoQueue';
import {
  DEFAULT_EQ_BANDS_CONFIG,
  EQ_PRESETS,
  LOCAL_STORAGE_PREFIX_USER,
  LOCAL_STORAGE_PREFIX_PLAYLIST,
  LOCAL_STORAGE_CLIP_DETAIL_CACHE_KEY,
  LOCAL_STORAGE_SAVED_CUSTOM_PLAYLISTS_KEY,
  LOCAL_STORAGE_SNIPPET_DURATION_KEY,
  CLEAR_CLICKS_NEEDED,
  CLEAR_TIMEOUT_MS,
  DEFAULT_SNIPPET_DURATION_SECONDS,
  MIN_SNIPPET_DURATION_SECONDS,
  MAX_SNIPPET_DURATION_SECONDS,
  TOOL_CATEGORY_PLAYER,
  sunoPlaylistUrlPattern,
  sunoUserProfileUrlPattern,
  riffusionUrlPattern,
} from './suno/constants';

Howler.autoSuspend = false;
Howler.autoUnlock = false;

export interface UseSunoAudioPlayerProps {
  initialVolume?: number;
  initialShuffle?: boolean;
  trackLocalEvent: (category: string, action: string, label?: string, value?: string | number) => void;
}

export interface UseSunoAudioPlayerReturn {
  identifierInput: string;
  setIdentifierInput: React.Dispatch<React.SetStateAction<string>>;
  currentIdentifier: string;
  currentIdentifierType: 'user' | 'playlist' | 'custom_list' | null;
  isFetchingOrLoading: boolean;
  fetchProgress: string;
  uiError: string | null;
  profileDetail: SunoProfileDetail | null;
  playlistDetail: SunoPlaylistDetail | null;
  playlistAnalysis: PlaylistAnalysis | null;
  originalSongsList: SunoClip[];
  sortCriteria: SortCriteriaHook;
  setSortCriteria: (newCriteria: SortCriteriaHook) => void;
  filterQuery: string;
  setFilterQuery: React.Dispatch<React.SetStateAction<string>>;
  lastFetchedTimestamp: string | null;
  mainButtonText: string;
  showDataManagement: boolean;
  clearPlayerCacheClickCount: number;
  handleClearPlayerCache: () => void;
  getClearPlayerCacheButtonText: () => string;
  clearAllHubDataClickCount: number;
  handleClearAllHubDataFromPlayer: () => void;
  getClearAllHubDataButtonText: () => string;
  dataManagementStatus: string;
  playerState: PlayerState;
  analyserNodes: { left: AnalyserNode | null; right: AnalyserNode | null; };
  playSong: (song: SunoClip, isResuming?: boolean) => void;
  togglePlayPause: () => void;
  nextTrack: (isAutoAdvance?: boolean) => void;
  previousTrack: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  setEqGain: (bandId: string, gain: number) => void;
  applyEqPreset: (presetKey: string) => void;
  toggleShuffle: () => void;
  toggleSnippetMode: () => void;
  setSnippetDurationConfig: (duration: number) => void;
  formatTime: (secs: number) => string;
  isLoading: boolean;
  error: string | null;
  setErrorPlayer: (error: string | null) => void;
  handleMainButtonClick: () => void;
  handleAppendSongs: () => void;
  parseInput: (input: string) => { type: 'user' | 'playlist' | 'custom_list' | 'riffusion' | null; id: string | null; nameHint?: string, rawInput?: string };
  handleReorderQueue: (draggedSongId: string, targetSongId: string, insertBeforeTarget: boolean) => void;
  handleExportPlaylistCsv: () => Promise<void>;
  savedCustomPlaylists: SavedCustomPlaylist[];
  handleExportCurrentPlaylistToFile: () => void;
  handleImportPlaylistFromTxtFile: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleImportPlaylistFromCsvFile: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleSaveCurrentPlaylistLocally: (name: string) => void;
  handleUpdateSavedPlaylistLocally: (playlistId: string) => void;
  handleAppendToSavedPlaylistLocally: (playlistId: string, contentToAppend: string) => void;
  handleLoadSavedPlaylistLocally: (playlistId: string) => void;
  handleDeleteSavedPlaylistLocally: (playlistId: string) => void;
  handleClearAllSavedPlaylists: () => void;
  getClearAllSavedPlaylistsButtonText: () => string;
  clearAllSavedPlaylistsClickCount: number;
  handleClearSongInfoCache: () => void;
  getClearSongInfoCacheButtonText: () => string;
  clearSongInfoCacheClickCount: number;
  removeSongFromQueue: (songId: string) => void;
  handleClearQueue: () => void;
  getClearQueueButtonText: () => string;
}

// Known app storage keys and prefixes are now handled via constants.ts or within specialized hooks where appropriate.

// Helper functions like parseCsvLine and summarizeCustomList have been moved to their respective hooks/services.

export const useSunoAudioPlayer = ({
  initialVolume = 0.75,
  initialShuffle = false,
  trackLocalEvent,
}: UseSunoAudioPlayerProps): UseSunoAudioPlayerReturn => {
  const [identifierInput, setIdentifierInput] = useState<string>('');
  const [currentIdentifier, setCurrentIdentifier] = useState<string>('');
  const [currentIdentifierType, setCurrentIdentifierType] = useState<'user' | 'playlist' | 'custom_list' | null>(null);

  const [uiErrorHook, setUiErrorHookInternal] = useState<string | null>(null);

  const [profileDetail, setProfileDetail] = useState<SunoProfileDetail | null>(null);
  const [playlistDetail, setPlaylistDetail] = useState<SunoPlaylistDetail | null>(null);

  const [originalSongsList, setOriginalSongsListInternal] = useState<SunoClip[]>([]);
  
  const [showDataManagement, setShowDataManagement] = useState<boolean>(true);

  const [clearPlayerCacheClickCount, setClearPlayerCacheClickCount] = useState(0);
  const [clearAllHubDataClickCount, setClearAllHubDataClickCount] = useState(0);
  const clearDataTimeoutRef = useRef<number | null>(null);

  const snippetTimeoutRef = useRef<number | null>(null);

  const [playerState, setPlayerStateInternal] = useState<PlayerState>({
    status: PlaybackStatus.Idle,
    currentSong: null,
    currentTime: 0,
    duration: 0,
    volume: initialVolume,
    isShuffle: initialShuffle,
    isSnippetMode: false,
    snippetDurationConfig: DEFAULT_SNIPPET_DURATION_SECONDS,
    history: [],
    queue: [],
    originalOrder: [],
    eqBands: DEFAULT_EQ_BANDS_CONFIG.map(b => ({ ...b })),
  });

  const playerStateRef = useRef(playerState);

  const setPlayerState = useCallback((updater: React.SetStateAction<PlayerState>) => {
    setPlayerStateInternal(prev => {
      const newState = typeof updater === 'function' ? updater(prev) : updater;
      playerStateRef.current = newState;
      return newState;
    });
  }, []);

  const setOriginalSongsList = useCallback((songs: SunoClip[]) => {
    setOriginalSongsListInternal(songs);
    setPlayerState(prev => ({ ...prev, originalOrder: songs }));
  }, [setPlayerState]);


  useEffect(() => { playerStateRef.current = playerState; }, [playerState]);

  const [isLoadingPlayer, setIsLoadingPlayer] = useState<boolean>(false);
  const [errorPlayerHook, setErrorPlayerHookInternal] = useState<string | null>(null);
  const setErrorPlayer = useCallback((error: string | null) => setErrorPlayerHookInternal(error), []);
  const setUiError = useCallback((update: React.SetStateAction<string | null>) => setUiErrorHookInternal(update), []);

  const currentSoundRef = useRef<Howl | null>(null);
  const currentPlayingSongIdRef = useRef<string | null>(null);

  const { isAudioSystemReady, ensureAudioSystemReady, analyserNodes } = useSunoAudioSystem({ playerState, setErrorPlayer });
  
  const {
    savedCustomPlaylists, setSavedCustomPlaylists,
    songInfoCache, setSongInfoCache,
    dataManagementStatus, setDataManagementStatus,
    handleClearPlayerCache, getClearPlayerCacheButtonText,
    handleClearAllHubDataFromPlayer, getClearAllHubDataButtonText,
    handleSaveCurrentPlaylistLocally: handleSaveCurrentPlaylistLocallyInternal,
    handleUpdateSavedPlaylistLocally: handleUpdateSavedPlaylistLocallyInternal,
    handleDeleteSavedPlaylistLocally,
    handleExportPlaylistCsv: handleExportPlaylistCsvInternal,
    handleExportCurrentPlaylistToFile: handleExportCurrentPlaylistToFileInternal,
    handleImportPlaylistFromTxtFile: handleImportPlaylistFromTxtFileInternal,
    handleImportPlaylistFromCsvFile: handleImportPlaylistFromCsvFileInternal,
    getCachedData, getCacheKey,
  } = useSunoDataManagement({ trackLocalEvent, setErrorPlayer });

  const stopCurrentAudio = useCallback(() => {
    if (currentSoundRef.current) {
      currentSoundRef.current.stop();
      currentSoundRef.current.unload();
      currentSoundRef.current = null;
    }
    currentPlayingSongIdRef.current = null;
  }, []);

  const {
    sortCriteria, setSortCriteria,
    filterQuery, setFilterQuery,
    manualOrderSongIds, setManualOrderSongIds,
    handleReorderQueue, handleClearQueue, getClearQueueButtonText,
    removeSongFromQueue,
  } = useSunoQueue({
    originalSongsList,
    setOriginalSongsListInternal,
    playerState,
    setPlayerState,
    trackLocalEvent,
    setDataManagementStatus,
    stopCurrentAudio,
  });

  const {
    isFetchingOrLoading,
    fetchProgress,
    mainButtonText,
    lastFetchedTimestamp,
    parseInput,
    handleMainButtonClick,
    handleAppendSongs,
    processMultiSourceInput,
  } = useSunoInputProcessor({
    identifierInput, setIdentifierInput,
    currentIdentifier, setCurrentIdentifier,
    currentIdentifierType, setCurrentIdentifierType,
    setOriginalSongsList, setManualOrderSongIds,
    setProfileDetail, setPlaylistDetail,
    setErrorPlayer, setUiError,
    songInfoCache, setSongInfoCache,
    setDataManagementStatus, trackLocalEvent,
    getCachedData, getCacheKey,
  });

  const nextTrackRef = useRef<(isAutoAdvance?: boolean) => void>(() => { });

  const [clearAllSavedPlaylistsClickCount, setClearAllSavedPlaylistsClickCount] = useState(0);

  useEffect(() => {
    const storedDuration = localStorage.getItem(LOCAL_STORAGE_SNIPPET_DURATION_KEY);
    if (storedDuration) {
      const parsed = parseInt(storedDuration, 10);
      if (!isNaN(parsed) && parsed >= MIN_SNIPPET_DURATION_SECONDS && parsed <= MAX_SNIPPET_DURATION_SECONDS) {
        setPlayerState(prev => ({ ...prev, snippetDurationConfig: parsed }));
      }
    }
  }, [setPlayerState]);

  const setSnippetDurationConfig = useCallback((duration: number) => {
    const newDuration = Math.max(MIN_SNIPPET_DURATION_SECONDS, Math.min(MAX_SNIPPET_DURATION_SECONDS, duration));
    setPlayerState(prev => ({ ...prev, snippetDurationConfig: newDuration }));
    localStorage.setItem(LOCAL_STORAGE_SNIPPET_DURATION_KEY, String(newDuration));
    trackLocalEvent(TOOL_CATEGORY_PLAYER, 'snippetDurationChanged', String(newDuration));
  }, [trackLocalEvent, setPlayerState]);

  const playlistAnalysis = usePlaylistAnalysis(originalSongsList, currentIdentifierType);

  const playSong = useCallback(async (song: SunoClip, isResuming = false) => {
    setErrorPlayer(null);
    setIsLoadingPlayer(true);
    setPlayerState(prev => ({ ...prev, status: PlaybackStatus.Loading, currentSong: song, currentTime: 0, duration: 0 }));
    currentPlayingSongIdRef.current = song.id;

    if (snippetTimeoutRef.current) {
      clearTimeout(snippetTimeoutRef.current);
      snippetTimeoutRef.current = null;
    }

    if (currentSoundRef.current) {
      currentSoundRef.current.stop();
      currentSoundRef.current.unload();
      currentSoundRef.current = null;
    }

    const ready = await ensureAudioSystemReady();
    if (!ready) {
      setIsLoadingPlayer(false);
      setPlayerState(prev => ({ ...prev, status: PlaybackStatus.Error, currentSong: null }));
      currentPlayingSongIdRef.current = null;
      return;
    }

    // Note: AudioContext resume and graph initialization is now handled by achieveAudioSystemReady 
    // in the useSunoAudioSystem hook. The following creates a new Howl instance associated with the global Howler context.

    const newSound = new Howl({
      src: [song.audio_url],
      html5: false,
      volume: 1.0,
      format: ['mp3'],
      onload: () => {
        if (currentPlayingSongIdRef.current !== song.id) return;
        const loadedDuration = newSound.duration();
        let validDuration = (typeof loadedDuration === 'number' && isFinite(loadedDuration) && loadedDuration > 0) ? loadedDuration : (song.metadata?.duration || 0);
        setPlayerState(prev => {
          if (prev.currentSong?.id !== song.id) return prev;
          const newHistory = (!isResuming && prev.currentSong && prev.currentSong.id !== song.id && prev.history[0]?.id !== prev.currentSong.id)
            ? [prev.currentSong, ...prev.history].slice(0, 20)
            : prev.history;
          return { ...prev, duration: validDuration, history: newHistory };
        });
        setIsLoadingPlayer(false);

        if (playerStateRef.current.isSnippetMode) {
          const songActualDuration = newSound.duration();
          const currentSnippetDuration = playerStateRef.current.snippetDurationConfig;
          if (songActualDuration && songActualDuration > currentSnippetDuration) {
            const randomStartTime = Math.random() * (songActualDuration - currentSnippetDuration);
            newSound.seek(randomStartTime);
          }
        }
      },
      onplay: () => {
        if (currentPlayingSongIdRef.current !== song.id) return;
        setPlayerState(prev => {
          if (prev.currentSong?.id !== song.id && prev.status !== PlaybackStatus.Loading) return prev;
          return { ...prev, status: PlaybackStatus.Playing, duration: newSound.duration() || prev.duration };
        });
        if (!isResuming) trackLocalEvent(TOOL_CATEGORY_PLAYER, 'songPlayed', song.title, 1);

        if (playerStateRef.current.isSnippetMode) {
          const sound = currentSoundRef.current;
          if (sound) {
            const currentTime = sound.seek() as number;
            const songDurationVal = sound.duration();
            const currentSnippetDuration = playerStateRef.current.snippetDurationConfig;
            if (songDurationVal) {
              const remainingSongTime = songDurationVal - currentTime;

              if (snippetTimeoutRef.current) clearTimeout(snippetTimeoutRef.current);
              if (remainingSongTime > currentSnippetDuration) {
                snippetTimeoutRef.current = window.setTimeout(() => {
                  nextTrackRef.current(true);
                }, currentSnippetDuration * 1000);
              }
            }
          }
        }
      },
      onpause: () => {
        if (currentPlayingSongIdRef.current !== song.id) return;
        setPlayerState(prev => ({ ...prev, status: PlaybackStatus.Paused }));
        if (playerStateRef.current.isSnippetMode && snippetTimeoutRef.current) {
          clearTimeout(snippetTimeoutRef.current);
          snippetTimeoutRef.current = null;
        }
      },
      onend: () => {
        if (playerStateRef.current.currentSong?.id === song.id) {
          setPlayerState(prev => ({ ...prev, status: PlaybackStatus.Ended, currentTime: prev.duration > 0 ? prev.duration : 0 }));
          nextTrackRef.current(true);
        }
      },
      onloaderror: (id, err) => { setErrorPlayer(`Error loading: ${song.title}. ${String(err)}`); setIsLoadingPlayer(false); setPlayerState(prev => ({ ...prev, status: PlaybackStatus.Error, currentSong: prev.currentSong?.id === song.id ? null : prev.currentSong })); if (currentPlayingSongIdRef.current === song.id) currentPlayingSongIdRef.current = null; },
      onplayerror: (id, err) => { setErrorPlayer(`Error playing: ${song.title}. ${String(err)}`); setIsLoadingPlayer(false); setPlayerState(prev => ({ ...prev, status: PlaybackStatus.Error, currentSong: prev.currentSong?.id === song.id ? null : prev.currentSong })); if (currentPlayingSongIdRef.current === song.id) currentPlayingSongIdRef.current = null; }
    });
    currentSoundRef.current = newSound;
    newSound.play();
  }, [trackLocalEvent, ensureAudioSystemReady, setErrorPlayer, setPlayerState]);

  const nextTrack = useCallback((isAutoAdvance = false) => {
    if (snippetTimeoutRef.current) {
      clearTimeout(snippetTimeoutRef.current);
      snippetTimeoutRef.current = null;
    }
    if (currentSoundRef.current) {
      currentSoundRef.current.stop();
      currentSoundRef.current.unload();
      currentSoundRef.current = null;
    }
    currentPlayingSongIdRef.current = null;

    const { currentSong, queue, isShuffle } = playerStateRef.current;
    if (!currentSong && queue.length > 0) { playSong(queue[0]); return; }

    let nextSongToPlay: SunoClip | null = null;
    const currentIndex = currentSong ? queue.findIndex(s => s.id === currentSong.id) : -1;

    if (currentIndex !== -1 && currentIndex < queue.length - 1) {
      nextSongToPlay = queue[currentIndex + 1];
    } else if (isShuffle && queue.length > 0) {
      let nextSongIndex = Math.floor(Math.random() * queue.length);
      if (queue.length > 1 && currentSong && queue[nextSongIndex].id === currentSong.id) {
        nextSongIndex = (nextSongIndex + 1) % queue.length;
      }
      nextSongToPlay = queue[nextSongIndex];
    } else if (!isShuffle && queue.length > 0 && currentIndex === queue.length - 1 && isAutoAdvance) {
      setPlayerState(prev => ({ ...prev, status: PlaybackStatus.Idle, currentTime: 0, currentSong: null }));
      return;
    } else if (!isAutoAdvance && queue.length > 0) {
      nextSongToPlay = queue[0];
    }

    if (nextSongToPlay) {
      playSong(nextSongToPlay);
    } else if (!isAutoAdvance) {
      setPlayerState(prev => ({ ...prev, status: PlaybackStatus.Idle, currentTime: 0, currentSong: null }));
    }
  }, [playSong, setPlayerState]);

  useEffect(() => { nextTrackRef.current = nextTrack; }, [nextTrack]);

  const togglePlayPause = useCallback(async () => {
    setErrorPlayer(null);
    const ready = await ensureAudioSystemReady();
    if (!ready) return;

    const { status, currentSong, queue } = playerStateRef.current;

    if (status === PlaybackStatus.Playing && currentSoundRef.current) {
      currentSoundRef.current.pause();
    } else if (status === PlaybackStatus.Paused && currentSoundRef.current) {
      currentSoundRef.current.play();
    } else if (currentSong && (status === PlaybackStatus.Ended || status === PlaybackStatus.Idle || status === PlaybackStatus.Error)) {
      playSong(currentSong, true);
    } else if (!currentSong && queue.length > 0) {
      playSong(queue[0]);
    }
  }, [playSong, ensureAudioSystemReady, setErrorPlayer]);

  const previousTrack = useCallback(async () => {
    if (snippetTimeoutRef.current) {
      clearTimeout(snippetTimeoutRef.current);
      snippetTimeoutRef.current = null;
    }
    const { currentTime, history, queue, currentSong, snippetDurationConfig } = playerStateRef.current;
    if (currentTime > 3 && currentSoundRef.current) {
      currentSoundRef.current.seek(0);
      setPlayerState(prev => ({ ...prev, currentTime: 0 }));
      if (playerStateRef.current.status !== PlaybackStatus.Playing) {
        const ready = await ensureAudioSystemReady();
        if (ready && currentSoundRef.current) {
          if (playerStateRef.current.isSnippetMode) {
            const sound = currentSoundRef.current;
            const songDurationVal = sound.duration();
            if (songDurationVal && songDurationVal > snippetDurationConfig) {
              if (snippetTimeoutRef.current) clearTimeout(snippetTimeoutRef.current);
              snippetTimeoutRef.current = window.setTimeout(() => {
                nextTrackRef.current(true);
              }, snippetDurationConfig * 1000);
            }
          }
          currentSoundRef.current.play();
        }
      }
      return;
    }
    let songToPlay: SunoClip | null = null;
    if (history.length > 0) { songToPlay = history[0]; setPlayerState(prev => ({ ...prev, history: prev.history.slice(1) })); }
    else if (currentSong) { const currentIndex = queue.findIndex(s => s.id === currentSong.id); if (currentIndex > 0) songToPlay = queue[currentIndex - 1]; else if (queue.length > 0) songToPlay = queue[queue.length - 1]; }
    if (songToPlay) playSong(songToPlay);
    else if (currentSoundRef.current) currentSoundRef.current.seek(0);
  }, [playSong, ensureAudioSystemReady, setPlayerState]);

  const seek = useCallback((time: number) => {
    if (currentSoundRef.current && playerStateRef.current.duration > 0 && isAudioSystemReady) {
      const newTime = Math.max(0, Math.min(time, playerStateRef.current.duration));
      currentSoundRef.current.seek(newTime);
      setPlayerState(prev => ({ ...prev, currentTime: newTime }));

      if (playerStateRef.current.isSnippetMode) {
        if (snippetTimeoutRef.current) clearTimeout(snippetTimeoutRef.current);
        const sound = currentSoundRef.current;
        const songDurationVal = sound.duration();
        const currentSnippetDuration = playerStateRef.current.snippetDurationConfig;
        if (songDurationVal) {
          const remainingSongTimeAfterSeek = songDurationVal - newTime;
          if (playerStateRef.current.status === PlaybackStatus.Playing) {
            if (remainingSongTimeAfterSeek > currentSnippetDuration) {
              snippetTimeoutRef.current = window.setTimeout(() => {
                nextTrackRef.current(true);
              }, currentSnippetDuration * 1000);
            }
          }
        }
      }
    }
  }, [isAudioSystemReady, nextTrackRef, setPlayerState]);

  useEffect(() => { if ('mediaSession' in navigator) { navigator.mediaSession.setActionHandler('play', () => togglePlayPause()); navigator.mediaSession.setActionHandler('pause', () => togglePlayPause()); navigator.mediaSession.setActionHandler('previoustrack', () => previousTrack()); navigator.mediaSession.setActionHandler('nexttrack', () => nextTrack(false)); try { navigator.mediaSession.setActionHandler('seekto', (details) => { if (details.fastSeek || details.seekTime == null) return; seek(details.seekTime); }); } catch (error) { console.warn("Error setting mediaSession seekto:", error); } } }, [togglePlayPause, previousTrack, nextTrack, seek]);
  const setVolume = useCallback((newVolume: number) => { const clampedVolume = Math.max(0, Math.min(1, newVolume)); setPlayerState(prev => ({ ...prev, volume: clampedVolume })); }, [setPlayerState]);
  useEffect(() => { 
    let animationFrameId: number | null = null; 
    const progressLoop = () => { 
      if (currentSoundRef.current && playerStateRef.current.status === PlaybackStatus.Playing && playerStateRef.current.duration > 0) { 
        const seekTime = currentSoundRef.current.seek() as number; 
        if (Math.abs(seekTime - playerStateRef.current.currentTime) > 0.1) setPlayerState(prev => ({ ...prev, currentTime: seekTime })); 
      } 
      animationFrameId = requestAnimationFrame(progressLoop); 
    }; 
    if (playerState.status === PlaybackStatus.Playing && playerState.duration > 0) animationFrameId = requestAnimationFrame(progressLoop); 
    return () => { if (animationFrameId) cancelAnimationFrame(animationFrameId); }; 
  }, [playerState.status, playerState.duration, setPlayerState]);

  useEffect(() => {      // Audio context management is now handled by the useSunoAudioSystem hook.
      // If we need to trigger a specific cleanup here, we can do it via the hook's interface.
}, [playerState.volume, isAudioSystemReady]);
  const setEqGain = useCallback((bandId: string, gain: number) => { setPlayerState(prevState => ({ ...prevState, eqBands: prevState.eqBands.map(b => b.id === bandId ? { ...b, gain } : b) })); if (isAudioSystemReady) { const bandConfig = playerStateRef.current.eqBands.find(b => b.id === bandId); if (bandConfig && ((bandConfig.gain !== 0 && gain === 0) || (bandConfig.gain === 0 && gain !== 0) || (Math.abs(bandConfig.gain - gain) > 0.5))) trackLocalEvent(TOOL_CATEGORY_PLAYER, 'eqAdjusted', bandId, 1); } }, [trackLocalEvent, isAudioSystemReady, setPlayerState]);
  const applyEqPreset = useCallback((presetKey: string) => { const preset = EQ_PRESETS[presetKey]; if (preset) { setPlayerState(prev => ({ ...prev, eqBands: prev.eqBands.map((band, index) => ({ ...band, gain: preset.gains[index] ?? 0 })) })); if (isAudioSystemReady) trackLocalEvent(TOOL_CATEGORY_PLAYER, 'eqPresetApplied', preset.label, 1); } }, [trackLocalEvent, isAudioSystemReady, setPlayerState]);

  const toggleShuffle = useCallback(() => {
    const newShuffleState = !playerStateRef.current.isShuffle;
    if (newShuffleState) {
      setManualOrderSongIds(null);
    }
    setPlayerState(prev => ({ ...prev, isShuffle: newShuffleState }));
    if (isAudioSystemReady) trackLocalEvent(TOOL_CATEGORY_PLAYER, 'shuffleToggled', newShuffleState ? 'on' : 'off', 1);
  }, [trackLocalEvent, isAudioSystemReady, setPlayerState]);

  const toggleSnippetMode = useCallback(() => {
    const oldIsSnippetMode = playerStateRef.current.isSnippetMode;
    const newIsSnippetMode = !oldIsSnippetMode;
    const currentSnippetDuration = playerStateRef.current.snippetDurationConfig;

    setPlayerState(prev => ({ ...prev, isSnippetMode: newIsSnippetMode }));
    trackLocalEvent(TOOL_CATEGORY_PLAYER, 'snippetModeToggled', newIsSnippetMode ? 'on' : 'off', 1);

    if (snippetTimeoutRef.current) {
      clearTimeout(snippetTimeoutRef.current);
      snippetTimeoutRef.current = null;
    }

    if (newIsSnippetMode && playerStateRef.current.currentSong && currentSoundRef.current &&
      playerStateRef.current.status === PlaybackStatus.Playing
    ) {
      const sound = currentSoundRef.current;
      const currentTime = sound.seek() as number;
      const songDurationVal = sound.duration();
      if (songDurationVal) {
        const remainingSongTime = songDurationVal - currentTime;
        if (remainingSongTime > 0) {
          if (remainingSongTime > currentSnippetDuration) {
            snippetTimeoutRef.current = window.setTimeout(() => {
              nextTrackRef.current(true);
            }, currentSnippetDuration * 1000);
          }
        }
      }
    }
  }, [trackLocalEvent, nextTrackRef, setPlayerState]);

  const formatTime = (secs: number): string => { if (isNaN(secs) || !isFinite(secs) || secs < 0) return '0:00'; const minutes = Math.floor(secs / 60); const seconds = Math.floor(secs % 60); return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`; };
  useEffect(() => { return () => { if (currentSoundRef.current) { currentSoundRef.current.unload(); currentSoundRef.current = null; } if (snippetTimeoutRef.current) { clearTimeout(snippetTimeoutRef.current); snippetTimeoutRef.current = null; } }; }, []);

  // Handlers for main control button actions are now derived directly from the useSunoInputProcessor hook above.

  useEffect(() => { return () => { if (clearDataTimeoutRef.current) clearTimeout(clearDataTimeoutRef.current); if (snippetTimeoutRef.current) clearTimeout(snippetTimeoutRef.current); }; }, []);

  const handleAppendToSavedPlaylistLocally = useCallback((playlistId: string, contentToAppend: string) => {
    const playlistToUpdate = savedCustomPlaylists.find(p => p.id === playlistId);
    if (!playlistToUpdate) return;

    if (!contentToAppend.trim()) {
      setDataManagementStatus("Nothing to append. The main input area is empty.");
      setTimeout(() => setDataManagementStatus(''), 3000);
      return;
    }

    const newContent = `${playlistToUpdate.content}\n${contentToAppend}`.trim();

    const updatedPlaylists = savedCustomPlaylists.map(p =>
      p.id === playlistId
        ? { ...p, content: newContent, updatedAt: new Date().toISOString() }
        : p
    );
    setSavedCustomPlaylists(updatedPlaylists);
    setDataManagementStatus(`Appended content to "${playlistToUpdate.name}"!`);
    trackLocalEvent(TOOL_CATEGORY_PLAYER, 'localPlaylistAppended', playlistToUpdate.name);
    setTimeout(() => setDataManagementStatus(''), 3000);
  }, [savedCustomPlaylists, trackLocalEvent]);

  const handleExportPlaylistCsv = useCallback(() => 
    handleExportPlaylistCsvInternal(playerState.queue, currentIdentifierType, profileDetail, playlistDetail, currentIdentifier), 
    [playerState.queue, currentIdentifierType, profileDetail, playlistDetail, currentIdentifier, handleExportPlaylistCsvInternal]
  );

  const handleExportCurrentPlaylistToFile = useCallback(() => 
    handleExportCurrentPlaylistToFileInternal(playerState.queue, originalSongsList, currentIdentifierType, profileDetail, playlistDetail, currentIdentifier),
    [playerState.queue, originalSongsList, currentIdentifierType, profileDetail, playlistDetail, currentIdentifier, handleExportCurrentPlaylistToFileInternal]
  );

  const handleImportPlaylistFromTxtFile = useCallback((event: React.ChangeEvent<HTMLInputElement>) => 
    handleImportPlaylistFromTxtFileInternal(event, setIdentifierInput),
    [handleImportPlaylistFromTxtFileInternal, setIdentifierInput]
  );

  const handleImportPlaylistFromCsvFile = useCallback((event: React.ChangeEvent<HTMLInputElement>) => 
    handleImportPlaylistFromCsvFileInternal(event, setIdentifierInput),
    [handleImportPlaylistFromCsvFileInternal, setIdentifierInput]
  );

  const handleSaveCurrentPlaylistLocally = useCallback((name: string) => {
    let contentToSave = '';
    if (currentIdentifierType === 'custom_list' && identifierInput) {
      contentToSave = identifierInput;
    } else if (originalSongsList.length > 0) {
      contentToSave = originalSongsList.map(song => song.suno_song_url || `https://suno.com/song/${song.id}`).join('\n');
    }
    handleSaveCurrentPlaylistLocallyInternal(name, contentToSave);
  }, [currentIdentifierType, identifierInput, originalSongsList, handleSaveCurrentPlaylistLocallyInternal]);

  const handleUpdateSavedPlaylistLocally = useCallback((playlistId: string) => {
    const newContent = playerState.queue.map(song => song.suno_song_url || `https://suno.com/song/${song.id}`).join('\n');
    handleUpdateSavedPlaylistLocallyInternal(playlistId, newContent);
  }, [playerState.queue, handleUpdateSavedPlaylistLocallyInternal]);

  const handleLoadSavedPlaylistLocally = useCallback((playlistId: string) => {
    const playlist = savedCustomPlaylists.find(p => p.id === playlistId);
    if (playlist) {
      setIdentifierInput(playlist.content);
      setCurrentIdentifier(`local_saved_${playlistId}`);
      setCurrentIdentifierType('custom_list');
      trackLocalEvent(TOOL_CATEGORY_PLAYER, 'playlistLoadedLocally', playlist.name);
    }
  }, [savedCustomPlaylists, setIdentifierInput, trackLocalEvent]);

  const handleClearAllSavedPlaylists = useCallback(() => {
    if (clearDataTimeoutRef.current) clearTimeout(clearDataTimeoutRef.current);
    const newClickCount = clearAllSavedPlaylistsClickCount + 1;
    setClearAllSavedPlaylistsClickCount(newClickCount);
    if (newClickCount >= 3) {
      setSavedCustomPlaylists([]);
      localStorage.removeItem(LOCAL_STORAGE_SAVED_CUSTOM_PLAYLISTS_KEY);
      setDataManagementStatus('All saved custom playlists cleared.');
      trackLocalEvent(TOOL_CATEGORY_PLAYER, 'allSavedPlaylistsCleared', undefined, 1);
      setClearAllSavedPlaylistsClickCount(0);
      clearDataTimeoutRef.current = null;
      setTimeout(() => setDataManagementStatus(''), 3000);
    } else {
      setDataManagementStatus(`Click ${3 - newClickCount} more times to clear ALL saved playlists.`);
      clearDataTimeoutRef.current = window.setTimeout(() => {
        setClearAllSavedPlaylistsClickCount(0);
        setDataManagementStatus('');
        clearDataTimeoutRef.current = null;
      }, 3000);
    }
  }, [clearAllSavedPlaylistsClickCount, trackLocalEvent, setSavedCustomPlaylists, setDataManagementStatus]);

  const getClearAllSavedPlaylistsButtonText = useCallback((): string => {
    if (clearAllSavedPlaylistsClickCount > 0 && clearAllSavedPlaylistsClickCount < 3) return `Confirm Clear Saved Playlists (${3 - clearAllSavedPlaylistsClickCount} left)`;
    return 'Clear All Saved Playlists';
  }, [clearAllSavedPlaylistsClickCount]);

  const handleDeleteSavedPlaylistLocallyInternal = useCallback((playlistId: string) => {
    handleDeleteSavedPlaylistLocally(playlistId);
  }, [handleDeleteSavedPlaylistLocally]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const targetNodeName = (event.target as HTMLElement)?.nodeName;
      if (targetNodeName === 'INPUT' || targetNodeName === 'TEXTAREA' || targetNodeName === 'SELECT' || (event.target as HTMLElement)?.closest('[role="dialog"]')) {
        return;
      }

      let keyboardShortcutUsed = false;
      switch (event.key) {
        case ' ':
          event.preventDefault();
          togglePlayPause();
          keyboardShortcutUsed = true;
          break;
        case 'ArrowRight':
          nextTrack(false);
          keyboardShortcutUsed = true;
          break;
        case 'ArrowLeft':
          previousTrack();
          keyboardShortcutUsed = true;
          break;
        case 'ArrowUp':
          event.preventDefault();
          setVolume(Math.min(1, playerStateRef.current.volume + 0.05));
          keyboardShortcutUsed = true;
          break;
        case 'ArrowDown':
          event.preventDefault();
          setVolume(Math.max(0, playerStateRef.current.volume - 0.05));
          keyboardShortcutUsed = true;
          break;
        case 's':
        case 'S':
          toggleShuffle();
          keyboardShortcutUsed = true;
          break;
        case 'n':
        case 'N':
          toggleSnippetMode();
          keyboardShortcutUsed = true;
          break;
      }
      if (keyboardShortcutUsed) trackLocalEvent(TOOL_CATEGORY_PLAYER, 'keyboardShortcutUsed', event.key);
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [togglePlayPause, nextTrack, previousTrack, setVolume, toggleShuffle, toggleSnippetMode, trackLocalEvent]);
  return {
    identifierInput, setIdentifierInput, currentIdentifier, currentIdentifierType,
    isFetchingOrLoading, fetchProgress, uiError: uiErrorHook,
    profileDetail, playlistDetail,    playlistAnalysis,
    originalSongsList,
    sortCriteria,
    setSortCriteria,
    filterQuery,
    setFilterQuery,
    lastFetchedTimestamp,
    mainButtonText,
    showDataManagement,
    clearPlayerCacheClickCount,
    handleClearPlayerCache,
    getClearPlayerCacheButtonText,
    clearAllHubDataClickCount,
    handleClearAllHubDataFromPlayer,
    getClearAllHubDataButtonText,
    dataManagementStatus,
    playerState,
    analyserNodes,
    playSong,
    togglePlayPause,
    nextTrack,
    previousTrack,
    seek,
    setVolume,
    setEqGain,
    applyEqPreset,
    toggleShuffle,
    toggleSnippetMode,
    setSnippetDurationConfig,
    formatTime: (secs: number) => {
      const mins = Math.floor(secs / 60);
      const s = Math.floor(secs % 60);
      return `${mins}:${s.toString().padStart(2, '0')}`;
    },
    isLoading: isFetchingOrLoading || isLoadingPlayer,
    error: errorPlayerHook,
    setErrorPlayer,
    handleMainButtonClick, handleAppendSongs, parseInput, handleReorderQueue,
    handleExportPlaylistCsv,
    savedCustomPlaylists, handleExportCurrentPlaylistToFile,
    handleImportPlaylistFromTxtFile,
    handleImportPlaylistFromCsvFile,
    handleSaveCurrentPlaylistLocally,
    handleUpdateSavedPlaylistLocally, handleAppendToSavedPlaylistLocally,
    handleLoadSavedPlaylistLocally, handleDeleteSavedPlaylistLocally: handleDeleteSavedPlaylistLocallyInternal,
    handleClearAllSavedPlaylists, getClearAllSavedPlaylistsButtonText, clearAllSavedPlaylistsClickCount,
    handleClearSongInfoCache: handleClearPlayerCache, getClearSongInfoCacheButtonText: getClearPlayerCacheButtonText, clearSongInfoCacheClickCount: clearPlayerCacheClickCount,
    removeSongFromQueue,
    handleClearQueue, getClearQueueButtonText,
  };
};
