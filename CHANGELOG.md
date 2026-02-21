# Changelog

All notable changes to this project will be documented in this file.

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

## [1.0.0] - 2026-02-14
### Added
- **Initial Release**: 20+ specialized AI music tools.
