
// release-notes/v1_9_7.tsx
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

export const ReleaseNote_1_9_7 = () => {
  const { P, UL, LI, STRONG, SectionTitle, SubSectionTitle } = NoteHelpers;

  return (
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
  );
};
