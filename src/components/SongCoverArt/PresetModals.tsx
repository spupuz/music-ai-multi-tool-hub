import React from 'react';
import InputField from '@/components/forms/InputField';
import TextAreaField from '@/components/forms/TextAreaField';
import { DeleteIcon, ExportIcon, ImportIcon } from './Icons';
import { ArtStylePreset } from './constants';

interface PresetModalsProps {
  showSavePresetModal: boolean;
  setShowSavePresetModal: (show: boolean) => void;
  newPresetName: string;
  setNewPresetName: (name: string) => void;
  presetErrorMessage: string | null;
  setPresetErrorMessage: (msg: string | null) => void;
  handleSavePreset: () => void;

  showLoadPresetModal: boolean;
  setShowLoadPresetModal: (show: boolean) => void;
  savedArtStylePresets: ArtStylePreset[];
  handleLoadPreset: (id: string) => void;
  handleDeletePreset: (id: string) => void;

  showImportExportModal: boolean;
  setShowImportExportModal: (show: boolean) => void;
  handleExportPresets: () => void;
  configToImportJson: string;
  setConfigToImportJson: (json: string) => void;
  importPresetFileRef: React.RefObject<HTMLInputElement>;
  handleImportFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  importPresetError: string;
  processPresetImport: (mode: 'merge' | 'replace') => void;
}

const PresetModals: React.FC<PresetModalsProps> = ({
  showSavePresetModal, setShowSavePresetModal, newPresetName, setNewPresetName, presetErrorMessage, setPresetErrorMessage, handleSavePreset,
  showLoadPresetModal, setShowLoadPresetModal, savedArtStylePresets, handleLoadPreset, handleDeletePreset,
  showImportExportModal, setShowImportExportModal, handleExportPresets, configToImportJson, setConfigToImportJson, importPresetFileRef, handleImportFileChange, importPresetError, processPresetImport
}) => {
  return (
    <>
      {showSavePresetModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md border border-green-500">
            <h3 className="text-lg font-semibold text-green-700 dark:text-green-300 mb-4">Save Current Art Style Preset</h3>
            <InputField id="newPresetName" label="Preset Name" value={newPresetName} onChange={setNewPresetName} placeholder="e.g., Retro VHS Look" className="mb-4" />
            {presetErrorMessage && <p className="text-red-500 dark:text-red-400 text-xs mb-3">{presetErrorMessage}</p>}
            <div className="flex justify-end gap-3">
              <button onClick={() => { setShowSavePresetModal(false); setPresetErrorMessage(null); }} className="py-2 px-4 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-800 dark:text-white rounded">Cancel</button>
              <button onClick={handleSavePreset} className="py-2 px-4 bg-green-600 hover:bg-green-500 text-white dark:text-black rounded">Save Preset</button>
            </div>
          </div>
        </div>
      )}
      
      {showLoadPresetModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-lg border border-green-500 max-h-[80vh] flex flex-col">
            <h3 className="text-xl font-semibold text-green-700 dark:text-green-300 mb-4 sticky top-0 bg-white dark:bg-gray-800 pb-2 z-10">Load Saved Art Style</h3>
            {savedArtStylePresets.length > 0 ? (
              <ul className="overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-200 dark:scrollbar-track-gray-800 flex-grow space-y-2">
                {savedArtStylePresets.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(preset => (
                  <li key={preset.id} className="p-3 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600 transition-all">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-green-700 dark:text-green-200">{preset.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Saved: {new Date(preset.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="flex-shrink-0 space-x-2">
                        <button onClick={() => handleLoadPreset(preset.id)} className="text-xs py-1 px-2 bg-blue-600 hover:bg-blue-500 text-white rounded">Load</button>
                        <button onClick={() => handleDeletePreset(preset.id)} className="text-xs py-1 px-2 bg-red-600 hover:bg-red-500 text-white rounded flex items-center"><DeleteIcon className="w-3 h-3 mr-1" />Del</button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">No art style presets saved yet.</p>
            )}
            <div className="mt-4 sticky bottom-0 bg-white dark:bg-gray-800 pt-2 z-10">
              <button onClick={() => setShowLoadPresetModal(false)} className="w-full py-2 px-4 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-800 dark:text-white rounded">Close</button>
            </div>
          </div>
        </div>
      )}
      
      {showImportExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md border border-green-500">
            <h3 className="text-lg font-semibold text-green-700 dark:text-green-300 mb-4">Import/Export Art Style Presets</h3>
            <button onClick={handleExportPresets} disabled={savedArtStylePresets.length === 0} className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded mb-4 disabled:opacity-50 flex items-center justify-center gap-1.5">
              <ExportIcon />Export All Presets to JSON
            </button>
            <TextAreaField id="importPresetJsonTextArea" label="Paste Presets JSON here OR Upload File Below" value={configToImportJson} onChange={setConfigToImportJson} rows={5} />
            <input type="file" ref={importPresetFileRef} accept=".json" onChange={handleImportFileChange} className="block w-full text-sm text-gray-500 dark:text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-green-600 file:text-black hover:file:bg-green-500 mb-2" />
            {importPresetError && <p className="text-red-500 dark:text-red-400 text-xs mb-2">{importPresetError}</p>}
            <div className="flex justify-between gap-2 mb-3">
              <button onClick={() => processPresetImport('merge')} className="flex-1 py-2 px-3 bg-teal-600 hover:bg-teal-500 text-white rounded text-sm">Merge with Existing</button>
              <button onClick={() => processPresetImport('replace')} className="flex-1 py-2 px-3 bg-orange-600 hover:bg-orange-500 text-white rounded text-sm">Replace All Existing</button>
            </div>
            <button onClick={() => setShowImportExportModal(false)} className="w-full py-2 px-4 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-800 dark:text-white rounded">Close</button>
          </div>
        </div>
      )}
    </>
  );
};

export default PresetModals;
