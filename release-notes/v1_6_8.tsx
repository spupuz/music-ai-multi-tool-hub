// release-notes/v1_6_8.tsx
import React from 'react';
import { P, UL, LI, SectionTitle, SubSectionTitle, STRONG, CODE } from '../components/ReleaseNoteElements';

export const ReleaseNote_1_6_8 = () => {
  return (
    <section id="version-1.6.8">
      <SectionTitle>Version 1.6.8 - SparkTune Generator Supercharge!</SectionTitle>
      <P>This update significantly revamps the "SparkTune Challenge Generator" for a more powerful, flexible, and engaging user experience.</P>
      <SubSectionTitle>SparkTune Challenge Generator Enhancements</SubSectionTitle>
      <UL>
        <LI><STRONG>Full English Interface:</STRONG> All UI labels, placeholders, button texts, and tooltips are now in English.</LI>
        <LI><STRONG>Engaging English Posts:</STRONG> Generated Discord posts and memorandum messages are now crafted in fun, expanded, and inviting English, complete with more emojis to boost community involvement.</LI>
        <LI><STRONG>"Audio Sample Link":</STRONG> The field previously for submission uploads has been repurposed and renamed to "Audio Sample Link". It's now optional and intended for providing a URL to an audio sample (e.g., MP3, Soundcloud, YouTube audio) as inspiration or reference for the challenge's vibe.</LI>
        <LI><STRONG>New "Additional Details / Rules" Field:</STRONG> A large, optional textarea has been added, allowing organizers to include any extra information, specific rules, or guidelines for their challenge. This section is clearly labeled in the generated post.</LI>
        <LI><STRONG>Enlarged Chorus/Lyric Input:</STRONG> The "Specific Chorus/Lyric Part" field is now a larger textarea to accommodate more extensive thematic or lyrical requirements.</LI>
        <LI><STRONG>Dynamic Post Content:</STRONG> Generated Discord posts and memorandums now intelligently omit sections if their corresponding input fields are left empty (e.g., if no Suno Sample Link or Audio Sample Link is provided, those sections won't appear). This makes posts cleaner and more focused.</LI>
        <LI><STRONG>Comprehensive Reminder Messages:</STRONG> The "Post Memorandum" (reminder message) now includes a full recap of the challenge prompt details (Genre, Mood, Instrumentation, Duration, Lyric Part) and any "Additional Details / Rules" set for that challenge, ensuring participants have all key info.</LI>
      </UL>
    </section>
  );
};
