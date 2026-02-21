

import React from 'react';
import type { LockableCategoryKey, CustomItemCategoryKey, CustomItemsState, IntensityLevel, MultiSelectItemCategoryKey } from './types';
import { LockOpenIcon, LockClosedIcon, PlusCircleIcon, UserIcon, TrashIcon, ExportIcon, ImportIcon, RefreshIcon } from './RandomMusicStyleGenerator.icons';

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
    <div className={`flex items-center justify-between p-2.5 bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 ${effectiveCardDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-400 dark:hover:border-gray-600'} transition-colors group`}>
      <div className="flex-grow">
        <span className="text-xs uppercase text-green-600 dark:text-green-400 font-semibold tracking-wider flex items-center">
          {categoryName.replace(/([A-Z])/g, ' $1').trim().replace('Sound Design Focus', 'Sound Design & FX Focus') + ':'}
          {!sunoPromptMode && (
            <button 
              onClick={() => onOpenAddCustomItemModal(categoryKey as CustomItemCategoryKey)} 
              className="ml-2 p-0.5 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-500 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-300 focus:outline-none focus:ring-1 focus:ring-green-400 disabled:opacity-50 disabled:cursor-not-allowed" 
              aria-label={`Add custom ${categoryName}`} 
              disabled={effectiveCardDisabled}
              title={`Add custom item to ${categoryName}`}
            >
              <PlusCircleIcon className="w-3.5 h-3.5" />
            </button>
          )}
        </span>
        {displayValues.length > 0 ? (
          <span className="text-gray-800 dark:text-gray-200 text-sm ml-1">
            {displayValues.map((val, index) => (
              <React.Fragment key={index}>
                {val}
                {isItemCustom(categoryKey as CustomItemCategoryKey, val) && <UserIcon className="inline-block ml-1 mb-0.5 text-yellow-500 dark:text-yellow-400" title="Custom Item"/>}
                {index < displayValues.length - 1 && ', '}
              </React.Fragment>
            ))}
          </span>
        ) : (
          <span className="text-gray-400 dark:text-gray-500 text-sm ml-1 italic">(No item generated for this optional category)</span>
        )}
      </div>
      {!sunoPromptMode && (
        <div className="flex items-center ml-2 space-x-1.5">
          {isMultiSelectCategory && onSetCategoryIntensity && currentIntensity && (
            <div className="flex items-center space-x-0.5 bg-gray-200 dark:bg-gray-700 p-0.5 rounded-md mr-2">
              {(['simple', 'moderate', 'complex'] as IntensityLevel[]).map(level => (
                <button
                  key={level}
                  onClick={() => onSetCategoryIntensity(categoryKey as MultiSelectItemCategoryKey, level)}
                  disabled={effectiveCardDisabled || (isLocked && isOptionalCategoryOn)}
                  className={`px-1.5 py-0.5 text-[10px] rounded-sm font-bold transition-colors uppercase
                              ${currentIntensity === level ? 'bg-green-500 text-white dark:text-black' : 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-400 dark:hover:bg-gray-500'}
                              disabled:opacity-50 disabled:cursor-not-allowed`}
                  title={`Set intensity to ${level}: ${level === 'simple' ? '1 item' : level === 'moderate' ? '1-2 items' : '2-3 items'}`}
                >
                  {level.charAt(0)}
                </button>
              ))}
            </div>
          )}
           <button 
            onClick={() => onReroll(categoryKey)}
            className="p-1.5 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-500 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-300 focus:outline-none focus:ring-1 focus:ring-green-400 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label={`Re-roll ${categoryName}`}
            disabled={effectiveCardDisabled || (isLocked && isOptionalCategoryOn)}
            title={`Re-roll ${categoryName}`}
          >
            <RefreshIcon className="w-3.5 h-3.5" />
          </button>
          <button 
            onClick={() => onLockToggle(categoryKey)} 
            className={`p-1.5 rounded-full ${isLocked && isOptionalCategoryOn ? 'bg-green-500 text-white dark:text-black hover:bg-green-600 dark:hover:bg-green-400' : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'} focus:outline-none focus:ring-1 ${isLocked ? 'focus:ring-gray-400 dark:focus:ring-black' : 'focus:ring-green-400'} disabled:opacity-50 disabled:cursor-not-allowed`} 
            aria-label={isLocked ? `Unlock ${categoryName}` : `Lock ${categoryName}`} 
            disabled={effectiveCardDisabled || (!isOptionalCategoryOn && !isLocked)}
            title={isLocked && isOptionalCategoryOn ? `Unlock ${categoryName}` : `Lock ${categoryName}`}
          >
            {isLocked && isOptionalCategoryOn ? <LockClosedIcon className="w-3.5 h-3.5" /> : <LockOpenIcon className="w-3.5 h-3.5" />}
          </button>
        </div>
      )}
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
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md border border-green-500">
                <h3 className="text-lg font-semibold text-green-700 dark:text-green-300 mb-4">Add Custom Item to "{category.replace(/([A-Z])/g, ' $1').trim().replace('Sound Design Focus', 'Sound Design & FX Focus')}"</h3>
                <input type="text" value={value} onChange={(e) => setValue(e.target.value)} className="w-full p-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white mb-4 focus:ring-green-500 focus:border-green-500" placeholder="Enter your custom item" aria-label="Custom item value"/>
                <div className="flex justify-end gap-3"> <button onClick={onClose} className="py-2 px-4 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-800 dark:text-white rounded">Cancel</button> <button onClick={onSave} className="py-2 px-4 bg-green-600 hover:bg-green-500 text-white dark:text-black rounded">Save Item</button> </div>
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
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-lg border border-green-500 max-h-[80vh] flex flex-col">
                <h3 className="text-xl font-semibold text-green-700 dark:text-green-300 mb-4 sticky top-0 bg-white dark:bg-gray-800 pb-2 z-10">Manage My Custom Items</h3>
                <div className="overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-100 dark:scrollbar-track-gray-800 flex-grow">
                    {customItemEntries.filter(([_, items]) => items.length > 0).length === 0 ? ( <p className="text-gray-500 dark:text-gray-400 italic">You haven't added any custom items yet.</p> ) : (
                        customItemEntries.map(([catKey, items]) => items.length > 0 && (
                            <div key={catKey} className="mb-4">
                                <h4 className="text-md font-semibold text-green-600 dark:text-green-200 mb-1">{catKey.replace(/([A-Z])/g, ' $1').trim().replace('Sound Design Focus', 'Sound Design & FX Focus')}:</h4>
                                <ul className="list-disc list-inside pl-4 space-y-1"> {items.map(item => ( <li key={item} className="text-sm text-gray-800 dark:text-gray-300 flex justify-between items-center"> {item} <button onClick={() => onDelete(catKey, item)} className="ml-2 p-1 text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300" aria-label={`Delete ${item}`}> <TrashIcon className="w-3.5 h-3.5"/> </button> </li> ))} </ul>
                            </div>
                        ))
                    )}
                </div>
                {importStatusMessage && <p className={`text-xs mt-2 text-center ${importStatusMessage.includes("Error") ? 'text-red-500' : 'text-green-600 dark:text-green-300'}`}>{importStatusMessage}</p>}
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600 sticky bottom-0 bg-white dark:bg-gray-800 z-10 space-y-2">
                    <div className="flex gap-2">
                         <input type="file" ref={fileInputRef} onChange={onImportFileSelected} accept=".json" style={{display: 'none'}} id="import-custom-items-file"/>
                        <button onClick={onExport} className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded text-sm flex items-center justify-center gap-2"><ExportIcon/>Export All</button>
                        <label htmlFor="import-custom-items-file" className="flex-1 py-2 px-3 bg-teal-600 hover:bg-teal-500 text-white rounded text-sm flex items-center justify-center gap-2 cursor-pointer"><ImportIcon/>Import</label>
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

export const ToggleSwitch: React.FC<{ id: string; label: string; checked: boolean; onChange: () => void; }> = ({ id, label, checked, onChange }) => (
    <div className="flex items-center justify-between py-1">
        <label htmlFor={id} className="text-sm text-gray-700 dark:text-gray-300">{label}</label>
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            onClick={onChange}
            className={`${checked ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'} relative inline-flex items-center h-5 rounded-full w-9 transition-colors focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-800`}
            id={id}
        >
            <span className={`${checked ? 'translate-x-5' : 'translate-x-1'} inline-block w-3 h-3 transform bg-white rounded-full transition-transform`} />
        </button>
    </div>
);
