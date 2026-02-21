import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Howl, Howler } from 'howler';
import type { SunoClip, RiffusionSongData, EqualizerBand, PlayerState, SunoProfileDetail, SunoPlaylistDetail, SunoMusicPlayerStoredData, SavedCustomPlaylist, PlaylistAnalysis } from '../types';
import { PlaybackStatus } from '../types';
import { fetchSunoClipById, fetchSunoSongsByUsername, fetchSunoPlaylistById, extractSunoSongIdFromPath as extractSunoSongIdFromPathFromService, resolveSunoUrlToPotentialSongId } from '../services/sunoService';
import { fetchRiffusionSongData, extractRiffusionSongId } from '../services/riffusionService';
import { downloadSunoPlaylistAsCsv } from '../services/csvExportService';

Howler.autoSuspend = false;
Howler.autoUnlock = false;

const LOCAL_STORAGE_PREFIX_USER = 'sunoMusicPlayer_user_';
const LOCAL_STORAGE_PREFIX_PLAYLIST = 'sunoMusicPlayer_playlist_';
const LOCAL_STORAGE_CLIP_DETAIL_CACHE_KEY = 'sunoMusicPlayer_clipDetailCache_v1';
const LOCAL_STORAGE_SAVED_CUSTOM_PLAYLISTS_KEY = 'sunoMusicPlayer_savedCustomPlaylists_v1';
const LOCAL_STORAGE_SNIPPET_DURATION_KEY = 'sunoMusicPlayer_snippetDuration_v1';
const CLEAR_CLICKS_NEEDED = 3;
const CLEAR_TIMEOUT_MS = 3000;

const DEFAULT_SNIPPET_DURATION_SECONDS = 30;
const MIN_SNIPPET_DURATION_SECONDS = 5;
const MAX_SNIPPET_DURATION_SECONDS = 180;


const DEFAULT_EQ_BANDS_CONFIG: Omit<EqualizerBand, 'node'>[] = [
  { id: 'band-60Hz', frequency: 60, gain: 0, type: 'lowshelf' },
  { id: 'band-170Hz', frequency: 170, gain: 0, type: 'peaking' },
  { id: 'band-310Hz', frequency: 310, gain: 0, type: 'peaking' },
  { id: 'band-600Hz', frequency: 600, gain: 0, type: 'peaking' },
  { id: 'band-1kHz', frequency: 1000, gain: 0, type: 'peaking' },
  { id: 'band-3kHz', frequency: 3000, gain: 0, type: 'peaking' },
  { id: 'band-6kHz', frequency: 6000, gain: 0, type: 'peaking' },
  { id: 'band-12kHz', frequency: 12000, gain: 0, type: 'peaking' },
  { id: 'band-14kHz', frequency: 14000, gain: 0, type: 'highshelf' },
  { id: 'band-16kHz', frequency: 16000, gain: 0, type: 'highshelf' },
];

const EQ_PRESETS: Record<string, { label: string, gains: number[] }> = {
  flat: { label: "Flat", gains: Array(DEFAULT_EQ_BANDS_CONFIG.length).fill(0) },
  bassBoost: { label: "Bass Boost", gains: [6, 5, 4, 2, 0, 0, 0, 0, 0, 0] },
  vocalClarity: { label: "Vocal Clarity", gains: [-2, -1, 0, 2, 3, 3, 2, 0, -1, -2] },
  trebleBoost: { label: "Treble Boost", gains: [0, 0, 0, 0, 0, 2, 4, 5, 6, 6] },
  rock: { label: "Rock", gains: [3, 2, 1, -1, 0, 1, 2, 3, 2, 1] },
  electronic: { label: "Electronic", gains: [4, 3, 1, 0, -1, 1, 3, 4, 3, 2] },
};

const TOOL_CATEGORY_PLAYER = 'SunoMusicPlayer';

export type SortCriteriaHook = 'default' | 'play_count' | 'upvote_count' | 'created_at' | 'title';

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

const sunoPlaylistUrlPatternHook = /^(?:https?:\/\/)?(?:www\.)?(?:suno\.com|app\.suno\.ai)\/playlist\/([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})/;
const sunoUserProfileUrlPatternHook = /^(?:https?:\/\/)?(?:www\.)?(?:suno\.com|app\.suno\.ai)\/@([\w.-]+)/;
const riffusionUrlPatternHook = /^(?:https?:\/\/)?(?:www\.)?riffusion\.com\/song\/([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})/;


const knownAppLocalStorageKeys = [
  'aiMultiToolHub_cookieConsent', 'myVisitsLog', 'lastDailyLocalActivePing',
  'musicStyleHistory_v2', 'musicStyleFavorites_v2', 'RMS_optionalCategoryToggles_v1',
  'creativeConceptHistory_v2', 'creativeConceptFavorites_v2',
  'chordProgFavorites_v1',
  'sunoMusicPlayer_eqBands_v1', 'sunoMusicPlayer_volume_v1',
  LOCAL_STORAGE_CLIP_DETAIL_CACHE_KEY,
  LOCAL_STORAGE_SAVED_CUSTOM_PLAYLISTS_KEY,
  LOCAL_STORAGE_SNIPPET_DURATION_KEY,
  'deckPickerPickedSongsLog_v1',
  'lyricsToProcessForLyricProcessor',
  'songCoverArt_savedStylePresets_v1',
  'SCS_savedWheelConfigs_MagicSpinWheel_v3',
  'sparkTuneChallenges_v1',
  'songDeckPicker_songInfoCache_v1',
];
const knownAppLocalStoragePrefixes = [
  'stat_', 'statEvents_',
  'RMS_custom_', 'CCB_custom_',
  'sunoUserStats_',
  LOCAL_STORAGE_PREFIX_USER,
  LOCAL_STORAGE_PREFIX_PLAYLIST,
  'SCS_current_MagicSpinWheel_v3_',
];

const parseCsvLine = (line: string): string[] => {
  const cells: string[] = [];
  let inQuotes = false;
  let currentCell = "";
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
        currentCell += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      cells.push(currentCell.trim());
      currentCell = "";
    } else {
      currentCell += char;
    }
  }
  cells.push(currentCell.trim());
  return cells.map(cell => {
    if (cell.startsWith('"') && cell.endsWith('"')) {
      return cell.slice(1, -1).replace(/""/g, '"');
    }
    return cell;
  });
};

const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

const summarizeCustomList = (clips: SunoClip[]): SunoProfileDetail => {
  const totalPlays = clips.reduce((sum, clip) => sum + (clip.play_count || 0), 0);
  const totalUpvotes = clips.reduce((sum, clip) => sum + (clip.upvote_count || 0), 0);
  const totalComments = clips.reduce((sum, clip) => sum + (clip.comment_count || 0), 0);

  return {
    user_id: "custom_list_synthetic_id",
    display_name: "Custom Mixed List",
    handle: "custom_list",
    bio: `A custom-built list of ${clips.length} songs.`,
    image_url: null,
    is_following: false,
    total_plays: totalPlays,
    total_upvotes: totalUpvotes,
    total_comments: totalComments,
    num_total_clips: clips.length
  };
};

const isLikelyUrl = (line: string): boolean => {
  // Add a protocol if it's missing to help URL constructor
  const urlString = line.startsWith('http') ? line : `https://${line}`;
  try {
    new URL(urlString);
    // A simple check to avoid matching single words as URLs
    return line.includes('.') && !line.includes(' ');
  } catch (_) {
    return false;
  }
};

