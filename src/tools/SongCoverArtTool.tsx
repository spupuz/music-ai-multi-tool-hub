
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { GeneratedImage, AppState } from '@/types';
import ImageUpload from '@/components/ImageUpload';
import Spinner from '@/components/Spinner';
import { addTextToImage, TextOptions, OverlayImageOptions, ImageFilterOptions, hexToRgb } from '@/utils/imageUtils';
import type { ToolProps } from '@/Layout'; 
import { fetchSunoClipById, resolveSunoUrlToPotentialSongId } from '@/services/sunoService';
import { fetchRiffusionSongData, extractRiffusionSongId } from '@/services/riffusionService';
import InputField from '@/components/forms/InputField';
import SelectField from '@/components/forms/SelectField';
import CheckboxField from '@/components/forms/CheckboxField';
import SliderField from '@/components/forms/SliderField';
import Button from '@/components/common/Button';


import {
  SparklesIcon, PaletteIcon, SaveIcon, LoadIcon, ConfigIcon, RefreshIcon, ExportIcon
} from '@/components/SongCoverArt/Icons';

import {
  ExtendedTextOptions, ArtStyleSettings, ArtStylePreset, SAVED_PRESETS_LOCAL_STORAGE_KEY,
  TOOL_CATEGORY, FALLBACK_IMAGE_DATA_URI, availableFonts, textPositionOptions, overlayPositionOptions,
  textEffectPresets, overlayBlendModeOptions,
} from '@/components/SongCoverArt/constants';

