import { renderHook, act } from '@testing-library/react';
import { useSunoDataManagement } from '../useSunoDataManagement';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LOCAL_STORAGE_CLIP_DETAIL_CACHE_KEY, LOCAL_STORAGE_SAVED_CUSTOM_PLAYLISTS_KEY } from '../constants';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value.toString(); }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
    key: vi.fn((index: number) => Object.keys(store)[index] || null),
    get length() { return Object.keys(store).length; }
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

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

  it('should handle clearing player cache with multiple clicks', async () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useSunoDataManagement({ trackLocalEvent, setErrorPlayer }));
    
    // First click
    await act(async () => {
      result.current.handleClearPlayerCache();
    });
    expect(result.current.clearPlayerCacheClickCount).toBe(1);
    expect(localStorageMock.removeItem).not.toHaveBeenCalled();

    // Second click
    await act(async () => {
      result.current.handleClearPlayerCache();
    });
    expect(result.current.clearPlayerCacheClickCount).toBe(2);
    expect(localStorageMock.removeItem).not.toHaveBeenCalled();

    // Third click (success)
    await act(async () => {
      result.current.handleClearPlayerCache();
    });
    expect(localStorageMock.removeItem).toHaveBeenCalledWith(LOCAL_STORAGE_CLIP_DETAIL_CACHE_KEY);
    expect(result.current.dataManagementStatus).toBe("Player cache cleared successfully.");
    
    vi.useRealTimers();
  });
});
