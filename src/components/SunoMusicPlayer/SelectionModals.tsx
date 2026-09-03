import React from 'react';
import { SunoClip } from '@/types';
import Button from '@/components/common/Button';
import { LyricsPlayerIcon, InfoPlayerIcon } from '@/components/Icons';

interface LyricsModalProps {
  isOpen: boolean;
  onClose: () => void;
  songTitle: string | undefined;
  lyricsToDisplay: string;
  lyricsSourceField: 'prompt' | 'gpt_description_prompt' | null;
  handleCopyLyrics: () => void;
  copyLyricsStatus: string;
}

export const LyricsModal: React.FC<LyricsModalProps> = ({
  isOpen, onClose, songTitle, lyricsToDisplay, lyricsSourceField, handleCopyLyrics, copyLyricsStatus
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn" onClick={onClose}>
      <div className="glass-card p-8 border-gray-300 dark:border-white/20 shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col relative overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-black uppercase tracking-tighter italic text-emerald-500">Lyrics</h2>
          <Button onClick={onClose} variant="ghost" size="sm" className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-all rounded-xl" aria-label="Close lyrics modal">
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </Button>
        </div>
        <div className="mb-8">
          <h3 className="text-2xl font-black uppercase tracking-tighter text-gray-900 dark:text-white">Lyrics Breakdown</h3>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-500 mt-1">{songTitle}</p>
        </div>
        
        <div className="flex-grow overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10 hover:scrollbar-thumb-white/20 mb-8">
          <pre className="text-base font-bold text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed opacity-90">{lyricsToDisplay}</pre>
        </div>

        <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-white/10">
           {lyricsSourceField && <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-600">Source: <span className="text-emerald-600/50">{lyricsSourceField}</span></p>}
           <Button onClick={handleCopyLyrics} disabled={!lyricsToDisplay || lyricsToDisplay === "Lyrics not available for this song." || !!copyLyricsStatus} title={(!lyricsToDisplay || lyricsToDisplay === "Lyrics not available for this song.") ? "Cannot copy lyrics: Lyrics not available" : undefined} variant="primary" size="lg" className="min-w-[160px] font-black uppercase tracking-widest" backgroundColor="#10b981">
             {copyLyricsStatus || "Copy Lyrics"}
           </Button>
        </div>
      </div>
    </div>
  );
};

interface MetadataModalProps {
  isOpen: boolean;
  onClose: () => void;
  song: SunoClip | null;
}

export const MetadataModal: React.FC<MetadataModalProps> = ({
  isOpen, onClose, song
}) => {
  if (!isOpen || !song) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn" onClick={onClose}>
      <div className="glass-card p-4 sm:p-8 border-gray-300 dark:border-white/20 shadow-2xl w-full max-w-xl max-h-[85vh] flex flex-col relative" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-black uppercase tracking-tighter italic text-emerald-500">Metadata</h2>
          <Button onClick={onClose} variant="ghost" size="sm" className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-all rounded-xl" aria-label="Close metadata modal">
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </Button>
        </div>
        <div className="mb-8">
          <h3 className="text-2xl font-black uppercase tracking-tighter text-gray-900 dark:text-white">Track Intel</h3>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-500 mt-1">{song.title}</p>
        </div>
        
        <div className="overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-white/10 space-y-6">
          <div className="space-y-4">
            <div className="bg-white dark:bg-black/20 p-4 rounded-2xl border border-gray-200 dark:border-white/5">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Style tags</p>
              <p className="text-sm font-bold text-gray-900 dark:text-white leading-relaxed">{song.metadata?.tags || 'None identified'}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white dark:bg-black/20 p-4 rounded-2xl border border-gray-200 dark:border-white/5 text-center">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Model</p>
                <p className="text-sm font-black text-gray-900 dark:text-white">{song.model_name || 'N/A'}</p>
              </div>
              <div className="bg-white dark:bg-black/20 p-4 rounded-2xl border border-gray-200 dark:border-white/5 text-center">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Duration</p>
                <p className="text-sm font-black text-gray-900 dark:text-white">{song.metadata?.duration ? `${song.metadata.duration.toFixed(1)}s` : 'N/A'}</p>
              </div>
            </div>
            
            <div className="bg-white dark:bg-black/20 p-4 rounded-2xl border border-gray-200 dark:border-white/5">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Generation Prompt</p>
              <pre className="text-xs font-bold text-gray-800 dark:text-gray-300 whitespace-pre-wrap max-h-32 overflow-y-auto scrollbar-thin opacity-80 italic">{song.metadata?.gpt_description_prompt || 'N/A'}</pre>
            </div>

            <div className="text-center pt-4">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-gray-600">Generated on {new Date(song.created_at).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
