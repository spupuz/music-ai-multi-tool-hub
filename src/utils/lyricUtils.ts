// utils/lyricUtils.ts

// ⚡ Bolt: Hoist constants out of the hot per-word function. `countSyllablesInLine`
// calls this once per word on every keystroke in the lyric editors, so rebuilding
// these literals on each call would allocate ~40 objects/arrays per line.
const ONE_SYLLABLE_WORDS = new Set([
    'the', 'a', 'i', 'is', 'of', 'to', 'in', 'it', 'on', 'at', 'me', 'my', 'he',
    'she', 'we', 'so', 'no', 'go', 'by',
]);

// Common words whose syllable count the heuristic gets wrong.
const SYLLABLE_EXCEPTIONS: Record<string, number> = {
    "because": 2, "amazing": 3, "beautiful": 3, "chocolate": 2, "every": 2,
    "everything": 3, "different": 3, "interesting": 3, "usually": 3, "family": 3,
    "probably": 3, "finally": 3, "actually": 3, "sometimes": 2, "something": 2,
    "anything": 3, "especially": 4, "business": 2, "problem": 2, "example": 3,
    "however": 3, "really": 2, "area": 3, "genuine": 3, "create": 2, "naive": 2,
    "idea": 3, "evening": 2, "people": 2, "inspire": 2, "desire": 2, "fire": 1,
    "hour": 1, "choir": 1, "quiet": 2, "science": 2, "video": 3, "audio": 3, "radio": 3,
};

// ⚡ Bolt: Diphthong spellings looked up per word; keep them in a Set so the
// adjustment loop below is O(1) per candidate instead of an array scan.
const DIPHTHONGS = new Set([
    'oi', 'oy', 'ou', 'ow', 'au', 'aw', 'oo', 'ui', 'io', 'ea', 'ua', 'ei', 'ie',
    'ai', 'ay', 'ey', 'eu', 'ew',
]);

const VOWELS = 'aeiouy';

// A heuristic-based syllable counter. Not perfect, but good for real-time feedback.
export const countSyllablesForWord = (word: string): number => {
    if (!word) return 0;
    word = word.toLowerCase().trim();
    // Clean word: remove non-alphabetic characters from start/end and handle apostrophes
    const cleanWord = word.replace(/[^a-z']/gi, '');
    if (cleanWord.length === 0) return 0;

    // Common short words that are always 1 syllable
    if (ONE_SYLLABLE_WORDS.has(cleanWord)) return 1;
    if (cleanWord.length <= 3 && cleanWord.match(/[aeiouy]/)) return 1;

    // Common exceptions
    const exception = SYLLABLE_EXCEPTIONS[cleanWord];
    if (exception) return exception;

    let syllableCount = 0;
    let lastCharWasVowel = false;

    // Handle silent 'e' at the end, but not if it's 'le'
    const effectiveWord = cleanWord.endsWith('e') && !cleanWord.endsWith('le') && cleanWord.length > 2 && !VOWELS.includes(cleanWord.charAt(cleanWord.length - 2))
        ? cleanWord.slice(0, -1)
        : cleanWord;

    // Heuristic vowel counting
    for (let i = 0; i < effectiveWord.length; i++) {
        const char = effectiveWord[i];
        const isVowel = VOWELS.includes(char);
        if (isVowel && !lastCharWasVowel) {
            syllableCount++;
        }
        lastCharWasVowel = isVowel;
    }

    // Dipthong/Tripthong adjustments (very basic)
    DIPHTHONGS.forEach(d => {
        if (effectiveWord.includes(d)) syllableCount--;
    });

    // Handle 'le' endings
    if (effectiveWord.endsWith('le') && effectiveWord.length > 2 && !VOWELS.includes(effectiveWord.charAt(effectiveWord.length - 3))) {
        syllableCount++;
    }

    // Ensure at least one syllable if there are vowels
    if (syllableCount <= 0 && cleanWord.match(/[aeiouy]/)) {
        syllableCount = 1;
    }

    return Math.max(1, syllableCount);
};

export const countSyllablesInLine = (line: string): number => {
    if (!line || !line.trim()) return 0;
    // Split on spaces, hyphens, or em-dashes
    const words = line.trim().split(/[\s-]+/);
    return words.reduce((sum, word) => sum + countSyllablesForWord(word), 0);
};
