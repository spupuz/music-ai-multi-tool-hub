import React from 'react';
import InputField from '../../../components/forms/InputField';

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
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md border border-green-500">
                <h3 className="text-lg font-semibold text-green-700 dark:text-green-300 mb-4">Save Current Arrangement</h3>
                <InputField id="newArrangementName" label="Arrangement Name" value={arrangementName} onChange={setArrangementName} placeholder="e.g., My Awesome Rock Song" />
                {errorSave && <p className="text-red-500 dark:text-red-400 text-xs mb-3">{errorSave}</p>}
                <div className="flex justify-end gap-3 mt-4">
                    <button onClick={onClose} className="py-2 px-4 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-800 dark:text-white rounded">Cancel</button>
                    <button onClick={onSave} className="py-2 px-4 bg-green-600 hover:bg-green-500 text-white dark:text-black rounded">Save Arrangement</button>
                </div>
            </div>
        </div>
    );
};

export default SaveArrangementModal;
