
import React from 'react';
import type { LockableCategoryKey, CustomItemCategoryKey, CustomItemsState, IntensityLevel, MultiSelectItemCategoryKey } from '@/types';
import { LockOpenIcon, LockClosedIcon, PlusCircleIcon, UserIcon, TrashIcon, ExportIcon, ImportIcon, RefreshIcon } from './RandomMusicStyleGenerator.icons';
import Button from '@/components/common/Button';

interface CategoryItemDisplayProps {
  categoryName: string;
  value: string | string[] | undefined;
  categoryKey: LockableCategoryKey;
  isOptionalCategoryOn: boolean;
  sunoPromptMode: boolean;
  isLocked: boolean;
  isItemCustom: (categoryKey: CustomItemCategoryKey, itemValue: string) => boolean;
  onReroll: (categoryKey: LockableCategoryKey) => void;
  onLockToggle: (categoryKey: LockableCategoryKey) => void;
  onOpenAddCustomItemModal: (categoryKey: CustomItemCategoryKey) => void;
  cardDisabled: boolean;
  categoryIntensity?: Partial<Record<MultiSelectItemCategoryKey, IntensityLevel>>;
  onSetCategoryIntensity?: (categoryKey: MultiSelectItemCategoryKey, level: IntensityLevel) => void;
}

export const CategoryItemDisplay: React.FC<CategoryItemDisplayProps> = ({
  categoryName, value, categoryKey, isOptionalCategoryOn, sunoPromptMode,
  isLocked, isItemCustom, onReroll, onLockToggle, onOpenAddCustomItemModal, cardDisabled,
  categoryIntensity, onSetCategoryIntensity
}) => {
  if (sunoPromptMode && !isOptionalCategoryOn) return null;
  const isActuallyEmpty = !value || (Array.isArray(value) && value.length === 0);
  if (isActuallyEmpty && sunoPromptMode) return null;
  if (isActuallyEmpty && !isOptionalCategoryOn && !sunoPromptMode) return null;

  const displayValues = Array.isArray(value) ? value : (value ? [String(value)] : []);
  const effectiveCardDisabled = cardDisabled || (!isOptionalCategoryOn && !isLocked && !sunoPromptMode);
  
  const multiSelectCategories: MultiSelectItemCategoryKey[] = ['genres', 'moods', 'instrumentations', 'qualities'];
  const isMultiSelectCategory = multiSelectCategories.includes(categoryKey as MultiSelectItemCategoryKey);
  
  const currentIntensity = isMultiSelectCategory && categoryIntensity ? categoryIntensity[categoryKey as MultiSelectItemCategoryKey] : undefined;

  return (
    <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 bg-white/5 rounded-2xl border border-white/5 ${effectiveCardDisabled ? 'opacity-40 grayscale pointer-events-none' : 'hover:border-white/10 hover:bg-white-[0.07] shadow-xl'} transition-all group relative overflow-hidden gap-3 sm:gap-4`}>
      <div className="w-full sm:flex-grow z-10">
        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-500/80 mb-1.5 flex items-center">
          {categoryName.replace(/([A-Z])/g, ' $1').trim().replace('Sound Design Focus', 'Sound Design & FX Focus')}:
          {!sunoPromptMode && (
            <Button 
              onClick={() => onOpenAddCustomItemModal(categoryKey as CustomItemCategoryKey)} 
              variant="ghost" 
              size="xs" 
              className="ml-3 p-1 rounded-full bg-white/5 border-white/10 text-emerald-500 hover:bg-emerald-500 hover:text-black transition-all"
              aria-label={`Add custom ${categoryName}`} 
              disabled={effectiveCardDisabled}
              title={`Add custom item to ${categoryName}`}
            >
              <PlusCircleIcon className="w-3.5 h-3.5" />
            </Button>
          )}
        </span>
        {displayValues.length > 0 ? (
          <div className="flex flex-wrap items-center mt-1">
            {displayValues.map((val, index) => (
              <span key={index} className="text-gray-900 dark:text-white text-[12px] sm:text-[13px] font-bold tracking-tight py-0.5 px-0 mr-1.5 flex items-center">
                {val}
                {isItemCustom(categoryKey as CustomItemCategoryKey, val) && <UserIcon className="inline-block ml-2 w-3 h-3 text-emerald-400 opacity-80" title="Neural Override"/>}
                {index < displayValues.length - 1 && <span className="opacity-30 ml-1.5">/</span>}
              </span>
            ))}
          </div>
        ) : (
          <span className="text-white/30 text-[11px] font-bold tracking-tight mt-1 italic block">(Null Signal)</span>
        )}
      </div>
      {!sunoPromptMode && (
        <div className="flex items-center justify-end w-full sm:w-auto space-x-2 z-10 pt-2 sm:pt-0 border-t sm:border-none border-white/5">
          {isMultiSelectCategory && onSetCategoryIntensity && currentIntensity && (
            <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/5 mr-2">
              {(['simple', 'moderate', 'complex'] as IntensityLevel[]).map(level => (
                <Button
                  key={level}
                  onClick={() => onSetCategoryIntensity(categoryKey as MultiSelectItemCategoryKey, level)}
                  disabled={effectiveCardDisabled || (isLocked && isOptionalCategoryOn)}
                  variant="ghost"
                  size="xs"
                  className={`w-8 h-8 p-0 flex items-center justify-center text-[12px] rounded-lg font-bold transition-all uppercase
                              ${currentIntensity === level ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                  title={`Complexity: ${level === 'simple' ? 'Minimum' : level === 'moderate' ? 'Standard' : 'Maximum'}`}
                >
                  {level.charAt(0)}
                </Button>
              ))}
            </div>
          )}
           <Button 
            onClick={() => onReroll(categoryKey)}
            variant="ghost"
            size="sm"
            className="w-9 h-9 p-0 rounded-xl bg-white/5 border border-white/10 text-gray-500 hover:text-emerald-500 hover:border-emerald-500/30 transition-all border-none shadow-none"
            aria-label={`Re-roll ${categoryName}`}
            disabled={effectiveCardDisabled || (isLocked && isOptionalCategoryOn)}
            title={`Re-reroll Neural Cluster`}
            startIcon={<RefreshIcon className="w-4 h-4" />}
          />
          <Button 
            onClick={() => onLockToggle(categoryKey)} 
            variant="ghost"
            size="sm"
            className={`w-9 h-9 p-0 rounded-xl transition-all border-none ${isLocked && isOptionalCategoryOn ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20 hover:bg-emerald-400' : 'bg-white/5 border-white/10 text-gray-500 hover:text-white'}`} 
            aria-label={isLocked ? `Unlock ${categoryName}` : `Lock ${categoryName}`} 
            disabled={effectiveCardDisabled || (!isOptionalCategoryOn && !isLocked)}
            title={isLocked && isOptionalCategoryOn ? `Unlock Node` : `Lock Node`}
            startIcon={isLocked && isOptionalCategoryOn ? <LockClosedIcon className="w-4 h-4" /> : <LockOpenIcon className="w-4 h-4" />}
          />
        </div>
      )}
      <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/3 blur-[40px] pointer-events-none"></div>
    </div>
  );
};


