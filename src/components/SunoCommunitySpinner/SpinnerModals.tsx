import React from 'react';
import Button from '@/components/common/Button';
import { SavedWheel } from './types';
import { ConfirmationButton } from './FormComponents';

interface LoadModalProps {
    isOpen: boolean;
    onClose: () => void;
    savedWheels: SavedWheel[];
    onLoad: (id: string) => void;
    onDelete: (id: string) => void;
}

export const LoadModal: React.FC<LoadModalProps> = ({ isOpen, onClose, savedWheels, onLoad, onDelete }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-70 backdrop-blur-sm">
            <div className="bg-gray-100 dark:bg-gray-900 rounded-xl shadow-2xl p-6 w-full max-w-lg border border-gray-300 dark:border-gray-700">
                <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Load Saved Wheel</h2>
                <div className="max-h-80 overflow-y-auto space-y-3 mb-6 scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600">
                    {savedWheels.length === 0 ? (
                        <p className="text-center text-gray-500 py-8 italic font-medium">No saved wheels yet.</p>
                    ) : (
                        savedWheels.map(sw => (
                            <div key={sw.id} className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:border-emerald-500 dark:hover:border-emerald-400 transition-colors">
                                <span className="font-semibold text-gray-900 dark:text-white truncate pr-4">{sw.name}</span>
                                <div className="flex gap-2">
                                    <Button onClick={() => onLoad(sw.id)} variant="primary" size="xs" backgroundColor="#10b981" className="font-black uppercase tracking-widest px-5">Load</Button>
                                    <ConfirmationButton onConfirm={() => onDelete(sw.id)} label="Delete" confirmLabel="Delete?" className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all" />
                                </div>
                            </div>
                        ))
                    )}
                </div>
                <Button onClick={onClose} variant="ghost" className="w-full py-4 text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest border-white/10 hover:bg-white/5">Close</Button>
            </div>
        </div>
    );
};

interface ExportModalProps {
    isOpen: boolean;
    onClose: () => void;
    configJson: string;
    onDownload: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, configJson, onDownload }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-70 backdrop-blur-sm">
            <div className="bg-gray-100 dark:bg-gray-900 rounded-xl shadow-2xl p-6 w-full max-w-2xl border border-gray-300 dark:border-gray-700">
                <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Export Configuration</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Copy the JSON below or download as a file to share or backup your wheel.</p>
                <textarea readOnly value={configJson} className="w-full h-64 p-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg font-mono text-xs mb-6 focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-transparent text-gray-900 dark:text-white" />
                <div className="flex flex-col sm:flex-row gap-4">
                    <Button onClick={onDownload} variant="primary" size="lg" backgroundColor="#10b981" className="flex-1 font-black uppercase tracking-widest py-6 shadow-xl">Download .json File</Button>
                    <Button onClick={onClose} variant="ghost" className="flex-1 font-black uppercase tracking-widest py-6 border-white/10 text-gray-500">Close</Button>
                </div>
            </div>
        </div>
    );
};

interface ImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    configJson: string;
    onJsonChange: (val: string) => void;
    onImport: () => void;
    importError: string;
    importFileRef: React.RefObject<HTMLInputElement>;
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const ImportModal: React.FC<ImportModalProps> = ({ isOpen, onClose, configJson, onJsonChange, onImport, importError, importFileRef, onFileChange }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-70 backdrop-blur-sm">
            <div className="bg-gray-100 dark:bg-gray-900 rounded-xl shadow-2xl p-6 w-full max-w-2xl border border-gray-300 dark:border-gray-700">
                <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Import Configuration</h2>
                <div className="mb-6">
                    <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Option 1: Upload File</label>
                    <input type="file" ref={importFileRef} accept=".json" onChange={onFileChange} className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-emerald-600 file:text-white hover:file:bg-emerald-500 transition-colors" />
                </div>
                <div className="mb-6">
                    <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Option 2: Paste JSON Data</label>
                    <textarea value={configJson} onChange={(e) => onJsonChange(e.target.value)} placeholder="Paste your Magic Spin Wheel JSON configuration here..." className="w-full h-48 p-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg font-mono text-xs focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-transparent text-gray-900 dark:text-white" />
                    {importError && <p className="mt-2 text-xs text-red-600 dark:text-red-400 font-medium">Error: {importError}</p>}
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                    <Button onClick={onImport} variant="primary" size="lg" backgroundColor="#8b5cf6" className="flex-1 font-black uppercase tracking-widest py-6 shadow-xl">Import Configuration</Button>
                    <Button onClick={onClose} variant="ghost" className="flex-1 font-black uppercase tracking-widest py-6 border-white/10 text-gray-500">Cancel</Button>
                </div>
            </div>
        </div>
    );
};
