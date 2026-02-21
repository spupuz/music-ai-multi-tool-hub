# Changelog

<!--
GUIDA RAPIDA ALL'AGGIORNAMENTO:
1. Aggiungi una nuova sezione in cima sotto un'intestazione '## [Versione] - Data'
2. Usa '### Added', '### Changed', '### Removed', '### Fixed' per categorizzare i cambi.
3. Usa i punti elenco '- ' per ogni voce.
4. Salva il file.
5. L'app si aggiornerà automaticamente al prossimo 'npm run dev' o al push su GitHub.
-->

## [2.0.0] - 2026-02-22

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
