
import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { GeneratedImage, AppState } from '@/types';
import ImageUpload from '@/components/ImageUpload';
import Spinner from '@/components/Spinner';
import { addTextToImage, TextOptions, OverlayImageOptions, ImageFilterOptions, hexToRgb } from '@/utils/imageUtils';
import type { ToolProps } from '@/Layout'; // Import ToolProps for trackLocalEvent
import { fetchSunoClipById, resolveSunoUrlToPotentialSongId } from '@/services/sunoService';
import { fetchRiffusionSongData, extractRiffusionSongId } from '@/services/riffusionService';
import InputField from '@/components/forms/InputField';
import SelectField from '@/components/forms/SelectField';
import CheckboxField from '@/components/forms/CheckboxField';
import SliderField from '@/components/forms/SliderField';
import TextAreaField from '@/components/forms/TextAreaField';
import Button from '@/components/common/Button';


import {
  SparklesIcon, PaletteIcon, SaveIcon, LoadIcon, ConfigIcon, ImportIcon, RefreshIcon, ExportIcon
} from '@/components/SongCoverArt/Icons';

import {
  ExtendedTextOptions, ArtStyleSettings, ArtStylePreset, SAVED_PRESETS_LOCAL_STORAGE_KEY,
  TOOL_CATEGORY, FALLBACK_IMAGE_DATA_URI, availableFonts, textPositionOptions, overlayPositionOptions,
  relativeFontSizeOptions, textEffectPresets, overlayBlendModeOptions, textColorModeOptions,
  gradientDirectionOptions, textAlignOptions
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
      <header className="mb-8 md:mb-16 text-center pt-0 md:pt-8 px-4 animate-fadeIn">
        <h1 className="text-3xl sm:text-5xl md:text-7xl font-black uppercase tracking-tighter text-emerald-600 dark:text-emerald-500 leading-none italic drop-shadow-2xl mb-1 md:mb-4">Visual Synth</h1>
        <p className="mt-1 md:mt-6 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.4em] text-gray-500 dark:text-gray-400 max-w-2xl mx-auto opacity-60">
          High-Fidelity Cover Art • Cinematic Signal Processing
        </p>
      </header>

      <canvas ref={previewCanvasRef} style={{ display: 'none' }}></canvas>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* left Column: Identity & Source */}
        <div className="xl:col-span-3 space-y-8">
          <section className="glass-card p-8 border-white/10 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 blur-[40px] pointer-events-none"></div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-green-600 dark:text-green-500 mb-6">Source Signal</h3>
            
            <div className="space-y-6">
              <div className="relative group">
                <label htmlFor="songUrlInput" className="block text-[8px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2 ml-1">Remote Data Stream</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    id="songUrlInput"
                    value={songUrlInput}
                    onChange={(e) => setSongUrlInput(e.target.value)}
                    placeholder="Suno / Riffusion / Producer.AI URL"
                    className="flex-grow px-4 py-2 bg-white/5 dark:bg-black/20 border border-white/10 rounded-xl text-xs font-bold focus:ring-4 focus:ring-green-500/20 outline-none transition-all placeholder:opacity-30"
                    disabled={isLoading}
                  />
                  <Button
                    onClick={handleLoadFromUrl}
                    disabled={isLoading || !songUrlInput.trim()}
                    variant="primary"
                    size="xs"
                    className="font-black uppercase tracking-widest text-[8px] px-4 flex items-center justify-center"
                    backgroundColor="#8b5cf6"
                    startIcon={isLoading ? null : <RefreshIcon className="w-3 h-3" />}
                  >
                    {isLoading ? <Spinner size="w-3 h-3" color="text-white" /> : 'Sync'}
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-4 py-2">
                <div className="h-px flex-grow bg-white/5"></div>
                <span className="text-[8px] font-black uppercase tracking-widest text-gray-600">Manual Entry</span>
                <div className="h-px flex-grow bg-white/5"></div>
              </div>

              <div className="space-y-4">
                <InputField id="songName" label="Composition Title" value={songName} onChange={setSongName} placeholder="Neon Dreams" className="mb-0" disabled={isLoading} />
                <InputField id="artistTitle" label="Primary Artist" value={artistTitle} onChange={setArtistTitle} placeholder="The Matrix" className="mb-0" disabled={isLoading} />
                <InputField id="featuredArtistName" label="Neural Collaboration" value={featuredArtistName} onChange={setFeaturedArtistName} placeholder="Optional Guest" className="mb-0" disabled={isLoading} />
              </div>
            </div>
          </section>

          <section className="glass-card p-8 border-white/10 shadow-xl">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-green-600 dark:text-green-500 mb-6">Visual Core</h3>
            <ImageUpload onImageUpload={handleImageUpload} label="Deploy Main Canvas" />
            
            {inputImageBase64 && (
              <div className="mt-8 space-y-4 pt-6 border-t border-white/5">
                <h4 className="text-[9px] font-black uppercase tracking-widest text-gray-500 opacity-60">Master Adjustments</h4>
                <SliderField id="brightness" label="Luminance" value={brightness} onChange={(v) => { setBrightness(v); trackLocalEvent(TOOL_CATEGORY, 'filterChange', 'brightness', v); }} />
                <SliderField id="contrast" label="Dynamic Range" value={contrast} onChange={(v) => { setContrast(v); trackLocalEvent(TOOL_CATEGORY, 'filterChange', 'contrast', v); }} />
                <SliderField id="blur" label="Optical Blur" value={blur} onChange={(v) => { setBlur(v); trackLocalEvent(TOOL_CATEGORY, 'filterChange', 'blur', v); }} max={10} step={0.1} unit="px" />
                
                <details className="group mt-4" open={showAdvancedEffects}>
                  <summary className="cursor-pointer py-2 text-[9px] font-black uppercase tracking-widest text-green-600/60 dark:text-green-500/60 hover:text-green-500 transition-colors flex justify-between items-center" onClick={(e) => { e.preventDefault(); setShowAdvancedEffects(!showAdvancedEffects); }}>
                    Neural FX
                    <span className={`transform transition-transform duration-200 ${showAdvancedEffects ? 'rotate-180' : ''}`}>▼</span>
                  </summary>
                  <div className="mt-4 space-y-6 pl-4 border-l border-white/10">
                    <SliderField id="vignetteIntensity" label="Vignette" value={vignetteIntensity} onChange={setVignetteIntensity} min={0} max={100} unit="%" />
                    <SliderField id="noiseAmount" label="Grain" value={noiseAmount} onChange={setNoiseAmount} min={0} max={100} unit="%" />
                    <CheckboxField id="duotone" label="Neural Duotone" checked={duotone} onChange={setDuotone} />
                    {duotone && (
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <label className="text-[8px] font-black uppercase tracking-widest text-gray-500">Blacks</label>
                          <input type="color" value={duotoneColor1} onChange={(e) => setDuotoneColor1(e.target.value)} className="w-full h-8 bg-white/5 border border-white/10 rounded-lg cursor-pointer" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[8px] font-black uppercase tracking-widest text-gray-500">Whites</label>
                          <input type="color" value={duotoneColor2} onChange={(e) => setDuotoneColor2(e.target.value)} className="w-full h-8 bg-white/5 border border-white/10 rounded-lg cursor-pointer" />
                        </div>
                      </div>
                    )}
                  </div>
                </details>
              </div>
            )}
          </section>
        </div>

        {/* Center Column: Typography & Style */}
        <div className="xl:col-span-5 space-y-8">
          <section className="glass-card p-8 border-white/10 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/5 blur-[60px] pointer-events-none"></div>
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600 dark:text-blue-500">Geometric Typography</h3>
              <div className="flex gap-2">
                <Button onClick={() => setShowLoadPresetModal(true)} variant="ghost" size="xs" startIcon={<LoadIcon className="w-3 h-3" />} className="font-black uppercase tracking-widest text-[8px] border-white/10 flex items-center justify-center">Vault</Button>
                <Button onClick={() => setShowSavePresetModal(true)} variant="ghost" size="xs" startIcon={<SaveIcon className="w-3.5 h-3.5" />} className="font-black uppercase tracking-widest text-[8px] border-white/10 flex items-center justify-center">Commit</Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-6">
                <SelectField id="fontFamily" label="Font Vector" value={fontFamily} onChange={setFontFamily} options={availableFonts} />
                <SelectField id="selectedPreset" label="Aesthetic Preset" value={selectedPreset} onChange={(val) => applyTextPreset(val)} options={textEffectPresets} />
                
                <div className="space-y-2">
                  <label className="block text-[8px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 ml-1">Color Processing</label>
                  <div className="flex gap-2 p-1 bg-white/5 rounded-xl border border-white/5">
                    <Button 
                      onClick={() => setTextColorMode('solid')} 
                      variant="ghost" 
                      size="sm" 
                      className={`flex-1 py-2 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all ${textColorMode === 'solid' ? 'bg-white/10 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300 border-transparent'}`}
                    >
                      Solid
                    </Button>
                    <Button 
                      onClick={() => setTextColorMode('gradient')} 
                      variant="ghost" 
                      size="sm" 
                      className={`flex-1 py-2 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all ${textColorMode === 'gradient' ? 'bg-white/10 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300 border-transparent'}`}
                    >
                      Gradient
                    </Button>
                  </div>
                </div>

                {textColorMode === 'solid' ? (
                  <div className="space-y-2">
                    <label className="block text-[8px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 ml-1">Active Hue</label>
                    <div className="flex gap-2">
                      <input type="color" value={fontColor} onChange={(e) => setFontColor(e.target.value)} className="w-12 h-10 bg-white/5 border border-white/10 rounded-xl cursor-pointer" />
                      <input type="text" value={fontColorHexInput} onChange={handleFontColorHexChange} className="flex-grow px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-mono uppercase" />
                      <Button onClick={handleRandomFontColor} variant="ghost" size="sm" className="px-3 border-white/10"><SparklesIcon className="w-4 h-4"/></Button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[8px] font-black uppercase tracking-widest text-gray-500">Vector A</label>
                      <input type="color" value={gradientColor1} onChange={(e) => setGradientColor1(e.target.value)} className="w-full h-10 bg-white/5 border border-white/10 rounded-xl cursor-pointer" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[8px] font-black uppercase tracking-widest text-gray-500">Vector B</label>
                      <input type="color" value={gradientColor2} onChange={(e) => setGradientColor2(e.target.value)} className="w-full h-10 bg-white/5 border border-white/10 rounded-xl cursor-pointer" />
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <CheckboxField id="hasStroke" label="Edge Distortion (Stroke)" checked={hasStroke} onChange={setHasStroke} />
                {hasStroke && (
                  <div className="space-y-4 pl-4 border-l border-white/10">
                    <SliderField id="strokeThickness" label="Thickness" value={strokeThickness} onChange={(v) => setStrokeThickness(Math.max(0.1, v) || 1)} max={10} step={0.1} />
                    <input type="color" value={strokeColor} onChange={(e) => setStrokeColor(e.target.value)} className="w-full h-8 bg-white/5 border border-white/10 rounded-lg cursor-pointer" />
                  </div>
                )}

                <details className="group" open={showTextShadowOptions}>
                  <summary className="cursor-pointer py-2 text-[9px] font-black uppercase tracking-widest text-gray-500 hover:text-gray-300 transition-colors flex justify-between items-center" onClick={(e) => { e.preventDefault(); setShowTextShadowOptions(!showTextShadowOptions); }}>
                    Shadow Offset
                    <span className={`transform transition-transform duration-200 ${showTextShadowOptions ? 'rotate-180' : ''}`}>▼</span>
                  </summary>
                  <div className="mt-4 space-y-4 pl-4 border-l border-white/10">
                    <CheckboxField id="hasTextShadow" label="Enable Depth" checked={hasTextShadow} onChange={setHasTextShadow} />
                    {hasTextShadow && (
                      <>
                        <SliderField id="textShadowBlur" label="Softness" value={textShadowBlur} onChange={setTextShadowBlur} max={20} />
                        <div className="grid grid-cols-2 gap-2">
                          <InputField id="textShadowOffsetX" label="X Pos" type="number" value={textShadowOffsetX} onChange={(v) => setTextShadowOffsetX(parseInt(v) || 0)} className="mb-0" />
                          <InputField id="textShadowOffsetY" label="Y Pos" type="number" value={textShadowOffsetY} onChange={(v) => setTextShadowOffsetY(parseInt(v) || 0)} className="mb-0" />
                        </div>
                      </>
                    )}
                  </div>
                </details>
              </div>
            </div>

            <div className="mt-10 pt-8 border-t border-white/5 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <h4 className="text-[9px] font-black uppercase tracking-widest text-gray-500 opacity-60">Title Alignment</h4>
                  <SelectField id="songNamePosition" label="Title Position" value={songNamePosition} onChange={setSongNamePosition} options={textPositionOptions} />
                  <div className="grid grid-cols-3 gap-2">
                    <InputField id="songNameXOffset" label="X" type="number" value={songNameXOffset} onChange={(v) => setSongNameXOffset(parseInt(v) || 0)} className="mb-0" />
                    <InputField id="songNameYOffset" label="Y" type="number" value={songNameYOffset} onChange={(v) => setSongNameYOffset(parseInt(v) || 0)} className="mb-0" />
                    <InputField id="songNameRotation" label="Rot" type="number" value={songNameRotation} onChange={(v) => setSongNameRotation(parseInt(v) || 0)} className="mb-0" />
                  </div>
                  <SliderField id="songNameLetterSpacing" label="Spacing" value={songNameLetterSpacing} onChange={setSongNameLetterSpacing} min={-5} max={50} step={0.5} unit="px" />
                </div>

                <div className="space-y-6">
                  <h4 className="text-[9px] font-black uppercase tracking-widest text-gray-500 opacity-60">Artist Alignment</h4>
                  <SelectField id="artistNamePosition" label="Artist Position" value={artistNamePosition} onChange={setArtistNamePosition} options={textPositionOptions} />
                  <div className="grid grid-cols-3 gap-2">
                    <InputField id="artistNameXOffset" label="X" type="number" value={artistNameXOffset} onChange={(v) => setArtistNameXOffset(parseInt(v) || 0)} className="mb-0" />
                    <InputField id="artistNameYOffset" label="Y" type="number" value={artistNameYOffset} onChange={(v) => setArtistNameYOffset(parseInt(v) || 0)} className="mb-0" />
                    <InputField id="artistNameRotation" label="Rot" type="number" value={artistNameRotation} onChange={(v) => setArtistNameRotation(parseInt(v) || 0)} className="mb-0" />
                  </div>
                  <SliderField id="artistNameLetterSpacing" label="Spacing" value={artistNameLetterSpacing} onChange={setArtistNameLetterSpacing} min={-5} max={50} step={0.5} unit="px" />
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Preview & Process */}
        <div className="xl:col-span-4 space-y-8">
          <section className="glass-card p-8 border-white/10 shadow-2xl relative overflow-hidden h-full flex flex-col">
            <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 blur-[100px] pointer-events-none"></div>
            
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-green-600 dark:text-green-500">Processed Output</h3>
              {processedImage && (
                  <Button onClick={() => {}} variant="ghost" size="xs" startIcon={<ExportIcon className="w-3.5 h-3.5" />} className="px-4 border-white/10 flex items-center justify-center">
                    <a href={`data:image/png;base64,${processedImage.base64}`} download={`${songName || 'cover'}.png`} className="font-black uppercase tracking-widest text-[8px]">Export</a>
                  </Button>
              )}
            </div>

            <div className="flex-grow flex flex-col justify-center">
              <div className="aspect-square w-full bg-slate-200/50 dark:bg-black/40 rounded-3xl overflow-hidden border border-gray-200 dark:border-white/10 shadow-inner relative group">
                {processedImage ? (
                  <img src={`data:image/png;base64,${processedImage.base64}`} alt="Final Output" className="w-full h-full object-contain" />
                ) : filteredPreviewUrl ? (
                  <img src={filteredPreviewUrl} alt="Live Preview" className="w-full h-full object-contain" />
                ) : (
                  <div className="w-full h-full flex flex-row items-center justify-center p-8 gap-6 text-gray-400 dark:text-gray-600">
                    <div className="w-16 h-16 border-2 border-dashed border-gray-300 dark:border-white/10 rounded-2xl flex items-center justify-center shrink-0">
                      <ConfigIcon className="w-6 h-6 opacity-40 dark:opacity-20" />
                    </div>
                    <div className="text-left">
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-700 dark:text-gray-400">System Idle</p>
                      <p className="text-[8px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-500 opacity-60 mt-1">Waiting for Signal Canvas</p>
                    </div>
                  </div>
                )}
                
                {isLoading && (
                  <div className="absolute inset-0 bg-black/80 backdrop-blur-xl flex flex-row items-center justify-center gap-8 p-12 text-left animate-in fade-in duration-500 z-50">
                    <Spinner size="w-12 h-12" color="text-green-500" />
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-green-500 animate-pulse mb-1">In Progress</p>
                      <p className="text-xs font-bold uppercase tracking-widest text-white/60">{progressMessage || 'Processing Signal...'}</p>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="absolute bottom-6 left-6 right-6 p-4 bg-red-500/20 backdrop-blur-xl border border-red-500/30 rounded-2xl animate-in slide-in-from-bottom-4 duration-500">
                    <p className="text-[10px] font-black uppercase tracking-widest text-red-400 text-center">{error}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-10 space-y-4">
              <Button
                onClick={handleAddTextAndOverlayToImage}
                disabled={isLoading || !canSubmit}
                variant="primary"
                size="lg"
                className="w-full font-black uppercase tracking-[0.3em] text-xs h-16 shadow-green-500/20 shadow-2xl flex items-center justify-center"
                backgroundColor="#22c55e"
                startIcon={isLoading ? null : <SparklesIcon className="w-5 h-5" />}
              >
                {isLoading ? 'Decrypting...' : 'Synthesize Master'}
              </Button>
              
              {presetStatusMessage && (
                <p className="text-[9px] font-black uppercase tracking-widest text-green-500/60 text-center animate-pulse">
                  {presetStatusMessage}
                </p>
              )}
            </div>
          </section>

          {inputImageBase64 && (
            <section className="glass-card p-8 border-white/10 shadow-xl">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 mb-6 opacity-60">Signal Overlay</h3>
              <ImageUpload onImageUpload={handleOverlayImageUpload} label="Deploy Watermark" />
              {overlayImageBase64 && (
                <div className="mt-8 space-y-6 pt-6 border-t border-white/5">
                  <SelectField id="overlayPosition" label="Grid Position" value={overlayPosition} onChange={setOverlayPosition} options={overlayPositionOptions} />
                  <SliderField id="overlaySize" label="Scale Factor" value={overlaySizePercent} onChange={setOverlaySizePercent} min={5} max={100} unit="%" />
                  <SliderField id="overlayOpacity" label="Intensity" value={overlayOpacity * 100} onChange={(v) => setOverlayOpacity(v / 100)} min={0} max={100} unit="%" />
                  <SelectField id="overlayBlendMode" label="Neural Blend" value={overlayBlendMode} onChange={setOverlayBlendMode} options={overlayBlendModeOptions} />
                </div>
              )}
            </section>
          )}
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
