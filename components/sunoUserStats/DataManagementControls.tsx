
import React from 'react';
import Spinner from '../Spinner';

interface DataManagementControlsProps {
  onUpdate: () => void;
  onClear: () => void;
  isUpdating: boolean;
  isClearingPossible: boolean; // True if data for a user is loaded
  clearButtonText: string;
}

const DataManagementControls: React.FC<DataManagementControlsProps> = ({ 
  onUpdate, 
  onClear, 
  isUpdating,
  isClearingPossible,
  clearButtonText
}) => {
  return (
    <div className="mt-6 p-4 bg-gray-800 rounded-lg border border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-3">
      <p className="text-xs text-gray-400 sm:max-w-xs">
        Data is stored locally in your browser. Update to fetch the latest stats, or clear stored data for this user.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
        <button
          onClick={onUpdate}
          disabled={isUpdating || !isClearingPossible}
          className="flex-1 flex justify-center items-center py-1.5 px-3 border border-blue-500 text-blue-300 hover:bg-blue-700 hover:text-white rounded-md text-xs font-medium disabled:opacity-50 transition-colors"
        >
          {isUpdating ? <Spinner size="w-3 h-3 mr-1.5" /> : null} {/* Adjusted spinner size for smaller button */}
          {isUpdating ? 'Updating...' : 'Update Data'}
        </button>
        <button
          onClick={onClear}
          disabled={isUpdating || !isClearingPossible}
          className="flex-1 py-1.5 px-3 border border-red-500 text-red-300 hover:bg-red-700 hover:text-white rounded-md text-xs font-medium disabled:opacity-50 transition-colors"
        >
          {clearButtonText}
        </button>
      </div>
    </div>
  );
};

export default DataManagementControls;
