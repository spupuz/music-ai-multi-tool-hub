import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import type { ToolProps } from '@/Layout';
import { PickerMode, SongCardInterface, PickedSongLogEntry } from '@/types';
import { 
    TOOL_CATEGORY, DEFAULT_MAX_LOGGED_SONGS_N,
    LOGGED_SONGS_CLEAR_RETURN_CLICKS_NEEDED, GROUP_REMOVE_CLICKS_NEEDED, CONFIRM_TIMEOUT_MS,
    SONG_INFO_CACHE_CLEAR_CLICKS_NEEDED
} from '@/tools/SongDeckPicker/songDeckPicker.constants';
import { 
    shuffleArray, generateRandomColor, inferSourceTypeFromInput 
} from '@/tools/SongDeckPicker/songDeckPicker.utils';
import { useTheme } from '@/context/ThemeContext';

// Import modular hooks
import { useDeckTheme } from './SongDeckPicker/useDeckTheme';
import { useDeckData } from './SongDeckPicker/useDeckData';
import { useDeckAnimation } from './SongDeckPicker/useDeckAnimation';
import { useDeckPersistence } from './SongDeckPicker/useDeckPersistence';
import { useDeckSpecialModes } from './SongDeckPicker/useDeckSpecialModes';

export const useSongDeckPickerLogic = ({ trackLocalEvent }: ToolProps) => {
    const { theme } = useTheme();

    // 1. Core State & UI
    const [pickerMode, setPickerMode] = useState<PickerMode>(PickerMode.Standard);
    const themeState = useDeckTheme({ theme });
    const dataState = useDeckData({ trackLocalEvent, pickerMode });

    // 2. Persistence (needs dataState and themeState)
    const persistenceState = useDeckPersistence({
        trackLocalEvent,
        setStatusMessage: dataState.setStatusMessage,
        themeState: { ...themeState, pickerMode }
    });

    // 3. Selection Animation State
    const [selectedCardForLogging, setSelectedCardForLogging] = useState<SongCardInterface | null>(null);
    const [showConfetti, setShowConfetti] = useState(false);
    const [cardAnimationKey, setCardAnimationKey] = useState(0);

    // 4. Derived Deck State (for Display) - MUST be after persistence and special modes (well, special modes defined later, using lazy ref if needed or just ordering)
    // To fix order, we declare specialModes before unloggedDeckForDisplay
    
    // We need a way to pass setLoggedCards and others to specialModes
    const specialModes = useDeckSpecialModes({
        trackLocalEvent,
        setStatusMessage: dataState.setStatusMessage,
        loggedCards: persistenceState.loggedCards,
        setLoggedCards: persistenceState.setLoggedCards,
        setFullDeck: dataState.setFullDeck,
        maxLoggedSongsN: 50 
    });

    const unloggedDeckForDisplay = useMemo(() => {
        return shuffleArray(
            dataState.fullDeck.filter(card => 
                !persistenceState.loggedCards.some(log => 
                    log.title === card.title && 
                    log.artistName === card.artistName && 
                    log.source === card.originalInputLine
                ) &&
                !specialModes.songGroups.some(group => 
                    group.songs.some(groupSong => 
                        groupSong.title === card.title && 
                        groupSong.artistName === card.artistName && 
                        groupSong.source === card.originalInputLine
                    )
                )
            )
        );
    }, [dataState.fullDeck, persistenceState.loggedCards, specialModes.songGroups]);

    // Update specialModes with real unloggedDeck
    // In practice, since we pass arguments, we might need to handle this inside the hook if dependecy cycle exists.
    // However, we can just pass the derived state to the functions when called if needed.
    // Let's assume useDeckSpecialModes uses its passed unloggedDeckForDisplay internally. 
    // Wait, useDeckSpecialModes was called with []. I should pass the *real* one.
    // But unloggedDeckForDisplay depends on specialModes.songGroups. This is a cycle.
    
    // FIX CYCLE: Calculate unlogged without groups first if needed, or pass fullDeck and groups separately.
    // Actually, in the monolithic version, it was calculated like this. 
    // I'll make useDeckSpecialModes not take unloggedDeckForDisplay as a prop, but as an argument to its methods.

    const animationState = useDeckAnimation({
        unloggedDeckForDisplay,
        numberOfCardsToDraw: themeState.numberOfCardsToDraw || 1,
        trackLocalEvent,
        setSelectedCardForLogging,
        setCardAnimationKey,
        setShowConfetti,
        setStatusMessage: dataState.setStatusMessage
    });

    // --- Glue Logic & Additional Handlers ---

    const buildDeck = () => { dataState.buildDeckInternal(dataState.rawSongInput, dataState.appliedBonuses); };

    const pickRandomCard = useCallback(async () => {
        if (animationState.isPickingRandomCard && animationState.animatedSelectionStage !== 'idle') {
            dataState.setStatusMessage("Picking in progress...");
            return;
        }
        if (unloggedDeckForDisplay.length === 0) {
            dataState.setStatusMessage("No cards left to pick!");
            return;
        }

        if (animationState.animationAbortControllerRef.current) animationState.animationAbortControllerRef.current.abort();
        
        animationState.setDrawnCardsForSelection(null);
        animationState.setFinallyChosenCardFromAnimation(null);
        animationState.setArrowPositionIndex(null);
        animationState.setAnimatedSelectionStage('idle');
        setSelectedCardForLogging(null);
        
        if (unloggedDeckForDisplay.length >= 2) {
            const numToDisplay = Math.max(2, Math.min(unloggedDeckForDisplay.length, themeState.numberOfCardsToDraw || 1));
            await animationState.startMultiCardSelectionAnimation(numToDisplay);
        } else {
            const randomCard = unloggedDeckForDisplay[0];
            setSelectedCardForLogging(randomCard);
            setCardAnimationKey(prev => prev + 1);
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 3000);
            dataState.setStatusMessage(`Selected: ${randomCard.title}`);
            animationState.setAnimatedSelectionStage('cardFocused');
        }
    }, [unloggedDeckForDisplay, themeState.numberOfCardsToDraw, animationState, dataState]);

    const handleManualPick = useCallback((card: SongCardInterface) => {
        if (animationState.isPickingRandomCard || specialModes.isRevealRoundActive) return;
        if (animationState.animationAbortControllerRef.current) animationState.animationAbortControllerRef.current.abort();
        
        animationState.setDrawnCardsForSelection(null);
        animationState.setAnimatedSelectionStage('cardFocused');
        setSelectedCardForLogging(card);
        setCardAnimationKey(prev => prev + 1);
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
        dataState.setStatusMessage(`Manually selected: ${card.title}`);
    }, [animationState, specialModes.isRevealRoundActive, dataState]);

    const logSelectedCard = useCallback(() => {
        if (selectedCardForLogging) {
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
            persistenceState.setLoggedCards(prev => [newLogEntry, ...prev]);
            dataState.setFullDeck(prevDeck => prevDeck.filter(card => card.id !== selectedCardForLogging.id));
            dataState.setStatusMessage(`Logged: ${selectedCardForLogging.title}`);
            setSelectedCardForLogging(null);
            animationState.setAnimatedSelectionStage('idle');
        }
    }, [selectedCardForLogging, persistenceState, dataState, animationState]);

    // Glue for Ranking Reveal
    const handleRankingRevealClick = useCallback((card: SongCardInterface) => {
        if (card.isRevealed) return;
        dataState.setFullDeck(prev => prev.map(c => c.id === card.id ? { ...c, isRevealed: true } : c));
        specialModes.setRevealedRankingCard(card);
        trackLocalEvent(TOOL_CATEGORY, 'rankingCardRevealed', `Rank:${card.rank}`);
    }, [dataState, specialModes, trackLocalEvent]);

    const handleCloseRankingRevealModal = useCallback((card: SongCardInterface) => {
        specialModes.setRevealedRankingCard(null);
        const nextRank = (card.rank || 0) - 1;
        if (nextRank > 0) specialModes.setNextRankToReveal(nextRank);
        else specialModes.setNextRankToReveal(null);
    }, [specialModes]);

    useEffect(() => {
        if (pickerMode === PickerMode.RankingReveal && dataState.fullDeck.length > 0) {
            const unrevealed = dataState.fullDeck.filter(c => !c.isRevealed);
            if (unrevealed.length > 0) {
                const maxRank = Math.max(...unrevealed.map(c => c.rank || 0));
                specialModes.setNextRankToReveal(maxRank);
            } else {
                specialModes.setNextRankToReveal(null);
            }
        }
    }, [pickerMode, dataState.fullDeck]);

    // --- Group Removal Logic ---
    const [removeGroupClickCounts, setRemoveGroupClickCounts] = useState<Record<string, number>>({});
    const removeGroupTimeoutRefs = useRef<Record<string, number | null>>({});

    const handleRemoveGroupAndReturnSongs = useCallback((groupId: string) => {
        const currentCount = removeGroupClickCounts[groupId] || 0;
        const newCount = currentCount + 1;
        
        if (removeGroupTimeoutRefs.current[groupId]) {
            clearTimeout(removeGroupTimeoutRefs.current[groupId]!);
        }

        if (newCount >= GROUP_REMOVE_CLICKS_NEEDED) {
            const groupToRemove = specialModes.songGroups.find(g => g.id === groupId);
            if (groupToRemove) {
                const songsToReturn: SongCardInterface[] = groupToRemove.songs.map((logEntry): SongCardInterface => ({
                    id: `returned-group-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
                    artistName: logEntry.artistName,
                    title: logEntry.title,
                    imageUrl: logEntry.imageUrl,
                    webLink: logEntry.webLink,
                    color: logEntry.color || generateRandomColor(),
                    comment: logEntry.comment,
                    originalInputLine: logEntry.source,
                    isBonusApplied: false,
                    sourceType: inferSourceTypeFromInput(logEntry.source),
                    isRevealed: false,
                }));
                dataState.setFullDeck(prev => [...prev, ...songsToReturn]);
                specialModes.setSongGroups(prev => prev.filter(g => g.id !== groupId));
                dataState.setStatusMessage(`Removed group "${groupToRemove.name}" and returned ${songsToReturn.length} songs.`);
                trackLocalEvent(TOOL_CATEGORY, 'groupRemoved', groupToRemove.name);
            }
            const newCounts = { ...removeGroupClickCounts };
            delete newCounts[groupId];
            setRemoveGroupClickCounts(newCounts);
        } else {
            setRemoveGroupClickCounts(prev => ({ ...prev, [groupId]: newCount }));
            removeGroupTimeoutRefs.current[groupId] = window.setTimeout(() => {
                setRemoveGroupClickCounts(prev => {
                    const next = { ...prev };
                    delete next[groupId];
                    return next;
                });
            }, CONFIRM_TIMEOUT_MS);
        }
    }, [removeGroupClickCounts, specialModes, dataState, trackLocalEvent]);

    const getRemoveGroupButtonText = (groupId: string) => {
        const count = removeGroupClickCounts[groupId] || 0;
        if (count > 0) return `Confirm (${GROUP_REMOVE_CLICKS_NEEDED - count} left)`;
        return "Remove Group & Return Songs";
    };

    // Helpers
    const getClearSongInfoCacheButtonText = () => {
        if (dataState.clearSongInfoCacheClickCount > 0) {
            return `Confirm Clear (${SONG_INFO_CACHE_CLEAR_CLICKS_NEEDED - dataState.clearSongInfoCacheClickCount} left)`;
        }
        return "Clear Song Info Cache";
    };

    const [clearLoggedSongsClickCount, setClearLoggedSongsClickCount] = useState(0);
    const clearLoggedSongsTimeoutRef = useRef<number | null>(null);

    const handleClearAndReturnLoggedSongs = useCallback(() => {
        if (clearLoggedSongsTimeoutRef.current) clearTimeout(clearLoggedSongsTimeoutRef.current);
        const newClickCount = clearLoggedSongsClickCount + 1;
        setClearLoggedSongsClickCount(newClickCount);

        if (newClickCount >= LOGGED_SONGS_CLEAR_RETURN_CLICKS_NEEDED) {
            const cardsToReturn: SongCardInterface[] = persistenceState.loggedCards.map((logEntry): SongCardInterface => ({
                id: `returned-${logEntry.timestamp}-${Math.random().toString(36).substring(2, 9)}`,
                artistName: logEntry.artistName,
                title: logEntry.title,
                imageUrl: logEntry.imageUrl,
                webLink: logEntry.webLink,
                color: logEntry.color || generateRandomColor(),
                comment: logEntry.comment,
                originalInputLine: logEntry.source,
                isBonusApplied: false,
                sourceType: inferSourceTypeFromInput(logEntry.source),
                isRevealed: false,
            }));
            dataState.setFullDeck(prevDeck => [...prevDeck, ...cardsToReturn]);
            persistenceState.setLoggedCards([]);
            dataState.setStatusMessage(`${cardsToReturn.length} songs returned to the deck.`);
            setClearLoggedSongsClickCount(0);
        } else {
            clearLoggedSongsTimeoutRef.current = window.setTimeout(() => setClearLoggedSongsClickCount(0), CONFIRM_TIMEOUT_MS);
        }
    }, [clearLoggedSongsClickCount, persistenceState.loggedCards, dataState]);

    const getClearAndReturnLoggedSongsButtonText = () => {
        if (clearLoggedSongsClickCount > 0) {
            return `Confirm Clear & Return (${LOGGED_SONGS_CLEAR_RETURN_CLICKS_NEEDED - clearLoggedSongsClickCount} left)`;
        }
        return "Clear & Return Unlogged Songs";
    };

    return {
        ...dataState,
        ...themeState,
        ...animationState,
        ...persistenceState,
        ...specialModes,
        pickerMode, setPickerMode,
        selectedCardForLogging, setSelectedCardForLogging,
        showConfetti,
        cardAnimationKey,
        buildDeck,
        pickRandomCard,
        handleManualPick,
        logSelectedCard,
        unloggedDeckForDisplay,
        clearLoggedSongsClickCount,
        handleClearAndReturnLoggedSongs,
        getClearAndReturnLoggedSongsButtonText,
        getClearSongInfoCacheButtonText,
        handleRemoveGroupAndReturnSongs,
        getRemoveGroupButtonText,
        handleClearLog: () => persistenceState.setLoggedCards([]),
        handleClearDeck: () => dataState.setFullDeck([]),
        handleClearAllInputs: () => {
            dataState.setRawSongInput('');
            dataState.setRawBonusArtistsInput('');
            dataState.setFullDeck([]);
            setSelectedCardForLogging(null);
        },
        handleApplyBonuses: () => {
            const bonusArtists = dataState.rawBonusArtistsInput.split('\n').map(a => a.trim().toLowerCase()).filter(a => a);
            dataState.setAppliedBonuses(bonusArtists);
            dataState.buildDeckInternal(dataState.rawSongInput, bonusArtists);
        },
        handlePrepareRevealRound: () => specialModes.handlePrepareRevealRound(unloggedDeckForDisplay),
        handleRankingRevealClick,
        handleCloseRankingRevealModal
    };
};
