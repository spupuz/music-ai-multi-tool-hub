// release-notes/v1_4_0.tsx
import React from 'react';
import { P, UL, LI, SectionTitle, SubSectionTitle } from '../components/ReleaseNoteElements';

export const ReleaseNote_1_4_0 = () => {
  return (
    <section id="version-1.4.0"> 
      <SectionTitle>Version 1.4.0 - Earlier Major Enhancements</SectionTitle>
      <P>This was a significant feature and documentation update across multiple tools.</P>
      <SubSectionTitle>Suno Song Compliance Checker - Initial Major Features</SubSectionTitle>
      <UL>
        <LI>Initial implementation including batch processing, Gemini API for basic checks, CSV export, save/load URLs, retry for failed URLs, link to Lyric Processor, basic UI enhancements.</LI>
      </UL>
       <SubSectionTitle>Suno User Stats Tool - Initial Trend Enhancements</SubSectionTitle>
      <UL>
        <LI>Initial addition of 7-day and 30-day trends and first pass at data retention policy changes. Clickable covers for overall top songs.</LI>
      </UL>
    </section>
  );
};
