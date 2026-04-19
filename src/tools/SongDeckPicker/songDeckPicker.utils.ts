// songDeckPicker.utils.ts
import type { SongCardInterface } from '@/types';
import { fetchSunoClipById } from '@/services/sunoService'; 

export const shuffleArray = <T,>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
};

export const generateRandomColor = (): string => {
    return '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
};

export const extractSunoPlaylistIdFromPath = (urlPath: string): string | null => {
    try {
        const pathOnly = urlPath.startsWith('http') ? new URL(urlPath).pathname : urlPath;
        const match = pathOnly.match(/\/playlist\/([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})/);
        if (match && match[1]) return match[1];
    } catch (e) { console.warn(`Invalid path/URL for playlist UUID extraction: ${urlPath}`, e); }
    return null;
};

export const parseKeyValueFormat = (line: string): SongCardInterface | { error: string } => {
    const parts = line.split('|').map(p => p.trim());
    const card: Partial<SongCardInterface> & { originalInputLine: string } = { originalInputLine: line };
    let foundArtist = false;
    let foundTitle = false;

    for (const part of parts) {
        const firstColonIndex = part.indexOf(':');
        if (firstColonIndex === -1) continue;

        const key = part.substring(0, firstColonIndex).trim();
        const value = part.substring(firstColonIndex + 1).trim();

        if (key === 'ArtistName') { card.artistName = value; foundArtist = true; }
        else if (key === 'Title') { card.title = value; foundTitle = true; }
        else if (key === 'Image') card.imageUrl = value;
        else if (key === 'Link') card.webLink = value;
        else if (key === 'Color') card.color = value && /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/i.test(value) ? value : undefined;
        else if (key === 'Comment') card.comment = value;
    }

    if (!foundArtist || !foundTitle) {
        return { error: "Missing ArtistName or Title in custom format entry." };
    }

    card.id = `custom-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    if (!card.color) card.color = generateRandomColor();
    card.isBonusApplied = false;

    return card as SongCardInterface;
};

export const isLikelyUrl = (line: string): boolean => {
    try {
        const url = new URL(line);
        return ['http:', 'https:'].includes(url.protocol);
    } catch (_) {
        return false;
    }
};

export const convertCardToOutputFormat = (card: SongCardInterface): string => {
    const { artistName, title, imageUrl, webLink, color, comment } = card;
    const safeArtistName = artistName || 'Unknown Artist';
    const safeTitle = title || 'Untitled Song';

    const parts = [`ArtistName: ${safeArtistName}`, `Title: ${safeTitle}`];
    if (imageUrl) parts.push(`Image: ${imageUrl}`);
    if (webLink) parts.push(`Link: ${webLink}`);
    if (color) parts.push(`Color: ${color}`);
    if (comment && comment.trim() !== '') parts.push(`Comment: ${comment.trim()}`);

    return parts.join(' | ');
};

export const downloadTextFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

export const inferSourceTypeFromInput = (line: string): SongCardInterface['sourceType'] => {
    if (!isLikelyUrl(line) && line.includes(':') && line.includes('|')) {
        return 'custom_format';
    }
    try {
        const url = new URL(line);
        if (url.hostname === 'suno.com' || url.hostname === 'app.suno.ai') {
            if (extractSunoPlaylistIdFromPath(line)) return 'suno_playlist';
            if (url.pathname.startsWith('/s/')) return 'suno_short_url';
            if (url.pathname.includes('/song/')) return 'suno_long_url';
            return 'suno_general_url';
        }
        if (url.hostname === 'www.riffusion.com' || url.hostname === 'riffusion.com') {
            if (url.pathname.includes('/song/')) {
                return 'riffusion_url';
            }
        }
        if (url.hostname === 'www.flowmusic.app' || url.hostname === 'flowmusic.app' || 
            url.hostname === 'www.producer.ai' || url.hostname === 'producer.ai') {
            if (url.pathname.includes('/song/')) {
                return 'riffusion_url';
            }
        }
    } catch (e) {
        // Not a valid URL, or not a Suno/Riffusion URL
    }
    if (isLikelyUrl(line)) return 'other_url';
    return 'custom_format'; // Fallback for non-URL, non-pipe format lines
};