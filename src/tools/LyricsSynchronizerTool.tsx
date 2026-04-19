
import React, { useState, useCallback, useEffect, useRef } from 'react';
import Spinner from '@/components/Spinner';
import type { ToolProps } from '@/Layout';
import { useTheme } from '@/context/ThemeContext';
import { resolveSunoUrlToPotentialSongId, fetchSunoClipById } from '@/services/sunoService';
import { fetchRiffusionSongData, extractRiffusionSongId } from '@/services/riffusionService';
import type { SynchronizedLyricLine } from '@/types';
import InputField from '@/components/forms/InputField';
import TextAreaField from '@/components/forms/TextAreaField';
import CheckboxField from '@/components/forms/CheckboxField';
import Button from '@/components/common/Button';
import { 
  RefreshIcon, 
  TrashIcon, 
  DownloadIcon, 
  SaveIcon, 
  LoadIcon, 
  ExportIcon, 
  ImportIcon, 
  LinkIcon, 
  PlayIcon, 
  PauseIcon, 
  VolumeUpIcon, 
  VolumeMuteIcon,
  SparklesIcon,
  MusicNoteIcon,
  EditIcon,
  CheckIcon
} from '@/components/Icons';

const LOGO_SVG_STRING = `<svg viewBox='0 0 100 100' fill='none' xmlns='http://www.w3.org/2000/svg'><path d='M50 10 L85 27.5 V72.5 L50 90 L15 72.5 V27.5 L50 10 Z' stroke='#059669' stroke-width='8' fill='transparent'/><circle cx='50' cy='35' r='7' fill='#10B981'/><circle cx='35' cy='65' r='6' fill='#10B981'/><circle cx='65' cy='65' r='6' fill='#10B981'/><line x1='50' y1='35' x2='35' y2='65' stroke='#10B981' stroke-width='5' stroke-linecap='round'/><line x1='50' y1='35' x2='65' y2='65' stroke='#10B981' stroke-width='5' stroke-linecap='round'/><line x1='38' y1='63' x2='62' y2='63' stroke='#10B981' stroke-width='5' stroke-linecap='round'/></svg>`;
const FALLBACK_IMAGE_DATA_URI = `data:image/svg+xml;base64,${btoa(LOGO_SVG_STRING)}`;

// Local type extending the one from types.ts to include the ref
interface LyricLine extends SynchronizedLyricLine {
  ref: React.RefObject<HTMLDivElement>;
}



const structuralKeywordsArray = ["Verse", "Chorus", "Intro", "Outro", "Bridge", "Pre-Chorus", "Post-Chorus", "Instrumental", "Guitar Solo", "Keyboard Solo", "Drum Solo", "Bass Solo", "Sax Solo", "Trumpet Solo", "Violin Solo", "Cello Solo", "Flute Solo", "Solo", "Hook", "Refrain", "Interlude", "Skit", "Spoken", "Adlib", "Vamp", "Coda", "Pre-Verse", "Post-Verse", "Pre-Bridge", "Post-Bridge", "Breakdown", "Build-up", "Drop", "Section", "Part", "Prelude", "Segway"];
const structuralMarkerPattern = new RegExp(`^(${structuralKeywordsArray.join('|')})(?:\\s+[A-Za-z0-9#]+)*(?:\\s*x\\d+)?$`, 'i');

const TOOL_CATEGORY = 'LyricsSynchronizer';

