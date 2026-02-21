
// hooks/useSongDeckPickerLogic.ts
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import type { ToolProps } from '../Layout';
import { PickerMode } from '../types';
import type { SongCardInterface, PickedSongLogEntry, SunoClip, DeckTheme, DeckThemeSettings, SongGroup } from '../types';
import { fetchSunoClipById, fetchSunoPlaylistById, resolveSunoUrlToPotentialSongId, extractSunoSongIdFromPath } from '../services/sunoService';
import { fetchRiffusionSongData, extractRiffusionSongId } from '../services/riffusionService';
import {
    LOCAL_STORAGE_PICKED_SONGS_LOG_KEY, LOCAL_STORAGE_SAVED_THEMES_KEY, LOCAL_STORAGE_SONG_INFO_CACHE_KEY,
    DEFAULT_CUSTOM_TITLE, DEFAULT_SELECTED_LOGO_SIZE,
    DEFAULT_TOOL_BG_COLOR_DARK, DEFAULT_TOOL_TEXT_COLOR_DARK, DEFAULT_CARD_BG_COLOR_DARK, DEFAULT_CARD_BORDER_COLOR_DARK, DEFAULT_CARD_TEXT_COLOR_DARK,
    DEFAULT_TOOL_BG_COLOR_LIGHT, DEFAULT_TOOL_TEXT_COLOR_LIGHT, DEFAULT_CARD_BG_COLOR_LIGHT, DEFAULT_CARD_BORDER_COLOR_LIGHT, DEFAULT_CARD_TEXT_COLOR_LIGHT,
    DEFAULT_TOOL_ACCENT_COLOR, DEFAULT_CARD_TEXT_FONT,
    DEFAULT_NUMBER_OF_CARDS_TO_DRAW,
    DEFAULT_PICKER_MODE, DEFAULT_REVEAL_POOL_SIZE_X, DEFAULT_MAX_LOGGED_SONGS_N, DEFAULT_CUSTOM_CARD_BACK_BASE64,
    SONG_INFO_CACHE_CLEAR_CLICKS_NEEDED, SONG_INFO_CACHE_CLEAR_TIMEOUT_MS,
    DEFAULT_MAX_SONGS_PER_GROUP, TOOL_CATEGORY,
    LOGGED_SONGS_CLEAR_RETURN_CLICKS_NEEDED, GROUP_REMOVE_CLICKS_NEEDED, CONFIRM_TIMEOUT_MS,
    DEFAULT_RANKING_REVEAL_TOP_X, DEFAULT_RANKING_REVEAL_SNIPPET_DURATION
} from '../songDeckPicker.constants';
import {
    shuffleArray, generateRandomColor, extractSunoPlaylistIdFromPath,
    parseKeyValueFormat, isLikelyUrl, convertCardToOutputFormat, downloadTextFile, inferSourceTypeFromInput
} from '../songDeckPicker.utils';
import { normalizeHexColor } from '../utils/imageUtils';
import { useTheme } from '../context/ThemeContext';


