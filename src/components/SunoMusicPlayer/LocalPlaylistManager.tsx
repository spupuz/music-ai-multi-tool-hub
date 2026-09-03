import React from 'react';
import { SavedCustomPlaylist, SunoClip } from '@/types';
import Button from '@/components/common/Button';
import { 
  ChevronDownIcon, 
  FileTxtIcon, 
  FileCsvIcon, 
  SaveIcon, 
  LoadIcon, 
  AppendIcon, 
  RefreshIcon, 
  TrashIcon 
} from '@/components/Icons';

interface LocalPlaylistManagerProps {
  showPlaylistManagement: boolean;
  setShowPlaylistManagement: (show: boolean) => void;
  handleExportCurrentPlaylistToFile: () => void;
  fileInputTxtRef: React.RefObject<HTMLInputElement | null>;
  handleImportPlaylistFromTxtFile: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fileInputCsvRef: React.RefObject<HTMLInputElement | null>;
  handleImportPlaylistFromCsvFile: (e: React.ChangeEvent<HTMLInputElement>) => void;
  newPlaylistName: string;
  setNewPlaylistName: (name: string) => void;
  handleSaveCurrentPlaylistLocally: (name: string) => void;
  savedCustomPlaylists: SavedCustomPlaylist[];
  handleLoadClick: (id: string) => void;
  handleAppendClick: (id: string) => void;
  handleUpdateClick: (id: string) => void;
  handleDeleteClick: (id: string) => void;
  loadConfirm: { id: string | null; count: number };
  appendConfirm: { id: string | null; count: number };
  updateConfirm: { id: string | null; count: number };
  deleteConfirm: { id: string | null; count: number };
  handleClearAllSavedPlaylists: () => void;
  getClearAllSavedPlaylistsButtonText: () => string;
  handleClearQueue: () => void;
  getClearQueueButtonText: () => string;
  isFetchingOrLoading: boolean;
  queueLength: number;
}

