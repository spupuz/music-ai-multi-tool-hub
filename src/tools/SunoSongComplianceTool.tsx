

import React, { useState, useCallback, useEffect, useRef } from 'react';
import type { ToolProps, ToolId } from '@/Layout';
import { fetchSunoClipById, resolveSunoUrlToPotentialSongId } from '@/services/sunoService';
import { analyzeLyricsLanguageDetailsGemini, checkContentRatingGemini } from '@/services/aiAnalysisService';
import { getCountryDetails, getFlagEmoji } from '@/utils/countryData';
import type { SunoClip, SingleSongComplianceResult, TitleCheckResult, LyricsLanguageCheckResult, ContentRatingCheckResult, RatingLevel, DurationCheckResult } from '@/types';
import Spinner from '@/components/Spinner';
import Button from '@/components/common/Button';
import { ComplianceCheckIcon, SaveIcon, LoadIcon, DownloadIcon, RefreshIcon, LyricsIcon } from '@/components/Icons';
import { downloadSunoComplianceResultsAsCsv } from '@/services/csvExportService';
import { fetchRiffusionSongData, extractRiffusionSongId } from '@/services/riffusionService';

const TOOL_CATEGORY = 'SunoSongCompliance';
const WORKER_URL = 'https://gemini-proxy.spupuz.workers.dev';

