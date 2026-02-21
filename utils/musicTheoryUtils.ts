
// utils/musicTheoryUtils.ts

export const NOTES_SHARP = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
export const NOTES_FLAT = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

export const SCALE_INTERVALS: Record<string, number[]> = {
  Major: [0, 2, 4, 5, 7, 9, 11],
  NaturalMinor: [0, 2, 3, 5, 7, 8, 10],
  Dorian: [0, 2, 3, 5, 7, 9, 10],
  Mixolydian: [0, 2, 4, 5, 7, 9, 10],
};

// For Triads
export const CHORD_QUALITIES_TRIAD: Record<string, string[]> = {
  Major: ['Major', 'minor', 'minor', 'Major', 'Major', 'minor', 'diminished'],
  NaturalMinor: ['minor', 'diminished', 'Major', 'minor', 'minor', 'Major', 'Major'],
  Dorian: ['minor', 'minor', 'Major', 'Major', 'minor', 'diminished', 'Major'],
  Mixolydian: ['Major', 'minor', 'diminished', 'Major', 'minor', 'minor', 'Major'],
};

export const ROMAN_NUMERALS_TRIAD: Record<string, string[]> = {
  Major: ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'],
  NaturalMinor: ['i', 'ii°', 'III', 'iv', 'v', 'VI', 'VII'],
  Dorian: ['i', 'ii', 'III', 'IV', 'v', 'vi°', 'VII'],
  Mixolydian: ['I', 'ii', 'iii°', 'IV', 'v', 'vi', 'VII'],
};

// For Seventh Chords
export const CHORD_QUALITIES_SEVENTH: Record<string, string[]> = {
  Major: ['Major7', 'minor7', 'minor7', 'Major7', 'dominant7', 'minor7', 'minor7b5'],
  NaturalMinor: ['minor7', 'minor7b5', 'Major7', 'minor7', 'minor7', 'Major7', 'dominant7'],
  Dorian: ['minor7', 'minor7', 'Major7', 'dominant7', 'minor7', 'minor7b5', 'Major7'],
  Mixolydian: ['dominant7', 'minor7', 'minor7b5', 'Major7', 'minor7', 'minor7', 'Major7'],
};

export const ROMAN_NUMERALS_SEVENTH: Record<string, string[]> = {
  Major: ['Imaj7', 'ii7', 'iii7', 'IVmaj7', 'V7', 'vi7', 'viiø7'],
  NaturalMinor: ['i7', 'iiø7', 'IIImaj7', 'iv7', 'v7', 'VImaj7', 'VII7'],
  Dorian: ['i7', 'ii7', 'IIImaj7', 'IV7', 'v7', 'viø7', 'VIImaj7'],
  Mixolydian: ['I7', 'ii7', 'iiiø7', 'IVmaj7', 'v7', 'vi7', 'VIImaj7'],
};


export const getNoteName = (index: number, useFlat: boolean = false): string => {
  const notesArray = useFlat ? NOTES_FLAT : NOTES_SHARP;
  return notesArray[index % 12];
};

export const getScaleNotes = (rootNote: string, modeName: string): string[] => {
  const notesArray = rootNote.includes('b') || rootNote === 'F' ? NOTES_FLAT : NOTES_SHARP; // F major uses Bb
  const rootIndex = notesArray.indexOf(rootNote);
  if (rootIndex === -1 || !SCALE_INTERVALS[modeName]) {
    console.error(`Invalid rootNote '${rootNote}' or modeName '${modeName}'`);
    return [];
  }
  const intervals = SCALE_INTERVALS[modeName];
  return intervals.map(interval => getNoteName(rootIndex + interval, rootNote.includes('b') || rootNote === 'F'));
};

export interface DiatonicChordInfo {
  name: string;
  roman: string;
  quality: string;
  degree: number;
  notes: string[];
}

