
import React from 'react';
import type { ToolId, ToolProps as LayoutToolProps } from './Layout';

// Define the order of categories for the sidebar
const categoryDisplayOrder = [
  "AI Music Platforms",
  "Creative AI & Content Tools",
  "Creator Resources & Learning",
  "Music Theory & Composition",
  "Community & Fun Tools",
  "App & Info"
];

// Tool Descriptions
const toolDescriptions: Record<ToolId, string> = {
  sunoMusicPlayer: "Dive into any Suno.com user's song library, a specific playlist, or a custom list of Suno, Riffusion, and Producer.AI song URLs (one per line). Load, play, shuffle, and manage the collection with an advanced player featuring real-time visualization and a 10-band EQ. Caches data for users/playlists for faster subsequent loads. Custom URL lists are not cached.",
  sunoUserStats: "Explore detailed statistics for any Suno user. View profile info, song counts, total/average durations, tag & genre analysis, and activity trends (Since Last Update, 7-day, 30-day song performance). Data is fetched, stored locally with a 30-calendar-day retention for historical points, and visualized. Cover art in top song charts is clickable.",
  sunoSongCompliance: "Verify Suno, Riffusion, and Producer.AI song titles against contest rules (editable pattern) and analyze lyrics using Google Gemini API for language ID (plus untranslatable word detection) and content rating (G, PG, PG-13, R, Explicit). Features batch URL processing, CSV export, save/load URL lists, and a link to the Lyric Processor for problematic lyrics.",
  songStructureBuilder: "Visually construct your song's arrangement. Drag and drop predefined blocks (like Verse, Chorus, Bridge) or custom-named sections onto a timeline. Reorder blocks, add descriptive notes to each part, and instantly generate a formatted prompt ready to be used in AI music generators.",
  songCoverArt: "Craft stunning song cover art. Load song info and artwork from Suno, Riffusion, or Producer.AI URLs to auto-fill details. Add stylish text overlays (with presets and gradient options), optional logo/watermark overlays with blend modes, and adjust image filters on your existing artwork. Customize fonts, colors, and positions.",
  mp3Cutter: "Quickly cut or crop audio. Upload an MP3 file or load from a Suno, Riffusion, or Producer.AI song URL (displays cover art & artist, allows cover download). Visualize its waveform, select a region (max 50% of total duration), preview, and download the cropped segment as an MP3 file.",
  lyricProcessor: "Perfect your lyrics. Load lyrics, title, and artist from Suno, Riffusion, or Producer.AI URLs. Analyze syllable counts (now with word/char counts per line), clean & format (with options for bracket removal), find & replace text (with regex/case options), convert case (UPPER, lower, Title), optionally show line numbers, and add standardized creator/copyright headers. Lyrics can be pre-filled from the Suno Song Compliance Tool.",
  lyricsSynchronizer: "Create time-stamped lyrics for karaoke. Load an audio file (MP3, Suno, Riffusion, or Producer.AI URL) and lyrics (paste, type, or import LRC). Auto-imports timed lyrics from Riffusion if available. Mark timestamps manually by clicking or use the spacebar shortcut while playing. Features Karaoke preview mode, and export to LRC file format.",
  sparkTuneChallenge: "Design and share music challenges! Set prompts (genre, mood, vocals, tempo, etc.), rules, and links. Generates two posts for you via tabs: a detailed 'Announcement Post' and a concise 'Reminder Post' for later use. Saves challenge history for quick loading.",
  sunoCommunitySpinner: "A playful and interactive addition to spark fun and engagement within the Suno AI music community. It's a customizable wheel pre-filled with activities relevant to Suno AI music creation and its community. Spin for a random action or mini-challenge!",
  randomMusicStyle: "Break creative blocks! Generate diverse combinations of genres, moods, tempos, instrumentation, and more. Features intensity controls for multi-item categories (Simple, Moderate, Complex), personalize with your own custom items (import/export supported), lock elements, get Suno-ready tags, and save favorites to kickstart your next AI music generation.",
  creativeConceptBlender: "Spark wildly original musical ideas by blending concepts. Use the 'Record New' mode to manually build your concept step-by-step from interactive palettes. Personalize with your own custom items, lock your favorite parts, add a surprise twist, save history, and manage favorites! Now with advanced optional layers for Musicality, Core Conflict, Character, Setting, and Catalyst to build even more detailed concepts.",
  chordProgressionGenerator: "Generate and explore diatonic chord progressions (triads or seventh chords) in various keys and modes. Get harmonic starting points for your compositions, view Roman numerals, and see all chords in the key. Click to hear individual chords! Export to MIDI. Now with a 'Record Progression' mode for manual input!",
  scaleChordViewer: "Explore musical scales and their diatonic chords. Select a root note and scale type (Major, Minor, Dorian, etc.) to view all notes in that scale, along with its corresponding triads and seventh chords. Click on any chord to hear it played, aiding in ear training and composition.",
  songDeckPicker: "Manage a song card collection with Standard and Reveal Cards modes. Input Suno URLs (songs/playlists, short URLs), Riffusion/Producer.AI URLs, or custom formats. Standard Mode: random/manual pick, artist bonuses, logging, export. Reveal Mode: face-down card pool (optional custom back), one-by-one reveal, log all revealed. Features highly customizable themes (title, logo, colors, fonts, picker settings) with import/export for full configurations.",
  musicTheoryWiki: "Learn about song structures (verse, chorus, bridge), music theory basics (beats, scales, chords), and get tips for effective AI music composition. Searchable content by title, keywords, and full text.",
  localMusicResourceDirectory: "A curated directory of links to external websites and resources for music creators. Find AI music platforms, royalty-free samples, DAWs, tutorials, and more. Content is developer-managed for quality and relevance.",
  bpmTapper: "Quickly find the Beats Per Minute (BPM) of any song by tapping along to the rhythm. Also includes a Musical Key Finder where you can upload an audio file or provide a Suno/Riffusion URL to analyze and suggest the song's key and BPM.",
  metronome: "A classic metronome. Set BPM and time signature to get a steady visual and audible beat. Now features selectable beat subdivisions (eighths, sixteenths, triplets) and customizable click sounds for enhanced practice.",
  releaseNotes: "See what's new! Track updates, features, and fixes for the Music AI Multi-Tool Hub. Notes are now organized for easier reading.",
  stats: "Gain insights into the Music AI Multi-Tool Hub's global reach. View all-time unique visitors, total pageviews, recent activity trends, and a breakdown of top countries using the Hub. Data is collected anonymously to help us understand and improve the platform.",
  specialMentions: "Acknowledgements and thanks to individuals who have supported and contributed to the Hub.",
  about: "Information about this application, its mission, creators, and privacy policy."
};

