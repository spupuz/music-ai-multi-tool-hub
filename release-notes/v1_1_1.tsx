// release-notes/v1_1_1.tsx
import React from 'react';
import { P, UL, LI, SectionTitle, SubSectionTitle } from '../components/ReleaseNoteElements';

export const ReleaseNote_1_1_1 = () => {
  return (
    <section id="version-1.1.1">
      <SectionTitle>Version 1.1.1</SectionTitle>
       <P>This patch addresses layout issues in the Suno Music Shuffler tool on mobile devices.</P>
      <SubSectionTitle>Bug Fixes</SubSectionTitle>
      <UL>
        <LI>Suno Music Shuffler: Improved layout for Suno user profile info and current song display to prevent overflow on smaller screens.</LI>
      </UL>
    </section>
  );
};
