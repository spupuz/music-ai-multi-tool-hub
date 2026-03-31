
import React, { useState, useCallback, useEffect, useRef } from 'react';
import Spinner from '@/components/Spinner';
import type { ToolProps } from '@/Layout';
import { resolveSunoUrlToPotentialSongId } from '@/services/sunoService';
import { fetchSunoClipById } from '@/services/sunoService';
import { fetchRiffusionSongData, extractRiffusionSongId } from '@/services/riffusionService';
import type { SynchronizedLyricLine } from '@/types';

const LOGO_SVG_STRING = `<svg viewBox='0 0 100 100' fill='none' xmlns='http://www.w3.org/2000/svg'><path d='M50 10 L85 27.5 V72.5 L50 90 L15 72.5 V27.5 L50 10 Z' stroke='#059669' stroke-width='8' fill='transparent'/><circle cx='50' cy='35' r='7' fill='#14B8A6'/><circle cx='35' cy='65' r='6' fill='#14B8A6'/><circle cx='65' cy='65' r='6' fill='#14B8A6'/><line x1='50' y1='35' x2='35' y2='65' stroke='#10B981' stroke-width='5' stroke-linecap='round'/><line x1='50' y1='35' x2='65' y2='65' stroke='#10B981' stroke-width='5' stroke-linecap='round'/><line x1='38' y1='63' x2='62' y2='63' stroke='#10B981' stroke-width='5' stroke-linecap='round'/></svg>`;
const FALLBACK_IMAGE_DATA_URI = `data:image/svg+xml;base64,${btoa(LOGO_SVG_STRING)}`;


// Local type extending the one from types.ts to include the ref
interface LyricLine extends SynchronizedLyricLine {
  ref: React.RefObject<HTMLDivElement>;
}

// Simplified InputField for this tool
const InputField: React.FC<{
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
  required?: boolean;
  className?: string;
}> = ({ id, label, value, onChange, placeholder, type = "text", required = false, className = "" }) => (
  <div className={`mb-6 ${className}`}>
    <label htmlFor={id} className="block text-sm font-medium text-green-600 dark:text-green-400 mb-1">
      {label}
    </label>
    <input
      type={type}
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-green-500 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-green-500 dark:focus:border-green-400 sm:text-sm text-gray-900 dark:text-white"
      required={required}
      aria-label={label}
    />
  </div>
);

const TextAreaField: React.FC<{
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  rows?: number;
  required?: boolean;
  textareaRef?: React.RefObject<HTMLTextAreaElement>; // Added ref prop
}> = ({ id, label, value, onChange, placeholder, rows = 10, required = false, textareaRef }) => (
  <div className="mb-6">
    <label htmlFor={id} className="block text-sm font-medium text-green-600 dark:text-green-400 mb-1">
      {label}
    </label>
    <textarea
      id={id}
      ref={textareaRef} // Assign ref
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-green-500 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-green-500 dark:focus:border-green-400 sm:text-sm text-gray-900 dark:text-white resize-y font-mono"
      required={required}
      aria-label={label}
    />
  </div>
);

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

const PlayIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M8 5v14l11-7z" /></svg>);
const PauseIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>);
const VolumeUpIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" /></svg>);
const VolumeMuteIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75L19.5 12m0 0l2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-3L9 12.75" /><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.5l16.5 16.5m-16.5 0L20.25 4.5" /></svg>);

const structuralKeywordsArray = ["Verse", "Chorus", "Intro", "Outro", "Bridge", "Pre-Chorus", "Post-Chorus", "Instrumental", "Guitar Solo", "Keyboard Solo", "Drum Solo", "Bass Solo", "Sax Solo", "Trumpet Solo", "Violin Solo", "Cello Solo", "Flute Solo", "Solo", "Hook", "Refrain", "Interlude", "Skit", "Spoken", "Adlib", "Vamp", "Coda", "Pre-Verse", "Post-Verse", "Pre-Bridge", "Post-Bridge", "Breakdown", "Build-up", "Drop", "Section", "Part", "Prelude", "Segway"];
const structuralMarkerPattern = new RegExp(`^(${structuralKeywordsArray.join('|')})(?:\\s+[A-Za-z0-9#]+)*(?:\\s*x\\d+)?$`, 'i');

const TOOL_CATEGORY = 'LyricsSynchronizer';

