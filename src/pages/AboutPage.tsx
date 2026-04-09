import React from 'react';
import type { ToolId, ToolProps as LayoutToolProps } from '@/Layout';
import Button from '@/components/common/Button';
import { GithubIcon } from '@/components/Icons';
import { useTheme } from '@/context/ThemeContext';

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
  promptSpark: "Design and share music challenges! Set prompts (genre, mood, vocals, tempo, etc.), rules, and links. Generates two posts for you via tabs: a detailed 'Announcement Post' and a concise 'Reminder Post' for later use. Saves challenge history for quick loading.",
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
  const { uiMode } = useTheme();
  const interactiveProps = onClick ? {
    role: "button",
    tabIndex: 0,
    onKeyDown: (e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') onClick(); },
    "aria-label": `Navigate to ${title}`
  } : {};

  return (
    <div
      className={`p-6 rounded-xl shadow-lg border transition-all duration-300 ease-in-out transform hover:scale-[1.02] hover:shadow-xl flex flex-col 
        ${uiMode === 'architect' 
          ? 'glass-card border-white/10 hover:border-emerald-500/20' 
          : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-emerald-500 dark:hover:border-emerald-500'} 
        ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
      {...interactiveProps}
    >
      <div className="flex items-center mb-4">
        {icon && <span className={`mr-4 flex-shrink-0 ${uiMode === 'architect' ? 'text-emerald-500' : 'text-emerald-600 dark:text-emerald-400'}`}>{React.cloneElement(icon as React.ReactElement<{ className?: string }>, { className: "w-8 h-8" })}</span>}
        <h3 className={`text-xl font-semibold ${uiMode === 'architect' ? 'text-white font-black uppercase tracking-tight' : 'text-emerald-800 dark:text-emerald-300'}`}>{title}</h3>
      </div>
      <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed flex-grow">{description}</p>
    </div>
  );
};

const AboutPage = ({ onNavigate, toolsList, trackLocalEvent }: LayoutToolProps) => {
  const { uiMode } = useTheme();
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

  if (uiMode === 'classic') {
    return (
      <div className="w-full text-gray-900 dark:text-white pb-20 px-4 animate-fadeIn">
        <header className="mb-10 text-center pt-8">
          <h1 className="text-2xl md:text-3xl font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-tight">
            About This Hub
          </h1>
          <p className="mt-3 text-sm font-medium text-gray-700 dark:text-gray-300 max-w-3xl mx-auto text-center">
            Your companion for AI-powered music creation and exploration
          </p>
          
          <div className="mt-6 flex justify-center">
            <Button
              onClick={() => {
                window.open("https://github.com/spupuz/music-ai-multi-tool-hub", "_blank");
                trackLocalEvent && trackLocalEvent('Github', 'ClickedGitHubStar', 'AboutPage');
              }}
              variant="secondary"
              size="md"
              startIcon={<GithubIcon className="w-5 h-5" />}
              className="font-bold border border-gray-300 dark:border-gray-700 shadow-sm"
            >
              Star on GitHub
            </Button>
          </div>
        </header>

        <main className="space-y-12">
          <section id="mission" className="glass-card p-6 md:p-10">
            <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-6 border-l-8 border-emerald-600 pl-4 uppercase tracking-tight">Mission & Ethos</h2>
            <div className="bg-gray-100/50 dark:bg-gray-800/50 p-8 rounded-lg border border-gray-200 dark:border-gray-700 shadow-inner">
              <p className="mb-4 text-lg leading-relaxed">
                To empower musicians, producers, and creative minds by providing intuitive, innovative, and fun AI-driven tools. We aim to simplify complex tasks, spark inspiration, and enhance the joy of making music with cutting-edge technology.
              </p>
              <p className="text-lg leading-relaxed">
                <strong className="text-emerald-700 dark:text-emerald-400">Community First:</strong> This Hub is a community-driven project, created for the love of music and AI exploration, <strong>not for financial gain</strong>. We always strive to link back to the original source pages (e.g., Suno.com, Riffusion.com) and ensure credit goes to the creators.
              </p>
            </div>
          </section>

          <section id="workflows" className="glass-card p-6 md:p-10">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 border-l-4 border-emerald-600 pl-3 uppercase">Quick Start Workflows</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {workflows.map(workflow => (
                <div key={workflow.title} className="border border-gray-200 dark:border-gray-700 p-5 rounded-lg bg-white/5 shadow-sm">
                  <h4 className="font-bold text-emerald-700 dark:text-emerald-400 mb-2 flex items-center gap-2">
                    {getIconByToolId(workflow.iconId) && React.cloneElement(getIconByToolId(workflow.iconId) as React.ReactElement, { className: "w-5 h-5" })}
                    {workflow.title}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{workflow.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {workflow.actions.map(action => (
                      <button
                        key={action.toolId}
                        onClick={() => onNavigate && onNavigate(action.toolId)}
                        className="text-xs bg-gray-100 dark:bg-gray-800 hover:bg-emerald-100 dark:hover:bg-emerald-900 px-3 py-1.5 rounded border border-gray-200 dark:border-gray-700 transition-colors font-bold text-gray-700 dark:text-gray-300"
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section id="support" className="glass-card p-6 md:p-10">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 border-l-4 border-emerald-600 pl-3 uppercase">Support</h2>
            <div className="bg-emerald-50 dark:bg-emerald-900/10 p-8 rounded-lg border border-emerald-200 dark:border-emerald-800/50 flex flex-col items-center shadow-inner">
              <p className="text-center mb-6">If you find the Hub valuable, consider supporting its continued development!</p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a href="https://www.buymeacoffee.com/spupuz" target="_blank" rel="noopener noreferrer">
                  <img src="https://cdn.buymeacoffee.com/buttons/v2/default-green.png" alt="Buy Me A Coffee" style={{ height: '45px', width: '160px' }} />
                </a>
                <a 
                  href="https://floot.com/r/Y4O5V8" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-purple-600 text-white font-bold py-2.5 px-6 rounded-md hover:bg-purple-500 transition-colors shadow-sm"
                >
                  Join on Floot
                </a>
              </div>
            </div>
          </section>

          <section id="tools" className="glass-card p-6 md:p-10">
             <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 border-l-4 border-emerald-600 pl-3 uppercase">Meet the Tools</h2>
             {categoryDisplayOrder.map(categoryName => {
                const toolsInCategory = groupedTools[categoryName] || [];
                if (toolsInCategory.length === 0) return null;
                 return (
                  <div key={categoryName} className="mb-10 last:mb-0">
                    <h3 className="text-lg font-bold text-emerald-700 dark:text-emerald-500 mb-4 ml-1 flex items-center gap-2">
                       <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                       {categoryName}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {toolsInCategory.map(tool => (
                         <div 
                          key={tool.id} 
                          onClick={() => onNavigate && onNavigate(tool.id)}
                          className="p-5 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:border-emerald-500/30 transition-all flex items-center gap-4 group"
                        >
                          <div className="text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                            {tool.icon && React.cloneElement(tool.icon as React.ReactElement, { className: "w-6 h-6" })}
                          </div>
                          <div>
                            <div className="font-bold text-sm">{tool.name}</div>
                            <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-1">{toolDescriptions[tool.id as ToolId]}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
             })}
          </section>

          <section id="feedback" className="glass-card p-6 md:p-10">
            <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-6 border-l-8 border-emerald-600 pl-4 uppercase tracking-tight">Feedback & Reporting</h2>
            <div className="bg-emerald-50 dark:bg-emerald-900/20 p-8 rounded-lg border-2 border-emerald-200 dark:border-emerald-800 shadow-xl">
              <p className="mb-8 text-lg font-medium text-emerald-900 dark:text-emerald-100 text-center">Your experience and ideas are vital! Please report bugs or suggest new features.</p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  href="https://github.com/spupuz/music-ai-multi-tool-hub/issues"
                  target="_blank"
                  as="a"
                  variant="primary"
                  className="flex-1 rounded-md py-4 font-bold text-lg shadow-lg hover:scale-[1.02] transition-transform"
                  startIcon={<GithubIcon className="w-6 h-6" />}
                  backgroundColor="#059669"
                >
                  GitHub Issues
                </Button>
                <Button
                  href={mailtoLink}
                  as="a"
                  variant="secondary"
                  className="flex-1 rounded-md py-4 font-bold text-lg border-2 border-emerald-600 dark:border-emerald-400 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/30"
                >
                  Email Support
                </Button>
              </div>
            </div>
          </section>

          <section id="privacy" className="glass-card p-6 md:p-10">
             <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 border-l-4 border-emerald-600 pl-3 uppercase">Privacy Policy</h2>
             <p className="text-xs text-gray-500 mb-4">Last Updated: {privacyPolicyLastUpdated}</p>
             <p className="mb-2 font-bold">Your Data Stays Yours.</p>
             <p className="text-sm">We do not store your songs, lyrics, or generated content on our servers. All creative processing occurs locally within your browser session.</p>
          </section>
        </main>

        <footer className="mt-16 pt-8 border-t border-gray-100 dark:border-gray-800 text-center">
          <p className="text-sm text-gray-500">Music AI Multi-Tool Hub &copy; {new Date().getFullYear()}</p>
        </footer>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto glass-card p-4 sm:p-8 md:p-12 border-white/10 shadow-2xl transition-all duration-500 animate-fadeIn relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/5 blur-[120px] pointer-events-none"></div>
      
      <header className="mb-8 md:mb-14 text-center pt-4 md:pt-8 px-4 relative z-10">
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-black uppercase tracking-tighter text-emerald-600 dark:text-emerald-500 leading-none italic mb-4">
          About This Hub
        </h1>
        <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.4em] text-gray-500 dark:text-gray-400 max-w-xl mx-auto opacity-70">
          Your companion for AI-powered music creation and exploration
        </p>

        {/* GitHub Star CTA */}
        <div className="mt-12 flex flex-col items-center">
            <Button
              onClick={() => {
                window.open("https://github.com/spupuz/music-ai-multi-tool-hub", "_blank");
                trackLocalEvent && trackLocalEvent('Github', 'ClickedGitHubStar', 'AboutPage');
              }}
              variant="primary"
              size="lg"
              startIcon={<GithubIcon className="w-6 h-6" />}
              className="font-black uppercase tracking-[0.2em] px-10 py-5 rounded-2xl shadow-xl hover:scale-105 transition-transform"
              backgroundColor="#059669"
            >
              Star on GitHub
            </Button>
        </div>
      </header>

      <main className="text-gray-700 dark:text-gray-300 leading-relaxed">
        <section id="mission">
          <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tighter text-emerald-600 dark:text-emerald-500 mt-10 mb-6 border-b-2 border-white/10 pb-3 text-center sm:text-left">Our Mission & Ethos</h2>
          <div className="bg-white/5 p-6 sm:p-8 rounded-2xl border border-white/10 shadow-inner">
            <p className="mb-3 leading-relaxed text-gray-700 dark:text-gray-300 text-lg font-bold">
              To empower musicians, producers, and creative minds by providing intuitive, innovative, and fun AI-driven tools. We aim to simplify complex tasks, spark inspiration, and enhance the joy of making music with cutting-edge technology.
            </p>
            <p className="mb-3 leading-relaxed text-gray-700 dark:text-gray-300 text-lg mt-4 font-bold opacity-80">
              <strong className="font-black text-emerald-600 dark:text-emerald-400">Community First:</strong> This Hub is a community-driven project, created for the love of music and AI exploration, <strong className="font-black text-emerald-600 dark:text-emerald-400">not for financial gain</strong>. Any songs or creative works featured within our tools (such as the Music Shuffler, Song Deck Picker, or SparkTune Challenge Generator) are presented as links that direct you to their original source pages (e.g., Suno.com, Riffusion.com). We strive to always link back to the original creators and their profiles, ensuring that all credit for these amazing works rightfully goes to them. This platform is about sharing, learning, and creating together.
            </p>
          </div>
        </section>

        <section id="workflows">
          <h2 className="text-3xl font-black uppercase tracking-tighter text-emerald-600 dark:text-emerald-500 mt-10 mb-6 border-b-2 border-white/10 pb-3">Quick Start Workflows</h2>
          <p className="mb-3 leading-relaxed text-gray-700 dark:text-gray-300 font-bold opacity-60">Not sure where to begin? Select a goal below to jump to the right tools for the job.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mt-4">
            {workflows.map(workflow => {
              const icon = getIconByToolId(workflow.iconId);
              return (
                <div key={workflow.title} className="bg-white/5 p-6 rounded-2xl border border-white/10 flex flex-col">
                  <div className="flex items-center mb-3">
                    {icon &&
                      <span className="mr-3 text-emerald-600 dark:text-emerald-400 flex-shrink-0">
                        {React.cloneElement(icon as React.ReactElement<{ className?: string }>, { className: "w-7 h-7" })}
                      </span>
                    }
                    <h4 className="text-xl font-black uppercase tracking-tight text-white">{workflow.title}</h4>
                  </div>
                  <p className="mb-3 leading-relaxed text-sm text-gray-600 dark:text-gray-400 font-bold flex-grow">{workflow.description}</p>
                  <div className="mt-4 pt-4 border-t border-white/10 flex flex-wrap gap-2">
                    {workflow.actions.map(action => (
                      <button
                        key={action.toolId}
                        onClick={() => onNavigate && onNavigate(action.toolId)}
                        className="py-1.5 px-3 bg-white/5 hover:bg-emerald-500/20 hover:text-white text-gray-400 dark:text-gray-500 rounded-lg text-[10px] font-black uppercase tracking-widest border border-white/5 transition-all"
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

        <section id="support-the-hub" className="mt-12">
          <div className="bg-emerald-500/5 p-8 rounded-2xl border border-white/10 group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-3xl"></div>
            <h3 className="text-2xl font-black uppercase tracking-tight text-white mb-6 text-center">Support the Hub's Journey!</h3>
            <div className="flex flex-col items-center">
              <div className="flex flex-col md:flex-row items-stretch justify-center gap-6 mb-8 w-full max-w-4xl relative z-10">
                <div className="flex-1 bg-white/5 p-8 rounded-2xl text-center flex flex-col items-center justify-between border border-white/10 hover:border-emerald-500/30 transition-all shadow-xl hover:-translate-y-1 duration-300">
                  <div>
                    <h4 className="text-xl font-black uppercase tracking-tight text-white mb-3 leading-tight">Direct Contribution</h4>
                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-6 max-w-xs mx-auto">
                      If you find the Hub valuable, a small tip helps cover costs and is greatly appreciated!
                    </p>
                  </div>
                  <a
                    href="https://www.buymeacoffee.com/spupuz"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block hover:scale-105 transition-transform mt-auto"
                    aria-label="Buy Me A Coffee to support the Music AI Multi-Tool Hub"
                    onClick={() => trackLocalEvent && trackLocalEvent('Support', 'ClickedBMACButton', 'AboutPage')}
                  >
                    <img
                      src="https://cdn.buymeacoffee.com/buttons/v2/default-green.png"
                      alt="Buy Me A Coffee"
                      style={{ height: '50px', width: '180px', filter: 'hue-rotate(15deg) brightness(1.1)' }}
                    />
                  </a>
                </div>

                <div className="flex-1 bg-white/5 p-8 rounded-2xl text-center flex flex-col items-center justify-between border border-white/10 hover:border-emerald-500/30 transition-all shadow-xl hover:-translate-y-1 duration-300">
                  <div>
                    <h4 className="text-xl font-black uppercase tracking-tight text-white mb-3 leading-tight">Support via Floot</h4>
                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-6 max-w-xs mx-auto">
                      Join <a href="https://floot.com/r/Y4O5V8" target="_blank" rel="noopener noreferrer" className="font-bold text-emerald-500 hover:underline">Floot</a> - signing up through my referral link is another great way to support the Hub!
                    </p>
                  </div>
                  <a
                    href="https://floot.com/r/Y4O5V8"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-white text-black font-black uppercase tracking-[0.2em] py-4 px-8 rounded-xl hover:bg-emerald-500 hover:text-white transition-all shadow-md text-xs mt-auto"
                    onClick={() => trackLocalEvent && trackLocalEvent('Support', 'ClickedFlootReferral', 'AboutPage')}
                  >
                    Join on Floot
                  </a>
                </div>
              </div>
              <p className="mb-3 leading-relaxed text-center max-w-xl mx-auto font-bold opacity-80">
                The Music AI Multi-Tool Hub is a labor of love, offered completely free to the community.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left max-w-3xl w-full mt-6 bg-white/5 p-6 rounded-2xl border border-white/10">
                <div className="flex gap-3">
                  <div className="w-1 h-1 rounded-full bg-emerald-500 mt-2 flex-shrink-0"></div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-relaxed">Help cover server costs and hosting APIs.</p>
                </div>
                <div className="flex gap-3">
                  <div className="w-1 h-1 rounded-full bg-emerald-500 mt-2 flex-shrink-0"></div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-relaxed">Support effort for new features and updates.</p>
                </div>
                <div className="flex gap-3">
                  <div className="w-1 h-1 rounded-full bg-emerald-500 mt-2 flex-shrink-0"></div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-relaxed">Explore advanced creative possibilities.</p>
                </div>
                <div className="flex gap-3">
                  <div className="w-1 h-1 rounded-full bg-emerald-500 mt-2 flex-shrink-0"></div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-relaxed">Keep the Hub thriving as a global resource.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="tools">
          <h2 className="text-3xl font-black uppercase tracking-tighter text-emerald-600 dark:text-emerald-500 mt-12 mb-8 border-b-2 border-white/10 pb-3">Meet the Tools</h2>
          {categoryDisplayOrder.map(categoryName => {
            const toolsInCategory = groupedTools[categoryName] || [];
            if (toolsInCategory.length === 0) return null;

            return (
              <div key={categoryName} className="mb-12">
                <h3 className="text-xl font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 mt-8 mb-6 border-b border-white/5 pb-2">{categoryName}</h3>
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
          <h2 className="text-3xl font-black uppercase tracking-tighter text-emerald-600 dark:text-emerald-500 mt-12 mb-6 border-b-2 border-white/10 pb-3">The Story & Team</h2>
          <div className="bg-white/5 p-8 rounded-2xl border border-white/10 shadow-inner space-y-6">
            <p className="leading-relaxed text-lg font-bold">
              The Hub began as a passion project by <a href="https://suno.com/@spupuz" target="_blank" rel="noopener noreferrer" className="text-emerald-500 hover:text-emerald-400 font-black underline underline-offset-4">@spupuz</a>, driven by a desire to create practical utilities that enhance the AI music experience.
            </p>
            <p className="leading-relaxed text-lg font-bold opacity-80">
              This journey wouldn't be the same without the collaboration of <a href="https://suno.com/@flickerlog" target="_blank" rel="noopener noreferrer" className="text-emerald-500 hover:text-emerald-400 font-black underline underline-offset-4">@flickerlog</a>. Their extensive testing and brilliant suggestions have been instrumental in shaping these tools.
            </p>
          </div>
        </section>

        <section id="tech-stack">
          <h2 className="text-3xl font-black uppercase tracking-tighter text-emerald-600 dark:text-emerald-500 mt-12 mb-6 border-b-2 border-white/10 pb-3">Tech Highlights</h2>
          <div className="bg-white/5 p-8 rounded-2xl border border-white/10 shadow-inner">
            <p className="mb-6 leading-relaxed font-bold">Our platform leverages a modern, secure, and performance-driven stack:</p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <li className="flex flex-col gap-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Core Architecture</span>
                <p className="text-sm font-bold text-gray-400 leading-relaxed">React + TypeScript for a robust, type-safe interactive experience.</p>
              </li>
              <li className="flex flex-col gap-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Styling System</span>
                <p className="text-sm font-bold text-gray-400 leading-relaxed">Tailwind CSS for sleek, responsive, and consistent high-end design.</p>
              </li>
              <li className="flex flex-col gap-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Edge Processing</span>
                <p className="text-sm font-bold text-gray-400 leading-relaxed">Local audio analysis and visualization directly in your browser.</p>
              </li>
              <li className="flex flex-col gap-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Secure Privacy</span>
                <p className="text-sm font-bold text-gray-400 leading-relaxed">Self-hosted proxy architecture minimizing third-party reliance.</p>
              </li>
            </ul>
          </div>
        </section>

        <section id="feedback">
          <h2 className="text-3xl font-black uppercase tracking-tighter text-emerald-600 dark:text-emerald-500 mt-12 mb-6 border-b-2 border-white/10 pb-3">Feedback</h2>
          <div className="bg-white/5 p-8 rounded-2xl border border-white/10 shadow-xl">
            <p className="mb-8 leading-relaxed font-bold text-lg text-center max-w-2xl mx-auto">Your experience and ideas are vital! Report bugs or suggest new features via GitHub or Email.</p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button
                href="https://github.com/spupuz/music-ai-multi-tool-hub/issues"
                target="_blank"
                as="a"
                variant="primary"
                size="lg"
                startIcon={<GithubIcon className="w-6 h-6" />}
                className="font-black uppercase tracking-[0.2em] px-10 py-5 rounded-2xl shadow-xl hover:scale-105 transition-transform"
                backgroundColor="#059669"
              >
                GitHub Issues
              </Button>
              <Button
                href={mailtoLink}
                as="a"
                variant="secondary"
                size="lg"
                className="font-black uppercase tracking-[0.2em] px-10 py-5 rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 shadow-xl hover:scale-105 transition-transform"
              >
                Email Support
              </Button>
            </div>
          </div>
        </section>

        <section id="privacy-policy">
          <h2 className="text-3xl font-black uppercase tracking-tighter text-emerald-600 dark:text-emerald-500 mt-12 mb-6 border-b-2 border-white/10 pb-3">Privacy</h2>
          <div className="bg-white/5 p-8 rounded-2xl border border-white/10">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-6 italic">Last Updated: {privacyPolicyLastUpdated}</p>

            <p className="mb-4 text-xl font-black uppercase tracking-tight text-white">Your Data Stays Yours.</p>
            <p className="mb-8 leading-relaxed font-bold opacity-80">The Hub is designed with a "privacy-first" architecture. We do not store your songs, lyrics, or generated content on our servers. All creative processing occurs locally in your browser.</p>

            <h4 className="text-sm font-black uppercase tracking-widest text-emerald-500 mb-4 italic">Infrastructure Details</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
               <div className="bg-white/5 p-6 rounded-xl border border-white/5">
                  <p className="text-xs font-black uppercase tracking-widest text-white mb-2 italic">Local Storage</p>
                  <p className="text-xs font-bold text-gray-500 leading-relaxed">Solely used for preferences, favorites, and settings. You have full control to clear this at any time.</p>
               </div>
               <div className="bg-white/5 p-6 rounded-xl border border-white/5">
                  <p className="text-xs font-black uppercase tracking-widest text-white mb-2 italic">Relays</p>
                  <p className="text-xs font-bold text-gray-500 leading-relaxed">Data sent to external APIs (Suno/Gemini) is transmitted via secure relays. We do not log or retain any info.</p>
               </div>
            </div>

            <p className="leading-relaxed font-black uppercase tracking-widest text-[10px] text-gray-600 mt-10 text-center">Agreement implicitly valid by application usage.</p>
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
