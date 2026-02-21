
// release-notes/v1_9_5.tsx
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

export const ReleaseNote_1_9_5 = () => {
  const { P, UL, LI, CODE, STRONG, SectionTitle, SubSectionTitle } = NoteHelpers;

  return (
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
  );
};
