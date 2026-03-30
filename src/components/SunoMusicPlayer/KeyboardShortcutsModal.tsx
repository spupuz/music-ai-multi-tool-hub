import React from 'react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="keyboard-shortcuts-title">
      <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md border border-green-500" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h3 id="keyboard-shortcuts-title" className="text-lg font-semibold text-green-300">Keyboard Shortcuts</h3>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-gray-700 text-gray-400 hover:text-white" aria-label="Close keyboard shortcuts modal">&times;</button>
        </div>
        <ul className="space-y-2 text-sm text-gray-200">
          <li><strong className="text-green-400">Space Bar:</strong> Play / Pause</li>
          <li><strong className="text-green-400">→ (Right Arrow):</strong> Next Track</li>
          <li><strong className="text-green-400">← (Left Arrow):</strong> Previous Track</li>
          <li><strong className="text-green-400">↑ (Up Arrow):</strong> Volume Up (by 5%)</li>
          <li><strong className="text-green-400">↓ (Down Arrow):</strong> Volume Down (by 5%)</li>
          <li><strong className="text-green-400">S:</strong> Toggle Shuffle</li>
          <li><strong className="text-green-400">N:</strong> Toggle Snippet Mode</li>
        </ul>
        <p className="text-xs text-gray-500 mt-4">Note: Shortcuts are disabled when typing in input fields.</p>
      </div>
    </div>
  );
};

export default KeyboardShortcutsModal;
