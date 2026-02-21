import React from 'react';
import { P, UL, LI, CODE, STRONG, SectionTitle, SubSectionTitle } from '../components/ReleaseNoteElements';

export interface ReleaseNoteItem {
  version: string;
  content: React.ReactNode;
}

export const releaseNotes: ReleaseNoteItem[] = [
  {
    version: "1.9.8",
    content: (
      <section id="version-1.9.8">
        <SectionTitle>Version 1.9.8 - Lyric Processor Meta & Copyright Update</SectionTitle>
        <P><STRONG>This update enhances the metadata and legal clarity of the lyrics processed and cleaned using the Lyric Processor tool.</STRONG></P>
        
        <SubSectionTitle>Lyric Processor Tool Enhancements</SubSectionTitle>
        <UL>
          <LI><STRONG>Expanded Cleaned Header:</STRONG> The "Clean Lyrics" feature now automatically generates an expanded header for your lyrics, including:
              <UL>
                  <LI>Song Title and Artist Name.</LI>
                  <LI>A direct link to the creator's Suno profile (if loaded via URL).</LI>
                  <LI>A link to the Multi-Tool Hub itself (<CODE>https://tools.checktrend.info/</CODE>).</LI>
              </UL>
          </LI>
          <LI><STRONG>Important Copyright Notice:</STRONG> A standard copyright disclaimer is now automatically appended to the bottom of all cleaned lyrics. This notice emphasizes that lyrics remain the intellectual property of their respective owners and encourages respect for artist rights.</LI>
          <LI><STRONG>Creator Handle Capture:</STRONG> The tool now intelligently extracts and stores the specific user handle when loading from Suno or Riffusion URLs to facilitate accurate profile linking.</LI>
        </UL>
      </section>
    )
  },
  {
    version: "1.9.7",
    content: (
      <section id="version-1.9.7">
        <SectionTitle>Version 1.9.7 - Guided Workflows & Improved Onboarding</SectionTitle>
        <P><STRONG>This update focuses on improving the user experience for newcomers by introducing a guided "Quick Start Workflows" section on the About page.</STRONG></P>
        
        <SubSectionTitle>About Page Enhancements</SubSectionTitle>
        <UL>
          <LI><STRONG>New "Quick Start Workflows" Section:</STRONG> To help users navigate the wide array of tools, a new section has been added to the "About This Hub" page. This feature provides goal-oriented pathways for common creative tasks.</LI>
          <LI><STRONG>Goal-Oriented Navigation:</STRONG> Users are presented with cards for common goals like "I need inspiration...", "I'm writing a song...", "I have a finished song...", and "I want to explore...".</LI>
          <LI><STRONG>Direct Tool Links:</STRONG> Each card contains buttons that navigate the user directly to the most relevant tools for their selected goal, improving discoverability and making the Hub feel more like a cohesive creative suite.</LI>
          <LI>This enhancement makes the Hub more accessible and intuitive, turning a powerful collection of tools into a guided creative journey.</LI>
        </UL>
      </section>
    )
  },
  {
    version: "1.9.6",
    content: (
      <section id="version-1.9.6">
        <SectionTitle>Version 1.9.6 - Producer.AI Integration & Riffusion Parity</SectionTitle>
        <P><STRONG>This update introduces seamless integration for Producer.AI URLs across the Hub, providing full feature parity with Riffusion and enhancing the multi-platform capabilities of our tools.</STRONG></P>
        
        <SubSectionTitle>Producer.AI URL Support</SubSectionTitle>
        <P>
          The Hub now automatically recognizes and processes URLs from <CODE>producer.ai</CODE>. When you provide a Producer.AI link, the application intelligently extracts the unique song ID and transforms it into the corresponding <CODE>riffusion.com</CODE> URL for data fetching. This allows for a smooth, uninterrupted workflow without needing to manually convert links.
        </P>
  
        <SubSectionTitle>Updated Tools</SubSectionTitle>
        <P>The following tools have been updated to be fully compliant with Producer.AI URLs:</P>
        <UL>
          <LI><STRONG>Music Shuffler:</STRONG> Load and play songs directly from Producer.AI links within your custom playlists.</LI>
          <LI><STRONG>Song Compliance Checker:</STRONG> Verify song titles, duration, and analyze lyrics from Producer.AI URLs in your batch checks.</LI>
          <LI><STRONG>Song Cover Art Creator:</STRONG> Auto-fill song details and artwork by loading from a Producer.AI URL.</LI>
          <LI><STRONG>MP3 Cutter & Cropper:</STRONG> Load audio for cropping and editing directly from a Producer.AI link.</LI>
          <LI><STRONG>Lyric Processor:</STRONG> Fetch lyrics, title, and artist information from Producer.AI songs.</LI>
          <LI><STRONG>Lyrics Synchronizer:</STRONG> Load audio and lyrics for synchronization using a Producer.AI URL.</LI>
          <LI><STRONG>Song Deck Picker:</STRONG> Include Producer.AI songs in your decks for picking and revealing.</LI>
        </UL>
        <P>This comprehensive integration ensures that creators can work with content from Suno, Riffusion, and now Producer.AI with consistent functionality across the entire toolset.</P>
      </section>
    )
  },
  {
    version: "1.9.5",
    content: (
      <section id="version-1.9.5">
        <SectionTitle>Version 1.9.5 - New Ranking Reveal Mode & UI Polish</SectionTitle>
        <P><STRONG>This update officially introduces and overhauls the "Ranking Reveal" mode in the Song Deck Picker, creating a brand new, game-like way to interact with your song decks, alongside key UI enhancements.</STRONG></P>
        
        <SubSectionTitle>New Feature: Ranking Reveal Mode</SubSectionTitle>
        <P>A new way to play has been added to the Song Deck Picker! The Ranking Reveal mode turns your song list into a suspenseful, ordered reveal.</P>
        <UL>
          <LI><STRONG>What it is:</STRONG> After building your deck, this mode assigns a rank to each song based on its order in the input field (first song is #1, second is #2, etc.). The cards are then displayed on screen <STRONG>in their ranked order</STRONG>.</LI>
          <LI><STRONG>How it works:</STRONG> All cards are presented face-down. Your goal is to reveal them in reverse order, starting from the <STRONG>lowest rank</STRONG> (e.g., #10) and working your way up to the grand reveal of rank #1. You cannot reveal a higher-ranked card until the one below it has been revealed.</LI>
          <LI><STRONG>Special Previews:</STRONG> For a configurable number of top-ranked songs (e.g., the Top 10), revealing the card triggers a special animation and plays an audio snippet, making the discovery even more exciting.</LI>
        </UL>
        
        <SubSectionTitle>Ranking Reveal Mode Enhancements</SubSectionTitle>
        <P>Alongside its official introduction, the mode has received significant visual and interactive upgrades:</P>
        <UL>
          <LI><STRONG>New Sequential Animation:</STRONG> When revealing a top-ranked song, the card now performs a flip animation in its place within the deck. Afterwards, it smoothly zooms into a larger modal view in the center of the screen for snippet playback.</LI>
          <LI><STRONG>Enhanced Modal Display:</STRONG> The zoomed-in card preview is now significantly larger and maintains the original song card's aspect ratio (it's no longer square). It consistently displays all visual elements including the border, color, cover art, and title for a cohesive look.</LI>
          <LI><STRONG>Improved Interaction Flow:</STRONG> The interaction for top-ranked songs is now clearer. After the song snippet finishes playing in the enlarged modal, a click anywhere outside the card will close it, preparing you to reveal the next card in the ranking sequence.</LI>
        </UL>
        <P>These changes make the new Ranking Reveal mode a visually engaging, consistent, and intuitive way to explore your song decks.</P>
      </section>
    )
  },
  {
    version: "1.9.4",
    content: (
        <section id="version-1.9.4">
          <SectionTitle>Version 1.9.4 - Song Structure & Lyricist's Power-Up</SectionTitle>
          <P><STRONG>This major update transforms the Song Structure Builder into a powerful lyric writing and versioning tool, and adds highly-requested management features for saving, loading, and sharing your work.</STRONG></P>
          
          <SubSectionTitle>Song Structure Builder Enhancements</SubSectionTitle>
          <UL>
            <LI><STRONG>Line-by-Line Lyric Management:</STRONG> The core of this update. Each block on the timeline now contains a dedicated lyric editor instead of a single notes field.
                <UL>
                    <LI>Users can add, delete, and re-order individual lyric lines within each block.</LI>
                    <LI>Each line is an editable input field for a streamlined writing experience.</LI>
                </UL>
            </LI>
            <LI><STRONG>Automatic Lyric Version Control:</STRONG>
                <UL>
                    <LI>When you finish editing a line (on blur), its previous version is automatically saved to its history.</LI>
                    <LI>A history icon appears next to any line with saved versions.</LI>
                    <LI>Clicking the history icon opens a modal allowing you to view all previous drafts and revert to any version with a single click.</LI>
                </UL>
            </LI>
            <LI><STRONG>Live Syllable Counting:</STRONG> A real-time syllable counter is displayed at the end of each lyric line, updating instantly as you type to help with rhythm and meter.</LI>
            <LI><STRONG>Repurposed Block Notes:</STRONG> The original "Notes" textarea for each block has been retained but is now intended for general, non-lyrical notes about the section (e.g., "mood shifts to be more intense here", "add harmonies"). These notes are included in the generated prompt.</LI>
            <LI><STRONG>Updated Prompt Generation:</STRONG> The final AI prompt now intelligently combines the block type, general block notes (formatted as comments <CODE>// like this</CODE>), and the structured lyric lines into a clean, ready-to-use format.</LI>
            <LI><STRONG>Data Migration:</STRONG> Existing song structures saved in your browser's local storage (from before this update) will be automatically migrated. The content of the old `notes` field will be split by line and converted into the new lyric line format.</LI>
          </UL>
          
          <SubSectionTitle>Saved Arrangement Management</SubSectionTitle>
            <UL>
                <LI><STRONG>Safe Deletion:</STRONG> Added a delete button for saved arrangements in the "Load" modal. Deletion now requires a 3-click confirmation to prevent accidental loss of work.</LI>
                <LI><STRONG>New Import/Export:</STRONG> Replaced the non-functional JSON import/export for saved arrangements. You can now export your <STRONG>current</STRONG> timeline to a user-friendly <CODE>.txt</CODE> file (matching the AI prompt format) or a structured <CODE>.csv</CODE> file. You can also import from these formats to quickly load a structure.</LI>
            </UL>
    
          <SubSectionTitle>General Improvements</SubSectionTitle>
          <UL>
            <LI><STRONG>Shared Syllable Counter:</STRONG> The syllable counting logic has been extracted into a shared utility file (<CODE>utils/lyricUtils.ts</CODE>) and is now used by both the Song Structure Builder and the Lyric Processor for consistency.</LI>
          </UL>
    
          <P>This comprehensive upgrade aims to make the Song Structure Builder an indispensable tool for songwriters, providing the structure of a timeline with the flexibility of a dedicated lyric editor and robust session management.</P>
        </section>
    )
  },
  {
    version: "1.9.3",
    content: (
        <section id="version-1.9.3">
          <SectionTitle>Version 1.9.3 - Riffusion Integration Across Tools</SectionTitle>
          <P><STRONG>This update expands the capabilities of several tools to integrate with Riffusion, providing more flexibility for creators using different AI music platforms.</STRONG></P>
          
          <SubSectionTitle>Tool Enhancements</SubSectionTitle>
          <UL>
            <LI><STRONG>Music Shuffler:</STRONG> Can now load and play songs from Riffusion URLs, allowing users to create mixed playlists of Suno and Riffusion tracks.</LI>
            <LI><STRONG>Song Cover Art Creator:</STRONG> Now supports loading song info and artwork directly from Riffusion URLs to auto-fill details.</LI>
            <LI><STRONG>Lyric Processor:</STRONG> Can now fetch lyrics, title, and artist information from Riffusion song URLs.</LI>
            <LI><STRONG>MP3 Cutter & Cropper:</STRONG> Now supports loading audio directly from Riffusion song URLs for cropping and editing.</LI>
          </UL>
          
          <SubSectionTitle>Documentation</SubSectionTitle>
          <UL>
            <LI>Updated the <CODE>README.md</CODE> file and the tool descriptions on the <STRONG>About</STRONG> page to reflect the new Riffusion integration in the affected tools.</LI>
          </UL>
        </section>
    )
  },
  {
    version: "1.9.2",
    content: (
        <section id="version-1.9.2">
          <SectionTitle>Version 1.9.2 - MP3 Cutter Now Supports Riffusion URLs</SectionTitle>
          <P><STRONG>This update expands the MP3 Cutter & Cropper's capabilities to load audio directly from Riffusion song URLs.</STRONG></P>
          
          <SubSectionTitle>MP3 Cutter & Cropper Enhancements</SubSectionTitle>
          <UL>
            <LI><STRONG>Riffusion URL Loading:</STRONG> Users can now paste a Riffusion song URL into the "Load from URL" input field.</LI>
            <LI><STRONG>Automatic Data Retrieval:</STRONG> The tool will fetch the Riffusion song's details, including its title, artist, cover art, and audio stream.</LI>
            <LI><STRONG>Integrated Experience:</STRONG> All existing features, such as waveform display, region selection, playback controls, and MP3 cropping/downloading, work seamlessly with audio loaded from Riffusion.</LI>
          </UL>
          <P>This makes it easier than ever to grab and edit clips from your favorite AI music platforms, all in one place.</P>
        </section>
    )
  },
  {
    version: "1.9.1",
    content: (
        <section id="version-1.9.1">
          <SectionTitle>Version 1.9.1 - Riffusion Support & Hub Reorganization</SectionTitle>
          <P><STRONG>This update expands the Music Shuffler's capabilities to include Riffusion songs and reorganizes the tool categories for better navigation.</STRONG></P>
          
          <SubSectionTitle>Music Shuffler - Riffusion Integration</SubSectionTitle>
          <UL>
            <LI><STRONG>New Song Source:</STRONG> The shuffler now supports loading songs from <STRONG>Riffusion</STRONG>. You can paste Riffusion song URLs (e.g., <CODE>https://www.riffusion.com/song/...</CODE>) into the input box, one per line.</LI>
            <LI><STRONG>Multi-Platform Playlists:</STRONG> Create custom playlists by mixing Suno URLs, Suno playlists, Suno usernames, and Riffusion URLs all in the same input box.</LI>
            <LI><STRONG>Data Handling:</STRONG> When a Riffusion URL is detected, the tool fetches the song's metadata (title, artist, image) and maps it to the player's format. Note: Since a public Riffusion API is not available, this feature currently uses mock data for demonstration purposes.</LI>
            <LI><STRONG>UI Update:</STRONG> The player's input placeholder now mentions Riffusion URLs, and the underlying logic correctly handles links to Riffusion songs and artists.</LI>
          </UL>
    
          <SubSectionTitle>Hub Organization</SubSectionTitle>
          <UL>
              <LI><STRONG>New "AI Music Platforms" Category:</STRONG> To better structure the sidebar, a new category has been introduced. The "Music Shuffler", "Suno User Stats", and "Suno Song Compliance" tools have been moved under this new heading.</LI>
              <LI>The order of categories has been updated to place "AI Music Platforms" prominently after the "About" page.</LI>
          </UL>
        </section>
    )
  },
  {
    version: "1.9.0",
    content: (
        <section id="version-1.9.0">
          <SectionTitle>Version 1.9.0 - SparkTune Super-Generator</SectionTitle>
          <P><STRONG>This version massively upgrades the "SparkTune Challenge Generator" with more granular creative controls and a streamlined workflow for posting announcements and reminders.</STRONG></P>
          
          <SubSectionTitle>SparkTune Challenge Generator Enhancements</SubSectionTitle>
          <UL>
            <LI><STRONG>New Creative Constraints:</STRONG> Added several new optional fields to allow for more specific and engaging challenges:
                <UL>
                    <LI><STRONG>Vocal Style:</STRONG> A field with a "Randomize!" button to specify vocal requirements (e.g., "Male Vocals", "Instrumental / No Vocals", "Rap Vocals").</LI>
                    <LI><STRONG>Tempo (BPM):</STRONG> A field to define a target tempo or range (e.g., "120 BPM", "90-100 BPM").</LI>
                    <LI><STRONG>Negative Constraints:</STRONG> A "Banned Elements" field to add a fun twist by forbidding certain instruments or concepts.</LI>
                </UL>
            </LI>
            <LI><STRONG>Dual Post Generation (Announcement & Reminder):</STRONG> When you generate a challenge, the tool now creates two distinct, pre-formatted posts accessible via tabs:
                <UL>
                    <LI><STRONG>Announcement Post:</STRONG> The main, exciting kick-off post, updated to include all the new prompt fields.</LI>
                    <LI><STRONG>Reminder Post:</STRONG> A brand new, concise post perfect for sharing a few days before the deadline, automatically pulling the challenge name and due date.</LI>
                </UL>
            </LI>
            <LI><STRONG>Smarter Post Content:</STRONG>
                <UL>
                    <LI><STRONG>Dynamic Hashtags:</STRONG> Posts now automatically include relevant hashtags based on your "Genre" and "Theme/Keyword" inputs.</LI>
                    <LI><STRONG>Cleaner Output:</STRONG> The logic is improved to ensure that if any optional field is left blank, its entire line is omitted from the post for a cleaner announcement.</LI>
                </UL>
            </LI>
            <LI><STRONG>UI Refinements:</STRONG> Added tooltips to explain various input fields, and the form layout has been polished for better usability.</LI>
          </UL>
          <P>These changes make the SparkTune Challenge Generator a more powerful and complete assistant for running community music challenges.</P>
        </section>
    )
  },
  // Older release notes are condensed or migrated as needed.
  {
    version: "1.8.9",
    content: (
        <section id="version-1.8.9">
            <SectionTitle>Version 1.8.9 - Lyrics Synchronizer Layout Refinements</SectionTitle>
            <P><STRONG>This update refines the user interface and workflow of the Lyrics Synchronizer tool.</STRONG></P>
            <UL>
                <LI><STRONG>Player Relocation:</STRONG> Controls moved to the end of the load section.</LI>
                <LI><STRONG>Structure:</STRONG> Synchronize section now appears directly below the load section.</LI>
            </UL>
        </section>
    )
  },
  {
      version: "1.0.0",
      content: (
          <section id="version-1.0.0">
              <SectionTitle>Version 1.0.0</SectionTitle>
              <P>The initial launch of the Music AI Multi-Tool Hub! 🎉</P>
              <SubSectionTitle>Features Included at Launch</SubSectionTitle>
              <UL>
                  <LI>Suno User Music Shuffler, Song Cover Art Creator, Lyric Processor, Music Style Generator, Creative Concept Blender, Chord Progression Generator, Scale & Chord Viewer, Song Deck Picker, Music Theory Wiki, BPM Tapper, Metronome, Usage Stats.</LI>
              </UL>
          </section>
      )
  }
];