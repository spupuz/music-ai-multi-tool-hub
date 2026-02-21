
export interface TextOptions {
  fontFamily: string;
  fontColor: string;
  hasStroke: boolean;
  strokeThickness: number;
  strokeColor: string;
  songNamePosition: string; 
  artistNamePosition: string; 
  relativeFontSize: string; 
  featuredArtistName?: string;
  textColorMode?: 'solid' | 'gradient';
  gradientColor1?: string;
  gradientColor2?: string;
  gradientDirection?: string;
  // New fields for offsets and rotation
  songNameXOffset: number;
  songNameYOffset: number;
  songNameRotation: number; 
  artistNameXOffset: number;
  artistNameYOffset: number;
  artistNameRotation: number;
  // New fields for text shadow
  hasTextShadow?: boolean;
  textShadowColor?: string;
  textShadowBlur?: number;
  textShadowOffsetX?: number;
  textShadowOffsetY?: number;
  // New fields for explicit text alignment
  songNameTextAlign?: CanvasTextAlign | 'auto';
  artistNameTextAlign?: CanvasTextAlign | 'auto';
  // New fields for letter spacing
  songNameLetterSpacing?: number; // in px
  artistNameLetterSpacing?: number; // in px
}

export interface ImageFilterOptions {
  brightness: number; 
  contrast: number;   
  saturation: number; 
  grayscale: number;  
  sepia: number;      
  hueRotate: number;  
  blur: number;       
  // New advanced effects
  vignetteIntensity: number; // 0-100
  vignetteColor: string;
  noiseAmount: number; // 0-100
  duotone: boolean;
  duotoneColor1: string;
  duotoneColor2: string;
}

export interface OverlayImageOptions {
  base64: string;
  position: string; 
  sizePercent: number; 
  opacity: number; 
  blendMode: string; 
}

// --- General Color Utilities ---
export const isValidHexColor = (color: string): boolean => /^#?([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(color);

export const normalizeHexColor = (color: string): string => {
  let newColor = color.trim();
  if (!newColor.startsWith('#')) newColor = '#' + newColor;
  if (newColor.length === 4) { // #RGB to #RRGGBB
    newColor = `#${newColor[1]}${newColor[1]}${newColor[2]}${newColor[2]}${newColor[3]}${newColor[3]}`;
  }
  return newColor.toUpperCase();
};

export const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
    const normalized = normalizeHexColor(hex); // Ensure # is present and correct length
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    const fullHex = normalized.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex);
    return result ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) } : null;
};

