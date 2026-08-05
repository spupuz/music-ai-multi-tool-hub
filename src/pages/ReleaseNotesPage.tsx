import React, { useEffect, useMemo } from 'react';
import type { ToolProps } from '@/Layout';
import { useTheme } from '@/context/ThemeContext';
import { useGithubReleases, type RawRelease } from '@/hooks/useGithubReleases';
import { releaseNotes as staticNotes, type ReleaseNoteItem } from '@/data/releaseNotesData';
import { SectionTitle, SubSectionTitle, UL, LI, CODE, STRONG } from '@/components/ReleaseNoteElements';
import Spinner from '@/components/Spinner';

function inlineMd(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  let key = 0;
  const re = /(`[^`]+`|\*\*[^*]+\*\*)/g;
  let lastIdx = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m.index > lastIdx) parts.push(text.slice(lastIdx, m.index));
    const token = m[1];
    if (token.startsWith('`') && token.endsWith('`')) {
      parts.push(<CODE key={key++}>{token.slice(1, -1)}</CODE>);
    } else if (token.startsWith('**') && token.endsWith('**')) {
      parts.push(<STRONG key={key++}>{token.slice(2, -2)}</STRONG>);
    }
    lastIdx = m.index + m[0].length;
  }
  if (lastIdx < text.length) parts.push(text.slice(lastIdx));
  return parts.length === 1 && typeof parts[0] === 'string' ? parts[0] : parts;
}

function parseBody(body: string): { title: string; items: string[] }[] {
  const sections: { title: string; items: string[] }[] = [];
  let current: { title: string; items: string[] } | null = null;

  for (const line of body.split('\n')) {
    const t = line.trim();
    if (!t) continue;
    const h3 = t.match(/^###\s+(.+)/);
    if (h3) { current = { title: h3[1], items: [] }; sections.push(current); continue; }
    const li = t.match(/^-\s+(.+)/);
    if (li && current) { current.items.push(li[1]); }
  }
  return sections;
}

function ReleaseFromGithub({ release }: { release: RawRelease }) {
  const sections = parseBody(release.body);
  return (
    <>
      <SectionTitle>Version {release.version}{release.date ? ` - ${release.date}` : ''}</SectionTitle>
      {sections.map(sec => (
        <React.Fragment key={sec.title}>
          <SubSectionTitle>{sec.title}</SubSectionTitle>
          {sec.items.length > 0 && (
            <UL>{sec.items.map((item, i) => <LI key={i}>{inlineMd(item)}</LI>)}</UL>
          )}
        </React.Fragment>
      ))}
    </>
  );
}

const ReleaseNotesPage: React.FC<ToolProps> = ({ trackLocalEvent }) => {
  const { uiMode } = useTheme();
  const { raw, loading } = useGithubReleases();
  const notes = useMemo<ReleaseNoteItem[]>(() => {
    if (raw.length > 0) {
      return raw.map(r => ({
        version: r.version,
        content: <ReleaseFromGithub release={r} />,
      }));
    }
    return staticNotes;
  }, [raw]);

  useEffect(() => {
    if (trackLocalEvent) {
      trackLocalEvent('Navigation', 'viewedPage', 'ReleaseNotes');
    }
  }, [trackLocalEvent]);

  const containerClass = uiMode === 'classic'
    ? 'w-full text-gray-900 dark:text-white pb-20 px-4 animate-fadeIn'
    : 'w-full max-w-4xl mx-auto glass-card p-6 md:p-12 border-white/10 shadow-2xl transition-all duration-500 animate-fadeIn relative overflow-hidden';

  const headerContent = uiMode === 'classic' ? (
    <>
      <h1 className="text-2xl md:text-3xl font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-tight">Updates</h1>
      <p className="mt-3 text-sm font-medium text-gray-700 dark:text-gray-300 max-w-3xl mx-auto text-center">Track the evolution of the Music AI Multi-Tool Hub</p>
    </>
  ) : (
    <>
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/5 blur-[120px] pointer-events-none"></div>
      <header className="mb-14 text-center pt-8 px-4 relative z-10">
        <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none italic mb-4 text-gradient-animated">Updates</h1>
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500 dark:text-gray-400 max-w-xl mx-auto opacity-70">The cinematic logs of our evolving neural infrastructure</p>
      </header>
    </>
  );

  const mainClass = uiMode === 'classic' ? 'space-y-8' : 'text-gray-700 dark:text-gray-300 leading-relaxed relative z-10';
  const cardClass = uiMode === 'classic'
    ? 'glass-card p-6 md:p-10 border border-gray-100 dark:border-gray-800 rounded-md bg-gray-50/50 dark:bg-gray-800/20 shadow-sm'
    : 'mb-12 last:mb-0 bg-white/5 dark:bg-black/20 rounded-3xl p-8 border border-white/5 hover:border-emerald-500/20 transition-all duration-300';

  return (
    <div className={containerClass}>
      {headerContent}
      <main className={mainClass}>
        {loading ? (
          <div className="flex justify-center py-12"><Spinner size="w-10 h-10" /></div>
        ) : (
          notes.map((note) => (
            <div key={note.version} className={cardClass}>{note.content}</div>
          ))
        )}
      </main>
      <footer className={uiMode === 'classic'
        ? 'mt-16 pt-8 border-t border-gray-100 dark:border-gray-800 text-center'
        : 'mt-16 pt-8 border-t border-white/10 text-center relative z-10'}>
        <p className={uiMode === 'classic' ? 'text-sm text-gray-500' : 'text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 dark:text-gray-400 opacity-40'}>
          Music AI Multi-Tool Hub &copy; {new Date().getFullYear()}{uiMode === 'architect' ? ' • Neutral Network Established 2024' : ''}
        </p>
      </footer>
    </div>
  );
};

export default ReleaseNotesPage;