// Workflow Types & Data
interface WorkflowAction {
  label: string;
  toolId: ToolId;
}

interface Workflow {
  title: string;
  description: string;
  iconId: ToolId;
  actions: WorkflowAction[];
}

const workflows: Workflow[] = [
  {
    title: "I need inspiration...",
    description: "Use our generators to spark new ideas for genres, styles, and creative concepts before you start writing.",
    iconId: 'randomMusicStyle',
    actions: [
      { label: "Generate a Style", toolId: 'randomMusicStyle' },
      { label: "Blend a Concept", toolId: 'creativeConceptBlender' }
    ]
  },
  {
    title: "I'm writing a song...",
    description: "Build your song's arrangement, write and manage lyrics, and check their flow and complexity.",
    iconId: 'songStructureBuilder',
    actions: [
      { label: "Build Song Structure", toolId: 'songStructureBuilder' },
      { label: "Process Lyrics", toolId: 'lyricProcessor' },
      { label: "Synchronize Lyrics", toolId: 'lyricsSynchronizer' }
    ]
  },
  {
    title: "I have a finished song...",
    description: "Analyze your finished track for compliance, create stunning visuals, and trim it for sharing.",
    iconId: 'sunoSongCompliance',
    actions: [
      { label: "Check Compliance", toolId: 'sunoSongCompliance' },
      { label: "Create Cover Art", toolId: 'songCoverArt' },
      { label: "Cut MP3", toolId: 'mp3Cutter' }
    ]
  },
  {
    title: "I want to explore...",
    description: "Listen to music from AI platforms, dive into user stats, or brush up on your music theory.",
    iconId: 'sunoMusicPlayer',
    actions: [
      { label: "Music Shuffler", toolId: 'sunoMusicPlayer' },
      { label: "User Stats", toolId: 'sunoUserStats' },
      { label: "Theory Wiki", toolId: 'musicTheoryWiki' }
    ]
  }
];

interface ToolCardProps {
  title: string;
  description: string;
  icon?: React.ReactElement;
  onClick?: () => void;
}

