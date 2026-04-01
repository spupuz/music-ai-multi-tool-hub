import React from 'react';
import type { ToolProps } from '@/Layout';
import { useMP3CutterLogic } from '@/hooks/useMP3CutterLogic';
import Spinner from '@/components/Spinner';
import Button from '@/components/common/Button';
import { LinkIcon, UploadIcon, DownloadIcon, PlayIcon, PauseIcon, StopIcon, CropIcon, ImportIcon } from '@/components/Icons';

const LOGO_SVG_STRING = `<svg viewBox='0 0 100 100' fill='none' xmlns='http://www.w3.org/2000/svg'><path d='M50 10 L85 27.5 V72.5 L50 90 L15 72.5 V27.5 L50 10 Z' stroke='#059669' stroke-width='8' fill='transparent'/><circle cx='50' cy='35' r='7' fill='#14B8A6'/><circle cx='35' cy='65' r='6' fill='#14B8A6'/><circle cx='65' cy='65' r='6' fill='#14B8A6'/><line x1='50' y1='35' x2='35' y2='65' stroke='#10B981' stroke-width='5' stroke-linecap='round'/><line x1='50' y1='35' x2='65' y2='65' stroke='#10B981' stroke-width='5' stroke-linecap='round'/><line x1='38' y1='63' x2='62' y2='63' stroke='#10B981' stroke-width='5' stroke-linecap='round'/></svg>`;
const FALLBACK_IMAGE_DATA_URI = `data:image/svg+xml;base64,${btoa(LOGO_SVG_STRING)}`;





const TimeInput: React.FC<{ label: string; value: string; onChange: (val: string) => void; id: string }> = ({ label, value, onChange, id }) => (
    <div>
        <label htmlFor={id} className="block text-xs font-medium text-gray-600 dark:text-gray-400">{label}</label>
        <input
            type="text"
            id={id}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="mt-1 block w-full px-2 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 text-sm text-gray-900 dark:text-white"
            placeholder="MM:SS.mmm"
        />
    </div>
);

