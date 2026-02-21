// release-notes/v1_6_1.tsx
import React from 'react';
import { P, UL, LI, SectionTitle, SubSectionTitle, STRONG, CODE } from '../components/ReleaseNoteElements';

export const ReleaseNote_1_6_1 = () => {
  return (
    <section id="version-1.6.1">
      <SectionTitle>Version 1.6.1 - Short Link Support for Compliance</SectionTitle>
      <P>This update enhances the flexibility of the Suno Song Compliance Checker.</P>
      
      <SubSectionTitle>Suno Song Compliance Checker</SubSectionTitle>
      <UL>
        <LI><STRONG>Short URL Resolution:</STRONG> Enhanced to support short Suno URLs (e.g., `/s/...`). The tool now attempts to resolve these short links to full song IDs using a series of public CORS proxies before fetching song details. Progress messages are displayed during this resolution process.</LI>
      </UL>
    </section>
  );
};
