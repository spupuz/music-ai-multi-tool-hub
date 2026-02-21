
// release-notes/v1_9_2.tsx
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

export const ReleaseNote_1_9_2 = () => {
  const { P, UL, LI, CODE, STRONG, SectionTitle, SubSectionTitle } = NoteHelpers;

  return (
    <section id="version-1.9.2">
      <SectionTitle>Version 1.9.2 - MP3 Cutter Now Supports Riffusion URLs</SectionTitle>
      <P><STRONG>This update expands the MP3 Cutter & Cropper's capabilities to load audio directly from Riffusion song URLs.</STRONG></P>
      
      <SubSectionTitle>MP3 Cutter & Cropper Enhancements</SubSectionTitle>
      <UL>
        <LI><STRONG>Riffusion URL Loading:</STRONG> Users can now paste a Riffusion song URL into the "Load from URL" input field.</LI>
        <LI><STRONG>Automatic Data Retrieval:</STRONG> The tool will fetch the Riffusion song's details, including its title, artist, cover art, and audio stream.</LI>
        <LI><STRONG>Integrated Experience:</STRONG> All existing features, such as waveform display, region selection, playback controls, and MP3 cropping/downloading, work seamlessly with audio loaded from Riffusion.</LI>
      </UL>
      <P>This makes it easier than ever to grab and edit clips from your favorite AI music platforms, all in one place.</P>
    </section>
  );
};
