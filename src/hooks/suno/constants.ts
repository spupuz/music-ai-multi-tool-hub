import type { EqualizerBand } from '@/types';

export const LOCAL_STORAGE_PREFIX_USER = 'sunoMusicPlayer_user_';
export const LOCAL_STORAGE_PREFIX_PLAYLIST = 'sunoMusicPlayer_playlist_';
export const LOCAL_STORAGE_CLIP_DETAIL_CACHE_KEY = 'sunoMusicPlayer_clipDetailCache_v1';
export const LOCAL_STORAGE_SAVED_CUSTOM_PLAYLISTS_KEY = 'sunoMusicPlayer_savedCustomPlaylists_v1';
export const LOCAL_STORAGE_SNIPPET_DURATION_KEY = 'sunoMusicPlayer_snippetDuration_v1';
export const LOCAL_STORAGE_LAST_SESSION_KEY = 'sunoMusicPlayer_lastSession';
export const CLEAR_CLICKS_NEEDED = 3;
export const CLEAR_TIMEOUT_MS = 3000;

export const DEFAULT_SNIPPET_DURATION_SECONDS = 30;
export const MIN_SNIPPET_DURATION_SECONDS = 5;
export const MAX_SNIPPET_DURATION_SECONDS = 180;

export const DEFAULT_EQ_BANDS_CONFIG: Omit<EqualizerBand, 'node'>[] = [
  { id: 'band-60Hz', frequency: 60, gain: 0, type: 'lowshelf' },
  { id: 'band-170Hz', frequency: 170, gain: 0, type: 'peaking' },
  { id: 'band-310Hz', frequency: 310, gain: 0, type: 'peaking' },
  { id: 'band-600Hz', frequency: 600, gain: 0, type: 'peaking' },
  { id: 'band-1kHz', frequency: 1000, gain: 0, type: 'peaking' },
  { id: 'band-3kHz', frequency: 3000, gain: 0, type: 'peaking' },
  { id: 'band-6kHz', frequency: 6000, gain: 0, type: 'peaking' },
  { id: 'band-12kHz', frequency: 12000, gain: 0, type: 'peaking' },
  { id: 'band-14kHz', frequency: 14000, gain: 0, type: 'highshelf' },
  { id: 'band-16kHz', frequency: 16000, gain: 0, type: 'highshelf' },
];

export const EQ_PRESETS: Record<string, { label: string, gains: number[] }> = {
  flat: { label: "Flat", gains: Array(DEFAULT_EQ_BANDS_CONFIG.length).fill(0) },
  bassBoost: { label: "Bass Boost", gains: [6, 5, 4, 2, 0, 0, 0, 0, 0, 0] },
  vocalClarity: { label: "Vocal Clarity", gains: [-2, -1, 0, 2, 3, 3, 2, 0, -1, -2] },
  trebleBoost: { label: "Treble Boost", gains: [0, 0, 0, 0, 0, 2, 4, 5, 6, 6] },
  rock: { label: "Rock", gains: [3, 2, 1, -1, 0, 1, 2, 3, 2, 1] },
  electronic: { label: "Electronic", gains: [4, 3, 1, 0, -1, 1, 3, 4, 3, 2] },
};

export const TOOL_CATEGORY_PLAYER = 'SunoMusicPlayer';

export const knownAppLocalStorageKeys = [
  'aiMultiToolHub_cookieConsent', 'myVisitsLog', 'lastDailyLocalActivePing',
  'musicStyleHistory_v2', 'musicStyleFavorites_v2', 'RMS_optionalCategoryToggles_v1',
  'creativeConceptHistory_v2', 'creativeConceptFavorites_v2',
  'chordProgFavorites_v1',
  'sunoMusicPlayer_eqBands_v1', 'sunoMusicPlayer_volume_v1',
  LOCAL_STORAGE_CLIP_DETAIL_CACHE_KEY,
  LOCAL_STORAGE_SAVED_CUSTOM_PLAYLISTS_KEY,
  LOCAL_STORAGE_SNIPPET_DURATION_KEY,
  'deckPickerPickedSongsLog_v1',
  'lyricsToProcessForLyricProcessor',
  'songCoverArt_savedStylePresets_v1',
  'SCS_savedWheelConfigs_MagicSpinWheel_v3',
  'sparkTuneChallenges_v1',
  'songDeckPicker_songInfoCache_v1',
];

export const knownAppLocalStoragePrefixes = [
  'stat_', 'statEvents_',
  'RMS_custom_', 'CCB_custom_',
  'sunoUserStats_',
  LOCAL_STORAGE_PREFIX_USER,
  LOCAL_STORAGE_PREFIX_PLAYLIST,
  'SCS_current_MagicSpinWheel_v3_',
];

export const sunoPlaylistUrlPattern = /^(?:https?:\/\/)?(?:www\.)?(?:suno\.com|app\.suno\.ai)\/playlist\/([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})/;
export const sunoUserProfileUrlPattern = /^(?:https?:\/\/)?(?:www\.)?(?:suno\.com|app\.suno\.ai)\/@([\w.-]+)/;
export const riffusionUrlPattern = /^(?:https?:\/\/)?(?:www\.)?riffusion\.com\/song\/([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})/;
