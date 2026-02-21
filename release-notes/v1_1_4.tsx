// release-notes/v1_1_4.tsx
import React from 'react';
import { P, UL, LI, SectionTitle, SubSectionTitle } from '../components/ReleaseNoteElements';

export const ReleaseNote_1_1_4 = () => {
  return (
    <section id="version-1.1.4">
      <SectionTitle>Version 1.1.4</SectionTitle>
       <P>This update adds further personalization to the Song Deck Picker.</P>
      <SubSectionTitle>New Features</SubSectionTitle>
      <UL>
        <LI>Song Deck Picker: Added a logo size selection dropdown (Tiny to X-Large).</LI>
      </UL>
    </section>
  );
};
