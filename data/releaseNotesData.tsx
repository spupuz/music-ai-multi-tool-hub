import React from 'react';
import { P, UL, LI, CODE, STRONG, SectionTitle, SubSectionTitle } from '../components/ReleaseNoteElements';

export interface ReleaseNoteItem {
  version: string;
  content: React.ReactNode;
}

export const releaseNotes: ReleaseNoteItem[] = [
  {
    version: "2.1.0",
    content: (
      <section id="version-2.1.0">
        <SectionTitle>Version 2.1.0 - 2026-03-11</SectionTitle>
        <SubSectionTitle>Fixed</SubSectionTitle>
        <UL>
          <LI><STRONG>Full Mobile Responsiveness Overhaul</STRONG>: Eliminated horizontal overflow across the entire application, focusing on the Suno User Stats tool.</LI>
          <LI><STRONG>Aggressive Spacing Optimization</STRONG>: Reclaimed horizontal space by zeroing out paddings on mobile containers (<CODE>Layout</CODE>, <CODE>Tool Container</CODE>, <CODE>ChartContainer</CODE>).</LI>
          <LI><STRONG>Responsive Charts</STRONG>: Implemented dynamic scaling for Chart.js labels, padding, and decimal precision (e.g., rounding percentages on mobile).</LI>
          <LI><STRONG>Responsive Tables</STRONG>: Added intelligent header abbreviations (e.g., "Avg Plays" &rarr; "Plays") and cell compaction for small screens.</LI>
          <LI><STRONG>Header Scaling</STRONG>: Optimized the main header to ensure branding remains on a single line on all devices using dynamic font sizes and ellipsis.</LI>
          <LI><STRONG>Clean UI</STRONG>: Removed redundant mobile-only "small screen" warning as the UI is now fully optimized.</LI>
        </UL>
      </section>
    )
  },
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
          <LI><STRONG>Official Open-Source Launch</STRONG>: The repository is now public on GitHub!</LI>
          <LI><STRONG>Removed Obsolete Links</STRONG>: Deleted the unused Community Feedback Board links from the Sidebar and About page.</LI>
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
          <UL>
            <LI><STRONG>Quick Start Workflows Section</STRONG>: Added a goal-oriented section to help newcomers find the right tools.</LI>
            <LI><STRONG>Goal-Oriented Navigation</STRONG>: Cards like "I need inspiration...", "I'm writing a song..." with direct tool links.</LI>
          </UL>
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
          <UL>
            <LI>Seamless support for <CODE>producer.ai</CODE> URLs across the Hub.</LI>
            <LI>Automatic extraction of song IDs and transformation to <CODE>riffusion.com</CODE> format.</LI>
          </UL>
          <LI><STRONG>Tool Updates</STRONG>:</LI>
          <UL>
            <LI>Music Shuffler, Compliance Checker, Cover Art Creator, MP3 Cutter, Lyric Processor, Lyrics Synchronizer, and Song Deck Picker all support Producer.AI links.</LI>
          </UL>
        </UL>
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
          <UL>
            <LI><STRONG>New Game-like Reveal</STRONG>: Cards are face-down and revealed in reverse rank order (from #10 to #1).</LI>
            <LI><STRONG>Special Previews</STRONG>: Top-ranked cards trigger flip animations and audio snippets in an enlarged modal.</LI>
          </UL>
          <LI><STRONG>UI Polish</STRONG>:</LI>
          <UL>
            <LI>Enhanced modal display preserves aspect ratio and visual elements.</LI>
            <LI>Improved interaction flow for closing modals.</LI>
          </UL>
        </UL>
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
          <UL>
            <LI><STRONG>Line-by-Line Lyric Management</STRONG>: Dedicated lyric editor for each block on the timeline.</LI>
            <LI><STRONG>Automatic Version Control</STRONG>: Saves drafts on blur with a history modal for easy reverting.</LI>
            <LI><STRONG>Live Syllable Counting</STRONG>: Real-time syllable counter for each lyric line.</LI>
          </UL>
          <LI><STRONG>Saved Arrangement Management</STRONG>:</LI>
          <UL>
            <LI><STRONG>Safe Deletion</STRONG>: 3-click confirmation for deleting saved arrangements.</LI>
            <LI><STRONG>New Import/Export</STRONG>: Export to <CODE>.txt</CODE> (AI prompt format) or <CODE>.csv</CODE>.</LI>
          </UL>
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
          <UL>
            <LI><STRONG>Music Shuffler</STRONG>: Load and play Riffusion tracks.</LI>
            <LI><STRONG>Song Cover Art Creator</STRONG>: Fetch info/artwork from Riffusion URLs.</LI>
            <LI><STRONG>Lyric Processor</STRONG>: Fetch lyrics/title/artist from Riffusion links.</LI>
            <LI><STRONG>MP3 Cutter</STRONG>: Load audio directly from Riffusion songs.</LI>
          </UL>
        </UL>
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
          <UL>
            <LI>New <STRONG>"AI Music Platforms"</STRONG> sidebar category.</LI>
            <LI>Moved Music Shuffler, User Stats, and Song Compliance under the new category.</LI>
          </UL>
        </UL>
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
          <UL>
            <LI><STRONG>Creative Constraints</STRONG>: Vocal Style (with randomizer), Tempo (BPM), and Negative Constraints.</LI>
            <LI><STRONG>Dual Post Generation</STRONG>: Distinct Announcement and Reminder posts with tabbed navigation.</LI>
            <LI><STRONG>Smarter Content</STRONG>: Dynamic hashtags and intelligent line omission for blank fields.</LI>
          </UL>
        </UL>
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
          <UL>
            <LI>Player controls relocated to the load section for better flow.</LI>
            <LI>Single-column layout for the synchronization interface.</LI>
            <LI>Scrollable lyrics list with max height.</LI>
          </UL>
        </UL>
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
          <UL>
            <LI><STRONG>Remove Song from Playlist</STRONG>: Trash can icon added to queue items for individual removal.</LI>
            <LI><STRONG>UI Fixes</STRONG>: Shortened example URL text to prevent overflow on mobile.</LI>
          </UL>
        </UL>
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
          <UL>
            <LI>Fixed <CODE>SyntaxError</CODE> in placeholder files.</LI>
            <LI>Corrected TypeScript types for browser timers and audio player.</LI>
          </UL>
        </UL>
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
          <UL>
            <LI><STRONG>Song Performance Lifecycle Modal</STRONG>: Detailed line charts for individual song growth.</LI>
            <LI><STRONG>Plays vs. Comments Scatter Plot</STRONG>: Identify "talkable" songs based on engagement rates.</LI>
            <LI><STRONG>Cross-Chart Filtering</STRONG>: Click chart data to filter the performance table.</LI>
            <LI><STRONG>Stickiness Metrics</STRONG>: Avg. Upvote/Comment rates for Tags and Genres.</LI>
            <LI><STRONG>Duration Buckets</STRONG>: Performance analysis grouped by song length.</LI>
          </UL>
        </UL>
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
