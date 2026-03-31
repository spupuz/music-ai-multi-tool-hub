import React, { RefObject } from 'react';
import TextAreaField from '@/components/forms/TextAreaField';
import { ExportIcon, ImportIcon } from './Icons';

export interface ImportExportModalProps {
    show: boolean;
    onClose: () => void;
    onExport: (format: 'txt' | 'csv') => void;
    pastedImportText: string;
    setPastedImportText: (val: string) => void;
    onImportPastedText: () => void;
    importFileRef: RefObject<HTMLInputElement>;
    onFileImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const ImportExportModal: React.FC<ImportExportModalProps> = ({ show, onClose, onExport, pastedImportText, setPastedImportText, onImportPastedText, importFileRef, onFileImport }) => {
    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-lg border border-green-500">
                <h3 className="text-lg font-semibold text-green-700 dark:text-green-300 mb-4">Import/Export Current Arrangement</h3>
                <div className="flex flex-col space-y-2">
                    <button onClick={() => onExport('txt')} className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded text-sm flex items-center justify-center gap-1.5"><ExportIcon />Export as TXT</button>
                    <button onClick={() => onExport('csv')} className="w-full py-2 px-3 bg-teal-600 hover:bg-teal-500 text-white rounded text-sm flex items-center justify-center gap-1.5"><ExportIcon />Export as CSV</button>
                </div>
                <div className="my-4 text-center text-gray-500 dark:text-gray-400 text-sm">OR</div>
                <div className="space-y-3">
                    <TextAreaField id="pastedImport" label="Paste Text to Import" value={pastedImportText} onChange={setPastedImportText} rows={6} placeholder="Paste a previously exported text prompt here..." labelTextColor="text-gray-700 dark:text-gray-300" className="mb-2"/>
                    <button onClick={onImportPastedText} className="w-full py-2 px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-sm flex items-center justify-center gap-1.5"><ImportIcon />Import From Pasted Text</button>
                </div>
                <div className="my-4 text-center text-gray-500 dark:text-gray-400 text-sm">OR</div>
                <input type="file" ref={importFileRef} accept=".txt,.csv" onChange={onFileImport} className="hidden" id="import-arrangement-file"/>
                <label htmlFor="import-arrangement-file" className="w-full py-2 px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded mb-2 text-sm flex items-center justify-center gap-1.5 cursor-pointer"><ImportIcon />Import from TXT/CSV File...</label>
                <div className="mt-6 flex justify-end">
                    <button onClick={onClose} className="py-2 px-4 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-800 dark:text-white rounded">Close</button>
                </div>
            </div>
        </div>
    );
};

export default ImportExportModal;
