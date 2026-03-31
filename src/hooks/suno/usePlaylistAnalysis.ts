import { useMemo } from 'react';
import type { SunoClip, PlaylistAnalysis } from '@/types';

export const usePlaylistAnalysis = (
  originalSongsList: SunoClip[],
  currentIdentifierType: 'user' | 'playlist' | 'custom_list' | null
): PlaylistAnalysis | null => {
  return useMemo(() => {
    if ((currentIdentifierType !== 'playlist' && currentIdentifierType !== 'custom_list') || originalSongsList.length === 0) {
      return null;
    }

    const commonGenres = [
      'pop', 'rock', 'electronic', 'hip hop', 'jazz', 'classical', 'folk', 'metal', 'blues', 'r&b', 'reggae', 'country', 'funk', 'soul', 'disco', 'punk', 'ambient', 'techno', 'house', 'trance', 'synthwave', 'lo-fi', 'chiptune', 'drill', 'edm', 'idm', 'dnb', 'drum and bass', 'jungle', 'garage', 'grime', 'dubstep', 'trap', 'vaporwave', 'shoegaze', 'post-punk', 'indie', 'alternative'
    ];

    const totalClips = originalSongsList.length;
    const totalPlays = originalSongsList.reduce((sum, clip) => sum + (clip.play_count || 0), 0);
    const totalUpvotes = originalSongsList.reduce((sum, clip) => sum + (clip.upvote_count || 0), 0);
    const totalComments = originalSongsList.reduce((sum, clip) => sum + (clip.comment_count || 0), 0);

    const tagMap = new Map<string, number>();
    const artistMap = new Map<string, { name: string; count: number; profileUrl?: string }>();
    const dateMap = new Map<string, number>();

    originalSongsList.forEach(clip => {
      const artistHandle = clip.handle || 'unknown';
      let artistEntry = artistMap.get(artistHandle);

      if (!artistEntry) {
        let url = clip.suno_creator_url;
        if (!url && clip.source !== 'riffusion') {
          url = `https://suno.com/@${artistHandle}`;
        }
        artistEntry = { name: clip.display_name || artistHandle, count: 0, profileUrl: url };
      }

      artistEntry.count++;
      artistMap.set(artistHandle, artistEntry);

      const tags = clip.metadata?.tags?.split(',').map(t => t.trim().toLowerCase()).filter(Boolean) || [];
      tags.forEach(tag => {
        tagMap.set(tag, (tagMap.get(tag) || 0) + 1);
      });

      try {
        const month = new Date(clip.created_at).toISOString().slice(0, 7); // YYYY-MM
        dateMap.set(month, (dateMap.get(month) || 0) + 1);
      } catch (e) { }
    });

    const allTags = Array.from(tagMap.entries()).map(([name, count]) => ({ name, count }));
    const mostCommonTags = allTags.filter(t => !commonGenres.includes(t.name)).sort((a, b) => b.count - a.count).slice(0, 10);
    const mostCommonGenres = allTags.filter(t => commonGenres.includes(t.name)).sort((a, b) => b.count - a.count).slice(0, 10);

    const mostFeaturedArtists = Array.from(artistMap.entries())
      .map(([handle, data]) => ({ handle, name: data.name, count: data.count, profileUrl: data.profileUrl }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const creationDateDistribution = Array.from(dateMap.entries())
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => a.month.localeCompare(b.month));

    return {
      totalClips,
      totalPlays,
      totalUpvotes,
      totalComments,
      avgPlays: totalClips > 0 ? totalPlays / totalClips : 0,
      avgUpvotes: totalClips > 0 ? totalUpvotes / totalClips : 0,
      avgComments: totalClips > 0 ? totalComments / totalClips : 0,
      mostCommonTags,
      mostCommonGenres,
      mostFeaturedArtists,
      creationDateDistribution
    };
  }, [originalSongsList, currentIdentifierType]);
};
