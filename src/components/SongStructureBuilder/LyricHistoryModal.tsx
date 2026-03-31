import React from 'react';
import type { LyricLineData } from '@/types';
import Button from '@/components/common/Button';

export interface LyricHistoryModalProps {
    show: boolean;
    onClose: () => void;
    historyModalContent: { blockId: string; line: LyricLineData } | null;
    onRevert: (version: string) => void;
}

const LyricHistoryModal: React.FC<LyricHistoryModalProps> = ({ show, onClose, historyModalContent, onRevert }) => {
    if (!show || !historyModalContent) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300" onClick={onClose}>
            <div className="glass-card p-10 max-w-xl w-full border-white/10 shadow-2xl relative overflow-hidden flex flex-col max-h-[80vh]" onClick={e => e.stopPropagation()}>
                <div className="absolute top-0 right-0 w-48 h-48 bg-yellow-500/5 blur-[80px] pointer-events-none"></div>
                
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-yellow-600 dark:text-yellow-500 mb-8 sticky top-0 z-10">Neural History</h3>
                
                <div className="mb-6 p-4 bg-white/5 dark:bg-black/20 rounded-2xl border border-white/5">
                  <p className="text-[9px] font-black uppercase tracking-widest text-gray-500 mb-2 opacity-60">Active Signal:</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 italic">"{historyModalContent.line.currentText}"</p>
                </div>

                <div className="overflow-y-auto pr-2 custom-scrollbar flex-grow space-y-3 pb-6">
                    {historyModalContent.line.history.length > 0 ? (
                        historyModalContent.line.history.slice().reverse().map((version, index) => (
                            <div key={index} className="flex justify-between items-center p-4 bg-white/5 dark:bg-black/10 rounded-2xl border border-white/5 hover:border-white/10 transition-all group">
                                <p className="text-gray-700 dark:text-gray-300 text-xs font-medium italic">"{version}"</p>
                                <Button
                                    onClick={() => onRevert(version)}
                                    variant="primary"
                                    size="xs"
                                    className="font-black uppercase tracking-widest text-[8px] shrink-0 ml-4"
                                    backgroundColor="#eab308"
                                >
                                    Restore
                                </Button>
                            </div>
                        ))
                    ) : (
                        <div className="flex-grow flex flex-col items-center justify-center py-10 opacity-30">
                          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 text-center">No Prior Versions Detected</p>
                        </div>
                    )}
                </div>
                
                <div className="mt-8 pt-8 border-t border-white/5 sticky bottom-0 z-10">
                    <Button onClick={onClose} variant="ghost" size="sm" className="w-full font-black uppercase tracking-widest text-[9px] border-white/10">Abort History View</Button>
                </div>
            </div>
        </div>
    );
};

export default LyricHistoryModal;
