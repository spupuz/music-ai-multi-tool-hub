import React, { useMemo, useState, useRef, useEffect, useCallback } from 'react';
import type { ToolProps } from '@/Layout';
import { useSongDeckPickerLogic } from '@/hooks/useSongDeckPickerLogic';
import Button from '@/components/common/Button';
import Select from '@/components/common/Select';
import { EyeIcon as EyeOpenIcon, DiceIcon as DiceFiveIcon, CogIcon as ConfigIcon } from '@/components/Icons';
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
    const { theme, uiMode } = useTheme();
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
            transition: 'transform 0.4s cubic-bezier(0.23, 1, 0.32, 1), border-color 0.4s ease, box-shadow 0.4s ease, opacity 0.4s ease',
            width: '100%', 
        };
        if (logic.animatedSelectionStage === 'cardFocused') {
            if (isTheSelectedCardInRow) {
                cardStyle.borderColor = logic.toolAccentColor;
                cardStyle.transform = 'scale(1.05)';
                cardStyle.boxShadow = `0 15px 30px -10px ${logic.toolAccentColor}66`;
            } else { cardStyle.opacity = 0.5; }
        } else if (logic.arrowPositionIndex === index && logic.animatedSelectionStage === 'animatingArrow') {
           cardStyle.borderColor = logic.toolAccentColor;
           cardStyle.transform = 'scale(1.02)';
        } else if (logic.finallyChosenCardFromAnimation?.id === card.id && logic.animatedSelectionStage === 'arrowLanded') {
            cardStyle.transform = 'scale(1.08) translateY(-5px)';
            cardStyle.borderColor = logic.toolAccentColor; 
            cardStyle.boxShadow = `0 20px 40px -12px ${logic.toolAccentColor}88`;
        }
        return cardStyle;
    };

    const cardBackDefaultStyle: React.CSSProperties = {
        backgroundColor: lightenDarkenColor(logic.toolBackgroundColor, theme === 'light' ? -5 : -20), 
        border: `2px dashed ${lightenDarkenColor(logic.toolAccentColor, 40)}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '1.5rem', 
        minHeight: '18rem', 
        color: getAdjustedTextColor(lightenDarkenColor(logic.toolBackgroundColor, theme === 'light' ? -5 : -20), logic.toolTextColor),
        fontFamily: logic.cardTextFont,
    };

    const modeOptions = [
        { value: PickerMode.Standard, label: 'Standard' },
        { value: PickerMode.Reveal, label: 'Reveal' },
        { value: PickerMode.RankingReveal, label: 'Ranking' }
    ];

    return (
        <div className={`w-full ${uiMode === 'classic' ? 'text-gray-900 dark:text-white pb-20 px-4' : 'text-gray-900 dark:text-white'} animate-fadeIn`}>
          {uiMode === 'classic' ? (
            <header className="mb-10 text-center pt-8">
              <h1 className="text-2xl md:text-3xl font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-tight">
                Song Deck Picker
              </h1>
              <p className="mt-3 text-sm font-medium text-gray-700 dark:text-gray-300 max-w-3xl mx-auto text-center">
                Curated song libraries • Advanced filtering • Interactive Decks
              </p>
            </header>
          ) : (
            <header className="mb-2 md:mb-14 text-center pt-0 md:pt-8 px-4 animate-fadeIn">
              <h1 className="text-3xl sm:text-5xl md:text-7xl font-black uppercase tracking-tighter text-emerald-600 dark:text-emerald-500 leading-none italic drop-shadow-2xl mb-1 md:mb-4">Song Deck Picker</h1>
              <p className="mt-1 md:mt-4 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.4em] text-gray-500 dark:text-gray-400 max-w-xl mx-auto opacity-70">
                Curated song libraries • Advanced filtering • Interactive Decks
              </p>
            </header>
          )}

          <main className="w-full glass-card p-2 sm:p-6 md:p-10 border-white/10 text-gray-900 dark:text-gray-200 transition-all duration-500 animate-fadeIn overflow-hidden">
        <div className="max-w-6xl mx-auto space-y-12">
        
        <nav 
            className="sticky top-4 z-[60] p-3 md:p-4 mb-12 rounded-3xl flex flex-wrap items-center justify-between gap-6 glass-card border-white/20 shadow-2xl transition-all duration-500 overflow-visible" 
        >
            <div className="flex items-center gap-4 min-w-[200px]">
                <Select 
                    id="pickerModeSelect"
                    label="Picker Mode"
                    options={modeOptions}
                    value={logic.pickerMode}
                    onChange={(val) => logic.setPickerMode(val as PickerMode)}
                    containerClassName="w-full"
                />
            </div>
            
            <div className="flex items-center gap-3">
                <Button 
                    onClick={() => logic.setShowInputs(!logic.showInputs)} 
                    variant="ghost"
                    size="sm"
                    startIcon={<EyeOpenIcon className="w-4 h-4"/>}
                    className="hover:bg-white/10 dark:hover:bg-white/5 rounded-xl px-4 py-2"
                    textColor={logic.toolTextColor}
                >
                    {logic.showInputs ? 'Hide Inputs' : 'Show Inputs'}
                </Button>
                <Button 
                    onClick={() => logic.setShowCustomization(!logic.setShowCustomization)} 
                    variant="ghost"
                    size="sm"
                    startIcon={<ConfigIcon className="w-4 h-4"/>}
                    className="hover:bg-white/10 dark:hover:bg-white/5 rounded-xl px-4 py-2"
                    textColor={logic.toolTextColor}
                >
                    {logic.showCustomization ? 'Config' : 'Config'}
                </Button>
            </div>
        </nav>
        
             {logic.customLogo && ( 
                <img 
                    src={logic.customLogo} 
                    alt="Custom Deck Picker Logo" 
                    className="mx-auto mb-8 rounded-3xl object-contain shadow-2xl" 
                    style={{ maxHeight: logic.selectedLogoSize, maxWidth: '80%' }} 
                /> 
             )}


        
        <DeckControls {...logic} theme={theme} getAdjustedTextColorForContrast={getAdjustedTextColorForContrast} />

        <DeckSettings {...logic} theme={theme} />

        {logic.pickerMode === PickerMode.Standard && (
            <div className="flex items-center justify-center my-16">
                <Button 
                    onClick={logic.pickRandomCard} 
                    disabled={logic.isLoading || logic.isPickingRandomCard || logic.unloggedDeckForDisplay.length === 0} 
                    loading={logic.isPickingRandomCard && logic.animatedSelectionStage !== 'idle'}
                    variant="primary"
                    size="lg"
                    startIcon={<DiceFiveIcon className="w-7 h-7"/>}
                    className="font-black !px-16 !py-8 !text-2xl uppercase tracking-[0.2em] shadow-2xl transform hover:scale-105 active:scale-95 transition-all duration-300"
                    backgroundColor="#FACC15"
                    textColor="#000000"
                >
                    {logic.isPickingRandomCard && logic.animatedSelectionStage !== 'idle' ? 'PICKING...' : `PICK CARD (${logic.unloggedDeckForDisplay.length})`}
                </Button>
            </div>
        )}

        <DeckView {...logic} theme={theme} getCardStyleForAnimation={getCardStyleForAnimation} FALLBACK_IMAGE_DATA_URI={FALLBACK_IMAGE_DATA_URI} cardBackDefaultStyle={cardBackDefaultStyle} />
        
        <DeckFocusView {...logic} card={logic.selectedCardForLogging} effectiveCardTextColor={effectiveCardTextColor} FALLBACK_IMAGE_DATA_URI={FALLBACK_IMAGE_DATA_URI} getAdjustedTextColorForContrast={getAdjustedTextColorForContrast} loggedCardsLength={logic.loggedCards.length} />

        <DeckLog {...logic} theme={theme} FALLBACK_IMAGE_DATA_URI={FALLBACK_IMAGE_DATA_URI} getAdjustedTextColorForContrast={getAdjustedTextColorForContrast} />

        <RankingModal {...logic} audioRef={audioRef} setIsSnippetPlaying={setIsSnippetPlaying} isSnippetPlaying={isSnippetPlaying} FALLBACK_IMAGE_DATA_URI={FALLBACK_IMAGE_DATA_URI} getAdjustedTextColorForContrast={getAdjustedTextColorForContrast} />

        </div>
        <style>{`
        .card-container { perspective: 2000px; }
        .card-inner { position: relative; width: 100%; height: 100%; text-align: center; transition: transform 0.8s cubic-bezier(0.23, 1, 0.32, 1); transform-style: preserve-3d; }
        .card-face { position: absolute; width: 100%; height: 100%; -webkit-backface-visibility: hidden; backface-visibility: hidden; display: flex; flex-direction: column; justify-content: center; align-items: center; border-radius: 1.5rem; }
        .card-back { transform: rotateY(180deg); }
      `}</style>
      </main>
    </div>
    );
};
export default SongDeckPickerTool;
