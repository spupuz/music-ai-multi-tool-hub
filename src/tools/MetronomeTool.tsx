
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import Spinner from '@/components/Spinner';
import type { ToolProps } from '@/Layout';
import Button from '@/components/common/Button';
import Select from '@/components/common/Select';
import { MetronomeIcon, StopIcon } from '@/components/Icons';

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
    <div className="w-full max-w-lg mx-auto">
      <header className="mb-2 md:mb-14 text-center pt-0 md:pt-8 px-4 animate-fadeIn">
        <h1 className="text-2xl md:text-6xl font-black uppercase tracking-tighter text-emerald-600 dark:text-emerald-500 leading-none italic drop-shadow-2xl mb-1 md:mb-4">Metronome</h1>
        <p className="mt-1 md:mt-4 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.4em] text-gray-500 dark:text-gray-400 max-w-xl mx-auto opacity-70">
            Temporal Synchronization Core • Precision Rhythmic Alignment
        </p>
      </header>

      <main className="w-full glass-card p-2 sm:p-6 md:p-10 border-white/10 text-gray-900 dark:text-gray-200 transition-all duration-500 animate-fadeIn overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-green-500/10 blur-[80px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/5 blur-[80px] pointer-events-none"></div>

        <div className="mb-12 flex justify-center"> 
            <div className={`w-32 h-32 rounded-3xl transition-all duration-75 flex items-center justify-center border-2 border-white/5 shadow-2xl
                            ${visualBeat === 2 
                              ? 'bg-green-500 shadow-[0_0_50px_rgba(34,197,94,0.4)] scale-110' 
                              : visualBeat === 1 
                                ? 'bg-green-500/40 shadow-[0_0_30px_rgba(34,197,94,0.2)] scale-105' 
                                : 'bg-white/5 backdrop-blur-xl opacity-20'}`} 
                 aria-hidden="true">
              <div className={`w-4 h-4 rounded-full ${visualBeat > 0 ? 'bg-white' : 'bg-transparent'}`}></div>
            </div> 
        </div>

        <div className="mb-10 text-left"> 
            <label htmlFor="bpm" className="block text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-4 ml-1">
                Tempo · <span className="text-green-600 dark:text-green-500 font-black">{bpm} BPM</span>
            </label> 
            <input 
              type="range" 
              id="bpm" 
              value={bpm} 
              onChange={handleBpmChange} 
              min="20" 
              max="300" 
              step="1" 
              className="w-full h-1.5 bg-slate-200/50 dark:bg-white/5 rounded-full appearance-none cursor-pointer accent-green-500 focus:outline-none" 
            /> 
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
            <Select 
              label="Signature" 
              value={timeSignature} 
              onChange={(val) => { setTimeSignature(val); beatCountRef.current = 0; }} 
              options={[
                { value: "4/4", label: "4/4" },
                { value: "3/4", label: "3/4" },
                { value: "2/4", label: "2/4" },
                { value: "6/8", label: "6/8" }
              ]} 
            />
            <Select 
              label="Subdivision" 
              value={subdivision} 
              onChange={(val) => setSubdivision(val as SubdivisionType)} 
              options={[
                { value: "none", label: "None" },
                { value: "eighth", label: "1/8" },
                { value: "sixteenth", label: "1/16" },
                { value: "triplet", label: "Triplet" }
              ]} 
            />
            <Select 
              label="Tone" 
              value={clickSound} 
              onChange={(val) => setClickSound(val as ClickSoundType)} 
              options={[
                { value: "classic", label: "Classic" },
                { value: "woodblock", label: "Wood" },
                { value: "digital", label: "Beep" }
              ]} 
            />
        </div>
        
        <Button 
          onClick={handleStartStop} 
          variant={isPlaying ? "ghost" : "primary"}
          size="lg"
          startIcon={isPlaying ? <StopIcon className="w-5 h-5 ml-1" /> : <MetronomeIcon className="w-6 h-6 ml-0.5" />}
          className={`w-full font-black uppercase tracking-[0.3em] py-6 shadow-2xl transition-all duration-300
                     ${isPlaying ? 'border-red-500/50 text-red-500 hover:bg-red-500/10' : ''}`}
          backgroundColor={isPlaying ? undefined : "#10b981"}
        >
          {isPlaying ? 'Disable Pulse' : 'Initiate Pulse'}
        </Button>
      </main>
    </div>
  );
};
export default MetronomeTool;
