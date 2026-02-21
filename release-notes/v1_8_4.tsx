
// release-notes/v1_8_4.tsx
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

export const ReleaseNote_1_8_4 = () => {
  const { P, UL, LI, CODE, STRONG, SectionTitle, SubSectionTitle } = NoteHelpers;

  return (
    <section id="version-1.8.4">
      <SectionTitle>Version 1.8.4 - Suno Music Shuffler: Custom URL Lists!</SectionTitle>
      <P><STRONG>This update significantly enhances the "Suno Music Shuffler" by allowing users to input a list of individual Suno song URLs to create custom listening sessions.</STRONG></P>
      
      <SubSectionTitle>Suno Music Shuffler - Custom URL List Feature</SubSectionTitle>
      <UL>
        <LI><STRONG>Multi-Format Input:</STRONG> The main input field is now a <CODE>textarea</CODE> that accepts:
            <UL>
                <LI>A single Suno Username (e.g., <CODE>@username</CODE> or <CODE>username</CODE>).</LI>
                <LI>A single Suno Playlist URL.</LI>
                <LI>A list of Suno Song URLs (short <CODE>/s/...</CODE> or long <CODE>/song/...</CODE>), with one URL per line.</LI>
            </UL>
        </LI>
        <LI><STRONG>Individual Song Fetching:</STRONG> When a list of song URLs is provided:
            <UL>
                <LI>Each URL is processed individually. Short URLs are resolved to their full song IDs using helper functions (now part of <CODE>services/sunoService.ts</CODE>).</LI>
                <LI>The tool fetches details for each valid song ID.</LI>
                <LI>All successfully fetched songs form the current playlist for the shuffler.</LI>
            </UL>
        </LI>
        <LI><STRONG>Aggregated Statistics Display:</STRONG> For custom URL lists, a synthetic profile/playlist detail object is created. The information box will display:
            <UL>
                <LI>A title like "Custom Song List".</LI>
                <LI>Total Plays (sum of all loaded songs).</LI>
                <LI>Total Upvotes (sum of all loaded songs).</LI>
                <LI>Total Comments (sum of all loaded songs).</LI>
                <LI>Total Clips (number of successfully loaded songs).</LI>
                <LI>Standard profile details (avatar, bio, follower counts) are not shown for custom lists.</LI>
            </UL>
        </LI>
        <LI><STRONG>No Caching for Custom Lists:</STRONG> Custom lists generated from multiple URLs are <STRONG>not cached</STRONG> in local storage. The "Clear Cache for..." button is disabled when a custom list is active.</LI>
        <LI><STRONG>Dynamic Button Text:</STRONG> The main fetch/update button text changes (e.g., "Fetch Songs / Playlist", "Update Songs for @User", "Update Playlist", "Load Song List from Input") based on the detected input type.</LI>
        <LI><STRONG>UI Updates:</STRONG> The placeholder text for the input area has been updated. The <CODE>ProfileInfoBox</CODE> now gracefully handles and displays the synthetic data for custom URL lists.</LI>
      </UL>

      <SubSectionTitle>Utility and Service Updates</SubSectionTitle>
      <UL>
        <LI>URL resolution functions (<CODE>resolveSunoShortUrlToSongIdFromService</CODE>, <CODE>extractSunoSongIdFromPathFromService</CODE>) and the <CODE>publicProxies</CODE> array are now part of <CODE>services/sunoService.ts</CODE> to support this new functionality and can be shared across tools.</LI>
        <LI><CODE>fetchSunoClipById</CODE> is now also exported from <CODE>services/sunoService.ts</CODE> for direct use.</LI>
      </UL>
      <P>This enhancement provides much greater flexibility, allowing users to curate their own listening sessions in the Suno Music Shuffler from any combination of Suno songs.</P>
    </section>
  );
};
