import React, { RefObject } from 'react';
import TextAreaField from '@/components/forms/TextAreaField';
import { ExportIcon, ImportIcon } from './Icons';
import Button from '@/components/common/Button';

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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
            <div className="glass-card p-10 max-w-lg w-full border-white/10 shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
                <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/5 blur-[80px] pointer-events-none"></div>
                
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600 dark:text-blue-500 mb-8 sticky top-0 z-10">Signal Transfer</h3>
                
                <div className="overflow-y-auto pr-2 custom-scrollbar flex-grow space-y-8">
                    <section>
                      <h4 className="text-[9px] font-black uppercase tracking-widest text-gray-500 mb-4 opacity-60">Transmission Out</h4>
                      <div className="grid grid-cols-2 gap-3">
                          <Button onClick={() => onExport('txt')} variant="ghost" size="sm" className="font-black uppercase tracking-widest text-[9px] border-white/10"><ExportIcon className="mr-1.5 w-3 h-3" />TXT</Button>
                          <Button onClick={() => onExport('csv')} variant="ghost" size="sm" className="font-black uppercase tracking-widest text-[9px] border-white/10"><ExportIcon className="mr-1.5 w-3 h-3" />CSV</Button>
                      </div>
                    </section>

                    <div className="flex items-center gap-4">
                      <div className="h-px flex-grow bg-white/5"></div>
                      <span className="text-[8px] font-black uppercase tracking-widest text-gray-600">OR</span>
                      <div className="h-px flex-grow bg-white/5"></div>
                    </div>

                    <section className="space-y-4">
                        <h4 className="text-[9px] font-black uppercase tracking-widest text-gray-500 mb-4 opacity-60">Manual Re-Entry</h4>
                        <TextAreaField 
                          id="pastedImport" 
                          label="Neural Paste" 
                          value={pastedImportText} 
                          onChange={setPastedImportText} 
                          rows={6} 
                          placeholder="Paste signal here..." 
                          className="mb-0"
                        />
                        <Button onClick={onImportPastedText} variant="primary" size="sm" className="w-full font-black uppercase tracking-widest text-[9px]" backgroundColor="#6366f1"><ImportIcon className="mr-1.5 w-3 h-3" />Synchronize</Button>
                    </section>

                    <div className="flex items-center gap-4">
                      <div className="h-px flex-grow bg-white/5"></div>
                      <span className="text-[8px] font-black uppercase tracking-widest text-gray-600">OR</span>
                      <div className="h-px flex-grow bg-white/5"></div>
                    </div>

                    <section>
                        <h4 className="text-[9px] font-black uppercase tracking-widest text-gray-500 mb-4 opacity-60">External Source</h4>
                        <input type="file" ref={importFileRef} accept=".txt,.csv" onChange={onFileImport} className="hidden" id="import-arrangement-file"/>
                        <label htmlFor="import-arrangement-file" className="w-full h-[42px] bg-white/5 border border-dashed border-white/10 rounded-xl flex items-center justify-center gap-3 cursor-pointer hover:bg-white/10 hover:border-white/20 transition-all">
                          <ImportIcon className="w-3 h-3 text-gray-400" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Upload Data Stream</span>
                        </label>
                    </section>
                </div>
                
                <div className="mt-8 pt-8 border-t border-white/5 sticky bottom-0 z-10">
                    <Button onClick={onClose} variant="ghost" size="sm" className="w-full font-black uppercase tracking-widest text-[9px] border-white/10">Abort</Button>
                </div>
            </div>
        </div>
    );
};

export default ImportExportModal;
