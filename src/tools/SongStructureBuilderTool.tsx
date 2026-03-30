
import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import type { ToolProps } from '../../Layout';
import type { SongStructureBlock, SavedArrangement, LyricLineData } from '../../types';
import { countSyllablesInLine } from '../../utils/lyricUtils';
import InputField from '../../components/forms/InputField';


import { TOOL_CATEGORY, LOCAL_STORAGE_CURRENT_WORK_KEY, LOCAL_STORAGE_SAVED_ARRANGEMENTS_KEY, LOCAL_STORAGE_TIMELINE_HEIGHT_KEY, DEFAULT_TIMELINE_HEIGHT_PX, MIN_TIMELINE_HEIGHT_PX, MAX_TIMELINE_HEIGHT_PX, predefinedBlockTypes, arrangementTemplates } from '../components/SongStructureBuilder/constants';
import { CopyIcon, SaveIcon, LoadIcon, InfoIcon } from '../components/SongStructureBuilder/Icons';
import { escapeCsvField, guessBarCount } from '../components/SongStructureBuilder/utils';
import SaveArrangementModal from '../components/SongStructureBuilder/SaveArrangementModal';
import LoadArrangementModal from '../components/SongStructureBuilder/LoadArrangementModal';
import ImportExportModal from '../components/SongStructureBuilder/ImportExportModal';
import LyricHistoryModal from '../components/SongStructureBuilder/LyricHistoryModal';
import StructurePalette from '../components/SongStructureBuilder/StructurePalette';
import TimelineBlockItem, { DropIndicator } from '../components/SongStructureBuilder/TimelineBlockItem';


