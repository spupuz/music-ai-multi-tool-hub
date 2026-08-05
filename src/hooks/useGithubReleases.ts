import { useState, useEffect } from 'react';
import { releaseNotes as staticNotes, type ReleaseNoteItem } from '@/data/releaseNotesData';

const GITHUB_RELEASES_API = 'https://api.github.com/repos/spupuz/music-ai-multi-tool-hub/releases';

export interface RawRelease {
  version: string;
  date: string;
  body: string;
}

interface UseGithubReleasesResult {
  raw: RawRelease[];
  loading: boolean;
  error: string | null;
}

export function useGithubReleases(): UseGithubReleasesResult {
  const [state, setState] = useState<UseGithubReleasesResult>({
    raw: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    fetch(GITHUB_RELEASES_API)
      .then(res => {
        if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);
        return res.json();
      })
      .then((releases: any[]) => {
        if (cancelled || !Array.isArray(releases)) return;
        const raw: RawRelease[] = releases
          .filter(r => r.tag_name && !r.draft && r.body)
          .map(r => ({
            version: r.tag_name.replace(/^v/i, ''),
            date: r.published_at ? r.published_at.split('T')[0] : '',
            body: r.body,
          }));
        setState({ raw, loading: false, error: null });
      })
      .catch(err => {
        if (!cancelled) {
          setState({ raw: [], loading: false, error: err.message });
        }
      });

    return () => { cancelled = true; };
  }, []);

  return state;
}
