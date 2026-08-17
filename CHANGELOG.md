# Changelog

<!--
GUIDA RAPIDA ALL'AGGIORNAMENTO:
1. Aggiungi una nuova sezione in cima sotto un'intestazione '## [Versione] - Data'
2. Usa '### Added', '### Changed', '### Removed', '### Fixed' per categorizzare i cambi.
3. Usa i punti elenco '- ' per ogni voce.
4. Salva il file.
5. L'app si aggiornerà automaticamente al prossimo 'npm run dev' o al push su GitHub.
-->

## [2.6.13] - 2026-08-17

### Changed
- **Optimized Music Theory Wiki search**: cached parsed HTML content in a `useMemo` map to prevent expensive `ReactDOMServer.renderToStaticMarkup` calls on every keystroke during search, improving responsiveness.

### Added
- **Wiki search optimization notes**: added learning documentation in `.jules/bolt.md` about caching React content trees for search.

## [2.6.12] - 2026-08-16

### Added
- **Keyboard-accessible file uploads**: custom file upload buttons in the Suno player playlist manager now support `tabIndex`, `role="button"`, and Enter/Space key handling with visible focus rings, so keyboard and screen-reader users can trigger TXT/CSV playlist imports.
- **ARIA labels for icon-only buttons**: randomize buttons in Song Cover Art and SparkTune, plus the preset delete button, now carry descriptive `aria-label`s so screen readers announce their purpose.

### Changed
- **Faster Sidebar re-renders**: the Sidebar component is wrapped in `React.memo` and the tool grouping is memoized with `useMemo`, cutting CPU time on every render.

### Fixed
- **Reverse tabnabbing**: `window.open(..., '_blank')` calls in the Sidebar and About page now pass `'noopener,noreferrer'`, preventing newly opened pages from accessing the opener window.

## [2.6.11] - 2026-08-14

### Changed
- **No more public CORS proxy fallbacks**: the Suno service now relies strictly on the verified Cloudflare Worker proxy for all fetches and short-URL resolution, removing the hardcoded fallback chain of unvetted public proxies (corsproxy.io, allorigins, thingproxy, cors-anywhere, etc.).

### Security
- **Removed unvetted public CORS proxies**: third-party public proxy fallbacks could intercept traffic and exposed the app to SSRF-style risks; all Suno API reads and `suno.com/song` link resolution now go through the Worker proxy only.

## [2.6.10] - 2026-08-14

### Changed
- **Accessible import/export modals**: the Suno community spinner's export textarea now carries an `aria-label`, the import file picker and JSON textarea have proper `htmlFor`/`id` label associations, so screen readers announce these fields correctly.

## [2.6.9] - 2026-08-13

### Changed
- **Faster Suno player re-renders**: `SunoMusicPlayerTool` is wrapped in `React.memo`, so the component no longer re-renders when parent state changes without prop updates.

## [2.6.8] - 2026-08-13

### Changed
- **Accessible buttons**: the shared `Button` component now shows a visible emerald keyboard focus ring (`focus-visible:ring-2`) on the "Report a bug" links across the Sidebar and About page, so keyboard users can tell where they are.

### Security
- **Safe external links**: all "Report a bug" links opening in a new tab now include `rel="noopener noreferrer"`, preventing the opened page from hijacking the app via `window.opener`.

## [2.6.7] - 2026-08-12

### Changed
- **Smoother audio visualizer**: the Suno player's `AudioVisualizer` is wrapped in `React.memo` and its `analyserNodes` prop is memoized with `useMemo`, so frequent playback time updates no longer restart its `requestAnimationFrame` loop (fixes animation micro-stutters during playback).
- **Select accessibility**: the custom Select dropdown now exposes WAI-ARIA `listbox`/`option` roles with `aria-haspopup`, `aria-expanded` and `aria-selected` states, plus a visible `focus-visible` ring for keyboard users.

### Security
- **Stronger IDs**: `Math.random()`-based identifiers in the Song Structure Builder and Song Deck Picker (blocks, lyric lines, imported/returned cards) are now generated with `crypto.randomUUID()`.

## [2.6.6] - 2026-08-11

