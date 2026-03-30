
import React, { useState, useCallback, useEffect } from 'react';
import 'chartjs-adapter-date-fns';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import SongCoverArtTool from './src/tools/SongCoverArtTool';
import LyricProcessorTool from './src/tools/LyricProcessorTool';
import SunoMusicPlayerTool from './src/tools/SunoMusicPlayerTool';
import AboutPage from './src/pages/AboutPage'; 
import RandomMusicStyleGenerator from './src/tools/RandomMusicStyleGenerator/RandomMusicStyleGenerator';
import { CreativeConceptBlender } from './src/tools/CreativeConceptBlender/CreativeConceptBlender';
import ChordProgressionTool from './src/tools/ChordProgressionTool'; 
import ScaleChordViewerTool from './src/tools/ScaleChordViewerTool';
import LyricsSynchronizerTool from './src/tools/LyricsSynchronizerTool';
import SongStructureBuilderTool from './src/tools/SongStructureBuilderTool';
import SongDeckPickerTool from './src/tools/SongDeckPicker/SongDeckPickerTool';
import MusicTheoryWikiTool from './src/tools/MusicTheoryWikiTool';
import BPMTapperTool from './src/tools/BPMTapperTool';
import MetronomeTool from './src/tools/MetronomeTool';
import MP3CutterTool from './src/tools/MP3CutterTool';
import SunoUserStatsTool from './src/tools/SunoUserStatsTool'; 
import SunoSongComplianceTool from './src/tools/SunoSongComplianceTool';
import ReleaseNotesPage from './src/pages/ReleaseNotesPage'; 
import SpecialMentionsPage from './src/pages/SpecialMentionsPage';
import CookieConsentPopup from './components/CookieConsentPopup';
import SparkTuneTool from './src/tools/SparkTuneTool'; 
import SunoCommunitySpinnerTool from './src/tools/SunoCommunitySpinnerTool';
import LocalMusicResourceDirectoryTool from './src/tools/LocalMusicResourceDirectoryTool'; 
import { useTheme } from './context/ThemeContext';
import { useTelemetry } from './hooks/useTelemetry';
import StatsPage from './src/pages/StatsPage';

