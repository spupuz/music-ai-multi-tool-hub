import React from 'react';
import InputField from '@/components/forms/InputField';
import TextAreaField from '@/components/forms/TextAreaField';
import Button from '@/components/common/Button';
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[100] p-4 scale-alpha animate-in fade-in duration-300">
          <div className="glass-card p-10 max-w-md w-full border-white/10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 blur-[40px] pointer-events-none"></div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-green-600 dark:text-green-500 mb-8 text-center">Commit Art Style</h3>
            <div className="space-y-6">
              <InputField id="newPresetName" label="Preset Vector Identifier" value={newPresetName} onChange={setNewPresetName} placeholder="e.g., RETRO_CHROME" className="mb-0" />
              {presetErrorMessage && <p className="text-[9px] font-black uppercase tracking-widest text-red-400 text-center">{presetErrorMessage}</p>}
              <div className="flex gap-4 pt-4">
                <Button onClick={() => { setShowSavePresetModal(false); setPresetErrorMessage(null); }} variant="ghost" size="sm" className="flex-1 font-black uppercase tracking-widest text-[9px]">Abort</Button>
                <Button onClick={handleSavePreset} variant="primary" size="sm" className="flex-1 font-black uppercase tracking-widest text-[9px]" backgroundColor="#22c55e">Save Preset</Button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {showLoadPresetModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
          <div className="glass-card p-10 max-w-lg w-full border-white/10 shadow-2xl flex flex-col max-h-[85vh] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-[40px] pointer-events-none"></div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600 dark:text-blue-500 mb-8 text-center">Style Repository</h3>
            {savedArtStylePresets.length > 0 ? (
              <ul className="flex-grow overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                {savedArtStylePresets.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(preset => (
                  <li key={preset.id} className="group p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 hover:border-white/10 transition-all duration-300 flex justify-between items-center shadow-lg">
                    <div className="space-y-1">
                      <p className="text-[11px] font-black uppercase tracking-wider text-white opacity-80 group-hover:opacity-100 transition-opacity">{preset.name}</p>
                      <p className="text-[7px] font-black uppercase tracking-[0.2em] text-gray-500">Decoded: {new Date(preset.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={() => handleLoadPreset(preset.id)} variant="ghost" size="xs" className="px-3 border-blue-500/20 text-blue-400 hover:bg-blue-500/10">Deploy</Button>
                      <Button onClick={() => handleDeletePreset(preset.id)} variant="ghost" size="xs" className="px-3 border-red-500/20 text-red-400 hover:bg-red-500/10"><DeleteIcon className="w-3 h-3"/></Button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 space-y-4 opacity-40">
                <ExportIcon className="w-8 h-8"/>
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-500 text-center">Repository Empty</p>
              </div>
            )}
            <div className="mt-8 pt-6 border-t border-white/5">
              <Button onClick={() => setShowLoadPresetModal(false)} variant="ghost" size="sm" className="w-full font-black uppercase tracking-widest text-[10px]">Return to Console</Button>
            </div>
          </div>
        </div>
      )}
      
      {showImportExportModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
          <div className="glass-card p-10 max-w-md w-full border-white/10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/5 blur-[60px] pointer-events-none"></div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-purple-600 dark:text-purple-500 mb-8 text-center">Neural Sync / Backup</h3>
            
            <div className="space-y-6">
              <Button onClick={handleExportPresets} disabled={savedArtStylePresets.length === 0} variant="primary" size="sm" className="w-full font-black uppercase tracking-widest text-[9px] py-4 rounded-2xl shadow-purple-500/10" backgroundColor="#8b5cf6">
                <div className="flex items-center justify-center gap-2"><ExportIcon /> Backup Presets to Disk</div>
              </Button>
              
              <div className="relative">
                <TextAreaField id="importPresetJsonTextArea" label="Import Signal Buffer" value={configToImportJson} onChange={setConfigToImportJson} rows={4} className="mb-4" placeholder="Paste JSON architecture here..." />
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-white/5 border border-dashed border-white/10 rounded-2xl text-center group hover:bg-white/10 transition-all cursor-pointer relative">
                  <input type="file" ref={importPresetFileRef} accept=".json" onChange={handleImportFileChange} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                  <div className="text-[8px] font-black uppercase tracking-[0.2em] text-gray-500 group-hover:text-green-500 transition-colors">Select Architecture File</div>
                </div>
                {importPresetError && <p className="text-[9px] font-black uppercase tracking-widest text-red-400 text-center">{importPresetError}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button onClick={() => processPresetImport('merge')} variant="ghost" size="xs" className="w-full font-black uppercase tracking-widest text-[8px] py-3 rounded-xl border-teal-500/20 text-teal-400">Merge Logic</Button>
                <Button onClick={() => processPresetImport('replace')} variant="ghost" size="xs" className="w-full font-black uppercase tracking-widest text-[8px] py-3 rounded-xl border-orange-500/20 text-orange-400">Override Active</Button>
              </div>

              <div className="pt-4 border-t border-white/5">
                <Button onClick={() => setShowImportExportModal(false)} variant="ghost" size="sm" className="w-full font-black uppercase tracking-widest text-[9px]">Abort Sync</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PresetModals;
