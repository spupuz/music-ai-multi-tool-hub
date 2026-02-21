
// release-notes/v1_8_7.tsx
import React from 'react';

const NoteHelpers = {
    P: ({ children, className = "" }: {children: React.ReactNode; className?: string}) => <p className={`mb-3 leading-relaxed text-gray-700 dark:text-gray-300 ${className}`}>{children}</p>,
    UL: ({ children }: {children: React.ReactNode}) => <ul className="list-disc list-inside pl-4 mb-3 space-y-1 text-gray-700 dark:text-gray-300">{children}</ul>,
    LI: ({ children }: {children: React.ReactNode}) => <li>{children}</li>,
    CODE: ({ children }: {children: React.ReactNode}) => <code className="bg-gray-100 dark:bg-gray-700 text-sm text-yellow-800 dark:text-yellow-300 px-1.5 py-0.5 rounded-md font-mono">{children}</code>,
    STRONG: ({ children }: {children: React.ReactNode}) => <strong className="font-semibold text-green-700 dark:text-green-200">{children}</strong>,
    SectionTitle: ({ children, id }: { children: React.ReactNode; id?: string }) => <h2 id={id} className="text-3xl font-bold text-green-600 dark:text-green-400 mt-8 mb-5 border-b-2 border-green-500 dark:border-green-600 pb-2">{children}</h2>,
    SubSectionTitle: ({ children }: {children: React.ReactNode}) => <h3 className="text-xl font-semibold text-green-600 dark:text-green-300 mt-4 mb-2">{children}</h3>
};

