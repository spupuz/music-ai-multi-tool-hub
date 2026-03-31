
import React from 'react';
import type { ToolProps } from '@/Layout';
import { useMP3CutterLogic } from '@/hooks/useMP3CutterLogic';
import Spinner from '@/components/Spinner';

const LOGO_SVG_STRING = `<svg viewBox='0 0 100 100' fill='none' xmlns='http://www.w3.org/2000/svg'><path d='M50 10 L85 27.5 V72.5 L50 90 L15 72.5 V27.5 L50 10 Z' stroke='#059669' stroke-width='8' fill='transparent'/><circle cx='50' cy='35' r='7' fill='#14B8A6'/><circle cx='35' cy='65' r='6' fill='#14B8A6'/><circle cx='65' cy='65' r='6' fill='#14B8A6'/><line x1='50' y1='35' x2='35' y2='65' stroke='#10B981' stroke-width='5' stroke-linecap='round'/><line x1='50' y1='35' x2='65' y2='65' stroke='#10B981' stroke-width='5' stroke-linecap='round'/><line x1='38' y1='63' x2='62' y2='63' stroke='#10B981' stroke-width='5' stroke-linecap='round'/></svg>`;
const FALLBACK_IMAGE_DATA_URI = `data:image/svg+xml;base64,${btoa(LOGO_SVG_STRING)}`;


