import React from 'react';
import type { SunoClip, SunoRawProfileResponse, SunoProfileDetail, SunoRawPlaylistResponse, SunoPlaylistDetail } from '../types';

const API_BASE_URL = 'https://studio-api.prod.suno.com/api';

export interface FetchSunoSongsResult {
  clips: SunoClip[];
  profileDetail: SunoProfileDetail | null;
}

export interface FetchSunoPlaylistResult {
  playlistDetail: SunoPlaylistDetail | null;
  clips: SunoClip[];
}


const mapRawResponseToProfileDetail = (raw: SunoRawProfileResponse): SunoProfileDetail | null => {
  if (!raw.user_id) return null; 

  return {
    user_id: raw.user_id,
    display_name: raw.display_name,
    handle: raw.handle,
    bio: raw.profile_description || null,
    image_url: raw.avatar_image_url || null,
    is_following: raw.is_following || false,
    total_upvotes: raw.stats?.upvote_count__sum,
    total_plays: raw.stats?.play_count__sum,
    num_followers: raw.stats?.followers_count,
    num_following: raw.stats?.following_count,
    num_total_clips: raw.num_total_clips,
    // total_comments will be aggregated after fetching all clips
  };
};


export const fetchSunoSongsByUsername = async (
  username: string,
  onProgress?: (message: string, loadedPages: number, totalPagesEstimate?: number) => void
): Promise<FetchSunoSongsResult> => {
  let allClips: SunoClip[] = [];
  let profileDetail: SunoProfileDetail | null = null;
  let currentPage = 1; 
  let hasMorePages = true;
  let totalPagesEstimate: number | undefined = undefined;
  const clipsPerPageDefault = 10; 
  let isFirstPageEverFetched = true;

  console.log(`[sunoService] Starting fetch for user: ${username} from ${API_BASE_URL}`);
  if (onProgress) onProgress(`Starting fetch for ${username}...`, 0, totalPagesEstimate);

  while (hasMorePages) {
    if (!isFirstPageEverFetched) {
        await new Promise(resolve => setTimeout(resolve, 2000)); 
        console.log(`[sunoService] Waited 2000ms before attempting to fetch new page ${currentPage}`);
    }
    isFirstPageEverFetched = false;

    const url = `${API_BASE_URL}/profiles/${encodeURIComponent(username)}/?page=${currentPage}&playlists_sort_by=upvote_count&clips_sort_by=created_at`;
    console.log(`[sunoService] Attempting to fetch URL: ${url}`);
    
    let retries = 0;
    const maxRetries = 3; 
    let pageData: SunoRawProfileResponse | null = null;
    let attemptDelayMs = 0; 

    while (retries <= maxRetries) {
        if (attemptDelayMs > 0) {
            await new Promise(resolve => setTimeout(resolve, attemptDelayMs));
        }
        attemptDelayMs = 0; 

        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: { 'Accept': 'application/json' },
            });

            if (!response.ok) {
                if (response.status === 429) { 
                    if (retries < maxRetries) {
                        attemptDelayMs = Math.pow(2, retries) * 3000; 
                        if (onProgress) onProgress(`Rate limit hit for page ${currentPage}. Retrying in ${attemptDelayMs / 1000}s... (Retry ${retries + 1} of ${maxRetries})`, currentPage, totalPagesEstimate);
                        console.log(`[sunoService] Rate limit hit for page ${currentPage}. Retrying in ${attemptDelayMs / 1000}s (Retry ${retries + 1})`);
                    } else {
                        const errorMsg = `Rate limit exceeded for page ${currentPage} after ${maxRetries + 1} attempts.`;
                        console.error(`[sunoService] ${errorMsg}`);
                        if (onProgress) onProgress(errorMsg, currentPage, totalPagesEstimate);
                        throw new Error(errorMsg);
                    }
                } else if (response.status === 404) { 
                    console.error(`[sunoService] Suno profile not found or page non-existent for username: ${username} (Status 404) on page ${currentPage}`);
                    if (currentPage === 1) {
                       throw new Error(`Suno profile for "@${username}" not found.`); 
                    } else {
                       if (onProgress) onProgress(`Page ${currentPage} not found. Assuming end of data.`, currentPage, totalPagesEstimate);
                       hasMorePages = false; 
                       pageData = null; 
                       break; 
                    }
                } else { 
                    if (retries < maxRetries) {
                        attemptDelayMs = 1500 + retries * 500; 
                        if (onProgress) onProgress(`Server error ${response.status} on page ${currentPage}. Retrying in ${attemptDelayMs / 1000}s... (Retry ${retries + 1} of ${maxRetries})`, currentPage, totalPagesEstimate);
                    } else {
                        const errorMsg = `Persistent server error ${response.status} after ${maxRetries + 1} attempts for page ${currentPage}.`;
                        console.error(`[sunoService] ${errorMsg}`);
                        if (onProgress) onProgress(errorMsg, currentPage, totalPagesEstimate);
                        throw new Error(errorMsg);
                    }
                }
                retries++;
                continue; 
            }

            pageData = await response.json();
            break; 

        } catch (networkError) { 
            console.error(`[sunoService] Network error on page ${currentPage}, attempt ${retries + 1}/${maxRetries + 1}:`, networkError);
            if (onProgress) onProgress(`Network error on page ${currentPage} (attempt ${retries + 1} of ${maxRetries+1}). Retrying...`, currentPage, totalPagesEstimate);
            
            if (retries < maxRetries) {
                attemptDelayMs = 2000 + retries * 1000; 
            } else {
                throw new Error(`Persistent network error fetching page ${currentPage} for ${username}.`); 
            }
            retries++;
        }
    } 
    
    if (!pageData && hasMorePages) { 
      const finalErrorMsg = `Failed to retrieve data for page ${currentPage} for user ${username} after all attempts.`;
      console.error(`[sunoService] ${finalErrorMsg}`);
       if (onProgress) onProgress(finalErrorMsg, currentPage, totalPagesEstimate);
       hasMorePages = false; 
    }
    
    if (!pageData) { 
        continue; 
    }
      
      if (currentPage === 1) {
        profileDetail = mapRawResponseToProfileDetail(pageData);
        const totalClipsCount = pageData.num_total_clips;
        if (typeof totalClipsCount === 'number') {
          const clipsActuallyInFirstPageResponse = pageData.clips?.length || 0;
          const pageSizeForEstimate = (totalClipsCount > 0 && clipsActuallyInFirstPageResponse === 0) 
                                      ? clipsPerPageDefault 
                                      : (clipsActuallyInFirstPageResponse > 0 ? clipsActuallyInFirstPageResponse : clipsPerPageDefault);
          totalPagesEstimate = Math.ceil(totalClipsCount / (pageSizeForEstimate || 1));
          if (totalClipsCount === 0) totalPagesEstimate = 0;
        } else {
            totalPagesEstimate = undefined;
        }
      }

      if (!pageData.clips) {
        hasMorePages = false; 
        continue;
      }

      const rawClipsCount = pageData.clips.length;
      const fetchedClips = pageData.clips.filter(clip => clip.audio_url && ['complete', 'streaming'].includes(clip.status));
      
      if (onProgress) onProgress(`Fetched page ${currentPage}${totalPagesEstimate ? ` of ~${totalPagesEstimate}` : ''}... (${fetchedClips.length} new valid clips)`, currentPage, totalPagesEstimate);

      const enrichedClips = fetchedClips.map(clip => ({
        ...clip,
        suno_song_url: `https://suno.com/song/${clip.id}`,
        suno_creator_url: `https://suno.com/@${clip.handle || username}`,
        image_url: clip.image_large_url || clip.image_url || (clip.image_urls ? clip.image_urls.image_url : null),
      }));

      allClips = allClips.concat(enrichedClips);
      
      const apiNextPage = pageData.next_page;

      if (typeof apiNextPage === 'number' && apiNextPage > currentPage) {
        currentPage = apiNextPage;
      } else if (rawClipsCount > 0) {
        currentPage++;
      } else { 
        if (currentPage === 1 && totalPagesEstimate !== undefined && totalPagesEstimate > 0 && pageData.num_total_clips && pageData.num_total_clips > 0) {
            currentPage++;
        } else {
            hasMorePages = false;
        }
      }
      
      if (totalPagesEstimate === 0 && pageData.clips?.length === 0 && currentPage === 1) { 
        hasMorePages = false;
      }
  } 
  
  if (profileDetail) {
    profileDetail.total_comments = allClips.reduce((sum, clip) => sum + (clip.comment_count || 0), 0);
  }

  if (onProgress) onProgress(`Finished fetching. Total ${allClips.length} valid clips found for ${username}.`, currentPage -1, totalPagesEstimate);
  return { clips: allClips, profileDetail: profileDetail };
};


