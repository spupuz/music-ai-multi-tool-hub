import React, { useMemo } from 'react';
import Spinner from '@/components/Spinner';
import Button from '@/components/common/Button';
import { 
    ArrowDownIcon, EyeIcon as EyeOpenIcon, HandRaisedIcon 
} from '@/components/Icons';
import { lightenDarkenColor, getAdjustedTextColor } from '@/utils/imageUtils';
import { SongCardInterface, PickerMode, PickedSongLogEntry } from '@/types';

interface DeckViewProps {
    pickerMode: PickerMode;
    drawnCardsForSelection: SongCardInterface[] | null;
    animatedSelectionStage: string;
    toolBackgroundColor: string;
    theme: string;
    toolAccentColor: string;
    arrowPositionIndex: number | null;
    getCardStyleForAnimation: (card: SongCardInterface, index: number) => React.CSSProperties;
    FALLBACK_IMAGE_DATA_URI: string;
    cardBorderColor: string;
    cardTextColor: string;
    cardTextFont: string;
    cardBackgroundColor: string;
    finallyChosenCardFromAnimation: SongCardInterface | null;
    statusMessage: string;
    isRevealRoundActive: boolean;
    handlePrepareRevealRound: () => void;
    isLoading: boolean;
    isPickingRandomCard: boolean;
    unloggedDeckForDisplay: SongCardInterface[];
    loggedCards: PickedSongLogEntry[];
    maxLoggedSongsN: number;
    handleRevealNextCard: () => void;
    revealedInPoolCount: number;
    currentRevealPool: SongCardInterface[];
    customCardBackBase64: string | null;
    cardBackDefaultStyle: React.CSSProperties;
    handleLogRevealedCards: () => void;
    fullDeck: SongCardInterface[];
    nextRankToReveal: number | null;
    handleRankingRevealClick: (card: SongCardInterface) => void;
}

