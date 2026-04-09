
import React, { useState } from 'react';
import type { AggregatedStats, SongTrendData, SongEngagementData } from '@/types/sunoUserStatsTypes';
import type { SunoClip } from '@/types';
import ChartContainer from './charts/ChartContainer';
import DailySongCreationChart from './charts/DailySongCreationChart';
import TagUsageChart from './charts/TagUsageChart';
import TagVotesChart from './charts/TagVotesChart';
import GenreUsageChart from './charts/GenreUsageChart';
import GenreVotesChart from './charts/GenreVotesChart';
import UpvotesTrendChart from './charts/UpvotesTrendChart'; 
import PlaysTrendChart from './charts/PlaysTrendChart'; 
import FollowersTrendChart from './charts/FollowersTrendChart'; 
import CommentsTrendChart from './charts/CommentsTrendChart'; 
import SongTrendChart from './charts/SongTrendChart'; 
import SongsByDayOfWeekChart from './charts/SongsByDayOfWeekChart';
import SongsByHourOfDayChart from './charts/SongsByHourOfDayChart';
import TopSongsChart from './charts/TopSongsChart';
import PlayCountDistributionChart from './charts/PlayCountDistributionChart'; 
import UpvoteCountDistributionChart from './charts/UpvoteCountDistributionChart'; 
import TopEngagingSongsChart from './charts/TopEngagingSongsChart'; 
import TopCommentedSongsChart from './charts/TopCommentedSongsChart'; 
import CommentCountDistributionChart from './charts/CommentCountDistributionChart'; 
import TopSongsByCommentRateChart from './charts/TopSongsByCommentRateChart';
import TagGenrePerformanceTables from './charts/TagGenrePerformanceTables';
import PlaysUpvotesScatterPlot from './charts/PlaysUpvotesScatterPlot';
import CohortPerformanceTable from './charts/CohortPerformanceTable'; 
import TagPairPerformanceTable from './charts/TagPairPerformanceTable'; 
import PlaysCommentsScatterPlotChart from './charts/PlaysCommentsScatterPlot'; 
import SongDurationPerformanceTable from './charts/SongDurationPerformanceTable'; 
import { useTheme } from '@/context/ThemeContext'; // Import useTheme

const MIN_PLAYS_FOR_ENGAGEMENT_RATIO = 20; 

const FilterIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
  </svg>
);

interface StatChartsAreaProps {
  stats: AggregatedStats | null;
  username: string;
  topNValue: number; 
  onSetFilter: (filterType: string, filterValue: string) => void; 
}

type TrendPeriod = "sinceLastUpdate" | "last7Days" | "last30Days" | "overall";

