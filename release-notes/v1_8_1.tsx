
// release-notes/v1_8_1.tsx
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

export const ReleaseNote_1_8_1 = () => {
  const { P, UL, LI, CODE, STRONG, SectionTitle, SubSectionTitle } = NoteHelpers;

  return (
    <section id="version-1.8.1">
      <SectionTitle>Version 1.8.1 - MP3 Cutter Enhanced with Suno URL Loading</SectionTitle>
      <P><STRONG>This update enhances the "MP3 Cutter & Cropper" tool, allowing users to load audio directly from Suno song URLs.</STRONG></P>
      
      <SubSectionTitle>MP3 Cutter & Cropper - Suno URL Integration</SubSectionTitle>
      <UL>
        <LI><STRONG>Load from Suno URL:</STRONG> A new input field and "Load from Suno URL" button have been added. Users can now paste either a short (<CODE>/s/...</CODE>) or long (<CODE>/song/...</CODE>) Suno song URL.</LI>
        <LI><STRONG>Automatic Fetch & Load:</STRONG> The tool will:
            <UL>
                <LI>Validate and resolve the Suno URL (handling short URLs via public proxies with progress updates).</LI>
                <LI>Fetch the song details from Suno's API using <CODE>fetchSunoClipById</CODE>.</LI>
                <LI>Load the direct audio MP3 link (<CODE>audio_url</CODE>) into the WaveSurfer waveform display.</LI>
                <LI>Update the displayed file name to the fetched song's title.</LI>
            </UL>
        </LI>
        <LI><STRONG>Progress Messages:</STRONG> Clear progress messages (e.g., "Resolving URL...", "Fetching song data...", "Loading audio...") are displayed during the process.</LI>
        <LI><STRONG>Seamless Editing:</STRONG> All existing waveform interaction, region selection, playback controls, cropping, and WAV download features work seamlessly with audio loaded from Suno URLs.</LI>
        <LI>The option to upload an MP3 file directly remains available.</LI>
      </UL>
      <P>This enhancement streamlines the workflow for users who want to quickly edit songs from Suno without needing to download them first.</P>
    </section>
  );
};
