import React from 'react';
import type { SavedArrangement } from '@/types';
import { TrashIcon } from './Icons';
import Button from '@/components/common/Button';

export interface LoadArrangementModalProps {
    show: boolean;
    onClose: () => void;
    savedArrangements: SavedArrangement[];
    onLoad: (id: string) => void;
    onDelete: (id: string) => void;
    getDeleteButtonText: (id: string) => string;
}

const LoadArrangementModal: React.FC<LoadArrangementModalProps> = ({ show, onClose, savedArrangements, onLoad, onDelete, getDeleteButtonText }) => {
    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
            <div className="glass-card p-8 md:p-10 max-w-lg w-full border-white/10 shadow-2xl relative overflow-hidden flex flex-col max-h-[85vh]">
                <div className="absolute top-0 right-0 w-48 h-48 bg-green-500/5 blur-[80px] pointer-events-none"></div>
                
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-green-600 dark:text-green-500 mb-8 sticky top-0 z-10">Vault Access</h3>
                
                {savedArrangements.length > 0 ? (
                    <div className="overflow-y-auto pr-2 custom-scrollbar flex-grow space-y-3 pb-6">
                        {savedArrangements.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(item => (
                            <div key={item.id} className="p-5 bg-white/5 dark:bg-black/20 rounded-2xl border border-white/5 hover:border-white/10 hover:bg-white/10 transition-all group">
                                <div className="flex justify-between items-center gap-4">
                                    <div className="min-w-0">
                                        <p className="font-black text-xs uppercase tracking-widest text-gray-900 dark:text-white truncate mb-1">{item.name}</p>
                                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-500 opacity-60">Created: {new Date(item.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <Button onClick={() => onLoad(item.id)} variant="primary" size="xs" className="font-black uppercase tracking-widest text-[8px]" backgroundColor="#3b82f6">Load</Button>
                                        <Button 
                                          onClick={() => onDelete(item.id)} 
                                          variant="ghost" 
                                          size="xs" 
                                          className="font-black uppercase tracking-widest text-[8px] text-red-500 border-red-500/20 hover:bg-red-500/10 min-w-[60px]"
                                        >
                                          <TrashIcon className="w-2.5 h-2.5 mr-1"/>{getDeleteButtonText(item.id)}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex-grow flex flex-col items-center justify-center py-20 opacity-40">
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 text-center">Neural Vault Empty</p>
                    </div>
                )}
                
                <div className="mt-6 pt-6 border-t border-white/5 sticky bottom-0 z-10">
                    <Button onClick={onClose} variant="ghost" size="sm" className="w-full font-black uppercase tracking-widest text-[9px] border-white/10">Close Terminal</Button>
                </div>
            </div>
        </div>
    );
};

export default LoadArrangementModal;
