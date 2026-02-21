// release-notes/v1_7_1.tsx
import React from 'react';
import { P, UL, LI, SectionTitle, SubSectionTitle, STRONG, CODE } from '../components/ReleaseNoteElements';

export const ReleaseNote_1_7_1 = () => {
  return (
    <section id="version-1.7.1">
      <SectionTitle>Version 1.7.1 - Hub Revamp: Categorization, New Tools & Major Enhancements</SectionTitle>
      <P><STRONG>This version marks a significant revamp of the Hub, introducing better organization, new interactive tools, and substantial improvements across existing features.</STRONG></P>
      
      <SubSectionTitle>Key Changes & New Features</SubSectionTitle>
      <UL>
        <LI><STRONG>Release Notes Refactor:</STRONG> The Release Notes page itself has been restructured. Version updates are now managed in separate files for better maintainability and easier navigation of past changes. The date has been removed from individual release note titles for a cleaner look.</LI>
        <LI><STRONG>New Tool - Magic Spin Wheel:</STRONG> Introduced the "Magic Spin Wheel," a highly customizable visual spinning wheel. Configure activities, master weights, number of wheel segments (2-12), and assign specific "wheel weights" to activities. The sum of wheel weights must match the segment count. Includes save/load for setups and full JSON import/export of configurations.</LI>
        <LI><STRONG>Tool Categorization & Navigation:</STRONG>
            <UL>
                <LI>Tools in the sidebar are now grouped by category (e.g., "Suno Specific Tools", "Creative AI & Content Tools") for improved and more intuitive navigation.</LI>
                <LI>The "About This Hub" page's "Meet the Tools" section now also reflects this categorization.</LI>
                <LI>The "Usage Stats" page now filters out "App & Info" category tools from the popularity chart for a more focused view on functional tool usage.</LI>
            </UL>
        </LI>
        <LI><STRONG>Song Cover Art Creator - Art Style Presets:</STRONG> You can now save and quickly load combinations of text appearance, image filter, and overlay property settings as named "Art Style Presets". Includes import/export functionality for your preset collections via JSON.</LI>
        <LI><STRONG>Song Deck Picker - Themes & Config Export/Import:</STRONG>
            <UL>
                <LI>Added "Savable Deck Themes" allowing users to save and load complete configurations including song lists, bonus artists, and all UI personalization settings.</LI>
                <LI>Implemented JSON import/export for the current deck's entire configuration (song inputs & UI settings).</LI>
            </UL>
        </LI>
        <LI><STRONG>Suno Music Player Enhancement:</STRONG> Added clickable links from the currently playing song's cover art and title in the player to the respective Suno song and creator pages on Suno.com.</LI>
        <LI><STRONG>Suno User Stats Chart Height Fix:</STRONG> Increased the minimum height of charts in the Suno User Stats tool to improve the visibility of Y-axis labels and bar data, especially those displaying cover art.</LI>
        <LI><STRONG>Lyric Processor Improvement:</STRONG> The Lyric Processor now internally stores and processes raw lyrics more effectively, particularly when interacting with features like line numbering.</LI>
        <LI><STRONG>Data Clearing Enhancement:</STRONG> The "Clear All My Hub Data" function on the Usage Stats page now also clears data for the Suno User Music Shuffler (cached songs/profiles) and the Suno Community Spinner (saved wheel configurations and current setup).</LI>
        <LI><STRONG>Media Session Update:</STRONG> Improved the reliability of OS-level media controls by ensuring the Media Session is consistently updated when the player state changes in the Suno User Music Shuffler.</LI>
      </UL>
      <P>This "Hub Revamp" aims to provide a more organized, feature-rich, and user-friendly experience for all your AI music endeavors!</P>
    </section>
  );
};
