
import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import type { ToolProps } from './Layout';
import { useSunoUserStatsData } from './hooks/useSunoUserStatsData';
import Spinner from './components/Spinner';
import UserProfileCard from './components/sunoUserStats/UserProfileCard';
import StatDisplayCard from './components/sunoUserStats/StatDisplayCard';
import StatChartsArea from './components/sunoUserStats/StatChartsArea'; 
import DetailedSongPerformanceTable from './components/sunoUserStats/DetailedSongPerformanceTable'; 
import SongLifecycleChartModal from './components/sunoUserStats/charts/SongLifecycleChartModal';
import type { SunoClip } from './types';
import type { SongInteractionPoint } from './types/sunoUserStatsTypes';


// Icons for Stat Cards
const TotalPlaysIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
  </svg>
);
const TotalUpvotesIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" }) => (
 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
  </svg>
);
const TotalCommentsIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" }) => ( 
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.068.158 2.148.279 3.238.364.466.037.893.281 1.153.671L12 21l2.652-1.978c.26-.191.687-.435 1.153-.67 1.09-.086 2.17-.206 3.238-.365 1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
  </svg>
);
const DurationIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const SongIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z" />
  </svg>
);
const CalendarDaysIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-3.75h.008v.008H12v-.008z" />
  </svg>
);
const ClockIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const GrowthIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.0049L8.13187 12.1231C8.52043 11.7345 9.1536 11.7345 9.54216 12.1231L13.2071 15.7881C13.5976 16.1786 14.2308 16.1786 14.6213 15.7881L21.75 8.66116M21.75 8.66116V13.1612M21.75 8.66116H17.25" />
    </svg>
);
const AlertIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5 mr-2" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
    </svg>
);
const TargetIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-2.474-1.956-2.225H11.25M16.6 16.6l-2.225-2.51.569-2.474-2.225-1.956v2.687M16.6 16.6L19.5 14m-2.928 2.628L17.071 13m-4.242 0h.008v.008H12.83v-.008zm0 0h.008v.008H12.83v-.008zm0 0h.008v.008H12.83v-.008zm0 0h.008v.008H12.83v-.008zM12 21a9 9 0 110-18 9 9 0 010 18z" />
  </svg>
);
const TableIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125V6.375m1.125 13.125A1.125 1.125 0 005.25 21h13.5A1.125 1.125 0 0020.625 19.5m-17.25 0V6.375m0 0A1.125 1.125 0 015.25 5.25h13.5A1.125 1.125 0 0120.625 6.375m0 0v11.25A1.125 1.125 0 0118.75 19.5m-16.5-13.125a1.125 1.125 0 00-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125M20.625 6.375c0-.621-.504-1.125-1.125-1.125M18.75 5.25c.621 0 1.125.504 1.125 1.125M3.375 5.25c-.621 0-1.125.504-1.125 1.125M5.25 5.25c.621 0 1.125.504 1.125 1.125m0 0v0M12 5.25v0m6.75 0v0m-6.75 13.125V6.375m0 13.125v0m0 0H5.25m6.75 0H18.75m-13.5 0V6.375m13.5 0V6.375" />
  </svg>
);
const SigmaIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" }) => ( 
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636M15.75 5.25H8.25" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 3.75H9"/>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 20.25H9"/>
    </svg>
);
const BullseyeIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" }) => ( 
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="12" cy="12" r="2" fill="currentColor"/>
    </svg>
);
const FilterIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4 mr-1" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.044 1.887L10.5 21.75M3 4.774c.533-.09 1.064-.173 1.593-.253V15L10.5 18M3 4.774v2.927c0 .539.204 1.055.579 1.449L8.25 15M15 4.774v2.927c0 .539-.204 1.055-.579 1.449L9 13.5" />
  </svg>
);

