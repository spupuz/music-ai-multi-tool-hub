import type { SongStructureBlock } from '../../../types';

export const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
    let newColor = hex.trim();
    if (!newColor.startsWith('#')) newColor = '#' + newColor;
    if (newColor.length === 4) { // #RGB to #RRGGBB
        newColor = `#${newColor[1]}${newColor[1]}${newColor[2]}${newColor[2]}${newColor[3]}${newColor[3]}`;
    }
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(newColor);
    return result ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) } : null;
};

export const getLuminance = (r: number, g: number, b: number): number => {
    const a = [r, g, b].map(v => {
        v /= 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
};

export const getContrastingTextColor = (hex: string): string => {
    const rgb = hexToRgb(hex);
    if (!rgb) return '#FFFFFF'; // Default to white for invalid colors
    const lum = getLuminance(rgb.r, rgb.g, rgb.b);
    return lum > 0.5 ? '#000000' : '#FFFFFF';
};

export const escapeCsvField = (field: string): string => {
    const str = String(field || '');
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
};

export const escapeRegex = (string: string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

export const guessBarCount = (block: SongStructureBlock): number | undefined => {
    const lyricLineCount = block.lyrics.filter(l => l.currentText.trim() !== '').length;

    if (lyricLineCount === 0) {
        // Default for instrumental/empty sections
        const blockTypeLower = block.type.toLowerCase();
        if (blockTypeLower.includes('solo') || blockTypeLower.includes('instrumental') || blockTypeLower.includes('bridge')) {
            return 8;
        }
        if (blockTypeLower.includes('intro') || blockTypeLower.includes('outro') || blockTypeLower.includes('pre-chorus') || blockTypeLower.includes('post-chorus') || blockTypeLower.includes('refrain')) {
            return 4;
        }
        return undefined; // No guess for other empty blocks like Verse/Chorus
    }

    const rawBars = lyricLineCount * 2; // Heuristic: 2 bars per lyric line
    const guessedBars = Math.round(rawBars / 4) * 4;
    
    return Math.max(4, guessedBars); // Ensure a minimum of 4 bars if there are lyrics
};
