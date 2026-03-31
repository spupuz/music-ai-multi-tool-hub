import { TextOptions } from '../../../utils/imageUtils';

export interface ExtendedTextOptions extends TextOptions {
  songNameXOffset: number;
  songNameYOffset: number;
  songNameRotation: number;
  artistNameXOffset: number;
  artistNameYOffset: number;
  artistNameRotation: number;
}

export interface ArtStyleSettings {
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
  hasTextShadow?: boolean;
  textShadowColor?: string;
  textShadowBlur?: number;
  textShadowOffsetX?: number;
  textShadowOffsetY?: number;
  songNameTextAlign?: CanvasTextAlign | 'auto';
  artistNameTextAlign?: CanvasTextAlign | 'auto';
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
  vignetteIntensity: number;
  vignetteColor: string;
  noiseAmount: number;
  duotone: boolean;
  duotoneColor1: string;
  duotoneColor2: string;
}

export interface ArtStylePreset {
  id: string;
  name: string;
  settings: ArtStyleSettings;
  createdAt: string;
}

export const SAVED_PRESETS_LOCAL_STORAGE_KEY = 'songCoverArt_savedStylePresets_v1';
export const TOOL_CATEGORY = 'SongCoverArt';

const LOGO_SVG_STRING = `<svg viewBox='0 0 100 100' fill='none' xmlns='http://www.w3.org/2000/svg'><path d='M50 10 L85 27.5 V72.5 L50 90 L15 72.5 V27.5 L50 10 Z' stroke='#059669' stroke-width='8' fill='transparent'/><circle cx='50' cy='35' r='7' fill='#14B8A6'/><circle cx='35' cy='65' r='6' fill='#14B8A6'/><circle cx='65' cy='65' r='6' fill='#14B8A6'/><line x1='50' y1='35' x2='35' y2='65' stroke='#10B981' stroke-width='5' stroke-linecap='round'/><line x1='50' y1='35' x2='65' y2='65' stroke='#10B981' stroke-width='5' stroke-linecap='round'/><line x1='38' y1='63' x2='62' y2='63' stroke='#10B981' stroke-width='5' stroke-linecap='round'/></svg>`;
export const FALLBACK_IMAGE_DATA_URI = `data:image/svg+xml;base64,${btoa(LOGO_SVG_STRING)}`;

