// release-notes/v1_6_5.tsx
import React from 'react';
import { P, UL, LI, SectionTitle, SubSectionTitle, STRONG, CODE } from '../components/ReleaseNoteElements';

export const ReleaseNote_1_6_5 = () => {
  return (
    <section id="version-1.6.5">
      <SectionTitle>Version 1.6.5 - Lyric Processor Power-Ups</SectionTitle>
      <P>This update significantly enhances the Lyric Processor tool with several new features for better editing and analysis.</P>
      <SubSectionTitle>Lyric Processor Tool Enhancements</SubSectionTitle>
      <UL>
        <LI><STRONG>Line Numbering:</STRONG> Added an option (checkbox) to display line numbers next to the lyrics in both the input and output text areas. This is useful for easy reference during collaboration or editing.</LI>
        <LI><STRONG>Case Conversion Buttons:</STRONG> Introduced quick action buttons below the lyrics input area to convert selected text (or all text if no selection) to:
            <UL>
                <LI>UPPERCASE</LI>
                <LI>lowercase</LI>
                <LI>Title Case (Capitalizing The First Letter Of Each Word)</LI>
            </UL>
        </LI>
        <LI><STRONG>Detailed Syllable Output:</STRONG> When using the "COUNT SYLLABLES PER LINE" feature, the output for each line now includes not only the syllable count but also the word count and character count for that specific line (e.g., <CODE>Your line (7 syllables, 3 words, 16 chars)</CODE>).</LI>
      </UL>
    </section>
  );
};