const ExportIcon: React.FC<{ className?: string }> = ({ className = "w-3.5 h-3.5" }) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9.75v6.75m0 0l-3-3m3 3l3-3m-8.25 6a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" /></svg>);
const ImportIcon: React.FC<{ className?: string }> = ({ className = "w-3.5 h-3.5" }) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" /></svg>);


const TOOL_CATEGORY_STATS_TOOL = 'SunoUserStatsTool'; 
const CLEAR_CLICKS_NEEDED_USER = 3; 
const CLEAR_CLICKS_NEEDED_GLOBAL = 3; 
const CLEAR_TIMEOUT_MS = 3000;

const knownAppLocalStorageKeys = [ 
  'aiMultiToolHub_cookieConsent', 'myVisitsLog', 'lastDailyLocalActivePing',
  'musicStyleHistory_v2', 'musicStyleFavorites_v2', 'RMS_optionalCategoryToggles_v1',
  'creativeConceptHistory_v2', 'creativeConceptFavorites_v2',
  'chordProgFavorites_v1',
  'sunoMusicPlayer_eqBands_v1', 'sunoMusicPlayer_volume_v1',
  'deckPickerPickedSongsLog_v1',
  'lyricsToProcessForLyricProcessor',
  'songCoverArt_savedStylePresets_v1',
  'SCS_savedWheelConfigs_MagicSpinWheel_v3',
  'sparkTuneChallenges_v1',
];
const knownAppLocalStoragePrefixes = [ 
  'stat_', 'statEvents_',
  'RMS_custom_', 'CCB_custom_',
  'sunoUserStats_', 
  'sunoMusicPlayer_',
  'SCS_current_MagicSpinWheel_v3_',
];


