import { useState, useEffect } from 'react';
import { LATEST_VERSION as FALLBACK_VERSION, LATEST_RELEASE_DATE as FALLBACK_DATE } from '@/data/version';

const GITHUB_TAGS_API = 'https://api.github.com/repos/spupuz/music-ai-multi-tool-hub/tags';

interface AppVersion {
  version: string;
  releaseDate: string;
  loading: boolean;
}

export function useAppVersion(): AppVersion {
  const [state, setState] = useState<AppVersion>({
    version: FALLBACK_VERSION,
    releaseDate: FALLBACK_DATE,
    loading: true,
  });

  useEffect(() => {
    let cancelled = false;

    fetch(GITHUB_TAGS_API)
      .then(res => {
        if (!res.ok) throw new Error('GitHub API error');
        return res.json();
      })
      .then(tags => {
        if (cancelled) return;
        if (Array.isArray(tags) && tags.length > 0) {
          const latestTag = tags[0].name.replace(/^v/i, '');
          setState({
            version: latestTag,
            releaseDate: new Date().toISOString().split('T')[0],
            loading: false,
          });
        } else {
          setState(prev => ({ ...prev, loading: false }));
        }
      })
      .catch(() => {
        if (!cancelled) {
          setState(prev => ({ ...prev, loading: false }));
        }
      });

    return () => { cancelled = true; };
  }, []);

  return state;
}
