// release-notes/v1_7_7.tsx
import React from 'react';
import { P, UL, LI, SectionTitle, SubSectionTitle, STRONG, CODE } from '../components/ReleaseNoteElements';

export const ReleaseNote_1_7_7 = () => {
  return (
    <section id="version-1.7.7">
      <SectionTitle>Version 1.7.7 - Consistent Data Management & UI Alignment</SectionTitle>
      <P><STRONG>This update focuses on providing consistent and accessible data management controls across relevant tools, specifically aligning the Suno User Stats tool with the Suno Music Player, along with bug fixes related to their implementation.</STRONG></P>
      
      <SubSectionTitle>Data Management & UI Enhancements</SubSectionTitle>
      <UL>
        <LI><STRONG>Suno User Stats Tool:</STRONG>
            <UL>
                <LI>Aligned data management functionality and layout closely with the Suno User Music Shuffler tool for a consistent user experience.</LI>
                <LI>The "Data Management" section (containing "Clear All My Hub Data") has been relocated to appear directly below the username input form, making it always visible and accessible near the top of the tool.</LI>
                <LI>Added a new "Clear Cache for @CurrentUser" button to this top-level "Data Management" section. This button allows clearing locally stored statistics for the currently loaded user and requires a 3-click confirmation. It's disabled if no user data is loaded.</LI>
                <LI>The main action button at the top now dynamically changes:
                    <UL>
                        <LI>Reads <STRONG>"Fetch / View Stats"</STRONG> and triggers a fresh data fetch if no user data is loaded or if the entered username doesn't match the loaded user.</LI>
                        <LI>Reads <STRONG>"Update Stats for @{`{username}`}"</STRONG> and triggers an update of existing data if data for the entered username is already loaded.</LI>
                    </UL>
                </LI>
                <LI>Removed the redundant <CODE>DataManagementControls</CODE> component that previously appeared below the user profile. Its functionalities are now covered by the enhanced top-level action button and the new "Clear Cache for @CurrentUser" button.</LI>
                <LI>Fixed internal logic within <CODE>handleClearAllHubDataFromStatsTool</CODE> to correctly interact with the <CODE>useSunoUserStatsData</CODE> hook, resolving issues with state setters. This includes importing <CODE>useCallback</CODE> from React where it was missing and ensuring dependencies are correct.</LI>
            </UL>
        </LI>
        <LI><STRONG>Suno Music Player Tool:</STRONG>
             <UL>
                <LI>Ensured the "Data Management" section (which includes the "Clear Cache for @CurrentUser" and "Clear All My Hub Data" buttons) is always visible, regardless of whether user data is loaded or a username is entered. This allows access to the global clear option even before fetching data.</LI>
                <LI>The "Clear All My Hub Data" button style was updated for consistency with the Stats Page and Suno User Stats tool (dark background, red border, light text).</LI>
             </UL>
        </LI>
        <LI><STRONG>Stats Page (Usage Stats):</STRONG>
            <UL>
                <LI>Restructured the "Data Management" section to be a distinct, bordered area appearing directly above the troubleshooting tip for better visual organization and consistency.</LI>
                <LI>Updated the "Clear All My Hub Data" button style to match the new consistent look (dark background, red border, light text).</LI>
            </UL>
        </LI>
        <LI><STRONG>Troubleshooting Tips:</STRONG> Updated troubleshooting tips on the <STRONG>About Page</STRONG> and <STRONG>Suno Music Player Tool</STRONG> to accurately reflect the scope and impact of clearing browser data on local settings and statistics.</LI>
      </UL>
      <SubSectionTitle>Bug Fixes & Refinements</SubSectionTitle>
      <UL>
        <LI>Resolved a <CODE>TypeError: can't convert undefined to object</CODE> that could occur in the Suno User Stats tool when loading an already fetched user with potentially malformed cached trend data. This involved:
            <UL>
                <LI>Refining logic in <CODE>hooks/useSunoUserStatsData.ts</CODE> (specifically <CODE>calculateIncreaseSinceLastUpdate</CODE>) to handle missing historical data points more robustly.</LI>
                <LI>Adding defensive filtering in chart components (<CODE>SongTrendChart.tsx</CODE>, <CODE>TopSongsChart.tsx</CODE>, etc.) to prevent rendering errors with invalid cached data.</LI>
            </UL>
        </LI>
        <LI>Corrected React hook dependencies in <CODE>hooks/useSunoUserStatsData.ts</CODE> for functions like <CODE>clearUserData</CODE>, <CODE>fetchDataInternal</CODE>, and <CODE>updateUserData</CODE> to include necessary state setters.</LI>
      </UL>
      <P>These changes aim to provide a more stable, consistent, and user-friendly experience for managing application data and resolving potential issues related to local storage.</P>
    </section>
  );
};
