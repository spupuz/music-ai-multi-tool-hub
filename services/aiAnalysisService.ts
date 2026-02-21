/**
 * aiAnalysisService.ts
 * Calls the Gemini Proxy Worker instead of Gemini directly.
 * The API key is stored as a secret on the Worker — never in the frontend bundle.
 */
import type { ContentRatingCheckResult, LyricsLanguageCheckResult, RatingLevel, AiSynchronizedTimestamp } from '../types';

const WORKER_URL = 'https://gemini-proxy.spupuz.workers.dev';
const MODEL = 'gemini-2.5-flash';

/** Call the Gemini proxy Worker */
async function callProxy(contents: string, config?: object): Promise<{ text: string }> {
  if (!WORKER_URL) throw new Error('Gemini proxy not configured. Set VITE_GEMINI_WORKER_URL in your environment variables.');

  const res = await fetch(WORKER_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: MODEL, contents, config }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini proxy error ${res.status}: ${err}`);
  }

  return res.json();
}

export async function analyzeLyricsLanguageDetailsGemini(text: string): Promise<LyricsLanguageCheckResult> {
  const prompt = `Analyze the following song lyrics. Respond ONLY with a JSON object containing three keys:\n1. \"primaryLanguageCode\": string (The two-letter ISO 639-1 code for the primary language of the text, e.g., 'en', 'es'. If unsure or multiple languages are equally prominent with no clear primary, use 'unknown'. If the text is too short or gibberish, use 'unknown'.)\n2. \"untranslatableWordsFound\": boolean (True if there are any words or phrases that appear to be gibberish, placeholders, or non-standard/untranslatable for the identified primary language. False otherwise.)\n3. \"untranslatableWordsExplanation\": string (A brief explanation. If untranslatableWordsFound is true, describe the detected untranslatable/gibberish words. If false, state that lyrics appear to be standard for the detected language. Max 50 words.)\n\nLyrics:\n\"${text}\"`;

  try {
    const response = await callProxy(prompt, { responseMimeType: 'application/json' });
    let jsonStr = response.text.trim();
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) jsonStr = match[2].trim();

    const parsedResult = JSON.parse(jsonStr);
    if (typeof parsedResult.primaryLanguageCode === 'string' &&
      typeof parsedResult.untranslatableWordsFound === 'boolean' &&
      typeof parsedResult.untranslatableWordsExplanation === 'string') {
      return parsedResult as LyricsLanguageCheckResult;
    }
    throw new Error('Gemini API returned an unexpected JSON structure for language analysis.');
  } catch (error) {
    console.error('Error in analyzeLyricsLanguageDetailsGemini:', error);
    if (error instanceof SyntaxError) throw new Error('Gemini API returned non-JSON response for language analysis.');
    throw error;
  }
}

const ratingDefinitions: Record<RatingLevel, string> = {
  'G': "General Audiences – All ages admitted. Nothing that would offend parents for viewing by children. Minimal violence, no strong language, no nudity, no sexual content, no drug use.",
  'PG': "Parental Guidance Suggested – Some material may not be suitable for children. May contain some coarse language, brief violence, or some suggestive scenes, but no drug use or nudity.",
  'PG-13': "Parents Strongly Cautioned – Some material may be inappropriate for children under 13. May contain more intense violence, brief nudity, some strong language, or some drug references. Sexual content is not explicit.",
  'R': "Restricted – Under 17 requires accompanying parent or adult guardian. May contain adult themes, adult activity, hard language, intense or persistent violence, sexually-oriented nudity, drug abuse or other elements.",
  'Explicit': "Explicit Content – Contains material that is generally considered offensive or unsuitable for all ages, such as strong and frequent profanity, graphic violence, explicit sexual descriptions or depictions, or hate speech."
};

