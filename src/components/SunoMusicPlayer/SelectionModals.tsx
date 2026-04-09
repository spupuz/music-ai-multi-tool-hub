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
  uiMode: 'classic' | 'architect';
}

export const LyricsModal: React.FC<LyricsModalProps> = ({
  isOpen, onClose, songTitle, lyricsToDisplay, lyricsSourceField, handleCopyLyrics, copyLyricsStatus, uiMode
}) => {
  if (!isOpen) return null;

  if (uiMode === 'classic') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={onClose}>
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col border-2 border-green-600" onClick={(e) => e.stopPropagation()}>
          <div className="flex justify-between items-center mb-4 border-b-2 border-gray-100 dark:border-green-600/30 pb-2">
            <h3 className="text-xl font-bold text-green-600 dark:text-green-600 uppercase tracking-widest">Lyrics: {songTitle}</h3>
            <button onClick={onClose} className="p-2 -mr-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white font-bold text-xl">&times;</button>
          </div>
          {lyricsSourceField && <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-widest">Metadata Source: <code className="bg-gray-100 dark:bg-gray-700 font-mono px-1 rounded">{lyricsSourceField}</code></p>}
          <pre className="text-sm font-bold text-gray-800 dark:text-gray-200 whitespace-pre-wrap overflow-y-auto flex-grow p-4 bg-gray-50 dark:bg-gray-900 border-2 border-gray-200 dark:border-green-600/20 rounded-lg scrollbar-thin leading-relaxed shadow-inner">{lyricsToDisplay}</pre>
          <button onClick={handleCopyLyrics} disabled={!lyricsToDisplay || lyricsToDisplay === "Lyrics not available for this song." || !!copyLyricsStatus} className="mt-6 py-2.5 px-6 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-md border-2 border-blue-700/30 transition-colors uppercase tracking-widest disabled:opacity-50">{copyLyricsStatus || "Copy Lyrics"}</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn" onClick={onClose}>
      <div className="glass-card p-8 border-white/20 shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col relative overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-black uppercase tracking-tighter italic text-emerald-500">Lyrics</h2>
          <Button onClick={onClose} variant="ghost" size="sm" className="p-2 hover:bg-white/10 text-gray-500 hover:text-white transition-all rounded-xl">
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

        <div className="flex items-center justify-between pt-6 border-t border-white/10">
           {lyricsSourceField && <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-600">Source: <span className="text-emerald-600/50">{lyricsSourceField}</span></p>}
           <Button onClick={handleCopyLyrics} disabled={!lyricsToDisplay || lyricsToDisplay === "Lyrics not available for this song." || !!copyLyricsStatus} variant="primary" size="lg" className="min-w-[160px] font-black uppercase tracking-widest" backgroundColor="#10b981">
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
  uiMode: 'classic' | 'architect';
}

export const MetadataModal: React.FC<MetadataModalProps> = ({
  isOpen, onClose, song, uiMode
}) => {
  if (!isOpen || !song) return null;

  if (uiMode === 'classic') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={onClose}>
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-2xl w-full max-w-xl max-h-[85vh] flex flex-col border-2 border-green-600" onClick={(e) => e.stopPropagation()}>
          <div className="flex justify-between items-center mb-4 border-b-2 border-gray-100 dark:border-green-600/30 pb-2"> 
            <h3 className="text-xl font-bold text-green-600 dark:text-green-600 uppercase tracking-widest">Track Intel: {song.title}</h3> 
            <button onClick={onClose} className="p-2 -mr-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white font-bold text-xl">&times;</button> 
          </div>
          <div className="overflow-y-auto text-sm text-gray-700 dark:text-gray-300 space-y-4 pr-3 scrollbar-thin">
            <div className="space-y-1">
              <strong className="text-[10px] font-bold uppercase tracking-widest text-green-600 block">Style Tags</strong> 
              <p className="font-semibold bg-gray-50 dark:bg-gray-900 p-3 rounded-lg border-2 border-gray-100 dark:border-gray-700">{song.metadata?.tags || 'None identified'}</p>
            </div>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg border-2 border-gray-100 dark:border-gray-700">
                <strong className="text-[10px] font-bold uppercase tracking-widest text-green-600 block mb-1">Model</strong>
                <p className="font-bold">{song.model_name || 'N/A'}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg border-2 border-gray-100 dark:border-gray-700">
                <strong className="text-[10px] font-bold uppercase tracking-widest text-green-600 block mb-1">Duration</strong>
                <p className="font-bold">{song.metadata?.duration ? `${song.metadata.duration.toFixed(1)}s` : 'N/A'}</p>
              </div>
            </div>
            <div className="space-y-1">
              <strong className="text-[10px] font-bold uppercase tracking-widest text-green-600 block">Generation Prompt</strong> 
              <pre className="whitespace-pre-wrap font-bold text-xs bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border-2 border-gray-100 dark:border-gray-700 max-h-40 overflow-y-auto scrollbar-thin italic opacity-80">{song.metadata?.gpt_description_prompt || 'No prompt data available'}</pre>
            </div>
            <div className="text-center pt-2 border-t-2 border-gray-100 dark:border-gray-700">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Asset Born: {new Date(song.created_at).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn" onClick={onClose}>
      <div className="glass-card p-4 sm:p-8 border-white/20 shadow-2xl w-full max-w-xl max-h-[85vh] flex flex-col relative" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-black uppercase tracking-tighter italic text-emerald-500">Metadata</h2>
          <Button onClick={onClose} variant="ghost" size="sm" className="p-2 hover:bg-white/10 text-gray-500 hover:text-white transition-all rounded-xl">
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </Button>
        </div>
        <div className="mb-8">
          <h3 className="text-2xl font-black uppercase tracking-tighter text-gray-900 dark:text-white">Track Intel</h3>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-500 mt-1">{song.title}</p>
        </div>
        
        <div className="overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-white/10 space-y-6">
          <div className="space-y-4">
            <div className="bg-white/5 dark:bg-black/20 p-4 rounded-2xl border border-white/5">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Style tags</p>
              <p className="text-sm font-bold text-gray-900 dark:text-white leading-relaxed">{song.metadata?.tags || 'None identified'}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 dark:bg-black/20 p-4 rounded-2xl border border-white/5 text-center">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Model</p>
                <p className="text-sm font-black text-gray-900 dark:text-white">{song.model_name || 'N/A'}</p>
              </div>
              <div className="bg-white/5 dark:bg-black/20 p-4 rounded-2xl border border-white/5 text-center">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Duration</p>
                <p className="text-sm font-black text-gray-900 dark:text-white">{song.metadata?.duration ? `${song.metadata.duration.toFixed(1)}s` : 'N/A'}</p>
              </div>
            </div>
            
            <div className="bg-white/5 dark:bg-black/20 p-4 rounded-2xl border border-white/5">
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
