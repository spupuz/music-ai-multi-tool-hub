
// release-notes/v1_9_4.tsx
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

export const ReleaseNote_1_9_4 = () => {
  const { P, UL, LI, CODE, STRONG, SectionTitle, SubSectionTitle } = NoteHelpers;

  return (
    <section id="version-1.9.4">
      <SectionTitle>Version 1.9.4 - Song Structure & Lyricist's Power-Up</SectionTitle>
      <P><STRONG>This major update transforms the Song Structure Builder into a powerful lyric writing and versioning tool, and adds highly-requested management features for saving, loading, and sharing your work.</STRONG></P>
      
      <SubSectionTitle>Song Structure Builder Enhancements</SubSectionTitle>
      <UL>
        <LI><STRONG>Line-by-Line Lyric Management:</STRONG> The core of this update. Each block on the timeline now contains a dedicated lyric editor instead of a single notes field.
            <UL>
                <LI>Users can add, delete, and re-order individual lyric lines within each block.</LI>
                <LI>Each line is an editable input field for a streamlined writing experience.</LI>
            </UL>
        </LI>
        <LI><STRONG>Automatic Lyric Version Control:</STRONG>
            <UL>
                <LI>When you finish editing a line (on blur), its previous version is automatically saved to its history.</LI>
                <LI>A history icon appears next to any line with saved versions.</LI>
                <LI>Clicking the history icon opens a modal allowing you to view all previous drafts and revert to any version with a single click.</LI>
            </UL>
        </LI>
        <LI><STRONG>Live Syllable Counting:</STRONG> A real-time syllable counter is displayed at the end of each lyric line, updating instantly as you type to help with rhythm and meter.</LI>
        <LI><STRONG>Repurposed Block Notes:</STRONG> The original "Notes" textarea for each block has been retained but is now intended for general, non-lyrical notes about the section (e.g., "mood shifts to be more intense here", "add harmonies"). These notes are included in the generated prompt.</LI>
        <LI><STRONG>Updated Prompt Generation:</STRONG> The final AI prompt now intelligently combines the block type, general block notes (formatted as comments <CODE>// like this</CODE>), and the structured lyric lines into a clean, ready-to-use format.</LI>
        <LI><STRONG>Data Migration:</STRONG> Existing song structures saved in your browser's local storage (from before this update) will be automatically migrated. The content of the old `notes` field will be split by line and converted into the new lyric line format.</LI>
      </UL>
      
      <SubSectionTitle>Saved Arrangement Management</SubSectionTitle>
        <UL>
            <LI><STRONG>Safe Deletion:</STRONG> Added a delete button for saved arrangements in the "Load" modal. Deletion now requires a 3-click confirmation to prevent accidental loss of work.</LI>
            <LI><STRONG>New Import/Export:</STRONG> Replaced the non-functional JSON import/export for saved arrangements. You can now export your <STRONG>current</STRONG> timeline to a user-friendly <CODE>.txt</CODE> file (matching the AI prompt format) or a structured <CODE>.csv</CODE> file. You can also import from these formats to quickly load a structure.</LI>
        </UL>

      <SubSectionTitle>General Improvements</SubSectionTitle>
      <UL>
        <LI><STRONG>Shared Syllable Counter:</STRONG> The syllable counting logic has been extracted into a shared utility file (<CODE>utils/lyricUtils.ts</CODE>) and is now used by both the Song Structure Builder and the Lyric Processor for consistency.</LI>
      </UL>

      <P>This comprehensive upgrade aims to make the Song Structure Builder an indispensable tool for songwriters, providing the structure of a timeline with the flexibility of a dedicated lyric editor and robust session management.</P>
    </section>
  );
};
