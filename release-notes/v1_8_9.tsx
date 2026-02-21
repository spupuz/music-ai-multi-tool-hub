
// release-notes/v1_8_9.tsx
import React from 'react';

const NoteHelpers = {
    P: ({ children, className = "" }: {children: React.ReactNode; className?: string}) => <p className={`mb-3 leading-relaxed text-gray-700 dark:text-gray-300 ${className}`}>{children}</p>,
    UL: ({ children }: {children: React.ReactNode}) => <ul className="list-disc list-inside pl-4 mb-3 space-y-1 text-gray-700 dark:text-gray-300">{children}</ul>,
    LI: ({ children }: {children: React.ReactNode}) => <li>{children}</li>,
    CODE: ({ children }: {children: React.ReactNode}) => <code className="bg-gray-100 dark:bg-gray-700 text-sm text-yellow-800 dark:text-yellow-300 px-1.5 py-0.5 rounded-md font-mono">{children}</code>,
    STRONG: ({ children }: {children: React.ReactNode}) => <strong className="font-semibold text-green-700 dark:text-green-200">{children}</strong>,
    SectionTitle: ({ children, id }: { children: React.ReactNode; id?: string }) => <h2 id={id} className="text-3xl font-bold text-green-600 dark:text-green-400 mt-8 mb-5 border-b-2 border-green-500 dark:border-green-600 pb-2">{children}</h2>,
    SubSectionTitle: ({ children }: {children: React.ReactNode}) => <h3 className="text-xl font-semibold text-green-600 dark:text-green-300 mt-4 mb-2">{children}</h3>
};

export const ReleaseNote_1_8_9 = () => {
  const { P, UL, LI, CODE, STRONG, SectionTitle, SubSectionTitle } = NoteHelpers;

  return (
    <section id="version-1.8.9">
      <SectionTitle>Version 1.8.9 - Lyrics Synchronizer Layout Refinements</SectionTitle>
      <P><STRONG>This update refines the user interface and workflow of the Lyrics Synchronizer tool.</STRONG></P>
      
      <SubSectionTitle>Lyrics Synchronizer Tool Enhancements</SubSectionTitle>
      <UL>
        <LI><STRONG>Player Relocation:</STRONG> The audio player controls (play/pause, seek bar, volume) have been moved. They are now positioned at the end of the "1. Load Audio & Lyrics" section, directly after the audio and lyrics input areas and before the synchronization interface begins. This provides a more logical flow, allowing users to load their audio and immediately access playback controls.</LI>
        <LI><STRONG>Synchronization Section Restructure:</STRONG> The "2. Synchronize Lyrics" section, which includes the scrollable lyrics list, the "Mark Next Line & Advance" button, and export options, has been restructured. It now appears directly below the "1. Load Audio & Lyrics" section in a single-column layout, consolidating all synchronization tasks in one place.</LI>
        <LI><STRONG>Scrollable Lyrics List:</STRONG> The lyrics list within the "Synchronize Lyrics" section is now scrollable and has a defined maximum height. This improvement helps manage long lyric sets more effectively, ensuring the interface remains clean and usable regardless of lyric length.</LI>
      </UL>
      <P>These changes aim to make the lyric synchronization process more intuitive and user-friendly.</P>
    </section>
  );
};
