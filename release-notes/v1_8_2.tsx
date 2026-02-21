
// release-notes/v1_8_2.tsx
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

export const ReleaseNote_1_8_2 = () => {
  const { P, UL, LI, CODE, STRONG, SectionTitle, SubSectionTitle } = NoteHelpers;

  return (
    <section id="version-1.8.2">
      <SectionTitle>Version 1.8.2 - MP3 Cutter Supercharged: Suno Integration & MP3 Export!</SectionTitle>
      <P><STRONG>This update significantly upgrades the "MP3 Cutter & Cropper" tool, adding direct Suno song integration, MP3 export, and a copyright disclaimer.</STRONG></P>
      
      <SubSectionTitle>MP3 Cutter & Cropper Enhancements</SubSectionTitle>
      <UL>
        <LI><STRONG>Suno Song Information Display:</STRONG> When a song is successfully loaded from a Suno URL:
            <UL>
                <LI>The song's <STRONG>cover art</STRONG> is now displayed prominently above the waveform editor.</LI>
                <LI>The <STRONG>artist's name</STRONG> (creator display name/handle) is shown alongside the cover art.</LI>
                <LI>A new <STRONG>"Download Cover Art"</STRONG> button appears, allowing users to easily save the song's artwork.</LI>
            </UL>
        </LI>
        <LI><STRONG>MP3 Output for Cropped Audio:</STRONG>
            <UL>
                <LI>The primary "Crop & Download" functionality now outputs the selected audio segment as an <STRONG>MP3 file</STRONG> instead of WAV. This aligns better with the tool's name and common audio sharing formats.</LI>
                <LI>Client-side MP3 encoding is performed using the <CODE>lamejs</CODE> library (added to <CODE>index.html</CODE> import map).</LI>
                <LI>The download button text and related UI notes have been updated to reflect MP3 output.</LI>
            </UL>
        </LI>
        <LI><STRONG>Copyright Disclaimer:</STRONG> A clear disclaimer has been added to the tool's interface: <CODE>"⚠️ Copyright Disclaimer: This tool is intended for personal, transformative, or fair use of audio material. Users are solely responsible for ensuring they have the necessary rights or permissions to upload, process, and download any copyrighted audio. This tool does not endorse or facilitate copyright infringement."</CODE></LI>
        <LI>The logic hook (<CODE>hooks/useMP3CutterLogic.ts</CODE>) was updated to manage the new Suno metadata, handle cover art download, and implement the MP3 encoding process.</LI>
      </UL>

      <SubSectionTitle>Documentation Updates</SubSectionTitle>
      <UL>
        <LI>The <CODE>AboutPage.tsx</CODE> and <CODE>README.md</CODE> descriptions for the MP3 Cutter tool have been updated to reflect these new features and the use of <CODE>lamejs</CODE>.</LI>
      </UL>
      <P>These enhancements aim to make the MP3 Cutter tool more versatile and informative, especially for users working with audio from Suno, while also reinforcing responsible usage.</P>
    </section>
  );
};
