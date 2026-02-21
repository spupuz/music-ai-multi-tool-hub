// release-notes/v1_1_0.tsx
import React from 'react';
import { P, UL, LI, SectionTitle, SubSectionTitle } from '../components/ReleaseNoteElements';

export const ReleaseNote_1_1_0 = () => {
  return (
    <section id="version-1.1.0">
      <SectionTitle>Version 1.1.0</SectionTitle>
      <P>This update focuses on enhancing community interaction and providing better transparency about app updates.</P>
      <SubSectionTitle>New Features</SubSectionTitle>
      <UL>
        <LI>Added this "App Version & Release Notes" page.</LI>
        <LI>Integrated a new community feedback board (Fiddo).</LI>
      </UL>
    </section>
  );
};
