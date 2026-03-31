
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import type { ToolProps } from '@/Layout';

const TOOL_CATEGORY = 'MetronomeTool';
const LOCAL_STORAGE_BPM_KEY = 'metronome_bpm_v1';
const LOCAL_STORAGE_TS_KEY = 'metronome_timeSignature_v1';
const LOCAL_STORAGE_SUBDIVISION_KEY = 'metronome_subdivision_v1';
const LOCAL_STORAGE_CLICKSOUND_KEY = 'metronome_clickSound_v1';

type SubdivisionType = 'none' | 'eighth' | 'sixteenth' | 'triplet';
type ClickSoundType = 'classic' | 'woodblock' | 'digital';

const MetronomeTool: React.FC<ToolProps> = ({ trackLocalEvent }) => {
  const [bpm, setBpm] = useState<number>(() => {
    const savedBpm = localStorage.getItem(LOCAL_STORAGE_BPM_KEY);
    return savedBpm ? parseInt(savedBpm, 10) : 120;
  });
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [timeSignature, setTimeSignature] = useState<string>(() => {
    return localStorage.getItem(LOCAL_STORAGE_TS_KEY) || "4/4";
  });
  const [subdivision, setSubdivision] = useState<SubdivisionType>(() => {
    return (localStorage.getItem(LOCAL_STORAGE_SUBDIVISION_KEY) as SubdivisionType) || 'none';
  });
  const [clickSound, setClickSound] = useState<ClickSoundType>(() => {
    return (localStorage.getItem(LOCAL_STORAGE_CLICKSOUND_KEY) as ClickSoundType) || 'classic';
  });
  const [visualBeat, setVisualBeat] = useState<number>(0); // 0: off, 1: normal, 2: accent

  const audioContextRef = useRef<AudioContext | null>(null);
  const nextBeatTimeRef = useRef<number>(0);
  const beatCountRef = useRef<number>(0); // Counts beats within the current bar
  const timerIdRef = useRef<number | null>(null);
  const activeSourcesRef = useRef(new Set<AudioScheduledSourceNode>());

  const beatsPerBar = useMemo(() => parseInt(timeSignature.split('/')[0], 10), [timeSignature]);

  useEffect(() => { localStorage.setItem(LOCAL_STORAGE_BPM_KEY, bpm.toString()); }, [bpm]);
  useEffect(() => { localStorage.setItem(LOCAL_STORAGE_TS_KEY, timeSignature); }, [timeSignature]);
  useEffect(() => { localStorage.setItem(LOCAL_STORAGE_SUBDIVISION_KEY, subdivision); }, [subdivision]);
  useEffect(() => { localStorage.setItem(LOCAL_STORAGE_CLICKSOUND_KEY, clickSound); }, [clickSound]);

  const initializeAudioContext = useCallback(async (): Promise<boolean> => {
    if (!audioContextRef.current) {
      try {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      } catch (e) {
        console.error("Web Audio API is not supported by your browser.", e);
        alert("Web Audio API is not supported by your browser.");
        return false;
      }
    }
    const audioCtx = audioContextRef.current;
    if (audioCtx.state === 'suspended') {
      try {
        await audioCtx.resume();
      } catch (e) {
        console.error("Failed to resume audio context.", e);
        alert("Failed to resume audio context. Please interact with the page (e.g. click) and try again.");
        return false;
      }
    }
    return audioCtx.state === 'running';
  }, []);

  const playActualClick = useCallback((time: number, isAccent: boolean, isSubdivision: boolean, soundProfile: ClickSoundType) => {
    const audioCtx = audioContextRef.current;
    if (!audioCtx || audioCtx.state !== 'running') return;

    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    let freq: number;
    let vol: number;
    let clickDuration: number;
    let oscType: OscillatorType = 'square';

    switch (soundProfile) {
        case 'woodblock':
            oscType = 'triangle'; // Softer, more percussive
            freq = isAccent ? 1000 : 800;
            vol = isAccent ? 0.2 : 0.12;
            clickDuration = 0.05;
            if (isSubdivision) { vol *= 0.5; freq *= 0.8; clickDuration = 0.03;}
            gainNode.gain.setValueAtTime(vol, time);
            gainNode.gain.exponentialRampToValueAtTime(0.0001, time + clickDuration);
            break;
        case 'digital':
            oscType = 'sine';
            freq = isAccent ? 1800 : 1500;
            vol = isAccent ? 0.15 : 0.1;
            clickDuration = 0.06;
            if (isSubdivision) { vol *= 0.4; freq *= 0.9; clickDuration = 0.03; }
            gainNode.gain.setValueAtTime(vol, time);
            gainNode.gain.exponentialRampToValueAtTime(0.0001, time + clickDuration);
            break;
        case 'classic':
        default:
            oscType = 'square';
            freq = isAccent ? 1500 : 1000;
            vol = isAccent ? 0.25 : 0.15;
            clickDuration = 0.08;
            if (isSubdivision) { vol *= 0.3; freq *= 0.7; clickDuration = 0.04; }
            gainNode.gain.setValueAtTime(vol, time);
            gainNode.gain.exponentialRampToValueAtTime(0.0001, time + clickDuration);
            break;
    }
    
    oscillator.type = oscType;
    oscillator.frequency.setValueAtTime(freq, time);
    
    activeSourcesRef.current.add(oscillator);
    oscillator.onended = () => { activeSourcesRef.current.delete(oscillator); gainNode.disconnect(); oscillator.disconnect(); };
    oscillator.start(time);
    oscillator.stop(time + clickDuration + 0.01); // Allow for ramp
  }, []);


  const stopAllSounds = useCallback(() => {
    activeSourcesRef.current.forEach(source => { try { source.stop(0); } catch (e) { /* Ignore */ } });
    activeSourcesRef.current.clear();
  }, []);


  const scheduler = useCallback(() => {
    const audioCtx = audioContextRef.current;
    if (!audioCtx || audioCtx.state !== 'running' || !isPlaying) {
      if (timerIdRef.current) clearTimeout(timerIdRef.current);
      timerIdRef.current = null;
      return;
    }
    
    const scheduleAheadTime = 0.1; 
    const beatInterval = 60.0 / bpm;

    while (nextBeatTimeRef.current < audioCtx.currentTime + scheduleAheadTime) {
      const currentBeatInBar = beatCountRef.current % beatsPerBar;
      const isAccentBeat = currentBeatInBar === 0;
      
      // Schedule main beat
      playActualClick(nextBeatTimeRef.current, isAccentBeat, false, clickSound);
      
      const timeUntilVisualBeat = (nextBeatTimeRef.current - audioCtx.currentTime) * 1000;
      setTimeout(() => {
        setVisualBeat(isAccentBeat ? 2 : 1);
        setTimeout(() => setVisualBeat(0), 80);
      }, Math.max(0, timeUntilVisualBeat - 10));

      // Schedule subdivisions
      if (subdivision !== 'none') {
        let numSubdivisions = 0;
        if (subdivision === 'eighth') numSubdivisions = 1; // 1 additional click
        else if (subdivision === 'sixteenth') numSubdivisions = 3; // 3 additional clicks
        else if (subdivision === 'triplet') numSubdivisions = 2; // 2 additional clicks

        for (let i = 1; i <= numSubdivisions; i++) {
          const subdivisionTime = nextBeatTimeRef.current + (beatInterval / (numSubdivisions + 1)) * i;
          playActualClick(subdivisionTime, false, true, clickSound);
        }
      }

      nextBeatTimeRef.current += beatInterval;
      beatCountRef.current = (beatCountRef.current + 1); // Keep simple count, use modulo for accent
    }
    timerIdRef.current = window.setTimeout(scheduler, 25);
  }, [isPlaying, bpm, beatsPerBar, playActualClick, clickSound, subdivision]);

  useEffect(() => {
    if (isPlaying) {
      if (audioContextRef.current && audioContextRef.current.state === 'running') {
        nextBeatTimeRef.current = audioContextRef.current.currentTime + 0.1;
        beatCountRef.current = 0; 
        scheduler();
      } else {
        console.error("Metronome: isPlaying is true, but AudioContext is not ready.");
        setIsPlaying(false);
        alert("Metronome could not start due to an audio system issue. Please try again.");
      }
    } else {
      if (timerIdRef.current) {
        clearTimeout(timerIdRef.current);
        timerIdRef.current = null;
      }
      stopAllSounds(); 
      setVisualBeat(0);
    }
    return () => { if (timerIdRef.current) { clearTimeout(timerIdRef.current); timerIdRef.current = null; }};
  }, [isPlaying, scheduler, stopAllSounds]);

  const handleStartStop = useCallback(async () => {
    if (!isPlaying) {
      const audioContextReady = await initializeAudioContext();
      if (!audioContextReady) return;
      setIsPlaying(true);
      trackLocalEvent(TOOL_CATEGORY, 'metronomeStarted', `BPM:${bpm} TS:${timeSignature} Sub:${subdivision} Sound:${clickSound}`, 1);
    } else {
      setIsPlaying(false);
      trackLocalEvent(TOOL_CATEGORY, 'metronomeStopped', undefined, 1);
    }
  }, [isPlaying, initializeAudioContext, trackLocalEvent, bpm, timeSignature, subdivision, clickSound]);

  useEffect(() => {
    return () => { stopAllSounds(); if (audioContextRef.current && audioContextRef.current.state !== 'closed') { audioContextRef.current.close().catch(e => console.warn("Error closing AudioContext on unmount:", e)); } audioContextRef.current = null; };
  }, [stopAllSounds]);
  
  const handleBpmChange = (e: React.ChangeEvent<HTMLInputElement>) => { const newBpm = parseInt(e.target.value, 10); if (newBpm >= 20 && newBpm <= 300) setBpm(newBpm); };
  const handleTimeSignatureChange = (e: React.ChangeEvent<HTMLSelectElement>) => { setTimeSignature(e.target.value); beatCountRef.current = 0; };
  const handleSubdivisionChange = (e: React.ChangeEvent<HTMLSelectElement>) => setSubdivision(e.target.value as SubdivisionType);
  const handleClickSoundChange = (e: React.ChangeEvent<HTMLSelectElement>) => setClickSound(e.target.value as ClickSoundType);

  const visualBeatClass = () => { 
      if (visualBeat === 2) return 'bg-green-300 dark:bg-green-300 scale-110 border-green-500 dark:border-green-400'; // Accent
      if (visualBeat === 1) return 'bg-green-500 dark:bg-green-500 scale-105 border-green-600 dark:border-green-500'; // Normal
      return 'bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600'; // Off
  };

  return (
    <div className="w-full max-w-sm mx-auto text-center">
      <header className="mb-10">
        <h1 className="text-5xl font-extrabold text-green-600 dark:text-green-400">Metronome</h1>
        <p className="mt-3 text-md text-gray-700 dark:text-gray-300">Set your tempo and keep a steady beat. Now with subdivisions and custom click sounds!</p>
      </header>

      <main className="bg-white dark:bg-gray-900 shadow-2xl rounded-lg p-6 md:p-10 border-2 border-green-600 dark:border-green-500">
        <div className="mb-8"> 
            <div className={`w-24 h-24 mx-auto rounded-full transition-all duration-50 ${visualBeatClass()} shadow-lg border-4`} aria-hidden="true"></div> 
        </div>
        <div className="mb-6"> 
            <label htmlFor="bpm" className="block text-sm font-medium text-gray-700 dark:text-green-400 mb-1">
                BPM: <span className="text-gray-900 dark:text-white font-semibold">{bpm}</span>
            </label> 
            <input type="range" id="bpm" value={bpm} onChange={handleBpmChange} min="20" max="300" step="1" className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-600 dark:accent-green-500 focus:outline-none focus:ring-1 focus:ring-green-400" aria-label="Beats Per Minute slider"/> 
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div> 
                <label htmlFor="timeSignature" className="block text-xs font-medium text-gray-700 dark:text-green-400 mb-0.5">Time Signature</label> 
                <select id="timeSignature" value={timeSignature} onChange={handleTimeSignatureChange} className="w-full px-2 py-1.5 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-green-500 rounded-md text-gray-900 dark:text-white focus:ring-green-500 dark:focus:ring-green-400 focus:border-green-500 dark:focus:border-green-400 text-sm">
                    <option value="4/4">4/4</option><option value="3/4">3/4</option><option value="2/4">2/4</option><option value="6/8">6/8</option>
                </select> 
            </div>
            <div> 
                <label htmlFor="subdivision" className="block text-xs font-medium text-gray-700 dark:text-green-400 mb-0.5">Subdivision</label> 
                <select id="subdivision" value={subdivision} onChange={handleSubdivisionChange} className="w-full px-2 py-1.5 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-green-500 rounded-md text-gray-900 dark:text-white focus:ring-green-500 dark:focus:ring-green-400 focus:border-green-500 dark:focus:border-green-400 text-sm">
                    <option value="none">None</option><option value="eighth">Eighth Notes</option><option value="sixteenth">Sixteenth Notes</option><option value="triplet">Triplets</option>
                </select> 
            </div>
            <div> 
                <label htmlFor="clickSound" className="block text-xs font-medium text-gray-700 dark:text-green-400 mb-0.5">Click Sound</label> 
                <select id="clickSound" value={clickSound} onChange={handleClickSoundChange} className="w-full px-2 py-1.5 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-green-500 rounded-md text-gray-900 dark:text-white focus:ring-green-500 dark:focus:ring-green-400 focus:border-green-500 dark:focus:border-green-400 text-sm">
                    <option value="classic">Classic Click</option><option value="woodblock">Woodblock</option><option value="digital">Digital Beep</option>
                </select> 
            </div>
        </div>
        
        <button onClick={handleStartStop} className={`w-full py-4 px-6 text-xl font-semibold rounded-lg shadow-md transition-all duration-150 ease-in-out focus:outline-none focus:ring-4 focus:ring-opacity-50 ${isPlaying ? 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-400' : 'bg-green-500 hover:bg-green-600 text-black focus:ring-green-400'}`} aria-pressed={isPlaying}> {isPlaying ? 'STOP' : 'START'} </button>
      </main>
    </div>
  );
};
export default MetronomeTool;
