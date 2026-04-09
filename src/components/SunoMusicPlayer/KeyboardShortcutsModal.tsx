import React from 'react';
import { useTheme } from '@/context/ThemeContext';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({ isOpen, onClose }) => {
  const { uiMode } = useTheme();

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="keyboard-shortcuts-title">
      <div className={`${uiMode === 'architect' ? 'glass-card border-white/10 p-8 max-w-lg' : 'bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md border border-green-500'}`} onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h3 id="keyboard-shortcuts-title" className={`text-xl font-black uppercase tracking-tight ${uiMode === 'architect' ? 'text-white' : 'text-green-300'}`}>Keyboard Shortcuts</h3>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition-all" aria-label="Close keyboard shortcuts modal">&times;</button>
        </div>
        <ul className={`${uiMode === 'architect' ? 'space-y-4' : 'space-y-2'} text-sm text-gray-200`}>
          <li><strong className={uiMode === 'architect' ? 'text-emerald-500 font-black uppercase tracking-widest text-[10px] mr-2' : 'text-green-400'}>Space Bar:</strong> Play / Pause</li>
          <li><strong className={uiMode === 'architect' ? 'text-emerald-500 font-black uppercase tracking-widest text-[10px] mr-2' : 'text-green-400'}>→ (Right Arrow):</strong> Next Track</li>
          <li><strong className={uiMode === 'architect' ? 'text-emerald-500 font-black uppercase tracking-widest text-[10px] mr-2' : 'text-green-400'}>← (Left Arrow):</strong> Previous Track</li>
          <li><strong className={uiMode === 'architect' ? 'text-emerald-500 font-black uppercase tracking-widest text-[10px] mr-2' : 'text-green-400'}>↑ (Up Arrow):</strong> Volume Up (by 5%)</li>
          <li><strong className={uiMode === 'architect' ? 'text-emerald-500 font-black uppercase tracking-widest text-[10px] mr-2' : 'text-green-400'}>↓ (Down Arrow):</strong> Volume Down (by 5%)</li>
          <li><strong className={uiMode === 'architect' ? 'text-emerald-500 font-black uppercase tracking-widest text-[10px] mr-2' : 'text-green-400'}>S:</strong> Toggle Shuffle</li>
          <li><strong className={uiMode === 'architect' ? 'text-emerald-500 font-black uppercase tracking-widest text-[10px] mr-2' : 'text-green-400'}>N:</strong> Toggle Snippet Mode</li>
        </ul>
        <p className={`text-xs ${uiMode === 'architect' ? 'text-gray-500 font-bold' : 'text-gray-500'} mt-6 italic`}>Note: Shortcuts are disabled when typing in input fields.</p>
      </div>
    </div>
  );
};

export default KeyboardShortcutsModal;
