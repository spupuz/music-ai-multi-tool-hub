// release-notes/v1_1_9.tsx
import React from 'react';
import { P, UL, LI, STRONG, SectionTitle, SubSectionTitle } from '../components/ReleaseNoteElements';

export const ReleaseNote_1_1_9 = () => {
  return (
    <section id="version-1.1.9">
      <SectionTitle>Version 1.1.9</SectionTitle>
       <P>This update changed how personalization settings are handled in the Song Deck Picker tool.</P>
      <SubSectionTitle>Song Deck Picker Changes</SubSectionTitle>
      <UL>
        <LI><STRONG>Personalization Non-Persistence:</STRONG> Customizations made to the Song Deck Picker's appearance (title, logo, colors, font) will no longer be saved in local storage and will reset on tool navigation or page reload.</LI>
      </UL>
    </section>
  );
};
