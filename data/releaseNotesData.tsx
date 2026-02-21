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
          <LI><STRONG>About Page Enhancements</STRONG>:</LI>
        </UL>
        <P>- <STRONG>Quick Start Workflows Section</STRONG>: Added a goal-oriented section to help newcomers find the right tools.</P>
        <P>- <STRONG>Goal-Oriented Navigation</STRONG>: Cards like "I need inspiration...", "I'm writing a song..." with direct tool links.</P>
        <UL>
          <LI><STRONG>Improved Onboarding</STRONG>: Better discoverability by turning the Hub into a guided creative suite.</LI>
        </UL>
        <P>---</P>
      </section>
    )
  },
  {
    version: "1.9.6",
    content: (
      <section id="version-1.9.6">
        <SectionTitle>Version 1.9.6 - 2026-02-21</SectionTitle>
        <SubSectionTitle>Added</SubSectionTitle>
        <UL>
          <LI><STRONG>Producer.AI Integration</STRONG>:</LI>
        </UL>
        <P>- Seamless support for `producer.ai` URLs across the Hub.</P>
        <P>- Automatic extraction of song IDs and transformation to `riffusion.com` format.</P>
        <UL>
          <LI><STRONG>Tool Updates</STRONG>:</LI>
        </UL>
        <P>- Music Shuffler, Compliance Checker, Cover Art Creator, MP3 Cutter, Lyric Processor, Lyrics Synchronizer, and Song Deck Picker all support Producer.AI links.</P>
        <P>---</P>
      </section>
    )
  },
  {
    version: "1.9.5",
    content: (
      <section id="version-1.9.5">
        <SectionTitle>Version 1.9.5 - 2026-02-21</SectionTitle>
        <SubSectionTitle>Added</SubSectionTitle>
        <UL>
          <LI><STRONG>Ranking Reveal Mode (Song Deck Picker)</STRONG>:</LI>
        </UL>
        <P>- <STRONG>New Game-like Reveal</STRONG>: Cards are face-down and revealed in reverse rank order (from #10 to #1).</P>
        <P>- <STRONG>Special Previews</STRONG>: Top-ranked cards trigger flip animations and audio snippets in an enlarged modal.</P>
        <UL>
          <LI><STRONG>UI Polish</STRONG>:</LI>
        </UL>
        <P>- Enhanced modal display preserves aspect ratio and visual elements.</P>
        <P>- Improved interaction flow for closing modals.</P>
        <P>---</P>
      </section>
    )
  },
  {
    version: "1.9.4",
    content: (
      <section id="version-1.9.4">
        <SectionTitle>Version 1.9.4 - 2026-02-21</SectionTitle>
        <SubSectionTitle>Added</SubSectionTitle>
        <UL>
          <LI><STRONG>Song Structure Builder "Power-Up"</STRONG>:</LI>
        </UL>
        <P>- <STRONG>Line-by-Line Lyric Management</STRONG>: Dedicated lyric editor for each block on the timeline.</P>
        <P>- <STRONG>Automatic Version Control</STRONG>: Saves drafts on blur with a history modal for easy reverting.</P>
        <P>- <STRONG>Live Syllable Counting</STRONG>: Real-time syllable counter for each lyric line.</P>
        <UL>
          <LI><STRONG>Saved Arrangement Management</STRONG>:</LI>
        </UL>
        <P>- <STRONG>Safe Deletion</STRONG>: 3-click confirmation for deleting saved arrangements.</P>
        <P>- <STRONG>New Import/Export</STRONG>: Export to `.txt` (AI prompt format) or `.csv`.</P>
        <UL>
          <LI><STRONG>Lyric Utils</STRONG>: Shared syllable counting logic moved to <CODE>utils/lyricUtils.ts</CODE>.</LI>
        </UL>
        <P>---</P>
      </section>
    )
  },
  {
    version: "1.9.3",
    content: (
      <section id="version-1.9.3">
        <SectionTitle>Version 1.9.3 - 2026-02-21</SectionTitle>
        <SubSectionTitle>Added</SubSectionTitle>
        <UL>
          <LI><STRONG>Riffusion Integration Across Tools</STRONG>:</LI>
        </UL>
        <P>- <STRONG>Music Shuffler</STRONG>: Load and play Riffusion tracks.</P>
        <P>- <STRONG>Song Cover Art Creator</STRONG>: Fetch info/artwork from Riffusion URLs.</P>
        <P>- <STRONG>Lyric Processor</STRONG>: Fetch lyrics/title/artist from Riffusion links.</P>
        <P>- <STRONG>MP3 Cutter</STRONG>: Load audio directly from Riffusion songs.</P>
        <P>---</P>
      </section>
    )
  },
  {
    version: "1.9.2",
    content: (
      <section id="version-1.9.2">
        <SectionTitle>Version 1.9.2 - 2026-02-21</SectionTitle>
        <SubSectionTitle>Added</SubSectionTitle>
        <UL>
          <LI><STRONG>MP3 Cutter Riffusion Support</STRONG>: Load and edit audio directly from Riffusion song URLs. Fetch metadata and stream automatically.</LI>
        </UL>
        <P>---</P>
      </section>
    )
  },
  {
    version: "1.9.1",
    content: (
      <section id="version-1.9.1">
        <SectionTitle>Version 1.9.1 - 2026-02-20</SectionTitle>
        <SubSectionTitle>Added</SubSectionTitle>
        <UL>
          <LI><STRONG>Music Shuffler Riffusion Integration</STRONG>: Support for <CODE>riffusion.com/song/...</CODE> URLs with multi-platform playlist capability.</LI>
          <LI><STRONG>Hub Reorganization</STRONG>:</LI>
        </UL>
        <P>- New <STRONG>"AI Music Platforms"</STRONG> sidebar category.</P>
        <P>- Moved Music Shuffler, User Stats, and Song Compliance under the new category.</P>
        <P>---</P>
      </section>
    )
  },
  {
    version: "1.9.0",
    content: (
      <section id="version-1.9.0">
        <SectionTitle>Version 1.9.0 - 2026-02-20</SectionTitle>
        <SubSectionTitle>Added</SubSectionTitle>
        <UL>
          <LI><STRONG>SparkTune Super-Generator</STRONG>:</LI>
        </UL>
        <P>- <STRONG>Creative Constraints</STRONG>: Vocal Style (with randomizer), Tempo (BPM), and Negative Constraints.</P>
        <P>- <STRONG>Dual Post Generation</STRONG>: Distinct Announcement and Reminder posts with tabbed navigation.</P>
        <P>- <STRONG>Smarter Content</STRONG>: Dynamic hashtags and intelligent line omission for blank fields.</P>
        <P>---</P>
      </section>
    )
  },
  {
    version: "1.8.9",
    content: (
      <section id="version-1.8.9">
        <SectionTitle>Version 1.8.9 - 2026-02-20</SectionTitle>
        <SubSectionTitle>Added</SubSectionTitle>
        <UL>
          <LI><STRONG>Lyrics Synchronizer Layout</STRONG>:</LI>
        </UL>
        <P>- Player controls relocated to the load section for better flow.</P>
        <P>- Single-column layout for the synchronization interface.</P>
        <P>- Scrollable lyrics list with max height.</P>
        <P>---</P>
      </section>
    )
  },
  {
    version: "1.8.8",
    content: (
      <section id="version-1.8.8">
        <SectionTitle>Version 1.8.8 - 2026-02-19</SectionTitle>
        <SubSectionTitle>Added</SubSectionTitle>
        <UL>
          <LI><STRONG>Suno Shuffler Improvements</STRONG>:</LI>
        </UL>
        <P>- <STRONG>Remove Song from Playlist</STRONG>: Trash can icon added to queue items for individual removal.</P>
        <P>- <STRONG>UI Fixes</STRONG>: Shortened example URL text to prevent overflow on mobile.</P>
        <P>---</P>
      </section>
    )
  },
  {
    version: "1.8.7",
    content: (
      <section id="version-1.8.7">
        <SectionTitle>Version 1.8.7 - 2026-02-19</SectionTitle>
        <SubSectionTitle>Added</SubSectionTitle>
        <UL>
          <LI><STRONG>Snippet Mode</STRONG>: 30-second random song previews for rapid discovery in Suno Music Shuffler.</LI>
          <LI><STRONG>Reveal Cards Mode (Song Deck Picker)</STRONG>: Face-down card game with customizable card backs.</LI>
          <LI><STRONG>Technical Fixes</STRONG>:</LI>
        </UL>
        <P>- Fixed `SyntaxError` in placeholder files.</P>
        <P>- Corrected TypeScript types for browser timers and audio player.</P>
        <P>---</P>
      </section>
    )
  },
  {
    version: "1.8.6",
    content: (
      <section id="version-1.8.6">
        <SectionTitle>Version 1.8.6 - 2026-02-19</SectionTitle>
        <SubSectionTitle>Added</SubSectionTitle>
        <UL>
          <LI><STRONG>Suno User Stats "Data Nerd" Pack</STRONG>:</LI>
        </UL>
        <P>- <STRONG>Song Performance Lifecycle Modal</STRONG>: Detailed line charts for individual song growth.</P>
        <P>- <STRONG>Plays vs. Comments Scatter Plot</STRONG>: Identify "talkable" songs based on engagement rates.</P>
        <P>- <STRONG>Cross-Chart Filtering</STRONG>: Click chart data to filter the performance table.</P>
        <P>- <STRONG>Stickiness Metrics</STRONG>: Avg. Upvote/Comment rates for Tags and Genres.</P>
        <P>- <STRONG>Duration Buckets</STRONG>: Performance analysis grouped by song length.</P>
        <P>---</P>
      </section>
    )
  },
  {
    version: "1.8.5",
    content: (
      <section id="version-1.8.5">
        <SectionTitle>Version 1.8.5 - 2026-02-18</SectionTitle>
        <SubSectionTitle>Added</SubSectionTitle>
        <UL>
          <LI><STRONG>Duration Check (Compliance)</STRONG>: Configurable duration limits (default 300s) for batch song validation. Includes CSV and summary report updates.</LI>
        </UL>
        <P>---</P>
      </section>
    )
  },
  {
    version: "1.8.4",
    content: (
      <section id="version-1.8.4">
        <SectionTitle>Version 1.8.4 - 2026-02-18</SectionTitle>
        <SubSectionTitle>Added</SubSectionTitle>
        <UL>
          <LI><STRONG>Custom URL Lists (Shuffler)</STRONG>: Input a raw list of Suno URLs (one per line) to create on-the-fly playlists.</LI>
        </UL>
        <P>---</P>
      </section>
    )
  },
  {
    version: "1.8.2",
    content: (
      <section id="version-1.8.2">
        <SectionTitle>Version 1.8.2 - 2026-02-18</SectionTitle>
        <SubSectionTitle>Added</SubSectionTitle>
        <UL>
          <LI><STRONG>MP3 Cutter Enhancements</STRONG>: Cover art display, MP3 export (via <CODE>lamejs</CODE>), and legal copyright disclaimer.</LI>
        </UL>
        <P>---</P>
      </section>
    )
  },
  {
    version: "1.8.0",
    content: (
      <section id="version-1.8.0">
        <SectionTitle>Version 1.8.0 - 2026-02-17</SectionTitle>
        <SubSectionTitle>Added</SubSectionTitle>
        <UL>
          <LI><STRONG>New Tool: MP3 Cutter & Cropper</STRONG>: Visual waveform editing via <CODE>wavesurfer.js</CODE>, precise region selection, and audio export.</LI>
        </UL>
        <P>---</P>
      </section>
    )
  },
  {
    version: "1.7.6",
    content: (
      <section id="version-1.7.6">
        <SectionTitle>Version 1.7.6 - 2026-02-16</SectionTitle>
        <SubSectionTitle>Added</SubSectionTitle>
        <UL>
          <LI><STRONG>Comment Engagement Tracking</STRONG>: Integrated comment counts across Stats charts, Shuffler queue, and Player info.</LI>
        </UL>
        <P>---</P>
      </section>
    )
  },
  {
    version: "1.7.4",
    content: (
      <section id="version-1.7.4">
        <SectionTitle>Version 1.7.4 - 2026-02-15</SectionTitle>
        <SubSectionTitle>Added</SubSectionTitle>
        <UL>
          <LI><STRONG>New Tool: Local Music Resource Directory</STRONG>: Curated hub for samples, communities, and production tutorials.</LI>
        </UL>
        <P>---</P>
      </section>
    )
  },
  {
    version: "1.7.0",
    content: (
      <section id="version-1.7.0">
        <SectionTitle>Version 1.7.0 - 2026-02-15</SectionTitle>
        <SubSectionTitle>Added</SubSectionTitle>
        <UL>
          <LI><STRONG>OS Media Control Integration</STRONG>: Robust Media Session API support for lock screen controls.</LI>
          <LI><STRONG>Direct Suno Links</STRONG>: Clickable cover art in player to open song on Suno.com.</LI>
        </UL>
        <P>---</P>
      </section>
    )
  },
  {
    version: "1.6.0",
    content: (
      <section id="version-1.6.0">
        <SectionTitle>Version 1.6.0 - 2026-02-15</SectionTitle>
        <SubSectionTitle>Added</SubSectionTitle>
        <UL>
          <LI><STRONG>Follower Growth Metrics</STRONG>: 7d/30d growth rates and percentage displays.</LI>
          <LI><STRONG>Operational Security</STRONG>: Password gating for AI compliance checks.</LI>
        </UL>
        <P>---</P>
      </section>
    )
  },
  {
    version: "1.5.0",
    content: (
      <section id="version-1.5.0">
        <SectionTitle>Version 1.5.0 - 2026-02-15</SectionTitle>
        <SubSectionTitle>Added</SubSectionTitle>
        <UL>
          <LI><STRONG>Suno Song Compliance Checker</STRONG>: Batch processing, Gemini AI lyrics analysis, selectable content ratings (G to R), and CSV export.</LI>
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
          <LI><STRONG>Initial Launch</STRONG>: 20+ specialized AI music tools including Suno Shuffler, Lyric Processor, Style Generator, Concept Blender, and Music Theory Wiki.</LI>
        </UL>
      </section>
    )
  }
];
