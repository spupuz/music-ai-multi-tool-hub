

import React, { useState, useCallback, useEffect, useRef } from 'react';
import type { ToolProps } from '@/Layout';
import { useRandomMusicStyle } from '@/hooks/useRandomMusicStyle';
import { AddCustomItemModal, ManageCustomItemsModal, ImportConfirmationModal, CategoryItemDisplay, ToggleSwitch } from './RandomMusicStyleGenerator.uiComponents';
import Spinner from '@/components/Spinner';
import Button from '@/components/common/Button';
import { SunoPromptIcon, CopyIcon, StarEmptyIcon, StarFilledIcon, NoteIcon, PlusCircleIcon, TagIcon, UserIcon } from './RandomMusicStyleGenerator.icons';
import type { SavedStyleEntry } from '@/types';


const RandomMusicStyleGenerator: React.FC<ToolProps> = ({ trackLocalEvent }) => {
  const {
    currentStyle,
    currentLockedCategories,
    isGenerating,
    sunoPromptMode,
    setSunoPromptMode,
    copiedFeedback,
    copiedTagsFeedback,
    history,
    favorites,
    showFavoritesView,
    setShowFavoritesView,
    editingNoteForId,
    setEditingNoteForId,
    noteInputRef,
    clearHistoryClickCount,
    clearHistoryTimeoutRef,
    customItems,
    showAddCustomItemModal,
    setShowAddCustomItemModal,
    customItemCategory,
    setCustomItemCategory,
    customItemValue,
    setCustomItemValue,
    manageCustomModalOpen,
    setManageCustomModalOpen,
    importConfirmationModalOpen,
    setImportConfirmationModalOpen,
    importedCustomItemsData,
    setImportedCustomItemsData,
    importStatusMessage,
    setImportStatusMessage,
    fileInputRef,
    optionalCategoryToggles,
    categoryIntensity,
    handleSetCategoryIntensity,
    handleFullGenerate,
    handleRerollCategory,
    toggleLock,
    handleCopyToClipboard,
    handleCopyTags,
    handleToggleFavorite,
    isFavorite,
    handleLoadSavedStyle,
    handleClearHistory,
    handleNoteChange,
    handleSaveNote,
    openAddCustomItemModal,
    handleSaveCustomItem,
    handleDeleteCustomItem,
    isItemCustom,
    handleOptionalCategoryToggle,
    handleExportCustomItems,
    handleImportFileSelected,
    processImport,
    getClearHistoryButtonText,
    formatStyleForSuno,
    formatStyleForDisplay,
    TOOL_CATEGORY
  } = useRandomMusicStyle(trackLocalEvent);


  useEffect(() => {
    // Initial generation call from the hook will be handled internally if needed
  }, [currentStyle, handleFullGenerate]);


  const RenderSavedItemActions: React.FC<{ item: SavedStyleEntry, itemType: 'history' | 'favorite' }> = ({ item, itemType }) => {
    const styleToUse = item.style;
    const locksToUse = item.lockedCategories;
    const optionalTogglesToUse = item.optionalCategoryToggles;
    const intensityToUse = item.categoryIntensity;

    return (
      <div className="flex gap-2 mt-3">
        <Button onClick={() => handleLoadSavedStyle(item)} variant="ghost" size="xs" className="text-[9px] font-black uppercase tracking-widest px-3 border-emerald-500/20 hover:bg-emerald-500/10 text-emerald-500">Load</Button>
        {itemType === 'history' && (
          <Button onClick={() => handleToggleFavorite(styleToUse, locksToUse, optionalTogglesToUse, intensityToUse)} variant="ghost" size="xs" className={`text-[9px] font-black uppercase tracking-widest px-3 border-white/10 ${isFavorite(styleToUse.id) ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' : 'bg-white/5 text-gray-400 hover:text-white'}`}>
            {isFavorite(styleToUse.id) ? 'Unfav' : 'Fav'}
          </Button>
        )}
        {itemType === 'favorite' && (
          <>
            <Button onClick={() => setEditingNoteForId(styleToUse.id)} variant="ghost" size="xs" className="text-[9px] font-black uppercase tracking-widest px-3 bg-white/5 border-white/10 text-gray-400 hover:text-white flex items-center"><NoteIcon className="w-3 h-3 mr-1" /> Note</Button>
            <Button onClick={() => handleToggleFavorite(styleToUse, locksToUse, optionalTogglesToUse, intensityToUse)} variant="ghost" size="xs" className="text-[9px] font-black uppercase tracking-widest px-3 bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all">Delete</Button>
          </>
        )}
      </div>
    );
  };


  return (
    <div className="w-full max-w-5xl mx-auto glass-card p-2 sm:p-6 md:p-10 border-white/10 text-gray-900 dark:text-gray-200 flex flex-col transition-all duration-500 animate-fadeIn overflow-hidden">
      <header className="mb-2 md:mb-12 text-center pt-0 md:pt-4 px-4 animate-fadeIn">
        <h1 className="text-lg sm:text-4xl md:text-6xl font-black uppercase tracking-tighter text-emerald-600 dark:text-emerald-500 leading-none italic drop-shadow-2xl mb-1 md:mb-4">Style Architect</h1>
        <p className="mt-1 md:mt-4 text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.4em] text-gray-500 dark:text-gray-400 max-w-xl mx-auto opacity-70">
            Aesthetic Fusion Core • Generate high-variance musical prompts
        </p>
      </header>
      <main className="w-full max-w-full glass-card p-2 sm:p-8 md:p-12 border-white/10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 blur-[100px] pointer-events-none"></div>
        <div className="flex flex-col items-center">
          <Button 
            onClick={handleFullGenerate} 
            disabled={isGenerating} 
            variant="primary"
            size="lg"
            className="w-full md:w-auto h-16 px-12 font-black uppercase tracking-[0.3em] text-sm shadow-[0_0_50px_rgba(34,197,94,0.3)] active:scale-95 transition-all"
          >
            {isGenerating && !currentStyle ? <><Spinner size="w-6 h-6 mr-3" color="text-black" />SYNCHRONIZING...</> : isGenerating ? <><Spinner size="w-6 h-6 mr-3" color="text-black" />RE-SYNCHING...</> : 'INITIATE SYNTHESIS'}
          </Button>

          <div className="mt-10 w-full max-w-xl p-6 bg-black/20 rounded-3xl border border-white/5 transition-all">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500 mb-6 text-center opacity-80">Advanced Logic Controllers</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
              <ToggleSwitch id="toggle-era" label="Era Matrix" checked={optionalCategoryToggles.includeEra} onChange={() => handleOptionalCategoryToggle('includeEra')} />
              <ToggleSwitch id="toggle-prodstyle" label="Production Grid" checked={optionalCategoryToggles.includeProductionStyle} onChange={() => handleOptionalCategoryToggle('includeProductionStyle')} />
              <ToggleSwitch id="toggle-keymode" label="Harmonic Lock" checked={optionalCategoryToggles.includeKeyModeSuggestion} onChange={() => handleOptionalCategoryToggle('includeKeyModeSuggestion')} />
              <ToggleSwitch id="toggle-purpose" label="Utility Context" checked={optionalCategoryToggles.includePurpose} onChange={() => handleOptionalCategoryToggle('includePurpose')} />
              <ToggleSwitch id="toggle-influence" label="Neural Influence" checked={optionalCategoryToggles.includeInfluence} onChange={() => handleOptionalCategoryToggle('includeInfluence')} />
              <ToggleSwitch id="toggle-sfx" label="FX Frequency" checked={optionalCategoryToggles.includeSoundDesignFocus} onChange={() => handleOptionalCategoryToggle('includeSoundDesignFocus')} />
            </div>
          </div>

          {currentStyle && !isGenerating && (
            <div className="mt-8 w-full bg-gray-100 dark:bg-gray-850 p-4 sm:p-6 rounded-lg border border-gray-200 dark:border-gray-700 transition-colors duration-300">
              <div className="flex flex-col sm:flex-row justify-between items-center mb-8 pb-6 border-b border-white/5 gap-6">
                <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-emerald-500 mb-0 whitespace-nowrap">Active Archetype:</h2>
                  <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                    <div className="flex items-center gap-3 justify-center w-full sm:w-auto">
                      <Button 
                        onClick={() => handleToggleFavorite(currentStyle, currentLockedCategories, optionalCategoryToggles, categoryIntensity)} 
                        variant="ghost" 
                        size="sm" 
                        startIcon={isFavorite(currentStyle.id) ? <StarFilledIcon /> : <StarEmptyIcon />}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all flex-shrink-0 ${isFavorite(currentStyle.id) ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/20' : 'bg-white/5 border-white/10 text-gray-500 hover:text-white hover:bg-white/10'}`} 
                        aria-label={isFavorite(currentStyle.id) ? "Remove from favorites" : "Add to favorites"}
                      />
                      <Button 
                        onClick={() => { setSunoPromptMode(!sunoPromptMode); trackLocalEvent(TOOL_CATEGORY, 'sunoModeToggled', !sunoPromptMode ? 'on' : 'off', 1); }} 
                        variant="ghost" 
                        size="sm" 
                        startIcon={<SunoPromptIcon className="w-3.5 h-3.5" />}
                        className={`flex-1 sm:flex-none text-[9px] font-black uppercase tracking-widest px-4 border-white/10 h-10 rounded-xl transition-all ${sunoPromptMode ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20 border-transparent hover:bg-emerald-400' : 'bg-white/5 text-gray-400 hover:text-white'} whitespace-nowrap`} 
                        title={sunoPromptMode ? "Switch to Full Style View to see controls" : "Switch to Suno Prompt View for copying"}
                      >
                        {sunoPromptMode ? 'Mode: Prompt' : 'Mode: Full'}
                      </Button>
                    </div>
                    <div className="flex items-center gap-3 justify-center w-full sm:w-auto">
                      <Button 
                        onClick={handleCopyTags} 
                        variant="ghost" 
                        size="sm" 
                        startIcon={<TagIcon className="w-3.5 h-3.5" />}
                        className="flex-1 sm:flex-none text-[9px] font-black uppercase tracking-widest px-4 bg-white/5 border-white/10 text-gray-400 hover:text-white h-10 rounded-xl transition-all whitespace-nowrap" 
                        disabled={!!copiedTagsFeedback}
                      >
                         {copiedTagsFeedback || 'COPY TAGS'}
                      </Button>
                      <Button 
                        onClick={handleCopyToClipboard} 
                        variant="ghost" 
                        size="sm" 
                        startIcon={<CopyIcon className="w-3.5 h-3.5" />}
                        className="flex-1 sm:flex-none text-[9px] font-black uppercase tracking-widest px-4 bg-white/5 border-white/10 text-gray-400 hover:text-white h-10 rounded-xl transition-all whitespace-nowrap" 
                        disabled={!!copiedFeedback}
                      >
                        {copiedFeedback || 'COPY ALL'}
                      </Button>
                    </div>
                  </div>
              </div>


              {sunoPromptMode ? (
                <p className="text-md text-gray-800 dark:text-gray-100 bg-gray-200 dark:bg-gray-700 p-3 rounded-md font-mono break-words min-h-[60px]">{formatStyleForSuno(currentStyle)}</p>
              ) : (
                <div className="space-y-2.5">
                  <CategoryItemDisplay categoryName="Genres" value={currentStyle.genres} categoryKey="genres" isOptionalCategoryOn={true} sunoPromptMode={sunoPromptMode} isLocked={currentLockedCategories.genres} isItemCustom={isItemCustom} onReroll={handleRerollCategory} onLockToggle={toggleLock} onOpenAddCustomItemModal={openAddCustomItemModal} cardDisabled={isGenerating} categoryIntensity={categoryIntensity} onSetCategoryIntensity={handleSetCategoryIntensity} />
                  <CategoryItemDisplay categoryName="Moods" value={currentStyle.moods} categoryKey="moods" isOptionalCategoryOn={true} sunoPromptMode={sunoPromptMode} isLocked={currentLockedCategories.moods} isItemCustom={isItemCustom} onReroll={handleRerollCategory} onLockToggle={toggleLock} onOpenAddCustomItemModal={openAddCustomItemModal} cardDisabled={isGenerating} categoryIntensity={categoryIntensity} onSetCategoryIntensity={handleSetCategoryIntensity} />
                  <CategoryItemDisplay categoryName="Tempo" value={currentStyle.tempo} categoryKey="tempo" isOptionalCategoryOn={true} sunoPromptMode={sunoPromptMode} isLocked={currentLockedCategories.tempo} isItemCustom={isItemCustom} onReroll={handleRerollCategory} onLockToggle={toggleLock} onOpenAddCustomItemModal={openAddCustomItemModal} cardDisabled={isGenerating} />
                  <CategoryItemDisplay categoryName="Instrumentations" value={currentStyle.instrumentations} categoryKey="instrumentations" isOptionalCategoryOn={true} sunoPromptMode={sunoPromptMode} isLocked={currentLockedCategories.instrumentations} isItemCustom={isItemCustom} onReroll={handleRerollCategory} onLockToggle={toggleLock} onOpenAddCustomItemModal={openAddCustomItemModal} cardDisabled={isGenerating} categoryIntensity={categoryIntensity} onSetCategoryIntensity={handleSetCategoryIntensity} />
                  <CategoryItemDisplay categoryName="Defining Qualities" value={currentStyle.qualities} categoryKey="qualities" isOptionalCategoryOn={true} sunoPromptMode={sunoPromptMode} isLocked={currentLockedCategories.qualities} isItemCustom={isItemCustom} onReroll={handleRerollCategory} onLockToggle={toggleLock} onOpenAddCustomItemModal={openAddCustomItemModal} cardDisabled={isGenerating} categoryIntensity={categoryIntensity} onSetCategoryIntensity={handleSetCategoryIntensity} />

                  <CategoryItemDisplay categoryName="Era / Decade" value={currentStyle.era} categoryKey="era" isOptionalCategoryOn={optionalCategoryToggles.includeEra} sunoPromptMode={sunoPromptMode} isLocked={currentLockedCategories.era} isItemCustom={isItemCustom} onReroll={handleRerollCategory} onLockToggle={toggleLock} onOpenAddCustomItemModal={openAddCustomItemModal} cardDisabled={isGenerating} />
                  <CategoryItemDisplay categoryName="Production Style" value={currentStyle.productionStyle} categoryKey="productionStyle" isOptionalCategoryOn={optionalCategoryToggles.includeProductionStyle} sunoPromptMode={sunoPromptMode} isLocked={currentLockedCategories.productionStyle} isItemCustom={isItemCustom} onReroll={handleRerollCategory} onLockToggle={toggleLock} onOpenAddCustomItemModal={openAddCustomItemModal} cardDisabled={isGenerating} />
                  <CategoryItemDisplay categoryName="Musical Key / Mode Suggestion" value={currentStyle.keyModeSuggestion} categoryKey="keyModeSuggestion" isOptionalCategoryOn={optionalCategoryToggles.includeKeyModeSuggestion} sunoPromptMode={sunoPromptMode} isLocked={currentLockedCategories.keyModeSuggestion} isItemCustom={isItemCustom} onReroll={handleRerollCategory} onLockToggle={toggleLock} onOpenAddCustomItemModal={openAddCustomItemModal} cardDisabled={isGenerating} />
                  <CategoryItemDisplay categoryName="Purpose / Use Case" value={currentStyle.purpose} categoryKey="purpose" isOptionalCategoryOn={optionalCategoryToggles.includePurpose} sunoPromptMode={sunoPromptMode} isLocked={currentLockedCategories.purpose} isItemCustom={isItemCustom} onReroll={handleRerollCategory} onLockToggle={toggleLock} onOpenAddCustomItemModal={openAddCustomItemModal} cardDisabled={isGenerating} />
                  <CategoryItemDisplay categoryName="Influence / Sounds Like" value={currentStyle.influence} categoryKey="influence" isOptionalCategoryOn={optionalCategoryToggles.includeInfluence} sunoPromptMode={sunoPromptMode} isLocked={currentLockedCategories.influence} isItemCustom={isItemCustom} onReroll={handleRerollCategory} onLockToggle={toggleLock} onOpenAddCustomItemModal={openAddCustomItemModal} cardDisabled={isGenerating} />
                  <CategoryItemDisplay categoryName="Sound Design & FX Focus" value={currentStyle.soundDesignFocus} categoryKey="soundDesignFocus" isOptionalCategoryOn={optionalCategoryToggles.includeSoundDesignFocus} sunoPromptMode={sunoPromptMode} isLocked={currentLockedCategories.soundDesignFocus} isItemCustom={isItemCustom} onReroll={handleRerollCategory} onLockToggle={toggleLock} onOpenAddCustomItemModal={openAddCustomItemModal} cardDisabled={isGenerating} />
                </div>
              )}
            </div>
          )}
          {!sunoPromptMode && (
            <div className="mt-12 pt-8 border-t border-white/5 w-full flex justify-center">
              <Button 
                onClick={() => setManageCustomModalOpen(true)} 
                variant="ghost" 
                size="md" 
                startIcon={<UserIcon className="w-5 h-5 opacity-60" />}
                className="py-4 px-10 bg-white/5 hover:bg-white/10 text-white rounded-2xl text-[11px] font-bold uppercase tracking-[0.3em] border border-white/5 transition-all shadow-2xl"
              >
                Custom Neural Parameters
              </Button>
            </div>
          )}
        </div>

        <AddCustomItemModal
          isOpen={showAddCustomItemModal}
          category={customItemCategory}
          value={customItemValue}
          setValue={setCustomItemValue}
          onSave={handleSaveCustomItem}
          onClose={() => setShowAddCustomItemModal(false)}
        />
        <ManageCustomItemsModal
          isOpen={manageCustomModalOpen}
          customItems={customItems}
          onDelete={handleDeleteCustomItem}
          onClose={() => setManageCustomModalOpen(false)}
          onExport={handleExportCustomItems}
          onImportFileSelected={handleImportFileSelected}
          importStatusMessage={importStatusMessage}
          fileInputRef={fileInputRef}
        />
        <ImportConfirmationModal
          isOpen={importConfirmationModalOpen}
          onClose={() => { setImportConfirmationModalOpen(false); setImportedCustomItemsData(null); }}
          onConfirmImport={processImport}
        />

        {(history.length > 0 || favorites.length > 0) && (
          <div className="mt-10 pt-6 border-t border-gray-300 dark:border-gray-700">
            <div className="grid md:grid-cols-2 gap-x-8">
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-emerald-500">History Vault</h3>
                  {history.length > 0 &&
                    <Button onClick={handleClearHistory} variant="ghost" size="xs" className="text-[8px] font-black uppercase tracking-widest text-red-500/60 hover:text-red-500 border-none underline underline-offset-4">
                      {getClearHistoryButtonText()}
                    </Button>
                  }
                </div>
                {history.length > 0 ? (
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-200 dark:scrollbar-track-gray-800">
                    {history.map(hEntry => (
                      <div key={hEntry.style.id} className="bg-white/5 p-4 rounded-2xl border border-white/5 group transition-all hover:bg-white-[0.07] hover:border-white/10">
                        <p className="text-gray-400 text-[11px] font-bold break-words line-clamp-2 leading-relaxed" title={formatStyleForDisplay(hEntry.style)}>{formatStyleForSuno(hEntry.style)}</p>
                        <RenderSavedItemActions item={hEntry} itemType="history" />
                      </div>
                    ))}
                  </div>
                ) : <p className="text-gray-500 dark:text-gray-500 italic text-sm">No recent styles yet.</p>}
              </div>
              <div>
                <Button 
                  onClick={() => setShowFavoritesView(!showFavoritesView)} 
                  variant="ghost" 
                  size="md"
                  className="w-full justify-between items-center p-0 h-auto hover:bg-transparent border-none"
                  aria-expanded={showFavoritesView}
                >
                  <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-emerald-500">Neural Favorites ({favorites.length})</h3>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={`w-4 h-4 text-emerald-500 transform transition-transform ${showFavoritesView ? 'rotate-180' : ''}`}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
                </Button>
                {showFavoritesView && (favorites.length > 0 ? (
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-200 dark:scrollbar-track-gray-800">
                    {favorites.map(fEntry => (
                      <div key={fEntry.style.id} className="bg-emerald-500/5 p-4 rounded-2xl border border-emerald-500/20 group transition-all">
                        <p className="text-gray-900 dark:text-white text-[11px] font-bold break-words line-clamp-2 leading-relaxed" title={formatStyleForDisplay(fEntry.style)}>{formatStyleForSuno(fEntry.style)}</p>
                        {editingNoteForId === fEntry.style.id ? (
                          <div className="flex gap-2 items-center my-3">
                            <input
                              ref={noteInputRef} type="text" defaultValue={fEntry.note || ''}
                              onChange={(e) => handleNoteChange(fEntry.style.id, e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && handleSaveNote(fEntry.style.id)}
                              onBlur={() => setTimeout(() => { if (document.activeElement !== noteInputRef.current) handleSaveNote(fEntry.style.id); }, 100)}
                              className="flex-grow px-3 py-2 text-[10px] bg-black/40 border border-white/10 rounded-xl focus:border-emerald-500/50 text-white outline-none font-bold"
                              placeholder="Add neural note..." aria-label={`Note for ${fEntry.style.genres.join(', ')}`}
                            />
                            <Button onClick={() => handleSaveNote(fEntry.style.id)} variant="primary" size="xs" className="text-[9px] font-black uppercase tracking-widest px-3 py-2 h-auto bg-emerald-500 text-black">Commit</Button>
                          </div>
                        ) : (fEntry.note && <p className="text-[9px] text-emerald-500 font-bold italic my-3 p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/10 break-words cursor-pointer hover:bg-emerald-500/20 transition-all" onClick={() => setEditingNoteForId(fEntry.style.id)}>{fEntry.note}</p>)}
                        <RenderSavedItemActions item={fEntry} itemType="favorite" />
                      </div>
                    ))}
                  </div>
                ) : <p className="text-gray-500 dark:text-gray-500 italic text-sm">No favorite styles saved yet.</p>)}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default RandomMusicStyleGenerator;
