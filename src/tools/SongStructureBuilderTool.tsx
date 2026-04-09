
import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import Spinner from '@/components/Spinner';
import type { ToolProps } from '@/Layout';
import { useTheme } from '@/context/ThemeContext';
import Button from '@/components/common/Button';
import type { SongStructureBlock, SavedArrangement, LyricLineData } from '@/types';
import { countSyllablesInLine } from '@/utils/lyricUtils';
import InputField from '@/components/forms/InputField';


import { TOOL_CATEGORY, LOCAL_STORAGE_CURRENT_WORK_KEY, LOCAL_STORAGE_SAVED_ARRANGEMENTS_KEY, predefinedBlockTypes, arrangementTemplates } from '@/components/SongStructureBuilder/constants';
import { CopyIcon, SaveIcon, LoadIcon, InfoIcon, TrashIcon, ExportIcon, HistoryIcon } from '@/components/SongStructureBuilder/Icons';
import { escapeCsvField } from '@/components/SongStructureBuilder/utils';
import SaveArrangementModal from '@/components/SongStructureBuilder/SaveArrangementModal';
import LoadArrangementModal from '@/components/SongStructureBuilder/LoadArrangementModal';
import ImportExportModal from '@/components/SongStructureBuilder/ImportExportModal';
import LyricHistoryModal from '@/components/SongStructureBuilder/LyricHistoryModal';
import StructurePalette from '@/components/SongStructureBuilder/StructurePalette';
import TimelineBlockItem, { DropIndicator } from '@/components/SongStructureBuilder/TimelineBlockItem';
import BarsExplainer from '@/components/SongStructureBuilder/BarsExplainer';
import { useTimelineResize } from '@/components/SongStructureBuilder/hooks/useTimelineResize';
import { useLyricManager } from '@/components/SongStructureBuilder/hooks/useLyricManager';
import { useImportExport } from '@/components/SongStructureBuilder/hooks/useImportExport';


