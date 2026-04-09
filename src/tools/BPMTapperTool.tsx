
import React, { useState, useCallback, useRef } from 'react';
import Spinner from '@/components/Spinner';
import type { ToolProps } from '@/Layout';
import { useTheme } from '@/context/ThemeContext';
import Button from '@/components/common/Button';
import { resolveSunoUrlToPotentialSongId, fetchSunoClipById } from '@/services/sunoService';
import { fetchRiffusionSongData, extractRiffusionSongId } from '@/services/riffusionService';
import { 
  MetronomeIcon, 
  RefreshIcon, 
  LinkIcon, 
  UploadIcon, 
  SparklesIcon, 
  CheckIcon,
  SearchIcon
} from '@/components/Icons';


const TOOL_CATEGORY = 'BPMTapper';
const MAX_TAPS_FOR_AVERAGE = 8;
const MAX_TIME_BETWEEN_TAPS_MS = 5000;

const LOGO_SVG_STRING = `<svg viewBox='0 0 100 100' fill='none' xmlns='http://www.w3.org/2000/svg'><path d='M50 10 L85 27.5 V72.5 L50 90 L15 72.5 V27.5 L50 10 Z' stroke='#059669' stroke-width='8' fill='transparent'/><circle cx='50' cy='35' r='7' fill='#14B8A6'/><circle cx='35' cy='65' r='6' fill='#14B8A6'/><circle cx='65' cy='65' r='6' fill='#14B8A6'/><line x1='50' y1='35' x2='35' y2='65' stroke='#10B981' stroke-width='5' stroke-linecap='round'/><line x1='50' y1='35' x2='65' y2='65' stroke='#10B981' stroke-width='5' stroke-linecap='round'/><line x1='38' y1='63' x2='62' y2='63' stroke='#10B981' stroke-width='5' stroke-linecap='round'/></svg>`;
const FALLBACK_IMAGE_DATA_URI = `data:image/svg+xml;base64,${btoa(LOGO_SVG_STRING)}`;


