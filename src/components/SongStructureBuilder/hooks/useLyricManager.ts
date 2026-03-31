import { useState, Dispatch, SetStateAction } from 'react';
import { SongStructureBlock, LyricLineData } from '../../../../types';
import { TOOL_CATEGORY } from '../constants';

export function useLyricManager(
    arrangement: SongStructureBlock[],
    setArrangement: Dispatch<SetStateAction<SongStructureBlock[]>>,
    trackLocalEvent: (category: string, action: string, label?: string, value?: number) => void
) {
    const [editingLineOriginalText, setEditingLineOriginalText] = useState<string | null>(null);
    const [historyModalOpen, setHistoryModalOpen] = useState(false);
    const [historyModalContent, setHistoryModalContent] = useState<{ blockId: string; line: LyricLineData } | null>(null);

    const handleAddLyricLine = (blockId: string) => {
        const newLine: LyricLineData = { id: `lyric-${Date.now()}-${Math.random()}`, currentText: '', history: [] };
        setArrangement(prev => prev.map(block =>
            block.id === blockId ? { ...block, lyrics: [...block.lyrics, newLine] } : block
        ));
        trackLocalEvent(TOOL_CATEGORY, 'lyricLineAdded');
    };
    
    const handleInsertLyricLineAfter = (blockId: string, afterIndex: number) => {
        const newLine: LyricLineData = { id: `lyric-${Date.now()}-${Math.random()}`, currentText: '', history: [] };
        setArrangement(prev => prev.map(block => {
            if (block.id !== blockId) return block;
    
            const newLyrics = [...block.lyrics];
            newLyrics.splice(afterIndex + 1, 0, newLine);
            
            return { ...block, lyrics: newLyrics };
        }));
        trackLocalEvent(TOOL_CATEGORY, 'lyricLineInsertedAfter');
    };

    const handleLyricTextChange = (blockId: string, lineId: string, newText: string) => {
        setArrangement(prev => prev.map(block =>
            block.id === blockId ? {
                ...block,
                lyrics: block.lyrics.map(lyric =>
                    lyric.id === lineId ? { ...lyric, currentText: newText } : lyric
                )
            } : block
        ));
    };

    const handleLyricTextFocus = (originalText: string) => {
        setEditingLineOriginalText(originalText);
    };

    const handleLyricTextBlur = (blockId: string, lineId: string) => {
        const currentBlock = arrangement.find(b => b.id === blockId);
        const currentLine = currentBlock?.lyrics.find(l => l.id === lineId);
    
        if (currentLine && editingLineOriginalText !== null && currentLine.currentText !== editingLineOriginalText && editingLineOriginalText.trim() !== "") {
            setArrangement(prev => prev.map(block => {
                if (block.id === blockId) {
                    return {
                        ...block,
                        lyrics: block.lyrics.map(lyric => 
                            lyric.id === lineId ? { ...lyric, history: [...lyric.history, editingLineOriginalText] } : lyric
                        )
                    };
                }
                return block;
            }));
        }
        setEditingLineOriginalText(null);
    };

    const handleDeleteLyricLine = (blockId: string, lineId: string) => {
        setArrangement(prev => prev.map(block => 
            block.id === blockId ? { ...block, lyrics: block.lyrics.filter(lyric => lyric.id !== lineId) } : block
        ));
        trackLocalEvent(TOOL_CATEGORY, 'lyricLineDeleted');
    };

    const handleReorderLyricLine = (blockId: string, lineIndex: number, direction: 'up' | 'down') => {
        setArrangement(prev => prev.map(block => {
            if (block.id !== blockId) return block;
            const newLyrics = [...block.lyrics];
            const targetIndex = direction === 'up' ? lineIndex - 1 : lineIndex + 1;
            if (targetIndex < 0 || targetIndex >= newLyrics.length) return block;
            const [movedItem] = newLyrics.splice(lineIndex, 1);
            newLyrics.splice(targetIndex, 0, movedItem);
            return { ...block, lyrics: newLyrics };
        }));
        trackLocalEvent(TOOL_CATEGORY, 'lyricLineReordered');
    };

    const handleShowHistory = (blockId: string, line: LyricLineData) => {
        setHistoryModalContent({ blockId, line });
        setHistoryModalOpen(true);
    };

    const handleRevertToVersion = (versionText: string) => {
        if (!historyModalContent) return;
        const { blockId, line } = historyModalContent;
        handleLyricTextChange(blockId, line.id, versionText);
        setHistoryModalOpen(false);
        setHistoryModalContent(null);
        trackLocalEvent(TOOL_CATEGORY, 'lyricVersionReverted');
    };

    return {
        historyModalOpen,
        setHistoryModalOpen,
        historyModalContent,
        handleAddLyricLine,
        handleInsertLyricLineAfter,
        handleLyricTextChange,
        handleLyricTextFocus,
        handleLyricTextBlur,
        handleDeleteLyricLine,
        handleReorderLyricLine,
        handleShowHistory,
        handleRevertToVersion
    };
}
