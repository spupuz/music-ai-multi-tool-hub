import React from 'react';
import Spinner from '../Spinner';
import Button from '../common/Button';
import { RefreshIcon } from '../Icons';

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
      <div className="flex flex-row items-center gap-3 w-full sm:w-auto">
        <Button
          onClick={onUpdate}
          disabled={isUpdating || !isClearingPossible}
          variant="primary"
          size="sm"
          startIcon={isUpdating ? null : <RefreshIcon className="w-3.5 h-3.5" />}
          loading={isUpdating}
          className="flex-1 px-6 py-2.5 text-[10px] font-black uppercase tracking-widest border-none shadow-none"
          backgroundColor="#3b82f6"
        >
          Update Data
        </Button>
        <Button
          onClick={onClear}
          disabled={isUpdating || !isClearingPossible}
          variant="ghost"
          size="sm"
          className="flex-1 px-6 py-2.5 text-[10px] font-black uppercase tracking-widest text-red-400 hover:bg-red-500/10 border-red-500/20 shadow-none hover:shadow-none"
        >
          {clearButtonText}
        </Button>
      </div>
    </div>
  );
};

export default DataManagementControls;
