
import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import type { ToolProps } from './Layout';
import type { SongStructureBlock, SavedArrangement, LyricLineData } from './types';
import { countSyllablesInLine } from './utils/lyricUtils';
import InputField from './components/forms/InputField';
import TextAreaField from './components/forms/TextAreaField'; 

const TOOL_CATEGORY = 'SongStructureBuilder';
const LOCAL_STORAGE_CURRENT_WORK_KEY = 'songStructureBuilder_currentWork_v2'; 
const LOCAL_STORAGE_SAVED_ARRANGEMENTS_KEY = 'songStructureBuilder_savedArrangements_v1';
const LOCAL_STORAGE_TIMELINE_HEIGHT_KEY = 'songStructureBuilder_timelineHeight_v1';

// Constants for resizable timeline
const DEFAULT_TIMELINE_HEIGHT_PX = 400;
const MIN_TIMELINE_HEIGHT_PX = 200;
const MAX_TIMELINE_HEIGHT_PX = typeof window !== 'undefined' ? Math.max(300, window.innerHeight * 0.8) : 800;

// Icons
const TrashIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12.56 0c1.153 0 2.243.096 3.222.261m3.478-.397a48.217 48.217 0 01-4.244 0M11.25 9h1.5v9h-1.5V9z" /></svg> );
const DuplicateIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125V15M12 15V9m0 0l-1.5 1.5M12 9l1.5 1.5" /></svg> );
const CopyIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 7.5V6.108c0-1.135.845-2.098 1.976-2.192.373-.03.748-.03 1.122 0 1.131.094 1.976 1.057 1.976 2.192V7.5M8.25 7.5h7.5M8.25 7.5v9l7.5-9M8.25 7.5l7.5 9" /></svg> );
const SaveIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>);
const LoadIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>);
const ExportIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9.75v6.75m0 0l-3-3m3 3l3-3m-8.25 6a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" /></svg>);
const ImportIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" /></svg>);
const UpArrowIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" /></svg>);
const DownArrowIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>);
const HistoryIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>);
const PlusIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>);

const InfoIcon: React.FC<{tooltip: string, className?: string}> = ({tooltip, className=""}) => (
    <div className={`inline-block relative group ${className} align-middle`}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-gray-400 hover:text-green-600 dark:hover:text-green-300 cursor-help">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
        </svg>
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 p-2 text-xs text-gray-800 dark:text-white bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-50 pointer-events-none text-left">
            {tooltip}
        </div>
    </div>
);


const predefinedBlockTypes = [
    "Verse", "Chorus", "Intro", "Outro", "Bridge", "Pre-Chorus", 
    "Post-Chorus", "Instrumental", "Guitar Solo", "Drop", "Build-up", "Breakdown", "Refrain"
];

