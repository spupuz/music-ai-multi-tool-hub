
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
import Button from '@/components/common/Button';
import Select from '@/components/common/Select';
import { 
  TuneIcon, 
  RecordIcon, 
  PlayIcon, 
  CopyIcon, 
  StarIcon, 
  MidiIcon, 
  EditIcon, 
  TrashIcon,
  SparkTuneIcon as SpeakerIcon,
  RefreshIcon as LoadIcon,
  ChevronDownIcon
} from '@/components/Icons';

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
      <header className="mb-2 md:mb-14 text-center pt-0 md:pt-8 px-4 animate-fadeIn">
        <h1 className="text-3xl sm:text-5xl md:text-7xl font-black uppercase tracking-tighter text-emerald-600 dark:text-emerald-500 leading-none italic drop-shadow-2xl mb-1 md:mb-4">Chord Progressions</h1>
        <p className="mt-1 md:mt-6 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.4em] text-gray-500 dark:text-gray-400 max-w-2xl mx-auto opacity-60">Generate progressions • Explore diatonic depths • Build sequences</p>
      </header>

      <main className="w-full glass-card p-2 sm:p-6 md:p-10 border-white/10 text-gray-900 dark:text-gray-200 transition-all duration-500 animate-fadeIn overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 blur-[100px] pointer-events-none"></div>
        
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Select label="Root Note" value={rootNote} onChange={setRootNote} options={rootNoteOptions} disabled={isRecording} />
          <Select label="Mode/Scale" value={mode} onChange={setMode} options={modeOptions} disabled={isRecording} />
          <Select label="Chord Type" value={chordType} onChange={(val) => setChordType(val as 'triad' | 'seventh')} options={chordTypeOptions} disabled={isRecording} />
        </div>
        <div className="grid md:grid-cols-2 gap-6 mb-10">
          <Select label="Common Library" value={selectedCommonProgression} onChange={setSelectedCommonProgression} options={filteredCommonProgressions.map(cp => ({value: cp.value, label: cp.label}))} disabled={isRecording} />
          <Select label="Progression Length" value={progressionLength.toString()} onChange={(val) => setProgressionLength(parseInt(val))} options={progressionLengthOptions} disabled={isRecording || selectedCommonProgression !== 'none'} className={selectedCommonProgression !== 'none' || isRecording ? 'opacity-40 grayscale pointer-events-none' : ''}/>
        </div>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-10">
          <Button 
            onClick={handleGenerateProgression} 
            disabled={isLoading || isPlayingAudio || isRecording} 
            variant="primary"
            size="lg"
            startIcon={isLoading ? null : <TuneIcon className="w-5 h-5" />}
            className="w-full sm:w-auto font-black uppercase tracking-widest min-w-[240px]"
            backgroundColor="#10b981"
          >
            {isLoading ? <><Spinner size="w-5 h-5" color="text-black" /> Generating...</> : 'Generate Progression'}
          </Button>
          
          <Button 
            onClick={handleToggleRecording} 
            disabled={isLoading || isPlayingAudio}
            variant="ghost"
            size="lg"
            startIcon={<RecordIcon className={`${isRecording ? 'animate-pulse text-red-500' : ''}`} />}
            className={`w-full sm:w-auto font-black uppercase tracking-widest border-2 flex items-center justify-center gap-3 ${isRecording ? 'border-red-500 text-red-500 bg-red-500/10 shadow-[0_0_15px_rgba(239,44,44,0.2)]' : 'border-blue-500/50 text-blue-500 hover:bg-blue-500/10'}`}
          >
            <span>{isRecording ? 'Stop Recording' : 'Record Sequence'}</span>
          </Button>

          <Button 
            onClick={handlePlayProgression} 
            disabled={isLoading || isPlayingAudio || generatedProgression.length === 0 || isRecording} 
            variant="ghost"
            size="lg"
            startIcon={<PlayIcon className="w-5 h-5" />}
            className="w-full sm:w-auto font-black uppercase tracking-widest border-2 border-yellow-500/50 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-500/10 flex items-center justify-center gap-2"
          >
            <span>{isPlayingAudio ? 'Playing...' : 'Play Loop'}</span>
          </Button>
        </div>

        {isRecording && (
          <div className="flex items-center justify-center gap-3 mb-8 animate-pulse text-red-600 dark:text-red-400">
            <div className="w-2 h-2 bg-current rounded-full"></div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em]">Build Progression: Click Chords Below</p>
          </div>
        )}
        {error && <div className="mb-6 p-3 bg-red-100 dark:bg-red-800 bg-opacity-70 text-red-800 dark:text-red-300 rounded-md text-sm text-center border border-red-300 dark:border-red-700" role="alert">{error}</div>}

        {generatedProgression.length > 0 && !isLoading && (
          <div className="mb-12 p-8 bg-black/5 dark:bg-black/20 rounded-3xl border border-white/5 animate-fadeIn">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-green-600 dark:text-green-500 mb-8 text-center opacity-70">
                {isRecording ? "Capture Active" : "Current Sequence"}
            </h3>
            <div className="text-center space-y-2 mb-10 overflow-hidden">
              <p className="text-3xl md:text-5xl text-gray-900 dark:text-white font-black uppercase tracking-tighter leading-none break-words min-h-[50px]">
                {generatedProgression.map(c => c.name).join(' · ') || (isRecording ? <span className="text-gray-500 opacity-30 italic">Build pattern...</span> : "")}
                </p>
              <p className="text-sm font-black uppercase tracking-[0.4em] text-gray-500 dark:text-gray-600 mt-2 min-h-[20px]">
                {generatedProgression.map(c => c.roman).join(' · ') || (isRecording ? <span className="text-gray-500 italic">&nbsp;</span> : "")}
                </p>
            </div>
            {!isRecording && (
                 <div className="flex flex-col sm:flex-row flex-wrap justify-center items-center gap-3">
                    <Button onClick={handleCopyToClipboard} disabled={copyButtonText === 'COPIED!'} variant="ghost" size="sm" startIcon={<CopyIcon className="w-4 h-4 ml-0.5" />} className="w-full sm:w-auto font-black uppercase tracking-widest text-[10px] border-white/10 hover:bg-white/10">{copyButtonText}</Button>
                    <Button onClick={handleSaveToFavorites} disabled={saveFavButtonText === 'SAVED!'} variant="ghost" size="sm" startIcon={<StarIcon className="w-4 h-4 ml-0.5" />} className="w-full sm:w-auto font-black uppercase tracking-widest text-[10px] border-white/10 hover:bg-white/10"> {saveFavButtonText}</Button>
                    <Button onClick={handleExportMidi} disabled={exportMidiButtonText === 'EXPORTED!'} variant="ghost" size="sm" startIcon={<MidiIcon className="w-4 h-4 ml-0.5" />} className="w-full sm:w-auto font-black uppercase tracking-widest text-[10px] border-white/10 hover:bg-white/10"> {exportMidiButtonText}</Button>
                </div>
            )}
          </div>
        )}

        {diatonicChordsInKey.length > 0 && (
          <div className="p-8 bg-slate-50/50 dark:bg-black/10 rounded-3xl border border-gray-100 dark:border-white/5 shadow-inner">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-green-600 dark:text-green-500 mb-8 text-center opacity-70">
              Chord Library: {rootNote} {mode.replace('Natural', '')}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
              {diatonicChordsInKey.map((chord) => (
                <Button 
                    key={chord.name + chord.roman} 
                    onClick={() => handlePlaySingleChord(chord)} 
                    disabled={(isPlayingAudio && !isRecording) || (playingChordName !== null && playingChordName !== chord.name && !isRecording)}
                    variant="ghost"
                    className={`group relative p-4 rounded-2xl transition-all duration-300 flex flex-col items-center justify-center min-h-[140px] sm:min-h-[120px] w-full border-2 shadow-sm h-auto gap-3
                                ${playingChordName === chord.name && !isRecording 
                                  ? 'bg-emerald-500 border-emerald-400 scale-[1.02] shadow-xl z-10' 
                                  : 'bg-slate-50/80 dark:bg-black/20 border-gray-100 dark:border-white/10 hover:border-emerald-500/50 hover:bg-white/20 dark:hover:bg-white/5'}
                                ${isRecording && visuallyClickedChordName === chord.name ? 'ring-4 ring-emerald-500 animate-pulse' : ''}
                                disabled:opacity-30 disabled:cursor-not-allowed`}
                    aria-label={`Play ${chord.name}`}
                >
                  <div className="flex flex-col items-center justify-center text-center">
                    <p className={`text-2xl sm:text-3xl font-black uppercase tracking-tighter leading-none transition-colors ${playingChordName === chord.name && !isRecording ? 'text-black' : 'text-gray-900 dark:text-white'}`}>{chord.name}</p>
                    <p className={`text-[10px] font-black uppercase tracking-[0.2em] mt-2 transition-colors ${playingChordName === chord.name && !isRecording ? 'text-black/60' : 'text-emerald-600 dark:text-emerald-500'}`}>{chord.roman}</p>
                  </div>
                  
                  <div className="flex flex-col items-center gap-3 w-full">
                    <div className="flex flex-wrap justify-center gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                      {chord.notes.map(note => (
                        <span key={note} className={`text-[9px] font-black px-2 py-1 rounded-lg ${playingChordName === chord.name && !isRecording ? 'bg-black/20 text-black' : 'bg-slate-100/50 dark:bg-white/10 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-white/5'}`}>{note}</span>
                      ))}
                    </div>
                    <SpeakerIcon className={`w-4 h-4 transition-all duration-300 ${playingChordName === chord.name && !isRecording ? 'text-black scale-110' : 'text-gray-400 group-hover:text-emerald-500 opacity-20 group-hover:opacity-100'}`} />
                  </div>
                </Button>
              ))}
            </div>
          </div>
        )}
        
        <div className="mt-12 pt-10 border-t border-white/10">
            <Button 
              onClick={() => setShowFavoritesView(!showFavoritesView)} 
              variant="ghost"
              size="lg"
              className="w-full text-left text-sm font-black uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 py-6 px-10 flex justify-between items-center transition-all group glass-card border-white/10" 
              aria-expanded={showFavoritesView}
            >
                <span>Favorite Vault <span className="opacity-40 italic ml-2">({favoriteProgressions.length})</span></span>
                <ChevronDownIcon className={`w-5 h-5 transform transition-transform duration-500 ${showFavoritesView ? 'rotate-180' : ''}`} />
            </Button>
            {showFavoritesView && (
              <div className="animate-fadeIn">
                {favoriteProgressions.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin">
                      {favoriteProgressions.map(fav => (
                          <div key={fav.id} className="glass-card p-6 border-white/5 hover:border-white/10 transition-all group relative overflow-hidden">
                              <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 blur-[50px] pointer-events-none"></div>
                              <p className="text-lg font-black uppercase tracking-tighter text-gray-900 dark:text-white leading-tight mb-1">{fav.progression.map(c => c.name).join(' · ')}</p>
                              <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-600 mb-4">
                                {fav.rootNote} {fav.mode.replace('Natural', '')} · {fav.chordType}
                              </p>
                              
                              {editingNoteForId === fav.id ? (
                                  <div className="flex gap-2 items-center mb-6">
                                      <input 
                                        ref={noteInputRef} 
                                        type="text" 
                                        defaultValue={fav.note || ''} 
                                        onChange={(e) => handleNoteChange(fav.id, e.target.value)} 
                                        onKeyDown={(e) => e.key === 'Enter' && handleSaveNote(fav.id)} 
                                        className="flex-grow px-4 py-2 bg-white/10 dark:bg-black/20 border border-white/10 rounded-xl text-xs font-bold text-gray-900 dark:text-white focus:ring-4 focus:ring-green-500/10 outline-none" 
                                        placeholder="Note..." 
                                      />
                                      <Button onClick={() => handleSaveNote(fav.id)} variant="primary" size="sm" className="font-black" backgroundColor="#10b981">OK</Button>
                                  </div>
                              ) : (
                                fav.note && (
                                  <p className="text-[10px] font-bold text-yellow-600 dark:text-yellow-400 italic mb-6 p-3 bg-yellow-500/5 rounded-2xl border border-yellow-500/10 backdrop-blur-sm cursor-pointer hover:bg-yellow-500/10 transition-colors" onClick={() => setEditingNoteForId(fav.id)}>
                                    “{fav.note}”
                                  </p>
                                )
                              )}
                              
                               <div className="flex items-center gap-2">
                                  <Button onClick={() => handleLoadFavorite(fav)} variant="ghost" size="sm" startIcon={<LoadIcon className="w-3.5 h-3.5" />} className="flex-1 text-[10px] font-black bg-blue-500/10 border-blue-500/20 text-blue-600 hover:bg-blue-500">Restore</Button>
                                  <Button onClick={() => setEditingNoteForId(fav.id)} variant="ghost" size="sm" startIcon={<EditIcon className="w-3.5 h-3.5" />} className="flex-1 text-[10px] font-black bg-teal-500/10 border-teal-500/20 text-teal-600 hover:bg-teal-500">Note</Button>
                                  <Button onClick={() => handleDeleteFavorite(fav.id)} variant="ghost" size="sm" startIcon={<TrashIcon className="w-3.5 h-3.5" />} className="flex-1 text-[10px] font-black bg-red-500/10 border-red-500/20 text-red-600 hover:bg-red-500">Erase</Button>
                              </div>
                          </div>
                      ))}
                  </div>
                ) : (
                  <div className="p-12 text-center glass-card border-dashed border-white/10">
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-gray-500 opacity-50 italic">Storage Empty</p>
                  </div>
                )}
              </div>
            )}
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
