
import React, { useState, useCallback, useRef } from 'react';
import type { ToolProps } from '../../Layout';
import Spinner from '../../components/Spinner';
import { resolveSunoUrlToPotentialSongId, fetchSunoClipById } from '../../services/sunoService';
import { fetchRiffusionSongData, extractRiffusionSongId } from '../../services/riffusionService';


const TOOL_CATEGORY = 'BPMTapper';
const MAX_TAPS_FOR_AVERAGE = 8;
const MAX_TIME_BETWEEN_TAPS_MS = 5000;

const LOGO_SVG_STRING = `<svg viewBox='0 0 100 100' fill='none' xmlns='http://www.w3.org/2000/svg'><path d='M50 10 L85 27.5 V72.5 L50 90 L15 72.5 V27.5 L50 10 Z' stroke='#059669' stroke-width='8' fill='transparent'/><circle cx='50' cy='35' r='7' fill='#14B8A6'/><circle cx='35' cy='65' r='6' fill='#14B8A6'/><circle cx='65' cy='65' r='6' fill='#14B8A6'/><line x1='50' y1='35' x2='35' y2='65' stroke='#10B981' stroke-width='5' stroke-linecap='round'/><line x1='50' y1='35' x2='65' y2='65' stroke='#10B981' stroke-width='5' stroke-linecap='round'/><line x1='38' y1='63' x2='62' y2='63' stroke='#10B981' stroke-width='5' stroke-linecap='round'/></svg>`;
const FALLBACK_IMAGE_DATA_URI = `data:image/svg+xml;base64,${btoa(LOGO_SVG_STRING)}`;


