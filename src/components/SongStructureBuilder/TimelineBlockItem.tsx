import React from 'react';
import type { SongStructureBlock, LyricLineData } from '@/types';
import { TrashIcon, DuplicateIcon, UpArrowIcon, DownArrowIcon, HistoryIcon, PlusIcon } from './Icons';

export const DropIndicator: React.FC = () => (
    <div className="h-1.5 bg-green-500 rounded-full my-1 opacity-90 transition-opacity" />
);

export interface TimelineBlockItemProps {
    block: SongStructureBlock;
    index: number;
    blockColor: string;
    dropTargetIndex: number | null;
    isLast: boolean;
    onDragOver: (e: React.DragEvent, targetIndex: number | null) => void;
    onDragStart: (e: React.DragEvent, source: 'timeline', data: { id: string, fromIndex: number }) => void;
    onDragEnd: (e: React.DragEvent) => void;
    onTypeChange: (id: string, type: string) => void;
    onBarCountChange: (id: string, countStr: string) => void;
    onDuplicateBlock: (id: string) => void;
    onRemoveBlock: (id: string) => void;
    onNotesChange: (id: string, notes: string) => void;
    onLyricTextChange: (blockId: string, lyricId: string, text: string) => void;
    onLyricTextFocus: (text: string) => void;
    onLyricTextBlur: (blockId: string, lyricId: string) => void;
    countSyllablesInLine: (text: string) => number;
    onReorderLyricLine: (blockId: string, lyricIndex: number, direction: 'up'|'down') => void;
    onInsertLyricLineAfter: (blockId: string, lyricIndex: number) => void;
    onShowHistory: (blockId: string, lyric: LyricLineData) => void;
    onDeleteLyricLine: (blockId: string, lyricId: string) => void;
    onAddLyricLine: (blockId: string) => void;
}

const TimelineBlockItem: React.FC<TimelineBlockItemProps> = ({
    block,
    index,
    blockColor,
    dropTargetIndex,
    isLast,
    onDragOver,
    onDragStart,
    onDragEnd,
    onTypeChange,
    onBarCountChange,
    onDuplicateBlock,
    onRemoveBlock,
    onNotesChange,
    onLyricTextChange,
    onLyricTextFocus,
    onLyricTextBlur,
    countSyllablesInLine,
    onReorderLyricLine,
    onInsertLyricLineAfter,
    onShowHistory,
    onDeleteLyricLine,
    onAddLyricLine
}) => {
    return (
        <div onDragOver={(e) => onDragOver(e, index)}>
            <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border-l-4 shadow-sm" style={{ borderColor: blockColor }}>
                <div className="flex justify-between items-center mb-2" draggable onDragStart={(e) => onDragStart(e, 'timeline', { id: block.id, fromIndex: index })} onDragEnd={onDragEnd}>
                    <div className="flex items-center flex-grow mr-2 text-green-700 dark:text-green-200 font-bold cursor-grab active:cursor-grabbing">
                        [
                        <input 
                            type="text"
                            value={block.type}
                            onChange={(e) => onTypeChange(block.id, e.target.value)}
                            onMouseDown={(e) => e.stopPropagation()}
                            className="font-bold text-green-700 dark:text-green-200 bg-transparent border-none focus:ring-1 focus:ring-green-500 focus:bg-gray-100 dark:focus:bg-gray-700 rounded p-0.5 w-full mx-0.5"
                            aria-label="Editable block type"
                        />
                        ]
                        <div className="flex items-center ml-2">
                            <input 
                                type="number"
                                value={block.barCount || ''}
                                onChange={(e) => onBarCountChange(block.id, e.target.value)}
                                onMouseDown={(e) => e.stopPropagation()}
                                className="w-16 p-0.5 text-sm font-normal text-center bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white"
                                placeholder="Bars"
                                aria-label="Bar count"
                            />
                            <span className="text-xs font-normal text-gray-500 dark:text-gray-400 ml-1">bars</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0"> 
                        <button onClick={() => onDuplicateBlock(block.id)} className="p-1 text-gray-400 hover:text-blue-500 dark:hover:text-blue-400" title="Duplicate Block"><DuplicateIcon /></button> 
                        <button onClick={() => onRemoveBlock(block.id)} className="p-1 text-gray-400 hover:text-red-500 dark:hover:text-red-400" title="Remove Block"><TrashIcon /></button> 
                    </div>
                </div>
                <textarea 
                    value={block.notes} 
                    onChange={(e) => onNotesChange(block.id, e.target.value)} 
                    onMouseDown={(e) => e.stopPropagation()}
                    placeholder={`Add general notes for ${block.type}...`} 
                    rows={1} 
                    className="w-full mt-1 mb-2 px-2 py-1 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-900 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-1 focus:ring-green-400 focus:border-green-400 resize-y" />
                
                {/* Lyric Management UI */}
                <div className="mt-2 space-y-1.5 border-t border-gray-200 dark:border-gray-700 pt-2">
                    {block.lyrics.map((lyric, lyricIndex) => (
                        <div key={lyric.id} className="flex items-center gap-2 group">
                            <input
                                type="text"
                                value={lyric.currentText}
                                onChange={(e) => onLyricTextChange(block.id, lyric.id, e.target.value)}
                                onFocus={() => onLyricTextFocus(lyric.currentText)}
                                onBlur={() => onLyricTextBlur(block.id, lyric.id)}
                                className="flex-grow bg-gray-50 dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md px-2 py-1 text-gray-900 dark:text-gray-100 text-sm focus:bg-white dark:focus:bg-gray-500 focus:ring-1 focus:ring-green-400"
                                placeholder="Type your lyric here..."
                            />
                            <span className="text-xs text-gray-500 dark:text-gray-400 w-16 text-right font-mono" title="Syllable Count">
                                {countSyllablesInLine(lyric.currentText)} syll
                            </span>
                            <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity space-x-0.5">
                                <button onClick={() => onReorderLyricLine(block.id, lyricIndex, 'up')} disabled={lyricIndex === 0} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed text-gray-600 dark:text-gray-300" title="Move Up"><UpArrowIcon /></button>
                                <button onClick={() => onReorderLyricLine(block.id, lyricIndex, 'down')} disabled={lyricIndex === block.lyrics.length - 1} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed text-gray-600 dark:text-gray-300" title="Move Down"><DownArrowIcon /></button>
                                <button onClick={() => onInsertLyricLineAfter(block.id, lyricIndex)} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 text-green-600 dark:text-green-400" title="Insert Line Below"><PlusIcon /></button>
                                {lyric.history.length > 0 && <button onClick={() => onShowHistory(block.id, lyric)} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 text-yellow-600 dark:text-yellow-400" title="View History"><HistoryIcon /></button>}
                                <button onClick={() => onDeleteLyricLine(block.id, lyric.id)} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 text-red-600 dark:text-red-400" title="Delete Line"><TrashIcon /></button>
                            </div>
                        </div>
                    ))}
                    {block.lyrics.length === 0 && (
                        <button onClick={() => onAddLyricLine(block.id)} className="mt-2 text-xs py-1 px-2 bg-blue-600 hover:bg-blue-500 text-white rounded-md">+ Add First Lyric Line</button>
                    )}
                </div>
            </div>
            {dropTargetIndex === index + 1 && <DropIndicator />}
            {isLast && dropTargetIndex === index + 1 && <div className="h-4"></div>} {/* Padding for last item drop indicator visual fix if needed */}
        </div>
    );
};

export default TimelineBlockItem;
