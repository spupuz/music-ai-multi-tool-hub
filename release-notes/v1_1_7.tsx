// release-notes/v1_1_7.tsx
import React from 'react';
import { P, UL, LI, SectionTitle, SubSectionTitle } from '../components/ReleaseNoteElements';

export const ReleaseNote_1_1_7 = () => {
  return (
    <section id="version-1.1.7">
      <SectionTitle>Version 1.1.7</SectionTitle>
       <P>This update significantly improves the searchability of the Music Theory Wiki.</P>
      <SubSectionTitle>Improvements</SubSectionTitle>
      <UL>
        <LI>Music Theory Wiki: Enhanced search to include matching terms within the full content of wiki topics, in addition to titles and keywords.</LI>
      </UL>
    </section>
  );
};
