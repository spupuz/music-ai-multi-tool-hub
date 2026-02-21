// release-notes/v1_7_0.tsx
import React from 'react';
import { P, UL, LI, SectionTitle, SubSectionTitle, STRONG, CODE } from '../components/ReleaseNoteElements';

export const ReleaseNote_1_7_0 = () => {
  return (
    <section id="version-1.7.0">
      <SectionTitle>Version 1.7.0 - Suno Player Polish</SectionTitle>
      <P><STRONG>This update focuses on enhancing the Suno Music Shuffler for a smoother and more integrated experience.</STRONG></P>
      
      <SubSectionTitle>Suno Music Shuffler Enhancements</SubSectionTitle>
      <UL>
          <LI><STRONG>OS Media Control Integration:</STRONG> Significantly improved the reliability of OS-level media controls (e.g., Android lock screen/notification buttons). Media Session API updates are now managed more robustly using a <CODE>useEffect</CODE> hook tied to player state changes. This should resolve issues where controls wouldn't reflect the current song or playback status.</LI>
          <LI><STRONG>Direct Suno Song Links:</STRONG> The currently playing song's cover art and title in the player are now clickable links. Clicking them will open the song directly on Suno.com in a new tab for quick access.</LI>
      </UL>
    </section>
  );
};