### Changed
- **Faster stats charts**: sunoUserStats charts now memoize their sorting/aggregation with `useMemo` and copy arrays before sorting (`[...data].sort()`), eliminating prop mutation side effects and redundant re-sorts on every render.

### Fixed
- **Modal accessibility**: close buttons in the SunoMusicPlayer lyrics and metadata modals now carry `aria-label`s, so screen readers announce their purpose.

## [2.6.5] - 2026-08-07

### Changed
- **Support section revamp**: removed the Floot referral link from the About page and made the Buy Me a Coffee button more prominent (larger, emerald-highlighted card) in both support sections.

## [2.6.4] - 2026-08-07

### Fixed
- **Resource Nexus cards not visible**: the `stagger-fade` entrance animation used `animation-fill-mode: backwards`, which reverted cards to `opacity: 0` once the fade-in completed (now `both`, retaining the visible end state). Also removed `content-visibility: auto` (`cv-section`) from directory sections, which could prevent the `ScrollReveal` observer from firing for off-screen sections.
- **ScrollReveal reliability**: `useScrollReveal` now reveals elements already in/near the viewport on mount and falls back to a scroll listener, so content is never left permanently hidden if `IntersectionObserver` never fires.
- **White-on-white titles in light mode**: About and Special Mentions pages used hardcoded `text-white` for headings in Architect mode, making titles invisible on the light background. Now `text-gray-900 dark:text-white`.

## [2.6.3] - 2026-08-06

### Security
- **No sensitive data in the repo**: `.env` is no longer tracked (untracked via `git rm --cached`), and docs/AGENTS now enforce that `.env`, `.dev.vars`, and `.wrangler/` stay out of git.
- **`wrangler.toml` policy**: documented that it holds only non-secret bindings (names, KV namespace IDs) — API keys and passwords are set exclusively via `wrangler secret put` / the dashboard, never committed.

## [2.6.2] - 2026-08-06

### Changed
- **Suno proxy cache optimization**: the Worker now caches per-endpoint — clips for 24h (immutable data), profiles for 10 min, playlists for 5 min, short links for 1h. Faster repeat loads and less load on Suno.

## [2.6.1] - 2026-08-06

### Fixed
- **Clean console**: `sunoService` no longer attempts the guaranteed-to-fail direct browser fetch to Suno hosts (always blocked by CORS) — it goes straight to the Cloudflare Worker proxy, eliminating CORS error spam in the browser console.

## [2.6.0] - 2026-08-06

### Added
- **Definitive Suno Proxy**: Suno API calls now route through the app's own Cloudflare Worker (`GET /suno/*`) instead of unreliable public CORS proxies. The Worker fetches Suno server-side (no browser CORS), caches responses at the edge for 10 minutes, and returns proper CORS headers. Public proxies remain only as a last-resort fallback.
- **Short URL Resolution via Worker**: `suno.com/s/...` links are resolved through the Worker (`GET /suno-web/*`) first, falling back to public proxies.

### Changed
- **sunoService**: Worker proxy URL is configurable via `VITE_SUNO_WORKER_URL` for local testing (pointing at a local `wrangler dev` instance).

### Fixed
- **Suno CORS errors**: Profile, playlist and clip fetches no longer fail when free CORS proxies are down (thingproxy, corsproxy.org, yacdn, codetabs, etc.).

## [2.5.5] - 2026-08-06

### Fixed
- **Release Notes Fallback**: GitHub releases whose bodies lack `###` section headers (older releases published as plain commit-subject lists) now render their content as a fallback bullet list instead of showing only the version title.

## [2.4.0] - 2025-08-05

### Added
- **Service Layer Caching**: Added persistent caching layer for Suno clip data, Riffusion song data, and short URL resolutions to reduce redundant network requests.
- **Parallel Proxy Racing**: Both `sunoService` and `riffusionService` now race all CORS proxies in parallel — the first successful response wins, dramatically improving fetch reliability.
- **Animated Stat Counters**: Added `useCountUp` hook with animated number transitions on the Analytics dashboard.
- **ScrollReveal Component**: New stagger-fade scroll animation wrapper for resource directory and compliance tool.
- **Toast & Error Boundary**: Added `ToastProvider` for transient notifications and `ToolErrorBoundary` for graceful tool-level crash recovery.
- **Chart.js Centralized Setup**: Moved all Chart.js registration to `chartSetup.ts` to eliminate redundant imports.
- **Manual Vite Chunking**: Configured `rollupOptions.manualChunks` to split vendor dependencies, reducing main bundle size.

