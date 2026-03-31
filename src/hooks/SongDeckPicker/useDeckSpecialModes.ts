import { useState, useCallback } from 'react';
import { SongCardInterface, SongGroup, PickerMode, PickedSongLogEntry } from '@/types';
import { shuffleArray } from '@/tools/SongDeckPicker/songDeckPicker.utils';
import { TOOL_CATEGORY } from '@/tools/SongDeckPicker/songDeckPicker.constants';

interface UseDeckSpecialModesProps {
    trackLocalEvent: (category: string, action: string, label?: string, value?: number) => void;
    setStatusMessage: (msg: string) => void;
    loggedCards: PickedSongLogEntry[];
    setLoggedCards: React.Dispatch<React.SetStateAction<PickedSongLogEntry[]>>;
    setFullDeck: React.Dispatch<React.SetStateAction<SongCardInterface[]>>;
    maxLoggedSongsN: number;
}

export const useDeckSpecialModes = ({
    trackLocalEvent,
    setStatusMessage,
    loggedCards,
    setLoggedCards,
    setFullDeck,
    maxLoggedSongsN
}: UseDeckSpecialModesProps) => {
    // --- Reveal Round Logic ---
    const [revealPoolSizeX, setRevealPoolSizeX] = useState<number>(5);
    const [currentRevealPool, setCurrentRevealPool] = useState<SongCardInterface[]>([]);
    const [revealedInPoolCount, setRevealedInPoolCount] = useState<number>(0);
    const [isRevealRoundActive, setIsRevealRoundActive] = useState<boolean>(false);

    const handlePrepareRevealRound = useCallback((deck: SongCardInterface[]) => {
        if (!deck || deck.length === 0) {
            setStatusMessage('No cards in the deck to reveal.');
            return;
        }
        const cardsForRound = shuffleArray(deck).slice(0, revealPoolSizeX);
        setCurrentRevealPool(cardsForRound.map(card => ({ ...card, isRevealed: false })));
        setRevealedInPoolCount(0);
        setIsRevealRoundActive(true);
        setStatusMessage(`Reveal round ready! ${cardsForRound.length} cards in the pool.`);
        trackLocalEvent(TOOL_CATEGORY, 'revealRoundPrepared', undefined, cardsForRound.length);
    }, [revealPoolSizeX, trackLocalEvent, setStatusMessage]);

    const handleRevealNextCard = useCallback(() => {
        if (revealedInPoolCount >= currentRevealPool.length) return;
        const indexToReveal = revealedInPoolCount;
        setCurrentRevealPool(prevPool => {
            const newPool = [...prevPool];
            if (newPool[indexToReveal]) newPool[indexToReveal].isRevealed = true;
            return newPool;
        });
        setRevealedInPoolCount(prev => prev + 1);
        trackLocalEvent(TOOL_CATEGORY, 'cardRevealed');
    }, [revealedInPoolCount, currentRevealPool, trackLocalEvent]);

    const handleLogRevealedCards = useCallback(() => {
        if (loggedCards.length + currentRevealPool.length > maxLoggedSongsN) {
            setStatusMessage(`Cannot log cards. Would exceed max limit of ${maxLoggedSongsN}.`);
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
    }, [currentRevealPool, loggedCards, maxLoggedSongsN, trackLocalEvent, setLoggedCards, setFullDeck, setStatusMessage]);

    // --- Song Grouping Logic ---
    const [songGroups, setSongGroups] = useState<SongGroup[]>([]);
    const [currentGroupNameInput, setCurrentGroupNameInput] = useState<string>('');
    const [maxSongsPerGroup, setMaxSongsPerGroup] = useState<number>(10);

    const handleMoveLoggedToGroup = useCallback(() => {
        if (loggedCards.length === 0) {
            setStatusMessage('No logged songs to move.');
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
    }, [loggedCards, currentGroupNameInput, songGroups, trackLocalEvent, setLoggedCards, setStatusMessage]);

    // --- Ranking Logic ---
    const [nextRankToReveal, setNextRankToReveal] = useState<number | null>(null);
    const [revealedRankingCard, setRevealedRankingCard] = useState<SongCardInterface | null>(null);
    const [rankingRevealTopX, setRankingRevealTopX] = useState<number>(3);
    const [rankingRevealSnippetDuration, setRankingRevealSnippetDuration] = useState<number>(30);

    return {
        revealPoolSizeX, setRevealPoolSizeX,
        currentRevealPool, setCurrentRevealPool,
        revealedInPoolCount, setRevealedInPoolCount,
        isRevealRoundActive, setIsRevealRoundActive,
        handlePrepareRevealRound, handleRevealNextCard, handleLogRevealedCards,
        songGroups, setSongGroups,
        currentGroupNameInput, setCurrentGroupNameInput,
        maxSongsPerGroup, setMaxSongsPerGroup,
        handleMoveLoggedToGroup,
        nextRankToReveal, setNextRankToReveal,
        revealedRankingCard, setRevealedRankingCard,
        rankingRevealTopX, setRankingRevealTopX,
        rankingRevealSnippetDuration, setRankingRevealSnippetDuration
    };
};
