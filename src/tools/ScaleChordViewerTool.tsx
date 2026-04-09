
import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  NOTES_SHARP,
  SCALE_INTERVALS,
  getScaleNotes,
  getDiatonicChords,
  DiatonicChordInfo
} from '@/utils/musicTheoryUtils';
import type { ToolProps } from '@/Layout';
import { useTheme } from '@/context/ThemeContext';
import Button from '@/components/common/Button';
import Select from '@/components/common/Select';
import { MusicNoteIcon, SparklesIcon, SparkTuneIcon as SpeakerIcon } from '@/components/Icons';

const TOOL_CATEGORY = 'ScaleChordViewer';

const rootNoteOptions = NOTES_SHARP.map(note => ({ value: note, label: note }));
const scaleTypeOptions = Object.keys(SCALE_INTERVALS).map(modeName => ({
    value: modeName,
    label: modeName.replace(/([A-Z])/g, ' $1').replace('Natural M', 'M').trim()
}));



const calculateFrequencyForNote = (noteName: string, octave: number = 4): number => {
    const noteNameOnly = noteName.replace(/[0-9]/g, '').trim();
    let noteIndex = NOTES_SHARP.indexOf(noteNameOnly);
    if (noteIndex === -1) {
        const flatNotes = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
        const equivalentSharpIndexMap: Record<string, number> = {
            'Db': NOTES_SHARP.indexOf('C#'), 'Eb': NOTES_SHARP.indexOf('D#'),
            'Gb': NOTES_SHARP.indexOf('F#'), 'Ab': NOTES_SHARP.indexOf('G#'),
            'Bb': NOTES_SHARP.indexOf('A#')
        };
        noteIndex = equivalentSharpIndexMap[noteNameOnly] ?? NOTES_SHARP.indexOf(noteNameOnly);
    }
    if (noteIndex === -1) noteIndex = 0;
    const midiNoteNumber = noteIndex + (octave * 12) + 12;
    return 440 * Math.pow(2, (midiNoteNumber - 69) / 12);
};



