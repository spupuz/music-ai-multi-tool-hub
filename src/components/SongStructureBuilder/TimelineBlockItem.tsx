import React from 'react';
import type { SongStructureBlock, LyricLineData } from '@/types';
import { TrashIcon, DuplicateIcon, UpArrowIcon, DownArrowIcon, HistoryIcon, PlusIcon } from './Icons';
import Button from '@/components/common/Button';

export const DropIndicator: React.FC<{ uiMode?: 'classic' | 'architect' }> = ({ uiMode = 'architect' }) => (
    <div className={`h-1 ${uiMode === 'classic' ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)]' : 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]'} rounded-full my-3 opacity-100 animate-pulse`} />
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
    uiMode?: 'classic' | 'architect';
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
    onAddLyricLine,
    uiMode = 'architect'
}) => {
    return (
        <div onDragOver={(e) => onDragOver(e, index)} className="group/block relative">
            <div className={`p-6 ${uiMode === 'classic' ? 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700' : 'bg-white/5 dark:bg-black/20 backdrop-blur-xl border-white/10 shadow-xl transition-all hover:border-white/20'} rounded-2xl border border-l-[6px] active:scale-[0.99]`} style={{ borderLeftColor: blockColor }}>
                <div className="flex justify-between items-center mb-4" draggable onDragStart={(e) => onDragStart(e, 'timeline', { id: block.id, fromIndex: index })} onDragEnd={onDragEnd}>
                    <div className="flex items-center flex-grow mr-4 cursor-grab active:cursor-grabbing">
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 mr-2 opacity-50">#{(index + 1).toString().padStart(2, '0')}</span>
                        <input 
                            type="text"
                            value={block.type}
                            onChange={(e) => onTypeChange(block.id, e.target.value)}
                            onMouseDown={(e) => e.stopPropagation()}
                            className="font-black text-lg uppercase tracking-tight text-gray-900 dark:text-white bg-transparent border-none focus:ring-0 p-0 w-full"
                            aria-label="Editable block type"
                        />
                        <div className="flex items-center ml-4 bg-black/10 dark:bg-black/40 px-3 py-1.5 rounded-xl border border-white/5 group-hover:border-white/10 transition-colors">
                            <input 
                                type="number"
                                value={block.barCount || ''}
                                onChange={(e) => onBarCountChange(block.id, e.target.value)}
                                onMouseDown={(e) => e.stopPropagation()}
                                className={`w-10 p-0 text-xs font-black text-center bg-transparent border-none ${uiMode === 'classic' ? 'text-green-600 dark:text-green-400' : 'text-emerald-600 dark:text-emerald-500'} focus:ring-0`}
                                placeholder="00"
                            />
                            <span className="text-[8px] font-black uppercase tracking-widest text-gray-500 ml-1 opacity-60">Bars</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-1"> 
                        <Button onClick={() => onDuplicateBlock(block.id)} variant="ghost" size="xs" className="p-2 text-gray-500 hover:text-blue-500 hover:bg-blue-500/10 rounded-xl border-none shadow-none transition-all" title="Duplicate Block" startIcon={<DuplicateIcon className="w-4 h-4" />} /> 
                        <Button onClick={() => onRemoveBlock(block.id)} variant="ghost" size="xs" className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-xl border-none shadow-none transition-all" title="Remove Block" startIcon={<TrashIcon className="w-4 h-4" />} /> 
                    </div>
                </div>
                
                <div className="relative group/notes mb-6">
                  <textarea 
                      value={block.notes} 
                      onChange={(e) => onNotesChange(block.id, e.target.value)} 
                      onMouseDown={(e) => e.stopPropagation()}
                      placeholder={`Project notes for ${block.type}...`} 
                      rows={1} 
                      className={`w-full px-4 py-3 ${uiMode === 'classic' ? 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600' : 'bg-white/5 dark:bg-black/20 border-white/5 focus:bg-white/10'} border rounded-xl text-xs font-medium text-gray-700 dark:text-gray-300 placeholder-gray-500 focus:ring-2 ${uiMode === 'classic' ? 'focus:ring-green-500/20 focus:border-green-500' : 'focus:ring-emerald-500/20 focus:border-emerald-500'} outline-none transition-all resize-none overflow-hidden`} 
                      style={{ minHeight: '42px' }}
                      onInput={(e) => {
                        const target = e.target as HTMLTextAreaElement;
                        target.style.height = 'auto';
                        target.style.height = `${target.scrollHeight}px`;
                      }}
                  />
                </div>
                
                {/* Lyric Management UI */}
                <div className="space-y-2 relative">
                    {block.lyrics.map((lyric, lyricIndex) => (
                        <div key={lyric.id} className="flex items-center gap-3 group/lyric bg-white/5 dark:bg-black/10 p-1.5 rounded-xl border border-transparent hover:border-white/5 transition-all">
                            <div className="flex-grow relative">
                              <input
                                  type="text"
                                  value={lyric.currentText}
                                  onChange={(e) => onLyricTextChange(block.id, lyric.id, e.target.value)}
                                  onFocus={() => onLyricTextFocus(lyric.currentText)}
                                  onBlur={() => onLyricTextBlur(block.id, lyric.id)}
                                  className="w-full bg-transparent border-none px-3 py-2 text-gray-900 dark:text-gray-100 text-sm font-medium focus:ring-0 placeholder-gray-600"
                                  placeholder="Enter transmission line..."
                              />
                            </div>
                            <div className="flex items-center shrink-0">
                              <span className="text-[9px] font-black tracking-widest text-gray-500 bg-black/20 px-2.5 py-1 rounded-lg border border-white/5 opacity-50">
                                  {countSyllablesInLine(lyric.currentText)} SYLL
                              </span>
                            </div>
                            <div className="flex items-center opacity-0 group-hover/lyric:opacity-100 transition-all gap-0.5 pr-1">
                                <Button onClick={() => onReorderLyricLine(block.id, lyricIndex, 'up')} disabled={lyricIndex === 0} variant="ghost" size="xs" className="p-1.5 rounded-lg hover:bg-white/10 text-gray-500 disabled:opacity-20 border-none shadow-none transition-colors" title="Move Up" startIcon={<UpArrowIcon className="w-3 h-3" />} />
                                <Button onClick={() => onReorderLyricLine(block.id, lyricIndex, 'down')} disabled={lyricIndex === block.lyrics.length - 1} variant="ghost" size="xs" className="p-1.5 rounded-lg hover:bg-white/10 text-gray-500 disabled:opacity-20 border-none shadow-none transition-colors" title="Move Down" startIcon={<DownArrowIcon className="w-3 h-3" />} />
                                <Button onClick={() => onInsertLyricLineAfter(block.id, lyricIndex)} variant="ghost" size="xs" className="p-1.5 rounded-lg hover:bg-green-500/20 text-green-500 border-none shadow-none transition-colors" title="Insert Below" startIcon={<PlusIcon className="w-3 h-3" />} />
                                {lyric.history.length > 0 && <Button onClick={() => onShowHistory(block.id, lyric)} variant="ghost" size="xs" className="p-1.5 rounded-lg hover:bg-yellow-500/20 text-yellow-500 border-none shadow-none transition-colors" title="Vault Access" startIcon={<HistoryIcon className="w-3 h-3" />} />}
                                <Button onClick={() => onDeleteLyricLine(block.id, lyric.id)} variant="ghost" size="xs" className="p-1.5 rounded-lg hover:bg-red-500/20 text-red-500 border-none shadow-none transition-colors" title="Erase Line" startIcon={<TrashIcon className="w-3 h-3" />} />
                            </div>
                        </div>
                    ))}
                    {block.lyrics.length === 0 && (
                        <Button 
                          onClick={() => onAddLyricLine(block.id)} 
                          variant="ghost"
                          className="w-full py-3 px-4 text-[10px] font-black uppercase tracking-widest text-blue-500 bg-blue-500/5 hover:bg-blue-500/10 border border-dashed border-blue-500/20 rounded-xl transition-all shadow-none"
                        >
                          + Initialize Lyrics
                        </Button>
                    )}
                </div>
            </div>
            {dropTargetIndex === index + 1 && <DropIndicator uiMode={uiMode} />}
            {isLast && dropTargetIndex === index + 1 && <div className="h-6"></div>}
        </div>
    );
};

export default TimelineBlockItem;
