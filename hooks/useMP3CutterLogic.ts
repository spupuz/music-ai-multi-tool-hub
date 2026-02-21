import React, { useState, useCallback, useRef, useEffect } from 'react';
import WaveSurfer from 'wavesurfer.js';
import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions.js';
import * as lamejs from 'lamejs';
import type { ToolProps } from '../Layout';
import { fetchSunoClipById } from '../services/sunoService';
import { resolveSunoUrlToPotentialSongId } from '../services/sunoService';
import { fetchRiffusionSongData, extractRiffusionSongId } from '../services/riffusionService';

const TOOL_CATEGORY_MP3_CUTTER = 'MP3CutterTool';

export const useMP3CutterLogic = ({ trackLocalEvent }: Pick<ToolProps, 'trackLocalEvent'>) => {
  const wavesurferRef = useRef<HTMLDivElement | null>(null);
  const wavesurferInstanceRef = useRef<WaveSurfer | null>(null);
  const regionRef = useRef<any>(null);

  const [waveformReady, setWaveformReady] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [selection, setSelection] = useState({ start: 0, end: 0, startFormatted: '00:00.000', endFormatted: '00:00.000' });
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [volume, setVolume] = useState(0.75);

  const [sunoUrlInput, setSunoUrlInput] = useState<string>('');
  const [urlLoadingProgress, setUrlLoadingProgress] = useState<string>('');
  const [sunoCoverArtUrl, setSunoCoverArtUrl] = useState<string | null>(null);
  const [sunoArtistName, setSunoArtistName] = useState<string | null>(null);

  const formatTime = useCallback((timeInSeconds: number): string => {
    if (isNaN(timeInSeconds) || timeInSeconds < 0) return '00:00.000';
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    const milliseconds = Math.floor((timeInSeconds % 1) * 1000);
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(milliseconds).padStart(3, '0')}`;
  }, []);

  const updateSelectionState = useCallback((start: number, end: number) => {
    setSelection({ start, end, startFormatted: formatTime(start), endFormatted: formatTime(end) });
  }, [formatTime]);

  useEffect(() => {
    if (wavesurferRef.current && !wavesurferInstanceRef.current) {
      const ws = WaveSurfer.create({
        container: wavesurferRef.current,
        waveColor: 'rgb(16 185 129)', progressColor: 'rgb(5 150 105)',
        cursorColor: 'rgb(209 213 219)', barWidth: 3, barRadius: 2, barGap: 2, height: 100, interact: true,
      });
      wavesurferInstanceRef.current = ws;
      ws.on('ready', () => {
        const dur = ws.getDuration(); setDuration(dur); setWaveformReady(true); setIsLoading(false); setUrlLoadingProgress('');
        updateSelectionState(0, dur);
        const wsRegions = ws.registerPlugin(RegionsPlugin.create());
        wsRegions.enableDragSelection({ slop: 5 } as any);
        wsRegions.on('region-created', (region) => { if (regionRef.current) regionRef.current.remove(); regionRef.current = region; updateSelectionState(region.start, region.end); });
        wsRegions.on('region-updated', (region) => updateSelectionState(region.start, region.end));
        regionRef.current = wsRegions.addRegion({ start: 0, end: dur, color: 'rgba(255, 255, 255, 0.2)', drag: true, resize: true });
      });
      ws.on('audioprocess', (time) => setCurrentTime(time)); ws.on('play', () => setIsPlaying(true)); ws.on('pause', () => setIsPlaying(false));
      ws.on('finish', () => { setIsPlaying(false); setCurrentTime(ws.getDuration()); });
      ws.on('error', (err) => { setError(err.toString()); setIsLoading(false); setUrlLoadingProgress(''); setSunoCoverArtUrl(null); setSunoArtistName(null); });
      ws.on('destroy', () => { setWaveformReady(false); setDuration(0); setCurrentTime(0); updateSelectionState(0, 0); setSunoCoverArtUrl(null); setSunoArtistName(null); });
      ws.setVolume(volume);
    }
    return () => { if (wavesurferInstanceRef.current) { wavesurferInstanceRef.current.destroy(); wavesurferInstanceRef.current = null; } };
  }, [volume, updateSelectionState]);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && wavesurferInstanceRef.current) {
      setError(null); setIsLoading(true); setWaveformReady(false); setUrlLoadingProgress(''); setSunoUrlInput('');
      setFileName(file.name); setSunoCoverArtUrl(null); setSunoArtistName(null);
      wavesurferInstanceRef.current.load(URL.createObjectURL(file));
      trackLocalEvent(TOOL_CATEGORY_MP3_CUTTER, 'fileUploaded', file.type, file.size);
    }
  }, [trackLocalEvent]);

  const handleLoadFromUrl = useCallback(async () => {
    if (!sunoUrlInput.trim() || !wavesurferInstanceRef.current) return;
    setError(null); setIsLoading(true); setWaveformReady(false); setFileName(null); setSunoCoverArtUrl(null); setSunoArtistName(null);
    setUrlLoadingProgress('Validating URL...'); trackLocalEvent(TOOL_CATEGORY_MP3_CUTTER, 'urlLoadAttempt', sunoUrlInput);

    let urlToProcess = sunoUrlInput.trim();

    if (urlToProcess.includes('producer.ai')) {
      setUrlLoadingProgress('Producer.AI URL detected, transforming to Riffusion...');
      const songId = extractRiffusionSongId(urlToProcess);
      if (songId) {
        urlToProcess = `https://www.producer.ai/song/${songId}`;
        setUrlLoadingProgress('URL transformed. Fetching from Riffusion...');
        trackLocalEvent(TOOL_CATEGORY_MP3_CUTTER, 'urlTransformed', 'producer.ai_to_riffusion');
      } else {
        setError('Could not extract a valid song ID from the Producer.AI URL.');
        setIsLoading(false);
        setUrlLoadingProgress('');
        trackLocalEvent(TOOL_CATEGORY_MP3_CUTTER, 'urlTransformError', 'producer.ai_no_id');
        return;
      }
    }

    const isRiffusionUrl = urlToProcess.includes('riffusion.com') || urlToProcess.includes('producer.ai');

    if (isRiffusionUrl) {
      try {
        const songId = extractRiffusionSongId(urlToProcess);
        if (!songId) throw new Error("Could not extract Riffusion song ID from URL.");

        setUrlLoadingProgress(`Fetching Riffusion song details for ID: ${songId.substring(0, 8)}...`);
        const riffusionData = await fetchRiffusionSongData(songId);

        if (!riffusionData || !riffusionData.audio_url) {
          throw new Error(`Failed to fetch Riffusion song details or audio URL for ID: ${songId.substring(0, 8)}...`);
        }

        setFileName(riffusionData.title || `Riffusion Song ${songId.substring(0, 8)}`);
        setSunoCoverArtUrl(riffusionData.image_url || null);
        setSunoArtistName(riffusionData.artist || 'Riffusion Artist');

        setUrlLoadingProgress(`Loading audio: ${riffusionData.title || 'Riffusion Song'}...`);
        wavesurferInstanceRef.current.load(riffusionData.audio_url);
        trackLocalEvent(TOOL_CATEGORY_MP3_CUTTER, 'riffusionUrlLoaded', riffusionData.title);

      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "An unknown error occurred loading from Riffusion URL.";
        setError(errorMsg);
        setIsLoading(false);
        setUrlLoadingProgress('');
        trackLocalEvent(TOOL_CATEGORY_MP3_CUTTER, 'riffusionUrlLoadError', errorMsg);
      }
    } else { // Assume Suno URL
      try {
        const songId = await resolveSunoUrlToPotentialSongId(urlToProcess, setUrlLoadingProgress);
        if (!songId) throw new Error("Could not resolve Suno URL to a song ID.");
        setUrlLoadingProgress(`Fetching song details for ID: ${songId.substring(0, 8)}...`);
        const clip = await fetchSunoClipById(songId);
        if (!clip || !clip.audio_url) throw new Error(`Failed to fetch song details or audio URL for ID: ${songId.substring(0, 8)}...`);
        setFileName(clip.title || `Suno Song ${clip.id.substring(0, 8)}`);
        setSunoCoverArtUrl(clip.image_url || null); setSunoArtistName(clip.display_name || clip.handle || null);
        setUrlLoadingProgress(`Loading audio: ${clip.title || 'Suno Song'}...`);
        wavesurferInstanceRef.current.load(clip.audio_url);
        trackLocalEvent(TOOL_CATEGORY_MP3_CUTTER, 'sunoUrlLoaded', clip.title);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "An unknown error occurred loading from Suno URL.";
        setError(errorMsg);
        setIsLoading(false);
        setUrlLoadingProgress('');
        trackLocalEvent(TOOL_CATEGORY_MP3_CUTTER, 'sunoUrlLoadError', errorMsg);
      }
    }
  }, [sunoUrlInput, trackLocalEvent]);

  const handlePlayPause = useCallback(() => { if (wavesurferInstanceRef.current?.isPlaying()) wavesurferInstanceRef.current.pause(); else wavesurferInstanceRef.current?.play(); }, []);
  const handleStop = useCallback(() => { wavesurferInstanceRef.current?.stop(); setCurrentTime(0); }, []);
  const handlePlaySelection = useCallback(() => { if (regionRef.current) regionRef.current.play(); }, []);
  const handleVolumeChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => { const newVolume = parseFloat(event.target.value); setVolume(newVolume); wavesurferInstanceRef.current?.setVolume(newVolume); }, []);

  const parseTimeToSeconds = (timeStr: string): number | null => {
    const parts = timeStr.match(/(\d{2}):(\d{2})\.(\d{3})/);
    if (parts) { const m = parseInt(parts[1], 10), s = parseInt(parts[2], 10), ms = parseInt(parts[3], 10); if (!isNaN(m) && !isNaN(s) && !isNaN(ms)) return m * 60 + s + ms / 1000; } return null;
  };
  const setSelectionStart = useCallback((timeStr: string) => { const nS = parseTimeToSeconds(timeStr); if (regionRef.current && nS !== null && nS < selection.end) { regionRef.current.setOptions({ start: nS }); updateSelectionState(nS, selection.end); } }, [selection.end, updateSelectionState]);
  const setSelectionEnd = useCallback((timeStr: string) => { const nE = parseTimeToSeconds(timeStr); if (regionRef.current && nE !== null && nE > selection.start && nE <= duration) { regionRef.current.setOptions({ end: nE }); updateSelectionState(selection.start, nE); } }, [selection.start, duration, updateSelectionState]);

  const handleDownloadCoverArt = useCallback(() => {
    if (!sunoCoverArtUrl) return;
    const link = document.createElement('a');
    link.href = sunoCoverArtUrl;
    link.download = `${fileName || 'suno_cover'}_art.png`; // Suggest a filename
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
    trackLocalEvent(TOOL_CATEGORY_MP3_CUTTER, 'coverArtDownloaded');
  }, [sunoCoverArtUrl, fileName, trackLocalEvent]);

  const handleCropAndDownload = useCallback(async () => {
    if (!wavesurferInstanceRef.current || !regionRef.current) return;
    setIsLoading(true); setError(null);
    try {
      const originalBuffer = wavesurferInstanceRef.current.getDecodedData();
      if (!originalBuffer) throw new Error("Audio data not available.");
      const start = regionRef.current.start; const end = regionRef.current.end;
      const selectionDuration = end - start;
      const totalAudioDuration = originalBuffer.duration;

      if (selectionDuration > (totalAudioDuration * 0.505)) { // Add a small tolerance (0.5%)
        throw new Error("Selection exceeds 50% of total audio duration. Please select a shorter region.");
      }

      const sampleRate = originalBuffer.sampleRate; const channels = originalBuffer.numberOfChannels;
      const startFrame = Math.floor(start * sampleRate); const endFrame = Math.floor(end * sampleRate);
      const frameCount = endFrame - startFrame;
      if (frameCount <= 0) throw new Error("Invalid selection range for cropping.");

      const pcmDataArrays: Int16Array[] = [];
      for (let i = 0; i < channels; i++) {
        const channelData = originalBuffer.getChannelData(i).subarray(startFrame, endFrame);
        const pcm16 = new Int16Array(frameCount);
        for (let j = 0; j < frameCount; j++) {
          pcm16[j] = Math.max(-32768, Math.min(32767, channelData[j] * 32768));
        }
        pcmDataArrays.push(pcm16);
      }

      let interleavedPcm: Int16Array;
      if (channels === 1) {
        interleavedPcm = pcmDataArrays[0];
      } else if (channels === 2) {
        interleavedPcm = new Int16Array(frameCount * 2);
        for (let i = 0; i < frameCount; i++) {
          interleavedPcm[i * 2] = pcmDataArrays[0][i];
          interleavedPcm[i * 2 + 1] = pcmDataArrays[1][i];
        }
      } else { throw new Error(`Unsupported number of channels: ${channels}. Only mono or stereo supported for MP3 encoding.`); }

      const mp3encoder = new lamejs.Mp3Encoder(channels, sampleRate, 128); // 128 kbps
      const mp3Data = [];
      const blockSize = 1152; // LAME standard block size
      for (let i = 0; i < interleavedPcm.length; i += blockSize * channels) {
        const chunkEnd = Math.min(i + blockSize * channels, interleavedPcm.length);
        const pcmChunk = interleavedPcm.subarray(i, chunkEnd);
        const mp3buf = mp3encoder.encodeBuffer(pcmChunk);
        if (mp3buf.length > 0) mp3Data.push(mp3buf);
      }
      const mp3buf = mp3encoder.flush();
      if (mp3buf.length > 0) mp3Data.push(mp3buf);

      const mp3Blob = new Blob(mp3Data.map(buf => new Uint8Array(buf)), { type: 'audio/mpeg' });
      const downloadUrl = URL.createObjectURL(mp3Blob);
      const a = document.createElement('a'); a.href = downloadUrl; a.download = `${fileName ? fileName.replace(/\.[^/.]+$/, "") : 'cropped'}_selection.mp3`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(downloadUrl);
      trackLocalEvent(TOOL_CATEGORY_MP3_CUTTER, 'audioCroppedAndDownloaded', 'mp3', (end - start));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to crop audio and encode to MP3."); console.error("MP3 Cropping/Encoding error:", err);
    } finally { setIsLoading(false); }
  }, [fileName, trackLocalEvent]);

  return {
    wavesurferRef, waveformReady, fileName, duration, currentTime, selection, isPlaying, isLoading, error,
    handleFileChange, handlePlayPause, handleStop, handlePlaySelection, handleCropAndDownload,
    handleVolumeChange, volume, formatTime, setSelectionStart, setSelectionEnd,
    sunoUrlInput, setSunoUrlInput, handleLoadFromUrl, urlLoadingProgress,
    sunoCoverArtUrl, sunoArtistName, handleDownloadCoverArt,
  };
};
