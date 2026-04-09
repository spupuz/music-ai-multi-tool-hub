import React, { useState, useCallback, useEffect, useRef } from 'react';
import Spinner from '@/components/Spinner';
import type { ToolProps } from '@/Layout';
import { useTheme } from '@/context/ThemeContext';
import type { BlendedConceptParts, CreativeLockableCategoryKey, CreativeLockedCategoriesState, CreativeSavedConceptEntry, CreativeCustomItemCategoryKey, CreativeCustomItemsState, OptionalCreativeCategoryToggleState } from '@/types';
import Button from '@/components/common/Button';
import { 
    LockOpenIcon, LockClosedIcon, RefreshIcon, StarIcon, 
    TrashIcon, CopyIcon, NoteIcon, PlusCircleIcon, UserStatsIcon as UserIcon, RecordIcon, ExportIcon, ImportIcon, LoadIcon 
} from '@/components/Icons';
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

const ToggleSwitch: React.FC<{ id: string; label: string; checked: boolean; onChange: () => void; className?: string }> = ({ id, label, checked, onChange, className = "" }) => (
    <div className={`flex items-center justify-between w-full py-2 group cursor-pointer ${className}`} onClick={onChange}>
        <label htmlFor={id} className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-white transition-colors cursor-pointer select-none flex-grow pointer-events-none">{label}</label>
        <div 
            className={`relative inline-flex items-center h-6 rounded-full w-11 transition-all duration-300 focus:outline-none flex-shrink-0 ml-4 border active:scale-95 shadow-none ${checked ? 'bg-emerald-500 border-transparent shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'bg-slate-200 dark:bg-white/10 border-slate-300 dark:border-white/10'}`}
        >
            <span className={`${checked ? 'translate-x-6' : 'translate-x-1'} inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-300 shadow-sm`} />
        </div>
    </div>
);

