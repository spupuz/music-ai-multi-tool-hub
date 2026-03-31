
import React, { useEffect } from 'react';
import type { ToolProps } from '@/Layout';
import { releaseNotes } from '@/data/releaseNotesData';

const ReleaseNotesPage: React.FC<ToolProps> = ({ trackLocalEvent }) => {
  useEffect(() => {
    if (trackLocalEvent) {
      trackLocalEvent('Navigation', 'viewedPage', 'ReleaseNotes');
    }
  }, [trackLocalEvent]);
  
  return (
    <div className="w-full max-w-4xl mx-auto glass-card p-6 md:p-12 border-white/10 shadow-2xl transition-all duration-500 animate-fadeIn relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/5 blur-[120px] pointer-events-none"></div>

      <header className="mb-14 text-center pt-8 px-4 relative z-10">
        <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-emerald-600 dark:text-emerald-500 leading-none italic mb-4">
          Updates
        </h1>
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500 dark:text-gray-400 max-w-xl mx-auto opacity-70">
          The cinematic logs of our evolving neural infrastructure
        </p>
      </header>

      <main className="text-gray-700 dark:text-gray-300 leading-relaxed relative z-10">
        {releaseNotes.map((note) => (
            <div key={note.version} className="mb-12 last:mb-0 bg-white/5 dark:bg-black/20 rounded-3xl p-8 border border-white/5 hover:border-emerald-500/20 transition-all duration-300">
                {note.content}
            </div>
        ))}
      </main>

      <footer className="mt-16 pt-8 border-t border-white/10 text-center relative z-10">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 dark:text-gray-400 opacity-40">
          Music AI Multi-Tool Hub &copy; {new Date().getFullYear()} • Neutral Network Established 2024
        </p>
      </footer>
    </div>
  );
};

export default ReleaseNotesPage;
