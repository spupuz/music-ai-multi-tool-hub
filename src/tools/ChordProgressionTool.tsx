
import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import MidiWriter from 'midi-writer-js';
import {
  NOTES_SHARP,
  getDiatonicChords,
  generateChordProgression,
  generateProgressionFromRomanNumerals,
  getMidiNoteNumber,
  ProgressionChord,
  DiatonicChordInfo
} from '@/utils/musicTheoryUtils';
import Spinner from '@/components/Spinner';
import type { ToolProps } from '@/Layout';

const TOOL_CATEGORY = 'ChordProgressionGenerator';
const FAVORITES_STORAGE_KEY = 'chordProgFavorites_v1';

const rootNoteOptions = NOTES_SHARP.map(note => ({ value: note, label: note }));
const modeOptions = [
  { value: 'Major', label: 'Major' },
  { value: 'NaturalMinor', label: 'Minor (Natural)' },
  { value: 'Dorian', label: 'Dorian' },
  { value: 'Mixolydian', label: 'Mixolydian' },
];
const progressionLengthOptions = [2, 3, 4, 5, 6, 8].map(num => ({ value: num.toString(), label: num.toString() }));

const chordTypeOptions = [
    { value: 'triad', label: 'Triads' },
    { value: 'seventh', label: 'Seventh Chords' }
];

const commonProgressionsLibrary = [
  { value: 'none', label: 'Custom / Random' },
  // Triads
  { value: 'pop1_triad', label: 'Pop: I-V-vi-IV (Triads)', sequence: ['I', 'V', 'vi', 'IV'], modeHint: 'Major', type: 'triad' },
  { value: 'pop2_triad', label: 'Pop: vi-IV-I-V (Triads)', sequence: ['vi', 'IV', 'I', 'V'], modeHint: 'Major', type: 'triad' },
  { value: 'jazz1_triad', label: 'Jazz: ii-V-I (Triads)', sequence: ['ii', 'V', 'I'], modeHint: 'Major', type: 'triad' },
  { value: 'jazz2_triad', label: 'Jazz Minor: ii°-v-i (Triads)', sequence: ['ii°', 'v', 'i'], modeHint: 'NaturalMinor', type: 'triad' },
  { value: 'blues1_triad', label: 'Blues: I-IV-V (Triads)', sequence: ['I', 'IV', 'V'], modeHint: 'Mixolydian', type: 'triad' },
  // Sevenths
  { value: 'pop1_seventh', label: 'Pop: Imaj7-V7-vi7-IVmaj7', sequence: ['Imaj7', 'V7', 'vi7', 'IVmaj7'], modeHint: 'Major', type: 'seventh' },
  { value: 'pop2_seventh', label: 'Pop: vi7-IVmaj7-Imaj7-V7', sequence: ['vi7', 'IVmaj7', 'Imaj7', 'V7'], modeHint: 'Major', type: 'seventh' },
  { value: 'jazz1_seventh', label: 'Jazz: ii7-V7-Imaj7', sequence: ['ii7', 'V7', 'Imaj7'], modeHint: 'Major', type: 'seventh' },
  { value: 'jazz2_seventh', label: 'Jazz Minor: iiø7-v7-i7', sequence: ['iiø7', 'v7', 'i7'], modeHint: 'NaturalMinor', type: 'seventh' },
  { value: 'blues1_seventh', label: 'Blues: I7-IV7-V7', sequence: ['I7', 'IV7', 'V7'], modeHint: 'Mixolydian', type: 'seventh' },
  { value: 'dorian1_seventh', label: 'Dorian: i7-IV7-VIImaj7-i7', sequence: ['i7', 'IV7', 'VIImaj7', 'i7'], modeHint: 'Dorian', type: 'seventh' },
];

interface SavedProgressionEntry {
  id: string;
  rootNote: string;
  mode: string;
  chordType: 'triad' | 'seventh';
  progression: ProgressionChord[];
  note?: string;
  createdAt: string;
}

