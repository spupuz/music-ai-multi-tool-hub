import { useState, useEffect, useCallback, useRef } from 'react';
import type { SunoClip, SavedCustomPlaylist, SunoMusicPlayerStoredData, SunoProfileDetail, SunoPlaylistDetail } from '../../types';
import { downloadSunoPlaylistAsCsv } from '../../services/csvExportService';
import {
  LOCAL_STORAGE_CLIP_DETAIL_CACHE_KEY,
  LOCAL_STORAGE_SAVED_CUSTOM_PLAYLISTS_KEY,
  LOCAL_STORAGE_PREFIX_USER,
  LOCAL_STORAGE_PREFIX_PLAYLIST,
  CLEAR_CLICKS_NEEDED,
  CLEAR_TIMEOUT_MS,
  TOOL_CATEGORY_PLAYER,
  knownAppLocalStorageKeys,
  knownAppLocalStoragePrefixes
} from './constants';

export interface UseSunoDataManagementProps {
  trackLocalEvent: (category: string, action: string, label?: string, value?: string | number) => void;
  setErrorPlayer: (error: string | null) => void;
}

export const useSunoDataManagement = ({ trackLocalEvent, setErrorPlayer }: UseSunoDataManagementProps) => {
  const [savedCustomPlaylists, setSavedCustomPlaylists] = useState<SavedCustomPlaylist[]>([]);
  const [songInfoCache, setSongInfoCache] = useState<Map<string, SunoClip>>(new Map());
  const [dataManagementStatus, setDataManagementStatus] = useState<string>('');

  const getCacheKey = useCallback((type: 'user' | 'playlist', id: string): string => 
    type === 'user' ? `${LOCAL_STORAGE_PREFIX_USER}${id}` : `${LOCAL_STORAGE_PREFIX_PLAYLIST}${id}`, []);

  const getCachedData = useCallback((type: 'user' | 'playlist', id: string): SunoMusicPlayerStoredData | null => {
    if (!id) return null;
    try {
      const cacheKey = getCacheKey(type, id);
      const dataStr = localStorage.getItem(cacheKey);
      if (dataStr) {
        return JSON.parse(dataStr) as SunoMusicPlayerStoredData;
      }
    } catch (e) {
      console.error("Error reading from cache:", e);
    }
    return null;
  }, [getCacheKey]);

  const [clearPlayerCacheClickCount, setClearPlayerCacheClickCount] = useState(0);
  const [clearAllHubDataClickCount, setClearAllHubDataClickCount] = useState(0);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const storedPlaylists = localStorage.getItem(LOCAL_STORAGE_SAVED_CUSTOM_PLAYLISTS_KEY);
      if (storedPlaylists) setSavedCustomPlaylists(JSON.parse(storedPlaylists));
    } catch (e) {
      console.error("Error loading saved custom playlists:", e);
      setSavedCustomPlaylists([]);
    }

    try {
      const storedClipCache = localStorage.getItem(LOCAL_STORAGE_CLIP_DETAIL_CACHE_KEY);
      if (storedClipCache) setSongInfoCache(new Map(JSON.parse(storedClipCache)));
    } catch (e) {
      console.error("Error loading song detail cache:", e);
      setSongInfoCache(new Map());
    }
  }, []);

  // Sync with localStorage on changes
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_SAVED_CUSTOM_PLAYLISTS_KEY, JSON.stringify(savedCustomPlaylists));
    } catch (e) {
      console.error("Error saving custom playlists:", e);
    }
  }, [savedCustomPlaylists]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_CLIP_DETAIL_CACHE_KEY, JSON.stringify(Array.from(songInfoCache.entries())));
    } catch (e) {
      console.error("Error saving song detail cache:", e);
    }
  }, [songInfoCache]);

  const handleClearPlayerCache = useCallback(() => {
    if (clearPlayerCacheClickCount < CLEAR_CLICKS_NEEDED - 1) {
      const newCount = clearPlayerCacheClickCount + 1;
      setClearPlayerCacheClickCount(newCount);
      setDataManagementStatus(`Click ${CLEAR_CLICKS_NEEDED - newCount} more times to clear player cache.`);
      setTimeout(() => {
          setClearPlayerCacheClickCount(0);
          setDataManagementStatus('');
      }, CLEAR_TIMEOUT_MS);
      return;
    }
    try {
      localStorage.removeItem(LOCAL_STORAGE_CLIP_DETAIL_CACHE_KEY);
      setSongInfoCache(new Map());
      setDataManagementStatus("Player cache cleared successfully.");
      trackLocalEvent(TOOL_CATEGORY_PLAYER, 'cacheCleared', 'playerCache');
      setTimeout(() => setDataManagementStatus(''), 3000);
    } catch (e) {
      setErrorPlayer("Failed to clear player cache.");
    }
    setClearPlayerCacheClickCount(0);
  }, [clearPlayerCacheClickCount, trackLocalEvent, setErrorPlayer]);

  const handleClearAllHubDataFromPlayer = useCallback(() => {
    if (clearAllHubDataClickCount < CLEAR_CLICKS_NEEDED - 1) {
      const newCount = clearAllHubDataClickCount + 1;
      setClearAllHubDataClickCount(newCount);
      setDataManagementStatus(`Click ${CLEAR_CLICKS_NEEDED - newCount} more times to clear ALL hub data.`);
      setTimeout(() => {
          setClearAllHubDataClickCount(0);
          setDataManagementStatus('');
      }, CLEAR_TIMEOUT_MS);
      return;
    }
    try {
      knownAppLocalStorageKeys.forEach(key => localStorage.removeItem(key));
      const allKeys = Object.keys(localStorage);
      allKeys.forEach(key => {
        if (knownAppLocalStoragePrefixes.some(prefix => key.startsWith(prefix))) {
          localStorage.removeItem(key);
        }
      });
      setDataManagementStatus("All app data cleared. Reloading...");
      trackLocalEvent(TOOL_CATEGORY_PLAYER, 'cacheCleared', 'allAppData');
      setTimeout(() => window.location.reload(), 2000);
    } catch (e) {
      setErrorPlayer("Failed to clear all app data.");
    }
    setClearAllHubDataClickCount(0);
  }, [clearAllHubDataClickCount, trackLocalEvent, setErrorPlayer]);

  const getClearPlayerCacheButtonText = useCallback(() => {
    if (clearPlayerCacheClickCount === 0) return "Clear Player Cache";
    return `Confirm Clear Song Cache (${CLEAR_CLICKS_NEEDED - clearPlayerCacheClickCount} left)`;
  }, [clearPlayerCacheClickCount]);

  const getClearAllHubDataButtonText = useCallback(() => {
    if (clearAllHubDataClickCount === 0) return "Clear All Hub Data";
    return `Confirm Clear ALL (${CLEAR_CLICKS_NEEDED - clearAllHubDataClickCount} left)`;
  }, [clearAllHubDataClickCount]);

  const handleDeleteSavedPlaylistLocally = useCallback((playlistId: string) => {
    setSavedCustomPlaylists(prev => prev.filter(p => p.id !== playlistId));
    setDataManagementStatus("Playlist deleted locally.");
    trackLocalEvent(TOOL_CATEGORY_PLAYER, 'playlistDeletedLocally', playlistId);
    setTimeout(() => setDataManagementStatus(''), 3000);
  }, [trackLocalEvent]);

  const handleExportPlaylistCsv = useCallback(async (queue: SunoClip[], currentIdentifierType: string | null, profileDetail: SunoProfileDetail | null, playlistDetail: SunoPlaylistDetail | null, currentIdentifier: string) => {
    if (queue.length === 0) {
      setDataManagementStatus("Playlist is empty. Nothing to export.");
      setTimeout(() => setDataManagementStatus(''), 3000);
      return;
    }
    try {
      const filename = currentIdentifierType === 'user' && profileDetail?.handle 
        ? `suno_playlist_@${profileDetail.handle}` 
        : currentIdentifierType === 'playlist' && playlistDetail?.name 
          ? `suno_playlist_${playlistDetail.name.replace(/\s+/g, '_')}` 
          : 'suno_custom_playlist';
      
      downloadSunoPlaylistAsCsv(queue, filename);
      setDataManagementStatus("Playlist exported to CSV!");
      trackLocalEvent(TOOL_CATEGORY_PLAYER, 'playlistExportedToCsv', currentIdentifier, queue.length);
    } catch (error) {
      console.error("Error exporting playlist to CSV:", error);
      setDataManagementStatus("Error exporting playlist. See console.");
    }
    setTimeout(() => setDataManagementStatus(''), 3000);
  }, [trackLocalEvent]);

  const handleExportCurrentPlaylistToFile = useCallback((queue: SunoClip[], originalSongsList: SunoClip[], currentIdentifierType: string | null, profileDetail: SunoProfileDetail | null, playlistDetail: SunoPlaylistDetail | null, currentIdentifier: string) => {
    const listToExport = queue.length > 0 ? queue : originalSongsList;
    if (listToExport.length === 0) {
      setDataManagementStatus("No songs to export.");
      setTimeout(() => setDataManagementStatus(''), 3000);
      return;
    }
    const content = listToExport.map(song => song.suno_song_url || `https://suno.com/song/${song.id}`).join('\n');
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const filenamePrefix = currentIdentifierType === 'user' && profileDetail?.handle 
      ? `suno_playlist_@${profileDetail.handle}` 
      : currentIdentifierType === 'playlist' && playlistDetail?.name 
        ? `suno_playlist_${playlistDetail.name.replace(/\s+/g, '_')}` 
        : 'suno_custom_export';
    
    link.href = url;
    link.download = `${filenamePrefix}_playlist.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setDataManagementStatus("Playlist exported to TXT file!");
    trackLocalEvent(TOOL_CATEGORY_PLAYER, 'playlistExportedToTxt', currentIdentifier, listToExport.length);
    setTimeout(() => setDataManagementStatus(''), 3000);
  }, [trackLocalEvent]);

  const handleImportPlaylistFromTxtFile = useCallback((event: React.ChangeEvent<HTMLInputElement>, setIdentifierInput: (val: string) => void) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setIdentifierInput(text);
        setDataManagementStatus(`TXT file content loaded. Click "Load Song List from Input".`);
        trackLocalEvent(TOOL_CATEGORY_PLAYER, 'playlistFileImported_txt', file.name, text.split('\n').filter(u => u.trim()).length);
      };
      reader.readAsText(file);
      if (event.target) event.target.value = "";
    }
  }, [trackLocalEvent]);

  const parseCsvLine = (text: string): string[] => {
    const result: string[] = [];
    let cur = "";
    let inQuote = false;
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        if (char === '"') {
            inQuote = !inQuote;
        } else if (char === ',' && !inQuote) {
            result.push(cur.trim());
            cur = "";
        } else {
            cur += char;
        }
    }
    result.push(cur.trim());
    return result;
  };

  const handleImportPlaylistFromCsvFile = useCallback((event: React.ChangeEvent<HTMLInputElement>, setIdentifierInput: (val: string) => void) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
        const urlsToImport: string[] = [];
        let urlColumnIndex = -1;
        if (lines.length > 0) {
          const headerCells = parseCsvLine(lines[0]);
          const possibleUrlHeaders = ["suno song url", "url", "link", "suno_song_url"];
          urlColumnIndex = headerCells.findIndex(header => possibleUrlHeaders.includes(header.toLowerCase().trim()));
          if (urlColumnIndex === -1 && headerCells.length === 3 && headerCells[0].toLowerCase().includes("creator") && headerCells[1].toLowerCase().includes("title")) {
            urlColumnIndex = 2;
          }
        }
        const linesToParse = urlColumnIndex !== -1 && lines.length > 0 ? lines.slice(1) : lines;
        linesToParse.forEach(line => {
          const columns = parseCsvLine(line);
          let potentialUrl = "";
          if (urlColumnIndex !== -1 && columns.length > urlColumnIndex) {
            potentialUrl = columns[urlColumnIndex].trim();
          } else if (columns.length > 0) {
            potentialUrl = columns[0].trim();
          }
          if (potentialUrl && (potentialUrl.includes('suno.com') || (potentialUrl.split(',').length === 2 && potentialUrl.split(',')[0].includes('suno.com')))) {
            urlsToImport.push(potentialUrl);
          }
        });
        if (urlsToImport.length > 0) {
          setIdentifierInput(urlsToImport.join('\n'));
          setDataManagementStatus(`CSV content loaded (${urlsToImport.length} URLs). Click "Load Song List from Input".`);
          trackLocalEvent(TOOL_CATEGORY_PLAYER, 'playlistFileImported_csv', file.name, urlsToImport.length);
        } else {
          setDataManagementStatus(`No valid Suno URLs or custom format lines found in the CSV's expected columns.`);
          trackLocalEvent(TOOL_CATEGORY_PLAYER, 'playlistFileImported_csv_no_urls', file.name);
        }
      };
      reader.onerror = () => {
        setDataManagementStatus(`Error reading CSV file.`);
        trackLocalEvent(TOOL_CATEGORY_PLAYER, 'playlistFileImportFailed_csv_read_error', file.name);
      };
      reader.readAsText(file);
      if (event.target) event.target.value = "";
    }
  }, [trackLocalEvent]);

  const handleSaveCurrentPlaylistLocally = useCallback((name: string, contentToSave: string) => {
    if (!name.trim()) {
      setDataManagementStatus("Playlist name cannot be empty.");
      setTimeout(() => setDataManagementStatus(''), 3000);
      return;
    }
    if (!contentToSave.trim()) {
      setDataManagementStatus("Playlist content is empty. Cannot save.");
      setTimeout(() => setDataManagementStatus(''), 3000);
      return;
    }
    const newSavedPlaylist: SavedCustomPlaylist = {
      id: Date.now().toString(),
      name: name.trim(),
      content: contentToSave,
      createdAt: new Date().toISOString()
    };
    setSavedCustomPlaylists(prev => [newSavedPlaylist, ...prev.filter(p => p.name.toLowerCase() !== name.trim().toLowerCase())]);
    setDataManagementStatus(`Playlist "${name.trim()}" saved locally!`);
    trackLocalEvent(TOOL_CATEGORY_PLAYER, 'playlistSavedLocally', name.trim());
    setTimeout(() => setDataManagementStatus(''), 3000);
  }, [trackLocalEvent]);

  const handleUpdateSavedPlaylistLocally = useCallback((playlistId: string, newContent: string) => {
    const playlistToUpdate = savedCustomPlaylists.find(p => p.id === playlistId);
    if (!playlistToUpdate) return;

    if (!newContent.trim()) {
      setDataManagementStatus("Cannot update. The current play queue is empty.");
      setTimeout(() => setDataManagementStatus(''), 3000);
      return;
    }

    setSavedCustomPlaylists(prev => prev.map(p => p.id === playlistId ? { ...p, content: newContent } : p));
    setDataManagementStatus(`Playlist "${playlistToUpdate.name}" updated with current queue!`);
    trackLocalEvent(TOOL_CATEGORY_PLAYER, 'playlistUpdatedLocally', playlistToUpdate.name);
    setTimeout(() => setDataManagementStatus(''), 3000);
  }, [savedCustomPlaylists, trackLocalEvent]);

  return {
    savedCustomPlaylists,
    setSavedCustomPlaylists,
    songInfoCache,
    setSongInfoCache,
    dataManagementStatus,
    setDataManagementStatus,
    clearPlayerCacheClickCount,
    handleClearPlayerCache,
    getClearPlayerCacheButtonText,
    clearAllHubDataClickCount,
    handleClearAllHubDataFromPlayer,
    getClearAllHubDataButtonText,
    handleSaveCurrentPlaylistLocally,
    handleUpdateSavedPlaylistLocally,
    handleDeleteSavedPlaylistLocally,
    handleExportPlaylistCsv,
    handleExportCurrentPlaylistToFile,
    handleImportPlaylistFromTxtFile,
    handleImportPlaylistFromCsvFile,
    getCacheKey,
    getCachedData,
  };
};
