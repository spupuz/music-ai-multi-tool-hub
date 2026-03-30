
import type { CustomItemsState, LockedCategoriesState, OptionalCategoryToggleState, IntensityLevel, MultiSelectItemCategoryKey } from '../../../types';

export const musicGenres: string[] = [
  "Pop", "Indie Pop", "Synth-Pop", "Dream Pop", "Bedroom Pop", "Hyperpop",
  "Rock", "Hard Rock", "Indie Rock", "Alternative Rock", "Punk Rock", "Post-Punk", "Garage Rock", "Shoegaze",
  "Electronic", "Techno", "House", "Deep House", "Progressive House", "Tech House", "Minimal Techno",
  "Ambient", "Downtempo", "IDM (Intelligent Dance Music)", "Glitch", "Experimental Electronic",
  "Synthwave", "Retrowave", "Outrun", "Dark Synth", "Cyberpunk", "Vaporwave",
  "Chillwave", "Lo-fi Hip Hop / Chillhop", "Trip Hop",
  "Trance", "Progressive Trance", "Psytrance", "Hard Trance",
  "Drum and Bass", "Jungle", "Liquid D&B", "Neurofunk",
  "Dubstep", "Brostep", "Riddim", "Future Bass", "Trap (EDM)",
  "Classical", "Baroque Classical", "Romantic Classical", "Modern Classical", "Minimalist Classical", "Orchestral Score",
  "Jazz", "Smooth Jazz", "Swing", "Bebop", "Cool Jazz", "Fusion Jazz", "Acid Jazz", "Jazz Funk",
  "Hip Hop", "Boom Bap", "Conscious Hip Hop", "Cloud Rap", "Abstract Hip Hop", "Drill",
  "Folk", "Acoustic Folk", "Folk Rock", "Indie Folk", "Anti-Folk", "Neofolk",
  "Metal", "Heavy Metal", "Thrash Metal", "Death Metal", "Black Metal", "Power Metal", "Progressive Metal", "Symphonic Metal", "Doom Metal", "Sludge Metal", "Djent",
  "Blues", "Electric Blues", "Delta Blues", "Soul", "Neo-Soul", "R&B", "Contemporary R&B", "Funk", "Disco",
  "Reggae", "Dub", "Ska", "Dancehall",
  "World Music", "Bollywood Music", "Celtic Music", "K-Pop", "J-Pop",
  "Video Game Music", "8-bit Chiptune", "16-bit Chiptune", "Modern Chiptune", "Pixel Art Music",
  "Orchestral Game Score", "Ambient Game Soundtrack", "Retro Game Music", "JRPG Battle Music", "Visual Novel BGM",
  "Epic Trailer Music", "Cinematic Score", "Suspense Score", "Horror Ambience", "Sci-Fi Score", "Fantasy Score"
];
export const moods: string[] = [
  "Happy", "Uplifting", "Joyful", "Euphoric", "Sad", "Melancholic", "Somber", "Bittersweet",
  "Energetic", "Driving", "Powerful", "Intense", "Aggressive", "Chaotic",
  "Relaxing", "Calm", "Peaceful", "Serene", "Meditative", "Hypnotic",
  "Epic", "Majestic", "Grand", "Heroic", "Triumphant",
  "Mysterious", "Eerie", "Unsettling", "Dark", "Brooding", "Ominous", "Suspenseful", "Anxious", "Tense",
  "Celebratory", "Festive", "Nostalgic", "Wistful", "Reflective", "Introspective",
  "Dreamy", "Ethereal", "Whimsical", "Magical", "Spiritual",
  "Romantic", "Passionate", "Sensual", "Hopeful", "Determined", "Adventurous", "Playful", "Quirky", "Comical"
];
export const tempos: string[] = [
  "Very Slow (Largo, Grave, ~40-60 BPM)", "Slow (Adagio, Andante, ~60-90 BPM)",
  "Moderate (Moderato, Allegretto, ~90-120 BPM)", "Fast (Allegro, Vivace, ~120-160 BPM)",
  "Very Fast (Presto, Prestissimo, ~160-200+ BPM)", "Steady Beat", "Driving Rhythm",
  "Gradual Accelerando (Speeding Up)", "Gradual Ritardando (Slowing Down)", "Variable Tempo"
];
export const instrumentations: string[] = [
  "Solo Piano", "Acoustic Guitar Lead", "Electric Guitar Lead (Clean)", "Electric Guitar Lead (Distorted/Overdriven)",
  "Violin Solo", "Cello Solo", "Flute Solo", "Saxophone Solo (Alto/Tenor)", "Trumpet Solo", "Harp",
  "Synthesizer Lead (Sawtooth)", "Synthesizer Lead (Square Wave)", "Synthesizer Lead (Sine Wave)", "Synthesizer Lead (FM/Wavetable)",
  "Pizzicato Strings Lead", "Glockenspiel/Celesta Lead", "Music Box Melody", "Theremin",
  "Strummed Acoustic Guitar Chords", "Power Chords (Electric Guitar)", "Piano Arpeggios", "Electric Piano (Rhodes/Wurlitzer)",
  "Organ (Hammond B3/Church Pipe)", "Synth Pads (Warm Analog)", "Synth Pads (Airy Digital/Evolving)", "Synth Arpeggios (80s style)",
  "String Section (Lush, Sustained)", "String Section (Staccato, Rhythmic)", "Brass Section (Powerful Stabs/Swells)", "Woodwind Section (Melodic Lines)",
  "Acoustic Bass (Upright)", "Electric Bass (Fingerstyle/Picked)", "Synth Bass (Sub/Moog-style)", "Synth Bass (Aggressive/Wobbly)", "808 Bass Kicks",
  "Acoustic Drum Kit (Rock/Pop)", "Acoustic Drum Kit (Jazz/Brushes)", "Electronic Drum Machine (TR-808/TR-909)", "Modern EDM Drums",
  "Industrial Percussion (Metallic Hits)", "Tribal Drums (Hand Drums, Djembe)", "Orchestral Percussion (Timpani, Cymbals, Gong)",
  "Minimalist Percussion (Clicks, Hi-hats)", "Glitchy/Stuttering Percussion", "No Drums/Ambient Percussion", "Hand Percussion (Congas, Bongos, Shakers, Tambourine)",
  "Male Vocals (Lead, Baritone/Tenor)", "Female Vocals (Lead, Soprano/Alto)", "Children's Choir", "Operatic Vocals",
  "Choir (Epic/Ethereal/Gregorian)", "Wordless Vocals (Oohs, Aahs, Humming)", "Vocal Samples/Chops", "Robotic/Vocoded Vocals", "Spoken Word Narration", "Whispered Vocals",
  "Warm Analog Synths", "Cold Digital Synths", "Heavily Distorted Guitars", "Reverb-drenched Pianos", "Echoing Synth Lines",
  "Bitcrushed Drums/Synths", "Lo-fi Vinyl Crackle/Tape Hiss", "Sidechained Pads (Pumping Effect)", "Dramatic Filter Sweeps", "Granular Synthesis Textures"
];
export const qualities: string[] = [
  "8-bit Retro", "16-bit Nostalgia", "Vintage Vibe", "Modern Polish", "Futuristic Soundscape", "Sci-Fi Atmosphere", "Cyberpunk Edge",
  "Fantasy Realm", "Medieval Mood", "Mystical & Enchanting", "Atmospheric & Immersive", "Minimalist & Sparse",
  "Lush & Layered", "Dense & Complex", "Orchestral Grandeur", "Cinematic Scope", "Epic & Sweeping",
  "Emotional & Moving", "Lo-fi & Hazy", "Chill & Laid-back", "Hypnotic & Mesmerizing", "Psychedelic & Trippy",
  "Groovy & Funky", "Catchy & Melodic", "Abstract & Experimental", "Textural & Evolving", "Organic & Acoustic", "Synthetic & Electronic",
  "Raw & Unpolished", "Aggressive & Powerful", "Delicate & Intricate", "Uplifting & Positive", "Dark & Brooding"
];
export const erasAndDecades: string[] = [
  "Ancient Times (Pre-Medieval)", "Medieval (5th-15th C.)", "Renaissance (14th-16th C.)", "Baroque (1600-1750)",
  "Classical Era (1750-1820)", "Romantic Era (1800-1910)", "Early 20th Century (1900-1940s)",
  "1950s", "1960s", "1970s", "1980s", "1990s", "2000s", "2010s", "Contemporary (2020s)",
  "Near Future Sci-Fi", "Distant Future Sci-Fi", "Alternate History Steampunk", "Post-Apocalyptic Future"
];
export const productionStyles: string[] = [
  "Polished & Clean (Modern Studio Sound)", "Raw & Unfiltered (Live Feel)", "Lo-fi & Gritty (Tape Hiss, Saturation)",
  "Spacious & Reverb-heavy (Ambient, Cinematic)", "Dry & Intimate (Close Mic'd Vocals/Instruments)",
  "Vintage Analog Warmth (Old School Gear)", "Bright & Punchy (Pop Production)", "Dark & Muddy (Metal, Industrial)",
  "Overcompressed & Loud (Loudness War Style)", "Dynamic & Breathing (Audiophile Quality)",
  "Minimalist & Sparse (Few Elements, Lots of Space)", "Dense & Layered (Wall of Sound)", "8-bit/16-bit Emulation"
];
export const musicalKeyModeSuggestions: string[] = [
  "Major Key (Happy, Bright)", "Minor Key (Sad, Reflective, Intense)", "Dorian Mode (Mysterious, Jazzy, Celtic)",
  "Phrygian Mode (Spanish, Dark, Exotic)", "Lydian Mode (Dreamy, Ethereal, Bright)", "Mixolydian Mode (Bluesy, Rock, Folk)",
  "Aeolian Mode (Natural Minor)", "Locrian Mode (Dissonant, Unstable - Use with care!)", "Pentatonic Scale (Folk, Blues, Asian)",
  "Chromatic Scale (Atonal, Dissonant)", "Whole Tone Scale (Dreamy, Unsettling)"
];
export const purposes: string[] = [
    "Video Game Background Music (Exploration)", "Video Game Background Music (Combat)", "Video Game Menu Screen",
    "Film Score (Suspense Scene)", "Film Score (Emotional Climax)", "Film Score (Action Sequence)",
    "Dance Track (High Energy Club)", "Dance Track (Chill Grooves)",
    "Meditation/Relaxation Aid", "Study/Focus Music", "Workout/Exercise Motivation",
    "Storytelling Underscore (Podcast/Audiobook)", "Podcast Intro/Outro Music",
    "Live Performance Intro", "Live Performance Interlude", "Live Performance Outro",
    "Advertisement Jingle (Upbeat & Catchy)", "Advertisement Jingle (Emotional & Soft)",
    "Phone Hold Music (Neutral & Pleasant)", "Corporate Presentation Background",
    "Short Animation Score", "Ambiance for a Themed Event (e.g., Sci-Fi Convention)",
    "Personal Project (Just for Fun!)", "YouTube Video Background Music", "Sound Design Element",
    "Sleep Aid Music", "Yoga Practice Accompaniment"
];
export const influences: string[] = [
    "Inspired by Kraftwerk's minimalism", "Sounds like early Aphex Twin experiments",
    "Evokes Hans Zimmer's epic orchestral scores", "With a Daft Punk-style vocoder and groove",
    "Reminiscent of Boards of Canada's nostalgic haze", "In the style of a Studio Ghibli fantasy soundtrack",
    "Classic 80s arcade game chiptune feel", "Like a Vangelis Blade Runner-esque soundscape",
    "A touch of Brian Eno's ambient textures", "Drawing from 90s IDM artists like Autechre",
    "A modern take on John Carpenter's synth horror", "Beats like J Dilla or Nujabes",
    "Melodies inspired by Koji Kondo (Zelda/Mario)", "Cinematic feel of Ennio Morricone's westerns",
    "Dark atmospheres of Trent Reznor/NIN", "Ethereal vocals like Enya or Cocteau Twins",
    "Funky basslines in the style of Thundercat", "Guitar work reminiscent of Pink Floyd",
    "Retro synth sounds of Depeche Mode", "Sound design similar to Ben Burtt (Star Wars)",
    "Grooves inspired by James Brown", "Complex rhythms like Meshuggah",
    "Orchestration akin to John Williams", "Playful melodies like Danny Elfman"
];
export const soundDesignFocusItems: string[] = [ 
  "Heavy Reverb Washes", "Crisp Digital Delays", "Warm Analog Saturation", "Bitcrushed Elements", "Granular Synthesis Textures",
  "Aggressive Filter Sweeps", "Sidechain Compression (Pumping)", "Lo-fi Tape Hiss/Crackle", "Extreme Panning Effects",
  "Phasers and Flangers", "Glitchy Stutters", "Found Sound Samples", "Ambient Soundscapes", "Subtle Foley",
  "Distorted Bass Drops", "Sparkling High-End Details", "Psychedelic Reverse Effects", "Overdriven Drums", "Minimalist Sound Design", "Dense Layered Textures"
];