// --- Tool Icons (SVGs) ---
const AboutIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" /></svg>);
const PlatformsIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => ( // New Icon for AI Music Platforms
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-1.621-.871a3 3 0 01-.879-2.122v-1.007" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15.75a3 3 0 013-3V4.5a3 3 0 10-6 0v8.25a3 3 0 013 3z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);
const SunoPlayerIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z" /></svg>);
const CoverArtIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5z" /></svg>);
const LyricsIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.39m3.421 3.421a3 3 0 00 1.128 5.78l-.707 1.707M9.53 16.122l1.707-.707a3 3 0 002.245-2.4m1.707.707l-.707-1.707m6-13.5h-1.59l-.755-1.06A48.403 48.403 0 0012 2.25c-2.115 0-4.198.137-6.154.404L5.095 3.75H3.5c-.828 0-1.5.672-1.5 1.5v13.5c0 .828.672 1.5 1.5 1.5h17c.828 0 1.5-.672 1.5-1.5V5.25c0-.828-.672-1.5-1.5-1.5z" /></svg>);
const LightbulbIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.355a7.5 7.5 0 01-3 0m3 0a7.5 7.5 0 00-3 0m.375 0l-.163.525c-.025.075-.016.148.026.213l.085.128c.076.113.2.113.276 0l.085-.128a.25.25 0 00.026-.213l-.163-.525M12 6.75a3.375 3.375 0 110-6.75 3.375 3.375 0 010 6.75zM12 18.75a3.375 3.375 0 100-6.75 3.375 3.375 0 000 6.75z" /></svg>);
const TuneIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5M15 15l5.25 5.25" /></svg>);
const CardsIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" /></svg>);
const BookOpenIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18c-2.305 0-4.408.867-6 2.292m0-14.25v14.25" /></svg>);
const TapIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M7.875 14.25l1.214 1.942a2.25 2.25 0 003.822 0l1.214-1.942M2.41 9h4.638a2.25 2.25 0 011.906 1.058l.867 1.306M21.59 9h-4.638a2.25 2.25 0 00-1.906 1.058l-.867 1.306m0 0L12 12.75m0 0l-1.214 1.822M12 12.75V9M12 12.75V6A2.25 2.25 0 009.75 3.75h-.75A2.25 2.25 0 006.75 6v3" /></svg>);
const MetronomeIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M9 9l6-6m-6 6v12l6-3m-6 3H9m0 0l6 6M9 9H3l6-6M9 9h12" /><ellipse cx="12" cy="10" rx="2" ry="1" fill="currentColor" /></svg>);
const MP3CutterIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}> <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" /> </svg>);
const ScaleChordIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 5.25h16.5M3.75 9.75h16.5M3.75 14.25h16.5M3.75 18.75h16.5" />
        <circle cx="6.5" cy="16.5" r="1.5" fill="currentColor" />
        <circle cx="9.5" cy="12.5" r="1.5" fill="currentColor" />
        <circle cx="12.5" cy="14.5" r="1.5" fill="currentColor" />
    </svg>
);
const ReleaseNotesIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
    </svg>
);
const UserStatsIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => ( 
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 12.75V15m0-2.25V15m0 0H9.75M12 15h2.25M12 15V12.75M12 12.75H9.75M12 12.75H14.25" /> {/* Simplified chart-like lines inside user */}
    </svg>
);
const ComplianceCheckIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" opacity="0.6"/>
  </svg>
);
const HeartIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => ( 
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
  </svg>
);
const SparkTuneIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9.75c0-.592-.174-1.14-.481-1.622M17.25 12a4.5 4.5 0 00-9 0m9 0a4.5 4.5 0 01-9 0m4.5-4.5V6m0 3.75V9m0 6V9m0 6H9m3.75 0h2.25m0 0V9" />
  </svg>
);
const CommunitySpinnerIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => ( 
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5zM17.25 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.53 15.53L12 12m0 0l-3.53 3.53M12 12l3.53-3.53M12 12L8.47 8.47" />
  </svg>
);
const ResourceDirectoryIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 9v6m-2.25-3.75l2.25 2.25 2.25-2.25" /> {/* Simple music note representation */}
  </svg>
);
const StatsIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
    </svg>
);
const SunoSongStatsIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 4.5V19.5M15 4.5V19.5M3.75 12H20.25" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.188 10.031c.39.39 1.024.39 1.414 0l1.591-1.591a1 1 0 00-1.414-1.414L6.188 8.617a1 1 0 000 1.414zM14.812 10.031c.39.39 1.024.39 1.414 0l1.591-1.591a1 1 0 00-1.414-1.414l-1.591 1.591a1 1 0 000 1.414zM6.188 15.531c.39.39 1.024.39 1.414 0l1.591-1.591a1 1 0 10-1.414-1.414l-1.591 1.591a1 1 0 000 1.414zM14.812 15.531c.39.39 1.024.39 1.414 0l1.591-1.591a1 1 0 10-1.414-1.414l-1.591 1.591a1 1 0 000 1.414z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm0 0V4.5m0 1.5V7.5M12 18a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm0 0v-1.5m0 1.5v1.5" />
    </svg>
);
const LyricsSyncIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);
const SongStructureIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4h16M4 4v16" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 8h10v2.5H8zM8 13.5h10v2.5H8z" />
  </svg>
);
// --- End Tool Icons ---


export type ToolId = 
  'about' | 
  'sunoMusicPlayer' | 
  'sunoUserStats' | 
  'sunoSongCompliance' |
  'songCoverArt' | 
  'mp3Cutter' | 
  'lyricProcessor' | 
  'lyricsSynchronizer' |
  'randomMusicStyle' | 
  'creativeConceptBlender' | 
  'songStructureBuilder' | // New Tool ID
  'chordProgressionGenerator' | 
  'scaleChordViewer' |
  'songDeckPicker' |
  'musicTheoryWiki' |
  'localMusicResourceDirectory' | 
  'bpmTapper' | 
  'metronome' |
  'sparkTuneChallenge' |
  'sunoCommunitySpinner' | 
  'releaseNotes' |
  'stats' |
  'specialMentions';

export interface ToolProps {
  trackLocalEvent: (category: string, action: string, label?: string, value?: string | number) => void;
  onNavigate?: (toolId: ToolId) => void;
  toolsList?: Array<{id: ToolId, name: string, icon?: React.ReactElement, category?: string}>;
}

