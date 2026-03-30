
import React, { useEffect } from 'react';
import type { ToolProps } from '../../Layout';
import { releaseNotes } from '../../data/releaseNotesData';

const ReleaseNotesPage: React.FC<ToolProps> = ({ trackLocalEvent }) => {
  useEffect(() => {
    if (trackLocalEvent) {
      trackLocalEvent('Navigation', 'viewedPage', 'ReleaseNotes');
    }
  }, [trackLocalEvent]);
  
  return (
    <div className="w-full max-w-4xl mx-auto bg-white dark:bg-gray-900 shadow-2xl rounded-lg p-6 md:p-10 border-2 border-green-500 dark:border-green-600 transition-colors duration-300">
      <header className="mb-10 text-center">
        <h1 className="text-5xl font-extrabold text-green-600 dark:text-green-400 tracking-tight">
          Release Notes
        </h1>
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
          See what's new, improved, and fixed in the Music AI Multi-Tool Hub.
        </p>
      </header>

      <main className="text-gray-700 dark:text-gray-300 leading-relaxed">
        {releaseNotes.map((note) => (
            <React.Fragment key={note.version}>
                {note.content}
            </React.Fragment>
        ))}
      </main>

      <footer className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700 text-center">
        <p className="text-md text-gray-500 dark:text-gray-400">
          Music AI Multi-Tool Hub &copy; {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
};

export default ReleaseNotesPage;
