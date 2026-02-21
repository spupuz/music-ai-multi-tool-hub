import React from 'react';
import { P, UL, LI, CODE, STRONG, SectionTitle, SubSectionTitle } from '../components/ReleaseNoteElements';

export interface ReleaseNoteItem {
  version: string;
  content: React.ReactNode;
}

export const releaseNotes: ReleaseNoteItem[] = [
  {
    version: "2.0.0",
    content: (
      <section id="version-2.0.0">
        <SectionTitle>Version 2.0.0 - 2026-02-22</SectionTitle>
        <SubSectionTitle>Added</SubSectionTitle>
        <UL>
          <LI><STRONG>Cloudflare Pages Migration</STRONG>: The Hub is now a pure static site deployed on Cloudflare Pages.</LI>
          <LI><STRONG>Gemini Proxy Worker</STRONG>: Introduced a Cloudflare Worker (<CODE>gemini-proxy</CODE>) to secure API calls.</LI>
          <LI><STRONG>Server-side Password Verification</STRONG>: "Committee" password is now verified via Worker secrets, removing it from the client bundle.</LI>
          <LI><STRONG>Public Repository Readiness</STRONG>: Performed a full security audit and git history scrub for open-source release.</LI>
        </UL>
        <SubSectionTitle>Changed</SubSectionTitle>
        <UL>
          <LI><STRONG>Architecture</STRONG>: Transitioned from Docker/Nginx/CORS-Proxy to a modern serverless stack.</LI>
          <LI><STRONG>Documentation</STRONG>: Completely rewritten README, DEPLOYMENT, and CONTEXT guides.</LI>
          <LI><STRONG>Environment</STRONG>: Simplified local setup by utilizing the production Worker as a proxy.</LI>
        </UL>
        <SubSectionTitle>Removed</SubSectionTitle>
        <UL>
          <LI><STRONG>Legacy Infrastructure</STRONG>: Deleted <CODE>Dockerfile</CODE>, <CODE>docker-compose.yml</CODE>, and Watchtower configurations.</LI>
          <LI><STRONG>CI/CD</STRONG>: Removed GitHub Actions for Docker builds in favor of Cloudflare Pages' native builds.</LI>
          <LI><STRONG>Dead Code</STRONG>: Removed unused <CODE>release-notes/</CODE> TSX components.</LI>
        </UL>
        <P>---</P>
      </section>
    )
  },
  {
    version: "1.9.8",
    content: (
      <section id="version-1.9.8">
        <SectionTitle>Version 1.9.8 - 2026-02-21</SectionTitle>
        <SubSectionTitle>Added</SubSectionTitle>
        <UL>
          <LI><STRONG>Lyric Processor Meta Update</STRONG>: Enhanced metadata and legal clarity for processed lyrics.</LI>
          <LI><STRONG>Copyright Disclaimer</STRONG>: Automatically appended to cleaned lyrics.</LI>
          <LI><STRONG>Creator Handle Capture</STRONG>: Intelligent extraction from Suno/Riffusion URLs.</LI>
        </UL>
        <P>---</P>
      </section>
    )
  },
  {
    version: "1.9.7",
    content: (
      <section id="version-1.9.7">
        <SectionTitle>Version 1.9.7 - 2026-02-21</SectionTitle>
        <SubSectionTitle>Added</SubSectionTitle>
        <UL>
          <LI><STRONG>Guided Workflows</STRONG>: "Quick Start" section on the About page for better onboarding.</LI>
        </UL>
        <P>---</P>
      </section>
    )
  },
  {
    version: "1.0.0",
    content: (
      <section id="version-1.0.0">
        <SectionTitle>Version 1.0.0 - 2026-02-14</SectionTitle>
        <SubSectionTitle>Added</SubSectionTitle>
        <UL>
          <LI><STRONG>Initial Release</STRONG>: 20+ specialized AI music tools.</LI>
        </UL>
      </section>
    )
  }
];