export interface Tool {
  id: ToolId;
  name: string;
  component: React.FC<ToolProps>;
  icon?: React.ReactElement; 
  category: string;
}


const tools: Tool[] = [
  { id: 'about', name: 'About This Hub', component: AboutPage as React.FC<ToolProps>, icon: <AboutIcon />, category: "App & Info" },
  { id: 'sunoMusicPlayer', name: 'Music Shuffler', component: SunoMusicPlayerTool, icon: <PlatformsIcon />, category: "AI Music Platforms" },
  { id: 'sunoUserStats', name: 'Suno User Stats', component: SunoUserStatsTool, icon: <UserStatsIcon />, category: "AI Music Platforms" },
  { id: 'sunoSongCompliance', name: 'Song Compliance Checker', component: SunoSongComplianceTool, icon: <ComplianceCheckIcon />, category: "AI Music Platforms" },
  { id: 'songStructureBuilder', name: 'Song Structure Builder', component: SongStructureBuilderTool, icon: <SongStructureIcon />, category: "Creative AI & Content Tools" },
  { id: 'songCoverArt', name: 'Song Cover Art Creator', component: SongCoverArtTool, icon: <CoverArtIcon />, category: "Creative AI & Content Tools" },
  { id: 'mp3Cutter', name: 'MP3 Cutter & Cropper', component: MP3CutterTool, icon: <MP3CutterIcon />, category: "Creative AI & Content Tools" },
  { id: 'lyricProcessor', name: 'Lyric Processor', component: LyricProcessorTool, icon: <LyricsIcon />, category: "Creative AI & Content Tools" },
  { id: 'lyricsSynchronizer', name: 'Lyrics Synchronizer', component: LyricsSynchronizerTool, icon: <LyricsSyncIcon />, category: "Creative AI & Content Tools" },
  { id: 'randomMusicStyle', name: 'Music Style Generator', component: RandomMusicStyleGenerator, icon: <LightbulbIcon />, category: "Creative AI & Content Tools" },
  { id: 'creativeConceptBlender', name: 'Creative Concept Blender', component: CreativeConceptBlender, icon: <LightbulbIcon className="w-5 h-5 transform scale-x-[-1]" />, category: "Creative AI & Content Tools" },
  { id: 'localMusicResourceDirectory', name: 'Music Resource Directory', component: LocalMusicResourceDirectoryTool, icon: <ResourceDirectoryIcon />, category: "Creator Resources & Learning" }, 
  { id: 'musicTheoryWiki', name: 'Music Theory Wiki', component: MusicTheoryWikiTool, icon: <BookOpenIcon />, category: "Creator Resources & Learning" },
  { id: 'sunoCommunitySpinner', name: 'Magic Spin Wheel', component: SunoCommunitySpinnerTool, icon: <CommunitySpinnerIcon />, category: "Community & Fun Tools"},
  { id: 'chordProgressionGenerator', name: 'Chord Progression Generator', component: ChordProgressionTool, icon: <TuneIcon />, category: "Music Theory & Composition" }, 
  { id: 'scaleChordViewer', name: 'Scale & Chord Viewer', component: ScaleChordViewerTool, icon: <ScaleChordIcon />, category: "Music Theory & Composition" },
  { id: 'songDeckPicker', name: 'Song Deck Picker', component: SongDeckPickerTool, icon: <CardsIcon />, category: "Community & Fun Tools" },
  { id: 'bpmTapper', name: 'BPM & Key Finder', component: BPMTapperTool, icon: <TapIcon />, category: "Music Theory & Composition" }, 
  { id: 'metronome', name: 'Metronome', component: MetronomeTool, icon: <MetronomeIcon />, category: "Music Theory & Composition" },
  { id: 'sparkTuneChallenge', name: 'SparkTune Challenge Gen', component: SparkTuneTool, icon: <SparkTuneIcon />, category: "Community & Fun Tools"},
  { id: 'releaseNotes', name: 'Release Notes', component: ReleaseNotesPage as React.FC<ToolProps>, icon: <ReleaseNotesIcon />, category: "App & Info"},
  { id: 'specialMentions', name: 'Special Mentions', component: SpecialMentionsPage as React.FC<ToolProps>, icon: <HeartIcon />, category: "App & Info"},
  { id: 'stats', name: 'Hub Stats', component: StatsPage as React.FC<ToolProps>, icon: <StatsIcon />, category: "App & Info"},
];