const LyricsSynchronizerTool: React.FC<ToolProps> = ({ trackLocalEvent }) => {
  const { uiMode } = useTheme();
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
    if (!urlInput) { setError("Please enter a Suno, Riffusion, or Flow Music Song URL."); return; }
    setIsUrlLoading(true); setError(null); setUrlLoadingProgress('Validating URL...');
    if (trackLocalEvent) trackLocalEvent(TOOL_CATEGORY, 'urlLoadAttempted', urlInput);
    if (audioFileInputRef.current) audioFileInputRef.current.value = ""; setAudioSrc(null); setAudioFileName(null);
    setSongTitle(''); setArtistName(''); setSunoCoverArtUrl(null); setRawLyrics(''); setParsedLines([]);

    if (urlInput.includes('flowmusic.app') || urlInput.includes('producer.ai')) {
      setUrlLoadingProgress('Flow Music URL detected, transforming...');
      const songId = extractRiffusionSongId(urlInput);
      if (songId) {
        urlInput = `https://www.flowmusic.app/song/${songId}`;
        setUrlLoadingProgress('URL transformed. Fetching data...');
        if (trackLocalEvent) trackLocalEvent(TOOL_CATEGORY, 'urlTransformed', 'flowmusic_rebranding');
      } else {
        setError('Could not extract a valid song ID from the Flow Music / Producer.AI URL.');
        setIsUrlLoading(false);
        setUrlLoadingProgress('');
        if (trackLocalEvent) trackLocalEvent(TOOL_CATEGORY, 'urlTransformError', 'flowmusic_no_id');
        return;
      }
    }

    if (urlInput.includes('riffusion.com') || urlInput.includes('flowmusic.app') || urlInput.includes('producer.ai')) {
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
    <div className={`w-full ${uiMode === 'classic' ? 'text-gray-900 dark:text-white' : 'text-white'} animate-fadeIn px-4 pb-20`}>
      {uiMode === 'classic' ? (
        <header className="mb-10 text-center pt-8">
          <h1 className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-tight">
            Lyrics Synchronizer
          </h1>
          <p className="mt-3 text-sm font-medium text-gray-700 dark:text-gray-300 max-w-3xl mx-auto text-center">
            Temporal Alignment Hub • Map lyrics to audio timestamps
          </p>
        </header>
      ) : (
        <header className="mb-2 md:mb-14 text-center pt-0 md:pt-8 px-4 animate-fadeIn">
          <h1 className="text-3xl sm:text-5xl md:text-7xl font-black uppercase tracking-tighter text-emerald-600 dark:text-emerald-500 leading-none italic drop-shadow-2xl mb-1 md:mb-4">Lyrics Sync</h1>
          <p className="mt-1 md:mt-4 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.4em] text-gray-500 dark:text-gray-400 max-w-xl mx-auto opacity-70">
              Temporal Alignment Hub • Map lyrics to audio timestamps
          </p>
        </header>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* Left Column: Configuration & Content */}
        <div className="xl:col-span-4 space-y-8">
          <section className="glass-card p-8 border-white/10 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-[40px] pointer-events-none"></div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-600 dark:text-emerald-500 mb-6">Identity & Signal</h3>
            
            {(songTitle || artistName) && (
              <div className="flex flex-col items-center mb-8 animate-in fade-in zoom-in-95 duration-500">
                <div className="relative group">
                  <img
                    src={sunoCoverArtUrl || FALLBACK_IMAGE_DATA_URI}
                    alt={songTitle || 'Cover Art'}
                    className="w-40 h-40 object-cover rounded-3xl border border-white/10 shadow-2xl group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_IMAGE_DATA_URI; }}
                  />
                  <div className="absolute inset-0 bg-black/40 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                    <span className="text-[8px] font-black uppercase tracking-widest text-white/60">Live Signal</span>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <InputField id="songTitleInput" label="Composition Title" value={songTitle} onChange={setSongTitle} placeholder="Neon Dreams" className="mb-0" />
              <InputField id="artistNameInput" label="Primary Artist" value={artistName} onChange={setArtistName} placeholder="The Matrix" className="mb-0" />
              
              <div className="pt-6 mt-6 border-t border-white/5 space-y-6">
                <div className="space-y-4">
                  <label className="block text-[8px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 ml-1">Network Injection</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={sunoUrlInput}
                      onChange={(e) => setSunoUrlInput(e.target.value)}
                      placeholder="Suno / Riffusion / Flow Music URL"
                      className="flex-grow px-4 py-2 bg-white/5 dark:bg-black/20 border border-white/10 rounded-xl text-xs font-bold focus:ring-4 focus:ring-emerald-500/20 outline-none transition-all placeholder:opacity-30 disabled:opacity-50"
                      disabled={isUrlLoading}
                    />
                      <Button
                        onClick={handleLoadFromUrl}
                        disabled={isUrlLoading || !sunoUrlInput.trim()}
                        variant="primary"
                        size="xs"
                        startIcon={isUrlLoading ? null : <LinkIcon className="w-3 h-3 ml-0.5" />}
                      >
                        {isUrlLoading ? <Spinner size="w-3 h-3" color="text-white" /> : 'LOAD'}
                      </Button>
                  </div>
                  {urlLoadingProgress && <p className="text-[8px] font-black uppercase tracking-widest text-yellow-500/60 animate-pulse">{urlLoadingProgress}</p>}
                </div>

                <div className="flex items-center gap-4 py-2">
                  <div className="h-px flex-grow bg-white/5"></div>
                  <span className="text-[8px] font-black uppercase tracking-widest text-gray-600">OR</span>
                  <div className="h-px flex-grow bg-white/5"></div>
                </div>

                <div className="space-y-2">
                  <label className="block text-[8px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 ml-1">Static Audio File</label>
                  <div className="p-4 bg-white/5 border border-dashed border-white/10 rounded-2xl text-center group hover:bg-white/10 transition-all cursor-pointer relative">
                    <input type="file" id="audioFile" accept=".mp3" onChange={handleAudioFileChange} ref={audioFileInputRef} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                    <div className="text-[8px] font-black uppercase tracking-[0.2em] text-gray-500 group-hover:text-emerald-500 transition-colors uppercase leading-relaxed">
                      {audioFileName ? audioFileName : 'Deploy MP3 Buffer'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="glass-card p-8 border-white/10 shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-600 dark:text-emerald-500">Lyric Data Buffer</h3>
              <div className="flex gap-2">
                <input type="file" ref={lrcFileInputRef} onChange={handleLrcFileChange} accept=".lrc" className="hidden" id="load-lrc-file" />
                <Button onClick={() => lrcFileInputRef.current?.click()} variant="ghost" size="xs" startIcon={<ImportIcon className="w-3 h-3" />} className="font-black uppercase tracking-widest text-[8px] border-white/10 flex items-center justify-center">Import LRC</Button>
              </div>
            </div>
            <TextAreaField 
              id="lyricsInputArea" 
              label="Raw Syntax Input" 
              value={rawLyrics} 
              onChange={setRawLyrics} 
              rows={12} 
              placeholder="Enter lyrics here...&#10;Supports [MM:SS.mmm - MM:SS.mmm] format injection" 
              className="mb-0 font-mono text-[11px] leading-relaxed"
            />
            
            {(error || statusMessage) && (
              <div className={`mt-6 p-4 rounded-2xl animate-in slide-in-from-top-2 duration-300 border ${error ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-blue-500/10 border-blue-500/20 text-blue-400'}`}>
                <p className="text-[9px] font-black uppercase tracking-widest text-center">{error || statusMessage}</p>
              </div>
            )}
          </section>
        </div>

        {/* Right Column: Synchronization Console */}
        <div className="xl:col-span-8 space-y-8">
          <section className="glass-card p-2 sm:p-6 md:p-10 border-white/10 shadow-2xl relative overflow-hidden flex flex-col h-[calc(100vh-280px)] xl:h-[calc(100vh-220px)] min-h-[600px]">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[100px] pointer-events-none"></div>
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
              <div>
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600 dark:text-blue-500">Temporal Synchronization</h3>
                <p className="text-[8px] font-black uppercase tracking-widest text-gray-500 mt-2 opacity-60 italic">Mapping vocal signals to metadata vectors</p>
              </div>
              <div className="flex items-center gap-4">
                <CheckboxField id="karaokeMode" label="Karaoke Interface" checked={isKaraokeMode} onChange={setIsKaraokeMode} className="text-[8px]" />
                <Button onClick={handleClearAllTimestamps} variant="danger" size="xs" startIcon={<TrashIcon className="w-3 h-3" />} className="font-black uppercase tracking-widest text-[8px] bg-red-500/10 text-red-400 border-red-500/20 flex items-center justify-center">Wipe Timestamps</Button>
              </div>
            </div>

            <div className="flex-grow overflow-y-auto space-y-2 pr-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
              {parsedLines.length > 0 ? (
                parsedLines.map((line, index) => {
                  const isActive = isKaraokeMode && highlightedLineIndex === index;
                  const isSelected = !isKaraokeMode && selectedLineForMarkingId === line.id;
                  const canMarkLine = !isKaraokeMode && audioSrc && editingLineId !== line.id && line.text.trim() !== '' && !structuralMarkerPattern.test(line.text.trim());
                  
                  return (
                    <div 
                      key={line.id} 
                      ref={line.ref} 
                      onClick={() => canMarkLine && handleLyricLineClick(line.id, line.text)}
                      className={`
                        group relative p-4 rounded-2xl flex items-center justify-between transition-all duration-300 border-2
                        ${isActive ? 'bg-yellow-500/10 border-yellow-500 shadow-2xl shadow-yellow-500/10' : 
                          isSelected ? 'bg-white/10 border-blue-500 shadow-xl' : 
                          'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10'}
                      `}
                      style={{ cursor: canMarkLine ? 'pointer' : 'default' }}
                    >
                      <div className="flex flex-col gap-1 min-w-0 flex-grow">
                        <span className={`text-[11px] font-bold tracking-tight transition-colors duration-300 ${isActive ? 'text-yellow-400 text-[13px] italic' : isSelected ? 'text-blue-400' : 'text-white/60 group-hover:text-white/90'}`}>
                          {line.text.trim() || <span className="opacity-20 italic">NULL_BUFFER</span>}
                        </span>
                        {line.timestamp !== null && (
                          <span className={`text-[7px] font-black uppercase tracking-[0.2em] ${isActive ? 'text-yellow-500/60' : 'text-gray-500'}`}>
                             Pos: {formatTime(line.timestamp)}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0 ml-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        {!isKaraokeMode && (
                          <>
                            {editingLineId === line.id ? (
                              <input 
                                type="text" 
                                ref={manualInputRef} 
                                value={manualTimestampValue} 
                                onChange={(e) => handleManualTimestampChange(e.target.value)} 
                                onBlur={handleManualTimestampSubmit} 
                                onKeyDown={(e) => { if (e.key === 'Enter') handleManualTimestampSubmit(); if (e.key === 'Escape') setEditingLineId(null); }} 
                                className="w-20 px-2 py-1 bg-black/40 border border-blue-500/50 rounded-lg text-[9px] font-mono text-blue-400 outline-none" 
                                autoFocus 
                              />
                            ) : (
                              <Button onClick={(e) => { e.stopPropagation(); handleEditTimestamp(line.id); }} variant="ghost" size="xs" startIcon={<EditIcon className="w-3 h-3" />} className="px-3 border-white/10 text-[8px] font-black uppercase tracking-widest text-gray-500 hover:text-white">Edit</Button>
                            )}
                            <button onClick={(e) => { e.stopPropagation(); audioSrc && handleMarkTimestamp(line.id); }} disabled={!audioSrc} className={`px-3 py-1 flex items-center justify-center gap-1.5 border border-emerald-500/20 bg-emerald-500/5 text-emerald-500 text-[8px] font-black uppercase tracking-widest rounded-lg hover:bg-emerald-500/10 transition-all ${!audioSrc ? 'opacity-30' : ''}`}><CheckIcon className="w-3 h-3" /> Mark</button>
                            <Button onClick={(e) => { e.stopPropagation(); handleClearTimestamp(line.id); }} variant="ghost" size="xs" startIcon={<RefreshIcon className="w-3 h-3 text-red-500" />} className="px-3 border-red-500/20 text-red-500 text-[8px] font-black uppercase tracking-widest hover:bg-red-500/10">Clear</Button>
                            <Button onClick={(e) => { e.stopPropagation(); handleRemoveLyricLine(line.id); }} variant="ghost" size="xs" startIcon={<TrashIcon className="w-3 h-3" />} className="px-3 border-white/10 text-white/40 text-[8px] font-black uppercase tracking-widest hover:text-white">Del</Button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="h-full flex flex-row items-center justify-center opacity-20 gap-6 p-8">
                  <div className="w-16 h-16 border-2 border-dashed border-white/20 rounded-3xl flex items-center justify-center shrink-0">
                    <LinkIcon className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em]">System Idle</p>
                    <p className="text-[8px] font-bold uppercase tracking-widest mt-1">Awaiting Data Feed</p>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-auto space-y-8 pt-8">
              <Button 
                startIcon={<SparklesIcon className="w-5 h-5 text-black/40" />}
                className="w-full h-16 font-black uppercase tracking-[0.3em] text-xs shadow-yellow-500/10 shadow-2xl rounded-3xl"
                backgroundColor="#eab308"
                textColor="#000"
              >
                SYNC VECTOR <span className="ml-4 opacity-40 font-normal">[Spacebar]</span>
              </Button>

              <div className="space-y-6">
                {audioSrc && (
                  <div className="glass-card p-6 bg-white/5 border-white/10 rounded-3xl relative group overflow-hidden">
                    <div className="absolute top-0 left-0 h-1 bg-emerald-500/20" style={{ width: `${(currentTime / duration) * 100}%` }}></div>
                    <audio ref={audioRef} src={audioSrc} className="hidden" preload="metadata"></audio>
                    
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center justify-between px-2">
                        <span className="text-[7px] font-black uppercase tracking-widest text-gray-500">Oscilloscope: {audioFileName?.substring(0, 30) || 'Active Signal'}</span>
                        <div className="flex items-center gap-4">
                          <span className="text-[9px] font-mono font-bold text-emerald-500">{formatTime(currentTime)}</span>
                          <span className="text-gray-600">/</span>
                          <span className="text-[9px] font-mono text-gray-500">{formatTime(duration)}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-6">
                        <Button 
                          onClick={togglePlayPause} 
                          variant="primary" 
                          size="sm" 
                          className="w-12 h-12 rounded-2xl flex items-center justify-center bg-white/10 hover:bg-white text-white hover:text-black transition-all shadow-xl"
                        >
                          {isPlaying ? <PauseIcon className="w-5 h-5"/> : <PlayIcon className="w-5 h-5 ml-1"/>}
                        </Button>
                        
                        <div className="flex-grow relative h-8 flex items-center">
                          <input 
                            type="range" 
                            ref={seekBarRef} 
                            min="0" 
                            max={duration || 0} 
                            value={currentTime} 
                            onChange={handleSeek}
                            className="w-full h-1.5 bg-white/5 rounded-full appearance-none cursor-pointer accent-emerald-500 focus:outline-none" 
                            aria-label="Audio seek bar" 
                          />
                        </div>

                        <div className="flex items-center gap-3 bg-white/5 p-2 rounded-2xl border border-white/5">
                           <VolumeMuteIcon className="w-3 h-3 text-gray-500"/>
                           <input 
                             type="range" 
                             min="0" 
                             max="1" 
                             step="0.01" 
                             value={playerVolume} 
                             onChange={handleVolumeChange} 
                             className="w-20 h-1 bg-gray-700 rounded-full appearance-none accent-gray-400" 
                           />
                           <VolumeUpIcon className="w-3 h-3 text-gray-500"/>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button onClick={exportToLRC} disabled={!parsedLines.some(l => l.timestamp !== null)} variant="ghost" startIcon={<DownloadIcon className="w-3.5 h-3.5" />} className="font-black uppercase tracking-widest text-[8px] py-4 border-white/10 hover:bg-purple-500/10 hover:text-purple-400 hover:border-purple-500/20 flex items-center justify-center">Archivate LRC</Button>
                  <Button onClick={handleExportToRangeFormatTxt} disabled={!parsedLines.some(l => l.timestamp !== null)} variant="ghost" startIcon={<ExportIcon className="w-3.5 h-3.5" />} className="font-black uppercase tracking-widest text-[8px] py-4 border-white/10 hover:bg-indigo-500/10 hover:text-indigo-400 hover:border-indigo-500/20 flex items-center justify-center">Export TXT Vector</Button>
                  <Button onClick={handleCopyToClipboardRangeFormat} disabled={!parsedLines.some(l => l.timestamp !== null)} variant="ghost" startIcon={<SaveIcon className="w-3.5 h-3.5" />} className="font-black uppercase tracking-widest text-[8px] py-4 border-white/10 hover:bg-sky-500/10 hover:text-sky-400 hover:border-sky-500/20 flex items-center justify-center">Clone Range Syntax</Button>
                </div>
                {exportCopyStatus && <p className="text-[8px] font-black uppercase tracking-widest text-center text-emerald-500 animate-pulse">{exportCopyStatus}</p>}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

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