export const getDiatonicChords = (
  rootNote: string,
  modeName: string,
  chordType: 'triad' | 'seventh' = 'triad'
): DiatonicChordInfo[] => {
  const scaleNotes = getScaleNotes(rootNote, modeName);
  if (scaleNotes.length === 0) return [];

  const qualities = chordType === 'triad' ? CHORD_QUALITIES_TRIAD[modeName] : CHORD_QUALITIES_SEVENTH[modeName];
  const romans = chordType === 'triad' ? ROMAN_NUMERALS_TRIAD[modeName] : ROMAN_NUMERALS_SEVENTH[modeName];
  const useFlat = rootNote.includes('b') || rootNote === 'F';
  const notesArrayForIndexing = useFlat ? NOTES_FLAT : NOTES_SHARP;

  if (!qualities || !romans) {
    console.error(`Qualities or Roman numerals not defined for mode: ${modeName} and chord type: ${chordType}`);
    return [];
  }

  return scaleNotes.map((scaleRootNote, index) => {
    const chordRootIndex = notesArrayForIndexing.indexOf(scaleRootNote);
    let thirdInterval, fifthInterval, seventhInterval;
    let chordNameSuffix = '';

    switch (qualities[index]) {
      // Triad & Seventh variations
      case 'Major': thirdInterval = 4; fifthInterval = 7; chordNameSuffix = ''; break;
      case 'minor': thirdInterval = 3; fifthInterval = 7; chordNameSuffix = 'm'; break;
      case 'diminished': thirdInterval = 3; fifthInterval = 6; chordNameSuffix = 'dim'; break;
      case 'Major7': thirdInterval = 4; fifthInterval = 7; seventhInterval = 11; chordNameSuffix = 'maj7'; break;
      case 'minor7': thirdInterval = 3; fifthInterval = 7; seventhInterval = 10; chordNameSuffix = 'm7'; break;
      case 'dominant7': thirdInterval = 4; fifthInterval = 7; seventhInterval = 10; chordNameSuffix = '7'; break;
      case 'minor7b5': thirdInterval = 3; fifthInterval = 6; seventhInterval = 10; chordNameSuffix = 'm7b5'; break;
      default: thirdInterval = 4; fifthInterval = 7; // Fallback to Major triad
    }

    const chordNotesBase = [
      getNoteName(chordRootIndex, useFlat),
      getNoteName(chordRootIndex + thirdInterval, useFlat),
      getNoteName(chordRootIndex + fifthInterval, useFlat),
    ];
    if (chordType === 'seventh' && typeof seventhInterval === 'number') {
      chordNotesBase.push(getNoteName(chordRootIndex + seventhInterval, useFlat));
    }
    
    return {
      name: scaleRootNote + chordNameSuffix,
      roman: romans[index],
      quality: qualities[index],
      degree: index + 1,
      notes: chordNotesBase,
    };
  });
};

export interface ProgressionChord {
  name: string;
  roman: string;
}

export const generateChordProgression = (
  rootNote: string,
  modeName: string,
  length: number,
  chordType: 'triad' | 'seventh' = 'triad'
): ProgressionChord[] => {
  const diatonicChords = getDiatonicChords(rootNote, modeName, chordType);
  if (diatonicChords.length === 0 || length <= 0) return [];

  const progression: ProgressionChord[] = [];
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * diatonicChords.length);
    progression.push({ name: diatonicChords[randomIndex].name, roman: diatonicChords[randomIndex].roman });
  }
  
  progression[0] = { name: diatonicChords[0].name, roman: diatonicChords[0].roman };

  if (length > 1) {
    const dominantIndex = diatonicChords.findIndex(c => c.roman.toUpperCase().includes('V'));
    const tonicIndex = 0; 

    if (dominantIndex !== -1) {
        if (length > 2 && Math.random() < 0.7) { 
            progression[length - 2] = { name: diatonicChords[dominantIndex].name, roman: diatonicChords[dominantIndex].roman};
            progression[length - 1] = { name: diatonicChords[tonicIndex].name, roman: diatonicChords[tonicIndex].roman};
        } else if (Math.random() < 0.5) {
            progression[length - 1] = { name: diatonicChords[dominantIndex].name, roman: diatonicChords[dominantIndex].roman};
        } else {
             progression[length - 1] = { name: diatonicChords[tonicIndex].name, roman: diatonicChords[tonicIndex].roman};
        }
    } else { 
        progression[length - 1] = { name: diatonicChords[tonicIndex].name, roman: diatonicChords[tonicIndex].roman};
    }
  }
  return progression;
};

export const generateProgressionFromRomanNumerals = (
  rootNote: string,
  modeName: string,
  romanNumeralSequence: string[],
  chordType: 'triad' | 'seventh' = 'triad'
): ProgressionChord[] => {
  const diatonicChords = getDiatonicChords(rootNote, modeName, chordType);
  if (diatonicChords.length === 0) return [];

  const progression: ProgressionChord[] = [];
  for (const roman of romanNumeralSequence) {
    const foundChord = diatonicChords.find(dc => dc.roman === roman);
    if (foundChord) {
      progression.push({ name: foundChord.name, roman: foundChord.roman });
    } else {
      console.warn(`Roman numeral ${roman} not found in ${rootNote} ${modeName} (${chordType}).`);
      progression.push({ name: '?', roman: roman });
    }
  }
  return progression;
};

export const getMidiNoteNumber = (noteName: string, octave: number): number => {
    const noteNameOnly = noteName.replace(/[0-9]/g, '').trim();
    let noteIndex = NOTES_SHARP.indexOf(noteNameOnly);

    if (noteIndex === -1) {
        const flatIndex = NOTES_FLAT.indexOf(noteNameOnly);
        if (flatIndex !== -1) {
            noteIndex = flatIndex; 
        } else {
            console.warn(`Unrecognized note name for MIDI conversion: ${noteNameOnly}. Defaulting to C.`);
            noteIndex = 0; 
        }
    }
    // MIDI C4 = 60. This formula maps C in any octave correctly.
    // Octave for chord playback is handled in ChordProgressionTool.tsx, `baseOctave`
    // logic there ensures notes are generally ascending within the chord.
    return 60 + noteIndex + (octave - 4) * 12;
};
