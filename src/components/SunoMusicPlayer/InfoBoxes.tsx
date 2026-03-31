import React from 'react';
import type { SunoProfileDetail, SunoPlaylistDetail } from '@/types';
import { TotalPlaysIcon, TotalUpvotesIcon, TotalCommentsProfileIcon, FollowersIcon, ClipsIcon, PlaylistIcon } from './Icons';

export const ProfileInfoBox: React.FC<{ detail: SunoProfileDetail }> = ({ detail }) => (
  <div className="mb-6 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 flex flex-col md:flex-row items-start md:items-center gap-6"> 
    {detail.user_id !== "custom_list_synthetic_id" && detail.image_url && (
      <img src={detail.image_url || 'https://via.placeholder.com/128?text=No+Avatar'} alt={`${detail.display_name}'s avatar`} className="w-32 h-32 rounded-full object-cover border-2 border-green-500 shadow-md flex-shrink-0 mx-auto md:mx-0" />
    )} 
    <div className="flex-1 text-center md:text-left min-w-0"> 
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white truncate" title={detail.display_name}>{detail.display_name}</h2> 
      {detail.user_id !== "custom_list_synthetic_id" && detail.handle && (
        <p className="text-lg text-green-600 dark:text-green-400 mb-1 truncate" title={`@${detail.handle}`}>@{detail.handle}</p>
      )} 
      {detail.user_id !== "custom_list_synthetic_id" && detail.bio && <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 leading-relaxed text-left">{detail.bio}</p>} 
      <div className="flex items-center justify-center md:justify-start gap-x-4 gap-y-2 flex-wrap text-sm text-gray-700 dark:text-gray-200"> 
        {typeof detail.total_plays === 'number' && (
          <div className="flex items-center" title={`Total Plays: ${detail.total_plays.toLocaleString()}`}>
            <TotalPlaysIcon /> 
            <span className="ml-1.5 truncate min-w-0">{detail.total_plays.toLocaleString()}</span>
            <span className="ml-1 text-xs text-gray-500 dark:text-gray-400 flex-shrink-0 whitespace-nowrap">Total Plays</span>
          </div>
        )} 
        {typeof detail.total_upvotes === 'number' && (
          <div className="flex items-center" title={`Total Upvotes: ${detail.total_upvotes.toLocaleString()}`}>
            <TotalUpvotesIcon /> 
            <span className="ml-1.5 truncate min-w-0">{detail.total_upvotes.toLocaleString()}</span>
            <span className="ml-1 text-xs text-gray-500 dark:text-gray-400 flex-shrink-0 whitespace-nowrap">Total Upvotes</span>
          </div>
        )} 
        {typeof detail.total_comments === 'number' && (
          <div className="flex items-center" title={`Total Comments: ${detail.total_comments.toLocaleString()}`}>
            <TotalCommentsProfileIcon /> 
            <span className="ml-1.5 truncate min-w-0">{detail.total_comments.toLocaleString()}</span><span className="ml-1 text-xs text-gray-500 dark:text-gray-400 flex-shrink-0 whitespace-nowrap">Total Comments</span>
          </div>
        )} 
        {detail.user_id !== "custom_list_synthetic_id" && typeof detail.num_followers === 'number' && (
          <div className="flex items-center" title={`Followers: ${detail.num_followers.toLocaleString()}`}>
            <FollowersIcon /> 
            <span className="ml-1.5 truncate min-w-0">{detail.num_followers.toLocaleString()}</span><span className="ml-1 text-xs text-gray-500 dark:text-gray-400 flex-shrink-0 whitespace-nowrap">Followers</span>
          </div>
        )} 
        {typeof detail.num_total_clips === 'number' && (
          <div className="flex items-center" title={`Total Clips: ${detail.num_total_clips.toLocaleString()}`}>
            <ClipsIcon /> 
            <span className="ml-1.5 truncate min-w-0">{detail.num_total_clips.toLocaleString()}</span><span className="ml-1 text-xs text-gray-500 dark:text-gray-400 flex-shrink-0 whitespace-nowrap">Total Clips</span>
          </div>
        )} 
      </div> 
    </div> 
  </div>
);

export const PlaylistInfoBox: React.FC<{ detail: SunoPlaylistDetail }> = ({ detail }) => (
  <div className="mb-6 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 flex flex-col md:flex-row items-start md:items-center gap-6"> 
    <img src={detail.image_url || detail.creator_avatar_image_url || 'https://via.placeholder.com/128?text=No+Artwork'} alt={`${detail.name || 'Playlist'}'s artwork`} className="w-32 h-32 rounded-lg object-cover border-2 border-green-500 shadow-md flex-shrink-0 mx-auto md:mx-0" /> 
    <div className="flex-1 text-center md:text-left min-w-0"> 
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white truncate" title={detail.name || 'Untitled Playlist'}> 
        <a href={detail.suno_playlist_url} target="_blank" rel="noopener noreferrer" className="hover:underline"> {detail.name || 'Untitled Playlist'} </a> 
      </h2> 
      {detail.creator_handle && detail.creator_display_name && (
        <p className="text-md text-green-600 dark:text-green-400 mb-1 truncate" title={`Created by @${detail.creator_handle}`}> 
          by <a href={detail.suno_creator_url} target="_blank" rel="noopener noreferrer" className="hover:underline"> {detail.creator_display_name} (@{detail.creator_handle}) </a> 
        </p>
      )} 
      {detail.description && <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 leading-relaxed text-left max-h-20 overflow-y-auto">{detail.description}</p>} 
      <div className="flex items-center justify-center md:justify-start gap-x-4 gap-y-2 flex-wrap text-sm text-gray-700 dark:text-gray-200"> 
        {typeof detail.playlist_upvote_count === 'number' && (
          <div className="flex items-center" title={`Playlist Upvotes: ${detail.playlist_upvote_count.toLocaleString()}`}> 
            <TotalUpvotesIcon className="w-4 h-4 text-yellow-500 dark:text-yellow-400 mr-1.5 flex-shrink-0" /> 
            <span className="text-lg font-semibold text-gray-900 dark:text-white mr-1.5">{detail.playlist_upvote_count.toLocaleString()}</span> 
            <div className="text-xs text-gray-500 dark:text-gray-400 leading-tight"> 
              <span>Playlist</span><br /><span>Upvotes</span> 
            </div> 
          </div>
        )} 
        <div className="flex items-center" title={`Songs in Playlist: ${detail.num_songs.toLocaleString()}`}>
          <PlaylistIcon /> 
          <span className="ml-1.5 truncate">{detail.num_songs.toLocaleString()}</span>
          <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">Songs</span>
        </div> 
        <div className="flex items-center" title={`Total Plays (All Songs): ${detail.total_clip_plays.toLocaleString()}`}>
          <TotalPlaysIcon /> 
          <span className="ml-1.5 truncate">{detail.total_clip_plays.toLocaleString()}</span>
          <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">Total Plays</span>
        </div> 
        <div className="flex items-center" title={`Total Upvotes (All Songs): ${detail.total_clip_upvotes.toLocaleString()}`}>
          <TotalUpvotesIcon /> 
          <span className="ml-1.5 truncate">{detail.total_clip_upvotes.toLocaleString()}</span>
          <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">Total Upvotes</span>
        </div> 
        <div className="flex items-center" title={`Total Comments (All Songs): ${detail.total_clip_comments.toLocaleString()}`}>
          <TotalCommentsProfileIcon /> 
          <span className="ml-1.5 truncate">{detail.total_clip_comments.toLocaleString()}</span>
          <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">Total Comments</span>
        </div> 
      </div> 
    </div> 
  </div>
);
