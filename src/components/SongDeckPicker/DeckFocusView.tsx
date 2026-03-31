import React from 'react';
import { SongCardInterface } from '@/types';
import { getAdjustedTextColor, lightenDarkenColor } from '@/utils/imageUtils';

interface DeckFocusViewProps {
    card: SongCardInterface | null;
    cardAnimationKey: number;
    showConfetti: boolean;
    cardBackgroundColor: string;
    cardBorderColor: string;
    effectiveCardTextColor: string;
    cardTextFont: string;
    FALLBACK_IMAGE_DATA_URI: string;
    logSelectedCard: () => void;
    loggedCardsLength: number;
    maxLoggedSongsN: number;
    toolAccentColor: string;
    getAdjustedTextColorForContrast: (bg: string, pref?: string) => string;
    toolTextColor: string;
    animatedSelectionStage: string;
}

export const DeckFocusView: React.FC<DeckFocusViewProps> = (props) => {
    if (!props.card || props.animatedSelectionStage !== 'cardFocused') return null;

    return (
        <div key={props.cardAnimationKey} className="my-4 p-4 rounded-lg shadow-xl animate-fadeIn" style={{ backgroundColor: props.card.color || props.cardBackgroundColor, border: `2px solid ${String(props.cardBorderColor)}` }}>
            {props.showConfetti && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden z-50">
                    {[...Array(10)].map((_, i) => (
                        <div key={i} className="confetti-piece" style={{ animationDelay: `${i * 0.1}s`, left: `${i * 10}%` }}></div>
                    ))}
                </div>
            )}
            <h3 className="text-xl font-bold text-center mb-2 break-all" style={{ color: String(props.effectiveCardTextColor), fontFamily: props.cardTextFont }}>{props.card.title}</h3>
            <p className="text-md text-center mb-3 break-all" style={{ color: String(lightenDarkenColor(props.effectiveCardTextColor, props.effectiveCardTextColor === '#FFFFFF' ? -30 : 30)), fontFamily: props.cardTextFont }}>by {props.card.artistName}</p>
            <a href={props.card.webLink || '#'} target="_blank" rel="noopener noreferrer">
                <img src={props.card.imageUrl || props.FALLBACK_IMAGE_DATA_URI} alt={`${props.card.title} cover`} className="w-40 h-40 md:w-48 md:h-48 object-cover rounded-md mx-auto mb-3 shadow-lg border-2" style={{borderColor: String(props.cardBorderColor)}} onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = props.FALLBACK_IMAGE_DATA_URI; }}/>
            </a>
            {props.card.comment && <p className="text-xs italic text-center mb-2 p-2 bg-black bg-opacity-20 rounded break-words" style={{ color: String(lightenDarkenColor(props.effectiveCardTextColor, props.effectiveCardTextColor === '#FFFFFF' ? -20 : 20)), fontFamily: props.cardTextFont }}>Comment: {props.card.comment}</p>}
            {props.card.webLink && ( <a href={props.card.webLink} target="_blank" rel="noopener noreferrer" className="block text-center text-xs underline hover:opacity-75" style={{ color: String(props.effectiveCardTextColor), fontFamily: props.cardTextFont }}>Listen/View Source</a> )}
            <button onClick={props.logSelectedCard} disabled={props.loggedCardsLength >= props.maxLoggedSongsN} className="mt-3 w-full py-2 px-4 rounded-md font-medium text-sm shadow-sm transition-colors disabled:opacity-50" style={{ backgroundColor: String(props.toolAccentColor), color: String(props.getAdjustedTextColorForContrast(props.toolAccentColor, props.toolTextColor)) }}>Confirm & Log This Pick</button>
            {props.loggedCardsLength >= props.maxLoggedSongsN && <p className="text-xs text-red-400 text-center mt-1">Max logged songs ({props.maxLoggedSongsN}) reached.</p>}
        </div>
    );
};