export const getLuminance = (r: number, g: number, b: number): number => {
    const a = [r, g, b].map(v => {
        v /= 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
};

export const calculateContrastRatio = (color1Hex: string, color2Hex: string): number => {
    const rgb1 = hexToRgb(color1Hex);
    const rgb2 = hexToRgb(color2Hex);
    if (!rgb1 || !rgb2) return 1; // Error case, assume poor contrast

    const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
    const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);

    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    return (brightest + 0.05) / (darkest + 0.05);
};

export const MIN_CONTRAST_RATIO = 4.5; // WCAG AA for normal text

export const getAdjustedTextColor = (backgroundColorHex: string, preferredTextColorHex: string): string => {
    if (!isValidHexColor(backgroundColorHex) || !isValidHexColor(preferredTextColorHex)) {
        return '#FFFFFF'; // Default to white if inputs are invalid
    }
    const contrastWithPreferred = calculateContrastRatio(backgroundColorHex, preferredTextColorHex);
    if (contrastWithPreferred >= MIN_CONTRAST_RATIO) {
        return normalizeHexColor(preferredTextColorHex);
    }
    // Preferred color doesn't have enough contrast, try black or white
    const contrastWithWhite = calculateContrastRatio(backgroundColorHex, '#FFFFFF');
    const contrastWithBlack = calculateContrastRatio(backgroundColorHex, '#000000');

    return contrastWithWhite >= contrastWithBlack ? '#FFFFFF' : '#000000';
};

export const lightenDarkenColor = (hex: string, percent: number): string => {
    if (!isValidHexColor(hex)) return hex; // Return original if invalid
    const normalizedHex = normalizeHexColor(hex).replace('#', '');
    const num = parseInt(normalizedHex, 16);
    let r = (num >> 16) + percent;
    if (r > 255) r = 255; else if (r < 0) r = 0;
    let b = ((num >> 8) & 0x00FF) + percent;
    if (b > 255) b = 255; else if (b < 0) b = 0;
    let g = (num & 0x0000FF) + percent;
    if (g > 255) g = 255; else if (g < 0) g = 0;
    const toHex = (c: number) => c.toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(b)}${toHex(g)}`; // Original was R G B in output, common is R B G. Correcting.
};
// --- End General Color Utilities ---


function splitTextForCanvas(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  font: string 
): string[] {
  ctx.font = font; 
  const trimmedText = text.trim();
  const textWidth = ctx.measureText(trimmedText).width;

  if (textWidth <= maxWidth || trimmedText.indexOf(' ') === -1) {
    return [trimmedText];
  }

  let bestSplitIndex = -1;
  let minDifferenceToCenter = Infinity;

  for (let i = 0; i < trimmedText.length; i++) {
    if (trimmedText[i] === ' ') {
      const difference = Math.abs(i - trimmedText.length / 2);
      if (difference < minDifferenceToCenter) {
        minDifferenceToCenter = difference;
        bestSplitIndex = i;
      }
    }
  }

  if (bestSplitIndex !== -1) {
    const line1 = trimmedText.substring(0, bestSplitIndex).trim();
    const line2 = trimmedText.substring(bestSplitIndex + 1).trim();
    
    if (line1 && line2) {
        return [line1, line2];
    } else if (line1) {
        return [line1];
    } else if (line2) {
        return [line2];
    }
  }
  
  return [trimmedText];
}

function getNumericFontSize(font: string): number {
    const fontSizeMatch = font.match(/(\d+)px/);
    return fontSizeMatch ? parseInt(fontSizeMatch[1], 10) : 16; 
}


function drawTextWithPosition(
  ctx: CanvasRenderingContext2D,
  lines: string[],
  font: string,
  x: number, 
  y: number, 
  lineHeight: number,
  textAlign: CanvasTextAlign,
  textBaseline: CanvasTextBaseline,
  textOptions: Pick<TextOptions, 'fontColor' | 'hasStroke' | 'strokeColor' | 'strokeThickness' | 'textColorMode' | 'gradientColor1' | 'gradientColor2' | 'gradientDirection' | 'hasTextShadow' | 'textShadowColor' | 'textShadowBlur' | 'textShadowOffsetX' | 'textShadowOffsetY'>,
  rotationDegrees: number
) {
  ctx.font = font; // letterSpacing is already set on ctx by caller
  ctx.textAlign = textAlign;
  ctx.textBaseline = textBaseline;

  let textBlockWidth = 0;
  lines.forEach(line => {
    textBlockWidth = Math.max(textBlockWidth, ctx.measureText(line).width);
  });
  const textBlockHeight = lines.length * lineHeight;
  
  let blockX = x;
  let blockY = y;

  if (textAlign === 'center') blockX = x - textBlockWidth / 2;
  else if (textAlign === 'right') blockX = x - textBlockWidth;

  if (textBaseline === 'bottom') blockY = y - textBlockHeight;
  else if (textBaseline === 'middle') blockY = y - textBlockHeight / 2;
  else if (textBaseline === 'alphabetic') { 
      const fontSize = getNumericFontSize(font);
      blockY = y - fontSize * 0.8; 
  }

  ctx.save();

  if (rotationDegrees !== 0) {
    const rotationCenterX = x;
    const rotationCenterY = y;
    ctx.translate(rotationCenterX, rotationCenterY);
    ctx.rotate(rotationDegrees * Math.PI / 180);
    ctx.translate(-rotationCenterX, -rotationCenterY);
  }

  // Apply text shadow if enabled
  if (textOptions.hasTextShadow) {
    ctx.shadowColor = textOptions.textShadowColor || '#000000';
    ctx.shadowBlur = textOptions.textShadowBlur || 0;
    ctx.shadowOffsetX = textOptions.textShadowOffsetX || 0;
    ctx.shadowOffsetY = textOptions.textShadowOffsetY || 0;
  }

  if (textOptions.textColorMode === 'gradient' && textOptions.gradientColor1 && textOptions.gradientColor2 && textOptions.gradientDirection) {
    let gradX0 = blockX, gradY0 = blockY, gradX1 = blockX, gradY1 = blockY;
    switch (textOptions.gradientDirection) {
        case 'top-to-bottom': gradY1 = blockY + textBlockHeight; break;
        case 'bottom-to-top': gradY0 = blockY + textBlockHeight; break;
        case 'left-to-right': gradX1 = blockX + textBlockWidth; break;
        case 'right-to-left': gradX0 = blockX + textBlockWidth; break;
        case 'top-left-to-bottom-right': gradX1 = blockX + textBlockWidth; gradY1 = blockY + textBlockHeight; break;
        case 'bottom-left-to-top-right': gradY0 = blockY + textBlockHeight; gradX1 = blockX + textBlockWidth; break;
        case 'top-right-to-bottom-left': gradX0 = blockX + textBlockWidth; gradY1 = blockY + textBlockHeight; break;
        case 'bottom-right-to-top-left': gradX0 = blockX + textBlockWidth; gradY0 = blockY + textBlockHeight; break;
        default: gradY1 = blockY + textBlockHeight; 
    }
    const gradient = ctx.createLinearGradient(gradX0, gradY0, gradX1, gradY1);
    gradient.addColorStop(0, textOptions.gradientColor1);
    gradient.addColorStop(1, textOptions.gradientColor2);
    ctx.fillStyle = gradient;
  } else {
    ctx.fillStyle = textOptions.fontColor;
  }

  lines.forEach((line, index) => {
    let lineY = y; 
    if (textBaseline === 'bottom') {
        lineY = y - (lines.length - 1 - index) * lineHeight;
    } else if (textBaseline === 'top') {
        lineY = y + index * lineHeight;
    } else if (textBaseline === 'middle') {
        lineY = y - (textBlockHeight / 2) + (index * lineHeight) + (lineHeight / 2) - (getNumericFontSize(font) * 0.1);
    } else { 
        lineY = y + index * lineHeight;
    }
    
    ctx.fillText(line, x, lineY); // Fill text (shadow applies here)
    
    if (textOptions.hasStroke) {
        // Temporarily disable shadow for stroke to prevent double shadow or shadow on stroke
        if(textOptions.hasTextShadow) {
            ctx.shadowColor = 'transparent';
            ctx.shadowBlur = 0;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
        }
        ctx.strokeStyle = textOptions.strokeColor;
        ctx.lineWidth = Math.max(0.5, textOptions.strokeThickness);
        ctx.strokeText(line, x, lineY);
        // Re-enable shadow if it was on, for subsequent text elements IF any were drawn in same call (not typical here)
        if(textOptions.hasTextShadow) {
            ctx.shadowColor = textOptions.textShadowColor || '#000000';
            ctx.shadowBlur = textOptions.textShadowBlur || 0;
            ctx.shadowOffsetX = textOptions.textShadowOffsetX || 0;
            ctx.shadowOffsetY = textOptions.textShadowOffsetY || 0;
        }
    }
  });
  
  // Reset shadow properties after drawing this text block to not affect other elements
  if (textOptions.hasTextShadow) {
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
  }

  ctx.restore();
}


export const addTextToImage = (
  base64Image: string,
  songName: string,
  artistTitle: string,
  textOptions: TextOptions,
  imageFilters?: ImageFilterOptions,
  overlayOptions?: OverlayImageOptions
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const mainImage = new Image();
    mainImage.crossOrigin = 'anonymous';
    
    const processImages = (loadedOverlayImage: HTMLImageElement | null) => {
        const canvas = document.createElement('canvas');
        canvas.width = mainImage.width;
        canvas.height = mainImage.height;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });

        if (!ctx) {
            return reject(new Error('Failed to get canvas 2D context.'));
        }

        // 1. Apply CSS-like filters
        if (imageFilters) {
            let filterString = '';
            if (imageFilters.brightness !== 100) filterString += `brightness(${imageFilters.brightness}%) `;
            if (imageFilters.contrast !== 100) filterString += `contrast(${imageFilters.contrast}%) `;
            if (imageFilters.saturation !== 100) filterString += `saturate(${imageFilters.saturation}%) `;
            if (imageFilters.grayscale !== 0) filterString += `grayscale(${imageFilters.grayscale}%) `;
            if (imageFilters.sepia !== 0) filterString += `sepia(${imageFilters.sepia}%) `;
            if (imageFilters.hueRotate !== 0) filterString += `hue-rotate(${imageFilters.hueRotate}deg) `;
            if (imageFilters.blur !== 0) filterString += `blur(${imageFilters.blur}px) `;
            
            if (filterString.trim() !== '') {
              ctx.filter = filterString.trim();
            }
        }
        
        // 2. Draw the image with filters
        ctx.drawImage(mainImage, 0, 0);
        ctx.filter = 'none'; // Reset for subsequent drawings

        // 3. Pixel manipulation for Duotone and Noise
        if (imageFilters && (imageFilters.duotone || imageFilters.noiseAmount > 0)) {
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            const duotoneColor1RGB = imageFilters.duotone ? hexToRgb(imageFilters.duotoneColor1) : null;
            const duotoneColor2RGB = imageFilters.duotone ? hexToRgb(imageFilters.duotoneColor2) : null;

            for (let i = 0; i < data.length; i += 4) {
              const r = data[i], g = data[i + 1], b = data[i + 2];
              
              if (imageFilters.duotone && duotoneColor1RGB && duotoneColor2RGB) {
                const gray = 0.299 * r + 0.587 * g + 0.114 * b;
                const ratio = gray / 255;
                data[i] = duotoneColor1RGB.r + (duotoneColor2RGB.r - duotoneColor1RGB.r) * ratio;
                data[i+1] = duotoneColor1RGB.g + (duotoneColor2RGB.g - duotoneColor1RGB.g) * ratio;
                data[i+2] = duotoneColor1RGB.b + (duotoneColor2RGB.b - duotoneColor1RGB.b) * ratio;
              }
              
              if (imageFilters.noiseAmount > 0) {
                const noise = (Math.random() - 0.5) * (imageFilters.noiseAmount / 100) * 255;
                data[i] = Math.max(0, Math.min(255, data[i] + noise));
                data[i+1] = Math.max(0, Math.min(255, data[i+1] + noise));
                data[i+2] = Math.max(0, Math.min(255, data[i+2] + noise));
              }
            }
            ctx.putImageData(imageData, 0, 0);
        }

        // 4. Apply Vignette overlay
        if (imageFilters && imageFilters.vignetteIntensity > 0) {
            ctx.save();
            const outerRadius = Math.sqrt(Math.pow(canvas.width / 2, 2) + Math.pow(canvas.height / 2, 2));
            const gradient = ctx.createRadialGradient(
                canvas.width / 2, canvas.height / 2, 0,
                canvas.width / 2, canvas.height / 2, outerRadius
            );
            const intensity = imageFilters.vignetteIntensity / 100;
            const vignetteRgb = hexToRgb(imageFilters.vignetteColor) || {r:0, g:0, b:0};
            gradient.addColorStop(0.3, `rgba(${vignetteRgb.r},${vignetteRgb.g},${vignetteRgb.b},0)`);
            gradient.addColorStop(1, `rgba(${vignetteRgb.r},${vignetteRgb.g},${vignetteRgb.b},${intensity})`);
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.restore();
        }


        // 5. Draw overlay image
        if (loadedOverlayImage && overlayOptions) {
            const mainImageSmallerDim = Math.min(mainImage.width, mainImage.height);
            const overlayTargetSize = mainImageSmallerDim * (overlayOptions.sizePercent / 100);
            let overlayW = overlayTargetSize; let overlayH = overlayTargetSize;
            const aspectRatio = loadedOverlayImage.width / loadedOverlayImage.height;
            if (loadedOverlayImage.width > loadedOverlayImage.height) overlayH = overlayW / aspectRatio;
            else overlayW = overlayH * aspectRatio;
            let overlayX = 0; let overlayY = 0; const margin = mainImage.width * 0.02; 
            switch (overlayOptions.position) {
                case 'top-left': overlayX = margin; overlayY = margin; break;
                case 'top-right': overlayX = mainImage.width - overlayW - margin; overlayY = margin; break;
                case 'bottom-left': overlayX = margin; overlayY = mainImage.height - overlayH - margin; break;
                case 'bottom-right': overlayX = mainImage.width - overlayW - margin; overlayY = mainImage.height - overlayH - margin; break;
                case 'center': overlayX = (mainImage.width - overlayW) / 2; overlayY = (mainImage.height - overlayH) / 2; break;
                default: overlayX = mainImage.width - overlayW - margin; overlayY = mainImage.height - overlayH - margin; 
            }
            ctx.globalAlpha = overlayOptions.opacity;
            if (overlayOptions.blendMode) ctx.globalCompositeOperation = overlayOptions.blendMode as GlobalCompositeOperation;
            ctx.drawImage(loadedOverlayImage, overlayX, overlayY, overlayW, overlayH);
            ctx.globalAlpha = 1.0; ctx.globalCompositeOperation = 'source-over'; 
        }
        
        // 6. Draw Text
        let fontSizeMultiplier = 1.0;
        switch (textOptions.relativeFontSize) {
            case 'tiny': fontSizeMultiplier = 0.6; break; case 'xsmall': fontSizeMultiplier = 0.7; break;
            case 'small': fontSizeMultiplier = 0.8; break; case 'medium': fontSizeMultiplier = 1.0; break;
            case 'large': fontSizeMultiplier = 1.2; break; case 'xlarge': fontSizeMultiplier = 1.5; break;
            case 'huge': fontSizeMultiplier = 1.8; break; case 'giant': fontSizeMultiplier = 2.2; break;
            default: fontSizeMultiplier = 1.0;
        }

        const maxWidth = canvas.width * 0.85; 
        const baseFontSizeForCalc = Math.max(20, Math.min(mainImage.width / 11, mainImage.height / 9)) * fontSizeMultiplier; 
        const textMargin = baseFontSizeForCalc * 0.5 / fontSizeMultiplier; 

        const commonTextDrawOptions = {
            fontColor: textOptions.fontColor, hasStroke: textOptions.hasStroke,
            strokeColor: textOptions.strokeColor, strokeThickness: textOptions.strokeThickness,
            textColorMode: textOptions.textColorMode, gradientColor1: textOptions.gradientColor1,
            gradientColor2: textOptions.gradientColor2, gradientDirection: textOptions.gradientDirection,
            hasTextShadow: textOptions.hasTextShadow, textShadowColor: textOptions.textShadowColor,
            textShadowBlur: textOptions.textShadowBlur, textShadowOffsetX: textOptions.textShadowOffsetX,
            textShadowOffsetY: textOptions.textShadowOffsetY,
        };

        // Artist Name
        ctx.letterSpacing = `${textOptions.artistNameLetterSpacing || 0}px`;
        const artistFontSize = baseFontSizeForCalc * 0.9;
        const artistFont = `bold ${artistFontSize}px "${textOptions.fontFamily}"`;
        const artistLineHeight = artistFontSize * 1.15;
        const artistLines = splitTextForCanvas(ctx, artistTitle, maxWidth, artistFont);
        
        let ftArtistLines: string[] = []; let ftArtistFont = ''; let ftArtistLineHeight = 0;
        const ftArtistGap = artistLineHeight * 0.15;
        if (textOptions.featuredArtistName) {
            // Letter spacing for featured artist name could also be controlled, 
            // but for now, it will inherit the artistNameLetterSpacing or be 0px if artistNameLetterSpacing is also 0.
            // For simplicity, not adding separate controls for featured artist letter spacing yet.
            const ftArtistText = `ft. @${textOptions.featuredArtistName}`;
            const ftArtistFontSize = artistFontSize * 0.75;
            ftArtistFont = `italic bold ${ftArtistFontSize}px "${textOptions.fontFamily}"`;
            ftArtistLineHeight = ftArtistFontSize * 1.15;
            ftArtistLines = splitTextForCanvas(ctx, ftArtistText, maxWidth * 0.8, ftArtistFont);
        }

        let artistBaseX = 0, artistBaseY = 0;
        let artistTextAlignDefault: CanvasTextAlign = 'center'; let artistTextBaseline: CanvasTextBaseline = 'top';
        switch (textOptions.artistNamePosition) {
            case 'top-left': artistBaseX = textMargin; artistBaseY = textMargin; artistTextAlignDefault = 'left'; artistTextBaseline = 'top'; break;
            case 'top-center': artistBaseX = canvas.width / 2; artistBaseY = textMargin; artistTextAlignDefault = 'center'; artistTextBaseline = 'top'; break;
            case 'top-right': artistBaseX = canvas.width - textMargin; artistBaseY = textMargin; artistTextAlignDefault = 'right'; artistTextBaseline = 'top'; break;
            case 'middle-left': artistBaseX = textMargin; artistBaseY = canvas.height / 2; artistTextAlignDefault = 'left'; artistTextBaseline = 'middle'; break;
            case 'middle-center': artistBaseX = canvas.width / 2; artistBaseY = canvas.height / 2; artistTextAlignDefault = 'center'; artistTextBaseline = 'middle'; break;
            case 'middle-right': artistBaseX = canvas.width - textMargin; artistBaseY = canvas.height / 2; artistTextAlignDefault = 'right'; artistTextBaseline = 'middle'; break;
            case 'bottom-left': artistBaseX = textMargin; artistBaseY = canvas.height - textMargin; artistTextAlignDefault = 'left'; artistTextBaseline = 'bottom'; break;
            case 'bottom-center': artistBaseX = canvas.width / 2; artistBaseY = canvas.height - textMargin; artistTextAlignDefault = 'center'; artistTextBaseline = 'bottom'; break;
            case 'bottom-right': artistBaseX = canvas.width - textMargin; artistBaseY = canvas.height - textMargin; artistTextAlignDefault = 'right'; artistTextBaseline = 'bottom'; break;
            default: artistBaseX = canvas.width / 2; artistBaseY = textMargin; artistTextAlignDefault = 'center'; artistTextBaseline = 'top';
        }
        const artistX = artistBaseX + (textOptions.artistNameXOffset || 0);
        const artistY = artistBaseY + (textOptions.artistNameYOffset || 0);
        const artistTextAlignActual = (textOptions.artistNameTextAlign && textOptions.artistNameTextAlign !== 'auto') ? textOptions.artistNameTextAlign : artistTextAlignDefault;

        // Song Name
        ctx.letterSpacing = `${textOptions.songNameLetterSpacing || 0}px`;
        const songFontSize = baseFontSizeForCalc * 1.1; 
        const songFont = `bold ${songFontSize}px "${textOptions.fontFamily}"`;
        const songLineHeight = songFontSize * 1.15;
        const songLines = splitTextForCanvas(ctx, songName, maxWidth, songFont);

        let songBaseX = 0, songBaseY = 0;
        let songTextAlignDefault: CanvasTextAlign = 'center'; let songTextBaseline: CanvasTextBaseline = 'bottom';
        switch (textOptions.songNamePosition) {
            case 'top-left': songBaseX = textMargin; songBaseY = textMargin; songTextAlignDefault = 'left'; songTextBaseline = 'top'; break;
            case 'top-center': songBaseX = canvas.width / 2; songBaseY = textMargin; songTextAlignDefault = 'center'; songTextBaseline = 'top'; break;
            case 'top-right': songBaseX = canvas.width - textMargin; songBaseY = textMargin; songTextAlignDefault = 'right'; songTextBaseline = 'top'; break;
            case 'middle-left': songBaseX = textMargin; songBaseY = canvas.height / 2; songTextAlignDefault = 'left'; songTextBaseline = 'middle'; break;
            case 'middle-center': songBaseX = canvas.width / 2; songBaseY = canvas.height / 2; songTextAlignDefault = 'center'; songTextBaseline = 'middle'; break;
            case 'middle-right': songBaseX = canvas.width - textMargin; songBaseY = canvas.height / 2; songTextAlignDefault = 'right'; songTextBaseline = 'middle'; break;
            case 'bottom-left': songBaseX = textMargin; songBaseY = canvas.height - textMargin; songTextAlignDefault = 'left'; songTextBaseline = 'bottom'; break;
            case 'bottom-center': songBaseX = canvas.width / 2; songBaseY = canvas.height - textMargin; songTextAlignDefault = 'center'; songTextBaseline = 'bottom'; break;
            case 'bottom-right': songBaseX = canvas.width - textMargin; songBaseY = canvas.height - textMargin; songTextAlignDefault = 'right'; songTextBaseline = 'bottom'; break;
            default: songBaseX = canvas.width / 2; songBaseY = canvas.height - textMargin; songTextAlignDefault = 'center'; songTextBaseline = 'bottom';
        }
        const songX = songBaseX + (textOptions.songNameXOffset || 0);
        const songY = songBaseY + (textOptions.songNameYOffset || 0);
        const songTextAlignActual = (textOptions.songNameTextAlign && textOptions.songNameTextAlign !== 'auto') ? textOptions.songNameTextAlign : songTextAlignDefault;
        
        // Draw Artist, then Song
        // Temporarily set letter spacing for Artist name before drawing
        ctx.letterSpacing = `${textOptions.artistNameLetterSpacing || 0}px`;
        if (textOptions.artistNamePosition === 'middle-center' && textOptions.songNamePosition === 'middle-center' && 
            textOptions.artistNameXOffset === 0 && textOptions.artistNameYOffset === 0 && 
            textOptions.songNameXOffset === 0 && textOptions.songNameYOffset === 0 &&
            textOptions.artistNameRotation === 0 && textOptions.songNameRotation === 0 &&
            (!textOptions.artistNameTextAlign || textOptions.artistNameTextAlign === 'auto' || textOptions.artistNameTextAlign === 'center') &&
            (!textOptions.songNameTextAlign || textOptions.songNameTextAlign === 'auto' || textOptions.songNameTextAlign === 'center')
          ) { 
            const mainArtistBlockHeight = artistLines.length * artistLineHeight;
            const ftArtistBlockHeight = textOptions.featuredArtistName ? (ftArtistLines.length * ftArtistLineHeight) : 0;
            const actualFtArtistGap = textOptions.featuredArtistName ? ftArtistGap : 0;
            const totalArtistBlockActualHeight = mainArtistBlockHeight + (textOptions.featuredArtistName ? actualFtArtistGap + ftArtistBlockHeight : 0);
            
            // Song block measurements need song's letter spacing
            const originalCtxLetterSpacing = ctx.letterSpacing;
            ctx.letterSpacing = `${textOptions.songNameLetterSpacing || 0}px`;
            const songBlockActualHeight = songLines.length * songLineHeight; 
            ctx.letterSpacing = originalCtxLetterSpacing; // Restore for artist drawing

            const verticalGapBetweenBlocks = artistLineHeight * 0.3; 
            const totalCombinedHeight = totalArtistBlockActualHeight + songBlockActualHeight + verticalGapBetweenBlocks;
            const combinedBlockTopY = canvas.height / 2 - totalCombinedHeight / 2;
            const artistRecalcY = combinedBlockTopY; 
            const artistTextBaselineForCenteredStack: CanvasTextBaseline = 'top'; 
            const songRecalcY = combinedBlockTopY + totalArtistBlockActualHeight + verticalGapBetweenBlocks;
            const songTextBaselineForCenteredStack: CanvasTextBaseline = 'top'; 

            // Draw Artist (its letter spacing is already set)
            drawTextWithPosition(ctx, artistLines, artistFont, artistX, artistRecalcY, artistLineHeight, artistTextAlignActual, artistTextBaselineForCenteredStack, commonTextDrawOptions, textOptions.artistNameRotation || 0);
            if (textOptions.featuredArtistName && ftArtistLines.length > 0) {
                 let featuredArtistYRecalc = artistRecalcY + (artistLines.length * artistLineHeight) + ftArtistGap;
                 drawTextWithPosition(ctx, ftArtistLines, ftArtistFont, artistX, featuredArtistYRecalc, ftArtistLineHeight, artistTextAlignActual, 'top', commonTextDrawOptions, textOptions.artistNameRotation || 0);
            }
            
            // Set letter spacing for Song name before drawing
            ctx.letterSpacing = `${textOptions.songNameLetterSpacing || 0}px`;
            drawTextWithPosition(ctx, songLines, songFont, songX, songRecalcY, songLineHeight, songTextAlignActual, songTextBaselineForCenteredStack, commonTextDrawOptions, textOptions.songNameRotation || 0);
        } else {
            // Draw Artist (its letter spacing is already set)
            drawTextWithPosition(ctx, artistLines, artistFont, artistX, artistY, artistLineHeight, artistTextAlignActual, artistTextBaseline, commonTextDrawOptions, textOptions.artistNameRotation || 0);
            if (textOptions.featuredArtistName && ftArtistLines.length > 0) {
                let featuredArtistYPos = artistY; 
                if (artistTextBaseline === 'top') { featuredArtistYPos += (artistLines.length * artistLineHeight) + ftArtistGap;
                } else if (artistTextBaseline === 'bottom') { featuredArtistYPos = artistY - (artistLines.length * artistLineHeight) - ftArtistGap - (ftArtistLines.length * ftArtistLineHeight);
                } else if (artistTextBaseline === 'middle') { const mainArtistBlockHalfHeight = (artistLines.length * artistLineHeight) / 2; featuredArtistYPos = artistY + mainArtistBlockHalfHeight + ftArtistGap; }
                drawTextWithPosition(ctx, ftArtistLines, ftArtistFont, artistX, featuredArtistYPos, ftArtistLineHeight, artistTextAlignActual, 'top', commonTextDrawOptions, textOptions.artistNameRotation || 0);
            }

            // Set letter spacing for Song name before drawing
            ctx.letterSpacing = `${textOptions.songNameLetterSpacing || 0}px`;
            drawTextWithPosition(ctx, songLines, songFont, songX, songY, songLineHeight, songTextAlignActual, songTextBaseline, commonTextDrawOptions, textOptions.songNameRotation || 0);
        }
        
        ctx.letterSpacing = '0px'; // Reset global letter spacing
        resolve(canvas.toDataURL('image/png'));
    };

    mainImage.onload = () => {
        if (overlayOptions && overlayOptions.base64) {
            const overlayImg = new Image();
            overlayImg.crossOrigin = 'anonymous';
            overlayImg.onload = () => processImages(overlayImg);
            overlayImg.onerror = (overlayError) => { console.warn("Failed to load overlay image, proceeding without it:", overlayError); processImages(null); };
            overlayImg.src = overlayOptions.base64;
        } else {
            processImages(null); 
        }
    };
    mainImage.onerror = (error) => { console.error("Failed to load main image for canvas processing:", error); reject(new Error('Failed to load main image for processing. Check console for details.')); };
    mainImage.src = base64Image;
  });
};
