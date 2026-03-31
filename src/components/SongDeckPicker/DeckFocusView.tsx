import React from 'react';
import { SongCardInterface } from '@/types';
import { getAdjustedTextColor, lightenDarkenColor } from '@/utils/imageUtils';
import Button from '@/components/common/Button';

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
        <div key={props.cardAnimationKey} className="my-8 p-6 md:p-8 rounded-[2.5rem] shadow-2xl animate-fadeIn relative overflow-hidden border backdrop-blur-md" 
             style={{ 
                backgroundColor: `${props.card.color || props.cardBackgroundColor}ee`, 
                borderColor: `${String(props.cardBorderColor)}66`,
                boxShadow: `0 25px 50px -12px ${props.card.color || props.toolAccentColor}44`
             }}>
            {props.showConfetti && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden z-50">
                    {[...Array(15)].map((_, i) => (
                        <div key={i} className="confetti-piece" style={{ animationDelay: `${i * 0.15}s`, left: `${i * 7}%`, backgroundColor: props.toolAccentColor }}></div>
                    ))}
                </div>
            )}
            <div className="relative z-10 flex flex-col items-center">
                <div className="inline-block px-4 py-1 rounded-full bg-black/20 backdrop-blur-sm text-[10px] font-black uppercase tracking-widest mb-4" style={{ color: props.effectiveCardTextColor }}>
                    SELECTED CARD
                </div>
                <h3 className="text-3xl md:text-4xl font-black text-center mb-2 break-words leading-tight tracking-tighter" style={{ color: String(props.effectiveCardTextColor), fontFamily: props.cardTextFont }}>{props.card.title}</h3>
                <p className="text-lg md:text-xl text-center mb-6 opacity-80 font-bold" style={{ color: String(props.effectiveCardTextColor), fontFamily: props.cardTextFont }}>by {props.card.artistName}</p>
                
                <div className="relative group perspective-1000 mb-6">
                    <a href={props.card.webLink || '#'} target="_blank" rel="noopener noreferrer" className="block">
                        <img 
                            src={props.card.imageUrl || props.FALLBACK_IMAGE_DATA_URI} 
                            alt={`${props.card.title} cover`} 
                            className="w-56 h-56 md:w-64 md:h-64 object-cover rounded-2xl mx-auto shadow-2xl border-4 transition-transform duration-500 group-hover:scale-105" 
                            style={{borderColor: `${props.effectiveCardTextColor}44`}} 
                            onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = props.FALLBACK_IMAGE_DATA_URI; }}
                        />
                    </a>
                </div>

                {props.card.comment && (
                    <div className="max-w-md w-full p-4 rounded-2xl bg-black/20 backdrop-blur-sm border border-white/10 mb-6 text-center italic text-sm shadow-inner" style={{ color: props.effectiveCardTextColor, fontFamily: props.cardTextFont }}>
                        "{props.card.comment}"
                    </div>
                )}
                
                {props.card.webLink && ( 
                    <a href={props.card.webLink} target="_blank" rel="noopener noreferrer" className="text-xs font-black uppercase tracking-widest underline hover:opacity-75 mb-6 block" style={{ color: String(props.effectiveCardTextColor), fontFamily: props.cardTextFont }}>
                        LISTEN ON SOURCE ↗
                    </a> 
                )}

                <div className="w-full flex justify-center">
                    <Button 
                        onClick={props.logSelectedCard} 
                        disabled={props.loggedCardsLength >= props.maxLoggedSongsN} 
                        variant="primary"
                        size="lg"
                        className="font-black !px-12 !py-4 shadow-2xl transform hover:scale-105 active:scale-95"
                        backgroundColor={props.toolAccentColor}
                        textColor={props.getAdjustedTextColorForContrast(props.toolAccentColor, props.toolTextColor)}
                    >
                        CONFIRM & LOG PICK
                    </Button>
                </div>
                {props.loggedCardsLength >= props.maxLoggedSongsN && (
                    <p className="text-xs font-bold text-red-500 mt-3 uppercase tracking-tighter">
                        Log storage full ({props.maxLoggedSongsN}/{props.maxLoggedSongsN})
                    </p>
                )}
            </div>
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

    const textColor = props.getAdjustedTextColorForContrast(props.revealedRankingCard.color || props.cardBackgroundColor, props.cardTextColor);

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center z-[100] p-4 animate-fadeIn"
             onClick={handleClose}>
            <div className="relative w-full max-w-lg animate-scaleIn" onClick={(e) => e.stopPropagation()}>
                <div 
                    className="rounded-[2.5rem] shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden border-4 flex flex-col aspect-[4/5] md:aspect-[3/4] w-full transform hover:scale-[1.02] transition-transform duration-500"
                    style={{ 
                        backgroundColor: props.revealedRankingCard.color || props.cardBackgroundColor, 
                        borderColor: `${props.toolAccentColor}88`,
                        boxShadow: `0 0 60px -15px ${props.toolAccentColor}44`
                    }}
                >
                    <div className="relative h-2/3 w-full group overflow-hidden">
                        <img 
                            src={props.revealedRankingCard.imageUrl || props.FALLBACK_IMAGE_DATA_URI} 
                            alt={`${props.revealedRankingCard.title} cover`} 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                            onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = props.FALLBACK_IMAGE_DATA_URI; }}
                        />
                        <div className="absolute top-6 left-6 px-5 py-2 rounded-full bg-black/60 backdrop-blur-md border border-white/20 shadow-2xl">
                            <span className="text-2xl font-black text-white italic tracking-tighter">RANK #{props.revealedRankingCard.rank}</span>
                        </div>
                    </div>
                    <div className="h-1/3 flex flex-col justify-center items-center p-6 w-full bg-black/10 backdrop-blur-sm">
                        <div className="text-center w-full min-w-0">
                            <h3 className="text-3xl md:text-4xl font-black break-words line-clamp-2 leading-tight tracking-tighter mb-2" style={{ color: textColor, fontFamily: props.cardTextFont }}>
                                {props.revealedRankingCard.title}
                            </h3>
                            <p className="text-xl md:text-2xl font-bold opacity-80 truncate" style={{ color: textColor, fontFamily: props.cardTextFont }}>
                                by {props.revealedRankingCard.artistName}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="mt-8 text-center space-y-4">
                    {props.isSnippetPlaying && (
                        <div className="animate-fadeIn">
                            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/10 mb-4">
                                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                                <p className="text-sm font-black uppercase tracking-widest text-white">Playing {props.rankingRevealSnippetDuration}s snippet</p>
                            </div>
                            <div className="flex justify-center">
                                <Button 
                                    onClick={handleClose}
                                    variant="danger"
                                    size="md"
                                    className="rounded-full !px-8 shadow-2xl transform hover:scale-105 active:scale-95 font-black uppercase tracking-widest"
                                >
                                    SKIP & CLOSE
                                </Button>
                            </div>
                        </div>
                    )}
                    {!props.isSnippetPlaying && (
                        <p className="text-sm font-black uppercase tracking-widest opacity-50 animate-pulse" style={{color: props.toolTextColor}}>
                            Click anywhere to close
                        </p>
                    )}
                </div>
                <audio ref={props.audioRef} onEnded={() => props.setIsSnippetPlaying(false)} onPause={() => props.setIsSnippetPlaying(false)} className="hidden" />
            </div>
        </div>
    );
};