export const AddCustomItemModal: React.FC<{
    isOpen: boolean;
    category: CustomItemCategoryKey | null;
    value: string;
    setValue: (val: string) => void;
    onSave: () => void;
    onClose: () => void;
}> = ({ isOpen, category, value, setValue, onSave, onClose }) => {
    if (!isOpen || !category) return null;
    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
            <div className="glass-card p-8 border-emerald-500/30 shadow-2xl w-full max-w-md relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500/50"></div>
                <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-emerald-500 mb-8 px-1">Override Node: {category.replace(/([A-Z])/g, ' $1').trim()}</h3>
                <input 
                    type="text" 
                    value={value} 
                    onChange={(e) => setValue(e.target.value)} 
                    className="w-full px-5 py-4 bg-black/40 border border-white/10 rounded-2xl text-white font-bold outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 transition-all mb-8 shadow-inner" 
                    placeholder="Enter neural data..." 
                    aria-label="Custom item value"
                    autoFocus
                />
                <div className="flex gap-4"> 
                    <Button onClick={onClose} variant="ghost" className="flex-1 py-4 h-auto rounded-2xl font-black uppercase tracking-widest text-[10px] border-white/10 text-gray-400 hover:text-white">Cancel</Button> 
                    <Button onClick={onSave} variant="primary" className="flex-1 py-4 h-auto rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-emerald-500/20 bg-emerald-500 text-black">Commit Node</Button> 
                </div>
            </div>
        </div>
    );
};

