import React, { useState, useCallback, useEffect, useRef } from 'react';
import Spinner from '@/components/Spinner';
import type { ToolProps } from '@/Layout';
import { useTheme } from '@/context/ThemeContext';
import Button from '@/components/common/Button';
import { resolveSunoUrlToPotentialSongId } from '@/services/sunoService';
import { fetchSunoClipById } from '@/services/sunoService';
import { fetchRiffusionSongData, extractRiffusionSongId } from '@/services/riffusionService';
import { countSyllablesInLine } from '@/utils/lyricUtils';
import InputField from '@/components/forms/InputField';
import TextAreaField from '@/components/forms/TextAreaField';
import CheckboxField from '@/components/forms/CheckboxField';
import { ImportIcon, StatsIcon, SparklesIcon, RefreshIcon, CopyIcon } from '@/components/Icons';

const LOGO_SVG_STRING = `<svg viewBox='0 0 100 100' fill='none' xmlns='http://www.w3.org/2000/svg'><path d='M50 10 L85 27.5 V72.5 L50 90 L15 72.5 V27.5 L50 10 Z' stroke='#059669' stroke-width='8' fill='transparent'/><circle cx='50' cy='35' r='7' fill='#14B8A6'/><circle cx='35' cy='65' r='6' fill='#14B8A6'/><circle cx='65' cy='65' r='6' fill='#14B8A6'/><line x1='50' y1='35' x2='35' y2='65' stroke='#10B981' stroke-width='5' stroke-linecap='round'/><line x1='50' y1='35' x2='65' y2='65' stroke='#10B981' stroke-width='5' stroke-linecap='round'/><line x1='38' y1='63' x2='62' y2='63' stroke='#10B981' stroke-width='5' stroke-linecap='round'/></svg>`;
const FALLBACK_IMAGE_DATA_URI = `data:image/svg+xml;base64,${btoa(LOGO_SVG_STRING)}`;

const InfoIcon: React.FC<{ tooltip: string, className?: string }> = ({ tooltip, className = "" }) => (
  <div className={`inline-block relative group ${className}`}>
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-300 cursor-help">
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
    </svg>
    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 p-2 text-xs text-gray-800 dark:text-white bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
      {tooltip}
    </div>
  </div>
);




const structuralKeywordsArray = ["Verse", "Chorus", "Intro", "Outro", "Bridge", "Pre-Chorus", "Post-Chorus", "Instrumental", "Guitar Solo", "Keyboard Solo", "Drum Solo", "Bass Solo", "Sax Solo", "Trumpet Solo", "Violin Solo", "Cello Solo", "Flute Solo", "Solo", "Hook", "Refrain", "Interlude", "Skit", "Spoken", "Adlib", "Vamp", "Coda", "Pre-Verse", "Post-Verse", "Pre-Bridge", "Post-Bridge", "Breakdown", "Build-up", "Drop", "Section", "Part", "Prelude", "Segway"];
const structuralMarkerPattern = new RegExp(`^(${structuralKeywordsArray.join('|')})(?:\\s+[A-Za-z0-9#]+)*(?:\\s*x\\d+)?$`, 'i');

const TOOL_CATEGORY = 'LyricProcessor';

// --- Helper functions for line numbering and case conversion ---
const addLineNumbers = (text: string): string => {
  return text.split('\n').map((line, index) => `${index + 1}. ${line}`).join('\n');
};

const stripLineNumbers = (text: string): string => {
  return text.split('\n').map(line => line.replace(/^\d+\.\s*/, '')).join('\n');
};

