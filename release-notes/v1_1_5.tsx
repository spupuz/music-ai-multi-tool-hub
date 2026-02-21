// release-notes/v1_1_5.tsx
import React from 'react';
import { P, UL, LI, SectionTitle, SubSectionTitle } from '../components/ReleaseNoteElements';

export const ReleaseNote_1_1_5 = () => {
  return (
    <section id="version-1.1.5">
      <SectionTitle>Version 1.1.5</SectionTitle>
       <P>This update provides more flexibility for the custom logo in the Song Deck Picker.</P>
      <SubSectionTitle>New Features</SubSectionTitle>
      <UL>
        <LI>Song Deck Picker: Added "XX-Large (240px)" and "Giant (320px)" to the logo size options.</LI>
      </UL>
    </section>
  );
};
