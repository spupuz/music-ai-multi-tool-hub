# Deployment Guide — Cloudflare Pages

This project is deployed as a **static SPA on Cloudflare Pages**, with a **Cloudflare Worker** acting as a secure proxy for the Gemini API.

---

## Architecture

```
Browser → Cloudflare Pages (static build)
              ↓ AI/password requests + Suno API calls
         Cloudflare Worker (gemini-proxy.spupuz.workers.dev)
              ↓
         Google Gemini API   (key stored as Worker secret)
         Suno /studio-api    (proxied with per-endpoint cache)
```

The Worker proxies Gemini requests, verifies the committee password server-side, and serves `/suno/*` / `/suno-web/*` (cached) so the browser never calls Suno directly and never hits CORS errors.

---

## Prerequisites

- Node.js ≥ 18
- A [Cloudflare account](https://dash.cloudflare.com/)
- A [Google Gemini API key](https://aistudio.google.com/)

---

## 1. Deploy the Worker

The Worker proxies Gemini API requests, verifies the committee password server-side, and proxies Suno API calls.

> **`wrangler.toml` contains no secrets** — only bindings (worker name, KV namespace ID). Secrets are set below via `wrangler secret put` or the dashboard, never committed.

### Via Cloudflare Dashboard

1. Go to **Workers & Pages → Create → Workers → Start with Hello World**
2. Name it **`gemini-proxy`**
3. Paste the code from [`gemini-worker/index.js`](./gemini-worker/index.js)
4. Click **Deploy**
5. Go to **Settings → Variables and Secrets** and add:

| Name | Type | Value |
|------|------|-------|
| `GEMINI_API_KEY` | Secret | Your Google AI key |
| `COMMITTEE_PASSWORD` | Secret | Your chosen password |

### Via CLI (wrangler)

```bash
cd gemini-worker
npx wrangler deploy
npx wrangler secret put GEMINI_API_KEY
npx wrangler secret put COMMITTEE_PASSWORD
```

Worker URL: `https://gemini-proxy.spupuz.workers.dev`

---

## 2. Deploy Cloudflare Pages

1. Go to **Workers & Pages → Create → Pages → Connect Git**
2. Select the `spupuz/music-ai-multi-tool-hub` repository
3. Configure:

| Setting | Value |
|---------|-------|
| Production branch | `main` |
| Build command | `npm install --legacy-peer-deps && npm run build` |
| Build output | `dist` |

4. Click **Save and Deploy**

> **No environment variables needed** — all secrets live in the Worker.

---

## 3. Local Development

```bash
npm install
cp .env.example .env
# Add GEMINI_API_KEY to .env (only for local runs — NOT committed: .env is untracked)
npm run dev
```

The app runs at `http://localhost:3000`.

For AI features locally, the Worker URL is hardcoded in `services/aiAnalysisService.ts` and `SunoSongComplianceTool.tsx`.

To test the Suno proxy against a local Worker:

```bash
cd gemini-worker
npx wrangler@3 dev --port 8787   # Node 20 → use wrangler v3 (v4 needs Node 22)
```

Then create a local `.env` with `VITE_SUNO_WORKER_URL=http://localhost:8787` so `sunoService.ts` targets the local Worker instead of production.

---

## Updating the Site

Push to `main` — Cloudflare Pages auto-deploys on every push.

```bash
git add .
git commit -m "your changes"
git push origin main
```

---

## Security Notes

- `GEMINI_API_KEY` and `COMMITTEE_PASSWORD` are **Worker secrets** — never in the git repo or JS bundle
- `.env`, `.env.*`, `.dev.vars`, and `.wrangler/` are **gitignored and must stay untracked** (`.env` is not committed — verify with `git ls-files | grep -E "\.env|dev\.vars|\.wrangler"`)
- `wrangler.toml` only holds **non-secret bindings** (names, KV namespace IDs) — no API keys, tokens, or passwords ever
- The Worker URL (`gemini-proxy.spupuz.workers.dev`) is not secret — it's a public endpoint
- CORS in the Worker only allows requests from `music-ai-multi-tool-hub.pages.dev`