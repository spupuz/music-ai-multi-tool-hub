/// <reference types="vite/client" />
import type { RiffusionSongData } from '@/types';

// Extended list of CORS proxies to try
const CORS_PROXIES = [
    '/proxy/',
    'https://corsproxy.io/?',
    'https://api.allorigins.win/raw?url=',
    'https://thingproxy.freeboard.io/fetch/',
    'https://cors-anywhere.herokuapp.com/',
    'https://api.codetabs.com/v1/proxy?quest=',
    'https://cors.eu.org/',
    'https://yacdn.org/proxy/',
];

// In production, this might be injected by the build process or a global config
const PROXY_AUTH_TOKEN = import.meta.env.VITE_PROXY_AUTH_TOKEN;

// Regex patterns for metadata scraping
const RIFFUSION_TITLE_PATTERNS = [
    /<meta property="og:title" content="([^"]+)"/i,
    /<meta name="twitter:title" content="([^"]+)"/i,
    /<title>([^<]+)<\/title>/i
];
const RIFFUSION_ARTIST_FROM_TITLE_PATTERN = /by\s+@?([a-zA-Z0-9\s_-]+)/i;
const RIFFUSION_ARTIST_PATTERNS = [
    /"creator":"([^"]+)"/i,
    /"artist":"([^"]+)"/i,
    /"username":"([^"]+)"/i,
    /<meta name="author" content="([^"]+)"/i
];
const RIFFUSION_IMAGE_PATTERNS = [
    /<meta property="og:image" content="([^"]+)"/i,
    /<meta name="twitter:image" content="([^"]+)"/i
];
const RIFFUSION_AUDIO_PATTERNS = [
    /<meta property="og:audio" content="([^"]+)"/i,
    /https:\/\/storage\.googleapis\.com\/producer-app-public\/clips\/[a-f0-9-]{36}\.m4a/i,
    /https:\/\/storage\.googleapis\.com\/producer-app-public\/clips\/[a-f0-9-]{36}\.wav/i
];
const RIFFUSION_PROMPT_PATTERNS = [
    /<meta property="og:description" content="([^"]+)"/i,
    /<meta name="description" content="([^"]+)"/i
];

/**
 * Extracts the Riffusion/Producer.ai Song ID from a given URL.
 */