const SunoUserStatsTool: React.FC<ToolProps> = ({ trackLocalEvent }) => {
  const {
    username,
    setUsername,
    storedData,
    isLoading,
    error,
    progressMessage,
    fetchUserData,
    updateUserData,
    clearUserData: clearSpecificUserStatsData,
    exportUserDataSnapshot, 
    importUserDataSnapshot, 
    exportImportStatusMessage, 
  } = useSunoUserStatsData(trackLocalEvent);

  const [topNValue, setTopNValue] = useState(10);
  const [isDetailedTableOpen, setIsDetailedTableOpen] = useState(false);

  const [clearCurrentUserCacheClickCount, setClearCurrentUserCacheClickCount] = useState(0);
  const [clearAllHubDataClickCount, setClearAllHubDataClickCount] = useState(0);
  const [dataManagementStatus, setDataManagementStatus] = useState(''); 
  const clearDataTimeoutRef = useRef<number | null>(null);
  const importFileRef = useRef<HTMLInputElement>(null); 

  const [isLifecycleModalOpen, setIsLifecycleModalOpen] = useState(false);
  const [selectedSongForLifecycle, setSelectedSongForLifecycle] = useState<SunoClip | null>(null);
  const [selectedSongHistoryForLifecycle, setSelectedSongHistoryForLifecycle] = useState<SongInteractionPoint[] | null>(null);

  const [activeTableFilters, setActiveTableFilters] = useState<{ type: string; value: string } | null>(null);


  const mainButtonAction = useCallback(() => {
    if (storedData && username.trim().toLowerCase().replace(/^@/, '') === storedData.username) {
      updateUserData();
    } else {
      fetchUserData();
    }
  }, [username, storedData, fetchUserData, updateUserData]);

  const mainButtonText = useMemo(() => {
    if (isLoading) return 'Processing...';
    if (storedData && username.trim().toLowerCase().replace(/^@/, '') === storedData.username) {
      return `Update Stats for @${storedData.profile.handle}`;
    }
    return 'Fetch / View Stats';
  }, [isLoading, username, storedData]);


  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 420) { setTopNValue(3); } else if (width < 768) { setTopNValue(5); } else { setTopNValue(10); }
    };
    handleResize(); window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); if (username.trim() && !isLoading) mainButtonAction(); };
  const formatDuration = (seconds: number | undefined | null): string => { if (seconds === undefined || seconds === null || isNaN(seconds)) return 'N/A'; const m = Math.floor(seconds/60); const rS = Math.floor(seconds%60); return `${m}m ${rS}s`; };
  const formatNumber = (num: number | undefined | null, precision: number = 0, showPlusSignForPositive: boolean = false): string => { if (num === undefined || num === null || isNaN(num)) return 'N/A'; const sign = showPlusSignForPositive && num > 0 ? '+' : ''; return sign + num.toLocaleString(undefined, { minimumFractionDigits: precision, maximumFractionDigits: precision }); };
  const formatPercentage = (num: number | undefined | null): string => { if (num === undefined || num === null || isNaN(num)) return 'N/A'; const sign = num > 0 ? '+' : ''; return `${sign}${num.toFixed(2)}%`; };
  const formatLastFetched = (isoString: string | undefined): string => { if (!isoString) return 'N/A'; try { return new Date(isoString).toLocaleString(); } catch { return 'Invalid Date'; }};

  const handleClearCurrentUserCache = useCallback(() => {
    if (!storedData?.username) return; if (clearDataTimeoutRef.current) clearTimeout(clearDataTimeoutRef.current);
    const newClickCount = clearCurrentUserCacheClickCount + 1; setClearCurrentUserCacheClickCount(newClickCount);
    if (newClickCount >= CLEAR_CLICKS_NEEDED_USER) { clearSpecificUserStatsData(); setDataManagementStatus(`Cache cleared for @${storedData.username}.`); trackLocalEvent(TOOL_CATEGORY_STATS_TOOL,'currentUserCacheCleared',storedData.username,1); setClearCurrentUserCacheClickCount(0); clearDataTimeoutRef.current=null; setTimeout(()=>setDataManagementStatus(''),CLEAR_TIMEOUT_MS); } 
    else { setDataManagementStatus(`Click ${CLEAR_CLICKS_NEEDED_USER-newClickCount} more times to clear cache for @${storedData.profile.handle}.`); clearDataTimeoutRef.current=window.setTimeout(()=>{setClearCurrentUserCacheClickCount(0);setDataManagementStatus('');clearDataTimeoutRef.current=null;},CLEAR_TIMEOUT_MS); }
  }, [storedData, clearCurrentUserCacheClickCount, clearSpecificUserStatsData, trackLocalEvent]);
  const getClearCurrentUserCacheButtonText = useCallback(() => { if(clearCurrentUserCacheClickCount > 0 && clearCurrentUserCacheClickCount < CLEAR_CLICKS_NEEDED_USER){ return `Confirm Clear (${CLEAR_CLICKS_NEEDED_USER - clearCurrentUserCacheClickCount} left)`;} return `Clear Cache for @${storedData?.profile?.handle || 'User'}`;}, [clearCurrentUserCacheClickCount, storedData]);
  const handleClearAllHubDataFromStatsTool = useCallback(() => {
    if (clearDataTimeoutRef.current) clearTimeout(clearDataTimeoutRef.current); const newClickCount = clearAllHubDataClickCount + 1; setClearAllHubDataClickCount(newClickCount);
    if (newClickCount >= CLEAR_CLICKS_NEEDED_GLOBAL) { try { knownAppLocalStorageKeys.forEach(key => localStorage.removeItem(key)); knownAppLocalStoragePrefixes.forEach(prefix => { Object.keys(localStorage).forEach(key => { if(key.startsWith(prefix)) localStorage.removeItem(key); }); }); setDataManagementStatus('All App Hub data cleared.'); trackLocalEvent(TOOL_CATEGORY_STATS_TOOL, 'allHubDataClearedFromTool', 'SunoUserStatsTool', 1); clearSpecificUserStatsData(); setUsername(''); } catch (error) { setDataManagementStatus('Failed to clear all Hub data. See console.'); } setClearAllHubDataClickCount(0); clearDataTimeoutRef.current = null; setTimeout(() => setDataManagementStatus(''), CLEAR_TIMEOUT_MS); } 
    else { setDataManagementStatus(`Click ${CLEAR_CLICKS_NEEDED_GLOBAL - newClickCount} more times to clear ALL HUB DATA.`); clearDataTimeoutRef.current = window.setTimeout(() => {setClearAllHubDataClickCount(0); setDataManagementStatus(''); clearDataTimeoutRef.current = null;},CLEAR_TIMEOUT_MS);}
  }, [trackLocalEvent, clearAllHubDataClickCount, setUsername, clearSpecificUserStatsData]);
  const getClearAllHubDataButtonText = useCallback(() => { if (clearAllHubDataClickCount > 0 && clearAllHubDataClickCount < CLEAR_CLICKS_NEEDED_GLOBAL) return `Confirm Clear ALL (${CLEAR_CLICKS_NEEDED_GLOBAL - clearAllHubDataClickCount} left)`; return 'Clear All My Hub Data'; }, [clearAllHubDataClickCount]);
  useEffect(() => { return () => { if (clearDataTimeoutRef.current) clearTimeout(clearDataTimeoutRef.current); }; }, []);

  const openLifecycleModal = useCallback((song: SunoClip) => {
    setSelectedSongForLifecycle(song);
    setSelectedSongHistoryForLifecycle(storedData?.aggregatedStats?.songInteractionHistory[song.id] || []);
    setIsLifecycleModalOpen(true);
    trackLocalEvent(TOOL_CATEGORY_STATS_TOOL, 'lifecycleModalOpened', song.title);
  }, [storedData, trackLocalEvent]);

  const handleSetFilter = useCallback((filterType: string, filterValue: string) => {
    setActiveTableFilters({ type: filterType, value: filterValue });
    setIsDetailedTableOpen(true); 
    trackLocalEvent(TOOL_CATEGORY_STATS_TOOL, 'tableFilterSet', `${filterType}:${filterValue}`);
  }, [trackLocalEvent]);

  const handleClearFilters = useCallback(() => {
    setActiveTableFilters(null);
    trackLocalEvent(TOOL_CATEGORY_STATS_TOOL, 'tableFiltersCleared');
  }, [trackLocalEvent]);

  const handleImportClick = () => {
    importFileRef.current?.click();
  };

  return (
    <div className="w-full">
      <header className="mb-6 md:mb-10 text-center px-2"> 
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-green-600 dark:text-green-400 break-words">Suno User Stats</h1> 
        <p className="mt-3 text-sm md:text-md text-gray-700 dark:text-gray-300 max-w-2xl mx-auto"> Enter a Suno username to fetch and view their profile statistics and song data. Data is stored locally in your browser. </p> 
      </header>
      <main className="w-full bg-white dark:bg-gray-900 shadow-2xl rounded-lg p-0 sm:p-6 md:p-10 border-2 border-green-600 dark:border-green-500 overflow-hidden">
        <form onSubmit={handleSubmit} className="mb-6 flex flex-col sm:flex-row items-stretch gap-2">
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Enter Suno Username" className="flex-grow px-4 py-2 bg-gray-100 dark:bg-gray-800 border-2 border-green-500 rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 text-gray-900 dark:text-white text-sm" aria-label="Suno Username" disabled={isLoading} />
          <button type="submit" disabled={isLoading || !username.trim()} className="px-6 py-2 bg-green-500 text-black font-semibold rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-900 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:text-gray-500 dark:disabled:text-gray-400 transition-colors flex items-center justify-center text-sm"> {isLoading ? <Spinner size="w-4 h-4 mr-2" color="text-black" /> : null} {mainButtonText} </button>
        </form>
        <div className="mb-6 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-md font-semibold text-green-600 dark:text-green-300 mb-2">Data Management</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                <button onClick={handleClearCurrentUserCache} disabled={isLoading || !storedData} className="flex-1 py-1.5 px-3 border border-red-500 text-red-600 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-700 hover:text-red-800 dark:hover:text-white rounded-md text-xs font-medium disabled:opacity-50 transition-colors"> {getClearCurrentUserCacheButtonText()} </button>
                <button onClick={exportUserDataSnapshot} disabled={isLoading || !storedData} className="flex-1 py-1.5 px-3 border border-blue-500 text-blue-600 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-700 hover:text-blue-800 dark:hover:text-white rounded-md text-xs font-medium disabled:opacity-50 transition-colors flex items-center justify-center gap-1.5"><ExportIcon />Export User Data</button>
                <input type="file" ref={importFileRef} accept=".json" onChange={(e) => e.target.files && e.target.files[0] && importUserDataSnapshot(e.target.files[0])} style={{display: 'none'}} id="import-user-stats-file"/>
                <button onClick={handleImportClick} disabled={isLoading} className="flex-1 py-1.5 px-3 border border-teal-500 text-teal-600 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-700 hover:text-teal-800 dark:hover:text-white rounded-md text-xs font-medium disabled:opacity-50 transition-colors flex items-center justify-center gap-1.5"><ImportIcon/>Import User Data</button>
                <button onClick={handleClearAllHubDataFromStatsTool} disabled={isLoading && clearAllHubDataClickCount < (CLEAR_CLICKS_NEEDED_GLOBAL -1) } className="lg:col-start-4 flex-1 py-1.5 px-3 bg-gray-200 dark:bg-gray-700 hover:bg-red-100 dark:hover:bg-red-800 text-gray-800 dark:text-gray-200 hover:text-red-800 dark:hover:text-white border border-red-600 rounded-md text-xs font-medium shadow-sm transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed" aria-label="Clear all locally stored hub data"> {getClearAllHubDataButtonText()} </button>
            </div>
            {dataManagementStatus && ( <p className={`mt-2 text-sm ${dataManagementStatus.includes('Failed') ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-300'}`}> {dataManagementStatus} </p> )}
            {exportImportStatusMessage && ( <p className={`mt-2 text-sm ${exportImportStatusMessage.includes('Failed') || exportImportStatusMessage.includes('failed') ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-300'}`}>{exportImportStatusMessage}</p>)}
        </div>
        {isLoading && progressMessage && ( <div className="my-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-md text-sm text-green-600 dark:text-green-300 text-center animate-pulse" role="status"> {progressMessage} </div> )}
        {error && ( <div className="my-4 p-3 bg-red-100 dark:bg-red-900/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-md text-sm text-center" role="alert"> {error} </div> )}
        {storedData && (
          <div className={`mt-8 transition-opacity duration-300 ${isLoading ? 'opacity-60 pointer-events-none' : 'opacity-100'}`}>
            <UserProfileCard profile={storedData.profile} />
             {storedData.lastFetched && ( <p className="text-xs text-gray-500 dark:text-gray-500 text-center -mt-4 mb-6"> Data last fetched: {formatLastFetched(storedData.lastFetched)} </p> )}
            <section className="my-6">
              <h3 className="text-2xl font-semibold text-green-600 dark:text-green-300 mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">Song & Profile Statistics</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                <StatDisplayCard title="Total Songs" value={formatNumber(storedData.aggregatedStats?.totalSongs)} icon={<SongIcon />} tooltipText="Total number of public songs fetched for this user." />
                <StatDisplayCard title="Total Music Duration" value={formatDuration(storedData.aggregatedStats?.totalDurationSec)} icon={<DurationIcon />} tooltipText="Combined duration of all fetched public songs." />
                <StatDisplayCard title="Avg Song Duration" value={formatDuration(storedData.aggregatedStats?.avgDurationSec)} icon={<DurationIcon className="opacity-70"/>} tooltipText="Average length of a song for this user."/>
                <StatDisplayCard title="Avg Plays / Song" value={formatNumber(storedData.aggregatedStats?.avgPlaysPerSong, 1)} icon={<TotalPlaysIcon className="opacity-70"/>} tooltipText="Average number of plays received per song." />
                <StatDisplayCard title="Avg Upvotes / Song" value={formatNumber(storedData.aggregatedStats?.avgUpvotesPerSong, 1)} icon={<TotalUpvotesIcon className="opacity-70"/>} tooltipText="Average number of upvotes received per song." />
                <StatDisplayCard title="Avg Comments / Song" value={formatNumber(storedData.aggregatedStats?.avgCommentsPerSong, 1)} icon={<TotalCommentsIcon className="opacity-70"/>} tooltipText="Average number of comments received per song." /> 
                <StatDisplayCard title="Avg. Upvote Rate (Songs >20p)" value={`${formatNumber(storedData.aggregatedStats?.avgSongUpvoteRate, 2)}%`} icon={<TargetIcon />} tooltipText="Average upvotes per play for songs with over 20 plays. Calculated as (Upvotes / Plays) * 100." />
                <StatDisplayCard title="Avg. Comment Rate (Songs >20p)" value={`${formatNumber(storedData.aggregatedStats?.avgCommentRatePer1000Plays, 1)} / 1k plays`} icon={<TotalCommentsIcon />} tooltipText="Average comments per 1000 plays for songs with over 20 plays." />
                <StatDisplayCard title="Follower Growth (7d)" value={`${formatPercentage(storedData.aggregatedStats?.followerGrowthRate7dPercentage)}`} description={`Absolute: ${formatNumber(storedData.aggregatedStats?.followerAbsoluteIncrease7d, 0, true)}`} icon={<GrowthIcon />} tooltipText="Percentage change in followers over the last 7 days, based on stored data snapshots. Absolute change also shown."/>
                <StatDisplayCard title="Follower Growth (30d)" value={`${formatPercentage(storedData.aggregatedStats?.followerGrowthRate30dPercentage)}`} description={`Absolute: ${formatNumber(storedData.aggregatedStats?.followerAbsoluteIncrease30d, 0, true)}`} icon={<GrowthIcon />} tooltipText="Percentage change in followers over the last 30 days, based on stored data snapshots. Absolute change also shown." />
                <StatDisplayCard title="Longest Song" value={storedData.aggregatedStats?.longestSong?.title || 'N/A'} description={formatDuration(storedData.aggregatedStats?.longestSong?.metadata?.duration)} icon={<SongIcon />} tooltipText="The title and duration of the longest song found." />
                <StatDisplayCard title="Shortest Song" value={storedData.aggregatedStats?.shortestSong?.title || 'N/A'} description={formatDuration(storedData.aggregatedStats?.shortestSong?.metadata?.duration)} icon={<SongIcon />} tooltipText="The title and duration of the shortest song found." />
                <StatDisplayCard title="Most Productive Day" value={storedData.aggregatedStats?.productivity?.mostProductiveDay || 'N/A'} icon={<CalendarDaysIcon />} tooltipText="Day of the week with the most song creations, based on song timestamps." />
                <StatDisplayCard title="Most Productive Hour" value={storedData.aggregatedStats?.productivity?.mostProductiveHour || 'N/A'} icon={<ClockIcon />} tooltipText="Hour of the day (user's local time) with the most song creations, based on song timestamps." />
                <StatDisplayCard title="Hit Rate (Plays)" value={storedData.aggregatedStats?.hitRatePlays !== null ? `${formatNumber(storedData.aggregatedStats.hitRatePlays, 1)}%` : 'N/A'} description="% songs > avg plays" icon={<BullseyeIcon />} tooltipText="Percentage of songs with play counts above the user's average plays per song." />
                <StatDisplayCard title="Hit Rate (Upvotes)" value={storedData.aggregatedStats?.hitRateUpvotes !== null ? `${formatNumber(storedData.aggregatedStats.hitRateUpvotes, 1)}%` : 'N/A'} description="% songs > avg upvotes" icon={<BullseyeIcon />} tooltipText="Percentage of songs with upvote counts above the user's average upvotes per song." />
                <StatDisplayCard title="Plays Std. Deviation" value={formatNumber(storedData.aggregatedStats?.stdDevPlays, 1)} description="Play count variability" icon={<SigmaIcon />} tooltipText="Standard Deviation of play counts. A lower value (relative to the average) indicates more consistent play counts across songs." />
                <StatDisplayCard title="Upvotes Std. Deviation" value={formatNumber(storedData.aggregatedStats?.stdDevUpvotes, 1)} description="Upvote count variability" icon={<SigmaIcon />} tooltipText="Standard Deviation of upvote counts. A lower value (relative to the average) indicates more consistent upvote counts across songs." />
              </div>
            </section>
            <StatChartsArea stats={storedData.aggregatedStats} username={storedData.username} topNValue={topNValue} onSetFilter={handleSetFilter} />
            <section className="my-8">
                <div className="flex justify-between items-center mb-2">
                  <button onClick={() => setIsDetailedTableOpen(!isDetailedTableOpen)} className="w-full flex items-center justify-between py-3 px-4 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-green-700 dark:text-green-300 font-semibold rounded-lg border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500" aria-expanded={isDetailedTableOpen} aria-controls="detailed-song-performance-panel">
                      <div className="flex items-center"> <TableIcon className="mr-2 w-5 h-5 text-green-600 dark:text-green-400" /> Detailed Song Performance Data </div>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={`w-5 h-5 transform transition-transform ${isDetailedTableOpen ? 'rotate-180' : ''}`}> <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /> </svg>
                  </button>
                  {activeTableFilters && isDetailedTableOpen && (
                    <button onClick={handleClearFilters} className="ml-3 py-1 px-2 text-xs bg-red-600 hover:bg-red-500 text-white rounded-md flex items-center whitespace-nowrap">
                      <FilterIcon className="mr-1 w-3 h-3"/> Clear Filters
                    </button>
                  )}
                </div>
                {isDetailedTableOpen && ( 
                  <div id="detailed-song-performance-panel" className="mt-2"> 
                    <DetailedSongPerformanceTable songs={storedData.songs} songInteractionHistory={storedData.aggregatedStats.songInteractionHistory} onAnalyzeSong={openLifecycleModal} activeTableFilters={activeTableFilters} />
                  </div> 
                )}
            </section>
          </div>
        )}
        {!storedData && !isLoading && !error && username && ( <p className="text-gray-500 dark:text-gray-400 text-center mt-6">No data loaded for @{username}. Click "Fetch / View Stats".</p> )}
        {!storedData && !isLoading && !error && !username && ( <p className="text-gray-500 dark:text-gray-400 text-center mt-6">Enter a username to begin.</p> )}
      </main>
      {isLifecycleModalOpen && selectedSongForLifecycle && (
        <SongLifecycleChartModal
          song={selectedSongForLifecycle}
          history={selectedSongHistoryForLifecycle || []}
          onClose={() => setIsLifecycleModalOpen(false)}
        />
      )}
      <div className="mt-8 pt-4 border-t border-gray-300 dark:border-gray-700 text-center px-6 md:px-10"> <p className="text-sm text-gray-500 dark:text-gray-400"> <strong className="text-yellow-600 dark:text-yellow-300">Troubleshooting Tip:</strong> If this tool isn't working as expected, or if data seems stale, clearing your browser's cache and site data for this Hub can often resolve the issue. This will clear cached user data for this tool. </p> </div>
      <style>{`.animate-fadeIn { animation: fadeIn 0.5s ease-out; } @keyframes fadeIn { 0% { opacity: 0; transform: translateY(10px); } 100% { opacity: 1; transform: translateY(0px); } }`}</style>
    </div>
  );
};
export default SunoUserStatsTool;
