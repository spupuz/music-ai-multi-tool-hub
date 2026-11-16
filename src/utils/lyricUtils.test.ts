// ⚡ Bolt: verify the hoisted-constant refactor is behavior-preserving.
import { describe, it, expect } from 'vitest';
import { countSyllablesForWord, countSyllablesInLine } from './lyricUtils';

describe('countSyllablesForWord', () => {
  it('handles one-syllable words from the hoisted Set', () => {
    for (const w of ['the', 'a', 'i', 'is', 'of', 'to', 'in', 'it', 'on', 'at',
      'me', 'my', 'he', 'she', 'we', 'so', 'no', 'go', 'by']) {
      expect(countSyllablesForWord(w)).toBe(1);
    }
  });

  it('returns the exception counts unchanged', () => {
    expect(countSyllablesForWord('because')).toBe(2);
    expect(countSyllablesForWord('amazing')).toBe(3);
    expect(countSyllablesForWord('especially')).toBe(4);
    expect(countSyllablesForWord('fire')).toBe(1);
    expect(countSyllablesForWord('radio')).toBe(3);
  });

  it('counts syllables for generic words', () => {
    expect(countSyllablesForWord('hello')).toBe(2);
    expect(countSyllablesForWord('world')).toBe(1);
    expect(countSyllablesForWord('banana')).toBe(3);
    expect(countSyllablesForWord('')).toBe(0);
  });

  it('ignores surrounding punctuation and case', () => {
    expect(countSyllablesForWord('Hello,')).toBe(countSyllablesForWord('hello'));
    expect(countSyllablesForWord('WORLD!')).toBe(countSyllablesForWord('world'));
  });

  it('applies the silent-e and -le rules', () => {
    // 'make' -> 'mak' -> 1 vowel group
    expect(countSyllablesForWord('make')).toBe(1);
    // 'table' -> ends in 'le' with consonant before -> heuristic gives 3
    expect(countSyllablesForWord('table')).toBe(3);
  });
});

describe('countSyllablesInLine', () => {
  it('sums per-word counts', () => {
    expect(countSyllablesInLine('hello world')).toBe(3);
    expect(countSyllablesInLine('')).toBe(0);
    expect(countSyllablesInLine('   ')).toBe(0);
    // hyphen / em-dash separators split words
    expect(countSyllablesInLine('one-two—three')).toBe(3);
  });
});