// Icons
const UploadIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" /></svg>);
const PlayIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M8 5v14l11-7z"/></svg>);
const PauseIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>);
const StopIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M6 6h12v12H6z"/></svg>);
const DownloadIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>);
const CropIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M7.875 14.25l1.214 1.942a2.25 2.25 0 003.822 0l1.214-1.942M2.41 9h4.638a2.25 2.25 0 011.906 1.058l.867 1.306M21.59 9h-4.638a2.25 2.25 0 00-1.906 1.058l-.867 1.306m0 0L12 12.75m0 0l-1.214 1.822M12 12.75V9M12 12.75V6A2.25 2.25 0 009.75 3.75h-.75A2.25 2.25 0 006.75 6v3" /></svg>);
const LinkIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" /></svg>);


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
      <header className="mb-10 text-center">
        <h1 className="text-5xl font-extrabold text-green-600 dark:text-green-400">MP3 Cutter & Cropper</h1>
        <p className="mt-3 text-md text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
          Upload an MP3 file or load from a Suno, Riffusion, or Producer.AI song URL. Visualize its waveform, select a region (max 50% of total duration), and download the cropped audio as an MP3 file.
        </p>
      </header>

      <main className="w-full bg-white dark:bg-gray-900 shadow-2xl rounded-lg p-6 md:p-10 border-2 border-green-600 dark:border-green-500">
        <div className="space-y-4 mb-6">
          {/* URL Input Section */}
          <div>
            <label htmlFor="sunoUrlInput" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Enter Suno/Riffusion/Producer.AI Song URL
            </label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <input
                type="text"
                name="sunoUrlInput"
                id="sunoUrlInput"
                value={sunoUrlInput}
                onChange={(e) => setSunoUrlInput(e.target.value)}
                className="block w-full flex-1 rounded-none rounded-l-md border-gray-300 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 px-3 py-2 text-gray-900 dark:text-white placeholder-gray-400 focus:border-green-500 focus:ring-green-500 sm:text-sm"
                placeholder="suno.com/..., riffusion.com/..., producer.ai/..."
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={handleLoadFromUrl}
                disabled={isLoading || !sunoUrlInput.trim()}
                className="relative -ml-px inline-flex items-center space-x-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-purple-600 px-2 sm:px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <LinkIcon className="h-5 w-5" />
                <span className="hidden sm:inline">Load URL</span>
              </button>
            </div>
          </div>

          {/* OR Separator */}
          <div className="flex items-center">
            <div className="flex-grow border-t border-gray-300 dark:border-gray-700"></div>
            <span className="flex-shrink mx-4 text-gray-500">OR</span>
            <div className="flex-grow border-t border-gray-300 dark:border-gray-700"></div>
          </div>

          {/* File Upload Section */}
          <div className="flex flex-col items-center justify-center">
            <input type="file" accept=".mp3" onChange={handleFileChange} className="hidden" ref={fileInputRef} aria-label="Upload MP3 file"/>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              className="inline-flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-semibold text-black bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-400 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-900 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:text-gray-500 dark:disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              <UploadIcon className="mr-2" /> Upload MP3 File
            </button>
            {fileName && (
              <p className="mt-3 text-lg font-semibold text-gray-800 dark:text-gray-300 text-center">
                Current Audio: <span className="text-green-600 dark:text-green-300">{fileName}</span>
              </p>
            )}
          </div>
        </div>

        {isLoading && <div className="flex flex-col items-center justify-center my-4"><Spinner /><p className="mt-2 text-green-600 dark:text-green-300">{urlLoadingProgress || 'Loading audio...'}</p></div>}
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
              <button
                onClick={handleDownloadCoverArt}
                className="inline-flex items-center justify-center py-1.5 px-3 bg-teal-600 hover:bg-teal-500 text-white rounded-md text-xs"
              >
                <DownloadIcon className="mr-1.5" /> Download Cover Art
              </button>
            )}
          </div>
        )}


        <div id="waveform-container" ref={wavesurferRef} className="w-full h-32 bg-gray-100 dark:bg-gray-800 rounded-md border-2 border-green-600 my-4">
          {!waveformReady && !isLoading && <div className="flex items-center justify-center h-full text-gray-500">Waveform will appear here</div>}
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
              <button 
                onClick={handlePlayPause} 
                className="py-2 px-4 bg-green-500 hover:bg-green-600 text-black font-semibold rounded-md text-sm flex items-center justify-center gap-2 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-400 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-900"
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? <PauseIcon /> : <PlayIcon />} {isPlaying ? 'Pause' : 'Play'}
              </button>
              <button 
                onClick={handleStop} 
                className="py-2 px-4 bg-green-500 hover:bg-green-600 text-black font-semibold rounded-md text-sm flex items-center justify-center gap-2 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-400 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-900"
                aria-label="Stop"
              >
                <StopIcon /> Stop
              </button>
              <button 
                onClick={handlePlaySelection} 
                disabled={selection.end <= selection.start} 
                className="py-2 px-4 bg-green-500 hover:bg-green-600 text-black font-semibold rounded-md text-sm flex items-center justify-center gap-2 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-400 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-900 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:text-gray-500 dark:disabled:text-gray-400"
                aria-label="Play selection"
              >
                <PlayIcon /> Play Selection
              </button>
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
            <div className="flex flex-col items-center justify-center">
                <button
                  onClick={handleCropAndDownload}
                  disabled={isLoading || !waveformReady || selection.end <= selection.start || isSelectionTooLong}
                  className="inline-flex items-center justify-center py-1.5 px-3 bg-green-500 hover:bg-green-600 text-black font-semibold rounded-md text-sm transition-colors disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:text-gray-500 dark:disabled:text-gray-400"
                >
                  {isLoading ? <Spinner color="text-black" /> : <><CropIcon className="mr-2" /> Crop & Download MP3</>}
                </button>
                <p className="text-xs text-center text-yellow-600 dark:text-yellow-300 mt-2 bg-yellow-100 dark:bg-gray-800 p-1 rounded">
                  Cropping is limited to a maximum of 50% of the total audio duration.
                </p>
                {isSelectionTooLong && (
                    <p className="text-sm text-red-500 dark:text-red-400 mt-2 text-center animate-pulse">
                        Selection exceeds 50% of total audio duration ({formatTime(duration * 0.5)}). Please select a shorter region.
                    </p>
                )}
            </div>
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
