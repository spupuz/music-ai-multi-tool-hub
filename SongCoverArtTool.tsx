
import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { GeneratedImage, AppState } from './types';
import ImageUpload from './components/ImageUpload';
import Spinner from './components/Spinner';
import { addTextToImage, TextOptions, OverlayImageOptions, ImageFilterOptions, hexToRgb } from './utils/imageUtils';
import type { ToolProps } from './Layout'; // Import ToolProps for trackLocalEvent
import { fetchSunoClipById, resolveSunoUrlToPotentialSongId } from './services/sunoService';
import { fetchRiffusionSongData, extractRiffusionSongId } from './services/riffusionService';
import InputField from './components/forms/InputField';
import SelectField from './components/forms/SelectField';
import CheckboxField from './components/forms/CheckboxField';
import SliderField from './components/forms/SliderField';
import TextAreaField from './components/forms/TextAreaField';


const LOGO_SVG_STRING = `<svg viewBox='0 0 100 100' fill='none' xmlns='http://www.w3.org/2000/svg'><path d='M50 10 L85 27.5 V72.5 L50 90 L15 72.5 V27.5 L50 10 Z' stroke='#059669' stroke-width='8' fill='transparent'/><circle cx='50' cy='35' r='7' fill='#14B8A6'/><circle cx='35' cy='65' r='6' fill='#14B8A6'/><circle cx='65' cy='65' r='6' fill='#14B8A6'/><line x1='50' y1='35' x2='35' y2='65' stroke='#10B981' stroke-width='5' stroke-linecap='round'/><line x1='50' y1='35' x2='65' y2='65' stroke='#10B981' stroke-width='5' stroke-linecap='round'/><line x1='38' y1='63' x2='62' y2='63' stroke='#10B981' stroke-width='5' stroke-linecap='round'/></svg>`;
const FALLBACK_IMAGE_DATA_URI = `data:image/svg+xml;base64,${btoa(LOGO_SVG_STRING)}`;


// Extended TextOptions to include new fields
interface ExtendedTextOptions extends TextOptions {
  songNameXOffset: number;
  songNameYOffset: number;
  songNameRotation: number;
  artistNameXOffset: number;
  artistNameYOffset: number;
  artistNameRotation: number;
  // Shadow properties are now part of TextOptions directly
  // Alignment properties also part of TextOptions
  // Letter spacing properties also part of TextOptions
}

// --- Art Style Preset System Types ---
interface ArtStyleSettings {
  fontFamily: string;
  fontColor: string;
  hasStroke: boolean;
  strokeThickness: number;
  strokeColor: string;
  songNamePosition: string;
  artistNamePosition: string;
  relativeFontSize: string;
  featuredArtistName?: string;
  textColorMode: 'solid' | 'gradient';
  gradientColor1?: string;
  gradientColor2?: string;
  gradientDirection?: string;
  songNameXOffset: number;
  songNameYOffset: number;
  songNameRotation: number;
  artistNameXOffset: number;
  artistNameYOffset: number;
  artistNameRotation: number;

  // Text Shadow Properties
  hasTextShadow?: boolean;
  textShadowColor?: string;
  textShadowBlur?: number;
  textShadowOffsetX?: number;
  textShadowOffsetY?: number;

  // Text Alignment Properties
  songNameTextAlign?: CanvasTextAlign | 'auto';
  artistNameTextAlign?: CanvasTextAlign | 'auto';

  // Letter Spacing Properties
  songNameLetterSpacing?: number;
  artistNameLetterSpacing?: number;

  brightness: number;
  contrast: number;
  saturation: number;
  grayscale: number;
  sepia: number;
  hueRotate: number;
  blur: number;

  overlayActive: boolean;
  overlayPosition?: string;
  overlaySizePercent?: number;
  overlayOpacity?: number;
  overlayBlendMode?: string;

  // New Advanced Effects
  vignetteIntensity: number;
  vignetteColor: string;
  noiseAmount: number;
  duotone: boolean;
  duotoneColor1: string;
  duotoneColor2: string;
}

interface ArtStylePreset {
  id: string;
  name: string;
  settings: ArtStyleSettings;
  createdAt: string;
}

const SAVED_PRESETS_LOCAL_STORAGE_KEY = 'songCoverArt_savedStylePresets_v1';
// --- End Art Style Preset System Types ---


const imageUrlToBase64 = (url: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to create canvas context'));
        return;
      }
      ctx.drawImage(img, 0, 0);
      try {
        const dataUrl = canvas.toDataURL('image/png');
        resolve(dataUrl);
      } catch (e) {
        reject(new Error(`Could not get data URL from canvas. Error: ${e}`));
      }
    };
    img.onerror = (err) => {
      // This can happen due to CORS issues if the server doesn't send the right headers.
      // We will attempt to use a proxy as a fallback.
      console.warn("Direct image fetch failed, trying proxy. Error:", err);
      const proxiedUrl = `https://corsproxy.io/?url=${encodeURIComponent(url)}`;
      const proxyImg = new Image();
      proxyImg.crossOrigin = 'Anonymous';
      proxyImg.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = proxyImg.width;
        canvas.height = proxyImg.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) { reject(new Error('Failed to create canvas context via proxy')); return; }
        ctx.drawImage(proxyImg, 0, 0);
        try { resolve(canvas.toDataURL('image/png')); }
        catch (e) { reject(new Error(`Could not get data URL from canvas via proxy. Error: ${e}`)); }
      };
      proxyImg.onerror = () => {
        reject(new Error(`Failed to load image from URL directly and via proxy. The URL may be invalid or blocked by CORS.`));
      };
      proxyImg.src = proxiedUrl;
    };
    img.src = url;
  });
};


const SparklesIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.898 20.562L16.5 21.75l-.398-1.188a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.188-.398a2.25 2.25 0 001.423-1.423l.398-1.188.398 1.188a2.25 2.25 0 001.423 1.423l1.188.398-1.188.398a2.25 2.25 0 00-1.423 1.423z" />
  </svg>
);


// --- Icons for Presets Section ---
const PaletteIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.39m3.421 3.421a3 3 0 00 1.128 5.78l-.707 1.707M9.53 16.122l1.707-.707a3 3 0 002.245-2.4m1.707.707l-.707-1.707m6-13.5V4.5A2.25 2.25 0 0013.5 2.25H4.5A2.25 2.25 0 002.25 4.5v13.5A2.25 2.25 0 004.5 20.25h9a2.25 2.25 0 002.25-2.25v-1.5M16.5 5.25v3.75m0 0A2.25 2.25 0 0114.25 11.25h-1.5a2.25 2.25 0 01-2.25-2.25V5.25m3 0h3" /></svg>);
const SaveIcon: React.FC<{ className?: string }> = ({ className = "w-3.5 h-3.5" }) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>);
const LoadIcon: React.FC<{ className?: string }> = ({ className = "w-3.5 h-3.5" }) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" transform="rotate(180 12 12)" /></svg>);
const DeleteIcon: React.FC<{ className?: string }> = ({ className = "w-3 h-3" }) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12.56 0c1.153 0 2.243.096 3.222.261m3.478-.397a48.217 48.217 0 01-4.244 0M11.25 9h1.5v9h-1.5V9z" /></svg>);
const ExportIcon: React.FC<{ className?: string }> = ({ className = "w-3 h-3" }) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9.75v6.75m0 0l-3-3m3 3l3-3m-8.25 6a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" /></svg>);
const ImportIcon: React.FC<{ className?: string }> = ({ className = "w-3 h-3" }) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" /></svg>);
const ConfigIcon: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className = "w-4 h-4", style }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.223.893c.05.199.121.39.209.572.088.182.202.35.34.501.138.15.297.281.47.392.173.112.364.204.568.276l.672.224c.543.181.94.692.94 1.27v1.154c0 .579-.397 1.09-.94 1.27l-.672.224c-.204.072-.395.164-.568.276-.173.111-.332.242-.47.392-.138.151-.252.319-.34.501-.088.182-.159.373-.209.572l-.223.893c-.09.542-.56.94-1.11-.94h-2.593c-.55 0-1.02-.398-1.11-.94l-.223-.893a6.002 6.002 0 01-.209-.572c-.088-.182-.202.35-.34-.501s-.297-.281-.47-.392c-.173-.112-.364-.204-.568-.276l-.672-.224c-.543-.181-.94-.692-.94-1.27V9.409c0-.579.397-1.09.94-1.27l.672-.224c.204-.072.395-.164-.568-.276.173-.111.332.242.47.392.138-.151.252.319.34.501.088.182.159.373.209.572l.223-.893z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);
// --- End Icons ---