const LyricsSynchronizerTool: React.FC<ToolProps> = ({ trackLocalEvent }) => {
  const [songTitle, setSongTitle] = useState<string>('');
  const [artistName, setArtistName] = useState<string>('');
  const [sunoUrlInput, setSunoUrlInput] = useState<string>('');
  const [isUrlLoading, setIsUrlLoading] = useState<boolean>(false);
  const [urlLoadingProgress, setUrlLoadingProgress] = useState<string>('');
  const [sunoCoverArtUrl, setSunoCoverArtUrl] = useState<string | null>(null);

  const [rawLyrics, setRawLyrics] = useState<string>('');
  const [parsedLines, setParsedLines] = useState<LyricLine[]>([]);

  const [audioSrc, setAudioSrc] = useState<string | null>(null);
  const [audioFileName, setAudioFileName] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const audioFileInputRef = useRef<HTMLInputElement>(null);
  const lrcFileInputRef = useRef<HTMLInputElement>(null);

  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playerVolume, setPlayerVolume] = useState<number>(0.75);

  const [highlightedLineIndex, setHighlightedLineIndex] = useState<number | null>(null);
  const [isKaraokeMode, setIsKaraokeMode] = useState<boolean>(false);
  const [lastAutoMarkedIndex, setLastAutoMarkedIndex] = useState<number>(-1);
  const [selectedLineForMarkingId, setSelectedLineForMarkingId] = useState<string | null>(null);

  const [editingLineId, setEditingLineId] = useState<string | null>(null);
  const [manualTimestampValue, setManualTimestampValue] = useState<string>('');
  const manualInputRef = useRef<HTMLInputElement>(null);
  const seekBarRef = useRef<HTMLInputElement>(null);

  const [exportCopyStatus, setExportCopyStatus] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('');

  const lineRefs = useRef<Array<React.RefObject<HTMLDivElement>>>([]);

  const formatTime = useCallback((secs: number | null): string => {
    if (secs === null || isNaN(secs) || secs < 0) return '--:--.---';
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    const milliseconds = Math.floor((secs % 1) * 1000);
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(milliseconds).padStart(3, '0')}`;
  }, []);

  useEffect(() => {
    const linesArray = rawLyrics.split('\n');
    lineRefs.current = linesArray.map((_, i) => lineRefs.current[i] || React.createRef());

    const rangeTimestampRegex = /^\s*\[(\d{2}:\d{2}(?:\.\d{1,3})?)\s*-\s*\d{2}:\d{2}(?:\.\d{1,3})?\]\s*(.*)/;

    setParsedLines(prevParsedLines => {
      const newParsedLines = linesArray.map((text, index) => {
        const rangeMatch = text.match(rangeTimestampRegex);
        let timestampFromRange: number | null = null;
        let textFromRange = text;

        if (rangeMatch) {
          timestampFromRange = parseTimeInputToSeconds(rangeMatch[1]);
          textFromRange = rangeMatch[2].trim();
        }

        const existingLineAtIndex = prevParsedLines[index];
        let finalTimestamp = null;
        let lineId = `line-${index}-${textFromRange.substring(0, 10)}-${Date.now()}-${Math.random().toString(16).slice(2)}`;

        if (timestampFromRange !== null) {
          finalTimestamp = timestampFromRange;
        } else if (existingLineAtIndex && existingLineAtIndex.text === textFromRange) {
          finalTimestamp = existingLineAtIndex.timestamp;
          lineId = existingLineAtIndex.id;
        }
        return {
          id: lineId,
          text: textFromRange,
          timestamp: finalTimestamp,
          ref: lineRefs.current[index],
        };
      });

      if (selectedLineForMarkingId) {
        const oldSelectedLine = prevParsedLines.find(l => l.id === selectedLineForMarkingId);
        const newSelectedLine = newParsedLines.find(l => oldSelectedLine && l.text === oldSelectedLine.text && l.timestamp === oldSelectedLine.timestamp);
        if (!newSelectedLine) setSelectedLineForMarkingId(null);
        else if (newSelectedLine.id !== selectedLineForMarkingId) setSelectedLineForMarkingId(newSelectedLine.id);
      }
      return newParsedLines;
    });
  }, [rawLyrics]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => { if (audio.duration && isFinite(audio.duration)) setDuration(audio.duration); };
    const handlePlay = () => setIsPlaying(true); const handlePause = () => setIsPlaying(false); const handleEnded = () => setIsPlaying(false);
    audio.addEventListener('timeupdate', updateTime); audio.addEventListener('durationchange', updateDuration); audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('play', handlePlay); audio.addEventListener('pause', handlePause); audio.addEventListener('ended', handleEnded);
    audio.volume = playerVolume;
    return () => { audio.removeEventListener('timeupdate', updateTime); audio.removeEventListener('durationchange', updateDuration); audio.removeEventListener('loadedmetadata', updateDuration); audio.removeEventListener('play', handlePlay); audio.removeEventListener('pause', handlePause); audio.removeEventListener('ended', handleEnded); };
  }, [audioSrc, playerVolume]);

  useEffect(() => {
    if (isKaraokeMode && isPlaying && parsedLines.some(line => line.timestamp !== null)) {
      let currentLineIdx = -1;
      for (let i = 0; i < parsedLines.length; i++) {
        if (parsedLines[i].timestamp !== null && parsedLines[i].timestamp! <= currentTime) {
          if (i + 1 < parsedLines.length && parsedLines[i + 1].timestamp !== null && parsedLines[i + 1].timestamp! > currentTime) {
            currentLineIdx = i; break;
          } else if (i + 1 === parsedLines.length) { currentLineIdx = i; break; }
        } else if (parsedLines[i].timestamp !== null && parsedLines[i].timestamp! > currentTime && currentLineIdx === -1) { currentLineIdx = (i > 0 && parsedLines[i - 1].timestamp !== null) ? i - 1 : -1; break; }
      }
      setHighlightedLineIndex(currentLineIdx);
      if (currentLineIdx !== -1 && lineRefs.current[currentLineIdx]?.current) {
        lineRefs.current[currentLineIdx].current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } else if (!isKaraokeMode && selectedLineForMarkingId) {
      const selectedIndex = parsedLines.findIndex(l => l.id === selectedLineForMarkingId);
      if (selectedIndex !== -1 && lineRefs.current[selectedIndex]?.current) {
        lineRefs.current[selectedIndex].current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [isKaraokeMode, isPlaying, currentTime, parsedLines, selectedLineForMarkingId]);


  const handleAudioFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAudioSrc(URL.createObjectURL(file)); setAudioFileName(file.name); setSongTitle(file.name.replace(/\.[^/.]+$/, ""));
      setArtistName(''); setSunoUrlInput(''); setSunoCoverArtUrl(null);
      setError(null); trackLocalEvent(TOOL_CATEGORY, 'audioFileUploaded', file.name);
    }
  };

  const handleLoadFromUrl = async () => {
    let urlInput = sunoUrlInput.trim();
    if (!urlInput) { setError("Please enter a Suno, Riffusion, or Producer.AI Song URL."); return; }
    setIsUrlLoading(true); setError(null); setUrlLoadingProgress('Validating URL...');
    if (trackLocalEvent) trackLocalEvent(TOOL_CATEGORY, 'urlLoadAttempted', urlInput);
    if (audioFileInputRef.current) audioFileInputRef.current.value = ""; setAudioSrc(null); setAudioFileName(null);
    setSongTitle(''); setArtistName(''); setSunoCoverArtUrl(null); setRawLyrics(''); setParsedLines([]);

    if (urlInput.includes('producer.ai')) {
      setUrlLoadingProgress('Producer.AI URL detected, transforming to Riffusion...');
      const songId = extractRiffusionSongId(urlInput);
      if (songId) {
        urlInput = `https://www.producer.ai/song/${songId}`;
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

    if (urlInput.includes('riffusion.com') || urlInput.includes('producer.ai')) {
      try {
        const songId = extractRiffusionSongId(urlInput);
        if (!songId) throw new Error("Could not extract Riffusion song ID from URL.");
        setUrlLoadingProgress(`Fetching Riffusion song: ${songId.substring(0, 8)}...`);
        const riffusionData = await fetchRiffusionSongData(songId);
        if (!riffusionData) throw new Error(`Failed to fetch song details for Riffusion ID: ${songId.substring(0, 8)}...`);

        setSongTitle(riffusionData.title || ''); setArtistName(riffusionData.artist || ''); setSunoCoverArtUrl(riffusionData.image_url || null);
        setAudioSrc(riffusionData.audio_url || null);
        if (riffusionData.audio_url) setAudioFileName(riffusionData.title || 'riffusion_song.mp3');

        if (riffusionData.lyrics_timestamped && riffusionData.lyrics_timestamped.words.length > 0) {
          const linesMap = new Map<number, { textParts: string[], firstTimestamp: number }>();
          for (const word of riffusionData.lyrics_timestamped.words) {
            if (!linesMap.has(word.line_index)) linesMap.set(word.line_index, { textParts: [], firstTimestamp: word.start });
            const line = linesMap.get(word.line_index)!;
            line.textParts.push(word.text);
            if (word.start < line.firstTimestamp) line.firstTimestamp = word.start;
          }
          const sortedLines = Array.from(linesMap.entries()).sort((a, b) => a[0] - b[0]);
          const newRawLyricsLines: string[] = [];
          const newParsedLines: LyricLine[] = [];
          let currentLineIndex = 0;
          for (const [lineIndex, { textParts, firstTimestamp }] of sortedLines) {
            while (currentLineIndex < lineIndex) { newRawLyricsLines.push(''); newParsedLines.push({ id: `line-empty-${currentLineIndex}-${Date.now()}`, text: '', timestamp: null, ref: React.createRef() }); currentLineIndex++; }
            const lineText = textParts.join(' ').trim();
            newRawLyricsLines.push(lineText);
            newParsedLines.push({ id: `line-${lineIndex}-${Date.now()}`, text: lineText, timestamp: firstTimestamp, ref: React.createRef() });
            currentLineIndex++;
          }
          setRawLyrics(newRawLyricsLines.join('\n')); setParsedLines(newParsedLines);
          setStatusMessage('Riffusion song with timestamps loaded!'); setTimeout(() => setStatusMessage(''), 3000);
          if (trackLocalEvent) trackLocalEvent(TOOL_CATEGORY, 'riffusionUrlLoadedWithTimestamps', riffusionData.title);
        } else {
          setRawLyrics(riffusionData.lyrics || riffusionData.prompt || '');
          setStatusMessage('Riffusion song loaded (no timestamps found).');
          setTimeout(() => setStatusMessage(''), 3000);
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "An unknown error occurred loading from Riffusion URL."; setError(errorMsg); if (trackLocalEvent) trackLocalEvent(TOOL_CATEGORY, 'riffusionUrlLoadError', errorMsg);
      } finally { setIsUrlLoading(false); setUrlLoadingProgress(''); setSunoUrlInput(''); }
    } else { // Assume Suno
      try {
        const songId = await resolveSunoUrlToPotentialSongId(urlInput, setUrlLoadingProgress);
        if (!songId) throw new Error("Could not resolve Suno URL to a song ID.");
        setUrlLoadingProgress(`Fetching song details for ID: ${songId.substring(0, 8)}...`);
        const clip = await fetchSunoClipById(songId);
        if (!clip || !clip.audio_url) throw new Error(`Failed to fetch song details or audio URL for ID: ${songId.substring(0, 8)}...`);
        setAudioSrc(clip.audio_url); setAudioFileName(clip.title || `Suno Song ${clip.id.substring(0, 8)}`);
        setSongTitle(clip.title || ''); setArtistName(clip.display_name || clip.handle || ''); setSunoCoverArtUrl(clip.image_url || null);
        setRawLyrics(clip.metadata?.prompt || ''); setUrlLoadingProgress(`Audio loaded: ${clip.title || 'Suno Song'}`);
        if (trackLocalEvent) trackLocalEvent(TOOL_CATEGORY, 'sunoAudioLoaded', clip.title);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "An unknown error occurred loading from Suno URL."; setError(errorMsg); if (trackLocalEvent) trackLocalEvent(TOOL_CATEGORY, 'sunoUrlLoadError', errorMsg);
      } finally { setIsUrlLoading(false); setUrlLoadingProgress(''); setSunoUrlInput(''); }
    }
  };

  const handleMarkTimestamp = useCallback((lineId: string) => { if (audioRef.current) { const timestamp = audioRef.current.currentTime; setParsedLines(prevLines => prevLines.map(line => line.id === lineId ? { ...line, timestamp } : line)); trackLocalEvent(TOOL_CATEGORY, 'timestampMarked', lineId); } }, [trackLocalEvent]);
  const handleClearTimestamp = useCallback((lineId: string) => { setParsedLines(prevLines => prevLines.map(line => line.id === lineId ? { ...line, timestamp: null } : line)); trackLocalEvent(TOOL_CATEGORY, 'timestampCleared', lineId); }, [trackLocalEvent]);

  const handleClearAllTimestamps = useCallback(() => { setParsedLines(prevLines => prevLines.map(line => ({ ...line, timestamp: null }))); setLastAutoMarkedIndex(-1); setSelectedLineForMarkingId(null); setStatusMessage("All timestamps cleared."); trackLocalEvent(TOOL_CATEGORY, 'allTimestampsCleared'); setTimeout(() => setStatusMessage(''), 3000); }, [trackLocalEvent]);
  const handleLyricLineClick = useCallback((lineId: string, lineText: string) => { if (isKaraokeMode || editingLineId === lineId || !lineText.trim()) return; if (selectedLineForMarkingId === lineId) { setSelectedLineForMarkingId(null); } else { setSelectedLineForMarkingId(lineId); } }, [isKaraokeMode, editingLineId, selectedLineForMarkingId]);
  const handleMarkNextUnsyncedLine = useCallback(() => { if (!audioRef.current || !audioSrc) { setError("Please load an audio file first."); return; } setError(null); setStatusMessage(''); let targetLine: LyricLine | undefined; let targetIndex = -1; if (selectedLineForMarkingId) { targetIndex = parsedLines.findIndex(line => line.id === selectedLineForMarkingId); if (targetIndex !== -1) { targetLine = parsedLines[targetIndex]; } else { setSelectedLineForMarkingId(null); } } if (!targetLine) { targetIndex = parsedLines.findIndex((line, index) => index > lastAutoMarkedIndex && line.text.trim() !== '' && !structuralMarkerPattern.test(line.text.trim())); if (targetIndex !== -1) { targetLine = parsedLines[targetIndex]; } } if (targetLine && targetIndex !== -1) { handleMarkTimestamp(targetLine.id); setLastAutoMarkedIndex(targetIndex); trackLocalEvent(TOOL_CATEGORY, 'markNextUnsyncedLine', `LineIndex:${targetIndex}`); let nextLineToSelectIndex = -1; for (let i = targetIndex + 1; i < parsedLines.length; i++) { if (parsedLines[i].text.trim() !== '' && !structuralMarkerPattern.test(parsedLines[i].text.trim())) { nextLineToSelectIndex = i; break; } } if (nextLineToSelectIndex !== -1) { setSelectedLineForMarkingId(parsedLines[nextLineToSelectIndex].id); } else { setSelectedLineForMarkingId(null); setStatusMessage("Last available line marked."); setTimeout(() => setStatusMessage(''), 3000); } } else { setSelectedLineForMarkingId(null); setError("All lines synced or no more lines to mark from current/selected position."); setTimeout(() => setError(null), 3000); } }, [audioSrc, parsedLines, lastAutoMarkedIndex, selectedLineForMarkingId, handleMarkTimestamp, trackLocalEvent]);
  const handleRemoveLyricLine = useCallback((lineId: string) => { setParsedLines(prevLines => { const newLines = prevLines.filter(line => line.id !== lineId); setRawLyrics(newLines.map(line => line.text).join('\n')); return newLines; }); trackLocalEvent(TOOL_CATEGORY, 'lyricLineRemoved', lineId); }, [trackLocalEvent]);
  const handleLrcFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => { const file = event.target.files?.[0]; if (file) { const reader = new FileReader(); reader.onload = (e) => { try { const text = e.target?.result as string; const lrcLines = text.split('\n'); const newParsedLines: LyricLine[] = []; let lrcTitle = ''; let lrcArtist = ''; const timestampRegex = /\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/; lrcLines.forEach((line, index) => { const metaMatchTi = line.match(/\[ti:(.*?)\]/i); if (metaMatchTi) { lrcTitle = metaMatchTi[1].trim(); return; } const metaMatchAr = line.match(/\[ar:(.*?)\]/i); if (metaMatchAr) { lrcArtist = metaMatchAr[1].trim(); return; } const match = line.match(timestampRegex); if (match) { const minutes = parseInt(match[1], 10); const seconds = parseInt(match[2], 10); const centisecondsOrMillis = parseInt(match[3], 10); const millis = match[3].length === 2 ? centisecondsOrMillis * 10 : centisecondsOrMillis; const timestamp = minutes * 60 + seconds + millis / 1000; const textContent = match[4].trim(); if (textContent) newParsedLines.push({ id: `lrc-line-${index}-${Date.now()}`, text: textContent, timestamp, ref: React.createRef() }); } else if (line.trim() !== '' && !line.match(/^\[\w{2}:.*?\]$/i)) { newParsedLines.push({ id: `lrc-textline-${index}-${Date.now()}`, text: line.trim(), timestamp: null, ref: React.createRef() }); } }); setRawLyrics(newParsedLines.map(l => l.text).join('\n')); setParsedLines(newParsedLines); if (lrcTitle) setSongTitle(lrcTitle); if (lrcArtist) setArtistName(lrcArtist); setError(null); trackLocalEvent(TOOL_CATEGORY, 'lrcFileLoaded', file.name, newParsedLines.length); } catch (err) { setError("Failed to parse LRC file."); console.error("LRC Parse Error:", err); } }; reader.readAsText(file); if (lrcFileInputRef.current) lrcFileInputRef.current.value = ""; } }, [trackLocalEvent]);
  const handleEditTimestamp = (lineId: string) => { const line = parsedLines.find(l => l.id === lineId); if (line) { setEditingLineId(lineId); setManualTimestampValue(line.timestamp !== null ? formatTime(line.timestamp) : ''); setTimeout(() => manualInputRef.current?.focus(), 0); } };
  const handleManualTimestampChange = (value: string) => { setManualTimestampValue(value); };
  const handleManualTimestampSubmit = () => { if (editingLineId) { const newTimestamp = parseTimeInputToSeconds(manualTimestampValue); if (newTimestamp !== null && newTimestamp >= 0 && newTimestamp <= (audioRef.current?.duration || Infinity)) { setParsedLines(prevLines => prevLines.map(line => line.id === editingLineId ? { ...line, timestamp: newTimestamp } : line)); trackLocalEvent(TOOL_CATEGORY, 'timestampManuallyEdited', editingLineId); } else if (newTimestamp !== null) { setError("Manual timestamp is out of audio range or invalid."); setTimeout(() => setError(null), 3000); } setEditingLineId(null); } };
  const exportToLRC = () => { const linesWithTimestamps = parsedLines.filter(line => line.timestamp !== null && line.text.trim() !== ''); if (linesWithTimestamps.length === 0) { setExportCopyStatus("No timestamps set to export."); setTimeout(() => setExportCopyStatus(''), 3000); return; } linesWithTimestamps.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0)); let lrcContent = ""; if (songTitle.trim()) lrcContent += `[ti:${songTitle.trim()}]\n`; else if (audioFileName) lrcContent += `[ti:${audioFileName.replace(/\.[^/.]+$/, "")}]\n`; if (artistName.trim()) lrcContent += `[ar:${artistName.trim()}]\n`; else lrcContent += "[ar:Lyrics Synchronizer Hub]\n"; lrcContent += "[al:Synchronized Lyrics]\n"; if (duration > 0) lrcContent += `[length:${formatTime(duration).substring(0, formatTime(duration).lastIndexOf('.'))}]\n`; linesWithTimestamps.forEach(line => { lrcContent += `[${formatTime(line.timestamp!)}]${line.text}\n`; }); const blob = new Blob([lrcContent], { type: 'text/plain;charset=utf-8' }); const url = URL.createObjectURL(blob); const link = document.createElement('a'); const lrcFilename = (songTitle.trim() || audioFileName?.replace(/\.[^/.]+$/, "") || 'lyrics') + '.lrc'; link.download = lrcFilename; document.body.appendChild(link); link.click(); document.body.removeChild(link); URL.revokeObjectURL(url); setExportCopyStatus("LRC file exported!"); setTimeout(() => setExportCopyStatus(''), 3000); trackLocalEvent(TOOL_CATEGORY, 'lrcExported', undefined, linesWithTimestamps.length); };
  const generateRangeFormatContent = (): string => { const linesWithTimestamps = parsedLines.filter(line => line.timestamp !== null && line.text.trim() !== '').sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0)); if (linesWithTimestamps.length === 0) return ""; return linesWithTimestamps.map((line, index) => { const startTime = line.timestamp!; let endTime: number; if (index < linesWithTimestamps.length - 1 && linesWithTimestamps[index + 1].timestamp !== null) { endTime = linesWithTimestamps[index + 1].timestamp!; } else { endTime = startTime + 5; if (duration > 0 && endTime > duration) endTime = duration; } if (endTime <= startTime) endTime = startTime + 0.1; return `[${formatTime(startTime)} - ${formatTime(endTime)}] ${line.text}`; }).join('\n'); };
  const handleExportToRangeFormatTxt = () => { const content = generateRangeFormatContent(); if (!content) { setExportCopyStatus("No timed lines to export."); setTimeout(() => setExportCopyStatus(''), 3000); return; } const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' }); const url = URL.createObjectURL(blob); const link = document.createElement('a'); const filename = (songTitle.trim() || audioFileName?.replace(/\.[^/.]+$/, "") || 'lyrics_range_format') + '.txt'; link.download = filename; document.body.appendChild(link); link.click(); document.body.removeChild(link); URL.revokeObjectURL(url); setExportCopyStatus("TXT (Range Format) exported!"); setTimeout(() => setExportCopyStatus(''), 3000); trackLocalEvent(TOOL_CATEGORY, 'rangeFormatExportedToTxt', undefined, parsedLines.filter(l => l.timestamp !== null).length); };
  const handleCopyToClipboardRangeFormat = () => { const content = generateRangeFormatContent(); if (!content) { setExportCopyStatus("No timed lines to copy."); setTimeout(() => setExportCopyStatus(''), 3000); return; } navigator.clipboard.writeText(content).then(() => { setExportCopyStatus("Range Format copied to clipboard!"); setTimeout(() => setExportCopyStatus(''), 3000); trackLocalEvent(TOOL_CATEGORY, 'rangeFormatCopied', undefined, parsedLines.filter(l => l.timestamp !== null).length); }).catch(err => { console.error("Copy failed: ", err); setExportCopyStatus("Failed to copy."); setTimeout(() => setExportCopyStatus(''), 3000); }); };
  useEffect(() => { const handleKeyDown = (event: KeyboardEvent) => { const targetNodeName = (event.target as HTMLElement)?.nodeName; if (targetNodeName === 'INPUT' || targetNodeName === 'TEXTAREA' || targetNodeName === 'SELECT') return; if (event.key === ' ' && !isKaraokeMode && audioSrc && isPlaying) { event.preventDefault(); handleMarkNextUnsyncedLine(); } }; document.addEventListener('keydown', handleKeyDown); return () => document.removeEventListener('keydown', handleKeyDown); }, [isKaraokeMode, audioSrc, isPlaying, handleMarkNextUnsyncedLine]);
  const togglePlayPause = useCallback(() => { if (audioRef.current) { if (audioRef.current.paused || audioRef.current.ended) audioRef.current.play(); else audioRef.current.pause(); } }, []);
  const handleSeek = (event: React.ChangeEvent<HTMLInputElement> | React.MouseEvent<HTMLInputElement>) => { if (audioRef.current && duration > 0) { const newTime = parseFloat((event.target as HTMLInputElement).value); audioRef.current.currentTime = newTime; setCurrentTime(newTime); } };
  const handleVolumeChange = (event: React.ChangeEvent<HTMLInputElement>) => { if (audioRef.current) { const newVolume = parseFloat(event.target.value); setPlayerVolume(newVolume); audioRef.current.volume = newVolume; } };

  return (
    <div className="w-full">
      <header className="mb-10 text-center"><h1 className="text-5xl font-extrabold text-green-600 dark:text-green-400">Lyrics Synchronizer</h1><p className="mt-3 text-md text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">Create time-stamped lyrics for karaoke or LRC files. Load audio (MP3, Suno, Riffusion, or Producer.AI URL), paste/type lyrics (supports <code className="text-xs bg-gray-200 dark:bg-gray-700 p-0.5 rounded text-gray-800 dark:text-gray-200">[MM:SS.mmm - MM:SS.mmm] TEXT</code> format import), and sync!</p></header>
      <main className="w-full bg-white dark:bg-gray-900 shadow-2xl rounded-lg p-6 md:p-10 border-2 border-green-600 dark:border-green-500">
        {/* Section 1: Load Audio & Lyrics */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-green-700 dark:text-green-300 mb-3">1. Load Audio & Lyrics</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3"> {(songTitle || artistName) && (<div className="flex flex-col items-center mb-3"><img src={sunoCoverArtUrl || FALLBACK_IMAGE_DATA_URI} alt={songTitle || 'Cover Art'} className="w-32 h-32 object-cover rounded-md border-2 border-gray-300 dark:border-gray-600" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_IMAGE_DATA_URI; }} /></div>)} <InputField id="songTitleInput" label="Song Title" value={songTitle} onChange={setSongTitle} placeholder="Enter song title" /> <InputField id="artistNameInput" label="Artist Name" value={artistName} onChange={setArtistName} placeholder="Enter artist name" /> </div>
            <div className="space-y-3"> <div> <label htmlFor="sunoUrlInput" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Load from Suno/Riffusion/Producer.AI Song URL</label> <div className="mt-1 flex rounded-md shadow-sm"> <input type="text" name="sunoUrlInput" id="sunoUrlInput" value={sunoUrlInput} onChange={(e) => setSunoUrlInput(e.target.value)} className="block w-full flex-1 rounded-none rounded-l-md border-gray-300 bg-white dark:bg-gray-700 dark:border-gray-600 px-3 py-2 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-green-500 focus:ring-green-500 sm:text-sm" placeholder="Paste Suno, Riffusion, or Producer.AI URL..." disabled={isUrlLoading} /> <button type="button" onClick={handleLoadFromUrl} disabled={isUrlLoading || !sunoUrlInput.trim()} className="relative -ml-px inline-flex items-center space-x-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 disabled:opacity-50"> {isUrlLoading ? <Spinner size="w-4 h-4" color="text-white" /> : <span>Load</span>} </button> </div> {urlLoadingProgress && <p className="text-xs text-yellow-600 dark:text-yellow-300 mt-1">{urlLoadingProgress}</p>} </div> <div className="flex items-center"><div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div><span className="flex-shrink mx-4 text-gray-500">OR</span><div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div></div> <div> <label htmlFor="audioFile" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Upload MP3 Audio File</label> <input type="file" id="audioFile" accept=".mp3" onChange={handleAudioFileChange} ref={audioFileInputRef} className="mt-1 block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-green-600 file:text-black hover:file:bg-green-500" /> </div> </div>
          </div>
          <div className="mt-6"> <div className="flex justify-between items-center mb-1"> <label htmlFor="lyricsInputArea" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Paste/Type Lyrics (one line per entry)</label> <input type="file" ref={lrcFileInputRef} onChange={handleLrcFileChange} accept=".lrc" style={{ display: 'none' }} id="load-lrc-file" /> <label htmlFor="load-lrc-file" className="py-1 px-2 bg-teal-600 hover:bg-teal-500 text-white rounded-md text-xs cursor-pointer">Load LRC File</label> </div> <textarea id="lyricsInputArea" value={rawLyrics} onChange={(e) => setRawLyrics(e.target.value)} rows={10} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 sm:text-sm text-gray-900 dark:text-white" placeholder="Enter lyrics here... e.g., [00:05.123 - 00:10.000] This line will import with timestamp." /> </div> {(error || statusMessage) && <div className={`mt-4 p-3 rounded-md text-sm ${error ? 'bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-200' : 'bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200'}`}>{error || statusMessage}</div>}

          {audioSrc && (
            <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 text-center">Playing: <span className="text-green-600 dark:text-green-300">{audioFileName || 'Audio File'}</span></p>
              <audio ref={audioRef} src={audioSrc} className="hidden" preload="metadata"></audio>
              <div className="flex items-center gap-3 mb-2"> <button onClick={togglePlayPause} className="p-2 bg-green-500 hover:bg-green-600 text-black rounded-full focus:outline-none focus:ring-2 focus:ring-green-400 disabled:opacity-50" disabled={!duration}> {isPlaying ? <PauseIcon /> : <PlayIcon />} </button> <div className="text-xs text-gray-700 dark:text-gray-300 w-16 text-center">{formatTime(currentTime)}</div> <input type="range" ref={seekBarRef} min="0" max={duration || 0} value={currentTime} onChange={handleSeek} onClick={handleSeek} className="flex-grow h-2 bg-gray-300 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-green-500 focus:outline-none focus:ring-1 focus:ring-green-400 disabled:opacity-50" disabled={!duration} aria-label="Audio seek bar" /> <div className="text-xs text-gray-700 dark:text-gray-300 w-16 text-center">{formatTime(duration)}</div> </div>
              <div className="flex items-center justify-center gap-2 text-sm"> <button onClick={() => audioRef.current && (audioRef.current.volume = 0)} className="p-1 text-gray-600 dark:text-gray-400" aria-label="Mute"> <VolumeMuteIcon /> </button> <input type="range" min="0" max="1" step="0.01" value={playerVolume} onChange={handleVolumeChange} className="w-24 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-green-400" aria-label="Volume control" /> <button onClick={() => audioRef.current && (audioRef.current.volume = 1)} className="p-1 text-gray-600 dark:text-gray-400" aria-label="Max Volume"> <VolumeUpIcon /> </button> </div>
            </div>
          )}
        </section>

        {/* Section 2: Synchronize Lyrics */}
        <section className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-green-700 dark:text-green-300 mb-3">2. Synchronize Lyrics</h2>
          <div className="flex flex-col sm:flex-row gap-4 items-center mb-4"> <CheckboxField id="karaokeMode" label="Enable Karaoke Preview Mode" checked={isKaraokeMode} onChange={setIsKaraokeMode} /> <button onClick={handleClearAllTimestamps} className="py-1.5 px-3 bg-red-600 hover:bg-red-500 text-white rounded-md text-sm whitespace-nowrap"> Clear All Timestamps </button> </div>

          <div className="max-h-96 overflow-y-auto p-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-100 dark:scrollbar-track-gray-800">
            {parsedLines.length > 0 ? (parsedLines.map((line, index) => {
              let lineClassName = 'p-2 my-1 rounded flex items-center justify-between transition-all duration-150 ease-in-out border-2 ';
              if (isKaraokeMode && highlightedLineIndex === index) lineClassName += 'bg-yellow-100 dark:bg-yellow-400 text-black font-bold shadow-lg scale-[1.02] border-yellow-500';
              else if (!isKaraokeMode && selectedLineForMarkingId === line.id) lineClassName += 'bg-yellow-200 dark:bg-yellow-300 text-black font-semibold shadow-md border-yellow-500';
              else lineClassName += 'bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 border-transparent';
              const canMarkLine = !isKaraokeMode && audioSrc && editingLineId !== line.id && line.text.trim() !== '' && !structuralMarkerPattern.test(line.text.trim());
              return (
                <div key={line.id} ref={line.ref} className={lineClassName} onClick={() => canMarkLine && handleLyricLineClick(line.id, line.text)} style={{ cursor: canMarkLine ? 'pointer' : 'default' }} title={canMarkLine ? "Click to select this line for marking" : ""}>
                  <span className={`flex-grow text-sm min-w-0 break-words ${isKaraokeMode && highlightedLineIndex === index ? 'text-black' : (!isKaraokeMode && selectedLineForMarkingId === line.id ? 'text-black' : 'text-gray-900 dark:text-gray-100')}`}> {line.text.trim() || <span className="italic text-gray-400 dark:text-gray-500">(Empty line)</span>} </span>
                  <div className="flex items-center flex-shrink-0 ml-2 space-x-1">
                    {editingLineId === line.id && !isKaraokeMode ? (
                      <input type="text" ref={manualInputRef} value={manualTimestampValue} onChange={(e) => handleManualTimestampChange(e.target.value)} onBlur={handleManualTimestampSubmit} onKeyDown={(e) => { if (e.key === 'Enter') handleManualTimestampSubmit(); if (e.key === 'Escape') setEditingLineId(null); }} className="w-20 px-1 py-0.5 text-xs bg-gray-100 dark:bg-gray-600 border border-green-500 rounded text-gray-900 dark:text-white" autoFocus />
                    ) : (<span className={`text-xs w-20 text-right mr-1 ${isKaraokeMode && highlightedLineIndex === index ? 'text-gray-900' : 'text-gray-500 dark:text-gray-400'}`}>{formatTime(line.timestamp)}</span>)}
                    {!isKaraokeMode && (<> {editingLineId !== line.id && <button onClick={() => handleEditTimestamp(line.id)} className="px-1 py-0.5 text-xs bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-600 dark:text-gray-300 rounded" title="Edit Timestamp">✏️</button>} <button onClick={() => audioSrc && handleMarkTimestamp(line.id)} disabled={!audioSrc} className="px-1.5 py-0.5 text-xs bg-blue-600 hover:bg-blue-500 text-white rounded disabled:opacity-50" title="Mark Current Time">Mark</button> <button onClick={() => handleClearTimestamp(line.id)} className="px-1.5 py-0.5 text-xs bg-red-600 hover:bg-red-500 text-white rounded" title="Clear Timestamp">Clear</button> <button onClick={() => handleRemoveLyricLine(line.id)} className="px-1.5 py-0.5 text-xs bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-800 dark:text-white rounded" title="Delete Line">&times;</button> </>)}
                  </div>
                </div>
              );
            })) : (<p className="text-gray-500 dark:text-gray-400 text-sm italic text-center py-4">Paste lyrics above to begin synchronization.</p>)}
          </div>
          <button onClick={handleMarkNextUnsyncedLine} disabled={!audioSrc || isKaraokeMode || isUrlLoading} className="w-full mt-3 py-3 px-6 bg-yellow-500 hover:bg-yellow-600 text-black rounded-md text-lg font-semibold disabled:opacity-50"> Mark Next Line &amp; Advance <span className="text-sm font-normal">(Spacebar)</span> </button>
          <div className="mt-6 flex flex-col sm:flex-row gap-2"> <button onClick={exportToLRC} disabled={!parsedLines.some(l => l.timestamp !== null)} className="flex-1 py-2 px-4 bg-purple-600 hover:bg-purple-500 text-white rounded-md text-sm font-medium disabled:opacity-50">Export to LRC File</button> <button onClick={handleExportToRangeFormatTxt} disabled={!parsedLines.some(l => l.timestamp !== null)} className="flex-1 py-2 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md text-sm font-medium disabled:opacity-50">Export TXT (Range Format)</button> <button onClick={handleCopyToClipboardRangeFormat} disabled={!parsedLines.some(l => l.timestamp !== null)} className="flex-1 py-2 px-4 bg-sky-600 hover:bg-sky-500 text-white rounded-md text-sm font-medium disabled:opacity-50">Copy Range Format</button> </div>
          {exportCopyStatus && <p className="text-xs text-center mt-2 text-green-600 dark:text-green-300">{exportCopyStatus}</p>}
        </section>
      </main>
    </div>
  );
};

