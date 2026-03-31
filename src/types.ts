
// Removed CoverArtRequest as it's no longer used
// export interface CoverArtRequest {
//   songName: string;
//   artistTitle: string;
//   inputImageBase64: string | null;
// }

export interface GeneratedImage {
  base64: string;
  promptUsed: string; // Will be static for the text addition tool
}

export enum AppState {
  Idle,
  // DescribingImage, // Removed
  // GeneratingCover, // Renamed/Simplified to Processing
  Processing,     // Generic state for when the tool is working
  Success,
  Error,
}

// Types for Suno Music Player
export interface SunoClipImageUrls {
  image_url_large?: string;
  image_url?: string; // Typically the one to use for general display
}

export interface SunoClipMetadata {
  tags: string | null;
  prompt: string | null; // This often contains the lyrics
  gpt_description_prompt: string | null;
  error_type: string | null;
  error_message: string | null;
  type: string; // e.g., "music", "chirp"
  duration: number | null; // Duration in seconds
  [key: string]: any; // For any other potential metadata fields
}

export interface SunoClip {
  id: string;
  video_url: string;
  audio_url: string;
  image_url: string | null; // Main image from top level
  image_large_url: string | null; // Large image from top level
  image_urls: SunoClipImageUrls; // Nested image URLs
  is_video_pending: boolean;
  major_model_version: string;
  model_name: string;
  metadata: SunoClipMetadata;
  is_liked: boolean;
  user_id: string;
  display_name: string; // Creator's display name
  handle: string; // Creator's handle (username)
  is_trashed: boolean;
  created_at: string; // ISO date string
  status: string; // e.g., "complete", "streaming"
  title: string;
  play_count: number;
  upvote_count: number;
  comment_count: number; // Added comment_count
  is_public: boolean;
  reaction?: any; // or define a specific reaction type
  // Derived properties for convenience
  suno_song_url?: string;
  suno_creator_url?: string;
  source?: 'suno' | 'riffusion'; // To differentiate song sources
}

// --- New Types for Riffusion ---
export interface RiffusionTimestampedWord {
  text: string;
  start: number;
  end: number;
  line_index: number;
}

export interface RiffusionTimestampedLyrics {
  words: RiffusionTimestampedWord[];
}

export interface RiffusionSongData {
  id: string;
  title: string;
  artist: string;
  author_id?: string;
  image_url: string;
  image_large_url?: string;
  audio_url?: string;
  created_at?: string;
  duration?: number;
  prompt?: string;
  lyrics?: string;
  lyrics_timestamped?: RiffusionTimestampedLyrics; // Added for pre-timed lyrics
  tags?: string | string[];
  source: 'api' | 'scraper' | 'mock';
  previewVideoUrl?: string;
}
// --- End New Types for Riffusion ---

// Detailed, consolidated profile information for use in the UI
export interface SunoProfileDetail {
  user_id: string;
  display_name: string;
  handle: string;
  bio: string | null;
  image_url: string | null; // Mapped from avatar_image_url
  is_following: boolean;

  // From stats object or top-level
  total_upvotes?: number;    // Mapped from stats.upvote_count__sum
  total_plays?: number;      // Mapped from stats.play_count__sum
  num_followers?: number;    // Mapped from stats.followers_count
  num_following?: number;    // Mapped from stats.following_count
  num_total_clips?: number;  // Mapped from num_total_clips
  total_comments?: number;   // Aggregated from all clips

  // Optional fields that might be useful from original design, if available
  website?: string | null;
  is_suno_staff?: boolean; // May not be in public API response
  is_pro?: boolean;        // May not be in public API response
}

// Raw structure of the /api/profiles/{username} response
interface SunoUserStats {
  upvote_count__sum: number;
  play_count__sum: number;
  followers_count: number;
  following_count: number;
}

export interface SunoRawProfileResponse {
  user_id: string;
  display_name: string;
  handle: string;
  profile_description: string | null; // Will be mapped to bio
  avatar_image_url: string | null;  // Will be mapped to image_url

  clips: SunoClip[]; // Assuming full clip objects are still here

  stats?: SunoUserStats; // Nested stats object

  num_total_clips?: number; // Total number of clips for the user
  is_following?: boolean;   // If the querying user is following this profile

