import { renderHook, act } from '@testing-library/react';
import { useSunoDataManagement } from '../useSunoDataManagement';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LOCAL_STORAGE_SAVED_CUSTOM_PLAYLISTS_KEY } from '../constants';
import type { SunoClip } from '@/types';

// Mock localStorage: plain object methods spyable via vi.fn, plus Proxy traps
// so that Object.keys(localStorage) reflects the actual stored keys (needed by
// cacheGetAll/cacheRemoveNamespace in cacheUtils).
const store: Record<string, string> = {};
const localStorageMock = new Proxy(
  {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { store[key] = String(value); }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear: vi.fn(() => { for (const k of Object.keys(store)) delete store[k]; }),
    key: vi.fn((index: number) => Object.keys(store)[index] ?? null),
  },
  {
    get(target, prop) {
      if (prop === 'length') return Object.keys(store).length;
      return Reflect.get(target, prop);
    },
    ownKeys() {
      return Reflect.ownKeys(store);
    },
    getOwnPropertyDescriptor(target, prop) {
      if (typeof prop === 'string' && prop in store) {
        return { enumerable: true, configurable: true, writable: true, value: store[prop] };
      }
      return Reflect.getOwnPropertyDescriptor(target, prop);
    },
  }
) as unknown as Storage;

Object.defineProperty(window, 'localStorage', { value: localStorageMock, configurable: true });

describe('useSunoDataManagement', () => {
  const trackLocalEvent = vi.fn();
  const setErrorPlayer = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
  });

  it('should initialize with empty data if localStorage is empty', () => {
    const { result } = renderHook(() => useSunoDataManagement({ trackLocalEvent, setErrorPlayer }));
    expect(result.current.savedCustomPlaylists).toEqual([]);
    expect(result.current.songInfoCache.size).toBe(0);
  });

  it('should load data from localStorage on mount', () => {
    const mockPlaylists = [{ id: '1', name: 'Test', content: 'abc', createdAt: '2023-01-01' }];
    localStorageMock.setItem(LOCAL_STORAGE_SAVED_CUSTOM_PLAYLISTS_KEY, JSON.stringify(mockPlaylists));

    const { result } = renderHook(() => useSunoDataManagement({ trackLocalEvent, setErrorPlayer }));
    expect(result.current.savedCustomPlaylists).toEqual(mockPlaylists);
  });

  it('should hydrate song info cache from per-entry keys on mount', () => {
    const clip = {
      id: 'song1', title: 'Test Song', audio_url: 'https://example.com/a.mp3',
      video_url: '', image_url: null, image_large_url: null, image_urls: { image_url: null, image_url_large: null },
      is_video_pending: false, major_model_version: 'v3', model_name: 'chirp-v3',
      metadata: { tags: null, prompt: null, gpt_description_prompt: null, error_type: null, error_message: null, type: 'music', duration: null },
      is_liked: false, user_id: 'u1', display_name: 'Tester', handle: 'tester', is_trashed: false,
      created_at: '2023-01-01T00:00:00Z', status: 'complete', title_original: 'Test Song',
      play_count: 0, upvote_count: 0, comment_count: 0, is_public: true,
    } as SunoClip;
    localStorageMock.setItem('hubCache_song_song1', JSON.stringify({ value: clip, ts: Date.now() }));

    const { result } = renderHook(() => useSunoDataManagement({ trackLocalEvent, setErrorPlayer }));
    expect(result.current.songInfoCache.size).toBe(1);
    expect(result.current.songInfoCache.get('song1')).toEqual(clip);
  });

  it('should save playlists to localStorage when they change', async () => {
    const { result } = renderHook(() => useSunoDataManagement({ trackLocalEvent, setErrorPlayer }));

    const newPlaylist = { id: '2', name: 'New', content: 'def', createdAt: '2023-01-02' };

    await act(async () => {
      result.current.setSavedCustomPlaylists([newPlaylist]);
    });

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      LOCAL_STORAGE_SAVED_CUSTOM_PLAYLISTS_KEY,
      JSON.stringify([newPlaylist])
    );
  });

  it('should persist new song entries per-entry when cache changes', async () => {
    const { result } = renderHook(() => useSunoDataManagement({ trackLocalEvent, setErrorPlayer }));

    const clip = {
      id: 'song2', title: 'New Song', audio_url: 'https://example.com/b.mp3',
      video_url: '', image_url: null, image_large_url: null, image_urls: { image_url: null, image_url_large: null },
      is_video_pending: false, major_model_version: 'v3', model_name: 'chirp-v3',
      metadata: { tags: null, prompt: null, gpt_description_prompt: null, error_type: null, error_message: null, type: 'music', duration: null },
      is_liked: false, user_id: 'u1', display_name: 'Tester', handle: 'tester', is_trashed: false,
      created_at: '2023-01-02T00:00:00Z', status: 'complete', title_original: 'New Song',
      play_count: 0, upvote_count: 0, comment_count: 0, is_public: true,
    } as SunoClip;

    await act(async () => {
      result.current.setSongInfoCache(new Map([['song2', clip]]));
    });

    const stored = JSON.parse(localStorageMock.getItem('hubCache_song_song2')!);
    expect(stored.value).toEqual(clip);
    expect(stored.ts).toEqual(expect.any(Number));
  });

  it('should handle clearing player cache with multiple clicks', async () => {
    vi.useFakeTimers();
    localStorageMock.setItem('hubCache_song_song1', JSON.stringify({ value: { id: 'song1' }, ts: Date.now() }));
    const { result } = renderHook(() => useSunoDataManagement({ trackLocalEvent, setErrorPlayer }));

    // First click
    await act(async () => {
      result.current.handleClearSongInfoCache();
    });
    expect(result.current.clearPlayerCacheClickCount).toBe(1);

    // Second click
    await act(async () => {
      result.current.handleClearSongInfoCache();
    });
    expect(result.current.clearPlayerCacheClickCount).toBe(2);

    // Third click (success)
    await act(async () => {
      result.current.handleClearSongInfoCache();
    });
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('hubCache_song_song1');
    expect(localStorageMock.getItem('hubCache_song_song1')).toBeNull();
    expect(result.current.dataManagementStatus).toBe("Song info cache (individual clips) cleared.");
    expect(result.current.songInfoCache.size).toBe(0);

    vi.useRealTimers();
  });
});
