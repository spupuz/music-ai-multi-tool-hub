// release-notes/v1_7_5.tsx
import React from 'react';
import { P, UL, LI, SectionTitle, SubSectionTitle, STRONG, CODE } from '../components/ReleaseNoteElements';

export const ReleaseNote_1_7_5 = () => {
  return (
    <section id="version-1.7.5">
      <SectionTitle>Version 1.7.5 - Expanding the Music Resource Directory</SectionTitle>
      <P><STRONG>This update enriches the "Local Music Resource Directory" with more valuable links and better organization.</STRONG></P>
      
      <SubSectionTitle>Local Music Resource Directory Enhancements</SubSectionTitle>
      <UL>
        <LI><STRONG>New Category - "AI Music Platforms":</STRONG> Added a dedicated category for AI music generation platforms.
            <UL>
                <LI>Added <STRONG>Suno AI</STRONG> (suno.com) - Official website.</LI>
                <LI>Added <STRONG>Riffusion</STRONG> (riffusion.com) - Music creation via stable diffusion.</LI>
            </UL>
        </LI>
        <LI><STRONG>Added to "Creator Resources & Learning Tools":</STRONG>
            <UL>
                <LI>Added <STRONG>AIMAC (AI Music Community)</STRONG> (aimac.info) - Community hub with news, resources, and tutorials.</LI>
                <LI>Added <STRONG>SunoRank (by Cayspekko)</STRONG> (cayspekko.github.io/sunorank/#/) - Community tool for Suno song rankings.</LI>
            </UL>
        </LI>
        <LI><STRONG>Added to "Helpful Music Creator Communities":</STRONG>
            <UL>
                <LI>Added Twitch Stream: <STRONG>Midnight Teemuth</STRONG></LI>
                <LI>Added Twitch Stream: <STRONG>The AI Umbrella</STRONG></LI>
                <LI>Added Twitch Stream: <STRONG>RiffusionAI Official</STRONG></LI>
                <LI>Added Twitch Stream: <STRONG>Harlechryzz</STRONG></LI>
                <LI>Added Twitch Stream: <STRONG>TombstoneLounge (Valdran)</STRONG></LI>
                <LI>Added Twitch Stream: <STRONG>Suno Song Contest</STRONG></LI>
                <LI>Added Twitch Stream: <STRONG>SebsSunoStreams</STRONG></LI>
            </UL>
        </LI>
        <LI><STRONG>Category Reordering:</STRONG> The "AI Music Platforms" category is now positioned appropriately in the sidebar and on the "About" page, usually after "Suno Specific Tools" and before "Creative AI & Content Tools". The display order within the "Local Music Resource Directory" tool itself has also been updated for better flow.</LI>
      </UL>
    </section>
  );
};
