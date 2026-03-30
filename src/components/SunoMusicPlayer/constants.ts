export const LOGO_SVG_STRING = `<svg viewBox='0 0 100 100' fill='none' xmlns='http://www.w3.org/2000/svg'><path d='M50 10 L85 27.5 V72.5 L50 90 L15 72.5 V27.5 L50 10 Z' stroke='#059669' stroke-width='8' fill='transparent'/><circle cx='50' cy='35' r='7' fill='#14B8A6'/><circle cx='35' cy='65' r='6' fill='#14B8A6'/><circle cx='65' cy='65' r='6' fill='#14B8A6'/><line x1='50' y1='35' x2='35' y2='65' stroke='#10B981' stroke-width='5' stroke-linecap='round'/><line x1='50' y1='35' x2='65' y2='65' stroke='#10B981' stroke-width='5' stroke-linecap='round'/><line x1='38' y1='63' x2='62' y2='63' stroke='#10B981' stroke-width='5' stroke-linecap='round'/></svg>`;
export const FALLBACK_IMAGE_DATA_URI = typeof btoa !== 'undefined' ? `data:image/svg+xml;base64,${btoa(LOGO_SVG_STRING)}` : '';

export const TOOL_CATEGORY_UI = 'SunoMusicPlayer';
export const LOCAL_STORAGE_PLAYLIST_HEIGHT_KEY = 'sunoMusicPlayer_playlistHeight_v1';
export const DEFAULT_PLAYLIST_HEIGHT_PX = 320;
export const MIN_PLAYLIST_HEIGHT_PX = 120;
export const MAX_PLAYLIST_HEIGHT_PX = typeof window !== 'undefined' ? Math.max(300, window.innerHeight * 0.7) : 600;

export const MIN_SNIPPET_DURATION_SECONDS = 5;
export const MAX_SNIPPET_DURATION_SECONDS = 180;

export const LOCAL_CLICK_CONFIRM_NEEDED = 3;
export const LOCAL_CLICK_TIMEOUT_MS = 3000;

export const EQ_PRESETS_FOR_UI: Record<string, { label: string }> = { 
  flat: { label: "Flat" }, 
  bassBoost: { label: "Bass Boost" }, 
  vocalClarity: { label: "Vocal Clarity" }, 
  trebleBoost: { label: "Treble Boost" }, 
  rock: { label: "Rock" }, 
  electronic: { label: "Electronic" }, 
};
