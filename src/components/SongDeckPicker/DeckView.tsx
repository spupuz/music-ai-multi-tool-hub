import React from 'react';
import Spinner from '@/components/Spinner';
import { 
    ArrowDownIcon, EyeOpenIcon, HandRaisedIcon 
} from '@/tools/SongDeckPicker/songDeckPicker.icons';
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
    const renderStandardMode = () => (
        <>
            {props.drawnCardsForSelection && props.drawnCardsForSelection.length > 0 && props.animatedSelectionStage !== 'idle' && (
                <div className="my-4 p-4 rounded-lg" style={{ backgroundColor: String(lightenDarkenColor(props.toolBackgroundColor, props.theme === 'light' ? -10 : 15)), border: `1px solid ${String(props.toolAccentColor)}`}}>
                    <div className="flex flex-wrap justify-center items-start gap-2">
                        {props.drawnCardsForSelection.map((card, index) => (
                            <div key={`animated-card-wrapper-${card.id}`} className="flex flex-col items-center w-44 flex-shrink-0">
                                <div className="relative h-16 w-full flex justify-center items-center">
                                    <ArrowDownIcon style={{ color: props.toolAccentColor, opacity: props.arrowPositionIndex === index ? 1 : 0 }} className={`w-12 h-12 ${props.arrowPositionIndex === index ? 'animate-flash' : ''}`} />
                                </div>
                                <div className="p-1.5 rounded text-xs flex flex-col justify-between min-h-72 border w-full" style={props.getCardStyleForAnimation(card, index)}>
                                    <img src={card.imageUrl || props.FALLBACK_IMAGE_DATA_URI} alt="" className="w-full h-48 object-cover rounded-sm mb-1 border" style={{borderColor: props.cardBorderColor}} />
                                    <div className={`flex-grow flex flex-col justify-end items-center p-0 w-full`}>
                                        <div className={`text-center w-full p-1 min-w-0 ${card.imageUrl ? 'bg-black bg-opacity-50 rounded-b-sm' : ''}`}>
                                            <p className="font-semibold break-words line-clamp-2" style={{ color: String(getAdjustedTextColor(card.imageUrl ? '#000000' : (card.color || props.cardBackgroundColor), props.cardTextColor)), fontFamily: props.cardTextFont, fontSize: '10px' }}>{card.title}</p>
                                            <p className="break-words line-clamp-1" style={{ color: lightenDarkenColor(getAdjustedTextColor(card.imageUrl ? '#000000' : (card.color || props.cardBackgroundColor), props.cardTextColor), getAdjustedTextColor(card.imageUrl ? '#000000' : (card.color || props.cardBackgroundColor), props.cardTextColor) === '#FFFFFF' ? -30 : 30), fontFamily: props.cardTextFont, fontSize: '9px' }}>{card.artistName}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    {props.statusMessage && (props.animatedSelectionStage === 'animatingArrow' || props.animatedSelectionStage === 'arrowLanded') && ( <p className="text-center mt-3 text-sm" style={{ color: String(props.toolAccentColor) }}>{props.statusMessage}</p> )}
                </div>
            )}
        </>
    );

    // --- Reveal Mode Sub-View ---
    const renderRevealMode = () => (
        <div className="my-4">
            {!props.isRevealRoundActive && (
                <button onClick={props.handlePrepareRevealRound} disabled={props.isLoading || props.isPickingRandomCard || props.unloggedDeckForDisplay.length === 0 || props.loggedCards.length >= props.maxLoggedSongsN} className="mx-auto flex items-center justify-center py-1 px-2.5 text-xs bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg shadow-md disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:text-gray-500 dark:disabled:text-gray-400 transition-colors">
                    <EyeOpenIcon className="mr-2"/> Prepare Reveal Round ({props.drawnCardsForSelection?.length || 5} cards)
                </button>
            )}
            {props.isRevealRoundActive && (
                <div className="space-y-3">
                    <button onClick={props.handleRevealNextCard} disabled={props.revealedInPoolCount >= props.currentRevealPool.length} className="mx-auto flex items-center justify-center py-0.5 px-1.5 text-[10px] leading-tight bg-yellow-500 hover:bg-yellow-600 text-black font-semibold rounded-md disabled:opacity-50">
                        <EyeOpenIcon className="mr-2"/> Reveal Next Card ({props.revealedInPoolCount}/{props.currentRevealPool.length})
                    </button>
                    <div className="flex flex-wrap justify-center gap-3 p-3 rounded-lg" style={{ backgroundColor: String(lightenDarkenColor(props.toolBackgroundColor, props.theme === 'light' ? -10 : 15)), border: `1px solid ${String(props.toolAccentColor)}`}}>
                        {props.currentRevealPool.map((card, index) => (
                            <div key={`reveal-${card.id}-${index}`} className={`card-container w-44 h-72 p-1.5 rounded border`} style={card.isRevealed ? {backgroundColor: card.color || props.cardBackgroundColor, borderColor: String(props.cardBorderColor)} : {}}>
                                <div className="card-inner" style={card.isRevealed ? {} : {transform: 'rotateY(180deg)'}}>
                                    <div className="card-face card-front p-1.5 rounded text-xs flex flex-col justify-between min-h-72 border w-full" style={{backgroundColor: card.color || props.cardBackgroundColor, borderColor: String(props.cardBorderColor)}}>
                                        <img src={card.imageUrl || props.FALLBACK_IMAGE_DATA_URI} alt="" className="w-full h-48 object-cover rounded-sm mb-1 border" style={{borderColor: props.cardBorderColor}} />
                                        <div className={`flex-grow flex flex-col justify-end items-center p-0 w-full`}> 
                                            <div className={`text-center w-full p-1 min-w-0 ${card.imageUrl ? 'bg-black bg-opacity-50' : ''}`}>
                                                <p className="font-semibold line-clamp-2 break-words" style={{ color: String(getAdjustedTextColor(card.imageUrl ? '#000000' : (card.color || props.cardBackgroundColor), props.cardTextColor)), fontFamily: props.cardTextFont, fontSize: '10px' }}>{card.title}</p>
                                                <p className="line-clamp-1 break-words" style={{ color: String(lightenDarkenColor(getAdjustedTextColor(card.imageUrl ? '#000000' : (card.color || props.cardBackgroundColor), props.cardTextColor), getAdjustedTextColor(card.imageUrl ? '#000000' : (card.color || props.cardBackgroundColor), props.cardTextColor) === '#FFFFFF' ? -30 : 30)), fontFamily: props.cardTextFont, fontSize: '9px' }}>{card.artistName}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="card-face card-back" style={{...props.cardBackDefaultStyle, backgroundImage: `url(${props.customCardBackBase64 || props.FALLBACK_IMAGE_DATA_URI})`, backgroundSize: props.customCardBackBase64 ? 'cover' : 'contain', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', border: `2px solid ${lightenDarkenColor(props.toolAccentColor, 40)}`}}>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    {props.revealedInPoolCount === props.currentRevealPool.length && props.currentRevealPool.length > 0 && (
                        <button onClick={props.handleLogRevealedCards} disabled={props.loggedCards.length + props.currentRevealPool.length > props.maxLoggedSongsN} className="mx-auto flex items-center justify-center py-1 px-2.5 text-xs bg-green-500 hover:bg-green-600 text-black font-semibold rounded-md disabled:opacity-50">
                            <HandRaisedIcon className="mr-2"/> Log All {props.currentRevealPool.length} Revealed Cards
                        </button>
                    )}
                </div>
            )}
        </div>
    );

    // --- Ranking Mode Sub-View ---
    const renderRankingMode = () => (
        <div className="my-4">
            <h3 className="text-xl font-bold text-center mb-4" style={{ color: props.toolAccentColor }}>
                Ranking Reveal ({props.fullDeck.filter(c => c.isRevealed).length} / {props.fullDeck.length} Revealed)
            </h3>
            <div className="flex flex-wrap justify-center gap-4 p-3">
                {props.fullDeck.map((card) => {
                    const isNextToReveal = card.rank === props.nextRankToReveal;
                    return (
                        <div key={`rank-reveal-${card.id}`} className="flex flex-col items-center">
                            <div
                                onClick={() => props.handleRankingRevealClick(card)}
                                className={`card-container w-44 h-72 p-1 rounded-lg border-2 transition-all duration-300 ${isNextToReveal ? 'animate-pulse-border' : ''}`}
                                style={{
                                    borderColor: isNextToReveal ? '#FBBF24' : 'transparent',
                                    cursor: card.isRevealed ? 'default' : 'pointer',
                                }}
                            >
                                <div className="card-inner" style={card.isRevealed ? {} : { transform: 'rotateY(180deg)' }}>
                                    <div className="card-face card-front p-1.5 rounded text-xs flex flex-col justify-between h-full border" style={{ backgroundColor: card.color || props.cardBackgroundColor, borderColor: String(props.cardBorderColor) }}>
                                        <img src={card.imageUrl || props.FALLBACK_IMAGE_DATA_URI} alt="" className="w-full h-48 object-cover rounded-sm mb-1 border" style={{borderColor: props.cardBorderColor}} />
                                        <div className={`flex-grow flex flex-col justify-end items-center p-0 w-full`}> 
                                            <div className={`text-center w-full p-1 min-w-0 ${card.imageUrl ? 'bg-black bg-opacity-50' : ''}`}>
                                                <p className="font-semibold line-clamp-2 break-words" style={{ color: String(getAdjustedTextColor(card.imageUrl ? '#000000' : (card.color || props.cardBackgroundColor), props.cardTextColor)), fontFamily: props.cardTextFont, fontSize: '10px' }}>{card.title}</p>
                                                <p className="line-clamp-1 break-words" style={{ color: String(lightenDarkenColor(getAdjustedTextColor(card.imageUrl ? '#000000' : (card.color || props.cardBackgroundColor), props.cardTextColor), getAdjustedTextColor(card.imageUrl ? '#000000' : (card.color || props.cardBackgroundColor), props.cardTextColor) === '#FFFFFF' ? -30 : 30)), fontFamily: props.cardTextFont, fontSize: '9px' }}>{card.artistName}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="card-face card-back" style={{...props.cardBackDefaultStyle, backgroundImage: `url(${props.customCardBackBase64 || props.FALLBACK_IMAGE_DATA_URI})`, backgroundSize: props.customCardBackBase64 ? 'cover' : 'contain', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', border: `2px solid ${lightenDarkenColor(props.toolAccentColor, 40)}`}}>
                                    </div>
                                </div>
                            </div>
                            <p className="mt-2 text-lg font-bold" style={{ color: props.toolAccentColor }}>#{card.rank}</p>
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
