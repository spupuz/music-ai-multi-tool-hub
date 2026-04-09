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
  uiMode: 'classic' | 'architect';
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
  uiMode, showPlaylistManagement, setShowPlaylistManagement, handleExportCurrentPlaylistToFile,
  fileInputTxtRef, handleImportPlaylistFromTxtFile, fileInputCsvRef, handleImportPlaylistFromCsvFile,
  newPlaylistName, setNewPlaylistName, handleSaveCurrentPlaylistLocally, savedCustomPlaylists,
  handleLoadClick, handleAppendClick, handleUpdateClick, handleDeleteClick,
  loadConfirm, appendConfirm, updateConfirm, deleteConfirm,
  handleClearAllSavedPlaylists, getClearAllSavedPlaylistsButtonText,
  handleClearQueue, getClearQueueButtonText, isFetchingOrLoading, queueLength
}) => {
  if (uiMode === 'classic') {
    return (
      <div className="mb-6">
        <button onClick={() => setShowPlaylistManagement(!showPlaylistManagement)} className="w-full text-left text-md font-bold text-green-600 dark:text-green-600 hover:text-green-500 py-2 px-2 mb-2 flex justify-between items-center uppercase tracking-widest border-b-2 border-gray-100 dark:border-green-600/30" aria-expanded={showPlaylistManagement}>
          Playlist Import/Export & Local Saves
          <ChevronDownIcon className={`w-4 h-4 transform transition-transform ${showPlaylistManagement ? 'rotate-180' : ''}`} />
        </button>
        {showPlaylistManagement && (
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-green-600/30 space-y-4 text-xs shadow-inner">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              <button onClick={handleExportCurrentPlaylistToFile} className="py-2 px-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-md border-2 border-blue-700/30 flex items-center justify-center transition-colors uppercase tracking-widest"><FileTxtIcon />&nbsp;Export to TXT</button>
              <input type="file" ref={fileInputTxtRef} onChange={handleImportPlaylistFromTxtFile} accept=".txt" style={{ display: 'none' }} id="import-txt-playlist" />
              <label htmlFor="import-txt-playlist" className="py-2 px-3 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-md border-2 border-teal-700/30 flex items-center justify-center cursor-pointer transition-colors uppercase tracking-widest"><FileTxtIcon />&nbsp;Import TXT</label>
              <input type="file" ref={fileInputCsvRef} onChange={handleImportPlaylistFromCsvFile} accept=".csv" style={{ display: 'none' }} id="import-csv-playlist" />
              <label htmlFor="import-csv-playlist" className="py-2 px-3 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-md border-2 border-teal-700/30 flex items-center justify-center cursor-pointer transition-colors uppercase tracking-widest"><FileCsvIcon />&nbsp;Import CSV</label>
            </div>
            <div className="pt-2 border-t-2 border-gray-300 dark:border-green-700/30">
              <h4 className="text-sm font-bold text-green-700 dark:text-green-600 mb-2 uppercase tracking-widest">Local Named Playlists</h4>
              <div className="flex flex-col sm:flex-row gap-2 mb-3">
                <input type="text" value={newPlaylistName} onChange={(e) => setNewPlaylistName(e.target.value)} placeholder="Enter playlist name..." className="flex-grow px-3 py-2 bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-green-600 rounded-md text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 text-gray-900 dark:text-white font-bold" />
                <button onClick={() => { handleSaveCurrentPlaylistLocally(newPlaylistName); setNewPlaylistName(''); }} disabled={!newPlaylistName.trim()} className="py-2 px-4 bg-green-600 hover:bg-green-500 text-white font-bold rounded-md border-2 border-green-700/30 flex items-center justify-center disabled:opacity-50 transition-colors uppercase tracking-widest"><SaveIcon />&nbsp;Save New</button>
              </div>
              {savedCustomPlaylists.length > 0 && (
                <div className="max-h-32 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-500 scrollbar-track-gray-200 dark:scrollbar-track-gray-700 space-y-1.5">
                  {savedCustomPlaylists.map(p => (
                    <div key={p.id} className="flex justify-between items-center p-2 bg-white dark:bg-gray-700/50 rounded-lg border-2 border-gray-200 dark:border-gray-700 shadow-sm transition-all hover:border-green-600/30">
                      <div className="flex-grow min-w-0 pr-2">
                        <span className="text-gray-900 dark:text-white font-bold truncate block" title={p.name}>{p.name}</span>
                        <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400">
                          {p.updatedAt ? `Updated: ${new Date(p.updatedAt).toLocaleDateString()}` : `Created: ${new Date(p.createdAt).toLocaleDateString()}`}
                        </p>
                      </div>
                      <div className="flex-shrink-0 flex items-center space-x-1.5">
                        <button onClick={() => handleLoadClick(p.id)} className="py-1 px-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded border-2 border-blue-700/30 min-w-[3.5rem] text-center transition-colors uppercase tracking-tighter" title="Load Playlist (replaces queue)">
                          {loadConfirm.id === p.id && loadConfirm.count > 0 ? `? (${3 - loadConfirm.count})` : <LoadIcon className="w-3.5 h-3.5 mx-auto" />}
                        </button>
                        <button onClick={() => handleAppendClick(p.id)} className="py-1 px-2 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded border-2 border-teal-700/30 min-w-[3.5rem] text-center transition-colors uppercase tracking-tighter" title="Append content to this playlist">
                          {appendConfirm.id === p.id && appendConfirm.count > 0 ? `? (${3 - appendConfirm.count})` : <AppendIcon className="w-4 h-4 mx-auto" />}
                        </button>
                        <button onClick={() => handleUpdateClick(p.id)} className="py-1 px-2 bg-yellow-600 hover:bg-yellow-500 text-white font-bold rounded border-2 border-yellow-700/30 min-w-[3.5rem] text-center transition-colors uppercase tracking-tighter" title="Update this playlist from queue">
                          {updateConfirm.id === p.id && updateConfirm.count > 0 ? `? (${3 - updateConfirm.count})` : <RefreshIcon className="w-3.5 h-3.5 mx-auto" />}
                        </button>
                        <button onClick={() => handleDeleteClick(p.id)} className="py-1 px-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded border-2 border-red-700/30 min-w-[3.5rem] text-center transition-colors uppercase tracking-tighter" title="Delete Playlist">
                          {deleteConfirm.id === p.id && deleteConfirm.count > 0 ? `? (${3 - deleteConfirm.count})` : <TrashIcon className="w-3.5 h-3.5 mx-auto" />}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {savedCustomPlaylists.length > 0 && <button onClick={handleClearAllSavedPlaylists} className="mt-3 w-full py-2 px-3 bg-red-700 hover:bg-red-600 text-white font-bold rounded-md border-2 border-red-800/30 text-xs uppercase tracking-widest transition-colors">{getClearAllSavedPlaylistsButtonText()}</button>}
            </div>
            <div className="pt-2 mt-2 border-t-2 border-gray-300 dark:border-green-700/30">
              <h4 className="text-sm font-bold text-red-600 dark:text-red-400 mb-1.5 uppercase tracking-widest">Danger Zone</h4>
              <button
                onClick={handleClearQueue}
                disabled={isFetchingOrLoading || queueLength === 0}
                className="w-full py-2 px-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-md border-2 border-red-700/30 text-xs uppercase tracking-widest disabled:opacity-50 transition-colors"
              >
                {getClearQueueButtonText()}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="mb-10">
      <Button 
        onClick={() => setShowPlaylistManagement(!showPlaylistManagement)} 
        variant="ghost"
        size="lg"
        className="w-full text-left text-xs font-black uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 dark:hover:text-emerald-300 py-6 px-10 glass-card border-white/10 mb-2 flex justify-between items-center group transition-all" 
        aria-expanded={showPlaylistManagement}
      >
        <span>Library & Export <span className="opacity-40 italic ml-2">Archives</span></span>
        <ChevronDownIcon className={`w-5 h-5 transform transition-transform duration-500 ${showPlaylistManagement ? 'rotate-180' : ''}`} />
      </Button>
      {showPlaylistManagement && (
        <div className="p-6 glass-card border-white/10 space-y-6 animate-fadeIn">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <Button 
              onClick={handleExportCurrentPlaylistToFile} 
              variant="ghost" 
              className="w-full justify-start border-white/10 hover:bg-white/10 font-bold text-xs uppercase tracking-widest py-3 shadow-none"
              startIcon={<FileTxtIcon className="w-4 h-4 ml-1" />}
            >
              Export TXT
            </Button>
            <input type="file" ref={fileInputTxtRef} onChange={handleImportPlaylistFromTxtFile} accept=".txt" style={{ display: 'none' }} id="import-txt-playlist" />
            <label htmlFor="import-txt-playlist" className="flex items-center justify-start p-3 border border-white/10 hover:bg-white/10 rounded-2xl cursor-pointer text-xs font-black uppercase tracking-widest transition-all gap-3">
              <FileTxtIcon className="w-4 h-4 ml-1 opacity-60"/> Import TXT
            </label>
            <input type="file" ref={fileInputCsvRef} onChange={handleImportPlaylistFromCsvFile} accept=".csv" style={{ display: 'none' }} id="import-csv-playlist" />
            <label htmlFor="import-csv-playlist" className="flex items-center justify-start p-3 border border-white/10 hover:bg-white/10 rounded-2xl cursor-pointer text-xs font-black uppercase tracking-widest transition-all gap-3">
              <FileCsvIcon className="w-4 h-4 ml-1 opacity-60"/> Import CSV
            </label>
          </div>
          
          <div className="pt-6 border-t border-white/10">
            <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400 mb-4 text-center">Local Library</h4>
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <input 
                type="text" 
                value={newPlaylistName} 
                onChange={(e) => setNewPlaylistName(e.target.value)} 
                placeholder="New Playlist Name..." 
                className="flex-grow px-4 py-3 bg-white/10 dark:bg-black/20 border border-white/10 rounded-2xl text-sm font-bold placeholder-gray-500 focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" 
              />
              <Button 
                onClick={() => { handleSaveCurrentPlaylistLocally(newPlaylistName); setNewPlaylistName(''); }} 
                disabled={!newPlaylistName.trim()} 
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
                  <div key={p.id} className="flex flex-col p-4 bg-white/5 dark:bg-black/20 border border-white/10 rounded-3xl hover:border-emerald-500/20 transition-all group">
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
          
          <div className="pt-6 border-t border-white/10">
            <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-red-600 dark:text-red-400 mb-4 text-center">Safety</h4>
            <Button
              onClick={handleClearQueue}
              disabled={isFetchingOrLoading || queueLength === 0}
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