const SongStructureBuilderTool: React.FC<ToolProps> = ({ trackLocalEvent }) => {
    const { uiMode } = useTheme();
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

    const { timelineHeight, timelineContainerRef, handleMouseDownResize } = useTimelineResize();
    const {
        historyModalOpen, setHistoryModalOpen, historyModalContent,
        handleAddLyricLine, handleInsertLyricLineAfter, handleLyricTextChange,
        handleLyricTextFocus, handleLyricTextBlur, handleDeleteLyricLine,
        handleReorderLyricLine, handleShowHistory, handleRevertToVersion
    } = useLyricManager(arrangement, setArrangement, trackLocalEvent);

    const { handleExport, handleImportFromPastedText, handleFileImport } = useImportExport({
        arrangement, setArrangement, songTitle, setSongTitle, tags, setTags,
        outputPrompt, setStatusMessage, trackLocalEvent, setShowImportExportModal,
        pastedImportText, setPastedImportText, importFileRef
    });

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
        <div className={`w-full ${uiMode === 'classic' ? 'max-w-7xl mx-auto px-4 pb-20' : ''}`}>
            {uiMode === 'classic' ? (
                <header className="mb-6 text-center pt-8">
                    <h1 className="text-2xl md:text-3xl font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-tight">
                        Structure Builder
                    </h1>
                    <p className="mt-2 text-[11px] font-medium text-gray-600 dark:text-gray-400 max-w-3xl mx-auto text-center">
                        Compositional Architecture • Strategic Song Layout Generator
                    </p>
                </header>
            ) : (
                <header className="mb-2 md:mb-14 text-center pt-0 md:pt-8 px-4 animate-fadeIn">
                    <h1 className="text-3xl sm:text-5xl md:text-7xl font-black uppercase tracking-tighter text-emerald-600 dark:text-emerald-500 leading-none italic drop-shadow-2xl mb-1 md:mb-4">Structure Builder</h1>
                    <p className="mt-1 md:mt-4 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.4em] text-gray-500 dark:text-gray-400 max-w-xl mx-auto opacity-70">
                        Compositional Architecture • Strategic Song Layout Generator
                    </p>
                </header>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <StructurePalette
                    blockTypeColors={blockTypeColors}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    onBlockColorChange={handleBlockColorChange}
                    customBlockName={customBlockName}
                    setCustomBlockName={setCustomBlockName}
                    onAddCustomBlock={handleAddCustomBlock}
                    onApplyTemplate={handleApplyTemplate}
                />                <div className="lg:col-span-3 glass-card p-2 sm:p-6 md:p-10 border-white/10 shadow-2xl relative overflow-hidden flex flex-col transition-all duration-500 animate-fadeIn">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[100px] pointer-events-none"></div>

                    {/* Timeline Header */}
                    <div className="flex justify-between items-center mb-4 sm:mb-8 flex-wrap gap-4 sm:gap-6 relative z-10"> 
                        <div>
                          <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-600 dark:text-emerald-500 opacity-80 mb-2">Arrangement Timeline</h2>
                          <div className="flex items-center gap-4">
                              <div className="text-sm font-black tracking-tighter text-gray-900 dark:text-white bg-white/5 px-4 py-2 rounded-xl border border-white/10 flex items-center gap-2">
                                  <HistoryIcon className="w-3.5 h-3.5 text-gray-500" />
                                  <span>{estimatedTotalTime} <span className="text-[8px] uppercase tracking-widest text-gray-500 ml-1">Est. Duration</span></span>
                              </div>
                              <InfoIcon tooltip="Helpful guideline based on BPM and bar counts. AI creative interpretation may vary." />
                          </div>
                        </div>

                        <div className="flex gap-2 flex-wrap"> 
                            <Button onClick={() => { setNewArrangementName(''); setErrorSave(null); setShowSaveModal(true); }} variant="primary" size="sm" startIcon={<SaveIcon className="w-3 h-3"/>} className="font-black uppercase tracking-widest text-[9px] px-4 h-9 sm:h-10" backgroundColor="#10b981">Save</Button>
                            <Button onClick={() => setShowLoadModal(true)} disabled={savedArrangements.length === 0} variant="ghost" size="sm" startIcon={<LoadIcon className="w-3 h-3"/>} className="font-black uppercase tracking-widest text-[9px] px-4 border-white/10 h-9 sm:h-10">Vault ({savedArrangements.length})</Button>
                            <Button onClick={() => setShowImportExportModal(true)} variant="ghost" size="sm" startIcon={<ExportIcon className="w-3 h-3"/>} className="font-black uppercase tracking-widest text-[9px] px-4 border-white/10 h-9 sm:h-10">Signal</Button>
                            <Button 
                              onClick={handleClearAll} 
                              variant={clearAllClickCount > 0 ? "primary" : "ghost"} 
                              size="sm" 
                              startIcon={<TrashIcon className="w-3 h-3"/>}
                              className={`font-black uppercase tracking-widest text-[9px] px-4 h-9 sm:h-10 ${clearAllClickCount > 0 ? '' : 'border-red-500/30 text-red-500 hover:bg-red-500/10'}`}
                              backgroundColor={clearAllClickCount > 0 ? "#ef4444" : undefined}
                            > 
                              {getClearAllButtonText()} 
                            </Button> 
                        </div> 
                    </div>

                    {statusMessage && <p className="text-[10px] font-black uppercase tracking-widest text-yellow-600 dark:text-yellow-500 text-center mb-6 animate-pulse relative z-10">{statusMessage}</p>}
                    
                    {/* Song Metadata Inputs */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-4 sm:mb-8 p-3 sm:p-6 bg-white/5 dark:bg-black/40 rounded-2xl border border-white/5 items-end relative z-10">
                        <div className="lg:col-span-1">
                          <InputField id="songTitle" label="Song Title" value={songTitle} onChange={setSongTitle} placeholder="e.g., Echoes" className="mb-0" />
                        </div>
                        <div className="lg:col-span-1">
                          <InputField id="tags" label="Style / Tags" value={tags} onChange={setTags} placeholder="e.g., epic orchestral" className="mb-0" />
                        </div>
                        <div className="flex flex-col">
                            <label htmlFor="bpm" className="block text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2 ml-1">Tempo (BPM)</label>
                            <input 
                              type="number" 
                              id="bpm" 
                              value={bpm || ''} 
                              onChange={(e) => setBpm(parseInt(e.target.value) || 0)} 
                              className="w-full px-4 py-2 bg-white/10 dark:bg-black/20 border border-white/10 rounded-xl text-sm font-bold focus:ring-4 focus:ring-emerald-500/20 outline-none transition-all h-[34px] sm:h-[38px]" 
                              placeholder="120"
                            />
                        </div>
                        <div className="flex flex-col">
                            <label htmlFor="beatsPerBar" className="block text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2 ml-1">Meter (X/4)</label>
                            <input 
                              type="number" 
                              id="beatsPerBar" 
                              value={beatsPerBar || ''} 
                              onChange={(e) => setBeatsPerBar(parseInt(e.target.value) || 4)} 
                              className="w-full px-4 py-2 bg-white/10 dark:bg-black/20 border border-white/10 rounded-xl text-sm font-bold focus:ring-4 focus:ring-emerald-500/20 outline-none transition-all h-[34px] sm:h-[38px]" 
                              placeholder="4"
                            />
                        </div>
                    </div>

                    <BarsExplainer />

                    {/* Timeline Container */}
                    <div className="flex-grow flex flex-col relative mt-2 sm:mt-6 z-10">
                      <div 
                        ref={timelineContainerRef} 
                        className="relative overflow-hidden bg-black/20 dark:bg-black/60 rounded-3xl border border-white/5 shadow-inner" 
                        style={{ height: timelineHeight }}
                      >
                          <div 
                              className="space-y-4 p-3 sm:p-6 h-full overflow-y-auto custom-scrollbar"
                              onDragOver={(e) => handleDragOver(e, null)} 
                              onDrop={handleDrop}
                              onDragLeave={handleDragLeaveContainer}
                          >
                              {arrangement.length > 0 && dropTargetIndex === 0 && <DropIndicator />}
                              
                              {arrangement.map((block, index) => (
                                  <TimelineBlockItem
                                      key={block.id}
                                      block={block}
                                      index={index}
                                      blockColor={blockTypeColors[block.type] || '#555'}
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
                              
                              {arrangement.length === 0 && (
                                  <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-3xl bg-white/5">
                                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-600">Timeline Empty. Deploy blocks from palette.</p>
                                  </div>
                              )}
                          </div>
                      </div>
                      
                      {/* Resize Handle */}
                      <div onMouseDown={handleMouseDownResize} className="w-full h-4 group cursor-ns-resize flex items-center justify-center p-1">
                          <div className="w-12 h-1 bg-white/10 dark:bg-white/5 rounded-full group-hover:bg-emerald-500/50 transition-colors"></div>
                      </div>
                    </div>

                    {/* Neural Network Export */}
                    <div className="mt-8 sm:mt-12 pt-6 sm:pt-10 border-t border-white/5 relative z-10">
                        <div className="flex justify-between items-center mb-4 sm:mb-6">
                          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-600 dark:text-emerald-500">Neural Network Export</h3>
                          <Button 
                            onClick={handleCopyToClipboard} 
                            disabled={!outputPrompt} 
                            variant="primary" 
                            size="xs" 
                            startIcon={<CopyIcon className="w-3 h-3" />}
                            className="font-black uppercase tracking-widest text-[8px] bg-indigo-600 h-9 sm:h-10"
                          >
                            {copyStatus || 'Copy Signal'}
                          </Button>
                        </div>
                        <div className="relative group">
                          <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 rounded-3xl blur opacity-30 group-hover:opacity-100 transition duration-1000"></div>
                          <textarea
                              readOnly
                              value={outputPrompt}
                              className="relative w-full p-4 sm:p-6 bg-black/40 backdrop-blur-3xl border border-white/10 rounded-2xl text-xs font-mono text-emerald-500/90 leading-relaxed min-h-[200px] sm:min-h-[300px] outline-none"
                              aria-label="Generated AI Prompt"
                          />
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
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