export const fetchSunoClipById = async (clipId: string): Promise<SunoClip | null> => {
  const url = `${API_BASE_URL}/clip/${clipId}`;
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`[sunoService] Failed to fetch clip ${clipId}. Status: ${response.status} ${response.statusText}`);
      if (response.status === 404) {
        return null; 
      }
      throw new Error(`Failed to fetch clip ${clipId}. Status: ${response.status} ${response.statusText}`);
    }

    const clipData: SunoClip = await response.json();
    if (!clipData || !clipData.id) { 
        console.error(`[sunoService] Invalid data received for clip ${clipId}:`, clipData);
        return null;
    }

    const enrichedClip = {
        ...clipData,
        suno_song_url: `https://suno.com/song/${clipData.id}`,
        suno_creator_url: `https://suno.com/@${clipData.handle}`,
        image_url: clipData.image_large_url || clipData.image_url || (clipData.image_urls ? clipData.image_urls.image_url : null),
    };
    return enrichedClip;

  } catch (error) {
    console.error(`[sunoService] Error fetching clip ${clipId}:`, error);
    return null;
  }
};

export const fetchSunoPlaylistById = async (
  playlistId: string,
  onProgress?: (message: string, loadedPages?: number, totalPagesEstimate?: number) => void
): Promise<FetchSunoPlaylistResult> => {
  let allPlaylistClips: SunoClip[] = [];
  let playlistDetail: SunoPlaylistDetail | null = null;
  let currentPageNum: number | string | null = 0; // Suno playlist API seems to be 0-indexed for 'page' param
  const maxRetries = 3;
  let totalPagesEstimate: number | undefined = undefined;
  let isFirstPageEverFetched = true;

  console.log(`[sunoService] Starting fetch for playlist ID: ${playlistId}`);
  if (onProgress) onProgress(`Fetching playlist ${playlistId}...`, 0, totalPagesEstimate);

  while (currentPageNum !== null) {
     if (!isFirstPageEverFetched) {
        await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 500)); // Delay between pages
    }
    isFirstPageEverFetched = false;

    const url = `${API_BASE_URL}/playlist/${playlistId}/?page=${currentPageNum}`;
    console.log(`[sunoService] Fetching playlist page: ${url}`);
    
    let retries = 0;
    let pageData: SunoRawPlaylistResponse | null = null;
    let attemptDelayMs = 0;

    while (retries <= maxRetries) {
        if (attemptDelayMs > 0) {
            await new Promise(resolve => setTimeout(resolve, attemptDelayMs));
        }
        attemptDelayMs = 0;

        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: { 'Accept': 'application/json' },
            });

            if (!response.ok) {
                if (response.status === 404) {
                    const errorMsg = `Playlist with ID "${playlistId}" not found (or page ${currentPageNum} non-existent).`;
                    console.error(`[sunoService] ${errorMsg}`);
                    if (Number(currentPageNum) === 0) throw new Error(errorMsg); 
                    if (onProgress) onProgress(`Page ${Number(currentPageNum) + 1} not found. Assuming end of playlist.`);
                    currentPageNum = null; 
                    break; 
                } else if (response.status === 429) {
                    if (retries < maxRetries) {
                        attemptDelayMs = Math.pow(2, retries) * 2000 + Math.random()*1000; 
                        if (onProgress) onProgress(`Rate limit on page ${Number(currentPageNum) + 1}. Retrying in ${Math.round(attemptDelayMs / 1000)}s... (Retry ${retries + 1}/${maxRetries})`, Number(currentPageNum), totalPagesEstimate);
                    } else {
                        const errorMsg = `Rate limit exceeded for playlist page ${Number(currentPageNum) + 1} after ${maxRetries + 1} attempts.`;
                        console.error(`[sunoService] ${errorMsg}`);
                        if (onProgress) onProgress(errorMsg, Number(currentPageNum), totalPagesEstimate);
                        throw new Error(errorMsg);
                    }
                } else { 
                    if (retries < maxRetries) {
                        attemptDelayMs = 1500 + retries * 500;
                        if (onProgress) onProgress(`Server error ${response.status} on page ${Number(currentPageNum) + 1}. Retrying in ${attemptDelayMs / 1000}s... (Retry ${retries + 1}/${maxRetries})`, Number(currentPageNum), totalPagesEstimate);
                    } else {
                        const errorMsg = `Persistent server error ${response.status} after ${maxRetries + 1} attempts for playlist page ${Number(currentPageNum) + 1}.`;
                        console.error(`[sunoService] ${errorMsg}`);
                        if (onProgress) onProgress(errorMsg, Number(currentPageNum), totalPagesEstimate);
                        throw new Error(errorMsg);
                    }
                }
                retries++;
                continue;
            }
            pageData = await response.json();
            break; 
        } catch (networkError) {
            console.error(`[sunoService] Network error on playlist page ${currentPageNum}, attempt ${retries + 1}:`, networkError);
            if (retries < maxRetries) {
                attemptDelayMs = 2000 + retries * 1000;
                if (onProgress) onProgress(`Network error on page ${Number(currentPageNum) + 1} (attempt ${retries + 1}). Retrying in ${attemptDelayMs / 1000}s...`, Number(currentPageNum), totalPagesEstimate);
            } else {
                const errorMsg = `Persistent network error fetching page ${Number(currentPageNum) + 1} of playlist ${playlistId}.`;
                if (onProgress) onProgress(errorMsg, Number(currentPageNum), totalPagesEstimate);
                throw new Error(errorMsg);
            }
            retries++;
        }
    } 

    if (!pageData) { 
      if (currentPageNum === null) break; // Reached end due to 404 on a subsequent page
      const criticalErrorMsg = `Failed to fetch data for page ${Number(currentPageNum) + 1} of playlist ${playlistId} due to an unhandled issue after retries.`;
      console.error(`[sunoService] ${criticalErrorMsg}`);
      throw new Error(criticalErrorMsg); 
    }
    
    if (Number(currentPageNum) === 0) { 
        playlistDetail = {
            id: pageData.id,
            name: pageData.name || 'Untitled Playlist',
            description: pageData.description || null,
            image_url: pageData.image_url || null,
            suno_playlist_url: `https://suno.com/playlist/${pageData.id}`,
            creator_user_id: pageData.user_id || null,
            creator_display_name: pageData.user_display_name || null,
            creator_handle: pageData.user_handle || null,
            creator_avatar_image_url: null, // SunoRawPlaylistResponse doesn't provide user_avatar_image_url
            suno_creator_url: pageData.user_handle ? `https://suno.com/@${pageData.user_handle}` : undefined,
            playlist_upvote_count: pageData.upvote_count || 0,
            num_songs: 0, // Will be updated after fetching all clips
            total_clip_plays: 0,
            total_clip_upvotes: 0,
            total_clip_comments: 0,
        };
        if (pageData.num_total_results) {
            const clipsPerPage = pageData.playlist_clips?.length > 0 ? pageData.playlist_clips.length : 10; // Assume 10 if first page is empty but total > 0
            totalPagesEstimate = Math.ceil(pageData.num_total_results / clipsPerPage);
        }
    }
    
    const fetchedClipsFromPage = pageData.playlist_clips
        ?.map(item => item.clip) 
        .filter(clip => clip && clip.audio_url && ['complete', 'streaming'].includes(clip.status)) || [];

    if (onProgress) onProgress(`Fetched page ${Number(currentPageNum) + 1}${totalPagesEstimate ? ` of ~${totalPagesEstimate}` : ''}... (${fetchedClipsFromPage.length} new clips)`, Number(currentPageNum), totalPagesEstimate);

    if (fetchedClipsFromPage.length > 0) {
      const enrichedClips = fetchedClipsFromPage.map(clip => ({
        ...clip,
        suno_song_url: `https://suno.com/song/${clip.id}`,
        suno_creator_url: `https://suno.com/@${clip.handle || pageData.user_handle || (playlistDetail ? playlistDetail.creator_handle : '')}`,
        image_url: clip.image_large_url || clip.image_url || (clip.image_urls ? clip.image_urls.image_url : (playlistDetail ? playlistDetail.image_url : null)),
      }));
      allPlaylistClips = allPlaylistClips.concat(enrichedClips);
    }
    
    currentPageNum = pageData.next_page !== undefined && pageData.next_page !== null ? pageData.next_page : null;
  } 

  if (playlistDetail) {
    playlistDetail.num_songs = allPlaylistClips.length;
    playlistDetail.total_clip_plays = allPlaylistClips.reduce((sum, clip) => sum + (clip.play_count || 0), 0);
    playlistDetail.total_clip_upvotes = allPlaylistClips.reduce((sum, clip) => sum + (clip.upvote_count || 0), 0);
    playlistDetail.total_clip_comments = allPlaylistClips.reduce((sum, clip) => sum + (clip.comment_count || 0), 0);
  }

  if (onProgress) onProgress(`Finished fetching playlist. Total ${allPlaylistClips.length} valid clips found for "${playlistDetail?.name || playlistId}".`);
  
  return { playlistDetail, clips: allPlaylistClips };
};