  next_page?: number | null; // For pagination if the endpoint itself supports it directly on first call
}

// --- New type for Playlist API Response ---
export interface SunoRawPlaylistResponse {
  id: string;
  name: string | null;
  description: string | null;
  image_url: string | null;
  user_display_name: string | null;
  user_handle: string | null;
  user_id: string | null;
  is_public: boolean;
  play_count: number | null; // Playlist's own play count, not sum of clips
  upvote_count: number | null; // Playlist's own upvote count, not sum of clips
  playlist_clips: Array<{
    clip: SunoClip;
    relative_index?: number;
    [key: string]: any;
  }>;
  num_total_results?: number;
  next_page?: number | string | null;
  current_page?: number;
}
// --- End Playlist API Response type ---

// --- New type for Processed Playlist Detail ---
export interface SunoPlaylistDetail {
  id: string;
  name: string | null;
  description: string | null;
  image_url: string | null;       // Playlist cover image
  suno_playlist_url: string;    // Direct URL to the playlist on Suno

  // Playlist Creator Info
  creator_user_id: string | null;
  creator_display_name: string | null;
  creator_handle: string | null;
  creator_avatar_image_url: string | null;
  suno_creator_url?: string;   // Direct URL to the creator's profile on Suno

  // Playlist specific stats
  playlist_upvote_count: number | null; // Upvotes for the playlist itself

  // Aggregated from clips
  num_songs: number;
  total_clip_plays: number;
  total_clip_upvotes: number;
  total_clip_comments: number;

  // Optional
  created_at?: string; // If available
}
// --- End Processed Playlist Detail type ---


export interface EqualizerBand {
  id: string; // e.g. "band-60Hz"
  frequency: number; // Hz e.g. 60
  gain: number; // dB, range typically -12 to +12, default 0
  type: BiquadFilterType; // "lowshelf", "peaking", "highshelf"
  node?: BiquadFilterNode;
}

export enum PlaybackStatus {
  Idle,
  Loading,
  Playing,
  Paused,
  Error,
  Ended
}

export interface PlayerState {
  status: PlaybackStatus;
  currentSong: SunoClip | null;
  currentTime: number;
  duration: number;
  volume: number; // 0 to 1
  isShuffle: boolean;
  isSnippetMode: boolean;
  snippetDurationConfig: number; // Added for configurable snippet duration
  history: SunoClip[]; // For previous track functionality
  queue: SunoClip[]; // Current play queue
  originalOrder: SunoClip[]; // Original fetched order
  eqBands: EqualizerBand[];
}

// --- Updated type for SunoMusicPlayerTool caching ---
export interface SunoMusicPlayerStoredData {
  identifier: string; // normalized username OR playlist ID
  type: 'user' | 'playlist';
  profileDetail: SunoProfileDetail | null; // null if type is 'playlist'
  playlistDetail: SunoPlaylistDetail | null; // null if type is 'user'
  clips: SunoClip[];
  lastFetched: string; // ISO date string
}
// --- End new type ---

// --- New type for SunoMusicPlayerTool local custom playlists ---
export interface SavedCustomPlaylist {
  id: string;
  name: string;
  content: string; // Newline-separated list of Suno URLs or custom format lines
  createdAt: string; // ISO date string
  updatedAt?: string; // ISO date string
}
// --- End new type ---

// --- New type for Playlist Analysis ---
export interface PlaylistAnalysis {
  totalClips: number;
  totalPlays: number;
  totalUpvotes: number;
  totalComments: number;
  avgPlays: number;
  avgUpvotes: number;
  avgComments: number;
  mostCommonTags: Array<{ name: string; count: number }>;
  mostCommonGenres: Array<{ name: string; count: number }>;
  mostFeaturedArtists: Array<{ name: string; handle: string; count: number; profileUrl?: string }>;
  creationDateDistribution: Array<{ month: string; count: number }>;
}
// --- End Playlist Analysis type ---