import { imageUrlToBase64, isValidHexColor, normalizeHexColor } from '@/components/SongCoverArt/utils';
import PresetModals from '@/components/SongCoverArt/PresetModals';


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

  // New State for Advanced Effects
  const [showAdvancedEffects, setShowAdvancedEffects] = useState<boolean>(false);
  const [vignetteIntensity, setVignetteIntensity] = useState<number>(0);
  const [vignetteColor, setVignetteColor] = useState<string>('#000000');
  const [vignetteColorHexInput, setVignetteColorHexInput] = useState<string>('#000000');
  const [noiseAmount, setNoiseAmount] = useState<number>(0);
  const [duotone, setDuotone] = useState<boolean>(false);
  const [duotoneColor1, setDuotoneColor1] = useState<string>('#002B5B'); 
  const [duotoneColor1HexInput, setDuotoneColor1HexInput] = useState<string>('#002B5B');
  const [duotoneColor2, setDuotoneColor2] = useState<string>('#FAD02C'); 
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
    setFontColor(newColor); setFontColorHexInput(newColor); trackLocalEvent(TOOL_CATEGORY, 'randomColorSelected', 'font');
  };
  const handleRandomStrokeColor = () => {
    const newColor = generateRandomHexColor();
    setStrokeColor(newColor); setStrokeColorHexInput(newColor); trackLocalEvent(TOOL_CATEGORY, 'randomColorSelected', 'stroke');
  };
  const handleRandomGradientColor1 = () => {
    const newColor = generateRandomHexColor();
    setGradientColor1(newColor); setGradientColor1HexInput(newColor); trackLocalEvent(TOOL_CATEGORY, 'randomColorSelected', 'gradient1');
  };
  const handleRandomGradientColor2 = () => {
    const newColor = generateRandomHexColor();
    setGradientColor2(newColor); setGradientColor2HexInput(newColor); trackLocalEvent(TOOL_CATEGORY, 'randomColorSelected', 'gradient2');
  };
  const handleRandomVignetteColor = () => {
    const newColor = generateRandomHexColor();
    setVignetteColor(newColor); setVignetteColorHexInput(newColor); trackLocalEvent(TOOL_CATEGORY, 'randomColorSelected', 'vignette');
  };
  const handleRandomShadowColor = () => {
    const newColor = generateRandomHexColor();
    setTextShadowColor(newColor); setTextShadowColorHexInput(newColor); trackLocalEvent(TOOL_CATEGORY, 'randomColorSelected', 'shadow');
  };

  const handleImageUpload = useCallback((base64Image: string) => {
    setInputImageBase64(base64Image); setError(null); setProcessedImage(null); setAppState(AppState.Idle);
  }, []);
  const handleOverlayImageUpload = useCallback((base64Image: string) => { setOverlayImageBase64(base64Image); setError(null); setProcessedImage(null); setAppState(AppState.Idle); }, []);

  const handleLoadFromUrl = useCallback(async () => {
    let urlToProcess = songUrlInput.trim();
    if (!urlToProcess) { setError('Please enter a Suno, Riffusion, or Producer.AI Song URL.'); return; }
    setError(null); setAppState(AppState.Processing); setProgressMessage('Validating URL...');
    trackLocalEvent(TOOL_CATEGORY, 'urlLoadAttempt', songUrlInput);

    if (urlToProcess.includes('producer.ai')) {
      const songId = extractRiffusionSongId(urlToProcess);
      if (songId) { urlToProcess = `https://www.producer.ai/song/${songId}`; }
    }

    try {
      if (urlToProcess.includes('riffusion.com') || urlToProcess.includes('producer.ai')) {
        const songId = extractRiffusionSongId(urlToProcess);
        if (!songId) throw new Error("Could not extract Riffusion song ID.");
        const riffusionData = await fetchRiffusionSongData(songId);
        if (!riffusionData) throw new Error("Failed to fetch riffusion data.");
        setSongName(riffusionData.title || ''); setArtistTitle(riffusionData.artist || '');
        if (riffusionData.image_url) { const base64Image = await imageUrlToBase64(riffusionData.image_url); handleImageUpload(base64Image); }
      } else {
        const songId = await resolveSunoUrlToPotentialSongId(urlToProcess, setProgressMessage);
        if (!songId) throw new Error("Could not resolve Suno URL.");
        const clip = await fetchSunoClipById(songId);
        if (!clip) throw new Error("Failed to fetch suno clip.");
        setSongName(clip.title || ''); setArtistTitle(clip.display_name || clip.handle || '');
        if (clip.image_url) { const base64Image = await imageUrlToBase64(clip.image_url); handleImageUpload(base64Image); }
      }
    } catch (err) { setError(err instanceof Error ? err.message : "Error loading URL."); }
    finally { setAppState(AppState.Idle); setProgressMessage(''); }
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
            data[i+1] = Math.max(0, Math.min(255, data[i+1] + noise));
            data[i+2] = Math.max(0, Math.min(255, data[i+2] + noise));
          }
        }
        ctx.putImageData(imageData, 0, 0);
      }
      if (vignetteIntensity > 0) {
        ctx.save();
        const outerRadius = Math.sqrt(Math.pow(canvas.width / 2, 2) + Math.pow(canvas.height / 2, 2));
        const gradient = ctx.createRadialGradient(canvas.width/2, canvas.height/2, 0, canvas.width/2, canvas.height/2, outerRadius);
        const intensity = vignetteIntensity / 100;
        const vignetteRgb = hexToRgb(vignetteColor) || { r: 0, g: 0, b: 0 };
        gradient.addColorStop(0.3, `rgba(${vignetteRgb.r},${vignetteRgb.g},${vignetteRgb.b},0)`);
        gradient.addColorStop(1, `rgba(${vignetteRgb.r},${vignetteRgb.g},${vignetteRgb.b},${intensity})`);
        ctx.fillStyle = gradient; ctx.fillRect(0, 0, canvas.width, canvas.height); ctx.restore();
      }

      if (overlayImageBase64) {
        const overlayImg = new Image();
        overlayImg.onload = () => {
          let overlayW = canvas.width * (overlaySizePercent / 100); let overlayH = overlayW * (overlayImg.height / overlayImg.width);
          let overlayX = 0, overlayY = 0; const margin = canvas.width * 0.02;
          switch (overlayPosition) {
            case 'top-left': overlayX = margin; overlayY = margin; break; case 'top-right': overlayX = canvas.width - overlayW - margin; overlayY = margin; break;
            case 'bottom-left': overlayX = margin; overlayY = canvas.height - overlayH - margin; break; case 'bottom-right': overlayX = canvas.width - overlayW - margin; overlayY = canvas.height - overlayH - margin; break;
            case 'center': overlayX = (canvas.width - overlayW) / 2; overlayY = (canvas.height - overlayH) / 2; break;
          }
          ctx.globalAlpha = overlayOpacity; ctx.globalCompositeOperation = overlayBlendMode as GlobalCompositeOperation;
          ctx.drawImage(overlayImg, overlayX, overlayY, overlayW, overlayH); ctx.globalAlpha = 1.0; ctx.globalCompositeOperation = 'source-over';
          setFilteredPreviewUrl(canvas.toDataURL('image/png'));
        };
        overlayImg.src = overlayImageBase64;
      } else { setFilteredPreviewUrl(canvas.toDataURL('image/png')); }
    };
    mainImg.src = inputImageBase64;
  }, [inputImageBase64, brightness, contrast, saturation, grayscale, sepia, hueRotate, blur, overlayImageBase64, overlayPosition, overlaySizePercent, overlayOpacity, overlayBlendMode, vignetteIntensity, vignetteColor, noiseAmount, duotone, duotoneColor1, duotoneColor2]);

  const currentTextOptions = (): ExtendedTextOptions => ({
    fontFamily, fontColor, hasStroke, strokeThickness, strokeColor, songNamePosition, artistNamePosition, relativeFontSize,
    featuredArtistName: featuredArtistName.trim() || undefined,
    textColorMode, gradientColor1, gradientColor2, gradientDirection,
    songNameXOffset, songNameYOffset, songNameRotation, artistNameXOffset, artistNameYOffset, artistNameRotation,
    hasTextShadow, textShadowColor, textShadowBlur, textShadowOffsetX, textShadowOffsetY,
    songNameTextAlign, artistNameTextAlign,
    songNameLetterSpacing, artistNameLetterSpacing,
  });

  const applyTextPreset = useCallback((presetValue: string) => {
    setSelectedPreset(presetValue); const preset = textEffectPresets.find(p => p.value === presetValue);
    if (!preset || !preset.settings) return;
    const s = preset.settings;
    if (s.fontFamily) setFontFamily(s.fontFamily); if (s.fontColor) setFontColor(s.fontColor);
    if (typeof s.hasStroke === 'boolean') setHasStroke(s.hasStroke); if (typeof s.strokeThickness === 'number') setStrokeThickness(s.strokeThickness);
    if (s.strokeColor) setStrokeColor(s.strokeColor); if (s.relativeFontSize) setRelativeFontSize(s.relativeFontSize);
    setTextColorMode(s.textColorMode || 'solid'); setGradientColor1(s.gradientColor1 || '#FF8C00');
    setGradientColor2(s.gradientColor2 || '#FF0080'); setGradientDirection(s.gradientDirection || 'top-to-bottom');
  }, []);

  const handleAddTextAndOverlayToImage = async () => {
    if (!songName.trim() || !artistTitle.trim() || !inputImageBase64) { setError('Missing Title, Artist, or Main Image.'); return; }
    setError(null); setProcessedImage(null); setAppState(AppState.Processing); setProgressMessage('Applying Signal Processing...');
    try {
      const txtOpts = currentTextOptions();
      const imgFilters = { brightness, contrast, saturation, grayscale, sepia, hueRotate, blur, vignetteIntensity, vignetteColor, noiseAmount, duotone, duotoneColor1, duotoneColor2 };
      const ovlOpts = overlayImageBase64 ? { base64: overlayImageBase64, position: overlayPosition, sizePercent: overlaySizePercent, opacity: overlayOpacity, blendMode: overlayBlendMode } : undefined;
      const result = await addTextToImage(inputImageBase64, songName.trim(), artistTitle.trim(), txtOpts, imgFilters, ovlOpts);
      setProcessedImage({ base64: result.split(',')[1], promptUsed: "Synthesized Output" });
      setAppState(AppState.Success);
    } catch (err) { setError(err instanceof Error ? err.message : 'Processing Error.'); setAppState(AppState.Error); }
    finally { setProgressMessage(''); }
  };

  useEffect(() => { try { const stored = localStorage.getItem(SAVED_PRESETS_LOCAL_STORAGE_KEY); if (stored) setSavedArtStylePresets(JSON.parse(stored)); } catch (e) {} }, []);
  useEffect(() => { try { localStorage.setItem(SAVED_PRESETS_LOCAL_STORAGE_KEY, JSON.stringify(savedArtStylePresets)); } catch (e) {} }, [savedArtStylePresets]);

  const collectCurrentSettings = (): ArtStyleSettings => ({
    fontFamily, fontColor, hasStroke, strokeThickness, strokeColor, songNamePosition, artistNamePosition, relativeFontSize,
    featuredArtistName: featuredArtistName.trim() || undefined, textColorMode, gradientColor1, gradientColor2, gradientDirection,
    songNameXOffset, songNameYOffset, songNameRotation, artistNameXOffset, artistNameYOffset, artistNameRotation,
    hasTextShadow, textShadowColor, textShadowBlur, textShadowOffsetX, textShadowOffsetY,
    songNameTextAlign, artistNameTextAlign, songNameLetterSpacing, artistNameLetterSpacing,
    brightness, contrast, saturation, grayscale, sepia, hueRotate, blur,
    overlayActive: !!overlayImageBase64, overlayPosition, overlaySizePercent, overlayOpacity, overlayBlendMode,
    vignetteIntensity, vignetteColor, noiseAmount, duotone, duotoneColor1, duotoneColor2
  });

  const applyPresetSettings = (s: ArtStyleSettings) => {
    setFontFamily(s.fontFamily); setFontColor(s.fontColor); setHasStroke(s.hasStroke); setStrokeThickness(s.strokeThickness); setStrokeColor(s.strokeColor);
    setSongNamePosition(s.songNamePosition); setArtistNamePosition(s.artistNamePosition); setRelativeFontSize(s.relativeFontSize);
    setTextColorMode(s.textColorMode); setGradientColor1(s.gradientColor1 || '#FF8C00'); setGradientColor2(s.gradientColor2 || '#FF0080');
    setSongNameXOffset(s.songNameXOffset); setSongNameYOffset(s.songNameYOffset); setSongNameRotation(s.songNameRotation || 0);
    setArtistNameXOffset(s.artistNameXOffset); setArtistNameYOffset(s.artistNameYOffset); setArtistNameRotation(s.artistNameRotation || 0);
    setHasTextShadow(s.hasTextShadow || false); setTextShadowColor(s.textShadowColor || '#000000');
    setBrightness(s.brightness); setContrast(s.contrast); setSaturation(s.saturation); setGrayscale(s.grayscale); setSepia(s.sepia); setHueRotate(s.hueRotate); setBlur(s.blur);
    setVignetteIntensity(s.vignetteIntensity || 0); setVignetteColor(s.vignetteColor || '#000000'); setNoiseAmount(s.noiseAmount || 0); setDuotone(s.duotone || false);
  };

  const handleSavePreset = () => {
    if (!newPresetName.trim()) return;
    const newPreset: ArtStylePreset = { id: Date.now().toString(), name: newPresetName.trim(), settings: collectCurrentSettings(), createdAt: new Date().toISOString() };
    setSavedArtStylePresets(prev => [newPreset, ...prev]); setShowSavePresetModal(false); setNewPresetName(''); trackLocalEvent(TOOL_CATEGORY, 'presetSaved', newPreset.name);
  };
  const handleLoadPreset = (id: string) => { const p = savedArtStylePresets.find(x => x.id === id); if (p) { applyPresetSettings(p.settings); setShowLoadPresetModal(false); trackLocalEvent(TOOL_CATEGORY, 'presetLoaded', p.name); } };
  const handleDeletePreset = (id: string) => { setSavedArtStylePresets(prev => prev.filter(x => x.id !== id)); };

  const handleExportPresets = () => {
    if (savedArtStylePresets.length === 0) return;
    const jsonString = JSON.stringify(savedArtStylePresets, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a'); link.href = url; link.download = `presets.json`; document.body.appendChild(link); link.click(); document.body.removeChild(link); URL.revokeObjectURL(url);
  };
  const handleImportFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader(); reader.onload = (ev) => { setConfigToImportJson(ev.target?.result as string); }; reader.readAsText(file);
    }
  };
  const processPresetImport = (mode: 'merge' | 'replace') => {
    try {
      const imported = JSON.parse(configToImportJson);
      if (mode === 'replace') setSavedArtStylePresets(imported);
      else setSavedArtStylePresets(prev => [...prev, ...imported]);
      setShowImportExportModal(false); setConfigToImportJson('');
    } catch (e) { setImportPresetError('Invalid JSON'); }
  };

  const isLoading = appState === AppState.Processing;
  const canSubmit = songName.trim() && artistTitle.trim() && inputImageBase64;

  return (
    <div className="w-full">
      <header className="mb-8 md:mb-16 text-center pt-0 md:pt-8 px-4 animate-fadeIn">
        <h1 className="text-3xl sm:text-5xl md:text-7xl font-black uppercase tracking-tighter text-emerald-600 dark:text-emerald-500 leading-none italic drop-shadow-2xl mb-1 md:mb-4">Visual Synth</h1>
        <p className="mt-1 md:mt-6 text-[9px] md:text-[10px] font-black uppercase tracking-[0.4em] text-gray-500 opacity-60 mx-auto max-w-2xl">
          High-Fidelity Cover Art • Cinematic Signal Processing
        </p>
      </header>

      <canvas ref={previewCanvasRef} style={{ display: 'none' }}></canvas>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
        {/* Column 1: Generation & Input */}
        <div className="space-y-8">
          <section className="glass-card p-8 border-white/10 shadow-xl">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-green-600 dark:text-green-500 mb-6">Source Signal</h3>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="block text-[8px] font-black uppercase tracking-widest text-gray-500">Remote Stream</label>
                <div className="flex gap-2">
                  <input type="text" value={songUrlInput} onChange={(e) => setSongUrlInput(e.target.value)} placeholder="Suno / Riffusion URL" className="flex-grow px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold" />
                  <Button onClick={handleLoadFromUrl} variant="primary" size="xs" className="px-4" startIcon={<RefreshIcon className="w-3 h-3" />}>Sync</Button>
                </div>
              </div>
              <div className="space-y-4">
                <InputField id="songName" label="Title" value={songName} onChange={setSongName} placeholder="Neon Dreams" />
                <InputField id="artistTitle" label="Artist" value={artistTitle} onChange={setArtistTitle} placeholder="The Matrix" />
              </div>
            </div>
          </section>

          <section className="glass-card p-8 border-white/10 shadow-xl">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-green-600 mb-6">Visual Core</h3>
            <ImageUpload onImageUpload={handleImageUpload} label="Deploy Main Canvas" />
          </section>

          <section className="glass-card p-8 border-white/10 shadow-xl relative overflow-hidden">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600">Geometric Typography</h3>
              <div className="flex gap-2">
                <Button onClick={() => setShowLoadPresetModal(true)} variant="ghost" size="xs" startIcon={<LoadIcon className="w-3 h-3" />} className="flex items-center justify-center">Vault</Button>
                <Button onClick={() => setShowSavePresetModal(true)} variant="ghost" size="xs" startIcon={<SaveIcon className="w-3.5 h-3.5" />} className="flex items-center justify-center">Commit</Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-6">
                <SelectField id="fontFamily" label="Font Vector" value={fontFamily} onChange={setFontFamily} options={availableFonts} />
                <div className="space-y-2">
                  <label className="block text-[8px] font-black uppercase tracking-widest text-gray-500 ml-1">Color Processing</label>
                  <div className="flex gap-2 p-1 bg-white/5 rounded-xl border border-white/10">
                    <Button onClick={() => setTextColorMode('solid')} variant="ghost" size="sm" className={`flex-1 ${textColorMode === 'solid' ? 'bg-white/10' : ''}`}>Solid</Button>
                    <Button onClick={() => setTextColorMode('gradient')} variant="ghost" size="sm" className={`flex-1 ${textColorMode === 'gradient' ? 'bg-white/10' : ''}`}>Gradient</Button>
                  </div>
                </div>

                {textColorMode === 'solid' ? (
                  <div className="space-y-2">
                      <label className="block text-[8px] font-black uppercase tracking-widest text-gray-500 ml-1">Active Hue</label>
                      <div className="flex gap-2">
                        <input type="color" value={fontColor} onChange={(e) => setFontColor(e.target.value)} className="w-12 h-10 flex-shrink-0 p-0.5 bg-white/5 border border-white/10 rounded-xl cursor-pointer overflow-hidden [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:border-none [&::-webkit-color-swatch]:rounded-[9px]" />
                        <input type="text" value={fontColorHexInput} onChange={handleFontColorHexChange} className="flex-grow min-w-0 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs uppercase" />
                        <Button onClick={handleRandomFontColor} variant="ghost" size="sm" className="px-3 flex-shrink-0 border-white/10"><SparklesIcon className="w-4 h-4"/></Button>
                      </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                        <label className="text-[8px] font-black uppercase tracking-widest text-gray-500 ml-1">Vector A</label>
                        <div className="flex gap-1">
                          <input type="color" value={gradientColor1} onChange={(e) => setGradientColor1(e.target.value)} className="w-10 h-10 p-0.5 bg-white/5 border border-white/10 rounded-xl cursor-pointer overflow-hidden [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:border-none [&::-webkit-color-swatch]:rounded-[9px]" />
                          <Button onClick={handleRandomGradientColor1} variant="ghost" size="sm" className="px-2 border-white/10"><SparklesIcon className="w-3.5 h-3.5"/></Button>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[8px] font-black uppercase tracking-widest text-gray-500 ml-1">Vector B</label>
                        <div className="flex gap-1">
                          <input type="color" value={gradientColor2} onChange={(e) => setGradientColor2(e.target.value)} className="w-10 h-10 p-0.5 bg-white/5 border border-white/10 rounded-xl cursor-pointer overflow-hidden [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:border-none [&::-webkit-color-swatch]:rounded-[9px]" />
                          <Button onClick={handleRandomGradientColor2} variant="ghost" size="sm" className="px-2 border-white/10"><SparklesIcon className="w-3.5 h-3.5"/></Button>
                        </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <CheckboxField id="hasStroke" label="Edge Distortion" checked={hasStroke} onChange={setHasStroke} />
                {hasStroke && (
                  <div className="space-y-4 pl-4 border-l border-white/10">
                    <SliderField id="strokeThickness" label="Weight" value={strokeThickness} onChange={setStrokeThickness} max={10} step={0.1} />
                    <div className="flex gap-2">
                      <input type="color" value={strokeColor} onChange={(e) => setStrokeColor(e.target.value)} className="w-12 h-10 flex-shrink-0 p-0.5 bg-white/5 border border-white/10 rounded-xl cursor-pointer overflow-hidden [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:border-none [&::-webkit-color-swatch]:rounded-[9px]" />
                      <input type="text" value={strokeColorHexInput} onChange={handleStrokeColorHexChange} className="flex-grow min-w-0 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs uppercase" />
                      <Button onClick={handleRandomStrokeColor} variant="ghost" size="sm" className="px-3 flex-shrink-0 border-white/10"><SparklesIcon className="w-4 h-4"/></Button>
                    </div>
                  </div>
                )}
                
                <div className="space-y-4">
                  <CheckboxField id="hasTextShadow" label="Shadow Depth" checked={hasTextShadow} onChange={setHasTextShadow} />
                  {hasTextShadow && (
                    <div className="space-y-4 pl-4 border-l border-white/10">
                       <SliderField id="textShadowBlur" label="Softness" value={textShadowBlur} onChange={setTextShadowBlur} max={20} />
                       <div className="flex gap-2">
                        <input type="color" value={textShadowColor} onChange={(e) => setTextShadowColor(e.target.value)} className="w-12 h-10 flex-shrink-0 p-0.5 bg-white/5 border border-white/10 rounded-xl cursor-pointer overflow-hidden [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:border-none [&::-webkit-color-swatch]:rounded-[9px]" />
                        <input type="text" value={textShadowColorHexInput} onChange={handleTextShadowColorHexChange} className="flex-grow min-w-0 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs uppercase" />
                        <Button onClick={handleRandomShadowColor} variant="ghost" size="sm" className="px-3 flex-shrink-0 border-white/10"><SparklesIcon className="w-4 h-4"/></Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-white/5 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h4 className="text-[9px] font-black uppercase text-gray-500 opacity-60">Title Alignment</h4>
                <SelectField id="songNamePosition" label="Position" value={songNamePosition} onChange={setSongNamePosition} options={textPositionOptions} />
                <div className="grid grid-cols-3 gap-2">
                  <InputField id="songNameX" label="X" type="number" value={songNameXOffset} onChange={(v) => setSongNameXOffset(parseInt(v)||0)} />
                  <InputField id="songNameY" label="Y" type="number" value={songNameYOffset} onChange={(v) => setSongNameYOffset(parseInt(v)||0)} />
                  <InputField id="songNameR" label="Rot" type="number" value={songNameRotation} onChange={(v) => setSongNameRotation(parseInt(v)||0)} />
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="text-[9px] font-black uppercase text-gray-500 opacity-60">Artist Alignment</h4>
                <SelectField id="artistNamePosition" label="Position" value={artistNamePosition} onChange={setArtistNamePosition} options={textPositionOptions} />
                <div className="grid grid-cols-3 gap-2">
                  <InputField id="artistNameX" label="X" type="number" value={artistNameXOffset} onChange={(v) => setArtistNameXOffset(parseInt(v)||0)} />
                  <InputField id="artistNameY" label="Y" type="number" value={artistNameYOffset} onChange={(v) => setArtistNameYOffset(parseInt(v)||0)} />
                  <InputField id="artistNameR" label="Rot" type="number" value={artistNameRotation} onChange={(v) => setArtistNameRotation(parseInt(v)||0)} />
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Column 2: Mastering & Output */}
        <div className="space-y-8">
          <section className="glass-card p-8 border-white/10 shadow-2xl relative overflow-hidden flex flex-col">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-green-600 mb-8">Processed Output</h3>
            <div className="aspect-square w-full bg-black/40 rounded-3xl overflow-hidden border border-white/10 shadow-inner relative group">
              {filteredPreviewUrl ? (
                <img src={filteredPreviewUrl} alt="Preview" className="w-full h-full object-contain" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-8 text-gray-600">
                  <ConfigIcon className="w-8 h-8 opacity-20 mb-4" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">System Idle</p>
                </div>
              )}
              {isLoading && (
                <div className="absolute inset-0 bg-black/80 flex items-center justify-center gap-4">
                  <Spinner size="w-8 h-8" color="text-green-500" />
                  <span className="text-xs font-bold uppercase text-white/60">Processing Signal...</span>
                </div>
              )}
            </div>

            <Button
              onClick={handleAddTextAndOverlayToImage}
              disabled={!canSubmit}
              loading={isLoading}
              variant="primary"
              size="lg"
              className="mt-8 w-full h-16 font-black uppercase tracking-widest text-xs shadow-2xl flex items-center justify-center"
              backgroundColor="#22c55e"
              startIcon={<SparklesIcon className="w-5 h-5" />}
            >
              Synthesize Master
            </Button>
          </section>

          <div className="space-y-8">
            <section className="glass-card p-8 border-white/10 shadow-xl">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600 mb-6">Master Adjustments</h3>
              <div className="space-y-4">
                <SliderField id="brightness" label="Luminance" value={brightness} onChange={setBrightness} />
                <SliderField id="contrast" label="Dynamic" value={contrast} onChange={setContrast} />
                <SliderField id="saturation" label="Color" value={saturation} onChange={setSaturation} min={0} max={200} />
                <div className="grid grid-cols-2 gap-4">
                  <SliderField id="grayscale" label="Mono" value={grayscale} onChange={setGrayscale} max={100} />
                  <SliderField id="sepia" label="Sepia" value={sepia} onChange={setSepia} max={100} />
                </div>
                <SliderField id="hueRotate" label="Phase" value={hueRotate} onChange={setHueRotate} max={360} unit="°" />
                <SliderField id="blur" label="Optical" value={blur} onChange={setBlur} max={20} unit="px" />

                <details className="group mt-6">
                  <summary className="cursor-pointer py-2 text-[9px] font-black uppercase tracking-widest text-green-600/60 flex justify-between items-center">
                    Neural FX <span className="text-[10px]">▼</span>
                  </summary>
                  <div className="mt-4 space-y-6 pt-4 border-t border-white/5">
                    <SliderField id="vignetteIntensity" label="Vignette" value={vignetteIntensity} onChange={setVignetteIntensity} />
                    <div className="space-y-2">
                        <label className="text-[8px] font-black uppercase tracking-widest text-gray-500 ml-1">Vignette Hue</label>
                        <div className="flex gap-2">
                           <input type="color" value={vignetteColor} onChange={(e) => setVignetteColor(e.target.value)} className="w-12 h-10 p-0.5 bg-white/5 border border-white/10 rounded-xl" />
                           <input type="text" value={vignetteColorHexInput} onChange={handleVignetteColorHexChange} className="flex-grow min-w-0 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs" />
                           <Button onClick={handleRandomVignetteColor} variant="ghost" size="sm" className="border-white/10"><SparklesIcon className="w-4 h-4"/></Button>
                        </div>
                    </div>
                    <SliderField id="noiseAmount" label="Grain" value={noiseAmount} onChange={setNoiseAmount} />
                    <CheckboxField id="duotone" label="Duotone" checked={duotone} onChange={setDuotone} />
                    {duotone && (
                      <div className="grid grid-cols-2 gap-2 mt-4">
                        <div className="space-y-2">
                          <label className="text-[8px] font-black uppercase tracking-widest text-gray-500">Duo A</label>
                          <input type="color" value={duotoneColor1} onChange={(e) => setDuotoneColor1(e.target.value)} className="w-full h-10 p-0.5 bg-white/5 border border-white/10 rounded-xl" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[8px] font-black uppercase tracking-widest text-gray-500">Duo B</label>
                          <input type="color" value={duotoneColor2} onChange={(e) => setDuotoneColor2(e.target.value)} className="w-full h-10 p-0.5 bg-white/5 border border-white/10 rounded-xl" />
                        </div>
                      </div>
                    )}
                  </div>
                </details>
              </div>
            </section>

            {inputImageBase64 && (
              <section className="glass-card p-8 border-white/10 shadow-xl">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 mb-6 opacity-60">Signal Overlay</h3>
                <ImageUpload onImageUpload={handleOverlayImageUpload} label="Deploy Watermark" />
                {overlayImageBase64 && (
                  <div className="mt-8 space-y-4 pt-6 border-t border-white/5">
                    <SelectField id="overlayPosition" label="Position" value={overlayPosition} onChange={setOverlayPosition} options={overlayPositionOptions} />
                    <SliderField id="size" label="Scale" value={overlaySizePercent} onChange={setOverlaySizePercent} min={5} max={100} />
                    <SliderField id="opacity" label="Opacity" value={overlayOpacity*100} onChange={(v) => setOverlayOpacity(v/100)} />
                  </div>
                )}
              </section>
            )}
          </div>
        </div>
      </div>

      <PresetModals
        showSavePresetModal={showSavePresetModal} setShowSavePresetModal={setShowSavePresetModal}
        newPresetName={newPresetName} setNewPresetName={setNewPresetName}
        presetErrorMessage={presetErrorMessage} setPresetErrorMessage={setPresetErrorMessage}
        handleSavePreset={handleSavePreset}
        showLoadPresetModal={showLoadPresetModal} setShowLoadPresetModal={setShowLoadPresetModal}
        savedArtStylePresets={savedArtStylePresets} handleLoadPreset={handleLoadPreset}
        handleDeletePreset={handleDeletePreset}
        showImportExportModal={showImportExportModal} setShowImportExportModal={setShowImportExportModal}
        handleExportPresets={handleExportPresets} configToImportJson={configToImportJson}
        setConfigToImportJson={setConfigToImportJson} importPresetFileRef={importPresetFileRef}
        handleImportFileChange={handleImportFileChange} importPresetError={importPresetError}
        processPresetImport={processPresetImport}
      />
    </div>
  );
};

export default SongCoverArtTool;
