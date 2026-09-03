import React from 'react';
import { ChevronDownIcon } from '@/components/Icons';
import PlaylistCreationDateChart from '@/components/sunoUserStats/charts/PlaylistCreationDateChart';
import { PlaylistAnalysis } from '@/types';

interface AnalysisPanelProps {
  showAnalysis: boolean;
  setShowAnalysis: (show: boolean) => void;
  playlistAnalysis: PlaylistAnalysis;
  currentIdentifierType: string;
}

export const AnalysisPanel: React.FC<AnalysisPanelProps> = ({
  showAnalysis,
  setShowAnalysis,
  playlistAnalysis,
  currentIdentifierType
}) => {
  if (!playlistAnalysis) return null;

  return (
    <details className="mb-8 glass-card border-gray-200 dark:border-white/10 overflow-hidden" open={showAnalysis} onToggle={(e) => setShowAnalysis((e.target as HTMLDetailsElement).open)}>
      <summary className="p-6 text-xs font-black uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-400 cursor-pointer hover:bg-gray-100 dark:hover:bg-white/5 rounded-t-3xl transition-all flex justify-between items-center group">
        <span>
          {currentIdentifierType === 'playlist' ? 'Playlist Analysis' : 'Song List Analysis'}
        </span>
        <span className={`transform transition-transform duration-500 opacity-40 group-hover:opacity-100 ${showAnalysis ? 'rotate-180' : ''}`}>
           <ChevronDownIcon className="w-4 h-4" />
        </span>
      </summary>
      <div className="p-6 border-t border-gray-200 dark:border-white/10 space-y-8 animate-fadeIn">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-black/20 p-4 rounded-2xl border border-gray-200 dark:border-white/5 text-center">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Total Plays</p>
            <p className="text-2xl font-black text-gray-900 dark:text-white tabular-nums">{playlistAnalysis.totalPlays.toLocaleString()}</p>
          </div>
          <div className="bg-white dark:bg-black/20 p-4 rounded-2xl border border-gray-200 dark:border-white/5 text-center">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Total Upvotes</p>
            <p className="text-2xl font-black text-gray-900 dark:text-white tabular-nums">{playlistAnalysis.totalUpvotes.toLocaleString()}</p>
          </div>
          <div className="bg-white dark:bg-black/20 p-4 rounded-2xl border border-gray-200 dark:border-white/5 text-center">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Total Comments</p>
            <p className="text-2xl font-black text-gray-900 dark:text-white tabular-nums">{playlistAnalysis.totalComments.toLocaleString()}</p>
          </div>
          <div className="bg-white dark:bg-black/20 p-4 rounded-2xl border border-gray-200 dark:border-white/5 text-center">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Avg. Plays</p>
            <p className="text-2xl font-black text-gray-900 dark:text-white tabular-nums">{playlistAnalysis.avgPlays.toFixed(0)}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
          <div className="space-y-4">
            <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-400">Top Tags</h4>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-2 scrollbar-thin">
              {playlistAnalysis.mostCommonTags.length > 0 ? playlistAnalysis.mostCommonTags.map(tag => (
                <div key={tag.name} className="flex justify-between items-center bg-slate-50/50 dark:bg-black/10 p-2.5 rounded-xl border border-gray-100 dark:border-white/5 group hover:border-emerald-500/20 transition-all">
                  <span className="font-bold text-gray-700 dark:text-gray-300 truncate">{tag.name}</span>
                  <span className="font-black text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg">{tag.count}</span>
                </div>
              )) : <p className="text-gray-500 italic text-xs">No tags found</p>}
            </div>
          </div>
          <div className="space-y-4">
            <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-400">Genres</h4>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-2 scrollbar-thin">
              {playlistAnalysis.mostCommonGenres.length > 0 ? playlistAnalysis.mostCommonGenres.map(genre => (
                <div key={genre.name} className="flex justify-between items-center bg-slate-50/50 dark:bg-black/10 p-2.5 rounded-xl border border-gray-100 dark:border-white/5 group hover:border-emerald-500/20 transition-all">
                  <span className="font-bold text-gray-700 dark:text-gray-300 truncate">{genre.name}</span>
                  <span className="font-black text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg">{genre.count}</span>
                </div>
              )) : <p className="text-gray-500 italic text-xs">No genres found</p>}
            </div>
          </div>
          <div className="space-y-4">
            <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-400">Artists</h4>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-2 scrollbar-thin">
              {playlistAnalysis.mostFeaturedArtists.length > 0 ? playlistAnalysis.mostFeaturedArtists.map(artist => (
                <div key={artist.handle} className="flex justify-between items-center bg-slate-50/50 dark:bg-black/10 p-2.5 rounded-xl border border-gray-100 dark:border-white/5 group hover:border-emerald-500/20 transition-all">
                  <span className="font-bold text-gray-700 dark:text-gray-300 truncate">{artist.name}</span>
                   <span className="font-black text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg">{artist.count}</span>
                </div>
              )) : <p className="text-gray-500 italic text-xs">No artists featured</p>}
            </div>
          </div>
        </div>

        <div className="pt-4">
          <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400 text-center mb-6">Timeline Analysis</h4>
          <div className="h-64 p-4 glass-card border-gray-100 dark:border-white/5 bg-slate-50/50 dark:bg-black/20 rounded-3xl">
            <PlaylistCreationDateChart 
              data={playlistAnalysis.creationDateDistribution} 
              fontColor={document.documentElement.classList.contains('dark') ? '#9ca3af' : '#4b5563'} 
              gridColor={document.documentElement.classList.contains('dark') ? '#37415122' : '#d1d5db22'} 
            />
          </div>
        </div>
      </div>
    </details>
  );
};