function escapeRegex(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const ratingOptions: { value: RatingLevel; label: string }[] = [
  { value: 'PG-13', label: 'PG-13 (Default)' },
  { value: 'G', label: 'G (General Audiences)' },
  { value: 'PG', label: 'PG (Parental Guidance)' },
  { value: 'R', label: 'R (Restricted)' },
  { value: 'Explicit', label: 'Explicit' },
];

const InfoIcon: React.FC<{ tooltip: string, className?: string }> = ({ tooltip, className = "" }) => (
  <div className={`inline-block relative group ${className} align-middle`}>
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-gray-400 hover:text-green-500 cursor-help">
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
    </svg>
    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 p-2 text-xs text-white bg-gray-800 border border-gray-600 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-50 pointer-events-none text-left">
      {tooltip}
    </div>
  </div>
);

interface BatchSummary {
  totalProcessed: number;
  passedAllChecks: number;
  titleIssues: number;
  durationIssues: number; // Added
  contentRatingIssues: number;
  processingErrors: number;
}


const SunoSongComplianceTool: React.FC<ToolProps> = ({ trackLocalEvent, onNavigate }) => {
  const [sunoUrlsInput, setSunoUrlsInput] = useState<string>('');
  const [titleFormatPattern, setTitleFormatPattern] = useState<string>('[SSC<number>, <country/code>]');
  const [durationLimitSeconds, setDurationLimitSeconds] = useState<number>(300); // Default 5 minutes
  const [selectedRating, setSelectedRating] = useState<RatingLevel>('PG-13');
  const [enteredPassword, setEnteredPassword] = useState<string>('');
  const [isPasswordCorrect, setIsPasswordCorrect] = useState<boolean>(false);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [batchRunResults, setBatchRunResults] = useState<SingleSongComplianceResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [progressMessage, setProgressMessage] = useState<string>('');
  const [exportStatusMessage, setExportStatusMessage] = useState<string>('');
  const [batchSummary, setBatchSummary] = useState<BatchSummary | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateTitle = (titleToValidate: string, userPattern: string): TitleCheckResult => {
    const numberPlaceholder = "<number>";
    const countryPlaceholder = "<country/code>";
    let tempRegexString = userPattern;
    tempRegexString = escapeRegex(tempRegexString);
    tempRegexString = tempRegexString.replace(new RegExp(escapeRegex(numberPlaceholder), 'g'), "(?<sscVersion>\\d+)");
    tempRegexString = tempRegexString.replace(new RegExp(escapeRegex(countryPlaceholder), 'g'), "(?<countryCode>[^,\\\\\\\\\\[\\]()]+)");
    let finalTitleRegex: RegExp;
    try { finalTitleRegex = new RegExp(tempRegexString, 'i'); }
    catch (e) { return { passed: false, message: `Invalid title format pattern: ${e instanceof Error ? e.message : 'Regex error'}` }; }
    const match = titleToValidate.match(finalTitleRegex);
    if (!match || !match.groups) return { passed: false, message: "Title does not match pattern." };
    const { sscVersion: sscVersionStr, countryCode: countryStr } = match.groups;
    if (sscVersionStr === undefined || countryStr === undefined) {
      let missing = [];
      if (userPattern.includes(numberPlaceholder) && sscVersionStr === undefined) missing.push("'<number>'");
      if (userPattern.includes(countryPlaceholder) && countryStr === undefined) missing.push("'<country/code>'");
      return { passed: false, message: `Pattern missing captures for: ${missing.join(', ')}.` };
    }
    const sscVersion = parseInt(sscVersionStr, 10);
    if (isNaN(sscVersion) || sscVersion <= 0) return { passed: false, message: "Invalid SSC version." };
    const trimmedCountryStr = countryStr.trim();
    const countryDetails = getCountryDetails(trimmedCountryStr);
    if (!countryDetails) return { passed: false, message: `Country "${trimmedCountryStr}" not recognized.` };
    return { passed: true, message: "Valid.", sscVersion, country: countryDetails.name, countryCodeAlpha2: countryDetails.codeAlpha2 };
  };

  const processSingleUrl = async (url: string, currentTitleFormat: string, currentDurationLimit: number, currentRating: RatingLevel, batchProgressPrefix: string): Promise<SingleSongComplianceResult> => {
    let singleResult: SingleSongComplianceResult = { inputUrl: url };

    try {
      let urlToProcess = url;
      if (urlToProcess.includes('producer.ai')) {
        setProgressMessage(`${batchProgressPrefix}: Producer.AI URL detected, transforming...`);
        const songId = extractRiffusionSongId(urlToProcess);
        if (songId) {
          urlToProcess = `https://www.producer.ai/song/${songId}`;
          trackLocalEvent(TOOL_CATEGORY, 'urlTransformed', 'producer.ai_to_riffusion');
        } else {
          throw new Error('Could not extract a valid song ID from the Producer.AI URL.');
        }
      }

      let clipData: SunoClip | null = null;

      if (urlToProcess.includes('riffusion.com') || urlToProcess.includes('producer.ai')) {
        const songId = extractRiffusionSongId(urlToProcess);
        if (!songId) throw new Error("Could not extract Riffusion song ID from URL.");
        setProgressMessage(`${batchProgressPrefix}: Fetching Riffusion song ${songId.substring(0, 8)}...`);

        const riffusionData = await fetchRiffusionSongData(songId);
        if (!riffusionData) throw new Error(`Failed to fetch song details for Riffusion ID: ${songId.substring(0, 8)}`);

        clipData = {
          id: riffusionData.id,
          title: riffusionData.title || 'Untitled Riffusion Song',
          display_name: riffusionData.artist,
          handle: riffusionData.artist.toLowerCase().replace(/\s/g, '_'),
          created_at: riffusionData.created_at || new Date().toISOString(),
          audio_url: riffusionData.audio_url || '',
          video_url: riffusionData.previewVideoUrl || '',
          image_url: riffusionData.image_url,
          image_large_url: riffusionData.image_large_url || riffusionData.image_url,
          is_video_pending: false,
          major_model_version: 'riffusion',
          model_name: 'riffusion',
          metadata: {
            tags: Array.isArray(riffusionData.tags) ? riffusionData.tags.join(', ') : (riffusionData.tags || 'riffusion'),
            prompt: riffusionData.lyrics || riffusionData.prompt || '',
            gpt_description_prompt: null,
            error_type: null,
            error_message: null,
            type: 'music',
            duration: riffusionData.duration || null,
          },
          is_liked: false,
          user_id: riffusionData.author_id || 'riffusion_user',
          is_trashed: false,
          status: 'complete',
          play_count: 0,
          upvote_count: 0,
          comment_count: 0,
          is_public: true,
          suno_song_url: `https://www.producer.ai/song/${riffusionData.id}`,
          suno_creator_url: (riffusionData.artist && !riffusionData.artist.startsWith('user_') && riffusionData.artist !== 'Unknown Artist' && riffusionData.artist !== 'Riffusion Artist')
            ? `https://www.producer.ai/${encodeURIComponent(riffusionData.artist)}`
            : '',
          source: 'riffusion',
          image_urls: {}
        };

      } else { // Assume Suno URL
        let songIdToFetch: string | null = null;
        const setResolutionProgress = (msg: string) => setProgressMessage(`${batchProgressPrefix}: ${msg}`);
        songIdToFetch = await resolveSunoUrlToPotentialSongId(urlToProcess, setResolutionProgress);

        if (!songIdToFetch) {
          throw new Error("Could not resolve or extract song ID from URL.");
        }

        setProgressMessage(`${batchProgressPrefix}: Fetching details for ${songIdToFetch.substring(0, 8)}...`);
        clipData = await fetchSunoClipById(songIdToFetch);
      }

      if (!clipData) {
        throw new Error("Failed to retrieve any song data for the URL.");
      }

      singleResult.clipData = clipData;
      singleResult.songTitle = clipData.title;
      singleResult.songLyrics = clipData.metadata?.prompt || null;

      singleResult.titleCheck = validateTitle(clipData.title, currentTitleFormat);
      trackLocalEvent(TOOL_CATEGORY, 'titleCheckResult', `${url}-${singleResult.titleCheck.passed ? 'passed' : 'failed'}`, 1);

      if (clipData.metadata?.duration !== null && clipData.metadata?.duration !== undefined) {
        const actualDuration = clipData.metadata.duration;
        const passed = actualDuration <= currentDurationLimit;
        singleResult.durationCheck = {
          passed,
          message: passed ? `Duration OK (${actualDuration.toFixed(1)}s <= ${currentDurationLimit}s).` : `Exceeds limit (${actualDuration.toFixed(1)}s > ${currentDurationLimit}s).`,
          actualDurationSeconds: actualDuration,
          limitSeconds: currentDurationLimit
        };
        trackLocalEvent(TOOL_CATEGORY, 'durationCheckResult', `${url}-${passed ? 'passed' : 'failed'}`, 1);
      } else {
        singleResult.durationCheck = {
          passed: false,
          message: "Could not determine song duration.",
          actualDurationSeconds: null,
          limitSeconds: currentDurationLimit
        };
        trackLocalEvent(TOOL_CATEGORY, 'durationCheckResult', `${url}-error_no_duration`, 1);
      }

      if (singleResult.songLyrics) {
        setProgressMessage(`${batchProgressPrefix}: Analyzing language...`);
        try {
          const langAnalysis = await analyzeLyricsLanguageDetailsGemini(singleResult.songLyrics);
          singleResult.languageCheck = { ...langAnalysis, message: `Lang: ${langAnalysis.primaryLanguageCode.toUpperCase()}. Untranslatable: ${langAnalysis.untranslatableWordsFound ? 'Yes' : 'No'}.` };
          trackLocalEvent(TOOL_CATEGORY, 'languageAnalysisResultGemini', `${url}-${langAnalysis.primaryLanguageCode}`, 1);
        } catch (langError) { singleResult.languageCheck = { primaryLanguageCode: 'Error', untranslatableWordsFound: false, untranslatableWordsExplanation: `Lang analysis failed: ${langError instanceof Error ? langError.message : String(langError)}`, message: `Language analysis error.` }; }

        setProgressMessage(`${batchProgressPrefix}: Checking content rating...`);
        try {
          const ratingResult = await checkContentRatingGemini(singleResult.songLyrics, currentRating);
          singleResult.contentRatingCheck = { ...ratingResult, message: ratingResult.is_appropriate ? `Appropriate for ${currentRating}.` : `Not appropriate for ${currentRating}.` };
          trackLocalEvent(TOOL_CATEGORY, 'contentRatingCheckResultGemini', `${url}-${currentRating}_${ratingResult.is_appropriate ? 'passed' : 'failed'}`, 1);
        } catch (ratingError) { singleResult.contentRatingCheck = { is_appropriate: false, explanation: `Rating check for ${currentRating} failed: ${ratingError instanceof Error ? ratingError.message : String(ratingError)}`, message: `Rating check error.` }; }
      } else {
        singleResult.languageCheck = { primaryLanguageCode: 'N/A', untranslatableWordsFound: false, untranslatableWordsExplanation: "No lyrics.", message: "No lyrics." };
        singleResult.contentRatingCheck = { is_appropriate: true, explanation: `No lyrics, appropriate for ${currentRating} by default.`, message: `No lyrics.` };
      }
    } catch (err) {
      singleResult.processingError = err instanceof Error ? err.message : "Unknown processing error.";
      trackLocalEvent(TOOL_CATEGORY, 'checkErrorGemini', `${url}-${singleResult.processingError}`, 1);
    }
    return singleResult;
  };

  const handleRunChecks = async () => {
    if (!isPasswordCorrect) { setError("Incorrect password for committee access."); return; }
    const urls = sunoUrlsInput.split('\n').map(url => url.trim()).filter(url => url);
    if (urls.length === 0) { setError("Please enter at least one Suno song URL."); return; }
    if (!titleFormatPattern.trim() || !titleFormatPattern.includes("<number>") || !titleFormatPattern.includes("<country/code>")) {
      setError("Title format pattern must include '<number>' and '<country/code>' placeholders."); return;
    }
    if (durationLimitSeconds <= 0) { setError("Duration limit must be a positive number of seconds."); return; }
    setIsLoading(true); setError(null); setBatchRunResults([]); setBatchSummary(null);
    trackLocalEvent(TOOL_CATEGORY, 'batchChecksRunGemini', selectedRating, urls.length);
    const newResultsArray: SingleSongComplianceResult[] = [];

    for (let i = 0; i < urls.length; i++) {
      const currentUrl = urls[i];
      const batchProgressPrefix = `Batch (${i + 1}/${urls.length})`;
      const result = await processSingleUrl(currentUrl, titleFormatPattern, durationLimitSeconds, selectedRating, batchProgressPrefix);
      newResultsArray.push(result);
      setBatchRunResults([...newResultsArray]);
    }

    let passedAll = 0; let titleIssues = 0; let durationIssues = 0; let contentIssues = 0; let processingErrors = 0;
    newResultsArray.forEach(res => {
      if (res.processingError) processingErrors++;
      else {
        const titleOK = res.titleCheck?.passed ?? false;
        const durationOK = res.durationCheck?.passed ?? false;
        const contentOK = res.contentRatingCheck?.is_appropriate ?? false;
        if (!titleOK) titleIssues++;
        if (!durationOK) durationIssues++;
        if (!contentOK) contentIssues++;
        if (titleOK && durationOK && contentOK) passedAll++;
      }
    });
    setBatchSummary({ totalProcessed: newResultsArray.length, passedAllChecks: passedAll, titleIssues, durationIssues, contentRatingIssues: contentIssues, processingErrors });

    setIsLoading(false); setProgressMessage(`Batch processing complete for ${newResultsArray.length} URLs.`);
    setTimeout(() => setProgressMessage(''), 5000);
  };

  const handleRetryUrl = async (urlToRetry: string) => {
    if (!isPasswordCorrect) { setError("Incorrect password for committee access."); return; }
    setIsLoading(true);
    const batchProgressPrefix = `Retrying ${urlToRetry.substring(0, 30)}...`;
    const result = await processSingleUrl(urlToRetry, titleFormatPattern, durationLimitSeconds, selectedRating, batchProgressPrefix);
    const updatedResults = batchRunResults.map(r => r.inputUrl === urlToRetry ? result : r);
    setBatchRunResults(updatedResults);

    let passedAll = 0; let titleIssues = 0; let durationIssues = 0; let contentIssues = 0; let processingErrors = 0;
    updatedResults.forEach(res => {
      if (res.processingError) processingErrors++;
      else {
        const titleOK = res.titleCheck?.passed ?? false;
        const durationOK = res.durationCheck?.passed ?? false;
        const contentOK = res.contentRatingCheck?.is_appropriate ?? false;
        if (!titleOK) titleIssues++;
        if (!durationOK) durationIssues++;
        if (!contentOK) contentIssues++;
        if (titleOK && durationOK && contentOK) passedAll++;
      }
    });
    setBatchSummary({ totalProcessed: updatedResults.length, passedAllChecks: passedAll, titleIssues, durationIssues, contentRatingIssues: contentIssues, processingErrors });

    setIsLoading(false);
    setProgressMessage(`Retry complete for: ${urlToRetry.substring(0, 50)}...`);
    setTimeout(() => setProgressMessage(''), 3000);
  };

  const handleExportToCsv = () => {
    if (batchRunResults.length === 0) { setExportStatusMessage("No results to export."); setTimeout(() => setExportStatusMessage(''), 3000); return; }
    try {
      downloadSunoComplianceResultsAsCsv(batchRunResults.map(r => ({ ...r, contentRatingCheck: { ...r.contentRatingCheck, ratingLevelUsed: selectedRating } as any })));
      setExportStatusMessage("Results exported to CSV!");
      trackLocalEvent(TOOL_CATEGORY, 'csvExported', undefined, batchRunResults.length);
    } catch (e) {
      setExportStatusMessage("Error exporting CSV. See console.");
      console.error("CSV Export error:", e);
    }
    setTimeout(() => setExportStatusMessage(''), 3000);
  };

  const handleSaveUrlsToFile = () => {
    if (!sunoUrlsInput.trim()) { alert("No URLs to save."); return; }
    const blob = new Blob([sunoUrlsInput], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'suno_compliance_checker_urls.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    trackLocalEvent(TOOL_CATEGORY, 'urlsSavedToFile', undefined, sunoUrlsInput.split('\n').filter(u => u.trim()).length);
  };

  const handleLoadUrlsFromFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setSunoUrlsInput(text);
      trackLocalEvent(TOOL_CATEGORY, 'urlsLoadedFromFile', undefined, text.split('\n').filter(u => u.trim()).length);
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleProcessLyrics = (lyrics: string | null) => {
    if (!lyrics) return;
    try {
      localStorage.setItem('lyricsToProcessForLyricProcessor', lyrics);
      if (onNavigate) onNavigate('lyricProcessor' as ToolId);
      trackLocalEvent(TOOL_CATEGORY, 'navigateToLyricProcessor', undefined, lyrics.length);
    } catch (e) {
      console.error("Error saving lyrics to localStorage for Lyric Processor:", e);
      setError("Could not send lyrics to Lyric Processor. Storage might be full.");
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEnteredPassword(e.target.value);
    if (isPasswordCorrect) setIsPasswordCorrect(false); // Reset on typing
  };

  const handleVerifyPassword = async () => {
    if (!enteredPassword.trim()) return;
    setIsVerifying(true);
    try {
      const res = await fetch(`${WORKER_URL}/verify-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: enteredPassword }),
      });
      const data = await res.json();
      const valid = !!data.valid;
      setIsPasswordCorrect(valid);
      setError(valid ? null : 'Incorrect password. Access denied.');
    } catch {
      setIsPasswordCorrect(false);
      setError('Could not verify password. Check your connection.');
    } finally {
      setIsVerifying(false);
    }
  };


  const ResultDisplay: React.FC<{ status?: boolean; title: string; message: string; details?: string | string[] | Record<string, any> | LyricsLanguageCheckResult | TitleCheckResult | DurationCheckResult }> = ({ status, title, message, details }) => {
    const icon = status ? '✅' : status === false ? '❌' : 'ℹ️';
    const bgColor = status === undefined ? 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600' : status ? 'bg-green-100 dark:bg-green-800 border-green-300 dark:border-green-600' : 'bg-red-100 dark:bg-red-800 border-red-300 dark:border-red-600';
    const textColor = status === undefined ? 'text-gray-800 dark:text-gray-100' : status ? 'text-green-800 dark:text-green-100' : 'text-red-800 dark:text-red-100';
    const detailTextColor = status === undefined ? 'text-gray-700 dark:text-gray-200' : status ? 'text-green-700 dark:text-green-200' : 'text-red-700 dark:text-red-200';

    let detailContent;
    if (typeof details === 'string') {
      detailContent = <p className={`text-sm ${detailTextColor} whitespace-pre-wrap`}>{details}</p>;
    } else if (Array.isArray(details)) {
      detailContent = <ul className={`list-disc list-inside pl-2 text-sm ${detailTextColor}`}>{details.map((d, i) => <li key={i}>{d}</li>)}</ul>;
    } else if (details && typeof details === 'object') {
      if ('sscVersion' in details && 'country' in details) { // TitleCheckResult
        const d = details as TitleCheckResult;
        detailContent = <><p className={`text-sm ${detailTextColor}`}>SSC Version: <span className="font-semibold">{d.sscVersion}</span></p><p className={`text-sm ${detailTextColor}`}>Country Match: <span className="font-semibold ml-1">{d.country}{d.countryCodeAlpha2 ? (' ' + getFlagEmoji(d.countryCodeAlpha2)) : ''}</span></p></>;
      } else if ('primaryLanguageCode' in details) { // LyricsLanguageCheckResult
        const d = details as LyricsLanguageCheckResult;
        detailContent = <><p className={`text-sm ${detailTextColor}`}>Primary Language: <span className="font-semibold">{d.primaryLanguageCode.toUpperCase()}</span></p><p className={`text-sm ${detailTextColor}`}>Untranslatable Words Found: <span className="font-semibold">{d.untranslatableWordsFound ? 'Yes' : 'No'}</span></p><p className={`text-sm ${detailTextColor} mt-1 whitespace-pre-wrap`}>Explanation: {d.untranslatableWordsExplanation}</p></>;
      } else if ('actualDurationSeconds' in details || 'limitSeconds' in details) { // DurationCheckResult
        const d = details as DurationCheckResult;
        detailContent = <><p className={`text-sm ${detailTextColor}`}>Actual: <span className="font-semibold">{d.actualDurationSeconds !== null && d.actualDurationSeconds !== undefined ? (d.actualDurationSeconds.toFixed(1) + 's') : "N/A"}</span></p><p className={`text-sm ${detailTextColor}`}>Limit: <span className="font-semibold">{d.limitSeconds}s</span></p></>;
      } else if (Object.keys(details).length > 0) { // Generic object for ContentRating explanation
        detailContent = Object.entries(details).map(([key, value]) => (<p key={key} className={`text-sm ${detailTextColor}`}><span className="font-medium capitalize">{key.replace(/_/g, ' ')}:</span> {String(value)}</p>));
      }
    }

    return (
      <div className={`p-4 rounded-3xl border border-white/10 shadow-xl transition-all hover:scale-[1.02] ${bgColor}`}>
        <h4 className={`text-sm font-black uppercase tracking-tight mb-2 ${textColor} flex items-center`}>
          <span className="mr-3">{icon}</span>
          {title}
        </h4>
        <p className={`text-xs font-medium opacity-80 ${detailTextColor}`}>{message}</p>
        {detailContent && (<div className="mt-3 pt-3 border-t border-white/10">{detailContent}</div>)}
      </div>
    )
  };

  return (
    <div className="w-full max-w-5xl mx-auto">
      <header className="mb-2 md:mb-14 text-center pt-0 md:pt-8 px-4 animate-fadeIn">
        <h1 className="text-xl sm:text-4xl md:text-6xl font-black uppercase tracking-tighter text-emerald-600 dark:text-emerald-500 leading-none italic drop-shadow-2xl mb-1 md:mb-4">Compliance Check</h1>
        <p className="mt-1 md:mt-4 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.4em] text-gray-500 dark:text-gray-400 max-w-xl mx-auto opacity-70">
            Heuristic Enforcement Hub • Validate metadata and content against contest protocols
        </p>
      </header>

      <main className="w-full glass-card p-2 sm:p-6 md:p-10 border-white/10 text-gray-900 dark:text-gray-200 flex flex-col transition-all duration-500 animate-fadeIn">
        <div className="space-y-4 md:space-y-8">
          <div className="mb-2 md:mb-4">
            <label htmlFor="committeePassword" className="block text-[10px] font-black uppercase tracking-[0.3em] text-yellow-600 dark:text-yellow-400 mb-1 ml-1 leading-none">Committee Access Password</label>
            <div className="flex gap-3">
              <input type="password" id="committeePassword" value={enteredPassword} onChange={handlePasswordChange}
                onKeyDown={(e) => e.key === 'Enter' && handleVerifyPassword()}
                placeholder="TOKEN REQUIRED"
                className="flex-grow px-3 py-2 md:px-4 md:py-3 bg-white/10 dark:bg-black/20 border border-white/10 rounded-2xl shadow-inner placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-yellow-500/20 focus:border-yellow-500 text-gray-900 dark:text-white text-sm sm:text-base font-bold transition-all h-10 md:h-auto" />
              <Button 
                onClick={handleVerifyPassword} 
                disabled={isVerifying || !enteredPassword.trim()}
                variant="warning"
                className="px-3 py-1.5 md:px-6 md:py-3 flex-shrink-0 font-black uppercase tracking-widest text-[10px] h-10 md:h-auto"
                startIcon={isVerifying ? null : (isPasswordCorrect ? '✅' : <RefreshIcon className="w-4 h-4" />)}
              >
                {isVerifying ? <Spinner size="w-4 h-4" color="text-black" /> : ''}
                {isVerifying ? 'Verifying' : 'Verify'}
              </Button>
            </div>
            <p className="text-[8px] font-black uppercase tracking-widest text-yellow-600/60 mt-2 ml-1 italic">For SSC Committee Usage Only. Password verified server-side.</p>
          </div>

          <div className="flex flex-row gap-2 md:gap-4">
            <Button onClick={handleSaveUrlsToFile} disabled={isLoading || !sunoUrlsInput.trim()} variant="ghost" size="xs" startIcon={<SaveIcon className="w-4 h-4" />} className="flex-1 font-black uppercase tracking-widest text-[8px] md:text-[9px] border-white/10 p-2 md:p-3 h-8 md:h-auto">SAVE CACHE</Button>
            <input type="file" ref={fileInputRef} onChange={handleLoadUrlsFromFile} accept=".txt" style={{ display: 'none' }} id="load-urls-file" />
            <Button onClick={() => fileInputRef.current?.click()} variant="ghost" size="xs" startIcon={<LoadIcon className="w-4 h-4" />} className="flex-1 font-black uppercase tracking-widest text-[8px] md:text-[9px] border-white/10 p-2 md:p-3 h-8 md:h-auto">LOAD CACHE</Button>
          </div>
          <div>
            <label htmlFor="sunoUrlsInput" className="block text-[10px] font-black uppercase tracking-[0.3em] text-emerald-600 dark:text-emerald-400 mb-1 ml-1 leading-none">Song Signal Vectors (One per line)</label>
            <textarea id="sunoUrlsInput" value={sunoUrlsInput} onChange={(e) => setSunoUrlsInput(e.target.value)} placeholder="Paste Suno, Riffusion, or Producer.AI song URLs here..." rows={3} className="block w-full px-4 py-2.5 md:py-3 bg-white/10 dark:bg-black/20 border border-white/10 rounded-2xl shadow-inner placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 text-gray-900 dark:text-white text-sm sm:text-base font-bold resize-y transition-all min-h-[60px] md:min-h-auto" disabled={isLoading} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="titleFormatPattern" className="block text-[10px] font-black uppercase tracking-[0.3em] text-emerald-600 dark:text-emerald-400 mb-2 ml-1">Pattern Schema <InfoIcon tooltip="Define the title structure. Use <number> for SSC version and <country/code> for country. E.g., '[SSC<number>] My Song (<country/code>)'" /></label>
              <input type="text" id="titleFormatPattern" value={titleFormatPattern} onChange={(e) => setTitleFormatPattern(e.target.value)} className="block w-full px-4 py-3 bg-white/10 dark:bg-black/20 border border-white/10 rounded-2xl shadow-inner placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 text-gray-900 dark:text-white sm:text-base font-bold transition-all" disabled={isLoading} />
            </div>
            <div>
              <label htmlFor="durationLimit" className="block text-[10px] font-black uppercase tracking-[0.3em] text-emerald-600 dark:text-emerald-400 mb-2 ml-1">Temporal Constraint (sec) <InfoIcon tooltip="Maximum allowed song duration in seconds." /></label>
              <input type="number" id="durationLimit" value={durationLimitSeconds} onChange={(e) => setDurationLimitSeconds(Math.max(1, parseInt(e.target.value)) || 300)} min="1" className="block w-full px-4 py-3 bg-white/10 dark:bg-black/20 border border-white/10 rounded-2xl shadow-inner placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 text-gray-900 dark:text-white sm:text-base font-bold transition-all" disabled={isLoading} />
            </div>
          </div>
          <div>
            <label htmlFor="contentRating" className="block text-[10px] font-black uppercase tracking-[0.3em] text-emerald-600 dark:text-emerald-400 mb-2 ml-1">Rating Protocol</label>
            <select id="contentRating" value={selectedRating} onChange={(e) => setSelectedRating(e.target.value as RatingLevel)} className="block w-full px-4 py-3 bg-white/10 dark:bg-black/20 border border-white/10 rounded-2xl shadow-inner focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 text-gray-900 dark:text-white sm:text-base font-bold transition-all appearance-none" disabled={isLoading}>
              {ratingOptions.map(option => (<option key={option.value} value={option.value} className="bg-gray-900">{option.label}</option>))}
            </select>
          </div>
          <p className="text-[8px] font-black uppercase tracking-widest text-gray-500/60 mt-1 ml-1">Lyrics analysis performed via secure Gemini Worker proxy protocol.</p>
          <Button 
            onClick={handleRunChecks} 
            disabled={isLoading || !isPasswordCorrect || !sunoUrlsInput.trim() || !titleFormatPattern.trim()} 
            variant="primary"
            size="lg"
            backgroundColor="#10b981"
            className="w-full font-black uppercase tracking-[0.3em] text-sm py-5 h-auto shadow-emerald-500/20 rounded-3xl"
            startIcon={isLoading ? null : <ComplianceCheckIcon className="w-6 h-6" />}
          >
            {isLoading ? 'ANALYZING SIGNAL...' : 'RUN COMPLIANCE CHECKS'}
          </Button>
        </div>

        {isLoading && progressMessage && (<div className="mt-6 p-3 bg-gray-100 dark:bg-gray-800 rounded-md text-sm text-green-600 dark:text-green-300 text-center animate-pulse" role="status">{progressMessage}</div>)}
        {error && (<div className="mt-6 p-4 bg-red-100 dark:bg-red-900/50 bg-opacity-75 rounded-md text-center border border-red-300 dark:border-red-700" role="alert"><p className="text-sm font-medium text-red-700 dark:text-red-300">ERROR</p><p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p></div>)}
        {exportStatusMessage && <p className={`mt-2 text-sm text-center ${exportStatusMessage.includes('Error') ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-300'}`}>{exportStatusMessage}</p>}

        {batchSummary && !isLoading && (
          <div className="mt-8 p-6 glass-card border-white/10 animate-fadeIn">
            <h3 className="text-sm font-black uppercase tracking-[0.3em] text-emerald-600 dark:text-emerald-400 mb-6 text-center">Batch Intelligence Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
              <div className="bg-white/5 dark:bg-black/20 p-3 rounded-2xl border border-white/5 text-center"><p className="text-[8px] font-black uppercase tracking-widest text-gray-500 mb-1">Processed</p><p className="font-black text-gray-900 dark:text-white text-lg">{batchSummary.totalProcessed}</p></div>
              <div className="bg-white/5 dark:bg-black/20 p-3 rounded-2xl border border-white/5 text-center"><p className="text-[8px] font-black uppercase tracking-widest text-green-500 mb-1">Passed</p><p className="font-black text-green-600 dark:text-green-200 text-lg">{batchSummary.passedAllChecks}</p></div>
              <div className="bg-white/5 dark:bg-black/20 p-3 rounded-2xl border border-white/5 text-center"><p className="text-[8px] font-black uppercase tracking-widest text-yellow-500 mb-1">Titles</p><p className="font-black text-yellow-600 dark:text-yellow-200 text-lg">{batchSummary.titleIssues}</p></div>
              <div className="bg-white/5 dark:bg-black/20 p-3 rounded-2xl border border-white/5 text-center"><p className="text-[8px] font-black uppercase tracking-widest text-cyan-500 mb-1">Time</p><p className="font-black text-cyan-600 dark:text-cyan-300 text-lg">{batchSummary.durationIssues}</p></div>
              <div className="bg-white/5 dark:bg-black/20 p-3 rounded-2xl border border-white/5 text-center"><p className="text-[8px] font-black uppercase tracking-widest text-orange-500 mb-1">Rating</p><p className="font-black text-orange-600 dark:text-orange-300 text-lg">{batchSummary.contentRatingIssues}</p></div>
              <div className="bg-white/5 dark:bg-black/20 p-3 rounded-2xl border border-white/5 text-center"><p className="text-[8px] font-black uppercase tracking-widest text-red-500 mb-1">Errors</p><p className="font-black text-red-600 dark:text-red-300 text-lg">{batchSummary.processingErrors}</p></div>
            </div>
          </div>
        )}

        {batchRunResults.length > 0 && (
          <div className="mt-12 space-y-8">
            <div className="flex justify-between items-center border-b border-white/10 pb-4">
              <h2 className="text-xl font-black uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">Analysis Logs</h2>
               <Button onClick={handleExportToCsv} disabled={isLoading} variant="ghost" size="sm" startIcon={<DownloadIcon className="w-4 h-4" />} className="font-black uppercase tracking-widest text-[9px] border-white/10">Export Summary</Button>
            </div>
            {batchRunResults.map((result, index) => (
              <div key={result.inputUrl + index} className="p-6 glass-card border-white/10 shadow-xl transition-all duration-300 animate-fadeIn">
                <div className="flex justify-between items-start mb-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600/60 truncate flex-grow" title={result.inputUrl}>Signal: {result.inputUrl}</p>
                  {result.processingError && <Button onClick={() => handleRetryUrl(result.inputUrl)} disabled={isLoading || !isPasswordCorrect} variant="warning" size="xs" startIcon={<RefreshIcon className="w-3 h-3 text-black" />} className="ml-4 font-black uppercase tracking-widest text-[8px]">Retry Signal</Button>}
                </div>
                {result.processingError && !result.clipData && (<ResultDisplay title="Processing Error" status={false} message={result.processingError} />)}
                {result.clipData && (
                  <div className="space-y-6">
                    <div className="p-4 bg-white/5 dark:bg-black/20 rounded-3xl border border-white/5">
                      <div className="flex flex-col sm:flex-row gap-6 items-center">
                        {result.clipData.image_url && (
                          <img src={result.clipData.image_url} alt="Cover Art" className="w-24 h-24 object-cover rounded-2xl border border-white/10 shadow-lg flex-shrink-0" onError={(e) => (e.currentTarget.style.display = 'none')} />
                        )} 
                        <div className="flex-1 text-center sm:text-left min-w-0">
                          <h3 className="text-xl font-black uppercase tracking-tighter text-emerald-600 dark:text-emerald-400 truncate" title={result.clipData.title}>{result.clipData.title || "UNTITLED_SIGNAL"}</h3>
                          <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mt-1">by <a href={result.clipData.suno_creator_url} target="_blank" rel="noopener noreferrer" className="hover:text-emerald-500 transition-colors">{result.clipData.display_name || `@${result.clipData.handle}` || "ANONYMOUS_ENTITY"}</a></p>
                          <a href={result.clipData.suno_song_url} target="_blank" rel="noopener noreferrer" className="text-[8px] font-black uppercase tracking-[0.2em] text-emerald-500 hover:text-emerald-400 mt-2 inline-block">SOURCE_LINK</a>
                        </div>
                      </div>
                    </div>
                    {result.clipData.audio_url && (
                      <div className="my-4 p-2 bg-white/5 rounded-2xl border border-white/5">
                        <audio controls src={result.clipData.audio_url} className="w-full h-8 opacity-40 hover:opacity-100 transition-opacity">Audio not supported.</audio>
                      </div>
                    )}
                    {result.songLyrics && (
                      <div className="space-y-3">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 ml-1">Lyrical Content</h4>
                        <div className="p-4 bg-white/5 dark:bg-black/20 border border-white/5 rounded-2xl max-h-40 overflow-y-auto text-xs font-bold text-gray-500 dark:text-gray-400 whitespace-pre-wrap leading-relaxed scrollbar-thin">
                          {result.songLyrics}
                        </div>
                        <Button onClick={() => handleProcessLyrics(result.songLyrics)} disabled={!result.songLyrics} variant="ghost" size="xs" startIcon={<LyricsIcon className="w-3 h-3" />} className="w-full font-black uppercase tracking-widest text-[8px] border-white/5 hover:bg-white/5">Inject into Lyric Lab</Button>
                      </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {result.titleCheck && <ResultDisplay title="Title Format Check" status={result.titleCheck.passed} message={result.titleCheck.message} details={result.titleCheck} />}
                      {result.durationCheck && <ResultDisplay title="Duration Check" status={result.durationCheck.passed} message={result.durationCheck.message} details={result.durationCheck} />}
                      {result.languageCheck && <ResultDisplay title="Lyrics Language Analysis (Gemini)" status={!result.languageCheck.primaryLanguageCode.includes('Error')} message={result.languageCheck.message || 'Analysis complete.'} details={result.languageCheck} />}
                      {result.contentRatingCheck && <ResultDisplay title={`Content Rating Check (${selectedRating})`} status={result.contentRatingCheck.is_appropriate} message={result.contentRatingCheck.message || 'Analysis complete.'} details={result.contentRatingCheck.explanation} />}
                      {result.processingError && result.clipData && <ResultDisplay title="Processing Error during analysis" status={false} message={result.processingError} />}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default SunoSongComplianceTool;