export const useSongDeckPickerLogic = ({ trackLocalEvent }: ToolProps) => {
    const { theme } = useTheme();

    const [rawSongInput, setRawSongInput] = useState<string>('');
    const [rawBonusArtistsInput, setRawBonusArtistsInput] = useState<string>('');
    const [fullDeck, setFullDeck] = useState<SongCardInterface[]>([]);
    const [appliedBonuses, setAppliedBonuses] = useState<string[]>([]);
    const [selectedCardForLogging, setSelectedCardForLogging] = useState<SongCardInterface | null>(null);
    const [loggedCards, setLoggedCards] = useState<PickedSongLogEntry[]>([]);
    const [showConfetti, setShowConfetti] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [statusMessage, setStatusMessage] = useState<string>('');
    const [fetchProgressMessage, setFetchProgressMessage] = useState<string>('');
    const [showInputs, setShowInputs] = useState(true);
    const [clipboardStatus, setClipboardStatus] = useState<string>('');
    const [downloadStatus, setDownloadStatus] = useState<string>('');
    const [cardAnimationKey, setCardAnimationKey] = useState(0);

    const [customTitle, setCustomTitle] = useState<string>(DEFAULT_CUSTOM_TITLE);
    const [customLogo, setCustomLogo] = useState<string | null>(null);
    const [selectedLogoSize, setSelectedLogoSize] = useState<string>(DEFAULT_SELECTED_LOGO_SIZE);
    const [showCustomization, setShowCustomization] = useState(false);

    // Initialize with theme-aware defaults (fallback to Dark if unknown, but useEffect will correct)
    const [toolBackgroundColor, setToolBackgroundColor] = useState<string>(DEFAULT_TOOL_BG_COLOR_DARK);
    const [toolBackgroundColorHexInput, setToolBackgroundColorHexInput] = useState<string>(DEFAULT_TOOL_BG_COLOR_DARK);
    const [cardTextFont, setCardTextFont] = useState<string>(DEFAULT_CARD_TEXT_FONT);
    const [toolAccentColor, setToolAccentColor] = useState<string>(DEFAULT_TOOL_ACCENT_COLOR);
    const [toolAccentColorHexInput, setToolAccentColorHexInput] = useState<string>(DEFAULT_TOOL_ACCENT_COLOR);
    const [cardBackgroundColor, setCardBackgroundColor] = useState<string>(DEFAULT_CARD_BG_COLOR_DARK);
    const [cardBackgroundColorHexInput, setCardBackgroundColorHexInput] = useState<string>(DEFAULT_CARD_BG_COLOR_DARK);
    const [cardBorderColor, setCardBorderColor] = useState<string>(DEFAULT_CARD_BORDER_COLOR_DARK);
    const [cardBorderColorHexInput, setCardBorderColorHexInput] = useState<string>(DEFAULT_CARD_BORDER_COLOR_DARK);
    const [cardTextColor, setCardTextColor] = useState<string>(DEFAULT_CARD_TEXT_COLOR_DARK);
    const [cardTextColorHexInput, setCardTextColorHexInput] = useState<string>(DEFAULT_CARD_TEXT_COLOR_DARK);
    const [toolTextColor, setToolTextColor] = useState<string>(DEFAULT_TOOL_TEXT_COLOR_DARK);
    const [toolTextColorHexInput, setToolTextColorHexInput] = useState<string>(DEFAULT_TOOL_TEXT_COLOR_DARK);

    const [numberOfCardsToDraw, setNumberOfCardsToDraw] = useState<number>(DEFAULT_NUMBER_OF_CARDS_TO_DRAW);

    const [pickerMode, setPickerMode] = useState<PickerMode>(DEFAULT_PICKER_MODE);
    const [revealPoolSizeX, setRevealPoolSizeX] = useState<number>(DEFAULT_REVEAL_POOL_SIZE_X);
    const [maxLoggedSongsN, setMaxLoggedSongsN] = useState<number>(DEFAULT_MAX_LOGGED_SONGS_N);
    const [customCardBackBase64, setCustomCardBackBase64] = useState<string | null>(DEFAULT_CUSTOM_CARD_BACK_BASE64);
    const [maxSongsPerGroup, setMaxSongsPerGroup] = useState<number>(DEFAULT_MAX_SONGS_PER_GROUP);
    const [rankingRevealTopX, setRankingRevealTopX] = useState<number>(DEFAULT_RANKING_REVEAL_TOP_X);
    const [rankingRevealSnippetDuration, setRankingRevealSnippetDuration] = useState<number>(DEFAULT_RANKING_REVEAL_SNIPPET_DURATION);

    const [currentRevealPool, setCurrentRevealPool] = useState<SongCardInterface[]>([]);
    const [revealedInPoolCount, setRevealedInPoolCount] = useState<number>(0);
    const [isRevealRoundActive, setIsRevealRoundActive] = useState<boolean>(false);
    const [nextRankToReveal, setNextRankToReveal] = useState<number | null>(null);
    const [revealedRankingCard, setRevealedRankingCard] = useState<SongCardInterface | null>(null);

    const [songGroups, setSongGroups] = useState<SongGroup[]>([]);
    const [currentGroupNameInput, setCurrentGroupNameInput] = useState<string>('');


    const [savedDeckThemes, setSavedDeckThemes] = useState<DeckTheme[]>([]);
    const [showSaveThemeModal, setShowSaveThemeModal] = useState(false);
    const [showLoadThemeModal, setShowLoadThemeModal] = useState(false);
    const [newThemeName, setNewThemeName] = useState('');
    const [errorSaveTheme, setErrorSaveTheme] = useState<string | null>(null);

    const [showExportConfigModal, setShowExportConfigModal] = useState(false);
    const [showImportConfigModal, setShowImportConfigModal] = useState(false);
    const [configToExportJson, setConfigToExportJson] = useState('');
    const [configToImportJson, setConfigToImportJson] = useState('');
    const [importConfigError, setImportConfigError] = useState('');
    const importConfigFileRef = useRef<HTMLInputElement>(null);

    type AnimationStage = 'idle' | 'drawing' | 'animatingArrow' | 'arrowLanded' | 'cardFocused';
    const [animatedSelectionStage, setAnimatedSelectionStage] = useState<AnimationStage>('idle');
    const animatedSelectionStageRef = useRef(animatedSelectionStage);
    useEffect(() => { animatedSelectionStageRef.current = animatedSelectionStage; }, [animatedSelectionStage]);

    const [drawnCardsForSelection, setDrawnCardsForSelection] = useState<SongCardInterface[] | null>(null);
    const [arrowPositionIndex, setArrowPositionIndex] = useState<number | null>(null);
    const [finallyChosenCardFromAnimation, setFinallyChosenCardFromAnimation] = useState<SongCardInterface | null>(null);
    const [isPickingRandomCard, setIsPickingRandomCard] = useState(false);

    const animationAbortControllerRef = useRef<AbortController | null>(null);

    const [songInfoCache, setSongInfoCache] = useState<Map<string, SongCardInterface>>(new Map());
    const [clearSongInfoCacheClickCount, setClearSongInfoCacheClickCount] = useState(0);
    const [clearSongInfoCacheStatus, setClearSongInfoCacheStatus] = useState('');
    const clearSongInfoCacheTimeoutRef = useRef<number | null>(null);

    // New state for clear logged songs & remove group confirmations
    const [clearLoggedSongsClickCount, setClearLoggedSongsClickCount] = useState(0);
    const clearLoggedSongsTimeoutRef = useRef<number | null>(null);
    const [groupToRemoveConfirm, setGroupToRemoveConfirm] = useState<{ groupId: string | null; count: number }>({ groupId: null, count: 0 });
    const groupRemoveConfirmTimeoutRef = useRef<number | null>(null);

    // Sync colors with theme change if they match defaults
    useEffect(() => {
        if (theme === 'light') {
            setToolBackgroundColor(prev => prev === DEFAULT_TOOL_BG_COLOR_DARK ? DEFAULT_TOOL_BG_COLOR_LIGHT : prev);
            setToolTextColor(prev => prev === DEFAULT_TOOL_TEXT_COLOR_DARK ? DEFAULT_TOOL_TEXT_COLOR_LIGHT : prev);
            setCardBackgroundColor(prev => prev === DEFAULT_CARD_BG_COLOR_DARK ? DEFAULT_CARD_BG_COLOR_LIGHT : prev);
            setCardBorderColor(prev => prev === DEFAULT_CARD_BORDER_COLOR_DARK ? DEFAULT_CARD_BORDER_COLOR_LIGHT : prev);
            setCardTextColor(prev => prev === DEFAULT_CARD_TEXT_COLOR_DARK ? DEFAULT_CARD_TEXT_COLOR_LIGHT : prev);
            // Inputs follow suit to keep UI sync
            setToolBackgroundColorHexInput(prev => prev === DEFAULT_TOOL_BG_COLOR_DARK ? DEFAULT_TOOL_BG_COLOR_LIGHT : prev);
            setToolTextColorHexInput(prev => prev === DEFAULT_TOOL_TEXT_COLOR_DARK ? DEFAULT_TOOL_TEXT_COLOR_LIGHT : prev);
            setCardBackgroundColorHexInput(prev => prev === DEFAULT_CARD_BG_COLOR_DARK ? DEFAULT_CARD_BG_COLOR_LIGHT : prev);
            setCardBorderColorHexInput(prev => prev === DEFAULT_CARD_BORDER_COLOR_DARK ? DEFAULT_CARD_BORDER_COLOR_LIGHT : prev);
            setCardTextColorHexInput(prev => prev === DEFAULT_CARD_TEXT_COLOR_DARK ? DEFAULT_CARD_TEXT_COLOR_LIGHT : prev);

        } else {
            setToolBackgroundColor(prev => prev === DEFAULT_TOOL_BG_COLOR_LIGHT ? DEFAULT_TOOL_BG_COLOR_DARK : prev);
            setToolTextColor(prev => prev === DEFAULT_TOOL_TEXT_COLOR_LIGHT ? DEFAULT_TOOL_TEXT_COLOR_DARK : prev);
            setCardBackgroundColor(prev => prev === DEFAULT_CARD_BG_COLOR_LIGHT ? DEFAULT_CARD_BG_COLOR_DARK : prev);
            setCardBorderColor(prev => prev === DEFAULT_CARD_BORDER_COLOR_LIGHT ? DEFAULT_CARD_BORDER_COLOR_DARK : prev);
            setCardTextColor(prev => prev === DEFAULT_CARD_TEXT_COLOR_LIGHT ? DEFAULT_CARD_TEXT_COLOR_DARK : prev);
            // Inputs follow suit
            setToolBackgroundColorHexInput(prev => prev === DEFAULT_TOOL_BG_COLOR_LIGHT ? DEFAULT_TOOL_BG_COLOR_DARK : prev);
            setToolTextColorHexInput(prev => prev === DEFAULT_TOOL_TEXT_COLOR_LIGHT ? DEFAULT_TOOL_TEXT_COLOR_DARK : prev);
            setCardBackgroundColorHexInput(prev => prev === DEFAULT_CARD_BG_COLOR_LIGHT ? DEFAULT_CARD_BG_COLOR_DARK : prev);
            setCardBorderColorHexInput(prev => prev === DEFAULT_CARD_BORDER_COLOR_LIGHT ? DEFAULT_CARD_BORDER_COLOR_DARK : prev);
            setCardTextColorHexInput(prev => prev === DEFAULT_CARD_TEXT_COLOR_LIGHT ? DEFAULT_CARD_TEXT_COLOR_DARK : prev);
        }
    }, [theme]);


    useEffect(() => {
        try {
            const storedLog = localStorage.getItem(LOCAL_STORAGE_PICKED_SONGS_LOG_KEY);
            if (storedLog) setLoggedCards(JSON.parse(storedLog));
            const storedThemes = localStorage.getItem(LOCAL_STORAGE_SAVED_THEMES_KEY);
            if (storedThemes) setSavedDeckThemes(JSON.parse(storedThemes));
            const storedSongCache = localStorage.getItem(LOCAL_STORAGE_SONG_INFO_CACHE_KEY);
            if (storedSongCache) setSongInfoCache(new Map(JSON.parse(storedSongCache)));
        } catch (e) { console.error("Error loading data from localStorage:", e); }
        return () => {
            if (clearSongInfoCacheTimeoutRef.current) clearTimeout(clearSongInfoCacheTimeoutRef.current);
            if (clearLoggedSongsTimeoutRef.current) clearTimeout(clearLoggedSongsTimeoutRef.current);
            if (groupRemoveConfirmTimeoutRef.current) clearTimeout(groupRemoveConfirmTimeoutRef.current);
        };
    }, []);

    useEffect(() => { localStorage.setItem(LOCAL_STORAGE_PICKED_SONGS_LOG_KEY, JSON.stringify(loggedCards)); }, [loggedCards]);
    useEffect(() => { localStorage.setItem(LOCAL_STORAGE_SAVED_THEMES_KEY, JSON.stringify(savedDeckThemes)); }, [savedDeckThemes]);
    useEffect(() => { try { localStorage.setItem(LOCAL_STORAGE_SONG_INFO_CACHE_KEY, JSON.stringify(Array.from(songInfoCache.entries()))); } catch (e) { console.error("Error saving song info cache to localStorage", e); } }, [songInfoCache]);


    const unloggedDeckForDisplay = useMemo(() => {
        return shuffleArray(
            fullDeck.filter(card =>
                !loggedCards.some(log =>
                    log.title === card.title &&
                    log.artistName === card.artistName &&
                    (log.comment || '') === (card.comment || '') &&
                    log.source === card.originalInputLine
                ) &&
                !songGroups.some(group => group.songs.some(groupSong =>
                    groupSong.title === card.title &&
                    groupSong.artistName === card.artistName &&
                    (groupSong.comment || '') === (card.comment || '') &&
                    groupSong.source === card.originalInputLine
                ))
            )
        );
    }, [fullDeck, loggedCards, songGroups]);

    const buildDeckInternal = useCallback(async (currentRawSongInput: string, currentAppliedBonuses: string[]) => {
        setIsLoading(true); setError(null); setStatusMessage('Processing entries and building deck...');
        setFetchProgressMessage('');

        setSelectedCardForLogging(null);
        setDrawnCardsForSelection(null);
        setAnimatedSelectionStage('idle');
        setFinallyChosenCardFromAnimation(null);
        setArrowPositionIndex(null);
        if (animationAbortControllerRef.current) { animationAbortControllerRef.current.abort(); }
        setIsPickingRandomCard(false);
        setCurrentRevealPool([]); setRevealedInPoolCount(0); setIsRevealRoundActive(false);
        setRevealedRankingCard(null);

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
            // Assign ranks based on the input order. The first song in the input list is rank 1, etc.
            const rankedDeck = newDeckBaseAccumulator.map((card, index) => ({
                ...card,
                rank: index + 1,
                isRevealed: false,
            }));

            // Do NOT shuffle. Display in ranked order.
            finalDeck = rankedDeck;
            setFullDeck(finalDeck);
            // Start revealing from the bottom rank (highest number).
            setNextRankToReveal(finalDeck.length);
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
            setNextRankToReveal(null);
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

    const buildDeck = () => { buildDeckInternal(rawSongInput, appliedBonuses); };

    const startMultiCardSelectionAnimation = useCallback(async (numCardsToDisplayActual: number) => {
        if (animationAbortControllerRef.current) {
            animationAbortControllerRef.current.abort();
        }
        animationAbortControllerRef.current = new AbortController();
        const { signal } = animationAbortControllerRef.current;

        setIsPickingRandomCard(true);
        setAnimatedSelectionStage('drawing');
        setStatusMessage('Drawing cards...');

        const shuffledUnlogged = shuffleArray(unloggedDeckForDisplay);
        const drawnCards = shuffledUnlogged.slice(0, numCardsToDisplayActual);

        if (drawnCards.length < numCardsToDisplayActual || drawnCards.length < 2) {
            setStatusMessage('Not enough cards for selection. Performing single pick if possible.');
            setAnimatedSelectionStage('idle');
            setIsPickingRandomCard(false);
            return;
        }
        setDrawnCardsForSelection(drawnCards);

        let caughtErrorDuringAnimation: unknown = null;
        try {
            await new Promise(resolve => setTimeout(resolve, 200));
            if (signal.aborted) throw new Error("Animation aborted");

            setAnimatedSelectionStage('animatingArrow');
            setStatusMessage('Choosing a card...');
            setArrowPositionIndex(0);

            const animationSteps = 10 + Math.floor(Math.random() * (drawnCards.length + 1));
            const animationInterval = 360;

            for (let i = 0; i < animationSteps; i++) {
                await new Promise(resolve => setTimeout(resolve, animationInterval));
                if (signal.aborted) throw new Error("Animation aborted");
                setArrowPositionIndex(prevIndex => (prevIndex !== null ? prevIndex + 1 : 0) % drawnCards.length);
            }

            const finalRandomIndex = Math.floor(Math.random() * drawnCards.length);
            setArrowPositionIndex(finalRandomIndex);
            const chosenCard = drawnCards[finalRandomIndex];
            setFinallyChosenCardFromAnimation(chosenCard);
            setAnimatedSelectionStage('arrowLanded');
            setStatusMessage(`Arrow landed on: ${chosenCard.title}!`);

            await new Promise(resolve => setTimeout(resolve, 1200));
            if (signal.aborted) throw new Error("Animation aborted");

            if (animatedSelectionStageRef.current !== 'arrowLanded') {
                throw new Error("Animation stage changed before focusing card.");
            }

            setSelectedCardForLogging(chosenCard);
            setCardAnimationKey(prev => prev + 1);
            setShowConfetti(true);
            setTimeout(() => { if (!signal.aborted) setShowConfetti(false); }, 3000);
            setStatusMessage(`Selected: ${chosenCard.title} by ${chosenCard.artistName}`);
            trackLocalEvent(TOOL_CATEGORY, 'cardPickedRandomly', chosenCard.title);

            setAnimatedSelectionStage('cardFocused');
            setArrowPositionIndex(null);

        } catch (error: unknown) {
            caughtErrorDuringAnimation = error;
            if (error instanceof Error && error.message === "Animation aborted") {
                console.log("[SongDeckPickerLogic] Multi-card selection animation explicitly aborted.");
            } else {
                console.error("[SongDeckPickerLogic] Error during multi-card selection:", error);
                setStatusMessage("An error occurred during selection.");
            }
            if (!signal.aborted) {
                setArrowPositionIndex(null);
                if (animatedSelectionStageRef.current !== 'cardFocused') {
                    setAnimatedSelectionStage('idle');
                }
            }
        } finally {
            const wasSpecificAbortError = caughtErrorDuringAnimation instanceof Error && caughtErrorDuringAnimation.message === "Animation aborted";
            if (!signal.aborted && !wasSpecificAbortError) {
                setIsPickingRandomCard(false);
            }
        }
    }, [unloggedDeckForDisplay, trackLocalEvent]);


    const pickRandomCard = useCallback(async () => {
        if (isPickingRandomCard && animatedSelectionStageRef.current !== 'idle') {
            setStatusMessage("Picking in progress...");
            return;
        }
        if (unloggedDeckForDisplay.length === 0) {
            setStatusMessage("No cards left to pick!");
            setSelectedCardForLogging(null);
            setDrawnCardsForSelection(null);
            setFinallyChosenCardFromAnimation(null);
            setArrowPositionIndex(null);
            setAnimatedSelectionStage('idle');
            return;
        }

        if (animationAbortControllerRef.current) {
            animationAbortControllerRef.current.abort();
        }
        setDrawnCardsForSelection(null);
        setFinallyChosenCardFromAnimation(null);
        setArrowPositionIndex(null);
        setAnimatedSelectionStage('idle');
        setSelectedCardForLogging(null);
        setIsPickingRandomCard(true);

        const availableCardsForPick = unloggedDeckForDisplay;

        if (availableCardsForPick.length >= 2) {
            const numToDisplayForAnimation = Math.max(2, Math.min(availableCardsForPick.length, numberOfCardsToDraw));
            await startMultiCardSelectionAnimation(numToDisplayForAnimation);
        } else if (availableCardsForPick.length === 1) {
            setStatusMessage('Picking the last card...');
            const randomCard = availableCardsForPick[0];
            setSelectedCardForLogging(randomCard);
            setCardAnimationKey(prev => prev + 1);
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 3000);
            setStatusMessage(`Selected: ${randomCard.title} by ${randomCard.artistName}`);
            trackLocalEvent(TOOL_CATEGORY, 'cardPickedRandomly', randomCard.title);
            setAnimatedSelectionStage('cardFocused');
            setIsPickingRandomCard(false);
        } else {
            setStatusMessage('No cards left to pick!');
            setAnimatedSelectionStage('idle');
            setIsPickingRandomCard(false);
        }
    }, [unloggedDeckForDisplay, trackLocalEvent, isPickingRandomCard, numberOfCardsToDraw, startMultiCardSelectionAnimation]);

    const handleToolBgColorHexChange = (val: string) => { setToolBackgroundColorHexInput(val); if (normalizeHexColor(val)) setToolBackgroundColor(normalizeHexColor(val)); };
    const handleToolAccentColorHexChange = (val: string) => { setToolAccentColorHexInput(val); if (normalizeHexColor(val)) setToolAccentColor(normalizeHexColor(val)); };
    const handleCardBgColorHexChange = (val: string) => { setCardBackgroundColorHexInput(val); if (normalizeHexColor(val)) setCardBackgroundColor(normalizeHexColor(val)); };
    const handleCardBorderColorHexChange = (val: string) => { setCardBorderColorHexInput(val); if (normalizeHexColor(val)) setCardBorderColor(normalizeHexColor(val)); };
    const handleCardTextColorHexChange = (val: string) => { setCardTextColorHexInput(val); if (normalizeHexColor(val)) setCardTextColor(normalizeHexColor(val)); };
    const handleToolTextColorHexChange = (val: string) => { setToolTextColorHexInput(val); if (normalizeHexColor(val)) setToolTextColor(normalizeHexColor(val)); };

    const handleManualPick = useCallback((card: SongCardInterface) => {
        if (isPickingRandomCard || isRevealRoundActive) return;
        if (animationAbortControllerRef.current) { animationAbortControllerRef.current.abort(); }
        setDrawnCardsForSelection(null);
        setFinallyChosenCardFromAnimation(null);
        setArrowPositionIndex(null);
        setAnimatedSelectionStage('cardFocused');
        setIsPickingRandomCard(false);

        setSelectedCardForLogging(card);
        setCardAnimationKey(prev => prev + 1);
        setShowConfetti(true); setTimeout(() => setShowConfetti(false), 3000);
        setStatusMessage(`Manually selected: ${card.title} by ${card.artistName}`);
        trackLocalEvent(TOOL_CATEGORY, 'cardPickedManually', card.title);
    }, [trackLocalEvent, isPickingRandomCard, isRevealRoundActive]);

    const logSelectedCard = useCallback(() => {
        if (selectedCardForLogging) {
            if (loggedCards.length >= maxLoggedSongsN) {
                setStatusMessage(`Max logged songs (${maxLoggedSongsN}) reached. Cannot log more.`);
                setTimeout(() => setStatusMessage(''), 3000);
                return;
            }
            const newLogEntry: PickedSongLogEntry = {
                timestamp: new Date().toISOString(),
                artistName: selectedCardForLogging.artistName,
                title: selectedCardForLogging.title,
                imageUrl: selectedCardForLogging.imageUrl,
                webLink: selectedCardForLogging.webLink,
                color: selectedCardForLogging.color,
                comment: selectedCardForLogging.comment,
                source: selectedCardForLogging.originalInputLine,
            };
            setLoggedCards(prev => [newLogEntry, ...prev]);
            // Remove the *specific instance* of the logged card from fullDeck
            setFullDeck(prevDeck => prevDeck.filter(card => card.id !== selectedCardForLogging.id));

            setStatusMessage(`Logged: ${selectedCardForLogging.title}`);
            setSelectedCardForLogging(null);
            setAnimatedSelectionStage('idle');
            setDrawnCardsForSelection(null);
            setFinallyChosenCardFromAnimation(null);
            setArrowPositionIndex(null);
            trackLocalEvent(TOOL_CATEGORY, 'cardConfirmedAndLogged', selectedCardForLogging.title);
        }
    }, [selectedCardForLogging, loggedCards.length, maxLoggedSongsN, trackLocalEvent]);

    const handleClearLog = () => { setLoggedCards([]); setStatusMessage('Log cleared.'); trackLocalEvent(TOOL_CATEGORY, 'logCleared'); };
    const handleClearDeck = () => {
        if (animationAbortControllerRef.current) { animationAbortControllerRef.current.abort(); }
        setFullDeck([]); setSelectedCardForLogging(null); setDrawnCardsForSelection(null);
        setAnimatedSelectionStage('idle'); setIsPickingRandomCard(false);
        setFinallyChosenCardFromAnimation(null); setArrowPositionIndex(null);
        setCurrentRevealPool([]); setRevealedInPoolCount(0); setIsRevealRoundActive(false);
        setNextRankToReveal(null);
        setRevealedRankingCard(null);
        setStatusMessage('Current deck cleared.'); trackLocalEvent(TOOL_CATEGORY, 'deckCleared');
    };
    const handleClearAllInputs = () => {
        if (animationAbortControllerRef.current) { animationAbortControllerRef.current.abort(); }
        setRawSongInput(''); setRawBonusArtistsInput(''); setAppliedBonuses([]);
        setFullDeck([]); setSelectedCardForLogging(null); setDrawnCardsForSelection(null);
        setAnimatedSelectionStage('idle'); setIsPickingRandomCard(false);
        setFinallyChosenCardFromAnimation(null); setArrowPositionIndex(null);
        setCurrentRevealPool([]); setRevealedInPoolCount(0); setIsRevealRoundActive(false);
        setNextRankToReveal(null);
        setRevealedRankingCard(null);
        setStatusMessage('Inputs and deck cleared.'); trackLocalEvent(TOOL_CATEGORY, 'inputsCleared');
    };

    const handleApplyBonuses = () => {
        const bonusArtists = rawBonusArtistsInput.split('\n').map(a => a.trim().toLowerCase()).filter(a => a);
        setAppliedBonuses(bonusArtists);
        buildDeckInternal(rawSongInput, bonusArtists);
        setStatusMessage(`Bonuses applied. Rebuilt deck.`);
        trackLocalEvent(TOOL_CATEGORY, 'bonusesApplied', bonusArtists.join(','));
    };

    const exportDeck = useCallback((deckType: 'unlogged' | 'logged') => {
        let contentToExport: string;
        let filename: string;
        const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');

        if (deckType === 'unlogged') {
            contentToExport = unloggedDeckForDisplay.map(convertCardToOutputFormat).join('\n');
            filename = `unlogged_deck_${dateStr}.txt`;
        } else {
            contentToExport = loggedCards.map(log => {
                const cardRepresentation: SongCardInterface = {
                    id: `logged-${log.timestamp}`,
                    artistName: log.artistName,
                    title: log.title,
                    imageUrl: log.imageUrl,
                    webLink: log.webLink,
                    color: log.color,
                    comment: log.comment,
                    originalInputLine: log.source,
                    sourceType: 'custom_format',
                };
                return convertCardToOutputFormat(cardRepresentation);
            }).join('\n');
            filename = `logged_songs_${dateStr}.csv`;
        }

        if (!contentToExport.trim()) {
            setDownloadStatus('Nothing to export.');
            setTimeout(() => setDownloadStatus(''), 2000);
            return;
        }
        downloadTextFile(contentToExport, filename);
        setDownloadStatus(`${deckType === 'unlogged' ? 'Unlogged deck' : 'Logged songs'} exported!`);
        trackLocalEvent(TOOL_CATEGORY, deckType === 'unlogged' ? 'unloggedDeckExportedToTxt' : 'loggedSongsExportedToCsv');
        setTimeout(() => setDownloadStatus(''), 3000);
    }, [unloggedDeckForDisplay, loggedCards, trackLocalEvent]);

    const copyDeckToClipboard = useCallback((deckType: 'unlogged' | 'logged') => {
        let contentToCopy: string;
        if (deckType === 'unlogged') {
            contentToCopy = unloggedDeckForDisplay.map(convertCardToOutputFormat).join('\n');
        } else {
            contentToCopy = loggedCards.map(log => {
                const cardRepresentation: SongCardInterface = {
                    id: `logged-${log.timestamp}`, artistName: log.artistName, title: log.title,
                    imageUrl: log.imageUrl, webLink: log.webLink, color: log.color, comment: log.comment,
                    originalInputLine: log.source, sourceType: 'custom_format',
                };
                return convertCardToOutputFormat(cardRepresentation);
            }).join('\n');
        }
        if (!contentToCopy.trim()) {
            setClipboardStatus('Nothing to copy.');
            setTimeout(() => setClipboardStatus(''), 2000);
            return;
        }
        navigator.clipboard.writeText(contentToCopy).then(() => {
            setClipboardStatus(`${deckType === 'unlogged' ? 'Unlogged deck' : 'Logged songs'} copied!`);
            trackLocalEvent(TOOL_CATEGORY, deckType === 'unlogged' ? 'unloggedDeckCopied' : 'loggedSongsCopied');
        }).catch((err) => {
            console.error("Failed to copy to clipboard:", err);
            setClipboardStatus('Failed to copy.');
        }).finally(() => {
            setTimeout(() => setClipboardStatus(''), 2000);
        });
    }, [unloggedDeckForDisplay, loggedCards, trackLocalEvent]);

    const handleSaveTheme = useCallback(() => {
        setErrorSaveTheme(null);
        if (!newThemeName.trim()) { setErrorSaveTheme("Theme name cannot be empty."); return; }
        if (savedDeckThemes.some(t => t.name.toLowerCase() === newThemeName.trim().toLowerCase())) {
            setErrorSaveTheme("A theme with this name already exists."); return;
        }
        const currentSettings: DeckThemeSettings = {
            customTitle, customLogo, selectedLogoSize, toolBackgroundColor, toolAccentColor,
            toolTextColor, cardTextFont, cardBackgroundColor, cardBorderColor, cardTextColor,
            numberOfCardsToDraw,
            pickerMode, revealPoolSizeX, maxLoggedSongsN, customCardBackBase64, maxSongsPerGroup,
            rankingRevealTopX, rankingRevealSnippetDuration,
        };
        const newTheme: DeckTheme = { id: Date.now().toString(), name: newThemeName.trim(), settings: currentSettings, createdAt: new Date().toISOString() };
        setSavedDeckThemes(prev => [newTheme, ...prev]);
        setStatusMessage(`Theme "${newTheme.name}" saved!`); setTimeout(() => setStatusMessage(''), 3000);
        setShowSaveThemeModal(false); setNewThemeName('');
        trackLocalEvent(TOOL_CATEGORY, 'deckThemeSaved', newTheme.name);
    }, [newThemeName, savedDeckThemes, customTitle, customLogo, selectedLogoSize, toolBackgroundColor, toolAccentColor, toolTextColor, cardTextFont, cardBackgroundColor, cardBorderColor, cardTextColor, numberOfCardsToDraw, pickerMode, revealPoolSizeX, maxLoggedSongsN, customCardBackBase64, maxSongsPerGroup, rankingRevealTopX, rankingRevealSnippetDuration, trackLocalEvent]);

    const handleLoadTheme = useCallback((themeId: string) => {
        const themeToLoad = savedDeckThemes.find(t => t.id === themeId);
        if (themeToLoad) {
            const { settings } = themeToLoad;
            setCustomTitle(settings.customTitle || DEFAULT_CUSTOM_TITLE);
            setCustomLogo(settings.customLogo || null);
            setSelectedLogoSize(settings.selectedLogoSize || DEFAULT_SELECTED_LOGO_SIZE);
            setToolBackgroundColor(settings.toolBackgroundColor || DEFAULT_TOOL_BG_COLOR_DARK);
            setToolAccentColor(settings.toolAccentColor || DEFAULT_TOOL_ACCENT_COLOR);
            setToolTextColor(settings.toolTextColor || DEFAULT_TOOL_TEXT_COLOR_DARK);
            setCardTextFont(settings.cardTextFont || DEFAULT_CARD_TEXT_FONT);
            setCardBackgroundColor(settings.cardBackgroundColor || DEFAULT_CARD_BG_COLOR_DARK);
            setCardBorderColor(settings.cardBorderColor || DEFAULT_CARD_BORDER_COLOR_DARK);
            setCardTextColor(settings.cardTextColor || DEFAULT_CARD_TEXT_COLOR_DARK);
            setNumberOfCardsToDraw(settings.numberOfCardsToDraw || DEFAULT_NUMBER_OF_CARDS_TO_DRAW);

            setPickerMode(settings.pickerMode || DEFAULT_PICKER_MODE);
            setRevealPoolSizeX(settings.revealPoolSizeX || DEFAULT_REVEAL_POOL_SIZE_X);
            setMaxLoggedSongsN(settings.maxLoggedSongsN || DEFAULT_MAX_LOGGED_SONGS_N);
            setCustomCardBackBase64(settings.customCardBackBase64 || DEFAULT_CUSTOM_CARD_BACK_BASE64);
            setMaxSongsPerGroup(settings.maxSongsPerGroup || DEFAULT_MAX_SONGS_PER_GROUP);
            setRankingRevealTopX(settings.rankingRevealTopX || DEFAULT_RANKING_REVEAL_TOP_X);
            setRankingRevealSnippetDuration(settings.rankingRevealSnippetDuration || DEFAULT_RANKING_REVEAL_SNIPPET_DURATION);

            setStatusMessage(`Theme "${themeToLoad.name}" loaded!`);
            setTimeout(() => setStatusMessage(''), 3000);
            setShowLoadThemeModal(false);
            trackLocalEvent(TOOL_CATEGORY, 'deckThemeLoaded', themeToLoad.name);
        }
    }, [savedDeckThemes, trackLocalEvent]);

    const handleDeleteTheme = useCallback((themeId: string) => {
        if (window.confirm("Are you sure you want to delete this theme? This cannot be undone.")) {
            setSavedDeckThemes(prev => prev.filter(t => t.id !== themeId));
            setStatusMessage("Theme deleted.");
            setTimeout(() => setStatusMessage(''), 3000);
            trackLocalEvent(TOOL_CATEGORY, 'deckThemeDeleted');
        }
    }, [trackLocalEvent]);

    const handleExportConfig = useCallback(() => {
        const currentSettings: DeckThemeSettings = {
            customTitle, customLogo, selectedLogoSize, toolBackgroundColor, toolAccentColor,
            toolTextColor, cardTextFont, cardBackgroundColor, cardBorderColor, cardTextColor,
            numberOfCardsToDraw,
            pickerMode, revealPoolSizeX, maxLoggedSongsN, customCardBackBase64, maxSongsPerGroup,
            rankingRevealTopX, rankingRevealSnippetDuration
        };
        const configToExport = {
            rawSongInput,
            rawBonusArtistsInput,
            settings: currentSettings,
        };
        setConfigToExportJson(JSON.stringify(configToExport, null, 2));
        setShowExportConfigModal(true);
        trackLocalEvent(TOOL_CATEGORY, 'configExportOpened');
    }, [
        rawSongInput, rawBonusArtistsInput, customTitle, customLogo, selectedLogoSize,
        toolBackgroundColor, toolAccentColor, toolTextColor, cardTextFont, cardBackgroundColor,
        cardBorderColor, cardTextColor, numberOfCardsToDraw,
        pickerMode, revealPoolSizeX, maxLoggedSongsN, customCardBackBase64, maxSongsPerGroup, rankingRevealTopX, rankingRevealSnippetDuration, trackLocalEvent
    ]);

    const handleDownloadConfigJson = useCallback(() => {
        const blob = new Blob([configToExportJson], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'song_deck_picker_config.json';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        trackLocalEvent(TOOL_CATEGORY, 'configDownloaded');
    }, [configToExportJson, trackLocalEvent]);

    const handleImportFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const text = e.target?.result as string;
                    setConfigToImportJson(text);
                    setImportConfigError('');
                } catch (err) {
                    setImportConfigError('Failed to read file.');
                    console.error(err);
                }
            };
            reader.readAsText(file);
        }
    };

    const handleImportConfigJson = useCallback(() => {
        if (!configToImportJson.trim()) {
            setImportConfigError('No configuration data to import.');
            return;
        }
        try {
            const importedConfig = JSON.parse(configToImportJson);
            if (typeof importedConfig.rawSongInput === 'string') {
                setRawSongInput(importedConfig.rawSongInput);
            }
            if (typeof importedConfig.rawBonusArtistsInput === 'string') {
                setRawBonusArtistsInput(importedConfig.rawBonusArtistsInput);
            }
            if (importedConfig.settings && typeof importedConfig.settings === 'object') {
                const { settings } = importedConfig;
                setCustomTitle(settings.customTitle || DEFAULT_CUSTOM_TITLE);
                setCustomLogo(settings.customLogo || null);
                setSelectedLogoSize(settings.selectedLogoSize || DEFAULT_SELECTED_LOGO_SIZE);
                setToolBackgroundColor(settings.toolBackgroundColor || DEFAULT_TOOL_BG_COLOR_DARK);
                setToolAccentColor(settings.toolAccentColor || DEFAULT_TOOL_ACCENT_COLOR);
                setToolTextColor(settings.toolTextColor || DEFAULT_TOOL_TEXT_COLOR_DARK);
                setCardTextFont(settings.cardTextFont || DEFAULT_CARD_TEXT_FONT);
                setCardBackgroundColor(settings.cardBackgroundColor || DEFAULT_CARD_BG_COLOR_DARK);
                setCardBorderColor(settings.cardBorderColor || DEFAULT_CARD_BORDER_COLOR_DARK);
                setCardTextColor(settings.cardTextColor || DEFAULT_CARD_TEXT_COLOR_DARK);
                setNumberOfCardsToDraw(settings.numberOfCardsToDraw || DEFAULT_NUMBER_OF_CARDS_TO_DRAW);

                setPickerMode(settings.pickerMode || DEFAULT_PICKER_MODE);
                setRevealPoolSizeX(settings.revealPoolSizeX || DEFAULT_REVEAL_POOL_SIZE_X);
                setMaxLoggedSongsN(settings.maxLoggedSongsN || DEFAULT_MAX_LOGGED_SONGS_N);
                setCustomCardBackBase64(settings.customCardBackBase64 || DEFAULT_CUSTOM_CARD_BACK_BASE64);
                setMaxSongsPerGroup(settings.maxSongsPerGroup || DEFAULT_MAX_SONGS_PER_GROUP);
                setRankingRevealTopX(settings.rankingRevealTopX || DEFAULT_RANKING_REVEAL_TOP_X);
                setRankingRevealSnippetDuration(settings.rankingRevealSnippetDuration || DEFAULT_RANKING_REVEAL_SNIPPET_DURATION);
            }
            setShowImportConfigModal(false);
            setConfigToImportJson('');
            setImportConfigError('');
            setStatusMessage('Configuration imported! Click "Build/Rebuild Deck" to apply changes.');
            trackLocalEvent(TOOL_CATEGORY, 'configImported');
        } catch (err) {
            setImportConfigError(err instanceof Error ? err.message : 'Invalid JSON format or structure.');
            console.error(err);
        }
    }, [configToImportJson, trackLocalEvent]);

    const handlePrepareRevealRound = useCallback(() => {
        if (unloggedDeckForDisplay.length === 0) {
            setStatusMessage('No cards in the deck to reveal.');
            return;
        }
        const cardsForRound = shuffleArray(unloggedDeckForDisplay).slice(0, revealPoolSizeX);
        setCurrentRevealPool(cardsForRound.map(card => ({ ...card, isRevealed: false })));
        setRevealedInPoolCount(0);
        setIsRevealRoundActive(true);
        setStatusMessage(`Reveal round ready! ${cardsForRound.length} cards in the pool.`);
        trackLocalEvent(TOOL_CATEGORY, 'revealRoundPrepared', undefined, cardsForRound.length);
    }, [unloggedDeckForDisplay, revealPoolSizeX, trackLocalEvent]);

    const handleRevealNextCard = useCallback(() => {
        if (revealedInPoolCount >= currentRevealPool.length) return;
        const indexToReveal = revealedInPoolCount;
        setCurrentRevealPool(prevPool => {
            const newPool = [...prevPool];
            if (newPool[indexToReveal]) {
                newPool[indexToReveal].isRevealed = true;
            }
            return newPool;
        });
        setRevealedInPoolCount(prev => prev + 1);
        trackLocalEvent(TOOL_CATEGORY, 'cardRevealed');
    }, [revealedInPoolCount, currentRevealPool, trackLocalEvent]);

    const handleLogRevealedCards = useCallback(() => {
        if (loggedCards.length + currentRevealPool.length > maxLoggedSongsN) {
            setStatusMessage(`Cannot log cards. Would exceed max limit of ${maxLoggedSongsN}.`);
            setTimeout(() => setStatusMessage(''), 3000);
            return;
        }
        const newLogEntries: PickedSongLogEntry[] = currentRevealPool.map(card => ({
            timestamp: new Date().toISOString(),
            artistName: card.artistName,
            title: card.title,
            imageUrl: card.imageUrl,
            webLink: card.webLink,
            color: card.color,
            comment: card.comment,
            source: card.originalInputLine,
        }));
        setLoggedCards(prev => [...newLogEntries, ...prev]);

        const loggedCardIds = new Set(currentRevealPool.map(c => c.id));
        setFullDeck(prevDeck => prevDeck.filter(card => !loggedCardIds.has(card.id)));

        setStatusMessage(`Logged ${currentRevealPool.length} revealed cards.`);
        setIsRevealRoundActive(false);
        setCurrentRevealPool([]);
        setRevealedInPoolCount(0);
        trackLocalEvent(TOOL_CATEGORY, 'revealedCardsLogged', undefined, currentRevealPool.length);
    }, [currentRevealPool, loggedCards, maxLoggedSongsN, trackLocalEvent]);

    const handleClearSongInfoCache = useCallback(() => {
        if (clearSongInfoCacheTimeoutRef.current) clearTimeout(clearSongInfoCacheTimeoutRef.current);
        const newClickCount = clearSongInfoCacheClickCount + 1;
        setClearSongInfoCacheClickCount(newClickCount);
        if (newClickCount >= SONG_INFO_CACHE_CLEAR_CLICKS_NEEDED) {
            setSongInfoCache(new Map());
            setClearSongInfoCacheStatus('Song info cache cleared!');
            setClearSongInfoCacheClickCount(0);
            clearSongInfoCacheTimeoutRef.current = null;
            trackLocalEvent(TOOL_CATEGORY, 'songInfoCacheCleared');
        } else {
            setClearSongInfoCacheStatus(`Click ${SONG_INFO_CACHE_CLEAR_CLICKS_NEEDED - newClickCount} more times to clear.`);
            clearSongInfoCacheTimeoutRef.current = window.setTimeout(() => {
                setClearSongInfoCacheClickCount(0);
                setClearSongInfoCacheStatus('');
            }, SONG_INFO_CACHE_CLEAR_TIMEOUT_MS);
        }
    }, [clearSongInfoCacheClickCount, trackLocalEvent]);

    const handleMoveLoggedToGroup = useCallback(() => {
        if (loggedCards.length === 0) {
            setStatusMessage('No logged songs to move.');
            setTimeout(() => setStatusMessage(''), 3000);
            return;
        }
        const newGroup: SongGroup = {
            id: `group-${Date.now()}`,
            name: currentGroupNameInput.trim() || `Group ${songGroups.length + 1}`,
            songs: [...loggedCards]
        };
        setSongGroups(prev => [newGroup, ...prev]);
        setLoggedCards([]);
        setCurrentGroupNameInput('');
        setStatusMessage(`Created group "${newGroup.name}" with ${newGroup.songs.length} songs.`);
        trackLocalEvent(TOOL_CATEGORY, 'groupCreated', newGroup.name, newGroup.songs.length);
    }, [loggedCards, currentGroupNameInput, songGroups, trackLocalEvent]);

    const handleClearAndReturnLoggedSongs = useCallback(() => {
        if (clearLoggedSongsTimeoutRef.current) clearTimeout(clearLoggedSongsTimeoutRef.current);
        const newClickCount = clearLoggedSongsClickCount + 1;
        setClearLoggedSongsClickCount(newClickCount);

        if (newClickCount >= LOGGED_SONGS_CLEAR_RETURN_CLICKS_NEEDED) {
            // Reconstruct cards from log entries
            const cardsToReturn: SongCardInterface[] = loggedCards.map((logEntry): SongCardInterface => ({
                id: `returned-${logEntry.timestamp}-${Math.random().toString(36).substring(2, 9)}`,
                artistName: logEntry.artistName,
                title: logEntry.title,
                imageUrl: logEntry.imageUrl,
                webLink: logEntry.webLink,
                color: logEntry.color || generateRandomColor(),
                comment: logEntry.comment,
                originalInputLine: logEntry.source,
                isBonusApplied: false, // Treat as a fresh card
                sourceType: inferSourceTypeFromInput(logEntry.source),
                isRevealed: false,
            }));

            // Add the returned cards back to the full deck
            setFullDeck(prevDeck => [...prevDeck, ...cardsToReturn]);

            // Clear the logged songs list
            setLoggedCards([]);

            setStatusMessage(`${cardsToReturn.length} logged song(s) cleared and returned to the deck.`);
            trackLocalEvent(TOOL_CATEGORY, 'loggedSongsClearedAndReturned', undefined, cardsToReturn.length);

            setClearLoggedSongsClickCount(0);
            if (clearLoggedSongsTimeoutRef.current) clearTimeout(clearLoggedSongsTimeoutRef.current);
            clearLoggedSongsTimeoutRef.current = null;
        } else {
            clearLoggedSongsTimeoutRef.current = window.setTimeout(() => {
                setClearLoggedSongsClickCount(0);
            }, CONFIRM_TIMEOUT_MS);
        }
    }, [clearLoggedSongsClickCount, loggedCards, trackLocalEvent]);

    const handleRemoveGroupAndReturnSongs = useCallback((groupId: string) => {
        if (groupToRemoveConfirm.groupId !== groupId) {
            setGroupToRemoveConfirm({ groupId, count: 1 });
            if (groupRemoveConfirmTimeoutRef.current) clearTimeout(groupRemoveConfirmTimeoutRef.current);
            groupRemoveConfirmTimeoutRef.current = window.setTimeout(() => {
                setGroupToRemoveConfirm({ groupId: null, count: 0 });
            }, CONFIRM_TIMEOUT_MS);
            return;
        }

        const newClickCount = groupToRemoveConfirm.count + 1;
        setGroupToRemoveConfirm({ groupId, count: newClickCount });

        if (newClickCount >= GROUP_REMOVE_CLICKS_NEEDED) {
            const groupToRemove = songGroups.find(g => g.id === groupId);
            if (groupToRemove) {
                // Add songs from the removed group back to the loggedCards state
                setLoggedCards(prevLogged => [...groupToRemove.songs, ...prevLogged]);

                // Remove the group from songGroups
                setSongGroups(prev => prev.filter(g => g.id !== groupId));

                setStatusMessage(`Group "${groupToRemove.name}" ungrouped. ${groupToRemove.songs.length} songs moved back to Logged Songs.`);
                trackLocalEvent(TOOL_CATEGORY, 'groupUngrouped', groupToRemove.name, groupToRemove.songs.length);
            }
            setGroupToRemoveConfirm({ groupId: null, count: 0 });
        } else {
            if (groupRemoveConfirmTimeoutRef.current) clearTimeout(groupRemoveConfirmTimeoutRef.current);
            groupRemoveConfirmTimeoutRef.current = window.setTimeout(() => {
                setGroupToRemoveConfirm({ groupId: null, count: 0 });
            }, CONFIRM_TIMEOUT_MS);
        }
    }, [groupToRemoveConfirm, songGroups, trackLocalEvent]);

    const getClearAndReturnLoggedSongsButtonText = () => {
        if (clearLoggedSongsClickCount > 0) {
            return `Confirm Clear & Return (${LOGGED_SONGS_CLEAR_RETURN_CLICKS_NEEDED - clearLoggedSongsClickCount} left)`;
        }
        return "Clear & Return Unlogged Songs";
    };

    const handleRankingRevealClick = useCallback((cardToReveal: SongCardInterface) => {
        if (pickerMode !== PickerMode.RankingReveal || cardToReveal.isRevealed || !nextRankToReveal || cardToReveal.rank !== nextRankToReveal) {
            if (pickerMode === PickerMode.RankingReveal && !cardToReveal.isRevealed && cardToReveal.rank && nextRankToReveal && cardToReveal.rank !== nextRankToReveal) {
                setStatusMessage(`Wrong order! Please find rank #${nextRankToReveal}.`);
                setTimeout(() => setStatusMessage(''), 2000);
            }
            return;
        }

        // Start the flip animation by setting isRevealed to true
        setFullDeck(prevDeck => prevDeck.map(card =>
            card.id === cardToReveal.id ? { ...card, isRevealed: true } : card
        ));

        // Wait for the flip animation to finish
        setTimeout(() => {
            // After flipping, decide what to do
            if ((cardToReveal.rank ?? Infinity) <= rankingRevealTopX && cardToReveal.audioUrl) {
                // It's a top X card with audio, so show the modal
                setRevealedRankingCard(cardToReveal);
            } else {
                // Not a top X card, so just update the rank and status
                const newNextRank = nextRankToReveal - 1; // Decrement for bottom-up reveal
                setNextRankToReveal(newNextRank > 0 ? newNextRank : null);
                setStatusMessage(`Revealed Rank #${cardToReveal.rank}: ${cardToReveal.title}`);
                trackLocalEvent(TOOL_CATEGORY, 'rankingCardRevealed', cardToReveal.title, cardToReveal.rank);
                if (newNextRank <= 0) { setStatusMessage('All cards have been revealed! Rank #1 is the winner!'); }
            }
        }, 600); // Corresponds to the CSS transition duration for the flip

    }, [pickerMode, nextRankToReveal, trackLocalEvent, rankingRevealTopX, setFullDeck, setRevealedRankingCard, setNextRankToReveal, setStatusMessage, fullDeck.length]);

    const handleCloseRankingRevealModal = useCallback((cardThatWasRevealed: SongCardInterface) => {
        setRevealedRankingCard(null);

        const newNextRank = (cardThatWasRevealed.rank ?? 0) - 1; // Decrement for bottom-up reveal
        setNextRankToReveal(newNextRank > 0 ? newNextRank : null);

        setStatusMessage(`Revealed Rank #${cardThatWasRevealed.rank}: ${cardThatWasRevealed.title}`);
        trackLocalEvent(TOOL_CATEGORY, 'rankingCardRevealedWithAnimation', cardThatWasRevealed.title, cardThatWasRevealed.rank);

        if (newNextRank <= 0) {
            setStatusMessage('All cards have been revealed! Rank #1 is the winner!');
        }
    }, [trackLocalEvent, fullDeck.length]);

    return {
        rawSongInput, setRawSongInput,
        rawBonusArtistsInput, setRawBonusArtistsInput,
        fullDeck,
        selectedCardForLogging,
        loggedCards,
        showConfetti,
        isLoading,
        error,
        statusMessage,
        fetchProgressMessage,
        showInputs, setShowInputs,
        clipboardStatus,
        downloadStatus, setDownloadStatus,
        cardAnimationKey,
        customTitle, setCustomTitle,
        customLogo, setCustomLogo,
        selectedLogoSize, setSelectedLogoSize,
        showCustomization, setShowCustomization,
        toolBackgroundColor, setToolBackgroundColor,
        toolBackgroundColorHexInput, handleToolBgColorHexChange,
        cardTextFont, setCardTextFont,
        toolAccentColor, setToolAccentColor,
        toolAccentColorHexInput, handleToolAccentColorHexChange,
        cardBackgroundColor, setCardBackgroundColor,
        cardBackgroundColorHexInput, handleCardBgColorHexChange,
        cardBorderColor, setCardBorderColor,
        cardBorderColorHexInput, handleCardBorderColorHexChange,
        cardTextColor, setCardTextColor,
        cardTextColorHexInput, handleCardTextColorHexChange,
        toolTextColor, setToolTextColor,
        toolTextColorHexInput, handleToolTextColorHexChange,
        numberOfCardsToDraw, setNumberOfCardsToDraw,
        savedDeckThemes,
        showSaveThemeModal, setShowSaveThemeModal,
        showLoadThemeModal, setShowLoadThemeModal,
        newThemeName, setNewThemeName,
        errorSaveTheme,
        showExportConfigModal, setShowExportConfigModal,
        showImportConfigModal, setShowImportConfigModal,
        configToExportJson,
        configToImportJson, setConfigToImportJson,
        importConfigError, setImportConfigError,
        importConfigFileRef,
        drawnCardsForSelection,
        animatedSelectionStage,
        arrowPositionIndex,
        finallyChosenCardFromAnimation,
        isPickingRandomCard,
        buildDeck,
        pickRandomCard,
        handleManualPick,
        logSelectedCard,
        handleClearLog,
        handleClearDeck,
        handleClearAllInputs,
        handleApplyBonuses,
        unloggedDeckForDisplay,
        exportDeck,
        copyDeckToClipboard,
        handleSaveTheme,
        handleLoadTheme,
        handleDeleteTheme,
        handleExportConfig,
        handleDownloadConfigJson,
        handleImportFileChange,
        handleImportConfigJson,
        pickerMode, setPickerMode,
        revealPoolSizeX, setRevealPoolSizeX,
        maxLoggedSongsN, setMaxLoggedSongsN,
        customCardBackBase64, setCustomCardBackBase64,
        currentRevealPool, revealedInPoolCount, isRevealRoundActive,
        handlePrepareRevealRound, handleRevealNextCard, handleLogRevealedCards,
        clearSongInfoCacheClickCount, clearSongInfoCacheStatus, handleClearSongInfoCache,
        songGroups, currentGroupNameInput, setCurrentGroupNameInput, handleMoveLoggedToGroup,
        maxSongsPerGroup, setMaxSongsPerGroup,
        clearLoggedSongsClickCount, handleClearAndReturnLoggedSongs,
        groupToRemoveConfirm, handleRemoveGroupAndReturnSongs,
        getClearAndReturnLoggedSongsButtonText,
        nextRankToReveal, handleRankingRevealClick,
        rankingRevealTopX, setRankingRevealTopX,
        rankingRevealSnippetDuration, setRankingRevealSnippetDuration,
        revealedRankingCard, handleCloseRankingRevealModal,
    };
};
