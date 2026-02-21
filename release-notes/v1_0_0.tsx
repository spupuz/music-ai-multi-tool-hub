// release-notes/v1_0_0.tsx
import React from 'react';
import { P, UL, LI, SectionTitle, SubSectionTitle } from '../components/ReleaseNoteElements';

export const ReleaseNote_1_0_0 = () => {
  return (
    <section id="version-1.0.0">
      <SectionTitle>Version 1.0.0</SectionTitle>
      <P>The initial launch of the Music AI Multi-Tool Hub! 🎉</P>
      <SubSectionTitle>Features Included at Launch</SubSectionTitle>
      <UL>
        <LI>Suno User Music Shuffler, Song Cover Art Creator, Lyric Processor, Music Style Generator, Creative Concept Blender, Chord Progression Generator, Scale & Chord Viewer, Song Deck Picker, Music Theory Wiki, BPM Tapper, Metronome, Usage Stats.</LI>
      </UL>
    </section>
  );
};