const COOKIE_CONSENT_KEY = 'aiMultiToolHub_cookieConsent';
const CONSENT_GIVEN_VALUE = 'true';
const LOCAL_VISITS_LOG_KEY = 'myVisitsLog';
const LAST_DAILY_LOCAL_PING_KEY = 'lastDailyLocalActivePing';

const Layout: React.FC = () => {
  useTelemetry();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeToolId, setActiveToolId] = useState<ToolId>('about'); 
  const [showCookieConsent, setShowCookieConsent] = useState<boolean>(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);
  const { theme } = useTheme();

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);


  const trackLocalEvent = useCallback((category: string, action: string, label?: string, value?: string | number) => {
    try {
        const keyBase = `stat_${category}_${action}`;
        if (typeof value === 'number' || (label && typeof value === 'undefined')) { 
            const key = keyBase + (label ? `_${label.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '')}` : '');
            const currentCount = parseInt(localStorage.getItem(key) || '0', 10);
            localStorage.setItem(key, (currentCount + (typeof value === 'number' ? value : 1)).toString());
        } else if (label && typeof value === 'string') { 
            const key = `statEvents_${category}_${action}_${label.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '')}`;
            const eventList: string[] = JSON.parse(localStorage.getItem(key) || '[]');
            eventList.push(value);
            if (eventList.length > 100) { 
                eventList.splice(0, eventList.length - 100);
            }
            localStorage.setItem(key, JSON.stringify(eventList));
        } else if (typeof value === 'string') { 
            const key = `statEvents_${category}_${action}`;
            const eventList: string[] = JSON.parse(localStorage.getItem(key) || '[]');
            eventList.push(value);
            if (eventList.length > 100) { 
                eventList.splice(0, eventList.length - 100);
            }
            localStorage.setItem(key, JSON.stringify(eventList));
        }
    } catch (error) {
        console.error("Error tracking local event:", category, action, label, value, error);
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const toolFromUrl = params.get('tool') as ToolId | null;

    if (toolFromUrl && tools.some(t => t.id === toolFromUrl)) {
      setActiveToolId(toolFromUrl);
      trackLocalEvent('Navigation', 'openedWithUrlParam', toolFromUrl);
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('tool');
      window.history.replaceState({}, document.title, newUrl.pathname + newUrl.search);
    }

    try {
      const storedConsent = localStorage.getItem(COOKIE_CONSENT_KEY);
      if (storedConsent === CONSENT_GIVEN_VALUE) {
        setShowCookieConsent(false);
      } else {
        setShowCookieConsent(true);
      }
    } catch (error) {
      console.error("Error checking cookie consent:", error);
      setShowCookieConsent(true); 
    }
  }, [trackLocalEvent]);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    try {
      const lastPing = localStorage.getItem(LAST_DAILY_LOCAL_PING_KEY);
      if (lastPing !== today) {
        const visitsLog: string[] = JSON.parse(localStorage.getItem(LOCAL_VISITS_LOG_KEY) || '[]');
        if (!visitsLog.includes(today)) {
          visitsLog.push(today);
          if (visitsLog.length > 90) { 
            visitsLog.splice(0, visitsLog.length - 90);
          }
          localStorage.setItem(LOCAL_VISITS_LOG_KEY, JSON.stringify(visitsLog));
        }
        localStorage.setItem(LAST_DAILY_LOCAL_PING_KEY, today);
      }
    } catch (error) {
      console.error("Error in local daily active ping logic:", error);
    }
  }, []);


  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen(prev => !prev);
  }, []);

  const handleNavigate = useCallback((toolId: ToolId) => {
    const mobileScreen = !isDesktop; 
    const sidebarOpenAtActionTime = isSidebarOpen;
    const mainContentTransitionDuration = 300; 

    const performNavigation = () => {
      setActiveToolId(toolId);
      if (toolId !== 'about' && toolId !== 'releaseNotes' && toolId !== 'specialMentions') {
        trackLocalEvent('Navigation', 'toolVisits', toolId);
      }
    };

    if (mobileScreen && sidebarOpenAtActionTime) {
      setIsSidebarOpen(false);
      setTimeout(performNavigation, mainContentTransitionDuration);
    } else {
      performNavigation();
    }
  }, [isSidebarOpen, trackLocalEvent, isDesktop]);

  const handleAcceptCookieConsent = useCallback(() => {
    try {
      localStorage.setItem(COOKIE_CONSENT_KEY, CONSENT_GIVEN_VALUE);
    } catch (error) {
      console.error("Error saving cookie consent:", error);
    }
    setShowCookieConsent(false);
  }, []);

  const foundTool = tools.find(tool => tool.id === activeToolId);
  const ActiveToolComponent = foundTool ? foundTool.component : null;
  const ToolNotFoundComponent = () => <div className="text-center py-10"><h2 className="text-2xl text-red-400">Tool Not Found</h2><p className="text-gray-400">The requested tool could not be loaded.</p></div>;

  const activeToolSpecificProps: Partial<ToolProps> = {};
  if ((activeToolId === 'about' || activeToolId === 'releaseNotes' || activeToolId === 'specialMentions') && foundTool) {
    activeToolSpecificProps.onNavigate = handleNavigate;
    activeToolSpecificProps.toolsList = tools; 
  }
  
  const combinedToolProps: ToolProps = {
    trackLocalEvent,
    ...activeToolSpecificProps,
    onNavigate: (activeToolId === 'about' || activeToolId === 'releaseNotes' || activeToolId === 'specialMentions' || activeToolId === 'sunoSongCompliance') ? handleNavigate : undefined,
  };


  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-gray-200 transition-colors duration-300">
      <Header onToggleSidebar={toggleSidebar} appName="Music AI Multi-Tool Hub" />
      <div className="flex flex-1 pt-16">
        <Sidebar 
          isOpen={isSidebarOpen} 
          onClose={toggleSidebar} 
          tools={tools.map(t => ({ id: t.id, name: t.name, icon: t.icon, category: t.category }))}
          activeToolId={activeToolId}
          onNavigate={handleNavigate} 
          trackLocalEvent={trackLocalEvent}
        />
        <main className={`flex-1 overflow-y-auto transition-all duration-300 ease-in-out ${isSidebarOpen && isDesktop ? 'md:ml-64' : 'ml-0'}`}>
          <div className="p-0 sm:p-6 lg:p-8"> 
            {ActiveToolComponent ? <ActiveToolComponent {...combinedToolProps} /> : <ToolNotFoundComponent />}
          </div>
        </main>
      </div>
      <footer className="py-4 px-6 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 text-center text-xs text-gray-500">
        <p>&copy; {new Date().getFullYear()} Music AI Multi-Tool Hub.</p>
        <p>Developed by @spupuz with support from @flickerlog. For creative purposes. Please review our <a href="#" onClick={(e) => { e.preventDefault(); if (isSidebarOpen && !isDesktop) { setIsSidebarOpen(false); setTimeout(() => { handleNavigate('about'); setTimeout(() => document.getElementById('privacy-policy')?.scrollIntoView({behavior: 'smooth'}), 50); }, 300); } else { handleNavigate('about'); setTimeout(() => document.getElementById('privacy-policy')?.scrollIntoView({behavior: 'smooth'}), 50); }}} className="text-green-600 dark:text-green-400 hover:underline">Privacy Policy</a> before use.</p>
        <p className="mt-2 flex items-center justify-center gap-1.5 text-gray-500">
          i <HeartIcon className="w-3.5 h-3.5 text-red-500" /> Vibe Coding
        </p>
      </footer>
      {showCookieConsent && <CookieConsentPopup onAccept={handleAcceptCookieConsent} onLearnMore={() => { if (isSidebarOpen && !isDesktop) { setIsSidebarOpen(false); setTimeout(() => { handleNavigate('about'); setTimeout(() => document.getElementById('privacy-policy')?.scrollIntoView({ behavior: 'smooth' }), 50); setShowCookieConsent(false);}, 300); } else { handleNavigate('about'); setTimeout(() => document.getElementById('privacy-policy')?.scrollIntoView({ behavior: 'smooth' }), 50); setShowCookieConsent(false); }}} />}
    </div>
  );
};

export default Layout;
