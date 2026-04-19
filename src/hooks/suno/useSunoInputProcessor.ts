import { useState, useEffect, useCallback, useRef } from 'react';
import type { 
  SunoClip, 
  SunoProfileDetail, 
  SunoPlaylistDetail,
  SunoMusicPlayerStoredData 
} from '@/types';
import { 
  fetchSunoSongsByUsername, 
  fetchSunoPlaylistById, 
  fetchSunoClipById, 
  extractSunoSongIdFromPath as extractSunoSongIdFromPathFromService, 
} from '@/services/sunoService';
import { 
  fetchRiffusionSongData, 
  extractRiffusionSongId 
} from '@/services/riffusionService';
import { 
  TOOL_CATEGORY_PLAYER,
  sunoPlaylistUrlPattern,
  sunoUserProfileUrlPattern,
  riffusionUrlPattern,
  LOCAL_STORAGE_LAST_SESSION_KEY,
} from './constants';

interface UseSunoInputProcessorProps {
  identifierInput: string;
  setIdentifierInput: (value: string) => void;
  currentIdentifier: string;
  setCurrentIdentifier: (value: string) => void;
  currentIdentifierType: 'user' | 'playlist' | 'custom_list' | null;
  setCurrentIdentifierType: (type: 'user' | 'playlist' | 'custom_list' | null) => void;
  setOriginalSongsList: (clips: SunoClip[] | ((prev: SunoClip[]) => SunoClip[])) => void;
  setManualOrderSongIds: (ids: string[] | null) => void;
  setProfileDetail: (detail: SunoProfileDetail | null) => void;
  setPlaylistDetail: (detail: SunoPlaylistDetail | null) => void;
  setErrorPlayer: (error: string | null) => void;
  setUiError: (error: string | null) => void;
  songInfoCache: Map<string, SunoClip>;
  setSongInfoCache: (cache: Map<string, SunoClip>) => void;
  setDataManagementStatus: (status: string) => void;
  trackLocalEvent: (category: string, action: string, label?: string, value?: string | number) => void;
  getCachedData: (type: 'user' | 'playlist', id: string) => SunoMusicPlayerStoredData | null;
  getCacheKey: (type: 'user' | 'playlist', id: string) => string;
}