interface RankingModalProps {
    revealedRankingCard: SongCardInterface | null;
    isSnippetPlaying: boolean;
    handleCloseRankingRevealModal: (card: SongCardInterface) => void;
    cardBackgroundColor: string;
    toolAccentColor: string;
    FALLBACK_IMAGE_DATA_URI: string;
    cardBorderColor: string;
    cardTextColor: string;
    cardTextFont: string;
    getAdjustedTextColorForContrast: (bg: string, pref?: string) => string;
    rankingRevealSnippetDuration: number;
    toolTextColor: string;
    audioRef: React.RefObject<HTMLAudioElement>;
    setIsSnippetPlaying: (val: boolean) => void;
}

export const RankingModal: React.FC<RankingModalProps> = (props) => {
    if (!props.revealedRankingCard) return null;

    const handleClose = () => {
        if (props.audioRef.current) {
            props.audioRef.current.pause();
            props.audioRef.current.src = "";
        }
        props.setIsSnippetPlaying(false);
        props.handleCloseRankingRevealModal(props.revealedRankingCard!);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[100] p-4 animate-fadeIn"
             onClick={handleClose}>
            <div className="relative w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                <div 
                    className="p-2 rounded-lg shadow-xl animate-fadeIn border-2 flex flex-col aspect-[11/18] w-full"
                    style={{ 
                        backgroundColor: props.revealedRankingCard.color || props.cardBackgroundColor, 
                        borderColor: props.toolAccentColor,
                    }}
                >
                    <div className="h-2/3 w-full">
                        <img 
                            src={props.revealedRankingCard.imageUrl || props.FALLBACK_IMAGE_DATA_URI} 
                            alt={`${props.revealedRankingCard.title} cover`} 
                            className="w-full h-full object-cover rounded-sm border" 
                            style={{borderColor: props.cardBorderColor}} 
                            onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = props.FALLBACK_IMAGE_DATA_URI; }}
                        />
                    </div>
                    <div className="h-1/3 flex flex-col justify-center items-center p-1 w-full">
                        <div className={`text-center w-full p-2 min-w-0`}>
                            <a href={props.revealedRankingCard.webLink || '#'} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                <h3 className="text-2xl font-bold break-words line-clamp-2" style={{ color: String(props.getAdjustedTextColorForContrast(props.revealedRankingCard.color || props.cardBackgroundColor, props.cardTextColor)), fontFamily: props.cardTextFont }}>
                                    {props.revealedRankingCard.title}
                                </h3>
                            </a>
                            <p className="text-lg break-words line-clamp-1" style={{ color: String(lightenDarkenColor(props.getAdjustedTextColorForContrast(props.revealedRankingCard.color || props.cardBackgroundColor, props.cardTextColor), props.getAdjustedTextColorForContrast(props.revealedRankingCard.color || props.cardBackgroundColor, props.cardTextColor) === '#FFFFFF' ? -30 : 30)), fontFamily: props.cardTextFont }}>
                                by {props.revealedRankingCard.artistName}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="mt-4 text-center space-y-2">
                    {props.isSnippetPlaying && (
                        <>
                            <p className="text-sm animate-pulse" style={{color: props.toolTextColor}}>Playing {props.rankingRevealSnippetDuration}s snippet...</p>
                            <button 
                                onClick={handleClose}
                                className="py-1 px-4 bg-red-600 hover:bg-red-500 text-white rounded-full text-xs font-semibold shadow-md transition-all transform hover:scale-105 active:scale-95"
                            >
                                Skip Snippet & Close
                            </button>
                        </>
                    )}
                    {!props.isSnippetPlaying && <p className="text-sm" style={{color: props.toolTextColor}}>Click anywhere to close</p>}
                </div>
                <audio ref={props.audioRef} onEnded={() => props.setIsSnippetPlaying(false)} onPause={() => props.setIsSnippetPlaying(false)} className="hidden" />
            </div>
        </div>
    );
};
