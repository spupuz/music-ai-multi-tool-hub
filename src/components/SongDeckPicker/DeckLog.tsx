import React from 'react';
import InputField from '@/components/forms/InputField';
import { 
    FolderPlusIcon, ArrowUturnLeftIcon, TrashIcon 
} from '@/tools/SongDeckPicker/songDeckPicker.icons';
import { lightenDarkenColor, getAdjustedTextColor } from '@/utils/imageUtils';
import { PickedSongLogEntry, SongGroup } from '@/types';

interface DeckLogProps {
    loggedCards: PickedSongLogEntry[];
    maxLoggedSongsN: number;
    isPickingRandomCard: boolean;
    animatedSelectionStage: string;
    pickerMode: string;
    currentGroupNameInput: string;
    setCurrentGroupNameInput: (val: string) => void;
    toolTextColor: string;
    handleMoveLoggedToGroup: () => void;
    handleClearAndReturnLoggedSongs: () => void;
    getClearAndReturnLoggedSongsButtonText: () => string;
    cardBackgroundColor: string;
    cardBorderColor: string;
    cardTextColor: string;
    cardTextFont: string;
    FALLBACK_IMAGE_DATA_URI: string;
    songGroups: SongGroup[];
    toolBackgroundColor: string;
    theme: string;
    toolAccentColor: string;
    handleRemoveGroupAndReturnSongs: (id: string) => void;
    getRemoveGroupButtonText: (id: string) => string;
    maxSongsPerGroup: number;
    getAdjustedTextColorForContrast?: (backgroundColorHex: string, preferredTextColorHex?: string) => string;
}

