import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { SongCardInterface, SongGroup, PickerMode } from '@/types';
import { 
    shuffleArray, generateRandomColor, extractSunoPlaylistIdFromPath,
    parseKeyValueFormat, inferSourceTypeFromInput 
} from '@/tools/SongDeckPicker/songDeckPicker.utils';
import { 
    fetchSunoClipById, fetchSunoPlaylistById, resolveSunoUrlToPotentialSongId 
} from '@/services/sunoService';
import { 
    fetchRiffusionSongData, extractRiffusionSongId 
} from '@/services/riffusionService';
import { TOOL_CATEGORY, LOCAL_STORAGE_SONG_INFO_CACHE_KEY, SONG_INFO_CACHE_CLEAR_CLICKS_NEEDED, CONFIRM_TIMEOUT_MS } from '@/tools/SongDeckPicker/songDeckPicker.constants';

interface UseDeckDataProps {
    trackLocalEvent: (category: string, action: string, label?: string, value?: number) => void;
    pickerMode: PickerMode;
}

export const useDeckData = ({ trackLocalEvent, pickerMode }: UseDeckDataProps) => {
    const [rawSongInput, setRawSongInput] = useState<string>('');
    const [rawBonusArtistsInput, setRawBonusArtistsInput] = useState<string>('');
    const [fullDeck, setFullDeck] = useState<SongCardInterface[]>([]);
    const [appliedBonuses, setAppliedBonuses] = useState<string[]>([]);
    const [songGroups, setSongGroups] = useState<SongGroup[]>([]);
    
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [statusMessage, setStatusMessage] = useState<string>('');
    const [fetchProgressMessage, setFetchProgressMessage] = useState<string>('');

    const [songInfoCache, setSongInfoCache] = useState<Map<string, SongCardInterface>>(new Map());
    const [clearSongInfoCacheClickCount, setClearSongInfoCacheClickCount] = useState(0);
    const [clearSongInfoCacheStatus, setClearSongInfoCacheStatus] = useState('');
    const clearSongInfoCacheTimeoutRef = useRef<number | null>(null);

    // Initial Cache Loading
    useEffect(() => {
        try {
            const storedSongCache = localStorage.getItem(LOCAL_STORAGE_SONG_INFO_CACHE_KEY);
            if (storedSongCache) setSongInfoCache(new Map(JSON.parse(storedSongCache)));
        } catch (e) { console.error("Error loading song cache from localStorage:", e); }
    }, []);

    // Cache Persistence
    useEffect(() => { 
        try { 
            localStorage.setItem(LOCAL_STORAGE_SONG_INFO_CACHE_KEY, JSON.stringify(Array.from(songInfoCache.entries()))); 
        } catch (e) { console.error("Error saving song info cache to localStorage", e); } 
    }, [songInfoCache]);

    const buildDeckInternal = useCallback(async (currentRawSongInput: string, currentAppliedBonuses: string[]) => {
        setIsLoading(true); setError(null); setStatusMessage('Processing entries and building deck...');
        setFetchProgressMessage('');

        const inputLines = currentRawSongInput.split('\n').map(line => line.trim()).filter(line => line !== '');
        if (inputLines.length === 0) {
            setError("No song entries provided."); setIsLoading(false); setStatusMessage(''); setFullDeck([]); return;
        }

        let processedEntryCount = 0; let successfulCardCreations = 0; let cacheHits = 0;
        const newDeckBaseAccumulator: SongCardInterface[] = [];
        let fetchErrors = 0; let errorMessagesAccumulator: string[] = [];
        let sunoPlaylistSongCount = 0; let sunoShortUrlSongCount = 0; let sunoLongUrlSongCount = 0;
        let customFormatSongCount = 0; let sunoGeneralUrlSongCount = 0; let otherUrlSongCount = 0;
        let riffusionUrlSongCount = 0;

        for (let i = 0; i < inputLines.length; i++) {
            const line = inputLines[i];
            await new Promise(resolve => setTimeout(resolve, 50));
            setFetchProgressMessage(`Processing entry ${i + 1}/${inputLines.length}... (${newDeckBaseAccumulator.length} cards created)`);

            const cachedCard = songInfoCache.get(line);
            if (cachedCard) {
                newDeckBaseAccumulator.push({ ...cachedCard, isBonusApplied: false, originalInputLine: line });
                successfulCardCreations++;
                cacheHits++;
                switch (cachedCard.sourceType) {
                    case 'suno_playlist': sunoPlaylistSongCount++; break;
                    case 'suno_short_url': sunoShortUrlSongCount++; break;
                    case 'suno_long_url': sunoLongUrlSongCount++; break;
                    case 'riffusion_url': riffusionUrlSongCount++; break;
                    case 'custom_format': customFormatSongCount++; break;
                    case 'suno_general_url': sunoGeneralUrlSongCount++; break;
                    case 'other_url': otherUrlSongCount++; break;
                }
                processedEntryCount++;
                continue;
            }

            const cardSourceType = inferSourceTypeFromInput(line);

            try {
                if (cardSourceType === 'suno_playlist') {
                    const playlistId = extractSunoPlaylistIdFromPath(line.startsWith('http') ? line : `https://${line}`);
                    if (playlistId) {
                        setFetchProgressMessage(`Fetching playlist ${playlistId.substring(0, 8)}... (Entry ${i + 1}/${inputLines.length})`);
                        const { clips: playlistClips } = await fetchSunoPlaylistById(playlistId);
                        if (playlistClips && playlistClips.length > 0) {
                            playlistClips.forEach(clip => {
                                const newCard: SongCardInterface = { id: clip.id, artistName: clip.display_name || clip.handle, title: clip.title, imageUrl: clip.image_url || undefined, webLink: clip.suno_song_url, audioUrl: clip.audio_url, color: generateRandomColor(), originalInputLine: line, sourceType: 'suno_playlist', isBonusApplied: false };
                                newDeckBaseAccumulator.push(newCard);
                                if (clip.suno_song_url) setSongInfoCache(prev => new Map(prev).set(clip.suno_song_url!, { ...newCard, originalInputLine: clip.suno_song_url! }));
                            });
                            sunoPlaylistSongCount += playlistClips.length;
                            successfulCardCreations += playlistClips.length;
                        } else { errorMessagesAccumulator.push(`Playlist ${playlistId.substring(0, 8)} is empty or private.`); }
                    }
                } else if (cardSourceType === 'riffusion_url') {
                    const songId = extractRiffusionSongId(line);
                    if (songId) {
                        setFetchProgressMessage(`Fetching Riffusion song ${songId.substring(0, 8)}... (Entry ${i + 1}/${inputLines.length})`);
                        const riffusionData = await fetchRiffusionSongData(songId);
                        if (riffusionData) {
                            const newCard: SongCardInterface = {
                                id: riffusionData.id, artistName: riffusionData.artist, title: riffusionData.title, imageUrl: riffusionData.image_url,
                                webLink: `https://www.producer.ai/song/${riffusionData.id}`, audioUrl: riffusionData.audio_url, color: generateRandomColor(), originalInputLine: line,
                                sourceType: 'riffusion_url', isBonusApplied: false
                            };
                            newDeckBaseAccumulator.push(newCard);
                            setSongInfoCache(prev => new Map(prev).set(line, newCard));
                            successfulCardCreations++; riffusionUrlSongCount++;
                        } else { throw new Error(`Details not found for Riffusion ID ${songId.substring(0, 8)}...`); }
                    } else { throw new Error('Could not extract Riffusion ID from URL.'); }
                } else if (cardSourceType === 'suno_short_url' || cardSourceType === 'suno_long_url' || cardSourceType === 'suno_general_url') {
                    setFetchProgressMessage(`Resolving/Fetching Suno URL ${line.substring(0, 30)}... (Entry ${i + 1}/${inputLines.length})`);
                    const sunoSongId = await resolveSunoUrlToPotentialSongId(line, setFetchProgressMessage);
                    if (!sunoSongId) throw new Error("Could not resolve Suno URL to a song ID.");
                    const clip = await fetchSunoClipById(sunoSongId);
                    if (clip) {
                        const newCard: SongCardInterface = { id: clip.id, artistName: clip.display_name || clip.handle, title: clip.title, imageUrl: clip.image_url || undefined, webLink: clip.suno_song_url, audioUrl: clip.audio_url, color: generateRandomColor(), originalInputLine: line, sourceType: cardSourceType, isBonusApplied: false };
                        newDeckBaseAccumulator.push(newCard);
                        setSongInfoCache(prev => new Map(prev).set(line, newCard));
                        successfulCardCreations++;
                        if (cardSourceType === 'suno_short_url') sunoShortUrlSongCount++;
                        else if (cardSourceType === 'suno_long_url') sunoLongUrlSongCount++;
                        else sunoGeneralUrlSongCount++;
                    } else { throw new Error(`Song details not found for ID ${sunoSongId.substring(0, 8)}...`); }
                } else if (cardSourceType === 'other_url') {
                    const newCard: SongCardInterface = { id: `otherurl-${Date.now()}-${i}`, artistName: "External Source", title: line.substring(0, 50) + (line.length > 50 ? "..." : ""), imageUrl: undefined, webLink: line, color: generateRandomColor(), originalInputLine: line, sourceType: 'other_url', isBonusApplied: false };
                    newDeckBaseAccumulator.push(newCard);
                    setSongInfoCache(prev => new Map(prev).set(line, newCard));
                    successfulCardCreations++; otherUrlSongCount++;
                } else { // custom_format or fallback
                    const parsedCardResult = parseKeyValueFormat(line);
                    if ('error' in parsedCardResult) throw new Error(parsedCardResult.error);
                    const newCard = { ...parsedCardResult, sourceType: 'custom_format' as const, isBonusApplied: false, originalInputLine: line };
                    newDeckBaseAccumulator.push(newCard);
                    setSongInfoCache(prev => new Map(prev).set(line, newCard));
                    successfulCardCreations++; customFormatSongCount++;
                }
            } catch (err: unknown) {
                fetchErrors++;
                errorMessagesAccumulator.push(`Error on line "${line.substring(0, 30)}...": ${err instanceof Error ? err.message : 'Unknown error'}`);
            }
            processedEntryCount++;
        }

        let finalDeck: SongCardInterface[];
        let bonusCount = 0;

        if (pickerMode === PickerMode.RankingReveal) {
            const rankedDeck = newDeckBaseAccumulator.map((card, index) => ({
                ...card,
                rank: index + 1,
                isRevealed: false,
            }));
            finalDeck = rankedDeck;
            setFullDeck(finalDeck);
        } else {
            if (currentAppliedBonuses.length > 0) {
                const deckWithBonuses: SongCardInterface[] = [];
                newDeckBaseAccumulator.forEach(card => {
                    deckWithBonuses.push(card);
                    if (currentAppliedBonuses.includes(card.artistName.toLowerCase()) && !card.isBonusApplied) {
                        deckWithBonuses.push({ ...card, id: `${card.id}-bonus-${deckWithBonuses.length}`, isBonusApplied: true });
                        bonusCount++;
                    }
                });
                finalDeck = deckWithBonuses;
            } else {
                finalDeck = newDeckBaseAccumulator;
            }
            setFullDeck(shuffleArray(finalDeck));
        }

        setIsLoading(false);
        setFetchProgressMessage('');

        let finalStatus = `Deck built: ${successfulCardCreations} base cards (${cacheHits} from cache), ${bonusCount} bonus copies. Total: ${finalDeck.length} cards.\n`;
        finalStatus += `Sources: Playlists (${sunoPlaylistSongCount}), Short URLs (${sunoShortUrlSongCount}), Long URLs (${sunoLongUrlSongCount}), Riffusion URLs (${riffusionUrlSongCount}), Custom (${customFormatSongCount}), Other URL (${otherUrlSongCount}).`;
        if (fetchErrors > 0) finalStatus += `\n${fetchErrors} entries had issues.`;

        setStatusMessage(finalStatus);
        if (errorMessagesAccumulator.length > 0) setError(errorMessagesAccumulator.slice(0, 3).join('\n')); else setError(null);
        trackLocalEvent(TOOL_CATEGORY, 'deckBuilt', `Base:${successfulCardCreations}|Cached:${cacheHits}|Total:${finalDeck.length}|Playlists:${sunoPlaylistSongCount}|Short:${sunoShortUrlSongCount}|Long:${sunoLongUrlSongCount}|Riffusion:${riffusionUrlSongCount}|Custom:${customFormatSongCount}|OtherURL:${otherUrlSongCount}`);

    }, [trackLocalEvent, songInfoCache, pickerMode]);

    const handleClearSongInfoCache = useCallback(() => {
        if (clearSongInfoCacheTimeoutRef.current) clearTimeout(clearSongInfoCacheTimeoutRef.current);
        const newClickCount = clearSongInfoCacheClickCount + 1;
        setClearSongInfoCacheClickCount(newClickCount);

        if (newClickCount >= SONG_INFO_CACHE_CLEAR_CLICKS_NEEDED) {
            setSongInfoCache(new Map());
            localStorage.removeItem(LOCAL_STORAGE_SONG_INFO_CACHE_KEY);
            setClearSongInfoCacheStatus('Song info cache cleared.');
            setClearSongInfoCacheClickCount(0);
            setTimeout(() => setClearSongInfoCacheStatus(''), 3000);
        } else {
            clearSongInfoCacheTimeoutRef.current = window.setTimeout(() => setClearSongInfoCacheClickCount(0), CONFIRM_TIMEOUT_MS);
        }
    }, [clearSongInfoCacheClickCount]);

    return {
        rawSongInput, setRawSongInput,
        rawBonusArtistsInput, setRawBonusArtistsInput,
        fullDeck, setFullDeck,
        appliedBonuses, setAppliedBonuses,
        songGroups, setSongGroups,
        isLoading, setIsLoading,
        error, setError,
        statusMessage, setStatusMessage,
        fetchProgressMessage, setFetchProgressMessage,
        songInfoCache, setSongInfoCache,
        clearSongInfoCacheClickCount, setClearSongInfoCacheClickCount,
        clearSongInfoCacheStatus, setClearSongInfoCacheStatus,
        clearSongInfoCacheTimeoutRef,
        buildDeckInternal,
        handleClearSongInfoCache
    };
};