const BpmAndKeyFinderTool: React.FC<ToolProps> = ({ trackLocalEvent }) => {
  const { uiMode } = useTheme();
  const [activeTab, setActiveTab] = useState<'tapper' | 'finder'>('tapper');

  // --- BPM Tapper State ---
  const [tapTimestamps, setTapTimestamps] = useState<number[]>([]);
  const [calculatedBpm, setCalculatedBpm] = useState<number | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('Tap the button rhythmically.');
  const [tapFeedback, setTapFeedback] = useState<boolean>(false);
  const lastTapTimeRef = useRef<number>(0);

  // --- Key & BPM Finder State ---
  const [finderState, setFinderState] = useState<'idle' | 'loading' | 'analyzing' | 'success' | 'error'>('idle');
  const [finderUrlInput, setFinderUrlInput] = useState('');
  const [finderProgress, setFinderProgress] = useState('');
  const [finderError, setFinderError] = useState<string | null>(null);
  const [detectedKey, setDetectedKey] = useState<string | null>(null);
  const [detectedBpm, setDetectedBpm] = useState<number | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [songTitle, setSongTitle] = useState<string | null>(null);
  const [artistName, setArtistName] = useState<string | null>(null);
  const [coverArtUrl, setCoverArtUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- BPM Tapper Logic ---
  const handleTap = useCallback(() => {
    const now = performance.now();
    setTapFeedback(true);
    setTimeout(() => setTapFeedback(false), 100);

    if (lastTapTimeRef.current && (now - lastTapTimeRef.current > MAX_TIME_BETWEEN_TAPS_MS)) {
      setTapTimestamps([now]);
      setCalculatedBpm(null);
      setStatusMessage('Tap sequence reset due to pause. Continue tapping.');
      lastTapTimeRef.current = now;
      trackLocalEvent(TOOL_CATEGORY, 'tapSequenceReset', 'timeout', 1);
      return;
    }
    lastTapTimeRef.current = now;

    const newTimestamps = [...tapTimestamps, now].slice(-MAX_TAPS_FOR_AVERAGE - 1);
    setTapTimestamps(newTimestamps);

    if (newTimestamps.length > 1) {
      const intervals = [];
      for (let i = 1; i < newTimestamps.length; i++) {
        intervals.push(newTimestamps[i] - newTimestamps[i - 1]);
      }

      const recentIntervals = intervals.slice(-MAX_TAPS_FOR_AVERAGE);

      if (recentIntervals.length > 0) {
        const averageInterval = recentIntervals.reduce((sum, val) => sum + val, 0) / recentIntervals.length;
        if (averageInterval > 0) {
          const bpm = 60000 / averageInterval;
          setCalculatedBpm(parseFloat(bpm.toFixed(1)));
          if (newTimestamps.length >= 3) trackLocalEvent(TOOL_CATEGORY, 'bpmCalculated', undefined, parseFloat(bpm.toFixed(1)));

          if (newTimestamps.length < 3) {
            setStatusMessage('Keep tapping to refine BPM...');
          } else {
            const stdDev = Math.sqrt(recentIntervals.map(x => Math.pow(x - averageInterval, 2)).reduce((a, b) => a + b, 0) / recentIntervals.length);
            if (stdDev > averageInterval * 0.25 && recentIntervals.length >= 3) {
              setStatusMessage(`Tap count: ${recentIntervals.length}. Taps seem irregular.`);
            } else {
              setStatusMessage(`Tap count: ${recentIntervals.length}. BPM is stabilizing.`);
            }
          }
        } else {
          setCalculatedBpm(null);
          setStatusMessage('Error: Invalid tap interval.');
        }
      } else {
        setStatusMessage('Tap again to calculate BPM.');
      }
    } else {
      setStatusMessage('Tap again to start calculating...');
    }
    trackLocalEvent(TOOL_CATEGORY, 'tapPerformed', undefined, 1);
  }, [tapTimestamps, trackLocalEvent]);

  const handleReset = useCallback(() => {
    setTapTimestamps([]);
    setCalculatedBpm(null);
    setStatusMessage('Tap the button rhythmically.');
    lastTapTimeRef.current = 0;
    trackLocalEvent(TOOL_CATEGORY, 'tapsReset', undefined, 1);
  }, [trackLocalEvent]);

  // --- Key & BPM Finder Logic ---

  const resetFinder = () => {
    setFinderState('idle');
    setFinderProgress('');
    setFinderError(null);
    setDetectedKey(null);
    setDetectedBpm(null);
    setFileName(null);
    setSongTitle(null);
    setArtistName(null);
    setCoverArtUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const analyzeAudio = async (audioBuffer: ArrayBuffer, sourceName: string, songInfo?: { title: string, artist: string, cover: string | null }) => {
    resetFinder();
    setFileName(sourceName);
    if (songInfo) {
      setSongTitle(songInfo.title);
      setArtistName(songInfo.artist);
      setCoverArtUrl(songInfo.cover);
    }
    setFinderState('analyzing');
    setFinderProgress('Decoding audio data...');
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const decodedBuffer = await audioContext.decodeAudioData(audioBuffer);

      setFinderProgress('Analyzing key signature...');
      const key = await detectKey(decodedBuffer, audioContext.sampleRate);
      setDetectedKey(key);
      trackLocalEvent(TOOL_CATEGORY, 'keyDetected', key || 'unknown');

      setFinderProgress('Analyzing tempo...');
      const bpm = await detectBpm(decodedBuffer, audioContext.sampleRate);
      setDetectedBpm(bpm);
      trackLocalEvent(TOOL_CATEGORY, 'bpmDetected', bpm ? String(bpm) : 'unknown');

      setFinderState('success');
      setFinderProgress('Analysis complete!');
    } catch (e) {
      console.error("Audio analysis failed:", e);
      const errorMessage = e instanceof Error ? e.message : "An unknown error occurred during analysis.";
      setFinderError(`Analysis failed: ${errorMessage}`);
      setFinderState('error');
      trackLocalEvent(TOOL_CATEGORY, 'analysisFailed', errorMessage);
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFinderUrlInput('');
      const reader = new FileReader();
      reader.onload = async (e) => {
        if (e.target?.result) {
          await analyzeAudio(e.target.result as ArrayBuffer, file.name);
        }
      };
      reader.onerror = () => {
        setFinderState('error');
        setFinderError('Failed to read the uploaded file.');
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const handleLoadFromUrl = async () => {
    if (!finderUrlInput.trim()) return;
    resetFinder();
    setFinderState('loading');
    setFinderProgress('Validating URL...');

    try {
      let audioUrl: string | undefined;
      let fetchedTitle = 'Song from URL';
      let fetchedArtist = 'Unknown Artist';
      let fetchedCoverArt: string | null = null;

      if (finderUrlInput.includes('riffusion.com') || finderUrlInput.includes('producer.ai')) {
        const songId = extractRiffusionSongId(finderUrlInput);
        if (!songId) throw new Error("Could not extract Riffusion ID.");
        setFinderProgress(`Fetching Riffusion song...`);
        const data = await fetchRiffusionSongData(songId);
        audioUrl = data?.audio_url;
        fetchedTitle = data?.title || fetchedTitle;
        fetchedArtist = data?.artist || fetchedArtist;
        fetchedCoverArt = data?.image_url || null;
      } else { // Assume Suno
        const songId = await resolveSunoUrlToPotentialSongId(finderUrlInput, setFinderProgress);
        if (!songId) throw new Error("Could not resolve Suno URL.");
        setFinderProgress(`Fetching Suno song details...`);
        const data = await fetchSunoClipById(songId);
        audioUrl = data?.audio_url;
        fetchedTitle = data?.title || fetchedTitle;
        fetchedArtist = data?.display_name || data?.handle || fetchedArtist;
        fetchedCoverArt = data?.image_url || null;
      }

      if (!audioUrl) throw new Error("Could not find a valid audio URL for the provided link.");

      setFinderProgress(`Downloading audio for analysis...`);
      const response = await fetch(audioUrl);
      if (!response.ok) throw new Error(`Failed to download audio: ${response.statusText}`);
      const audioData = await response.arrayBuffer();

      await analyzeAudio(audioData, fetchedTitle, { title: fetchedTitle, artist: fetchedArtist, cover: fetchedCoverArt });
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
      setFinderState('error');
      setFinderError(errorMessage);
      console.error("URL Load failed:", e);
    }
  };


  return (
    <div className={`w-full ${uiMode === 'classic' ? 'max-w-3xl mx-auto px-4 pb-20' : 'max-w-3xl mx-auto'}`}>
      {uiMode === 'classic' ? (
        <header className="mb-6 text-center pt-8">
          <h1 className="text-2xl md:text-3xl font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-tight">
            Tempo & Key
          </h1>
          <p className="mt-2 text-[11px] font-medium text-gray-600 dark:text-gray-400 max-w-3xl mx-auto text-center">
            High-fidelity rhythm analysis • Harmonic detection
          </p>
        </header>
      ) : (
        <header className="mb-2 md:mb-12 text-center pt-0 md:pt-8 px-4 animate-fadeIn">
          <h1 className="text-3xl sm:text-5xl md:text-7xl font-black uppercase tracking-tighter text-emerald-600 dark:text-emerald-500 leading-none italic drop-shadow-2xl mb-1 md:mb-4">Tempo & Key</h1>
          <p className="mt-1 md:mt-6 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.4em] text-gray-500 dark:text-gray-400 max-w-lg mx-auto opacity-60">High-fidelity rhythm analysis • Harmonic detection</p>
        </header>
      )}


      {/* Premium Tabs */}
      <div className="flex justify-center mb-12 p-2 bg-white/5 rounded-2xl border border-white/10 w-fit mx-auto backdrop-blur-xl gap-2 shadow-2xl shadow-black/20">
        <Button 
          onClick={() => setActiveTab('tapper')} 
          variant={activeTab === 'tapper' ? 'primary' : 'ghost'}
          size="md"
          className={`px-10 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 rounded-xl border-none
            ${activeTab === 'tapper' 
              ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20' 
              : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
        >
          BPM Tapper
        </Button>
        <Button 
          onClick={() => setActiveTab('finder')} 
          variant={activeTab === 'finder' ? 'primary' : 'ghost'}
          size="md"
          className={`px-10 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 rounded-xl border-none
            ${activeTab === 'finder' 
              ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20' 
              : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
        >
          Signal Finder
        </Button>
      </div>

      {activeTab === 'tapper' && (
        <main className="glass-card p-10 md:p-14 border-white/10 shadow-2xl relative overflow-hidden text-center animate-fadeIn">
          {/* Decorative Glow */}
          <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-emerald-500/20 blur-[100px] pointer-events-none transition-opacity duration-300 ${tapFeedback ? 'opacity-100' : 'opacity-40'}`}></div>

          <div className="relative z-10">
            <div className={`mb-12 text-7xl md:text-8xl font-black uppercase tracking-tighter transition-all duration-75 
                            ${calculatedBpm ? 'text-emerald-600 dark:text-emerald-500' : 'text-gray-200 dark:text-white/10'} 
                            ${tapFeedback ? 'scale-110 drop-shadow-[0_0_30px_rgba(16,185,129,0.6)]' : 'scale-100'}`} style={{ minHeight: '120px' }}>
              {calculatedBpm !== null ? Math.round(calculatedBpm) : '000'}
              <span className="text-xs font-black tracking-widest text-gray-500 ml-2">BPM</span>
            </div>

            <Button 
                onClick={handleTap} 
                variant="primary" 
                size="lg" 
                startIcon={<MetronomeIcon className={`w-8 h-8 ${tapFeedback ? 'text-black' : 'text-black/40'}`} />}
                className={`w-full py-12 mb-8 text-2xl font-black uppercase tracking-[0.4em] shadow-2xl transition-all duration-150
                           ${tapFeedback ? 'scale-[0.98]' : ''}`}
                backgroundColor="#10b981"
            >
              TAP
            </Button>

            <div className="mb-10 min-h-[20px]">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 opacity-60 transition-all">
                {statusMessage}
              </p>
            </div>

            <Button 
              onClick={handleReset} 
              variant="ghost" 
              size="sm" 
              startIcon={<RefreshIcon className="w-3.5 h-3.5" />}
              className="px-10 font-black uppercase tracking-widest text-[10px] border-white/10 text-red-500 hover:bg-red-500/10"
            >
              Reset Stream
            </Button>
          </div>
        </main>
      )}

      {activeTab === 'finder' && (
        <main className="w-full glass-card p-3 sm:p-6 md:p-10 border-white/10 text-gray-900 dark:text-gray-200 transition-all duration-500 animate-fadeIn overflow-hidden">
          <div className="space-y-8 relative z-10">
            {/* URL Input Group */}
            <div>
              <label htmlFor="finderUrlInput" className="block text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-3 ml-1">Source Analysis URL</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  id="finderUrlInput" 
                  value={finderUrlInput} 
                  onChange={(e) => setFinderUrlInput(e.target.value)} 
                  placeholder="Suno or Riffusion URL..." 
                  className="flex-grow px-6 py-3.5 bg-white/10 dark:bg-black/20 border border-white/10 rounded-2xl text-sm font-bold placeholder-gray-500 focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" 
                  disabled={finderState === 'loading' || finderState === 'analyzing'} 
                />
                <Button 
                  onClick={handleLoadFromUrl} 
                  disabled={!finderUrlInput.trim() || finderState === 'loading' || finderState === 'analyzing'} 
                  variant="primary"
                  startIcon={<LinkIcon className="w-4 h-4 ml-0.5" />}
                  className="px-8 font-black uppercase tracking-widest"
                  backgroundColor="#8b5cf6"
                >
                  Load
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex-grow h-px bg-white/5"></div>
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-600">or</span>
              <div className="flex-grow h-px bg-white/5"></div>
            </div>

            {/* File Upload Group */}
            <div>
              <label htmlFor="audioFile" className="block text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-3 ml-1">Local Signal Import</label>
              <div className="relative group">
                <input 
                  type="file" 
                  id="audioFile" 
                  accept="audio/mpeg,audio/wav,audio/ogg" 
                  onChange={handleFileChange} 
                  ref={fileInputRef} 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                  disabled={finderState === 'loading' || finderState === 'analyzing'} 
                />
                <div className="px-6 py-8 border-2 border-dashed border-white/10 rounded-3xl bg-white/5 group-hover:bg-white/10 group-hover:border-green-500/30 transition-all text-center">
                  <p className="text-xs font-black uppercase tracking-widest text-gray-400 group-hover:text-emerald-500 transition-colors">
                    {fileName || "Drop audio file or click to browse"}
                  </p>
                  <p className="text-[8px] font-black uppercase tracking-[0.2em] text-gray-600 mt-2 flex items-center justify-center gap-2">
                    <UploadIcon className="w-3 h-3" />
                    MP3, WAV, OGG supported
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Results Section */}
          <div className="mt-12 min-h-[16rem] flex flex-col items-center justify-center p-8 bg-slate-50/50 dark:bg-black/30 rounded-3xl border border-gray-200 dark:border-white/5 relative z-10">
            {finderState === 'idle' && <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-600">System idle. Awaiting signal.</p>}
            {(finderState === 'loading' || finderState === 'analyzing') && (
              <div className="flex flex-row items-center gap-6 p-6">
                <Spinner color="text-emerald-500" />
                <div className="text-left">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500 animate-pulse flex items-center gap-2">
                    <SparklesIcon className="w-3 h-3" />
                    Processing Signal
                  </p>
                  <p className="text-xs font-bold uppercase tracking-widest opacity-60">{finderProgress}</p>
                </div>
              </div>
            )}
            {finderState === 'error' && <p className="text-xs font-black uppercase tracking-widest text-red-500">{finderError}</p>}
            {finderState === 'success' && (
              <div className="text-center animate-fadeIn w-full space-y-8">
                {(songTitle || artistName || coverArtUrl) && (
                  <div className="p-6 bg-white/5 rounded-2xl border border-white/10 flex items-center gap-6 text-left">
                    {coverArtUrl && (
                      <div className="relative shrink-0">
                        <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full scale-125"></div>
                        <img 
                          src={coverArtUrl} 
                          alt={songTitle || 'Song Cover'} 
                          className="w-24 h-24 object-cover rounded-xl border border-white/20 relative z-10 shadow-2xl" 
                          onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_IMAGE_DATA_URI; }} 
                        />
                      </div>
                    )}
                    <div className="overflow-hidden">
                      {songTitle && <p className="text-lg font-black uppercase tracking-tight text-white truncate">{songTitle}</p>}
                      {artistName && <p className="text-xs font-black uppercase tracking-widest text-gray-500 truncate">by {artistName}</p>}
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-6">
                  <div className="p-6 bg-white/5 rounded-2xl border border-white/5">
                    <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-500 mb-2 opacity-70">Detected Key</p>
                    <p className="text-4xl font-black uppercase tracking-tighter text-white">{detectedKey || 'N/A'}</p>
                  </div>
                  <div className="p-6 bg-white/5 rounded-2xl border border-white/5">
                    <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-500 mb-2 opacity-70">Detected BPM</p>
                    <p className="text-4xl font-black uppercase tracking-tighter text-white">{detectedBpm !== null ? Math.round(detectedBpm) : 'N/A'}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      )}
    </div>
  );
};

// --- Analysis Logic ---
// Note: These are complex DSP algorithms simplified for a client-side implementation.
// They provide a good estimation but may not be as accurate as dedicated offline tools.

async function detectKey(buffer: AudioBuffer, sampleRate: number): Promise<string> {
  const offlineCtx = new OfflineAudioContext(1, buffer.length, sampleRate);
  const source = offlineCtx.createBufferSource();
  source.buffer = buffer;

  const analyser = offlineCtx.createAnalyser();
  analyser.fftSize = 4096;
  source.connect(analyser);
  source.start(0);

  return new Promise((resolve) => {
    offlineCtx.startRendering().then(renderedBuffer => {
      const freqData = new Float32Array(analyser.frequencyBinCount);
      analyser.getFloatFrequencyData(freqData);

      const pitchClasses = new Array(12).fill(0);
      for (let i = 0; i < analyser.frequencyBinCount; i++) {
        const freq = i * sampleRate / analyser.fftSize;
        if (freq === 0) continue;
        const midiNote = 12 * (Math.log2(freq / 440)) + 69;
        const pitchClass = Math.round(midiNote) % 12;
        if (pitchClass >= 0 && pitchClass < 12) {
          pitchClasses[pitchClass] += 10 ** (freqData[i] / 10);
        }
      }

      const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
      const majorTemplate = [1, 0, 0.5, 0, 1, 0.8, 0, 1, 0, 0.5, 0, 0.5];
      const minorTemplate = [1, 0, 0.5, 1, 0, 0.8, 0, 1, 0.5, 0, 0.5, 0];

      let bestMatch = { key: 'N/A', score: -Infinity };

      for (let i = 0; i < 12; i++) {
        // Test Major
        let majorScore = 0;
        for (let j = 0; j < 12; j++) {
          majorScore += majorTemplate[j] * pitchClasses[(i + j) % 12];
        }
        if (majorScore > bestMatch.score) {
          bestMatch = { key: `${noteNames[i]} Major`, score: majorScore };
        }

        // Test Minor
        let minorScore = 0;
        for (let j = 0; j < 12; j++) {
          minorScore += minorTemplate[j] * pitchClasses[(i + j) % 12];
        }
        if (minorScore > bestMatch.score) {
          bestMatch = { key: `${noteNames[i]} Minor`, score: minorScore };
        }
      }
      resolve(bestMatch.key);
    });
  });
}

async function detectBpm(buffer: AudioBuffer, sampleRate: number): Promise<number | null> {
  const channelData = buffer.getChannelData(0);
  const offlineCtx = new OfflineAudioContext(1, buffer.length, sampleRate);
  const source = offlineCtx.createBufferSource();
  source.buffer = buffer;

  const lowpass = offlineCtx.createBiquadFilter();
  lowpass.type = "lowpass";
  lowpass.frequency.setValueAtTime(150, 0);
  lowpass.Q.setValueAtTime(1, 0);
  source.connect(lowpass);

  let lastNode: AudioNode = lowpass;
  const peakIntervals: number[] = [];
  const threshold = 0.3;

  return new Promise((resolve) => {
    lowpass.connect(offlineCtx.destination);
    source.start(0);
    offlineCtx.startRendering().then(renderedBuffer => {
      const filteredData = renderedBuffer.getChannelData(0);
      let lastPeakTime = -1;

      for (let i = 1; i < filteredData.length - 1; i++) {
        if (filteredData[i] > threshold && filteredData[i] > filteredData[i - 1] && filteredData[i] > filteredData[i + 1]) {
          const peakTime = i / sampleRate;
          if (lastPeakTime !== -1) {
            const interval = peakTime - lastPeakTime;
            if (interval > 0.3 && interval < 3) { // 20-200 bpm range
              peakIntervals.push(interval);
            }
          }
          lastPeakTime = peakTime;
        }
      }

      if (peakIntervals.length < 5) {
        resolve(null);
        return;
      }

      const intervalGroups: Record<string, number> = {};
      peakIntervals.forEach(interval => {
        const tempo = 60 / interval;
        const roundedTempo = Math.round(tempo / 5) * 5; // Group by 5 bpm
        const key = roundedTempo.toString();
        intervalGroups[key] = (intervalGroups[key] || 0) + 1;
      });

      const sortedGroups = Object.entries(intervalGroups).sort((a, b) => b[1] - a[1]);

      if (sortedGroups.length > 0) {
        resolve(parseInt(sortedGroups[0][0]));
      } else {
        resolve(null);
      }
    });
  });
}

export default BpmAndKeyFinderTool;
