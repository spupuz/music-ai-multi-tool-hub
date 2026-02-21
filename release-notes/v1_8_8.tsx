
// release-notes/v1_8_8.tsx
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

export const ReleaseNote_1_8_8 = () => {
  const { P, UL, LI, CODE, STRONG, SectionTitle, SubSectionTitle } = NoteHelpers;

  return (
    <section id="version-1.8.8">
      <SectionTitle>Version 1.8.8 - Suno Shuffler UI & Playlist Control</SectionTitle>
      <P><STRONG>This update addresses minor UI issues and adds a key playlist management feature to the Suno Music Shuffler.</STRONG></P>
      
      <SubSectionTitle>Suno Music Shuffler Enhancements</SubSectionTitle>
      <UL>
        <LI><STRONG>Example URL Text Overflow Fix:</STRONG> The example custom format URL string in the Shuffler's header (previously <CODE>https://suno.com/song/xyz,https://example.com/custom.mp3</CODE>) was shortened to <CODE>suno.com/id, audio.mp3</CODE>. This prevents the text from overflowing its container on mobile devices and improves readability.</LI>
        <LI><STRONG>Remove Song from Playlist:</STRONG> Users can now remove individual songs from the currently active playlist.
            <UL>
                <LI>A "trash can" icon button has been added next to each song item in the playlist queue.</LI>
                <LI>Clicking this button removes the song from the current play queue, the original fetched order (if it's the basis for the current queue), and the playback history.</LI>
                <LI>If the currently playing song is removed, playback will stop.</LI>
                <LI>For "Custom List" types, removing a song also removes it from the underlying <CODE>originalSongsList</CODE>, making the removal persistent for that custom list session.</LI>
            </UL>
        </LI>
      </UL>
      <P>These changes improve the usability and control within the Suno Music Shuffler.</P>
    </section>
  );
};
