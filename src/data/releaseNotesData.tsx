import React from 'react';
import { P, UL, LI, CODE, STRONG, SectionTitle, SubSectionTitle } from '@/components/ReleaseNoteElements';

export interface ReleaseNoteItem {
  version: string;
  content: React.ReactNode;
}

export const releaseNotes: ReleaseNoteItem[] = [
  {
    version: "2.6.26",
    content: (
      <section id="version-2.6.26">
        <SectionTitle>Version 2.6.26 - 2026-09-03</SectionTitle>
        <SubSectionTitle>Fixed</SubSectionTitle>
        <UL>
          <LI><STRONG>File uploads no longer erase metadata</STRONG> in the analysis tools (Lyrics Synchronizer, MP3 Cutter, BPM Tapper): uploading an MP3 now keeps the title/artist/cover already fetched from a Suno/Riffusion URL or typed by the user (the filename is only used as a title fallback). MP3 Cutter additionally now resolves Suno URLs and fills in the song metadata, matching the other tools, while still requiring a manual MP3 upload for the audio (TOS compliance).</LI>
        </UL>
      </section>
    )
  },
  {
    version: "2.6.25",
    content: (
      <section id="version-2.6.25">
        <SectionTitle>Version 2.6.25 - 2026-09-03</SectionTitle>
        <SubSectionTitle>Fixed</SubSectionTitle>
        <UL>
          <LI><STRONG>Lyrics Synchronizer</STRONG>: loading a Suno URL now fetches and fills the song metadata (title, artist, cover art, and lyrics when the prompt looks like lyrics) while still requiring a manual MP3 upload for the audio (TOS compliance) — and it no longer wipes an MP3 that was already uploaded, so you can combine "upload MP3 + fetch the rest from the Suno URL".</LI>
        </UL>
      </section>
    )
  },
  {
    version: "2.6.24",
    content: (
      <section id="version-2.6.24">
        <SectionTitle>Version 2.6.24 - 2026-09-03</SectionTitle>
        <SubSectionTitle>Fixed</SubSectionTitle>
        <UL>
          <LI><STRONG>localStorage quota self-healing</STRONG>: <CODE>safeStorage</CODE> now evicts the largest regenerable caches (<CODE>sunoMusicPlayer_user_</CODE>/<CODE>playlist_</CODE> dumps, <CODE>sunoUserStats_</CODE> snapshots, song info caches) and transient logs before failing, so the app no longer spams "quota has been exceeded" errors or drops the last-session / user-cache persistence when storage fills up.</LI>
          <LI><STRONG>Suno "forbidden" media placeholder</STRONG>: clips whose <CODE>audio_url</CODE>/<CODE>video_url</CODE> are Suno's <CODE>.../api/forbidden</CODE> placeholder are now sanitized before caching, so the placeholder never leaks into localStorage or triggers blocked cross-origin requests.</LI>
          <LI><STRONG>Daily active ping robustness</STRONG>: a corrupted <CODE>myVisitsLog</CODE> JSON no longer throws on startup.</LI>
          <LI><STRONG>Broken release-notes build</STRONG>: <CODE>sync-release-notes.js</CODE> no longer injects markdown template comments/headings into <CODE>releaseNotesData.tsx</CODE>, and the polluted <CODE>CHANGELOG.md</CODE> (v2.6.23 bullets duplicated across older sections) was cleaned up so <CODE>npm run build</CODE> succeeds.</LI>
        </UL>
      </section>
    )
  },
  {
    version: "2.6.23",
    content: (
      <section id="version-2.6.23">
        <SectionTitle>Version 2.6.23 - 2026-09-03</SectionTitle>
        <SubSectionTitle>Changed</SubSectionTitle>
        <UL>
          <LI><STRONG>Suno TOS compliance</STRONG>: Tutti gli strumenti ora mostrano errore immediato per URL Suno senza caricare CDN audio; player musica usa iframe embed ufficiale; tool di analisi (MP3 Cutter, BPM Tapper, Lyrics Sync) richiedono upload manuale MP3.</LI>
          <LI><STRONG>safeStorage.ts</STRONG>: nuovo modulo auto-guarigione localStorage quota che si autopulisce quando lo storage è pieno.</LI>
          <LI><STRONG>Sidebar</STRONG>: voci menu allineate a sinistra con indent per ogni voce.</LI>
          <LI><STRONG>Footer</STRONG>: rimosso @flickerlog, visualizza solo @spupuz.</LI>
          <LI><STRONG>SongDeckPicker</STRONG>: anteprima iframe Suno embed al posto di audio CDN per le card classifica.</LI>
        </UL>
      </section>
    )
  },
  {
    version: "2.6.22",
    content: (
      <section id="version-2.6.22">
        <SectionTitle>Version 2.6.22 - 2026-09-03</SectionTitle>
        <SubSectionTitle>Changed</SubSectionTitle>
        <UL>
          <LI><STRONG>Prevent chart recreation on resize/updates in Suno User Stats</STRONG>: <CODE>CommentsTrendChart</CODE>, <CODE>FollowersTrendChart</CODE>, <CODE>PlaysTrendChart</CODE>, and <CODE>UpvotesTrendChart</CODE> now reuse their existing Chart.js instance (updating labels, dataset, and options in place via <CODE>update('none')</CODE>) instead of destroying and recreating the chart on every <CODE>screenWidth</CODE> change or data update, reducing jank and CPU churn during window resizes.</LI>
        </UL>
        <SubSectionTitle>Security</SubSectionTitle>
        <UL>
          <LI><STRONG>Added rate limiting to the <CODE>/verify-password</CODE> endpoint</STRONG>: the Worker now enforces a 5-attempt cap (per client IP) over a 300-second window using the existing <CODE>STATS_KV</CODE> store, returning HTTP 429 with a <CODE>Retry-After</CODE> header once the threshold is hit, to prevent brute-force discovery of the shared committee password.</LI>
        </UL>
      </section>
    )
  },
  {
    version: "2.6.21",
    content: (
      <section id="version-2.6.21">
        <SectionTitle>Version 2.6.21 - 2026-09-02</SectionTitle>
        <SubSectionTitle>Accessibility</SubSectionTitle>
        <UL>
          <LI><STRONG>Made drag-and-drop file upload zones keyboard accessible</STRONG>: <CODE>ImageUpload.tsx</CODE> and the Song Structure Builder import zone (<CODE>ImportExportModal.tsx</CODE>) now expose <CODE>role="button"</CODE>, <CODE>tabIndex={0}</CODE>, <CODE>onKeyDown</CODE> handlers (Enter/Space) that trigger the file picker, and visible focus rings — so keyboard and screen-reader users can activate uploads.</LI>
          <LI><STRONG>Added explanatory titles to disabled buttons in Suno Music Player</STRONG>: buttons like "Save New" playlist, "Clear Queue", and "Copy Lyrics" now show a <CODE>title</CODE> explaining why they're disabled (e.g. "Please enter a name for the new playlist"), so users understand what's preventing the action.</LI>
        </UL>
      </section>
    )
  },
  {
    version: "2.6.20",
    content: (
      <section id="version-2.6.20">
        <SectionTitle>Version 2.6.20 - 2026-09-01</SectionTitle>
        <SubSectionTitle>Security</SubSectionTitle>
        <UL>
          <LI><STRONG>Fixed weak random ID generation in <CODE>LyricsSynchronizerTool</CODE></STRONG>: replaced remaining <CODE>Date.now()</CODE>-based lyric line ID generation with <CODE>crypto.randomUUID()</CODE> across parsed lyric lines, empty line placeholders, and LRC file imports to ensure robust, collision-resistant uniqueness.</LI>
        </UL>
      </section>
    )
  },
  {
    version: "2.6.19",
    content: (
      <section id="version-2.6.19">
        <SectionTitle>Version 2.6.19 - 2026-08-31</SectionTitle>
        <SubSectionTitle>Accessibility</SubSectionTitle>
        <UL>
          <LI><STRONG>Added <CODE>aria-controls</CODE> to local playlist manager toggle</STRONG>: the playlist Import/Export & Local Saves expandable button in <CODE>LocalPlaylistManager.tsx</CODE> now references its collapsible panel via <CODE>aria-controls</CODE> (alongside the existing <CODE>aria-expanded</CODE>), and the panel itself carries a matching <CODE>id="playlist-management-panel"</CODE> so screen readers can announce the relationship between the button and the panel it controls.</LI>
        </UL>
      </section>
    )
  },
  {
    version: "2.6.18",
    content: (
      <section id="version-2.6.18">
        <SectionTitle>Version 2.6.18 - 2026-08-31</SectionTitle>
        <SubSectionTitle>Security</SubSectionTitle>
        <UL>
          <LI><STRONG>Fixed weak random ID generation in <CODE>LyricsSynchronizerTool</CODE></STRONG>: lyric line IDs are now generated with <CODE>crypto.randomUUID()</CODE> instead of <CODE>Math.random().toString(16)</CODE> combined with <CODE>Date.now()</CODE>, eliminating predictable/collision-prone identifiers for parsed lyric lines.</LI>
        </UL>
        <SubSectionTitle>Changed</SubSectionTitle>
        <UL>
          <LI><STRONG>Memoized chart data transformations in stat charts</STRONG>: <CODE>GenreUsageChart</CODE>, <CODE>GenreVotesChart</CODE>, <CODE>TagUsageChart</CODE>, and <CODE>TagVotesChart</CODE> now compute labels, counts, <CODE>suggestedMax</CODE>, and color shades inside a <CODE>useMemo</CODE> block keyed on data/theme, preventing costly O(n) re-calculations on every render (e.g. on <CODE>screenWidth</CODE> changes from window resizes).</LI>
        </UL>
        <SubSectionTitle>Accessibility</SubSectionTitle>
        <UL>
          <LI><STRONG>Added <CODE>aria-label</CODE> to new-playlist input fields</STRONG>: the two new-playlist name inputs in the Local Playlist manager (<CODE>LocalPlaylistManager.tsx</CODE>) now expose descriptive <CODE>aria-label</CODE>s for screen readers.</LI>
        </UL>
      </section>
    )
  },
  {
    version: "2.6.17",
    content: (
      <section id="version-2.6.17">
        <SectionTitle>Version 2.6.17 - 2026-08-28</SectionTitle>
        <SubSectionTitle>Security</SubSectionTitle>
        <UL>
          <LI><STRONG>Fixed timing attack on password verification</STRONG>: the Gemini Worker's <CODE>/verify-password</CODE> endpoint now uses a constant-time string comparison (bitwise XOR loop) instead of the short-circuiting <CODE>===</CODE> operator, mitigating side-channel information leakage about the committee password.</LI>
        </UL>
        <SubSectionTitle>Changed</SubSectionTitle>
        <UL>
          <LI><STRONG>Memoized data-heavy performance tables</STRONG>: <CODE>CohortPerformanceTable</CODE>, <CODE>SongDurationPerformanceTable</CODE>, <CODE>TagGenrePerformanceTables</CODE>, and <CODE>TagPairPerformanceTable</CODE> are now wrapped in <CODE>React.memo</CODE> to prevent unnecessary re-renders and re-sorts when the parent <CODE>StatChartsArea</CODE> updates its state (e.g. <CODE>selectedPeriod</CODE>) but their props remain unchanged.</LI>
        </UL>
      </section>
    )
  },
  {
    version: "2.6.16",
    content: (
      <section id="version-2.6.16">
        <SectionTitle>Version 2.6.16 - 2026-08-27</SectionTitle>
        <SubSectionTitle>Security</SubSectionTitle>
        <UL>
          <LI><STRONG>Fixed overly permissive CORS matching in the Worker</STRONG>: replaced the <CODE>http://localhost:</CODE> prefix check (which allowed spoofed origins like <CODE>http://localhost.evil.com</CODE>) with strict hostname/port validation so only genuine localhost/127.0.0.1 origins are accepted.</LI>
          <LI><STRONG>Added model name validation to the Gemini proxy</STRONG>: reject <CODE>model</CODE> values that don't match <CODE>^[a-zA-Z0-9.-]+$</CODE>, preventing path traversal / URL injection into the upstream Gemini URL.</LI>
        </UL>
        <SubSectionTitle>Accessibility</SubSectionTitle>
        <UL>
          <LI><STRONG>Added ARIA labels to icon-only buttons</STRONG>: the Local Playlist manager, Queue manager, and Song Structure Builder now expose descriptive <CODE>aria-label</CODE>s (including interpolated playlist name context) on their icon-only action buttons for screen readers.</LI>
        </UL>
        <SubSectionTitle>Changed</SubSectionTitle>
        <UL>
          <LI><STRONG>Memoized chart data generation</STRONG>: chart data transformations in the Suno User Stats scatter/bar charts are now wrapped in <CODE>useMemo</CODE> to avoid recomputation on every render and to preserve memoized child components.</LI>
          <LI><STRONG>Optimized scatter-plot deduplication</STRONG>: replaced the O(n²) <CODE>filter</CODE>/<CODE>findIndex</CODE> combination of top played/upvoted songs with a memoized O(n) <CODE>Map</CODE>-based approach.</LI>
          <LI><STRONG>Wrapped Header in <CODE>React.memo</CODE></STRONG>: prevents unnecessary re-renders of the app header when layout state changes.</LI>
        </UL>
      </section>
    )
  },
  {
    version: "2.6.15",
    content: (
      <section id="version-2.6.15">
        <SectionTitle>Version 2.6.15 - 2026-08-18</SectionTitle>
        <SubSectionTitle>Security</SubSectionTitle>
        <UL>
          <LI><STRONG>Fixed Server-Side Request Forgery (SSRF) in Suno proxy</STRONG>: the Cloudflare Worker's Suno proxy now uses the <CODE>URL</CODE> constructor to safely compose target URLs and strictly enforces hostname matching, preventing path manipulation attacks (e.g., <CODE>@attacker.com</CODE> authority injection) that could redirect outbound fetches to malicious hosts.</LI>
        </UL>
        <SubSectionTitle>Changed</SubSectionTitle>
        <UL>
          <LI><STRONG>Memoized DetailedSongPerformanceTable</STRONG>: wrapped the large song performance table component in <CODE>React.memo</CODE> to prevent unnecessary re-renders when parent state changes, reducing lag in the Suno User Stats page.</LI>
        </UL>
      </section>
    )
  },
  {
    version: "2.6.14",
    content: (
      <section id="version-2.6.14">
        <SectionTitle>Version 2.6.14 - 2026-08-17</SectionTitle>
        <SubSectionTitle>Security</SubSectionTitle>
        <UL>
          <LI><STRONG>Cloudflare Pages security headers</STRONG>: added <CODE>public/_headers</CODE> to enforce <CODE>X-Frame-Options: DENY</CODE>, <CODE>X-Content-Type-Options: nosniff</CODE>, <CODE>Referrer-Policy: strict-origin-when-cross-origin</CODE>, <CODE>Strict-Transport-Security</CODE>, <CODE>X-XSS-Protection</CODE>, and <CODE>Permissions-Policy</CODE> on all responses.</LI>
        </UL>
      </section>
    )
  },
  {
    version: "2.6.13",
    content: (
      <section id="version-2.6.13">
        <SectionTitle>Version 2.6.13 - 2026-08-17</SectionTitle>
        <SubSectionTitle>Changed</SubSectionTitle>
        <UL>
          <LI><STRONG>Optimized Music Theory Wiki search</STRONG>: cached parsed HTML content in a <CODE>useMemo</CODE> map to prevent expensive <CODE>ReactDOMServer.renderToStaticMarkup</CODE> calls on every keystroke during search, improving responsiveness.</LI>
        </UL>
        <SubSectionTitle>Added</SubSectionTitle>
        <UL>
          <LI><STRONG>Wiki search optimization notes</STRONG>: added learning documentation in <CODE>.jules/bolt.md</CODE> about caching React content trees for search.</LI>
        </UL>
      </section>
    )
  },
  {
    version: "2.6.12",
    content: (
      <section id="version-2.6.12">
        <SectionTitle>Version 2.6.12 - 2026-08-16</SectionTitle>
        <SubSectionTitle>Added</SubSectionTitle>
        <UL>
          <LI><STRONG>Keyboard-accessible file uploads</STRONG>: custom file upload buttons in the Suno player playlist manager now support <CODE>tabIndex</CODE>, <CODE>role="button"</CODE>, and Enter/Space key handling with visible focus rings, so keyboard and screen-reader users can trigger TXT/CSV playlist imports.</LI>
          <LI><STRONG>ARIA labels for icon-only buttons</STRONG>: randomize buttons in Song Cover Art and SparkTune, plus the preset delete button, now carry descriptive <CODE>aria-label</CODE>s so screen readers announce their purpose.</LI>
        </UL>
        <SubSectionTitle>Changed</SubSectionTitle>
        <UL>
          <LI><STRONG>Faster Sidebar re-renders</STRONG>: the Sidebar component is wrapped in <CODE>React.memo</CODE> and the tool grouping is memoized with <CODE>useMemo</CODE>, cutting CPU time on every render.</LI>
        </UL>
        <SubSectionTitle>Fixed</SubSectionTitle>
        <UL>
          <LI><STRONG>Reverse tabnabbing</STRONG>: <CODE>window.open(..., '_blank')</CODE> calls in the Sidebar and About page now pass <CODE>'noopener,noreferrer'</CODE>, preventing newly opened pages from accessing the opener window.</LI>
        </UL>
      </section>
    )
  },
  {
    version: "2.6.11",
    content: (
      <section id="version-2.6.11">
        <SectionTitle>Version 2.6.11 - 2026-08-14</SectionTitle>
        <SubSectionTitle>Changed</SubSectionTitle>
        <UL>
          <LI><STRONG>No more public CORS proxy fallbacks</STRONG>: the Suno service now relies strictly on the verified Cloudflare Worker proxy for all fetches and short-URL resolution, removing the hardcoded fallback chain of unvetted public proxies (corsproxy.io, allorigins, thingproxy, cors-anywhere, etc.).</LI>
        </UL>
        <SubSectionTitle>Security</SubSectionTitle>
        <UL>
          <LI><STRONG>Removed unvetted public CORS proxies</STRONG>: third-party public proxy fallbacks could intercept traffic and exposed the app to SSRF-style risks; all Suno API reads and <CODE>suno.com/song</CODE> link resolution now go through the Worker proxy only.</LI>
        </UL>
      </section>
    )
  },
  {
    version: "2.6.10",
    content: (
      <section id="version-2.6.10">
        <SectionTitle>Version 2.6.10 - 2026-08-14</SectionTitle>
        <SubSectionTitle>Changed</SubSectionTitle>
        <UL>
          <LI><STRONG>Accessible import/export modals</STRONG>: the Suno community spinner's export textarea now carries an <CODE>aria-label</CODE>, the import file picker and JSON textarea have proper <CODE>htmlFor</CODE>/<CODE>id</CODE> label associations, so screen readers announce these fields correctly.</LI>
        </UL>
      </section>
    )
  },
  {
    version: "2.6.9",
    content: (
      <section id="version-2.6.9">
        <SectionTitle>Version 2.6.9 - 2026-08-13</SectionTitle>
        <SubSectionTitle>Changed</SubSectionTitle>
        <UL>
          <LI><STRONG>Faster Suno player re-renders</STRONG>: <CODE>SunoMusicPlayerTool</CODE> is wrapped in <CODE>React.memo</CODE>, so the component no longer re-renders when parent state changes without prop updates.</LI>
        </UL>
      </section>
    )
  },
  {
    version: "2.6.8",
    content: (
      <section id="version-2.6.8">
        <SectionTitle>Version 2.6.8 - 2026-08-13</SectionTitle>
        <SubSectionTitle>Changed</SubSectionTitle>
        <UL>
          <LI><STRONG>Accessible buttons</STRONG>: the shared <CODE>Button</CODE> component now shows a visible emerald keyboard focus ring (<CODE>focus-visible:ring-2</CODE>) on the "Report a bug" links across the Sidebar and About page, so keyboard users can tell where they are.</LI>
        </UL>
        <SubSectionTitle>Security</SubSectionTitle>
        <UL>
          <LI><STRONG>Safe external links</STRONG>: all "Report a bug" links opening in a new tab now include <CODE>rel="noopener noreferrer"</CODE>, preventing the opened page from hijacking the app via <CODE>window.opener</CODE>.</LI>
        </UL>
      </section>
    )
  },
  {
    version: "2.6.7",
    content: (
      <section id="version-2.6.7">
        <SectionTitle>Version 2.6.7 - 2026-08-12</SectionTitle>
        <SubSectionTitle>Changed</SubSectionTitle>
        <UL>
          <LI><STRONG>Smoother audio visualizer</STRONG>: the Suno player's <CODE>AudioVisualizer</CODE> is wrapped in <CODE>React.memo</CODE> and its <CODE>analyserNodes</CODE> prop is memoized with <CODE>useMemo</CODE>, so frequent playback time updates no longer restart its <CODE>requestAnimationFrame</CODE> loop (fixes animation micro-stutters during playback).</LI>
          <LI><STRONG>Select accessibility</STRONG>: the custom Select dropdown now exposes WAI-ARIA <CODE>listbox</CODE>/<CODE>option</CODE> roles with <CODE>aria-haspopup</CODE>, <CODE>aria-expanded</CODE> and <CODE>aria-selected</CODE> states, plus a visible <CODE>focus-visible</CODE> ring for keyboard users.</LI>
        </UL>
        <SubSectionTitle>Security</SubSectionTitle>
        <UL>
          <LI><STRONG>Stronger IDs</STRONG>: <CODE>Math.random()</CODE>-based identifiers in the Song Structure Builder and Song Deck Picker (blocks, lyric lines, imported/returned cards) are now generated with <CODE>crypto.randomUUID()</CODE>.</LI>
        </UL>
      </section>
    )
  },
  {
    version: "2.6.6",
    content: (
      <section id="version-2.6.6">
        <SectionTitle>Version 2.6.6 - 2026-08-11</SectionTitle>
        <SubSectionTitle>Changed</SubSectionTitle>
        <UL>
          <LI><STRONG>Faster stats charts</STRONG>: sunoUserStats charts now memoize their sorting/aggregation with <CODE>useMemo</CODE> and copy arrays before sorting (<CODE>[...data].sort()</CODE>), eliminating prop mutation side effects and redundant re-sorts on every render.</LI>
        </UL>
        <SubSectionTitle>Fixed</SubSectionTitle>
        <UL>
          <LI><STRONG>Modal accessibility</STRONG>: close buttons in the SunoMusicPlayer lyrics and metadata modals now carry <CODE>aria-label</CODE>s, so screen readers announce their purpose.</LI>
        </UL>
      </section>
    )
  },
  {
    version: "2.6.5",
    content: (
      <section id="version-2.6.5">
        <SectionTitle>Version 2.6.5 - 2026-08-07</SectionTitle>
        <SubSectionTitle>Changed</SubSectionTitle>
        <UL>
          <LI><STRONG>Support section revamp</STRONG>: removed the Floot referral link from the About page and made the Buy Me a Coffee button more prominent (larger, emerald-highlighted card) in both support sections.</LI>
        </UL>
      </section>
    )
  },
  {
    version: "2.6.4",
    content: (
      <section id="version-2.6.4">
        <SectionTitle>Version 2.6.4 - 2026-08-07</SectionTitle>
        <SubSectionTitle>Fixed</SubSectionTitle>
        <UL>
          <LI><STRONG>Resource Nexus cards not visible</STRONG>: the <CODE>stagger-fade</CODE> entrance animation used <CODE>animation-fill-mode: backwards</CODE>, which reverted cards to <CODE>opacity: 0</CODE> once the fade-in completed (now <CODE>both</CODE>, retaining the visible end state). Also removed <CODE>content-visibility: auto</CODE> (<CODE>cv-section</CODE>) from directory sections, which could prevent the <CODE>ScrollReveal</CODE> observer from firing for off-screen sections.</LI>
          <LI><STRONG>ScrollReveal reliability</STRONG>: <CODE>useScrollReveal</CODE> now reveals elements already in/near the viewport on mount and falls back to a scroll listener, so content is never left permanently hidden if <CODE>IntersectionObserver</CODE> never fires.</LI>
          <LI><STRONG>White-on-white titles in light mode</STRONG>: About and Special Mentions pages used hardcoded <CODE>text-white</CODE> for headings in Architect mode, making titles invisible on the light background. Now <CODE>text-gray-900 dark:text-white</CODE>.</LI>
        </UL>
      </section>
    )
  },
  {
    version: "2.6.3",
    content: (
      <section id="version-2.6.3">
        <SectionTitle>Version 2.6.3 - 2026-08-06</SectionTitle>
        <SubSectionTitle>Security</SubSectionTitle>
        <UL>
          <LI><STRONG>No sensitive data in the repo</STRONG>: <CODE>.env</CODE> is no longer tracked (untracked via <CODE>git rm --cached</CODE>), and docs/AGENTS now enforce that <CODE>.env</CODE>, <CODE>.dev.vars</CODE>, and <CODE>.wrangler/</CODE> stay out of git.</LI>
          <LI><STRONG><CODE>wrangler.toml</CODE> policy</STRONG>: documented that it holds only non-secret bindings (names, KV namespace IDs) — API keys and passwords are set exclusively via <CODE>wrangler secret put</CODE> / the dashboard, never committed.</LI>
        </UL>
      </section>
    )
  },
  {
    version: "2.6.2",
    content: (
      <section id="version-2.6.2">
        <SectionTitle>Version 2.6.2 - 2026-08-06</SectionTitle>
        <SubSectionTitle>Changed</SubSectionTitle>
        <UL>
          <LI><STRONG>Suno proxy cache optimization</STRONG>: the Worker now caches per-endpoint — clips for 24h (immutable data), profiles for 10 min, playlists for 5 min, short links for 1h. Faster repeat loads and less load on Suno.</LI>
        </UL>
      </section>
    )
  },
  {
    version: "2.6.1",
    content: (
      <section id="version-2.6.1">
        <SectionTitle>Version 2.6.1 - 2026-08-06</SectionTitle>
        <SubSectionTitle>Fixed</SubSectionTitle>
        <UL>
          <LI><STRONG>Clean console</STRONG>: <CODE>sunoService</CODE> no longer attempts the guaranteed-to-fail direct browser fetch to Suno hosts (always blocked by CORS) — it goes straight to the Cloudflare Worker proxy, eliminating CORS error spam in the browser console.</LI>
        </UL>
      </section>
    )
  },
  {
    version: "2.6.0",
    content: (
      <section id="version-2.6.0">
        <SectionTitle>Version 2.6.0 - 2026-08-06</SectionTitle>
        <SubSectionTitle>Added</SubSectionTitle>
        <UL>
          <LI><STRONG>Definitive Suno Proxy</STRONG>: Suno API calls now route through the app's own Cloudflare Worker (<CODE>GET /suno/*</CODE>) instead of unreliable public CORS proxies. The Worker fetches Suno server-side (no browser CORS), caches responses at the edge for 10 minutes, and returns proper CORS headers. Public proxies remain only as a last-resort fallback.</LI>
          <LI><STRONG>Short URL Resolution via Worker</STRONG>: <CODE>suno.com/s/...</CODE> links are resolved through the Worker (<CODE>GET /suno-web/*</CODE>) first, falling back to public proxies.</LI>
        </UL>
        <SubSectionTitle>Changed</SubSectionTitle>
        <UL>
          <LI><STRONG>sunoService</STRONG>: Worker proxy URL is configurable via <CODE>VITE_SUNO_WORKER_URL</CODE> for local testing (pointing at a local <CODE>wrangler dev</CODE> instance).</LI>
        </UL>
        <SubSectionTitle>Fixed</SubSectionTitle>
        <UL>
          <LI><STRONG>Suno CORS errors</STRONG>: Profile, playlist and clip fetches no longer fail when free CORS proxies are down (thingproxy, corsproxy.org, yacdn, codetabs, etc.).</LI>
        </UL>
      </section>
    )
  },
  {
    version: "2.5.5",
    content: (
      <section id="version-2.5.5">
        <SectionTitle>Version 2.5.5 - 2026-08-06</SectionTitle>
        <SubSectionTitle>Fixed</SubSectionTitle>
        <UL>
          <LI><STRONG>Release Notes Fallback</STRONG>: GitHub releases whose bodies lack <CODE>###</CODE> section headers (older releases published as plain commit-subject lists) now render their content as a fallback bullet list instead of showing only the version title.</LI>
        </UL>
      </section>
    )
  },
  {
    version: "2.4.0",
    content: (
      <section id="version-2.4.0">
        <SectionTitle>Version 2.4.0 - 2025-08-05</SectionTitle>
        <SubSectionTitle>Added</SubSectionTitle>
        <UL>
          <LI><STRONG>Service Layer Caching</STRONG>: Added persistent caching layer for Suno clip data, Riffusion song data, and short URL resolutions to reduce redundant network requests.</LI>
          <LI><STRONG>Parallel Proxy Racing</STRONG>: Both <CODE>sunoService</CODE> and <CODE>riffusionService</CODE> now race all CORS proxies in parallel — the first successful response wins, dramatically improving fetch reliability.</LI>
          <LI><STRONG>Animated Stat Counters</STRONG>: Added <CODE>useCountUp</CODE> hook with animated number transitions on the Analytics dashboard.</LI>
          <LI><STRONG>ScrollReveal Component</STRONG>: New stagger-fade scroll animation wrapper for resource directory and compliance tool.</LI>
          <LI><STRONG>Toast & Error Boundary</STRONG>: Added <CODE>ToastProvider</CODE> for transient notifications and <CODE>ToolErrorBoundary</CODE> for graceful tool-level crash recovery.</LI>
          <LI><STRONG>Chart.js Centralized Setup</STRONG>: Moved all Chart.js registration to <CODE>chartSetup.ts</CODE> to eliminate redundant imports.</LI>
          <LI><STRONG>Manual Vite Chunking</STRONG>: Configured <CODE>rollupOptions.manualChunks</CODE> to split vendor dependencies, reducing main bundle size.</LI>
        </UL>
        <SubSectionTitle>Changed</SubSectionTitle>
        <UL>
          <LI><STRONG>AI Analysis Service</STRONG>: Added 30s request timeout and external abort signal support; refactored code-fence stripping into reusable <CODE>stripCodeFence</CODE> utility.</LI>
          <LI><STRONG>Gemini Proxy Calls</STRONG>: Enhanced error handling with distinct timeout vs. cancellation error messages.</LI>
          <LI><STRONG>CSS Transition Optimization</STRONG>: Replaced generic <CODE>transition-all</CODE> with specific property transitions (<CODE>transition-[transform,box-shadow,...]</CODE>) for better rendering performance.</LI>
          <LI><STRONG>Image Loading</STRONG>: Added <CODE>loading="lazy"</CODE> and <CODE>decoding="async"</CODE> to all image elements for deferred loading and non-blocking decode.</LI>
          <LI><STRONG>Sidebar Migration</STRONG>: Moved sidebar component from <CODE>src/Sidebar.tsx</CODE> to <CODE>src/components/Sidebar.tsx</CODE>.</LI>
          <LI><STRONG>Title Styling</STRONG>: Applied gradient animated text to About, Release Notes, and Analytics page headers.</LI>
          <LI><STRONG>Tailwind Config</STRONG>: Removed unused <CODE>classic-header</CODE> and <CODE>classic-body</CODE> font families.</LI>
        </UL>
        <SubSectionTitle>Removed</SubSectionTitle>
        <UL>
          <LI><STRONG>Dead Code</STRONG>: Deleted empty placeholder services (<CODE>geminiService.ts</CODE>, <CODE>huggingfaceService.ts</CODE>) and old <CODE>src/Sidebar.tsx</CODE>.</LI>
          <LI><STRONG>StatChartsPlaceholder</STRONG>: Removed empty placeholder component.</LI>
          <LI><STRONG>Console Log Cleanup</STRONG>: Stripped noisy debug <CODE>console.log</CODE> statements from <CODE>sunoService.ts</CODE> and <CODE>riffusionService.ts</CODE>.</LI>
        </UL>
      </section>
    )
  },
  {
    version: "2.3.0",
    content: (
      <section id="version-2.3.0">
        <SectionTitle>Version 2.3.0 - 2026-03-31</SectionTitle>
        <SubSectionTitle>Changed</SubSectionTitle>
        <UL>
          <LI><STRONG>Mobile UI & Accessibility Refinement</STRONG>: Performed a high-precision overhaul for 375px+ viewports. Standardized responsive paddings and eliminated horizontal overflow across all tools.</LI>
          <LI><STRONG>Light Mode Visual Polish</STRONG>: Extensive theme-aware refactoring for <CODE>Suno Music Player</CODE>, <CODE>Visual Synth</CODE>, and <CODE>Creative Concept Blender</CODE>. Replaced hardcoded charcoal regions with dynamic, translucent slate surfaces.</LI>
          <LI><STRONG>Audio Visualizer Redesign</STRONG>: Upgraded the visualizer with a premium glassmorphic background (<CODE>backdrop-blur</CODE>), <CODE>rounded-3xl</CODE> corners, and theme-sensitive border contrast.</LI>
          <LI><STRONG>Suno Music Player Refinement</STRONG>: Control buttons (Previous, Next, Shuffle) and volume sliders now feature improved visibility and interaction states in Light Mode.</LI>
          <LI><STRONG>Sidebar UX Optimization</STRONG>: Removed redundant application titles from the sidebar drawer to maximize vertical space and decrease visual clutter on mobile devices.</LI>
        </UL>
        <SubSectionTitle>Fixed</SubSectionTitle>
        <UL>
          <LI><STRONG>Community Spinner Polish</STRONG>: Resolved the "flashing blue square" glitch by implementing custom focus rings and a more elegant <CODE>pulse-gentle</CODE> animation for the Spin button.</LI>
          <LI><STRONG>Text Contrast</STRONG>: Audited and corrected low-contrast technical status labels (e.g., "System Idle", "Waiting for Signal") across the Hub.</LI>
        </UL>
      </section>
    )
  },
  {
    version: "2.2.0",
    content: (
      <section id="version-2.2.0">
        <SectionTitle>Version 2.2.0 - 2026-03-11</SectionTitle>
        <SubSectionTitle>Added</SubSectionTitle>
        <UL>
          <LI><STRONG>Hub Stats Page</STRONG>: New interactive dashboard for site-wide telemetry and visitor analytics.</LI>
          <LI><STRONG>Interactive World Map</STRONG>: Real-time visualization of global activity with country-level breakdown.</LI>
          <LI><STRONG>Centralized Icon System</STRONG>: Introduced <CODE>components/Icons.tsx</CODE> to unify SVG icons across the application.</LI>
        </UL>
        <SubSectionTitle>Changed</SubSectionTitle>
        <UL>
          <LI><STRONG>Performance</STRONG>: Optimized Hub Stats loading state with a smaller, more integrated Spinner.</LI>
        </UL>
        <SubSectionTitle>Fixed</SubSectionTitle>
        <UL>
          <LI><STRONG>Map Visualization</STRONG>: Resolved prorejection scaling and centering issues to prevent geographical truncation (e.g., Greenland/Russia).</LI>
          <LI><STRONG>Data Accuracy</STRONG>: Standardized site metrics to track "Visits" instead of "Installations".</LI>
          <LI><STRONG>Visual Consistency</STRONG>: Replaced emoji placeholders with premium SVG icons in the Stats dashboard.</LI>
        </UL>
      </section>
    )
  },
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