export const LocalPlaylistManager: React.FC<LocalPlaylistManagerProps> = ({
  showPlaylistManagement, setShowPlaylistManagement, handleExportCurrentPlaylistToFile,
  fileInputTxtRef, handleImportPlaylistFromTxtFile, fileInputCsvRef, handleImportPlaylistFromCsvFile,
  newPlaylistName, setNewPlaylistName, handleSaveCurrentPlaylistLocally, savedCustomPlaylists,
  handleLoadClick, handleAppendClick, handleUpdateClick, handleDeleteClick,
  loadConfirm, appendConfirm, updateConfirm, deleteConfirm,
  handleClearAllSavedPlaylists, getClearAllSavedPlaylistsButtonText,
  handleClearQueue, getClearQueueButtonText, isFetchingOrLoading, queueLength
}) => {
  return (
    <div className="mb-10">
      <Button 
        onClick={() => setShowPlaylistManagement(!showPlaylistManagement)} 
        variant="ghost"
        size="lg"
        className="w-full text-left text-xs font-black uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 dark:hover:text-emerald-300 py-6 px-10 glass-card border-gray-200 dark:border-white/10 mb-2 flex justify-between items-center group transition-all" 
        aria-expanded={showPlaylistManagement}
        aria-controls="playlist-management-panel"
      >
        <span>Library & Export <span className="opacity-40 italic ml-2">Archives</span></span>
        <ChevronDownIcon className={`w-5 h-5 transform transition-transform duration-500 ${showPlaylistManagement ? 'rotate-180' : ''}`} />
      </Button>
      {showPlaylistManagement && (
        <div id="playlist-management-panel" className="p-6 glass-card border-gray-200 dark:border-white/10 space-y-6 animate-fadeIn">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <Button 
              onClick={handleExportCurrentPlaylistToFile} 
              variant="ghost" 
              className="w-full justify-start border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/10 font-bold text-xs uppercase tracking-widest py-3 shadow-none"
              startIcon={<FileTxtIcon className="w-4 h-4 ml-1" />}
            >
              Export TXT
            </Button>
            <input type="file" ref={fileInputTxtRef} onChange={handleImportPlaylistFromTxtFile} accept=".txt" style={{ display: 'none' }} id="import-txt-playlist" />
            <label
              htmlFor="import-txt-playlist"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInputTxtRef.current?.click(); } }}
              className="flex items-center justify-start p-3 border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/10 rounded-2xl cursor-pointer text-xs font-black uppercase tracking-widest transition-all gap-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <FileTxtIcon className="w-4 h-4 ml-1 opacity-60"/> Import TXT
            </label>
            <input type="file" ref={fileInputCsvRef} onChange={handleImportPlaylistFromCsvFile} accept=".csv" style={{ display: 'none' }} id="import-csv-playlist" />
            <label
              htmlFor="import-csv-playlist"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInputCsvRef.current?.click(); } }}
              className="flex items-center justify-start p-3 border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/10 rounded-2xl cursor-pointer text-xs font-black uppercase tracking-widest transition-all gap-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <FileCsvIcon className="w-4 h-4 ml-1 opacity-60"/> Import CSV
            </label>
          </div>
          
          <div className="pt-6 border-t border-gray-200 dark:border-white/10">
            <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400 mb-4 text-center">Local Library</h4>
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <input 
                type="text" 
                value={newPlaylistName} 
                onChange={(e) => setNewPlaylistName(e.target.value)} 
                placeholder="New Playlist Name..." 
                className="flex-grow px-4 py-3 bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-2xl text-sm font-bold placeholder-gray-500 focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" 
                aria-label="New Playlist Name"
              />
              <Button 
                onClick={() => { handleSaveCurrentPlaylistLocally(newPlaylistName); setNewPlaylistName(''); }} 
                disabled={!newPlaylistName.trim()} 
                title={!newPlaylistName.trim() ? "Please enter a name for the new playlist" : undefined}
                variant="primary"
                className="font-black uppercase tracking-widest px-6"
                backgroundColor="#10b981"
                size="lg"
                startIcon={<SaveIcon className="w-4 h-4" />}
              >
                Save New
              </Button>
            </div>
            
            {savedCustomPlaylists.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto pr-2 scrollbar-thin">
                {savedCustomPlaylists.map(p => (
                  <div key={p.id} className="flex flex-col p-4 bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-3xl hover:border-emerald-500/20 transition-all group">
                    <div className="mb-4">
                       <span className="text-sm font-black text-gray-900 dark:text-white truncate block" title={p.name}>{p.name}</span>
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-600 mt-1">
                        {p.updatedAt ? `Updated: ${new Date(p.updatedAt).toLocaleDateString()}` : `Created: ${new Date(p.createdAt).toLocaleDateString()}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button onClick={() => handleLoadClick(p.id)} variant="ghost" size="sm" className="flex-1 text-[10px] font-black uppercase tracking-widest bg-blue-500/10 border-blue-500/20 text-blue-600 hover:bg-blue-500 hover:text-white" title="Load Playlist">
                        {loadConfirm.id === p.id && loadConfirm.count > 0 ? `?? (${3 - loadConfirm.count})` : "Load"}
                      </Button>
                      <Button onClick={() => handleAppendClick(p.id)} variant="ghost" size="sm" className="flex-1 text-[10px] font-black uppercase tracking-widest bg-teal-500/10 border-teal-500/20 text-teal-600 hover:bg-teal-500 hover:text-white" title="Append to Playlist">
                        {appendConfirm.id === p.id && appendConfirm.count > 0 ? `?? (${3 - appendConfirm.count})` : "Add"}
                      </Button>
                      <Button onClick={() => handleUpdateClick(p.id)} variant="ghost" size="sm" className="flex-1 text-[10px] font-black uppercase tracking-widest bg-yellow-500/10 border-yellow-500/20 text-yellow-600 hover:bg-yellow-500 hover:text-black" title="Update Playlist">
                        {updateConfirm.id === p.id && updateConfirm.count > 0 ? `?? (${3 - updateConfirm.count})` : "Refresh"}
                      </Button>
                      <Button onClick={() => handleDeleteClick(p.id)} variant="ghost" size="sm" className="flex-1 text-[10px] font-black uppercase tracking-widest bg-red-500/10 border-red-500/20 text-red-600 hover:bg-red-500 hover:text-white" title="Delete">
                        {deleteConfirm.id === p.id && deleteConfirm.count > 0 ? `?? (${3 - deleteConfirm.count})` : "Del"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {savedCustomPlaylists.length > 0 && (
              <Button onClick={handleClearAllSavedPlaylists} variant="ghost" className="mt-6 w-full border-red-500/20 text-red-600 hover:bg-red-500/10 font-black uppercase tracking-widest text-xs py-3">
                {getClearAllSavedPlaylistsButtonText()}
              </Button>
            )}
          </div>
          
          <div className="pt-6 border-t border-gray-200 dark:border-white/10">
            <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-red-600 dark:text-red-400 mb-4 text-center">Safety</h4>
            <Button
              onClick={handleClearQueue}
              disabled={isFetchingOrLoading || queueLength === 0}
              title={(isFetchingOrLoading || queueLength === 0) ? "Cannot clear queue while empty or loading" : undefined}
              variant="ghost"
              className="w-full border-red-600 text-red-600 dark:text-red-500 hover:bg-red-600 hover:text-white font-black uppercase tracking-widest text-xs py-3"
            >
              {getClearQueueButtonText()}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