const toTitleCase = (str: string): string => {
  return str.replace(
    /\w\S*/g,
    (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase()
  );
};
// --- End Helper functions ---


const LyricProcessorTool: React.FC<ToolProps> = ({ trackLocalEvent }) => {
  const { uiMode } = useTheme();
  const [songTitle, setSongTitle] = useState<string>('');
  const [creatorName, setCreatorName] = useState<string>('');
  const [creatorHandle, setCreatorHandle] = useState<string>(''); // New state
  const [lyricsInput, setLyricsInput] = useState<string>('');
  const [processedOutput, setProcessedOutput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentAction, setCurrentAction] = useState<'syllables' | 'clean' | null>(null);

  const [removeSquareBrackets, setRemoveSquareBrackets] = useState<boolean>(true);
  const [removeRoundBrackets, setRemoveRoundBrackets] = useState<boolean>(false);
  const [removeCurlyBrackets, setRemoveCurlyBrackets] = useState<boolean>(false);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState<boolean>(false);
  const [copyButtonText, setCopyButtonText] = useState<string>('COPY TO CLIPBOARD');

  const [findText, setFindText] = useState<string>('');
  const [replaceText, setReplaceText] = useState<string>('');
  const [wordCount, setWordCount] = useState<number>(0);
  const [charCount, setCharCount] = useState<number>(0);
  const [replaceMessage, setReplaceMessage] = useState<string>('');
  const [isCaseSensitive, setIsCaseSensitive] = useState<boolean>(false);
  const [useRegex, setUseRegex] = useState<boolean>(false);

  // New state for line numbering
  const [showLineNumbers, setShowLineNumbers] = useState<boolean>(false);
  const lyricsInputRef = useRef<HTMLTextAreaElement>(null); // Ref for input textarea

  // New state for Suno URL loading
  const [sunoUrlInput, setSunoUrlInput] = useState<string>('');
  const [isUrlLoading, setIsUrlLoading] = useState<boolean>(false);
  const [urlLoadingProgress, setUrlLoadingProgress] = useState<string>('');
  const [sunoCoverArtUrl, setSunoCoverArtUrl] = useState<string | null>(null);


  useEffect(() => {
    const lyricsToLoad = localStorage.getItem('lyricsToProcessForLyricProcessor');
    if (lyricsToLoad) {
      setLyricsInput(lyricsToLoad);
      localStorage.removeItem('lyricsToProcessForLyricProcessor');
      const lyricsTextarea = document.getElementById('lyricsInput');
      if (lyricsTextarea) lyricsTextarea.focus();
    }
  }, []);

  // Update word/char count based on raw lyrics (without line numbers)
  useEffect(() => {
    const rawLyrics = lyricsInput; // lyricsInput state always stores raw
    const words = rawLyrics.split(/\s+/).filter(Boolean);
    setWordCount(words.length);
    setCharCount(rawLyrics.length);
  }, [lyricsInput]);

  const handleLyricsInputChange = useCallback((valueFromTextarea: string) => {
    setLyricsInput(showLineNumbers ? stripLineNumbers(valueFromTextarea) : valueFromTextarea);
  }, [showLineNumbers]);

  const handleLoadFromUrl = useCallback(async () => {
    let urlToProcess = sunoUrlInput.trim();
    if (!urlToProcess) {
      setError("Please enter a Suno, Riffusion, or Producer.AI Song URL.");
      return;
    }
    setIsUrlLoading(true);
    setError(null);
    setUrlLoadingProgress('Validating URL...');
    if (trackLocalEvent) trackLocalEvent(TOOL_CATEGORY, 'urlLoadAttempt', urlToProcess);

    if (urlToProcess.includes('producer.ai')) {
      setUrlLoadingProgress('Producer.AI URL detected, transforming to Riffusion...');
      const songId = extractRiffusionSongId(urlToProcess);
      if (songId) {
        urlToProcess = `https://www.producer.ai/song/${songId}`;
        setUrlLoadingProgress('URL transformed. Fetching from Riffusion...');
        if (trackLocalEvent) trackLocalEvent(TOOL_CATEGORY, 'urlTransformed', 'producer.ai_to_riffusion');
      } else {
        setError('Could not extract a valid song ID from the Producer.AI URL.');
        setIsUrlLoading(false);
        setUrlLoadingProgress('');
        if (trackLocalEvent) trackLocalEvent(TOOL_CATEGORY, 'urlTransformError', 'producer.ai_no_id');
        return;
      }
    }

    if (urlToProcess.includes('riffusion.com') || urlToProcess.includes('producer.ai')) {
      try {
        const songId = extractRiffusionSongId(urlToProcess);
        if (!songId) {
          throw new Error("Could not extract Riffusion song ID from URL.");
        }
        setUrlLoadingProgress(`Fetching Riffusion song details for ID: ${songId.substring(0, 8)}...`);
        const riffusionData = await fetchRiffusionSongData(songId);
        if (!riffusionData) {
          throw new Error(`Failed to fetch song details for Riffusion ID: ${songId.substring(0, 8)}...`);
        }

        setSongTitle(riffusionData.title || '');
        setCreatorName(riffusionData.artist || '');
        setCreatorHandle(riffusionData.artist.toLowerCase().replace(/\s/g, '_'));
        setLyricsInput(riffusionData.lyrics || riffusionData.prompt || ''); // Use lyrics, fallback to prompt
        setSunoCoverArtUrl(riffusionData.image_url || null);

        setUrlLoadingProgress(`Successfully loaded Riffusion song: ${riffusionData.title}`);
        if (trackLocalEvent) trackLocalEvent(TOOL_CATEGORY, 'riffusionUrlLoaded', riffusionData.title);

      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "An unknown error occurred loading from Riffusion URL.";
        setError(errorMsg);
        if (trackLocalEvent) trackLocalEvent(TOOL_CATEGORY, 'riffusionUrlLoadError', errorMsg);
      } finally {
        setIsUrlLoading(false);
        setTimeout(() => setUrlLoadingProgress(''), 3000);
        setSunoUrlInput(''); // Clear input after processing
      }
      return; // Exit after handling Riffusion
    }

    // Existing Suno logic
    try {
      const songId = await resolveSunoUrlToPotentialSongId(urlToProcess, setUrlLoadingProgress);
      if (!songId) {
        throw new Error("Could not resolve Suno URL to a song ID.");
      }
      setUrlLoadingProgress(`Fetching song details for ID: ${songId.substring(0, 8)}...`);

      const clip = await fetchSunoClipById(songId);
      if (!clip) {
        throw new Error(`Failed to fetch song details for ID: ${songId.substring(0, 8)}...`);
      }

      setSongTitle(clip.title || '');
      setCreatorName(clip.display_name || clip.handle || '');
      setCreatorHandle(clip.handle || '');
      setLyricsInput(clip.metadata?.prompt || '');
      setSunoCoverArtUrl(clip.image_url || null);

      setUrlLoadingProgress(`Successfully loaded: ${clip.title}`);
      if (trackLocalEvent) trackLocalEvent(TOOL_CATEGORY, 'sunoUrlLoaded', clip.title);

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "An unknown error occurred loading from Suno URL.";
      setError(errorMsg);
      if (trackLocalEvent) trackLocalEvent(TOOL_CATEGORY, 'sunoUrlLoadError', errorMsg);
    } finally {
      setIsUrlLoading(false);
      setTimeout(() => setUrlLoadingProgress(''), 3000);
      setSunoUrlInput(''); // Clear input after processing
    }
  }, [sunoUrlInput, trackLocalEvent]);

  const handleReplaceAll = useCallback(() => {
    if (!findText) { setReplaceMessage('Please enter text to find.'); setTimeout(() => setReplaceMessage(''), 3000); return; }
    setError(null);
    const originalText = lyricsInput; // lyricsInput is always raw
    let newText = originalText;
    let replacementsMade = 0;
    try {
      if (useRegex) {
        const regexFlags = isCaseSensitive ? 'g' : 'gi'; const regex = new RegExp(findText, regexFlags);
        newText = originalText.replace(regex, replaceText);
        const matches = originalText.match(regex); replacementsMade = matches ? matches.length : 0;
      } else {
        let tempText = originalText; let searchIndex = 0; const findLower = isCaseSensitive ? findText : findText.toLowerCase(); const originalLower = isCaseSensitive ? originalText : originalText.toLowerCase();
        newText = ""; let lastIndex = 0;
        while (searchIndex < originalText.length) {
          const foundAt = isCaseSensitive ? originalText.indexOf(findText, searchIndex) : originalLower.indexOf(findLower, searchIndex);
          if (foundAt === -1) { newText += originalText.substring(lastIndex); break; }
          newText += originalText.substring(lastIndex, foundAt); newText += replaceText; searchIndex = foundAt + findText.length; lastIndex = searchIndex; replacementsMade++;
        }
        if (lastIndex < originalText.length && replacementsMade === 0 && originalText.substring(lastIndex) !== newText) { newText += originalText.substring(lastIndex); }
        if (replacementsMade === 0 && findText !== "") {
          if (isCaseSensitive ? originalText.includes(findText) : originalLower.includes(findLower)) {
            if (isCaseSensitive) newText = originalText.replace(findText, replaceText); else newText = originalText.replace(new RegExp(findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'), replaceText);
            if (newText !== originalText) replacementsMade = 1;
          } else { newText = originalText; }
        }
      }
    } catch (e) {
      if (e instanceof Error) setError(`Regex error: ${e.message}`); else setError("An unknown error occurred during replacement.");
      setReplaceMessage('Error during replacement.'); setTimeout(() => setReplaceMessage(''), 3000); return;
    }
    setLyricsInput(newText); // Update raw lyricsInput state
    if (processedOutput) { setProcessedOutput(''); setCurrentAction(null); }
    setReplaceMessage(`${replacementsMade} occurrence(s) replaced.`);
    trackLocalEvent(TOOL_CATEGORY, 'textReplaced', 'all', replacementsMade);
    setTimeout(() => setReplaceMessage(''), 3000);
  }, [findText, replaceText, lyricsInput, processedOutput, currentAction, trackLocalEvent, isCaseSensitive, useRegex]);

  const handleCountSyllables = useCallback(() => {
    const rawLyrics = lyricsInput; // lyricsInput is always raw
    if (!rawLyrics.trim()) { setError("Please enter some lyrics to count syllables."); setProcessedOutput(''); return; }
    setIsLoading(true); setError(null); setCurrentAction('syllables'); setCopyButtonText('COPY TO CLIPBOARD');
    setTimeout(() => {
      const rawLines = rawLyrics.split('\n');
      const preProcessedLines = rawLines.map(rawLine => {
        const trimmedRawLine = rawLine.trim();
        if (trimmedRawLine.startsWith('(') && trimmedRawLine.endsWith(')')) {
          const contentInsideParentheses = trimmedRawLine.slice(1, -1).trim();
          if (structuralMarkerPattern.test(contentInsideParentheses)) return `[${contentInsideParentheses}]`;
        }
        return rawLine;
      });
      const linesForSyllableCounting = preProcessedLines;
      const outputLines = linesForSyllableCounting.map(line => {
        const trimmedLine = line.trim();
        if (!trimmedLine) return "";
        const isFullySquareBracketed = trimmedLine.startsWith('[') && trimmedLine.endsWith(']');
        const isStructural = isFullySquareBracketed || structuralMarkerPattern.test(trimmedLine);

        if (isStructural) {
          return line;
        } else {
          const count = countSyllablesInLine(line);
          const wordCountLine = line.split(/\s+/).filter(Boolean).length;
          const charCountLine = line.length;
          return `${line} (${count} syllables, ${wordCountLine} words, ${charCountLine} chars)`;
        }
      });
      setProcessedOutput(outputLines.join('\n'));
      setIsLoading(false);
      trackLocalEvent(TOOL_CATEGORY, 'syllablesCounted', undefined, wordCount);
    }, 100);
  }, [lyricsInput, wordCount, trackLocalEvent]);

  const handleCleanLyrics = useCallback(() => {
    const rawLyrics = lyricsInput; // lyricsInput is always raw
    if (!rawLyrics.trim()) { setError("Please enter lyrics to clean."); return; }
    setIsLoading(true); setError(null); setCurrentAction('clean'); setCopyButtonText('COPY TO CLIPBOARD');
    setTimeout(() => {
      let cleaned = rawLyrics;

      if (removeSquareBrackets) cleaned = cleaned.replace(/\[.*?\]/g, '');
      if (removeRoundBrackets) cleaned = cleaned.replace(/\(.*?\)/g, '');
      if (removeCurlyBrackets) cleaned = cleaned.replace(/\{.*?\}/g, '');

      // Remove empty lines if multiple
      cleaned = cleaned.replace(/\n\s*\n\s*\n/g, '\n\n');

      // Add headers if available
      let header = '';
      if (songTitle) header += `Title: ${songTitle}\n`;
      if (creatorName) header += `By: ${creatorName}\n`;
      if (creatorHandle) {
        const cleanHandle = creatorHandle.replace(/^@/, '');
        header += `Profile: https://suno.com/@${cleanHandle}\n`;
      }
      header += `Processed via: https://tools.checktrend.info/\n`;

      const copyrightNotice = `\n\nIMPORTANT COPYRIGHT NOTICE:\nThese lyrics are the intellectual property of their respective owners.\nReproduction, distribution, or public performance of these lyrics may require\npermission from the copyright holders. Please respect artist rights.\nAll rights to the original song and lyrics are retained by their respective creators and publishers.`;

      setProcessedOutput(`${header}\n${cleaned.trim()}${copyrightNotice}`);
      setIsLoading(false);
      trackLocalEvent(TOOL_CATEGORY, 'lyricsCleaned');
    }, 100);
  }, [lyricsInput, removeSquareBrackets, removeRoundBrackets, removeCurlyBrackets, songTitle, creatorName, creatorHandle, trackLocalEvent]);

  const handleCopyToClipboard = useCallback(() => {
    if (!processedOutput) return;
    navigator.clipboard.writeText(processedOutput).then(() => {
      setCopyButtonText('COPIED!');
      setTimeout(() => setCopyButtonText('COPY TO CLIPBOARD'), 2000);
      trackLocalEvent(TOOL_CATEGORY, 'outputCopied');
    });
  }, [processedOutput, trackLocalEvent]);

  const handleUpperCase = () => {
    if (!lyricsInput) return;
    const textArea = lyricsInputRef.current;
    if (textArea && textArea.selectionStart !== textArea.selectionEnd) {
      // Transform selection
      const start = textArea.selectionStart;
      const end = textArea.selectionEnd;
      const text = lyricsInput;
      const selection = text.substring(start, end);
      const newText = text.substring(0, start) + selection.toUpperCase() + text.substring(end);
      setLyricsInput(newText);
      // Restore selection? Not strictly necessary but nice.
    } else {
      setLyricsInput(lyricsInput.toUpperCase());
    }
    trackLocalEvent(TOOL_CATEGORY, 'caseConverted', 'upper');
  };

  const handleLowerCase = () => {
    if (!lyricsInput) return;
    const textArea = lyricsInputRef.current;
    if (textArea && textArea.selectionStart !== textArea.selectionEnd) {
      const start = textArea.selectionStart;
      const end = textArea.selectionEnd;
      const text = lyricsInput;
      const selection = text.substring(start, end);
      const newText = text.substring(0, start) + selection.toLowerCase() + text.substring(end);
      setLyricsInput(newText);
    } else {
      setLyricsInput(lyricsInput.toLowerCase());
    }
    trackLocalEvent(TOOL_CATEGORY, 'caseConverted', 'lower');
  };

  const handleTitleCase = () => {
    if (!lyricsInput) return;
    const textArea = lyricsInputRef.current;
    if (textArea && textArea.selectionStart !== textArea.selectionEnd) {
      const start = textArea.selectionStart;
      const end = textArea.selectionEnd;
      const text = lyricsInput;
      const selection = text.substring(start, end);
      const newText = text.substring(0, start) + toTitleCase(selection) + text.substring(end);
      setLyricsInput(newText);
    } else {
      setLyricsInput(toTitleCase(lyricsInput));
    }
    trackLocalEvent(TOOL_CATEGORY, 'caseConverted', 'title');
  };


  return (
    <div className={`w-full ${uiMode === 'classic' ? 'max-w-7xl mx-auto px-4 pb-20' : ''}`}>
      {uiMode === 'classic' ? (
        <header className="mb-6 text-center pt-8">
          <h1 className="text-2xl md:text-3xl font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-tight">
            Lyric Lab
          </h1>
          <p className="mt-2 text-[11px] font-medium text-gray-600 dark:text-gray-400 max-w-3xl mx-auto text-center">
            Semantic Signal Refinement • Advanced Linguistic Extraction
          </p>
        </header>
      ) : (
        <header className="mb-2 md:mb-14 text-center pt-0 md:pt-8 px-4 animate-fadeIn">
          <h1 className="text-3xl sm:text-5xl md:text-7xl font-black uppercase tracking-tighter text-emerald-600 dark:text-emerald-500 leading-none italic drop-shadow-2xl mb-1 md:mb-4">Lyric Lab</h1>
          <p className="mt-1 md:mt-4 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.4em] text-gray-500 dark:text-gray-400 max-w-xl mx-auto opacity-70">
            Advanced Lyric Decomposition • Neural Verse Synthesizer
          </p>
        </header>
      )}

      <main className="w-full glass-card p-2 sm:p-8 md:p-12 border-white/10 text-gray-900 dark:text-gray-200 transition-all duration-500 animate-fadeIn overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 blur-[100px] pointer-events-none"></div>

        {/* URL Load Section */}
        <div className="flex flex-col sm:flex-row items-end gap-2 mb-8 bg-white/5 p-4 rounded-2xl border border-white/10 animate-fadeIn relative z-10">
          <div className="flex-grow w-full">
            <InputField 
              id="sunoUrlInput" 
              label="Import from Source URL" 
              value={sunoUrlInput} 
              onChange={setSunoUrlInput} 
              placeholder="Suno, Riffusion, or Producer.ai song link" 
              className="mb-0" 
              disabled={isUrlLoading}
            />
          </div>
          <Button 
            onClick={handleLoadFromUrl} 
            disabled={isUrlLoading || !sunoUrlInput.trim()} 
            variant="primary" 
            size="md" 
            className="w-full sm:w-auto h-[42px] font-black uppercase tracking-widest text-[9px] px-8 shadow-green-500/10 shadow-xl flex items-center justify-center whitespace-nowrap"
            backgroundColor="#10b981"
            startIcon={isUrlLoading ? null : <ImportIcon className="w-4 h-4" />}
          >
            {isUrlLoading ? <Spinner size="w-3 h-3" color="text-white" /> : "Load Data"}
          </Button>
        </div>
        <div className="relative z-10">
          {urlLoadingProgress && <p className="text-[10px] font-black uppercase tracking-widest text-yellow-600 dark:text-yellow-500 mt-3 ml-1 animate-pulse">{urlLoadingProgress}</p>}
          {error && <p className="text-[10px] font-black uppercase tracking-widest text-red-600 dark:text-red-400 mt-3 ml-1">{error}</p>}
        </div>

        {/* Song Info (Optional) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <InputField id="songTitle" label="Song Title (Optional)" value={songTitle} onChange={setSongTitle} placeholder="e.g., My Awesome Song" />
          <InputField id="creatorName" label="Creator/Artist (Optional)" value={creatorName} onChange={setCreatorName} placeholder="e.g., DJ AI" />
        </div>

        {/* Lyrics Input */}
        <div className="mb-10 relative z-10">
          <div className="flex justify-between items-end mb-4 px-1">
            <div>
              <label htmlFor="lyricsInput" className="block text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-500 opacity-80 mb-1">Lyrics Workspace</label>
              <div className="flex gap-4 text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-600">
                <span>Words: {wordCount}</span>
                <span>Chars: {charCount}</span>
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer group">
              <input 
                type="checkbox" 
                checked={showLineNumbers} 
                onChange={(e) => setShowLineNumbers(e.target.checked)} 
                className="w-4 h-4 rounded-md border-white/20 bg-white/5 text-emerald-500 focus:ring-emerald-500/20 transition-all"
              />
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 group-hover:text-emerald-500 transition-colors">Line Numbers</span>
            </label>
          </div>
          
          <div className="relative group">
            <TextAreaField
              id="lyricsInput"
              textareaRef={lyricsInputRef}
              label=""
              value={showLineNumbers ? addLineNumbers(lyricsInput) : lyricsInput}
              onChange={handleLyricsInputChange}
              placeholder="Paste your lyrics here..."
              rows={14}
              className="mb-0 focus-within:ring-4 focus-within:ring-emerald-500/10 transition-all"
            />
            
            {/* Formatting Toolbar */}
            <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              <Button onClick={handleUpperCase} variant="ghost" size="sm" className="w-10 h-10 p-0 rounded-xl bg-white/10 dark:bg-black/40 border-white/10 text-xs font-black" title="UPPERCASE">AA</Button>
              <Button onClick={handleLowerCase} variant="ghost" size="sm" className="w-10 h-10 p-0 rounded-xl bg-white/10 dark:bg-black/40 border-white/10 text-xs font-black" title="lowercase">aa</Button>
              <Button onClick={handleTitleCase} variant="ghost" size="sm" className="w-10 h-10 p-0 rounded-xl bg-white/10 dark:bg-black/40 border-white/10 text-xs font-black" title="Title Case">Aa</Button>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10 relative z-10">
          {/* Format & Analyze */}
          <div className="bg-black/5 dark:bg-black/20 p-8 rounded-3xl border border-white/5 space-y-6">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-600 dark:text-emerald-500 opacity-70 mb-2">Refinery & Analysis</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <CheckboxField id="removeSquare" label="Strip [ ]" checked={removeSquareBrackets} onChange={setRemoveSquareBrackets} />
              <CheckboxField id="removeRound" label="Strip ( )" checked={removeRoundBrackets} onChange={setRemoveRoundBrackets} />
              <CheckboxField id="removeCurly" label="Strip { }" checked={removeCurlyBrackets} onChange={setRemoveCurlyBrackets} />
            </div>
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button onClick={handleCountSyllables} disabled={isLoading || !lyricsInput.trim()} variant="ghost" startIcon={<StatsIcon className="w-4 h-4" />} className="flex-1 font-black uppercase tracking-widest text-[10px] border-white/10 hover:bg-blue-500/20 text-blue-500">Count Syllables</Button>
              <Button onClick={handleCleanLyrics} disabled={isLoading || !lyricsInput.trim()} variant="primary" startIcon={<SparklesIcon className="w-4 h-4" />} className="flex-1 font-black uppercase tracking-widest text-[10px]" backgroundColor="#10b981">Clean & Header</Button>
            </div>
          </div>

          {/* Find & Replace */}
          <div className="bg-black/5 dark:bg-black/20 p-8 rounded-3xl border border-white/5 space-y-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-600 dark:text-emerald-500 opacity-70">Find & Replace</h3>
              <Button onClick={() => setShowAdvancedOptions(!showAdvancedOptions)} variant="ghost" size="xs" className="text-[8px] font-black uppercase tracking-widest text-blue-500 hover:text-blue-400 transition-colors underline underline-offset-4 border-none shadow-none">{showAdvancedOptions ? 'Simple mode' : 'Advanced regex'}</Button>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <InputField id="findText" label="" value={findText} onChange={setFindText} placeholder="Find..." className="mb-0" />
              <InputField id="replaceText" label="" value={replaceText} onChange={setReplaceText} placeholder="Replace..." className="mb-0" />
            </div>

            {showAdvancedOptions && (
              <div className="flex gap-6 py-2">
                <CheckboxField id="caseSensitive" label="Case Sensitive" checked={isCaseSensitive} onChange={setIsCaseSensitive} className="mb-0" />
                <CheckboxField id="useRegex" label="Use Regex" checked={useRegex} onChange={setUseRegex} className="mb-0" />
              </div>
            )}

            <Button onClick={handleReplaceAll} disabled={isLoading || !findText} variant="ghost" startIcon={<RefreshIcon className="w-4 h-4" />} className="w-full font-black uppercase tracking-widest text-[10px] border-white/10 hover:bg-purple-500/20 text-purple-500">Execute Replacement</Button>
            {replaceMessage && <p className="text-[10px] font-black uppercase tracking-widest text-center mt-2 text-emerald-500 animate-fadeIn">{replaceMessage}</p>}
          </div>
        </div>

        {/* Output */}
        {processedOutput && (
          <div className="mt-12 pt-10 border-t border-white/10 animate-fadeIn relative z-10">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-600 dark:text-emerald-500 mb-6 text-center opacity-70">Processed Output</h3>
            <TextAreaField
              id="outputArea"
              label=""
              value={showLineNumbers ? addLineNumbers(processedOutput) : processedOutput}
              onChange={() => { }}
              readOnly
              rows={14}
              className="mb-6 bg-slate-50/50 dark:bg-black/30 ring-1 ring-gray-200 dark:ring-white/5"
            />
            <Button 
                onClick={handleCopyToClipboard} 
                variant="primary" 
                size="lg" 
                startIcon={<CopyIcon className="w-6 h-6 text-black" />}
                className="w-full font-black uppercase tracking-[0.2em] py-6 shadow-2xl"
                backgroundColor="#eab308"
            >
              <span className="text-black">{copyButtonText}</span>
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default LyricProcessorTool;