const ScaleChordViewerTool: React.FC<ToolProps> = ({ trackLocalEvent }) => {
  const { uiMode } = useTheme();
  const [rootNote, setRootNote] = useState<string>('C');
  const [scaleType, setScaleType] = useState<string>('Major');
  
  const [scaleNotesDisplay, setScaleNotesDisplay] = useState<string[]>([]);
  const [diatonicTriads, setDiatonicTriads] = useState<DiatonicChordInfo[]>([]);
  const [diatonicSeventhChords, setDiatonicSeventhChords] = useState<DiatonicChordInfo[]>([]);
  
  const [error, setError] = useState<string | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const [playingChordName, setPlayingChordName] = useState<string | null>(null);
  const activeSourcesRef = useRef(new Set<AudioScheduledSourceNode>());


  useEffect(() => {
    try {
      setError(null);
      const notes = getScaleNotes(rootNote, scaleType);
      setScaleNotesDisplay(notes);
      
      const triads = getDiatonicChords(rootNote, scaleType, 'triad');
      setDiatonicTriads(triads);
      
      const sevenths = getDiatonicChords(rootNote, scaleType, 'seventh');
      setDiatonicSeventhChords(sevenths);
      
      trackLocalEvent(TOOL_CATEGORY, 'scaleViewed', `${rootNote} ${scaleType}`, 1);

    } catch (err) {
      setError(err instanceof Error ? err.message : "Error calculating scale/chords.");
      setScaleNotesDisplay([]);
      setDiatonicTriads([]);
      setDiatonicSeventhChords([]);
    }
  }, [rootNote, scaleType, trackLocalEvent]);

  const initializeAudioContext = async (): Promise<AudioContext | null> => {
    if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
        try { audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)(); } 
        catch (e) { setError("Web Audio API is not supported."); return null; }
    }
    const audioCtx = audioContextRef.current;
    if (audioCtx.state === 'suspended') {
        try { await audioCtx.resume(); } 
        catch (e) { setError("Failed to resume audio context."); return null; }
    }
    return audioCtx;
  };

  const stopAllSounds = useCallback(() => {
    activeSourcesRef.current.forEach(source => {
        try { source.stop(0); } catch (e) { /* Ignore errors */ }
    });
    activeSourcesRef.current.clear();
    setPlayingChordName(null);
  }, []);

  const playChordNotes = useCallback((notes: string[], audioCtx: AudioContext, startTime: number, duration: number = 1.0, volume: number = 0.15) => {
    notes.forEach((noteName, index) => {
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      osc.type = 'sine';
      let baseOctave = 3;
      if (index > 1 && notes.length > 3 ) baseOctave = 4;
      if (['A', 'A#', 'B', 'Bb'].includes(rootNote)) baseOctave = 2;
      
      osc.frequency.value = calculateFrequencyForNote(noteName, baseOctave);
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(volume, startTime + 0.05);
      gainNode.gain.setValueAtTime(volume, startTime + duration - 0.1);
      gainNode.gain.linearRampToValueAtTime(0, startTime + duration);
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      activeSourcesRef.current.add(osc);
      // FIX: Changed `oscillator` to `osc` to match the variable name.
      osc.onended = () => {
        activeSourcesRef.current.delete(osc);
        gainNode.disconnect();
        osc.disconnect(); 
      };
      
      osc.start(startTime);
      osc.stop(startTime + duration);
    });
  }, [rootNote]);

  const handlePlayChord = async (chordInfo: DiatonicChordInfo) => {
    if (playingChordName) return;
    const audioCtx = await initializeAudioContext();
    if (!audioCtx) return;
    stopAllSounds();
    setPlayingChordName(chordInfo.name);
    playChordNotes(chordInfo.notes, audioCtx, audioCtx.currentTime, 0.8, 0.2);
    trackLocalEvent(TOOL_CATEGORY, 'chordPlayed', chordInfo.name, 1);
    setTimeout(() => { setPlayingChordName(null); }, 800);
  };

  useEffect(() => {
    return () => {
      stopAllSounds();
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(e => console.warn("Error closing AudioContext on unmount:", e));
      }
      audioContextRef.current = null;
    };
  }, [stopAllSounds]);

  const ChordDisplayCard: React.FC<{chord: DiatonicChordInfo}> = ({ chord }) => (
    <Button 
        key={chord.name + chord.roman} 
        onClick={() => handlePlayChord(chord)} 
        disabled={!!playingChordName}
        variant="ghost"
        className={`p-4 bg-slate-50/50 dark:bg-black/20 rounded-2xl border border-gray-100 dark:border-white/10 group relative transition-all duration-300 hover:bg-white/10 hover:border-emerald-500/30 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed flex flex-row items-center justify-between gap-3 shadow-none h-auto w-full ${playingChordName === chord.name ? 'ring-2 ring-emerald-500/50 bg-emerald-500/5 border-emerald-500/20' : ''}`}
        aria-label={`Play chord ${chord.name} (${chord.roman})`}
        endIcon={<SpeakerIcon className={`shrink-0 w-4 h-4 transition-all duration-300 ${playingChordName === chord.name ? 'text-emerald-500 scale-125' : 'text-gray-400 group-hover:text-emerald-500 opacity-20 group-hover:opacity-80'}`} />}
    >
        <div className="text-left min-w-0">
            <p className="text-sm font-black uppercase tracking-tighter text-gray-900 dark:text-white truncate">{chord.name}</p>
            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-500">{chord.roman}</p>
            <p className="text-[8px] font-bold text-gray-500 dark:text-gray-600 truncate opacity-40 group-hover:opacity-100 transition-opacity">({chord.notes.join(', ')})</p>
        </div>
    </Button>
  );


  return (
    <div className={`w-full ${uiMode === 'classic' ? 'max-w-7xl mx-auto px-4 pb-20' : ''}`}>
      {uiMode === 'classic' ? (
        <header className="mb-6 text-center pt-8">
          <h1 className="text-2xl md:text-3xl font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-tight">
            Scale & Chord Viewer
          </h1>
          <p className="mt-2 text-[11px] font-medium text-gray-600 dark:text-gray-400 max-w-3xl mx-auto text-center">
            Musical Theory Matrix • Interactive Harmonic Map
          </p>
        </header>
      ) : (
        <header className="mb-2 md:mb-14 text-center pt-0 md:pt-8 px-4 animate-fadeIn">
          <h1 className="text-3xl sm:text-5xl md:text-7xl font-black uppercase tracking-tighter text-emerald-600 dark:text-emerald-500 leading-none italic drop-shadow-2xl mb-1 md:mb-4">Scale & Chord Viewer</h1>
          <p className="mt-1 md:mt-4 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.4em] text-gray-500 dark:text-gray-400 max-w-xl mx-auto opacity-70">
              Musical Theory Matrix • Interactive Harmonic Map
          </p>
        </header>
      )}

      <main className="w-full glass-card p-2 sm:p-6 md:p-10 border-white/10 text-gray-900 dark:text-gray-200 transition-all duration-500 animate-fadeIn overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 blur-[100px] pointer-events-none"></div>

        <div className="grid md:grid-cols-2 gap-6 mb-10 relative z-10">
          <Select label="Root Note" value={rootNote} onChange={setRootNote} options={rootNoteOptions} />
          <Select label="Scale/Mode" value={scaleType} onChange={setScaleType} options={scaleTypeOptions} />
        </div>

        {error && <div className="mb-6 p-3 bg-red-100 dark:bg-red-800 bg-opacity-70 text-red-800 dark:text-red-300 rounded-md text-sm text-center border border-red-300 dark:border-red-700" role="alert">{error}</div>}

        {scaleNotesDisplay.length > 0 && (
          <div className="mb-10 p-8 bg-slate-50/50 dark:bg-black/20 rounded-3xl border border-gray-100 dark:border-white/5 animate-fadeIn relative z-10">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-600 dark:text-emerald-500 mb-6 text-center opacity-70 flex items-center justify-center gap-3">
              <SparklesIcon className="w-4 h-4" />
              Scale Profile: {rootNote} {scaleType.replace(/([A-Z])/g, ' $1').trim()}
            </h3>
            <p className="text-3xl md:text-5xl text-gray-900 dark:text-white font-black uppercase tracking-tighter leading-none text-center">
              {scaleNotesDisplay.join(' · ')}
            </p>
          </div>
        )}

        {diatonicTriads.length > 0 && (
          <div className="mb-10 p-8 bg-slate-50/50 dark:bg-black/10 rounded-3xl border border-gray-100 dark:border-white/5 shadow-inner relative z-10">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-600 dark:text-emerald-500 mb-8 text-center opacity-70">Diatonic Triads</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
              {diatonicTriads.map(chord => <ChordDisplayCard key={`triad-${chord.name}`} chord={chord} />)}
            </div>
          </div>
        )}

        {diatonicSeventhChords.length > 0 && (
          <div className="p-8 bg-slate-50/50 dark:bg-black/10 rounded-3xl border border-gray-100 dark:border-white/5 shadow-inner relative z-10">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-600 dark:text-emerald-500 mb-8 text-center opacity-70">Diatonic Seventh Chords</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
              {diatonicSeventhChords.map(chord => <ChordDisplayCard key={`seventh-${chord.name}`} chord={chord} />)}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ScaleChordViewerTool;
