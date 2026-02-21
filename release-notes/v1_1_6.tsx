// release-notes/v1_1_6.tsx
import React from 'react';
import { P, UL, LI, CODE, SectionTitle, SubSectionTitle } from '../components/ReleaseNoteElements';

export const ReleaseNote_1_1_6 = () => {
  return (
    <section id="version-1.1.6">
      <SectionTitle>Version 1.1.6</SectionTitle>
       <P>This update involves internal code cleanup and refactoring.</P>
      <SubSectionTitle>Improvements</SubSectionTitle>
      <UL>
        <LI>Removed unused <CODE>geminiService.ts</CODE> file and its references from the project to streamline the codebase.</LI>
      </UL>
    </section>
  );
};
