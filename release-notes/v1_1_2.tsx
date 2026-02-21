// release-notes/v1_1_2.tsx
import React from 'react';
import { P, UL, LI, CODE, SectionTitle, SubSectionTitle } from '../components/ReleaseNoteElements';

export const ReleaseNote_1_1_2 = () => {
  return (
    <section id="version-1.1.2">
      <SectionTitle>Version 1.1.2</SectionTitle>
       <P>This update introduces a quality-of-life improvement for navigation and ensures audio tools behave correctly when switching tabs.</P>
      <SubSectionTitle>Improvements</SubSectionTitle>
      <UL>
        <LI>Sidebar Navigation: Enabled middle-click (or Ctrl/Cmd+click) on sidebar items to open tools in a new tab. App now handles opening directly to a tool via URL parameter (<CODE>?tool=toolId</CODE>).</LI>
        <LI>Audio Tools: Ensured sounds stop immediately when navigating away from audio-playing tools.</LI>
      </UL>
    </section>
  );
};
