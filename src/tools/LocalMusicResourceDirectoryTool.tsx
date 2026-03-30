
import React, { useState, useMemo } from 'react';
import type { ToolProps } from '../../Layout';

const TOOL_CATEGORY = 'LocalMusicResourceDirectory';

interface ResourceItem {
  id: string;
  title: string;
  url: string;
  description: string;
  keywords?: string[]; // Optional keywords for better search
}

interface ResourceCategory {
  id: string;
  name: string;
  items: ResourceItem[];
}

// Initial curated list of resources (Developer managed)
const initialResourceCategories: ResourceCategory[] = [
  {
    id: 'ai-music-platforms',
    name: 'AI Music Platforms',
    items: [
      { id: 'sunoai', title: 'Suno AI', url: 'https://suno.com/', description: 'Official website for Suno AI. Create original music with AI, explore songs, and connect with the community.', keywords: ['suno', 'ai music generation', 'platform', 'create music'] },
      { id: 'riffusion', title: 'Riffusion', url: 'https://www.riffusion.com/', description: 'Create music from text prompts using stable diffusion. Generate riffs, melodies, and full tracks.', keywords: ['riffusion', 'stable diffusion music', 'ai music generation', 'platform', 'text to music'] },
    ],
  },
  {
    id: 'royalty-free-samples',
    name: 'Royalty-Free Samples & Loops',
    items: [
      { id: 'spl1', title: 'Splice Sounds', url: 'https://splice.com/sounds', description: 'Vast library of royalty-free samples, loops, and presets (Subscription-based).', keywords: ['samples', 'loops', 'presets', 'subscription'] },
      { id: 'lpcl1', title: 'Looperman', url: 'https://www.looperman.com/', description: 'Community-based site with free loops and acapellas uploaded by users (check licenses per item).', keywords: ['free loops', 'acapellas', 'community'] },
      { id: 'bbcsfx', title: 'BBC Sound Effects', url: 'https://sound-effects.bbcrewind.co.uk/', description: 'Archive of BBC sound effects for personal, educational or research purposes under RemArc Licence.', keywords: ['bbc', 'sfx', 'archive', 'research'] },
    ],
  },
  {
    id: 'public-domain-sfx',
    name: 'Public Domain & CC0 Sound Effects',
    items: [
      { id: 'fsorg', title: 'Freesound.org', url: 'https://freesound.org/', description: 'Collaborative database of Creative Commons licensed sounds. Filter by CC0 for unrestricted use.', keywords: ['creative commons', 'cc0', 'sfx', 'field recordings', 'community'] },
      { id: 'zapsplat', title: 'ZapSplat', url: 'https://www.zapsplat.com/', description: 'Offers free sound effects with attribution, and a Gold membership for more sounds/no attribution.', keywords: ['sfx', 'game sounds', 'ui sounds'] },
    ],
  },
  {
    id: 'music-theory-guides',
    name: 'Online Music Theory Guides',
    items: [
      { id: 'mtnet', title: 'MusicTheory.net', url: 'https://www.musictheory.net/lessons', description: 'Clear and concise lessons on music theory fundamentals, exercises, and tools.', keywords: ['lessons', 'exercises', 'fundamentals', 'scales', 'chords', 'harmony'] },
      { id: 'teoria', title: 'Teoria', url: 'https://www.teoria.com/', description: 'In-depth music theory reference, tutorials, and exercises.', keywords: ['reference', 'tutorials', 'harmony', 'counterpoint', 'analysis'] },
      { id: 'lghtnt', title: 'Lightnote', url: 'https://www.lightnote.co/', description: 'Interactive lessons making music theory easy and fun to learn.', keywords: ['interactive', 'beginner friendly', 'visual learning'] },
    ],
  },
  {
    id: 'daw-production-tutorials',
    name: 'DAW & Production Tutorials',
    items: [
      { id: 'ytcps', title: 'YouTube: In The Mix', url: 'https://www.youtube.com/@inthemix', description: 'High-quality tutorials on mixing, mastering, and music production, often using free/affordable tools.', keywords: ['youtube', 'mixing', 'mastering', 'production', 'tutorials', 'daw', 'cubase pro stream'] },
      { id: 'ytadsr', title: 'YouTube: ADSR Music Production Tutorials', url: 'https://www.youtube.com/c/ADSRtuts', description: 'Tutorials on sound design, synthesis, DAWs, and music production techniques.', keywords: ['youtube', 'sound design', 'synthesis', 'daw', 'tutorials'] },
      { id: 'ytpp', title: 'YouTube: Produce Like A Pro', url: 'https://www.youtube.com/@producelikeapro', description: 'Mixing, recording, and production tips from Warren Huart.', keywords: ['youtube', 'mixing', 'recording', 'pro audio'] },
    ],
  },
  {
    id: 'creator-resources-learning-tools',
    name: 'Creator Resources & Learning Tools',
    items: [
      { id: 'aimacinfo', title: 'AIMAC (AI Music Community)', url: 'https://aimac.info/', description: 'A community hub for AI music creators. Features news, resources, tutorials, and a showcase of AI-generated music.', keywords: ['ai music', 'community', 'blog', 'resources', 'tutorials', 'showcase'] },
      { id: 'sunorank', title: 'SunoRank (by Cayspekko)', url: 'https://cayspekko.github.io/sunorank/#/', description: 'A community-built tool for viewing trending and top-ranked songs on Suno AI. Useful for discovery and seeing what\'s popular.', keywords: ['suno', 'ranking', 'stats', 'trending', 'discovery', 'tool', 'utility'] },
      { id: 'patreon-alikan', title: 'Alikan Music (Patreon)', url: 'https://www.patreon.com/c/Alikan_Music/posts', description: "Support Alikan's music creation journey and access exclusive content, insights, and community interactions via Patreon.", keywords: ["alikan", "patreon", "support artist", "music creator", "community", "suno", "tutorials", "insights"] },
      { id: 'songcontestai', title: 'SongContest.ai', url: 'https://www.songcontest.ai/contests', description: 'A platform listing various AI song contests. Find new challenges, participate, and win prizes.', keywords: ['song contest', 'ai music', 'challenges', 'competitions'] },
    ],
  },
  {
    id: 'helpful-music-creator-communities',
    name: 'Helpful Music Creator Communities',
    items: [
      { id: 'rprod', title: 'r/musicproduction (Reddit)', url: 'https://www.reddit.com/r/musicproduction/', description: 'Large Reddit community for discussing music production techniques, gear, and getting feedback.', keywords: ['reddit', 'forum', 'feedback', 'discussion', 'gear'] },
      { id: 'redmprod', title: 'r/edmproduction (Reddit)', url: 'https://www.reddit.com/r/edmproduction/', description: 'Reddit community focused on Electronic Dance Music production.', keywords: ['reddit', 'edm', 'electronic music', 'forum'] },
      { id: 'rweaem', title: 'r/WeAreTheMusicMakers (Reddit)', url: 'https://www.reddit.com/r/WeAreTheMusicMakers/', description: 'Community for musicians of all levels to discuss songwriting, collaboration, promotion, and more.', keywords: ['reddit', 'songwriting', 'collaboration', 'musicians'] },
      { id: 'sunoaidisc', title: 'Suno AI Official Discord', url: 'https://discord.gg/suno', description: 'The official Discord server for Suno AI. Connect with other users, share creations, and get updates.', keywords: ['suno', 'discord', 'community', 'ai music'] },
      { id: 'twitchteemuth', title: 'Midnight Teemuth (Twitch)', url: 'https://www.twitch.tv/midnight_teemuth', description: 'Twitch streamer focusing on Suno AI music creation, live sessions, and community interaction.', keywords: ['twitch', 'stream', 'suno', 'live', 'community'] },
      { id: 'twitchaiumbrella', title: 'The AI Umbrella (Twitch)', url: 'https://www.twitch.tv/theaiumbrella', description: 'Twitch channel dedicated to AI music, showcasing tools, creations, and discussions around the AI music scene.', keywords: ['twitch', 'stream', 'ai music', 'showcase', 'community'] },
      { id: 'twitchriffusion', title: 'RiffusionAI Official (Twitch)', url: 'https://www.twitch.tv/riffusionai', description: 'Official Twitch channel for Riffusion, featuring demos, updates, and community engagement for the Riffusion platform.', keywords: ['twitch', 'stream', 'riffusion', 'official', 'demos'] },
      { id: 'twitchharlechryzz', title: 'Harlechryzz (Twitch)', url: 'https://www.twitch.tv/harlechryzz', description: 'Twitch streamer known for Suno AI explorations, creative prompting, and engaging with the Suno community.', keywords: ['twitch', 'stream', 'suno', 'prompting', 'community'] },
      { id: 'twitchvaldran', title: 'TombstoneLounge (Valdran) (Twitch)', url: 'https://www.twitch.tv/tombstonelounge_valdran', description: 'Twitch channel featuring Suno AI music creation, often with a focus on specific themes or community challenges.', keywords: ['twitch', 'stream', 'suno', 'themes', 'challenges'] },
      { id: 'twitchssc', title: 'SSC (Twitch)', url: 'https://www.twitch.tv/sunosongcontest', description: 'Twitch channel for SSC Song Contest, live judging, and announcements.', keywords: ['twitch', 'stream', 'suno', 'ssc', 'contest', 'judging'] },
      { id: 'twitchsebssuno', title: 'SebsSunoStreams (Twitch)', url: 'https://www.twitch.tv/sebssunostreams', description: 'Twitch streamer sharing Suno AI music creation sessions, tips, and community interactions.', keywords: ['twitch', 'stream', 'suno', 'tips', 'community'] },
      { id: 'ssc7radio', title: 'SSC7 Radio', url: 'https://ssc7-radio.onrender.com/', description: 'Community-run radio for Suno Song Contest 7. Listen to entries and related music.', keywords: ['ssc', 'suno song contest', 'radio', 'community', 'music stream', 'scc7'] },
    ],
  },
  {
    id: 'free-vst-plugins',
    name: 'Free/Open-Source VST Instruments & Effects',
    items: [
      { id: 'kvraudio', title: 'KVR Audio (Free Plugins Section)', url: 'https://www.kvraudio.com/plugins/windows/macosx/linux/vst/vst3/free/newest', description: 'Large database of audio plugins, filterable by "Free". Check licenses per plugin.', keywords: ['vst', 'au', 'aax', 'free plugins', 'database'] },
      { id: 'plugins4free', title: 'Plugins4Free', url: 'https://plugins4free.com/', description: 'Collection of free VST, VST3, AU, AAX plugins for Windows, Mac, and Linux.', keywords: ['vst', 'free instruments', 'free effects'] },
      { id: 'surge-xt', title: 'Surge XT (Synthesizer)', url: 'https://surge-synthesizer.github.io/', description: 'Powerful open-source hybrid subtractive synthesizer. Highly versatile.', keywords: ['synthesizer', 'open source', 'vst', 'instrument'] },
      { id: 'vital', title: 'Vital Audio (Basic Version Free)', url: 'https://vital.audio/', description: 'Spectral warping wavetable synthesizer with a highly capable free basic version.', keywords: ['synthesizer', 'wavetable', 'free version', 'vst', 'instrument'] },
    ],
  }
];

