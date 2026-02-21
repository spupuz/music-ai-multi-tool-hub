
// release-notes/v1_9_3.tsx
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

export const ReleaseNote_1_9_3 = () => {
  const { P, UL, LI, CODE, STRONG, SectionTitle, SubSectionTitle } = NoteHelpers;

  return (
    <section id="version-1.9.3">
      <SectionTitle>Version 1.9.3 - Riffusion Integration Across Tools</SectionTitle>
      <P><STRONG>This update expands the capabilities of several tools to integrate with Riffusion, providing more flexibility for creators using different AI music platforms.</STRONG></P>
      
      <SubSectionTitle>Tool Enhancements</SubSectionTitle>
      <UL>
        <LI><STRONG>Music Shuffler:</STRONG> Can now load and play songs from Riffusion URLs, allowing users to create mixed playlists of Suno and Riffusion tracks.</LI>
        <LI><STRONG>Song Cover Art Creator:</STRONG> Now supports loading song info and artwork directly from Riffusion URLs to auto-fill details.</LI>
        <LI><STRONG>Lyric Processor:</STRONG> Can now fetch lyrics, title, and artist information from Riffusion song URLs.</LI>
        <LI><STRONG>MP3 Cutter & Cropper:</STRONG> Now supports loading audio directly from Riffusion song URLs for cropping and editing.</LI>
      </UL>
      
      <SubSectionTitle>Documentation</SubSectionTitle>
      <UL>
        <LI>Updated the <CODE>README.md</CODE> file and the tool descriptions on the <STRONG>About</STRONG> page to reflect the new Riffusion integration in the affected tools.</LI>
      </UL>
    </section>
  );
};