// --- Types for Song Deck Picker ---
export interface SongCardInterface {
  id: string; // Unique identifier for React keys and internal tracking
  artistName: string;
  title: string;
  imageUrl?: string;
  webLink?: string;
  audioUrl?: string; // For snippet playback in Ranking Reveal mode
  color?: string; // Hex color code for card background
  comment?: string;
  originalInputLine: string; // Store the original input line for export
  isBonusApplied?: boolean; // To track if bonus copies were made for this specific instance
  sourceType?: 'suno_playlist' | 'suno_short_url' | 'suno_long_url' | 'custom_format' | 'suno_general_url' | 'other_url' | 'riffusion_url';
  isRevealed?: boolean; // For Reveal Cards mode
  rank?: number; // For Ranking Reveal mode
}

export interface PickedSongLogEntry {
  timestamp: string;
  artistName: string;
  title: string;
  imageUrl?: string;
  webLink?: string;
  color?: string;
  comment?: string;
  source: string;
}

export enum PickerMode {
  Standard = 'standard',
  Reveal = 'reveal',
  RankingReveal = 'rankingReveal',
}

// New interface for song groups
export interface SongGroup {
  id: string; // Unique ID for the group
  name: string; // User-defined or default name
  songs: PickedSongLogEntry[]; // Array of songs in this group
}

export interface DeckThemeSettings {
  customTitle: string;
  customLogo: string | null;
  selectedLogoSize: string;
  toolBackgroundColor: string;
  toolAccentColor: string;
  toolTextColor: string;
  cardTextFont: string;
  cardBackgroundColor: string;
  cardBorderColor: string;
  cardTextColor: string;
  numberOfCardsToDraw: number;
  // New fields for Reveal Cards mode and general picker mode
  pickerMode: PickerMode;
  revealPoolSizeX: number;
  maxLoggedSongsN: number;
  customCardBackBase64: string | null;
  maxSongsPerGroup: number; // New field for reveal mode grouping
  rankingRevealTopX: number; // New field for ranking reveal animation
  rankingRevealSnippetDuration: number; // New field for ranking reveal snippet length
}

export interface DeckTheme {
  id: string;
  name: string;
  createdAt: string;
  settings: DeckThemeSettings;
}
// --- End Types for Song Deck Picker ---


// --- Types for RandomMusicStyleGenerator and CreativeConceptBlender ---
export interface GeneratedStyleParts {
  id: string;
  genres: string[];
  moods: string[];
  tempo: string;
  instrumentations: string[];
  qualities: string[];
  era?: string;
  productionStyle?: string;
  keyModeSuggestion?: string;
  purpose?: string;
  influence?: string;
  soundDesignFocus?: string;
}

export type LockableCategoryKey = keyof Omit<GeneratedStyleParts, 'id'>;
export type LockedCategoriesState = Record<LockableCategoryKey, boolean>;

export interface OptionalCategoryToggleState {
  includeEra: boolean;
  includeProductionStyle: boolean;
  includeKeyModeSuggestion: boolean;
  includePurpose: boolean;
  includeInfluence: boolean;
  includeSoundDesignFocus: boolean;
}

export type IntensityLevel = 'simple' | 'moderate' | 'complex';
export type MultiSelectItemCategoryKey = 'genres' | 'moods' | 'instrumentations' | 'qualities';

export interface SavedStyleEntry {
  style: GeneratedStyleParts;
  lockedCategories: LockedCategoriesState;
  optionalCategoryToggles: OptionalCategoryToggleState;
  categoryIntensity?: Partial<Record<MultiSelectItemCategoryKey, IntensityLevel>>; // Added for intensity control
  note?: string;
}

export type CustomItemCategoryKey =
  | 'genres' | 'moods' | 'tempo' | 'instrumentations' | 'qualities'
  | 'era' | 'productionStyle' | 'keyModeSuggestion'
  | 'purpose' | 'influence' | 'soundDesignFocus';

export type CustomItemsState = Record<CustomItemCategoryKey, string[]>;


// --- Types for CreativeConceptBlender ---
export interface BlendedConceptParts {
  id: string;
  theme: string;
  style: string;
  texture: string;
  musicality?: string;
  conflict?: string;
  character?: string;
  setting?: string;
  catalyst?: string;
  twist?: string;
}

export type CreativeLockableCategoryKey = keyof Omit<BlendedConceptParts, 'id'>;
export type CreativeLockedCategoriesState = Record<CreativeLockableCategoryKey, boolean>;

export interface OptionalCreativeCategoryToggleState {
  includeMusicality: boolean;
  includeConflict: boolean;
  includeCharacter: boolean;
  includeSetting: boolean;
  includeCatalyst: boolean;
}

