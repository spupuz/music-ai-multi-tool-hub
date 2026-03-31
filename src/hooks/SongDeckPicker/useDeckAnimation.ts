import { useState, useRef, useEffect, useCallback } from 'react';
import { SongCardInterface } from '@/types';
import { shuffleArray } from '@/tools/SongDeckPicker/songDeckPicker.utils';
import { TOOL_CATEGORY } from '@/tools/SongDeckPicker/songDeckPicker.constants';

type AnimationStage = 'idle' | 'drawing' | 'animatingArrow' | 'arrowLanded' | 'cardFocused';

interface UseDeckAnimationProps {
    unloggedDeckForDisplay: SongCardInterface[];
    numberOfCardsToDraw: number;
    trackLocalEvent: (category: string, action: string, label?: string, value?: number) => void;
    setSelectedCardForLogging: (card: SongCardInterface | null) => void;
    setCardAnimationKey: React.Dispatch<React.SetStateAction<number>>;
    setShowConfetti: React.Dispatch<React.SetStateAction<boolean>>;
    setStatusMessage: (msg: string) => void;
}

export const useDeckAnimation = ({
    unloggedDeckForDisplay,
    numberOfCardsToDraw,
    trackLocalEvent,
    setSelectedCardForLogging,
    setCardAnimationKey,
    setShowConfetti,
    setStatusMessage
}: UseDeckAnimationProps) => {
    const [animatedSelectionStage, setAnimatedSelectionStage] = useState<AnimationStage>('idle');
    const animatedSelectionStageRef = useRef(animatedSelectionStage);
    useEffect(() => { animatedSelectionStageRef.current = animatedSelectionStage; }, [animatedSelectionStage]);

    const [drawnCardsForSelection, setDrawnCardsForSelection] = useState<SongCardInterface[] | null>(null);
    const [arrowPositionIndex, setArrowPositionIndex] = useState<number | null>(null);
    const [finallyChosenCardFromAnimation, setFinallyChosenCardFromAnimation] = useState<SongCardInterface | null>(null);
    const [isPickingRandomCard, setIsPickingRandomCard] = useState(false);

    const animationAbortControllerRef = useRef<AbortController | null>(null);

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
    }, [unloggedDeckForDisplay, trackLocalEvent, setSelectedCardForLogging, setCardAnimationKey, setShowConfetti, setStatusMessage]);

    return {
        animatedSelectionStage, setAnimatedSelectionStage,
        animatedSelectionStageRef,
        drawnCardsForSelection, setDrawnCardsForSelection,
        arrowPositionIndex, setArrowPositionIndex,
        finallyChosenCardFromAnimation, setFinallyChosenCardFromAnimation,
        isPickingRandomCard, setIsPickingRandomCard,
        animationAbortControllerRef,
        startMultiCardSelectionAnimation
    };
};
