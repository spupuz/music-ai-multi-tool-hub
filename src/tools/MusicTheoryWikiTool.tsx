import React from 'react';
import type { ToolProps } from '@/Layout';
import { useWikiLogic } from '@/components/MusicTheoryWiki/hooks/useWikiLogic';
import { WikiSidebar, WikiArticle } from '@/components/MusicTheoryWiki/WikiLayouts';

const MusicTheoryWikiTool: React.FC<ToolProps> = ({ trackLocalEvent }) => {
  const {
    selectedTopic,
    searchTerm,
    setSearchTerm,
    expandedCategories,
    filteredWikiTopics,
    visibleCategories,
    handleSelectTopic,
    toggleCategoryExpansion,
    relatedTopics
  } = useWikiLogic(trackLocalEvent);

  return (
    <div className="w-full text-gray-900 dark:text-white">
      <header className="mb-10 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-green-600 dark:text-green-400">
          Music Theory & Composition Wiki
        </h1>
        <p className="mt-3 text-sm md:text-md text-gray-600 dark:text-gray-300 max-w-3xl mx-auto px-4">
          Your quick guide to understanding song structures, music theory basics, and tips for composing with AI.
        </p>
      </header>

      <main className="w-full bg-white dark:bg-gray-900 shadow-2xl rounded-xl p-4 md:p-6 border-2 border-green-600 dark:border-green-500 overflow-hidden">
        <div className="flex flex-col md:flex-row gap-6">
          <WikiSidebar 
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            visibleCategories={visibleCategories}
            filteredWikiTopics={filteredWikiTopics}
            expandedCategories={expandedCategories}
            toggleCategoryExpansion={toggleCategoryExpansion}
            selectedTopicId={selectedTopic?.id}
            handleSelectTopic={handleSelectTopic}
          />

          <WikiArticle 
            selectedTopic={selectedTopic}
            filteredWikiTopics={filteredWikiTopics}
            relatedTopics={relatedTopics}
            handleSelectTopic={handleSelectTopic}
          />
        </div>
      </main>
    </div>
  );
};

export default MusicTheoryWikiTool;
