// release-notes/v1_7_4.tsx
import React from 'react';
import { P, UL, LI, SectionTitle, SubSectionTitle, STRONG, CODE } from '../components/ReleaseNoteElements';

export const ReleaseNote_1_7_4 = () => {
  return (
    <section id="version-1.7.4">
      <SectionTitle>Version 1.7.4 - Unlock Your Creator Potential!</SectionTitle>
      <P><STRONG>This update introduces a brand new tool aimed at centralizing valuable resources for music creators, and reorganizes the tool categories for better discoverability.</STRONG></P>
      
      <SubSectionTitle>New Tool: Local Music Resource Directory</SubSectionTitle>
      <UL>
        <LI><STRONG>Curated Resource Hub:</STRONG> Access a developer-managed list of categorized links to external websites and resources useful for music creation.</LI>
        <LI><STRONG>Categories Include:</STRONG>
            <UL>
                <LI>Royalty-Free Samples & Loops (Legal Sources)</LI>
                <LI>Public Domain Sound Effects</LI>
                <LI>Online Music Theory Guides</LI>
                <LI>DAW & Production Tutorials (Key YouTube Channels/Playlists)</LI>
                <LI>Helpful Music Creator Communities/Forums</LI>
                <LI>Free/Open-Source VST Instruments & Effects</LI>
            </UL>
        </LI>
        <LI><STRONG>Features:</STRONG> Each resource includes a brief description. The directory is searchable by keywords and filterable by category, making it easy to find what you need.</LI>
        <LI><STRONG>Benefit:</STRONG> Provides a trusted, centralized starting point, saving creators time and promoting good practices for finding tools, learning materials, and legal assets.</LI>
      </UL>
      
      <SubSectionTitle>Hub Organization</SubSectionTitle>
      <UL>
        <LI><STRONG>New Sidebar Category - "Creator Resources & Learning":</STRONG> The "Music Theory Wiki" and the new "Local Music Resource Directory" are now grouped under this category for easier access to learning materials and external resources.</LI>
        <LI>The order of categories in the sidebar and on the "About" page has been slightly adjusted to accommodate this new grouping.</LI>
      </UL>
    </section>
  );
};