export const initialLockedCategories: LockedCategoriesState = {
  genres: false, moods: false, tempo: false, instrumentations: false, qualities: false,
  era: false, productionStyle: false, keyModeSuggestion: false,
  purpose: false, influence: false, soundDesignFocus: false,
};

export const initialOptionalCategoryToggles: OptionalCategoryToggleState = {
  includeEra: true, includeProductionStyle: true, includeKeyModeSuggestion: true,
  includePurpose: true, includeInfluence: true, includeSoundDesignFocus: true,
};

export const initialCustomItems: CustomItemsState = {
    genres: [], moods: [], tempo: [], instrumentations: [], qualities: [],
    era: [], productionStyle: [], keyModeSuggestion: [],
    purpose: [], influence: [], soundDesignFocus: [],
};

export const initialCategoryIntensity: Record<MultiSelectItemCategoryKey, IntensityLevel> = {
  genres: 'moderate',
  moods: 'moderate',
  instrumentations: 'moderate',
  qualities: 'moderate',
};


export const TOOL_CATEGORY = 'MusicStyleGenerator';
export const HISTORY_STORAGE_KEY = 'musicStyleHistory_v2';
export const FAVORITES_STORAGE_KEY = 'musicStyleFavorites_v2';
export const CUSTOM_ITEMS_STORAGE_KEY_PREFIX = 'RMS_custom_';
export const OPTIONAL_TOGGLES_STORAGE_KEY = 'RMS_optionalCategoryToggles_v1';
export const CATEGORY_INTENSITY_STORAGE_KEY = 'RMS_categoryIntensity_v1'; // New key for intensity settings
