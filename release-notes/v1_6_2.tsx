// release-notes/v1_6_2.tsx
import React from 'react';
import { P, UL, LI, SectionTitle, SubSectionTitle, STRONG, CODE } from '../components/ReleaseNoteElements';

export const ReleaseNote_1_6_2 = () => {
  return (
    <section id="version-1.6.2">
      <SectionTitle>Version 1.6.2 - Refined Song Trend Logic</SectionTitle>
      <P>This minor update refines the logic for calculating song trend data (7-day and 30-day) in the Suno User Stats tool, ensuring more accurate insights especially when exact historical data points are not available.</P>
      <SubSectionTitle>Suno User Stats Tool</SubSectionTitle>
      <UL>
        <LI><STRONG>Improved Baseline Selection for Trends:</STRONG> The <CODE>calculateIncreaseForPeriod</CODE> function now more intelligently selects a historical baseline for song play/upvote trend calculations. If an exact 7/30 day old data point isn't found, it uses the oldest available snapshot within the period. If the song was created within the period and only has one data point (the most recent one), a zero baseline from the time of creation is assumed. This leads to more representative trend data.</LI>
      </UL>
    </section>
  );
};