export const availableFonts = [
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
export const textPositionOptions = [
  { value: 'top-left', label: 'Top Left' }, { value: 'top-center', label: 'Top Center' },
  { value: 'top-right', label: 'Top Right' }, { value: 'middle-left', label: 'Middle Left' },
  { value: 'middle-center', label: 'Middle Center' }, { value: 'middle-right', label: 'Middle Right' },
  { value: 'bottom-left', label: 'Bottom Left' }, { value: 'bottom-center', label: 'Bottom Center' },
  { value: 'bottom-right', label: 'Bottom Right' },
];
export const overlayPositionOptions = [
  { value: 'top-left', label: 'Top Left' }, { value: 'top-right', label: 'Top Right' },
  { value: 'bottom-left', label: 'Bottom Left' }, { value: 'bottom-right', label: 'Bottom Right' },
  { value: 'center', label: 'Center' },
];
export const relativeFontSizeOptions = [
  { value: 'tiny', label: 'Tiny (60%)' }, { value: 'xsmall', label: 'X-Small (70%)' },
  { value: 'small', label: 'Small (80%)' }, { value: 'medium', label: 'Medium (100%)' },
  { value: 'large', label: 'Large (120%)' }, { value: 'xlarge', label: 'X-Large (150%)' },
  { value: 'huge', label: 'Huge (180%)' }, { value: 'giant', label: 'Giant (220%)' },
];
export interface TextPreset { value: string; label: string; settings: Partial<ExtendedTextOptions>; }
export const textEffectPresets: TextPreset[] = [
  { value: 'none', label: 'Custom Settings', settings: { textColorMode: 'solid', songNameXOffset: 0, songNameYOffset: 0, songNameRotation: 0, artistNameXOffset: 0, artistNameYOffset: 0, artistNameRotation: 0, hasTextShadow: false, songNameTextAlign: 'auto', artistNameTextAlign: 'auto', songNameLetterSpacing: 0, artistNameLetterSpacing: 0 } },
  { value: 'classicWhiteOutline', label: 'Classic White (Black Outline)', settings: { fontFamily: 'Impact', fontColor: '#FFFFFF', hasStroke: true, strokeThickness: 3, strokeColor: '#000000', relativeFontSize: 'medium', textColorMode: 'solid', songNameXOffset: 0, songNameYOffset: 0, songNameRotation: 0, artistNameXOffset: 0, artistNameYOffset: 0, artistNameRotation: 0, hasTextShadow: false, songNameTextAlign: 'auto', artistNameTextAlign: 'auto', songNameLetterSpacing: 0, artistNameLetterSpacing: 0 } },
  { value: 'boldYellowImpact', label: 'Bold Yellow Impact', settings: { fontFamily: 'Impact', fontColor: '#FFD700', hasStroke: true, strokeThickness: 4, strokeColor: '#4A2E00', relativeFontSize: 'large', textColorMode: 'solid', songNameXOffset: 0, songNameYOffset: 0, songNameRotation: 0, artistNameXOffset: 0, artistNameYOffset: 0, artistNameRotation: 0, hasTextShadow: false, songNameTextAlign: 'auto', artistNameTextAlign: 'auto', songNameLetterSpacing: 0, artistNameLetterSpacing: 0 } },
  { value: 'elegantThinWhite', label: 'Elegant Thin White (No Outline)', settings: { fontFamily: 'Garamond', fontColor: '#FAFAFA', hasStroke: false, strokeThickness: 1, strokeColor: '#000000', relativeFontSize: 'medium', textColorMode: 'solid', songNameXOffset: 0, songNameYOffset: 0, songNameRotation: 0, artistNameXOffset: 0, artistNameYOffset: 0, artistNameRotation: 0, hasTextShadow: false, songNameTextAlign: 'auto', artistNameTextAlign: 'auto', songNameLetterSpacing: 0, artistNameLetterSpacing: 0 } },
  { value: 'cyberGreen', label: 'Cyber Green Glow', settings: { fontFamily: 'Futura', fontColor: '#39FF14', hasStroke: true, strokeThickness: 2, strokeColor: '#0F510F', relativeFontSize: 'medium', textColorMode: 'solid', songNameXOffset: 0, songNameYOffset: 0, songNameRotation: 0, artistNameXOffset: 0, artistNameYOffset: 0, artistNameRotation: 0, hasTextShadow: true, textShadowColor: '#39FF14', textShadowBlur: 5, textShadowOffsetX: 0, textShadowOffsetY: 0, songNameTextAlign: 'auto', artistNameTextAlign: 'auto', songNameLetterSpacing: 0, artistNameLetterSpacing: 0 } },
  { value: 'minimalistBlack', label: 'Minimalist Black (No Outline)', settings: { fontFamily: 'Helvetica', fontColor: '#1A1A1A', hasStroke: false, strokeThickness: 1, strokeColor: '#FFFFFF', relativeFontSize: 'small', textColorMode: 'solid', songNameXOffset: 0, songNameYOffset: 0, songNameRotation: 0, artistNameXOffset: 0, artistNameYOffset: 0, artistNameRotation: 0, hasTextShadow: false, songNameTextAlign: 'auto', artistNameTextAlign: 'auto', songNameLetterSpacing: 0, artistNameLetterSpacing: 0 } },
  { value: 'sunsetGradient', label: 'Sunset Gradient', settings: { fontFamily: 'Arial Black', textColorMode: 'gradient', gradientColor1: '#FF8C00', gradientColor2: '#FF0080', gradientDirection: 'top-to-bottom', hasStroke: true, strokeColor: '#000000', strokeThickness: 2, relativeFontSize: 'large', songNameXOffset: 0, songNameYOffset: 0, songNameRotation: 0, artistNameXOffset: 0, artistNameYOffset: 0, artistNameRotation: 0, hasTextShadow: false, songNameTextAlign: 'auto', artistNameTextAlign: 'auto', songNameLetterSpacing: 0, artistNameLetterSpacing: 0 } }
];
export const overlayBlendModeOptions = [
  { value: 'source-over', label: 'Normal' }, { value: 'multiply', label: 'Multiply' },
  { value: 'screen', label: 'Screen' }, { value: 'overlay', label: 'Overlay' },
  { value: 'darken', label: 'Darken' }, { value: 'lighten', label: 'Lighten' },
  { value: 'color-dodge', label: 'Color Dodge' }, { value: 'color-burn', label: 'Color Burn' },
  { value: 'hard-light', label: 'Hard Light' }, { value: 'soft-light', label: 'Soft Light' },
  { value: 'difference', label: 'Difference' }, { value: 'exclusion', label: 'Exclusion' },
  { value: 'hue', label: 'Hue' }, { value: 'saturation', label: 'Saturation' },
  { value: 'color', label: 'Color' }, { value: 'luminosity', label: 'Luminosity' }
];
export const textColorModeOptions = [{ value: 'solid', label: 'Solid Color' }, { value: 'gradient', label: 'Gradient Color' },];
export const gradientDirectionOptions = [
  { value: 'top-to-bottom', label: 'Top to Bottom' }, { value: 'bottom-to-top', label: 'Bottom to Top' },
  { value: 'left-to-right', label: 'Left to Right' }, { value: 'right-to-left', label: 'Right to Left' },
  { value: 'top-left-to-bottom-right', label: 'Diagonal (Top-Left to Bottom-Right)' },
  { value: 'bottom-left-to-top-right', label: 'Diagonal (Bottom-Left to Top-Right)' },
  { value: 'top-right-to-bottom-left', label: 'Diagonal (Top-Right to Bottom-Left)' },
  { value: 'bottom-right-to-top-left', label: 'Diagonal (Bottom-Right to Top-Left)' },
];
export const textAlignOptions: Array<{ value: CanvasTextAlign | 'auto'; label: string }> = [
  { value: 'auto', label: 'Auto (from Position)' },
  { value: 'left', label: 'Left' },
  { value: 'center', label: 'Center' },
  { value: 'right', label: 'Right' },
];