const ItemPalettes: React.FC<{
  onItemSelect: (category: CreativeCustomItemCategoryKey, value: string) => void;
  customItems: CreativeCustomItemsState;
  optionalToggles: OptionalCreativeCategoryToggleState;
}> = ({ onItemSelect, customItems, optionalToggles }) => (
    <div className="mt-8 w-full p-6 glass-card border-white/10">
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-700 dark:text-emerald-500 mb-6 text-center">Blueprint Repository</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {(Object.keys(categoryDataSources) as CreativeCustomItemCategoryKey[]).filter(k => k !== 'twist' && (['theme','style','texture'].includes(k) || optionalToggles[`include${k.charAt(0).toUpperCase() + k.slice(1)}` as keyof OptionalCreativeCategoryToggleState])).map(catKey => (
                <div key={catKey}>
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-3 px-1">{catKey}</h4>
                    <div className="max-h-48 overflow-y-auto space-y-1.5 pr-2 scrollbar-thin scrollbar-thumb-white/10 hover:scrollbar-thumb-white/20">
                        {[...categoryDataSources[catKey], ...customItems[catKey]].map((item, idx) => (
                            <Button 
                                key={`${catKey}-${idx}`} 
                                onClick={() => onItemSelect(catKey, item)}
                                variant="ghost"
                                size="xs"
                                className="w-full text-left p-2 text-[10px] font-bold text-gray-800 dark:text-gray-300 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl hover:border-emerald-500/30 hover:bg-emerald-500/10 transition-all justify-start"
                            >
                                <span className="truncate flex-1">{item}</span>
                                {customItems[catKey].includes(item) && <UserIcon className="ml-1 w-3 h-3 text-emerald-500/60" title="Custom Item" />}
                            </Button>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    </div>
);

export const CreativeConceptBlender: React.FC<ToolProps> = ({ trackLocalEvent }) => {
  const { uiMode } = useTheme();
  const [currentConcept, setCurrentConcept] = useState<BlendedConceptParts | null>(null);
  const [currentLockedCategories, setCurrentLockedCategories] = useState<CreativeLockedCategoriesState>(initialLockedCategories);
  const [optionalCategoryToggles, setOptionalCategoryToggles] = useState<OptionalCreativeCategoryToggleState>(initialOptionalCategoryToggles);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
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
    generateConceptInternal(null, true);
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

  const getClearHistoryButtonText = (): string => { if(clearHistoryClickCount === 1) return "Sure? (2 more)"; if(clearHistoryClickCount === 2) return "Last Chance!"; return "Clear History"; };
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
    if (isOptional && !value && activeMode === 'generate') return null;
    
    return (
        <div className={`group flex items-center justify-between p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 transition-all duration-300 ${isLocked ? 'border-emerald-500/50 shadow-inner bg-emerald-500/5' : 'hover:border-emerald-500/20'}`}>
            <div className="flex-grow min-w-0 mr-4">
                <span className="text-[11px] uppercase text-emerald-600 dark:text-emerald-400 font-bold tracking-wider block mb-1.5 opacity-90">
                    {label}
                    {isItemCustom(categoryKey as CreativeCustomItemCategoryKey, value) && <UserIcon className="inline-block ml-1.5 mb-0.5 w-3.5 h-3.5 text-yellow-500" title="Custom Item"/>}
                </span>
                <span className="text-gray-900 dark:text-gray-100 text-sm md:text-base font-bold break-words leading-tight uppercase tracking-tight">
                    {value || (activeMode === 'record' ? <span className="text-gray-400 dark:text-gray-600 italic font-medium lowercase tracking-normal">Select below...</span> : '')}
                </span>
            </div>
            {activeMode === 'generate' && (
                <div className="flex items-center space-x-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                        onClick={onReroll} 
                        disabled={isGenerating || isLocked} 
                        variant="ghost" 
                        size="xs" 
                        className="p-2 text-gray-500 dark:text-gray-400 hover:text-emerald-500 transition-all active:scale-90"
                        title="Reroll this category"
                        startIcon={<RefreshIcon className="w-4 h-4"/>}
                    />
                    <Button 
                        onClick={onToggleLock} 
                        disabled={isGenerating} 
                        variant="ghost" 
                        size="xs" 
                        className={`p-2 rounded-xl transition-all active:scale-90 ${isLocked ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'text-gray-400 hover:text-emerald-500'}`}
                        title={isLocked ? "Unlock" : "Lock"}
                        startIcon={isLocked ? <LockClosedIcon className="w-4 h-4" /> : <LockOpenIcon className="w-4 h-4" />}
                    />
                </div>
            )}
        </div>
    );
  };
  

  return (
    <div className={`w-full ${uiMode === 'classic' ? 'text-gray-900 dark:text-white pb-20 px-4' : 'text-gray-900 dark:text-white'} animate-fadeIn`}>
      {uiMode === 'classic' ? (
        <header className="mb-10 text-center pt-8">
          <h1 className="text-2xl md:text-3xl font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-tight">
            Concept Blender
          </h1>
          <p className="mt-3 text-sm font-medium text-gray-700 dark:text-gray-300 max-w-3xl mx-auto text-center">
            Architectural Prompt Fusion • Neural Concept Mapping
          </p>
        </header>
      ) : (
        <header className="mb-2 md:mb-12 text-center pt-0 md:pt-4 px-4 animate-fadeIn">
          <h1 className="text-3xl sm:text-5xl md:text-7xl font-black uppercase tracking-tighter text-emerald-600 dark:text-emerald-500 leading-none italic drop-shadow-2xl mb-1 md:mb-4">Concept Blender</h1>
          <p className="mt-1 md:mt-4 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.4em] text-gray-500 dark:text-gray-400 max-w-xl mx-auto opacity-70">Architectural Prompt Fusion • Neural Concept Mapping</p>
        </header>
      )}

      <main className="w-full glass-card p-2 sm:p-6 md:p-10 border-white/10 text-gray-900 dark:text-gray-200 transition-all duration-500 animate-fadeIn overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[100px] pointer-events-none rounded-full"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 blur-[100px] pointer-events-none rounded-full"></div>
        
        {/* Mode Switcher */}
        <div className="flex justify-center mb-10 px-2">
            <div className="bg-slate-100 dark:bg-white/10 p-1.5 rounded-2xl flex flex-wrap justify-center border border-slate-200 dark:border-white/10 shadow-inner gap-1 sm:gap-0">
                <Button 
                    onClick={() => handleModeChange('generate')}
                    variant={activeMode === 'generate' ? 'primary' : 'ghost'}
                    size="md"
                    className={`px-4 sm:px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeMode === 'generate' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20' : 'text-gray-500 hover:text-gray-800 dark:hover:text-white border-none'}`}
                    startIcon={<RefreshIcon className="w-4 h-4"/>}
                >
                    Generate Mode
                </Button>
                <Button 
                    onClick={() => handleModeChange('record')}
                    variant={activeMode === 'record' ? 'primary' : 'ghost'}
                    size="md"
                    className={`px-4 sm:px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center ${activeMode === 'record' ? 'bg-red-600 text-white shadow-lg shadow-red-500/20' : 'text-gray-500 hover:text-gray-800 dark:hover:text-white border-none'}`}
                    startIcon={<RecordIcon className="w-4 h-4"/>}
                >
                    Record New
                </Button>
            </div>
        </div>

        {activeMode === 'generate' && (
            <div className="flex flex-col lg:flex-row items-stretch gap-8 mb-12">
                
                {/* Optional Categories Box */}
                <div className="flex-1 glass-card border-slate-200 dark:border-white/10 p-6 bg-slate-50 dark:bg-white/5">
                     <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500 mb-6 text-center">Customize Your Blend</h3>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
                        <ToggleSwitch id="toggle-musicality" label="Musicality" checked={optionalCategoryToggles.includeMusicality} onChange={() => handleOptionalCategoryToggle('includeMusicality')} />
                        <ToggleSwitch id="toggle-conflict" label="Core Conflict" checked={optionalCategoryToggles.includeConflict} onChange={() => handleOptionalCategoryToggle('includeConflict')} />
                        <ToggleSwitch id="toggle-character" label="Character" checked={optionalCategoryToggles.includeCharacter} onChange={() => handleOptionalCategoryToggle('includeCharacter')} />
                        <ToggleSwitch id="toggle-setting" label="Setting" checked={optionalCategoryToggles.includeSetting} onChange={() => handleOptionalCategoryToggle('includeSetting')} />
                        <ToggleSwitch id="toggle-catalyst" label="Catalyst" checked={optionalCategoryToggles.includeCatalyst} onChange={() => handleOptionalCategoryToggle('includeCatalyst')} />
                    </div>
                </div>

                <div className="flex flex-col justify-center items-center gap-4">
                  <Button 
                    onClick={() => handleFullGenerate()} 
                    disabled={isGenerating} 
                    variant="primary"
                    size="lg"
                    className="w-full lg:w-auto font-black uppercase tracking-[0.2em] sm:min-w-[280px] shadow-[0_0_30px_rgba(16,185,129,0.2)]"
                    backgroundColor="#10b981"
                    loading={isGenerating}
                  >
                    Blend New Concept
                  </Button>
                  
                   <Button 
                    onClick={() => setManageCustomModalOpen(true)} 
                    variant="ghost"
                    size="sm"
                    className="text-[10px] uppercase font-black tracking-widest text-gray-400 hover:text-indigo-400 transition-colors border-white/5"
                    startIcon={<UserIcon className="w-4 h-4" />}
                  >
                    Manage My Repository
                  </Button>
                </div>
            </div>
        )}

        {activeMode === 'record' && (
            <div className="flex flex-col items-center mb-10">
                 <Button onClick={handleResetRecord} variant="danger" size="sm" className="font-black uppercase tracking-widest px-6 rounded-full">
                   Reset Recording
                 </Button>
            </div>
        )}

        {currentConcept && (
            <div className="relative p-4 sm:p-8 glass-card border-white/10 shadow-inner group/concept overflow-hidden">
                 <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-emerald-500 via-blue-500 to-purple-600 opacity-50"></div>
                 
                 <div className="flex flex-col sm:flex-row justify-between items-start gap-6 mb-10 pl-4">
                    <div>
                      <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none mb-1">Current Formula</h2>
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 opacity-60">ID: {currentConcept.id}</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full">
                        <Button 
                            onClick={() => handleCopyToClipboard(currentConcept, 'main')} 
                            disabled={!!copiedFeedback && copiedFeedback.type === 'main' && copiedFeedback.text === 'COPIED!'} 
                            variant="secondary"
                            size="md"
                            className="flex-grow font-black uppercase tracking-widest text-[10px] w-full sm:w-auto"
                            startIcon={<CopyIcon className="w-4 h-4" />}
                        >
                            {copiedFeedback && copiedFeedback.type === 'main' ? copiedFeedback.text : 'Copy to Clipboard'}
                        </Button>
                        <Button 
                            onClick={() => handleToggleFavorite(currentConcept, currentLockedCategories, optionalCategoryToggles)} 
                            variant="ghost" 
                            size="md" 
                            title={isFavorite(currentConcept.id) ? "Remove from Vault" : "Save to Neural Vault"}
                            startIcon={isFavorite(currentConcept.id) ? <StarIcon className="w-3.5 h-3.5 fill-current" /> : <StarIcon className="w-3.5 h-3.5" />}
                            className={`h-11 px-6 rounded-xl transition-all text-[10px] font-black uppercase tracking-widest w-full sm:w-auto ${isFavorite(currentConcept.id) ? 'bg-yellow-500 text-black shadow-[0_0_15px_rgba(234,179,8,0.3)] border-transparent' : 'bg-white/10 border border-white/10 text-gray-400 hover:text-white'}`}
                        >
                            {isFavorite(currentConcept.id) ? 'Saved' : 'Fav'}
                        </Button>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pl-4">
                    <ConceptCategoryDisplay label="Theme" value={currentConcept.theme} categoryKey="theme" isLocked={currentLockedCategories.theme} onToggleLock={() => toggleLock('theme')} onReroll={() => handleRerollCategory('theme')} />
                    <ConceptCategoryDisplay label="Style" value={currentConcept.style} categoryKey="style" isLocked={currentLockedCategories.style} onToggleLock={() => toggleLock('style')} onReroll={() => handleRerollCategory('style')} />
                    <ConceptCategoryDisplay label="Texture" value={currentConcept.texture} categoryKey="texture" isLocked={currentLockedCategories.texture} onToggleLock={() => toggleLock('texture')} onReroll={() => handleRerollCategory('texture')} />
                    
                    <ConceptCategoryDisplay label="Musicality" value={currentConcept.musicality} categoryKey="musicality" isOptional isLocked={currentLockedCategories.musicality} onToggleLock={() => toggleLock('musicality')} onReroll={() => handleRerollCategory('musicality')} />
                    <ConceptCategoryDisplay label="Conflict" value={currentConcept.conflict} categoryKey="conflict" isOptional isLocked={currentLockedCategories.conflict} onToggleLock={() => toggleLock('conflict')} onReroll={() => handleRerollCategory('conflict')} />
                    <ConceptCategoryDisplay label="Character" value={currentConcept.character} categoryKey="character" isOptional isLocked={currentLockedCategories.character} onToggleLock={() => toggleLock('character')} onReroll={() => handleRerollCategory('character')} />
                    <ConceptCategoryDisplay label="Setting" value={currentConcept.setting} categoryKey="setting" isOptional isLocked={currentLockedCategories.setting} onToggleLock={() => toggleLock('setting')} onReroll={() => handleRerollCategory('setting')} />
                    <ConceptCategoryDisplay label="Catalyst" value={currentConcept.catalyst} categoryKey="catalyst" isOptional isLocked={currentLockedCategories.catalyst} onToggleLock={() => toggleLock('catalyst')} onReroll={() => handleRerollCategory('catalyst')} />
                 </div>

                 {currentConcept.twist ? (
                    <div className="mt-8 ml-4 p-6 bg-purple-600/10 border border-purple-500/20 rounded-2xl animate-fadeIn relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-20">
                          <PlusCircleIcon className="w-12 h-12" />
                        </div>
                        <div className="flex justify-between items-center mb-4 relative z-10">
                             <h4 className="text-[10px] font-black text-purple-600 dark:text-purple-400 uppercase tracking-[0.3em]">The Catalyst Twist</h4>
                             {activeMode === 'generate' && (
                                <div className="flex space-x-1">
                                    <Button 
                                        onClick={() => handleRerollCategory('twist')} 
                                        disabled={isGenerating || currentLockedCategories.twist} 
                                        variant="ghost" 
                                        size="xs" 
                                        className="p-2 text-purple-400 hover:text-purple-300 transition-all active:scale-90"
                                        startIcon={<RefreshIcon className="w-4 h-4"/>}
                                    />
                                    <Button 
                                        onClick={() => toggleLock('twist')} 
                                        variant="ghost" 
                                        size="xs" 
                                        className={`p-2 rounded-xl transition-all active:scale-90 ${currentLockedCategories.twist ? 'text-purple-100 bg-purple-600 shadow-lg shadow-purple-500/20' : 'text-purple-400 hover:bg-purple-500/10'}`}
                                        startIcon={currentLockedCategories.twist ? <LockClosedIcon className="w-4 h-4" /> : <LockOpenIcon className="w-4 h-4" />}
                                    />
                                </div>
                             )}
                        </div>
                        <p className="text-xl text-purple-900 dark:text-purple-100 font-black uppercase tracking-tight italic leading-tight relative z-10">"{currentConcept.twist}"</p>
                    </div>
                 ) : (
                    activeMode === 'generate' && (
                        <div className="mt-8 ml-4 flex justify-center">
                            <Button onClick={handleAddTwist} variant="ghost" className="bg-purple-600/10 text-purple-600 hover:bg-purple-600 hover:text-white px-8 py-3 rounded-full text-xs font-black uppercase tracking-[0.2em] shadow-sm transition-all border border-purple-500/30" startIcon={<PlusCircleIcon className="w-4 h-4" />}>
                                Active Surprise Component
                            </Button>
                        </div>
                    )
                 )}
            </div>
        )}
        
        {activeMode === 'record' && (
            <ItemPalettes onItemSelect={handleRecordItemSelect} customItems={customItems} optionalToggles={optionalCategoryToggles} />
        )}

        {/* History & Favorites Section */}
        {(history.length > 0 || favorites.length > 0) && (
            <div className="mt-16 pt-12 border-t border-white/10">
                <div className="grid md:grid-cols-2 gap-10">
                     {/* History Column */}
                     <div className="space-y-6">
                        <div className="flex justify-between items-center px-2">
                            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-gray-500">Echo History</h3>
                            {history.length > 0 && (
                              <Button onClick={handleClearHistory} variant="ghost" size="xs" className="text-red-500 hover:bg-red-500/10 opacity-70 hover:opacity-100">
                                {getClearHistoryButtonText()}
                              </Button>
                            )}
                        </div>
                        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin">
                            {history.length === 0 ? <p className="text-gray-500 dark:text-gray-600 italic text-[10px] font-black uppercase tracking-widest text-center py-10 opacity-50">Empty static</p> : history.map((entry, idx) => (
                                <div key={entry.concept.id + idx} className="glass-card bg-slate-50 dark:bg-white/5 p-4 border-slate-200 dark:border-white/10 space-y-4 hover:border-emerald-500/20 transition-all">
                                    <p className="text-xs font-bold text-gray-700 dark:text-gray-300 leading-relaxed uppercase tracking-tight line-clamp-3">{formatConceptForClipboard(entry.concept)}</p>
                                    <div className="flex gap-2">
                                        <Button onClick={() => handleLoadSavedConcept(entry)} size="xs" variant="ghost" className="bg-blue-600/10 text-blue-600 hover:bg-blue-600 hover:text-white px-4 border-none" startIcon={<LoadIcon className="w-3 h-3" />}>Load</Button>
                                        <Button onClick={() => handleCopyToClipboard(entry.concept, 'history')} size="xs" variant="ghost" className="bg-white/10 text-gray-400 hover:bg-white/20 px-4 border-none" startIcon={<CopyIcon className="w-3 h-3" />}>Copy</Button>
                                        <Button onClick={() => handleToggleFavorite(entry.concept, entry.lockedCategories, entry.optionalCategoryToggles)} size="xs" variant="ghost" className={`px-4 border-none transition-all ${isFavorite(entry.concept.id) ? 'bg-yellow-500/20 text-yellow-500' : 'bg-gray-500/10 text-gray-500 hover:bg-yellow-500/10 hover:text-yellow-500'}`} startIcon={<StarIcon className={`w-3 h-3 ${isFavorite(entry.concept.id) ? 'fill-current' : ''}`} />}>
                                            {isFavorite(entry.concept.id) ? 'Vaulted' : 'Vault'}
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                     </div>
                     
                     {/* Favorites Column */}
                     <div className="space-y-6">
                         <div className="flex justify-between items-center px-2">
                            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-yellow-600 dark:text-yellow-500">Vault Concepts</h3>
                            <Button onClick={() => setShowFavoritesView(!showFavoritesView)} variant="ghost" size="xs" className="text-[10px] font-black uppercase tracking-widest text-blue-500/70 hover:text-blue-400 py-1 transition-all"> {showFavoritesView ? 'Compact' : 'Expand'} </Button>
                        </div>
                        {showFavoritesView && (
                            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin">
                                {favorites.length === 0 ? <p className="text-gray-500 dark:text-gray-600 italic text-[10px] font-black uppercase tracking-widest text-center py-10 opacity-50">Vault is sealed</p> : favorites.map((entry) => (
                                    <div key={entry.concept.id} className="glass-card bg-yellow-500/5 dark:bg-yellow-500/5 p-4 border-yellow-500/20 space-y-4 hover:border-yellow-500/40 transition-all">
                                        <p className="text-xs font-black text-gray-800 dark:text-gray-200 leading-relaxed uppercase tracking-tight line-clamp-4">{formatConceptForClipboard(entry.concept)}</p>
                                        {editingNoteForId === entry.concept.id ? (
                                            <div className="flex gap-2 items-center">
                                                <input 
                                                  ref={noteInputRef} 
                                                  type="text" 
                                                  defaultValue={entry.note || ''} 
                                                  onChange={(e) => handleNoteChange(entry.concept.id, e.target.value)} 
                                                  onKeyDown={(e) => e.key === 'Enter' && handleSaveNote(entry.concept.id)} 
                                                  onBlur={() => setTimeout(() => { if (document.activeElement !== noteInputRef.current) handleSaveNote(entry.concept.id); }, 100)} 
                                                  className="flex-grow px-3 py-1.5 text-xs bg-white/10 border border-white/5 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-bold" 
                                                  placeholder="Add track note..."
                                                />
                                                <Button onClick={() => handleSaveNote(entry.concept.id)} size="xs" variant="success" className="px-3">Save</Button>
                                            </div>
                                        ) : (
                                            entry.note && <p className="text-[10px] font-bold text-yellow-600 dark:text-yellow-500 italic bg-yellow-500/10 p-2 rounded-xl cursor-pointer hover:bg-yellow-500/20 transition-all" onClick={() => setEditingNoteForId(entry.concept.id)}>// {entry.note}</p>
                                        )}
                                        <div className="flex flex-wrap gap-2">
                                            <Button onClick={() => handleLoadSavedConcept(entry)} size="xs" variant="ghost" className="bg-blue-600/10 text-blue-600 hover:bg-blue-600 hover:text-white px-3 flex-1 border-none" startIcon={<LoadIcon className="w-3 h-3" />}>Load</Button>
                                            <Button onClick={() => handleCopyToClipboard(entry.concept, 'favorite')} size="xs" variant="ghost" className="bg-white/10 text-gray-400 hover:bg-white/20 px-3 flex-1 border-none" startIcon={<CopyIcon className="w-3 h-3" />}>Copy</Button>
                                            <Button onClick={() => setEditingNoteForId(entry.concept.id)} size="xs" variant="ghost" className="bg-teal-600/10 text-teal-600 hover:bg-teal-600 hover:text-white px-3 flex-1 border-none" startIcon={<NoteIcon className="w-3 h-3"/>}>Note</Button>
                                            <Button onClick={() => handleToggleFavorite(entry.concept, entry.lockedCategories, entry.optionalCategoryToggles)} size="xs" variant="ghost" className="bg-red-600/10 text-red-600 hover:bg-red-600 hover:text-white px-3 flex-1 border-none" startIcon={<TrashIcon className="w-3 h-3" />}>Del</Button>
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
      
      <AddCustomItemModal isOpen={showAddCustomItemModal} category={customItemCategory} value={customItemValue} setValue={setCustomItemValue} onSave={handleSaveCustomItem} onClose={() => setShowAddCustomItemModal(false)} />
      <ManageCustomItemsModal isOpen={manageCustomModalOpen} customItems={customItems} onDelete={handleDeleteCustomItem} onClose={() => setManageCustomModalOpen(false)} onExport={handleExportCustomItems} onImportFileSelected={handleImportFileSelected} importStatusMessage={importStatusMessage} fileInputRef={fileInputRef} />
      <ImportConfirmationModal isOpen={importConfirmationModalOpen} onClose={() => { setImportConfirmationModalOpen(false); setImportedCustomItemsData(null); }} onConfirmImport={processImport} />
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
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div className="glass-card p-8 border-white/20 shadow-2xl w-full max-w-md relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-[50px] pointer-events-none rounded-full"></div>
                <h3 className="text-xl font-black uppercase tracking-tighter text-gray-900 dark:text-white mb-6">Forge Item into <span className="text-emerald-600 dark:text-emerald-500">{category}</span></h3>
                <input 
                  type="text" 
                  value={value} 
                  onChange={(e) => setValue(e.target.value)} 
                  className="w-full px-4 py-3 bg-white/5 dark:bg-black/40 border border-white/10 rounded-2xl text-gray-900 dark:text-white mb-6 focus:ring-2 focus:ring-emerald-500/50 outline-none font-bold" 
                  placeholder="Blueprint input..." 
                  aria-label="Custom item value"
                />
                <div className="flex justify-end gap-3"> 
                  <Button onClick={onClose} variant="ghost" className="font-black uppercase tracking-widest text-gray-500">Cancel</Button> 
                  <Button onClick={onSave} variant="primary" backgroundColor="#10b981" className="font-black uppercase tracking-widest px-8">Save Item</Button> 
                </div>
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
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div className="glass-card p-10 border-white/20 shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-[50px] pointer-events-none rounded-full"></div>
                <h3 className="text-2xl font-black uppercase tracking-tighter text-gray-900 dark:text-white mb-8">Repository Core</h3>
                <div className="overflow-y-auto pr-4 scrollbar-thin flex-grow space-y-6">
                    {customItemEntries.filter(([_, items]) => items.length > 0).length === 0 ? ( 
                      <p className="text-gray-500 dark:text-gray-600 italic font-black text-center py-12 uppercase tracking-widest opacity-50">Local storage empty</p> 
                    ) : (
                        customItemEntries.map(([catKey, items]) => items.length > 0 && (
                            <div key={catKey} className="space-y-4">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-700 dark:text-emerald-500 border-b border-white/5 pb-2">{catKey}</h4>
                                <ul className="space-y-2"> 
                                  {items.map(item => ( 
                                    <li key={item} className="text-xs font-bold text-gray-800 dark:text-gray-300 flex justify-between items-center group/item hover:bg-white/5 p-2 rounded-xl transition-all"> 
                                      <span className="truncate">{item}</span> 
                                      <Button 
                                        onClick={() => onDelete(catKey, item)} 
                                        variant="ghost" 
                                        size="xs" 
                                        className="ml-2 p-1.5 text-red-500/30 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover/item:opacity-100" 
                                        aria-label={`Delete ${item}`}
                                        startIcon={<TrashIcon className="w-3.5 h-3.5"/>}
                                      />
                                    </li> 
                                  ))} 
                                </ul>
                            </div>
                        ))
                    )}
                </div>
                {importStatusMessage && <p className={`text-[10px] font-black uppercase tracking-widest mt-4 text-center ${importStatusMessage.includes("Error") ? 'text-red-500' : 'text-emerald-600 dark:text-emerald-400'}`}>{importStatusMessage}</p>}
                <div className="mt-8 pt-8 border-t border-white/10 space-y-4">
                    <div className="flex gap-3">
                        <input type="file" ref={fileInputRef} onChange={onImportFileSelected} accept=".json" style={{display: 'none'}} id="import-custom-items-file"/>
                        <Button onClick={onExport} variant="ghost" className="flex-1 font-black uppercase tracking-widest bg-blue-600/10 text-blue-600 hover:bg-blue-600 hover:text-white" startIcon={<ExportIcon />}>Export</Button>
                        <label htmlFor="import-custom-items-file" className="flex-1 inline-flex items-center justify-center p-2.5 bg-teal-600/10 text-teal-600 hover:bg-teal-600 hover:text-white rounded-lg border border-teal-500/20 cursor-pointer text-[10px] font-black uppercase tracking-widest transition-all">
                          <ImportIcon className="w-4 h-4 mr-2"/>Import
                        </label>
                    </div>
                    <Button onClick={onClose} variant="ghost" className="w-full font-black uppercase tracking-widest text-gray-500 hover:bg-white/10 transition-all">Close Control Panel</Button>
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
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-[60] p-4 animate-fadeIn">
            <div className="glass-card p-10 border-white/20 shadow-2xl w-full max-w-md relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 blur-[50px] pointer-events-none rounded-full"></div>
                <h3 className="text-2xl font-black uppercase tracking-tighter text-gray-900 dark:text-white mb-6">Transmission Received</h3>
                <p className="text-xs font-bold text-gray-700 dark:text-gray-400 mb-8 uppercase tracking-widest leading-loose">A valid custom library blueprint has been detected. Select protocol:</p>
                <div className="flex flex-col gap-3">
                    <Button onClick={() => onConfirmImport('merge')} variant="success" size="lg" className="font-black uppercase tracking-widest">Merge Streams</Button>
                    <Button onClick={() => onConfirmImport('replace')} variant="danger" size="lg" className="font-black uppercase tracking-widest">Override All Data</Button>
                    <Button onClick={onClose} variant="ghost" className="mt-4 font-black uppercase tracking-widest text-gray-500">Abort Import</Button>
                </div>
            </div>
        </div>
    );
};
