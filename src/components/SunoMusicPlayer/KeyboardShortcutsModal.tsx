import React from 'react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({ isOpen, onClose }) => {

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="keyboard-shortcuts-title">
      <div className={`glass-card border-gray-200 dark:border-white/10 p-8 max-w-lg`} onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h3 id="keyboard-shortcuts-title" className={`text-xl font-black uppercase tracking-tight text-gray-900 dark:text-white`}>Keyboard Shortcuts</h3>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all" aria-label="Close keyboard shortcuts modal">&times;</button>
        </div>
        <ul className={`space-y-4 text-sm text-gray-700 dark:text-gray-200`}>
          <li><strong className={'text-emerald-500 font-black uppercase tracking-widest text-[10px] mr-2'}>Space Bar:</strong> Play / Pause</li>
          <li><strong className={'text-emerald-500 font-black uppercase tracking-widest text-[10px] mr-2'}>→ (Right Arrow):</strong> Next Track</li>
          <li><strong className={'text-emerald-500 font-black uppercase tracking-widest text-[10px] mr-2'}>← (Left Arrow):</strong> Previous Track</li>
          <li><strong className={'text-emerald-500 font-black uppercase tracking-widest text-[10px] mr-2'}>↑ (Up Arrow):</strong> Volume Up (by 5%)</li>
          <li><strong className={'text-emerald-500 font-black uppercase tracking-widest text-[10px] mr-2'}>↓ (Down Arrow):</strong> Volume Down (by 5%)</li>
          <li><strong className={'text-emerald-500 font-black uppercase tracking-widest text-[10px] mr-2'}>S:</strong> Toggle Shuffle</li>
          <li><strong className={'text-emerald-500 font-black uppercase tracking-widest text-[10px] mr-2'}>N:</strong> Toggle Snippet Mode</li>
        </ul>
        <p className={`text-xs text-gray-500 font-bold mt-6 italic`}>Note: Shortcuts are disabled when typing in input fields.</p>
      </div>
    </div>
  );
};

export default KeyboardShortcutsModal;