const BpmAndKeyFinderTool: React.FC<ToolProps> = ({ trackLocalEvent }) => {
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
    <div className="w-full max-w-2xl mx-auto text-center">
      <header className="mb-10">
        <h1 className="text-5xl font-extrabold text-green-600 dark:text-green-400">BPM & Key Finder</h1>
        <p className="mt-3 text-md text-gray-700 dark:text-gray-300">
          Two tools in one! Tap the beat to find the BPM, or upload/link an audio file to automatically detect its key and tempo.
        </p>
      </header>

      <div className="flex justify-center border-b border-gray-300 dark:border-gray-700 mb-6">
        <button onClick={() => setActiveTab('tapper')} className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'tapper' ? 'border-b-2 border-green-600 dark:border-green-400 text-green-700 dark:text-green-300' : 'text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white'}`}>BPM Tapper</button>
        <button onClick={() => setActiveTab('finder')} className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'finder' ? 'border-b-2 border-green-600 dark:border-green-400 text-green-700 dark:text-green-300' : 'text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white'}`}>Key & BPM Finder</button>
      </div>

      {activeTab === 'tapper' && (
        <main className="bg-white dark:bg-gray-900 shadow-2xl rounded-lg p-6 md:p-10 border-2 border-green-600 dark:border-green-500 transition-colors duration-300">
          <div className={`mb-8 text-6xl font-bold transition-transform duration-100 ease-out ${calculatedBpm ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-600'} ${tapFeedback ? 'scale-105' : 'scale-100'}`} style={{ minHeight: '80px' }} aria-live="polite">
            {calculatedBpm !== null ? calculatedBpm : '---'}
          </div>
          <button onClick={handleTap} className={`w-full py-8 px-6 mb-6 text-2xl font-semibold text-black bg-green-500 rounded-lg shadow-xl hover:bg-green-600 focus:outline-none focus:ring-4 focus:ring-green-400 focus:ring-opacity-50 active:bg-green-700 transform active:scale-95 transition-all duration-150 ease-in-out ${tapFeedback ? 'scale-105 ring-4 ring-green-300' : ''}`} aria-label="Tap beat here">TAP BEAT</button>
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-6 h-5" aria-live="polite">{statusMessage}</div>
          <button onClick={handleReset} className="py-2 px-6 text-sm font-medium text-red-600 dark:text-red-300 bg-transparent border-2 border-red-600 dark:border-red-500 rounded-md hover:bg-red-100 dark:hover:bg-red-700 hover:text-red-800 dark:hover:text-white dark:hover:border-red-700 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900 transition-colors" aria-label="Reset tap count and BPM calculation">RESET TAPS</button>
        </main>
      )}

      {activeTab === 'finder' && (
        <main className="bg-white dark:bg-gray-900 shadow-2xl rounded-lg p-6 md:p-10 border-2 border-green-600 dark:border-green-500 transition-colors duration-300">
          <div className="space-y-4">
            <div>
              <label htmlFor="finderUrlInput" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Load from Suno/Riffusion URL</label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <input type="text" id="finderUrlInput" value={finderUrlInput} onChange={(e) => setFinderUrlInput(e.target.value)} placeholder="https://suno.com/song/..." className="block w-full flex-1 rounded-none rounded-l-md border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-green-500 focus:ring-green-500 sm:text-sm" disabled={finderState === 'loading' || finderState === 'analyzing'} />
                <button type="button" onClick={handleLoadFromUrl} disabled={!finderUrlInput.trim() || finderState === 'loading' || finderState === 'analyzing'} className="relative -ml-px inline-flex items-center space-x-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 disabled:opacity-50">Load</button>
              </div>
            </div>
            <div className="flex items-center"><div className="flex-grow border-t border-gray-300 dark:border-gray-700"></div><span className="flex-shrink mx-4 text-gray-500">OR</span><div className="flex-grow border-t border-gray-300 dark:border-gray-700"></div></div>
            <div>
              <label htmlFor="audioFile" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Upload Audio File</label>
              <input type="file" id="audioFile" accept="audio/mpeg,audio/wav,audio/ogg" onChange={handleFileChange} ref={fileInputRef} className="mt-1 block w-full text-sm text-gray-600 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-green-600 file:text-black hover:file:bg-green-500" disabled={finderState === 'loading' || finderState === 'analyzing'} />
            </div>
          </div>

          <div className="mt-8 min-h-[12rem] flex flex-col items-center justify-center p-4 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            {finderState === 'idle' && <p className="text-gray-600 dark:text-gray-400">Upload or link an audio file to begin analysis.</p>}
            {(finderState === 'loading' || finderState === 'analyzing') && <div className="flex flex-col items-center"><Spinner color="text-green-600 dark:text-green-400" /><p className="mt-2 text-green-700 dark:text-green-300">{finderProgress}</p></div>}
            {finderState === 'error' && <p className="text-red-600 dark:text-red-400">{finderError}</p>}
            {finderState === 'success' && (
              <div className="text-center animate-fadeIn w-full">
                {(songTitle || artistName || coverArtUrl) && (
                  <div className="mb-4 p-3 bg-gray-200 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 flex flex-col items-center gap-2">
                    {coverArtUrl && <img src={coverArtUrl} alt={songTitle || 'Song Cover'} className="w-24 h-24 object-cover rounded-md border-2 border-green-500" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_IMAGE_DATA_URI; }} />}
                    <div>
                      {songTitle && <p className="text-lg text-green-700 dark:text-green-300">{songTitle}</p>}
                      {artistName && <p className="text-md text-gray-600 dark:text-gray-400">by {artistName}</p>}
                    </div>
                  </div>
                )}
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Analysis for: <strong className="text-green-800 dark:text-green-200">{fileName}</strong></p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-lg text-green-700 dark:text-green-400 font-semibold">Detected Key</p>
                    <p className="text-4xl font-bold text-gray-900 dark:text-white">{detectedKey || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-lg text-green-700 dark:text-green-400 font-semibold">Detected BPM</p>
                    <p className="text-4xl font-bold text-gray-900 dark:text-white">{detectedBpm !== null ? detectedBpm.toFixed(1) : 'N/A'}</p>
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