// --- URL Utilities (Moved from songDeckPicker.utils.ts) ---

const publicProxies = [
    { name: "local", constructUrl: (targetUrl: string) => `/proxy/${targetUrl}` },
    { name: "corsproxy.io", constructUrl: (targetUrl: string) => `https://corsproxy.io/?url=${encodeURIComponent(targetUrl)}` },
    { name: "allorigins.win", constructUrl: (targetUrl: string) => `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}` },
    { name: "thingproxy", constructUrl: (targetUrl: string) => `https://thingproxy.freeboard.io/fetch/${targetUrl}` },
    { name: "cors-anywhere", constructUrl: (targetUrl: string) => `https://cors-anywhere.herokuapp.com/${targetUrl}` },
];

export const extractSunoSongIdFromPath = (urlPath: string): string | null => {
    try {
        const pathOnly = urlPath.startsWith('http') ? new URL(urlPath).pathname : urlPath;
        const match = pathOnly.match(/\/song\/([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})/);
        if (match && match[1]) return match[1]; 
    } catch (e) { console.warn(`Invalid path/URL for UUID extraction: ${urlPath}`, e); }
    return null;
};

export const resolveSunoUrlToPotentialSongId = async (
    originalUrl: string, 
    setProgressMessageForResolution: React.Dispatch<React.SetStateAction<string>>
): Promise<string | null> => {
    let parsedUrlObject;
    try { parsedUrlObject = new URL(originalUrl); }
    catch (e) { throw new Error(`Invalid URL format: ${originalUrl.substring(0,50)}...`); }

    if (parsedUrlObject.hostname !== 'suno.com' && parsedUrlObject.hostname !== 'app.suno.ai') {
        throw new Error(`Unsupported URL: ${originalUrl.substring(0,50)}... is not a Suno URL.`);
    }

    let songId = extractSunoSongIdFromPath(parsedUrlObject.pathname + parsedUrlObject.search);
    if (songId) {
        setProgressMessageForResolution(`URL directly parsed.`);
        return songId;
    }

    const shortUrlPattern = /^\/s\/[A-Za-z0-9]+(?:\?.*)?$/;
    if (shortUrlPattern.test(parsedUrlObject.pathname + parsedUrlObject.search)) {
        setProgressMessageForResolution("This looks like a short URL. Trying to resolve it...");
        await new Promise(resolve => setTimeout(resolve, 250)); 
        
        for (let i = 0; i < publicProxies.length; i++) {
            const proxy = publicProxies[i];
            const proxiedUrl = proxy.constructUrl(originalUrl);
            setProgressMessageForResolution(`Attempting to resolve via public proxy (${i + 1}/${publicProxies.length})...`);
            
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000);

            try {
                const response = await fetch(proxiedUrl, { signal: controller.signal });
                clearTimeout(timeoutId);

                // Strategy 1: Check for HTTP redirect followed by the proxy.
                let resolvedSongId: string | null = null;
                if (response.url && response.url !== proxiedUrl && response.url !== originalUrl) {
                    resolvedSongId = extractSunoSongIdFromPath(response.url);
                    if (resolvedSongId) {
                        setProgressMessageForResolution(`Success! Resolved via redirect with ${proxy.name}.`);
                        return resolvedSongId;
                    }
                }

                if (!response.ok) { 
                    await new Promise(resolve => setTimeout(resolve, 200));
                    continue; 
                }
                
                let htmlContent = await response.text();
                // Handle JSON-wrapping proxies like allorigins
                if (proxy.name === 'allorigins.win') {
                    try {
                        const jsonResponse = JSON.parse(htmlContent);
                        if (jsonResponse && jsonResponse.contents) {
                            htmlContent = jsonResponse.contents;
                        } else {
                            throw new Error("Invalid allorigins.win response structure");
                        }
                    } catch (e) {
                        console.warn(`Failed to parse allorigins.win JSON for ${originalUrl}`, e);
                        continue; // Try next proxy
                    }
                }

                // Strategy 2: Parse HTML for various client-side redirect methods.
                const patternsToTry: RegExp[] = [
                    /NEXT_REDIRECT;replace;([^;]+);/, // Old pattern
                    /<meta\s+http-equiv="refresh"\s+content="[^;]+;\s*url=([^"]+)"/i, // Meta refresh
                    /window\.location\.(?:href|replace)\s*=\s*['"]([^'"]+)['"]/i, // JS redirect
                ];

                for (const pattern of patternsToTry) {
                    const match = htmlContent.match(pattern);
                    if (match && match[1]) {
                        resolvedSongId = extractSunoSongIdFromPath(match[1]);
                        if (resolvedSongId) {
                            setProgressMessageForResolution(`Success! Resolved via content pattern with ${proxy.name}.`);
                            return resolvedSongId;
                        }
                    }
                }

                // Strategy 3: Fallback to finding any song UUID in the content that is part of a /song/ path.
                const uuidPattern = /["'\/]([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})["']/g;
                let uuidMatch;
                while ((uuidMatch = uuidPattern.exec(htmlContent)) !== null) {
                    const potentialId = uuidMatch[1];
                    if (htmlContent.includes(`/song/${potentialId}`)) {
                        setProgressMessageForResolution(`Success! Found song ID directly in content with ${proxy.name}.`);
                        return potentialId;
                    }
                }
                 
                if (i < publicProxies.length - 1) {
                    setProgressMessageForResolution(`Proxy connected, but no song ID found. Trying next...`);
                }
                await new Promise(resolve => setTimeout(resolve, 200));
            } catch (error) {
                clearTimeout(timeoutId);
                 if (i < publicProxies.length - 1) {
                    setProgressMessageForResolution(`Proxy attempt failed. Trying next...`);
                 }
                 await new Promise(resolve => setTimeout(resolve, 200));
            }
        }
        throw new Error(`Could not resolve the short URL after multiple attempts. It might be invalid or the public proxy services may be down. Please try using a full /song/... URL if available.`);
    }
    
    throw new Error(`Could not parse or resolve song ID from URL: ${originalUrl.substring(0,50)}... (Unsupported format or resolution failed).`);
};