export const DeckLog: React.FC<DeckLogProps> = (props) => {
    const isLoggedSectionOpen = (props.loggedCards.length > 0 && !props.isPickingRandomCard && props.animatedSelectionStage === 'idle') || (props.loggedCards.length >= props.maxLoggedSongsN);

    return (
        <div className="space-y-4">
            {props.pickerMode !== 'rankingReveal' && (
                <details className="mb-4" open={isLoggedSectionOpen}>
                    <summary className="text-lg font-semibold cursor-pointer py-2 hover:opacity-80" style={{ color: String(props.toolAccentColor) }}>Logged Songs ({props.loggedCards.length})</summary>
                    {props.loggedCards.length > 0 && (
                        <div className="mt-2 space-y-2 max-h-96 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600">
                            {props.pickerMode === 'reveal' && (
                                <div className="my-3 p-3 bg-gray-100 dark:bg-gray-800 rounded-md border border-gray-300 dark:border-gray-600">
                                    <InputField id="groupNameInput" label="Group Name (Optional)" value={props.currentGroupNameInput} onChange={props.setCurrentGroupNameInput} placeholder="e.g., My Awesome Picks" labelTextColor={props.toolTextColor} className="mb-2" />
                                    <button onClick={props.handleMoveLoggedToGroup} disabled={props.loggedCards.length === 0} className="w-full py-1.5 px-3 bg-purple-600 hover:bg-purple-500 text-white rounded-md text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-1.5">
                                        <FolderPlusIcon className="w-4 h-4"/> Move Logged Songs to New Group
                                    </button>
                                </div>
                            )}
                            <button onClick={props.handleClearAndReturnLoggedSongs} className="w-full py-1.5 px-3 mb-2 bg-orange-600 hover:bg-orange-500 text-white rounded-md text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-1.5">
                                <ArrowUturnLeftIcon className="w-4 h-4"/> {props.getClearAndReturnLoggedSongsButtonText()}
                            </button>
                            {props.loggedCards.map((log, index) => (
                                <div 
                                    key={log.timestamp + index} 
                                    className="p-3 rounded-md text-xs flex items-start gap-3"
                                    style={{ backgroundColor: log.color || props.cardBackgroundColor, border: `1px solid ${String(props.cardBorderColor)}` }}
                                >
                                    <img src={log.imageUrl || props.FALLBACK_IMAGE_DATA_URI} alt={`${log.title} cover`} className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-md border border-gray-500 flex-shrink-0" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = props.FALLBACK_IMAGE_DATA_URI; }}/>
                                    <div className="flex-grow">
                                        <p className="font-semibold text-sm break-words" style={{ color: String(getAdjustedTextColor(log.color || props.cardBackgroundColor, props.cardTextColor)), fontFamily: props.cardTextFont }}>{log.title} - {log.artistName}</p>
                                        <p className="text-gray-500 dark:text-gray-400 text-xs" style={{ color: String(lightenDarkenColor(getAdjustedTextColor(log.color || props.cardBackgroundColor, props.cardTextColor), getAdjustedTextColor(log.color || props.cardBackgroundColor, props.cardTextColor) === '#FFFFFF' ? -40 : 40)), fontFamily: props.cardTextFont }}>Logged: {new Date(log.timestamp).toLocaleString()}</p>
                                        {log.comment && <p className="italic text-gray-600 dark:text-gray-400 text-xs mt-1 break-words" style={{ color: String(lightenDarkenColor(getAdjustedTextColor(log.color || props.cardBackgroundColor, props.cardTextColor), getAdjustedTextColor(log.color || props.cardBackgroundColor, props.cardTextColor) === '#FFFFFF' ? -20 : 20)), fontFamily: props.cardTextFont }}>Comment: {log.comment}</p>}
                                        {log.webLink && <a href={log.webLink} target="_blank" rel="noopener noreferrer" className="underline hover:opacity-75 text-xs mt-1 inline-block break-all" style={{ color: String(getAdjustedTextColor(log.color || props.cardBackgroundColor, props.cardTextColor)), fontFamily: props.cardTextFont }}>Source Link</a>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </details>
            )}

            {props.pickerMode === 'reveal' && props.songGroups.length > 0 && (
                <details className="mb-4" open>
                    <summary className="text-lg font-semibold cursor-pointer py-2 hover:opacity-80" style={{color: String(props.toolAccentColor)}}>Created Song Groups ({props.songGroups.length})</summary>
                    <div className="mt-2 space-y-3">
                        {props.songGroups.map(group => (
                            <div key={group.id} className="p-3 rounded-lg border" style={{backgroundColor: lightenDarkenColor(props.toolBackgroundColor, props.theme === 'light' ? -10 : 15), borderColor: String(props.toolAccentColor)}}>
                                <div className="flex justify-between items-center mb-2">
                                    <h4 className="text-md font-semibold" style={{color: props.toolTextColor}}>{group.name} <span className="text-xs font-normal">({group.songs.length} / {props.maxSongsPerGroup} songs)</span></h4>
                                    <button
                                        onClick={() => props.handleRemoveGroupAndReturnSongs(group.id)}
                                        className="p-1.5 bg-red-600 hover:bg-red-500 text-white rounded-md text-xs flex items-center gap-1"
                                    >
                                        <TrashIcon className="w-3 h-3"/> {props.getRemoveGroupButtonText(group.id)}
                                    </button>
                                </div>
                                <div className="space-y-2 max-h-80 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600">
                                    {group.songs.map((log, index) => (
                                        <div key={log.timestamp + index + group.id} className="p-2 rounded-md text-xs flex items-start gap-2" style={{ backgroundColor: log.color || props.cardBackgroundColor, border: `1px solid ${String(props.cardBorderColor)}` }}>
                                            <img src={log.imageUrl || props.FALLBACK_IMAGE_DATA_URI} alt={`${log.title} cover`} className="w-12 h-12 object-cover rounded border border-gray-500 flex-shrink-0" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = props.FALLBACK_IMAGE_DATA_URI; }}/>
                                            <div className="flex-grow min-w-0">
                                                <p className="font-semibold text-xs break-words truncate" style={{ color: String(getAdjustedTextColor(log.color || props.cardBackgroundColor, props.cardTextColor)), fontFamily: props.cardTextFont }}>{log.title} - {log.artistName}</p>
                                                <p className="text-gray-500 dark:text-gray-400 text-[10px]" style={{ color: String(lightenDarkenColor(getAdjustedTextColor(log.color || props.cardBackgroundColor, props.cardTextColor), getAdjustedTextColor(log.color || props.cardBackgroundColor, props.cardTextColor) === '#FFFFFF' ? -40 : 40)), fontFamily: props.cardTextFont }}>Logged: {new Date(log.timestamp).toLocaleDateString()}</p>
                                                {log.webLink && <a href={log.webLink} target="_blank" rel="noopener noreferrer" className="underline hover:opacity-75 text-[10px] mt-0.5 inline-block break-all" style={{ color: String(getAdjustedTextColor(log.color || props.cardBackgroundColor, props.cardTextColor)), fontFamily: props.cardTextFont }}>Source</a>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </details>
            )}
        </div>
    );
};
