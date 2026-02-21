
// release-notes/v1_8_0.tsx
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

export const ReleaseNote_1_8_0 = () => {
  const { P, UL, LI, CODE, STRONG, SectionTitle, SubSectionTitle } = NoteHelpers;

  return (
    <section id="version-1.8.0">
      <SectionTitle>Version 1.8.0 - New MP3 Cutter & Cropper Tool!</SectionTitle>
      <P><STRONG>This major update introduces the "MP3 Cutter & Cropper" tool, along with associated structural updates and documentation changes.</STRONG></P>
      
      <SubSectionTitle>New Tool: MP3 Cutter & Cropper</SubSectionTitle>
      <UL>
        <LI><STRONG>MP3 Upload & Waveform Display:</STRONG> Users can upload MP3 files. The tool visualizes the audio using the <CODE>wavesurfer.js</CODE> library, showing an interactive waveform.</LI>
        <LI><STRONG>Region Selection:</STRONG>
            <UL>
                <LI>Interactive selection on the waveform using draggable start and end markers, powered by the <CODE>wavesurfer.js</CODE> regions plugin.</LI>
                <LI>Input fields for precise start and end times (format <CODE>MM:SS.mmm</CODE>), synchronized with the waveform selection.</LI>
            </UL>
        </LI>
        <LI><STRONG>Playback Controls:</STRONG> Includes "Play/Pause" for the full track or current selection, "Play Selected Region", "Stop", and a volume control slider.</LI>
        <LI><STRONG>Cropping & Download:</STRONG> Users can crop the selected audio segment. The cropped audio is downloaded as a <STRONG>WAV file</STRONG> to ensure broad compatibility and simplify client-side processing. A note about WAV output is included in the UI.</LI>
        <LI><STRONG>Information Display:</STRONG> Shows uploaded file name, original duration, and the selected region's start, end, and duration.</LI>
        <LI>The tool is categorized under "Creative AI & Content Tools".</LI>
        <LI><STRONG>UI Refinement:</STRONG> The "Upload MP3 File" and "Crop & Download WAV" buttons have been made smaller (padding <CODE>py-1.5 px-3</CODE>, icon size <CODE>w-4 h-4</CODE>) and are now centered on the page for a more compact and focused interface.</LI>
      </UL>

      <SubSectionTitle>Hub Structure & Documentation</SubSectionTitle>
      <UL>
        <LI>Added <CODE>MP3CutterTool.tsx</CODE> and its logic hook <CODE>hooks/useMP3CutterLogic.ts</CODE>.</LI>
        <LI>Updated <CODE>Layout.tsx</CODE> to include the new tool in the tools array, tool ID list, and sidebar navigation.</LI>
        <LI>Added a new MP3 Cutter icon for the sidebar.</LI>
        <LI>Updated <CODE>index.html</CODE> to include <CODE>wavesurfer.js</CODE> (and its regions plugin) from ESM.sh in the import map, along with mappings for the new tool files.</LI>
        <LI>Updated <CODE>README.md</CODE> and the "Meet the Tools" section on the <CODE>AboutPage.tsx</CODE> to include details about the new MP3 Cutter & Cropper tool and mention <CODE>wavesurfer.js</CODE> in the tech stack.</LI>
        <LI>Updated the Privacy Policy on the <CODE>AboutPage.tsx</CODE> to mention that uploaded MP3s for the cutter are processed client-side.</LI>
      </UL>

      <P>This new tool provides a convenient way for users to perform quick audio edits directly within the Hub!</P>
    </section>
  );
};