### Changed
- **AI Analysis Service**: Added 30s request timeout and external abort signal support; refactored code-fence stripping into reusable `stripCodeFence` utility.
- **Gemini Proxy Calls**: Enhanced error handling with distinct timeout vs. cancellation error messages.
- **CSS Transition Optimization**: Replaced generic `transition-all` with specific property transitions (`transition-[transform,box-shadow,...]`) for better rendering performance.
- **Image Loading**: Added `loading="lazy"` and `decoding="async"` to all image elements for deferred loading and non-blocking decode.
- **Sidebar Migration**: Moved sidebar component from `src/Sidebar.tsx` to `src/components/Sidebar.tsx`.
- **Title Styling**: Applied gradient animated text to About, Release Notes, and Analytics page headers.
- **Tailwind Config**: Removed unused `classic-header` and `classic-body` font families.

### Removed
- **Dead Code**: Deleted empty placeholder services (`geminiService.ts`, `huggingfaceService.ts`) and old `src/Sidebar.tsx`.
- **StatChartsPlaceholder**: Removed empty placeholder component.
- **Console Log Cleanup**: Stripped noisy debug `console.log` statements from `sunoService.ts` and `riffusionService.ts`.

## [2.3.0] - 2026-03-31

### Changed
- **Mobile UI & Accessibility Refinement**: Performed a high-precision overhaul for 375px+ viewports. Standardized responsive paddings and eliminated horizontal overflow across all tools.
- **Light Mode Visual Polish**: Extensive theme-aware refactoring for `Suno Music Player`, `Visual Synth`, and `Creative Concept Blender`. Replaced hardcoded charcoal regions with dynamic, translucent slate surfaces.
- **Audio Visualizer Redesign**: Upgraded the visualizer with a premium glassmorphic background (`backdrop-blur`), `rounded-3xl` corners, and theme-sensitive border contrast.
- **Suno Music Player Refinement**: Control buttons (Previous, Next, Shuffle) and volume sliders now feature improved visibility and interaction states in Light Mode.
- **Sidebar UX Optimization**: Removed redundant application titles from the sidebar drawer to maximize vertical space and decrease visual clutter on mobile devices.

### Fixed
- **Community Spinner Polish**: Resolved the "flashing blue square" glitch by implementing custom focus rings and a more elegant `pulse-gentle` animation for the Spin button.
- **Text Contrast**: Audited and corrected low-contrast technical status labels (e.g., "System Idle", "Waiting for Signal") across the Hub.

## [2.2.0] - 2026-03-11

### Added
- **Hub Stats Page**: New interactive dashboard for site-wide telemetry and visitor analytics.
- **Interactive World Map**: Real-time visualization of global activity with country-level breakdown.
- **Centralized Icon System**: Introduced `components/Icons.tsx` to unify SVG icons across the application.

### Changed
- **Performance**: Optimized Hub Stats loading state with a smaller, more integrated Spinner.

### Fixed
- **Map Visualization**: Resolved prorejection scaling and centering issues to prevent geographical truncation (e.g., Greenland/Russia).
- **Data Accuracy**: Standardized site metrics to track "Visits" instead of "Installations".
- **Visual Consistency**: Replaced emoji placeholders with premium SVG icons in the Stats dashboard.

## [2.1.0] - 2026-03-11

### Fixed
- **Full Mobile Responsiveness Overhaul**: Eliminated horizontal overflow across the entire application, focusing on the Suno User Stats tool.
- **Aggressive Spacing Optimization**: Reclaimed horizontal space by zeroing out paddings on mobile containers (`Layout`, `Tool Container`, `ChartContainer`).
- **Responsive Charts**: Implemented dynamic scaling for Chart.js labels, padding, and decimal precision (e.g., rounding percentages on mobile).
- **Responsive Tables**: Added intelligent header abbreviations (e.g., "Avg Plays" &rarr; "Plays") and cell compaction for small screens.
- **Header Scaling**: Optimized the main header to ensure branding remains on a single line on all devices using dynamic font sizes and ellipsis.
- **Clean UI**: Removed redundant mobile-only "small screen" warning as the UI is now fully optimized.

