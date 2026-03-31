import React from 'react';
import TextAreaField from '@/components/forms/TextAreaField';
import Spinner from '@/components/Spinner';
import { PlusCircleIcon } from '@/tools/SongDeckPicker/songDeckPicker.icons';
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

    return (
        <div className="mb-4 p-3 md:p-4 rounded-lg shadow-lg border" style={{ borderColor: String(toolAccentColor), backgroundColor: String(lightenDarkenColor(toolBackgroundColor, theme === 'light' ? -5 : 10)) }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextAreaField id="rawSongInput" label="Song Entries (1 per line)" value={rawSongInput} onChange={setRawSongInput} placeholder="Suno/Riffusion/Producer.AI URL, Suno Playlist URL, or ArtistName: Artist | Title: Title | ..." labelTextColor={toolTextColor} />
                <TextAreaField id="rawBonusArtistsInput" label="Bonus Artists (1 per line, case-insensitive)" value={rawBonusArtistsInput} onChange={setRawBonusArtistsInput} placeholder="Artist Name" labelTextColor={toolTextColor} />
            </div>
            <div className="mt-3 flex flex-col sm:flex-row gap-2 text-sm">
                <button onClick={buildDeck} disabled={isLoading || isPickingRandomCard} className="flex-1 py-2 px-3 rounded-md font-semibold text-black flex items-center justify-center" style={{backgroundColor: String(toolAccentColor), color: String(getAdjustedTextColorForContrast(toolAccentColor, toolTextColor))}}> {isLoading ? <Spinner size="w-4 h-4 mr-2" color="text-black" /> : <PlusCircleIcon />} Build/Rebuild Deck </button>
                <button onClick={handleApplyBonuses} disabled={isLoading || isPickingRandomCard || !rawBonusArtistsInput.trim()} className="flex-1 py-2 px-3 rounded-md font-semibold text-black flex items-center justify-center disabled:opacity-60" style={{backgroundColor: String(toolAccentColor), color: String(getAdjustedTextColorForContrast(toolAccentColor, toolTextColor))}}><PlusCircleIcon /> Apply Bonuses & Rebuild</button>
            </div>
            <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <button onClick={handleClearDeck} className="flex-1 py-1 px-2 bg-red-700 hover:bg-red-600 text-white rounded">Clear Current Deck</button>
                <button onClick={handleClearAllInputs} className="flex-1 py-1 px-2 bg-red-700 hover:bg-red-600 text-white rounded">Clear All Inputs</button>
                <button 
                    onClick={handleClearSongInfoCache} 
                    className="flex-1 py-1 px-2 bg-orange-600 hover:bg-orange-500 text-white rounded"
                    aria-label={getClearSongInfoCacheButtonText()}
                >
                    {getClearSongInfoCacheButtonText()}
                </button>
            </div>
            {clearSongInfoCacheStatus && <p className="text-xs text-center mt-1" style={{color: String(toolTextColor)}}>{clearSongInfoCacheStatus}</p>}
            {fetchProgressMessage && <p className="text-xs mt-2 text-center" style={{color: String(toolTextColor)}}>{fetchProgressMessage}</p>}
            {error && <p className="text-xs text-red-400 mt-2 text-center">{error}</p>}
            {statusMessage && animatedSelectionStage !== 'animatingArrow' && animatedSelectionStage !== 'arrowLanded' && ( 
                <div className="text-lg font-semibold mt-2 text-center" style={{color: String(toolAccentColor)}}>
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