export const ManageCustomItemsModal: React.FC<{
    isOpen: boolean;
    customItems: CustomItemsState;
    onDelete: (category: CustomItemCategoryKey, item: string) => void;
    onClose: () => void;
    onExport: () => void;
    onImportFileSelected: (event: React.ChangeEvent<HTMLInputElement>) => void;
    importStatusMessage: string;
    fileInputRef: React.RefObject<HTMLInputElement>;
}> = ({ isOpen, customItems, onDelete, onClose, onExport, onImportFileSelected, importStatusMessage, fileInputRef }) => {
    if (!isOpen) return null;
    const customItemEntries = Object.entries(customItems) as [CustomItemCategoryKey, string[]][];

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
            <div className="glass-card p-0 border-emerald-500/30 shadow-2xl w-full max-w-xl max-h-[85vh] flex flex-col relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500/50"></div>
                <header className="p-8 pb-4">
                    <h3 className="text-[12px] font-black uppercase tracking-[0.4em] text-emerald-500 px-1">Neural Parameter Repository</h3>
                </header>
                
                <div className="overflow-y-auto px-8 pb-8 pt-2 scrollbar-thin scrollbar-thumb-emerald-500/20 scrollbar-track-transparent flex-grow">
                    {customItemEntries.filter(([_, items]) => items.length > 0).length === 0 ? ( 
                        <div className="py-12 text-center">
                            <p className="text-white/20 text-xs font-black uppercase tracking-widest italic">Node Repository Empty</p> 
                        </div>
                    ) : (
                        customItemEntries.map(([catKey, items]) => items.length > 0 && (
                            <div key={catKey} className="mb-8 last:mb-0">
                                <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-500/60 mb-3 px-1">{catKey.replace(/([A-Z])/g, ' $1').trim()}:</h4>
                                <div className="space-y-2"> 
                                    {items.map(item => ( 
                                        <div key={item} className="p-4 bg-white/5 border border-white/5 rounded-2xl flex justify-between items-center group hover:border-white/10 transition-all"> 
                                            <span className="text-[13px] font-bold text-gray-900 dark:text-white/80">{item}</span> 
                                            <Button onClick={() => onDelete(catKey, item)} variant="ghost" size="xs" className="w-8 h-8 p-0 rounded-xl text-red-500/40 hover:text-red-500 hover:bg-red-500/10 transition-all border-none" aria-label={`Delete ${item}`}> 
                                                <TrashIcon className="w-4 h-4"/> 
                                            </Button> 
                                        </div> 
                                    ))} 
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {importStatusMessage && (
                    <div className="px-8 pb-4">
                        <p className={`text-[10px] font-black uppercase tracking-widest text-center py-2 rounded-xl ${importStatusMessage.includes("Error") ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                            {importStatusMessage}
                        </p>
                    </div>
                )}

                <footer className="p-8 pt-6 border-t border-white/5 bg-black/40 space-y-4">
                    <div className="flex gap-4">
                         <input type="file" ref={fileInputRef} onChange={onImportFileSelected} accept=".json" style={{display: 'none'}} id="import-custom-items-file"/>
                        <Button 
                            onClick={onExport} 
                            variant="ghost" 
                            className="flex-1 py-4 h-auto rounded-2xl bg-white/5 border-white/10 text-emerald-500 font-black uppercase tracking-widest text-[9px] flex items-center justify-start gap-3 shadow-none"
                            startIcon={<ExportIcon className="w-4 h-4"/>}
                        >
                            Backup
                        </Button>
                        <label htmlFor="import-custom-items-file" className="flex-1 py-4 h-auto rounded-2xl bg-white/5 border-white/10 text-emerald-500 font-black uppercase tracking-widest text-[9px] flex items-center justify-start gap-3 cursor-pointer hover:bg-white/10 transition-all">
                            <ImportIcon className="w-4 h-4 ml-4"/> <span className="ml-0.5">Restore</span>
                        </label>
                    </div>
                    <Button onClick={onClose} variant="primary" className="w-full py-4 h-auto rounded-2xl font-black uppercase tracking-widest text-[10px] bg-emerald-500 text-black shadow-lg shadow-emerald-500/20">Exit Repository</Button>
                </footer>
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
         <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[110] p-4 animate-in fade-in duration-300">
            <div className="glass-card p-8 border-emerald-500/30 shadow-2xl w-full max-w-md relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500/50"></div>
                <h3 className="text-[12px] font-black uppercase tracking-[0.4em] text-emerald-500 mb-6 px-1 text-center">Neural Configuration Merge</h3>
                <p className="text-white/60 mb-8 text-[11px] font-bold text-center leading-relaxed">System has detected a valid parameter set. Choose integration protocol:</p>
                <div className="flex flex-col gap-4">
                    <Button onClick={() => onConfirmImport('merge')} variant="primary" className="py-4 h-auto rounded-2xl font-black uppercase tracking-widest text-[10px] bg-sky-600 text-white shadow-lg shadow-sky-600/20">Merge Streams</Button>
                    <Button onClick={() => onConfirmImport('replace')} variant="primary" className="py-4 h-auto rounded-2xl font-black uppercase tracking-widest text-[10px] bg-orange-600 text-white shadow-lg shadow-orange-600/20">Overwrite All</Button>
                    <Button onClick={onClose} variant="ghost" className="py-4 h-auto rounded-2xl font-black uppercase tracking-widest text-[10px] border-white/10 text-gray-400 hover:text-white">Cancel</Button>
                </div>
            </div>
        </div>
    );
};

export const ToggleSwitch: React.FC<{ id: string; label: string; checked: boolean; onChange: () => void; }> = ({ id, label, checked, onChange }) => (
    <div className="flex items-center justify-between py-2 group cursor-pointer" onClick={onChange}>
        <label htmlFor={id} className="text-[11px] font-black uppercase tracking-widest text-white/60 group-hover:text-white/90 transition-colors pointer-events-none">{label}</label>
        <div 
            className={`relative inline-flex items-center h-6 rounded-full w-11 transition-all ${checked ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'bg-white/10 border border-white/10'}`}
        >
            <span className={`${checked ? 'translate-x-6' : 'translate-x-1'} inline-block w-4 h-4 transform bg-white rounded-full transition-transform shadow-sm ${checked ? 'text-emerald-600' : ''}`} />
        </div>
    </div>
);
