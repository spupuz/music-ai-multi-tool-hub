// release-notes/v1_6_7.tsx
import React from 'react';
import { P, UL, LI, SectionTitle, SubSectionTitle, STRONG, CODE } from '../components/ReleaseNoteElements';

export const ReleaseNote_1_6_7 = () => {
  return (
    <section id="version-1.6.7">
      <SectionTitle>Version 1.6.7 - Chart Layout Stability</SectionTitle>
      <P>This update addresses a lingering issue with chart height for components displaying cover art.</P>
      <SubSectionTitle>Bug Fixes & Refinements</SubSectionTitle>
      <UL>
        <LI><STRONG>Chart Height Stability:</STRONG> Resolved an issue where charts with cover art (specifically <CODE>SongTrendChart</CODE> and <CODE>TopSongsChart</CODE>) could sometimes grow uncontrollably in height. This was fixed by removing <CODE>h-full</CODE> from their root elements and ensuring the internal canvas wrapper maintains <CODE>min-h-0</CODE> to correctly shrink within its flex container. This makes the chart containers, which use a dynamic <CODE>min-height</CODE>, more stable and predictable in their vertical sizing, especially when accommodating wrapping cover art.</LI>
      </UL>
    </section>
  );
};