const CheckboxField: React.FC<{ id: string; label: string; checked: boolean; onChange: (checked: boolean) => void; }> =
  ({ id, label, checked, onChange }) => (
    <div className="flex items-center">
      <input id={id} type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 text-green-600 dark:text-green-500 border-gray-300 dark:border-gray-600 rounded focus:ring-green-500 dark:focus:ring-green-400 bg-white dark:bg-gray-700 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-800" />
      <label htmlFor={id} className="ml-2 block text-sm text-gray-700 dark:text-gray-300">{label}</label>
    </div>
  );

const parseTimeInputToSeconds = (timeStr: string): number | null => {
  const trimmedTimeStr = timeStr.trim();
  const mmSsMmmMatch = trimmedTimeStr.match(/^(\d{1,2}):(\d{2})(?:\.(\d{1,3}))?$/);
  if (mmSsMmmMatch) {
    const minutes = parseInt(mmSsMmmMatch[1], 10);
    const seconds = parseInt(mmSsMmmMatch[2], 10);
    const milliseconds = parseInt(mmSsMmmMatch[3]?.padEnd(3, '0') || '0', 10);
    if (seconds >= 60) return null;
    return minutes * 60 + seconds + milliseconds / 1000;
  }
  const ssMmmMatch = trimmedTimeStr.match(/^(\d+)(?:\.(\d{1,3}))?$/);
  if (ssMmmMatch) {
    const seconds = parseInt(ssMmmMatch[1], 10);
    const milliseconds = parseInt(ssMmmMatch[2]?.padEnd(3, '0') || '0', 10);
    return seconds + milliseconds / 1000;
  }
  return null;
};

export default LyricsSynchronizerTool;
