
// songDeckPicker.constants.ts
import { PickerMode } from '@/types';

export const LOCAL_STORAGE_PICKED_SONGS_LOG_KEY = 'deckPickerPickedSongsLog_v1';
export const LOCAL_STORAGE_SAVED_THEMES_KEY = 'songDeckPicker_savedThemes_v1';
export const LOCAL_STORAGE_SONG_INFO_CACHE_KEY = 'songDeckPicker_songInfoCache_v1';

// Color Defaults - Dark Mode
export const DEFAULT_TOOL_BG_COLOR_DARK = '#111827';
export const DEFAULT_TOOL_TEXT_COLOR_DARK = '#d1d5db';
export const DEFAULT_CARD_BG_COLOR_DARK = '#2d3748';
export const DEFAULT_CARD_BORDER_COLOR_DARK = '#4a5568';
export const DEFAULT_CARD_TEXT_COLOR_DARK = '#e2e8f0';

// Color Defaults - Light Mode
export const DEFAULT_TOOL_BG_COLOR_LIGHT = '#ffffff';
export const DEFAULT_TOOL_TEXT_COLOR_LIGHT = '#1f2937';
export const DEFAULT_CARD_BG_COLOR_LIGHT = '#f3f4f6';
export const DEFAULT_CARD_BORDER_COLOR_LIGHT = '#d1d5db';
export const DEFAULT_CARD_TEXT_COLOR_LIGHT = '#1f2937';

// Export defaults aliased to Dark Mode for initial state / backwards compatibility
export const DEFAULT_TOOL_BG_COLOR = DEFAULT_TOOL_BG_COLOR_DARK;
export const DEFAULT_TOOL_TEXT_COLOR = DEFAULT_TOOL_TEXT_COLOR_DARK;
export const DEFAULT_CARD_BG_COLOR = DEFAULT_CARD_BG_COLOR_DARK;
export const DEFAULT_CARD_BORDER_COLOR = DEFAULT_CARD_BORDER_COLOR_DARK;
export const DEFAULT_CARD_TEXT_COLOR = DEFAULT_CARD_TEXT_COLOR_DARK;

export const DEFAULT_TOOL_ACCENT_COLOR = '#059669';
export const DEFAULT_CUSTOM_TITLE = 'Song Deck Picker';
export const DEFAULT_SELECTED_LOGO_SIZE = '96px';
export const DEFAULT_CARD_TEXT_FONT = "inherit";
export const DEFAULT_NUMBER_OF_CARDS_TO_DRAW = 5; 

// New Defaults for Reveal Cards Mode
export const DEFAULT_PICKER_MODE = PickerMode.Standard;
export const DEFAULT_REVEAL_POOL_SIZE_X = 3;
export const DEFAULT_MAX_LOGGED_SONGS_N = 50;
export const DEFAULT_CUSTOM_CARD_BACK_BASE64: string | null = null;
export const DEFAULT_MAX_SONGS_PER_GROUP = 10; // New default
export const DEFAULT_RANKING_REVEAL_TOP_X = 10; // New default for animation
export const DEFAULT_RANKING_REVEAL_SNIPPET_DURATION = 15; // New default for snippet

export const TOOL_CATEGORY = 'SongDeckPicker';

export const logoSizeOptions = [
    { value: '48px', label: 'Tiny (48px)' },
    { value: '64px', label: 'Small (64px)' },
    { value: '96px', label: 'Medium (96px)' },
    { value: '128px', label: 'Large (128px)' },
    { value: '160px', label: 'X-Large (160px)' },
    { value: '240px', label: 'XX-Large (240px)' },
    { value: '320px', label: 'Giant (320px)' },
];

export const cardTextFontOptions = [
    { value: "inherit", label: "Inherit from Theme (Default)" },
    { value: "'Inter', sans-serif", label: "Inter" },
    { value: "Arial, Helvetica, sans-serif", label: "Arial" },
    { value: "'Times New Roman', Times, serif", label: "Times New Roman" },
    { value: "Georgia, serif", label: "Georgia" },
    { value: "'Courier New', Courier, monospace", label: "Courier New" },
    { value: "Verdana, Geneva, sans-serif", label: "Verdana" },
    { value: "Tahoma, Geneva, sans-serif", label: "Tahoma" },
    { value: "'Trebuchet MS', Helvetica, sans-serif", label: "Trebuchet MS" },
    { value: "'Lucida Console', Monaco, monospace", label: "Lucida Console" },
    { value: "Impact, Charcoal, sans-serif", label: "Impact" },
    { value: "'Comic Sans MS', cursive, sans-serif", label: "Comic Sans MS" },
];

// Constants for song info cache clearing
export const SONG_INFO_CACHE_CLEAR_CLICKS_NEEDED = 3;
export const SONG_INFO_CACHE_CLEAR_TIMEOUT_MS = 3000;

// Constants for new confirm-click actions
export const LOGGED_SONGS_CLEAR_RETURN_CLICKS_NEEDED = 3;
export const GROUP_REMOVE_CLICKS_NEEDED = 3;
export const CONFIRM_TIMEOUT_MS = 3000;