## [2.0.0] - 2026-02-22

### Added
- **Cloudflare Pages Migration**: The Hub is now a pure static site deployed on Cloudflare Pages.
- **Gemini Proxy Worker**: Introduced a Cloudflare Worker (`gemini-proxy`) to secure API calls.
- **Server-side Password Verification**: "Committee" password is now verified via Worker secrets, removing it from the client bundle.
- **Public Repository Readiness**: Performed a full security audit and git history scrub for open-source release.
- **Official Open-Source Launch**: The repository is now public on GitHub!
- **Removed Obsolete Links**: Deleted the unused Community Feedback Board links from the Sidebar and About page.

### Changed
- **Architecture**: Transitioned from Docker/Nginx/CORS-Proxy to a modern serverless stack.
- **Documentation**: Completely rewritten README, DEPLOYMENT, and CONTEXT guides.
- **Environment**: Simplified local setup by utilizing the production Worker as a proxy.

### Removed
- **Legacy Infrastructure**: Deleted `Dockerfile`, `docker-compose.yml`, and Watchtower configurations.
- **CI/CD**: Removed GitHub Actions for Docker builds in favor of Cloudflare Pages' native builds.
- **Dead Code**: Removed unused `release-notes/` TSX components.

---

## [1.9.8] - 2026-02-21

### Added
- **Lyric Processor Meta Update**: Enhanced metadata and legal clarity for processed lyrics.
- **Copyright Disclaimer**: Automatically appended to cleaned lyrics.
- **Creator Handle Capture**: Intelligent extraction from Suno/Riffusion URLs.

---

## [1.9.7] - 2026-02-21

### Added
- **About Page Enhancements**: 
  - **Quick Start Workflows Section**: Added a goal-oriented section to help newcomers find the right tools.
  - **Goal-Oriented Navigation**: Cards like "I need inspiration...", "I'm writing a song..." with direct tool links.
- **Improved Onboarding**: Better discoverability by turning the Hub into a guided creative suite.

---

## [1.9.6] - 2026-02-21

### Added
- **Producer.AI Integration**: 
  - Seamless support for `producer.ai` URLs across the Hub.
  - Automatic extraction of song IDs and transformation to `riffusion.com` format.
- **Tool Updates**: 
  - Music Shuffler, Compliance Checker, Cover Art Creator, MP3 Cutter, Lyric Processor, Lyrics Synchronizer, and Song Deck Picker all support Producer.AI links.

---

## [1.9.5] - 2026-02-21

