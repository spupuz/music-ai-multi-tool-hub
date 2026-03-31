import React from 'react';
import InputField from '@/components/forms/InputField';
import Button from '@/components/common/Button';
import { 
    FolderPlusIcon, ArrowUturnLeftIcon, TrashIcon 
} from '@/components/Icons';
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
        <div className="space-y-6">
            {props.pickerMode !== 'rankingReveal' && (
                <details className="group" open={isLoggedSectionOpen}>
                    <summary className="text-xl font-bold cursor-pointer py-3 hover:opacity-80 transition-opacity flex items-center gap-2" style={{ color: String(props.toolAccentColor) }}>
                        <span className="group-open:rotate-90 transition-transform">▸</span>
                        Logged Songs ({props.loggedCards.length})
                    </summary>
                    {props.loggedCards.length > 0 && (
                        <div className="mt-4 space-y-4 max-h-[500px] overflow-y-auto pr-3 scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600">
                            {props.pickerMode === 'reveal' && (
                                <div 
                                    className="p-4 rounded-2xl border backdrop-blur-sm bg-opacity-10 dark:bg-opacity-20" 
                                    style={{ 
                                        backgroundColor: `${props.toolAccentColor}11`,
                                        borderColor: `${props.toolAccentColor}33`
                                    }}
                                >
                                    <InputField id="groupNameInput" label="Group Name (Optional)" value={props.currentGroupNameInput} onChange={props.setCurrentGroupNameInput} placeholder="e.g., My Awesome Picks" labelTextColor={props.toolTextColor} className="mb-4" />
                                    <div className="flex justify-center">
                                        <Button 
                                            onClick={props.handleMoveLoggedToGroup} 
                                            disabled={props.loggedCards.length === 0} 
                                            variant="primary"
                                            size="sm"
                                            startIcon={<FolderPlusIcon className="w-5 h-5"/>}
                                            className="min-w-[250px]"
                                        >
                                            Move Logged Songs to New Group
                                        </Button>
                                    </div>
                                </div>
                            )}
                            
                            <div className="flex justify-center">
                                <Button 
                                    onClick={props.handleClearAndReturnLoggedSongs} 
                                    variant="warning"
                                    size="sm"
                                    startIcon={<ArrowUturnLeftIcon />}
                                    className="min-w-[250px]"
                                >
                                    {props.getClearAndReturnLoggedSongsButtonText()}
                                </Button>
                            </div>

                            <div className="grid grid-cols-1 gap-3">
                                {props.loggedCards.map((log, index) => (
                                    <div 
                                        key={log.timestamp + index} 
                                        className="p-4 rounded-xl text-xs flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow"
                                        style={{ 
                                            backgroundColor: log.color || props.cardBackgroundColor, 
                                            border: `1px solid ${String(props.cardBorderColor)}44` 
                                        }}
                                    >
                                        <img src={log.imageUrl || props.FALLBACK_IMAGE_DATA_URI} alt={`${log.title} cover`} className="w-20 h-20 md:w-24 md:h-24 object-cover rounded-lg shadow-sm flex-shrink-0" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = props.FALLBACK_IMAGE_DATA_URI; }}/>
                                        <div className="flex-grow min-w-0">
                                            <p className="font-bold text-base break-words leading-tight" style={{ color: String(getAdjustedTextColor(log.color || props.cardBackgroundColor, props.cardTextColor)), fontFamily: props.cardTextFont }}>{log.title}</p>
                                            <p className="text-sm opacity-80" style={{ color: String(getAdjustedTextColor(log.color || props.cardBackgroundColor, props.cardTextColor)), fontFamily: props.cardTextFont }}>{log.artistName}</p>
                                            <p className="text-[10px] mt-1 opacity-60" style={{ color: String(getAdjustedTextColor(log.color || props.cardBackgroundColor, props.cardTextColor)), fontFamily: props.cardTextFont }}>Logged: {new Date(log.timestamp).toLocaleString()}</p>
                                            {log.comment && <p className="italic text-xs mt-2 p-1.5 rounded bg-black/10 dark:bg-white/10 break-words" style={{ color: String(getAdjustedTextColor(log.color || props.cardBackgroundColor, props.cardTextColor)), fontFamily: props.cardTextFont }}>{log.comment}</p>}
                                            {log.webLink && <a href={log.webLink} target="_blank" rel="noopener noreferrer" className="underline hover:opacity-75 text-[10px] mt-2 inline-block font-bold" style={{ color: String(getAdjustedTextColor(log.color || props.cardBackgroundColor, props.cardTextColor)), fontFamily: props.cardTextFont }}>SOURCE LINK ↗</a>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </details>
            )}

            {props.pickerMode === 'reveal' && props.songGroups.length > 0 && (
                <details className="group" open>
                    <summary className="text-xl font-bold cursor-pointer py-3 hover:opacity-80 transition-opacity flex items-center gap-2" style={{color: String(props.toolAccentColor)}}>
                        <span className="group-open:rotate-90 transition-transform">▸</span>
                        Song Groups ({props.songGroups.length})
                    </summary>
                    <div className="mt-4 space-y-4">
                        {props.songGroups.map(group => (
                            <div 
                                key={group.id} 
                                className="p-4 md:p-5 rounded-2xl border shadow-lg backdrop-blur-sm bg-opacity-90" 
                                style={{
                                    backgroundColor: lightenDarkenColor(props.toolBackgroundColor, props.theme === 'light' ? -10 : 15), 
                                    borderColor: `${props.toolAccentColor}66`
                                }}
                            >
                                <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
                                    <h4 className="text-lg font-bold" style={{color: props.toolTextColor}}>
                                        {group.name} 
                                        <span className="text-xs font-normal opacity-70 ml-2">({group.songs.length} / {props.maxSongsPerGroup})</span>
                                    </h4>
                                    <Button
                                        onClick={() => props.handleRemoveGroupAndReturnSongs(group.id)}
                                        variant="danger"
                                        size="xs"
                                        startIcon={<TrashIcon className="w-4 h-4"/>}
                                        className="min-w-[140px]"
                                    >
                                        {props.getRemoveGroupButtonText(group.id)}
                                    </Button>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[350px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-black/20">
                                    {group.songs.map((log, index) => (
                                        <div key={log.timestamp + index + group.id} className="p-2.5 rounded-xl text-xs flex items-center gap-3 border border-black/5 dark:border-white/5 shadow-sm" style={{ backgroundColor: log.color || props.cardBackgroundColor }}>
                                            <img src={log.imageUrl || props.FALLBACK_IMAGE_DATA_URI} alt={`${log.title} cover`} className="w-12 h-12 object-cover rounded border border-black/10 flex-shrink-0 shadow-sm" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = props.FALLBACK_IMAGE_DATA_URI; }}/>
                                            <div className="flex-grow min-w-0">
                                                <p className="font-bold text-xs truncate" style={{ color: String(getAdjustedTextColor(log.color || props.cardBackgroundColor, props.cardTextColor)), fontFamily: props.cardTextFont }}>{log.title}</p>
                                                <p className="opacity-70 truncate text-[10px]" style={{ color: String(getAdjustedTextColor(log.color || props.cardBackgroundColor, props.cardTextColor)), fontFamily: props.cardTextFont }}>{log.artistName}</p>
                                                {log.webLink && <a href={log.webLink} target="_blank" rel="noopener noreferrer" className="underline hover:opacity-75 text-[10px] font-bold mt-1 inline-block" style={{ color: String(getAdjustedTextColor(log.color || props.cardBackgroundColor, props.cardTextColor)), fontFamily: props.cardTextFont }}>LINK ↗</a>}
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
