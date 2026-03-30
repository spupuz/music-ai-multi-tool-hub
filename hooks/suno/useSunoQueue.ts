import { useState, useEffect, useCallback, useRef } from 'react';
import { SunoClip, PlaybackStatus, PlayerState } from '../../types';
import { shuffleArray } from '../../utils/arrayUtils';
import { TOOL_CATEGORY_PLAYER, CLEAR_CLICKS_NEEDED, CLEAR_TIMEOUT_MS } from './constants';

export type SortCriteriaHook = 'default' | 'play_count' | 'upvote_count' | 'created_at' | 'title';

interface UseSunoQueueProps {
  originalSongsList: SunoClip[];
  setOriginalSongsListInternal: React.Dispatch<React.SetStateAction<SunoClip[]>>;
  playerState: PlayerState;
  setPlayerState: (updater: React.SetStateAction<PlayerState>) => void;
  trackLocalEvent: (category: string, action: string, label?: string, value?: string | number) => void;
  setDataManagementStatus: (status: string) => void;
  stopCurrentAudio: () => void;
}

export const useSunoQueue = ({
  originalSongsList,
  setOriginalSongsListInternal,
  playerState,
  setPlayerState,
  trackLocalEvent,
  setDataManagementStatus,
  stopCurrentAudio,
}: UseSunoQueueProps) => {
  const [sortCriteriaInternalState, setSortCriteriaInternalState] = useState<SortCriteriaHook>('default');
  const [filterQuery, setFilterQuery] = useState<string>('');
  const [manualOrderSongIds, setManualOrderSongIds] = useState<string[] | null>(null);

  const [clearQueueClickCount, setClearQueueClickCount] = useState(0);
  const clearQueueTimeoutRef = useRef<number | null>(null);

  const setSortCriteria = useCallback((newSortCriteria: SortCriteriaHook) => {
    setSortCriteriaInternalState(newSortCriteria);
    if (newSortCriteria !== 'default') {
      setManualOrderSongIds(null);
    }
  }, []);

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

  const handleReorderQueue = useCallback((draggedSongId: string, targetSongId: string, insertBeforeTarget: boolean) => {
    const currentQueue = playerState.queue;
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
  }, [playerState.queue, trackLocalEvent, setPlayerState]);

  const handleClearQueue = useCallback(() => {
    if (clearQueueTimeoutRef.current) {
      clearTimeout(clearQueueTimeoutRef.current);
    }
    const newClickCount = clearQueueClickCount + 1;
    setClearQueueClickCount(newClickCount);

    if (newClickCount >= CLEAR_CLICKS_NEEDED) {
      stopCurrentAudio();
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
  }, [clearQueueClickCount, stopCurrentAudio, setOriginalSongsListInternal, setPlayerState, setDataManagementStatus, trackLocalEvent]);

  const getClearQueueButtonText = useCallback((): string => {
    if (clearQueueClickCount > 0) {
      return `Confirm Clear Queue (${CLEAR_CLICKS_NEEDED - clearQueueClickCount} left)`;
    }
    return 'Clear Queue';
  }, [clearQueueClickCount]);

  useEffect(() => {
    return () => {
      if (clearQueueTimeoutRef.current) clearTimeout(clearQueueTimeoutRef.current);
    };
  }, []);

  const removeSongFromQueue = useCallback((songId: string) => {
    setOriginalSongsListInternal(prev => prev.filter(s => s.id !== songId));
    if (manualOrderSongIds) {
      setManualOrderSongIds(prev => prev ? prev.filter(id => id !== songId) : null);
    }
    setPlayerState(prev => {
      const newQueue = prev.queue.filter(s => s.id !== songId);
      const isCurrentPlayingRemoved = prev.currentSong?.id === songId;

      if (isCurrentPlayingRemoved) {
        stopCurrentAudio();
        return {
          ...prev,
          queue: newQueue,
          currentSong: null,
          status: PlaybackStatus.Idle,
          currentTime: 0,
          duration: 0
        };
      }
      return { ...prev, queue: newQueue };
    });
    trackLocalEvent(TOOL_CATEGORY_PLAYER, 'songRemovedFromQueue', songId);
  }, [manualOrderSongIds, trackLocalEvent, setPlayerState, setOriginalSongsListInternal, stopCurrentAudio]);

  return {
    sortCriteria: sortCriteriaInternalState,
    setSortCriteria,
    filterQuery,
    setFilterQuery,
    manualOrderSongIds,
    setManualOrderSongIds,
    handleReorderQueue,
    handleClearQueue,
    getClearQueueButtonText,
    removeSongFromQueue,
  };
};
