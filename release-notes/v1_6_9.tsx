// release-notes/v1_6_9.tsx
import React from 'react';
import { P, UL, LI, SectionTitle, SubSectionTitle, STRONG, CODE } from '../components/ReleaseNoteElements';

export const ReleaseNote_1_6_9 = () => {
  return (
    <section id="version-1.6.9">
      <SectionTitle>Version 1.6.9 - Release Notes Refactor & Chord Progression Stability</SectionTitle>
      <P><STRONG>Architectural Improvement:</STRONG> The Release Notes page has been refactored for better maintainability and organization. Daily/version updates are now managed in separate files, making it easier to add new notes and navigate past changes.</P>
      
      <SubSectionTitle>Chord Progression Generator</SubSectionTitle>
      <UL>
          <LI><STRONG>Recording Stability:</STRONG> Fixed an issue where the recorded chord progression could be lost when finishing a recording session. The tool now reliably preserves the user-clicked sequence if no other generation parameters (like root note or mode) have been changed after starting the recording.</LI>
      </UL>
    </section>
  );
};
