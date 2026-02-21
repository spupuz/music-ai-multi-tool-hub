// release-notes/v1_7_2.tsx
import React from 'react';
import { P, UL, LI, SectionTitle, SubSectionTitle, STRONG, CODE } from '../components/ReleaseNoteElements';

export const ReleaseNote_1_7_2 = () => {
  return (
    <section id="version-1.7.2">
      <SectionTitle>Version 1.7.2 - Enhanced Follower Growth Insights</SectionTitle>
      <P><STRONG>This update introduces more detailed follower growth statistics in the Suno User Stats tool.</STRONG></P>
      
      <SubSectionTitle>Suno User Stats Tool Enhancements</SubSectionTitle>
      <UL>
        <LI><STRONG>Absolute Follower Growth Display:</STRONG> Alongside the existing percentage-based follower growth for 7-day and 30-day periods, the tool now also displays the <STRONG>absolute number</STRONG> of followers gained or lost during these periods (e.g., "+150 followers" or "-20 followers").</LI>
        <LI>This provides a clearer, more direct understanding of follower changes, complementing the percentage view.</LI>
        <LI>The new absolute figures are shown in the same "Follower Growth (7d)" and "Follower Growth (30d)" stat cards as a description under the percentage.</LI>
      </UL>
    </section>
  );
};