export function extractRiffusionSongId(url: string): string | null {
    if (!url) return null;

    try {
        const parsed = new URL(url);
        const pathParts = parsed.pathname.split('/');
        // Extract from /song/{uuid}
        const songIndex = pathParts.findIndex(part => part === 'song');
        if (songIndex !== -1 && pathParts.length > songIndex + 1) {
            const id = pathParts[songIndex + 1];
            if (/^[a-f0-9-]{36}$/i.test(id)) return id;
        }
    } catch (e) { }

    const uuidPattern = /[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/i;
    const match = url.match(uuidPattern);
    return match ? match[0] : null;
}

/**
 * Helper to fetch content through a rotating list of CORS proxies.
 */
async function fetchWithProxies(url: string, options: RequestInit = {}): Promise<Response | null> {
    console.log(`[riffusionService] Fetching: ${url}`);

    for (const proxy of CORS_PROXIES) {
        const isAllOrigins = proxy.includes('allorigins.win');
        const targetUrl = isAllOrigins ? encodeURIComponent(url) : url;
        const proxiedUrl = `${proxy}${targetUrl}`;

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000);

            const isLocalProxy = proxy === '/proxy/';

            // Skip local proxy for Producer.ai/riffusion.com domains — these block server-side requests with 403.
            // We rely on client-side public proxies (corsproxy.io, etc.) for these domains.
            if (isLocalProxy && (url.includes('producer.ai') || url.includes('riffusion.com'))) {
                console.log('[riffusionService] Skipping local proxy for producer.ai/riffusion.com to avoid 403 blocking.');
                continue;
            }

            const headers = { ...((options.headers as any) || {}) };
            if (isLocalProxy && PROXY_AUTH_TOKEN) {
                headers['X-Proxy-Auth'] = PROXY_AUTH_TOKEN;
            }

            const response = await fetch(proxiedUrl, {
                ...options,
                headers,
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (response.ok) return response;

            console.warn(`[riffusionService] Proxy ${proxy} failed: ${response.status}`);
        } catch (error) {
            console.warn(`[riffusionService] Proxy ${proxy} error:`, error);
        }
    }
    return null;
}

function extractWithPatterns(content: string, patterns: readonly RegExp[]): string | null {
    for (const pattern of patterns) {
        const match = content.match(pattern);
        if (match && match[1]) {
            return match[1].trim().replace(/&quot;/g, '"').replace(/&#x27;/g, "'");
        }
    }
    return null;
}

/** Safely extracts a string from a value that could be a string, object, or array. */
function safeString(value: any): string | undefined {
    if (value === null || value === undefined) return undefined;
    if (typeof value === 'string') {
        // Normalize escaped newlines to real newlines
        const normalized = value.replace(/\\n/g, '\n').trim();
        return normalized || undefined;
    }
    if (Array.isArray(value)) return value.map(safeString).filter(Boolean).join(', ') || undefined;
    if (typeof value === 'object') {
        // Producer.ai lyrics format: { status: "completed", value: { text: "...", id: "..." } }
        if (value.value?.text) return safeString(value.value.text);
        if (value.text) return safeString(value.text);
        // Other common string fields inside prompt/lyrics objects
        return safeString(value.sound_prompt || value.lyrics_prompt || value.prompt || value.content);
    }
    return String(value);
}

async function scrapeDataFromHtml(htmlContent: string, songId: string): Promise<RiffusionSongData | null> {
    const nextDataMatch = htmlContent.match(/<script id="__NEXT_DATA__" type="application\/json">(.+?)<\/script>/s);
    if (nextDataMatch && nextDataMatch[1]) {
        try {
            const nextData = JSON.parse(nextDataMatch[1]);
            const findSong = (obj: any): any => {
                if (!obj || typeof obj !== 'object') return null;
                if (obj.id === songId && (obj.audio_url || obj.image_url)) return obj;
                if (Array.isArray(obj)) {
                    for (const item of obj) {
                        const found = findSong(item);
                        if (found) return found;
                    }
                } else {
                    for (const key in obj) {
                        const found = findSong(obj[key]);
                        if (found) return found;
                    }
                }
                return null;
            };

            const songObj = findSong(nextData);
            if (songObj) {
                const lyricsStr = safeString(songObj.lyrics)
                    || safeString(songObj.prompt?.prompt)
                    || safeString(songObj.prompt)
                    || safeString(songObj.operation?.sound_prompt);

                const tagsStr = safeString(songObj.tags || songObj.sound
                    || (songObj.operation?.sound_prompt ? [songObj.operation.sound_prompt] : undefined));

                // Artist: try JSON fields, then og:title "Song by Artist" as fallback
                const artistFromJson = safeString(
                    songObj.author?.username || songObj.author?.handle || songObj.author?.display_name ||
                    songObj.creator?.username || songObj.creator?.handle ||
                    songObj.user?.username || songObj.user?.handle ||
                    songObj.owner?.username || songObj.owner?.handle
                );
                const ogTitleMatch = htmlContent.match(/<meta property="og:title" content="[^"]+? by ([^"]+)"/i)
                    || htmlContent.match(/<title[^>]*>[^<]+? by ([^<]+)<\/title>/i);
                const artist = artistFromJson
                    || (ogTitleMatch ? ogTitleMatch[1].trim() : undefined)
                    || (songObj.author_id ? `user_${songObj.author_id.slice(-8)}` : 'Riffusion Artist');

                return {
                    id: songObj.id,
                    title: safeString(songObj.title) || 'Riffusion Song',
                    artist,
                    author_id: songObj.author_id,
                    image_url: songObj.image_url || songObj.image?.url,
                    audio_url: songObj.audio_url || songObj.audio?.mp3 || `https://storage.googleapis.com/producer-app-public/clips/${songId}.m4a`,
                    lyrics: lyricsStr,
                    lyrics_timestamped: songObj.lyrics_timestamped || songObj.lyrics_with_timestamps,
                    tags: tagsStr,
                    source: 'scraper',
                    created_at: songObj.created_at,
                };
            }
        } catch (e) {
            console.warn('[riffusionService] Failed to parse __NEXT_DATA__', e);
        }
    }

    // Fallback to Meta Tags
    const titleRaw = extractWithPatterns(htmlContent, RIFFUSION_TITLE_PATTERNS);
    let title = titleRaw || 'Riffusion Song';
    let artist = extractWithPatterns(htmlContent, RIFFUSION_ARTIST_PATTERNS) || 'Riffusion Artist';

    const imageUrl = extractWithPatterns(htmlContent, RIFFUSION_IMAGE_PATTERNS);
    const audioUrl = extractWithPatterns(htmlContent, RIFFUSION_AUDIO_PATTERNS);
    const description = extractWithPatterns(htmlContent, RIFFUSION_PROMPT_PATTERNS);

    // Try to extract tags from keywords meta or description
    const tagsMatch = htmlContent.match(/<meta name="keywords" content="([^"]+)"/i);
    const tags = tagsMatch ? tagsMatch[1] : (description || undefined);

    return {
        id: songId,
        title,
        artist,
        image_url: imageUrl || `https://storage.googleapis.com/producer-app-public/clips/${songId}.jpg`,
        audio_url: audioUrl || `https://storage.googleapis.com/producer-app-public/clips/${songId}.m4a`,
        lyrics: description,
        tags: tags,
        source: 'scraper',
        prompt: description
    };
}

export async function fetchRiffusionSongData(url: string): Promise<RiffusionSongData | null> {
    const songId = extractRiffusionSongId(url);
    if (!songId) return null;

    // STRATEGY 1: HTML Scraping (Fastest and most compatible now)
    const scrapeUrls = [
        `https://www.producer.ai/song/${songId}`,
        `https://classic.riffusion.com/song/${songId}`
    ];

    for (const pageUrl of scrapeUrls) {
        const response = await fetchWithProxies(pageUrl);
        if (response) {
            const html = await response.text();
            const scrapedData = await scrapeDataFromHtml(html, songId);
            if (scrapedData) return scrapedData;
        }
    }

    // STRATEGY 2: Fallback construction
    console.warn('[riffusionService] Scrapers failed. Using fallback construction.');
    return {
        id: songId,
        title: 'Riffusion Song (Fallback)',
        artist: 'Unknown Artist',
        image_url: `https://storage.googleapis.com/producer-app-public/clips/${songId}.jpg`,
        audio_url: `https://storage.googleapis.com/producer-app-public/clips/${songId}.m4a`,
        source: 'mock',
        lyrics: 'Could not fetch metadata.'
    };
}