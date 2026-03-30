import React from 'react';
import type { SavedArrangement } from '../../../types';
import { TrashIcon } from './Icons';

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
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-lg border border-green-500 max-h-[80vh] flex flex-col">
                <h3 className="text-xl font-semibold text-green-700 dark:text-green-300 mb-4 sticky top-0 bg-white dark:bg-gray-800 pb-2 z-10">Load Saved Arrangement</h3>
                {savedArrangements.length > 0 ? (
                    <ul className="overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-200 dark:scrollbar-track-gray-800 flex-grow space-y-2">
                        {savedArrangements.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(item => (
                            <li key={item.id} className="p-3 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600 transition-all">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="font-semibold text-green-700 dark:text-green-200">{item.name}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Saved: {new Date(item.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <div className="flex-shrink-0 space-x-2">
                                        <button onClick={() => onLoad(item.id)} className="text-xs py-1 px-2 bg-blue-600 hover:bg-blue-500 text-white rounded">Load</button>
                                        <button onClick={() => onDelete(item.id)} className="text-xs py-1 px-2 bg-red-600 hover:bg-red-500 text-white rounded flex items-center min-w-[50px] justify-center">
                                            <TrashIcon className="w-3 h-3 mr-1"/>{getDeleteButtonText(item.id)}
                                        </button>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-4">No arrangements saved yet.</p>
                )}
                <div className="mt-4 sticky bottom-0 bg-white dark:bg-gray-800 pt-2 z-10">
                    <button onClick={onClose} className="w-full py-2 px-4 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-800 dark:text-white rounded">Close</button>
                </div>
            </div>
        </div>
    );
};

export default LoadArrangementModal;
