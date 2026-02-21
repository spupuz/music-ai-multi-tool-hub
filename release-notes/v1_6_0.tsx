// release-notes/v1_6_0.tsx
import React from 'react';
import { P, UL, LI, SectionTitle, SubSectionTitle, CODE, STRONG } from '../components/ReleaseNoteElements';

export const ReleaseNote_1_6_0 = () => {
  return (
    <section id="version-1.6.0">
      <SectionTitle>Version 1.6.0 - Advanced Stats & Compliance Refinements</SectionTitle>
      <P>This version introduces new analytical capabilities to the Suno User Stats tool and further refines the Suno Song Compliance Checker with operational security.</P>
      
      <SubSectionTitle>Suno User Stats Tool - Advanced Follower Metrics & Data Policy Update</SubSectionTitle>
      <UL>
        <LI><STRONG>Follower Growth Rate:</STRONG> New display cards show "Follower Growth (7d)" and "Follower Growth (30d)" percentages, calculated against historical data.</LI>
        <LI><STRONG>Data Retention Policy Update:</STRONG> Historical data for both profile stats and individual song interactions is now retained for the last <STRONG>30 calendar days</STRONG> from the fetch time (instead of a fixed number of entries). This makes the 7-day and 30-day trend analyses more accurate and reflective of actual calendar periods.</LI>
      </UL>

      <SubSectionTitle>Suno Song Compliance Checker - Operational Security</SubSectionTitle>
      <UL>
        <LI><STRONG>Password Protection:</STRONG> The AI-driven compliance check functionality (language and content rating analysis) is now gated by a password field. This is an operational measure intended for specific committee usage, with a disclaimer about it not being a high-security feature.</LI>
        <LI><STRONG>API Key Management:</STRONG> Reaffirmed that the Google Gemini API key must be provided via the <CODE>process.env.API_KEY</CODE> environment variable. Hardcoding keys into the client-side application is not supported for security reasons.</LI>
        <LI><STRONG>HugChat Integration Note:</STRONG> Clarified that direct integration of Python-based <CODE>hugchat</CODE> is not feasible in the current client-side architecture. The tool continues to use Google Gemini API for AI analysis.</LI>
      </UL>

      <SubSectionTitle>Documentation</SubSectionTitle>
      <UL>
        <LI><STRONG>Privacy Policy (About Page):</STRONG> Updated to reflect Gemini API usage for song compliance checks.</LI>
      </UL>
    </section>
  );
};