export const DeckView: React.FC<DeckViewProps> = (props) => {
    // --- Standard Mode Sub-View ---
    const renderStandardMode = () => {
        const hasDrawnCards = props.drawnCardsForSelection && props.drawnCardsForSelection.length > 0;
        const isAnimating = props.animatedSelectionStage !== 'idle';

        return (
            <div className="my-8">
                {hasDrawnCards && isAnimating && (
                    <div 
                        className="p-6 md:p-8 rounded-[2.5rem] shadow-2xl border backdrop-blur-md transition-all duration-700" 
                        style={{ 
                            backgroundColor: `${lightenDarkenColor(props.toolBackgroundColor, props.theme === 'light' ? -10 : 15)}dd`, 
                            borderColor: `${props.toolAccentColor}44`,
                            boxShadow: `0 20px 50px -12px ${props.toolAccentColor}33`
                        }}
                    >
                        <div className="relative flex flex-wrap justify-center items-start gap-4 md:gap-6 pt-16">
                            {/* Animated Smooth Arrow Container */}
                            <div 
                                className="absolute top-0 left-0 w-full h-16 pointer-events-none transition-all duration-300 ease-in-out"
                                style={{ 
                                    opacity: props.arrowPositionIndex !== null ? 1 : 0,
                                    transform: `translateY(${props.arrowPositionIndex !== null ? '0' : '-10px'})`
                                }}
                            >
                                {props.arrowPositionIndex !== null && (
                                    <div 
                                        className="absolute transition-all duration-300 ease-out flex justify-center"
                                        style={{ 
                                            width: '176px', // Matches w-44
                                            left: `calc(50% - (${(props.drawnCardsForSelection!.length * 176 + (props.drawnCardsForSelection!.length - 1) * 16) / 2}px) + ${props.arrowPositionIndex * (176 + 16)}px)`
                                        }}
                                    >
                                        <ArrowDownIcon 
                                            className="w-12 h-12 animate-bounce-slow" 
                                            style={{ color: props.toolAccentColor }} 
                                        />
                                    </div>
                                )}
                            </div>

                            {props.drawnCardsForSelection!.map((card, index) => (
                                <div key={`animated-card-wrapper-${card.id}`} className="flex flex-col items-center w-44 flex-shrink-0 animate-fadeIn" style={{ animationDelay: `${index * 50}ms` }}>
                                    <div 
                                        className="p-2 rounded-2xl text-xs flex flex-col justify-between min-h-[19rem] border w-full shadow-lg group overflow-hidden" 
                                        style={props.getCardStyleForAnimation(card, index)}
                                    >
                                        <div className="relative overflow-hidden rounded-xl border border-black/10 aspect-[4/3] mb-2 shadow-inner">
                                            <img src={card.imageUrl || props.FALLBACK_IMAGE_DATA_URI} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = props.FALLBACK_IMAGE_DATA_URI; }} />
                                            {!card.imageUrl && <div className="absolute inset-0 flex items-center justify-center opacity-20"><HandRaisedIcon className="w-12 h-12"/></div>}
                                        </div>
                                        <div className="flex-grow flex flex-col justify-end">
                                            <div className="p-3 rounded-xl bg-black/40 backdrop-blur-sm border border-white/10 text-center">
                                                <p className="font-black text-[11px] leading-tight mb-1 uppercase tracking-tight" style={{ color: '#FFFFFF', fontFamily: props.cardTextFont }}>{card.title}</p>
                                                <p className="font-bold text-[9px] opacity-80 uppercase tracking-widest truncate" style={{ color: '#FFFFFF', fontFamily: props.cardTextFont }}>{card.artistName}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {props.statusMessage && (props.animatedSelectionStage === 'animatingArrow' || props.animatedSelectionStage === 'arrowLanded') && ( 
                            <p className="text-center mt-8 text-lg font-black uppercase tracking-widest animate-pulse" style={{ color: String(props.toolAccentColor) }}>
                                {props.statusMessage}
                            </p> 
                        )}
                    </div>
                )}
            </div>
        );
    };

    // --- Reveal Mode Sub-View ---
    const renderRevealMode = () => (
        <div className="my-8 space-y-6">
            {!props.isRevealRoundActive && (
                <div className="flex justify-center">
                    <Button 
                        onClick={props.handlePrepareRevealRound} 
                        disabled={props.isLoading || props.isPickingRandomCard || props.unloggedDeckForDisplay.length === 0 || props.loggedCards.length >= props.maxLoggedSongsN} 
                        variant="primary"
                        size="md"
                        startIcon={<EyeOpenIcon className="w-5 h-5" />}
                        className="shadow-xl"
                    >
                        Prepare Reveal Round ({props.drawnCardsForSelection?.length || 5} cards)
                    </Button>
                </div>
            )}
            {props.isRevealRoundActive && (
                <div className="space-y-6">
                    <div className="flex justify-center">
                        <Button 
                            onClick={props.handleRevealNextCard} 
                            disabled={props.revealedInPoolCount >= props.currentRevealPool.length} 
                            variant="warning"
                            size="md"
                            startIcon={<EyeOpenIcon className="w-5 h-5" />}
                            className="shadow-lg"
                        >
                            Reveal Next Card ({props.revealedInPoolCount}/{props.currentRevealPool.length})
                        </Button>
                    </div>
                    <div 
                        className="flex flex-wrap justify-center gap-6 p-6 md:p-8 rounded-[2.5rem] shadow-2xl border backdrop-blur-md" 
                        style={{ 
                            backgroundColor: `${lightenDarkenColor(props.toolBackgroundColor, props.theme === 'light' ? -10 : 15)}dd`, 
                            borderColor: `${props.toolAccentColor}44`
                        }}
                    >
                        {props.currentRevealPool.map((card, index) => (
                            <div key={`reveal-${card.id}-${index}`} className="card-container w-44 h-72 shadow-xl hover:shadow-2xl transition-all duration-300">
                                <div className="card-inner" style={card.isRevealed ? {} : {transform: 'rotateY(180deg)'}}>
                                    <div className="card-face card-front p-2 rounded-2xl text-xs flex flex-col justify-between shadow-lg border" style={{backgroundColor: card.color || props.cardBackgroundColor, borderColor: String(props.cardBorderColor)}}>
                                        <img src={card.imageUrl || props.FALLBACK_IMAGE_DATA_URI} alt="" className="w-full h-44 object-cover rounded-xl mb-2 border-black/10" />
                                        <div className="p-2.5 rounded-xl bg-black/40 backdrop-blur-sm border border-white/10 text-center">
                                            <p className="font-black text-[11px] leading-tight uppercase tracking-tight" style={{ color: '#FFFFFF', fontFamily: props.cardTextFont }}>{card.title}</p>
                                            <p className="font-bold text-[9px] opacity-70 uppercase tracking-widest truncate" style={{ color: '#FFFFFF', fontFamily: props.cardTextFont }}>{card.artistName}</p>
                                        </div>
                                    </div>
                                    <div className="card-face card-back rounded-2xl overflow-hidden shadow-lg" style={{...props.cardBackDefaultStyle, backgroundImage: `url(${props.customCardBackBase64 || props.FALLBACK_IMAGE_DATA_URI})`, backgroundSize: props.customCardBackBase64 ? 'cover' : 'contain', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', border: `3px solid ${lightenDarkenColor(props.toolAccentColor, 40)}`}}>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    {props.revealedInPoolCount === props.currentRevealPool.length && props.currentRevealPool.length > 0 && (
                        <div className="flex justify-center pt-4">
                            <Button 
                                onClick={props.handleLogRevealedCards} 
                                disabled={props.loggedCards.length + props.currentRevealPool.length > props.maxLoggedSongsN} 
                                variant="primary"
                                size="lg"
                                startIcon={<HandRaisedIcon className="w-6 h-6" />}
                                className="shadow-2xl font-black min-w-[300px]"
                            >
                                Log All {props.currentRevealPool.length} Songs
                            </Button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );

    // --- Ranking Mode Sub-View ---
    const renderRankingMode = () => (
        <div className="my-8">
            <h3 className="text-2xl font-black text-center mb-8 tracking-tighter uppercase" style={{ color: props.toolAccentColor }}>
                Ranking Reveal <span className="opacity-50 ml-2">[{props.fullDeck.filter(c => c.isRevealed).length}/{props.fullDeck.length}]</span>
            </h3>
            <div className="flex flex-wrap justify-center gap-6 p-4">
                {props.fullDeck.map((card) => {
                    const isNextToReveal = card.rank === props.nextRankToReveal;
                    return (
                        <div key={`rank-reveal-${card.id}`} className="flex flex-col items-center animate-fadeIn">
                            <div
                                onClick={() => props.handleRankingRevealClick(card)}
                                className={`card-container w-44 h-72 rounded-2xl shadow-xl transition-all duration-500 hover:scale-105 active:scale-95 ${isNextToReveal ? 'ring-4 ring-offset-4 ring-offset-transparent animate-pulse' : ''}`}
                                style={{
                                    cursor: card.isRevealed ? 'default' : 'pointer',
                                    '--ring-color': props.toolAccentColor
                                } as any}
                            >
                                <div className="card-inner" style={card.isRevealed ? {} : { transform: 'rotateY(180deg)' }}>
                                    <div className="card-face card-front p-2 rounded-2xl text-xs flex flex-col justify-between shadow-lg border" style={{ backgroundColor: card.color || props.cardBackgroundColor, borderColor: String(props.cardBorderColor) }}>
                                        <img src={card.imageUrl || props.FALLBACK_IMAGE_DATA_URI} alt="" className="w-full h-44 object-cover rounded-xl mb-2 border-black/10" />
                                        <div className="p-2.5 rounded-xl bg-black/40 backdrop-blur-sm border border-white/10 text-center">
                                            <p className="font-black text-[11px] leading-tight uppercase tracking-tight" style={{ color: '#FFFFFF', fontFamily: props.cardTextFont }}>{card.title}</p>
                                            <p className="font-bold text-[9px] opacity-70 uppercase tracking-widest truncate" style={{ color: '#FFFFFF', fontFamily: props.cardTextFont }}>{card.artistName}</p>
                                        </div>
                                    </div>
                                    <div className="card-face card-back rounded-2xl overflow-hidden shadow-lg" style={{...props.cardBackDefaultStyle, backgroundImage: `url(${props.customCardBackBase64 || props.FALLBACK_IMAGE_DATA_URI})`, backgroundSize: props.customCardBackBase64 ? 'cover' : 'contain', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', border: `3px solid ${lightenDarkenColor(props.toolAccentColor, 40)}`}}>
                                    </div>
                                </div>
                            </div>
                            <div 
                                className="mt-4 px-4 py-1.5 rounded-full font-black text-xl shadow-md border" 
                                style={{ 
                                    backgroundColor: card.isRevealed ? props.toolAccentColor : 'transparent',
                                    color: card.isRevealed ? '#000000' : props.toolAccentColor,
                                    borderColor: props.toolAccentColor
                                }}
                            >
                                #{card.rank}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );

    if (props.pickerMode === PickerMode.Standard) return renderStandardMode();
    if (props.pickerMode === PickerMode.Reveal) return renderRevealMode();
    if (props.pickerMode === PickerMode.RankingReveal) return renderRankingMode();
    return null;
};
