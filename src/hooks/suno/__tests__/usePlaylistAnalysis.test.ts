import { renderHook } from '@testing-library/react';
import { usePlaylistAnalysis } from '../usePlaylistAnalysis';
import { describe, it, expect } from 'vitest';
import type { SunoClip } from '@/types';

const mockSongs: SunoClip[] = [
  {
    id: 'song-1',
    title: 'Song 1',
    play_count: 100,
    upvote_count: 10,
    comment_count: 5,
    created_at: '2023-01-01T00:00:00Z',
    handle: 'artist1',
    display_name: 'Artist One',
    metadata: { tags: 'pop, rock', prompt: '', duration: 180, gpt_description_prompt: null, error_type: null, error_message: null, type: 'music' },
    status: 'complete',
    audio_url: '',
    video_url: '',
    image_url: '',
    image_large_url: '',
    image_urls: {},
    is_video_pending: false,
    major_model_version: 'v3',
    model_name: 'chirp-v3',
    is_liked: false,
    user_id: 'user1',
    is_trashed: false,
    is_public: true
  },
  {
    id: 'song-2',
    title: 'Song 2',
    play_count: 200,
    upvote_count: 20,
    comment_count: 10,
    created_at: '2023-02-01T00:00:00Z',
    handle: 'artist2',
    display_name: 'Artist Two',
    metadata: { tags: 'jazz, pop', prompt: '', duration: 200, gpt_description_prompt: null, error_type: null, error_message: null, type: 'music' },
    status: 'complete',
    audio_url: '',
    video_url: '',
    image_url: '',
    image_large_url: '',
    image_urls: {},
    is_video_pending: false,
    major_model_version: 'v3',
    model_name: 'chirp-v3',
    is_liked: false,
    user_id: 'user2',
    is_trashed: false,
    is_public: true
  }
];

describe('usePlaylistAnalysis', () => {
  it('should return null if identifier type is not playlist or custom_list', () => {
    const { result } = renderHook(() => usePlaylistAnalysis(mockSongs, 'user'));
    expect(result.current).toBe(null);
  });

  it('should return null if song list is empty', () => {
    const { result } = renderHook(() => usePlaylistAnalysis([], 'playlist'));
    expect(result.current).toBe(null);
  });

  it('should perform correct analysis for a playlist', () => {
    const { result } = renderHook(() => usePlaylistAnalysis(mockSongs, 'playlist'));
    
    expect(result.current).not.toBe(null);
    if (result.current) {
      expect(result.current.totalClips).toBe(2);
      expect(result.current.totalPlays).toBe(300);
      expect(result.current.avgPlays).toBe(150);
      expect(result.current.mostCommonGenres).toContainEqual({ name: 'pop', count: 2 });
      expect(result.current.mostCommonGenres).toContainEqual({ name: 'rock', count: 1 });
      expect(result.current.mostCommonGenres).toContainEqual({ name: 'jazz', count: 1 });
      expect(result.current.creationDateDistribution).toHaveLength(2);
      expect(result.current.creationDateDistribution[0]).toEqual({ month: '2023-01', count: 1 });
    }
  });
});