const availableFonts = [
  { value: 'Arial', label: 'Arial' }, { value: 'Arial Black', label: 'Arial Black' },
  { value: 'Verdana', label: 'Verdana' }, { value: 'Tahoma', label: 'Tahoma' },
  { value: 'Trebuchet MS', label: 'Trebuchet MS' }, { value: 'Impact', label: 'Impact' },
  { value: 'Georgia', label: 'Georgia' }, { value: 'Times New Roman', label: 'Times New Roman' },
  { value: 'Courier New', label: 'Courier New' }, { value: 'Lucida Console', label: 'Lucida Console' },
  { value: 'Comic Sans MS', label: 'Comic Sans MS (Use with caution!)' },
  { value: 'Brush Script MT', label: 'Brush Script MT' }, { value: 'Helvetica', label: 'Helvetica' },
  { value: 'Futura', label: 'Futura (Modern Sans-Serif)' }, { value: 'Garamond', label: 'Garamond (Classic Serif)' },
  { value: 'Palatino', label: 'Palatino (Serif)' }, { value: 'Optima', label: 'Optima (Humanist Sans-Serif)' }
];
const textPositionOptions = [
  { value: 'top-left', label: 'Top Left' }, { value: 'top-center', label: 'Top Center' },
  { value: 'top-right', label: 'Top Right' }, { value: 'middle-left', label: 'Middle Left' },
  { value: 'middle-center', label: 'Middle Center' }, { value: 'middle-right', label: 'Middle Right' },
  { value: 'bottom-left', label: 'Bottom Left' }, { value: 'bottom-center', label: 'Bottom Center' },
  { value: 'bottom-right', label: 'Bottom Right' },
];
const overlayPositionOptions = [
  { value: 'top-left', label: 'Top Left' }, { value: 'top-right', label: 'Top Right' },
  { value: 'bottom-left', label: 'Bottom Left' }, { value: 'bottom-right', label: 'Bottom Right' },
  { value: 'center', label: 'Center' },
];
const relativeFontSizeOptions = [
  { value: 'tiny', label: 'Tiny (60%)' }, { value: 'xsmall', label: 'X-Small (70%)' },
  { value: 'small', label: 'Small (80%)' }, { value: 'medium', label: 'Medium (100%)' },
  { value: 'large', label: 'Large (120%)' }, { value: 'xlarge', label: 'X-Large (150%)' },
  { value: 'huge', label: 'Huge (180%)' }, { value: 'giant', label: 'Giant (220%)' },
];
interface TextPreset { value: string; label: string; settings: Partial<ExtendedTextOptions>; }
const textEffectPresets: TextPreset[] = [
  { value: 'none', label: 'Custom Settings', settings: { textColorMode: 'solid', songNameXOffset: 0, songNameYOffset: 0, songNameRotation: 0, artistNameXOffset: 0, artistNameYOffset: 0, artistNameRotation: 0, hasTextShadow: false, songNameTextAlign: 'auto', artistNameTextAlign: 'auto', songNameLetterSpacing: 0, artistNameLetterSpacing: 0 } },
  { value: 'classicWhiteOutline', label: 'Classic White (Black Outline)', settings: { fontFamily: 'Impact', fontColor: '#FFFFFF', hasStroke: true, strokeThickness: 3, strokeColor: '#000000', relativeFontSize: 'medium', textColorMode: 'solid', songNameXOffset: 0, songNameYOffset: 0, songNameRotation: 0, artistNameXOffset: 0, artistNameYOffset: 0, artistNameRotation: 0, hasTextShadow: false, songNameTextAlign: 'auto', artistNameTextAlign: 'auto', songNameLetterSpacing: 0, artistNameLetterSpacing: 0 } },
  { value: 'boldYellowImpact', label: 'Bold Yellow Impact', settings: { fontFamily: 'Impact', fontColor: '#FFD700', hasStroke: true, strokeThickness: 4, strokeColor: '#4A2E00', relativeFontSize: 'large', textColorMode: 'solid', songNameXOffset: 0, songNameYOffset: 0, songNameRotation: 0, artistNameXOffset: 0, artistNameYOffset: 0, artistNameRotation: 0, hasTextShadow: false, songNameTextAlign: 'auto', artistNameTextAlign: 'auto', songNameLetterSpacing: 0, artistNameLetterSpacing: 0 } },
  { value: 'elegantThinWhite', label: 'Elegant Thin White (No Outline)', settings: { fontFamily: 'Garamond', fontColor: '#FAFAFA', hasStroke: false, strokeThickness: 1, strokeColor: '#000000', relativeFontSize: 'medium', textColorMode: 'solid', songNameXOffset: 0, songNameYOffset: 0, songNameRotation: 0, artistNameXOffset: 0, artistNameYOffset: 0, artistNameRotation: 0, hasTextShadow: false, songNameTextAlign: 'auto', artistNameTextAlign: 'auto', songNameLetterSpacing: 0, artistNameLetterSpacing: 0 } },
  { value: 'cyberGreen', label: 'Cyber Green Glow', settings: { fontFamily: 'Futura', fontColor: '#39FF14', hasStroke: true, strokeThickness: 2, strokeColor: '#0F510F', relativeFontSize: 'medium', textColorMode: 'solid', songNameXOffset: 0, songNameYOffset: 0, songNameRotation: 0, artistNameXOffset: 0, artistNameYOffset: 0, artistNameRotation: 0, hasTextShadow: true, textShadowColor: '#39FF14', textShadowBlur: 5, textShadowOffsetX: 0, textShadowOffsetY: 0, songNameTextAlign: 'auto', artistNameTextAlign: 'auto', songNameLetterSpacing: 0, artistNameLetterSpacing: 0 } },
  { value: 'minimalistBlack', label: 'Minimalist Black (No Outline)', settings: { fontFamily: 'Helvetica', fontColor: '#1A1A1A', hasStroke: false, strokeThickness: 1, strokeColor: '#FFFFFF', relativeFontSize: 'small', textColorMode: 'solid', songNameXOffset: 0, songNameYOffset: 0, songNameRotation: 0, artistNameXOffset: 0, artistNameYOffset: 0, artistNameRotation: 0, hasTextShadow: false, songNameTextAlign: 'auto', artistNameTextAlign: 'auto', songNameLetterSpacing: 0, artistNameLetterSpacing: 0 } },
  { value: 'sunsetGradient', label: 'Sunset Gradient', settings: { fontFamily: 'Arial Black', textColorMode: 'gradient', gradientColor1: '#FF8C00', gradientColor2: '#FF0080', gradientDirection: 'top-to-bottom', hasStroke: true, strokeColor: '#000000', strokeThickness: 2, relativeFontSize: 'large', songNameXOffset: 0, songNameYOffset: 0, songNameRotation: 0, artistNameXOffset: 0, artistNameYOffset: 0, artistNameRotation: 0, hasTextShadow: false, songNameTextAlign: 'auto', artistNameTextAlign: 'auto', songNameLetterSpacing: 0, artistNameLetterSpacing: 0 } }
];
const overlayBlendModeOptions = [
  { value: 'source-over', label: 'Normal' }, { value: 'multiply', label: 'Multiply' },
  { value: 'screen', label: 'Screen' }, { value: 'overlay', label: 'Overlay' },
  { value: 'darken', label: 'Darken' }, { value: 'lighten', label: 'Lighten' },
  { value: 'color-dodge', label: 'Color Dodge' }, { value: 'color-burn', label: 'Color Burn' },
  { value: 'hard-light', label: 'Hard Light' }, { value: 'soft-light', label: 'Soft Light' },
  { value: 'difference', label: 'Difference' }, { value: 'exclusion', label: 'Exclusion' },
  { value: 'hue', label: 'Hue' }, { value: 'saturation', label: 'Saturation' },
  { value: 'color', label: 'Color' }, { value: 'luminosity', label: 'Luminosity' }
];
const textColorModeOptions = [{ value: 'solid', label: 'Solid Color' }, { value: 'gradient', label: 'Gradient Color' },];
const gradientDirectionOptions = [
  { value: 'top-to-bottom', label: 'Top to Bottom' }, { value: 'bottom-to-top', label: 'Bottom to Top' },
  { value: 'left-to-right', label: 'Left to Right' }, { value: 'right-to-left', label: 'Right to Left' },
  { value: 'top-left-to-bottom-right', label: 'Diagonal (Top-Left to Bottom-Right)' },
  { value: 'bottom-left-to-top-right', label: 'Diagonal (Bottom-Left to Top-Right)' },
  { value: 'top-right-to-bottom-left', label: 'Diagonal (Top-Right to Bottom-Left)' },
  { value: 'bottom-right-to-top-left', label: 'Diagonal (Bottom-Right to Top-Left)' },
];
const textAlignOptions: Array<{ value: CanvasTextAlign | 'auto'; label: string }> = [
  { value: 'auto', label: 'Auto (from Position)' },
  { value: 'left', label: 'Left' },
  { value: 'center', label: 'Center' },
  { value: 'right', label: 'Right' },
];

const TOOL_CATEGORY = 'SongCoverArt';
const isValidHexColor = (color: string): boolean => /^#?([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(color);
const normalizeHexColor = (color: string): string => {
  if (!color.startsWith('#')) color = '#' + color;
  if (color.length === 4) { color = `#${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}`; }
  return color.toUpperCase();
};

