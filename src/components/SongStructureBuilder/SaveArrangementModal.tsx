import React from 'react';
import InputField from '@/components/forms/InputField';
import Button from '@/components/common/Button';

export interface SaveArrangementModalProps {
    show: boolean;
    onClose: () => void;
    onSave: () => void;
    arrangementName: string;
    setArrangementName: (val: string) => void;
    errorSave: string | null;
}

const SaveArrangementModal: React.FC<SaveArrangementModalProps> = ({ show, onClose, onSave, arrangementName, setArrangementName, errorSave }) => {
    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
            <div className="glass-card p-10 max-w-md w-full border-white/10 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 blur-[60px] pointer-events-none"></div>
                
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-green-600 dark:text-green-500 mb-8">Save Blueprint</h3>
                
                <div className="space-y-6">
                    <InputField 
                      id="newArrangementName" 
                      label="Arrangement Designation" 
                      value={arrangementName} 
                      onChange={setArrangementName} 
                      placeholder="e.g., Project Nova" 
                      className="mb-0" 
                    />
                    
                    {errorSave && (
                        <p className="text-[10px] font-black uppercase tracking-widest text-red-500 animate-pulse">
                            Error: {errorSave}
                        </p>
                    )}
                </div>

                <div className="flex justify-end gap-3 mt-10">
                    <Button onClick={onClose} variant="ghost" size="sm" className="font-black uppercase tracking-widest text-[9px] px-6 border-white/10">Discard</Button>
                    <Button onClick={onSave} variant="primary" size="sm" className="font-black uppercase tracking-widest text-[9px] px-6" backgroundColor="#10b981">Commit Save</Button>
                </div>
            </div>
        </div>
    );
};

export default SaveArrangementModal;