export async function checkContentRatingGemini(text: string, ratingLevel: RatingLevel): Promise<ContentRatingCheckResult> {
  const definition = ratingDefinitions[ratingLevel] || ratingDefinitions['PG-13'];
  const prompt = `Analyze the following song lyrics for appropriateness based on a "${ratingLevel}" rating standard.\nDefinition for "${ratingLevel}": ${definition}\nRespond ONLY with a JSON object with two keys:\n1. "is_appropriate": boolean (true if appropriate for a "${ratingLevel}" rating, false otherwise).\n2. "explanation": string (A brief explanation for the classification against the "${ratingLevel}" standard. If not appropriate, highlight specific concerns. If appropriate, this can be a short confirmation. Max 100 words.).\nLyrics:\n"${text}"`;

  try {
    const response = await callProxy(prompt, { responseMimeType: 'application/json' });
    let jsonStr = response.text.trim();
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) jsonStr = match[2].trim();
    return JSON.parse(jsonStr) as ContentRatingCheckResult;
  } catch (error) {
    console.error(`Error in checkContentRatingGemini (Rating: ${ratingLevel}):`, error);
    if (error instanceof SyntaxError) throw new Error(`Gemini API returned non-JSON response for ${ratingLevel} content check.`);
    throw error;
  }
}

export async function synchronizeLyricsWithAudioGemini(
  lyrics: string,
  audioDurationSeconds: number,
  syllableCounts: number[]
): Promise<AiSynchronizedTimestamp[]> {
  if (!lyrics.trim()) return [];
  if (audioDurationSeconds <= 0) throw new Error('Audio duration must be positive.');

  const lyricLines = lyrics.split('\n');
  if (lyricLines.length !== syllableCounts.length) {
    throw new Error('Mismatch between number of lyric lines and syllable counts provided to AI.');
  }

  const prompt = `
You are an expert in music and lyrics synchronization.
Your task is to estimate timestamps for each line of the provided song lyrics, distributing them appropriately across the provided audio duration.
Lyrics will be provided as an array of strings. Corresponding syllable counts for each line are also provided. The audio duration is in seconds.

RULES:
1. Respond ONLY with a valid JSON array of objects. Each object must have two keys:
   - "line_index": number (0-based index of the original input lyric line).
   - "timestamp_seconds": number | null (The estimated start time for this line in seconds, e.g., 5.34. If a line is a structural marker or empty, set timestamp_seconds to null. Otherwise, provide an estimated time.)
2. Timestamps should be progressive and within the audio_duration_seconds.
3. Distribute timestamps for lyrical lines to reflect a natural singing pace. Lines with more syllables (as indicated in syllable_counts_per_line) should generally be allocated more time than lines with fewer syllables.
4. Structural markers (e.g., "[Intro]", "[Outro]", "[Verse]", "[Chorus]", "[Bridge]", "[Instrumental]", "[Guitar Solo]", "(Adlib)", etc.) or empty lines (syllable count will be 0) should have "timestamp_seconds" set to null.
5. Time Gaps for Structural Markers:
   - If an "[Intro]" marker (or similar beginning marker) exists, the first lyrical line following it should have a noticeable delay from 0 seconds to account for the intro's duration.
   - If an "[Outro]" marker (or similar ending marker) exists after the last lyrical line, that last lyrical line's timestamp should allow sufficient time for the outro's duration before reaching audio_duration_seconds.
   - If an "[Instrumental]", "[Solo]", "[Breakdown]", or similar non-lyrical marker is between lyrical sections, ensure a significant time gap between the timestamp of the lyrical line preceding it and the timestamp of the lyrical line succeeding it.
6. The first lyrical line should generally start at or near 0 seconds, unless preceded by an "[Intro]" or similar marker.

Audio Duration (seconds): ${audioDurationSeconds}
Lyric Lines (0-indexed array): ${JSON.stringify(lyricLines)}
Syllable Counts per Line (0-indexed array): ${JSON.stringify(syllableCounts)}

Return ONLY the JSON array.
`;

  try {
    const response = await callProxy(prompt, { responseMimeType: 'application/json' });
    let jsonStr = response.text.trim();
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) jsonStr = match[2].trim();

    const parsedResult = JSON.parse(jsonStr);
    if (Array.isArray(parsedResult) && parsedResult.every(item =>
      typeof item.line_index === 'number' &&
      (typeof item.timestamp_seconds === 'number' || item.timestamp_seconds === null)
    )) {
      return parsedResult as AiSynchronizedTimestamp[];
    }
    throw new Error('Gemini API returned an unexpected JSON structure for lyrics synchronization.');
  } catch (error) {
    console.error('Error in synchronizeLyricsWithAudioGemini:', error);
    if (error instanceof SyntaxError) throw new Error('Gemini API returned non-JSON response for lyrics synchronization.');
    throw error;
  }
}