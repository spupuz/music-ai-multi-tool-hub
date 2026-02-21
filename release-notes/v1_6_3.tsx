// release-notes/v1_6_3.tsx
import React from 'react';
import { P, UL, LI, SectionTitle, SubSectionTitle, STRONG, CODE } from '../components/ReleaseNoteElements';

export const ReleaseNote_1_6_3 = () => {
  return (
    <section id="version-1.6.3">
      <SectionTitle>Version 1.6.3 - Dynamic Y-Axis for Profile Trends</SectionTitle>
      <P>This update enhances the visibility of data trends in the Suno User Stats tool.</P>
      <SubSectionTitle>Suno User Stats Tool</SubSectionTitle>
      <UL>
        <LI><STRONG>Dynamic Y-Axis Scaling for Profile Trends:</STRONG> The "Upvotes Trend (Per Update)", "Plays Trend (Per Update)", and "Followers Trend (Per Update)" charts now feature dynamic Y-axis scaling. Instead of always starting at zero, the axis adapts to the data's minimum and maximum values with appropriate padding. This makes smaller fluctuations and trends more apparent, especially when dealing with large total counts.</LI>
      </UL>
    </section>
  );
};
