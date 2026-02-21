// release-notes/v1_5_0.tsx
import React from 'react';
import { P, UL, LI, CODE, STRONG, SectionTitle, SubSectionTitle } from '../components/ReleaseNoteElements';

export const ReleaseNote_1_5_0 = () => {
  return (
    <section id="version-1.5.0"> 
      <SectionTitle>Version 1.5.0 - Major Tool Enhancements</SectionTitle>
      <P>This version brought a suite of major enhancements across several key tools, focusing on expanded functionality, improved data analysis, and better user workflow.</P>
      
      <SubSectionTitle>Suno Song Compliance Checker - Full Feature Suite</SubSectionTitle>
      <UL>
        <LI><STRONG>Batch URL Processing:</STRONG> Input multiple Suno song URLs (one per line) for simultaneous checking. Each song gets its own detailed result card.</LI>
        <LI><STRONG>Gemini API for Lyrics Analysis:</STRONG> Migrated lyrics analysis to Google Gemini API for:
            <UL>
                <LI><STRONG>Enhanced Language Identification</STRONG> (including detection of untranslatable/gibberish words with explanations).</LI>
                <LI><STRONG>Selectable Content Rating Standard</STRONG> (G, PG, PG-13, R, Explicit) for appropriateness checks.</LI>
            </UL>
        </LI>
        <LI><STRONG>Editable Title Format Pattern:</STRONG> Customize the regex pattern for title validation using <CODE>&lt;number&gt;</CODE> and <CODE>&lt;country/code&gt;</CODE> placeholders.</LI>
        <LI><STRONG>Enhanced Song Display:</STRONG> Result cards now show cover art, larger title, creator name, audio player, and direct links to the Suno song & creator profile.</LI>
        <LI><STRONG>Country Flag Display:</STRONG> Validated country in title check now displays the national flag emoji.</LI>
        <LI><STRONG>Visual Batch Summary:</STRONG> Get a quick overview of total URLs processed, songs passed all checks, and counts for various issue types.</LI>
        <LI><STRONG>Export to CSV:</STRONG> Download detailed batch results to a CSV file.</LI>
        <LI><STRONG>Save/Load URLs:</STRONG> Save the current list of URLs to a text file and load URLs from a file.</LI>
        <LI><STRONG>Individual URL Retry:</STRONG> Retry processing for specific URLs that failed within a batch.</LI>
        <LI><STRONG>Link to Lyric Processor:</STRONG> Directly send problematic lyrics to the Lyric Processor tool for further editing or analysis.</LI>
        <LI><STRONG>Help Tooltips & UI Refinements:</STRONG> Added tooltips for complex fields and improved overall UI clarity.</LI>
        <LI><STRONG>Distinct Visual Cues:</STRONG> Clearer pass/fail icons (✅/❌) and backgrounds for individual checks.</LI>
      </UL>
      
      <SubSectionTitle>Suno User Stats Tool - Deeper Insights & Trend Analysis</SubSectionTitle>
      <UL>
        <LI><STRONG>New Trend Charts (7 & 30-Day):</STRONG> Added "Top 10 Upvotes/Plays Increase" charts for "Last 7 Days" and "Last 30 Days".</LI>
        <LI><STRONG>Clickable Cover Art (All Trend Charts):</STRONG> Cover art in "Top Increase" charts (Since Last Update, 7-day, 30-day) and "Top Overall Songs" charts are now clickable links.</LI>
      </UL>

      <SubSectionTitle>Lyric Processor Tool</SubSectionTitle>
      <UL>
        <LI><STRONG>Integration with Compliance Checker:</STRONG> Can now receive lyrics pre-filled from the Suno Song Compliance Checker via `localStorage` when the "Process These Lyrics" button is used.</LI>
      </UL>

      <SubSectionTitle>General & Documentation</SubSectionTitle>
      <UL>
        <LI><STRONG>Updated Documentation:</STRONG> All README files (<CODE>README.md</CODE>, <CODE>README_DEPLOYMENT.md</CODE>), the <CODE>AboutPage.tsx</CODE>, and <CODE>StatsPage.tsx</CODE> have been updated to reflect the current toolset, features, API usage (Gemini), and data handling practices.</LI>
        <LI><STRONG>Service Layer Refinement:</STRONG> Functionality previously in `geminiService.ts` is now integrated into `aiAnalysisService.ts`. `csvExportService.ts` was enhanced.</LI>
      </UL>
    </section>
  );
};
