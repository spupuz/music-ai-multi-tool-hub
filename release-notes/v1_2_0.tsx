// release-notes/v1_2_0.tsx
import React from 'react';
import { P, UL, LI, STRONG, SectionTitle, SubSectionTitle } from '../components/ReleaseNoteElements';

export const ReleaseNote_1_2_0 = () => {
  return (
    <section id="version-1.2.0">
      <SectionTitle>Version 1.2.0</SectionTitle>
       <P>This update addressed the Heatmap feature in the Suno User Stats tool and added other stats.</P>
      <SubSectionTitle>Suno User Stats Tool Update</SubSectionTitle>
      <UL>
        <LI><STRONG>Heatmap Feature Removed:</STRONG> The "Song Creation Activity Heatmap" feature was removed due to API limitations.</LI>
        <LI><STRONG>New Aggregated Statistics:</STRONG> Added Average Plays/Upvotes per Song, Engagement Rate, Top 10 Most Played/Upvoted songs overall.</LI>
        <LI><STRONG>New Charts:</STRONG> Creations by Day of Week, Creations by Hour of Day, Top 10 Most Played/Upvoted charts.</LI>
      </UL>
    </section>
  );
};
