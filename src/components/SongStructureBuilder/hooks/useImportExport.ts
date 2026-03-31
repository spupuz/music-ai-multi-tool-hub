import { SongStructureBlock, LyricLineData } from '../../../../types';
import { TOOL_CATEGORY } from '../constants';
import { guessBarCount, escapeCsvField } from '../utils';

interface ImportExportOptions {
    arrangement: SongStructureBlock[];
    setArrangement: React.Dispatch<React.SetStateAction<SongStructureBlock[]>>;
    songTitle: string;
    setSongTitle: React.Dispatch<React.SetStateAction<string>>;
    tags: string;
    setTags: React.Dispatch<React.SetStateAction<string>>;
    outputPrompt: string;
    setStatusMessage: React.Dispatch<React.SetStateAction<string>>;
    trackLocalEvent: (category: string, action: string, label?: string, value?: number) => void;
    setShowImportExportModal: React.Dispatch<React.SetStateAction<boolean>>;
    pastedImportText: string;
    setPastedImportText: React.Dispatch<React.SetStateAction<string>>;
    importFileRef: React.RefObject<HTMLInputElement>;
}

export function useImportExport({
    arrangement,
    setArrangement,
    songTitle,
    setSongTitle,
    tags,
    setTags,
    outputPrompt,
    setStatusMessage,
    trackLocalEvent,
    setShowImportExportModal,
    pastedImportText,
    setPastedImportText,
    importFileRef
}: ImportExportOptions) {

    const parseTextToArrangement = (content: string): { arrangement: SongStructureBlock[], songTitle: string, tags: string, barCountsWereGuessed: boolean } => {
        let newBlocks: SongStructureBlock[] = [];
        let newTitle = '';
        let newTags = '';
        let barCountsWereGuessed = false;
    
        const lines = content.split('\\n');
        let currentBlock: SongStructureBlock | null = null;
        
        const titleRegex = /^\\s*\\[Title:\\s*(.*?)\\]\\s*$/i;
        const tagsRegex = /^\\s*\\[Tags:\\s*(.*?)\\]\\s*$/i;
        const blockHeaderRegex = /^\\s*\\[(.*?)(?:\\s*\\(\\s*(\\d+)\\s*bars?\\s*\\))?\\]\\s*$/;
    
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
                    currentBlock.notes = currentBlock.notes ? `${currentBlock.notes}\\n${noteText}` : noteText;
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
            content = `${metaRows.join('\\n')}\\n${headers}\\n${blockRows.join('\\n')}`.trim();
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
                    const lines = content.split('\\n').filter(line => line.trim() !== '');
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
                        const lyricsContent = (parts[2] || '').trim().replace(/\\\\n/g, '\\n');

                        const lyricsData: LyricLineData[] = lyricsContent.split('\\n').map(lineText => ({
                          id: `imported-csv-lyric-${Date.now()}-${Math.random()}`,
                          currentText: lineText.trim(),
                          history: []
                        }));
                        const tempBlock: SongStructureBlock = { id: `${Date.now()}-${Math.random()}`, type, notes: notesContent, lyrics: lyricsData };
                        
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

    return {
        handleExport,
        handleImportFromPastedText,
        handleFileImport
    };
}
