
// release-notes/v1_8_3.tsx
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

export const ReleaseNote_1_8_3 = () => {
  const { P, UL, LI, CODE, STRONG, SectionTitle, SubSectionTitle } = NoteHelpers;

  return (
    <section id="version-1.8.3">
      <SectionTitle>Version 1.8.3 - MP3 Cutter UI & Special Mention</SectionTitle>
      <P><STRONG>This patch enhances the MP3 Cutter's UI and adds a new special mention.</STRONG></P>
      
      <SubSectionTitle>MP3 Cutter & Cropper</SubSectionTitle>
      <UL>
        <LI><STRONG>Disclaimer Size Increase:</STRONG> The copyright disclaimer text size has been increased from <CODE>text-xs</CODE> to <CODE>text-sm</CODE>, and padding around it increased from <CODE>p-2</CODE> to <CODE>p-3</CODE> for improved readability.</LI>
        <LI><STRONG>File Name Display:</STRONG> The name of the uploaded MP3 or loaded Suno song title is now displayed as separate, larger text (<CODE>text-lg font-semibold</CODE>) below the "Upload MP3 File" button, rather than replacing the button's text. This provides clearer feedback on the current audio loaded.</LI>
      </UL>

      <SubSectionTitle>Special Mentions</SubSectionTitle>
      <UL>
        <LI>Added a special mention for <STRONG>FeroPub</STRONG> on the "Special Mentions" page for providing the idea for the MP3 Cutter & Cropper tool.</LI>
      </UL>
    </section>
  );
};
