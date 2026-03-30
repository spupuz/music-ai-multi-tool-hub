
import React, { useState, useCallback, useEffect, useRef } from 'react';
import type { ToolProps } from '../Layout'; // Assuming ToolProps might be needed for trackLocalEvent type if not explicitly passed
import {
    musicGenres, moods, tempos, instrumentations, qualities, 
    erasAndDecades, productionStyles, musicalKeyModeSuggestions,
    purposes, influences, soundDesignFocusItems,
    TOOL_CATEGORY, HISTORY_STORAGE_KEY, FAVORITES_STORAGE_KEY,
    CUSTOM_ITEMS_STORAGE_KEY_PREFIX, OPTIONAL_TOGGLES_STORAGE_KEY,
    initialLockedCategories, initialOptionalCategoryToggles, initialCustomItems,
    initialCategoryIntensity, CATEGORY_INTENSITY_STORAGE_KEY 
} from '../src/tools/RandomMusicStyleGenerator/RandomMusicStyleGenerator.constants';
import type { 
    GeneratedStyleParts, LockableCategoryKey, SavedStyleEntry, 
    CustomItemsState, OptionalCategoryToggleState, CustomItemCategoryKey, 
    LockedCategoriesState, IntensityLevel, MultiSelectItemCategoryKey 
} from '../types';

