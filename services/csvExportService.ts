import type { PickedSongLogEntry, SingleSongComplianceResult, SongGroup, SunoClip } from '../types';

// Helper to escape CSV fields
const escapeCsvField = (field: string | number | boolean | undefined | null): string => {
    if (field === undefined || field === null) {
        return "";
    }
    const stringField = String(field);
    // Replace " with "" and wrap in " if it contains , " or newline
    if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n') || stringField.includes('\r')) {
        return `"${stringField.replace(/"/g, '""')}"`;
    }
    return stringField;
};

export const downloadPickedCardAsCsv = (logEntry: PickedSongLogEntry): void => {
    const headers = ["Timestamp", "Artist", "Title", "Image", "Link", "Color", "Comment", "Source"];
    
    const row = [
        escapeCsvField(logEntry.timestamp),
        escapeCsvField(logEntry.artistName),
        escapeCsvField(logEntry.title),
        escapeCsvField(logEntry.imageUrl),
        escapeCsvField(logEntry.webLink),
        escapeCsvField(logEntry.color),
        escapeCsvField(logEntry.comment),
        escapeCsvField(logEntry.source)
    ];

    const csvContent = headers.join(",") + "\n" + row.join(",");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.setAttribute("href", url);

    const safeArtist = logEntry.artistName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const safeTitle = logEntry.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    
    link.setAttribute("download", `picked_song_${safeArtist}_${safeTitle}_${dateStr}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

export const downloadLoggedSongsAsCsv = (logEntries: PickedSongLogEntry[]): void => {
    if (logEntries.length === 0) return;

    const headers = ["Timestamp", "Artist", "Title", "Image", "Link", "Color", "Comment", "Source"];
    
    const rows = logEntries.map(logEntry => [
        escapeCsvField(logEntry.timestamp),
        escapeCsvField(logEntry.artistName),
        escapeCsvField(logEntry.title),
        escapeCsvField(logEntry.imageUrl),
        escapeCsvField(logEntry.webLink),
        escapeCsvField(logEntry.color),
        escapeCsvField(logEntry.comment),
        escapeCsvField(logEntry.source)
    ].join(","));

    const csvContent = headers.join(",") + "\n" + rows.join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.setAttribute("href", url);
    
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    link.setAttribute("download", `logged_songs_${dateStr}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

export const downloadSongGroupsAsCsv = (groups: SongGroup[]): void => {
    if (groups.length === 0) {
        alert("No groups to export.");
        return;
    }

    const headers = [
        "Group ID", "Group Name", 
        "Song Timestamp", "Song Artist", "Song Title", 
        "Song Image URL", "Song Web Link", "Song Card Color", 
        "Song Card Comment", "Song Original Input Line"
    ];

    const rows: string[] = [];
    groups.forEach(group => {
        group.songs.forEach(song => {
            rows.push([
                escapeCsvField(group.id),
                escapeCsvField(group.name),
                escapeCsvField(song.timestamp),
                escapeCsvField(song.artistName),
                escapeCsvField(song.title),
                escapeCsvField(song.imageUrl),
                escapeCsvField(song.webLink),
                escapeCsvField(song.color),
                escapeCsvField(song.comment),
                escapeCsvField(song.source)
            ].join(','));
        });
    });

    const csvContent = headers.join(',') + '\n' + rows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    link.setAttribute("href", url);
    link.setAttribute("download", `song_deck_groups_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};


export const downloadSunoComplianceResultsAsCsv = (results: SingleSongComplianceResult[], filenamePrefix: string = "suno_compliance_results"): void => {
    if (results.length === 0) {
        alert("No results to export.");
        return;
    }

    const headers = [
        "Input URL", "Fetched Song Title", "Creator Handle", "Creator Display Name",
        "Title Check Status", "Title Check Message", "SSC Version", "Country",
        "Duration Check Status", "Duration Check Message", "Actual Duration (s)", "Duration Limit (s)", // Added Duration fields
        "Primary Language", "Untranslatable Words Found", "Language Analysis Explanation",
        "Content Rating Standard", "Content Rating Status", "Content Rating Explanation",
        "Processing Error", "Lyrics Preview"
    ];

    const rows = results.map(result => {
        return [
            escapeCsvField(result.inputUrl),
            escapeCsvField(result.clipData?.title),
            escapeCsvField(result.clipData?.handle),
            escapeCsvField(result.clipData?.display_name),
            escapeCsvField(result.titleCheck?.passed ? 'Passed' : (result.titleCheck ? 'Failed' : '')),
            escapeCsvField(result.titleCheck?.message),
            escapeCsvField(result.titleCheck?.sscVersion),
            escapeCsvField(result.titleCheck?.country),
            escapeCsvField(result.durationCheck?.passed ? 'Passed' : (result.durationCheck ? 'Failed' : '')), // Added
            escapeCsvField(result.durationCheck?.message), // Added
            escapeCsvField(result.durationCheck?.actualDurationSeconds !== null && result.durationCheck?.actualDurationSeconds !== undefined ? result.durationCheck.actualDurationSeconds.toFixed(1) : ''), // Added
            escapeCsvField(result.durationCheck?.limitSeconds), // Added
            escapeCsvField(result.languageCheck?.primaryLanguageCode.toUpperCase()),
            escapeCsvField(result.languageCheck?.untranslatableWordsFound ? 'Yes' : (result.languageCheck ? 'No' : '')),
            escapeCsvField(result.languageCheck?.untranslatableWordsExplanation),
            escapeCsvField(result.contentRatingCheck ? (results[0]?.contentRatingCheck as any)?.ratingLevelUsed || 'N/A' : 'N/A'), 
            escapeCsvField(result.contentRatingCheck?.is_appropriate ? 'Appropriate' : (result.contentRatingCheck ? 'Not Appropriate' : '')),
            escapeCsvField(result.contentRatingCheck?.explanation),
            escapeCsvField(result.processingError),
            escapeCsvField(result.songLyrics ? result.songLyrics.substring(0, 100).replace(/\n/g, ' ') + '...' : '')
        ].join(',');
    });

    const csvContent = headers.join(',') + '\n' + rows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    link.setAttribute("href", url);
    link.setAttribute("download", `${filenamePrefix}_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

export const downloadSunoPlaylistAsCsv = (songs: SunoClip[], filenamePrefix: string = "suno_playlist"): void => {
    if (songs.length === 0) {
        alert("No songs in the playlist to export.");
        return;
    }

    const headers = ["Creator Handle", "Song Title", "Suno Song URL", "Image URL", "Play Count", "Upvote Count", "Comment Count", "Created At"];
    
    const rows = songs.map(song => [
        escapeCsvField(song.handle),
        escapeCsvField(song.title),
        escapeCsvField(song.suno_song_url),
        escapeCsvField(song.image_url),
        escapeCsvField(song.play_count),
        escapeCsvField(song.upvote_count),
        escapeCsvField(song.comment_count),
        escapeCsvField(song.created_at)
    ].join(","));

    const csvContent = headers.join(",") + "\n" + rows.join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.setAttribute("href", url);
    
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    link.setAttribute("download", `${filenamePrefix}_${dateStr}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};