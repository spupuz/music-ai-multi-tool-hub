
import type { SunoProfileDetail, SunoClip } from '@/types';
import React from 'react';

export interface TagStat {
  name: string;
  count: number;
  totalUpvotes: number;
  totalPlays: number; 
  totalComments: number; 
  avgPlays: number;
  avgUpvotes: number;
  avgComments: number;
  avgUpvoteRate?: number; // New: (Total Upvotes for Tag / Total Plays for Tag) * 100
  avgCommentRate?: number; // New: (Total Comments for Tag / Total Plays for Tag) * 100
}

export interface GenreStat { 
  name: string;
  count: number;
  totalUpvotes: number;
  totalPlays: number;
  totalComments: number; 
  avgPlays: number;
  avgUpvotes: number;
  avgComments: number;
  avgUpvoteRate?: number; // New
  avgCommentRate?: number; // New
}

export interface ProductivityStats {
  songsByDayOfWeek: Record<string, number>; 
  songsByHourOfDay: Record<string, number>; 
  mostProductiveDay: string; 
  mostProductiveHour: string; 
}

export interface HistoricalDataPoint {
  timestamp: string; 
  value: number;
}

export interface DailyCreationStat {
  date: string; // YYYY-MM-DD
  count: number;
}

// For song-specific trend charts
export interface SongInteractionPoint {
  timestamp: string; // ISO Date string
  plays: number;
  upvotes: number;
  comment_count: number; 
}

export interface SongTrendData {
  song: SunoClip; 
  increase: number;
}

export interface SongEngagementData {
  song: SunoClip;
  upvoteRate: number; 
  commentRate?: number | null; 
}

// New Types for Data Nerd Enhancements
export interface CohortPerformanceData {
  cohortName: string; // e.g., "Last 7 Days", "8-30 Days Ago"
  songCount: number;
  avgPlays: number | null;
  avgUpvotes: number | null;
  avgComments: number | null;
  avgUpvoteRate: number | null; // For songs > 20 plays in cohort
  avgCommentRate: number | null; // For songs > 20 plays in cohort
}

export interface TagPairPerformanceData {
  tagPair: string; // e.g., "synthwave & 80s"
  songCount: number;
  avgPlays: number;
  avgUpvotes: number;
  avgComments: number;
}

export interface SongDurationPerformanceData {
  bucketName: string; // e.g., "Very Short (<60s)"
  songCount: number;
  avgPlays: number | null;
  avgUpvotes: number | null;
  avgComments: number | null;
  avgUpvoteRate: number | null; // For songs > 20 plays in bucket
}
// End New Types

export interface AggregatedStats {
  totalSongs: number;
  totalDurationSec: number;
  avgDurationSec: number;
  longestSong: SunoClip | null;
  shortestSong: SunoClip | null;
  
  tagStats: TagStat[];
  genreStats: GenreStat[]; 
  
  songsCreatedLast30Days: number;
  upvotesOnSongsCreatedLast30Days: number;
  playsOnSongsCreatedLast30Days: number;
  commentsOnSongsCreatedLast30Days: number; 
  
  productivity: ProductivityStats;
  dailySongCreationCounts: DailyCreationStat[];

  historicalUpvotes: HistoricalDataPoint[];
  historicalPlays: HistoricalDataPoint[];
  historicalFollowers: HistoricalDataPoint[];
  historicalComments: HistoricalDataPoint[]; 

  songInteractionHistory: Record<string, SongInteractionPoint[]>; 
  
  topUpvotesIncrease: SongTrendData[]; 
  topPlaysIncrease: SongTrendData[];   
  
  topUpvotesIncrease7d: SongTrendData[];
  topPlaysIncrease7d: SongTrendData[];
  topUpvotesIncrease30d: SongTrendData[];
  topPlaysIncrease30d: SongTrendData[];

  avgPlaysPerSong: number;
  avgUpvotesPerSong: number;
  avgCommentsPerSong: number; 
  overallUpvoteRate: number; 
  topPlayedSongs: SunoClip[];
  topUpvotedSongs: SunoClip[];
  topCommentedSongs: SunoClip[]; 

  followerGrowthRate7dPercentage: number | null;
  followerGrowthRate30dPercentage: number | null;
  followerAbsoluteIncrease7d: number | null; 
  followerAbsoluteIncrease30d: number | null; 

  avgSongUpvoteRate: number; 
  playCountDistribution: Record<string, number>; 
  upvoteCountDistribution: Record<string, number>; 
  commentCountDistribution: Record<string, number>; 
  topEngagingSongs: SongEngagementData[]; 
  
  avgCommentRatePer1000Plays: number | null;
  topSongsByCommentRate: SongEngagementData[];

  // New fields for Data Nerd Enhancements
  cohortPerformance: CohortPerformanceData[];
  tagPairPerformance: TagPairPerformanceData[];
  hitRatePlays: number | null; // Percentage
  hitRateUpvotes: number | null; // Percentage
  stdDevPlays: number | null;
  stdDevUpvotes: number | null;

  // For new features in this request
  overallCommentRate: number | null; // Average comment rate for songs > MIN_PLAYS_FOR_RATE_CALCS
  songDurationPerformance: SongDurationPerformanceData[];
}

export interface SunoUserStoredData {
  username: string; 
  profile: SunoProfileDetail;
  songs: SunoClip[]; 
  aggregatedStats: AggregatedStats;
  lastFetched: string; 
}

export interface SunoUserStatsDataHook {
    username: string;
    setUsername: React.Dispatch<React.SetStateAction<string>>;
    storedData: SunoUserStoredData | null;
    isLoading: boolean;
    error: string | null;
    progressMessage: string;
    fetchUserData: () => Promise<void>;
    updateUserData: () => Promise<void>;
    clearUserData: () => void;
    // getClearButtonText is managed by the component using the hook
}
