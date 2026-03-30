import React, { useState, useCallback, useEffect, useRef } from 'react';
import Spinner from '../../components/Spinner';
import type { ToolProps } from '../../Layout';
import { resolveSunoUrlToPotentialSongId } from '../../services/sunoService';
import { fetchSunoClipById } from '../../services/sunoService';
import { fetchRiffusionSongData, extractRiffusionSongId } from '../../services/riffusionService';
import { countSyllablesInLine } from '../../utils/lyricUtils';
import InputField from '../../components/forms/InputField';
import TextAreaField from '../../components/forms/TextAreaField';
import CheckboxField from '../../components/forms/CheckboxField';

const LOGO_SVG_STRING = `<svg viewBox='0 0 100 100' fill='none' xmlns='http://www.w3.org/2000/svg'><path d='M50 10 L85 27.5 V72.5 L50 90 L15 72.5 V27.5 L50 10 Z' stroke='#059669' stroke-width='8' fill='transparent'/><circle cx='50' cy='35' r='7' fill='#14B8A6'/><circle cx='35' cy='65' r='6' fill='#14B8A6'/><circle cx='65' cy='65' r='6' fill='#14B8A6'/><line x1='50' y1='35' x2='35' y2='65' stroke='#10B981' stroke-width='5' stroke-linecap='round'/><line x1='50' y1='35' x2='65' y2='65' stroke='#10B981' stroke-width='5' stroke-linecap='round'/><line x1='38' y1='63' x2='62' y2='63' stroke='#10B981' stroke-width='5' stroke-linecap='round'/></svg>`;
const FALLBACK_IMAGE_DATA_URI = `data:image/svg+xml;base64,${btoa(LOGO_SVG_STRING)}`;

const InfoIcon: React.FC<{ tooltip: string, className?: string }> = ({ tooltip, className = "" }) => (
  <div className={`inline-block relative group ${className}`}>
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-gray-400 hover:text-green-600 dark:hover:text-green-300 cursor-help">
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
    </svg>
    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 p-2 text-xs text-gray-800 dark:text-white bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
      {tooltip}
    </div>
  </div>
);

const LinkIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" /></svg>);


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
    <div className="w-full">
      <header className="mb-10 text-center">
        <h1 className="text-5xl font-extrabold text-green-600 dark:text-green-400">Lyric Processor</h1>
        <p className="mt-3 text-md text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
          Clean, format, analyze, and perfect your lyrics. Import from Suno/Riffusion, count syllables, find & replace, and more.
        </p>
      </header>

      <main className="w-full bg-white dark:bg-gray-900 shadow-2xl rounded-lg p-6 md:p-10 border-2 border-green-600 dark:border-green-500">
        {/* URL Load Section */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Load from Suno/Riffusion/Producer.AI URL</label>
          <div className="flex rounded-md shadow-sm">
            <input
              type="text"
              value={sunoUrlInput}
              onChange={(e) => setSunoUrlInput(e.target.value)}
              placeholder="suno.com/..., riffusion.com/..., producer.ai/..."
              className="block w-full flex-1 rounded-none rounded-l-md border-gray-300 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 px-3 py-2 text-gray-900 dark:text-white placeholder-gray-400 focus:border-green-500 focus:ring-green-500 sm:text-sm"
              disabled={isUrlLoading}
            />
            <button
              type="button"
              onClick={handleLoadFromUrl}
              disabled={isUrlLoading || !sunoUrlInput.trim()}
              className="relative -ml-px inline-flex items-center space-x-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 disabled:opacity-50"
            >
              {isUrlLoading ? <Spinner size="w-4 h-4" color="text-white" /> : <span>Load</span>}
            </button>
          </div>
          {urlLoadingProgress && <p className="text-xs text-yellow-600 dark:text-yellow-300 mt-1">{urlLoadingProgress}</p>}
          {error && <p className="text-xs text-red-600 dark:text-red-400 mt-1">{error}</p>}
        </div>

        {/* Song Info (Optional) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <InputField id="songTitle" label="Song Title (Optional)" value={songTitle} onChange={setSongTitle} placeholder="e.g., My Awesome Song" />
          <InputField id="creatorName" label="Creator/Artist (Optional)" value={creatorName} onChange={setCreatorName} placeholder="e.g., DJ AI" />
        </div>

        {/* Lyrics Input */}
        <div className="mb-6 relative">
          <div className="flex justify-between items-center mb-1">
            <label htmlFor="lyricsInput" className="block text-sm font-medium text-green-600 dark:text-green-400">Lyrics Input</label>
            <div className="text-xs text-gray-500 dark:text-gray-400 space-x-3">
              <span>Words: {wordCount}</span>
              <span>Chars: {charCount}</span>
              <label className="inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={showLineNumbers} onChange={(e) => setShowLineNumbers(e.target.checked)} className="form-checkbox h-3 w-3 text-green-500 rounded border-gray-300 focus:ring-green-500" />
                <span className="ml-1">Line Numbers</span>
              </label>
            </div>
          </div>
          <TextAreaField
            id="lyricsInput"
            textareaRef={lyricsInputRef}
            label=""
            value={showLineNumbers ? addLineNumbers(lyricsInput) : lyricsInput}
            onChange={handleLyricsInputChange}
            placeholder="Paste your lyrics here..."
            rows={12}
          />

          {/* Formatting Toolbar */}
          <div className="flex flex-wrap gap-2 mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 justify-center sm:justify-start">
            <button onClick={handleUpperCase} className="px-2 py-1 text-xs font-medium bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded" title="Convert to Uppercase">AA</button>
            <button onClick={handleLowerCase} className="px-2 py-1 text-xs font-medium bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded" title="Convert to Lowercase">aa</button>
            <button onClick={handleTitleCase} className="px-2 py-1 text-xs font-medium bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded" title="Convert to Title Case">Aa</button>
          </div>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-6">
          {/* Clean & Format */}
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-md font-semibold text-green-700 dark:text-green-300 mb-3 border-b border-gray-300 dark:border-gray-600 pb-2">Format & Analyze</h3>
            <div className="space-y-2 mb-4">
              <CheckboxField id="removeSquare" label="Remove Square Brackets [ ]" checked={removeSquareBrackets} onChange={setRemoveSquareBrackets} />
              <CheckboxField id="removeRound" label="Remove Round Brackets ( )" checked={removeRoundBrackets} onChange={setRemoveRoundBrackets} />
              <CheckboxField id="removeCurly" label="Remove Curly Brackets { }" checked={removeCurlyBrackets} onChange={setRemoveCurlyBrackets} />
            </div>
            <div className="flex gap-2">
              <button onClick={handleCountSyllables} disabled={isLoading || !lyricsInput.trim()} className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-md text-sm font-medium disabled:opacity-50">Count Syllables</button>
              <button onClick={handleCleanLyrics} disabled={isLoading || !lyricsInput.trim()} className="flex-1 py-2 px-3 bg-green-600 hover:bg-green-500 text-white rounded-md text-sm font-medium disabled:opacity-50">Clean Lyrics</button>
            </div>
          </div>

          {/* Find & Replace */}
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-3 border-b border-gray-300 dark:border-gray-600 pb-2">
              <h3 className="text-md font-semibold text-green-700 dark:text-green-300">Find & Replace</h3>
              <button onClick={() => setShowAdvancedOptions(!showAdvancedOptions)} className="text-xs text-blue-500 hover:text-blue-400 underline">{showAdvancedOptions ? 'Hide Options' : 'Show Options'}</button>
            </div>
            <div className="space-y-3">
              <InputField id="findText" label="Find" value={findText} onChange={setFindText} placeholder="Text to find..." className="mb-0" />
              <InputField id="replaceText" label="Replace With" value={replaceText} onChange={setReplaceText} placeholder="Replacement text..." className="mb-0" />

              {showAdvancedOptions && (
                <div className="flex gap-4 mt-2">
                  <CheckboxField id="caseSensitive" label="Case Sensitive" checked={isCaseSensitive} onChange={setIsCaseSensitive} className="mb-0" />
                  <CheckboxField id="useRegex" label="Use Regex" checked={useRegex} onChange={setUseRegex} className="mb-0" />
                </div>
              )}

              <button onClick={handleReplaceAll} disabled={isLoading || !findText} className="w-full py-2 px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md text-sm font-medium disabled:opacity-50 mt-2">Replace All</button>
              {replaceMessage && <p className={`text-xs text-center mt-1 ${replaceMessage.includes('Error') ? 'text-red-500' : 'text-green-600 dark:text-green-400'}`}>{replaceMessage}</p>}
            </div>
          </div>
        </div>

        {/* Output */}
        {processedOutput && (
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 animate-fadeIn">
            <h3 className="text-xl font-semibold text-green-700 dark:text-green-300 mb-3">Processed Output</h3>
            <TextAreaField
              id="outputArea"
              label=""
              value={showLineNumbers ? addLineNumbers(processedOutput) : processedOutput}
              onChange={() => { }}
              readOnly
              rows={12}
              className="mb-3"
            />
            <button onClick={handleCopyToClipboard} className="w-full py-3 bg-yellow-500 hover:bg-yellow-600 text-black font-bold rounded-md shadow-md transition-colors">
              {copyButtonText}
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default LyricProcessorTool;