const MP3CutterTool: React.FC<ToolProps> = ({ trackLocalEvent }) => {
  const {
    wavesurferRef,
    waveformReady,
    fileName,
    duration,
    selection,
    isPlaying,
    isLoading,
    error,
    handleFileChange,
    handlePlayPause,
    handleStop,
    handlePlaySelection,
    handleCropAndDownload,
    handleVolumeChange,
    volume,
    formatTime,
    setSelectionStart,
    setSelectionEnd,
    sunoUrlInput, 
    setSunoUrlInput, 
    handleLoadFromUrl, 
    urlLoadingProgress,
    sunoCoverArtUrl, 
    sunoArtistName,  
    handleDownloadCoverArt, 
  } = useMP3CutterLogic({ trackLocalEvent });

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const isSelectionTooLong = duration > 0 && (selection.end - selection.start) > (duration * 0.5);

  return (
    <div className="w-full">
      <header className="mb-2 md:mb-14 text-center pt-0 md:pt-8 px-4 animate-fadeIn">
        <h1 className="text-lg sm:text-5xl md:text-7xl font-black uppercase tracking-tighter text-emerald-600 dark:text-emerald-500 leading-none italic drop-shadow-2xl mb-1 md:mb-4">MP3 Cutter</h1>
        <p className="mt-1 md:mt-4 text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.4em] text-gray-500 dark:text-gray-400 max-w-xl mx-auto opacity-70">
            Precision Audio Trimming • Non-Destructive Signal Editing
        </p>
      </header>

      <main className="w-full glass-card p-2 sm:p-6 md:p-10 border-white/10 text-gray-900 dark:text-gray-200 transition-all duration-500 animate-fadeIn overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 blur-[100px] pointer-events-none"></div>
        <div className="space-y-4 mb-6">
          {/* URL Input Section */}
          <div>
            <label htmlFor="sunoUrlInput" className="block text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-3 ml-1">
              Import from Source URL
            </label>
            <div className="mt-1 flex flex-col sm:flex-row rounded-md shadow-sm gap-2 sm:gap-0 w-full max-w-full">
              <input
                type="text"
                name="sunoUrlInput"
                id="sunoUrlInput"
                value={sunoUrlInput}
                onChange={(e) => setSunoUrlInput(e.target.value)}
                className="block w-full flex-1 rounded-2xl sm:rounded-none sm:rounded-l-2xl border-white/10 bg-white/10 dark:bg-black/20 px-4 py-3.5 text-sm font-bold text-gray-900 dark:text-white placeholder-gray-500 focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                placeholder="suno.com/..., riffusion.com/..., producer.ai/..."
                disabled={isLoading}
              />
              <Button
                onClick={handleLoadFromUrl}
                disabled={isLoading || !sunoUrlInput.trim()}
                variant="primary"
                size="md"
                startIcon={<ImportIcon className="h-4 w-4" />}
                className="w-full sm:w-auto rounded-2xl sm:rounded-l-none font-black uppercase tracking-widest text-[8px] sm:text-[10px] py-4 sm:py-0 whitespace-nowrap"
                backgroundColor="#8b5cf6"
                loading={isLoading && !!sunoUrlInput}
              >
                LOAD
              </Button>
            </div>
          </div>

          {/* OR Separator */}
          <div className="flex items-center">
            <div className="flex-grow border-t border-gray-300 dark:border-gray-700"></div>
            <span className="flex-shrink mx-4 text-gray-500">OR</span>
            <div className="flex-grow border-t border-gray-300 dark:border-gray-700"></div>
          </div>

          {/* File Upload Section */}
          <div className="flex flex-row items-center justify-center gap-6 p-4 bg-white/5 dark:bg-black/20 rounded-2xl border border-white/5">
            <input type="file" accept=".mp3" onChange={handleFileChange} className="hidden" ref={fileInputRef} aria-label="Upload MP3 file"/>
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              variant="primary"
              size="md"
              startIcon={<UploadIcon className="w-4 h-4 ml-0.5" />}
              className="px-6 py-2.5 rounded-xl font-black uppercase tracking-widest text-[10px]"
              backgroundColor="#22c55e"
            >
              Upload
            </Button>
            {fileName && (
              <div className="text-left flex-1 min-w-0">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 opacity-60">Source File</p>
                <p className="text-sm font-black text-green-600 dark:text-green-300 truncate max-w-[150px] sm:max-w-[400px]" title={fileName}>{fileName}</p>
              </div>
            )}
          </div>
        </div>

        {isLoading && (
          <div className="flex flex-row items-center justify-center gap-6 my-6 p-4 bg-green-500/5 rounded-2xl animate-pulse">
            <Spinner color="text-green-600" />
            <div className="text-left">
              <p className="text-[10px] font-black uppercase tracking-widest text-green-600">Processing Audio</p>
              <p className="text-xs font-bold text-green-600/60 uppercase tracking-tighter">{urlLoadingProgress || 'Hydrating stream...'}</p>
            </div>
          </div>
        )}
        {error && <div className="my-4 p-3 bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-200 rounded-md text-sm text-center">{error}</div>}
        
        {sunoArtistName && (
          <div className="my-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 flex flex-col items-center gap-3">
            <img 
              src={sunoCoverArtUrl || FALLBACK_IMAGE_DATA_URI} 
              alt={fileName || 'Song Cover'} 
              className="w-32 h-32 md:w-40 md:h-40 object-cover rounded-md border-2 border-green-500" 
              onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_IMAGE_DATA_URI; }}
            />
            {sunoArtistName && <p className="text-md text-green-700 dark:text-green-300">Artist: {sunoArtistName}</p>}
            {sunoCoverArtUrl && (
              <Button
                onClick={handleDownloadCoverArt}
                variant="info"
                size="xs"
                startIcon={<DownloadIcon className="w-3.5 h-3.5" />}
                className="font-black uppercase tracking-widest text-[9px]"
              >
                Download Cover Art
              </Button>
            )}
          </div>
        )}


        <div id="waveform-container" ref={wavesurferRef} className="w-full h-32 bg-white/5 dark:bg-black/40 rounded-2xl border border-white/10 my-8 shadow-inner overflow-hidden">
          {!waveformReady && !isLoading && <div className="flex items-center justify-center h-full text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 opacity-40">Waveform will appear here</div>}
        </div>
        
        {waveformReady && (
          <>
            <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
              <TimeInput label="Selection Start" id="selectionStart" value={selection.startFormatted} onChange={setSelectionStart} />
              <TimeInput label="Selection End" id="selectionEnd" value={selection.endFormatted} onChange={setSelectionEnd} />
            </div>
             <div className="text-xs text-center text-gray-500 dark:text-gray-400 mb-4">
                Original Duration: {formatTime(duration)} | Selected: {formatTime(selection.end - selection.start)}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
            <div className="flex flex-wrap items-center justify-center gap-4 mb-6">
              <Button 
                onClick={handlePlayPause} 
                variant="primary"
                size="md"
                startIcon={isPlaying ? <PauseIcon className="w-4 h-4" /> : <PlayIcon className="w-4 h-4" />}
                backgroundColor="#22c55e"
                className="font-black uppercase tracking-widest text-[10px]"
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? 'Pause' : 'Play'}
              </Button>
              <Button 
                onClick={handleStop} 
                variant="primary"
                size="md"
                startIcon={<StopIcon className="w-4 h-4" />}
                backgroundColor="#22c55e"
                className="font-black uppercase tracking-widest text-[10px]"
                aria-label="Stop"
              >
                Stop
              </Button>
              <Button 
                onClick={handlePlaySelection} 
                disabled={selection.end <= selection.start} 
                variant="primary"
                size="md"
                startIcon={<PlayIcon className="w-3.5 h-3.5 ml-0.5" />}
                backgroundColor="#22c55e"
                className="font-black uppercase tracking-widest text-[10px]"
                aria-label="Play selection"
              >
                Play Selection
              </Button>
            </div>
            </div>
            
            <div className="flex items-center justify-center gap-2 mb-6 text-sm">
                <label htmlFor="volumeControl" className="text-gray-600 dark:text-gray-400">Volume:</label>
                <input 
                    type="range" 
                    id="volumeControl" 
                    min="0" 
                    max="1" 
                    step="0.01" 
                    value={volume} 
                    onChange={handleVolumeChange} 
                    className="w-32 h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-green-500 dark:accent-green-400"
                    aria-label="Volume control"
                />
            </div>
            <div className="flex flex-row items-center justify-center gap-6 p-6 bg-white/5 dark:bg-black/20 rounded-3xl border border-white/5 shadow-inner">
                <Button
                  onClick={handleCropAndDownload}
                  disabled={!waveformReady || selection.end <= selection.start || isSelectionTooLong}
                  loading={isLoading}
                  variant="primary"
                  size="lg"
                  startIcon={<CropIcon className="w-5 h-5 ml-0.5" />}
                  backgroundColor="#22c55e"
                  className="px-8 py-4 rounded-xl font-black uppercase tracking-widest text-xs"
                >
                  Crop & Export
                </Button>
                <div className="text-left space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-yellow-600">Legal Limit</p>
                  <p className="text-[8px] font-bold uppercase tracking-widest opacity-40 max-w-[200px]">Max selection: 50% of total duration</p>
                </div>
            </div>
                {isSelectionTooLong && (
                    <p className="text-sm text-red-500 dark:text-red-400 mt-2 text-center animate-pulse">
                        Selection exceeds 50% of total audio duration ({formatTime(duration * 0.5)}). Please select a shorter region.
                    </p>
                )}
            <p className="text-xs text-center text-gray-500 mt-2">
              Note: Cropped audio will be downloaded as an MP3 file.
            </p>
          </>
        )}
        
        <div className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-700 text-center">
            <p className="text-sm text-red-600 dark:text-red-300 bg-red-50 dark:bg-gray-800 p-3 rounded-md">
              <span className="text-lg">⚠️</span> <span className="font-semibold">Copyright Disclaimer:</span> This tool is intended for personal, transformative, or fair use of audio material. Users are solely responsible for ensuring they have the necessary rights or permissions to upload, process, and download any copyrighted audio. This tool does not endorse or facilitate copyright infringement.
            </p>
        </div>

      </main>
    </div>
  );
};

export default MP3CutterTool;
