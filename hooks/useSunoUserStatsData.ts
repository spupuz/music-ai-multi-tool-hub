
import { useState, useCallback, useEffect, useRef } from 'react';
import type { ToolProps } from '../Layout';
import { fetchSunoSongsByUsername } from '../services/sunoService';
import type { 
    SunoUserStoredData, AggregatedStats, TagStat, GenreStat, ProductivityStats, 
    HistoricalDataPoint, DailyCreationStat, SongInteractionPoint, SongTrendData, SongEngagementData,
    CohortPerformanceData, TagPairPerformanceData, SongDurationPerformanceData
} from '../types/sunoUserStatsTypes';
import type { SunoClip, SunoProfileDetail } from '../types';
import { calculateStandardDeviation } from '../utils/mathUtils'; 

const TOOL_CATEGORY = 'SunoUserStats';
const LOCAL_STORAGE_PREFIX = 'sunoUserStats_';
const TOP_N_SONGS = 10; 
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
const NINETY_DAYS_MS = 90 * 24 * 60 * 60 * 1000; 
const MIN_PLAYS_FOR_RATE_CALCS = 20; 
const MIN_SONGS_FOR_TAG_PAIR = 3;


const calculateAggregatedStats = (
    profile: SunoProfileDetail, 
    songs: SunoClip[],
    currentFetchTimestamp: string, 
    previousAggregatedStats?: AggregatedStats
): AggregatedStats => {
    const totalSongs = songs.length;
    const currentFetchDateTime = new Date(currentFetchTimestamp).getTime();
    
    const updateHistoricalArray = (arr: HistoricalDataPoint[] | undefined, val: number | undefined): HistoricalDataPoint[] => {
        let base = arr ? [...arr] : []; 
        base = base.filter(dp => (currentFetchDateTime - new Date(dp.timestamp).getTime()) <= THIRTY_DAYS_MS);
        if (typeof val !== 'number' || isNaN(val)) return base;
        const filteredForCurrentFetch = base.filter(dp => dp.timestamp !== currentFetchTimestamp);
        filteredForCurrentFetch.push({ timestamp: currentFetchTimestamp, value: val });
        return filteredForCurrentFetch.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    };
    
    const emptyStatsBase: Omit<AggregatedStats, 'historicalUpvotes' | 'historicalPlays' | 'historicalFollowers' | 'historicalComments' | 'followerGrowthRate7dPercentage' | 'followerGrowthRate30dPercentage' | 'followerAbsoluteIncrease7d' | 'followerAbsoluteIncrease30d' | 'cohortPerformance' | 'tagPairPerformance' | 'hitRatePlays' | 'hitRateUpvotes' | 'stdDevPlays' | 'stdDevUpvotes' | 'overallCommentRate' | 'songDurationPerformance'> = {
        totalSongs: 0, totalDurationSec: 0, avgDurationSec: 0,
        longestSong: null, shortestSong: null,
        tagStats: [], genreStats: [],
        songsCreatedLast30Days: 0, upvotesOnSongsCreatedLast30Days: 0, playsOnSongsCreatedLast30Days: 0, commentsOnSongsCreatedLast30Days: 0,
        productivity: { songsByDayOfWeek: {'0':0,'1':0,'2':0,'3':0,'4':0,'5':0,'6':0}, songsByHourOfDay: {}, mostProductiveDay: 'N/A', mostProductiveHour: 'N/A' },
        dailySongCreationCounts: [],
        songInteractionHistory: previousAggregatedStats?.songInteractionHistory || {},
        topUpvotesIncrease: [], topPlaysIncrease: [],
        topUpvotesIncrease7d: [], topPlaysIncrease7d: [],
        topUpvotesIncrease30d: [], topPlaysIncrease30d: [],
        avgPlaysPerSong: 0, avgUpvotesPerSong: 0, avgCommentsPerSong: 0, overallUpvoteRate: 0,
        topPlayedSongs: [], topUpvotedSongs: [], topCommentedSongs: [],
        avgSongUpvoteRate: 0, playCountDistribution: {}, upvoteCountDistribution: {}, commentCountDistribution: {}, topEngagingSongs: [],
        avgCommentRatePer1000Plays: null, topSongsByCommentRate: [],
    };

    const updatedHistoricalUpvotes = updateHistoricalArray(previousAggregatedStats?.historicalUpvotes, profile.total_upvotes);
    const updatedHistoricalPlays = updateHistoricalArray(previousAggregatedStats?.historicalPlays, profile.total_plays);
    const updatedHistoricalFollowers = updateHistoricalArray(previousAggregatedStats?.historicalFollowers, profile.num_followers);
    
    let totalCommentsAggregate = 0;
    songs.forEach(song => { totalCommentsAggregate += song.comment_count || 0; });
    const updatedHistoricalComments = updateHistoricalArray(previousAggregatedStats?.historicalComments, totalCommentsAggregate);

    let followerGrowth7dPercentage: number | null = null; let followerGrowth30dPercentage: number | null = null;
    let followerAbsoluteIncrease7d: number | null = null; let followerAbsoluteIncrease30d: number | null = null;
    const currentFollowersNum = typeof profile.num_followers === 'number' ? profile.num_followers : null;
    if (currentFollowersNum !== null && updatedHistoricalFollowers.length > 0) {
        const findPastFollowers = (targetTime: number): number | null => {
            let pastDataPoint: HistoricalDataPoint | null = null;
            for (let i = updatedHistoricalFollowers.length - 2; i >= 0; i--) { if (new Date(updatedHistoricalFollowers[i].timestamp).getTime() <= targetTime) { pastDataPoint = updatedHistoricalFollowers[i]; break; } }
            if (!pastDataPoint && updatedHistoricalFollowers.length > 1 && updatedHistoricalFollowers[0].timestamp !== currentFetchTimestamp) { pastDataPoint = updatedHistoricalFollowers[0];}
            return pastDataPoint ? pastDataPoint.value : null;
        };
        const followers7dAgo = findPastFollowers(currentFetchDateTime - SEVEN_DAYS_MS);
        if (followers7dAgo !== null) { followerAbsoluteIncrease7d = currentFollowersNum - followers7dAgo; followerGrowth7dPercentage = followers7dAgo === 0 ? (currentFollowersNum > 0 ? null : 0) : ((currentFollowersNum - followers7dAgo) / followers7dAgo) * 100; }
        const followers30dAgo = findPastFollowers(currentFetchDateTime - THIRTY_DAYS_MS);
        if (followers30dAgo !== null) { followerAbsoluteIncrease30d = currentFollowersNum - followers30dAgo; followerGrowth30dPercentage = followers30dAgo === 0 ? (currentFollowersNum > 0 ? null : 0) : ((currentFollowersNum - followers30dAgo) / followers30dAgo) * 100; }
    }
    
    if (totalSongs === 0) {
        return {
            ...emptyStatsBase,
            historicalUpvotes: updatedHistoricalUpvotes, historicalPlays: updatedHistoricalPlays, historicalFollowers: updatedHistoricalFollowers, historicalComments: updatedHistoricalComments,
            followerGrowthRate7dPercentage: followerGrowth7dPercentage,
            followerGrowthRate30dPercentage: followerGrowth30dPercentage,
            followerAbsoluteIncrease7d, followerAbsoluteIncrease30d,
            cohortPerformance: [], tagPairPerformance: [], hitRatePlays: null, hitRateUpvotes: null, stdDevPlays: null, stdDevUpvotes: null,
            overallCommentRate: null, songDurationPerformance: [],
        };
    }

    let totalDurationSec = 0; let longestSong: SunoClip = songs[0]; let shortestSong: SunoClip = songs[0];
    const tagMap = new Map<string, { count: number; totalUpvotes: number; totalPlays: number; totalComments: number }>();
    const productivity: ProductivityStats = { songsByDayOfWeek: {'0':0,'1':0,'2':0,'3':0,'4':0,'5':0,'6':0}, songsByHourOfDay: {}, mostProductiveDay: 'N/A', mostProductiveHour: 'N/A' };
    for (let i = 0; i < 24; i++) productivity.songsByHourOfDay[i.toString()] = 0;
    const songCreationMap = new Map<string, number>();
    const newSongInteractionHistory: Record<string, SongInteractionPoint[]> = JSON.parse(JSON.stringify(previousAggregatedStats?.songInteractionHistory || {}));
    const playBuckets = {"0-10":0, "11-50":0, "51-100":0, "101-250":0, "251-500":0, "501-1k":0, "1k-5k":0, "5k+":0};
    const upvoteBuckets = {"0":0, "1-5":0, "6-10":0, "11-25":0, "26-50":0, "51-100":0, "100+":0};
    const commentBuckets = {"0":0, "1-2":0, "3-5":0, "6-10":0, "11-20":0, "21+":0};
    const topEngagingSongsList: SongEngagementData[] = []; const topCommentRateSongsList: SongEngagementData[] = [];
    let totalPlaysForRateCalcs = 0; let totalUpvotesForRateCalcs = 0; let totalCommentsForRateCalcs = 0; let songsMeetingRateThreshold = 0;
    
    const cohortData: Record<string, { songs: SunoClip[], plays: number, upvotes: number, comments: number, eligiblePlaysForRate: number, eligibleUpvotesForRate: number, eligibleCommentsForRate: number, eligibleSongsForRate: number }> = {
        "Last 7 Days": { songs: [], plays: 0, upvotes: 0, comments: 0, eligiblePlaysForRate: 0, eligibleUpvotesForRate: 0, eligibleCommentsForRate: 0, eligibleSongsForRate: 0 },
        "8-30 Days Ago": { songs: [], plays: 0, upvotes: 0, comments: 0, eligiblePlaysForRate: 0, eligibleUpvotesForRate: 0, eligibleCommentsForRate: 0, eligibleSongsForRate: 0 },
        "31-90 Days Ago": { songs: [], plays: 0, upvotes: 0, comments: 0, eligiblePlaysForRate: 0, eligibleUpvotesForRate: 0, eligibleCommentsForRate: 0, eligibleSongsForRate: 0 },
        "Older than 90 Days": { songs: [], plays: 0, upvotes: 0, comments: 0, eligiblePlaysForRate: 0, eligibleUpvotesForRate: 0, eligibleCommentsForRate: 0, eligibleSongsForRate: 0 },
    };
    const sevenDaysAgoMs = currentFetchDateTime - SEVEN_DAYS_MS; const thirtyDaysAgoMs = currentFetchDateTime - THIRTY_DAYS_MS; const ninetyDaysAgoMs = currentFetchDateTime - NINETY_DAYS_MS;
    const tagPairAggregates: Record<string, { count: number, totalPlays: number, totalUpvotes: number, totalComments: number, songIds: Set<string> }> = {};
    const allPlayCounts: number[] = []; const allUpvoteCounts: number[] = [];

    const durationBuckets: Record<string, { name: string, songs: SunoClip[], plays: number, upvotes: number, comments: number, eligiblePlaysForRate: number, eligibleUpvotesForRate: number, eligibleSongsForRate: number }> = {
        "Very Short (<60s)":       { name: "Very Short (<60s)", songs: [], plays: 0, upvotes: 0, comments: 0, eligiblePlaysForRate: 0, eligibleUpvotesForRate: 0, eligibleSongsForRate: 0 },
        "Short (60-119s)":       { name: "Short (60-119s)", songs: [], plays: 0, upvotes: 0, comments: 0, eligiblePlaysForRate: 0, eligibleUpvotesForRate: 0, eligibleSongsForRate: 0 },
        "Medium (120-179s)":     { name: "Medium (120-179s)", songs: [], plays: 0, upvotes: 0, comments: 0, eligiblePlaysForRate: 0, eligibleUpvotesForRate: 0, eligibleSongsForRate: 0 },
        "Long (180-239s)":       { name: "Long (180-239s)", songs: [], plays: 0, upvotes: 0, comments: 0, eligiblePlaysForRate: 0, eligibleUpvotesForRate: 0, eligibleSongsForRate: 0 },
        "Very Long (>=240s)":    { name: "Very Long (>=240s)", songs: [], plays: 0, upvotes: 0, comments: 0, eligiblePlaysForRate: 0, eligibleUpvotesForRate: 0, eligibleSongsForRate: 0 },
    };

    songs.forEach(song => {
        const duration = song.metadata?.duration || 0; totalDurationSec += duration;
        if (duration > (longestSong.metadata?.duration || 0)) longestSong = song; if (duration < (shortestSong.metadata?.duration || 0)) shortestSong = song;
        allPlayCounts.push(song.play_count || 0); allUpvoteCounts.push(song.upvote_count || 0);

        let durationBucketKey: string;
        if (duration < 60) durationBucketKey = "Very Short (<60s)";
        else if (duration < 120) durationBucketKey = "Short (60-119s)";
        else if (duration < 180) durationBucketKey = "Medium (120-179s)";
        else if (duration < 240) durationBucketKey = "Long (180-239s)";
        else durationBucketKey = "Very Long (>=240s)";
        durationBuckets[durationBucketKey].songs.push(song);
        durationBuckets[durationBucketKey].plays += song.play_count || 0;
        durationBuckets[durationBucketKey].upvotes += song.upvote_count || 0;
        durationBuckets[durationBucketKey].comments += song.comment_count || 0;
        if ((song.play_count || 0) >= MIN_PLAYS_FOR_RATE_CALCS) {
            durationBuckets[durationBucketKey].eligibleSongsForRate++;
            durationBuckets[durationBucketKey].eligiblePlaysForRate += song.play_count || 0;
            durationBuckets[durationBucketKey].eligibleUpvotesForRate += song.upvote_count || 0;
        }


        const tags = song.metadata?.tags?.split(',').map(t => t.trim().toLowerCase()).filter(t => t) || [];
        tags.forEach(tag => { const current = tagMap.get(tag) || {count:0,totalUpvotes:0,totalPlays:0,totalComments:0}; current.count++; current.totalUpvotes+=song.upvote_count||0; current.totalPlays+=song.play_count||0; current.totalComments+=song.comment_count||0; tagMap.set(tag, current); });
        if (tags.length >= 2) {
            for (let i = 0; i < tags.length; i++) { for (let j = i + 1; j < tags.length; j++) { const pair = [tags[i], tags[j]].sort().join(' & '); if (!tagPairAggregates[pair]) tagPairAggregates[pair] = { count:0,totalPlays:0,totalUpvotes:0,totalComments:0, songIds: new Set() }; if (!tagPairAggregates[pair].songIds.has(song.id)) { tagPairAggregates[pair].count++; tagPairAggregates[pair].songIds.add(song.id); } tagPairAggregates[pair].totalPlays += song.play_count || 0; tagPairAggregates[pair].totalUpvotes += song.upvote_count || 0; tagPairAggregates[pair].totalComments += song.comment_count || 0; } }
        }

        const createdAt = new Date(song.created_at); const createdAtMs = createdAt.getTime();
        productivity.songsByDayOfWeek[createdAt.getDay().toString()]++; productivity.songsByHourOfDay[createdAt.getHours().toString()]++;
        const dateStr = createdAt.toISOString().split('T')[0]; songCreationMap.set(dateStr, (songCreationMap.get(dateStr) || 0) + 1);

        let cohortKey: string;
        if (createdAtMs >= sevenDaysAgoMs) cohortKey = "Last 7 Days";
        else if (createdAtMs >= thirtyDaysAgoMs) cohortKey = "8-30 Days Ago";
        else if (createdAtMs >= ninetyDaysAgoMs) cohortKey = "31-90 Days Ago";
        else cohortKey = "Older than 90 Days";
        cohortData[cohortKey].songs.push(song); cohortData[cohortKey].plays += song.play_count || 0; cohortData[cohortKey].upvotes += song.upvote_count || 0; cohortData[cohortKey].comments += song.comment_count || 0;
        if ((song.play_count || 0) >= MIN_PLAYS_FOR_RATE_CALCS) { cohortData[cohortKey].eligibleSongsForRate++; cohortData[cohortKey].eligiblePlaysForRate += song.play_count || 0; cohortData[cohortKey].eligibleUpvotesForRate += song.upvote_count || 0; cohortData[cohortKey].eligibleCommentsForRate += song.comment_count || 0; }

        let songHistory = newSongInteractionHistory[song.id] || []; songHistory = songHistory.filter(dp => (currentFetchDateTime - new Date(dp.timestamp).getTime()) <= THIRTY_DAYS_MS);
        const lastPointInFilteredHistory = songHistory[songHistory.length - 1]; let shouldAddNewPoint = true;
        if (lastPointInFilteredHistory) { if (lastPointInFilteredHistory.timestamp === currentFetchTimestamp) { if (lastPointInFilteredHistory.plays===(song.play_count||0) && lastPointInFilteredHistory.upvotes===(song.upvote_count||0) && lastPointInFilteredHistory.comment_count===(song.comment_count||0)) {shouldAddNewPoint = false;} else {songHistory = songHistory.filter(dp => dp.timestamp !== currentFetchTimestamp);}} else { const lastPointDateStr = lastPointInFilteredHistory.timestamp.split('T')[0]; const currentFetchDateStr = currentFetchTimestamp.split('T')[0]; if (lastPointDateStr === currentFetchDateStr && lastPointInFilteredHistory.plays===(song.play_count||0) && lastPointInFilteredHistory.upvotes===(song.upvote_count||0) && lastPointInFilteredHistory.comment_count===(song.comment_count||0)) { shouldAddNewPoint = false;}}}
        if (shouldAddNewPoint) { songHistory.push({ timestamp: currentFetchTimestamp, plays: song.play_count||0, upvotes: song.upvote_count||0, comment_count: song.comment_count||0 });}
        songHistory.sort((a,b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()); newSongInteractionHistory[song.id] = songHistory;

        const plays = song.play_count || 0; const upvotes = song.upvote_count || 0; const comments = song.comment_count || 0;
        if (plays >= MIN_PLAYS_FOR_RATE_CALCS) { totalPlaysForRateCalcs += plays; totalUpvotesForRateCalcs += upvotes; totalCommentsForRateCalcs += comments; songsMeetingRateThreshold++; const upvoteRate = plays > 0 ? parseFloat(((upvotes / plays) * 100).toFixed(1)) : 0; topEngagingSongsList.push({ song, upvoteRate }); const commentRateVal = plays > 0 ? parseFloat(((comments / plays) * 100).toFixed(2)) : 0; topCommentRateSongsList.push({ song, upvoteRate, commentRate: commentRateVal }); }
        if (plays <= 10) playBuckets["0-10"]++; else if (plays <= 50) playBuckets["11-50"]++; else if (plays <= 100) playBuckets["51-100"]++; else if (plays <= 250) playBuckets["101-250"]++; else if (plays <= 500) playBuckets["251-500"]++; else if (plays <= 1000) playBuckets["501-1k"]++; else if (plays <= 5000) playBuckets["1k-5k"]++; else playBuckets["5k+"]++;
        if (upvotes === 0) upvoteBuckets["0"]++; else if (upvotes <= 5) upvoteBuckets["1-5"]++; else if (upvotes <= 10) upvoteBuckets["6-10"]++; else if (upvotes <= 25) upvoteBuckets["11-25"]++; else if (upvotes <= 50) upvoteBuckets["26-50"]++; else if (upvotes <= 100) upvoteBuckets["51-100"]++; else upvoteBuckets["100+"]++;
        if (comments === 0) commentBuckets["0"]++; else if (comments <= 2) commentBuckets["1-2"]++; else if (comments <= 5) commentBuckets["3-5"]++; else if (comments <= 10) commentBuckets["6-10"]++; else if (comments <= 20) commentBuckets["11-20"]++; else commentBuckets["21+"]++;
    });
    
    const avgDurationSec = totalSongs > 0 ? totalDurationSec / totalSongs : 0;
    const tagStats: TagStat[] = Array.from(tagMap.entries()).map(([name, data]) => ({ name, ...data, avgPlays:data.count>0?data.totalPlays/data.count:0, avgUpvotes:data.count>0?data.totalUpvotes/data.count:0, avgComments:data.count>0?data.totalComments/data.count:0, avgUpvoteRate: data.totalPlays > 0 ? (data.totalUpvotes / data.totalPlays) * 100 : 0, avgCommentRate: data.totalPlays > 0 ? (data.totalComments / data.totalPlays) * 100 : 0 }));
    const commonGenres = ['pop','rock','electronic','hip hop','jazz','classical','folk','metal','blues','r&b','reggae','country','funk','soul','disco','punk','ambient','techno','house','trance','synthwave','lo-fi','chiptune','drill','edm','idm','dnb','drum and bass','jungle','garage','grime','dubstep','trap','vaporwave','shoegaze','post-punk','indie','alternative'];
    const genreMap = new Map<string, { count:number; totalUpvotes:number; totalPlays:number; totalComments:number }>();
    tagStats.forEach(tag => { const pgs = tag.name.split(/\s+|-|\//); pgs.forEach(pg => { const nPg = pg.toLowerCase(); if(commonGenres.includes(nPg)){ const cur = genreMap.get(nPg) || {count:0,totalUpvotes:0,totalPlays:0,totalComments:0}; cur.count+=tag.count; cur.totalUpvotes+=tag.totalUpvotes; cur.totalPlays+=tag.totalPlays; cur.totalComments+=tag.totalComments; genreMap.set(nPg, cur); }});});
    const genreStats: GenreStat[] = Array.from(genreMap.entries()).map(([name,data]) => ({ name,...data, avgPlays:data.count>0?data.totalPlays/data.count:0, avgUpvotes:data.count>0?data.totalUpvotes/data.count:0, avgComments:data.count>0?data.totalComments/data.count:0, avgUpvoteRate: data.totalPlays > 0 ? (data.totalUpvotes / data.totalPlays) * 100 : 0, avgCommentRate: data.totalPlays > 0 ? (data.totalComments / data.totalPlays) * 100 : 0,}));
    const todayForCalc = new Date(currentFetchTimestamp); const thirtyDaysAgoDateForTotal = new Date(todayForCalc); thirtyDaysAgoDateForTotal.setDate(todayForCalc.getDate()-30);
    const songsCreatedLast30DaysList = songs.filter(s => new Date(s.created_at) >= thirtyDaysAgoDateForTotal);
    const songsCreatedLast30Days = songsCreatedLast30DaysList.length; const upvotesOnSongsCreatedLast30Days = songsCreatedLast30DaysList.reduce((s,c)=>s+(c.upvote_count||0),0); const playsOnSongsCreatedLast30Days = songsCreatedLast30DaysList.reduce((s,c)=>s+(c.play_count||0),0); const commentsOnSongsCreatedLast30Days = songsCreatedLast30DaysList.reduce((s,c)=>s+(c.comment_count||0),0);
    let maxDayCount = 0; let mpdIndex = -1; Object.entries(productivity.songsByDayOfWeek).forEach(([di,c])=>{if(c>maxDayCount){maxDayCount=c;mpdIndex=parseInt(di);}}); if (mpdIndex!==-1)productivity.mostProductiveDay = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][mpdIndex];
    let maxHourCount = 0; let mphIndex = -1; Object.entries(productivity.songsByHourOfDay).forEach(([hi,c])=>{if(c>maxHourCount){maxHourCount=c;mphIndex=parseInt(hi);}}); if (mphIndex!==-1)productivity.mostProductiveHour = `${String(mphIndex).padStart(2,'0')}:00 - ${String((mphIndex + 1) % 24).padStart(2,'0')}:00`;
    const dailySongCreationCounts: DailyCreationStat[] = []; for (let i=0;i<30;i++){const d=new Date(currentFetchTimestamp);d.setDate(d.getDate()-(29-i));const ds=d.toISOString().split('T')[0];dailySongCreationCounts.push({date:ds,count:songCreationMap.get(ds)||0});} dailySongCreationCounts.sort((a,b)=>new Date(a.date).getTime()-new Date(b.date).getTime());
    const calculateIncreaseSinceLastUpdate = (metric:'plays'|'upvotes'|'comment_count'): SongTrendData[] => { const td:SongTrendData[]=[]; songs.forEach(s=>{const h=newSongInteractionHistory[s.id]||[];if(h.length>=2){const l=h[h.length-1];const p=h[h.length-2];const i=(l[metric]||0)-(p[metric]||0);if(i>0)td.push({song:s,increase:i});}else if(h.length===1){const l=h[0];let pV=0;if(previousAggregatedStats?.songInteractionHistory){const oH=previousAggregatedStats.songInteractionHistory[s.id];if(oH&&oH.length>0)pV=oH[oH.length-1][metric]||0;}const i=(l[metric]||0)-pV;if(i>0)td.push({song:s,increase:i});}});return td.sort((a,b)=>b.increase-a.increase).slice(0,TOP_N_SONGS);};
    const calculateIncreaseForPeriod = (daysAgoMs: number, metric:'plays'|'upvotes'|'comment_count'): SongTrendData[] => { const td:SongTrendData[]=[]; const tSPS=currentFetchDateTime-daysAgoMs; songs.forEach(s=>{const h=newSongInteractionHistory[s.id]||[];if(h.length===0||new Date(h[h.length-1].timestamp).getTime()<tSPS)return; const lP=h[h.length-1];let hRP:SongInteractionPoint|null=null;for(let i=h.length-1;i>=0;i--){if(new Date(h[i].timestamp).getTime()<=tSPS){hRP=h[i];break;}}if(!hRP&&h.length>1){for(let i=0;i<h.length-1;i++){if(new Date(h[i].timestamp).getTime()>=tSPS){hRP=h[i];break;}}}if(!hRP&&new Date(s.created_at).getTime()>=tSPS)hRP={timestamp:s.created_at,plays:0,upvotes:0,comment_count:0};if(hRP&&lP.timestamp!==hRP.timestamp){const i=(lP[metric]||0)-(hRP[metric]||0);if(i>0)td.push({song:s,increase:i});}else if(!hRP&&lP[metric]>0&&new Date(s.created_at).getTime()>=tSPS){td.push({song:s,increase:lP[metric]});}});return td.sort((a,b)=>b.increase-a.increase).slice(0,TOP_N_SONGS);};
    const topUpvotesIncrease=calculateIncreaseSinceLastUpdate('upvotes'); const topPlaysIncrease=calculateIncreaseSinceLastUpdate('plays');
    const topUpvotesIncrease7d=calculateIncreaseForPeriod(SEVEN_DAYS_MS,'upvotes'); const topPlaysIncrease7d=calculateIncreaseForPeriod(SEVEN_DAYS_MS,'plays');
    const topUpvotesIncrease30d=calculateIncreaseForPeriod(THIRTY_DAYS_MS,'upvotes'); const topPlaysIncrease30d=calculateIncreaseForPeriod(THIRTY_DAYS_MS,'plays');
    const avgPlaysPerSong=totalSongs>0&&typeof profile.total_plays==='number'?profile.total_plays/totalSongs:0; const avgUpvotesPerSong=totalSongs>0&&typeof profile.total_upvotes==='number'?profile.total_upvotes/totalSongs:0; const avgCommentsPerSong=totalSongs>0?totalCommentsAggregate/totalSongs:0; const overallUpvoteRate=typeof profile.total_plays==='number'&&profile.total_plays>0&&typeof profile.total_upvotes==='number'?(profile.total_upvotes/profile.total_plays)*100:0;
    const topPlayedSongs=[...songs].sort((a,b)=>(b.play_count||0)-(a.play_count||0)).slice(0,TOP_N_SONGS); const topUpvotedSongs=[...songs].sort((a,b)=>(b.upvote_count||0)-(a.upvote_count||0)).slice(0,TOP_N_SONGS); const topCommentedSongs=[...songs].sort((a,b)=>(b.comment_count||0)-(a.comment_count||0)).slice(0,TOP_N_SONGS);
    const avgSongUpvoteRate=songsMeetingRateThreshold>0?(totalUpvotesForRateCalcs/totalPlaysForRateCalcs)*100:0; const sortedTopEngagingSongs=topEngagingSongsList.sort((a,b)=>b.upvoteRate-a.upvoteRate).slice(0,TOP_N_SONGS);
    const avgCommentRatePer1000Plays=totalPlaysForRateCalcs>0?(totalCommentsForRateCalcs/totalPlaysForRateCalcs)*1000:null; const sortedTopSongsByCommentRate=topCommentRateSongsList.filter(s=>s.commentRate!==undefined&&s.commentRate!==null).sort((a,b)=>(b.commentRate||0)-(a.commentRate||0)).slice(0,TOP_N_SONGS);
    
    const overallCommentRateValue = songsMeetingRateThreshold > 0 && totalPlaysForRateCalcs > 0 ? (totalCommentsForRateCalcs / totalPlaysForRateCalcs) * 100 : null;

    const songDurationPerformance: SongDurationPerformanceData[] = Object.entries(durationBuckets).map(([bucketName, data]) => ({
        bucketName,
        songCount: data.songs.length,
        avgPlays: data.songs.length > 0 ? data.plays / data.songs.length : null,
        avgUpvotes: data.songs.length > 0 ? data.upvotes / data.songs.length : null,
        avgComments: data.songs.length > 0 ? data.comments / data.songs.length : null,
        avgUpvoteRate: data.eligibleSongsForRate > 0 && data.eligiblePlaysForRate > 0 ? (data.eligibleUpvotesForRate / data.eligiblePlaysForRate) * 100 : null,
    }));

    const cohortPerformance: CohortPerformanceData[] = Object.entries(cohortData).map(([cohortName, data]) => ({
        cohortName, songCount: data.songs.length,
        avgPlays: data.songs.length > 0 ? data.plays / data.songs.length : null,
        avgUpvotes: data.songs.length > 0 ? data.upvotes / data.songs.length : null,
        avgComments: data.songs.length > 0 ? data.comments / data.songs.length : null,
        avgUpvoteRate: data.eligibleSongsForRate > 0 && data.eligiblePlaysForRate > 0 ? (data.eligibleUpvotesForRate / data.eligiblePlaysForRate) * 100 : null,
        avgCommentRate: data.eligibleSongsForRate > 0 && data.eligiblePlaysForRate > 0 ? (data.eligibleCommentsForRate / data.eligiblePlaysForRate) * 100 : null,
    }));
    
    const tagPairPerformance: TagPairPerformanceData[] = Object.entries(tagPairAggregates)
        .filter(([_, data]) => data.count >= MIN_SONGS_FOR_TAG_PAIR)
        .map(([tagPair, data]) => ({
            tagPair, songCount: data.count,
            avgPlays: data.count > 0 ? data.totalPlays / data.count : 0,
            avgUpvotes: data.count > 0 ? data.totalUpvotes / data.count : 0,
            avgComments: data.count > 0 ? data.totalComments / data.count : 0,
        })).sort((a,b) => b.songCount - a.songCount || b.avgPlays - a.avgPlays);

    const hitRatePlays = totalSongs > 0 ? (songs.filter(s => (s.play_count || 0) > avgPlaysPerSong).length / totalSongs) * 100 : null;
    const hitRateUpvotes = totalSongs > 0 ? (songs.filter(s => (s.upvote_count || 0) > avgUpvotesPerSong).length / totalSongs) * 100 : null;
    const stdDevPlays = calculateStandardDeviation(allPlayCounts, avgPlaysPerSong);
    const stdDevUpvotes = calculateStandardDeviation(allUpvoteCounts, avgUpvotesPerSong);

    return {
        totalSongs, totalDurationSec, avgDurationSec, longestSong, shortestSong,
        tagStats, genreStats, songsCreatedLast30Days, upvotesOnSongsCreatedLast30Days,
        playsOnSongsCreatedLast30Days, commentsOnSongsCreatedLast30Days, 
        productivity, dailySongCreationCounts, 
        historicalUpvotes: updatedHistoricalUpvotes, historicalPlays: updatedHistoricalPlays, historicalFollowers: updatedHistoricalFollowers, historicalComments: updatedHistoricalComments,
        songInteractionHistory: newSongInteractionHistory, 
        topUpvotesIncrease, topPlaysIncrease, topUpvotesIncrease7d, topPlaysIncrease7d,
        topUpvotesIncrease30d, topPlaysIncrease30d,
        avgPlaysPerSong, avgUpvotesPerSong, avgCommentsPerSong, overallUpvoteRate, topPlayedSongs, topUpvotedSongs, topCommentedSongs,
        followerGrowthRate7dPercentage: followerGrowth7dPercentage, 
        followerGrowthRate30dPercentage: followerGrowth30dPercentage, 
        followerAbsoluteIncrease7d, followerAbsoluteIncrease30d,
        avgSongUpvoteRate: parseFloat(avgSongUpvoteRate.toFixed(2)),
        playCountDistribution: playBuckets, upvoteCountDistribution: upvoteBuckets, commentCountDistribution: commentBuckets,
        topEngagingSongs: sortedTopEngagingSongs,
        avgCommentRatePer1000Plays: avgCommentRatePer1000Plays !== null ? parseFloat(avgCommentRatePer1000Plays.toFixed(2)) : null,
        topSongsByCommentRate: sortedTopSongsByCommentRate,
        overallCommentRate: overallCommentRateValue !== null ? parseFloat(overallCommentRateValue.toFixed(2)) : null,
        songDurationPerformance,
        cohortPerformance, tagPairPerformance,
        hitRatePlays: hitRatePlays !== null ? parseFloat(hitRatePlays.toFixed(1)) : null,
        hitRateUpvotes: hitRateUpvotes !== null ? parseFloat(hitRateUpvotes.toFixed(1)) : null,
        stdDevPlays: stdDevPlays !== null ? parseFloat(stdDevPlays.toFixed(1)) : null,
        stdDevUpvotes: stdDevUpvotes !== null ? parseFloat(stdDevUpvotes.toFixed(1)) : null,
    };
};

export const useSunoUserStatsData = (passedTrackLocalEvent: ToolProps['trackLocalEvent']) => {
  const [username, setUsername] = useState<string>('');
  const [storedData, setStoredData] = useState<SunoUserStoredData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [progressMessage, setProgressMessage] = useState<string>('');
  const [exportImportStatusMessage, setExportImportStatusMessage] = useState<string>(''); // New state
  const lastSubmittedUsernameRef = useRef<string>('');

  const loadStoredData = useCallback((userToLoad: string) => {
    const normalizedUser = userToLoad.trim().toLowerCase().replace(/^@/, '');
    if (!normalizedUser) return;
    try {
      const dataStr = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}${normalizedUser}`);
      if (dataStr) {
        const parsedData: SunoUserStoredData = JSON.parse(dataStr);
        setStoredData(parsedData); setError(null);
        lastSubmittedUsernameRef.current = normalizedUser;
      } else { setStoredData(null); }
    } catch (e) { console.error("Error loading data:", e); setError("Failed to load stored data."); setStoredData(null); }
  }, []);

  useEffect(() => {
    if (username.trim()) {
        let userToProcess = username.trim().toLowerCase();
        const profileUrlPattern = /^(?:https?:\/\/)?(?:www\.)?(?:suno\.com|app\.suno\.ai)\/@([\w.-]+)/;
        const profileUrlMatch = userToProcess.match(profileUrlPattern);
        if (profileUrlMatch && profileUrlMatch[1]) {
            userToProcess = profileUrlMatch[1]; 
        } else {
            userToProcess = userToProcess.replace(/^@/, ''); 
        }
        if (userToProcess !== lastSubmittedUsernameRef.current) {
            loadStoredData(userToProcess);
        }
    }
  }, [username, loadStoredData]);

  const fetchDataInternal = useCallback(async (userToFetch: string, isUpdate: boolean = false) => {
    const localTracker = passedTrackLocalEvent; 
    let normalizedUser = userToFetch.trim().toLowerCase();
    const profileUrlPatternInternal = /^(?:https?:\/\/)?(?:www\.)?(?:suno\.com|app\.suno\.ai)\/@([\w.-]+)/;
    const profileUrlMatchInternal = normalizedUser.match(profileUrlPatternInternal);

    if (profileUrlMatchInternal && profileUrlMatchInternal[1]) {
        normalizedUser = profileUrlMatchInternal[1];
    } else {
        normalizedUser = normalizedUser.replace(/^@/, '');
    }

    if (!normalizedUser) { setError("Please enter a valid username or Suno profile URL."); return; }
    setIsLoading(true); setError(null);
    setProgressMessage(isUpdate ? `Updating @${normalizedUser}...` : `Fetching @${normalizedUser}...`);
    const previousDataForUpdate = isUpdate ? storedData : null;
    if(!isUpdate) setStoredData(null);

    try {
      const { clips, profileDetail } = await fetchSunoSongsByUsername(normalizedUser, (msg, ld, tot) => setProgressMessage(tot ? `${msg} (${ld}/${tot})` : msg));
      if (!profileDetail) throw new Error(`Profile @${normalizedUser} not found or API error.`);
      
      const currentFetchTime = new Date().toISOString();
      const aggregatedStats = calculateAggregatedStats(profileDetail, clips, currentFetchTime, previousDataForUpdate?.aggregatedStats);
      const newData: SunoUserStoredData = {
        username: normalizedUser, profile: profileDetail, songs: clips, 
        aggregatedStats, lastFetched: currentFetchTime,
      };
      localStorage.setItem(`${LOCAL_STORAGE_PREFIX}${normalizedUser}`, JSON.stringify(newData));
      setStoredData(newData); lastSubmittedUsernameRef.current = normalizedUser; 
      setProgressMessage(isUpdate ? `Updated @${normalizedUser}!` : `Fetched @${normalizedUser}!`);
      if (typeof localTracker === 'function') {
        localTracker(TOOL_CATEGORY, isUpdate ? 'dataUpdated' : 'dataFetched', normalizedUser, clips.length);
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Unknown error.";
      setError(errMsg); if(!isUpdate && !previousDataForUpdate) setStoredData(null);
      setProgressMessage(''); 
      if (typeof localTracker === 'function') {
        localTracker(TOOL_CATEGORY, 'fetchFailed', normalizedUser, 1);
      }
    } finally {
      setIsLoading(false); setTimeout(() => setProgressMessage(''), 3000); 
    }
  }, [passedTrackLocalEvent, storedData]); 

  const fetchUserData = useCallback(async () => {
    let userToProcess = username.trim().toLowerCase();
    const profileUrlPattern = /^(?:https?:\/\/)?(?:www\.)?(?:suno\.com|app\.suno\.ai)\/@([\w.-]+)/;
    const profileUrlMatch = userToProcess.match(profileUrlPattern);
    if (profileUrlMatch && profileUrlMatch[1]) {
        userToProcess = profileUrlMatch[1];
    } else {
        userToProcess = userToProcess.replace(/^@/, '');
    }

    if (userToProcess === lastSubmittedUsernameRef.current && storedData && !error) return;
    await fetchDataInternal(username, false); 
  }, [username, storedData, error, fetchDataInternal]);

  const updateUserData = useCallback(async () => {
    if (storedData?.username) await fetchDataInternal(storedData.username, true);
    else if (username.trim()) await fetchDataInternal(username, false); 
    else setError("No user data loaded to update.");
  }, [storedData, username, fetchDataInternal]); 

  const clearUserData = useCallback(() => {
    if (!storedData?.username) return;
    try {
      localStorage.removeItem(`${LOCAL_STORAGE_PREFIX}${storedData.username}`);
      setStoredData(null); setError(null);      
      lastSubmittedUsernameRef.current = ''; 
      setProgressMessage(`Data for @${storedData.username} cleared.`); 
      if (typeof passedTrackLocalEvent === 'function') {
        passedTrackLocalEvent(TOOL_CATEGORY, 'dataCleared', storedData.username, 1);
      }
      setTimeout(() => setProgressMessage(''), 3000);
    } catch (e) { console.error("Error clearing data:", e); setError("Failed to clear data."); }
  }, [storedData, passedTrackLocalEvent]); 

  const exportUserDataSnapshot = useCallback(() => {
    if (!storedData) {
      setExportImportStatusMessage("No data loaded to export.");
      setTimeout(() => setExportImportStatusMessage(''), 3000);
      return;
    }
    try {
      const jsonString = JSON.stringify(storedData, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      link.download = `suno_user_stats_data_${storedData.username}_${dateStr}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setExportImportStatusMessage(`User stats for @${storedData.username} exported successfully!`);
      passedTrackLocalEvent(TOOL_CATEGORY, 'userDataExported', storedData.username);
    } catch (error) {
      console.error("Error exporting user data:", error);
      setExportImportStatusMessage("Failed to export user data. See console for details.");
    }
    setTimeout(() => setExportImportStatusMessage(''), 3000);
  }, [storedData, passedTrackLocalEvent]);

  const importUserDataSnapshot = useCallback((file: File) => {
    if (!file) {
      setExportImportStatusMessage("No file selected for import.");
      setTimeout(() => setExportImportStatusMessage(''), 3000);
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const importedData: SunoUserStoredData = JSON.parse(text);

        // Basic validation
        if (
          !importedData || typeof importedData !== 'object' ||
          typeof importedData.username !== 'string' || !importedData.username.trim() ||
          typeof importedData.profile !== 'object' || 
          !Array.isArray(importedData.songs) ||
          // FIX: Add null check for aggregatedStats to prevent spread operator error on null.
          !importedData.aggregatedStats || typeof importedData.aggregatedStats !== 'object' ||
          typeof importedData.lastFetched !== 'string'
        ) {
          throw new Error("Invalid file structure or missing key fields.");
        }

        const usernameToImport = importedData.username;
        const existingDataStr = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}${usernameToImport}`);

        if (!existingDataStr) {
            // No existing data, just save the imported data
            setStoredData(importedData);
            setUsername(importedData.username);
            localStorage.setItem(`${LOCAL_STORAGE_PREFIX}${usernameToImport}`, JSON.stringify(importedData));
            lastSubmittedUsernameRef.current = usernameToImport;
            setExportImportStatusMessage(`Data for @${usernameToImport} imported successfully!`);
        } else {
            // Data exists, overwrite for simplicity
            setStoredData(importedData);
            setUsername(importedData.username);
            localStorage.setItem(`${LOCAL_STORAGE_PREFIX}${usernameToImport}`, JSON.stringify(importedData));
            lastSubmittedUsernameRef.current = usernameToImport;
            setExportImportStatusMessage(`Data for @${usernameToImport} imported (overwrote existing)!`);
        }
        
        if (typeof passedTrackLocalEvent === 'function') {
             passedTrackLocalEvent(TOOL_CATEGORY, 'userDataImported', importedData.username);
        }

      } catch (err) {
        console.error("Error parsing imported JSON:", err);
        setExportImportStatusMessage(`Error importing: ${err instanceof Error ? err.message : "Invalid format"}`);
      }
      setTimeout(() => setExportImportStatusMessage(''), 3000);
    };
    reader.readAsText(file);
  }, [passedTrackLocalEvent]);

  return {
    username, setUsername, storedData, isLoading, error, progressMessage,
    fetchUserData, updateUserData, clearUserData,
    exportUserDataSnapshot, importUserDataSnapshot, exportImportStatusMessage
  };
};
