// release-notes/v1_6_6.tsx
import React from 'react';
import { P, UL, LI, SectionTitle, SubSectionTitle, STRONG, CODE } from '../components/ReleaseNoteElements';

export const ReleaseNote_1_6_6 = () => {
  return (
    <section id="version-1.6.6">
      <SectionTitle>Version 1.6.6 - Suno Shuffler Gets Smarter!</SectionTitle>
      <P>This update makes the Suno Music Shuffler faster and more convenient with local caching and data management features.</P>
      <SubSectionTitle>Suno Music Shuffler Enhancements</SubSectionTitle>
      <UL>
        <LI><STRONG>Local Storage Caching:</STRONG> User song lists and profile details are now saved in your browser's local storage. This means significantly faster loading times for users you've previously fetched!</LI>
        <LI><STRONG>"Update Songs" Functionality:</STRONG> When data for a user is loaded (either from the cache or a fresh fetch), an "Update Songs" button now appears. Clicking this will refresh the song list and profile details directly from Suno's API, ensuring you have the latest versions by adding new songs and removing any that may have been deleted by the user.</LI>
        <LI><STRONG>"Clear Cached Data" Option:</STRONG> You can now easily remove the stored data for the currently displayed user. This action requires multiple confirmation clicks to prevent accidental deletion.</LI>
        <LI><STRONG>Last Fetched Timestamp:</STRONG> The tool now displays when the data for a user was last retrieved, giving you context on its freshness.</LI>
        <LI><STRONG>Dynamic UI:</STRONG> The main fetch button text adapts (e.g., "Fetch Songs", "Update Songs") based on whether cached data is available for the entered username or if data is currently loaded.</LI>
        <LI>The core music player functionality, including the audio visualizer and EQ, remains unchanged and fully operational.</LI>
      </UL>
    </section>
  );
};