export const useSunoAudioPlayer = ({
  initialVolume = 0.75,
  initialShuffle = false,
  trackLocalEvent,
}: UseSunoAudioPlayerProps): UseSunoAudioPlayerReturn => {
  const [identifierInput, setIdentifierInput] = useState<string>('');
  const [currentIdentifier, setCurrentIdentifier] = useState<string>('');
  const [currentIdentifierType, setCurrentIdentifierType] = useState<'user' | 'playlist' | 'custom_list' | null>(null);

  const [isFetchingOrLoading, setIsFetchingOrLoading] = useState<boolean>(false);
  const [fetchProgress, setFetchProgress] = useState<string>('');
  const [uiErrorHook, setUiErrorHookInternal] = useState<string | null>(null);

  const [profileDetail, setProfileDetail] = useState<SunoProfileDetail | null>(null);
  const [playlistDetail, setPlaylistDetail] = useState<SunoPlaylistDetail | null>(null);
  const [playlistAnalysis, setPlaylistAnalysis] = useState<PlaylistAnalysis | null>(null);

  const [fetchedUsernames, setFetchedUsernames] = useState<Set<string>>(new Set());
  const [fetchedPlaylistIds, setFetchedPlaylistIds] = useState<Set<string>>(new Set());

  const [originalSongsList, setOriginalSongsListInternal] = useState<SunoClip[]>([]);
  const [sortCriteriaInternalState, setSortCriteriaInternalState] = useState<SortCriteriaHook>('default');
  const [filterQuery, setFilterQuery] = useState<string>('');
  const [manualOrderSongIds, setManualOrderSongIds] = useState<string[] | null>(null);

  const [lastFetchedTimestamp, setLastFetchedTimestamp] = useState<string | null>(null);
  const [mainButtonText, setMainButtonText] = useState<string>('Fetch / Load');
  const [showDataManagement, setShowDataManagement] = useState<boolean>(true);

  const [clearPlayerCacheClickCount, setClearPlayerCacheClickCount] = useState(0);
  const [clearAllHubDataClickCount, setClearAllHubDataClickCount] = useState(0);
  const [dataManagementStatus, setDataManagementStatus] = useState('');
  const clearDataTimeoutRef = useRef<number | null>(null);
  const [clearQueueClickCount, setClearQueueClickCount] = useState(0);
  const clearQueueTimeoutRef = useRef<number | null>(null);


  const [songInfoCache, setSongInfoCache] = useState<Map<string, SunoClip>>(new Map());
  const [clearSongInfoCacheClickCount, setClearSongInfoCacheClickCount] = useState(0);

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
  const [isAudioSystemReady, setIsAudioSystemReady] = useState<boolean>(false);

  const currentSoundRef = useRef<Howl | null>(null);
  const currentPlayingSongIdRef = useRef<string | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserNodeLeftRef = useRef<AnalyserNode | null>(null);
  const analyserNodeRightRef = useRef<AnalyserNode | null>(null);
  const channelSplitterRef = useRef<ChannelSplitterNode | null>(null);
  const channelMergerRef = useRef<ChannelMergerNode | null>(null);
  const eqNodesRef = useRef<BiquadFilterNode[]>([]);
  const masterGainRef = useRef<GainNode | null>(null);
  const isAudioGraphConstructedRef = useRef(false);

  const [savedCustomPlaylists, setSavedCustomPlaylists] = useState<SavedCustomPlaylist[]>([]);
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


  useEffect(() => {
    try { const storedPlaylists = localStorage.getItem(LOCAL_STORAGE_SAVED_CUSTOM_PLAYLISTS_KEY); if (storedPlaylists) setSavedCustomPlaylists(JSON.parse(storedPlaylists)); } catch (e) { console.error("Error loading saved custom playlists:", e); setSavedCustomPlaylists([]); }
    try { const storedClipCache = localStorage.getItem(LOCAL_STORAGE_CLIP_DETAIL_CACHE_KEY); if (storedClipCache) setSongInfoCache(new Map(JSON.parse(storedClipCache))); } catch (e) { console.error("Error loading song detail cache:", e); setSongInfoCache(new Map()); }
  }, []);
  useEffect(() => { try { localStorage.setItem(LOCAL_STORAGE_SAVED_CUSTOM_PLAYLISTS_KEY, JSON.stringify(savedCustomPlaylists)); } catch (e) { console.error("Error saving custom playlists:", e); } }, [savedCustomPlaylists]);
  useEffect(() => { try { localStorage.setItem(LOCAL_STORAGE_CLIP_DETAIL_CACHE_KEY, JSON.stringify(Array.from(songInfoCache.entries()))); } catch (e) { console.error("Error saving song detail cache:", e); } }, [songInfoCache]);

  const setSortCriteria = useCallback((newSortCriteria: SortCriteriaHook) => {
    setSortCriteriaInternalState(newSortCriteria);
    if (newSortCriteria !== 'default') {
      setManualOrderSongIds(null);
    }
  }, []);

  const setErrorPlayer = useCallback((error: string | null) => setErrorPlayerHookInternal(error), []);
  const setUiError = useCallback((update: React.SetStateAction<string | null>) => setUiErrorHookInternal(update), []);

  const nextTrackRef = useRef<(isAutoAdvance?: boolean) => void>(() => { });

  useEffect(() => {
    if ((currentIdentifierType !== 'playlist' && currentIdentifierType !== 'custom_list') || originalSongsList.length === 0) {
      setPlaylistAnalysis(null);
      return;
    }

    const commonGenres = ['pop', 'rock', 'electronic', 'hip hop', 'jazz', 'classical', 'folk', 'metal', 'blues', 'r&b', 'reggae', 'country', 'funk', 'soul', 'disco', 'punk', 'ambient', 'techno', 'house', 'trance', 'synthwave', 'lo-fi', 'chiptune', 'drill', 'edm', 'idm', 'dnb', 'drum and bass', 'jungle', 'garage', 'grime', 'dubstep', 'trap', 'vaporwave', 'shoegaze', 'post-punk', 'indie', 'alternative'];

    const totalClips = originalSongsList.length;
    const totalPlays = originalSongsList.reduce((sum, clip) => sum + (clip.play_count || 0), 0);
    const totalUpvotes = originalSongsList.reduce((sum, clip) => sum + (clip.upvote_count || 0), 0);
    const totalComments = originalSongsList.reduce((sum, clip) => sum + (clip.comment_count || 0), 0);

    const tagMap = new Map<string, number>();
    const artistMap = new Map<string, { name: string; count: number; profileUrl?: string }>();
    const dateMap = new Map<string, number>();

    originalSongsList.forEach(clip => {
      const artistHandle = clip.handle || 'unknown';
      let artistEntry = artistMap.get(artistHandle);

      if (!artistEntry) {
        let url = clip.suno_creator_url;
        if (!url && clip.source !== 'riffusion') {
          url = `https://suno.com/@${artistHandle}`;
        }
        artistEntry = { name: clip.display_name || artistHandle, count: 0, profileUrl: url };
      }

      artistEntry.count++;
      artistMap.set(artistHandle, artistEntry);

      const tags = clip.metadata?.tags?.split(',').map(t => t.trim().toLowerCase()).filter(Boolean) || [];
      tags.forEach(tag => {
        tagMap.set(tag, (tagMap.get(tag) || 0) + 1);
      });

      try {
        const month = new Date(clip.created_at).toISOString().slice(0, 7); // YYYY-MM
        dateMap.set(month, (dateMap.get(month) || 0) + 1);
      } catch (e) { }
    });

    const allTags = Array.from(tagMap.entries()).map(([name, count]) => ({ name, count }));
    const mostCommonTags = allTags.filter(t => !commonGenres.includes(t.name)).sort((a, b) => b.count - a.count).slice(0, 10);
    const mostCommonGenres = allTags.filter(t => commonGenres.includes(t.name)).sort((a, b) => b.count - a.count).slice(0, 10);

    const mostFeaturedArtists = Array.from(artistMap.entries())
      .map(([handle, data]) => ({ handle, name: data.name, count: data.count, profileUrl: data.profileUrl }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const creationDateDistribution = Array.from(dateMap.entries())
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => a.month.localeCompare(b.month));

    const analysis: PlaylistAnalysis = {
      totalClips, totalPlays, totalUpvotes, totalComments,
      avgPlays: totalClips > 0 ? totalPlays / totalClips : 0,
      avgUpvotes: totalClips > 0 ? totalUpvotes / totalClips : 0,
      avgComments: totalClips > 0 ? totalComments / totalClips : 0,
      mostCommonTags, mostCommonGenres, mostFeaturedArtists, creationDateDistribution
    };

    setPlaylistAnalysis(analysis);
  }, [originalSongsList, currentIdentifierType]);

  const prepareAudioContext = useCallback(async (): Promise<AudioContext | null> => { if (!audioContextRef.current || audioContextRef.current.state === 'closed') { if (audioContextRef.current && audioContextRef.current.state === 'closed') { isAudioGraphConstructedRef.current = false; if (masterGainRef.current) try { masterGainRef.current.disconnect(); } catch (e) { } masterGainRef.current = null; if (analyserNodeLeftRef.current) try { analyserNodeLeftRef.current.disconnect(); } catch (e) { } analyserNodeLeftRef.current = null; if (analyserNodeRightRef.current) try { analyserNodeRightRef.current.disconnect(); } catch (e) { } analyserNodeRightRef.current = null; if (channelSplitterRef.current) try { channelSplitterRef.current.disconnect(); } catch (e) { } channelSplitterRef.current = null; if (channelMergerRef.current) try { channelMergerRef.current.disconnect(); } catch (e) { } channelMergerRef.current = null; eqNodesRef.current.forEach(node => { try { node.disconnect(); } catch (e) { } }); eqNodesRef.current = []; } try { audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)(); } catch (e) { setErrorPlayer("Web Audio API is not supported by your browser."); return null; } } const audioCtx = audioContextRef.current; if (audioCtx.state === 'suspended') { try { await audioCtx.resume(); } catch (e) { setErrorPlayer("Failed to resume audio context. Please interact with the page (click/tap)."); return null; } } return audioCtx.state === 'running' ? audioCtx : null; }, [setErrorPlayer]);
  const initializeAudioGraphAndHowler = useCallback((audioCtx: AudioContext) => { let initialMasterGainValue = playerStateRef.current.volume; if (!isAudioGraphConstructedRef.current) { if (masterGainRef.current) try { masterGainRef.current.disconnect(); } catch (e) { } if (analyserNodeLeftRef.current) try { analyserNodeLeftRef.current.disconnect(); } catch (e) { } if (analyserNodeRightRef.current) try { analyserNodeRightRef.current.disconnect(); } catch (e) { } eqNodesRef.current.forEach(node => { try { node.disconnect(); } catch (e) { } }); masterGainRef.current = audioCtx.createGain(); analyserNodeLeftRef.current = audioCtx.createAnalyser(); analyserNodeLeftRef.current.fftSize = 256; analyserNodeRightRef.current = audioCtx.createAnalyser(); analyserNodeRightRef.current.fftSize = 256; channelSplitterRef.current = audioCtx.createChannelSplitter(2); channelMergerRef.current = audioCtx.createChannelMerger(2); eqNodesRef.current = DEFAULT_EQ_BANDS_CONFIG.map(bandConfig => { const filterNode = audioCtx.createBiquadFilter(); filterNode.type = bandConfig.type; filterNode.frequency.value = bandConfig.frequency; filterNode.gain.value = playerStateRef.current.eqBands.find(b => b.id === bandConfig.id)?.gain || 0; filterNode.Q.value = 1; return filterNode; }); isAudioGraphConstructedRef.current = true; } if (!masterGainRef.current || eqNodesRef.current.length !== DEFAULT_EQ_BANDS_CONFIG.length || !analyserNodeLeftRef.current || !analyserNodeRightRef.current || !channelSplitterRef.current || !channelMergerRef.current) { isAudioGraphConstructedRef.current = false; return false; } try { masterGainRef.current.disconnect(); } catch (e) { } eqNodesRef.current.forEach(node => { try { node.disconnect(); } catch (e) { } }); try { channelSplitterRef.current.disconnect(); } catch (e) { } try { channelMergerRef.current.disconnect(); } catch (e) { } let currentNode: AudioNode = masterGainRef.current; eqNodesRef.current.forEach(filterNode => { currentNode.connect(filterNode); currentNode = filterNode; }); const splitter = channelSplitterRef.current; const merger = channelMergerRef.current; const analyserLeft = analyserNodeLeftRef.current; const analyserRight = analyserNodeRightRef.current; currentNode.connect(splitter); splitter.connect(analyserLeft, 0, 0); splitter.connect(analyserRight, 1, 0); splitter.connect(merger, 0, 0); splitter.connect(merger, 1, 1); merger.connect(audioCtx.destination); if (masterGainRef.current.gain.value !== initialMasterGainValue) masterGainRef.current.gain.setValueAtTime(initialMasterGainValue, audioCtx.currentTime); playerStateRef.current.eqBands.forEach((bandConfig, index) => { const node = eqNodesRef.current[index]; if (node && node.gain.value !== bandConfig.gain) { try { node.gain.setValueAtTime(bandConfig.gain, audioCtx.currentTime); } catch (e) { if (audioCtx.state === 'closed') setIsAudioSystemReady(false); } } }); if (Howler.ctx !== audioCtx) Howler.ctx = audioCtx; if (Howler.masterGain !== masterGainRef.current) Howler.masterGain = masterGainRef.current; Howler.volume(playerStateRef.current.volume); return true; }, []);
  const ensureAudioSystemReady = useCallback(async (): Promise<boolean> => { if (isAudioSystemReady && audioContextRef.current && audioContextRef.current.state === 'running' && Howler.ctx === audioContextRef.current && Howler.masterGain === masterGainRef.current) return true; const audioCtx = await prepareAudioContext(); if (!audioCtx || audioCtx.state !== 'running') { setErrorPlayer("Audio system setup failed. Context not running. Please interact and try again."); setIsAudioSystemReady(false); return false; } if (initializeAudioGraphAndHowler(audioCtx)) { setIsAudioSystemReady(true); return true; } setErrorPlayer("Audio system graph initialization failed. Please interact and try again."); setIsAudioSystemReady(false); return false; }, [isAudioSystemReady, prepareAudioContext, initializeAudioGraphAndHowler, setErrorPlayer]);
  useEffect(() => { if ('mediaSession' in navigator) { if (playerState.currentSong) { navigator.mediaSession.metadata = new MediaMetadata({ title: playerState.currentSong.title, artist: playerState.currentSong.display_name, album: `Suno: @${playerState.currentSong.handle}`, artwork: playerState.currentSong.image_url ? [{ src: playerState.currentSong.image_url, sizes: '512x512', type: 'image/png' }] : [], }); navigator.mediaSession.playbackState = playerState.status === PlaybackStatus.Playing ? "playing" : "paused"; } else { navigator.mediaSession.metadata = null; navigator.mediaSession.playbackState = "none"; } } }, [playerState.currentSong, playerState.status]);
  const updateEqGains = useCallback((currentBands: EqualizerBand[]) => { const audioCtx = audioContextRef.current; if (!audioCtx || !isAudioGraphConstructedRef.current || !isAudioSystemReady || eqNodesRef.current.length === 0 || audioCtx.state !== 'running') return; currentBands.forEach((bandConfig, index) => { const node = eqNodesRef.current[index]; if (node && node.gain.value !== bandConfig.gain) { try { node.gain.setValueAtTime(bandConfig.gain, audioCtx.currentTime); } catch (e) { if (audioCtx.state === 'closed') setIsAudioSystemReady(false); } } }); }, [isAudioSystemReady]);
  useEffect(() => { if (isAudioSystemReady && playerState.eqBands) updateEqGains(playerState.eqBands); }, [playerState.eqBands, isAudioSystemReady, updateEqGains]);
  useEffect(() => { let animationFrameId: number | null = null; const progressLoop = () => { if (currentSoundRef.current && playerStateRef.current.status === PlaybackStatus.Playing && playerStateRef.current.duration > 0) { const seekTime = currentSoundRef.current.seek() as number; if (Math.abs(seekTime - playerStateRef.current.currentTime) > 0.1) setPlayerState(prev => ({ ...prev, currentTime: seekTime })); } animationFrameId = requestAnimationFrame(progressLoop); }; if (playerState.status === PlaybackStatus.Playing && playerState.duration > 0) animationFrameId = requestAnimationFrame(progressLoop); return () => { if (animationFrameId) cancelAnimationFrame(animationFrameId); }; }, [playerState.status, playerState.duration, setPlayerState]);

  useEffect(() => {
    let processedSongs = [...originalSongsList];

    if (filterQuery) {
      processedSongs = processedSongs.filter(song =>
        song.title.toLowerCase().includes(filterQuery.toLowerCase()) ||
        (song.display_name && song.display_name.toLowerCase().includes(filterQuery.toLowerCase())) ||
        (song.handle && song.handle.toLowerCase().includes(filterQuery.toLowerCase())) ||
        (song.metadata?.tags && song.metadata.tags.toLowerCase().includes(filterQuery.toLowerCase()))
      );
    }

    if (!playerState.isShuffle) {
      if (manualOrderSongIds && sortCriteriaInternalState === 'default') {
        const songIdToSongMap = new Map(processedSongs.map(s => [s.id, s]));
        const orderedPart = manualOrderSongIds
          .map(id => songIdToSongMap.get(id))
          .filter(Boolean) as SunoClip[];
        const orderedPartIds = new Set(orderedPart.map(s => s.id));
        const remainingSongs = processedSongs.filter(s => !orderedPartIds.has(s.id));
        processedSongs = [...orderedPart, ...remainingSongs];
      } else if (sortCriteriaInternalState !== 'default') {
        switch (sortCriteriaInternalState) {
          case 'play_count': processedSongs.sort((a, b) => (b.play_count || 0) - (a.play_count || 0)); break;
          case 'upvote_count': processedSongs.sort((a, b) => (b.upvote_count || 0) - (a.upvote_count || 0)); break;
          case 'created_at': processedSongs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()); break;
          case 'title': processedSongs.sort((a, b) => a.title.localeCompare(b.title)); break;
        }
      }
    }

    if (playerState.isShuffle) {
      processedSongs = shuffleArray(processedSongs);
    }

    setPlayerState(prev => ({ ...prev, queue: processedSongs }));

  }, [originalSongsList, filterQuery, sortCriteriaInternalState, playerState.isShuffle, manualOrderSongIds, setPlayerState]);

  useEffect(() => {
    setPlayerState(prev => ({ ...prev, originalOrder: originalSongsList }));
    setManualOrderSongIds(null);
  }, [originalSongsList, setPlayerState]);


  const playSong = useCallback(async (song: SunoClip, isResuming = false) => {
    setErrorPlayer(null);
    setIsFetchingOrLoading(true);
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
      setIsFetchingOrLoading(false);
      setPlayerState(prev => ({ ...prev, status: PlaybackStatus.Error, currentSong: null }));
      currentPlayingSongIdRef.current = null;
      return;
    }

    const audioCtx = audioContextRef.current;
    if (audioCtx) {
      const buffer = audioCtx.createBuffer(1, 1, audioCtx.sampleRate);
      const microSoundSource = audioCtx.createBufferSource();
      microSoundSource.buffer = buffer;
      microSoundSource.connect(audioCtx.destination);
      try { const currentTimeForMicroSound = audioCtx.currentTime; microSoundSource.start(currentTimeForMicroSound); microSoundSource.stop(currentTimeForMicroSound + 0.05); } catch (e) { if (audioCtx.state === 'closed') { setIsAudioSystemReady(false); isAudioGraphConstructedRef.current = false; } }
    } else { setIsFetchingOrLoading(false); setPlayerState(prev => ({ ...prev, status: PlaybackStatus.Error, currentSong: null })); currentPlayingSongIdRef.current = null; return; }

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
        setIsFetchingOrLoading(false);

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
      onloaderror: (id, err) => { setErrorPlayer(`Error loading: ${song.title}. ${String(err)}`); setIsFetchingOrLoading(false); setPlayerState(prev => ({ ...prev, status: PlaybackStatus.Error, currentSong: prev.currentSong?.id === song.id ? null : prev.currentSong })); if (currentPlayingSongIdRef.current === song.id) currentPlayingSongIdRef.current = null; },
      onplayerror: (id, err) => { setErrorPlayer(`Error playing: ${song.title}. ${String(err)}`); setIsFetchingOrLoading(false); setPlayerState(prev => ({ ...prev, status: PlaybackStatus.Error, currentSong: prev.currentSong?.id === song.id ? null : prev.currentSong })); if (currentPlayingSongIdRef.current === song.id) currentPlayingSongIdRef.current = null; }
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
  useEffect(() => { const audioCtx = audioContextRef.current; if (isAudioSystemReady && masterGainRef.current && audioCtx && audioCtx.state === 'running') { if (masterGainRef.current.gain.value !== playerState.volume) masterGainRef.current.gain.setValueAtTime(playerState.volume, audioCtx.currentTime); } }, [playerState.volume, isAudioSystemReady]);
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
  useEffect(() => { return () => { if (currentSoundRef.current) { currentSoundRef.current.unload(); currentSoundRef.current = null; } if (snippetTimeoutRef.current) { clearTimeout(snippetTimeoutRef.current); snippetTimeoutRef.current = null; } if (audioContextRef.current && audioContextRef.current.state !== 'closed') { audioContextRef.current.close().catch(e => console.warn("[AudioPlayer] Error closing AudioContext on hook unmount:", e)); audioContextRef.current = null; } }; }, []);

  const parseInput = useCallback((input: string): { type: 'user' | 'playlist' | 'custom_list' | 'riffusion' | null; id: string | null; nameHint?: string, rawInput?: string } => {
    const trimmedInput = input.trim();
    if (!trimmedInput) return { type: null, id: null };
    if (trimmedInput.includes('\n')) return { type: 'custom_list', id: 'custom_list_urls', nameHint: 'Custom Song List', rawInput: trimmedInput };

    if (trimmedInput.includes('producer.ai')) {
      const songId = extractRiffusionSongId(trimmedInput);
      if (songId) {
        return { type: 'riffusion', id: songId, nameHint: 'Riffusion Song', rawInput: `https://www.producer.ai/song/${songId}` };
      }
    }

    const userProfileMatch = trimmedInput.match(sunoUserProfileUrlPatternHook);
    if (userProfileMatch && userProfileMatch[1]) { const extractedUsername = userProfileMatch[1].toLowerCase(); return { type: 'user', id: extractedUsername, nameHint: `@${extractedUsername}` }; }
    const playlistMatch = trimmedInput.match(sunoPlaylistUrlPatternHook);
    if (playlistMatch && playlistMatch[1]) return { type: 'playlist', id: playlistMatch[1], nameHint: `Playlist ${playlistMatch[1].substring(0, 8)}...` };
    const riffusionMatch = trimmedInput.match(riffusionUrlPatternHook);
    if (riffusionMatch && riffusionMatch[1]) return { type: 'riffusion', id: riffusionMatch[1], nameHint: 'Riffusion Song', rawInput: trimmedInput };

    try {
      const url = new URL(trimmedInput.startsWith('http') ? trimmedInput : `https://${trimmedInput}`); if ((url.hostname === 'suno.com' || url.hostname === 'app.suno.ai')) {
        const songIdFromPath = extractSunoSongIdFromPathFromService(url.pathname + url.search + url.hash);
        const isShortUrl = url.pathname.startsWith('/s/');
        if (songIdFromPath || isShortUrl) return { type: 'custom_list', id: 'custom_list_urls', nameHint: 'Single Song', rawInput: trimmedInput };
      }
    } catch (e) { }
    const normalizedUsername = trimmedInput.toLowerCase().replace(/^@/, '');
    return { type: 'user', id: normalizedUsername, nameHint: `@${normalizedUsername}` };
  }, []);
  const getCacheKey = (type: 'user' | 'playlist', id: string): string => type === 'user' ? `${LOCAL_STORAGE_PREFIX_USER}${id}` : `${LOCAL_STORAGE_PREFIX_PLAYLIST}${id}`;
  const loadFromCache = useCallback((type: 'user' | 'playlist', id: string): boolean => { if (!id) return false; try { const cacheKey = getCacheKey(type, id); const dataStr = localStorage.getItem(cacheKey); if (dataStr) { const parsedData: SunoMusicPlayerStoredData = JSON.parse(dataStr); if (parsedData.type === 'user' && parsedData.profileDetail) { setProfileDetail(parsedData.profileDetail); setPlaylistDetail(null); setCurrentIdentifierType('user'); setCurrentIdentifier(parsedData.identifier); setMainButtonText(`Update Songs for @${parsedData.profileDetail.handle}`); setDataManagementStatus(`Loaded @${parsedData.profileDetail.handle} from cache.`); } else if (parsedData.type === 'playlist' && parsedData.playlistDetail) { setPlaylistDetail(parsedData.playlistDetail); setProfileDetail(null); setCurrentIdentifierType('playlist'); setCurrentIdentifier(parsedData.identifier); setMainButtonText(`Update Playlist: ${parsedData.playlistDetail.name || 'Playlist'}`); setDataManagementStatus(`Loaded Playlist "${parsedData.playlistDetail.name || 'Playlist'}" from cache.`); } else { return false; } setOriginalSongsList(parsedData.clips); setLastFetchedTimestamp(parsedData.lastFetched); setUiError(null); setTimeout(() => setDataManagementStatus(''), 3000); trackLocalEvent(TOOL_CATEGORY_PLAYER, 'loadedFromCache', `${type}_${id}`, 1); return true; } } catch (e) { console.error("Error loading from cache:", e); setUiError("Failed to load data from cache."); } return false; }, [trackLocalEvent, setUiError, setOriginalSongsList]);

  useEffect(() => {
    const trimmedInput = identifierInput.trim();
    if (trimmedInput === '') {
      if (playerStateRef.current.originalOrder.length > 0) {
        return;
      }
      setMainButtonText('Fetch / Load');
      return;
    }

    if (trimmedInput.includes('\n')) {
      setMainButtonText('Load Mixed List');
      return;
    }

    // Single line input logic
    const { type, id, nameHint } = parseInput(identifierInput);
    if (!type || !id) {
      setMainButtonText('Fetch / Load');
      return;
    }
    if (type === 'user' || type === 'playlist') {
      if (id === currentIdentifier) { return; }
      if (loadFromCache(type, id)) return;
    }
    if (type === 'user') setMainButtonText(`Fetch Songs for ${nameHint}`);
    else if (type === 'playlist') setMainButtonText(`Fetch ${nameHint}`);
    else if (type === 'riffusion') setMainButtonText(`Load ${nameHint}`);
    else if (type === 'custom_list') setMainButtonText('Load Song List from Input');
  }, [identifierInput, currentIdentifier, loadFromCache, parseInput]);

  const fetchAndStoreUserData = useCallback(async (usernameToFetch: string, isUpdateOperation: boolean) => {
    setIsFetchingOrLoading(true); setUiError(null);
    setFetchProgress(isUpdateOperation ? `Updating @${usernameToFetch}...` : `Fetching @${usernameToFetch}...`);
    if (!isUpdateOperation) { setProfileDetail(null); setPlaylistDetail(null); setOriginalSongsList([]); setManualOrderSongIds(null); }
    setErrorPlayer(null);
    if (!fetchedUsernames.has(usernameToFetch) && !isUpdateOperation) { trackLocalEvent(TOOL_CATEGORY_PLAYER, 'distinctUserFetched', undefined, 1); setFetchedUsernames(prev => new Set(prev).add(usernameToFetch)); }
    try {
      const result = await fetchSunoSongsByUsername(usernameToFetch, (message, loaded, total) => setFetchProgress(total ? `${message} (${loaded}/${total})` : message));
      setProfileDetail(result.profileDetail);
      setPlaylistDetail(null);

      let newlyCachedCount = 0;
      const updatedSongInfoCache = new Map(songInfoCache);
      result.clips.forEach(clip => {
        if (!updatedSongInfoCache.has(clip.id)) newlyCachedCount++;
        updatedSongInfoCache.set(clip.id, clip);
      });
      setSongInfoCache(updatedSongInfoCache);

      setOriginalSongsList(result.clips);
      setCurrentIdentifierType('user');
      setCurrentIdentifier(usernameToFetch);
      const currentTimestamp = new Date().toISOString();
      setLastFetchedTimestamp(currentTimestamp);
      if (result.profileDetail || result.clips.length > 0) {
        const cachedData: SunoMusicPlayerStoredData = { identifier: usernameToFetch, type: 'user', profileDetail: result.profileDetail, playlistDetail: null, clips: result.clips, lastFetched: currentTimestamp };
        localStorage.setItem(getCacheKey('user', usernameToFetch), JSON.stringify(cachedData));
      }
      if (result.clips.length === 0 && result.profileDetail) {
        setUiError(`No songs found for @${result.profileDetail.handle}. Profile might be private or have no public songs.`);
      } else if (!result.profileDetail && result.clips.length === 0) {
        setUiError(`Suno profile for "@${usernameToFetch}" not found or no public songs.`);
      } else {
        setUiError(null);
        setDataManagementStatus(`Fetched ${result.clips.length} songs for @${result.profileDetail?.handle || usernameToFetch}. ${newlyCachedCount} new/updated song details added to cache.`);
        setTimeout(() => setDataManagementStatus(''), 5000);
      }
      setMainButtonText(`Update Songs for @${result.profileDetail?.handle || usernameToFetch}`);
      trackLocalEvent(TOOL_CATEGORY_PLAYER, isUpdateOperation ? 'songsUpdatedFromApi' : 'songsFetchedFromApi', usernameToFetch, 1);
    } catch (err) {
      setUiError(err instanceof Error ? err.message : "Unknown error during user fetch.");
    } finally {
      setIsFetchingOrLoading(false); setFetchProgress('');
    }
  }, [trackLocalEvent, fetchedUsernames, setErrorPlayer, setUiError, songInfoCache, setOriginalSongsList]);

  const fetchAndStorePlaylistData = useCallback(async (playlistIdToFetch: string, isUpdateOperation: boolean) => {
    setIsFetchingOrLoading(true); setUiError(null);
    setFetchProgress(isUpdateOperation ? `Updating Playlist ${playlistIdToFetch.substring(0, 8)}...` : `Fetching Playlist ${playlistIdToFetch.substring(0, 8)}...`);
    if (!isUpdateOperation) { setPlaylistDetail(null); setProfileDetail(null); setOriginalSongsList([]); setManualOrderSongIds(null); }
    setErrorPlayer(null);
    if (!fetchedPlaylistIds.has(playlistIdToFetch) && !isUpdateOperation) { trackLocalEvent(TOOL_CATEGORY_PLAYER, 'distinctPlaylistFetched', undefined, 1); setFetchedPlaylistIds(prev => new Set(prev).add(playlistIdToFetch)); }
    try {
      const result = await fetchSunoPlaylistById(playlistIdToFetch, (message, loaded, total) => setFetchProgress(total ? `${message} (Page ${Number(loaded) + 1}/${total})` : message));
      setPlaylistDetail(result.playlistDetail);
      setProfileDetail(null);

      let newlyCachedCount = 0;
      const updatedSongInfoCache = new Map(songInfoCache);
      result.clips.forEach(clip => {
        if (!updatedSongInfoCache.has(clip.id)) newlyCachedCount++;
        updatedSongInfoCache.set(clip.id, clip);
      });
      setSongInfoCache(updatedSongInfoCache);

      setOriginalSongsList(result.clips);
      setCurrentIdentifierType('playlist');
      setCurrentIdentifier(playlistIdToFetch);
      const currentTimestamp = new Date().toISOString();
      setLastFetchedTimestamp(currentTimestamp);
      if (result.playlistDetail || result.clips.length > 0) {
        const cachedData: SunoMusicPlayerStoredData = { identifier: playlistIdToFetch, type: 'playlist', playlistDetail: result.playlistDetail, profileDetail: null, clips: result.clips, lastFetched: currentTimestamp };
        localStorage.setItem(getCacheKey('playlist', playlistIdToFetch), JSON.stringify(cachedData));
      }
      if (result.clips.length === 0 && result.playlistDetail) {
        setUiError(`No songs found in playlist "${result.playlistDetail.name || playlistIdToFetch}". It might be empty or private.`);
      } else if (!result.playlistDetail && result.clips.length === 0) {
        setUiError(`Playlist ID "${playlistIdToFetch}" not found or no public songs.`);
      } else {
        setUiError(null);
        setDataManagementStatus(`Fetched ${result.clips.length} songs for Playlist "${result.playlistDetail?.name || playlistIdToFetch}". ${newlyCachedCount} new/updated song details added to cache.`);
        setTimeout(() => setDataManagementStatus(''), 5000);
      }
      setMainButtonText(`Update Playlist: ${result.playlistDetail?.name || 'Playlist'}`);
      trackLocalEvent(TOOL_CATEGORY_PLAYER, isUpdateOperation ? 'playlistUpdatedFromApi' : 'playlistFetchedFromApi', playlistIdToFetch, 1);
    } catch (err) {
      setUiError(err instanceof Error ? err.message : "Unknown error during playlist fetch.");
    } finally {
      setIsFetchingOrLoading(false); setFetchProgress('');
    }
  }, [trackLocalEvent, fetchedPlaylistIds, setErrorPlayer, setUiError, songInfoCache, setOriginalSongsList]);

  const processMultiSourceInput = useCallback(async (rawInputList: string, append = false) => {
    setIsFetchingOrLoading(true);
    setUiError(null);
    if (!append) {
      setPlaylistDetail(null);
      setProfileDetail(null);
      setManualOrderSongIds(null);
      setOriginalSongsList([]); // Clear previous list if not appending
    }
    setFetchProgress(append ? 'Appending songs...' : 'Processing input list...');
    setErrorPlayer(null);

    const lines = rawInputList.split('\n').map(line => line.trim()).filter(Boolean);
    if (lines.length === 0) {
      setUiError("Input list is empty.");
      setIsFetchingOrLoading(false);
      setFetchProgress('');
      return;
    }

    let allFetchedClips: SunoClip[] = [];
    let fetchErrors = 0;
    const errorMessagesAccumulator: string[] = [];

    const parseLineForProcessing = (line: string): { type: 'user' | 'playlist' | 'suno_song_url' | 'riffusion_url' | 'unknown'; value: string } => {
      const trimmedLine = line.trim();
      if (!trimmedLine) return { type: 'unknown', value: '' };

      if (trimmedLine.includes('producer.ai') || trimmedLine.includes('riffusion.com')) {
        const songId = extractRiffusionSongId(trimmedLine);
        if (songId) {
          // Return the original URL as value so the fetcher can use it (or strict Riffusion URL)
          return { type: 'riffusion_url', value: trimmedLine };
        }
      }

      const riffusionMatch = trimmedLine.match(riffusionUrlPatternHook);
      if (riffusionMatch && riffusionMatch[1]) return { type: 'riffusion_url', value: trimmedLine };

      const userMatch = trimmedLine.match(sunoUserProfileUrlPatternHook);
      if (userMatch && userMatch[1]) return { type: 'user', value: userMatch[1] };

      const playlistMatch = trimmedLine.match(sunoPlaylistUrlPatternHook);
      if (playlistMatch && playlistMatch[1]) return { type: 'playlist', value: playlistMatch[1] };

      if (isLikelyUrl(trimmedLine) && (trimmedLine.includes('suno.com') || trimmedLine.includes('app.suno.ai'))) {
        return { type: 'suno_song_url', value: trimmedLine };
      }

      if (!isLikelyUrl(trimmedLine)) {
        return { type: 'user', value: trimmedLine.replace(/^@/, '') };
      }

      return { type: 'unknown', value: trimmedLine };
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const progressPrefix = `Item ${i + 1}/${lines.length}`;
      setFetchProgress(`${progressPrefix}: Processing "${line.substring(0, 40)}..."`);
      await new Promise(resolve => setTimeout(resolve, 50));

      try {
        const { type, value } = parseLineForProcessing(line);

        if (type === 'user') {
          setFetchProgress(`${progressPrefix}: Fetching user @${value}...`);
          const { clips } = await fetchSunoSongsByUsername(value, (msg) => setFetchProgress(`${progressPrefix}: Fetching user @${value}... ${msg}`));
          if (clips && clips.length > 0) allFetchedClips.push(...clips);
          else errorMessagesAccumulator.push(`No public songs found for user @${value}.`);
        } else if (type === 'playlist') {
          setFetchProgress(`${progressPrefix}: Fetching playlist ${value.substring(0, 8)}...`);
          const { clips } = await fetchSunoPlaylistById(value, (msg) => setFetchProgress(`${progressPrefix}: Fetching playlist... ${msg}`));
          if (clips && clips.length > 0) allFetchedClips.push(...clips);
          else errorMessagesAccumulator.push(`Playlist ${value.substring(0, 8)} is empty or private.`);
        } else if (type === 'suno_song_url') {
          const songIdToFetch = await resolveSunoUrlToPotentialSongId(value, (msg) => setFetchProgress(`${progressPrefix}: ${msg}`));
          if (songIdToFetch) {
            const cachedClip = songInfoCache.get(songIdToFetch);
            if (cachedClip) {
              allFetchedClips.push(cachedClip);
            } else {
              const clip = await fetchSunoClipById(songIdToFetch);
              if (clip) {
                allFetchedClips.push(clip);
                setSongInfoCache(prev => new Map(prev).set(songIdToFetch, clip));
              } else { throw new Error(`Details not found for ID ${songIdToFetch.substring(0, 8)}...`); }
            }
          } else { throw new Error(`Could not resolve song URL.`); }
        } else if (type === 'riffusion_url') {
          const songId = extractRiffusionSongId(value);
          if (songId) {
            setFetchProgress(`${progressPrefix}: Fetching Riffusion song ${songId.substring(0, 8)}...`);
            const riffusionData = await fetchRiffusionSongData(songId);
            if (riffusionData) {
              const clip: SunoClip = {
                id: riffusionData.id,
                title: riffusionData.title,
                audio_url: riffusionData.audio_url || '',
                video_url: riffusionData.previewVideoUrl || '',
                image_url: riffusionData.image_url,
                image_large_url: riffusionData.image_large_url || riffusionData.image_url,
                created_at: riffusionData.created_at || new Date().toISOString(),
                display_name: riffusionData.artist,
                handle: riffusionData.artist.toLowerCase().replace(/\s/g, '_'),
                metadata: { tags: Array.isArray(riffusionData.tags) ? riffusionData.tags.join(', ') : (riffusionData.tags || 'riffusion'), prompt: riffusionData.lyrics || riffusionData.prompt || '', duration: riffusionData.duration || null, gpt_description_prompt: null, error_type: null, error_message: null, type: 'music' },
                suno_song_url: `https://www.producer.ai/song/${riffusionData.id}`,
                suno_creator_url: (riffusionData.artist && !riffusionData.artist.startsWith('user_') && riffusionData.artist !== 'Unknown Artist' && riffusionData.artist !== 'Riffusion Artist')
                  ? `https://www.producer.ai/${encodeURIComponent(riffusionData.artist)}`
                  : '',
                is_video_pending: false, major_model_version: 'riffusion', model_name: 'riffusion', is_liked: false,
                user_id: riffusionData.author_id || 'riffusion_user', is_trashed: false, status: 'complete',
                play_count: 0, upvote_count: 0, comment_count: 0, is_public: true,
                source: 'riffusion', image_urls: {}
              };
              allFetchedClips.push(clip);
            } else { throw new Error(`Details not found for Riffusion ID ${songId.substring(0, 8)}...`); }
          } else { throw new Error('Could not extract Riffusion song ID from URL.'); }
        } else {
          throw new Error(`Could not identify input type.`);
        }

      } catch (err) {
        fetchErrors++;
        const errorMsg = err instanceof Error ? err.message : "An unknown error occurred.";
        errorMessagesAccumulator.push(`Error on line "${line.substring(0, 30)}...": ${errorMsg.substring(0, 100)}`);
      }
    }

    // Deduplicate songs
    const uniqueClipsMap = new Map<string, SunoClip>();
    const baseList = append ? originalSongsList : [];
    baseList.forEach(song => uniqueClipsMap.set(song.id, song));
    allFetchedClips.forEach(song => uniqueClipsMap.set(song.id, song));
    const finalClips = Array.from(uniqueClipsMap.values());

    if (finalClips.length > 0) {
      setOriginalSongsList(finalClips);
      const summaryProfile = summarizeCustomList(finalClips);
      setProfileDetail(summaryProfile);
      setPlaylistDetail(null);
      setCurrentIdentifierType('custom_list');
      setCurrentIdentifier(append ? 'custom_list_mix' : 'custom_list_from_input');

      let statusMsg = `${append ? 'Appended to' : 'Loaded a'} custom mix of ${finalClips.length} unique songs.`;
      if (fetchErrors > 0) statusMsg += ` ${fetchErrors} entries had errors.`;
      setDataManagementStatus(statusMsg);
      setTimeout(() => setDataManagementStatus(''), 5000);
      trackLocalEvent(TOOL_CATEGORY_PLAYER, append ? 'songsAppendedFromMultiSource' : 'customMultiSourceListLoaded', undefined, finalClips.length);
    } else {
      if (fetchErrors > 0) {
        setUiError("Failed to load any songs. " + errorMessagesAccumulator.slice(0, 2).join(' '));
      } else {
        setDataManagementStatus("No songs found from the provided inputs.");
        setTimeout(() => setDataManagementStatus(''), 3000);
      }
    }

    if (fetchErrors > 0 && finalClips.length > 0 && errorMessagesAccumulator.length > 0) {
      setUiError(errorMessagesAccumulator.slice(0, 3).join('\n'));
    } else if (fetchErrors === 0) {
      setUiError(null);
    }

    setIsFetchingOrLoading(false);
    setFetchProgress('');
  }, [trackLocalEvent, setErrorPlayer, setUiError, songInfoCache, originalSongsList, setOriginalSongsList]);

  const handleMainButtonClick = useCallback(() => {
    const { type, id, rawInput } = parseInput(identifierInput);

    if (type === 'user' && id) {
      if (profileDetail && profileDetail.handle.toLowerCase() === id.toLowerCase() && currentIdentifierType === 'user') {
        fetchAndStoreUserData(id, true); // update
      } else {
        fetchAndStoreUserData(id, false); // fetch new
      }
    } else if (type === 'playlist' && id) {
      if (playlistDetail && playlistDetail.id === id && currentIdentifierType === 'playlist') {
        fetchAndStorePlaylistData(id, true); // update
      } else {
        fetchAndStorePlaylistData(id, false); // fetch new
      }
    } else if ((type === 'custom_list' || type === 'riffusion') && rawInput) {
      processMultiSourceInput(rawInput, false);
    } else {
      setUiError("Please enter a valid Suno/Riffusion/Producer.AI URL, Suno Username, Suno Playlist, or a list of items.");
    }
  }, [identifierInput, profileDetail, playlistDetail, currentIdentifierType, fetchAndStoreUserData, fetchAndStorePlaylistData, processMultiSourceInput, parseInput, setUiError]);

  const handleAppendSongs = useCallback(async () => {
    processMultiSourceInput(identifierInput, true);
  }, [identifierInput, processMultiSourceInput]);

  const handleClearPlayerCache = useCallback(() => { if (!currentIdentifier || !currentIdentifierType || currentIdentifierType === 'custom_list') return; if (clearDataTimeoutRef.current) clearTimeout(clearDataTimeoutRef.current); const newClickCount = clearPlayerCacheClickCount + 1; setClearPlayerCacheClickCount(newClickCount); if (newClickCount >= CLEAR_CLICKS_NEEDED) { const cacheKey = getCacheKey(currentIdentifierType, currentIdentifier); localStorage.removeItem(cacheKey); let clearedName = ''; if (currentIdentifierType === 'user' && profileDetail) clearedName = `@${profileDetail.handle}`; else if (currentIdentifierType === 'playlist' && playlistDetail) clearedName = `Playlist "${playlistDetail.name || currentIdentifier}"`; else clearedName = currentIdentifier; setProfileDetail(null); setPlaylistDetail(null); setOriginalSongsList([]); setLastFetchedTimestamp(null); setMainButtonText(`Fetch / Load`); setDataManagementStatus(`Cache cleared for ${clearedName}.`); trackLocalEvent(TOOL_CATEGORY_PLAYER, 'cacheClearedForItem', `${currentIdentifierType}_${currentIdentifier}`, 1); setClearPlayerCacheClickCount(0); clearDataTimeoutRef.current = null; setCurrentIdentifier(''); setCurrentIdentifierType(null); setIdentifierInput(''); setTimeout(() => setDataManagementStatus(''), 3000); } else { let confirmName = ''; if (currentIdentifierType === 'user' && profileDetail) confirmName = `@${profileDetail.handle}`; else if (currentIdentifierType === 'playlist' && playlistDetail) confirmName = `Playlist "${playlistDetail.name || 'Selected'}"`; else confirmName = currentIdentifier; setDataManagementStatus(`Click ${CLEAR_CLICKS_NEEDED - newClickCount} more times to clear cache for ${confirmName}.`); clearDataTimeoutRef.current = window.setTimeout(() => { setClearPlayerCacheClickCount(0); setDataManagementStatus(''); clearDataTimeoutRef.current = null; }, CLEAR_TIMEOUT_MS); } }, [profileDetail, playlistDetail, clearPlayerCacheClickCount, trackLocalEvent, currentIdentifier, currentIdentifierType, setOriginalSongsList]);
  const getClearPlayerCacheButtonText = useCallback((): string => { if (clearPlayerCacheClickCount > 0 && clearPlayerCacheClickCount < CLEAR_CLICKS_NEEDED) return `Confirm Clear (${CLEAR_CLICKS_NEEDED - clearPlayerCacheClickCount} left)`; if (currentIdentifierType === 'user' && profileDetail) return `Clear Cache for @${profileDetail.handle}`; if (currentIdentifierType === 'playlist' && playlistDetail) return `Clear Cache for Playlist "${playlistDetail.name || 'Current'}"`; return `Clear Item Cache`; }, [clearPlayerCacheClickCount, profileDetail, playlistDetail, currentIdentifierType]);
  const handleClearAllHubDataFromPlayer = useCallback(() => { if (clearDataTimeoutRef.current) clearTimeout(clearDataTimeoutRef.current); const newClickCount = clearAllHubDataClickCount + 1; setClearAllHubDataClickCount(newClickCount); if (newClickCount >= CLEAR_CLICKS_NEEDED) { try { knownAppLocalStorageKeys.forEach(key => localStorage.removeItem(key)); knownAppLocalStoragePrefixes.forEach(prefix => { Object.keys(localStorage).forEach(key => { if (key.startsWith(prefix)) localStorage.removeItem(key); }); }); localStorage.removeItem(LOCAL_STORAGE_CLIP_DETAIL_CACHE_KEY); setDataManagementStatus('All App Hub data cleared. Please refresh the page for changes to fully apply if other tools were active.'); trackLocalEvent(TOOL_CATEGORY_PLAYER, 'allHubDataClearedFromPlayer', undefined, 1); setProfileDetail(null); setPlaylistDetail(null); setOriginalSongsList([]); setLastFetchedTimestamp(null); setCurrentIdentifier(''); setCurrentIdentifierType(null); setIdentifierInput(''); setMainButtonText('Fetch / Load'); setSavedCustomPlaylists([]); setSongInfoCache(new Map()); } catch (e) { console.error("Error clearing all Hub data:", e); setDataManagementStatus('Failed to clear all Hub data. See console.'); } setClearAllHubDataClickCount(0); clearDataTimeoutRef.current = null; setTimeout(() => setDataManagementStatus(''), CLEAR_TIMEOUT_MS); } else { setDataManagementStatus(`Click ${CLEAR_CLICKS_NEEDED - newClickCount} more times to clear ALL HUB DATA.`); clearDataTimeoutRef.current = window.setTimeout(() => { setClearAllHubDataClickCount(0); setDataManagementStatus(''); clearDataTimeoutRef.current = null; }, CLEAR_TIMEOUT_MS); } }, [trackLocalEvent, clearAllHubDataClickCount, setOriginalSongsList]);
  const getClearAllHubDataButtonText = useCallback((): string => { if (clearAllHubDataClickCount > 0 && clearAllHubDataClickCount < CLEAR_CLICKS_NEEDED) return `Confirm Clear ALL (${CLEAR_CLICKS_NEEDED - clearAllHubDataClickCount} left)`; return 'Clear All My Hub Data'; }, [clearAllHubDataClickCount]);
  const handleClearSongInfoCache = useCallback(() => { if (clearDataTimeoutRef.current) clearTimeout(clearDataTimeoutRef.current); const newClickCount = clearSongInfoCacheClickCount + 1; setClearSongInfoCacheClickCount(newClickCount); if (newClickCount >= CLEAR_CLICKS_NEEDED) { setSongInfoCache(new Map()); localStorage.removeItem(LOCAL_STORAGE_CLIP_DETAIL_CACHE_KEY); setDataManagementStatus('Song detail cache cleared.'); trackLocalEvent(TOOL_CATEGORY_PLAYER, 'songDetailCacheCleared'); setClearSongInfoCacheClickCount(0); clearDataTimeoutRef.current = null; setTimeout(() => setDataManagementStatus(''), 3000); } else { setDataManagementStatus(`Click ${CLEAR_CLICKS_NEEDED - newClickCount} more times to clear song detail cache.`); clearDataTimeoutRef.current = window.setTimeout(() => { setClearSongInfoCacheClickCount(0); setDataManagementStatus(''); clearDataTimeoutRef.current = null; }, CLEAR_TIMEOUT_MS); } }, [trackLocalEvent, clearSongInfoCacheClickCount]);
  const getClearSongInfoCacheButtonText = useCallback((): string => { if (clearSongInfoCacheClickCount > 0 && clearSongInfoCacheClickCount < CLEAR_CLICKS_NEEDED) return `Confirm Clear Song Cache (${CLEAR_CLICKS_NEEDED - clearSongInfoCacheClickCount} left)`; return 'Clear Song Detail Cache'; }, [clearSongInfoCacheClickCount]);

  // FIX: Explicitly type the 'prev' parameter to prevent 'id' access errors on 'unknown'.
  const handleClearAllSavedPlaylists = useCallback(() => { if (clearDataTimeoutRef.current) clearTimeout(clearDataTimeoutRef.current); const newClickCount = clearAllSavedPlaylistsClickCount + 1; setClearAllSavedPlaylistsClickCount(newClickCount); if (newClickCount >= CLEAR_CLICKS_NEEDED) { setSavedCustomPlaylists([]); localStorage.removeItem(LOCAL_STORAGE_SAVED_CUSTOM_PLAYLISTS_KEY); setDataManagementStatus('All saved custom playlists cleared.'); trackLocalEvent(TOOL_CATEGORY_PLAYER, 'allSavedPlaylistsCleared', undefined, 1); setClearAllSavedPlaylistsClickCount(0); clearDataTimeoutRef.current = null; setTimeout(() => setDataManagementStatus(''), 3000); } else { setDataManagementStatus(`Click ${CLEAR_CLICKS_NEEDED - newClickCount} more times to clear ALL saved playlists.`); clearDataTimeoutRef.current = window.setTimeout(() => { setClearAllSavedPlaylistsClickCount(0); setDataManagementStatus(''); clearDataTimeoutRef.current = null; }, CLEAR_TIMEOUT_MS); } }, [clearAllSavedPlaylistsClickCount, trackLocalEvent]);
  const getClearAllSavedPlaylistsButtonText = useCallback((): string => { if (clearAllSavedPlaylistsClickCount > 0 && clearAllSavedPlaylistsClickCount < CLEAR_CLICKS_NEEDED) { return `Confirm Clear Saved Playlists (${CLEAR_CLICKS_NEEDED - clearAllSavedPlaylistsClickCount} left)`; } return 'Clear All Saved Playlists'; }, [clearAllSavedPlaylistsClickCount]);

  const handleClearQueue = useCallback(() => {
    if (clearQueueTimeoutRef.current) {
      clearTimeout(clearQueueTimeoutRef.current);
    }
    const newClickCount = clearQueueClickCount + 1;
    setClearQueueClickCount(newClickCount);

    if (newClickCount >= CLEAR_CLICKS_NEEDED) {
      if (currentSoundRef.current) {
        currentSoundRef.current.stop();
        currentSoundRef.current.unload();
        currentSoundRef.current = null;
      }
      currentPlayingSongIdRef.current = null;

      setOriginalSongsListInternal([]);
      setManualOrderSongIds(null);
      setPlayerState(prev => ({
        ...prev,
        status: PlaybackStatus.Idle,
        currentSong: null,
        currentTime: 0,
        duration: 0,
        history: [],
      }));

      setDataManagementStatus('Queue cleared.');
      trackLocalEvent(TOOL_CATEGORY_PLAYER, 'queueCleared');

      setClearQueueClickCount(0);
      clearQueueTimeoutRef.current = null;
      setTimeout(() => setDataManagementStatus(''), 3000);
    } else {
      setDataManagementStatus(`Click ${CLEAR_CLICKS_NEEDED - newClickCount} more times to clear queue.`);
      clearQueueTimeoutRef.current = window.setTimeout(() => {
        setClearQueueClickCount(0);
        setDataManagementStatus('');
        clearQueueTimeoutRef.current = null;
      }, CLEAR_TIMEOUT_MS);
    }
  }, [clearQueueClickCount, trackLocalEvent, setPlayerState]);

  const getClearQueueButtonText = useCallback((): string => {
    if (clearQueueClickCount > 0) {
      return `Confirm Clear Queue (${CLEAR_CLICKS_NEEDED - clearQueueClickCount} left)`;
    }
    return 'Clear Queue';
  }, [clearQueueClickCount]);

  useEffect(() => { return () => { if (clearDataTimeoutRef.current) clearTimeout(clearDataTimeoutRef.current); if (snippetTimeoutRef.current) clearTimeout(snippetTimeoutRef.current); if (clearQueueTimeoutRef.current) clearTimeout(clearQueueTimeoutRef.current); }; }, []);

  const handleReorderQueue = useCallback((draggedSongId: string, targetSongId: string, insertBeforeTarget: boolean) => {
    const currentQueue = playerStateRef.current.queue;
    const draggedIndex = currentQueue.findIndex(song => song.id === draggedSongId);
    let targetIndex = currentQueue.findIndex(song => song.id === targetSongId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const newOrderedQueueWorkingCopy = Array.from(currentQueue);
    const [draggedItem] = newOrderedQueueWorkingCopy.splice(draggedIndex, 1);

    const newTargetIndexAfterSplice = newOrderedQueueWorkingCopy.findIndex(song => song.id === targetSongId);

    if (insertBeforeTarget) {
      newOrderedQueueWorkingCopy.splice(newTargetIndexAfterSplice, 0, draggedItem);
    } else {
      newOrderedQueueWorkingCopy.splice(newTargetIndexAfterSplice + 1, 0, draggedItem);
    }

    setManualOrderSongIds(newOrderedQueueWorkingCopy.map(song => song.id));
    setSortCriteriaInternalState('default');
    setPlayerState(prev => ({ ...prev, isShuffle: false }));

    trackLocalEvent(TOOL_CATEGORY_PLAYER, 'songReordered', undefined, 1);
  }, [trackLocalEvent, setPlayerState]);

  const handleExportPlaylistCsv = useCallback(async () => { if (playerState.queue.length === 0) { setDataManagementStatus("Playlist is empty. Nothing to export."); setTimeout(() => setDataManagementStatus(''), 3000); return; } try { const filename = currentIdentifierType === 'user' && profileDetail?.handle ? `suno_playlist_@${profileDetail.handle}` : currentIdentifierType === 'playlist' && playlistDetail?.name ? `suno_playlist_${playlistDetail.name.replace(/\s+/g, '_')}` : 'suno_custom_playlist'; downloadSunoPlaylistAsCsv(playerState.queue, filename); setDataManagementStatus("Playlist exported to CSV!"); trackLocalEvent(TOOL_CATEGORY_PLAYER, 'playlistExportedToCsv', currentIdentifier, playerState.queue.length); } catch (error) { console.error("Error exporting playlist to CSV:", error); setDataManagementStatus("Error exporting playlist. See console."); } setTimeout(() => setDataManagementStatus(''), 3000); }, [playerState.queue, currentIdentifierType, profileDetail, playlistDetail, currentIdentifier, trackLocalEvent]);
  const handleExportCurrentPlaylistToFile = useCallback(() => { const listToExport = playerState.queue.length > 0 ? playerState.queue : originalSongsList; if (listToExport.length === 0) { setDataManagementStatus("No songs to export."); setTimeout(() => setDataManagementStatus(''), 3000); return; } const content = listToExport.map(song => song.suno_song_url || `https://suno.com/song/${song.id}`).join('\n'); const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' }); const url = URL.createObjectURL(blob); const link = document.createElement('a'); const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, ''); const filenamePrefix = currentIdentifierType === 'user' && profileDetail?.handle ? `suno_playlist_@${profileDetail.handle}` : currentIdentifierType === 'playlist' && playlistDetail?.name ? `suno_playlist_${playlistDetail.name.replace(/\s+/g, '_')}` : 'suno_custom_export'; link.href = url; link.download = `${filenamePrefix}_${dateStr}.txt`; document.body.appendChild(link); link.click(); document.body.removeChild(link); URL.revokeObjectURL(url); setDataManagementStatus("Playlist exported to TXT file!"); trackLocalEvent(TOOL_CATEGORY_PLAYER, 'playlistExportedToTxt', currentIdentifier, listToExport.length); setTimeout(() => setDataManagementStatus(''), 3000); }, [playerState.queue, originalSongsList, currentIdentifierType, profileDetail, playlistDetail, currentIdentifier, trackLocalEvent]);
  const handleImportPlaylistFromTxtFile = useCallback((event: React.ChangeEvent<HTMLInputElement>) => { const file = event.target.files?.[0]; if (file) { const reader = new FileReader(); reader.onload = (e) => { const text = e.target?.result as string; setIdentifierInput(text); setDataManagementStatus(`TXT file content loaded. Click "Load Song List from Input".`); trackLocalEvent(TOOL_CATEGORY_PLAYER, 'playlistFileImported_txt', file.name, text.split('\n').filter(u => u.trim()).length); }; reader.readAsText(file); if (event.target) event.target.value = ""; } }, [trackLocalEvent]);
  const handleImportPlaylistFromCsvFile = useCallback((event: React.ChangeEvent<HTMLInputElement>) => { const file = event.target.files?.[0]; if (file) { const reader = new FileReader(); reader.onload = (e) => { const text = e.target?.result as string; const lines = text.split('\n').map(line => line.trim()).filter(Boolean); const urlsToImport: string[] = []; let urlColumnIndex = -1; if (lines.length > 0) { const headerCells = parseCsvLine(lines[0]); const possibleUrlHeaders = ["suno song url", "url", "link", "suno_song_url"]; urlColumnIndex = headerCells.findIndex(header => possibleUrlHeaders.includes(header.toLowerCase().trim())); if (urlColumnIndex === -1 && headerCells.length === 3 && headerCells[0].toLowerCase().includes("creator") && headerCells[1].toLowerCase().includes("title")) { urlColumnIndex = 2; } } const linesToParse = urlColumnIndex !== -1 && lines.length > 0 ? lines.slice(1) : lines; linesToParse.forEach(line => { const columns = parseCsvLine(line); let potentialUrl = ""; if (urlColumnIndex !== -1 && columns.length > urlColumnIndex) { potentialUrl = columns[urlColumnIndex].trim(); } else if (columns.length > 0) { potentialUrl = columns[0].trim(); } if (potentialUrl && (potentialUrl.includes('suno.com') || potentialUrl.split(',').length === 2 && potentialUrl.split(',')[0].includes('suno.com'))) { urlsToImport.push(potentialUrl); } }); if (urlsToImport.length > 0) { setIdentifierInput(urlsToImport.join('\n')); setDataManagementStatus(`CSV content loaded (${urlsToImport.length} URLs). Click "Load Song List from Input".`); trackLocalEvent(TOOL_CATEGORY_PLAYER, 'playlistFileImported_csv', file.name, urlsToImport.length); } else { setDataManagementStatus(`No valid Suno URLs or custom format lines found in the CSV's expected columns.`); trackLocalEvent(TOOL_CATEGORY_PLAYER, 'playlistFileImported_csv_no_urls', file.name); } }; reader.onerror = () => { setDataManagementStatus(`Error reading CSV file.`); trackLocalEvent(TOOL_CATEGORY_PLAYER, 'playlistFileImportFailed_csv_read_error', file.name); }; reader.readAsText(file); if (event.target) event.target.value = ""; } }, [trackLocalEvent]);
  const handleSaveCurrentPlaylistLocally = useCallback((name: string) => { if (!name.trim()) { setDataManagementStatus("Playlist name cannot be empty."); setTimeout(() => setDataManagementStatus(''), 3000); return; } let contentToSave = ''; if (currentIdentifierType === 'custom_list' && identifierInput) { contentToSave = identifierInput; } else if (originalSongsList.length > 0) { contentToSave = originalSongsList.map(song => song.suno_song_url || `https://suno.com/song/${song.id}`).join('\n'); } else { setDataManagementStatus("No active playlist content to save."); setTimeout(() => setDataManagementStatus(''), 3000); return; } if (!contentToSave.trim()) { setDataManagementStatus("Playlist content is empty. Cannot save."); setTimeout(() => setDataManagementStatus(''), 3000); return; } const newSavedPlaylist: SavedCustomPlaylist = { id: Date.now().toString(), name: name.trim(), content: contentToSave, createdAt: new Date().toISOString() }; setSavedCustomPlaylists(prev => [newSavedPlaylist, ...prev.filter(p => p.name.toLowerCase() !== name.trim().toLowerCase())]); setDataManagementStatus(`Playlist "${name.trim()}" saved locally!`); trackLocalEvent(TOOL_CATEGORY_PLAYER, 'playlistSavedLocally', name.trim()); setTimeout(() => setDataManagementStatus(''), 3000); }, [currentIdentifierType, identifierInput, originalSongsList, trackLocalEvent]);

  const handleUpdateSavedPlaylistLocally = useCallback((playlistId: string) => {
    const playlistToUpdate = savedCustomPlaylists.find(p => p.id === playlistId);
    if (!playlistToUpdate) return;

    if (playerState.queue.length === 0) {
      setDataManagementStatus("Cannot update. The current play queue is empty.");
      setTimeout(() => setDataManagementStatus(''), 3000);
      return;
    }

    const newContent = playerState.queue
      .map(song => song.suno_song_url || `https://suno.com/song/${song.id}`)
      .join('\n');

    const updatedPlaylists = savedCustomPlaylists.map(p =>
      p.id === playlistId
        ? { ...p, content: newContent, updatedAt: new Date().toISOString() }
        : p
    );
    setSavedCustomPlaylists(updatedPlaylists);
    setDataManagementStatus(`Playlist "${playlistToUpdate.name}" updated with current queue!`);
    trackLocalEvent(TOOL_CATEGORY_PLAYER, 'localPlaylistUpdatedWithQueue', playlistToUpdate.name, playerState.queue.length);
    setTimeout(() => setDataManagementStatus(''), 3000);

  }, [playerState.queue, savedCustomPlaylists, trackLocalEvent]);

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

  const handleLoadSavedPlaylistLocally = useCallback((playlistId: string) => {
    const playlistToLoad = savedCustomPlaylists.find(p => p.id === playlistId);
    if (playlistToLoad) {
      processMultiSourceInput(playlistToLoad.content, false);
      trackLocalEvent(TOOL_CATEGORY_PLAYER, 'savedPlaylistLoadedDirectly', playlistToLoad.name);
    }
  }, [savedCustomPlaylists, processMultiSourceInput, trackLocalEvent]);

  // FIX: Explicitly type the 'prev' parameter to prevent 'id' access errors on 'unknown'.
  const handleDeleteSavedPlaylistLocally = useCallback((playlistId: string) => { setSavedCustomPlaylists((prev: SavedCustomPlaylist[]) => prev.filter((p: SavedCustomPlaylist) => p.id !== playlistId)); const deletedPlaylistName = savedCustomPlaylists.find(p => p.id === playlistId)?.name || 'Unknown'; setDataManagementStatus(`Deleted saved playlist: "${deletedPlaylistName}".`); trackLocalEvent(TOOL_CATEGORY_PLAYER, 'savedPlaylistDeleted', deletedPlaylistName); setTimeout(() => setDataManagementStatus(''), 3000); }, [savedCustomPlaylists, trackLocalEvent]);

  const removeSongFromQueue = useCallback((songId: string) => {
    setPlayerState(prev => {
      const isCurrentSongRemoved = prev.currentSong?.id === songId;
      if (isCurrentSongRemoved && currentSoundRef.current) {
        currentSoundRef.current.stop();
        currentSoundRef.current.unload();
        currentSoundRef.current = null;
        currentPlayingSongIdRef.current = null;
      }

      const newQueue = prev.queue.filter(song => song.id !== songId);
      const newOriginalOrder = prev.originalOrder.filter(song => song.id !== songId);
      const newHistory = prev.history.filter(song => song.id !== songId);

      let newManualOrderIds = manualOrderSongIds ? manualOrderSongIds.filter(id => id !== songId) : null;
      if (newManualOrderIds && newManualOrderIds.length === 0 && newQueue.length > 0) {
        setSortCriteriaInternalState('default');
        newManualOrderIds = null;
      } else if (newManualOrderIds && newManualOrderIds.length === 0 && newQueue.length === 0) {
        newManualOrderIds = null;
      }
      setManualOrderSongIds(newManualOrderIds);

      if (currentIdentifierType === 'custom_list') {
        setOriginalSongsListInternal(newOriginalOrder);
      }

      return {
        ...prev,
        queue: newQueue,
        originalOrder: newOriginalOrder,
        history: newHistory,
        currentSong: isCurrentSongRemoved ? null : prev.currentSong,
        status: isCurrentSongRemoved ? PlaybackStatus.Idle : prev.status,
        currentTime: isCurrentSongRemoved ? 0 : prev.currentTime,
        duration: isCurrentSongRemoved ? 0 : prev.duration,
      };
    });
    trackLocalEvent(TOOL_CATEGORY_PLAYER, 'songRemovedFromQueue', songId);
  }, [manualOrderSongIds, currentIdentifierType, trackLocalEvent, setPlayerState]);

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
    profileDetail, playlistDetail, playlistAnalysis,
    originalSongsList,
    sortCriteria: sortCriteriaInternalState, setSortCriteria,
    filterQuery, setFilterQuery,
    lastFetchedTimestamp, mainButtonText, showDataManagement,
    clearPlayerCacheClickCount, handleClearPlayerCache, getClearPlayerCacheButtonText,
    clearAllHubDataClickCount, handleClearAllHubDataFromPlayer, getClearAllHubDataButtonText,
    dataManagementStatus,
    playerState, analyserNodes: { left: analyserNodeLeftRef.current, right: analyserNodeRightRef.current },
    playSong, togglePlayPause, nextTrack: nextTrackRef.current, previousTrack, seek, setVolume, setEqGain, applyEqPreset, toggleShuffle, toggleSnippetMode,
    setSnippetDurationConfig,
    formatTime,
    isLoading: isLoadingPlayer, error: errorPlayerHook,
    setErrorPlayer,
    handleMainButtonClick, handleAppendSongs, parseInput, handleReorderQueue, handleExportPlaylistCsv,
    savedCustomPlaylists, handleExportCurrentPlaylistToFile,
    handleImportPlaylistFromTxtFile,
    handleImportPlaylistFromCsvFile,
    handleSaveCurrentPlaylistLocally,
    handleUpdateSavedPlaylistLocally, handleAppendToSavedPlaylistLocally,
    handleLoadSavedPlaylistLocally, handleDeleteSavedPlaylistLocally,
    handleClearAllSavedPlaylists, getClearAllSavedPlaylistsButtonText, clearAllSavedPlaylistsClickCount,
    handleClearSongInfoCache, getClearSongInfoCacheButtonText, clearSongInfoCacheClickCount,
    removeSongFromQueue,
    handleClearQueue, getClearQueueButtonText,
  };
};
