
import React, { useState, useCallback, useEffect, useRef } from 'react';
import Spinner from '../../../components/Spinner';
import type { ToolProps } from '../../../Layout';
import type { BlendedConceptParts, CreativeLockableCategoryKey, CreativeLockedCategoriesState, CreativeSavedConceptEntry, CreativeCustomItemCategoryKey, CreativeCustomItemsState, OptionalCreativeCategoryToggleState } from '../../../types';
import { 
    categoryDataSources, 
    initialLockedCategories, 
    initialOptionalCategoryToggles, 
    initialCustomItems, 
    TOOL_CATEGORY, 
    HISTORY_STORAGE_KEY, 
    FAVORITES_STORAGE_KEY, 
    CUSTOM_ITEMS_STORAGE_KEY_PREFIX, 
    OPTIONAL_TOGGLES_STORAGE_KEY,
    getRandomElement
} from './CreativeConceptBlender.constants';
import { 
    LockOpenIcon, LockClosedIcon, RefreshIcon, StarEmptyIcon, StarFilledIcon, 
    TrashIcon, CopyIcon, NoteIcon, PlusCircleIcon, UserIcon, RecordIcon, ExportIcon, ImportIcon 
} from './CreativeConceptBlender.icons';


const ToggleSwitch: React.FC<{ id: string; label: string; checked: boolean; onChange: () => void; className?: string }> = ({ id, label, checked, onChange, className = "" }) => (
    <div className={`flex items-center justify-between w-full py-2 ${className}`}>
        <label htmlFor={id} className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer select-none flex-grow" onClick={onChange}>{label}</label>
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            onClick={onChange}
            className={`${checked ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'} relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-800 flex-shrink-0 ml-4`}
            id={id}
        >
            <span className={`${checked ? 'translate-x-6' : 'translate-x-1'} inline-block w-4 h-4 transform bg-white rounded-full transition-transform`} />
        </button>
    </div>
);