const SongCoverArtTool: React.FC<ToolProps> = ({ trackLocalEvent }) => {
  const [songUrlInput, setSongUrlInput] = useState<string>('');
  const [songName, setSongName] = useState<string>('');
  const [artistTitle, setArtistTitle] = useState<string>('');
  const [featuredArtistName, setFeaturedArtistName] = useState<string>('');
  const [inputImageBase64, setInputImageBase64] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<GeneratedImage | null>(null);
  const [appState, setAppState] = useState<AppState>(AppState.Idle);
  const [error, setError] = useState<string | null>(null);
  const [progressMessage, setProgressMessage] = useState<string>('');

  const [fontFamily, setFontFamily] = useState<string>('Impact');
  const [fontColor, setFontColor] = useState<string>('#FFFFFF');
  const [fontColorHexInput, setFontColorHexInput] = useState<string>('#FFFFFF');
  const [hasStroke, setHasStroke] = useState<boolean>(true);
  const [strokeThickness, setStrokeThickness] = useState<number>(3);
  const [strokeColor, setStrokeColor] = useState<string>('#000000');
  const [strokeColorHexInput, setStrokeColorHexInput] = useState<string>('#000000');
  const [songNamePosition, setSongNamePosition] = useState<string>('bottom-center');
  const [artistNamePosition, setArtistNamePosition] = useState<string>('top-center');
  const [relativeFontSize, setRelativeFontSize] = useState<string>('medium');
  const [selectedPreset, setSelectedPreset] = useState<string>('classicWhiteOutline');

  const [songNameXOffset, setSongNameXOffset] = useState<number>(0);
  const [songNameYOffset, setSongNameYOffset] = useState<number>(0);
  const [songNameRotation, setSongNameRotation] = useState<number>(0);
  const [artistNameXOffset, setArtistNameXOffset] = useState<number>(0);
  const [artistNameYOffset, setArtistNameYOffset] = useState<number>(0);
  const [artistNameRotation, setArtistNameRotation] = useState<number>(0);

  const [textColorMode, setTextColorMode] = useState<'solid' | 'gradient'>('solid');
  const [gradientColor1, setGradientColor1] = useState<string>('#FF8C00');
  const [gradientColor1HexInput, setGradientColor1HexInput] = useState<string>('#FF8C00');
  const [gradientColor2, setGradientColor2] = useState<string>('#FF0080');
  const [gradientColor2HexInput, setGradientColor2HexInput] = useState<string>('#FF0080');
  const [gradientDirection, setGradientDirection] = useState<string>('top-to-bottom');

  // Text Shadow State
  const [hasTextShadow, setHasTextShadow] = useState<boolean>(false);
  const [textShadowColor, setTextShadowColor] = useState<string>('#000000');
  const [textShadowColorHexInput, setTextShadowColorHexInput] = useState<string>('#000000');
  const [textShadowBlur, setTextShadowBlur] = useState<number>(0);
  const [textShadowOffsetX, setTextShadowOffsetX] = useState<number>(2);
  const [textShadowOffsetY, setTextShadowOffsetY] = useState<number>(2);

  // Text Alignment State
  const [songNameTextAlign, setSongNameTextAlign] = useState<CanvasTextAlign | 'auto'>('auto');
  const [artistNameTextAlign, setArtistNameTextAlign] = useState<CanvasTextAlign | 'auto'>('auto');

  // Letter Spacing State
  const [songNameLetterSpacing, setSongNameLetterSpacing] = useState<number>(0);
  const [artistNameLetterSpacing, setArtistNameLetterSpacing] = useState<number>(0);

  const [brightness, setBrightness] = useState<number>(100);
  const [contrast, setContrast] = useState<number>(100);
  const [saturation, setSaturation] = useState<number>(100);
  const [grayscale, setGrayscale] = useState<number>(0);
  const [sepia, setSepia] = useState<number>(0);
  const [hueRotate, setHueRotate] = useState<number>(0);
  const [blur, setBlur] = useState<number>(0);

  const [overlayImageBase64, setOverlayImageBase64] = useState<string | null>(null);
  const [overlayPosition, setOverlayPosition] = useState<string>('bottom-right');
  const [overlaySizePercent, setOverlaySizePercent] = useState<number>(15);
  const [overlayOpacity, setOverlayOpacity] = useState<number>(0.8);
  const [overlayBlendMode, setOverlayBlendMode] = useState<string>('source-over');

  const [filteredPreviewUrl, setFilteredPreviewUrl] = useState<string | null>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  const [savedArtStylePresets, setSavedArtStylePresets] = useState<ArtStylePreset[]>([]);
  const [showSavePresetModal, setShowSavePresetModal] = useState(false);
  const [showLoadPresetModal, setShowLoadPresetModal] = useState(false);
  const [showImportExportModal, setShowImportExportModal] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');
  const [presetStatusMessage, setPresetStatusMessage] = useState<string>('');
  const [presetErrorMessage, setPresetErrorMessage] = useState<string | null>(null);
  const [configToImportJson, setConfigToImportJson] = useState('');
  const [importPresetError, setImportPresetError] = useState('');
  const importPresetFileRef = useRef<HTMLInputElement>(null);
  const [showPresetSection, setShowPresetSection] = useState(false);
  const [showTextShadowOptions, setShowTextShadowOptions] = useState(false);

  // New State for Advanced Effects
  const [showAdvancedEffects, setShowAdvancedEffects] = useState<boolean>(false);
  const [vignetteIntensity, setVignetteIntensity] = useState<number>(0);
  const [vignetteColor, setVignetteColor] = useState<string>('#000000');
  const [vignetteColorHexInput, setVignetteColorHexInput] = useState<string>('#000000');
  const [noiseAmount, setNoiseAmount] = useState<number>(0);
  const [duotone, setDuotone] = useState<boolean>(false);
  const [duotoneColor1, setDuotoneColor1] = useState<string>('#002B5B'); // Dark Blue
  const [duotoneColor1HexInput, setDuotoneColor1HexInput] = useState<string>('#002B5B');
  const [duotoneColor2, setDuotoneColor2] = useState<string>('#FAD02C'); // Light Yellow
  const [duotoneColor2HexInput, setDuotoneColor2HexInput] = useState<string>('#FAD02C');


  useEffect(() => { setFontColorHexInput(fontColor); }, [fontColor]);
  useEffect(() => { setStrokeColorHexInput(strokeColor); }, [strokeColor]);
  useEffect(() => { setGradientColor1HexInput(gradientColor1); }, [gradientColor1]);
  useEffect(() => { setGradientColor2HexInput(gradientColor2); }, [gradientColor2]);
  useEffect(() => { setTextShadowColorHexInput(textShadowColor); }, [textShadowColor]);
  useEffect(() => { setVignetteColorHexInput(vignetteColor); }, [vignetteColor]);
  useEffect(() => { setDuotoneColor1HexInput(duotoneColor1); }, [duotoneColor1]);
  useEffect(() => { setDuotoneColor2HexInput(duotoneColor2); }, [duotoneColor2]);

  const handleFontColorHexChange = (e: React.ChangeEvent<HTMLInputElement>) => { const newHex = e.target.value; setFontColorHexInput(newHex); if (isValidHexColor(newHex)) setFontColor(normalizeHexColor(newHex)); };
  const handleStrokeColorHexChange = (e: React.ChangeEvent<HTMLInputElement>) => { const newHex = e.target.value; setStrokeColorHexInput(newHex); if (isValidHexColor(newHex)) setStrokeColor(normalizeHexColor(newHex)); };
  const handleGradientColor1HexChange = (e: React.ChangeEvent<HTMLInputElement>) => { const newHex = e.target.value; setGradientColor1HexInput(newHex); if (isValidHexColor(newHex)) setGradientColor1(normalizeHexColor(newHex)); };
  const handleGradientColor2HexChange = (e: React.ChangeEvent<HTMLInputElement>) => { const newHex = e.target.value; setGradientColor2HexInput(newHex); if (isValidHexColor(newHex)) setGradientColor2(normalizeHexColor(newHex)); };
  const handleTextShadowColorHexChange = (e: React.ChangeEvent<HTMLInputElement>) => { const newHex = e.target.value; setTextShadowColorHexInput(newHex); if (isValidHexColor(newHex)) setTextShadowColor(normalizeHexColor(newHex)); };
  const handleVignetteColorHexChange = (e: React.ChangeEvent<HTMLInputElement>) => { const newHex = e.target.value; setVignetteColorHexInput(newHex); if (isValidHexColor(newHex)) setVignetteColor(normalizeHexColor(newHex)); };
  const handleDuotoneColor1HexChange = (e: React.ChangeEvent<HTMLInputElement>) => { const newHex = e.target.value; setDuotoneColor1HexInput(newHex); if (isValidHexColor(newHex)) setDuotoneColor1(normalizeHexColor(newHex)); };
  const handleDuotoneColor2HexChange = (e: React.ChangeEvent<HTMLInputElement>) => { const newHex = e.target.value; setDuotoneColor2HexInput(newHex); if (isValidHexColor(newHex)) setDuotoneColor2(normalizeHexColor(newHex)); };

  const generateRandomHexColor = () => '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0').toUpperCase();

  const handleRandomFontColor = () => {
    const newColor = generateRandomHexColor();
    setFontColor(newColor);
    setFontColorHexInput(newColor);
    trackLocalEvent(TOOL_CATEGORY, 'randomColorSelected', 'font');
  };

  const handleRandomStrokeColor = () => {
    const newColor = generateRandomHexColor();
    setStrokeColor(newColor);
    setStrokeColorHexInput(newColor);
    trackLocalEvent(TOOL_CATEGORY, 'randomColorSelected', 'stroke');
  };

  const handleRandomGradientColor1 = () => {
    const newColor = generateRandomHexColor();
    setGradientColor1(newColor);
    setGradientColor1HexInput(newColor);
    trackLocalEvent(TOOL_CATEGORY, 'randomColorSelected', 'gradient1');
  };

  const handleRandomGradientColor2 = () => {
    const newColor = generateRandomHexColor();
    setGradientColor2(newColor);
    setGradientColor2HexInput(newColor);
    trackLocalEvent(TOOL_CATEGORY, 'randomColorSelected', 'gradient2');
  };

  const handleImageUpload = useCallback((base64Image: string) => {
    setInputImageBase64(base64Image); setError(null); setProcessedImage(null); setAppState(AppState.Idle);
    setBrightness(100); setContrast(100); setSaturation(100); setGrayscale(0); setSepia(0); setHueRotate(0); setBlur(0);
    setVignetteIntensity(0); setNoiseAmount(0); setDuotone(false);
  }, []);
  const handleOverlayImageUpload = useCallback((base64Image: string) => { setOverlayImageBase64(base64Image); setError(null); setProcessedImage(null); setAppState(AppState.Idle); }, []);

  const handleLoadFromUrl = useCallback(async () => {
    let urlToProcess = songUrlInput.trim();
    if (!urlToProcess) {
      setError('Please enter a Suno, Riffusion, or Producer.AI Song URL.');
      return;
    }
    setError(null);
    setAppState(AppState.Processing);
    setProgressMessage('Validating URL...');
    trackLocalEvent(TOOL_CATEGORY, 'urlLoadAttempt', songUrlInput);

    if (urlToProcess.includes('producer.ai')) {
      setProgressMessage('Producer.AI URL detected, transforming to Riffusion...');
      const songId = extractRiffusionSongId(urlToProcess);
      if (songId) {
        urlToProcess = `https://www.producer.ai/song/${songId}`;
        setProgressMessage('URL transformed. Fetching from Riffusion...');
        trackLocalEvent(TOOL_CATEGORY, 'urlTransformed', 'producer.ai_to_riffusion');
      } else {
        setError('Could not extract a valid song ID from the Producer.AI URL.');
        setAppState(AppState.Idle);
        setProgressMessage('');
        trackLocalEvent(TOOL_CATEGORY, 'urlTransformError', 'producer.ai_no_id');
        return;
      }
    }

    if (urlToProcess.includes('riffusion.com') || urlToProcess.includes('producer.ai')) {
      // Riffusion logic
      try {
        const songId = extractRiffusionSongId(urlToProcess);
        if (!songId) {
          throw new Error("Could not extract Riffusion song ID from URL.");
        }
        setProgressMessage(`Fetching Riffusion song details for ID: ${songId.substring(0, 8)}...`);
        const riffusionData = await fetchRiffusionSongData(songId);
        if (!riffusionData) {
          throw new Error(`Failed to fetch song details for Riffusion ID: ${songId.substring(0, 8)}...`);
        }

        setSongName(riffusionData.title || '');
        setArtistTitle(riffusionData.artist || '');
        setFeaturedArtistName(''); // Clear featured artist

        if (riffusionData.image_url) {
          setProgressMessage('Downloading Riffusion cover art...');
          const base64Image = await imageUrlToBase64(riffusionData.image_url);
          handleImageUpload(base64Image);
          setProgressMessage(`Successfully loaded: ${riffusionData.title}`);
        } else {
          handleImageUpload(FALLBACK_IMAGE_DATA_URI);
          setError('Riffusion song data loaded, but no cover art was found.');
          setProgressMessage(`Successfully loaded data for: ${riffusionData.title} (No Image)`);
        }
        trackLocalEvent(TOOL_CATEGORY, 'riffusionUrlLoaded', riffusionData.title);
        setSongUrlInput('');

      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "An unknown error occurred loading from Riffusion URL.";
        setError(errorMsg);
        trackLocalEvent(TOOL_CATEGORY, 'riffusionUrlLoadError', errorMsg);
      } finally {
        setAppState(AppState.Idle);
        setTimeout(() => setProgressMessage(''), 4000);
      }
    } else {
      // Existing Suno logic
      try {
        const songId = await resolveSunoUrlToPotentialSongId(urlToProcess, setProgressMessage);
        if (!songId) {
          throw new Error("Could not resolve Suno URL to a song ID.");
        }

        setProgressMessage(`Fetching song details for ID: ${songId.substring(0, 8)}...`);
        const clip = await fetchSunoClipById(songId);
        if (!clip) {
          throw new Error(`Failed to fetch song details for ID: ${songId.substring(0, 8)}...`);
        }

        setSongName(clip.title || '');
        setArtistTitle(clip.display_name || clip.handle || '');
        setFeaturedArtistName('');

        if (clip.image_url) {
          setProgressMessage(`Downloading cover art...`);
          try {
            const base64Image = await imageUrlToBase64(clip.image_url);
            handleImageUpload(base64Image);
            setProgressMessage(`Successfully loaded: ${clip.title}`);
          } catch (imageError) {
            console.error("Error fetching or converting image:", imageError);
            setError(`Fetched song data, but failed to download cover art. Error: ${imageError instanceof Error ? imageError.message : String(imageError)}`);
            handleImageUpload(FALLBACK_IMAGE_DATA_URI);
            setProgressMessage(`Successfully loaded data for: ${clip.title} (Image Error)`);
          }
        } else {
          handleImageUpload(FALLBACK_IMAGE_DATA_URI);
          setError('Song data loaded, but no cover art was found on Suno.');
          setProgressMessage(`Successfully loaded data for: ${clip.title} (No Image)`);
        }

        trackLocalEvent(TOOL_CATEGORY, 'sunoUrlLoaded', clip.title);
        setSongUrlInput('');

      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "An unknown error occurred loading from Suno URL.";
        setError(errorMsg);
        trackLocalEvent(TOOL_CATEGORY, 'sunoUrlLoadError', errorMsg);
      } finally {
        setAppState(AppState.Idle);
        setTimeout(() => setProgressMessage(''), 4000);
      }
    }
  }, [songUrlInput, trackLocalEvent, handleImageUpload]);

  useEffect(() => {
    if (!inputImageBase64 || !previewCanvasRef.current) { setFilteredPreviewUrl(inputImageBase64); return; }
    const canvas = previewCanvasRef.current; const ctx = canvas.getContext('2d', { willReadFrequently: true }); if (!ctx) return;
    const mainImg = new Image();
    mainImg.onload = () => {
      canvas.width = mainImg.width; canvas.height = mainImg.height;
      ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) grayscale(${grayscale}%) sepia(${sepia}%) hue-rotate(${hueRotate}deg) blur(${blur}px)`;
      ctx.drawImage(mainImg, 0, 0); ctx.filter = 'none';

      if (duotone || noiseAmount > 0) {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        const duotoneColor1RGB = duotone ? hexToRgb(duotoneColor1) : null;
        const duotoneColor2RGB = duotone ? hexToRgb(duotoneColor2) : null;
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i], g = data[i + 1], b = data[i + 2];
          if (duotone && duotoneColor1RGB && duotoneColor2RGB) {
            const gray = 0.299 * r + 0.587 * g + 0.114 * b;
            const ratio = gray / 255;
            data[i] = duotoneColor1RGB.r + (duotoneColor2RGB.r - duotoneColor1RGB.r) * ratio;
            data[i + 1] = duotoneColor1RGB.g + (duotoneColor2RGB.g - duotoneColor1RGB.g) * ratio;
            data[i + 2] = duotoneColor1RGB.b + (duotoneColor2RGB.b - duotoneColor1RGB.b) * ratio;
          }
          if (noiseAmount > 0) {
            const noise = (Math.random() - 0.5) * (noiseAmount / 100) * 255;
            data[i] = Math.max(0, Math.min(255, data[i] + noise));
            data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise));
            data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise));
          }
        }
        ctx.putImageData(imageData, 0, 0);
      }
      if (vignetteIntensity > 0) {
        ctx.save();
        const outerRadius = Math.sqrt(Math.pow(canvas.width / 2, 2) + Math.pow(canvas.height / 2, 2));
        const gradient = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, outerRadius);
        const intensity = vignetteIntensity / 100;
        const vignetteRgb = hexToRgb(vignetteColor) || { r: 0, g: 0, b: 0 };
        gradient.addColorStop(0.3, `rgba(${vignetteRgb.r},${vignetteRgb.g},${vignetteRgb.b},0)`);
        gradient.addColorStop(1, `rgba(${vignetteRgb.r},${vignetteRgb.g},${vignetteRgb.b},${intensity})`);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.restore();
      }

      if (overlayImageBase64) {
        const overlayImg = new Image();
        overlayImg.onload = () => {
          const mainImageSmallerDim = Math.min(mainImg.width, mainImg.height); let overlayTargetSize = mainImageSmallerDim * (overlaySizePercent / 100);
          let overlayW = overlayTargetSize; let overlayH = overlayTargetSize; const aspectRatio = overlayImg.width / overlayImg.height;
          if (overlayImg.width > overlayImg.height) overlayH = overlayW / aspectRatio; else overlayW = overlayH * aspectRatio;
          let overlayX = 0, overlayY = 0; const margin = mainImg.width * 0.02;
          switch (overlayPosition) {
            case 'top-left': overlayX = margin; overlayY = margin; break; case 'top-right': overlayX = mainImg.width - overlayW - margin; overlayY = margin; break;
            case 'bottom-left': overlayX = margin; overlayY = mainImg.height - overlayH - margin; break; case 'bottom-right': overlayX = mainImg.width - overlayW - margin; overlayY = mainImg.height - overlayH - margin; break;
            case 'center': overlayX = (mainImg.width - overlayW) / 2; overlayY = (mainImg.height - overlayH) / 2; break; default: overlayX = mainImg.width - overlayW - margin; overlayY = mainImg.height - overlayH - margin;
          }
          ctx.globalAlpha = overlayOpacity; ctx.globalCompositeOperation = overlayBlendMode as GlobalCompositeOperation;
          ctx.drawImage(overlayImg, overlayX, overlayY, overlayW, overlayH); ctx.globalAlpha = 1.0; ctx.globalCompositeOperation = 'source-over';
          setFilteredPreviewUrl(canvas.toDataURL('image/png'));
        };
        overlayImg.onerror = () => { console.warn("Failed to load overlay image for preview."); setFilteredPreviewUrl(canvas.toDataURL('image/png')); }
        overlayImg.src = overlayImageBase64;
      } else { setFilteredPreviewUrl(canvas.toDataURL('image/png')); }
    };
    mainImg.onerror = () => { setError("Failed to load image for filter preview."); setFilteredPreviewUrl(inputImageBase64); }
    mainImg.src = inputImageBase64;
  }, [inputImageBase64, brightness, contrast, saturation, grayscale, sepia, hueRotate, blur, overlayImageBase64, overlayPosition, overlaySizePercent, overlayOpacity, overlayBlendMode, vignetteIntensity, vignetteColor, noiseAmount, duotone, duotoneColor1, duotoneColor2]);

  const currentTextOptions = (): ExtendedTextOptions => ({
    fontFamily, fontColor, hasStroke, strokeThickness, strokeColor, songNamePosition, artistNamePosition, relativeFontSize,
    featuredArtistName: featuredArtistName.trim() ? featuredArtistName.trim() : undefined,
    textColorMode, gradientColor1, gradientColor2, gradientDirection,
    songNameXOffset, songNameYOffset, songNameRotation, artistNameXOffset, artistNameYOffset, artistNameRotation,
    hasTextShadow, textShadowColor, textShadowBlur, textShadowOffsetX, textShadowOffsetY,
    songNameTextAlign, artistNameTextAlign,
    songNameLetterSpacing, artistNameLetterSpacing,
  });
  const currentImageFilterOptions = (): ImageFilterOptions => ({ brightness, contrast, saturation, grayscale, sepia, hueRotate, blur, vignetteIntensity, vignetteColor, noiseAmount, duotone, duotoneColor1, duotoneColor2 });
  const currentOverlayOptions = (): OverlayImageOptions | undefined => {
    if (!overlayImageBase64) return undefined;
    return { base64: overlayImageBase64, position: overlayPosition, sizePercent: overlaySizePercent, opacity: overlayOpacity, blendMode: overlayBlendMode };
  };

  const applyTextPreset = useCallback((presetValue: string) => {
    setSelectedPreset(presetValue); const preset = textEffectPresets.find(p => p.value === presetValue);
    if (preset && preset.settings) {
      if (preset.settings.fontFamily) setFontFamily(preset.settings.fontFamily); if (preset.settings.fontColor) setFontColor(preset.settings.fontColor);
      if (typeof preset.settings.hasStroke === 'boolean') setHasStroke(preset.settings.hasStroke); if (typeof preset.settings.strokeThickness === 'number') setStrokeThickness(preset.settings.strokeThickness);
      if (preset.settings.strokeColor) setStrokeColor(preset.settings.strokeColor); if (preset.settings.relativeFontSize) setRelativeFontSize(preset.settings.relativeFontSize);
      setTextColorMode(preset.settings.textColorMode || 'solid'); setGradientColor1(preset.settings.gradientColor1 || '#FF8C00');
      setGradientColor2(preset.settings.gradientColor2 || '#FF0080'); setGradientDirection(preset.settings.gradientDirection || 'top-to-bottom');
      setSongNameXOffset(preset.settings.songNameXOffset || 0); setSongNameYOffset(preset.settings.songNameYOffset || 0); setSongNameRotation(preset.settings.songNameRotation || 0);
      setArtistNameXOffset(preset.settings.artistNameXOffset || 0); setArtistNameYOffset(preset.settings.artistNameYOffset || 0); setArtistNameRotation(preset.settings.artistNameRotation || 0);
      setHasTextShadow(preset.settings.hasTextShadow || false);
      setTextShadowColor(preset.settings.textShadowColor || '#000000');
      setTextShadowBlur(preset.settings.textShadowBlur || 0);
      setTextShadowOffsetX(preset.settings.textShadowOffsetX || 2);
      setTextShadowOffsetY(preset.settings.textShadowOffsetY || 2);
      setShowTextShadowOptions(preset.settings.hasTextShadow || false);
      setSongNameTextAlign(preset.settings.songNameTextAlign || 'auto');
      setArtistNameTextAlign(preset.settings.artistNameTextAlign || 'auto');
      setSongNameLetterSpacing(preset.settings.songNameLetterSpacing || 0);
      setArtistNameLetterSpacing(preset.settings.artistNameLetterSpacing || 0);
      trackLocalEvent(TOOL_CATEGORY, 'textPresetApplied', presetValue, 1);
    }
  }, [trackLocalEvent]);
  useEffect(() => { applyTextPreset('classicWhiteOutline'); }, [applyTextPreset]);

  const handleAddTextAndOverlayToImage = async () => {
    if (!songName.trim() || !artistTitle.trim() || !inputImageBase64) { setError('Please provide a song name, artist title, and upload a main image.'); return; }
    setError(null); setProcessedImage(null); setAppState(AppState.Processing); setProgressMessage('Applying text and overlay to your image...');
    try {
      const txtOpts = currentTextOptions(); const imgFilters = currentImageFilterOptions(); const ovlOpts = currentOverlayOptions();
      const imageWithTextAndOverlay = await addTextToImage(inputImageBase64, songName.trim(), artistTitle.trim(), txtOpts, imgFilters, ovlOpts);
      setProcessedImage({ base64: imageWithTextAndOverlay.split(',')[1], promptUsed: "Text and overlay added to uploaded image with filters." });
      setAppState(AppState.Success); setProgressMessage('Your image with text & overlay is ready!');
      trackLocalEvent(TOOL_CATEGORY, 'imageProcessed', 'withFiltersAndOverlay', 1); trackLocalEvent(TOOL_CATEGORY, 'fontUsed', undefined, txtOpts.fontFamily);
      if (txtOpts.featuredArtistName) trackLocalEvent(TOOL_CATEGORY, 'featuredArtistUsed', undefined, 1); if (ovlOpts) trackLocalEvent(TOOL_CATEGORY, 'overlayUsed', ovlOpts.blendMode, 1);
      if (txtOpts.textColorMode === 'gradient') trackLocalEvent(TOOL_CATEGORY, 'gradientTextUsed', txtOpts.gradientDirection, 1);
      if (txtOpts.songNameRotation !== 0 || txtOpts.artistNameRotation !== 0) trackLocalEvent(TOOL_CATEGORY, 'textRotationUsed', undefined, 1);
      if (txtOpts.songNameXOffset !== 0 || txtOpts.songNameYOffset !== 0 || txtOpts.artistNameXOffset !== 0 || txtOpts.artistNameYOffset !== 0) trackLocalEvent(TOOL_CATEGORY, 'textOffsetUsed', undefined, 1);
      if (txtOpts.hasTextShadow) trackLocalEvent(TOOL_CATEGORY, 'textShadowUsed', undefined, 1);
      if (txtOpts.songNameTextAlign && txtOpts.songNameTextAlign !== 'auto') trackLocalEvent(TOOL_CATEGORY, 'textAlignUsed', `song:${txtOpts.songNameTextAlign}`);
      if (txtOpts.artistNameTextAlign && txtOpts.artistNameTextAlign !== 'auto') trackLocalEvent(TOOL_CATEGORY, 'textAlignUsed', `artist:${txtOpts.artistNameTextAlign}`);
      if (txtOpts.songNameLetterSpacing !== 0 || txtOpts.artistNameLetterSpacing !== 0) trackLocalEvent(TOOL_CATEGORY, 'letterSpacingUsed', undefined, 1);
    } catch (err) {
      console.error(err); const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.'; setError(`Failed to process image: ${errorMessage}`); setAppState(AppState.Error);
    } finally { setProgressMessage(''); }
  };

  useEffect(() => { try { const storedPresets = localStorage.getItem(SAVED_PRESETS_LOCAL_STORAGE_KEY); if (storedPresets) { setSavedArtStylePresets(JSON.parse(storedPresets)); } } catch (e) { console.error("Error loading presets:", e); } }, []);
  useEffect(() => { try { localStorage.setItem(SAVED_PRESETS_LOCAL_STORAGE_KEY, JSON.stringify(savedArtStylePresets)); } catch (e) { console.error("Error saving presets:", e); } }, [savedArtStylePresets]);

  const collectCurrentSettings = (): ArtStyleSettings => ({
    fontFamily, fontColor, hasStroke, strokeThickness, strokeColor, songNamePosition, artistNamePosition, relativeFontSize,
    featuredArtistName: featuredArtistName.trim() || undefined, textColorMode, gradientColor1, gradientColor2, gradientDirection,
    songNameXOffset, songNameYOffset, songNameRotation, artistNameXOffset, artistNameYOffset, artistNameRotation,
    hasTextShadow, textShadowColor, textShadowBlur, textShadowOffsetX, textShadowOffsetY,
    songNameTextAlign, artistNameTextAlign,
    songNameLetterSpacing, artistNameLetterSpacing,
    brightness, contrast, saturation, grayscale, sepia, hueRotate, blur,
    overlayActive: !!overlayImageBase64, overlayPosition, overlaySizePercent, overlayOpacity, overlayBlendMode,
    vignetteIntensity, vignetteColor, noiseAmount, duotone, duotoneColor1, duotoneColor2
  });
  const applyPresetSettings = (settings: ArtStyleSettings) => {
    setFontFamily(settings.fontFamily); setFontColor(settings.fontColor); setHasStroke(settings.hasStroke);
    setStrokeThickness(settings.strokeThickness); setStrokeColor(settings.strokeColor); setSongNamePosition(settings.songNamePosition);
    setArtistNamePosition(settings.artistNamePosition); setRelativeFontSize(settings.relativeFontSize);
    setFeaturedArtistName(settings.featuredArtistName || ''); setTextColorMode(settings.textColorMode);
    setGradientColor1(settings.gradientColor1 || '#FF8C00'); setGradientColor2(settings.gradientColor2 || '#FF0080');
    setGradientDirection(settings.gradientDirection || 'top-to-bottom');
    setSongNameXOffset(settings.songNameXOffset); setSongNameYOffset(settings.songNameYOffset); setSongNameRotation(settings.songNameRotation);
    setArtistNameXOffset(settings.artistNameXOffset); setArtistNameYOffset(settings.artistNameYOffset); setArtistNameRotation(settings.artistNameRotation);

    setHasTextShadow(settings.hasTextShadow || false); setTextShadowColor(settings.textShadowColor || '#000000');
    setTextShadowBlur(settings.textShadowBlur || 0); setTextShadowOffsetX(settings.textShadowOffsetX || 2);
    setTextShadowOffsetY(settings.textShadowOffsetY || 2);
    setShowTextShadowOptions(settings.hasTextShadow || false);

    setSongNameTextAlign(settings.songNameTextAlign || 'auto');
    setArtistNameTextAlign(settings.artistNameTextAlign || 'auto');
    setSongNameLetterSpacing(settings.songNameLetterSpacing || 0);
    setArtistNameLetterSpacing(settings.artistNameLetterSpacing || 0);

    setBrightness(settings.brightness); setContrast(settings.contrast); setSaturation(settings.saturation);
    setGrayscale(settings.grayscale); setSepia(settings.sepia); setHueRotate(settings.hueRotate); setBlur(settings.blur);
    if (settings.overlayActive) { setOverlayPosition(settings.overlayPosition || 'bottom-right'); setOverlaySizePercent(settings.overlaySizePercent || 15); setOverlayOpacity(settings.overlayOpacity || 0.8); setOverlayBlendMode(settings.overlayBlendMode || 'source-over'); }
    else { setOverlayImageBase64(null); }

    // Apply new advanced settings from preset
    setVignetteIntensity(settings.vignetteIntensity || 0);
    setVignetteColor(settings.vignetteColor || '#000000');
    setNoiseAmount(settings.noiseAmount || 0);
    setDuotone(settings.duotone || false);
    setDuotoneColor1(settings.duotoneColor1 || '#002B5B');
    setDuotoneColor2(settings.duotoneColor2 || '#FAD02C');
    setShowAdvancedEffects((settings.vignetteIntensity || 0) > 0 || (settings.noiseAmount || 0) > 0 || (settings.duotone || false));
  };

  const handleSavePreset = () => {
    setPresetErrorMessage(null);
    if (!newPresetName.trim()) { setPresetErrorMessage("Preset name cannot be empty."); return; }
    if (savedArtStylePresets.some(p => p.name.toLowerCase() === newPresetName.trim().toLowerCase())) { setPresetErrorMessage("A preset with this name already exists."); return; }
    const newPreset: ArtStylePreset = { id: Date.now().toString(), name: newPresetName.trim(), settings: collectCurrentSettings(), createdAt: new Date().toISOString() };
    setSavedArtStylePresets(prev => [newPreset, ...prev]); setPresetStatusMessage(`Preset "${newPreset.name}" saved!`); setTimeout(() => setPresetStatusMessage(''), 3000); setShowSavePresetModal(false); setNewPresetName(''); trackLocalEvent(TOOL_CATEGORY, 'presetSaved', newPreset.name);
  };
  const handleLoadPreset = (presetId: string) => { const presetToLoad = savedArtStylePresets.find(p => p.id === presetId); if (presetToLoad) { applyPresetSettings(presetToLoad.settings); setPresetStatusMessage(`Preset "${presetToLoad.name}" loaded! Main and overlay images (if used) need to be (re)uploaded.`); trackLocalEvent(TOOL_CATEGORY, 'presetLoaded', presetToLoad.name); setShowLoadPresetModal(false); setTimeout(() => setPresetStatusMessage(''), 5000); } };
  const handleDeletePreset = (presetId: string) => { if (window.confirm("Are you sure you want to delete this style preset?")) { const presetToDelete = savedArtStylePresets.find(p => p.id === presetId); setSavedArtStylePresets(prev => prev.filter(p => p.id !== presetId)); setPresetStatusMessage(`Preset "${presetToDelete?.name || 'Selected'}" deleted.`); trackLocalEvent(TOOL_CATEGORY, 'presetDeleted', presetToDelete?.name); setTimeout(() => setPresetStatusMessage(''), 3000); } };
  const handleExportPresets = () => { if (savedArtStylePresets.length === 0) { setPresetStatusMessage("No presets to export."); setTimeout(() => setPresetStatusMessage(''), 3000); return; } const jsonString = JSON.stringify(savedArtStylePresets, null, 2); const blob = new Blob([jsonString], { type: "application/json" }); const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = `song_cover_art_presets.json`; document.body.appendChild(link); link.click(); document.body.removeChild(link); URL.revokeObjectURL(url); setPresetStatusMessage("All presets exported successfully!"); trackLocalEvent(TOOL_CATEGORY, 'presetsExported', undefined, savedArtStylePresets.length); setTimeout(() => setPresetStatusMessage(''), 3000); };
  const handleImportFileChange = (event: React.ChangeEvent<HTMLInputElement>) => { const file = event.target.files?.[0]; if (file) { const reader = new FileReader(); reader.onload = (e) => { try { const text = e.target?.result as string; setConfigToImportJson(text); setImportPresetError(''); } catch (err) { setImportPresetError('Failed to read file.'); } }; reader.readAsText(file); } };
  const processPresetImport = (mode: 'merge' | 'replace') => { if (!configToImportJson.trim()) { setImportPresetError('No configuration data to import.'); return; } try { const importedPresetsArray = JSON.parse(configToImportJson) as ArtStylePreset[]; if (!Array.isArray(importedPresetsArray) || !importedPresetsArray.every(p => p.id && p.name && p.settings && p.createdAt)) { throw new Error("Invalid preset file structure."); } if (mode === 'replace') { setSavedArtStylePresets(importedPresetsArray); setPresetStatusMessage(`${importedPresetsArray.length} presets imported (replaced existing).`); } else { let newItemsAdded = 0; const updatedPresets = [...savedArtStylePresets]; importedPresetsArray.forEach(importedPreset => { if (!updatedPresets.some(existing => existing.id === importedPreset.id || existing.name.toLowerCase() === importedPreset.name.toLowerCase())) { updatedPresets.push(importedPreset); newItemsAdded++; } }); setSavedArtStylePresets(updatedPresets); setPresetStatusMessage(`${newItemsAdded} new presets merged. ${importedPresetsArray.length - newItemsAdded} duplicates skipped.`); } trackLocalEvent(TOOL_CATEGORY, 'presetsImported', mode); setShowImportExportModal(false); setConfigToImportJson(''); setImportPresetError(''); setTimeout(() => setPresetStatusMessage(''), 5000); } catch (err) { setImportPresetError(err instanceof Error ? err.message : 'Invalid JSON format or structure.'); } };

  const isLoading = appState === AppState.Processing;
  const canSubmit = songName.trim() && artistTitle.trim() && inputImageBase64;

  return (
    <div className="w-full">
      <header className="mb-10 text-center">
        <h1 className="text-5xl font-extrabold text-green-600 dark:text-green-400"> Song Cover Art Creator </h1>
        <p className="mt-3 text-md text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
          Upload your image, adjust filters, add an overlay, enter song & artist details, and add customized text with precise positioning, rotation, shadows, and letter spacing.
        </p>
      </header>

      <canvas ref={previewCanvasRef} style={{ display: 'none' }}></canvas>

      <main className="w-full bg-white dark:bg-gray-900 shadow-2xl rounded-lg p-6 md:p-10 border-2 border-green-600 dark:border-green-500">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8">
          <div className="md:col-span-1">
            <div className="mb-4">
              <label htmlFor="songUrlInput" className="block text-sm font-medium text-green-600 dark:text-green-400 mb-1">
                Load from Suno/Riffusion/Producer.AI URL (Optional)
              </label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <input
                  type="text"
                  id="songUrlInput"
                  value={songUrlInput}
                  onChange={(e) => setSongUrlInput(e.target.value)}
                  placeholder="suno.com/... or riffusion.com/... or producer.ai/..."
                  className="block w-full flex-1 rounded-none rounded-l-md border-gray-300 bg-white dark:bg-gray-700 dark:border-gray-600 px-3 py-2 text-gray-900 dark:text-white placeholder-gray-400 focus:border-green-500 focus:ring-green-500 sm:text-sm"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={handleLoadFromUrl}
                  disabled={isLoading || !songUrlInput.trim()}
                  className="relative -ml-px inline-flex items-center space-x-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 disabled:opacity-50"
                >
                  <span>Load</span>
                </button>
              </div>
            </div>
            <div className="flex items-center my-4">
              <div className="flex-grow border-t border-gray-300 dark:border-gray-700"></div>
              <span className="flex-shrink mx-4 text-gray-500">OR</span>
              <div className="flex-grow border-t border-gray-300 dark:border-gray-700"></div>
            </div>
            <InputField id="songName" label="Song Name" value={songName} onChange={setSongName} placeholder="e.g., Neon Dreams" required disabled={isLoading} />
            <InputField id="artistTitle" label="Artist Name / Title" value={artistTitle} onChange={setArtistTitle} placeholder="e.g., The Glitch Mob" required disabled={isLoading} />
            <InputField id="featuredArtistName" label="Featured Artist (Optional)" value={featuredArtistName} onChange={setFeaturedArtistName} placeholder="e.g., Another Great Artist" disabled={isLoading} />
            <ImageUpload onImageUpload={handleImageUpload} label="Upload Main Image (Max 5MB)" />

            {inputImageBase64 && (
              <fieldset className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <legend className="text-md font-semibold text-green-600 dark:text-green-400 mb-3 px-1">Image Adjustments</legend>
                <SliderField id="brightness" label="Brightness" value={brightness} onChange={(v) => { setBrightness(v); trackLocalEvent(TOOL_CATEGORY, 'filterChange', 'brightness', v); }} />
                <SliderField id="contrast" label="Contrast" value={contrast} onChange={(v) => { setContrast(v); trackLocalEvent(TOOL_CATEGORY, 'filterChange', 'contrast', v); }} />
                <SliderField id="saturation" label="Saturation" value={saturation} onChange={(v) => { setSaturation(v); trackLocalEvent(TOOL_CATEGORY, 'filterChange', 'saturation', v); }} />
                <SliderField id="grayscale" label="Grayscale" value={grayscale} onChange={(v) => { setGrayscale(v); trackLocalEvent(TOOL_CATEGORY, 'filterChange', 'grayscale', v); }} max={100} />
                <SliderField id="sepia" label="Sepia" value={sepia} onChange={(v) => { setSepia(v); trackLocalEvent(TOOL_CATEGORY, 'filterChange', 'sepia', v); }} max={100} />
                <SliderField id="hueRotate" label="Hue Rotate" value={hueRotate} onChange={(v) => { setHueRotate(v); trackLocalEvent(TOOL_CATEGORY, 'filterChange', 'hueRotate', v); }} max={360} unit="deg" />
                <SliderField id="blur" label="Blur" value={blur} onChange={(v) => { setBlur(v); trackLocalEvent(TOOL_CATEGORY, 'filterChange', 'blur', v); }} max={10} step={0.1} unit="px" />
              </fieldset>
            )}

            {inputImageBase64 && (
              <details className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 group" open={showAdvancedEffects}>
                <summary className="cursor-pointer py-2 text-md font-semibold text-green-600 dark:text-green-400 hover:text-green-500 dark:hover:text-green-300 flex justify-between items-center" onClick={(e) => { e.preventDefault(); setShowAdvancedEffects(!showAdvancedEffects); }}>
                  Advanced Effects
                  <span className={`transform transition-transform duration-200 ${showAdvancedEffects ? 'rotate-180' : ''}`}>▼</span>
                </summary>
                <div className="mt-2 pl-2 border-l-2 border-gray-300 dark:border-gray-700 space-y-3">
                  <SliderField id="vignetteIntensity" label="Vignette Intensity" value={vignetteIntensity} onChange={setVignetteIntensity} min={0} max={100} unit="%" />
                  {vignetteIntensity > 0 && (
                    <div className="mb-3">
                      <label htmlFor="vignetteColor" className="block text-xs font-medium text-green-600 dark:text-green-400 mb-0.5">Vignette Color</label>
                      <div className="flex items-center gap-1">
                        <input type="color" id="vignetteColor" value={vignetteColor} onChange={(e) => setVignetteColor(e.target.value)} className="p-0.5 h-8 w-9 rounded-md border-gray-300 dark:border-gray-600 cursor-pointer bg-white dark:bg-gray-700" title="Pick vignette color" />
                        <input type="text" value={vignetteColorHexInput} onChange={handleVignetteColorHexChange} placeholder="#000000" className="block w-full px-2 py-1.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-green-400 focus:border-green-400 text-xs text-gray-900 dark:text-white" />
                      </div>
                    </div>
                  )}
                  <SliderField id="noiseAmount" label="Noise / Grain" value={noiseAmount} onChange={setNoiseAmount} min={0} max={100} unit="%" />
                  <CheckboxField id="duotone" label="Enable Duotone Effect" checked={duotone} onChange={setDuotone} className="mb-3" />
                  {duotone && (
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-medium text-green-600 dark:text-green-400 mb-0.5">Color 1 (Dark)</label>
                        <div className="flex items-center gap-1">
                          <input type="color" value={duotoneColor1} onChange={(e) => setDuotoneColor1(e.target.value)} className="p-0.5 h-8 w-9 rounded-md border-gray-300 dark:border-gray-600 cursor-pointer bg-white dark:bg-gray-700" />
                          <input type="text" value={duotoneColor1HexInput} onChange={handleDuotoneColor1HexChange} placeholder="#002B5B" className="block w-full px-2 py-1.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-green-400 focus:border-green-400 text-xs text-gray-900 dark:text-white" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-green-600 dark:text-green-400 mb-0.5">Color 2 (Light)</label>
                        <div className="flex items-center gap-1">
                          <input type="color" value={duotoneColor2} onChange={(e) => setDuotoneColor2(e.target.value)} className="p-0.5 h-8 w-9 rounded-md border-gray-300 dark:border-gray-600 cursor-pointer bg-white dark:bg-gray-700" />
                          <input type="text" value={duotoneColor2HexInput} onChange={handleDuotoneColor2HexChange} placeholder="#FAD02C" className="block w-full px-2 py-1.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-green-400 focus:border-green-400 text-xs text-gray-900 dark:text-white" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </details>
            )}

            {inputImageBase64 && (
              <fieldset className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <legend className="text-md font-semibold text-green-600 dark:text-green-400 mb-3 px-1">Overlay Image (Optional)</legend>
                <ImageUpload onImageUpload={handleOverlayImageUpload} label="Upload Overlay Image (Logo/Watermark)" />
                {overlayImageBase64 && (
                  <div className="mt-3 space-y-3">
                    <SelectField id="overlayPosition" label="Overlay Position" value={overlayPosition} onChange={setOverlayPosition} options={overlayPositionOptions} />
                    <SliderField id="overlaySize" label="Overlay Size" value={overlaySizePercent} onChange={setOverlaySizePercent} min={5} max={100} step={1} unit="% of smaller image dim" />
                    <SliderField id="overlayOpacity" label="Overlay Opacity" value={overlayOpacity * 100} onChange={(v) => setOverlayOpacity(v / 100)} min={0} max={100} step={1} unit="%" />
                    <SelectField id="overlayBlendMode" label="Overlay Blend Mode" value={overlayBlendMode} onChange={setOverlayBlendMode} options={overlayBlendModeOptions} />
                  </div>
                )}
              </fieldset>
            )}
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button onClick={() => setShowPresetSection(!showPresetSection)} className="w-full flex items-center justify-between py-2 px-3 text-lg font-semibold rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-800 bg-gray-100 dark:bg-gray-800 text-green-700 dark:text-green-400" aria-expanded={showPresetSection} aria-controls="song-cover-art-preset-panel">
                <div className="flex items-center"><PaletteIcon className="w-4 h-4 mr-2" /> Art Style Presets</div>
                <ConfigIcon className="w-4 h-4 transform transition-transform" style={{ transform: showPresetSection ? 'rotate(0deg)' : 'rotate(180deg)' }} />
              </button>
              {showPresetSection && (<div id="song-cover-art-preset-panel" className="mt-3 p-3 bg-white dark:bg-gray-850 rounded-md border border-gray-300 dark:border-gray-700 space-y-2"> <button onClick={() => { setNewPresetName(''); setPresetErrorMessage(null); setShowSavePresetModal(true); }} className="w-full flex items-center justify-center text-sm py-1.5 px-3 bg-green-600 hover:bg-green-500 text-white dark:text-black rounded gap-1.5"><SaveIcon />Save Current Style...</button> <button onClick={() => { setPresetErrorMessage(null); setShowLoadPresetModal(true); }} disabled={savedArtStylePresets.length === 0} className="w-full flex items-center justify-center text-sm py-1.5 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded disabled:opacity-50 gap-1.5"><LoadIcon />Load Existing Style... ({savedArtStylePresets.length})</button> <button onClick={() => { setConfigToImportJson(''); setImportPresetError(''); setShowImportExportModal(true); }} className="w-full flex items-center justify-center text-sm py-1.5 px-3 bg-purple-600 hover:bg-purple-500 text-white rounded gap-1.5"><ImportIcon className="w-2.5 h-2.5 mr-0.5" />Import/Export Presets...</button> {presetStatusMessage && <p className="text-xs text-center text-green-600 dark:text-green-300 mt-1">{presetStatusMessage}</p>} </div>)}
            </div>
          </div>

          <div className="md:col-span-1">
            <fieldset className="mt-0 md:mt-0">
              <legend className="text-md font-semibold text-green-600 dark:text-green-400 mb-3 px-1">Text Options</legend>
              <SelectField id="fontFamily" label="Font Family" value={fontFamily} onChange={setFontFamily} options={availableFonts} />
              <SelectField id="selectedPreset" label="Text Effect Preset" value={selectedPreset} onChange={(val) => applyTextPreset(val)} options={textEffectPresets} />
              <SelectField id="textColorMode" label="Text Color Mode" value={textColorMode} onChange={(val) => setTextColorMode(val as 'solid' | 'gradient')} options={textColorModeOptions} />
              {textColorMode === 'solid' && (<div className="mb-4"> <label htmlFor="fontColor" className="block text-sm font-medium text-green-600 dark:text-green-400 mb-1">Font Color (Solid)</label> <div className="flex items-center gap-2"> <input type="color" id="fontColor" value={fontColor} onChange={(e) => setFontColor(e.target.value)} className="p-0.5 h-9 w-10 rounded-md border-gray-300 dark:border-gray-600 cursor-pointer bg-white dark:bg-gray-700" title="Pick font color" /> <input type="text" value={fontColorHexInput} onChange={handleFontColorHexChange} placeholder="#FFFFFF" className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-800 border-2 border-green-500 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 sm:text-sm text-gray-900 dark:text-white" /> <button type="button" onClick={handleRandomFontColor} className="p-2 rounded-md text-green-600 dark:text-green-400 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500" title="Set Random Font Color"><SparklesIcon /></button> </div> </div>)}
              {textColorMode === 'gradient' && (<> <div className="mb-4"> <label htmlFor="gradientColor1" className="block text-sm font-medium text-green-600 dark:text-green-400 mb-1">Gradient Color 1</label> <div className="flex items-center gap-2"> <input type="color" id="gradientColor1" value={gradientColor1} onChange={(e) => setGradientColor1(e.target.value)} className="p-0.5 h-9 w-10 rounded-md border-gray-300 dark:border-gray-600 cursor-pointer bg-white dark:bg-gray-700" title="Pick gradient color 1" /> <input type="text" value={gradientColor1HexInput} onChange={handleGradientColor1HexChange} placeholder="#FF8C00" className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-800 border-2 border-green-500 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 sm:text-sm text-gray-900 dark:text-white" /> <button type="button" onClick={handleRandomGradientColor1} className="p-2 rounded-md text-green-600 dark:text-green-400 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500" title="Set Random Gradient Color 1"><SparklesIcon /></button> </div> </div> <div className="mb-4"> <label htmlFor="gradientColor2" className="block text-sm font-medium text-green-600 dark:text-green-400 mb-1">Gradient Color 2</label> <div className="flex items-center gap-2"> <input type="color" id="gradientColor2" value={gradientColor2} onChange={(e) => setGradientColor2(e.target.value)} className="p-0.5 h-9 w-10 rounded-md border-gray-300 dark:border-gray-600 cursor-pointer bg-white dark:bg-gray-700" title="Pick gradient color 2" /> <input type="text" value={gradientColor2HexInput} onChange={handleGradientColor2HexChange} placeholder="#FF0080" className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-800 border-2 border-green-500 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 sm:text-sm text-gray-900 dark:text-white" /> <button type="button" onClick={handleRandomGradientColor2} className="p-2 rounded-md text-green-600 dark:text-green-400 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500" title="Set Random Gradient Color 2"><SparklesIcon /></button> </div> </div> <SelectField id="gradientDirection" label="Gradient Direction" value={gradientDirection} onChange={setGradientDirection} options={gradientDirectionOptions} /> </>)}
              <CheckboxField id="hasStroke" label="Enable Text Stroke (Outline)" checked={hasStroke} onChange={setHasStroke} />
              {hasStroke && (<> <InputField id="strokeThickness" label="Stroke Thickness (px)" value={strokeThickness} onChange={(v) => setStrokeThickness(Math.max(0.1, parseFloat(v)) || 1)} type="number" placeholder="e.g., 3" step="0.1" /> <div className="mb-4"> <label htmlFor="strokeColor" className="block text-sm font-medium text-green-600 dark:text-green-400 mb-1">Stroke Color</label> <div className="flex items-center gap-2"> <input type="color" id="strokeColor" value={strokeColor} onChange={(e) => setStrokeColor(e.target.value)} className="p-0.5 h-9 w-10 rounded-md border-gray-300 dark:border-gray-600 cursor-pointer bg-white dark:bg-gray-700" title="Pick stroke color" /> <input type="text" value={strokeColorHexInput} onChange={handleStrokeColorHexChange} placeholder="#000000" className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-800 border-2 border-green-500 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 sm:text-sm text-gray-900 dark:text-white" /> <button type="button" onClick={handleRandomStrokeColor} className="p-2 rounded-md text-green-600 dark:text-green-400 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500" title="Set Random Stroke Color"><SparklesIcon /></button> </div> </div> </>)}

              {/* Text Shadow Section */}
              <details className="group mb-4" open={showTextShadowOptions}>
                <summary className="cursor-pointer py-2 text-sm font-medium text-green-600 dark:text-green-300 hover:text-green-500 dark:hover:text-green-200 flex justify-between items-center" onClick={(e) => { e.preventDefault(); setShowTextShadowOptions(!showTextShadowOptions); }}>
                  Text Shadow Options
                  <span className={`transform transition-transform duration-200 ${showTextShadowOptions ? 'rotate-180' : ''}`}>▼</span>
                </summary>
                <div className="mt-2 pl-2 border-l-2 border-gray-300 dark:border-gray-700 space-y-3">
                  <CheckboxField id="hasTextShadow" label="Enable Text Shadow" checked={hasTextShadow} onChange={setHasTextShadow} className="mb-3" />
                  {hasTextShadow && (
                    <>
                      <div className="mb-3"> <label htmlFor="textShadowColor" className="block text-xs font-medium text-green-600 dark:text-green-400 mb-0.5">Shadow Color</label> <div className="flex items-center gap-1"> <input type="color" id="textShadowColor" value={textShadowColor} onChange={(e) => setTextShadowColor(e.target.value)} className="p-0.5 h-8 w-9 rounded-md border-gray-300 dark:border-gray-600 cursor-pointer bg-white dark:bg-gray-700" title="Pick shadow color" /> <input type="text" value={textShadowColorHexInput} onChange={handleTextShadowColorHexChange} placeholder="#000000" className="block w-full px-2 py-1.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-green-400 focus:border-green-400 text-xs text-gray-900 dark:text-white" /> </div> </div>
                      <SliderField id="textShadowBlur" label="Shadow Blur" value={textShadowBlur} onChange={(v) => setTextShadowBlur(v)} min={0} max={20} step={1} unit="px" className="mb-2" />
                      <div className="grid grid-cols-2 gap-2">
                        <InputField id="textShadowOffsetX" label="Shadow X Offset" type="number" value={textShadowOffsetX} onChange={(v) => setTextShadowOffsetX(parseInt(v) || 0)} placeholder="2" step="1" min={-20} max={20} className="mb-0 text-xs" />
                        <InputField id="textShadowOffsetY" label="Shadow Y Offset" type="number" value={textShadowOffsetY} onChange={(v) => setTextShadowOffsetY(parseInt(v) || 0)} placeholder="2" step="1" min={-20} max={20} className="mb-0 text-xs" />
                      </div>
                    </>
                  )}
                </div>
              </details>

              {/* Letter Spacing Section */}
              <div className="mb-4 pt-3 border-t border-gray-300 dark:border-gray-600">
                <SliderField id="songNameLetterSpacing" label="Song Name Letter Spacing" value={songNameLetterSpacing} onChange={setSongNameLetterSpacing} min={-5} max={50} step={0.5} unit="px" />
                <SliderField id="artistNameLetterSpacing" label="Artist Name Letter Spacing" value={artistNameLetterSpacing} onChange={setArtistNameLetterSpacing} min={-5} max={50} step={0.5} unit="px" />
              </div>


              <SelectField id="songNamePosition" label="Song Name Position" value={songNamePosition} onChange={setSongNamePosition} options={textPositionOptions} />
              <div className="grid grid-cols-3 gap-2 mb-1"><InputField id="songNameXOffset" label="X Offset" type="number" value={songNameXOffset} onChange={(v) => setSongNameXOffset(parseInt(v) || 0)} placeholder="0" step="1" className="mb-0" /><InputField id="songNameYOffset" label="Y Offset" type="number" value={songNameYOffset} onChange={(v) => setSongNameYOffset(parseInt(v) || 0)} placeholder="0" step="1" className="mb-0" /><InputField id="songNameRotation" label="Rotation (°)" type="number" value={songNameRotation} onChange={(v) => setSongNameRotation(parseInt(v) || 0)} placeholder="0" step="1" className="mb-0" /></div>
              <SelectField id="songNameTextAlign" label="Song Name Text Align" value={songNameTextAlign} onChange={(val) => setSongNameTextAlign(val as CanvasTextAlign | 'auto')} options={textAlignOptions.map(o => ({ ...o, value: String(o.value) }))} className="mb-3" />

              <SelectField id="artistNamePosition" label="Artist Name Position" value={artistNamePosition} onChange={setArtistNamePosition} options={textPositionOptions} />
              <div className="grid grid-cols-3 gap-2 mb-1"><InputField id="artistNameXOffset" label="X Offset" type="number" value={artistNameXOffset} onChange={(v) => setArtistNameXOffset(parseInt(v) || 0)} placeholder="0" step="1" className="mb-0" /><InputField id="artistNameYOffset" label="Y Offset" type="number" value={artistNameYOffset} onChange={(v) => setArtistNameYOffset(parseInt(v) || 0)} placeholder="0" step="1" className="mb-0" /><InputField id="artistNameRotation" label="Rotation (°)" type="number" value={artistNameRotation} onChange={(v) => setArtistNameRotation(parseInt(v) || 0)} placeholder="0" step="1" className="mb-0" /></div>
              <SelectField id="artistNameTextAlign" label="Artist Name Text Align" value={artistNameTextAlign} onChange={(val) => setArtistNameTextAlign(val as CanvasTextAlign | 'auto')} options={textAlignOptions.map(o => ({ ...o, value: String(o.value) }))} className="mb-3" />

              <SelectField id="relativeFontSize" label="Relative Font Size" value={relativeFontSize} onChange={setRelativeFontSize} options={relativeFontSizeOptions} />
            </fieldset>
          </div>

          <div className="md:col-span-1">
            <button type="button" onClick={handleAddTextAndOverlayToImage} disabled={isLoading || !canSubmit} className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-black bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-400 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-900 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:text-gray-500 dark:disabled:text-gray-400 disabled:cursor-not-allowed transition-colors mb-6"> {isLoading ? <><Spinner size="w-6 h-6 mr-2" color="text-black" /> PROCESSING...</> : 'CREATE COVER ART'} </button>
            {error && (<div className="mb-4 p-3 bg-red-100 dark:bg-red-900 bg-opacity-75 rounded-md text-center border border-red-300 dark:border-red-700" role="alert"><p className="text-sm font-medium text-red-700 dark:text-red-300">ERROR</p><p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p></div>)}
            {isLoading && progressMessage && (<div className="mb-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-md text-sm text-green-600 dark:text-green-300 text-center animate-pulse" role="status">{progressMessage}</div>)}
            <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-md overflow-hidden shadow-inner border-2 border-gray-300 dark:border-gray-600"> {processedImage ? (<img src={`data:image/png;base64,${processedImage.base64}`} alt="Processed Cover Art" className="w-full h-full object-contain" />) : filteredPreviewUrl ? (<img src={filteredPreviewUrl} alt="Preview" className="w-full h-full object-contain" />) : (<div className="w-full h-full flex items-center justify-center text-gray-500 text-sm"> Upload an image to see preview </div>)} </div>
            {processedImage && (<a href={`data:image/png;base64,${processedImage.base64}`} download={`${songName || 'cover'}_${artistTitle || 'art'}.png`} className="mt-4 w-full block text-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-black bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400 focus:ring-offset-gray-900"> DOWNLOAD IMAGE </a>)}
          </div>
        </div>

        {showSavePresetModal && (<div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"> <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md border border-green-500"> <h3 className="text-lg font-semibold text-green-700 dark:text-green-300 mb-4">Save Current Art Style Preset</h3> <InputField id="newPresetName" label="Preset Name" value={newPresetName} onChange={setNewPresetName} placeholder="e.g., Retro VHS Look" className="mb-4" /> {presetErrorMessage && <p className="text-red-500 dark:text-red-400 text-xs mb-3">{presetErrorMessage}</p>} <div className="flex justify-end gap-3"> <button onClick={() => { setShowSavePresetModal(false); setPresetErrorMessage(null); }} className="py-2 px-4 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-800 dark:text-white rounded">Cancel</button> <button onClick={handleSavePreset} className="py-2 px-4 bg-green-600 hover:bg-green-500 text-white dark:text-black rounded">Save Preset</button> </div> </div> </div>)}
        {showLoadPresetModal && (<div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"> <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-lg border border-green-500 max-h-[80vh] flex flex-col"> <h3 className="text-xl font-semibold text-green-700 dark:text-green-300 mb-4 sticky top-0 bg-white dark:bg-gray-800 pb-2 z-10">Load Saved Art Style</h3> {savedArtStylePresets.length > 0 ? (<ul className="overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-200 dark:scrollbar-track-gray-800 flex-grow space-y-2"> {savedArtStylePresets.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(preset => (<li key={preset.id} className="p-3 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600 transition-all"> <div className="flex justify-between items-center"> <div> <p className="font-semibold text-green-700 dark:text-green-200">{preset.name}</p> <p className="text-xs text-gray-500 dark:text-gray-400">Saved: {new Date(preset.createdAt).toLocaleDateString()}</p> </div> <div className="flex-shrink-0 space-x-2"> <button onClick={() => handleLoadPreset(preset.id)} className="text-xs py-1 px-2 bg-blue-600 hover:bg-blue-500 text-white rounded">Load</button> <button onClick={() => handleDeletePreset(preset.id)} className="text-xs py-1 px-2 bg-red-600 hover:bg-red-500 text-white rounded flex items-center"><DeleteIcon className="w-3 h-3 mr-1" />Del</button> </div> </div> </li>))} </ul>) : (<p className="text-gray-500 dark:text-gray-400 text-center py-4">No art style presets saved yet.</p>)} <div className="mt-4 sticky bottom-0 bg-white dark:bg-gray-800 pt-2 z-10"> <button onClick={() => setShowLoadPresetModal(false)} className="w-full py-2 px-4 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-800 dark:text-white rounded">Close</button> </div> </div> </div>)}
        {showImportExportModal && (<div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"> <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md border border-green-500"> <h3 className="text-lg font-semibold text-green-700 dark:text-green-300 mb-4">Import/Export Art Style Presets</h3> <button onClick={handleExportPresets} disabled={savedArtStylePresets.length === 0} className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded mb-4 disabled:opacity-50 flex items-center justify-center gap-1.5"><ExportIcon />Export All Presets to JSON</button> <TextAreaField id="importPresetJsonTextArea" label="Paste Presets JSON here OR Upload File Below" value={configToImportJson} onChange={setConfigToImportJson} rows={5} /> <input type="file" ref={importPresetFileRef} accept=".json" onChange={handleImportFileChange} className="block w-full text-sm text-gray-500 dark:text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-green-600 file:text-black hover:file:bg-green-500 mb-2" /> {importPresetError && <p className="text-red-500 dark:text-red-400 text-xs mb-2">{importPresetError}</p>} <div className="flex justify-between gap-2 mb-3"> <button onClick={() => processPresetImport('merge')} className="flex-1 py-2 px-3 bg-teal-600 hover:bg-teal-500 text-white rounded text-sm">Merge with Existing</button> <button onClick={() => processPresetImport('replace')} className="flex-1 py-2 px-3 bg-orange-600 hover:bg-orange-500 text-white rounded text-sm">Replace All Existing</button> </div> <button onClick={() => setShowImportExportModal(false)} className="w-full py-2 px-4 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-800 dark:text-white rounded">Close</button> </div> </div>)}
      </main>
    </div>
  );
};
export default SongCoverArtTool;
