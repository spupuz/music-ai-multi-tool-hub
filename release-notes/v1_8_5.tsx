
// release-notes/v1_8_5.tsx
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

export const ReleaseNote_1_8_5 = () => {
  const { P, UL, LI, CODE, STRONG, SectionTitle, SubSectionTitle } = NoteHelpers;

  return (
    <section id="version-1.8.5">
      <SectionTitle>Version 1.8.5 - Duration Check for Song Compliance</SectionTitle>
      <P><STRONG>This update enhances the "Suno Song Compliance Checker" by adding a configurable song duration check.</STRONG></P>
      
      <SubSectionTitle>Suno Song Compliance Checker - Duration Check Feature</SubSectionTitle>
      <UL>
        <LI><STRONG>Duration Limit Input:</STRONG> A new field "Duration Limit (seconds)" has been added to the settings. It defaults to 300 seconds (5 minutes) and is editable by the user.</LI>
        <LI><STRONG>Duration Validation:</STRONG> When processing songs, the tool now checks if the actual song duration (obtained from Suno metadata) exceeds the specified limit.</LI>
        <LI><STRONG>Results Display:</STRONG>
            <UL>
                <LI>Each song's result card now includes a "Duration Check" section, indicating pass/fail status and showing the actual duration versus the set limit.</LI>
                <LI>Messages like "Duration OK (120s &lt;= 300s)." or "Exceeds limit (310s &gt; 300s)." are displayed.</LI>
                <LI>If duration metadata is unavailable, it's noted as a failure to determine duration.</LI>
            </UL>
        </LI>
        <LI><STRONG>Batch Summary Update:</STRONG>
            <UL>
                <LI>The "Batch Summary" now includes a "Duration Issues" card, counting songs that failed the duration check.</LI>
                <LI>The "Passed All Checks" count now requires a song to pass the title, content rating, AND duration checks.</LI>
                <LI>The grid layout for the Batch Summary has been adjusted to <CODE>grid-cols-2 sm:grid-cols-3</CODE> to better accommodate the new "Duration Issues" card, typically resulting in two rows of three items.</LI>
            </UL>
        </LI>
        <LI><STRONG>CSV Export Enhancement:</STRONG> The CSV export feature now includes columns for "Duration Check Status", "Duration Check Message", "Actual Duration (s)", and "Duration Limit (s)".</LI>
      </UL>
      <P>This feature provides an additional layer of automated checking for song submissions, particularly useful for contests with specific time constraints.</P>
    </section>
  );
};
