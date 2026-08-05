---
name: commit-push
description: Review working-tree changes, verify they introduce no problems (TypeScript typecheck, vitest tests, production build, secret/leak scan), then commit and push to origin/main with a conventional message, update CHANGELOG.md, tag a SemVer release, and create the corresponding GitHub release. Use when the user asks to commit and push local changes, or says "push", "commit", "release", "ship it".
---

# Commit & Push

**Goal:** Verify local changes are safe before committing, then commit, push them to `origin/main` with a conventional commit message, and publish a tagged GitHub release (versioning is Git-Tag driven — see CONTEXT.md §Versioning).

## Rules

- Only commit what the user asked for; never commit secrets.
- If any verification step fails, fix it and re-run — **never commit or push a failing tree**.
- Secrets (`GEMINI_API_KEY`, `COMMITTEE_PASSWORD`) live **exclusively** in the Cloudflare Worker — never in source or the bundle. Ban risk here is about **leaking secrets**, not rate limits.
- Only push after the user explicitly asks to commit/push (or invokes this skill).
- Pushing to `main` auto-deploys the static SPA on Cloudflare Pages — no manual deploy step. The Worker (`gemini-worker/`) deploys separately and only when its code changed.

## Steps

### 1. Inspect the Working Tree

```bash
git status --short
git diff --stat
git log --oneline -10
```

### 2. Review the Diff for Problems

```bash
git diff
```

Manually verify before committing:

- **No secrets**: no API keys, passwords, or tokens in the diff. Run the leak scan:
  ```bash
  grep -riE "(api_key|password|secret|token|auth|credentials)" . | grep -v "node_modules"
  ```
  Every hit must be a placeholder, a `process.env`/`import.meta.env` reference, or a doc mention — never a real value. If a real secret appears, **stop** and report.
- **No `.env` or generated artifacts staged**: `.env`, `.env.*`, `node_modules/`, `dist/`, and `.agents/` must stay untracked (check `.gitignore`).
- **No debug leftovers**: no new `console.log(`, `debugger`, or unfinished `TODO`/`FIXME` added to application code. (Pre-existing `console.log` in `services/sunoService.ts`/`riffusionService.ts` is known; do not add more.)
- **No token leakage in new logs**: if new logging was added, tokens must be masked (`key.slice(0, 4) + '...'`) per CONTEXT.md.
- **No deleted functionality**: files removed must be confirmed dead code (never imported/called anywhere). Use grep before deleting.
- **Security rules from AGENTS.md/CONTEXT.md**: never `innerHTML` with raw user data; no secrets in the JS bundle; all Gemini calls go through the Worker proxy, never direct with a key.

### 3. Run Verification

All must pass before committing (from the repo root):

```bash
# TypeScript typecheck
npx tsc --noEmit

# Vitest test suite
npm test

# Production build (runs prebuild sync-notes → tailwind → vite build)
npm run build
```

Notes:
- There is **no lint script** configured — `tsc --noEmit` + `npm run build` is the gate.
- `npm run build` may regenerate `src/data/releaseNotesData.tsx` from `CHANGELOG.md` (via `scripts/sync-release-notes.js`). If it changes, **include it in the commit**.
- If the build emits the "chunk larger than 500 kB" warning, that is a pre-existing known state — do not treat it as a failure, but flag it in the report.
- If `gemini-worker/index.js` changed, optionally verify Worker syntax:
  ```bash
  node --check gemini-worker/index.js
  ```

If any step fails: fix, re-run, and only then continue.

### 4. Update CHANGELOG.md (for user-visible changes)

`CHANGELOG.md` is the source of truth for release notes (rendered in the in-app Updates page). If the changes are user-visible, add a new section at the top:

```markdown
## [X.Y.Z] - YYYY-MM-DD

### Added
- ...

### Changed
- ...

### Fixed
- ...
```

Then re-run `npm run build` so `src/data/releaseNotesData.tsx` regenerates, and stage both files.

### 5. Stage and Commit

Review `git status --short`, stage the intended files:

```bash
git add -A
```

Write a conventional commit message in the repo style (`feat:`, `fix:`, `fix(ui):`, `refactor:`, `chore:`, `docs:`, `security:`), e.g.:

```
fix: add CORS proxy fallback for Suno API calls
```

If the changes cover multiple distinct concerns, split into multiple commits.

### 6. Push

```bash
git push origin main
```

### 7. Version Tag & GitHub Release

Versioning is **SemVer** (`vMAJOR.MINOR.PATCH`) and **Git-Tag driven** (CONTEXT.md). Derive the next version from the newest git tag if one exists, otherwise from the latest `## [x.y.z]` header in `CHANGELOG.md`:

```bash
if git describe --tags --exact-match HEAD >/dev/null 2>&1; then
  echo "HEAD already tagged — release already exists"
  exit 0
fi

# Highest existing tag, or "v0.0.0" if none
LAST_TAG=$(git tag --sort=-v:refname | head -1 || true)
LAST_TAG=${LAST_TAG:-v0.0.0}

# Fallback: read the latest version from CHANGELOG.md if no tags exist
if [ "$LAST_TAG" = "v0.0.0" ]; then
  CH_VERSION=$(grep -oE '^## \[[0-9]+\.[0-9]+\.[0-9]+\]' CHANGELOG.md | head -1 | sed -E 's/## \[(.*)\]/\1/')
  if [ -n "$CH_VERSION" ]; then LAST_TAG="v$CH_VERSION"; fi
fi

SUBJECT=$(git log -1 --format=%s)

# Semantic bump: breaking change ("!") → major, feat → minor, everything else → patch
NEW_VERSION=$(node -e '
const [tag, subject] = process.argv.slice(1);
const [maj, minor, patch] = tag.replace(/^v/i, "").split(".").map(Number);
const m = subject.match(/^([a-z]+)(\([^)]*\))?(!)?:/);
const bump = m && m[3] ? "major" : (m && m[1] === "feat" ? "minor" : "patch");
console.log(bump === "major" ? `v${maj + 1}.0.0` : bump === "minor" ? `v${maj}.${minor + 1}.0` : `v${maj}.${minor}.${patch + 1}`);
' "$LAST_TAG" "$SUBJECT")

git tag "$NEW_VERSION"
git push origin main --tags

# Release notes = commit subjects since the previous tag
NOTES=$(git log "$LAST_TAG"..HEAD --format='- %s')
gh release create "$NEW_VERSION" --title "$NEW_VERSION" --notes "$NOTES"
```

- If the pushed change only touches the Worker (`gemini-worker/`), the site release is still fine to tag; Worker deployment itself (`npx wrangler deploy`) is a separate step — only run it if the user asked.
- If `gh` is unavailable or the release cannot be created, **do not block the push** — report the tag so a release can be created manually.

### 8. Report

Report the commit hash, the release tag/URL, the change summary, and the verification results (typecheck / tests / build), plus the CHANGELOG version added.
