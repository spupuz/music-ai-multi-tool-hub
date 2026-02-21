
// release-notes/v1_7_8.tsx
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

export const ReleaseNote_1_7_8 = () => {
  const { P, UL, LI, CODE, STRONG, SectionTitle, SubSectionTitle } = NoteHelpers;

  return (
    <section id="version-1.7.8">
      <SectionTitle>Version 1.7.8 - Playlist Power & Deck Refinements</SectionTitle>
      <P><STRONG>This version significantly upgrades the Suno Music Shuffler with playlist support and continues to enhance the Song Deck Picker's functionality and structure.</STRONG></P>
      
      <SubSectionTitle>Suno Music Shuffler - Playlist Integration</SubSectionTitle>
      <UL>
        <LI><STRONG>Playlist Support:</STRONG> The tool can now fetch and play songs from Suno Playlists. Users can input either a Suno username or a full Suno playlist URL (e.g., <CODE>https://suno.com/playlist/your-playlist-id/</CODE>).</LI>
        <LI><STRONG>Playlist Information Display:</STRONG> When a playlist is loaded, a new <CODE>PlaylistInfoBox</CODE> component displays:
            <UL>
                <LI>Playlist name (linked to its Suno page).</LI>
                <LI>Playlist artwork.</LI>
                <LI>Playlist description.</LI>
                <LI>Playlist-level upvote count.</LI>
                <LI>Number of songs in the playlist.</LI>
                <LI>Aggregated total upvotes, plays, and comments from all songs in the playlist.</LI>
                <LI>Playlist creator's name and handle (linked to their Suno profile).</LI>
            </UL>
        </LI>
        <LI><STRONG>Conditional UI:</STRONG> The interface now conditionally renders either the user <CODE>ProfileInfoBox</CODE> or the new <CODE>PlaylistInfoBox</CODE> based on the fetched data type.</LI>
        <LI><STRONG>Updated Caching:</STRONG> Local storage caching logic has been updated to handle and store playlist data distinctly from user data.</LI>
        <LI><STRONG>Dynamic Button Text:</STRONG> The main action button (e.g., "Fetch Songs", "Update Playlist") now dynamically changes its text based on whether user or playlist data is being targeted.</LI>
        <LI><STRONG>Visual Polish:</STRONG> The "Playlist Upvotes" icon and text layout within the <CODE>PlaylistInfoBox</CODE> has been adjusted for better visual clarity and aesthetics.</LI>
      </UL>

      <SubSectionTitle>Song Deck Picker - Enhancements & Refactoring</SubSectionTitle>
      <UL>
        <LI><STRONG>Card Height Doubled:</STRONG> The minimum height of "Unlogged Deck" cards has been significantly increased to <CODE>min-h-72</CODE> (18rem, up from 9rem), and the images within them to <CODE>h-48</CODE> (up from h-24) for a much more substantial and visually prominent display.</LI>
        <LI><STRONG>Major Code Refactoring:</STRONG> The tool has undergone significant code refactoring for better organization and maintainability:
            <UL>
                <LI>Core logic and state management extracted into a custom hook: <CODE>hooks/useSongDeckPickerLogic.ts</CODE>.</LI>
                <LI>UI elements broken down into smaller components under <CODE>components/songDeckPicker/</CODE> (e.g., <CODE>DeckInputField.tsx</CODE>, <CODE>DeckTextAreaField.tsx</CODE>, <CODE>DeckSelectField.tsx</CODE>).</LI>
                <LI>Constants, utility functions, and icons moved to dedicated files (<CODE>songDeckPicker.constants.ts</CODE>, <CODE>songDeckPicker.utils.ts</CODE>, <CODE>songDeckPicker.icons.tsx</CODE>).</LI>
                <LI>General color utility functions consolidated into <CODE>utils/imageUtils.ts</CODE>.</LI>
            </UL>
        </LI>
        <LI><STRONG>Status Message Enhancements:</STRONG> 
            <UL>
                <LI>The "Deck built" status message font size increased for better visibility.</LI>
                <LI>Added detailed source counts to the status message, indicating how many songs were derived from Suno Playlists, Suno Short URLs, Suno Long URLs, and Custom Format entries.</LI>
            </UL>
        </LI>
        <LI><STRONG>Bug Fixes:</STRONG>
            <UL>
                <LI>Fixed the "Pick Random Card" functionality to provide clearer status messages, especially when no cards are left in the unlogged deck.</LI>
                <LI>Resolved a "used before its declaration" JavaScript error in <CODE>hooks/useSongDeckPickerLogic.ts</CODE> by reordering hook definitions.</LI>
            </UL>
        </LI>
      </UL>
      
      <SubSectionTitle>System & Type Updates</SubSectionTitle>
      <UL>
        <LI>Updated <CODE>Layout.tsx</CODE> and <CODE>index.html</CODE> import maps to include paths for the new Song Deck Picker files.</LI>
        <LI>Enhanced <CODE>types.ts</CODE> with new interfaces such as <CODE>SunoPlaylistDetail</CODE> (for processed playlist data), and <CODE>DeckThemeSettings</CODE> & <CODE>DeckTheme</CODE> (for Song Deck Picker theming). The <CODE>SongCardInterface</CODE> was updated with a <CODE>sourceType</CODE> property.</LI>
      </UL>
      <P>These updates aim to expand the Hub's capabilities with Suno content and improve the maintainability and user experience of its tools.</P>
    </section>
  );
};