const arrangementTemplates = [
    {
        name: 'Standard Pop (VCVCBC)',
        description: 'A classic structure with verses, choruses, and a bridge.',
        structure: [
            { type: 'Verse', notes: 'Verse 1: Introduce the main character or situation.', barCount: 16 },
            { type: 'Chorus', notes: 'Main hook of the song. Should be catchy and memorable.', barCount: 8 },
            { type: 'Verse', notes: 'Verse 2: Develop the story, introduce a conflict or new idea.', barCount: 16 },
            { type: 'Chorus', notes: 'Repeat the main hook. Reinforce the central theme.', barCount: 8 },
            { type: 'Bridge', notes: 'A change of pace. Lyrically and musically different, provides a new perspective.', barCount: 8 },
            { type: 'Chorus', notes: 'Final chorus, often with more energy or ad-libs.', barCount: 8 },
            { type: 'Outro', notes: 'Fade out or conclusive ending.', barCount: 4 },
        ]
    },
    {
        name: 'Pop with Pre-Chorus',
        description: 'Standard pop form with a Pre-Chorus to build energy.',
        structure: [
            { type: 'Verse', notes: 'Verse 1: Set the scene, introduce the narrative.', barCount: 8 },
            { type: 'Pre-Chorus', notes: 'Build tension and anticipation for the chorus.', barCount: 4 },
            { type: 'Chorus', notes: 'Main hook of the song, high energy.', barCount: 8 },
            { type: 'Verse', notes: 'Verse 2: Develop the story or present a new angle.', barCount: 8 },
            { type: 'Pre-Chorus', notes: 'Repeat the buildup section.', barCount: 4 },
            { type: 'Chorus', notes: 'Repeat the main hook.', barCount: 8 },
            { type: 'Bridge', notes: 'A contrasting section for a change of pace.', barCount: 8 },
            { type: 'Chorus', notes: 'Final, powerful chorus.', barCount: 8 }
        ]
    },
     {
        name: 'Pop with Post-Chorus',
        description: 'Modern structure using a Post-Chorus to extend the hook.',
        structure: [
            { type: 'Verse', notes: 'Verse 1: Keep it relatively sparse and narrative-focused.', barCount: 16 },
            { type: 'Chorus', notes: 'The main, high-energy hook.', barCount: 8 },
            { type: 'Post-Chorus', notes: 'An instrumental or vocal hook that extends the chorus vibe.', barCount: 4 },
            { type: 'Verse', notes: 'Verse 2: New lyrics, similar energy to Verse 1.', barCount: 16 },
            { type: 'Chorus', notes: 'Main hook again.', barCount: 8 },
            { type: 'Post-Chorus', notes: 'Repeat the post-chorus hook.', barCount: 4 },
            { type: 'Bridge', notes: "A complete departure to reset the listener's ear.", barCount: 8 },
            { type: 'Chorus', notes: 'Final main hook.', barCount: 8 },
            { type: 'Post-Chorus', notes: 'Final post-chorus hook to end strong.', barCount: 4 },
            { type: 'Outro', notes: 'Conclusive ending or fade out.', barCount: 4 }
        ]
    },
    {
        name: 'Simple (VCVC)',
        description: 'A straightforward verse-chorus structure.',
        structure: [
            { type: 'Verse', notes: 'Verse 1: Set the scene.', barCount: 8 },
            { type: 'Chorus', notes: 'The main idea.', barCount: 8 },
            { type: 'Verse', notes: 'Verse 2: Continue the story.', barCount: 8 },
            { type: 'Chorus', notes: 'Repeat the main idea.', barCount: 8 },
        ]
    },
    {
        name: 'Verse-Refrain Form',
        description: 'Each verse is followed by a recurring line or phrase (the refrain).',
        structure: [
            { type: 'Verse', notes: 'Verse 1: Main lyrical content for the first section.', barCount: 8 },
            { type: 'Refrain', notes: 'The recurring line or phrase that summarizes the theme.', barCount: 4 },
            { type: 'Verse', notes: 'Verse 2: New lyrical content for the second section.', barCount: 8 },
            { type: 'Refrain', notes: 'Repeat the recurring line or phrase.', barCount: 4 },
            { type: 'Verse', notes: 'Verse 3: Final lyrical content.', barCount: 8 },
            { type: 'Refrain', notes: 'Repeat the recurring line one last time.', barCount: 4 }
        ]
    },
    {
        name: 'Strophic / Ballad Form',
        description: 'Common in folk, hymns, and ballads. All verses have the same music.',
        structure: [
            { type: 'Verse', notes: 'Stanza 1: Introduce the main story.', barCount: 8 },
            { type: 'Verse', notes: 'Stanza 2: Continue the narrative.', barCount: 8 },
            { type: 'Verse', notes: 'Stanza 3: Further development or emotional shift.', barCount: 8 },
            { type: 'Verse', notes: 'Stanza 4: Concluding thoughts or resolution.', barCount: 8 }
        ]
    },
    {
        name: 'EDM Structure',
        description: 'Common structure for electronic dance music.',
        structure: [
            { type: 'Intro', notes: 'Atmospheric intro, build tension.', barCount: 8 },
            { type: 'Build-up', notes: 'Increase energy, add snare rolls, risers.', barCount: 8 },
            { type: 'Drop', notes: 'The main instrumental payoff. High energy.', barCount: 16 },
            { type: 'Breakdown', notes: 'A quieter, simpler section to provide contrast.', barCount: 8 },
            { type: 'Build-up', notes: 'Second buildup, often shorter or more intense.', barCount: 8 },
            { type: 'Drop', notes: 'Second drop, may have variations from the first.', barCount: 16 },
            { type: 'Outro', notes: 'Fade out the elements.', barCount: 8 },
        ]
    },
    {
        name: 'AABA Form',
        description: 'A classic 32-bar form, common in jazz and early pop.',
        structure: [
            { type: 'Verse', notes: 'A Section: Main theme or idea (e.g., 8 bars).', barCount: 8 },
            { type: 'Verse', notes: 'A Section: Repeat of the main theme, perhaps with different lyrics (e.g., 8 bars).', barCount: 8 },
            { type: 'Bridge', notes: 'B Section: The contrasting bridge, new melody and chords (e.g., 8 bars).', barCount: 8 },
            { type: 'Verse', notes: 'A Section: Return to the main theme (e.g., 8 bars).', barCount: 8 },
        ]
    }
];

