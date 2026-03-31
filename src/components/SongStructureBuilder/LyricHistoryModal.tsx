import React from 'react';
import type { LyricLineData } from '@/types';

export interface LyricHistoryModalProps {
    show: boolean;
    onClose: () => void;
    historyModalContent: { blockId: string; line: LyricLineData } | null;
    onRevert: (version: string) => void;
}

const LyricHistoryModal: React.FC<LyricHistoryModalProps> = ({ show, onClose, historyModalContent, onRevert }) => {
    if (!show || !historyModalContent) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-xl border border-green-500 max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-semibold text-green-700 dark:text-green-300 mb-4">History for Lyric Line</h3>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 bg-gray-100 dark:bg-gray-700 p-2 rounded border border-gray-200 dark:border-gray-600">Current: "{historyModalContent.line.currentText}"</p>
                <div className="overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-200 dark:scrollbar-track-gray-800 flex-grow space-y-2">
                    {historyModalContent.line.history.slice().reverse().map((version, index) => (
                        <div key={index} className="flex justify-between items-center p-2 bg-gray-100 dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600">
                            <p className="text-gray-800 dark:text-gray-200 text-sm">{version}</p>
                            <button
                                onClick={() => onRevert(version)}
                                className="ml-4 text-xs py-1 px-2 bg-blue-600 hover:bg-blue-500 text-white rounded"
                            >
                                Revert
                            </button>
                        </div>
                    ))}
                </div>
                <button onClick={onClose} className="mt-4 py-2 px-4 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-800 dark:text-white rounded w-full">Close</button>
            </div>
        </div>
    );
};

export default LyricHistoryModal;
