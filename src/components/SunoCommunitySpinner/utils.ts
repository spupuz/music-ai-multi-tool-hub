export const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) } : null;
};

export const getLuminance = (r: number, g: number, b: number): number => {
    const a = [r, g, b].map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
};

export const getAdjustedTextColorForContrast = (backgroundColorHex: string): string => {
    const rgbBg = hexToRgb(backgroundColorHex);
    if (!rgbBg) return '#FFFFFF';
    const lumBg = getLuminance(rgbBg.r, rgbBg.g, rgbBg.b);
    const lumWhite = getLuminance(255, 255, 255);
    const lumBlack = getLuminance(0, 0, 0);
    const contrastWithWhite = (Math.max(lumBg, lumWhite) + 0.05) / (Math.min(lumBg, lumWhite) + 0.05);
    const contrastWithBlack = (Math.max(lumBg, lumBlack) + 0.05) / (Math.min(lumBg, lumBlack) + 0.05);
    return contrastWithWhite > contrastWithBlack ? '#FFFFFF' : '#000000';
};

export const isValidHexColor = (color: string): boolean => /^#?([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(color);

export const normalizeHexColor = (color: string): string => {
  if (!color.startsWith('#')) color = '#' + color;
  if (color.length === 4) { color = `#${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}`; }
  return color.toUpperCase();
};

export const lightenDarkenColor = (hex: string, percent: number): string => {
    hex = hex.replace('#', '');
    if (hex.length === 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    const num = parseInt(hex, 16);
    let r = (num >> 16) + percent;
    if (r > 255) r = 255; else if (r < 0) r = 0;
    let b = ((num >> 8) & 0x00FF) + percent;
    if (b > 255) b = 255; else if (b < 0) b = 0;
    let g = (num & 0x0000FF) + percent;
    if (g > 255) g = 255; else if (g < 0) g = 0;
    return `#${(g | (b << 8) | (r << 16)).toString(16).padStart(6, '0')}`;
};
