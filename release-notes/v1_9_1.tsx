
// release-notes/v1_9_1.tsx
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

export const ReleaseNote_1_9_1 = () => {
  const { P, UL, LI, CODE, STRONG, SectionTitle, SubSectionTitle } = NoteHelpers;

  return (
    <section id="version-1.9.1">
      <SectionTitle>Version 1.9.1 - Riffusion Support & Hub Reorganization</SectionTitle>
      <P><STRONG>This update expands the Music Shuffler's capabilities to include Riffusion songs and reorganizes the tool categories for better navigation.</STRONG></P>
      
      <SubSectionTitle>Music Shuffler - Riffusion Integration</SubSectionTitle>
      <UL>
        <LI><STRONG>New Song Source:</STRONG> The shuffler now supports loading songs from <STRONG>Riffusion</STRONG>. You can paste Riffusion song URLs (e.g., <CODE>https://www.riffusion.com/song/...</CODE>) into the input box, one per line.</LI>
        <LI><STRONG>Multi-Platform Playlists:</STRONG> Create custom playlists by mixing Suno URLs, Suno playlists, Suno usernames, and Riffusion URLs all in the same input box.</LI>
        <LI><STRONG>Data Handling:</STRONG> When a Riffusion URL is detected, the tool fetches the song's metadata (title, artist, image) and maps it to the player's format. Note: Since a public Riffusion API is not available, this feature currently uses mock data for demonstration purposes.</LI>
        <LI><STRONG>UI Update:</STRONG> The player's input placeholder now mentions Riffusion URLs, and the underlying logic correctly handles links to Riffusion songs and artists.</LI>
      </UL>

      <SubSectionTitle>Hub Organization</SubSectionTitle>
      <UL>
          <LI><STRONG>New "AI Music Platforms" Category:</STRONG> To better structure the sidebar, a new category has been introduced. The "Music Shuffler", "Suno User Stats", and "Suno Song Compliance" tools have been moved under this new heading.</LI>
          <LI>The order of categories has been updated to place "AI Music Platforms" prominently after the "About" page.</LI>
      </UL>
    </section>
  );
};
