// release-notes/v1_7_3.tsx
import React from 'react';
import { P, UL, LI, SectionTitle, SubSectionTitle, STRONG, CODE } from '../components/ReleaseNoteElements';

export const ReleaseNote_1_7_3 = () => {
  return (
    <section id="version-1.7.3">
      <SectionTitle>Version 1.7.3 - Song Table Usability Boost</SectionTitle>
      <P><STRONG>This update refines the "Detailed Song Performance Table" in the Suno User Stats tool for improved usability and sorting accuracy.</STRONG></P>
      
      <SubSectionTitle>Suno User Stats Tool - Detailed Song Performance Table</SubSectionTitle>
      <UL>
        <LI><STRONG>Scrollable Table Body:</STRONG> The table now has a maximum height (approx. 70vh, showing around 15-20 rows), with the table body becoming scrollable if more songs are present. This prevents the table from taking up excessive page space.</LI>
        <LI><STRONG>Sticky Table Header:</STRONG> The table header (<CODE>&lt;thead&gt;</CODE>) is now sticky, remaining visible at the top as you scroll through the song list, making it easier to understand column data for longer lists.</LI>
        <LI><STRONG>Sorting Logic Fixed:</STRONG> The client-side sorting functionality for all columns has been fixed and improved. Nullable numeric columns (like Engagement Ratio and Play/Upvote Deltas) are now handled correctly, ensuring <CODE>N/A</CODE> or new entries sort consistently to one end.</LI>
      </UL>
    </section>
  );
};
