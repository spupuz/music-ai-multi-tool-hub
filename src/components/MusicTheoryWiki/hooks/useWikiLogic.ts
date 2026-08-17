import { useState, useEffect, useMemo } from 'react';
import ReactDOMServer from 'react-dom/server';
import { wikiTopics } from '../WikiData';

export const useWikiLogic = (trackLocalEvent: (category: string, action: string, label: string) => void) => {
    const TOOL_CATEGORY = 'MusicTheoryWiki';
    const [selectedTopicId, setSelectedTopicId] = useState<string>(wikiTopics[0]?.id || '');
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

    const categories = useMemo(() => {
        return Array.from(new Set(wikiTopics.map(topic => topic.category))).sort();
    }, []);

    useEffect(() => {
        const initialExpansionState: Record<string, boolean> = {};
        categories.forEach(cat => initialExpansionState[cat] = false);
        
        const initialTopic = wikiTopics.find(topic => topic.id === selectedTopicId);
        if (initialTopic) {
            initialExpansionState[initialTopic.category] = true;
        } else if (categories.length > 0) {
            initialExpansionState[categories[0]] = true; 
        }
        setExpandedCategories(initialExpansionState);
    }, [selectedTopicId, categories]);

    // ⚡ Bolt: Cache parsed HTML content to string once on initialization
    // to prevent expensive ReactDOMServer calls on every keystroke during search.
    const topicSearchContentMap = useMemo(() => {
        const map = new Map<string, string>();
        wikiTopics.forEach(topic => {
            let contentText = '';
            try {
                const htmlContent = ReactDOMServer.renderToStaticMarkup(topic.content);
                contentText = htmlContent.replace(/<[^>]+>/g, ' ').replace(/\s\s+/g, ' ').trim().toLowerCase();
            } catch (e) {
                console.error("Error processing topic content for search:", topic.title, e);
            }
            map.set(topic.id, contentText);
        });
        return map;
    }, []);

    const filteredWikiTopics = useMemo(() => {
        if (!searchTerm.trim()) return wikiTopics;
        const lowerSearchTerm = searchTerm.toLowerCase();
        return wikiTopics.filter(topic => {
            const titleMatch = topic.title.toLowerCase().includes(lowerSearchTerm);
            const keywordMatch = topic.keywords.some(keyword => keyword.toLowerCase().includes(lowerSearchTerm));
            const searchableContentText = topicSearchContentMap.get(topic.id) || '';

            return titleMatch || keywordMatch || searchableContentText.includes(lowerSearchTerm);
        });
    }, [searchTerm, topicSearchContentMap]);

    const selectedTopic = useMemo(() => {
        const topicExistsInFiltered = filteredWikiTopics.find(topic => topic.id === selectedTopicId);
        if (topicExistsInFiltered) return topicExistsInFiltered;
        if (filteredWikiTopics.length > 0) return filteredWikiTopics[0];
        return wikiTopics.find(topic => topic.id === selectedTopicId) || wikiTopics[0];
    }, [selectedTopicId, filteredWikiTopics]);

    useEffect(() => {
        const currentSelectionStillVisible = filteredWikiTopics.some(topic => topic.id === selectedTopicId);
        if (!currentSelectionStillVisible && filteredWikiTopics.length > 0) {
            setSelectedTopicId(filteredWikiTopics[0].id);
        } else if (filteredWikiTopics.length === 0 && wikiTopics.length > 0 && !selectedTopicId) {
            setSelectedTopicId(wikiTopics[0].id);
        }
    }, [searchTerm, filteredWikiTopics, selectedTopicId]);

    const handleSelectTopic = (id: string) => {
        setSelectedTopicId(id);
        const topic = wikiTopics.find(t => t.id === id);
        if (topic) {
            trackLocalEvent(TOOL_CATEGORY, 'topicViewed', topic.title);
            setExpandedCategories(prev => ({ ...prev, [topic.category]: true }));
        }
        const articleElement = document.getElementById('wiki-article-content');
        if (articleElement) articleElement.scrollTop = 0;
    };
    
    useEffect(() => {
        if (selectedTopicId) {
            const initialTopic = wikiTopics.find(t => t.id === selectedTopicId);
            if (initialTopic) trackLocalEvent(TOOL_CATEGORY, 'topicViewed', initialTopic.title);
        }
    }, []); 

    const visibleCategories = useMemo(() => {
        return Array.from(new Set(filteredWikiTopics.map(topic => topic.category))).sort();
    }, [filteredWikiTopics]);
    
    const toggleCategoryExpansion = (categoryName: string) => {
        setExpandedCategories(prev => ({ ...prev, [categoryName]: !prev[categoryName] }));
    };
    
    const relatedTopics = useMemo(() => {
        if (!selectedTopic) return [];
        return wikiTopics
            .filter(topic => topic.category === selectedTopic.category && topic.id !== selectedTopic.id)
            .slice(0, 2); 
    }, [selectedTopic]);

    return {
        selectedTopic,
        searchTerm,
        setSearchTerm,
        expandedCategories,
        filteredWikiTopics,
        visibleCategories,
        handleSelectTopic,
        toggleCategoryExpansion,
        relatedTopics
    };
};
