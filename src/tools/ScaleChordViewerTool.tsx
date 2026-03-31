
import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  NOTES_SHARP,
  SCALE_INTERVALS,
  getScaleNotes,
  getDiatonicChords,
  DiatonicChordInfo
} from '@/utils/musicTheoryUtils';
import type { ToolProps } from '@/Layout';

const TOOL_CATEGORY = 'ScaleChordViewer';

const rootNoteOptions = NOTES_SHARP.map(note => ({ value: note, label: note }));
const scaleTypeOptions = Object.keys(SCALE_INTERVALS).map(modeName => ({
    value: modeName,
    label: modeName.replace(/([A-Z])/g, ' $1').replace('Natural M', 'M').trim()
}));

const SelectField: React.FC<{
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  className?: string;
}> = ({ id, label, value, onChange, options, className }) => (
  <div className={`mb-4 ${className}`}>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-green-400 mb-1">
      {label}
    </label>
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-green-500 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-green-500 dark:focus:border-green-400 sm:text-sm text-gray-900 dark:text-white"
    >
      {options.map(option => (
        <option key={option.value} value={option.value}>{option.label}</option>
      ))}
    </select>
  </div>
);

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

const SpeakerIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
  </svg>
);

const ScaleChordViewerTool: React.FC<ToolProps> = ({ trackLocalEvent }) => {
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
    <button 
        key={chord.name + chord.roman} 
        onClick={() => handlePlayChord(chord)} 
        disabled={!!playingChordName}
        className={`p-3 bg-white dark:bg-gray-700 rounded shadow group relative transition-colors duration-150 hover:bg-gray-100 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-800 disabled:opacity-60 disabled:cursor-not-allowed flex flex-col justify-between min-h-[110px] ${playingChordName === chord.name ? 'bg-green-100 dark:bg-green-600 ring-2 ring-green-400' : ''}`}
        aria-label={`Play chord ${chord.name} (${chord.roman})`}
    >
        <div className="flex-grow flex flex-col items-center justify-center text-center">
            <p className="text-lg font-semibold text-gray-900 dark:text-white">{chord.name}</p>
            <p className="text-sm text-green-600 dark:text-green-400">{chord.roman}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">({chord.notes.join(', ')})</p>
        </div>
        <SpeakerIcon className={`self-end mt-1 w-5 h-5 ${playingChordName === chord.name ? 'text-green-700 dark:text-white' : 'text-gray-400 group-hover:text-green-600 dark:group-hover:text-green-200'} transition-colors`} />
    </button>
  );

  return (
    <div className="w-full">
      <header className="mb-10 text-center">
        <h1 className="text-5xl font-extrabold text-green-600 dark:text-green-400">Scale & Chord Viewer</h1>
        <p className="mt-3 text-md text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
          Select a root note and scale type to see its notes and diatonic chords. Click chords to hear them.
        </p>
      </header>

      <main className="w-full bg-white dark:bg-gray-900 shadow-2xl rounded-lg p-6 md:p-10 border-2 border-green-600 dark:border-green-500">
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <SelectField id="rootNote" label="Root Note" value={rootNote} onChange={setRootNote} options={rootNoteOptions} />
          <SelectField id="scaleType" label="Scale/Mode Type" value={scaleType} onChange={setScaleType} options={scaleTypeOptions} />
        </div>

        {error && <div className="mb-6 p-3 bg-red-100 dark:bg-red-800 bg-opacity-70 text-red-800 dark:text-red-300 rounded-md text-sm text-center border border-red-300 dark:border-red-700" role="alert">{error}</div>}

        {scaleNotesDisplay.length > 0 && (
          <div className="mb-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg shadow-inner border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-semibold text-green-700 dark:text-green-300 mb-3 text-center">
              Notes in {rootNote} {scaleType.replace(/([A-Z])/g, ' $1').trim()}:
            </h3>
            <p className="text-2xl text-gray-900 dark:text-white font-mono text-center tracking-wider">
              {scaleNotesDisplay.join(' - ')}
            </p>
          </div>
        )}

        {diatonicTriads.length > 0 && (
          <div className="mb-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg shadow-inner border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-semibold text-green-700 dark:text-green-300 mb-4 text-center">Diatonic Triads</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
              {diatonicTriads.map(chord => <ChordDisplayCard key={`triad-${chord.name}`} chord={chord} />)}
            </div>
          </div>
        )}

        {diatonicSeventhChords.length > 0 && (
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg shadow-inner border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-semibold text-green-700 dark:text-green-300 mb-4 text-center">Diatonic Seventh Chords</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
              {diatonicSeventhChords.map(chord => <ChordDisplayCard key={`seventh-${chord.name}`} chord={chord} />)}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ScaleChordViewerTool;
