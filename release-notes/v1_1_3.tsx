// release-notes/v1_1_3.tsx
import React from 'react';
import { P, UL, LI, SectionTitle, SubSectionTitle } from '../components/ReleaseNoteElements';

export const ReleaseNote_1_1_3 = () => {
  return (
    <section id="version-1.1.3">
      <SectionTitle>Version 1.1.3</SectionTitle>
       <P>This update enhances the Song Deck Picker tool with personalization options.</P>
      <SubSectionTitle>New Features</SubSectionTitle>
      <UL>
        <LI>Song Deck Picker: Added ability to upload a custom logo and set a custom title for the tool page.</LI>
      </UL>
    </section>
  );
};
