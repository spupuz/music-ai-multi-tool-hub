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
- **API Proxy**: Cloudflare Worker (`gemini-proxy`) handles Gemini calls and password verification server-side. Secrets never reach the frontend bundle.

## 📐 Architecture Overview
- **Main Shell (`Layout.tsx`)**: Central hub managing tool registration, navigation state, and theme management.
- **Tool Registry**: Modular structure where each tool is a focused React component.
- **Navigation (`Sidebar.tsx`)**: Categorized access to all tools (App & Info, AI Music Platforms, Creative AI, etc.).
- **Infrastructure**: Nginx handles routing, security headers, and reverse-proxying to the CORS container.

## ⚠️ Important Rules for AI
1. **Build verification**: Run `npm run build` locally to verify changes compile without errors before submitting.
2. **Language**: English is the primary language for all interfaces and developer documentation.
3. **Architecture**: Always follow the Tool-Component pattern. Use existing hooks and utility functions for music theory or image processing.
4. **Security**: **CRITICAL**. API keys (`GEMINI_API_KEY`) and secrets live exclusively in the **Cloudflare Worker** — never hardcoded in source files or env vars that get compiled into the bundle.
5. **Data Masking & Privacy**: Mask all tokens in logs and UI displays (e.g., `key.slice(0, 4) + '...'`).

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
