// release-notes/v1_6_4.tsx
import React from 'react';
import { P, UL, LI, SectionTitle, SubSectionTitle, STRONG, CODE } from '../components/ReleaseNoteElements';

export const ReleaseNote_1_6_4 = () => {
  return (
    <section id="version-1.6.4">
      <SectionTitle>Version 1.6.4 - Enhanced Readability for Song Deck Picker</SectionTitle>
      <P>This update improves the visual accessibility of the Song Deck Picker tool by ensuring text is always readable against card backgrounds.</P>
      <SubSectionTitle>Song Deck Picker</SubSectionTitle>
      <UL>
        <LI><STRONG>Dynamic Text Color Adjustment:</STRONG> The song title, artist name, and "Listen" link on song cards now dynamically adjust their color to ensure sufficient contrast against the card's background (either the card's specific color or the default card background set in personalization).</LI>
        <LI>If the personalized text color (set by the user) doesn't meet WCAG 4.5:1 contrast ratio with the effective background, the text will automatically switch to pure black (<CODE>#000000</CODE>) or pure white (<CODE>#FFFFFF</CODE>) for optimal readability.</LI>
        <LI>This ensures that even if a user selects a custom card color and personalized text color that would normally result in poor readability, the tool will automatically adjust the text color for clarity.</LI>
      </UL>
    </section>
  );
};
