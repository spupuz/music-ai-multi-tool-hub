import React, { useMemo, useState, useRef, useEffect, useCallback } from 'react';
import type { ToolProps } from '@/Layout';
import { useSongDeckPickerLogic } from '@/hooks/useSongDeckPickerLogic';
import { EyeOpenIcon, DiceFiveIcon, ConfigIcon } from './songDeckPicker.icons';
import { getAdjustedTextColor, lightenDarkenColor } from '@/utils/imageUtils';
import { SongCardInterface, PickerMode } from '@/types'; 
import { useTheme } from '@/context/ThemeContext';

// Import modular components
import { DeckControls } from '@/components/SongDeckPicker/DeckControls';
import { DeckSettings } from '@/components/SongDeckPicker/DeckSettings';
import { DeckLog } from '@/components/SongDeckPicker/DeckLog';
import { DeckView } from '@/components/SongDeckPicker/DeckView';
import { DeckFocusView, RankingModal } from '@/components/SongDeckPicker/DeckFocusView';

const LOGO_SVG_STRING = `<svg viewBox='0 0 100 100' fill='none' xmlns='http://www.w3.org/2000/svg'><path d='M50 10 L85 27.5 V72.5 L50 90 L15 72.5 V27.5 L50 10 Z' stroke='#059669' stroke-width='8' fill='transparent'/><circle cx='50' cy='35' r='7' fill='#14B8A6'/><circle cx='35' cy='65' r='6' fill='#14B8A6'/><circle cx='65' cy='65' r='6' fill='#14B8A6'/><line x1='50' y1='35' x2='35' y2='65' stroke='#10B981' stroke-width='5' stroke-linecap='round'/><line x1='50' y1='35' x2='65' y2='65' stroke='#10B981' stroke-width='5' stroke-linecap='round'/><line x1='38' y1='63' x2='62' y2='63' stroke='#10B981' stroke-width='5' stroke-linecap='round'/></svg>`;
const FALLBACK_IMAGE_DATA_URI = `data:image/svg+xml;base64,${btoa(LOGO_SVG_STRING)}`;