### Added
- **Ranking Reveal Mode (Song Deck Picker)**: 
  - **New Game-like Reveal**: Cards are face-down and revealed in reverse rank order (from #10 to #1).
  - **Special Previews**: Top-ranked cards trigger flip animations and audio snippets in an enlarged modal.
- **UI Polish**: 
  - Enhanced modal display preserves aspect ratio and visual elements.
  - Improved interaction flow for closing modals.

---

## [1.9.4] - 2026-02-21

### Added
- **Song Structure Builder "Power-Up"**: 
  - **Line-by-Line Lyric Management**: Dedicated lyric editor for each block on the timeline.
  - **Automatic Version Control**: Saves drafts on blur with a history modal for easy reverting.
  - **Live Syllable Counting**: Real-time syllable counter for each lyric line.
- **Saved Arrangement Management**: 
  - **Safe Deletion**: 3-click confirmation for deleting saved arrangements.
  - **New Import/Export**: Export to `.txt` (AI prompt format) or `.csv`.
- **Lyric Utils**: Shared syllable counting logic moved to `utils/lyricUtils.ts`.

---

## [1.9.3] - 2026-02-21

### Added
- **Riffusion Integration Across Tools**: 
  - **Music Shuffler**: Load and play Riffusion tracks.
  - **Song Cover Art Creator**: Fetch info/artwork from Riffusion URLs.
  - **Lyric Processor**: Fetch lyrics/title/artist from Riffusion links.
  - **MP3 Cutter**: Load audio directly from Riffusion songs.

---

## [1.9.2] - 2026-02-21

### Added
- **MP3 Cutter Riffusion Support**: Load and edit audio directly from Riffusion song URLs. Fetch metadata and stream automatically.

---

## [1.9.1] - 2026-02-20

### Added
- **Music Shuffler Riffusion Integration**: Support for `riffusion.com/song/...` URLs with multi-platform playlist capability.
- **Hub Reorganization**: 
  - New **"AI Music Platforms"** sidebar category.
  - Moved Music Shuffler, User Stats, and Song Compliance under the new category.

---

## [1.9.0] - 2026-02-20

### Added
- **SparkTune Super-Generator**: 
  - **Creative Constraints**: Vocal Style (with randomizer), Tempo (BPM), and Negative Constraints.
  - **Dual Post Generation**: Distinct Announcement and Reminder posts with tabbed navigation.
  - **Smarter Content**: Dynamic hashtags and intelligent line omission for blank fields.

---

## [1.8.9] - 2026-02-20

### Added
- **Lyrics Synchronizer Layout**: 
  - Player controls relocated to the load section for better flow.
  - Single-column layout for the synchronization interface.
  - Scrollable lyrics list with max height.

---

## [1.8.8] - 2026-02-19

### Added
- **Suno Shuffler Improvements**: 
  - **Remove Song from Playlist**: Trash can icon added to queue items for individual removal.
  - **UI Fixes**: Shortened example URL text to prevent overflow on mobile.

---

## [1.8.7] - 2026-02-19

### Added
- **Snippet Mode**: 30-second random song previews for rapid discovery in Suno Music Shuffler.
- **Reveal Cards Mode (Song Deck Picker)**: Face-down card game with customizable card backs.
- **Technical Fixes**: 
  - Fixed `SyntaxError` in placeholder files.
  - Corrected TypeScript types for browser timers and audio player.

---

## [1.8.6] - 2026-02-19

### Added
- **Suno User Stats "Data Nerd" Pack**: 
  - **Song Performance Lifecycle Modal**: Detailed line charts for individual song growth.
  - **Plays vs. Comments Scatter Plot**: Identify "talkable" songs based on engagement rates.
  - **Cross-Chart Filtering**: Click chart data to filter the performance table.
  - **Stickiness Metrics**: Avg. Upvote/Comment rates for Tags and Genres.
  - **Duration Buckets**: Performance analysis grouped by song length.

---

## [1.8.5] - 2026-02-18

### Added
- **Duration Check (Compliance)**: Configurable duration limits (default 300s) for batch song validation. Includes CSV and summary report updates.

---

## [1.8.4] - 2026-02-18

### Added
- **Custom URL Lists (Shuffler)**: Input a raw list of Suno URLs (one per line) to create on-the-fly playlists.

---

## [1.8.2] - 2026-02-18

### Added
- **MP3 Cutter Enhancements**: Cover art display, MP3 export (via `lamejs`), and legal copyright disclaimer.

---

## [1.8.0] - 2026-02-17

### Added
- **New Tool: MP3 Cutter & Cropper**: Visual waveform editing via `wavesurfer.js`, precise region selection, and audio export.

---

## [1.7.6] - 2026-02-16

### Added
- **Comment Engagement Tracking**: Integrated comment counts across Stats charts, Shuffler queue, and Player info.

---

## [1.7.4] - 2026-02-15

### Added
- **New Tool: Local Music Resource Directory**: Curated hub for samples, communities, and production tutorials.

---

## [1.7.0] - 2026-02-15

### Added
- **OS Media Control Integration**: Robust Media Session API support for lock screen controls.
- **Direct Suno Links**: Clickable cover art in player to open song on Suno.com.

---

## [1.6.0] - 2026-02-15

### Added
- **Follower Growth Metrics**: 7d/30d growth rates and percentage displays.
- **Operational Security**: Password gating for AI compliance checks.

---

## [1.5.0] - 2026-02-15

### Added
- **Suno Song Compliance Checker**: Batch processing, Gemini AI lyrics analysis, selectable content ratings (G to R), and CSV export.

---

## [1.0.0] - 2026-02-14

### Added
- **Initial Launch**: 20+ specialized AI music tools including Suno Shuffler, Lyric Processor, Style Generator, Concept Blender, and Music Theory Wiki.