export interface CreativeSavedConceptEntry {
  concept: BlendedConceptParts;
  lockedCategories: CreativeLockedCategoriesState;
  optionalCategoryToggles?: OptionalCreativeCategoryToggleState;
  note?: string;
}

export type CreativeCustomItemCategoryKey = keyof Omit<BlendedConceptParts, 'id'>;
export type CreativeCustomItemsState = Record<CreativeCustomItemCategoryKey, string[]>;

// --- Types for Suno Song Compliance Checker ---
export interface TitleCheckResult {
  passed: boolean;
  message: string;
  sscVersion?: number;
  country?: string;
  countryCodeAlpha2?: string;
}

export interface LyricsLanguageCheckResult {
  primaryLanguageCode: string;
  untranslatableWordsFound: boolean;
  untranslatableWordsExplanation: string;
  message?: string;
}

export interface ContentRatingCheckResult {
  is_appropriate: boolean;
  explanation: string;
  message?: string;
}

export type RatingLevel = 'G' | 'PG' | 'PG-13' | 'R' | 'Explicit';

export interface DurationCheckResult {
  passed: boolean;
  message: string;
  actualDurationSeconds?: number | null;
  limitSeconds?: number;
}

// Individual result for one song in a batch
export interface SingleSongComplianceResult {
  inputUrl: string;
  clipData?: SunoClip;
  songTitle?: string;
  songLyrics?: string | null;
  titleCheck?: TitleCheckResult;
  durationCheck?: DurationCheckResult; // Added duration check
  languageCheck?: LyricsLanguageCheckResult;
  contentRatingCheck?: ContentRatingCheckResult;
  processingError?: string; // Specific error for this URL
}

// Overall results for the batch
export interface ComplianceCheckResults {
  batchResults: SingleSongComplianceResult[];
  overallMessage?: string;
}

// --- Types for SparkTune Challenge Generator ---
export interface SparkTuneChallengeData {
  id: string; // Timestamp based unique ID
  challengeName: string;
  organizedBy: string;
  genre: string;
  mood: string;
  instrumentation: string;
  durationConstraint: string;
  lyricPart: string;
  sunoSampleLink: string;
  submissionLink: string;
  showcasePlaylistLink: string;
  dueDate: string; // ISO string yyyy-mm-dd
  additionalDetails?: string;
  themeOrKeyword?: string;
  audioSampleLink?: string;
  vocalStyle?: string;
  tempo?: string;
  negativeConstraints?: string;
}

// --- Types for Lyrics Synchronizer Tool (New) ---
export interface SynchronizedLyricLine {
  id: string; // Unique ID for React keys
  text: string;
  timestamp: number | null; // Timestamp in seconds
}

export interface LyricsSyncData {
  id: string; // Unique ID for the saved project
  title?: string; // Optional title for the project
  audioSrc?: string; // Path or URL to the audio, or a special identifier
  audioFileName?: string; // Original name of the audio file
  lyrics: string; // The raw lyrics input by the user
  synchronizedLines: SynchronizedLyricLine[];
  createdAt: string; // ISO date string
}

export interface AiSynchronizedTimestamp {
  line_index: number; // 0-based index of the original input line
  timestamp_seconds: number | null; // Estimated timestamp or null
}
// --- End Types for Lyrics Synchronizer Tool ---

// --- Types for Song Structure Builder ---
export interface LyricLineData {
  id: string; // Unique ID for this line instance
  currentText: string;
  history: string[]; // Array of previous versions of the text
}

export interface SongStructureBlock {
  id: string; // Unique ID for each instance on the timeline
  type: string; // The name of the block, e.g., "Verse", "Chorus"
  notes: string; // User-added descriptive notes for the block
  lyrics: LyricLineData[]; // Holds individual lyric lines with versioning
  barCount?: number; // New field for bar/measure count
}

export interface SavedArrangement {
  id: string;
  name: string;
  createdAt: string;
  data: {
    arrangement: SongStructureBlock[];
    songTitle: string;
    tags: string;
    blockTypeColors: Record<string, string>;
    bpm?: number; // New
    beatsPerBar?: number; // New
  };
}
// --- End Types for Song Structure Builder ---
