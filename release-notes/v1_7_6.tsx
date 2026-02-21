// release-notes/v1_7_6.tsx
import React from 'react';
import { P, UL, LI, SectionTitle, SubSectionTitle, STRONG, CODE } from '../components/ReleaseNoteElements';

export const ReleaseNote_1_7_6 = () => {
  return (
    <section id="version-1.7.6">
      <SectionTitle>Version 1.7.6 - Enhanced Comment Engagement Tracking</SectionTitle>
      <P><STRONG>This update integrates comment count data across various Suno-related tools, providing deeper insights into community engagement.</STRONG></P>
      
      <SubSectionTitle>Suno User Stats Tool</SubSectionTitle>
      <UL>
        <LI><STRONG>New Profile Stat:</STRONG> The user profile card now displays the "Total Comments" aggregated across all their fetched songs.</LI>
        <LI><STRONG>New Aggregated Stats:</STRONG> Added "Total Comments" and "Average Comments Per Song" to the main statistics display cards.</LI>
        <LI><STRONG>Comment Trend Chart:</STRONG> A new line chart visualizes the trend of total comments on the user's profile over time, based on data snapshots.</LI>
        <LI><STRONG>Top Commented Songs Chart:</STRONG> A new bar chart displays the songs with the highest comment counts, including their cover art. (Corrected title from "Top Commented Tags" to "Top Commented Songs").</LI>
        <LI><STRONG>Comment Count Distribution Chart:</STRONG> A new bar chart shows how many songs fall into different comment count brackets (e.g., 0 comments, 1-5 comments).</LI>
        <LI><STRONG>Detailed Song Performance Table:</STRONG>
            <UL>
                <LI>Added a "Comments" column to display the comment count for each song.</LI>
                <LI>Added a "Comments Δ" (delta) column to show the change in comment count since the last data fetch for each song.</LI>
                <LI>Both new columns are sortable.</LI>
            </UL>
        </LI>
        <LI><STRONG>Data Model Update:</STRONG> The underlying data structures (`SunoClip`, `AggregatedStats`, `SongInteractionPoint`) have been updated to store and process `comment_count`.</LI>
      </UL>

      <SubSectionTitle>Suno User Music Shuffler</SubSectionTitle>
      <UL>
        <LI><STRONG>Comment Count in Playlist:</STRONG> Each song listed in the shuffler's queue now displays its comment count alongside play and upvote counts, using a new comment icon.</LI>
        <LI><STRONG>Comment Count in Player Info:</STRONG> The "Currently Playing" information area also displays the comment count for the active song.</LI>
        <LI><STRONG>Total Comments in Profile Display:</STRONG> The profile information box within the shuffler now includes the user's total aggregated comments.</LI>
      </UL>

      <SubSectionTitle>General</SubSectionTitle>
      <UL>
        <LI>Updated <CODE>types.ts</CODE> to include <CODE>comment_count</CODE> in <CODE>SunoClip</CODE> and <CODE>total_comments</CODE> in <CODE>SunoProfileDetail</CODE>.</LI>
        <LI>The Suno API service (`fetchSunoSongsByUsername`) now aggregates total comments and includes it in the returned profile detail.</LI>
      </UL>
    </section>
  );
};
