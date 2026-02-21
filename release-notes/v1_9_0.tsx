
// release-notes/v1_9_0.tsx
import React from 'react';

const NoteHelpers = {
    P: ({ children, className = "" }: {children: React.ReactNode; className?: string}) => <p className={`mb-3 leading-relaxed text-gray-700 dark:text-gray-300 ${className}`}>{children}</p>,
    UL: ({ children }: {children: React.ReactNode}) => <ul className="list-disc list-inside pl-4 mb-3 space-y-1 text-gray-700 dark:text-gray-300">{children}</ul>,
    LI: ({ children }: {children: React.ReactNode}) => <li>{children}</li>,
    STRONG: ({ children }: {children: React.ReactNode}) => <strong className="font-semibold text-green-700 dark:text-green-200">{children}</strong>,
    SectionTitle: ({ children, id }: { children: React.ReactNode; id?: string }) => <h2 id={id} className="text-3xl font-bold text-green-600 dark:text-green-400 mt-8 mb-5 border-b-2 border-green-500 dark:border-green-600 pb-2">{children}</h2>,
    SubSectionTitle: ({ children }: {children: React.ReactNode}) => <h3 className="text-xl font-semibold text-green-600 dark:text-green-300 mt-4 mb-2">{children}</h3>
};

export const ReleaseNote_1_9_0 = () => {
  const { P, UL, LI, STRONG, SectionTitle, SubSectionTitle } = NoteHelpers;

  return (
    <section id="version-1.9.0">
      <SectionTitle>Version 1.9.0 - SparkTune Super-Generator</SectionTitle>
      <P><STRONG>This version massively upgrades the "SparkTune Challenge Generator" with more granular creative controls and a streamlined workflow for posting announcements and reminders.</STRONG></P>
      
      <SubSectionTitle>SparkTune Challenge Generator Enhancements</SubSectionTitle>
      <UL>
        <LI><STRONG>New Creative Constraints:</STRONG> Added several new optional fields to allow for more specific and engaging challenges:
            <UL>
                <LI><STRONG>Vocal Style:</STRONG> A field with a "Randomize!" button to specify vocal requirements (e.g., "Male Vocals", "Instrumental / No Vocals", "Rap Vocals").</LI>
                <LI><STRONG>Tempo (BPM):</STRONG> A field to define a target tempo or range (e.g., "120 BPM", "90-100 BPM").</LI>
                <LI><STRONG>Negative Constraints:</STRONG> A "Banned Elements" field to add a fun twist by forbidding certain instruments or concepts.</LI>
            </UL>
        </LI>
        <LI><STRONG>Dual Post Generation (Announcement & Reminder):</STRONG> When you generate a challenge, the tool now creates two distinct, pre-formatted posts accessible via tabs:
            <UL>
                <LI><STRONG>Announcement Post:</STRONG> The main, exciting kick-off post, updated to include all the new prompt fields.</LI>
                <LI><STRONG>Reminder Post:</STRONG> A brand new, concise post perfect for sharing a few days before the deadline, automatically pulling the challenge name and due date.</LI>
            </UL>
        </LI>
        <LI><STRONG>Smarter Post Content:</STRONG>
            <UL>
                <LI><STRONG>Dynamic Hashtags:</STRONG> Posts now automatically include relevant hashtags based on your "Genre" and "Theme/Keyword" inputs.</LI>
                <LI><STRONG>Cleaner Output:</STRONG> The logic is improved to ensure that if any optional field is left blank, its entire line is omitted from the post for a cleaner announcement.</LI>
            </UL>
        </LI>
        <LI><STRONG>UI Refinements:</STRONG> Added tooltips to explain various input fields, and the form layout has been polished for better usability.</LI>
      </UL>
      <P>These changes make the SparkTune Challenge Generator a more powerful and complete assistant for running community music challenges.</P>
    </section>
  );
};
