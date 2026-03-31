export const TOOL_CATEGORY = 'SunoCommunitySpinner';
export const LOCAL_STORAGE_CURRENT_PREFIX = 'SCS_current_MagicSpinWheel_v3_';
export const LOCAL_STORAGE_SAVED_WHEELS_KEY = 'SCS_savedWheelConfigs_MagicSpinWheel_v3';
export const LOCAL_STORAGE_SPIN_SOUND_KEY = `${LOCAL_STORAGE_CURRENT_PREFIX}selectedSpinSound`;

export const defaultActivitiesListEnglish: string[] = [
    "Chug 2.2L of water (stay hydrated!).",
    "Make a song about yourself.",
    "Make a song about someone else (friend, family, fictional character).",
    "Remix one of your existing Suno songs (try a different style or extend it).",
    "Sing a karaoke version of one of your Suno songs (or any song!).",
    "Do nothing for 5 minutes (just chill, you deserve it!).",
    "Listen to 3 new songs on the Suno Explore Page.",
    "Find a surprising Suno song and share it.",
    "Create a Suno prompt with 3 different genres.",
    "Comment on another user's Suno song.",
    "Find a new Suno user to follow.",
    "Generate a Suno song using only 2 keywords.",
    "Explore the Suno 'trending' page for 5 minutes.",
    "Search for a Suno song containing the word 'adventure'.",
    "Share a quick tip for using Suno in a forum or social media.",
    "Create a Suno song with an unusual theme (e.g., 'lactose-intolerant vibe', 'a song about a sentient stapler')."
];

// Dark Mode Defaults
export const DEFAULT_TOOL_BG_COLOR_DARK = '#111827'; 
export const DEFAULT_TOOL_TEXT_COLOR_DARK = '#d1d5db'; 
export const DEFAULT_WHEEL_BORDER_COLOR_DARK = '#374151'; 

// Light Mode Defaults
export const DEFAULT_TOOL_BG_COLOR_LIGHT = '#ffffff'; 
export const DEFAULT_TOOL_TEXT_COLOR_LIGHT = '#111827'; 
export const DEFAULT_WHEEL_BORDER_COLOR_LIGHT = '#e5e7eb'; 

export const DEFAULT_TOOL_ACCENT_COLOR = '#059669'; 
export const DEFAULT_WHEEL_TEXT_FONT = "'Inter', sans-serif";
export const DEFAULT_SPIN_SOUND = 'mechanicalClick';

export const wheelSegmentBaseColors = [
  '#EF4444', '#F97316', '#EAB308', '#22C55E', '#3B82F6', 
  '#6366F1', '#A855F7', '#EC4899', '#10B981', '#F59E0B',
  '#84CC16', '#0EA5E9'
];

export const logoSizeOptions = [
    { value: '48px', label: 'Tiny (48px)' }, { value: '64px', label: 'Small (64px)' },
    { value: '96px', label: 'Medium (96px)' }, { value: '128px', label: 'Large (128px)' },
    { value: '160px', label: 'X-Large (160px)' },
];

export const cardTextFontOptions = [
    { value: "'Inter', sans-serif", label: "Default (Inter)" }, { value: "Arial, Helvetica, sans-serif", label: "Arial" },
    { value: "'Times New Roman', Times, serif", label: "Times New Roman" }, { value: "Georgia, serif", label: "Georgia" },
    { value: "'Courier New', Courier, monospace", label: "Courier New" }, { value: "Verdana, Geneva, sans-serif", label: "Verdana" },
    { value: "Tahoma, Geneva, sans-serif", label: "Tahoma" },
    { value: "'Trebuchet MS', Helvetica, sans-serif", label: "Trebuchet MS" },
    { value: "'Lucida Console', Monaco, monospace", label: "Lucida Console" },
    { value: "Impact, Charcoal, sans-serif", label: "Impact" }, { value: "'Comic Sans MS', cursive, sans-serif", label: "Comic Sans MS" },
];

export const spinSoundPresets = [
  { value: 'mechanicalClick', label: 'Mechanical Click' },
  { value: 'smoothClicks', label: 'Smooth Clicks' },
  { value: 'ratchetClack', label: 'Ratchet Clack' },
  { value: 'digitalPulses', label: 'Digital Pulses' },
  { value: 'gentleWind', label: 'Gentle Wind (Continuous)' },
  { value: 'waterBubbles', label: 'Water Bubbles' },
  { value: 'sciFiScanner', label: 'Sci-Fi Scanner (Continuous)' },
  { value: 'crystalChimes', label: 'Crystal Chimes' },
  { value: 'deepRumble', label: 'Deep Rumble (Continuous)' },
  { value: 'noSound', label: 'No Sound' },
];