const ToolCard: React.FC<ToolCardProps> = ({ title, description, icon, onClick }) => {
  const interactiveProps = onClick ? {
    role: "button",
    tabIndex: 0,
    onKeyDown: (e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') onClick(); },
    "aria-label": `Navigate to ${title}`
  } : {};

  return (
    <div
      className={`bg-gray-50 dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 hover:border-green-500 dark:hover:border-green-500 transition-all duration-300 ease-in-out transform hover:scale-[1.02] hover:shadow-xl flex flex-col ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
      {...interactiveProps}
    >
      <div className="flex items-center mb-4">
        {icon && <span className="mr-4 text-green-600 dark:text-green-400 flex-shrink-0">{React.cloneElement(icon as React.ReactElement<{ className?: string }>, { className: "w-8 h-8" })}</span>}
        <h3 className="text-xl font-semibold text-green-800 dark:text-green-300">{title}</h3>
      </div>
      <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed flex-grow">{description}</p>
    </div>
  );
};

const AboutPage = ({ onNavigate, toolsList, trackLocalEvent }: LayoutToolProps) => {
  const emailAddress = "qwqwojij0@mozmail.com";
  const emailSubject = "Music AI Multi-Tool Hub Feedback";
  const emailBody = `Hello Music AI Multi-Tool Hub Team,

I have some feedback/ideas regarding:

- Tool name or specific feature: [Please specify]
- Suggestion/Bug details: [Please describe]

Additional details (optional):
[Any other information, screenshots if applicable but they can't be attached via mailto]

Thanks,
[Your Name / Discord Handle (Optional)]`;

  const mailtoLink = `mailto:${emailAddress}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
  const privacyPolicyLastUpdated = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const groupedTools = toolsList ? toolsList.reduce((acc, tool) => {
    if (tool.id === 'about') return acc;
    const category = tool.category || "Other Tools";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(tool);
    return acc;
  }, {} as Record<string, Array<{ id: ToolId, name: string, icon?: React.ReactElement, category?: string }>>) : {};

  const getIconByToolId = (toolId: ToolId): React.ReactElement | undefined => {
    const tool = toolsList?.find(t => t.id === toolId);
    return tool?.icon;
  };

  return (
    <div className="w-full max-w-5xl mx-auto bg-white dark:bg-gray-900 shadow-2xl rounded-lg p-4 sm:p-6 md:p-10 border-2 border-green-500 dark:border-green-600 transition-colors duration-300 overflow-hidden">
      <header className="mb-10 text-center">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight flex flex-wrap justify-center gap-x-2">
          <span className="text-green-600 dark:text-green-400">Music</span>
          <span className="text-green-500 dark:text-green-300">AI</span>
          <span className="text-gray-800 dark:text-gray-200">Multi-Tool</span>
          <span className="text-green-700 dark:text-green-500 font-bold">Hub</span>
        </h1>
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
          Your companion for AI-powered music creation and exploration.
        </p>

        {/* GitHub Star CTA */}
        <div className="mt-8 flex flex-col items-center animate-fade-in">
          <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-2xl p-6 shadow-sm max-w-2xl w-full">
            <h2 className="text-xl font-bold text-green-800 dark:text-green-200 mb-2">🚀 We are now Open Source!</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              The Hub is now public on GitHub. If you find these tools useful, please consider giving us a star to support the project!
            </p>
            <a
              href="https://github.com/spupuz/music-ai-multi-tool-hub"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold rounded-full hover:scale-105 transition-transform shadow-md group"
              onClick={() => trackLocalEvent && trackLocalEvent('Github', 'ClickedGitHubStar', 'AboutPage')}
            >
              <svg className="w-5 h-5 mr-3 fill-current" viewBox="0 0 24 24">
                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.43.372.823 1.102.823 2.222 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
              </svg>
              Star on GitHub
              <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>
          </div>
        </div>
      </header>

      <main className="text-gray-700 dark:text-gray-300 leading-relaxed">
        <section id="mission">
          <h2 className="text-3xl font-bold text-green-600 dark:text-green-400 mt-10 mb-6 border-b-2 border-green-600 pb-3">Our Mission & Ethos</h2>
          <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
            <p className="mb-3 leading-relaxed text-gray-700 dark:text-gray-300 text-lg">
              To empower musicians, producers, and creative minds by providing intuitive, innovative, and fun AI-driven tools. We aim to simplify complex tasks, spark inspiration, and enhance the joy of making music with cutting-edge technology.
            </p>
            <p className="mb-3 leading-relaxed text-gray-700 dark:text-gray-300 text-lg mt-4">
              <strong className="font-semibold text-green-700 dark:text-green-200">Community First:</strong> This Hub is a community-driven project, created for the love of music and AI exploration, <strong className="font-semibold text-green-700 dark:text-green-200">not for financial gain</strong>. Any songs or creative works featured within our tools (such as the Music Shuffler, Song Deck Picker, or SparkTune Challenge Generator) are presented as links that direct you to their original source pages (e.g., Suno.com, Riffusion.com). We strive to always link back to the original creators and their profiles, ensuring that all credit for these amazing works rightfully goes to them. This platform is about sharing, learning, and creating together.
            </p>
          </div>
        </section>

        <section id="workflows">
          <h2 className="text-3xl font-bold text-green-600 dark:text-green-400 mt-10 mb-6 border-b-2 border-green-600 pb-3">Quick Start Workflows</h2>
          <p className="mb-3 leading-relaxed text-gray-700 dark:text-gray-300">Not sure where to begin? Select a goal below to jump to the right tools for the job.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mt-4">
            {workflows.map(workflow => {
              const icon = getIconByToolId(workflow.iconId);
              return (
                <div key={workflow.title} className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 flex flex-col">
                  <div className="flex items-center mb-3">
                    {icon &&
                      <span className="mr-3 text-green-600 dark:text-green-400 flex-shrink-0">
                        {React.cloneElement(icon as React.ReactElement<{ className?: string }>, { className: "w-7 h-7" })}
                      </span>
                    }
                    <h4 className="text-xl font-semibold text-green-800 dark:text-green-300">{workflow.title}</h4>
                  </div>
                  <p className="mb-3 leading-relaxed text-gray-700 dark:text-gray-300 text-sm text-gray-600 dark:text-gray-400 flex-grow">{workflow.description}</p>
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex flex-wrap gap-2">
                    {workflow.actions.map(action => (
                      <button
                        key={action.toolId}
                        onClick={() => onNavigate && onNavigate(action.toolId)}
                        className="py-1.5 px-3 bg-gray-200 dark:bg-gray-700 hover:bg-green-100 dark:hover:bg-green-700 hover:text-green-800 dark:hover:text-white text-gray-800 dark:text-gray-200 rounded-md text-xs font-medium transition-colors"
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section id="support-the-hub" className="mt-8">
          <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg shadow-md border border-green-500 dark:border-green-600">
            <h3 className="text-2xl font-semibold text-green-700 dark:text-green-300 mb-4 text-center">Support the Hub's Journey!</h3>
            <div className="flex flex-col items-center">
              <div className="flex flex-col md:flex-row items-stretch justify-center gap-6 mb-4 w-full max-w-3xl">
                <div className="flex-1 bg-white dark:bg-gray-700/50 p-6 rounded-lg text-center flex flex-col items-center justify-between border border-gray-200 dark:border-gray-600 hover:border-green-500 transition-colors shadow-sm">
                  <div>
                    <h4 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-2">Make a Direct Contribution</h4>
                    <p className="mb-3 leading-relaxed text-gray-700 dark:text-gray-300 text-xs text-gray-500 dark:text-gray-400 mb-4 max-w-xs">
                      If you find the Hub valuable, a small tip helps cover costs and is greatly appreciated!
                    </p>
                  </div>
                  <a
                    href="https://www.buymeacoffee.com/spupuz"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block hover:opacity-90 transition-opacity mt-auto"
                    aria-label="Buy Me A Coffee to support the Music AI Multi-Tool Hub"
                    onClick={() => trackLocalEvent && trackLocalEvent('Support', 'ClickedBMACButton', 'AboutPage')}
                  >
                    <img
                      src="https://cdn.buymeacoffee.com/buttons/v2/default-green.png"
                      alt="Buy Me A Coffee"
                      style={{ height: '50px', width: '180px' }}
                    />
                  </a>
                </div>

                <div className="flex-1 bg-white dark:bg-gray-700/50 p-6 rounded-lg text-center flex flex-col items-center justify-between border border-gray-200 dark:border-gray-600 hover:border-green-500 transition-colors shadow-sm">
                  <div>
                    <h4 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-2">Support via Floot</h4>
                    <p className="mb-3 leading-relaxed text-gray-700 dark:text-gray-300 text-xs text-gray-500 dark:text-gray-400 mb-4 max-w-xs">
                      Join <a href="https://floot.com/r/Y4O5V8" target="_blank" rel="noopener noreferrer" className="font-semibold text-purple-600 dark:text-purple-400 hover:underline">Floot</a> signing up through my referral link is another great way to support the Hub's journey!
                    </p>
                  </div>
                  <a
                    href="https://floot.com/r/Y4O5V8"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-purple-600 text-white font-bold py-3 px-5 rounded-lg hover:bg-purple-500 transition-colors shadow-md text-base mt-auto"
                    onClick={() => trackLocalEvent && trackLocalEvent('Support', 'ClickedFlootReferral', 'AboutPage')}
                  >
                    Join on Floot
                  </a>
                </div>
              </div>
              <p className="mb-3 leading-relaxed text-gray-700 dark:text-gray-300 text-center max-w-xl mx-auto">
                The Music AI Multi-Tool Hub is a labor of love, offered completely free to the community. If you find these tools helpful and enjoy using them, please consider supporting its continued development and maintenance.
              </p>
              <p className="mb-3 leading-relaxed text-gray-700 dark:text-gray-300 text-center max-w-xl mx-auto">
                <strong className="font-semibold text-green-700 dark:text-green-200">Why Support?</strong>
              </p>
              <ul className="list-disc list-inside pl-4 mb-3 space-y-1 text-gray-700 dark:text-gray-300">
                <li>Help cover server costs for hosting and any future experimental features that might require backend processing or specific API access.</li>
                <li>Support the time and effort invested in developing new tools, adding features, and keeping everything up-to-date.</li>
                <li>Enable us to explore new possibilities and integrate more advanced functionalities.</li>
                <li>Show your appreciation and help keep the Hub thriving as a valuable resource for everyone!</li>
              </ul>
              <p className="mb-3 leading-relaxed text-gray-700 dark:text-gray-300 text-center max-w-xl mx-auto mt-2">
                Every contribution, no matter the size, makes a real difference and is deeply appreciated. Thank you for being a part of our creative community!
              </p>
            </div>
          </div>
        </section>

        <section id="tools">
          <h2 className="text-3xl font-bold text-green-600 dark:text-green-400 mt-10 mb-6 border-b-2 border-green-600 pb-3">Meet the Tools</h2>
          {categoryDisplayOrder.map(categoryName => {
            const toolsInCategory = groupedTools[categoryName] || [];
            if (toolsInCategory.length === 0) return null;

            return (
              <div key={categoryName}>
                <h3 className="text-2xl font-semibold text-green-700 dark:text-green-200 mt-8 mb-4 border-b border-gray-300 dark:border-gray-700 pb-2">{categoryName}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
                  {toolsInCategory.map(tool => (
                    <ToolCard
                      key={tool.id}
                      title={tool.name}
                      icon={tool.icon}
                      description={toolDescriptions[tool.id as ToolId] || "A versatile music tool."}
                      onClick={onNavigate ? () => onNavigate(tool.id) : undefined}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </section>

        <section id="story">
          <h2 className="text-3xl font-bold text-green-600 dark:text-green-400 mt-10 mb-6 border-b-2 border-green-600 pb-3">The Story & The Team</h2>
          <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 space-y-4">
            <p className="mb-3 leading-relaxed text-gray-700 dark:text-gray-300">
              The Music AI Multi-Tool Hub began as a passion project by AI Music enthusiast <a href="https://suno.com/@spupuz" target="_blank" rel="noopener noreferrer" className="text-green-600 dark:text-green-400 hover:text-green-500 dark:hover:text-green-300 font-semibold underline">@spupuz</a>, driven by a desire to create practical utilities that enhance the experience of using AI in music.
            </p>
            <p className="mb-3 leading-relaxed text-gray-700 dark:text-gray-300">
              This journey wouldn't be the same without the incredible support and collaboration of <a href="https://suno.com/@flickerlog" target="_blank" rel="noopener noreferrer" className="text-green-600 dark:text-green-400 hover:text-green-500 dark:hover:text-green-300 font-semibold underline">@flickerlog</a>. Their extensive testing, insightful feedback, and brilliant feature suggestions have been instrumental in shaping these tools and ensuring they meet the needs of the community.
            </p>
            <p className="mb-3 leading-relaxed text-gray-700 dark:text-gray-300">
              Together, we believe in the power of community and open development to make AI tools more accessible, enjoyable, and useful for everyone exploring the frontiers of music creation.
            </p>
          </div>
        </section>

        <section id="tech-stack">
          <h2 className="text-3xl font-bold text-green-600 dark:text-green-400 mt-10 mb-6 border-b-2 border-green-600 pb-3">Tech Stack Highlights</h2>
          <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
            <p className="mb-3 leading-relaxed text-gray-700 dark:text-gray-300">Our platform leverages a modern, secure, and performance-driven stack:</p>
            <ul className="list-disc list-inside pl-4 mb-3 space-y-1 text-gray-700 dark:text-gray-300">
              <li><strong className="font-semibold text-green-700 dark:text-green-200">Core Frontend:</strong> Built with <strong className="font-semibold text-green-700 dark:text-green-200">React</strong> and <strong className="font-semibold text-green-700 dark:text-green-200">TypeScript</strong> for a robust, interactive, and type-safe user experience.</li>
              <li><strong className="font-semibold text-green-700 dark:text-green-200">Styling:</strong> Crafted with <strong className="font-semibold text-green-700 dark:text-green-200">Tailwind CSS</strong> for a sleek, responsive, and consistent design.</li>
              <li><strong className="font-semibold text-green-700 dark:text-green-200">Local Processing:</strong> Heavy lifting—from audio analysis to visualization—happens right in your browser utilizing industry-standard libraries, ensuring speed and privacy.</li>
              <li><strong className="font-semibold text-green-700 dark:text-green-200">Secure Infrastructure:</strong> We utilize a privacy-focused, self-hosted proxy architecture to handle external requests securely, minimizing reliance on public third-party safeguards.</li>
              <li><strong className="font-semibold text-green-700 dark:text-green-200">AI & Integrations:</strong> Direct integration with powerful APIs (Google Gemini, Suno) to bring advanced AI capabilities to your fingertips.</li>
            </ul>
          </div>
        </section>

        <section id="feedback">
          <h2 className="text-3xl font-bold text-green-600 dark:text-green-400 mt-10 mb-6 border-b-2 border-green-600 pb-3">Feedback & Suggestions</h2>
          <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
            <p className="mb-3 leading-relaxed text-gray-700 dark:text-gray-300">Your experience and ideas are vital! We encourage you to share your feedback, suggest new tools, or report any bugs. The best way to get in touch is by sending an email to <a href={mailtoLink} className="text-green-600 dark:text-green-400 hover:text-green-500 dark:hover:text-green-300 font-semibold underline">{emailAddress}</a>.</p>
          </div>
        </section>

        <section id="privacy-policy">
          <h2 className="text-3xl font-bold text-green-600 dark:text-green-400 mt-10 mb-6 border-b-2 border-green-600 pb-3">Privacy Policy</h2>
          <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
            <p className="mb-3 leading-relaxed text-gray-700 dark:text-gray-300 text-sm text-gray-500">Last Updated: {privacyPolicyLastUpdated}</p>

            <p className="mb-3 leading-relaxed text-gray-700 dark:text-gray-300"><strong className="font-semibold text-green-700 dark:text-green-200">Your Data Stays Yours.</strong></p>
            <p className="mb-3 leading-relaxed text-gray-700 dark:text-gray-300">The Music AI Multi-Tool Hub is designed with a "privacy-first" architecture. We do not store your songs, lyrics, or generated content on our servers. All creative processing occurs locally within your browser session.</p>

            <h4 className="text-lg font-semibold text-green-700 dark:text-green-200 mt-4 mb-2">Data Handling & Infrastructure</h4>
            <ul className="list-disc list-inside pl-4 mb-3 space-y-1 text-gray-700 dark:text-gray-300">
              <li><strong className="font-semibold text-green-700 dark:text-green-200">Local Storage:</strong> We use your browser's local storage solely to remember your preferences, favorites, and custom settings for a seamless experience. You have full control to clear this at any time.</li>
              <li><strong className="font-semibold text-green-700 dark:text-green-200">Secure Proxying:</strong> For tools requiring cross-origin requests, we now route traffic through our own secure infrastructure rather than public proxies. This ensures your request data remains private and is not exposed to third-party data aggregators.</li>
              <li><strong className="font-semibold text-green-700 dark:text-green-200">External Services:</strong> When you interact with third-party platforms (like Suno or Google Gemini), data is transmitted directly to them or via our secure relays strictly for the purpose of the request. We do not log or retain this information.</li>
            </ul>

            <p className="mb-3 leading-relaxed text-gray-700 dark:text-gray-300 mt-4">By using this application, you agree to this improved privacy standard.</p>
          </div>
        </section>
      </main>
      <footer className="mt-12 pt-8 border-t border-gray-300 dark:border-gray-700 text-center">
        <p className="text-md text-gray-500 dark:text-gray-400">
          Music AI Multi-Tool Hub &copy; {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
};

export default AboutPage;
