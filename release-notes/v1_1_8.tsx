// release-notes/v1_1_8.tsx
import React from 'react';
import { P, UL, LI, CODE, STRONG, SectionTitle, SubSectionTitle } from '../components/ReleaseNoteElements';

export const ReleaseNote_1_1_8 = () => {
  return (
    <section id="version-1.1.8">
      <SectionTitle>Version 1.1.8</SectionTitle>
       <P>This update significantly enhanced the Song Deck Picker's flexibility for importing and exporting song data.</P>
      <SubSectionTitle>Song Deck Picker Enhancements</SubSectionTitle>
      <UL>
        <LI><STRONG>New Custom Input Format:</STRONG> Accepts a detailed pipe-separated format (<CODE>ArtistName: ... | Title: ... | ...</CODE>) for manual song entries alongside Suno URL support.</LI>
        <LI><STRONG>Unified Export Format:</STRONG> Both "Unlogged Deck" and "Logged Songs" now use the same pipe-separated format for export to TXT or Clipboard.</LI>
      </UL>
    </section>
  );
};
