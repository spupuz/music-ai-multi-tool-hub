export const sanitizeUrlForHref = (url: string | undefined | null): string | undefined => {
    if (!url) return undefined;
    try {
        // Use a dummy base URL to safely parse relative URLs without relying on the window object (for SSR/testing compatibility)
        const parsedUrl = new URL(url, 'http://localhost');
        // Only allow specific safe protocols
        if (['http:', 'https:', 'mailto:'].includes(parsedUrl.protocol)) {
            return url;
        }
        return undefined; // Filter out javascript:, data:, etc.
    } catch (e) {
        // If it's a relative URL or invalid URL, fallback to checking manually or returning undefined
        if (url.startsWith('/') || url.startsWith('#')) {
             return url;
        }
        return undefined;
    }
};
