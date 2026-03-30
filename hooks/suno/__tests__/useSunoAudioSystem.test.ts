import { renderHook, act } from '@testing-library/react';
import { useSunoAudioSystem } from '../useSunoAudioSystem';
import { DEFAULT_EQ_BANDS_CONFIG } from '../constants';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PlaybackStatus } from '../../../types';

// Mock Howler
vi.mock('howler', () => ({
  Howler: {
    ctx: null,
    masterGain: null,
    volume: vi.fn(),
  },
  Howl: vi.fn(),
}));

const mockAudioContextInstance = {
  state: 'running',
  resume: vi.fn().mockResolvedValue(undefined),
  createGain: vi.fn().mockReturnValue({ gain: { value: 1, setValueAtTime: vi.fn() }, connect: vi.fn(), disconnect: vi.fn() }),
  createAnalyser: vi.fn().mockReturnValue({ fftSize: 256, connect: vi.fn(), disconnect: vi.fn() }),
  createChannelSplitter: vi.fn().mockReturnValue({ connect: vi.fn(), disconnect: vi.fn() }),
  createChannelMerger: vi.fn().mockReturnValue({ connect: vi.fn(), disconnect: vi.fn() }),
  createBiquadFilter: vi.fn().mockReturnValue({ type: 'peaking', frequency: { value: 0 }, gain: { value: 0, setValueAtTime: vi.fn() }, Q: { value: 1 }, connect: vi.fn(), disconnect: vi.fn() }),
  destination: {},
  currentTime: 0,
  close: vi.fn().mockResolvedValue(undefined),
};

describe('useSunoAudioSystem', () => {
  const setErrorPlayer = vi.fn();
  const playerState = {
    status: PlaybackStatus.Idle,
    currentSong: null,
    currentTime: 0,
    duration: 0,
    volume: 0.75,
    isShuffle: false,
    isSnippetMode: false,
    snippetDurationConfig: 30,
    history: [],
    queue: [],
    originalOrder: [],
    eqBands: DEFAULT_EQ_BANDS_CONFIG.map(b => ({ ...b })),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // @ts-ignore
    window.AudioContext = vi.fn().mockImplementation(() => mockAudioContextInstance);
  });

  it('should initialize with audio system NOT ready', () => {
    const { result } = renderHook(() => useSunoAudioSystem({ playerState, setErrorPlayer }));
    expect(result.current.isAudioSystemReady).toBe(false);
  });

  it('should transition to ready after ensureAudioSystemReady is called', async () => {
    const { result } = renderHook(() => useSunoAudioSystem({ playerState, setErrorPlayer }));
    
    let ready: boolean = false;
    await act(async () => {
      ready = await result.current.ensureAudioSystemReady();
    });

    expect(ready).toBe(true);
    expect(result.current.isAudioSystemReady).toBe(true);
  });
});