const SongStructureBuilderTool: React.FC<ToolProps> = ({ trackLocalEvent }) => {
    const [arrangement, setArrangement] = useState<SongStructureBlock[]>([]);
    const [songTitle, setSongTitle] = useState('');
    const [tags, setTags] = useState('');
    const [bpm, setBpm] = useState(120);
    const [beatsPerBar, setBeatsPerBar] = useState(4);
    const [customBlockName, setCustomBlockName] = useState('');
    const [outputPrompt, setOutputPrompt] = useState('');
    const [copyStatus, setCopyStatus] = useState('');
    const [statusMessage, setStatusMessage] = useState('');
    const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null);
    const importFileRef = useRef<HTMLInputElement>(null);
    const [pastedImportText, setPastedImportText] = useState(''); // New state for pasted text

    const [blockTypeColors, setBlockTypeColors] = useState<Record<string, string>>({
        "Verse": "#5a8fcf", "Chorus": "#e09f3e", "Intro": "#a16ae8", "Outro": "#8d6eab",
        "Bridge": "#52b7a8", "Pre-Chorus": "#7caf52", "Post-Chorus": "#e6d56f", "Refrain": "#f4a261",
        "Instrumental": "#5a7e58", "Guitar Solo": "#c94b4b", "Drop": "#9ab973",
        "Build-up": "#d38c5f", "Breakdown": "#8e7cc3",
    });

    const [timelineHeight, setTimelineHeight] = useState<string>(`${DEFAULT_TIMELINE_HEIGHT_PX}px`);
    const [isResizing, setIsResizing] = useState<boolean>(false);
    const timelineContainerRef = useRef<HTMLDivElement>(null);
    const initialDragDataRef = useRef<{ startY: number; initialHeight: number } | null>(null);

    const [savedArrangements, setSavedArrangements] = useState<SavedArrangement[]>([]);
    const [showSaveModal, setShowSaveModal] = useState(false);
    const [showLoadModal, setShowLoadModal] = useState(false);
    const [showImportExportModal, setShowImportExportModal] = useState(false);
    const [newArrangementName, setNewArrangementName] = useState('');
    const [errorSave, setErrorSave] = useState<string | null>(null);
    
    // New state for 3-click delete
    const [deleteConfirm, setDeleteConfirm] = useState<{ id: string | null; count: number }>({ id: null, count: 0 });
    const deleteConfirmTimeoutRef = useRef<number | null>(null);
    
    // New state for 3-click clear
    const [clearAllClickCount, setClearAllClickCount] = useState(0);
    const clearAllTimeoutRef = useRef<number | null>(null);
    
    // New state for lyric management
    const [editingLineOriginalText, setEditingLineOriginalText] = useState<string | null>(null);
    const [historyModalOpen, setHistoryModalOpen] = useState(false);
    const [historyModalContent, setHistoryModalContent] = useState<{ blockId: string; line: LyricLineData } | null>(null);

    const estimatedTotalTime = useMemo(() => {
        if (!bpm || bpm <= 0 || !beatsPerBar || beatsPerBar <= 0) {
            return "00:00";
        }
        const timePerBar = (60 / bpm) * beatsPerBar;
        const totalSeconds = arrangement.reduce((total, block) => {
            return total + ((block.barCount || 0) * timePerBar);
        }, 0);

        if (totalSeconds === 0) return "00:00";
        
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = Math.floor(totalSeconds % 60);

        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }, [arrangement, bpm, beatsPerBar]);

    const parseTextToArrangement = (content: string): { arrangement: SongStructureBlock[], songTitle: string, tags: string, barCountsWereGuessed: boolean } => {
        let newBlocks: SongStructureBlock[] = [];
        let newTitle = '';
        let newTags = '';
        let barCountsWereGuessed = false;
    
        const lines = content.split('\n');
        let currentBlock: SongStructureBlock | null = null;
        
        const titleRegex = /^\s*\[Title:\s*(.*?)\]\s*$/i;
        const tagsRegex = /^\s*\[Tags:\s*(.*?)\]\s*$/i;
        const blockHeaderRegex = /^\s*\[(.*?)(?:\s*\(\s*(\d+)\s*bars?\s*\))?\]\s*$/;
    
        const processCurrentBlock = () => {
            if (currentBlock) {
                if (currentBlock.barCount === undefined) {
                    const guessedCount = guessBarCount(currentBlock);
                    if (guessedCount !== undefined) {
                        currentBlock.barCount = guessedCount;
                        barCountsWereGuessed = true;
                    }
                }
                newBlocks.push(currentBlock);
            }
        };

        for (const line of lines) {
            const trimmedLine = line.trim();
            const titleMatch = trimmedLine.match(titleRegex);
            const tagsMatch = trimmedLine.match(tagsRegex);
            
            if (titleMatch) {
                newTitle = titleMatch[1].trim();
                continue;
            }
            if (tagsMatch) {
                newTags = tagsMatch[1].trim();
                continue;
            }
    
            const blockHeaderMatch = trimmedLine.match(blockHeaderRegex);
            if (blockHeaderMatch) {
                processCurrentBlock();
                currentBlock = {
                    id: `${Date.now()}-${Math.random()}`,
                    type: blockHeaderMatch[1].trim(),
                    barCount: blockHeaderMatch[2] ? parseInt(blockHeaderMatch[2], 10) : undefined,
                    notes: '',
                    lyrics: []
                };
            } else if (currentBlock) {
                if (trimmedLine.startsWith('//')) {
                    const noteText = trimmedLine.substring(2).trim();
                    currentBlock.notes = currentBlock.notes ? `${currentBlock.notes}\n${noteText}` : noteText;
                } else if (trimmedLine) {
                    currentBlock.lyrics.push({
                        id: `imported-lyric-${Date.now()}-${Math.random()}`,
                        currentText: trimmedLine,
                        history: []
                    });
                }
            }
        }
        
        processCurrentBlock();
        
        return { arrangement: newBlocks, songTitle: newTitle, tags: newTags, barCountsWereGuessed };
    };
    

    const handleApplyTemplate = useCallback((template: { name: string; structure: { type: string; notes: string; barCount?: number }[] }, mode: 'replace' | 'append') => {
        const newBlocks: SongStructureBlock[] = template.structure.map(block => ({
            ...block,
            id: `${Date.now()}-${Math.random()}`,
            lyrics: [],
        }));

        if (mode === 'replace') {
            if (arrangement.length > 0 && !window.confirm(`Applying the "${template.name}" template will replace your current timeline. Are you sure?`)) {
                return;
            }
            setArrangement(newBlocks);
            setStatusMessage(`Applied "${template.name}" template.`);
            trackLocalEvent(TOOL_CATEGORY, 'templateReplaced', template.name);
        } else { // append
            setArrangement(prev => [...prev, ...newBlocks]);
            setStatusMessage(`Appended "${template.name}" template.`);
            trackLocalEvent(TOOL_CATEGORY, 'templateAppended', template.name);
        }
        
        setTimeout(() => setStatusMessage(''), 3000);
    }, [arrangement, trackLocalEvent]);

    useEffect(() => {
        try {
            const savedCurrentWork = localStorage.getItem(LOCAL_STORAGE_CURRENT_WORK_KEY);
            if (savedCurrentWork) {
                const parsedData = JSON.parse(savedCurrentWork);
                // Data Migration from v1 to v2 (notes field to lyrics array)
                if (parsedData.arrangement && Array.isArray(parsedData.arrangement) && parsedData.arrangement.length > 0 && parsedData.arrangement[0] && parsedData.arrangement[0].lyrics === undefined) {
                    const migratedArrangement = parsedData.arrangement.map((block: any): SongStructureBlock => ({
                        id: block.id || `${Date.now()}-${Math.random()}`,
                        type: block.type || 'Verse',
                        notes: '', // New 'notes' field is for commentary
                        lyrics: (block.notes || '').split('\n').map((lineText: string): LyricLineData => ({
                            id: `migrated-${Date.now()}-${Math.random()}`,
                            currentText: lineText,
                            history: []
                        })),
                        barCount: block.barCount, // carry over if it exists
                    }));
                    setArrangement(migratedArrangement);
                } else {
                    setArrangement(parsedData.arrangement || []);
                }

                setSongTitle(parsedData.songTitle || '');
                setTags(parsedData.tags || '');
                setBpm(parsedData.bpm || 120);
                setBeatsPerBar(parsedData.beatsPerBar || 4);

                if (parsedData.blockTypeColors) {
                    setBlockTypeColors(prev => ({...prev, ...parsedData.blockTypeColors}));
                }
            }

            const storedArrangements = localStorage.getItem(LOCAL_STORAGE_SAVED_ARRANGEMENTS_KEY);
            if (storedArrangements) {
                setSavedArrangements(JSON.parse(storedArrangements));
            }
        } catch (error) {
            console.error("Failed to load data from local storage", error);
            setStatusMessage("Failed to load saved data.");
        }

        const savedHeight = localStorage.getItem(LOCAL_STORAGE_TIMELINE_HEIGHT_KEY);
        if (savedHeight) {
          const numericHeight = parseInt(savedHeight, 10);
          const currentMaxHeight = typeof window !== 'undefined' ? Math.max(300, window.innerHeight * 0.8) : MAX_TIMELINE_HEIGHT_PX;
          if (!isNaN(numericHeight) && numericHeight >= MIN_TIMELINE_HEIGHT_PX && numericHeight <= currentMaxHeight) {
            setTimelineHeight(savedHeight);
          } else if (!isNaN(numericHeight) && numericHeight > currentMaxHeight) {
            setTimelineHeight(`${currentMaxHeight}px`); 
          }
        }
        
        return () => {
            if (clearAllTimeoutRef.current) clearTimeout(clearAllTimeoutRef.current);
            if (deleteConfirmTimeoutRef.current) clearTimeout(deleteConfirmTimeoutRef.current);
        };
    }, []);
    
    useEffect(() => {
        const dataToSave = { arrangement, songTitle, tags, blockTypeColors, bpm, beatsPerBar };
        localStorage.setItem(LOCAL_STORAGE_CURRENT_WORK_KEY, JSON.stringify(dataToSave));
    }, [arrangement, songTitle, tags, blockTypeColors, bpm, beatsPerBar]);
    
    useEffect(() => {
        localStorage.setItem(LOCAL_STORAGE_SAVED_ARRANGEMENTS_KEY, JSON.stringify(savedArrangements));
    }, [savedArrangements]);


    const handleMouseDownResize = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        e.preventDefault();
        if (timelineContainerRef.current) {
            initialDragDataRef.current = {
                startY: e.clientY,
                initialHeight: timelineContainerRef.current.offsetHeight,
            };
            setIsResizing(true);
        }
    }, []);

    useEffect(() => {
        const handleMove = (e: MouseEvent) => {
            if (!timelineContainerRef.current || !initialDragDataRef.current) return;
    
            const deltaY = e.clientY - initialDragDataRef.current.startY;
            let newHeight = initialDragDataRef.current.initialHeight + deltaY;
            newHeight = Math.max(MIN_TIMELINE_HEIGHT_PX, Math.min(newHeight, MAX_TIMELINE_HEIGHT_PX));
            setTimelineHeight(`${newHeight}px`);
        };
    
        const handleUp = () => {
            setIsResizing(false); 
            if (timelineContainerRef.current) {
                localStorage.setItem(LOCAL_STORAGE_TIMELINE_HEIGHT_KEY, timelineContainerRef.current.style.height);
            }
        };
    
        if (isResizing) {
            document.addEventListener('mousemove', handleMove);
            document.addEventListener('mouseup', handleUp);
            window.addEventListener('blur', handleUp); 
            document.body.style.userSelect = 'none';
            document.body.style.cursor = 'ns-resize';
        }
    
        return () => {
            document.removeEventListener('mousemove', handleMove);
            document.removeEventListener('mouseup', handleUp);
            window.removeEventListener('blur', handleUp);
            document.body.style.userSelect = '';
            document.body.style.cursor = '';
        };
    }, [isResizing]);
    
    const handleConfirmSave = () => {
        setErrorSave(null);
        if (!newArrangementName.trim()) { setErrorSave("Arrangement name cannot be empty."); return; }
        if (savedArrangements.some(s => s.name.toLowerCase() === newArrangementName.trim().toLowerCase())) { setErrorSave("An arrangement with this name already exists."); return; }
        
        const newSave: SavedArrangement = {
            id: Date.now().toString(),
            name: newArrangementName.trim(),
            createdAt: new Date().toISOString(),
            data: { arrangement, songTitle, tags, blockTypeColors, bpm, beatsPerBar }
        };
        
        setSavedArrangements(prev => [newSave, ...prev]);
        setStatusMessage(`Arrangement "${newSave.name}" saved!`);
        setTimeout(() => setStatusMessage(''), 3000);
        setShowSaveModal(false);
        setNewArrangementName('');
        trackLocalEvent(TOOL_CATEGORY, 'arrangementSaved', newSave.name);
    };

    const handleLoadArrangement = (id: string) => {
        const arrangementToLoad = savedArrangements.find(s => s.id === id);
        if (!arrangementToLoad) {
            setStatusMessage("Error: Could not find saved arrangement.");
            setTimeout(() => setStatusMessage(''), 3000);
            return;
        }

        if (arrangement.length > 0 && !window.confirm("This will overwrite your current timeline and fields. Are you sure?")) {
            return;
        }

        const { data } = arrangementToLoad;
        setArrangement(data.arrangement || []);
        setSongTitle(data.songTitle || '');
        setTags(data.tags || '');
        setBlockTypeColors(prev => ({...prev, ...data.blockTypeColors}));
        setBpm(data.bpm || 120);
        setBeatsPerBar(data.beatsPerBar || 4);
        
        setShowLoadModal(false);
        setStatusMessage(`Loaded arrangement: "${arrangementToLoad.name}".`);
        setTimeout(() => setStatusMessage(''), 3000);
        trackLocalEvent(TOOL_CATEGORY, 'arrangementLoaded', arrangementToLoad.name);
    };
    
    const handleDeleteArrangement = (id: string) => {
        if (deleteConfirm.id !== id) {
            setDeleteConfirm({ id: id, count: 1 });
            if (deleteConfirmTimeoutRef.current) clearTimeout(deleteConfirmTimeoutRef.current);
            deleteConfirmTimeoutRef.current = window.setTimeout(() => {
                setDeleteConfirm({ id: null, count: 0 });
            }, 3000);
            return;
        }
    
        const newCount = deleteConfirm.count + 1;
        if (newCount >= 3) {
            setSavedArrangements(prev => prev.filter(s => s.id !== id));
            setStatusMessage("Arrangement deleted.");
            setTimeout(() => setStatusMessage(''), 3000);
            trackLocalEvent(TOOL_CATEGORY, 'arrangementDeleted');
            setDeleteConfirm({ id: null, count: 0 });
            if (deleteConfirmTimeoutRef.current) clearTimeout(deleteConfirmTimeoutRef.current);
        } else {
            setDeleteConfirm({ id: id, count: newCount });
            if (deleteConfirmTimeoutRef.current) clearTimeout(deleteConfirmTimeoutRef.current);
            deleteConfirmTimeoutRef.current = window.setTimeout(() => {
                setDeleteConfirm({ id: null, count: 0 });
            }, 3000);
        }
    };

    const getDeleteButtonText = (id: string) => {
        if (deleteConfirm.id === id) {
            if (deleteConfirm.count === 1) return "Sure?";
            if (deleteConfirm.count === 2) return "Delete!";
        }
        return "Del";
    };


    const handleAddCustomBlock = () => {
        const trimmedName = customBlockName.trim();
        if (trimmedName && !predefinedBlockTypes.includes(trimmedName) && !arrangement.find(b => b.type === trimmedName)) {
            const newBlock: SongStructureBlock = { id: `${Date.now()}-${Math.random()}`, type: trimmedName, notes: '', lyrics: [], barCount: 8 };
            setArrangement(prev => [...prev, newBlock]);
            setCustomBlockName('');
            trackLocalEvent(TOOL_CATEGORY, 'customBlockAdded', trimmedName);
        }
    };

    const handleBarCountChange = (id: string, newCountStr: string) => {
        const newCount = parseInt(newCountStr, 10);
        setArrangement(prev => prev.map(block => 
            block.id === id ? { ...block, barCount: isNaN(newCount) ? undefined : Math.max(0, newCount) } : block
        ));
    };

    const handleNotesChange = (id: string, newNotes: string) => { setArrangement(prev => prev.map(block => block.id === id ? { ...block, notes: newNotes } : block)); };
    const handleRemoveBlock = (id: string) => { setArrangement(prev => prev.filter(block => block.id !== id)); trackLocalEvent(TOOL_CATEGORY, 'blockRemoved'); };
    
    const handleDuplicateBlock = (id: string) => {
        const blockToDuplicate = arrangement.find(block => block.id === id);
        const indexToInsert = arrangement.findIndex(block => block.id === id);
        if (blockToDuplicate && indexToInsert !== -1) {
            const newBlock: SongStructureBlock = { ...blockToDuplicate, id: `${Date.now()}-${Math.random()}` };
            const newArrangement = [...arrangement];
            newArrangement.splice(indexToInsert + 1, 0, newBlock);
            setArrangement(newArrangement);
            trackLocalEvent(TOOL_CATEGORY, 'blockDuplicated', blockToDuplicate.type);
        }
    };
    
    const handleTypeChange = (id: string, newType: string) => {
        setArrangement(prev => prev.map(block => block.id === id ? { ...block, type: newType } : block));
    };
    
    const handleBlockColorChange = (type: string, color: string) => {
        setBlockTypeColors(prev => ({ ...prev, [type]: color }));
    };

    // --- Lyric Management Handlers ---
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
            if (targetIndex < 0 || targetIndex >= newLyrics.length) return block; // Out of bounds
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
    // --- End Lyric Management Handlers ---

    useEffect(() => {
        const titleLine = songTitle.trim() ? `[Title: ${songTitle.trim()}]` : '';
        const tagsLine = tags.trim() ? `[Tags: ${tags.trim()}]` : '';
        
        const arrangementPrompt = arrangement.map(block => {
            const barCountText = block.barCount && block.barCount > 0 ? ` (${block.barCount} bars)` : '';
            const blockHeader = `[${block.type}${barCountText}]`;
            const notesContent = block.notes.trim() ? block.notes.trim().split('\n').map(n => `// ${n}`).join('\n') : '';
            const lyricsContent = block.lyrics.map(lyric => lyric.currentText.trim()).filter(Boolean).join('\n');
            
            let blockParts: string[] = [];
            if(notesContent) blockParts.push(notesContent);
            if(lyricsContent) blockParts.push(lyricsContent);
            
            return `${blockHeader}\n${blockParts.join('\n')}`.trim();

        }).join('\n\n');
        
        const fullPrompt = [titleLine, tagsLine, arrangementPrompt]
            .filter(Boolean)
            .join('\n\n'); 

        setOutputPrompt(fullPrompt);
    }, [arrangement, songTitle, tags]);

    const handleCopyToClipboard = () => { navigator.clipboard.writeText(outputPrompt).then(() => { setCopyStatus('Copied!'); setTimeout(() => setCopyStatus(''), 2000); trackLocalEvent(TOOL_CATEGORY, 'promptCopied', undefined, outputPrompt.length); }).catch(err => { console.error('Failed to copy text: ', err); setCopyStatus('Failed to copy'); setTimeout(() => setCopyStatus(''), 2000); }); };
    
    const handleDragStart = (e: React.DragEvent, itemType: 'palette' | 'timeline', data: { type: string } | { id: string, fromIndex: number }) => {
        e.dataTransfer.setData('application/json', JSON.stringify({ itemType, ...data }));
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent, index: number | null) => {
        e.preventDefault();
        e.stopPropagation();

        if (index === null) {
            setDropTargetIndex(arrangement.length);
            return;
        }
        
        const targetElement = e.currentTarget as HTMLDivElement;
        const rect = targetElement.getBoundingClientRect();
        const isFirstHalf = e.clientY < rect.top + rect.height / 2;
        
        const newIndex = isFirstHalf ? index : index + 1;
        
        if (dropTargetIndex !== newIndex) {
            setDropTargetIndex(newIndex);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        
        const finalDropIndex = dropTargetIndex;
        if (finalDropIndex === null) {
            setDropTargetIndex(null);
            return;
        }

        const data = JSON.parse(e.dataTransfer.getData('application/json'));
        let newArrangement = [...arrangement];

        if (data.itemType === 'palette') {
            const newBlock: SongStructureBlock = { id: `${Date.now()}-${Math.random()}`, type: data.type, notes: '', lyrics: [], barCount: 8 };
            newArrangement.splice(finalDropIndex, 0, newBlock);
            trackLocalEvent(TOOL_CATEGORY, 'blockAdded', data.type);
        } else if (data.itemType === 'timeline') {
            const fromIndex = data.fromIndex;
            const [movedItem] = newArrangement.splice(fromIndex, 1);
            
            const adjustedDropIndex = fromIndex < finalDropIndex ? finalDropIndex - 1 : finalDropIndex;
            
            newArrangement.splice(adjustedDropIndex, 0, movedItem);
        }
        setArrangement(newArrangement);
        setDropTargetIndex(null);
    };

    const handleDragEnd = () => {
        setDropTargetIndex(null);
    };

    const handleDragLeaveContainer = (e: React.DragEvent) => {
        const container = e.currentTarget as HTMLDivElement;
        if (!container.contains(e.relatedTarget as Node)) {
             setDropTargetIndex(null);
        }
    };

    const handleExport = (format: 'txt' | 'csv') => {
        if (arrangement.length === 0 && !songTitle && !tags) {
            setStatusMessage("Nothing to export.");
            setTimeout(() => setStatusMessage(''), 3000);
            return;
        }

        let content = '';
        let mimeType = '';
        let filename = '';
        const dateStr = new Date().toISOString().slice(0, 10);

        if (format === 'txt') {
            content = outputPrompt;
            mimeType = 'text/plain;charset=utf-8;';
            filename = `song_structure_${songTitle || dateStr}.txt`;
        } else {
            const metaRows = [];
            if (songTitle.trim()) metaRows.push(`meta,title,${escapeCsvField(songTitle.trim())}`);
            if (tags.trim()) metaRows.push(`meta,tags,${escapeCsvField(tags.trim())}`);
            const headers = "type,notes,lyrics";
            const blockRows = arrangement.map(b => {
                const lyricString = b.lyrics.map(l => l.currentText).join('\\n');
                return `${escapeCsvField(b.type)},${escapeCsvField(b.notes)},${escapeCsvField(lyricString)}`;
            });
            content = `${metaRows.join('\n')}\n${headers}\n${blockRows.join('\n')}`.trim();
            mimeType = 'text/csv;charset=utf-8;';
            filename = `song_structure_${songTitle || dateStr}.csv`;
        }

        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        setStatusMessage(`Successfully exported to ${format.toUpperCase()}!`);
        trackLocalEvent(TOOL_CATEGORY, 'exportedToFile', format);
        setTimeout(() => setStatusMessage(''), 3000);
    };

    const handleImportFromPastedText = () => {
        if (!pastedImportText.trim()) {
            setStatusMessage("No text to import.");
            setTimeout(() => setStatusMessage(''), 3000);
            return;
        }

        if (arrangement.length > 0 && !window.confirm("Importing will overwrite your current timeline and fields. Continue?")) {
            return;
        }

        try {
            const { arrangement: newBlocks, songTitle: newTitle, tags: newTags, barCountsWereGuessed } = parseTextToArrangement(pastedImportText);

            setSongTitle(newTitle);
            setTags(newTags);
            setArrangement(newBlocks);
            
            let importStatus = `Imported ${newBlocks.length} blocks from pasted text.`;
            if (barCountsWereGuessed) {
                importStatus += " Bar counts were estimated for a rough time calculation.";
            }
            setStatusMessage(importStatus);

            trackLocalEvent(TOOL_CATEGORY, 'importedFromPastedText');
            setShowImportExportModal(false);
            setPastedImportText('');
        } catch (err) {
            console.error("Import error from pasted text:", err);
            setStatusMessage(`Error importing text: ${err instanceof Error ? err.message : 'Unknown error.'}`);
        } finally {
            setTimeout(() => setStatusMessage(''), 4000);
        }
    };

    const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (arrangement.length > 0 && !window.confirm("Importing will overwrite your current timeline and fields. Continue?")) {
            if (importFileRef.current) importFileRef.current.value = ""; 
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const content = e.target?.result as string;
                let newBlocks: SongStructureBlock[] = [];
                let newTitle = '';
                let newTags = '';
                let wasGuessed = false;

                if (file.name.endsWith('.txt')) {
                    const parsed = parseTextToArrangement(content);
                    newBlocks = parsed.arrangement;
                    newTitle = parsed.songTitle;
                    newTags = parsed.tags;
                    wasGuessed = parsed.barCountsWereGuessed;
                    trackLocalEvent(TOOL_CATEGORY, 'importedFromFile', 'txt');

                } else if (file.name.endsWith('.csv')) {
                    const lines = content.split('\n').filter(line => line.trim() !== '');
                    const dataLines: string[] = [];
                    lines.forEach(line => {
                        const parts = line.split(',');
                        if (parts[0]?.toLowerCase().trim() === 'meta') {
                            const metaKey = parts[1]?.toLowerCase().trim();
                            const metaValue = parts.slice(2).join(',').trim();
                            if (metaKey === 'title') newTitle = metaValue;
                            if (metaKey === 'tags') newTags = metaValue;
                        } else if (!(parts[0]?.toLowerCase().trim() === 'type' && parts[1]?.toLowerCase().trim() === 'notes')) {
                            dataLines.push(line);
                        }
                    });

                    newBlocks = dataLines.map(line => {
                        const parts = line.match(/(?:"[^"]*(?:""[^"]*)*"|[^,]*),?/g)?.map(p => p.endsWith(',') ? p.slice(0, -1) : p).map(p => p.startsWith('"') && p.endsWith('"') ? p.slice(1, -1).replace(/""/g, '"') : p) || [];

                        const type = (parts[0] || 'Untitled').trim();
                        const notesContent = (parts[1] || '').trim();
                        const lyricsContent = (parts[2] || '').trim().replace(/\\n/g, '\n');

                        const lyricsData: LyricLineData[] = lyricsContent.split('\n').map(lineText => ({
                          id: `imported-csv-lyric-${Date.now()}-${Math.random()}`,
                          currentText: lineText.trim(),
                          history: []
                        }));
                        const tempBlock: SongStructureBlock = { id: `${Date.now()}-${Math.random()}`, type, notes: notesContent, lyrics: lyricsData };
                        
                        // Apply guessing for CSV import as well
                        const guessedCount = guessBarCount(tempBlock);
                        if(guessedCount !== undefined) {
                            tempBlock.barCount = guessedCount;
                            wasGuessed = true;
                        }

                        return tempBlock;
                    });
                    trackLocalEvent(TOOL_CATEGORY, 'importedFromFile', 'csv');
                } else {
                    throw new Error("Unsupported file type. Please use .txt or .csv.");
                }
                
                setSongTitle(newTitle); setTags(newTags); setArrangement(newBlocks);
                let importStatus = `Imported ${newBlocks.length} blocks from ${file.name}.`;
                if (wasGuessed) {
                    importStatus += " Bar counts were estimated for a rough time calculation.";
                }
                setStatusMessage(importStatus);

                setShowImportExportModal(false);

            } catch (err) {
                console.error("Import error:", err);
                setStatusMessage(`Error importing file: ${err instanceof Error ? err.message : 'Unknown error.'}`);
            } finally {
                setTimeout(() => setStatusMessage(''), 4000);
            }
        };

        reader.onerror = () => { setStatusMessage("Error reading file."); setTimeout(() => setStatusMessage(''), 3000); };
        reader.readAsText(file);
        if (importFileRef.current) importFileRef.current.value = "";
    };

    const getClearAllButtonText = () => {
        if (clearAllClickCount === 0) return "Clear All";
        if (clearAllClickCount === 1) return "Are you sure?";
        if (clearAllClickCount === 2) return "Click again to confirm!";
        return "Clear All";
    };

    const handleClearAll = useCallback(() => {
        if (clearAllTimeoutRef.current) {
            clearTimeout(clearAllTimeoutRef.current);
        }

        const newClickCount = clearAllClickCount + 1;
        setClearAllClickCount(newClickCount);

        if (newClickCount >= 3) {
            setArrangement([]);
            setSongTitle('');
            setTags('');
            setBpm(120);
            setBeatsPerBar(4);
            setStatusMessage("Timeline cleared.");
            trackLocalEvent(TOOL_CATEGORY, 'timelineCleared');
            setTimeout(() => setStatusMessage(''), 3000);
            setClearAllClickCount(0);
            clearAllTimeoutRef.current = null;
        } else {
            clearAllTimeoutRef.current = window.setTimeout(() => {
                setClearAllClickCount(0);
            }, 3000); // Reset after 3 seconds
        }
    }, [clearAllClickCount, trackLocalEvent]);


    return (
        <div className="w-full">
            <header className="mb-10 text-center">
                <h1 className="text-5xl font-extrabold text-green-600 dark:text-green-400">Song Structure & Lyric Builder</h1>
                <p className="mt-3 text-md text-gray-700 dark:text-gray-300 max-w-2xl mx-auto"> Visually build your song's structure, write lyrics with version control, count syllables, and export a formatted prompt for AI music generators. </p>
            </header>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <StructurePalette
                    blockTypeColors={blockTypeColors}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    onBlockColorChange={handleBlockColorChange}
                    customBlockName={customBlockName}
                    setCustomBlockName={setCustomBlockName}
                    onAddCustomBlock={handleAddCustomBlock}
                    onApplyTemplate={handleApplyTemplate}
                />

                <div className="lg:col-span-2 bg-white dark:bg-gray-900 p-4 rounded-lg border-2 border-gray-200 dark:border-green-700 shadow-md">
                    <div className="flex justify-between items-center mb-3 flex-wrap gap-2"> 
                        <h2 className="text-lg font-semibold text-green-700 dark:text-green-300">Arrangement Timeline</h2> 
                        <div className="flex items-center gap-2">
                            <div className="text-lg font-mono text-green-800 dark:text-green-200 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-md border border-gray-300 dark:border-gray-700">
                                Est. Time: {estimatedTotalTime}
                            </div>
                            <InfoIcon tooltip="This is a helpful guideline based on your BPM and bar counts. The final AI-generated song length will vary based on the AI's creative interpretation of tempo, vocal phrasing, and instrumental fills." />
                        </div>
                        <div className="flex gap-2 flex-wrap"> 
                            <button onClick={() => { setNewArrangementName(''); setErrorSave(null); setShowSaveModal(true); }} className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-md text-xs font-medium flex items-center gap-1"><SaveIcon/>Save As...</button>
                            <button onClick={() => setShowLoadModal(true)} disabled={savedArrangements.length === 0} className="px-3 py-1 bg-teal-600 hover:bg-teal-500 text-white rounded-md text-xs font-medium flex items-center gap-1 disabled:opacity-50"><LoadIcon/>Load... ({savedArrangements.length})</button>
                            <button onClick={() => setShowImportExportModal(true)} className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md text-xs font-medium">Import/Export</button>
                            <button onClick={handleClearAll} className="px-3 py-1 bg-red-700 hover:bg-red-600 text-white rounded-md text-xs font-medium"> {getClearAllButtonText()} </button> 
                        </div> 
                    </div>
                    {statusMessage && <p className="text-sm text-yellow-600 dark:text-yellow-300 text-center mb-2">{statusMessage}</p>}
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 items-end">
                        <InputField id="songTitle" label="Song Title" value={songTitle} onChange={setSongTitle} placeholder="e.g., Echoes of the Void" className="mb-0" />
                        <InputField id="tags" label="Tags / Style Prompt" value={tags} onChange={setTags} placeholder="e.g., epic, orchestral" className="mb-0" />
                    </div>

                    <details className="mb-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg group">
                      <summary className="p-3 cursor-pointer text-md font-semibold text-green-700 dark:text-green-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-t-lg transition-colors flex justify-between items-center">
                        <span>What Are Bars & How Do They Work?</span>
                        <span className="transform transition-transform duration-200 group-open:rotate-180">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-gray-500 dark:text-gray-400">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                          </svg>
                        </span>
                      </summary>
                      <div className="p-4 border-t border-gray-200 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-300 space-y-2">
                        <p>A <strong className="font-semibold text-green-700 dark:text-green-200">bar</strong> (or <strong className="font-semibold text-green-700 dark:text-green-200">measure</strong>) is a basic unit of time in music. Think of it as a container that holds a specific number of beats.</p>
                        <p>The <strong className="font-semibold text-green-700 dark:text-green-200">Beats Per Bar</strong> setting (from the time signature, e.g., the first '4' in 4/4) determines how many beats fit into one bar. The <strong className="font-semibold text-green-700 dark:text-green-200">BPM</strong> (Beats Per Minute) sets the speed of those beats.</p>
                        <div className="p-2 my-1 bg-white dark:bg-gray-900 rounded-md text-xs border border-gray-200 dark:border-gray-700">
                          <strong className="text-yellow-600 dark:text-yellow-300">Example:</strong> At 120 BPM in 4/4 time:
                          <ul className="list-disc list-inside pl-2 mt-1">
                            <li>Each bar has 4 beats.</li>
                            <li>Each beat lasts 0.5 seconds (<code className="bg-gray-100 dark:bg-gray-700 px-1 rounded text-gray-800 dark:text-gray-200">60s / 120 BPM</code>).</li>
                            <li>Therefore, one 8-bar verse will last <strong className="text-yellow-600 dark:text-yellow-300">16 seconds</strong> (<code className="bg-gray-100 dark:bg-gray-700 px-1 rounded text-gray-800 dark:text-gray-200">8 bars × 4 beats/bar × 0.5s/beat</code>).</li>
                          </ul>
                        </div>
                        <p>Using bar counts helps you control the pacing and length of your song sections. Including them in your final prompt (e.g., <code className="bg-gray-100 dark:bg-gray-700 text-yellow-600 dark:text-yellow-300 px-1.5 py-0.5 rounded-md font-mono">[Verse] (16 bars)</code>) gives the AI valuable structural information.</p>
                      </div>
                    </details>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 items-end">
                        <InputField id="bpm" label="BPM" type="number" value={String(bpm)} onChange={(val) => setBpm(parseInt(val, 10) || 120)} className="mb-0"/>
                        <InputField id="beatsPerBar" label="Beats Per Bar" type="number" value={String(beatsPerBar)} onChange={(val) => setBeatsPerBar(parseInt(val, 10) || 4)} className="mb-0"/>
                    </div>
                    
                    <div ref={timelineContainerRef} className="relative overflow-hidden bg-gray-100 dark:bg-gray-850 rounded-lg border border-gray-200 dark:border-gray-700 shadow-inner" style={{ height: timelineHeight }}>
                        <div 
                            className="space-y-0.5 p-2 h-full overflow-y-auto"
                            onDragOver={(e) => handleDragOver(e, null)} 
                            onDrop={handleDrop}
                            onDragLeave={handleDragLeaveContainer}
                        >
                            {arrangement.length > 0 && dropTargetIndex === 0 && <DropIndicator />}
                            {arrangement.length === 0 && (
                                <div className="text-center text-gray-500 dark:text-gray-500 py-10 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center h-full">
                                    Drag blocks from the palette to start building your song here.
                                </div>
                            )}
                            {arrangement.map((block, index) => (
                                <TimelineBlockItem
                                    key={block.id}
                                    block={block}
                                    index={index}
                                    blockColor={blockTypeColors[block.type] || '#4A5568'}
                                    dropTargetIndex={dropTargetIndex}
                                    isLast={index === arrangement.length - 1}
                                    onDragOver={handleDragOver}
                                    onDragStart={handleDragStart}
                                    onDragEnd={handleDragEnd}
                                    onTypeChange={handleTypeChange}
                                    onBarCountChange={handleBarCountChange}
                                    onDuplicateBlock={handleDuplicateBlock}
                                    onRemoveBlock={handleRemoveBlock}
                                    onNotesChange={handleNotesChange}
                                    onLyricTextChange={handleLyricTextChange}
                                    onLyricTextFocus={handleLyricTextFocus}
                                    onLyricTextBlur={handleLyricTextBlur}
                                    countSyllablesInLine={countSyllablesInLine}
                                    onReorderLyricLine={handleReorderLyricLine}
                                    onInsertLyricLineAfter={handleInsertLyricLineAfter}
                                    onShowHistory={handleShowHistory}
                                    onDeleteLyricLine={handleDeleteLyricLine}
                                    onAddLyricLine={handleAddLyricLine}
                                />
                            ))}
                        </div>
                        <div onMouseDown={handleMouseDownResize} className="absolute bottom-0 left-0 w-full h-2.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 cursor-ns-resize flex items-center justify-center" title="Resize Timeline">
                            <div className="w-10 h-1 bg-gray-400 dark:bg-gray-500 rounded-full"></div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="mt-8 bg-white dark:bg-gray-900 p-4 rounded-lg border-2 border-gray-200 dark:border-green-700 shadow-md">
                <div className="flex justify-between items-center mb-2"> <h2 className="text-lg font-semibold text-green-700 dark:text-green-300">Formatted AI Prompt</h2> <button onClick={handleCopyToClipboard} disabled={!outputPrompt} className="px-3 py-1.5 bg-green-600 hover:bg-green-500 text-black rounded-md text-sm font-medium flex items-center gap-2 disabled:opacity-50 transition-colors"> <CopyIcon /> {copyStatus || 'Copy'} </button> </div>
                <textarea readOnly value={outputPrompt} rows={Math.max(8, arrangement.length * 3 + (songTitle ? 2 : 0) + (tags ? 2 : 0))} className="w-full p-3 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-md font-mono text-sm focus:ring-green-500 focus:border-green-500" aria-label="Generated song structure prompt" />
            </div>

            <SaveArrangementModal
                show={showSaveModal}
                onClose={() => setShowSaveModal(false)}
                onSave={handleConfirmSave}
                arrangementName={newArrangementName}
                setArrangementName={setNewArrangementName}
                errorSave={errorSave}
            />

            <LoadArrangementModal
                show={showLoadModal}
                onClose={() => setShowLoadModal(false)}
                savedArrangements={savedArrangements}
                onLoad={handleLoadArrangement}
                onDelete={handleDeleteArrangement}
                getDeleteButtonText={getDeleteButtonText}
            />

            <ImportExportModal
                show={showImportExportModal}
                onClose={() => setShowImportExportModal(false)}
                onExport={handleExport}
                pastedImportText={pastedImportText}
                setPastedImportText={setPastedImportText}
                onImportPastedText={handleImportFromPastedText}
                importFileRef={importFileRef}
                onFileImport={handleFileImport}
            />
            
            <LyricHistoryModal
                show={historyModalOpen}
                onClose={() => setHistoryModalOpen(false)}
                historyModalContent={historyModalContent}
                onRevert={handleRevertToVersion}
            />
        </div>
    );
};
export default SongStructureBuilderTool;
