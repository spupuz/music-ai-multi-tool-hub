import React from 'react';
import { WikiTopic } from './types';

interface WikiSidebarProps {
    searchTerm: string;
    setSearchTerm: (val: string) => void;
    visibleCategories: string[];
    filteredWikiTopics: WikiTopic[];
    expandedCategories: Record<string, boolean>;
    toggleCategoryExpansion: (cat: string) => void;
    selectedTopicId: string | undefined;
    handleSelectTopic: (id: string) => void;
}

export const WikiSidebar: React.FC<WikiSidebarProps> = ({
    searchTerm, setSearchTerm, visibleCategories, filteredWikiTopics,
    expandedCategories, toggleCategoryExpansion, selectedTopicId, handleSelectTopic
}) => (
    <aside className="md:w-1/3 lg:w-1/4 bg-gray-100 dark:bg-gray-800 p-4 rounded-md border border-gray-200 dark:border-gray-700 self-start md:sticky md:top-20 max-h-[calc(100vh-10rem)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-200 dark:scrollbar-track-gray-800">
        <input
            type="search"
            placeholder="Search topics..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 mb-4 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white focus:ring-green-500 focus:border-green-500"
            aria-label="Search wiki topics"
        />
        {visibleCategories.length === 0 && searchTerm && (
            <p className="text-gray-500 dark:text-gray-400 text-sm">No topics match your search.</p>
        )}
        {visibleCategories.map(category => {
            const topicsInCategory = filteredWikiTopics.filter(topic => topic.category === category);
            if (topicsInCategory.length === 0) return null;

            return (
                <div key={category} className="mb-3">
                    <button
                        onClick={() => toggleCategoryExpansion(category)}
                        className="w-full flex justify-between items-center text-left text-md font-semibold text-green-700 dark:text-green-200 mb-1.5 p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md focus:outline-none transition-colors"
                        aria-expanded={!!expandedCategories[category]}
                        aria-controls={`category-panel-${category.replace(/\s+/g, '-')}`}
                    >
                        {category} ({topicsInCategory.length})
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={`w-4 h-4 transform transition-transform ${expandedCategories[category] ? 'rotate-0' : '-rotate-90'}`}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                        </svg>
                    </button>
                    {expandedCategories[category] && (
                        <ul id={`category-panel-${category.replace(/\s+/g, '-')}`} className="space-y-1 pl-2 border-l-2 border-gray-300 dark:border-gray-600">
                            {topicsInCategory.map(topic => (
                                <li key={topic.id}>
                                    <button
                                        onClick={() => handleSelectTopic(topic.id)}
                                        className={`w-full text-left text-sm px-2 py-1.5 rounded-md transition-colors 
                                            ${selectedTopicId === topic.id 
                                                ? 'bg-green-600 text-white font-medium' 
                                                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-green-700 dark:hover:text-green-200'}`}
                                        aria-current={selectedTopicId === topic.id ? 'page' : undefined}
                                    >
                                        {topic.title}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            );
        })}
    </aside>
);

interface WikiArticleProps {
    selectedTopic: WikiTopic | undefined;
    filteredWikiTopics: WikiTopic[];
    relatedTopics: WikiTopic[];
    handleSelectTopic: (id: string) => void;
}

export const WikiArticle: React.FC<WikiArticleProps> = ({
    selectedTopic, filteredWikiTopics, relatedTopics, handleSelectTopic
}) => (
    <article id="wiki-article-content" className="flex-1 bg-gray-50 dark:bg-gray-800 p-6 rounded-md border border-gray-200 dark:border-gray-700 min-h-[calc(100vh-10rem)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-200 dark:scrollbar-track-gray-800">
        {selectedTopic ? (
            <>
                <h2 className="text-3xl font-bold text-green-700 dark:text-green-400 mb-1">{selectedTopic.title}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Category: {selectedTopic.category}</p>
                <div>{selectedTopic.content}</div>

                {relatedTopics.length > 0 && (
                    <div className="mt-10 pt-6 border-t border-gray-300 dark:border-gray-700">
                        <h3 className="text-xl font-semibold text-green-700 dark:text-green-300 mb-3">Related Topics:</h3>
                        <ul className="space-y-2">
                            {relatedTopics.map(topic => (
                                <li key={`related-${topic.id}`}>
                                    <button
                                        onClick={() => handleSelectTopic(topic.id)}
                                        className="text-green-600 dark:text-green-400 hover:text-green-500 dark:hover:text-green-300 hover:underline text-left"
                                    >
                                        {topic.title} <span className="text-xs text-gray-500 dark:text-gray-400">({topic.category})</span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </>
        ) : filteredWikiTopics.length > 0 ? (
            <p className="text-gray-600 dark:text-gray-300">Select a topic from the menu to view its content, or clear your search.</p>
        ) : (
            <p className="text-gray-500 dark:text-gray-400 text-lg text-center py-10">
                No topic selected, or no topics match your current search criteria. Try clearing the search or selecting a topic from the list.
            </p>
        )}
    </article>
);