export const ReleaseNote_1_8_7 = () => {
  const { P, UL, LI, CODE, STRONG, SectionTitle, SubSectionTitle } = NoteHelpers;

  return (
    <section id="version-1.8.7">
      <SectionTitle>Version 1.8.7 - Suno Snippet Mode, Deck Picker Reveals & Bug Fixes!</SectionTitle>
      <P><STRONG>This update introduces an exciting "Snippet Mode" to the Suno Music Shuffler, a new "Reveal Cards Mode" for the Song Deck Picker, alongside important bug fixes.</STRONG></P>
      
      <SubSectionTitle>New Feature: Snippet Mode in Suno Music Shuffler</SubSectionTitle>
      <UL>
        <LI><STRONG>Random 30-Second Previews:</STRONG> When "Snippet Mode" is enabled via a new checkbox in the player controls, the shuffler will play a random 30-second segment from each song before automatically advancing to the next.</LI>
        <LI><STRONG>Intelligent Playback:</STRONG>
            <UL>
                <LI>If a song is longer than 30 seconds, a random start time is chosen for the snippet.</LI>
                <LI>If a song is 30 seconds or shorter, the entire song plays before advancing.</LI>
            </UL>
        </LI>
        <LI><STRONG>Seamless Interaction:</STRONG>
            <UL>
                <LI><STRONG>Play/Pause:</STRONG> Pausing clears the snippet timer; resuming restarts a 30s snippet from the current position (or plays the remainder if less than 30s).</LI>
                <LI><STRONG>Next/Previous Track:</STRONG> Clears any active snippet timeout and starts the new track with snippet logic.</LI>
                <LI><STRONG>Seek:</STRONG> Seeking within a song starts a new 30s snippet from the seeked position (or plays the remainder).</LI>
                <LI><STRONG>Toggling Snippet Mode:</STRONG> Smoothly transitions between snippet playback and normal playback, managing timers appropriately.</LI>
            </UL>
        </LI>
        <LI>A new checkbox labeled "Snippet Mode (30s random preview)" has been added to the player controls area for easy activation.</LI>
      </UL>

      <SubSectionTitle>New Feature: Reveal Cards Mode in Song Deck Picker</SubSectionTitle>
      <UL>
        <LI><STRONG>Dual Picker Modes:</STRONG> Users can now choose between "Standard Mode" (existing random pick functionality) and the new "Reveal Cards Mode" via a dropdown selector.</LI>
        <LI><STRONG>Reveal Round Preparation:</STRONG> In Reveal Mode, users can prepare a round with a configurable number of cards (default is 3, adjustable from 1 to 20) drawn from the unlogged deck.</LI>
        <LI><STRONG>Face-Down Cards:</STRONG> Cards in the reveal pool are initially displayed face-down.
            <UL>
                <LI>A default stylish card back is used.</LI>
                <LI>Users can optionally upload a <STRONG>custom image</STRONG> to be used as the card back for a personalized touch.</LI>
            </UL>
        </LI>
        <LI><STRONG>One-by-One Reveal:</STRONG> Users can click a "Reveal Next Card" button to flip cards over one at a time, adding an element of suspense and discovery.</LI>
        <LI><STRONG>Log All Revealed:</STRONG> Once all cards in the current reveal pool are face-up, an option appears to log all revealed cards to the "Logged Songs" list. This respects the "Max Logged Songs (N)" limit (default 50, configurable).</LI>
      </UL>

      <SubSectionTitle>Song Deck Picker Enhancements & UI Updates</SubSectionTitle>
      <UL>
        <LI><STRONG>New Configurable Settings:</STRONG> The UI Customization panel now includes settings for:
            <UL>
                <LI>Picker Mode (Standard / Reveal).</LI>
                <LI>Reveal Pool Size (X) for Reveal Cards Mode.</LI>
                <LI>Max Logged Songs (N) - affects both modes.</LI>
                <LI>Custom Card Back Image upload (for Reveal Mode).</LI>
            </UL>
        </LI>
        <LI><STRONG>Themes & Config Persistence:</STRONG>
            <UL>
                <LI>The "Savable Deck Themes" system now saves and loads all new picker mode settings, including the custom card back image (as Base64).</LI>
                <LI>The "Export/Import Current Config" (JSON) feature also includes these new settings, ensuring full portability of the deck's state and appearance.</LI>
            </UL>
        </LI>
        <LI><STRONG>Top Control Bar:</STRONG> A new sticky control bar has been added at the top of the Song Deck Picker tool for:
            <UL>
                <LI>Easy switching between "Standard Mode" and "Reveal Cards Mode".</LI>
                <LI>Quickly toggling the visibility of the "Inputs & Deck Building" panel and the "UI Customization & Themes" panel.</LI>
            </UL>
        </LI>
        <LI>The main random pick button in Standard Mode now more accurately reflects the number of cards remaining in the unlogged deck (e.g., "PICK RANDOM CARD (X left)").</LI>
      </UL>

      <SubSectionTitle>Bug Fixes</SubSectionTitle>
      <UL>
        <LI><STRONG>Resolved "Unexpected end of input" Error:</STRONG> Fixed a <CODE>SyntaxError</CODE> that could occur if an empty or comment-only placeholder file (<CODE>components/sunoUserStats/StatChartsPlaceholder.tsx</CODE>) was incorrectly processed as a JavaScript module. The placeholder file has been removed.</LI>
        <LI><STRONG>Fixed TypeScript Error in Suno Audio Player:</STRONG> Corrected a type error ("This expression is not callable. Type 'String' has no call signatures") in <CODE>hooks/useSunoAudioPlayer.ts</CODE> by adding the missing import for the <CODE>resolveSunoUrlToPotentialSongId</CODE> function from <CODE>songDeckPicker.utils.ts</CODE>.</LI>
        <LI><STRONG>Type Correction for Timers:</STRONG> Changed <CODE>NodeJS.Timeout</CODE> to <CODE>number</CODE> in <CODE>hooks/useSunoAudioPlayer.ts</CODE> for browser compatibility, as <CODE>setTimeout</CODE> and <CODE>setInterval</CODE> return a number in browser environments.</LI>
      </UL>
      <P>Enjoy the new Snippet Mode for a rapid-fire Suno song discovery and the new Reveal Mode for an exciting way to pick your song cards!</P>
    </section>
  );
};
