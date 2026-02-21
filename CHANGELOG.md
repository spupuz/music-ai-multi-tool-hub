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

### Added
- **Cloudflare Pages Migration**: The Hub is now a pure static site deployed on Cloudflare Pages.
- **Gemini Proxy Worker**: Introduced a Cloudflare Worker (`gemini-proxy`) to secure API calls.
- **Server-side Password Verification**: "Committee" password is now verified via Worker secrets, removing it from the client bundle.
- **Public Repository Readiness**: Performed a full security audit and git history scrub for open-source release.

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
- **Guided Workflows**: "Quick Start" section on the About page for better onboarding.

---

## [1.9.6] - 2026-02-21

### Added
- **Producer.AI Integration**: Recognizes and processes URLs from `producer.ai` across all tools.

---

## [1.9.3] - 2026-02-21

### Added
- **Riffusion Integration**: Expanded support for Riffusion URLs in Music Shuffler, Cover Art Creator, Lyric Processor, and MP3 Cutter.

---

## [1.9.0] - 2026-02-20

### Added
- **SparkTune Super-Generator**: Massive upgrade with creative constraints (Vocal Style, BPM, Negative Constraints) and Dual Post generation.

---

## [1.0.0] - 2026-02-14

### Added
- **Initial Release**: 20+ specialized AI music tools (Suno Shuffler, Lyric Processor, Music Style Generator, etc.).
