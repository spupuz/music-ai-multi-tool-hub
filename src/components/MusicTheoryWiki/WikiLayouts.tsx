import React from 'react';
import { WikiTopic } from './types';
import Button from '@/components/common/Button';

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
    <aside className="md:w-1/3 lg:w-1/4 p-4 rounded-3xl border border-white/20 glass-nav self-start md:sticky md:top-24 max-h-[calc(100vh-12rem)] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 hover:scrollbar-thumb-white/20 shadow-2xl transition-all duration-300">
        <div className="relative mb-6">
            <input
                type="search"
                placeholder="Search topics..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 dark:bg-black/20 border border-white/20 rounded-2xl placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white focus:ring-4 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all duration-300 font-bold text-sm"
                aria-label="Search wiki topics"
            />
        </div>
        
        {visibleCategories.length === 0 && searchTerm && (
            <p className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-widest text-center py-4">No topics match your search</p>
        )}
        
        {visibleCategories.map(category => {
            const topicsInCategory = filteredWikiTopics.filter(topic => topic.category === category);
            if (topicsInCategory.length === 0) return null;

            return (
                <div key={category} className="mb-4">
                    <Button
                        onClick={() => toggleCategoryExpansion(category)}
                        variant="ghost"
                        className="w-full flex justify-between items-center text-left text-[11px] font-black uppercase tracking-[0.15em] text-green-700 dark:text-green-400 mb-2 p-3 hover:bg-white/10 dark:hover:bg-white/5 rounded-2xl border-none shadow-none transition-all duration-300"
                        aria-expanded={!!expandedCategories[category]}
                        endIcon={
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className={`w-3.5 h-3.5 transform transition-transform duration-300 ${expandedCategories[category] ? 'rotate-0' : '-rotate-90'}`}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                            </svg>
                        }
                    >
                        <span>{category} <span className="opacity-40 italic ml-1">({topicsInCategory.length})</span></span>
                    </Button>
                    {expandedCategories[category] && (
                        <ul className="space-y-1.5 pl-3 border-l-[3px] border-white/10 ml-2 animate-fadeIn">
                            {topicsInCategory.map(topic => (
                                <li key={topic.id}>
                                    <Button
                                        onClick={() => handleSelectTopic(topic.id)}
                                        variant="ghost"
                                        className={`w-full text-left text-sm px-3 py-2.5 rounded-xl transition-all duration-200 font-bold border-none shadow-none justify-start
                                            ${selectedTopicId === topic.id 
                                                ? 'bg-white/30 dark:bg-white/20 text-green-600 dark:text-green-400 shadow-md border border-white/20' 
                                                : 'text-gray-600 dark:text-gray-400 hover:bg-white/10 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'}`}
                                        aria-current={selectedTopicId === topic.id ? 'page' : undefined}
                                    >
                                        {topic.title}
                                    </Button>
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
    <article id="wiki-article-content" className="flex-1 p-6 md:p-10 rounded-3xl border border-white/10 min-h-[calc(100vh-12rem)] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 animate-fadeIn">
        {selectedTopic ? (
            <div className="space-y-8">
                <div>
                    <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-gray-900 dark:text-white mb-2 leading-tight">{selectedTopic.title}</h2>
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-green-600 dark:text-green-500 opacity-80">{selectedTopic.category}</p>
                </div>
                
                <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tighter prose-a:text-green-600 dark:prose-a:text-green-400">
                    {selectedTopic.content}
                </div>

                {relatedTopics.length > 0 && (
                    <div className="mt-16 pt-10 border-t border-white/10">
                        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400 mb-6">Related Topics</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {relatedTopics.map(topic => (
                                <Button
                                    key={`related-${topic.id}`}
                                    onClick={() => handleSelectTopic(topic.id)}
                                    variant="ghost"
                                    className="p-5 h-auto rounded-2xl border border-white/10 hover:border-green-500/50 hover:bg-white/10 dark:hover:bg-white/5 transition-all duration-300 text-left group flex flex-col items-start gap-1 shadow-none"
                                >
                                    <div className="text-sm font-black text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors uppercase tracking-tight">{topic.title}</div>
                                    <div className="text-[10px] font-black uppercase tracking-wider text-gray-400 dark:text-gray-600 mt-1">{topic.category}</div>
                                </Button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        ) : filteredWikiTopics.length > 0 ? (
            <div className="h-full flex items-center justify-center text-center">
                <div className="max-w-md p-8 glass-card border-white/10 animate-pulse">
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400 italic">Select a topic from the menu to discover more about AI music composition.</p>
                </div>
            </div>
        ) : (
            <div className="h-full flex items-center justify-center text-center">
                 <div className="max-w-md p-10">
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 dark:text-gray-600 mb-4 italic">No match found</p>
                    <p className="text-sm font-bold text-gray-500 dark:text-gray-400 leading-relaxed italic">Try clearing the search or exploring a different category.</p>
                </div>
            </div>
        )}
    </article>
);