// --- Helper Icons ---
const StarEmptyIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.82.61l-4.725-2.885a.563.563 0 00-.652 0l-4.725 2.885a.562.562 0 01-.82-.61l1.285-5.385a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" /></svg> );
const NoteIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg> );
const TrashIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}> <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12.56 0c1.153 0 2.243.096 3.222.261m3.478-.397a48.217 48.217 0 01-4.244 0M11.25 9h1.5v9h-1.5V9z" /> </svg> );
const LoadIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" /></svg> );
const MidiIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z" /></svg>);
const RecordIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5 mr-2" }) => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6.75 6.75 0 006.75-6.75H5.25A6.75 6.75 0 0012 18.75zm0-13.5A6.75 6.75 0 005.25 12h13.5A6.75 6.75 0 0012 5.25z" /><circle cx="12" cy="12" r="3" fill="currentColor" /></svg>);
// --- End Helper Icons ---


const SelectField: React.FC<{
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  className?: string;
  disabled?: boolean;
}> = ({ id, label, value, onChange, options, className, disabled }) => (
  <div className={`mb-4 ${className}`}>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-green-400 mb-1">
      {label}
    </label>
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-green-500 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-green-500 dark:focus:border-green-400 sm:text-sm text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100 dark:disabled:bg-gray-900"
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


const ChordProgressionTool: React.FC<ToolProps> = ({ trackLocalEvent }) => {
  const [rootNote, setRootNote] = useState<string>('C');
  const [mode, setMode] = useState<string>('Major');
  const [chordType, setChordType] = useState<'triad' | 'seventh'>('triad');
  const [progressionLength, setProgressionLength] = useState<number>(4);
  const [selectedCommonProgression, setSelectedCommonProgression] = useState<string>('none');
  
  const [generatedProgression, setGeneratedProgression] = useState<ProgressionChord[]>([]);
  const [diatonicChordsInKey, setDiatonicChordsInKey] = useState<DiatonicChordInfo[]>([]);
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [copyButtonText, setCopyButtonText] = useState('COPY PROGRESSION');
  const [saveFavButtonText, setSaveFavButtonText] = useState('Save to Favorites');
  const [exportMidiButtonText, setExportMidiButtonText] = useState('Export MIDI');

  const audioContextRef = useRef<AudioContext | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [playingChordName, setPlayingChordName] = useState<string | null>(null);
  const activeSourcesRef = useRef(new Set<AudioScheduledSourceNode>());

  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [visuallyClickedChordName, setVisuallyClickedChordName] = useState<string | null>(null);

  const [favoriteProgressions, setFavoriteProgressions] = useState<SavedProgressionEntry[]>([]);
  const [showFavoritesView, setShowFavoritesView] = useState<boolean>(false);
  const [editingNoteForId, setEditingNoteForId] = useState<string | null>(null);
  const noteInputRef = useRef<HTMLInputElement>(null);

  const filteredCommonProgressions = commonProgressionsLibrary.filter(
    cp => cp.value === 'none' || cp.type === chordType
  );

  useEffect(() => {
    try {
        const storedFavorites = localStorage.getItem(FAVORITES_STORAGE_KEY);
        if (storedFavorites) setFavoriteProgressions(JSON.parse(storedFavorites));
    } catch (error) { console.error("Error loading favorites:", error); }
  }, []);

  useEffect(() => {
    try {
        localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favoriteProgressions));
    } catch (error) { console.error("Error saving favorites:", error); }
  }, [favoriteProgressions]);


  useEffect(() => {
    try {
      setError(null);
      const chords = getDiatonicChords(rootNote, mode, chordType);
      setDiatonicChordsInKey(chords);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error calculating diatonic chords.");
      setDiatonicChordsInKey([]);
    }
  }, [rootNote, mode, chordType]);

  const handleGenerateProgression = useCallback(() => {
    setIsLoading(true);
    setError(null);
    setCopyButtonText('COPY PROGRESSION');
    setSaveFavButtonText('Save to Favorites');
    setExportMidiButtonText('Export MIDI');
    
    trackLocalEvent(TOOL_CATEGORY, 'progressionGenerated', undefined, 1);
    trackLocalEvent(TOOL_CATEGORY, 'keyUsed', undefined, rootNote);
    trackLocalEvent(TOOL_CATEGORY, 'modeUsed', undefined, mode);
    trackLocalEvent(TOOL_CATEGORY, 'chordTypeSelected', undefined, chordType);

    if (selectedCommonProgression !== 'none') {
      const commonProgDetails = commonProgressionsLibrary.find(cp => cp.value === selectedCommonProgression);
      const eventLabelForStat = commonProgDetails ? commonProgDetails.label : selectedCommonProgression;
      trackLocalEvent(TOOL_CATEGORY, 'commonProgressionUsed', undefined, eventLabelForStat);
    }

    setTimeout(() => {
      try {
        let progression: ProgressionChord[];
        const commonProg = commonProgressionsLibrary.find(p => p.value === selectedCommonProgression);
        if (commonProg && commonProg.sequence && commonProg.type === chordType) {
          progression = generateProgressionFromRomanNumerals(rootNote, mode, commonProg.sequence, chordType);
        } else {
          progression = generateChordProgression(rootNote, mode, progressionLength, chordType);
          if (selectedCommonProgression !== 'none') setSelectedCommonProgression('none');
        }
        setGeneratedProgression(progression);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error generating progression.");
        setGeneratedProgression([]);
      }
      setIsLoading(false);
    }, 300);
  }, [rootNote, mode, progressionLength, selectedCommonProgression, chordType, trackLocalEvent]);

  const prevIsRecordingRef = useRef(isRecording);
  const previousParamsRef = useRef({ rootNote, mode, selectedCommonProgression, chordType, progressionLength });

  useEffect(() => {
    const justStoppedRecording = prevIsRecordingRef.current === true && !isRecording;
    prevIsRecordingRef.current = isRecording;

    if (isRecording) {
      // When recording starts, capture the current parameters
      previousParamsRef.current = { rootNote, mode, selectedCommonProgression, chordType, progressionLength };
      return;
    }

    const paramsChangedSinceRecordingStartOrLastGen =
      previousParamsRef.current.rootNote !== rootNote ||
      previousParamsRef.current.mode !== mode ||
      previousParamsRef.current.selectedCommonProgression !== selectedCommonProgression ||
      previousParamsRef.current.chordType !== chordType ||
      (selectedCommonProgression === 'none' && previousParamsRef.current.progressionLength !== progressionLength);
    
    if (!justStoppedRecording) {
        previousParamsRef.current = { rootNote, mode, selectedCommonProgression, chordType, progressionLength };
    }

    if (justStoppedRecording && !paramsChangedSinceRecordingStartOrLastGen) {
      // If recording just stopped AND no other generation parameters changed *since recording started or last generation*,
      // do NOT regenerate. The recorded progression should be kept.
      return;
    }
    
    const commonProg = commonProgressionsLibrary.find(p => p.value === selectedCommonProgression);
    if (commonProg && commonProg.sequence && commonProg.type === chordType) {
      if (progressionLength !== commonProg.sequence.length) {
        setProgressionLength(commonProg.sequence.length); 
        return; 
      }
    } else if (selectedCommonProgression !== 'none' && (!commonProg || commonProg.type !== chordType) ) {
      // If selectedCommonProgression is no longer valid (e.g. due to chordType change),
      // reset it. This will trigger this useEffect again.
      setSelectedCommonProgression('none');
      return; 
    }
    
    handleGenerateProgression();

  }, [rootNote, mode, selectedCommonProgression, chordType, progressionLength, isRecording, handleGenerateProgression]);
  
  useEffect(() => {
    // This effect specifically handles adjustments to selectedCommonProgression
    // if chordType changes, making the current selection invalid.
    if (isRecording) return;

    const commonProg = commonProgressionsLibrary.find(p => p.value === selectedCommonProgression);
    if (selectedCommonProgression !== 'none' && (!commonProg || commonProg.type !== chordType)) {
      setSelectedCommonProgression('none');
    }
  }, [chordType, isRecording, selectedCommonProgression]);


  const handleCopyToClipboard = useCallback(() => {
    if (generatedProgression.length > 0) {
      const progressionString = generatedProgression.map(c => c.name).join(' - ');
      const romanString = generatedProgression.map(c => c.roman).join(' - ');
      const textToCopy = `Key: ${rootNote} ${mode === 'NaturalMinor' ? 'Minor' : mode} (${chordType})\nProgression: ${progressionString}\nRoman Numerals: ${romanString}`;
      
      navigator.clipboard.writeText(textToCopy)
        .then(() => {
          setCopyButtonText('COPIED!');
          trackLocalEvent(TOOL_CATEGORY, 'progressionCopied', undefined, 1);
          setTimeout(() => setCopyButtonText('COPY PROGRESSION'), 2000);
        })
        .catch(err => {
          console.error('Failed to copy progression: ', err);
          setError('Failed to copy to clipboard.');
        });
    }
  }, [generatedProgression, rootNote, mode, chordType, trackLocalEvent]);

  const handleExportMidi = useCallback(() => {
    if (generatedProgression.length === 0 || diatonicChordsInKey.length === 0) {
        setError("No progression to export.");
        return;
    }
    try {
        const track = new MidiWriter.Track();
        track.setTempo(120); 
        track.setTimeSignature(4, 4, 24, 8); 

        generatedProgression.forEach(progChord => {
            const chordInfo = diatonicChordsInKey.find(dc => dc.name === progChord.name && dc.roman === progChord.roman);
            if (chordInfo && chordInfo.notes.length > 0) {
                const baseOctave = chordType === 'triad' ? 4 : 3;
                const midiNotes = chordInfo.notes.map((noteName, index) => {
                    let octave = baseOctave;
                    if (index > 0) { 
                        const rootMidi = getMidiNoteNumber(chordInfo.notes[0], baseOctave);
                        const currentNoteMidiWithoutOctave = getMidiNoteNumber(noteName, baseOctave) % 12;
                        const rootNoteMidiWithoutOctave = rootMidi % 12;
                        if (currentNoteMidiWithoutOctave < rootNoteMidiWithoutOctave) {
                            octave = baseOctave + 1;
                        }
                    }
                    return getMidiNoteNumber(noteName, octave);
                });
                
                track.addEvent(new MidiWriter.NoteEvent({
                    pitch: midiNotes,
                    duration: '2', 
                    velocity: 75 
                }));
            }
        });

        const writer = new MidiWriter.Writer([track]);
        const dataUri = writer.dataUri();
        
        const link = document.createElement('a');
        link.href = dataUri;
        const safeRoot = rootNote.replace('#', 's');
        link.download = `chord_progression_${safeRoot}_${mode}_${chordType}.mid`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setExportMidiButtonText('EXPORTED!');
        trackLocalEvent(TOOL_CATEGORY, 'midiExported', undefined, 1);
        setTimeout(() => setExportMidiButtonText('Export MIDI'), 2000);

    } catch (e) {
        console.error("Failed to export MIDI:", e);
        setError("Failed to export MIDI. See console for details.");
        setExportMidiButtonText('Export MIDI');
    }
  }, [generatedProgression, diatonicChordsInKey, rootNote, mode, chordType, trackLocalEvent]);

  const stopAllSounds = useCallback(() => {
    activeSourcesRef.current.forEach(source => {
        try { source.stop(0); } catch (e) { /* Ignore errors */ }
    });
    activeSourcesRef.current.clear();
    setIsPlayingAudio(false); 
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
      osc.onended = () => {
        activeSourcesRef.current.delete(osc);
        gainNode.disconnect();
        osc.disconnect(); 
      };
      
      osc.start(startTime);
      osc.stop(startTime + duration);
    });
  }, [rootNote]);

  const initializeAudioContext = async (): Promise<AudioContext | null> => {
    if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
        try { audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)(); } 
        catch (e) { setError("Web Audio API is not supported."); console.error("Error creating AudioContext:", e); return null; }
    }
    const audioCtx = audioContextRef.current;
    if (audioCtx.state === 'suspended') {
        try { await audioCtx.resume(); } 
        catch (e) { setError("Failed to resume audio context."); return null; }
    }
    return audioCtx;
  };
  
  const handlePlaySingleChord = async (chordInfo: DiatonicChordInfo) => {
    if (playingChordName && !isRecording) return; 
    const audioCtx = await initializeAudioContext();
    if (!audioCtx) return;
    
    if (!isRecording) stopAllSounds();
    
    setPlayingChordName(chordInfo.name);
    playChordNotes(chordInfo.notes, audioCtx, audioCtx.currentTime, 0.8, 0.2);
    
    if (!isRecording) {
      trackLocalEvent(TOOL_CATEGORY, 'singleChordPlayed', chordInfo.name, 1);
      setTimeout(() => { setPlayingChordName(null); }, 800);
    } else { 
        setGeneratedProgression(prev => [...prev, { name: chordInfo.name, roman: chordInfo.roman }]);
        setVisuallyClickedChordName(chordInfo.name);
        setTimeout(() => {
            setVisuallyClickedChordName(null);
            setPlayingChordName(null); 
        }, 300);
    }
  };

  const handlePlayProgression = async () => {
    if (isPlayingAudio || generatedProgression.length === 0 || diatonicChordsInKey.length === 0) return;
    const audioCtx = await initializeAudioContext();
    if (!audioCtx) return;
    stopAllSounds(); 
    setIsPlayingAudio(true);
    trackLocalEvent(TOOL_CATEGORY, 'progressionPlayed', undefined, 1);
    let currentTime = audioCtx.currentTime;
    const chordDuration = 1.2;
    generatedProgression.forEach((progChord, index) => {
      const chordInfo = diatonicChordsInKey.find(dc => dc.name === progChord.name && dc.roman === progChord.roman);
      if (chordInfo) playChordNotes(chordInfo.notes, audioCtx, currentTime + index * chordDuration, chordDuration - 0.1, 0.15);
    });
    setTimeout(() => { setIsPlayingAudio(false); }, generatedProgression.length * chordDuration * 1000);
  };
  
  const handleSaveToFavorites = useCallback(() => {
    if (generatedProgression.length > 0) {
        const newFavorite: SavedProgressionEntry = {
            id: Date.now().toString(),
            rootNote, mode, chordType, progression: generatedProgression,
            createdAt: new Date().toISOString(), note: ''
        };
        setFavoriteProgressions(prev => [newFavorite, ...prev.slice(0, 19)]);
        setSaveFavButtonText('SAVED!');
        trackLocalEvent(TOOL_CATEGORY, 'favoriteProgressionAdded', undefined, 1);
        setTimeout(() => setSaveFavButtonText('Save to Favorites'), 2000);
    }
  }, [generatedProgression, rootNote, mode, chordType, trackLocalEvent]);

  const handleDeleteFavorite = useCallback((id: string) => {
    setFavoriteProgressions(prev => prev.filter(fav => fav.id !== id));
    trackLocalEvent(TOOL_CATEGORY, 'favoriteProgressionDeleted', undefined, 1);
  }, [trackLocalEvent]);

  const handleLoadFavorite = useCallback((fav: SavedProgressionEntry) => {
    setRootNote(fav.rootNote);
    setMode(fav.mode);
    setChordType(fav.chordType);
    setProgressionLength(fav.progression.length);
    setGeneratedProgression(fav.progression);
    setSelectedCommonProgression('none');
    setIsRecording(false);
    trackLocalEvent(TOOL_CATEGORY, 'favoriteProgressionLoaded', undefined, 1);
  }, [trackLocalEvent]);

  const handleNoteChange = (id: string, newNote: string) => {
    setFavoriteProgressions(prev => prev.map(fav => fav.id === id ? { ...fav, note: newNote } : fav));
  };

  const handleSaveNote = (id: string) => {
    setEditingNoteForId(null);
    trackLocalEvent(TOOL_CATEGORY, 'favoriteProgressionNoteSaved', undefined, 1);
  };
  
  const handleToggleRecording = useCallback(() => {
    if (isRecording) {
        setIsRecording(false);
        if (generatedProgression.length > 0) {
            trackLocalEvent(TOOL_CATEGORY, 'recordingFinished', `Length: ${generatedProgression.length}`, 1);
        }
        // When finishing recording, store the current parameters so the main useEffect
        // knows that if these params haven't changed, it shouldn't regenerate.
        previousParamsRef.current = { rootNote, mode, selectedCommonProgression, chordType, progressionLength };
    } else {
        setGeneratedProgression([]); 
        setIsRecording(true);
        setError(null);
        setCopyButtonText('COPY PROGRESSION');
        setSaveFavButtonText('Save to Favorites');
        setExportMidiButtonText('Export MIDI');
        trackLocalEvent(TOOL_CATEGORY, 'recordingStarted', undefined, 1);
    }
  }, [isRecording, trackLocalEvent, generatedProgression.length, rootNote, mode, selectedCommonProgression, chordType, progressionLength]);

  useEffect(() => {
    return () => {
      stopAllSounds();
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(e => console.warn("Error closing AudioContext on unmount:", e));
      }
      audioContextRef.current = null;
    };
  }, [stopAllSounds]);


  return (
    <div className="w-full">
      <header className="mb-10 text-center">
        <h1 className="text-5xl font-extrabold text-green-600 dark:text-green-400">Chord Progression Generator</h1>
        <p className="mt-3 text-md text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">Explore diatonic chord progressions. Select key, mode, type, and length. Click chords to hear them, or record your own sequence!</p>
      </header>

      <main className="w-full bg-white dark:bg-gray-900 shadow-2xl rounded-lg p-6 md:p-10 border-2 border-green-600 dark:border-green-500">
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <SelectField id="rootNote" label="Root Note" value={rootNote} onChange={setRootNote} options={rootNoteOptions} disabled={isRecording} />
          <SelectField id="mode" label="Mode/Scale" value={mode} onChange={setMode} options={modeOptions} disabled={isRecording} />
          <SelectField id="chordType" label="Chord Type" value={chordType} onChange={(val) => setChordType(val as 'triad' | 'seventh')} options={chordTypeOptions} disabled={isRecording} />
        </div>
        <div className="grid md:grid-cols-2 gap-6 mb-6">
           <SelectField id="commonProgression" label="Common Progression" value={selectedCommonProgression} onChange={setSelectedCommonProgression} options={filteredCommonProgressions.map(cp => ({value: cp.value, label: cp.label}))} disabled={isRecording} />
          <SelectField id="progressionLength" label="Progression Length (Custom)" value={progressionLength.toString()} onChange={(val) => setProgressionLength(parseInt(val))} options={progressionLengthOptions} className={selectedCommonProgression !== 'none' || isRecording ? 'opacity-50 pointer-events-none' : ''} disabled={isRecording || selectedCommonProgression !== 'none'}/>
        </div>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-8">
          <button onClick={handleGenerateProgression} disabled={isLoading || isPlayingAudio || isRecording} className="w-full sm:w-auto flex justify-center items-center py-3 px-6 border border-transparent rounded-md shadow-sm text-lg font-medium text-black bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-400 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-900 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:text-gray-500 dark:disabled:text-gray-400 transition-colors">
            {isLoading ? <><Spinner size="w-6 h-6 mr-2" color="text-black" /> GENERATING...</> : 'GENERATE PROGRESSION'}
          </button>
          <button 
            onClick={handleToggleRecording} 
            disabled={isLoading || isPlayingAudio}
            className={`w-full sm:w-auto flex justify-center items-center py-3 px-6 border border-transparent rounded-md shadow-sm text-lg font-medium transition-colors
                        ${isRecording ? 'bg-red-600 hover:bg-red-500 text-white' : 'bg-indigo-600 hover:bg-indigo-500 text-white'} 
                        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-900 
                        ${isRecording ? 'focus:ring-red-400' : 'focus:ring-indigo-400'} 
                        disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:text-gray-500 dark:disabled:text-gray-400`}
          >
            <RecordIcon className={`w-6 h-6 mr-2 ${isRecording ? 'animate-pulse' : ''}`} />
            {isRecording ? 'FINISH RECORDING' : 'RECORD NEW'}
          </button>
           <button onClick={handlePlayProgression} disabled={isLoading || isPlayingAudio || generatedProgression.length === 0 || isRecording} className="w-full sm:w-auto flex justify-center items-center py-3 px-6 border border-yellow-500 rounded-md shadow-sm text-lg font-medium text-yellow-600 dark:text-yellow-300 bg-transparent hover:bg-yellow-100 dark:hover:bg-yellow-700 hover:text-black disabled:border-gray-300 dark:disabled:border-gray-600 disabled:text-gray-400 dark:disabled:text-gray-500 disabled:hover:bg-transparent transition-colors" aria-label="Play generated progression">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mr-2"><path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" /></svg>
            {isPlayingAudio ? 'PLAYING...' : 'PLAY'}
          </button>
        </div>
        {isRecording && <p className="text-center text-red-600 dark:text-red-400 mb-4 animate-pulse font-semibold">🔴 LIVE RECORDING: Click on the chord cards below to build your progression.</p>}
        {error && <div className="mb-6 p-3 bg-red-100 dark:bg-red-800 bg-opacity-70 text-red-800 dark:text-red-300 rounded-md text-sm text-center border border-red-300 dark:border-red-700" role="alert">{error}</div>}

        {generatedProgression.length > 0 && !isLoading && (
          <div className="mb-8 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg shadow-inner border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-semibold text-green-700 dark:text-green-300 mb-4 text-center">
                {isRecording ? "Recording in Progress..." : "Current Progression"}
            </h3>
            <div className="text-center mb-3">
              <p className="text-2xl md:text-3xl text-gray-900 dark:text-white font-mono tracking-wider min-h-[40px]">
                {generatedProgression.map(c => c.name).join(' - ') || (isRecording ? <span className="text-gray-500 italic">Click chords to add...</span> : "")}
                </p>
              <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 font-mono tracking-wider mt-1 min-h-[30px]">
                {generatedProgression.map(c => c.roman).join(' - ') || (isRecording ? <span className="text-gray-500 italic">&nbsp;</span> : "")}
                </p>
            </div>
            {!isRecording && generatedProgression.length > 0 && (
                 <div className="flex flex-col sm:flex-row flex-wrap justify-center items-center gap-3 mt-4">
                    <button onClick={handleCopyToClipboard} disabled={copyButtonText === 'COPIED!'} className="flex-grow sm:flex-initial w-full sm:w-auto py-2 px-4 border border-green-600 rounded-md shadow-sm text-sm font-medium text-green-700 dark:text-green-300 bg-transparent hover:bg-green-100 dark:hover:bg-green-700 hover:text-green-800 dark:hover:text-white disabled:opacity-70 transition-colors">{copyButtonText}</button>
                    <button onClick={handleSaveToFavorites} disabled={saveFavButtonText === 'SAVED!'} className="flex-grow sm:flex-initial w-full sm:w-auto py-2 px-4 border border-yellow-500 rounded-md shadow-sm text-sm font-medium text-yellow-700 dark:text-yellow-300 bg-transparent hover:bg-yellow-100 dark:hover:bg-yellow-700 hover:text-black disabled:opacity-70 transition-colors flex items-center justify-center gap-1.5"><StarEmptyIcon className="w-4 h-4"/> {saveFavButtonText}</button>
                    <button onClick={handleExportMidi} disabled={exportMidiButtonText === 'EXPORTED!'} className="flex-grow sm:flex-initial w-full sm:w-auto py-2 px-4 border border-purple-500 rounded-md shadow-sm text-sm font-medium text-purple-700 dark:text-purple-300 bg-transparent hover:bg-purple-100 dark:hover:bg-purple-700 hover:text-black dark:hover:text-white disabled:opacity-70 transition-colors flex items-center justify-center gap-1.5"><MidiIcon className="w-4 h-4"/> {exportMidiButtonText}</button>
                </div>
            )}
          </div>
        )}

        {diatonicChordsInKey.length > 0 && (
          <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg shadow-inner border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-semibold text-green-700 dark:text-green-300 mb-4 text-center">Diatonic {chordType === 'seventh' ? 'Seventh' : 'Triad'} Chords in {rootNote} {mode === 'NaturalMinor' ? 'Minor' : mode.replace('NaturalM', 'M')}</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
              {diatonicChordsInKey.map((chord) => (
                <button 
                    key={chord.name + chord.roman} 
                    onClick={() => handlePlaySingleChord(chord)} 
                    disabled={(isPlayingAudio && !isRecording) || (playingChordName !== null && playingChordName !== chord.name && !isRecording)}
                    className={`p-3 bg-white dark:bg-gray-700 rounded shadow group relative transition-all duration-150 hover:bg-gray-100 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-800 disabled:opacity-60 disabled:cursor-not-allowed flex flex-col justify-between min-h-[110px] 
                                ${playingChordName === chord.name && !isRecording ? 'bg-green-100 dark:bg-green-600 ring-2 ring-green-400' : ''}
                                ${isRecording && visuallyClickedChordName === chord.name ? 'border-4 border-green-400 animate-pulse-border' : ''}`}
                    aria-label={`Play chord ${chord.name} (${chord.roman})`}
                >
                  <div className="flex-grow flex flex-col items-center justify-center text-center">
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">{chord.name}</p>
                    <p className="text-sm text-green-600 dark:text-green-400">{chord.roman}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">({chord.notes.join(', ')})</p>
                  </div>
                  <SpeakerIcon className={`self-end mt-1 w-5 h-5 ${playingChordName === chord.name && !isRecording ? 'text-green-700 dark:text-white' : 'text-gray-400 group-hover:text-green-600 dark:group-hover:text-green-200'} transition-colors`} />
                </button>
              ))}
            </div>
          </div>
        )}
        
        <div className="mt-10 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button onClick={() => setShowFavoritesView(!showFavoritesView)} className="w-full text-left text-xl font-semibold text-green-700 dark:text-green-400 hover:text-green-600 dark:hover:text-green-300 mb-3 flex justify-between items-center" aria-expanded={showFavoritesView}>
                My Favorite Progressions ({favoriteProgressions.length})
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-4 h-4 transform transition-transform ${showFavoritesView ? 'rotate-180' : ''}`}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
            </button>
            {showFavoritesView && (favoriteProgressions.length > 0 ? (
                <div className="space-y-3 max-h-80 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-100 dark:scrollbar-track-gray-800">
                    {favoriteProgressions.map(fav => (
                        <div key={fav.id} className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md border border-yellow-500 dark:border-yellow-600">
                            <p className="text-md font-semibold text-yellow-800 dark:text-yellow-200">{fav.progression.map(c => c.name).join(' - ')}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">({fav.rootNote} {fav.mode.replace('NaturalM', ' M')}, {fav.chordType})</p>
                            {editingNoteForId === fav.id ? (
                                <div className="flex gap-1 items-center my-1">
                                    <input ref={noteInputRef} type="text" defaultValue={fav.note || ''} onChange={(e) => handleNoteChange(fav.id, e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSaveNote(fav.id)} onBlur={() => setTimeout(() => { if (document.activeElement !== noteInputRef.current) handleSaveNote(fav.id); }, 100)} className="flex-grow p-1 text-xs bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-500 rounded focus:ring-1 focus:ring-green-400 text-gray-900 dark:text-white" placeholder="Add a note..." />
                                    <button onClick={() => handleSaveNote(fav.id)} className="text-xs py-1 px-1.5 bg-green-600 hover:bg-green-500 rounded text-white">Save</button>
                                </div>
                            ) : (fav.note && <p className="text-xs text-yellow-700 dark:text-yellow-300 italic my-1 p-1 bg-yellow-100 dark:bg-gray-700 rounded break-words" onClick={() => setEditingNoteForId(fav.id)}>{fav.note}</p>)}
                            <div className="flex gap-2 mt-1.5">
                                <button onClick={() => handleLoadFavorite(fav)} className="text-xs py-1 px-2 bg-blue-600 hover:bg-blue-500 rounded text-white shadow-sm flex items-center gap-1"><LoadIcon className="w-3 h-3"/> Load</button>
                                <button onClick={() => setEditingNoteForId(fav.id)} className="text-xs py-1 px-2 bg-teal-600 hover:bg-teal-500 rounded text-white shadow-sm flex items-center gap-1"><NoteIcon className="w-3 h-3"/> Note</button>
                                <button onClick={() => handleDeleteFavorite(fav.id)} className="text-xs py-1 px-2 bg-red-600 hover:bg-red-500 rounded text-white shadow-sm flex items-center gap-1"><TrashIcon className="w-3 h-3"/> Delete</button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : <p className="text-gray-500 italic text-sm">No favorite progressions saved yet.</p>)}
        </div>
      </main>
      <style>{`
        .animate-pulse-border {
          animation: pulse-border 0.3s ease-out;
        }
        @keyframes pulse-border {
          0% { border-color: #34D399; border-width: 4px; } /* green-400 */
          100% { border-color: #4A5568; border-width: 2px; } /* gray-600 or your default */
        }
      `}</style>
    </div>
  );
};

export default ChordProgressionTool;
