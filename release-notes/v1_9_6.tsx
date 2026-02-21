
// release-notes/v1_9_6.tsx
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

export const ReleaseNote_1_9_6 = () => {
  const { P, UL, LI, CODE, STRONG, SectionTitle, SubSectionTitle } = NoteHelpers;

  return (
    <section id="version-1.9.6">
      <SectionTitle>Version 1.9.6 - Producer.AI Integration & Riffusion Parity</SectionTitle>
      <P><STRONG>This update introduces seamless integration for Producer.AI URLs across the Hub, providing full feature parity with Riffusion and enhancing the multi-platform capabilities of our tools.</STRONG></P>
      
      <SubSectionTitle>Producer.AI URL Support</SubSectionTitle>
      <P>
        The Hub now automatically recognizes and processes URLs from <CODE>producer.ai</CODE>. When you provide a Producer.AI link, the application intelligently extracts the unique song ID and transforms it into the corresponding <CODE>riffusion.com</CODE> URL for data fetching. This allows for a smooth, uninterrupted workflow without needing to manually convert links.
      </P>

      <SubSectionTitle>Updated Tools</SubSectionTitle>
      <P>The following tools have been updated to be fully compliant with Producer.AI URLs:</P>
      <UL>
        <LI><STRONG>Music Shuffler:</STRONG> Load and play songs directly from Producer.AI links within your custom playlists.</LI>
        <LI><STRONG>Song Compliance Checker:</STRONG> Verify song titles, duration, and analyze lyrics from Producer.AI URLs in your batch checks.</LI>
        <LI><STRONG>Song Cover Art Creator:</STRONG> Auto-fill song details and artwork by loading from a Producer.AI URL.</LI>
        <LI><STRONG>MP3 Cutter & Cropper:</STRONG> Load audio for cropping and editing directly from a Producer.AI link.</LI>
        <LI><STRONG>Lyric Processor:</STRONG> Fetch lyrics, title, and artist information from Producer.AI songs.</LI>
        <LI><STRONG>Lyrics Synchronizer:</STRONG> Load audio and lyrics for synchronization using a Producer.AI URL.</LI>
        <LI><STRONG>Song Deck Picker:</STRONG> Include Producer.AI songs in your decks for picking and revealing.</LI>
      </UL>
      <P>This comprehensive integration ensures that creators can work with content from Suno, Riffusion, and now Producer.AI with consistent functionality across the entire toolset.</P>
    </section>
  );
};
