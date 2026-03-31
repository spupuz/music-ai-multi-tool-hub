import React from 'react';
import TextAreaField from '@/components/forms/TextAreaField';
import Button from '@/components/common/Button';
import { PlusCircleIcon, TrashIcon, ArrowUturnLeftIcon, RefreshIcon } from '@/components/Icons';
import { lightenDarkenColor } from '@/utils/imageUtils';

interface DeckControlsProps {
    showInputs: boolean;
    toolBackgroundColor: string;
    toolAccentColor: string;
    toolTextColor: string;
    theme: string;
    rawSongInput: string;
    setRawSongInput: (val: string) => void;
    rawBonusArtistsInput: string;
    setRawBonusArtistsInput: (val: string) => void;
    isLoading: boolean;
    isPickingRandomCard: boolean;
    buildDeck: () => void;
    handleApplyBonuses: () => void;
    handleClearDeck: () => void;
    handleClearAllInputs: () => void;
    handleClearSongInfoCache: () => void;
    getClearSongInfoCacheButtonText: () => string;
    clearSongInfoCacheStatus: string;
    fetchProgressMessage: string;
    error: string | null;
    statusMessage: string;
    animatedSelectionStage: string;
    getAdjustedTextColorForContrast: (bg: string, pref?: string) => string;
}

export const DeckControls: React.FC<DeckControlsProps> = ({
    showInputs,
    toolBackgroundColor,
    toolAccentColor,
    toolTextColor,
    theme,
    rawSongInput,
    setRawSongInput,
    rawBonusArtistsInput,
    setRawBonusArtistsInput,
    isLoading,
    isPickingRandomCard,
    buildDeck,
    handleApplyBonuses,
    handleClearDeck,
    handleClearAllInputs,
    handleClearSongInfoCache,
    getClearSongInfoCacheButtonText,
    clearSongInfoCacheStatus,
    fetchProgressMessage,
    error,
    statusMessage,
    animatedSelectionStage,
    getAdjustedTextColorForContrast
}) => {
    if (!showInputs) return null;

    const containerBg = String(lightenDarkenColor(toolBackgroundColor, theme === 'light' ? -5 : 10));

    return (
        <div 
            className="mb-6 p-4 md:p-6 rounded-2xl shadow-xl border backdrop-blur-sm bg-opacity-90" 
            style={{ 
                borderColor: `${toolAccentColor}44`, 
                backgroundColor: containerBg,
                boxShadow: `0 10px 25px -5px ${toolAccentColor}22`
            }}
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <TextAreaField 
                    id="rawSongInput" 
                    label="Song Entries (1 per line)" 
                    value={rawSongInput} 
                    onChange={setRawSongInput} 
                    placeholder="Suno/Riffusion/Producer.AI URL, Suno Playlist URL, or ArtistName: Artist | Title: Title | ..." 
                    labelTextColor={toolTextColor} 
                />
                <TextAreaField 
                    id="rawBonusArtistsInput" 
                    label="Bonus Artists (1 per line, case-insensitive)" 
                    value={rawBonusArtistsInput} 
                    onChange={setRawBonusArtistsInput} 
                    placeholder="Artist Name" 
                    labelTextColor={toolTextColor} 
                />
            </div>

            <div className="mt-6 flex flex-wrap justify-center gap-4">
                <Button 
                    onClick={buildDeck} 
                    loading={isLoading} 
                    disabled={isPickingRandomCard}
                    backgroundColor={toolAccentColor}
                    textColor={getAdjustedTextColorForContrast(toolAccentColor, toolTextColor)}
                    startIcon={<PlusCircleIcon className="w-5 h-5" />}
                    className="min-w-[220px]"
                >
                    Build/Rebuild Deck
                </Button>
                <Button 
                    onClick={handleApplyBonuses} 
                    loading={isLoading}
                    disabled={isPickingRandomCard || !rawBonusArtistsInput.trim()}
                    backgroundColor={toolAccentColor}
                    textColor={getAdjustedTextColorForContrast(toolAccentColor, toolTextColor)}
                    startIcon={<PlusCircleIcon className="w-5 h-5" />}
                    className="min-w-[220px]"
                >
                    Apply Bonuses & Rebuild
                </Button>
            </div>

            <div className="mt-4 flex flex-wrap justify-center gap-3">
                <Button 
                    variant="danger" 
                    size="sm" 
                    onClick={handleClearDeck} 
                    startIcon={<TrashIcon />}
                    className="min-w-[150px]"
                >
                    Clear Current Deck
                </Button>
                <Button 
                    variant="danger" 
                    size="sm" 
                    onClick={handleClearAllInputs} 
                    startIcon={<ArrowUturnLeftIcon />}
                    className="min-w-[150px]"
                >
                    Clear All Inputs
                </Button>
                <Button 
                    variant="warning" 
                    size="sm" 
                    onClick={handleClearSongInfoCache} 
                    startIcon={<RefreshIcon className="w-3.5 h-3.5" />}
                    className="min-w-[150px] font-bold uppercase tracking-widest shadow-sm"
                    aria-label={getClearSongInfoCacheButtonText()}
                >
                    {getClearSongInfoCacheButtonText()}
                </Button>
            </div>

            {clearSongInfoCacheStatus && <p className="text-xs text-center mt-3 font-medium opacity-80" style={{color: toolTextColor}}>{clearSongInfoCacheStatus}</p>}
            {fetchProgressMessage && <p className="text-xs mt-3 text-center animate-pulse font-medium" style={{color: toolAccentColor}}>{fetchProgressMessage}</p>}
            {error && <p className="text-sm text-red-500 mt-3 text-center font-bold">{error}</p>}
            
            {statusMessage && animatedSelectionStage !== 'animatingArrow' && animatedSelectionStage !== 'arrowLanded' && ( 
                <div className="text-lg font-bold mt-4 text-center p-2 rounded-lg bg-opacity-10 bg-white" style={{color: toolAccentColor}}>
                    {statusMessage.split('\n').map((line, index) => (
                        <React.Fragment key={index}>
                            {line}
                            {index < statusMessage.split('\n').length - 1 && <br />}
                        </React.Fragment>
                    ))}
                </div>
            )}
        </div>
    );
};
