
// release-notes/v1_7_9.tsx
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

export const ReleaseNote_1_7_9 = () => {
  const { P, UL, LI, CODE, STRONG, SectionTitle, SubSectionTitle } = NoteHelpers;

  return (
    <section id="version-1.7.9">
      <SectionTitle>Version 1.7.9 - Song Deck Picker UI Adjustments</SectionTitle>
      <P><STRONG>This version introduces refinements to card dimensions in the Song Deck Picker for better visual consistency and content adaptability.</STRONG></P>
      
      <SubSectionTitle>Song Deck Picker Enhancements</SubSectionTitle>
      <UL>
        <LI><STRONG>Logged Song Card Height:</STRONG> Cards in the "Logged Songs" section now have dynamic height. They will size automatically based on their content (image, text length) instead of a fixed minimum height. This allows for a more flexible and content-aware layout.</LI>
        <LI><STRONG>Random Card Selection Animation Display:</STRONG>
            <UL>
                <LI>Cards displayed during the random selection animation (the row of 2-5 cards) now have a <STRONG>fixed width</STRONG> (approximately 176px, using Tailwind class <CODE>w-44</CODE>). This maintains a consistent card-like appearance, similar to cards in the "Unlogged Deck" section, preventing them from stretching unnaturally.</LI>
                <LI>The container for these animated cards has been changed from a grid layout to a <STRONG>flexbox layout with wrapping and centering</STRONG>. This better accommodates the fixed-width cards and ensures they display neatly, even if they wrap to a new line on smaller screens.</LI>
                <LI>The height of these animated cards remains consistent with the <CODE>min-h-72</CODE> and image <CODE>h-48</CODE> settings established in v1.7.8.</LI>
            </UL>
        </LI>
      </UL>
      <P>These changes contribute to a more polished and visually balanced experience within the Song Deck Picker.</P>
    </section>
  );
};
