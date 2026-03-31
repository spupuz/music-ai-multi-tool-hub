

import React, { useState, useCallback, useEffect, useRef } from 'react';
import type { ToolProps } from '@/Layout';
import { useRandomMusicStyle } from '@/hooks/useRandomMusicStyle';
import { AddCustomItemModal, ManageCustomItemsModal, ImportConfirmationModal, CategoryItemDisplay, ToggleSwitch } from './RandomMusicStyleGenerator.uiComponents';
import Spinner from '@/components/Spinner';
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
      <div className="flex gap-2 mt-1.5">
        <button onClick={() => handleLoadSavedStyle(item)} className="text-xs py-1 px-1.5 bg-blue-600 hover:bg-blue-500 rounded text-white shadow-sm">Load</button>
        {itemType === 'history' && (
          <button onClick={() => handleToggleFavorite(styleToUse, locksToUse, optionalTogglesToUse, intensityToUse)} className={`text-xs py-1 px-1.5 rounded text-white shadow-sm ${isFavorite(styleToUse.id) ? 'bg-yellow-600 hover:bg-yellow-500' : 'bg-gray-600 hover:bg-gray-500'}`}>
            {isFavorite(styleToUse.id) ? 'Unfav' : 'Fav'}
          </button>
        )}
        {itemType === 'favorite' && (
          <>
            <button onClick={() => setEditingNoteForId(styleToUse.id)} className="text-xs py-1 px-1.5 bg-teal-600 hover:bg-teal-500 rounded text-white shadow-sm flex items-center"><NoteIcon className="w-3 h-3 mr-1" /> Note</button>
            <button onClick={() => handleToggleFavorite(styleToUse, locksToUse, optionalTogglesToUse, intensityToUse)} className="text-xs py-1 px-1.5 bg-red-600 hover:bg-red-500 rounded text-white shadow-sm">Delete</button>
          </>
        )}
      </div>
    );
  };


  return (
    <div className="w-full">
      <header className="mb-10 text-center">
        <h1 className="text-5xl font-extrabold text-green-600 dark:text-green-400">Random Music Style Generator</h1>
        <p className="mt-3 text-md text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">Spark your musical imagination! Generate unique style combinations, lock elements you love, add your own custom items, and get Suno-ready prompts.</p>
      </header>
      <main className="w-full bg-white dark:bg-gray-900 shadow-2xl rounded-lg p-6 md:p-10 border-2 border-green-500 dark:border-green-600 transition-colors duration-300">
        <div className="flex flex-col items-center">
          <button onClick={handleFullGenerate} disabled={isGenerating} className="w-full md:w-auto flex justify-center items-center py-3 px-8 border border-transparent rounded-md shadow-sm text-lg font-medium text-black bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-400 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-900 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:text-gray-500 dark:disabled:text-gray-400 transition-colors">
            {isGenerating && !currentStyle ? <><Spinner size="w-6 h-6 mr-2" color="text-black" />GENERATING...</> : isGenerating ? <><Spinner size="w-6 h-6 mr-2" color="text-black" />RE-GENERATING...</> : 'GENERATE NEW STYLE'}
          </button>

          <div className="mt-6 w-full max-w-md p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 transition-colors duration-300">
            <h3 className="text-md font-semibold text-green-700 dark:text-green-300 mb-2 text-center">Advanced Category Options</h3>
            <div className="space-y-1">
              <ToggleSwitch id="toggle-era" label="Include Era / Decade" checked={optionalCategoryToggles.includeEra} onChange={() => handleOptionalCategoryToggle('includeEra')} />
              <ToggleSwitch id="toggle-prodstyle" label="Include Production Style" checked={optionalCategoryToggles.includeProductionStyle} onChange={() => handleOptionalCategoryToggle('includeProductionStyle')} />
              <ToggleSwitch id="toggle-keymode" label="Include Key / Mode Suggestion" checked={optionalCategoryToggles.includeKeyModeSuggestion} onChange={() => handleOptionalCategoryToggle('includeKeyModeSuggestion')} />
              <ToggleSwitch id="toggle-purpose" label="Include Purpose / Use Case" checked={optionalCategoryToggles.includePurpose} onChange={() => handleOptionalCategoryToggle('includePurpose')} />
              <ToggleSwitch id="toggle-influence" label="Include Influence / Sounds Like" checked={optionalCategoryToggles.includeInfluence} onChange={() => handleOptionalCategoryToggle('includeInfluence')} />
              <ToggleSwitch id="toggle-sfx" label="Include Sound Design & FX Focus" checked={optionalCategoryToggles.includeSoundDesignFocus} onChange={() => handleOptionalCategoryToggle('includeSoundDesignFocus')} />
            </div>
          </div>

          {currentStyle && !isGenerating && (
            <div className="mt-8 w-full bg-gray-100 dark:bg-gray-850 p-4 sm:p-6 rounded-lg border border-gray-200 dark:border-gray-700 transition-colors duration-300">
              <div className="flex flex-col sm:flex-row justify-between items-center mb-4 pb-3 border-b border-gray-300 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-green-700 dark:text-green-300 mb-2 sm:mb-0">Generated Style Combination:</h2>
                <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-end">
                  <button onClick={() => handleToggleFavorite(currentStyle, currentLockedCategories, optionalCategoryToggles, categoryIntensity)} className={`p-2 rounded-full transition-colors ${isFavorite(currentStyle.id) ? 'bg-yellow-500 text-black hover:bg-yellow-400' : 'bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-200 hover:bg-gray-400 dark:hover:bg-gray-600'}`} aria-label={isFavorite(currentStyle.id) ? "Remove from favorites" : "Add to favorites"}>
                    {isFavorite(currentStyle.id) ? <StarFilledIcon /> : <StarEmptyIcon />}
                  </button>
                  <button onClick={() => { setSunoPromptMode(!sunoPromptMode); trackLocalEvent(TOOL_CATEGORY, 'sunoModeToggled', !sunoPromptMode ? 'on' : 'off', 1); }} className={`flex items-center text-xs py-1.5 px-2.5 rounded-md font-medium transition-colors ${sunoPromptMode ? 'bg-blue-600 text-white hover:bg-blue-500' : 'bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-400 dark:hover:bg-gray-600'}`} title={sunoPromptMode ? "Switch to Full Style View to see controls" : "Switch to Suno Prompt View for copying"}>
                    <SunoPromptIcon className="w-3.5 h-3.5 mr-1.5" /> {sunoPromptMode ? 'View: Prompt' : 'View: Full'}
                  </button>
                  <button onClick={handleCopyTags} className="flex items-center text-xs py-1.5 px-2.5 bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md font-medium transition-colors" disabled={!!copiedTagsFeedback}>
                    <TagIcon className="w-3.5 h-3.5 mr-1.5" /> {copiedTagsFeedback || 'COPY TAGS'}
                  </button>
                  <button onClick={handleCopyToClipboard} className="flex items-center text-xs py-1.5 px-2.5 bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md font-medium transition-colors" disabled={!!copiedFeedback}>
                    <CopyIcon className="w-3.5 h-3.5 mr-1.5" /> {copiedFeedback || 'COPY ALL'}
                  </button>
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
            <div className="mt-6 pt-4 border-t border-gray-300 dark:border-gray-700 w-full flex justify-center">
              <button onClick={() => setManageCustomModalOpen(true)} className="py-2.5 px-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md text-sm font-medium shadow-lg transition-colors flex items-center gap-2">
                <UserIcon className="w-4 h-4" /> Manage My Custom Items
              </button>
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
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-xl font-semibold text-green-700 dark:text-green-400">Recent Styles ({history.length})</h3>
                  {history.length > 0 &&
                    <button onClick={handleClearHistory} className="py-1 px-2 text-xs bg-red-700 hover:bg-red-600 text-white rounded-md shadow-sm transition-colors">
                      {getClearHistoryButtonText()}
                    </button>
                  }
                </div>
                {history.length > 0 ? (
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-200 dark:scrollbar-track-gray-800">
                    {history.map(hEntry => (
                      <div key={hEntry.style.id} className="bg-gray-100 dark:bg-gray-800 p-2.5 rounded-md border border-gray-300 dark:border-gray-600 text-xs transition-colors duration-300">
                        <p className="text-gray-800 dark:text-gray-300 break-words truncate" title={formatStyleForDisplay(hEntry.style)}>{formatStyleForSuno(hEntry.style)}</p>
                        <RenderSavedItemActions item={hEntry} itemType="history" />
                      </div>
                    ))}
                  </div>
                ) : <p className="text-gray-500 dark:text-gray-500 italic text-sm">No recent styles yet.</p>}
              </div>
              <div>
                <button onClick={() => setShowFavoritesView(!showFavoritesView)} className="w-full text-left text-xl font-semibold text-green-700 dark:text-green-400 hover:text-green-600 dark:hover:text-green-300 mb-3 flex justify-between items-center" aria-expanded={showFavoritesView}>
                  My Favorite Styles ({favorites.length})
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-4 h-4 transform transition-transform ${showFavoritesView ? 'rotate-180' : ''}`}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
                </button>
                {showFavoritesView && (favorites.length > 0 ? (
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-200 dark:scrollbar-track-gray-800">
                    {favorites.map(fEntry => (
                      <div key={fEntry.style.id} className="bg-gray-100 dark:bg-gray-800 p-2.5 rounded-md border border-yellow-500 text-xs transition-colors duration-300">
                        <p className="text-gray-900 dark:text-gray-200 break-words mb-1" title={formatStyleForDisplay(fEntry.style)}>{formatStyleForSuno(fEntry.style)}</p>
                        {editingNoteForId === fEntry.style.id ? (
                          <div className="flex gap-1 items-center my-1">
                            <input
                              ref={noteInputRef} type="text" defaultValue={fEntry.note || ''}
                              onChange={(e) => handleNoteChange(fEntry.style.id, e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && handleSaveNote(fEntry.style.id)}
                              onBlur={() => setTimeout(() => { if (document.activeElement !== noteInputRef.current) handleSaveNote(fEntry.style.id); }, 100)}
                              className="flex-grow p-1 text-xs bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-500 rounded focus:ring-1 focus:ring-green-400 text-gray-900 dark:text-white"
                              placeholder="Add a note..." aria-label={`Note for ${fEntry.style.genres.join(', ')}`}
                            />
                            <button onClick={() => handleSaveNote(fEntry.style.id)} className="text-xs py-1 px-1.5 bg-green-600 hover:bg-green-500 rounded text-white">Save</button>
                          </div>
                        ) : (fEntry.note && <p className="text-xs text-yellow-600 dark:text-yellow-200 italic my-1 p-1 bg-yellow-100 dark:bg-gray-700 rounded break-words" onClick={() => setEditingNoteForId(fEntry.style.id)}>{fEntry.note}</p>)}
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