// Helper function (can be moved to utils if used elsewhere)
const getRandomElements = <T,>(predefinedArr: T[], customArr: T[], count: number): T[] => {
  const combinedArr = [...predefinedArr, ...customArr];
  if (combinedArr.length === 0) return [];
  if (combinedArr.length <= count) return [...combinedArr].sort(() => 0.5 - Math.random()); // Shuffle if count is >= length
  const shuffled = [...combinedArr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

const categoryDataSources: Record<CustomItemCategoryKey, string[]> = {
    genres: musicGenres, moods: moods, tempo: tempos, instrumentations: instrumentations, qualities: qualities,
    era: erasAndDecades, productionStyle: productionStyles, keyModeSuggestion: musicalKeyModeSuggestions,
    purpose: purposes, influence: influences, soundDesignFocus: soundDesignFocusItems,
};


export const useRandomMusicStyle = (trackLocalEvent: ToolProps['trackLocalEvent']) => {
  const [currentStyle, setCurrentStyle] = useState<GeneratedStyleParts | null>(null);
  const [currentLockedCategories, setCurrentLockedCategories] = useState<LockedCategoriesState>(initialLockedCategories);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  
  // CHANGED: Default to false so users see the controls (Intensity, Custom Items) by default
  const [sunoPromptMode, setSunoPromptMode] = useState<boolean>(false); 
  const [copiedFeedback, setCopiedFeedback] = useState('');
  const [copiedTagsFeedback, setCopiedTagsFeedback] = useState('');
  
  const [history, setHistory] = useState<SavedStyleEntry[]>([]);
  const [favorites, setFavorites] = useState<SavedStyleEntry[]>([]);
  const [showFavoritesView, setShowFavoritesView] = useState<boolean>(true); // Default to true
  const [editingNoteForId, setEditingNoteForId] = useState<string | null>(null);
  const noteInputRef = useRef<HTMLInputElement>(null);
  
  const [clearHistoryClickCount, setClearHistoryClickCount] = useState(0);
  const clearHistoryTimeoutRef = useRef<number | null>(null);

  const [customItems, setCustomItems] = useState<CustomItemsState>(initialCustomItems);
  const [showAddCustomItemModal, setShowAddCustomItemModal] = useState(false);
  const [customItemCategory, setCustomItemCategory] = useState<CustomItemCategoryKey | null>(null);
  const [customItemValue, setCustomItemValue] = useState('');
  const [manageCustomModalOpen, setManageCustomModalOpen] = useState(false);
  const [importConfirmationModalOpen, setImportConfirmationModalOpen] = useState(false);
  const [importedCustomItemsData, setImportedCustomItemsData] = useState<CustomItemsState | null>(null);
  const [importStatusMessage, setImportStatusMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [optionalCategoryToggles, setOptionalCategoryToggles] = useState<OptionalCategoryToggleState>(initialOptionalCategoryToggles);

  const [categoryIntensity, setCategoryIntensity] = useState<Partial<Record<MultiSelectItemCategoryKey, IntensityLevel>>>(() => {
    try {
        const storedIntensity = localStorage.getItem(CATEGORY_INTENSITY_STORAGE_KEY);
        return storedIntensity ? JSON.parse(storedIntensity) : initialCategoryIntensity;
    } catch (e) {
        console.error("Error loading category intensity settings from localStorage:", e);
        return initialCategoryIntensity;
    }
  });

  useEffect(() => {
    try {
        localStorage.setItem(CATEGORY_INTENSITY_STORAGE_KEY, JSON.stringify(categoryIntensity));
    } catch (e) {
        console.error("Error saving category intensity settings to localStorage:", e);
    }
  }, [categoryIntensity]);

  const handleSetCategoryIntensity = useCallback((categoryKey: MultiSelectItemCategoryKey, level: IntensityLevel) => {
    setCategoryIntensity(prev => ({
        ...prev,
        [categoryKey]: level
    }));
    trackLocalEvent(TOOL_CATEGORY, 'intensityChanged', `${categoryKey}_${level}`);
  }, [trackLocalEvent]);


  // Load data from localStorage on mount
  useEffect(() => {
    const loadedCustomItems = { ...initialCustomItems };
    Object.keys(initialCustomItems).forEach(catKey => {
      try {
        const stored = localStorage.getItem(`${CUSTOM_ITEMS_STORAGE_KEY_PREFIX}${catKey}`);
        if (stored) loadedCustomItems[catKey as CustomItemCategoryKey] = JSON.parse(stored);
      } catch (e) { console.error(`Error loading custom items for ${catKey}:`, e); }
    });
    setCustomItems(loadedCustomItems);

    try {
        const storedToggles = localStorage.getItem(OPTIONAL_TOGGLES_STORAGE_KEY);
        if (storedToggles) setOptionalCategoryToggles(JSON.parse(storedToggles));
    } catch (e) { console.error("Error loading optional category toggles:", e); }
        
    try { 
      const storedHistory = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (storedHistory) setHistory(JSON.parse(storedHistory));
      const storedFavorites = localStorage.getItem(FAVORITES_STORAGE_KEY); 
      if (storedFavorites) setFavorites(JSON.parse(storedFavorites));
    }
    catch (error) { console.error("Error loading saved data from localStorage:", error); setHistory([]); setFavorites([]); }
    
    return () => { if (clearHistoryTimeoutRef.current) clearTimeout(clearHistoryTimeoutRef.current); };
  }, []);

  // Save data to localStorage when it changes
  useEffect(() => {
    Object.entries(customItems).forEach(([catKey, items]) => {
      try { localStorage.setItem(`${CUSTOM_ITEMS_STORAGE_KEY_PREFIX}${catKey}`, JSON.stringify(items)); } 
      catch (e) { console.error(`Error saving custom items for ${catKey}:`, e); }
    });
  }, [customItems]);

  useEffect(() => {
    try { localStorage.setItem(OPTIONAL_TOGGLES_STORAGE_KEY, JSON.stringify(optionalCategoryToggles)); }
    catch (e) { console.error("Error saving optional category toggles:", e); }
  }, [optionalCategoryToggles]);

  useEffect(() => {
    try { 
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites)); 
    }
    catch (error) { console.error("Error saving data to localStorage:", error); }
  }, [history, favorites]);


  const generateStyleInternal = useCallback((rerollCatKey: LockableCategoryKey | null = null) => {
    setIsGenerating(true);
    setCopiedFeedback('');
    setCopiedTagsFeedback('');

    setTimeout(() => {
        const newId = Date.now().toString();
        const prevStyle = currentStyle;

        const getCountForCategory = (catKey: LockableCategoryKey): number => {
            const multiSelectKeys: MultiSelectItemCategoryKey[] = ['genres', 'moods', 'instrumentations', 'qualities'];
            if (multiSelectKeys.includes(catKey as MultiSelectItemCategoryKey)) {
                const intensity = categoryIntensity[catKey as MultiSelectItemCategoryKey] || 'moderate';
                switch (catKey as MultiSelectItemCategoryKey) {
                    case 'genres':
                    case 'moods':
                    case 'qualities':
                        if (intensity === 'simple') return 1;
                        if (intensity === 'moderate') return Math.random() < 0.5 ? 1 : 2;
                        if (intensity === 'complex') return Math.random() < 0.5 ? 2 : 3; 
                        return 1;
                    case 'instrumentations':
                        if (intensity === 'simple') return 2;
                        if (intensity === 'moderate') return 2 + Math.floor(Math.random() * 2); 
                        if (intensity === 'complex') return 3 + Math.floor(Math.random() * 2); 
                        return 2;
                }
            }
            return 1; // Default for single-item categories
        };
        
        const getNewValueForCategory = <K extends LockableCategoryKey>(
            catKey: K,
            generatorFn: () => GeneratedStyleParts[K]
        ): GeneratedStyleParts[K] => {
            if (rerollCatKey === catKey) return generatorFn();
            if (rerollCatKey !== null && prevStyle) return prevStyle[catKey];
            if (!currentLockedCategories[catKey]) return generatorFn();
            if (!prevStyle) return generatorFn();
            return prevStyle[catKey];
        };
        
        const newStyle: GeneratedStyleParts = {
            id: newId,
            genres: getNewValueForCategory('genres', () => getRandomElements(categoryDataSources.genres, customItems.genres, getCountForCategory('genres'))),
            moods: getNewValueForCategory('moods', () => getRandomElements(categoryDataSources.moods, customItems.moods, getCountForCategory('moods'))),
            tempo: getNewValueForCategory('tempo', () => getRandomElements(categoryDataSources.tempo, customItems.tempo, getCountForCategory('tempo'))[0] || "Moderate Tempo"),
            instrumentations: getNewValueForCategory('instrumentations', () => getRandomElements(categoryDataSources.instrumentations, customItems.instrumentations, getCountForCategory('instrumentations'))),
            qualities: getNewValueForCategory('qualities', () => getRandomElements(categoryDataSources.qualities, customItems.qualities, getCountForCategory('qualities'))),
            
            era: optionalCategoryToggles.includeEra ? getNewValueForCategory('era', () => getRandomElements(categoryDataSources.era, customItems.era, getCountForCategory('era'))[0]) : undefined,
            productionStyle: optionalCategoryToggles.includeProductionStyle ? getNewValueForCategory('productionStyle', () => getRandomElements(categoryDataSources.productionStyle, customItems.productionStyle, getCountForCategory('productionStyle'))[0]) : undefined,
            keyModeSuggestion: optionalCategoryToggles.includeKeyModeSuggestion ? getNewValueForCategory('keyModeSuggestion', () => getRandomElements(categoryDataSources.keyModeSuggestion, customItems.keyModeSuggestion, getCountForCategory('keyModeSuggestion'))[0]) : undefined,
            purpose: optionalCategoryToggles.includePurpose ? getNewValueForCategory('purpose', () => getRandomElements(categoryDataSources.purpose, customItems.purpose, getCountForCategory('purpose'))[0]) : undefined,
            influence: optionalCategoryToggles.includeInfluence ? getNewValueForCategory('influence', () => getRandomElements(categoryDataSources.influence, customItems.influence, getCountForCategory('influence'))[0]) : undefined,
            soundDesignFocus: optionalCategoryToggles.includeSoundDesignFocus ? getNewValueForCategory('soundDesignFocus', () => getRandomElements(categoryDataSources.soundDesignFocus, customItems.soundDesignFocus, getCountForCategory('soundDesignFocus'))[0]) : undefined,
        };
        
        setCurrentStyle(newStyle);
        setIsGenerating(false);

        if (rerollCatKey) trackLocalEvent(TOOL_CATEGORY, 'categoryRerolled', rerollCatKey, 1);
        else trackLocalEvent(TOOL_CATEGORY, 'styleGenerated', prevStyle ? 'full_reroll' : 'initial', 1);

    }, 200);
  }, [currentLockedCategories, currentStyle, trackLocalEvent, customItems, optionalCategoryToggles, categoryIntensity]);
  
  useEffect(() => {
    if (!currentStyle && !isGenerating) { 
        generateStyleInternal(null);
    }
  }, [currentStyle, isGenerating, generateStyleInternal]);


  const handleFullGenerate = useCallback(() => {
    if (currentStyle && (history.length === 0 || history[0].style.id !== currentStyle.id)) {
        setHistory(prev => [{ style: currentStyle, lockedCategories: currentLockedCategories, optionalCategoryToggles, categoryIntensity }, ...prev.slice(0, 19)]);
    }
    generateStyleInternal(null);
  }, [currentStyle, history, currentLockedCategories, optionalCategoryToggles, categoryIntensity, generateStyleInternal]);

  const handleRerollCategory = useCallback((categoryKey: LockableCategoryKey) => {
    if (currentStyle && (history.length === 0 || history[0].style.id !== currentStyle.id)) {
         setHistory(prev => [{ style: currentStyle, lockedCategories: currentLockedCategories, optionalCategoryToggles, categoryIntensity }, ...prev.slice(0, 19)]);
    }
    generateStyleInternal(categoryKey);
  }, [currentStyle, history, currentLockedCategories, optionalCategoryToggles, categoryIntensity, generateStyleInternal]);

  const toggleLock = useCallback((category: LockableCategoryKey) => {
    if (
        (category === 'era' && !optionalCategoryToggles.includeEra) ||
        (category === 'productionStyle' && !optionalCategoryToggles.includeProductionStyle) ||
        (category === 'keyModeSuggestion' && !optionalCategoryToggles.includeKeyModeSuggestion) ||
        (category === 'purpose' && !optionalCategoryToggles.includePurpose) ||
        (category === 'influence' && !optionalCategoryToggles.includeInfluence) ||
        (category === 'soundDesignFocus' && !optionalCategoryToggles.includeSoundDesignFocus)
    ) {
        if (!currentLockedCategories[category]) return;
    }
    setCurrentLockedCategories(prev => {
      const newState = { ...prev, [category]: !prev[category] };
      if (newState[category]) trackLocalEvent(TOOL_CATEGORY, 'categoryLocked', category, 1);
      return newState;
    });
  }, [trackLocalEvent, optionalCategoryToggles, currentLockedCategories]);

  const formatStyleForSuno = useCallback((style: GeneratedStyleParts | null): string => {
    if (!style) return "";
    let parts = [
      ...style.genres, ...style.moods, style.tempo, ...style.instrumentations, ...style.qualities,
      style.era, style.productionStyle, style.keyModeSuggestion, style.purpose, style.influence, style.soundDesignFocus
    ].filter(Boolean).map(s => String(s).trim());
    return parts.join(', ').replace(/\([^)]+\)/g, '').replace(/\s+/g, ' ').trim();
  }, []);

  const formatStyleForDisplay = useCallback((style: GeneratedStyleParts | null): string => {
    if (!style) return "";
    let parts = [
      ...style.genres, ...style.moods, style.tempo, ...style.instrumentations, ...style.qualities,
      style.era, style.productionStyle, style.keyModeSuggestion, style.purpose, style.influence, style.soundDesignFocus
    ].filter(Boolean).map(s => String(s).trim());
    return parts.join(' | ');
  }, []);

  const handleCopyToClipboard = useCallback(() => {
    if (!currentStyle) return;
    const textToCopy = sunoPromptMode ? formatStyleForSuno(currentStyle) : formatStyleForDisplay(currentStyle);
    navigator.clipboard.writeText(textToCopy)
      .then(() => {
        setCopiedFeedback('COPIED!');
        setTimeout(() => setCopiedFeedback(''), 2000);
        trackLocalEvent(TOOL_CATEGORY, 'styleCopied', sunoPromptMode ? 'suno' : 'display', 1);
      })
      .catch(err => console.error('Failed to copy: ', err));
  }, [currentStyle, sunoPromptMode, formatStyleForSuno, formatStyleForDisplay, trackLocalEvent]);

  const handleCopyTags = useCallback(() => {
    if (!currentStyle) return;
    const tags = [
      ...currentStyle.genres,
      ...currentStyle.moods,
      currentStyle.tempo,
      ...currentStyle.instrumentations,
      ...currentStyle.qualities,
      currentStyle.era,
      currentStyle.productionStyle,
      currentStyle.keyModeSuggestion,
      currentStyle.purpose,
      currentStyle.influence,
      currentStyle.soundDesignFocus
    ].filter(Boolean).map(s => String(s).trim().replace(/\s*\([^)]*\)/g, '')).filter(s => s); // Remove bracketed content
    
    const uniqueTags = Array.from(new Set(tags));
    const textToCopy = uniqueTags.join(', ');

    navigator.clipboard.writeText(textToCopy)
      .then(() => {
        setCopiedTagsFeedback('TAGS COPIED!');
        setTimeout(() => setCopiedTagsFeedback(''), 2000);
        trackLocalEvent(TOOL_CATEGORY, 'tagsCopied', undefined, uniqueTags.length);
      })
      .catch(err => console.error('Failed to copy tags: ', err));
  }, [currentStyle, trackLocalEvent]);

  const isFavorite = useCallback((styleId: string): boolean => {
    return favorites.some(fav => fav.style.id === styleId);
  }, [favorites]);

  const handleToggleFavorite = useCallback((style: GeneratedStyleParts, locks: LockedCategoriesState, optToggles: OptionalCategoryToggleState, intensity?: Partial<Record<MultiSelectItemCategoryKey, IntensityLevel>>) => {
    let isNowFavorited = false;
    setFavorites(prevFavorites => {
      const existingFavIndex = prevFavorites.findIndex(fav => fav.style.id === style.id);
      if (existingFavIndex > -1) {
        isNowFavorited = false;
        return prevFavorites.filter((_, index) => index !== existingFavIndex);
      } else {
        isNowFavorited = true;
        const newFavoriteEntry: SavedStyleEntry = { style, lockedCategories: locks, optionalCategoryToggles: optToggles, categoryIntensity: intensity || categoryIntensity, note: '' };
        return [newFavoriteEntry, ...prevFavorites].slice(0, 50); // Limit to 50 favorites
      }
    });
    if (isNowFavorited) trackLocalEvent(TOOL_CATEGORY, 'favoriteAdded', undefined, 1);
    else trackLocalEvent(TOOL_CATEGORY, 'favoriteRemoved', undefined, 1);
  }, [trackLocalEvent, categoryIntensity]); 

  const handleLoadSavedStyle = useCallback((savedEntry: SavedStyleEntry) => {
    setCurrentStyle(savedEntry.style);
    setCurrentLockedCategories(savedEntry.lockedCategories);
    setOptionalCategoryToggles(savedEntry.optionalCategoryToggles || initialOptionalCategoryToggles);
    if (savedEntry.categoryIntensity) {
        setCategoryIntensity(prev => ({ ...initialCategoryIntensity, ...savedEntry.categoryIntensity }));
    } else {
        setCategoryIntensity(initialCategoryIntensity);
    }
    trackLocalEvent(TOOL_CATEGORY, 'styleLoadedFromSaved', undefined, 1);
  }, [trackLocalEvent]);

  const handleClearHistory = useCallback(() => {
    if (clearHistoryTimeoutRef.current) clearTimeout(clearHistoryTimeoutRef.current);
    const newClickCount = clearHistoryClickCount + 1;
    if (newClickCount >= 3) {
        try { localStorage.removeItem(HISTORY_STORAGE_KEY); } catch (e) { console.error("Error removing history from localStorage:", e); }
        setHistory([]); trackLocalEvent(TOOL_CATEGORY, 'historyCleared', undefined, 1);
        setClearHistoryClickCount(0); clearHistoryTimeoutRef.current = null;
    } else {
        setClearHistoryClickCount(newClickCount);
        clearHistoryTimeoutRef.current = window.setTimeout(() => { setClearHistoryClickCount(0); clearHistoryTimeoutRef.current = null; }, 2000);
    }
  }, [clearHistoryClickCount, trackLocalEvent]);

  const getClearHistoryButtonText = useCallback((): string => {
    if (clearHistoryClickCount === 0) return "Clear History (3 Clicks)";
    if (clearHistoryClickCount === 1) return "Clear History (2 more)";
    if (clearHistoryClickCount === 2) return "Clear History (1 more)";
    return "Clear History (3 Clicks)"; // Default
  }, [clearHistoryClickCount]);
  
  const handleNoteChange = (styleId: string, newNote: string) => {
    setFavorites(prev => prev.map(favEntry => favEntry.style.id === styleId ? { ...favEntry, note: newNote } : favEntry));
  };

  const handleSaveNote = (styleId: string) => {
    setEditingNoteForId(null);
    trackLocalEvent(TOOL_CATEGORY, 'favoriteNoteSaved', undefined, 1);
  };

  const openAddCustomItemModal = (category: CustomItemCategoryKey) => {
    setCustomItemCategory(category);
    setShowAddCustomItemModal(true);
    setCustomItemValue('');
  };

  const handleSaveCustomItem = () => {
    if (customItemCategory && customItemValue.trim()) {
      const trimmedValue = customItemValue.trim();
      if (customItems[customItemCategory].some(item => item.toLowerCase() === trimmedValue.toLowerCase())) {
        alert("This item already exists in your custom list for this category."); return;
      }
      setCustomItems(prev => ({ ...prev, [customItemCategory]: [...prev[customItemCategory], trimmedValue] }));
      trackLocalEvent(TOOL_CATEGORY, 'customItemAdded', customItemCategory, 1);
    }
    setShowAddCustomItemModal(false); setCustomItemCategory(null);
  };

  const handleDeleteCustomItem = (category: CustomItemCategoryKey, itemToDelete: string) => {
    setCustomItems(prev => ({ ...prev, [category]: prev[category].filter(item => item !== itemToDelete) }));
    trackLocalEvent(TOOL_CATEGORY, 'customItemDeleted', category, 1);
  };

  const isItemCustom = (categoryKey: CustomItemCategoryKey, itemValue?: string): boolean => {
    if (!itemValue) return false;
    return customItems[categoryKey]?.includes(itemValue) || false;
  };

  const handleOptionalCategoryToggle = (categoryKey: keyof OptionalCategoryToggleState) => {
    setOptionalCategoryToggles(prev => {
      const newState = { ...prev, [categoryKey]: !prev[categoryKey] };
      if (!newState[categoryKey]) { 
          setCurrentLockedCategories(prevLocks => ({...prevLocks, [categoryKey as LockableCategoryKey]: false}));
      }
      return newState;
    });
    trackLocalEvent(TOOL_CATEGORY, 'optionalCategoryToggled', categoryKey, 1);
  };

  const handleExportCustomItems = () => {
    const jsonString = JSON.stringify(customItems, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = "music_style_generator_custom_items.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    trackLocalEvent(TOOL_CATEGORY, 'customItemsExported', undefined, Object.values(customItems).flat().length);
    setImportStatusMessage("Custom items exported!");
    setTimeout(() => setImportStatusMessage(''), 3000);
  };

  const handleImportFileSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const parsedData = JSON.parse(text) as CustomItemsState;
          // Basic validation
          let isValid = true;
          Object.keys(initialCustomItems).forEach(key => {
            if (!parsedData.hasOwnProperty(key) || !Array.isArray(parsedData[key as CustomItemCategoryKey])) {
              isValid = false;
            }
          });
          if (isValid) {
            setImportedCustomItemsData(parsedData);
            setImportConfirmationModalOpen(true);
            setImportStatusMessage('File read. Confirm import mode.');
          } else {
            throw new Error("Invalid file structure for custom items.");
          }
        } catch (err) {
          console.error("Error parsing imported JSON:", err);
          setImportStatusMessage(`Error: ${err instanceof Error ? err.message : "Invalid JSON format."}`);
          setImportedCustomItemsData(null);
        }
      };
      reader.readAsText(file);
    }
  };

  const processImport = (mode: 'merge' | 'replace') => {
    if (!importedCustomItemsData) {
      setImportStatusMessage("Error: No data to import.");
      setImportConfirmationModalOpen(false);
      return;
    }
    if (mode === 'replace') {
      setCustomItems(importedCustomItemsData);
      setImportStatusMessage("Custom items replaced successfully!");
    } else { // merge
      setCustomItems(prevCustomItems => {
        const newCustomItems = { ...prevCustomItems };
        Object.entries(importedCustomItemsData).forEach(([catKey, items]) => {
          const key = catKey as CustomItemCategoryKey;
          const existingItemsLower = newCustomItems[key].map(item => item.toLowerCase());
          const newUniqueItems = (items as string[]).filter(item => !existingItemsLower.includes(item.toLowerCase()));
          newCustomItems[key] = [...newCustomItems[key], ...newUniqueItems];
        });
        return newCustomItems;
      });
      setImportStatusMessage("Custom items merged successfully! Duplicates were skipped.");
    }
    trackLocalEvent(TOOL_CATEGORY, 'customItemsImported', mode, Object.values(importedCustomItemsData).flat().length);
    setImportedCustomItemsData(null);
    setImportConfirmationModalOpen(false);
    setTimeout(() => setImportStatusMessage(''), 3000);
  };

  return {
    currentStyle, currentLockedCategories, isGenerating, sunoPromptMode, setSunoPromptMode,
    copiedFeedback, copiedTagsFeedback, history, favorites, showFavoritesView, setShowFavoritesView,
    editingNoteForId, setEditingNoteForId, noteInputRef,
    clearHistoryClickCount, clearHistoryTimeoutRef,
    customItems, showAddCustomItemModal, setShowAddCustomItemModal, customItemCategory, setCustomItemCategory,
    customItemValue, setCustomItemValue, manageCustomModalOpen, setManageCustomModalOpen,
    importConfirmationModalOpen, setImportConfirmationModalOpen, importedCustomItemsData, setImportedCustomItemsData,
    importStatusMessage, setImportStatusMessage, fileInputRef,
    optionalCategoryToggles,
    categoryIntensity,
    handleSetCategoryIntensity,
    handleFullGenerate, handleRerollCategory, toggleLock,
    handleCopyToClipboard, handleCopyTags, handleToggleFavorite, isFavorite, handleLoadSavedStyle,
    handleClearHistory, handleNoteChange, handleSaveNote, openAddCustomItemModal, handleSaveCustomItem,
    handleDeleteCustomItem, isItemCustom, handleOptionalCategoryToggle, handleExportCustomItems,
    handleImportFileSelected, processImport, getClearHistoryButtonText,
    formatStyleForSuno, formatStyleForDisplay,
    TOOL_CATEGORY
  };
};