const ItemPalettes: React.FC<{
  onItemSelect: (category: CreativeCustomItemCategoryKey, value: string) => void;
  customItems: CreativeCustomItemsState;
  optionalToggles: OptionalCreativeCategoryToggleState;
}> = ({ onItemSelect, customItems, optionalToggles }) => (
    <div className="mt-6 w-full p-4 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-green-700 dark:text-green-300 mb-3 text-center">Click an item to build your concept</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {(Object.keys(categoryDataSources) as CreativeCustomItemCategoryKey[]).filter(k => k !== 'twist' && (['theme','style','texture'].includes(k) || optionalToggles[`include${k.charAt(0).toUpperCase() + k.slice(1)}` as keyof OptionalCreativeCategoryToggleState])).map(catKey => (
                <div key={catKey}>
                    <h4 className="font-bold text-green-600 dark:text-green-400 capitalize mb-2">{catKey}</h4>
                    <div className="max-h-48 overflow-y-auto space-y-1 pr-2 scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-200 dark:scrollbar-track-gray-800">
                        {[...categoryDataSources[catKey], ...customItems[catKey]].map((item, idx) => (
                            <button key={`${catKey}-${idx}`} onClick={() => onItemSelect(catKey, item)}
                                    className="w-full text-left p-1.5 text-xs text-gray-800 dark:text-gray-200 bg-gray-200 dark:bg-gray-700 rounded hover:bg-green-100 dark:hover:bg-green-700 hover:text-green-800 dark:hover:text-white transition-colors">
                                {item}
                                {customItems[catKey].includes(item) && <UserIcon className="inline-block ml-1 mb-0.5 w-3 h-3 text-yellow-500 dark:text-yellow-400" title="Custom Item" />}
                            </button>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    </div>
);

// FIX: Changed to a named export
export const CreativeConceptBlender: React.FC<ToolProps> = ({ trackLocalEvent }) => {
  const [currentConcept, setCurrentConcept] = useState<BlendedConceptParts | null>(null);
  const [currentLockedCategories, setCurrentLockedCategories] = useState<CreativeLockedCategoriesState>(initialLockedCategories);
  const [optionalCategoryToggles, setOptionalCategoryToggles] = useState<OptionalCreativeCategoryToggleState>(initialOptionalCategoryToggles);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [showTwistButton, setShowTwistButton] = useState<boolean>(false);
  const [copiedFeedback, setCopiedFeedback] = useState<{id: string | null, type: 'main' | 'history' | 'favorite', text: string}>({ id: null, type: 'main', text: 'COPY TO CLIPBOARD'});
  
  const [history, setHistory] = useState<CreativeSavedConceptEntry[]>([]);
  const [favorites, setFavorites] = useState<CreativeSavedConceptEntry[]>([]);
  const [showFavoritesView, setShowFavoritesView] = useState<boolean>(true);
  const [editingNoteForId, setEditingNoteForId] = useState<string | null>(null);
  const noteInputRef = useRef<HTMLInputElement>(null);
  const [clearHistoryClickCount, setClearHistoryClickCount] = useState(0);
  const clearHistoryTimeoutRef = useRef<number | null>(null);
  
  const [customItems, setCustomItems] = useState<CreativeCustomItemsState>(initialCustomItems);
  const [showAddCustomItemModal, setShowAddCustomItemModal] = useState(false);
  const [customItemCategory, setCustomItemCategory] = useState<CreativeCustomItemCategoryKey | null>(null);
  const [customItemValue, setCustomItemValue] = useState('');
  const [manageCustomModalOpen, setManageCustomModalOpen] = useState(false);
  const [importConfirmationModalOpen, setImportConfirmationModalOpen] = useState(false);
  const [importedCustomItemsData, setImportedCustomItemsData] = useState<CreativeCustomItemsState | null>(null);
  const [importStatusMessage, setImportStatusMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeMode, setActiveMode] = useState<'generate' | 'record'>('generate');

  const generateConceptInternal = useCallback((rerollCatKey: CreativeLockableCategoryKey | null = null, addTwist: boolean = false) => {
    setIsGenerating(true); setCopiedFeedback(prev => ({...prev, id: null, text: 'COPY TO CLIPBOARD'}));
    setTimeout(() => {
        const newId = Date.now().toString();
        const prevConcept = currentConcept;
        
        // FIX: Using traditional function syntax for generic inside arrow function to avoid JSX ambiguity
        function getNewValueForCategory<K extends CreativeLockableCategoryKey>(catKey: K, generatorFn: () => BlendedConceptParts[K]): BlendedConceptParts[K] {
            if (rerollCatKey === catKey) return generatorFn();
            if (rerollCatKey !== null && prevConcept) return prevConcept[catKey];
            if (!currentLockedCategories[catKey]) return generatorFn();
            if (!prevConcept) return generatorFn();
            return prevConcept[catKey];
        }

        const newConcept: BlendedConceptParts = {
            id: newId,
            theme: getNewValueForCategory('theme', () => getRandomElement(categoryDataSources.theme, customItems.theme)),
            style: getNewValueForCategory('style', () => getRandomElement(categoryDataSources.style, customItems.style)),
            texture: getNewValueForCategory('texture', () => getRandomElement(categoryDataSources.texture, customItems.texture)),
            musicality: optionalCategoryToggles.includeMusicality ? getNewValueForCategory('musicality', () => getRandomElement(categoryDataSources.musicality, customItems.musicality)) : undefined,
            conflict: optionalCategoryToggles.includeConflict ? getNewValueForCategory('conflict', () => getRandomElement(categoryDataSources.conflict, customItems.conflict)) : undefined,
            character: optionalCategoryToggles.includeCharacter ? getNewValueForCategory('character', () => getRandomElement(categoryDataSources.character, customItems.character)) : undefined,
            setting: optionalCategoryToggles.includeSetting ? getNewValueForCategory('setting', () => getRandomElement(categoryDataSources.setting, customItems.setting)) : undefined,
            catalyst: optionalCategoryToggles.includeCatalyst ? getNewValueForCategory('catalyst', () => getRandomElement(categoryDataSources.catalyst, customItems.catalyst)) : undefined,
            twist: addTwist ? getNewValueForCategory('twist', () => getRandomElement(categoryDataSources.twist, customItems.twist)) : (prevConcept && currentLockedCategories.twist ? prevConcept.twist : undefined),
        };
        setCurrentConcept(newConcept); setIsGenerating(false);
        if (rerollCatKey) trackLocalEvent(TOOL_CATEGORY, 'conceptCategoryRerolled', rerollCatKey, 1);
        else if (addTwist) trackLocalEvent(TOOL_CATEGORY, 'conceptTwistAdded', undefined, 1);
        else trackLocalEvent(TOOL_CATEGORY, 'conceptGenerated', prevConcept ? 'full_reroll' : 'initial', 1);
    }, 200);
  }, [currentConcept, currentLockedCategories, trackLocalEvent, customItems, optionalCategoryToggles]);

  useEffect(() => { if (!currentConcept && !isGenerating) generateConceptInternal(null); }, [currentConcept, isGenerating, generateConceptInternal]);

  useEffect(() => {
    try {
        const storedToggles = localStorage.getItem(OPTIONAL_TOGGLES_STORAGE_KEY);
        if (storedToggles) setOptionalCategoryToggles(JSON.parse(storedToggles));
    } catch (e) { console.error("Error loading optional category toggles:", e); }
  }, []);

  useEffect(() => {
    try { localStorage.setItem(OPTIONAL_TOGGLES_STORAGE_KEY, JSON.stringify(optionalCategoryToggles)); }
    catch (e) { console.error("Error saving optional category toggles:", e); }
  }, [optionalCategoryToggles]);

  const handleFullGenerate = useCallback(() => {
    if (currentConcept && (history.length === 0 || history[0].concept.id !== currentConcept.id)) {
        setHistory(prev => [{ concept: currentConcept, lockedCategories: currentLockedCategories, optionalCategoryToggles }, ...prev.slice(0, 19)]);
    }
    generateConceptInternal(null);
  }, [currentConcept, history, currentLockedCategories, optionalCategoryToggles, generateConceptInternal]);

  const handleRerollCategory = useCallback((categoryKey: CreativeLockableCategoryKey) => {
    if (currentConcept && (history.length === 0 || history[0].concept.id !== currentConcept.id)) {
        setHistory(prev => [{ concept: currentConcept, lockedCategories: currentLockedCategories, optionalCategoryToggles }, ...prev.slice(0, 19)]);
    }
    generateConceptInternal(categoryKey);
  }, [currentConcept, history, currentLockedCategories, optionalCategoryToggles, generateConceptInternal]);
  
  const handleAddTwist = useCallback(() => {
    if (currentConcept && (history.length === 0 || history[0].concept.id !== currentConcept.id)) {
        setHistory(prev => [{ concept: currentConcept, lockedCategories: currentLockedCategories, optionalCategoryToggles }, ...prev.slice(0, 19)]);
    }
    generateConceptInternal(null, true); setShowTwistButton(false);
  }, [currentConcept, history, currentLockedCategories, optionalCategoryToggles, generateConceptInternal]);

  const toggleLock = useCallback((category: CreativeLockableCategoryKey) => {
    setCurrentLockedCategories(prev => {
      const newState = { ...prev, [category]: !prev[category] };
      if (newState[category]) trackLocalEvent(TOOL_CATEGORY, 'conceptCategoryLocked', category, 1);
      return newState;
    });
  }, [trackLocalEvent]);

  const formatConceptForClipboard = (concept: BlendedConceptParts | null): string => {
    if (!concept) return "";
    let parts = [
        concept.theme, concept.style, concept.texture,
        concept.musicality, concept.conflict, concept.character, concept.setting, concept.catalyst
    ].filter(Boolean).map(s => String(s).trim());
    if (concept.twist) parts.push(`with a twist: ${String(concept.twist).trim()}`);
    return parts.join(', ');
  };

  const handleCopyToClipboard = useCallback((concept: BlendedConceptParts, type: 'main' | 'history' | 'favorite') => {
    const textToCopy = formatConceptForClipboard(concept);
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopiedFeedback({ id: concept.id, type: type, text: 'COPIED!'});
      setTimeout(() => setCopiedFeedback(prev => (prev.id === concept.id ? {...prev, text: 'COPY TO CLIPBOARD'} : prev)), 2000);
      trackLocalEvent(TOOL_CATEGORY, 'conceptCopied', type, 1);
    }).catch(err => console.error('Failed to copy: ', err));
  }, [trackLocalEvent]);
  
  const isFavorite = useCallback((conceptId: string): boolean => { return favorites.some(fav => fav.concept.id === conceptId); }, [favorites]);
  const handleToggleFavorite = useCallback((concept: BlendedConceptParts, locks: CreativeLockedCategoriesState, optToggles?: OptionalCreativeCategoryToggleState) => {
    let isNowFavorited = false;
    setFavorites(prevFavorites => {
      const existingFavIndex = prevFavorites.findIndex(fav => fav.concept.id === concept.id);
      if (existingFavIndex > -1) { isNowFavorited = false; return prevFavorites.filter((_, index) => index !== existingFavIndex); } 
      else { isNowFavorited = true; const newFavoriteEntry: CreativeSavedConceptEntry = { concept, lockedCategories: locks, optionalCategoryToggles: optToggles || initialOptionalCategoryToggles, note: '' }; return [newFavoriteEntry, ...prevFavorites].slice(0, 50); }
    });
    if(isNowFavorited) trackLocalEvent(TOOL_CATEGORY, 'conceptFavoriteAdded', undefined, 1);
    else trackLocalEvent(TOOL_CATEGORY, 'conceptFavoriteRemoved', undefined, 1);
  }, [trackLocalEvent]);
  const handleLoadSavedConcept = useCallback((savedEntry: CreativeSavedConceptEntry) => { setCurrentConcept(savedEntry.concept); setCurrentLockedCategories(savedEntry.lockedCategories); if (savedEntry.optionalCategoryToggles) { setOptionalCategoryToggles(savedEntry.optionalCategoryToggles); } trackLocalEvent(TOOL_CATEGORY, 'conceptLoadedFromSaved', undefined, 1);}, [trackLocalEvent]);
  
  const handleClearHistory = useCallback(() => {
    if(clearHistoryTimeoutRef.current) clearTimeout(clearHistoryTimeoutRef.current);
    const newClickCount = clearHistoryClickCount + 1;
    if (newClickCount >= 3) { try { localStorage.removeItem(HISTORY_STORAGE_KEY); } catch(e){} setHistory([]); trackLocalEvent(TOOL_CATEGORY, 'conceptHistoryCleared'); setClearHistoryClickCount(0); } 
    else { setClearHistoryClickCount(newClickCount); clearHistoryTimeoutRef.current = window.setTimeout(() => setClearHistoryClickCount(0), 2000); }
  }, [clearHistoryClickCount, trackLocalEvent]);
  const getClearHistoryButtonText = (): string => { if(clearHistoryClickCount === 1) return "Sure? (2 more)"; if(clearHistoryClickCount === 2) return "Last Chance!"; return "Clear History (3 clicks)"; };
  const handleNoteChange = (conceptId: string, newNote: string) => { setFavorites(prev => prev.map(favEntry => favEntry.concept.id === conceptId ? {...favEntry, note: newNote} : favEntry)); };
  const handleSaveNote = (conceptId: string) => { setEditingNoteForId(null); trackLocalEvent(TOOL_CATEGORY, 'conceptNoteSaved'); };

  useEffect(() => {
    try {
        const storedHistory = localStorage.getItem(HISTORY_STORAGE_KEY); if (storedHistory) setHistory(JSON.parse(storedHistory));
        const storedFavorites = localStorage.getItem(FAVORITES_STORAGE_KEY); if (storedFavorites) setFavorites(JSON.parse(storedFavorites));
        const loadedCustomItems = {...initialCustomItems};
        Object.keys(initialCustomItems).forEach(catKey => { try { const stored = localStorage.getItem(`${CUSTOM_ITEMS_STORAGE_KEY_PREFIX}${catKey}`); if(stored) loadedCustomItems[catKey as CreativeCustomItemCategoryKey] = JSON.parse(stored); } catch(e){} });
        setCustomItems(loadedCustomItems);
    } catch(e) { console.error("Error loading saved data from localStorage:", e); }
    return () => { if(clearHistoryTimeoutRef.current) clearTimeout(clearHistoryTimeoutRef.current); };
  }, []);
  
  useEffect(() => {
    try {
        localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
        localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
        Object.entries(customItems).forEach(([catKey, items]) => { localStorage.setItem(`${CUSTOM_ITEMS_STORAGE_KEY_PREFIX}${catKey}`, JSON.stringify(items)); });
    } catch(e) { console.error("Error saving data to localStorage:", e); }
  }, [history, favorites, customItems]);
  
  const openAddCustomItemModal = (category: CreativeCustomItemCategoryKey) => { setCustomItemCategory(category); setShowAddCustomItemModal(true); setCustomItemValue(''); };
  const handleSaveCustomItem = () => { if (customItemCategory && customItemValue.trim()) { const trimmedValue = customItemValue.trim(); if(customItems[customItemCategory].some(item=>item.toLowerCase() === trimmedValue.toLowerCase())) { alert("This item already exists."); return; } setCustomItems(prev => ({...prev, [customItemCategory]: [...prev[customItemCategory], trimmedValue]})); trackLocalEvent(TOOL_CATEGORY, 'conceptCustomItemAdded', customItemCategory); } setShowAddCustomItemModal(false); setCustomItemCategory(null); };
  const handleDeleteCustomItem = (category: CreativeCustomItemCategoryKey, itemToDelete: string) => { setCustomItems(prev => ({...prev, [category]: prev[category].filter(item => item !== itemToDelete)})); trackLocalEvent(TOOL_CATEGORY, 'conceptCustomItemDeleted', category); };
  const isItemCustom = (categoryKey: CreativeCustomItemCategoryKey, itemValue?: string): boolean => { if(!itemValue) return false; return customItems[categoryKey]?.includes(itemValue) || false; };
  
  const handleExportCustomItems = () => { const jsonString = JSON.stringify(customItems, null, 2); const blob = new Blob([jsonString], {type: "application/json"}); const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = "creative_concept_custom_items.json"; document.body.appendChild(link); link.click(); document.body.removeChild(link); URL.revokeObjectURL(url); trackLocalEvent(TOOL_CATEGORY, 'conceptCustomItemsExported'); setImportStatusMessage("Custom items exported!"); setTimeout(() => setImportStatusMessage(''), 3000); };
  const handleImportFileSelected = (event: React.ChangeEvent<HTMLInputElement>) => { const file = event.target.files?.[0]; if (file) { const reader = new FileReader(); reader.onload = (e) => { try { const text = e.target?.result as string; const parsedData = JSON.parse(text); let isValid = true; Object.keys(initialCustomItems).forEach(key => { if (!parsedData.hasOwnProperty(key) || !Array.isArray(parsedData[key as CreativeCustomItemCategoryKey])) { isValid = false; }}); if(isValid) { setImportedCustomItemsData(parsedData); setImportConfirmationModalOpen(true); setImportStatusMessage('File read. Confirm import mode.'); } else { throw new Error("Invalid file structure."); }} catch(err) { setImportStatusMessage(`Error: ${err instanceof Error ? err.message : "Invalid JSON."}`); }}; reader.readAsText(file); }};
  const processImport = (mode: 'merge' | 'replace') => {
    if (!importedCustomItemsData) { setImportStatusMessage("Error: No data to import."); setImportConfirmationModalOpen(false); return; }
    if (mode === 'replace') { setCustomItems(importedCustomItemsData); setImportStatusMessage("Custom items replaced successfully!"); } 
    else { setCustomItems(prev => { const newItems = {...prev}; Object.entries(importedCustomItemsData).forEach(([catKey, items]) => { const key = catKey as CreativeCustomItemCategoryKey; const existingLower = newItems[key].map(item => item.toLowerCase()); const newUnique = (items as string[]).filter(item => !existingLower.includes(item.toLowerCase())); newItems[key] = [...newItems[key], ...newUnique]; }); return newItems; }); setImportStatusMessage("Custom items merged successfully! Duplicates were skipped."); }
    trackLocalEvent(TOOL_CATEGORY, 'conceptCustomItemsImported', mode); setImportedCustomItemsData(null); setImportConfirmationModalOpen(false); setTimeout(() => setImportStatusMessage(''), 3000);
  };
  const handleOptionalCategoryToggle = (categoryKey: keyof OptionalCreativeCategoryToggleState) => { setOptionalCategoryToggles(prev => ({ ...prev, [categoryKey]: !prev[categoryKey] })); trackLocalEvent(TOOL_CATEGORY, 'optionalCreativeCategoryToggled', categoryKey, 1); };

  const handleRecordItemSelect = (category: CreativeCustomItemCategoryKey, value: string) => {
    setCurrentConcept(prev => {
        const newConcept: BlendedConceptParts = prev ? {...prev} : { id: Date.now().toString(), theme: '', style: '', texture: ''};
        (newConcept as any)[category] = value;
        return newConcept;
    });
    trackLocalEvent(TOOL_CATEGORY, 'recordModeItemSelected', category);
  };
  
  const handleResetRecord = () => {
    if (window.confirm("Are you sure you want to clear your current recorded concept?")) {
        setCurrentConcept({ id: Date.now().toString(), theme: '', style: '', texture: ''});
        trackLocalEvent(TOOL_CATEGORY, 'recordModeReset');
    }
  };

  const handleModeChange = (newMode: 'generate' | 'record') => {
    if (activeMode !== newMode) {
      if (currentConcept && (history.length === 0 || history[0].concept.id !== currentConcept.id)) {
        setHistory(prev => [{ concept: currentConcept, lockedCategories: currentLockedCategories, optionalCategoryToggles }, ...prev.slice(0, 19)]);
      }
      if (newMode === 'record') {
        setCurrentConcept({ id: Date.now().toString(), theme: '', style: '', texture: ''});
      } else { // Switching to generate mode
        generateConceptInternal(null);
      }
      setActiveMode(newMode);
      trackLocalEvent(TOOL_CATEGORY, 'modeChanged', newMode);
    }
  };

  const ConceptCategoryDisplay: React.FC<{
    label: string; 
    value: string | undefined; 
    categoryKey: CreativeLockableCategoryKey; 
    isOptional?: boolean;
    isLocked: boolean; 
    onToggleLock: () => void;
    onReroll: () => void;
  }> = ({ label, value, categoryKey, isOptional = false, isLocked, onToggleLock, onReroll }) => {
    if (isOptional && !value && activeMode === 'generate') return null; // Don't show empty optional in generate mode unless it has value (shouldn't happen with current logic but safe)
    
    return (
        <div className={`flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 transition-all ${isLocked ? 'border-green-500 dark:border-green-500 shadow-sm' : ''}`}>
            <div className="flex-grow min-w-0 mr-4">
                <span className="text-xs uppercase text-green-600 dark:text-green-400 font-bold tracking-wider block mb-1">
                    {label}
                    {isItemCustom(categoryKey as CreativeCustomItemCategoryKey, value) && <UserIcon className="inline-block ml-1 mb-0.5 w-3 h-3 text-yellow-500" title="Custom Item"/>}
                </span>
                <span className="text-gray-900 dark:text-gray-100 text-sm md:text-base font-medium break-words leading-tight">
                    {value || (activeMode === 'record' ? <span className="text-gray-400 dark:text-gray-600 italic">Select below...</span> : '')}
                </span>
            </div>
            {activeMode === 'generate' && (
                <div className="flex items-center space-x-2 flex-shrink-0">
                    <button onClick={onReroll} disabled={isGenerating || isLocked} className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 disabled:opacity-50 transition-colors" title="Reroll this category"><RefreshIcon className="w-4 h-4"/></button>
                    <button onClick={onToggleLock} disabled={isGenerating} className={`p-1.5 rounded-full transition-colors ${isLocked ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' : 'text-gray-400 dark:text-gray-500 hover:text-green-600 dark:hover:text-green-400'}`} title={isLocked ? "Unlock" : "Lock"}>
                        {isLocked ? <LockClosedIcon className="w-4 h-4" /> : <LockOpenIcon className="w-4 h-4" />}
                    </button>
                </div>
            )}
        </div>
    );
  };
  
  return (
    <div className="w-full">
      <header className="mb-10 text-center">
        <h1 className="text-5xl font-extrabold text-green-600 dark:text-green-400">Creative Concept Blender</h1>
        <p className="mt-3 text-md text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Spark wildly original musical ideas by blending disparate concepts. Use 'Record New' to build manually!
        </p>
      </header>

      <main className="w-full bg-white dark:bg-gray-900 shadow-2xl rounded-lg p-6 md:p-10 border-2 border-green-500 dark:border-green-600 transition-colors duration-300">
        
        {/* Mode Switcher */}
        <div className="flex justify-center mb-8">
            <div className="bg-gray-200 dark:bg-gray-800 p-1 rounded-lg inline-flex">
                <button 
                    onClick={() => handleModeChange('generate')}
                    className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${activeMode === 'generate' ? 'bg-green-500 text-white shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                >
                    Generate Mode
                </button>
                <button 
                    onClick={() => handleModeChange('record')}
                    className={`px-6 py-2 rounded-md text-sm font-medium transition-colors flex items-center ${activeMode === 'record' ? 'bg-red-500 text-white shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                >
                    <RecordIcon className="w-4 h-4 mr-1.5"/> Record New
                </button>
            </div>
        </div>

        {activeMode === 'generate' && (
            <div className="flex flex-col items-center mb-8">
                
                {/* Optional Categories Box */}
                <div className="mb-6 w-full max-w-md bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
                     <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4 text-center">Customize Your Blend</h3>
                     <div className="flex flex-col gap-3">
                        <ToggleSwitch id="toggle-musicality" label="Include Musicality" checked={optionalCategoryToggles.includeMusicality} onChange={() => handleOptionalCategoryToggle('includeMusicality')} />
                        <ToggleSwitch id="toggle-conflict" label="Include Core Conflict" checked={optionalCategoryToggles.includeConflict} onChange={() => handleOptionalCategoryToggle('includeConflict')} />
                        <ToggleSwitch id="toggle-character" label="Include Character" checked={optionalCategoryToggles.includeCharacter} onChange={() => handleOptionalCategoryToggle('includeCharacter')} />
                        <ToggleSwitch id="toggle-setting" label="Include Setting" checked={optionalCategoryToggles.includeSetting} onChange={() => handleOptionalCategoryToggle('includeSetting')} />
                        <ToggleSwitch id="toggle-catalyst" label="Include Catalyst" checked={optionalCategoryToggles.includeCatalyst} onChange={() => handleOptionalCategoryToggle('includeCatalyst')} />
                    </div>
                </div>

                <button onClick={() => handleFullGenerate()} disabled={isGenerating} className="w-full md:w-auto flex justify-center items-center py-3 px-8 border border-transparent rounded-md shadow-sm text-lg font-medium text-black bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-400 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-900 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:text-gray-500 dark:disabled:text-gray-400 transition-colors">
                    {isGenerating ? <><Spinner size="w-6 h-6 mr-2" color="text-black"/>BLENDING...</> : 'BLEND NEW CONCEPT'}
                </button>
            </div>
        )}

        {activeMode === 'record' && (
            <div className="flex flex-col items-center mb-8">
                 <button onClick={handleResetRecord} className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-md text-sm font-medium transition-colors">Clear & Restart Recording</button>
            </div>
        )}

        {currentConcept && (
            <div className="bg-gray-100 dark:bg-gray-850 p-6 rounded-xl border-2 border-gray-300 dark:border-gray-700 relative overflow-hidden transition-colors duration-300">
                 <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-green-400 to-blue-500"></div>
                 
                 <div className="flex justify-between items-start mb-6 pl-4">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Current Concept</h2>
                    <div className="flex gap-2">
                        <button onClick={() => handleCopyToClipboard(currentConcept, 'main')} disabled={!!copiedFeedback} className="flex items-center text-xs py-1.5 px-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md font-medium transition-colors">
                            <CopyIcon className="w-3.5 h-3.5 mr-1.5"/> {copiedFeedback && copiedFeedback.type === 'main' ? copiedFeedback.text : 'COPY'}
                        </button>
                         <button onClick={() => handleToggleFavorite(currentConcept, currentLockedCategories, optionalCategoryToggles)} className={`p-2 rounded-full transition-colors ${isFavorite(currentConcept.id) ? 'bg-yellow-500 text-black hover:bg-yellow-400' : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600'}`}>
                            {isFavorite(currentConcept.id) ? <StarFilledIcon /> : <StarEmptyIcon />}
                        </button>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pl-4">
                    <ConceptCategoryDisplay label="Theme / Scenario" value={currentConcept.theme} categoryKey="theme" isLocked={currentLockedCategories.theme} onToggleLock={() => toggleLock('theme')} onReroll={() => handleRerollCategory('theme')} />
                    <ConceptCategoryDisplay label="Artistic Style / Mood" value={currentConcept.style} categoryKey="style" isLocked={currentLockedCategories.style} onToggleLock={() => toggleLock('style')} onReroll={() => handleRerollCategory('style')} />
                    <ConceptCategoryDisplay label="Sensory Texture" value={currentConcept.texture} categoryKey="texture" isLocked={currentLockedCategories.texture} onToggleLock={() => toggleLock('texture')} onReroll={() => handleRerollCategory('texture')} />
                    
                    {optionalCategoryToggles.includeMusicality && <ConceptCategoryDisplay label="Musicality & Soundscape" value={currentConcept.musicality} categoryKey="musicality" isOptional isLocked={currentLockedCategories.musicality} onToggleLock={() => toggleLock('musicality')} onReroll={() => handleRerollCategory('musicality')} />}
                    {optionalCategoryToggles.includeConflict && <ConceptCategoryDisplay label="Core Conflict" value={currentConcept.conflict} categoryKey="conflict" isOptional isLocked={currentLockedCategories.conflict} onToggleLock={() => toggleLock('conflict')} onReroll={() => handleRerollCategory('conflict')} />}
                    {optionalCategoryToggles.includeCharacter && <ConceptCategoryDisplay label="Character / Perspective" value={currentConcept.character} categoryKey="character" isOptional isLocked={currentLockedCategories.character} onToggleLock={() => toggleLock('character')} onReroll={() => handleRerollCategory('character')} />}
                    {optionalCategoryToggles.includeSetting && <ConceptCategoryDisplay label="Setting Specifics" value={currentConcept.setting} categoryKey="setting" isOptional isLocked={currentLockedCategories.setting} onToggleLock={() => toggleLock('setting')} onReroll={() => handleRerollCategory('setting')} />}
                    {optionalCategoryToggles.includeCatalyst && <ConceptCategoryDisplay label="Key Object / Catalyst" value={currentConcept.catalyst} categoryKey="catalyst" isOptional isLocked={currentLockedCategories.catalyst} onToggleLock={() => toggleLock('catalyst')} onReroll={() => handleRerollCategory('catalyst')} />}
                 </div>

                 {currentConcept.twist ? (
                    <div className="mt-6 ml-4 p-4 bg-purple-100 dark:bg-purple-900/30 border-l-4 border-purple-500 rounded-r-lg animate-fadeIn">
                        <div className="flex justify-between items-center mb-1">
                             <h4 className="text-sm font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wider">The Twist</h4>
                             {activeMode === 'generate' && (
                                <div className="flex space-x-2">
                                    <button onClick={() => handleRerollCategory('twist')} disabled={isGenerating || currentLockedCategories.twist} className="p-1 text-purple-400 hover:text-purple-200"><RefreshIcon className="w-4 h-4"/></button>
                                    <button onClick={() => toggleLock('twist')} className={`p-1 rounded-full ${currentLockedCategories.twist ? 'text-purple-200 bg-purple-700' : 'text-purple-400 hover:text-purple-200'}`}>
                                        {currentLockedCategories.twist ? <LockClosedIcon className="w-4 h-4" /> : <LockOpenIcon className="w-4 h-4" />}
                                    </button>
                                </div>
                             )}
                        </div>
                        <p className="text-lg text-purple-900 dark:text-purple-100 italic">{currentConcept.twist}</p>
                    </div>
                 ) : (
                    activeMode === 'generate' && (
                        <div className="mt-6 ml-4 flex justify-center">
                            <button onClick={handleAddTwist} className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-full text-sm font-medium shadow-md transition-all hover:scale-105">
                                ✨ Add a Surprise Twist?
                            </button>
                        </div>
                    )
                 )}
            </div>
        )}
        
        {activeMode === 'record' && (
            <ItemPalettes onItemSelect={handleRecordItemSelect} customItems={customItems} optionalToggles={optionalCategoryToggles} />
        )}
        
        {activeMode === 'generate' && (
             <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 w-full flex justify-center">
                <button onClick={() => setManageCustomModalOpen(true)} className="py-2.5 px-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md text-sm font-medium shadow-lg transition-colors flex items-center gap-2">
                    <UserIcon className="w-4 h-4"/> Manage My Custom Items
                </button>
            </div>
        )}
        
        <AddCustomItemModal isOpen={showAddCustomItemModal} category={customItemCategory} value={customItemValue} setValue={setCustomItemValue} onSave={handleSaveCustomItem} onClose={() => setShowAddCustomItemModal(false)} />
        <ManageCustomItemsModal isOpen={manageCustomModalOpen} customItems={customItems} onDelete={handleDeleteCustomItem} onClose={() => setManageCustomModalOpen(false)} onExport={handleExportCustomItems} onImportFileSelected={handleImportFileSelected} importStatusMessage={importStatusMessage} fileInputRef={fileInputRef} />
        <ImportConfirmationModal isOpen={importConfirmationModalOpen} onClose={() => { setImportConfirmationModalOpen(false); setImportedCustomItemsData(null); }} onConfirmImport={processImport} />

         {/* History & Favorites Section */}
         {(history.length > 0 || favorites.length > 0) && (
            <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
                <div className="grid md:grid-cols-2 gap-8">
                     {/* History Column */}
                     <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-semibold text-green-700 dark:text-green-400">Recent Concepts ({history.length})</h3>
                            {history.length > 0 && <button onClick={handleClearHistory} className="py-1 px-2 text-xs bg-red-600 hover:bg-red-500 text-white rounded transition-colors">{getClearHistoryButtonText()}</button>}
                        </div>
                        <div className="space-y-3 max-h-96 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-200 dark:scrollbar-track-gray-900">
                            {history.length === 0 ? <p className="text-gray-500 dark:text-gray-400 italic text-sm">No recent history.</p> : history.map((entry, idx) => (
                                <div key={entry.concept.id + idx} className="bg-white dark:bg-gray-700 p-3 rounded border border-gray-200 dark:border-gray-600 text-sm shadow-sm hover:shadow-md transition-shadow">
                                    <p className="text-gray-800 dark:text-gray-200 mb-2 line-clamp-3">{formatConceptForClipboard(entry.concept)}</p>
                                    <div className="flex gap-2">
                                        <button onClick={() => handleLoadSavedConcept(entry)} className="text-xs py-1 px-2 bg-blue-600 hover:bg-blue-500 text-white rounded">Load</button>
                                        <button onClick={() => handleCopyToClipboard(entry.concept, 'history')} disabled={!!copiedFeedback && copiedFeedback.id === entry.concept.id} className="text-xs py-1 px-2 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-700 dark:text-white rounded">
                                            {copiedFeedback && copiedFeedback.id === entry.concept.id && copiedFeedback.type === 'history' ? copiedFeedback.text : 'Copy'}
                                        </button>
                                        <button onClick={() => handleToggleFavorite(entry.concept, entry.lockedCategories, entry.optionalCategoryToggles)} className={`text-xs py-1 px-2 rounded text-white ${isFavorite(entry.concept.id) ? 'bg-yellow-500 hover:bg-yellow-400' : 'bg-gray-400 hover:bg-gray-300 dark:bg-gray-500 dark:hover:bg-gray-400'}`}>
                                            {isFavorite(entry.concept.id) ? 'Unfav' : 'Fav'}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                     </div>
                     
                     {/* Favorites Column */}
                     <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                         <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-semibold text-green-700 dark:text-green-400">Favorites ({favorites.length})</h3>
                            <button onClick={() => setShowFavoritesView(!showFavoritesView)} className="text-xs text-blue-500 hover:underline">{showFavoritesView ? 'Hide' : 'Show'}</button>
                        </div>
                        {showFavoritesView && (
                            <div className="space-y-3 max-h-96 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-200 dark:scrollbar-track-gray-900">
                                {favorites.length === 0 ? <p className="text-gray-500 dark:text-gray-400 italic text-sm">No favorites saved yet.</p> : favorites.map((entry) => (
                                    <div key={entry.concept.id} className="bg-white dark:bg-gray-700 p-3 rounded border border-yellow-500/50 shadow-sm hover:shadow-md transition-shadow">
                                        <p className="text-gray-900 dark:text-gray-100 mb-2 line-clamp-4">{formatConceptForClipboard(entry.concept)}</p>
                                        {editingNoteForId === entry.concept.id ? (
                                            <div className="flex gap-1 items-center mb-2">
                                                <input ref={noteInputRef} type="text" defaultValue={entry.note || ''} onChange={(e) => handleNoteChange(entry.concept.id, e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSaveNote(entry.concept.id)} onBlur={() => setTimeout(() => { if (document.activeElement !== noteInputRef.current) handleSaveNote(entry.concept.id); }, 100)} className="flex-grow p-1 text-xs bg-gray-50 dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded text-gray-900 dark:text-white focus:ring-1 focus:ring-green-500" placeholder="Add a note..."/>
                                                <button onClick={() => handleSaveNote(entry.concept.id)} className="text-xs py-1 px-1.5 bg-green-600 hover:bg-green-500 text-white rounded">Save</button>
                                            </div>
                                        ) : (
                                            entry.note && <p className="text-xs text-yellow-600 dark:text-yellow-200 italic mb-2 p-1 bg-yellow-50 dark:bg-gray-600 rounded cursor-pointer" onClick={() => setEditingNoteForId(entry.concept.id)}>{entry.note}</p>
                                        )}
                                        <div className="flex gap-2">
                                            <button onClick={() => handleLoadSavedConcept(entry)} className="text-xs py-1 px-2 bg-blue-600 hover:bg-blue-500 text-white rounded">Load</button>
                                            <button onClick={() => handleCopyToClipboard(entry.concept, 'favorite')} disabled={!!copiedFeedback && copiedFeedback.id === entry.concept.id} className="text-xs py-1 px-2 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-700 dark:text-white rounded">
                                                {copiedFeedback && copiedFeedback.id === entry.concept.id && copiedFeedback.type === 'favorite' ? copiedFeedback.text : 'Copy'}
                                            </button>
                                            <button onClick={() => setEditingNoteForId(entry.concept.id)} className="text-xs py-1 px-2 bg-teal-600 hover:bg-teal-500 text-white rounded flex items-center"><NoteIcon className="w-3 h-3 mr-1"/>Note</button>
                                            <button onClick={() => handleToggleFavorite(entry.concept, entry.lockedCategories, entry.optionalCategoryToggles)} className="text-xs py-1 px-2 bg-red-600 hover:bg-red-500 text-white rounded">Delete</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                     </div>
                </div>
            </div>
         )}

      </main>
    </div>
  );
};

export const AddCustomItemModal: React.FC<{
    isOpen: boolean;
    category: CreativeCustomItemCategoryKey | null; 
    value: string;
    setValue: (val: string) => void;
    onSave: () => void;
    onClose: () => void;
}> = ({ isOpen, category, value, setValue, onSave, onClose }) => {
    if (!isOpen || !category) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md border border-green-500">
                <h3 className="text-lg font-semibold text-green-700 dark:text-green-300 mb-4">Add Custom Item to "{category.charAt(0).toUpperCase() + category.slice(1)}"</h3>
                <input type="text" value={value} onChange={(e) => setValue(e.target.value)} className="w-full p-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white mb-4 focus:ring-green-500 focus:border-green-500" placeholder="Enter your custom item" aria-label="Custom item value"/>
                <div className="flex justify-end gap-3"> <button onClick={onClose} className="py-2 px-4 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-800 dark:text-white rounded">Cancel</button> <button onClick={onSave} className="py-2 px-4 bg-green-600 hover:bg-green-500 text-white dark:text-black rounded">Save Item</button> </div>
            </div>
        </div>
    );
};

export const ManageCustomItemsModal: React.FC<{
    isOpen: boolean;
    customItems: CreativeCustomItemsState;
    onDelete: (category: CreativeCustomItemCategoryKey, item: string) => void;
    onClose: () => void;
    onExport: () => void;
    onImportFileSelected: (event: React.ChangeEvent<HTMLInputElement>) => void;
    importStatusMessage: string;
    fileInputRef: React.RefObject<HTMLInputElement>;
}> = ({ isOpen, customItems, onDelete, onClose, onExport, onImportFileSelected, importStatusMessage, fileInputRef }) => {
    if (!isOpen) return null;
    const customItemEntries = Object.entries(customItems) as [CreativeCustomItemCategoryKey, string[]][]; 

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-lg border border-green-500 max-h-[80vh] flex flex-col">
                <h3 className="text-xl font-semibold text-green-700 dark:text-green-300 mb-4 sticky top-0 bg-white dark:bg-gray-800 pb-2 z-10">Manage My Custom Items</h3>
                <div className="overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-100 dark:scrollbar-track-gray-800 flex-grow">
                    {customItemEntries.filter(([_, items]) => items.length > 0).length === 0 ? ( <p className="text-gray-500 dark:text-gray-400 italic">You haven't added any custom items yet.</p> ) : (
                        customItemEntries.map(([catKey, items]) => items.length > 0 && (
                            <div key={catKey} className="mb-4">
                                <h4 className="text-md font-semibold text-green-600 dark:text-green-200 mb-1">{catKey.charAt(0).toUpperCase() + catKey.slice(1)}:</h4>
                                <ul className="list-disc list-inside pl-4 space-y-1"> {items.map(item => ( <li key={item} className="text-sm text-gray-800 dark:text-gray-300 flex justify-between items-center"> {item} <button onClick={() => onDelete(catKey, item)} className="ml-2 p-1 text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300" aria-label={`Delete ${item}`}> <TrashIcon className="w-3.5 h-3.5"/> </button> </li> ))} </ul>
                            </div>
                        ))
                    )}
                </div>
                {importStatusMessage && <p className={`text-xs mt-2 text-center ${importStatusMessage.includes("Error") ? 'text-red-500' : 'text-green-600 dark:text-green-300'}`}>{importStatusMessage}</p>}
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600 sticky bottom-0 bg-white dark:bg-gray-800 z-10 space-y-2">
                    <div className="flex gap-2">
                            <input type="file" ref={fileInputRef} onChange={onImportFileSelected} accept=".json" style={{display: 'none'}} id="import-custom-items-file"/>
                        <button onClick={onExport} className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded text-sm flex items-center justify-center gap-2"><ExportIcon className="w-4 h-4"/>Export All</button>
                        <label htmlFor="import-custom-items-file" className="flex-1 py-2 px-3 bg-teal-600 hover:bg-teal-500 text-white rounded text-sm flex items-center justify-center gap-2 cursor-pointer"><ImportIcon className="w-4 h-4"/>Import</label>
                    </div>
                    <button onClick={onClose} className="py-2 px-4 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-800 dark:text-white rounded w-full text-sm">Close</button>
                </div>
            </div>
        </div>
    );
};

export const ImportConfirmationModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onConfirmImport: (mode: 'merge' | 'replace') => void;
}> = ({ isOpen, onClose, onConfirmImport }) => {
    if (!isOpen) return null;
    return (
            <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[60] p-4">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md border border-green-500">
                <h3 className="text-lg font-semibold text-green-700 dark:text-green-300 mb-4">Confirm Import</h3>
                <p className="text-gray-700 dark:text-gray-300 mb-1 text-sm">A valid custom items file has been loaded.</p>
                <p className="text-gray-700 dark:text-gray-300 mb-4 text-sm">How would you like to import these items?</p>
                <div className="flex flex-col space-y-3">
                    <button onClick={() => onConfirmImport('merge')} className="py-2 px-4 bg-sky-600 hover:bg-sky-500 text-white rounded">Merge with Existing Items</button>
                    <button onClick={() => onConfirmImport('replace')} className="py-2 px-4 bg-orange-600 hover:bg-orange-500 text-white rounded">Replace All Existing Items</button>
                    <button onClick={onClose} className="py-2 px-4 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-800 dark:text-white rounded">Cancel</button>
                </div>
            </div>
        </div>
    );
};