const StatChartsArea: React.FC<StatChartsAreaProps> = ({ stats, username, topNValue, onSetFilter }) => {
  const [selectedPeriod, setSelectedPeriod] = useState<TrendPeriod>("sinceLastUpdate");
  const { theme, uiMode } = useTheme();

  if (!stats) {
    return <p className="text-gray-400 text-center py-4">No aggregated statistics available for @{username} to display charts.</p>;
  }

  // Dynamic colors based on theme
  const fontColor = theme === 'dark' ? '#e5e7eb' : '#1f2937'; // gray-200 vs gray-800
  const gridColor = theme === 'dark' ? '#374151' : '#e5e7eb'; // gray-700 vs gray-200

  const commonChartProps = {
    fontColor, 
    gridColor, 
  };

  const chartWithCoverArtMinHeight = 'min-h-[11rem] sm:min-h-[12rem] md:min-h-[14rem]';

  const periodOptions: { value: TrendPeriod; label: string }[] = [
    { value: "sinceLastUpdate", label: "Since Last Update" },
    { value: "last7Days", label: "Last 7 Days" },
    { value: "last30Days", label: "Last 30 Days" },
    { value: "overall", label: "Overall Top Songs" },
  ];

  let topUpvotesChartTitle = ''; let topUpvotesChartData: SongTrendData[] | SunoClip[] = [];
  let topUpvotesValueLabel = ""; let topUpvotesBarColor = "#FFA500"; 
  let topPlaysChartTitle = ''; let topPlaysChartData: SongTrendData[] | SunoClip[] = [];
  let topPlaysValueLabel = ""; let topPlaysBarColor = "#00CED1"; 

  switch (selectedPeriod) {
    case "sinceLastUpdate": 
      topUpvotesChartTitle = uiMode === 'architect' ? `Top Upvotes Increase (Since Last Update)` : `Top Likes Increase (Since Last Update)`; 
      topUpvotesChartData = stats.topUpvotesIncrease; 
      topUpvotesValueLabel = uiMode === 'architect' ? "Upvote Increase" : "Like Increase"; 
      topPlaysChartTitle = `Top Plays Increase (Since Last Update)`; 
      topPlaysChartData = stats.topPlaysIncrease; 
      topPlaysValueLabel = "Play Increase"; 
      break;
    case "last7Days": 
      topUpvotesChartTitle = uiMode === 'architect' ? `Top ${topNValue} Upvotes Increase (Last 7 Days)` : `Top ${topNValue} Likes Increase (Last 7 Days)`; 
      topUpvotesChartData = stats.topUpvotesIncrease7d; 
      topUpvotesValueLabel = uiMode === 'architect' ? "7-Day Upvote Increase" : "7-Day Like Increase"; 
      topPlaysChartTitle = `Top ${topNValue} Plays Increase (Last 7 Days)`; 
      topPlaysChartData = stats.topPlaysIncrease7d; 
      topPlaysValueLabel = "7-Day Play Increase"; 
      break;
    case "last30Days": 
      topUpvotesChartTitle = uiMode === 'architect' ? `Top ${topNValue} Upvotes Increase (Last 30 Days)` : `Top ${topNValue} Likes Increase (Last 30 Days)`; 
      topUpvotesChartData = stats.topUpvotesIncrease30d; 
      topUpvotesValueLabel = uiMode === 'architect' ? "30-Day Upvote Increase" : "30-Day Like Increase"; 
      topPlaysChartTitle = `Top ${topNValue} Plays Increase (Last 30 Days)`; 
      topPlaysChartData = stats.topPlaysIncrease30d; 
      topPlaysValueLabel = "30-Day Play Increase"; 
      break;
    case "overall": 
      topUpvotesChartTitle = uiMode === 'architect' ? `Top ${topNValue} Most Upvoted Songs (Overall)` : `Top ${topNValue} Most Liked Songs (Overall)`; 
      topUpvotesChartData = stats.topUpvotedSongs; 
      topUpvotesValueLabel = uiMode === 'architect' ? "Total Upvotes" : "Total Likes"; 
      topUpvotesBarColor = "#F472B6"; 
      topPlaysChartTitle = uiMode === 'architect' ? `Top ${topNValue} Most Played Songs (Overall)` : `Top ${topNValue} Most Played Songs`; 
      topPlaysChartData = stats.topPlayedSongs; 
      topPlaysValueLabel = "Total Plays"; 
      topPlaysBarColor = "#60A5FA"; 
      break;
  }

  return (
     <div className="space-y-8 mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-8">
         <ChartContainer title={uiMode === 'architect' ? "Upvotes Trend (Per Update)" : "Likes Trend"} tooltipText="Trend of the user's total likes over time, based on data snapshots collected by this tool at each update run."><UpvotesTrendChart data={stats.historicalUpvotes} lineColor="#ff4444" {...commonChartProps} /></ChartContainer>
        <ChartContainer title="Plays Trend (Per Update)" tooltipText="Trend of the user's total plays over time, based on data snapshots collected by this tool at each update run."><PlaysTrendChart data={stats.historicalPlays} lineColor="#44ff44" {...commonChartProps} /></ChartContainer>
        <ChartContainer title="Followers Trend (Per Update)" tooltipText="Trend of the user's total followers over time, based on data snapshots collected by this tool at each update run."><FollowersTrendChart data={stats.historicalFollowers} lineColor="#4444ff" {...commonChartProps} /></ChartContainer>
        <ChartContainer title="Comments Trend (Per Update)" tooltipText="Trend of the user's total comments on their songs over time, based on data snapshots collected by this tool at each update run."><CommentsTrendChart data={stats.historicalComments} lineColor="#FFCA28" {...commonChartProps} /></ChartContainer>
      </div>
      <p className="text-xs text-gray-500 mt-1 italic text-center"> Profile trends (Upvotes, Plays, Followers, Comments) show data collected by this tool at each update run. </p>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
        <ChartContainer title="Songs Created Per Day (Last 30 Days)" tooltipText="Number of songs created each day over the last 30 days, based on song `created_at` timestamps."><DailySongCreationChart data={stats.dailySongCreationCounts} lineColor="#FACC15" {...commonChartProps} /></ChartContainer>
        <ChartContainer title="Creations by Day of Week" tooltipText="Distribution of song creations across different days of the week. Click a bar to filter the song table."> <SongsByDayOfWeekChart data={stats.productivity.songsByDayOfWeek} barColor="#8B5CF6" {...commonChartProps} onSetFilter={(dayIndex) => onSetFilter('dayOfWeek', String(dayIndex))} /> </ChartContainer>
        <ChartContainer title="Creations by Hour of Day" tooltipText="Distribution of song creations across different hours of the day (user's local time). Click a bar to filter the song table."> <SongsByHourOfDayChart data={stats.productivity.songsByHourOfDay} barColor="#EC4899" {...commonChartProps} onSetFilter={(hour) => onSetFilter('hourOfDay', String(hour))} /> </ChartContainer>
      </div>
       <p className="text-xs text-gray-500 mt-1 italic text-center"> "Songs Created Per Day", "Creations by Day of Week", and "Creations by Hour of Day" charts are based on the `created_at` timestamps of the songs fetched from Suno. </p>
      
      <section className="mb-10 p-8 bg-white/5 border border-white/10 rounded-3xl relative group overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
        <label htmlFor="trendPeriodSelect" className="block text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500/60 mb-4 flex items-center gap-2">
           <FilterIcon className="w-3 h-3" /> {uiMode === 'architect' ? 'Temporal Buffer / Analysis Period' : 'Select Time Period'}
        </label>
        <div className="relative inline-block w-full sm:w-auto overflow-hidden">
          <select 
            id="trendPeriodSelect" 
            value={selectedPeriod} 
            onChange={(e) => setSelectedPeriod(e.target.value as TrendPeriod)} 
            className="w-full sm:w-80 px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-[11px] font-black uppercase tracking-widest text-white appearance-none focus:outline-none focus:border-emerald-500/30 transition-all cursor-pointer shadow-xl"
          >
            {periodOptions.map(option => (
              <option key={option.value} value={option.value} className="bg-gray-900 text-white">
                {option.label}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center px-6 pointer-events-none text-emerald-500/60">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </div>
        </div>
      </section>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
        <ChartContainer title={topUpvotesChartTitle} heightClassName={chartWithCoverArtMinHeight} tooltipText="Shows songs with the largest increase in upvotes during the selected period. 'Overall' shows top songs by total upvotes."> {selectedPeriod !== "overall" ? ( <SongTrendChart data={topUpvotesChartData as SongTrendData[]} valueLabel={topUpvotesValueLabel} barColor={topUpvotesBarColor} topNValue={topNValue} {...commonChartProps} /> ) : ( <TopSongsChart songs={topUpvotesChartData as SunoClip[]} metric="upvote_count" valueLabel={topUpvotesValueLabel} barColor={topUpvotesBarColor} topN={topNValue} {...commonChartProps} /> )} </ChartContainer>
        <ChartContainer title={topPlaysChartTitle} heightClassName={chartWithCoverArtMinHeight} tooltipText="Shows songs with the largest increase in plays during the selected period. 'Overall' shows top songs by total plays."> {selectedPeriod !== "overall" ? ( <SongTrendChart data={topPlaysChartData as SongTrendData[]} valueLabel={topPlaysValueLabel} barColor={topPlaysBarColor} topNValue={topNValue} {...commonChartProps} /> ) : ( <TopSongsChart songs={topPlaysChartData as SunoClip[]} metric="play_count" valueLabel={topPlaysValueLabel} barColor={topPlaysBarColor} topN={topNValue} {...commonChartProps} /> )} </ChartContainer>
      </div>
      <p className="text-xs text-gray-500 mt-1 italic text-center"> Top Song charts show increases for selected periods or overall top songs. Data is based on snapshots collected by this tool. </p>
      <div className="grid md:grid-cols-1 gap-8 mt-8">
        <ChartContainer title={uiMode === 'architect' ? `Top ${topNValue} Most Engaging Songs (Upvotes/Plays)` : `Top ${topNValue} Most Liked/Played Songs`} heightClassName={chartWithCoverArtMinHeight} tooltipText={`Songs ranked by Like Rate (Likes / Plays), for songs with at least ${MIN_PLAYS_FOR_ENGAGEMENT_RATIO} plays. Highlights songs with high engagement relative to plays.`}> <TopEngagingSongsChart data={stats.topEngagingSongs} barColor="#FB923C" topNValue={topNValue} {...commonChartProps} /> </ChartContainer>
      </div>
       <p className="text-xs text-gray-500 mt-1 italic text-center"> "Most Engaging Songs" are ranked by Upvote Rate (Upvotes / Plays), for songs with at least {MIN_PLAYS_FOR_ENGAGEMENT_RATIO} plays. </p>
      <div className="grid md:grid-cols-1 gap-8 mt-8">
        <ChartContainer title={`Top ${topNValue} Songs by Comment Rate (Comments/Plays)`} heightClassName={chartWithCoverArtMinHeight} tooltipText={`Songs ranked by Comment Rate (Comments per 100 Plays), for songs with at least ${MIN_PLAYS_FOR_ENGAGEMENT_RATIO} plays. Highlights songs that generate a lot of discussion.`}> <TopSongsByCommentRateChart data={stats.topSongsByCommentRate} barColor="#FACC15" topNValue={topNValue} {...commonChartProps} /> </ChartContainer>
      </div>
       <p className="text-xs text-gray-500 mt-1 italic text-center"> "Top Songs by Comment Rate" are ranked by Comment Rate (Comments per 100 Plays), for songs with at least {MIN_PLAYS_FOR_ENGAGEMENT_RATIO} plays. </p>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8 mt-8">
        <ChartContainer title="Play Count Distribution" tooltipText="Shows how many songs fall into different play count brackets."><PlayCountDistributionChart data={stats.playCountDistribution} barColor="#22D3EE" {...commonChartProps} /></ChartContainer>
        <ChartContainer title={uiMode === 'architect' ? "Upvote Count Distribution" : "Like Count Distribution"} tooltipText="Shows how many songs fall into different like count brackets."><UpvoteCountDistributionChart data={stats.upvoteCountDistribution} barColor="#A78BFA" {...commonChartProps} /></ChartContainer>
        <ChartContainer title="Comment Count Distribution" tooltipText="Shows how many songs fall into different comment count brackets."><CommentCountDistributionChart data={stats.commentCountDistribution} barColor="#FFECB3" {...commonChartProps} /></ChartContainer>
      </div>
      <p className="text-xs text-gray-500 mt-1 italic text-center"> Distribution charts show how many songs fall into different play/upvote/comment count brackets. </p>
      
      <div className="mt-8"> <CohortPerformanceTable cohortData={stats.cohortPerformance} /> </div>
      <p className="text-xs text-gray-500 mt-1 italic text-center"> Cohort Performance shows average metrics for songs created in different time periods. Rate calculations only include songs with at least {MIN_PLAYS_FOR_ENGAGEMENT_RATIO} plays in that cohort. </p>

      <div className="mt-8"> <TagPairPerformanceTable tagPairData={stats.tagPairPerformance} topN={topNValue} /> </div>
      <p className="text-xs text-gray-500 mt-1 italic text-center"> Tag Pair Performance shows average metrics for songs containing specific pairs of tags (min. 3 songs per pair). </p>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8 mt-8"> {/* Changed to 2 columns */}
        <ChartContainer title={uiMode === 'architect' ? "Song Performance: Plays vs. Upvotes" : "Performance: Plays vs. Likes"} heightClassName="h-80 sm:h-96 md:h-[28rem]" tooltipText="Visualizes each song by its total plays (X-axis) vs. total likes (Y-axis). The line indicates the user's overall average like rate. Helps identify high/low engagement songs."> <PlaysUpvotesScatterPlot songs={stats.topPlayedSongs.concat(stats.topUpvotedSongs).filter((v,i,a)=>a.findIndex(t=>(t.id === v.id))===i)} averageUpvoteRateOverall={stats.overallUpvoteRate} {...commonChartProps} /> </ChartContainer>
        <ChartContainer title="Song Performance: Plays vs. Comments" heightClassName="h-80 sm:h-96 md:h-[28rem]" tooltipText="Visualizes each song by its total plays (X-axis) vs. total comments (Y-axis). The line indicates the user's overall average comment rate (for songs >20 plays). Helps identify 'talkable' songs."> <PlaysCommentsScatterPlotChart songs={stats.topPlayedSongs.concat(stats.topUpvotedSongs).filter((v,i,a)=>a.findIndex(t=>(t.id === v.id))===i)} averageCommentRateOverall={stats.overallCommentRate} {...commonChartProps} /> </ChartContainer>
      </div>
       <p className="text-xs text-gray-500 mt-1 italic text-center"> Scatter Plots show songs based on their total plays and upvotes/comments. Line indicates overall average rate for the respective metric. </p>
      
      <div className="mt-8"> <SongDurationPerformanceTable durationPerformanceData={stats.songDurationPerformance} /> </div>
      <p className="text-xs text-gray-500 mt-1 italic text-center"> Song Duration Performance shows average metrics for songs categorized by their length. Rate calculations include songs with &gt;20 plays in that bucket. </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8 mt-8">
        <ChartContainer title={`Top ${topNValue} Most Used Tags`} tooltipText="Ranks tags by frequency of appearance across all fetched songs. Click a bar to filter the song table."><TagUsageChart data={stats.tagStats} barColorStart="#E8F5E9" barColorEnd="#2E7D32" topN={topNValue} {...commonChartProps} onSetFilter={(tagName) => onSetFilter('tag', tagName)} /></ChartContainer>
        <ChartContainer title={uiMode === 'architect' ? `Top ${topNValue} Most Voted Tags` : `Top ${topNValue} Most Liked Tags`} tooltipText="Ranks tags by the total likes received by songs associated with them. Click a bar to filter the song table."><TagVotesChart data={stats.tagStats} barColorStart="#F3E5F5" barColorEnd="#7B1FA2" topN={topNValue} {...commonChartProps} onSetFilter={(tagName) => onSetFilter('tag', tagName)}/></ChartContainer>
        <ChartContainer title={`Top ${topNValue} Most Commented Songs`} heightClassName={chartWithCoverArtMinHeight} tooltipText="Shows songs with the highest total number of comments."><TopCommentedSongsChart songs={stats.topCommentedSongs} valueLabel="Total Comments" barColor="#FFD54F" topN={topNValue} {...commonChartProps} /></ChartContainer>
      </div>
      <p className="text-xs text-gray-500 mt-1 italic text-center"> "Most Used Tags" shows tags by frequency of appearance. "Most Voted Tags" ranks tags by the total upvotes on songs associated with them. "Most Commented Songs" shows overall top commented songs. </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 mt-8">
        <ChartContainer title={`Top ${topNValue} Most Used Genres (Derived)`} tooltipText="'Genres (Derived)' are inferred from common genre keywords found within tags. This chart shows their usage frequency. Click a bar to filter the song table."><GenreUsageChart data={stats.genreStats} barColorStart="#E3F2FD" barColorEnd="#1565C0" topN={topNValue} {...commonChartProps} onSetFilter={(genreName) => onSetFilter('genre', genreName)}/></ChartContainer>
        <ChartContainer title={uiMode === 'architect' ? `Top ${topNValue} Most Voted Genres (Derived)` : `Top ${topNValue} Most Liked Genres`} tooltipText="'Genres (Derived)' are inferred from common genre keywords in tags. This chart ranks them by total likes on associated songs. Click a bar to filter the song table."><GenreVotesChart data={stats.genreStats} barColorStart="#FFF3E0" barColorEnd="#E65100" topN={topNValue} {...commonChartProps} onSetFilter={(genreName) => onSetFilter('genre', genreName)}/></ChartContainer>
      </div>
      <TagGenrePerformanceTables tagStats={stats.tagStats} genreStats={stats.genreStats} topN={topNValue} />
      <p className="text-xs text-gray-500 mt-1 italic text-center"> "Genres (Derived)" are inferred from common genre keywords found within tags. Usage and vote counts are aggregated based on these derived genres. </p>
      <p className="text-[9px] font-black uppercase tracking-widest text-gray-600 text-center mt-12 py-8 border-t border-white/5 max-w-2xl mx-auto italic opacity-60">
        {uiMode === 'architect' 
          ? 'Neural Latency Warning: Signal persistence is verified via local snapshots. Historical granularity is subject to Suno API architectural constraints.' 
          : 'Note: Historical data is based on snapshots saved in your browser. Accuracy depends on how often you update the stats.'}
      </p>
    </div>
  );
};
export default StatChartsArea;
