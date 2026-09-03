# Antigravity Context File

## 🧠 Project Philosophy
- **Name**: Music AI Multi-Tool Hub
- **Goal**: A premium, state-of-the-art suite of AI music creative tools, offering a unified dashboard for AI music production.
- **Tone**: Professional, highly functional, with an emphasis on "Premium" aesthetics (dark mode, glassmorphism, smooth animations).

## 🛠 Tech Stack & Conventions
- **Framework**: React 19, TypeScript, Vite.
- **Styling**: TailwindCSS (Custom configuration).
- **Service Layer**: Pure TypeScript abstractions in `services/` (Suno, Riffusion, Gemini, HuggingFace).
- **Communication**: Local event tracking via `localStorage` in `Layout.tsx`.
- **Orchestration**: Deployed as a static SPA on **Cloudflare Pages**.
- **API Proxy**: Cloudflare Worker (`gemini-proxy`) handles Gemini calls, telemetry, visitor statistics, and Suno API proxying (with per-endpoint cache TTLs). Secrets never reach the frontend bundle.
- **Iconography**: Centralized SVG icons in `components/Icons.tsx` for consistent premium branding.

## 📐 Architecture Overview
- **Main Shell (`Layout.tsx`)**: Central hub managing tool registration, navigation state, and theme management.
- **Tool Registry**: Modular structure where each tool is a focused React component.
- **Navigation (`Sidebar.tsx`)**: Categorized access to all tools (App & Info, AI Music Platforms, Creative AI, etc.).
- **Telemetry & Stats**: Visitor data and site-wide metrics are visualized in the **Hub Stats** page using `react-simple-maps` and Chart.js.

## 🔊 Suno Audio Access Strategy (IMPORTANT — VERIFIED TOS-COMPLIANT)
- **Background**: The Suno API now returns `audio_url: "https://studio-api.prod.suno.com/api/forbidden"` for many clips, and CDN mp3 links (`cdn1.suno.ai/<id>.mp3`) return 403.
- **TOS compliance (verified)**: Suno's ToS (rev. 2026-08-10, eff. 2026-09-03) — *"Obtaining a copy of an Output by any means other than a download channel made available by Suno is prohibited (for example, recording or stream ripping are prohibited)"* — and the public download policy (streaming is unlimited only *on/through Suno*) mean loading **any** raw Suno CDN media (`.m4a`, `.mp3` `audio_url`, or `.mp4` `video_url`) into our own players/analysis tools is **NOT TOS-compliant** (equivalent to stream-ripping).
- **Only two compliant playback paths**: (1) the official Suno iframe embed `https://suno.com/embed/<id>` (Suno's sanctioned hosted player), and (2) user-uploaded files.
- **Music Player (`useSunoAudioPlayer.ts` + `SunoMusicPlayerTool.tsx`)**: Suno clips always render the official iframe embed via `embedClipId` (EQ/Snippet/seek/volume disabled — ownership moves to Suno's player). **Only Riffusion / Flow Music** (`song.source === 'riffusion'`) stream via Howler using their own accessible GCS `.m4a` URLs.
- **Analysis tools** (MP3 Cutter, BPM Tapper, Lyrics Synchronizer): never auto-fetch Suno audio. They populate the song's metadata (title/artist/cover/lyrics) and ask the user to download + upload an MP3.
- **Compliance tool**: previews via the Suno iframe embed, not an `<audio>` tag.
- **Helpers**: `isAudioUrlBroken(url)` (detects `forbidden`), `getSunoEmbedUrl(clipId)` (builds embed URL). `Riffusion is separate` (`riffusionService.ts`).

## ⚠️ Important Rules for AI
1. **Build verification**: Run `npm run build` locally to verify changes compile without errors before submitting.
2. **Language**: English is the primary language for all interfaces and developer documentation.
3. **Architecture**: Always follow the Tool-Component pattern. Use existing hooks and utility functions for music theory or image processing.
4. **Security**: **CRITICAL**. API keys (`GEMINI_API_KEY`) and secrets live exclusively in the **Cloudflare Worker** — never hardcoded in source files or env vars that get compiled into the bundle.
5. **Data Masking & Privacy**: Mask all tokens in logs and UI displays (e.g., `key.slice(0, 4) + '...'`).
6. **Never commit secrets**: `.env`, `.env.*`, `.dev.vars`, and `.wrangler/` must stay untracked (`.gitignore` is configured). `wrangler.toml` must never contain secrets — only non-secret bindings (names, KV namespace IDs). Worker secrets are set via `wrangler secret put` or the dashboard.

## 🏷️ Versioning Strategy

### Semantic Versioning: `MAJOR.MINOR.PATCH`

| Version Type | Format | When to Use |
|--------------|--------|-------------|
| **Patch Release** | `x.x.PATCH` | Bug fixes, UI polish, internal service improvements |
| **Minor Release** | `x.MINOR.0` | New tool additions, significant feature updates, backward compatible |
| **Major Release** | `MAJOR.0.0` | Core architecture shifts, breaking framework updates, major design overhauls |

### Release Workflow

1. **Test**: Local `npm run build` + browser verification at `http://localhost:3000`.
2. **Tag**: Versioning is Git-Tag driven (e.g., `v1.0.1`).
3. **Deploy**: Push to `main` — Cloudflare Pages auto-deploys.

## 📝 Current Focus
- Performance optimization for heavy media processing tools (MP3 Cutter, Image Crop).
- Expanding the AI Music Platform integration layer (more Suno/Riffusion features).
- Perfection of the "Premium" Hub aesthetic across all creative tools.