export const useSunoInputProcessor = ({
  identifierInput,
  setIdentifierInput,
  currentIdentifier,
  setCurrentIdentifier,
  currentIdentifierType,
  setCurrentIdentifierType,
  setOriginalSongsList,
  setManualOrderSongIds,
  setProfileDetail,
  setPlaylistDetail,
  setErrorPlayer,
  setUiError,
  songInfoCache,
  setSongInfoCache,
  setDataManagementStatus,
  trackLocalEvent,
  getCachedData,
  getCacheKey,
}: UseSunoInputProcessorProps) => {
  const [isFetchingOrLoading, setIsFetchingOrLoading] = useState<boolean>(false);
  const [fetchProgress, setFetchProgress] = useState<string>('');
  const [mainButtonText, setMainButtonText] = useState<string>('Fetch / Load');
  const [fetchedUsernames, setFetchedUsernames] = useState<Set<string>>(new Set());
  const [fetchedPlaylistIds, setFetchedPlaylistIds] = useState<Set<string>>(new Set());
  const [lastFetchedTimestamp, setLastFetchedTimestamp] = useState<string | null>(null);

  const parseInput = useCallback((input: string): { type: 'user' | 'playlist' | 'custom_list' | 'riffusion' | null; id: string | null; nameHint?: string, rawInput?: string } => {
    const trimmedInput = input.trim();
    if (!trimmedInput) return { type: null, id: null };
    if (trimmedInput.includes('\n')) return { type: 'custom_list', id: 'custom_list_urls', nameHint: 'Custom Song List', rawInput: trimmedInput };

    if (trimmedInput.includes('flowmusic.app') || trimmedInput.includes('producer.ai')) {
      const songId = extractRiffusionSongId(trimmedInput);
      if (songId) {
        return { type: 'riffusion', id: songId, nameHint: 'Flow Music Song', rawInput: `https://www.flowmusic.app/song/${songId}` };
      }
    }

    const userProfileMatch = trimmedInput.match(sunoUserProfileUrlPattern);
    if (userProfileMatch && userProfileMatch[1]) {
      const extractedUsername = userProfileMatch[1].toLowerCase();
      return { type: 'user', id: extractedUsername, nameHint: `@${extractedUsername}` };
    }
    const playlistMatch = trimmedInput.match(sunoPlaylistUrlPattern);
    if (playlistMatch && playlistMatch[1]) return { type: 'playlist', id: playlistMatch[1], nameHint: `Playlist ${playlistMatch[1].substring(0, 8)}...` };
    const riffusionMatch = trimmedInput.match(riffusionUrlPattern);
    if (riffusionMatch && riffusionMatch[1]) return { type: 'riffusion', id: riffusionMatch[1], nameHint: 'Riffusion Song', rawInput: trimmedInput };

    try {
      const url = new URL(trimmedInput.startsWith('http') ? trimmedInput : `https://${trimmedInput}`);
      if ((url.hostname === 'suno.com' || url.hostname === 'app.suno.ai')) {
        const songIdFromPath = extractSunoSongIdFromPathFromService(url.pathname + url.search + url.hash);
        const isShortUrl = url.pathname.startsWith('/s/');
        if (songIdFromPath || isShortUrl) return { type: 'custom_list', id: 'custom_list_urls', nameHint: 'Single Song', rawInput: trimmedInput };
      }
    } catch (e) { }
    const normalizedUsername = trimmedInput.toLowerCase().replace(/^@/, '');
    return { type: 'user', id: normalizedUsername, nameHint: `@${normalizedUsername}` };
  }, []);

  const fetchAndStoreUserData = useCallback(async (usernameToFetch: string, isUpdateOperation: boolean) => {
    // Check cache first if not explicitly updating
    if (!isUpdateOperation) {
        const cached = getCachedData('user', usernameToFetch);
        if (cached) {
            setProfileDetail(cached.profileDetail);
            setPlaylistDetail(null);
            setOriginalSongsList(cached.clips);
            setCurrentIdentifierType('user');
            setCurrentIdentifier(usernameToFetch);
            setLastFetchedTimestamp(cached.lastFetched);
            setDataManagementStatus(`Loaded @${usernameToFetch} from cache.`);
            setTimeout(() => setDataManagementStatus(''), 3000);
            return;
        }
    }

    setIsFetchingOrLoading(true);
    setUiError(null);
    setFetchProgress(isUpdateOperation ? `Updating @${usernameToFetch}...` : `Fetching @${usernameToFetch}...`);
    if (!isUpdateOperation) {
      setProfileDetail(null);
      setPlaylistDetail(null);
      setOriginalSongsList([]);
      setManualOrderSongIds(null);
    }
    setErrorPlayer(null);
    if (!fetchedUsernames.has(usernameToFetch) && !isUpdateOperation) {
      trackLocalEvent(TOOL_CATEGORY_PLAYER, 'distinctUserFetched', undefined, 1);
      setFetchedUsernames(prev => new Set(prev).add(usernameToFetch));
    }
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
        const cachedData = { identifier: usernameToFetch, type: 'user', profileDetail: result.profileDetail, playlistDetail: null, clips: result.clips, lastFetched: currentTimestamp };
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
      setIsFetchingOrLoading(false);
      setFetchProgress('');
    }
  }, [trackLocalEvent, fetchedUsernames, setErrorPlayer, setUiError, songInfoCache, setOriginalSongsList, setProfileDetail, setPlaylistDetail, setManualOrderSongIds, setCurrentIdentifierType, setCurrentIdentifier, setSongInfoCache, getCacheKey, setDataManagementStatus, getCachedData]);

  const fetchAndStorePlaylistData = useCallback(async (playlistIdToFetch: string, isUpdateOperation: boolean) => {
    // Check cache first if not explicitly updating
    if (!isUpdateOperation) {
        const cached = getCachedData('playlist', playlistIdToFetch);
        if (cached) {
            setPlaylistDetail(cached.playlistDetail);
            setProfileDetail(null);
            setOriginalSongsList(cached.clips);
            setCurrentIdentifierType('playlist');
            setCurrentIdentifier(playlistIdToFetch);
            setLastFetchedTimestamp(cached.lastFetched);
            setDataManagementStatus(`Loaded Playlist ${playlistIdToFetch.substring(0,8)} from cache.`);
            setTimeout(() => setDataManagementStatus(''), 3000);
            return;
        }
    }

    setIsFetchingOrLoading(true);
    setUiError(null);
    setFetchProgress(isUpdateOperation ? `Updating Playlist ${playlistIdToFetch.substring(0, 8)}...` : `Fetching Playlist ${playlistIdToFetch.substring(0, 8)}...`);
    if (!isUpdateOperation) {
      setPlaylistDetail(null);
      setProfileDetail(null);
      setOriginalSongsList([]);
      setManualOrderSongIds(null);
    }
    setErrorPlayer(null);
    if (!fetchedPlaylistIds.has(playlistIdToFetch) && !isUpdateOperation) {
      trackLocalEvent(TOOL_CATEGORY_PLAYER, 'distinctPlaylistFetched', undefined, 1);
      setFetchedPlaylistIds(prev => new Set(prev).add(playlistIdToFetch));
    }
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
        const cachedData = { identifier: playlistIdToFetch, type: 'playlist', playlistDetail: result.playlistDetail, profileDetail: null, clips: result.clips, lastFetched: currentTimestamp };
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
      setIsFetchingOrLoading(false);
      setFetchProgress('');
    }
  }, [trackLocalEvent, fetchedPlaylistIds, setErrorPlayer, setUiError, songInfoCache, setOriginalSongsList, setPlaylistDetail, setProfileDetail, setManualOrderSongIds, setCurrentIdentifierType, setCurrentIdentifier, setSongInfoCache, getCacheKey, setDataManagementStatus, getCachedData]);

  const mapRiffusionToSuno = useCallback((data: any): SunoClip => {
    return {
      id: data.id,
      video_url: data.previewVideoUrl || '',
      audio_url: data.audio_url || '',
      image_url: data.image_url || null,
      image_large_url: data.image_large_url || null,
      image_urls: {
        image_url: data.image_url,
        image_url_large: data.image_large_url
      },
      is_video_pending: false,
      major_model_version: 'riffusion',
      model_name: 'riffusion',
      metadata: {
        tags: Array.isArray(data.tags) ? data.tags.join(', ') : (data.tags || null),
        prompt: data.lyrics || data.prompt || null,
        gpt_description_prompt: data.prompt || null,
        error_type: null,
        error_message: null,
        type: 'music',
        duration: data.duration || null
      },
      is_liked: false,
      user_id: data.author_id || 'riffusion',
      display_name: data.artist || 'Riffusion Artist',
      handle: data.artist || 'riffusion',
      is_trashed: false,
      created_at: data.created_at || new Date().toISOString(),
      status: 'complete',
      title: data.title || 'Untitled Riffusion',
      play_count: 0,
      upvote_count: 0,
      comment_count: 0,
      is_public: true,
      source: 'riffusion'
    };
  }, []);

  const processMultiSourceInput = useCallback(async (rawInputList: string, append = false) => {
    setIsFetchingOrLoading(true);
    setUiError(null);
    if (!append) {
      setPlaylistDetail(null);
      setProfileDetail(null);
      setManualOrderSongIds(null);
      setOriginalSongsList([]);
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

    const allFetchedClips: SunoClip[] = [];
    let fetchErrors = 0;
    const errorMessagesAccumulator: string[] = [];
    const updatedSongInfoCache = new Map(songInfoCache);

    for (const line of lines) {
      try {
        const riffId = extractRiffusionSongId(line);
        if (riffId) {
          if (updatedSongInfoCache.has(riffId)) {
            allFetchedClips.push(updatedSongInfoCache.get(riffId)!);
          } else {
            const clipData = await fetchRiffusionSongData(riffId);
            if (clipData) {
              const clip = mapRiffusionToSuno(clipData);
              allFetchedClips.push(clip);
              updatedSongInfoCache.set(clip.id, clip);
            }
          }
          continue;
        }

        const sunoSongId = extractSunoSongIdFromPathFromService(line);
        if (sunoSongId) {
          if (updatedSongInfoCache.has(sunoSongId)) {
            allFetchedClips.push(updatedSongInfoCache.get(sunoSongId)!);
          } else {
            const clip = await fetchSunoClipById(sunoSongId);
            if (clip) {
              allFetchedClips.push(clip);
              updatedSongInfoCache.set(clip.id, clip);
            }
          }
          continue;
        }
      } catch (err) {
        fetchErrors++;
        errorMessagesAccumulator.push(`Error at "${line.substring(0, 20)}...": ${err instanceof Error ? err.message : String(err)}`);
      }
    }

    setSongInfoCache(updatedSongInfoCache);

    if (allFetchedClips.length > 0) {
      if (append) {
        setOriginalSongsList(prev => [...prev, ...allFetchedClips]);
      } else {
        setOriginalSongsList(allFetchedClips);
        setCurrentIdentifierType('custom_list');
        setCurrentIdentifier('custom_list_urls');
      }
      setDataManagementStatus(`${append ? 'Added' : 'Loaded'} ${allFetchedClips.length} songs.${fetchErrors > 0 ? ` (${fetchErrors} failed)` : ''}`);
      setTimeout(() => setDataManagementStatus(''), 3000);
      trackLocalEvent(TOOL_CATEGORY_PLAYER, append ? 'songsAppended' : 'playlistLoadedManually', `${allFetchedClips.length} songs`);
    } else if (fetchErrors > 0) {
      setUiError("Failed to load any songs. " + errorMessagesAccumulator.slice(0, 2).join(' '));
    }

    setIsFetchingOrLoading(false);
    setFetchProgress('');
  }, [trackLocalEvent, setErrorPlayer, setUiError, songInfoCache, setOriginalSongsList, setPlaylistDetail, setProfileDetail, setManualOrderSongIds, setCurrentIdentifierType, setCurrentIdentifier, setSongInfoCache, setDataManagementStatus, mapRiffusionToSuno]);

  const handleMainButtonClick = useCallback(() => {
    const { type, id, rawInput } = parseInput(identifierInput);

    if (type === 'user' && id) {
      if (currentIdentifierType === 'user' && currentIdentifier.toLowerCase() === id.toLowerCase()) {
        fetchAndStoreUserData(id, true);
      } else {
        fetchAndStoreUserData(id, false);
      }
    } else if (type === 'playlist' && id) {
      if (currentIdentifierType === 'playlist' && currentIdentifier === id) {
        fetchAndStorePlaylistData(id, true);
      } else {
        fetchAndStorePlaylistData(id, false);
      }
    } else if ((type === 'custom_list' || type === 'riffusion') && rawInput) {
      processMultiSourceInput(rawInput, false);
    } else {
      setUiError("Please enter a valid Suno/Riffusion/FlowMusic.app URL, Suno Username, Suno Playlist, or a list of items.");
    }
  }, [identifierInput, currentIdentifier, currentIdentifierType, fetchAndStoreUserData, fetchAndStorePlaylistData, processMultiSourceInput, parseInput, setUiError]);

  const handleAppendSongs = useCallback(async () => {
    processMultiSourceInput(identifierInput, true);
  }, [identifierInput, processMultiSourceInput]);

  useEffect(() => {
    const trimmedInput = identifierInput.trim();
    if (trimmedInput === '') {
      setMainButtonText('Fetch / Load');
      return;
    }

    if (trimmedInput.includes('\n')) {
      setMainButtonText('Load Mixed List');
      return;
    }

    const inputType = parseInput(trimmedInput);
    if (inputType.type === 'user') {
      setMainButtonText(`Update Songs for ${inputType.nameHint || inputType.id}`);
    } else if (inputType.type === 'playlist') {
      setMainButtonText(`Update Playlist: ${inputType.id?.slice(0, 8) || ''}...`);
    } else if (inputType.type === 'custom_list') {
      const lines = trimmedInput.split('\n').filter(l => l.trim()).length;
      setMainButtonText(`Load ${lines} Song${lines !== 1 ? 's' : ''} from Input`);
    } else if (inputType.type === 'riffusion') {
      setMainButtonText(`Load Flow Music Song`);
    }
  }, [identifierInput, parseInput]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_LAST_SESSION_KEY, JSON.stringify({
      type: currentIdentifierType,
      id: currentIdentifier,
      input: identifierInput,
    }));
  }, [currentIdentifier, currentIdentifierType, identifierInput]);

  return {
    isFetchingOrLoading,
    fetchProgress,
    mainButtonText,
    lastFetchedTimestamp,
    parseInput,
    handleMainButtonClick,
    handleAppendSongs,
    processMultiSourceInput,
  };
};
