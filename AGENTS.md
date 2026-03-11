# Music AI Multi-Tool Hub AI Agent Instructions

> **All AI agents must conform to [CONTEXT.md](./CONTEXT.md)**

Music AI Multi-Tool Hub is a comprehensive web application built with **React 19**, **Vite**, and **TypeScript**. It provides a suite of tools for AI music creators, integrating with services like Suno, Riffusion, and Google Gemini.

## Development Environment

```bash
# Install dependencies
npm install

# Run locally for development
npm run dev
```

- **Frontend**: http://localhost:3000 (Vite dev server)
- **AI Features**: Calls `gemini-proxy.spupuz.workers.dev` (Cloudflare Worker) — requires internet connection.

## Architecture Overview

### Frontend Structure (`/`)

The application follows a tool-based modular architecture centered around a main layout.

```
/
├── Layout.tsx            # Main application shell and tool registry
├── Sidebar.tsx           # Navigation and tool categorization
├── services/             # API abstractions and external integrations
├── components/           # Reusable UI components (Spinner, Header, etc.)
├── hooks/                # Custom React hooks for tool logic
├── utils/                # Shared utility functions (math, music theory)
└── [ToolName]Tool.tsx    # Individual tool components (e.g., SunoMusicPlayerTool.tsx)
```

**Key patterns:**
- **Tool Registry**: Tools are defined in `Layout.tsx` and partitioned by categories.
- **Service Layer**: External API calls are abstracted into `services/` (e.g., `sunoService.ts`, `aiAnalysisService.ts`).
- **Context**: Global state like theme is managed via `ThemeContext.tsx`.
- **Styling**: TailwindCSS for utility-first styling.

## Critical Patterns

### Tool Component Pattern

Each tool is a React component receiving `ToolProps`. Navigation between tools should be handled via the `onNavigate` prop.

```tsx
// Pattern: Tool Component
import React from 'react';
import { ToolProps } from './Layout';

const MyNewTool: React.FC<ToolProps> = ({ trackLocalEvent, onNavigate }) => {
  const handleAction = () => {
    trackLocalEvent('MyTool', 'ButtonClicked');
    // ... logic
  };

  return <div className="...">...</div>;
};
```

### Service Integration Pattern

API services should handle retries, rate limiting, and provide progress updates via callbacks where beneficial.

```tsx
// Pattern: Async Service with Progress
export const fetchMyData = async (
  id: string,
  onProgress?: (msg: string) => void
) => {
  if (onProgress) onProgress("Starting fetch...");
  // Use try/catch with exponential backoff for rate limits (429)
  // ...
};
```

### State & Event Tracking

The application uses `localStorage` for data persistence and local statistics tracking via `trackLocalEvent`.

```tsx
// Pattern: Local Event Tracking
trackLocalEvent('ToolCategory', 'ActionName', 'Label', value);
```

### Mobile-First Responsiveness Patterns

The application prioritizes a seamless mobile experience (320px+). Follow these patterns to prevent horizontal overflow and maximize space:

- **Aggressive Container Padding**: On small screens, reduce or remove container padding to reclaim pixels. Use `p-0` or `p-1` for mobile and scale up (`sm:p-6`) for larger viewports.
- **Responsive Tables**: 
  - Abbreviate column headers on mobile using conditional rendering: `<span className="sm:hidden">Plays</span> <span className="hidden sm:inline">Avg Plays</span>`.
  - Reduce font size (`text-[9px]` or `text-[10px]`) and cell padding (`px-1`) for narrow viewports.
  - Round large decimals or use `toLocaleString()` to keep cell content compact.
- **Chart Optimization**:
  - Track `screenWidth` to dynamically adjust `Chart.js` options (layout padding, tooltips, axis titles).
  - Hide non-essential axis titles on mobile (`display: screenWidth > 640`).
  - Use `ticks.padding` and `ticks.font.size` to prevent labels from hitting container edges.
- **Text Scaling**: Use responsive font sizes for titles (e.g., `text-xl sm:text-2xl`) and ensure single-line headers use `truncate` or `text-ellipsis` to prevent wrapping.

### Anti-Pattern 1: Direct Fetch in Components
**Bad**: Calling `fetch()` or heavy logic directly inside a `useEffect` or event handler in a UI component.
```tsx
useEffect(() => {
  fetch('https://api.suno.com/...'); // BAD! Not abstracted or reusable.
}, []);
```
**Good**: Abstract the logic into a service file in `services/`.

### Anti-Pattern 2: Blocking the UI
**Bad**: Performing heavy data processing (like large array transformations) on the main thread without consideration.
**Good**: Use `setTimeout` chunks or ensure logic is optimized.

### Anti-Pattern 3: Hardcoded Secrets
**Bad**: Using environment variables without checking for existence or exposing them in logs.
**Good**: Access via `process.env` and provide fallbacks or clear error messages.

## Security & Data Privacy

- **Cloudflare Worker**: All Gemini API calls and password verification are proxied via `gemini-proxy.spupuz.workers.dev`. Secrets live exclusively in the Worker — never in source code or the JS bundle.
- **Local Privacy**: Sensitive user data should be kept in local state/storage and never leaked to external logs.

## AI-Assisted Contributions

### Contribution Template

```markdown
## Summary
[Description of changes]

## Changes
- [Component/Service]: [Change details]
- [Logic]: [Implementation details]

## Verification
- [ ] `npm run build` successful
- [ ] Tool loads correctly in `Layout.tsx`
- [ ] Service calls handle errors/rate limits
```