const SearchBar: React.FC<{ searchTerm: string; onSearchChange: (term: string) => void }> = ({ searchTerm, onSearchChange }) => (
  <div className="mb-6">
    <input
      type="search"
      value={searchTerm}
      onChange={(e) => onSearchChange(e.target.value)}
      placeholder="Search resources..."
      className="w-full px-4 py-2 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-green-500 rounded-lg shadow-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 text-gray-900 dark:text-white sm:text-sm"
      aria-label="Search music resources"
    />
  </div>
);

const CategoryFilterButtons: React.FC<{
  categories: { id: string; name: string }[];
  selectedCategoryId: string | null;
  onSelectCategory: (categoryId: string | null) => void;
}> = ({ categories, selectedCategoryId, onSelectCategory }) => (
  <div className="mb-6 flex flex-wrap gap-2">
    <button
      onClick={() => onSelectCategory(null)}
      className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors
                        ${!selectedCategoryId ? 'bg-green-500 text-black' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
    >
      All Resources
    </button>
    {categories.map(category => (
      <button
        key={category.id}
        onClick={() => onSelectCategory(category.id)}
        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors
                            ${selectedCategoryId === category.id ? 'bg-green-500 text-black' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
      >
        {category.name}
      </button>
    ))}
  </div>
);

const LocalMusicResourceDirectoryTool: React.FC<ToolProps> = ({ trackLocalEvent }) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  const allCategoriesForFiltering = useMemo(() => {
    return initialResourceCategories.map(cat => ({ id: cat.id, name: cat.name })).sort((a, b) => a.name.localeCompare(b.name));
  }, []);


  const filteredCategories = useMemo(() => {
    let categoriesToDisplay = [...initialResourceCategories];

    if (selectedCategoryId) {
      categoriesToDisplay = categoriesToDisplay.filter(cat => cat.id === selectedCategoryId);
    }

    if (searchTerm.trim()) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      categoriesToDisplay = categoriesToDisplay.map(category => {
        const filteredItems = category.items.filter(item =>
          item.title.toLowerCase().includes(lowerSearchTerm) ||
          item.description.toLowerCase().includes(lowerSearchTerm) ||
          (item.keywords && item.keywords.some(kw => kw.toLowerCase().includes(lowerSearchTerm))) ||
          (selectedCategoryId === null && category.name.toLowerCase().includes(lowerSearchTerm))
        );
        return { ...category, items: filteredItems };
      }).filter(category => category.items.length > 0);
    }

    const categoryDisplayOrder = ["AI Music Platforms", "Creator Resources & Learning Tools", "Royalty-Free Samples & Loops", "Public Domain & CC0 Sound Effects", "Online Music Theory Guides", "DAW & Production Tutorials", "Helpful Music Creator Communities", "Free/Open-Source VST Instruments & Effects"];
    return categoriesToDisplay.sort((a, b) => {
      const indexA = categoryDisplayOrder.indexOf(a.name);
      const indexB = categoryDisplayOrder.indexOf(b.name);
      if (indexA === -1 && indexB === -1) return a.name.localeCompare(b.name); // Sort unknown categories alphabetically
      if (indexA === -1) return 1;  // Unknown categories go to the end
      if (indexB === -1) return -1; // Unknown categories go to the end
      return indexA - indexB;
    });
  }, [searchTerm, selectedCategoryId]);

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    if (term.trim()) trackLocalEvent(TOOL_CATEGORY, 'searchedResources', term.trim());
  };

  const handleCategorySelect = (categoryId: string | null) => {
    setSelectedCategoryId(categoryId);
    if (categoryId) {
      const categoryName = initialResourceCategories.find(cat => cat.id === categoryId)?.name || categoryId;
      trackLocalEvent(TOOL_CATEGORY, 'filteredByCategory', categoryName);
    } else {
      trackLocalEvent(TOOL_CATEGORY, 'clearedCategoryFilter');
    }
  };


  return (
    <div className="w-full">
      <header className="mb-10 text-center">
        <h1 className="text-5xl font-extrabold text-green-600 dark:text-green-400">Local Music Resource Directory</h1>
        <p className="mt-3 text-md text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
          A curated list of useful websites and tools for music creators. All links open in a new tab.
        </p>
      </header>

      <main className="w-full bg-white dark:bg-gray-900 shadow-2xl rounded-lg p-6 md:p-8 border-2 border-green-500 dark:border-green-500">
        <SearchBar searchTerm={searchTerm} onSearchChange={handleSearchChange} />
        <CategoryFilterButtons
          categories={allCategoriesForFiltering}
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={handleCategorySelect}
        />

        {filteredCategories.length === 0 && (
          <p className="text-gray-500 dark:text-gray-400 text-center py-6">
            No resources match your current search or filter criteria.
          </p>
        )}

        <div className="space-y-8">
          {filteredCategories.map(category => (
            <section key={category.id} aria-labelledby={`category-title-${category.id}`}>
              <h2 id={`category-title-${category.id}`} className="text-2xl font-semibold text-green-700 dark:text-green-300 mb-4 border-b-2 border-green-600 dark:border-green-700 pb-2">
                {category.name}
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {category.items.map(item => (
                  <a
                    key={item.id}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackLocalEvent(TOOL_CATEGORY, 'resourceLinkClicked', item.title)}
                    className="block bg-gray-50 dark:bg-gray-800 p-5 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 hover:border-green-500 dark:hover:border-green-500 hover:shadow-xl transition-all duration-300 ease-in-out transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-900"
                  >
                    <h3 className="text-lg font-semibold text-green-700 dark:text-green-200 mb-1.5">{item.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{item.description}</p>
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-2 hover:underline">Visit Site &rarr;</p>
                  </a>
                ))}
              </div>
            </section>
          ))}
        </div>

        <p className="mt-8 text-xs text-gray-500 dark:text-gray-400 text-center">
          Disclaimer: This directory provides links to external sites. We are not responsible for the content or practices of these sites. Please review their terms and licenses before use.
        </p>
      </main>
    </div>
  );
};

export default LocalMusicResourceDirectoryTool;
