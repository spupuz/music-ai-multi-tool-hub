import { useState, useEffect } from 'react';
import React from 'react';
import { P, UL, LI, CODE, STRONG, SectionTitle, SubSectionTitle } from '@/components/ReleaseNoteElements';
import { releaseNotes as staticNotes, type ReleaseNoteItem } from '@/data/releaseNotesData';

const GITHUB_RELEASES_API = 'https://api.github.com/repos/spupuz/music-ai-multi-tool-hub/releases';

function h(type: React.ElementType, props: Record<string, unknown>, ...children: React.ReactNode[]): React.ReactElement {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return React.createElement(type as any, props, ...children);
}

function parseMarkdownToJsx(markdown: string): React.ReactNode[] {
  const lines = markdown.split('\n');
  const elements: React.ReactNode[] = [];
  let currentListItems: string[] = [];
  let currentSubTitle: string | null = null;
  let sectionKey = 0;

  function flushList() {
    if (currentListItems.length > 0 && currentSubTitle) {
      elements.push(h(SubSectionTitle, { key: `sub-${sectionKey}`, children: currentSubTitle }));
      elements.push(
        h(UL, { key: `ul-${sectionKey}` },
          ...currentListItems.map((item, i) =>
            h(LI, { key: `li-${sectionKey}-${i}` }, parseInlineMarkdown(item))
          )
        )
      );
      currentListItems = [];
      currentSubTitle = null;
      sectionKey++;
    }
  }

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) { flushList(); continue; }

    const h3Match = trimmed.match(/^###\s+(.+)/);
    if (h3Match) {
      flushList();
      currentSubTitle = h3Match[1];
      continue;
    }

    const h2Match = trimmed.match(/^##\s+\[(.+?)\]\s*-\s*(.+)/);
    if (h2Match) {
      flushList();
      elements.push(
        h(SectionTitle, { key: `h2-${sectionKey}`, children: `Version ${h2Match[1]} - ${h2Match[2]}` })
      );
      sectionKey++;
      continue;
    }

    const liMatch = trimmed.match(/^-\s+(.+)/);
    if (liMatch && currentSubTitle) {
      currentListItems.push(liMatch[1]);
      continue;
    }

    flushList();
    elements.push(
      h(P, { key: `p-${sectionKey}`, children: parseInlineMarkdown(trimmed) })
    );
    sectionKey++;
  }
  flushList();

  return elements;
}

function parseInlineMarkdown(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  let key = 0;

  const patterns: [RegExp, (match: RegExpMatchArray) => React.ReactNode][] = [
    [/`([^`]+)`/g, (m) => h(CODE, { key: `code-${key++}`, children: m[1] })],
    [/\*\*([^*]+)\*\*/g, (m) => h(STRONG, { key: `strong-${key++}`, children: m[1] })],
  ];

  const segments: { start: number; end: number; node: React.ReactNode }[] = [];

  for (const [regex, creator] of patterns) {
    regex.lastIndex = 0;
    let match;
    while ((match = regex.exec(text)) !== null) {
      segments.push({ start: match.index, end: match.index + match[0].length, node: creator(match) });
    }
  }

  segments.sort((a, b) => a.start - b.start);

  let cursor = 0;
  for (const seg of segments) {
    if (seg.start > cursor) {
      parts.push(text.slice(cursor, seg.start));
    }
    parts.push(seg.node);
    cursor = seg.end;
  }
  if (cursor < text.length) {
    parts.push(text.slice(cursor));
  }

  return parts.length === 1 && typeof parts[0] === 'string' ? parts[0] : h(React.Fragment, {}, ...parts);
}

interface UseGithubReleasesResult {
  notes: ReleaseNoteItem[];
  loading: boolean;
  error: string | null;
}

export function useGithubReleases(): UseGithubReleasesResult {
  const [state, setState] = useState<UseGithubReleasesResult>({
    notes: staticNotes,
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

        const parsed: ReleaseNoteItem[] = releases
          .filter(r => r.tag_name && !r.draft && r.body)
          .map(r => {
            const version = r.tag_name.replace(/^v/i, '');
            const date = r.published_at ? r.published_at.split('T')[0] : '';
            const title = `Version ${version}${date ? ` - ${date}` : ''}`;
            const parsed = parseMarkdownToJsx(r.body);
            const header = h(SectionTitle, { key: 'title' }, title);
            return {
              version,
              content: h(React.Fragment, {}, header, ...parsed),
            };
          });

        if (parsed.length > 0) {
          setState({ notes: parsed, loading: false, error: null });
        } else {
          setState(prev => ({ ...prev, loading: false }));
        }
      })
      .catch(err => {
        if (!cancelled) {
          setState({ notes: staticNotes, loading: false, error: err.message });
        }
      });

    return () => { cancelled = true; };
  }, []);

  return state;
}
