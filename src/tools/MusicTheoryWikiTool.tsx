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
    <div className="w-full text-gray-900 dark:text-white animate-fadeIn">
      <header className="mb-2 md:mb-14 text-center pt-0 md:pt-8 px-4 animate-fadeIn">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Theory Wiki</h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Theoretical Knowledge Base • Comprehensive Musical Index
        </p>
      </header>

      <main className="w-full glass-card p-2 sm:p-6 md:p-10 border-gray-200 dark:border-white/10 text-gray-900 dark:text-gray-200 transition-all duration-500 animate-fadeIn overflow-hidden">
        <div className="flex flex-col md:flex-row gap-0 min-h-[700px]">
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