// Color utility functions for contrast checking
const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
    let newColor = hex.trim();
    if (!newColor.startsWith('#')) newColor = '#' + newColor;
    if (newColor.length === 4) { // #RGB to #RRGGBB
        newColor = `#${newColor[1]}${newColor[1]}${newColor[2]}${newColor[2]}${newColor[3]}${newColor[3]}`;
    }
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(newColor);
    return result ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) } : null;
};
const getLuminance = (r: number, g: number, b: number): number => {
    const a = [r, g, b].map(v => {
        v /= 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
};
const getContrastingTextColor = (hex: string): string => {
    const rgb = hexToRgb(hex);
    if (!rgb) return '#FFFFFF'; // Default to white for invalid colors
    const lum = getLuminance(rgb.r, rgb.g, rgb.b);
    return lum > 0.5 ? '#000000' : '#FFFFFF';
};


const DropIndicator: React.FC = () => (
    <div className="h-1.5 bg-green-500 rounded-full my-1 opacity-90 transition-opacity" />
);

// Helper function for CSV escaping
const escapeCsvField = (field: string): string => {
    const str = String(field || '');
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
};

// Helper function to escape regex special characters
const escapeRegex = (string: string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

const guessBarCount = (block: SongStructureBlock): number | undefined => {
    const lyricLineCount = block.lyrics.filter(l => l.currentText.trim() !== '').length;

    if (lyricLineCount === 0) {
        // Default for instrumental/empty sections
        const blockTypeLower = block.type.toLowerCase();
        if (blockTypeLower.includes('solo') || blockTypeLower.includes('instrumental') || blockTypeLower.includes('bridge')) {
            return 8;
        }
        if (blockTypeLower.includes('intro') || blockTypeLower.includes('outro') || blockTypeLower.includes('pre-chorus') || blockTypeLower.includes('post-chorus') || blockTypeLower.includes('refrain')) {
            return 4;
        }
        return undefined; // No guess for other empty blocks like Verse/Chorus
    }

    const rawBars = lyricLineCount * 2; // Heuristic: 2 bars per lyric line
    const guessedBars = Math.round(rawBars / 4) * 4;
    
    return Math.max(4, guessedBars); // Ensure a minimum of 4 bars if there are lyrics
};


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
                <div className="lg:col-span-1 bg-white dark:bg-gray-900 p-4 rounded-lg border-2 border-gray-200 dark:border-green-700 shadow-md">
                    <h2 className="text-lg font-semibold text-green-700 dark:text-green-300 mb-3">Structure Palette</h2>
                    <div className="grid grid-cols-2 gap-2">
                        {predefinedBlockTypes.map(type => {
                            const bgColor = blockTypeColors[type] || '#555';
                            const textColor = getContrastingTextColor(bgColor);
                            return (
                                <div key={type} className="flex items-center gap-1.5 p-1 bg-gray-100 dark:bg-gray-700 rounded-md shadow-sm">
                                    <div draggable onDragStart={(e) => handleDragStart(e, 'palette', { type })} onDragEnd={handleDragEnd} className="flex-grow p-1 text-center text-sm font-medium rounded-md cursor-grab active:cursor-grabbing hover:opacity-90 transition-opacity" style={{ backgroundColor: bgColor, color: textColor }}>
                                        [{type}]
                                    </div>
                                    <input type="color" value={bgColor} onChange={(e) => handleBlockColorChange(type, e.target.value)} className="w-8 h-8 p-0 border-none rounded-md cursor-pointer bg-transparent" title={`Set color for ${type}`} />
                                </div>
                            );
                        })}
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-300 dark:border-gray-700">
                        <label htmlFor="customBlockInput" className="block text-sm font-medium text-green-600 dark:text-green-400 mb-1">Add Custom Block</label>
                        <div className="flex gap-2"> <input id="customBlockInput" type="text" value={customBlockName} onChange={e => setCustomBlockName(e.target.value)} placeholder="e.g., Synth Riff" className="flex-grow px-3 py-2 bg-gray-50 dark:bg-gray-800 border-2 border-gray-300 dark:border-green-500 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 sm:text-sm text-gray-900 dark:text-white"/> <button onClick={handleAddCustomBlock} className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-md text-sm font-medium">Add</button> </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-gray-300 dark:border-gray-700">
                        <h3 className="text-md font-semibold text-green-700 dark:text-green-300 mb-2">Arrangement Templates</h3>
                        <div className="space-y-2">
                            {arrangementTemplates.map(template => (
                                <div key={template.name} className="flex gap-1">
                                    <div className="flex-grow p-2 text-left text-sm font-medium text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-md shadow-sm" title={template.description}>
                                        {template.name}
                                    </div>
                                    <button onClick={() => handleApplyTemplate(template, 'replace')} className="px-2 py-1 bg-yellow-600 hover:bg-yellow-500 text-black rounded-md text-xs font-medium" title="Replace current timeline">Replace</button>
                                    <button onClick={() => handleApplyTemplate(template, 'append')} className="px-2 py-1 bg-teal-600 hover:bg-teal-500 text-white rounded-md text-xs font-medium" title="Add to end of timeline">Append</button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

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
                                <div key={block.id} onDragOver={(e) => handleDragOver(e, index)}>
                                    <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border-l-4 shadow-sm" style={{ borderColor: blockTypeColors[block.type] || '#4A5568' }}>
                                        <div className="flex justify-between items-center mb-2" draggable onDragStart={(e) => handleDragStart(e, 'timeline', { id: block.id, fromIndex: index })} onDragEnd={handleDragEnd}>
                                            <div className="flex items-center flex-grow mr-2 text-green-700 dark:text-green-200 font-bold cursor-grab active:cursor-grabbing">
                                                [
                                                <input 
                                                    type="text"
                                                    value={block.type}
                                                    onChange={(e) => handleTypeChange(block.id, e.target.value)}
                                                    onMouseDown={(e) => e.stopPropagation()}
                                                    className="font-bold text-green-700 dark:text-green-200 bg-transparent border-none focus:ring-1 focus:ring-green-500 focus:bg-gray-100 dark:focus:bg-gray-700 rounded p-0.5 w-full mx-0.5"
                                                    aria-label="Editable block type"
                                                />
                                                ]
                                                <div className="flex items-center ml-2">
                                                    <input 
                                                        type="number"
                                                        value={block.barCount || ''}
                                                        onChange={(e) => handleBarCountChange(block.id, e.target.value)}
                                                        onMouseDown={(e) => e.stopPropagation()}
                                                        className="w-16 p-0.5 text-sm font-normal text-center bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white"
                                                        placeholder="Bars"
                                                        aria-label="Bar count"
                                                    />
                                                    <span className="text-xs font-normal text-gray-500 dark:text-gray-400 ml-1">bars</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 flex-shrink-0"> 
                                                <button onClick={() => handleDuplicateBlock(block.id)} className="p-1 text-gray-400 hover:text-blue-500 dark:hover:text-blue-400" title="Duplicate Block"><DuplicateIcon /></button> 
                                                <button onClick={() => handleRemoveBlock(block.id)} className="p-1 text-gray-400 hover:text-red-500 dark:hover:text-red-400" title="Remove Block"><TrashIcon /></button> 
                                            </div>
                                        </div>
                                        <textarea 
                                            value={block.notes} 
                                            onChange={(e) => handleNotesChange(block.id, e.target.value)} 
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
                                                        onChange={(e) => handleLyricTextChange(block.id, lyric.id, e.target.value)}
                                                        onFocus={() => handleLyricTextFocus(lyric.currentText)}
                                                        onBlur={() => handleLyricTextBlur(block.id, lyric.id)}
                                                        className="flex-grow bg-gray-50 dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md px-2 py-1 text-gray-900 dark:text-gray-100 text-sm focus:bg-white dark:focus:bg-gray-500 focus:ring-1 focus:ring-green-400"
                                                        placeholder="Type your lyric here..."
                                                    />
                                                    <span className="text-xs text-gray-500 dark:text-gray-400 w-16 text-right font-mono" title="Syllable Count">
                                                        {countSyllablesInLine(lyric.currentText)} syll
                                                    </span>
                                                    <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity space-x-0.5">
                                                        <button onClick={() => handleReorderLyricLine(block.id, lyricIndex, 'up')} disabled={lyricIndex === 0} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed text-gray-600 dark:text-gray-300" title="Move Up"><UpArrowIcon /></button>
                                                        <button onClick={() => handleReorderLyricLine(block.id, lyricIndex, 'down')} disabled={lyricIndex === block.lyrics.length - 1} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed text-gray-600 dark:text-gray-300" title="Move Down"><DownArrowIcon /></button>
                                                        <button onClick={() => handleInsertLyricLineAfter(block.id, lyricIndex)} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 text-green-600 dark:text-green-400" title="Insert Line Below"><PlusIcon /></button>
                                                        {lyric.history.length > 0 && <button onClick={() => handleShowHistory(block.id, lyric)} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 text-yellow-600 dark:text-yellow-400" title="View History"><HistoryIcon /></button>}
                                                        <button onClick={() => handleDeleteLyricLine(block.id, lyric.id)} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 text-red-600 dark:text-red-400" title="Delete Line"><TrashIcon /></button>
                                                    </div>
                                                </div>
                                            ))}
                                            {block.lyrics.length === 0 && (
                                                <button onClick={() => handleAddLyricLine(block.id)} className="mt-2 text-xs py-1 px-2 bg-blue-600 hover:bg-blue-500 text-white rounded-md">+ Add First Lyric Line</button>
                                            )}
                                        </div>
                                    </div>
                                    {dropTargetIndex === index + 1 && <DropIndicator />}
                                </div>
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

            {showSaveModal && ( <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"> <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md border border-green-500"> <h3 className="text-lg font-semibold text-green-700 dark:text-green-300 mb-4">Save Current Arrangement</h3> <InputField id="newArrangementName" label="Arrangement Name" value={newArrangementName} onChange={setNewArrangementName} placeholder="e.g., My Awesome Rock Song" /> {errorSave && <p className="text-red-500 dark:text-red-400 text-xs mb-3">{errorSave}</p>} <div className="flex justify-end gap-3 mt-4"> <button onClick={() => setShowSaveModal(false)} className="py-2 px-4 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-800 dark:text-white rounded">Cancel</button> <button onClick={handleConfirmSave} className="py-2 px-4 bg-green-600 hover:bg-green-500 text-white dark:text-black rounded">Save Arrangement</button> </div> </div> </div> )}
            {showLoadModal && ( <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"> <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-lg border border-green-500 max-h-[80vh] flex flex-col"> <h3 className="text-xl font-semibold text-green-700 dark:text-green-300 mb-4 sticky top-0 bg-white dark:bg-gray-800 pb-2 z-10">Load Saved Arrangement</h3> {savedArrangements.length > 0 ? ( <ul className="overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-200 dark:scrollbar-track-gray-800 flex-grow space-y-2"> {savedArrangements.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(item => ( <li key={item.id} className="p-3 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600 transition-all"> <div className="flex justify-between items-center"> <div> <p className="font-semibold text-green-700 dark:text-green-200">{item.name}</p> <p className="text-xs text-gray-500 dark:text-gray-400">Saved: {new Date(item.createdAt).toLocaleDateString()}</p> </div> <div className="flex-shrink-0 space-x-2"> <button onClick={() => handleLoadArrangement(item.id)} className="text-xs py-1 px-2 bg-blue-600 hover:bg-blue-500 text-white rounded">Load</button> <button onClick={() => handleDeleteArrangement(item.id)} className="text-xs py-1 px-2 bg-red-600 hover:bg-red-500 text-white rounded flex items-center min-w-[50px] justify-center"><TrashIcon className="w-3 h-3 mr-1"/>{getDeleteButtonText(item.id)}</button> </div> </div> </li> ))} </ul> ) : ( <p className="text-gray-500 dark:text-gray-400 text-center py-4">No arrangements saved yet.</p> )} <div className="mt-4 sticky bottom-0 bg-white dark:bg-gray-800 pt-2 z-10"> <button onClick={() => setShowLoadModal(false)} className="w-full py-2 px-4 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-800 dark:text-white rounded">Close</button> </div> </div> </div> )}
            {showImportExportModal && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-lg border border-green-500">
                        <h3 className="text-lg font-semibold text-green-700 dark:text-green-300 mb-4">Import/Export Current Arrangement</h3>
                        <div className="flex flex-col space-y-2">
                            <button onClick={() => handleExport('txt')} className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded text-sm flex items-center justify-center gap-1.5"><ExportIcon />Export as TXT</button>
                            <button onClick={() => handleExport('csv')} className="w-full py-2 px-3 bg-teal-600 hover:bg-teal-500 text-white rounded text-sm flex items-center justify-center gap-1.5"><ExportIcon />Export as CSV</button>
                        </div>
                        <div className="my-4 text-center text-gray-500 dark:text-gray-400 text-sm">OR</div>
                        <div className="space-y-3">
                            <TextAreaField id="pastedImport" label="Paste Text to Import" value={pastedImportText} onChange={setPastedImportText} rows={6} placeholder="Paste a previously exported text prompt here..." labelTextColor="text-gray-700 dark:text-gray-300" className="mb-2"/>
                            <button onClick={handleImportFromPastedText} className="w-full py-2 px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-sm flex items-center justify-center gap-1.5"><ImportIcon />Import From Pasted Text</button>
                        </div>
                        <div className="my-4 text-center text-gray-500 dark:text-gray-400 text-sm">OR</div>
                        <input type="file" ref={importFileRef} accept=".txt,.csv" onChange={handleFileImport} className="hidden" id="import-arrangement-file"/>
                        <label htmlFor="import-arrangement-file" className="w-full py-2 px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded mb-2 text-sm flex items-center justify-center gap-1.5 cursor-pointer"><ImportIcon />Import from TXT/CSV File...</label>
                        <div className="mt-6 flex justify-end">
                            <button onClick={() => setShowImportExportModal(false)} className="py-2 px-4 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-800 dark:text-white rounded">Close</button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Lyric History Modal */}
            {historyModalOpen && historyModalContent && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={() => setHistoryModalOpen(false)}>
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-xl border border-green-500 max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
                        <h3 className="text-xl font-semibold text-green-700 dark:text-green-300 mb-4">History for Lyric Line</h3>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 bg-gray-100 dark:bg-gray-700 p-2 rounded border border-gray-200 dark:border-gray-600">Current: "{historyModalContent.line.currentText}"</p>
                        <div className="overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-200 dark:scrollbar-track-gray-800 flex-grow space-y-2">
                            {historyModalContent.line.history.slice().reverse().map((version, index) => (
                                <div key={index} className="flex justify-between items-center p-2 bg-gray-100 dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600">
                                    <p className="text-gray-800 dark:text-gray-200 text-sm">{version}</p>
                                    <button
                                        onClick={() => handleRevertToVersion(version)}
                                        className="ml-4 text-xs py-1 px-2 bg-blue-600 hover:bg-blue-500 text-white rounded"
                                    >
                                        Revert
                                    </button>
                                </div>
                            ))}
                        </div>
                        <button onClick={() => setHistoryModalOpen(false)} className="mt-4 py-2 px-4 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-800 dark:text-white rounded w-full">Close</button>
                    </div>
                </div>
            )}
        </div>
    );
};
export default SongStructureBuilderTool;