const SongDeckPickerTool: React.FC<ToolProps> = ({ trackLocalEvent }) => {
    const { theme } = useTheme();
    const logic = useSongDeckPickerLogic({ trackLocalEvent });
    
    const [isSnippetPlaying, setIsSnippetPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement>(null);
    const snippetTimeoutRef = useRef<number | null>(null);

    const getAdjustedTextColorForContrast = useCallback((backgroundColorHex: string, preferredTextColorHex?: string): string => {
        return getAdjustedTextColor(backgroundColorHex, preferredTextColorHex || logic.toolTextColor);
    }, [logic.toolTextColor]);

    useEffect(() => {
        const isTopX = logic.revealedRankingCard && (logic.revealedRankingCard.rank || 0) <= logic.rankingRevealTopX;
        if (isTopX && logic.revealedRankingCard?.audioUrl && audioRef.current) {
            const audio = audioRef.current;
            const playSnippet = () => {
                if (audio.duration && isFinite(audio.duration)) {
                    const snippetDuration = logic.rankingRevealSnippetDuration;
                    const maxStartTime = Math.max(0, audio.duration - snippetDuration);
                    const randomStartTime = Math.random() * maxStartTime;
                    audio.currentTime = randomStartTime;
                    audio.play().catch(e => console.error("Audio playback failed:", e));
                    setIsSnippetPlaying(true);
                    if (snippetTimeoutRef.current) clearTimeout(snippetTimeoutRef.current);
                    snippetTimeoutRef.current = window.setTimeout(() => {
                        if (audioRef.current) audioRef.current.pause();
                        setIsSnippetPlaying(false);
                    }, snippetDuration * 1000);
                } else { setIsSnippetPlaying(false); }
            };
            const handleLoadedData = () => { playSnippet(); audio.removeEventListener('loadeddata', handleLoadedData); };
            audio.addEventListener('loadeddata', handleLoadedData);
            audio.src = logic.revealedRankingCard.audioUrl;
            audio.load();
            return () => {
                audio.removeEventListener('loadeddata', handleLoadedData);
                audio.pause();
                if(audioRef.current) audioRef.current.src = '';
                if (snippetTimeoutRef.current) clearTimeout(snippetTimeoutRef.current);
            };
        } else {
            setIsSnippetPlaying(false);
            if (snippetTimeoutRef.current) clearTimeout(snippetTimeoutRef.current);
        }
    }, [logic.revealedRankingCard, logic.rankingRevealSnippetDuration]);
    
    const effectiveCardTextColor = useMemo(() => {
        const bgToTest = logic.selectedCardForLogging?.color || logic.cardBackgroundColor;
        return getAdjustedTextColor(bgToTest, logic.cardTextColor);
    }, [logic.selectedCardForLogging, logic.cardBackgroundColor, logic.cardTextColor]);

    const getCardStyleForAnimation = (card: SongCardInterface, index: number): React.CSSProperties => {
        const isTheSelectedCardInRow = logic.selectedCardForLogging && card.id === logic.selectedCardForLogging.id;
        let cardStyle: React.CSSProperties = {
            backgroundColor: card.color || logic.cardBackgroundColor,
            borderColor: String(logic.cardBorderColor),
            transform: 'scale(1)',
            transition: 'transform 0.3s ease-out, border-color 0.3s ease-out, box-shadow 0.3s ease-out, opacity 0.3s ease-out',
            width: '100%', 
        };
        if (logic.animatedSelectionStage === 'cardFocused') {
            if (isTheSelectedCardInRow) {
                cardStyle.borderColor = logic.toolAccentColor;
                cardStyle.transform = 'scale(1.03)';
                cardStyle.boxShadow = `0 0 8px ${logic.toolAccentColor}`;
            } else { cardStyle.opacity = 0.7; }
        } else if (logic.arrowPositionIndex === index && logic.animatedSelectionStage === 'animatingArrow') {
           cardStyle.borderColor = logic.toolAccentColor;
           cardStyle.transform = 'scale(1.03)';
        } else if (logic.finallyChosenCardFromAnimation?.id === card.id && logic.animatedSelectionStage === 'arrowLanded') {
            cardStyle.transform = 'scale(1.05) translateY(-3px)';
            cardStyle.borderColor = logic.toolAccentColor; 
            cardStyle.boxShadow = `0 0 12px ${logic.toolAccentColor}`;
        }
        return cardStyle;
    };

    const cardBackDefaultStyle: React.CSSProperties = {
        backgroundColor: lightenDarkenColor(logic.toolBackgroundColor, theme === 'light' ? -5 : -20), 
        border: `2px dashed ${lightenDarkenColor(logic.toolAccentColor, 40)}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '0.375rem', 
        minHeight: '18rem', 
        color: getAdjustedTextColor(lightenDarkenColor(logic.toolBackgroundColor, theme === 'light' ? -5 : -20), logic.toolTextColor),
        fontFamily: logic.cardTextFont,
    };

    return (
      <div className="w-full min-h-screen p-2 md:p-4 transition-colors duration-300" style={{ backgroundColor: logic.toolBackgroundColor, color: logic.toolTextColor }}>
        
        <div className="sticky top-0 z-10 p-2 mb-3 rounded-b-lg flex flex-wrap items-center justify-center sm:justify-between gap-2" style={{ backgroundColor: lightenDarkenColor(logic.toolBackgroundColor, theme === 'light' ? -5 : 5), borderBottom: `1px solid ${logic.toolAccentColor}`}}>
            <div className="flex items-center gap-2">
                <label htmlFor="pickerModeSelect" className="text-xs font-medium" style={{ color: logic.toolTextColor }}>Picker Mode:</label>
                <select id="pickerModeSelect" value={logic.pickerMode} onChange={(e) => logic.setPickerMode(e.target.value as PickerMode)} className="text-xs p-1 rounded border dark:bg-gray-800" style={{borderColor: logic.toolAccentColor, color: logic.toolTextColor}}>
                    <option value={PickerMode.Standard}>Standard Mode</option>
                    <option value={PickerMode.Reveal}>Reveal Cards Mode</option>
                    <option value={PickerMode.RankingReveal}>Ranking Reveal Mode</option>
                </select>
            </div>
            <div className="flex items-center gap-2">
                <button onClick={() => logic.setShowInputs(!logic.showInputs)} className="text-xs py-1 px-2.5 rounded-md flex items-center gap-1 font-medium" style={{backgroundColor: String(logic.toolAccentColor), color: String(getAdjustedTextColorForContrast(logic.toolAccentColor, logic.toolTextColor))}}>
                    <EyeOpenIcon className="w-3.5 h-3.5"/> {logic.showInputs ? 'Hide Inputs' : 'Show Inputs'}
                </button>
                <button onClick={() => logic.setShowCustomization(!logic.showCustomization)} className="text-xs py-1 px-2.5 rounded-md flex items-center gap-1 font-medium" style={{backgroundColor: String(logic.toolAccentColor), color: String(getAdjustedTextColorForContrast(logic.toolAccentColor, logic.toolTextColor))}}>
                    <ConfigIcon className="w-3.5 h-3.5"/> {logic.showCustomization ? 'Hide UI Config' : 'Show UI Config'}
                </button>
            </div>
        </div>
        
        <header className="mb-4 text-center">
             {logic.customLogo && ( <img src={logic.customLogo} alt="Custom Deck Picker Logo" className="mx-auto mb-2 rounded-md object-contain" style={{ maxHeight: logic.selectedLogoSize, maxWidth: '80%' }} /> )}
            <h1 className="text-3xl md:text-4xl font-extrabold" style={{ color: logic.toolAccentColor }}>{logic.customTitle}</h1>
            <p className="mt-1 text-xs md:text-sm max-w-xl mx-auto">Build your song deck, apply bonuses, pick cards, and log your choices!</p>
        </header>
        
        <DeckControls {...logic} theme={theme} getAdjustedTextColorForContrast={getAdjustedTextColorForContrast} />

        <DeckSettings {...logic} theme={theme} />

        {logic.pickerMode === PickerMode.Standard && (
            <div className="flex items-center justify-center my-4">
                <button onClick={logic.pickRandomCard} disabled={logic.isLoading || logic.isPickingRandomCard || logic.unloggedDeckForDisplay.length === 0} className="flex items-center justify-center py-3 px-6 bg-yellow-500 hover:bg-yellow-600 text-black font-bold text-lg rounded-lg shadow-md disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:text-gray-500 dark:disabled:text-gray-400 transition-colors transform hover:scale-105 active:scale-95">
                    {logic.isPickingRandomCard && logic.animatedSelectionStage !== 'idle' ? <progress className="w-5 h-5 mr-2" /> : <DiceFiveIcon className="mr-2 w-5 h-5"/>}
                    {logic.isPickingRandomCard && logic.animatedSelectionStage !== 'idle' ? 'PICKING...' : `PICK RANDOM CARD (${logic.unloggedDeckForDisplay.length} left)`}
                </button>
            </div>
        )}

        <DeckView {...logic} theme={theme} getCardStyleForAnimation={getCardStyleForAnimation} FALLBACK_IMAGE_DATA_URI={FALLBACK_IMAGE_DATA_URI} cardBackDefaultStyle={cardBackDefaultStyle} />
        
        <DeckFocusView {...logic} card={logic.selectedCardForLogging} effectiveCardTextColor={effectiveCardTextColor} FALLBACK_IMAGE_DATA_URI={FALLBACK_IMAGE_DATA_URI} getAdjustedTextColorForContrast={getAdjustedTextColorForContrast} loggedCardsLength={logic.loggedCards.length} />

        <DeckLog {...logic} theme={theme} FALLBACK_IMAGE_DATA_URI={FALLBACK_IMAGE_DATA_URI} getAdjustedTextColorForContrast={getAdjustedTextColorForContrast} />

        <RankingModal {...logic} audioRef={audioRef} setIsSnippetPlaying={setIsSnippetPlaying} isSnippetPlaying={isSnippetPlaying} FALLBACK_IMAGE_DATA_URI={FALLBACK_IMAGE_DATA_URI} getAdjustedTextColorForContrast={getAdjustedTextColorForContrast} />

        <style>{`
        .card-container { perspective: 1000px; }
        .card-inner { position: relative; width: 100%; height: 100%; text-align: center; transition: transform 0.6s; transform-style: preserve-3d; }
        .card-face { position: absolute; width: 100%; height: 100%; -webkit-backface-visibility: hidden; backface-visibility: hidden; display: flex; flex-direction: column; justify-content: center; align-items: center; border-radius: 0.375rem; }
        .card-back { transform: rotateY(180deg); }
        .animate-fadeIn { animation: fadeIn 0.5s ease-out; } @keyframes fadeIn { 0% { opacity: 0; transform: translateY(10px); } 100% { opacity: 1; transform: translateY(0px); } }
        .confetti-piece { position: absolute; width: 8px; height: 16px; background-color: #facc15; opacity: 0; animation: fall 3s ease-out forwards; }
        @keyframes fall { 0% { transform: translateY(-10vh) rotateZ(0deg); opacity: 1; } 100% { transform: translateY(100vh) rotateZ(720deg); opacity: 0; } }
        @keyframes flash { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } } .animate-flash { animation: flash 1.5s infinite ease-in-out; }
        @keyframes pulse-border-yellow { 0%, 100% { box-shadow: 0 0 0 0 rgba(253, 224, 71, 0.7); border-color: rgba(253, 224, 71, 1); } 50% { box-shadow: 0 0 0 4px rgba(253, 224, 71, 0); border-color: rgba(253, 224, 71, 0.5); } } .animate-pulse-border { animation: pulse-border-yellow 2s infinite; }
      `}</style>
      </div>
    );
};
export default SongDeckPickerTool;
