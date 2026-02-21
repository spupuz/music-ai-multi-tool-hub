<p align="center">
  <img src="https://music-ai-multi-tool-hub.pages.dev/favicon.ico" alt="Music AI Multi-Tool Hub" width="80">
</p>

# 🎵 Music AI Multi-Tool Hub

A premium suite of **20+ specialized tools** for AI music creators, producers, and enthusiasts — deployed as a static web app on **Cloudflare Pages**.

> **Live**: [music-ai-multi-tool-hub.pages.dev](https://music-ai-multi-tool-hub.pages.dev)

---

## ✨ Key Features

| Feature | Description |
|---------|-------------|
| 🎵 **20+ Music Tools** | From shufflers and cutters to theory generators |
| 🤖 **AI Integration** | Suno, Riffusion/Producer.AI, and Google Gemini |
| 🎨 **Creative Studio** | Cover art, lyric processing, karaoke sync |
| ☁️ **Cloudflare Powered** | Zero-server static deployment with Worker-side AI proxy |
| 🔒 **Secrets in Worker** | Gemini API key never touches the frontend bundle |
| ⚡ **Modern Stack** | React 19, Vite, TypeScript |

---

## 🛠 Tools

### 🤖 AI Music Platforms
- **Music Shuffler** — Play Suno/Riffusion/Producer.AI libraries with 10-band EQ
- **Suno User Stats** — Creator metrics and activity trends
- **Song Compliance Checker** — AI-powered title, duration, and lyrics verification via Gemini

### ✍️ Creative AI & Content
- **Lyric Processor** — Text cleaning, syllable counting, AI-prompt formatting
- **Lyrics Synchronizer** — LRC karaoke file generation
- **Song Cover Art Creator** — Artwork with text overlays and image filters
- **MP3 Cutter & Cropper** — Visual waveform-based audio editing
- **Song Structure Builder** — Visualize musical arrangements

### 🎼 Theory & Inspiration
- **Music Style Generator** — Multi-layered genre/mood/sound design prompts
- **Creative Concept Blender** — Mix artistic concepts into unique themes
- **Chord Progression Generator** — Diatonic progressions in any key/mode with MIDI export
- **Scale & Chord Viewer** — Interactive ear training and harmonic mapping
- **Music Theory Wiki** — Searchable guide on arrangement and AI prompting

### 🎲 Community & Fun
- **Magic Spin Wheel** — Mini-challenges for the Suno community
- **Song Deck Picker** — Card-based collection manager
- **SparkTune Challenge** — Formatted community posts for timed challenges

---

## 🚀 Quick Start (Local Dev)

```bash
git clone https://github.com/spupuz/music-ai-multi-tool-hub.git
cd music-ai-multi-tool-hub
cp .env.example .env   # Add GEMINI_API_KEY
npm install
npm run dev            # http://localhost:3000
```

---

## 🏗 Architecture

```
Browser → Cloudflare Pages (static SPA)
              ↓ (AI requests)
         Cloudflare Worker (gemini-proxy)
              ↓ (API key as Worker secret)
         Google Gemini API
```

- **All secrets** (`GEMINI_API_KEY`, `COMMITTEE_PASSWORD`) live as **Worker secrets** — never in the JS bundle
- **SPA routing** handled via `public/_redirects`
- **Gemini proxy** at `gemini-proxy.spupuz.workers.dev`

---

## 💬 Support & Feedback

- Reach out to **@spupuz** or **@flickerlog** on Discord
- Use the **Community Feedback Board** in the sidebar

---

## 📄 License

For personal and creative use. **PROVIDED "AS IS"** without warranty.