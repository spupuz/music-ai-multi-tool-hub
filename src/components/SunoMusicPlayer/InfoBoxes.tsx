import React from 'react';
import type { SunoProfileDetail, SunoPlaylistDetail } from '@/types';
import { TotalPlaysIcon, TotalUpvotesIcon, TotalCommentsProfileIcon, FollowersIcon, ClipsIcon, PlaylistIcon } from './Icons';
import { useTheme } from '@/context/ThemeContext';

export const ProfileInfoBox: React.FC<{ detail: SunoProfileDetail }> = ({ detail }) => {
  const { uiMode } = useTheme();
  
  if (uiMode === 'classic') {
    return (
      <div className="mb-6 bg-white dark:bg-gray-800 p-6 rounded-lg border-2 border-gray-200 dark:border-green-600/30 flex flex-col md:flex-row items-center md:items-center gap-8 shadow-md"> 
        {detail.user_id !== "custom_list_synthetic_id" && detail.image_url && (
          <img src={detail.image_url || 'https://via.placeholder.com/128?text=No+Avatar'} alt={`${detail.display_name}'s avatar`} className="w-32 h-32 rounded-full object-cover border-4 border-green-600 shadow-lg flex-shrink-0" />
        )} 
        <div className="flex-1 text-center md:text-left min-w-0"> 
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white truncate mb-1" title={detail.display_name}>{detail.display_name}</h2> 
          {detail.user_id !== "custom_list_synthetic_id" && detail.handle && (
            <p className="text-xl font-bold text-green-600 dark:text-green-600 mb-3 truncate" title={`@${detail.handle}`}>@{detail.handle}</p>
          )} 
          {detail.user_id !== "custom_list_synthetic_id" && detail.bio && <p className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">{detail.bio}</p>} 
          <div className="flex items-center justify-center md:justify-start gap-x-6 gap-y-3 flex-wrap text-sm text-gray-700 dark:text-gray-200"> 
            {typeof detail.total_plays === 'number' && (
              <div className="flex items-center group" title={`Total Plays: ${detail.total_plays.toLocaleString()}`}>
                <TotalPlaysIcon className="w-4 h-4 text-green-600 mr-2" /> 
                <span className="font-bold tabular-nums">{detail.total_plays.toLocaleString()}</span>
                <span className="ml-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-500">Plays</span>
              </div>
            )} 
            {typeof detail.total_upvotes === 'number' && (
              <div className="flex items-center group" title={`Total Upvotes: ${detail.total_upvotes.toLocaleString()}`}>
                <TotalUpvotesIcon className="w-4 h-4 text-yellow-600 mr-2" /> 
                <span className="font-bold tabular-nums">{detail.total_upvotes.toLocaleString()}</span>
                <span className="ml-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-500">Upvotes</span>
              </div>
            )} 
            {detail.user_id !== "custom_list_synthetic_id" && typeof detail.num_followers === 'number' && (
              <div className="flex items-center group" title={`Followers: ${detail.num_followers.toLocaleString()}`}>
                <FollowersIcon className="w-4 h-4 text-blue-600 mr-2" /> 
                <span className="font-bold tabular-nums">{detail.num_followers.toLocaleString()}</span>
                <span className="ml-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-500">Followers</span>
              </div>
            )} 
            {typeof detail.num_total_clips === 'number' && (
              <div className="flex items-center group" title={`Total Clips: ${detail.num_total_clips.toLocaleString()}`}>
                <ClipsIcon className="w-4 h-4 text-purple-600 mr-2" /> 
                <span className="font-bold tabular-nums">{detail.num_total_clips.toLocaleString()}</span>
                <span className="ml-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-500">Clips</span>
              </div>
            )} 
          </div> 
        </div> 
      </div>
    );
  }

  return (
    <div className="mb-10 glass-card p-6 sm:p-8 flex flex-col md:flex-row items-center md:items-start gap-8 relative overflow-hidden group">
      <div className="absolute top-0 left-0 w-32 h-32 bg-emerald-500/5 blur-3xl group-hover:bg-emerald-500/10 transition-colors pointer-events-none"></div>
      {detail.user_id !== "custom_list_synthetic_id" && detail.image_url && (
        <div className="relative flex-shrink-0 group/avatar">
          <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-md opacity-0 group-hover/avatar:opacity-100 transition-opacity"></div>
          <img 
            src={detail.image_url || 'https://via.placeholder.com/128?text=No+Avatar'} 
            alt={`${detail.display_name}'s avatar`} 
            className="w-32 h-32 sm:w-40 sm:h-40 rounded-full object-cover border-4 border-white/10 shadow-2xl relative z-10 grayscale-[0.2] group-hover/avatar:grayscale-0 transition-all duration-500" 
          />
        </div>
      )} 
      <div className="flex-1 text-center md:text-left min-w-0 z-10"> 
        <h2 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none mb-1 truncate" title={detail.display_name}>{detail.display_name}</h2> 
        {detail.user_id !== "custom_list_synthetic_id" && detail.handle && (
          <p className="text-lg font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-500 mb-4 opacity-80" title={`@${detail.handle}`}>@{detail.handle}</p>
        )} 
        {detail.user_id !== "custom_list_synthetic_id" && detail.bio && <p className="text-sm font-bold text-gray-600 dark:text-gray-400 mb-6 leading-relaxed max-w-2xl">{detail.bio}</p>} 
        <div className="flex items-center justify-center md:justify-start gap-4 sm:gap-6 flex-wrap"> 
          {typeof detail.total_plays === 'number' && (
            <div className="flex flex-col items-center md:items-start" title={`Total Plays: ${detail.total_plays.toLocaleString()}`}>
              <span className="text-xs font-black uppercase tracking-widest text-gray-500 mb-1">Plays</span>
              <div className="flex items-center gap-2">
                <TotalPlaysIcon className="w-3 h-3 text-emerald-500" />
                <span className="text-lg font-black text-gray-900 dark:text-white tabular-nums">{detail.total_plays.toLocaleString()}</span>
              </div>
            </div>
          )} 
          {typeof detail.total_upvotes === 'number' && (
            <div className="flex flex-col items-center md:items-start" title={`Total Upvotes: ${detail.total_upvotes.toLocaleString()}`}>
              <span className="text-xs font-black uppercase tracking-widest text-gray-500 mb-1">Upvotes</span>
              <div className="flex items-center gap-2">
                <TotalUpvotesIcon className="w-3 h-3 text-emerald-500" />
                <span className="text-lg font-black text-gray-900 dark:text-white tabular-nums">{detail.total_upvotes.toLocaleString()}</span>
              </div>
            </div>
          )} 
          {detail.user_id !== "custom_list_synthetic_id" && typeof detail.num_followers === 'number' && (
            <div className="flex flex-col items-center md:items-start" title={`Followers: ${detail.num_followers.toLocaleString()}`}>
              <span className="text-xs font-black uppercase tracking-widest text-gray-500 mb-1">Followers</span>
              <div className="flex items-center gap-2">
                <FollowersIcon className="w-3 h-3 text-emerald-500" />
                <span className="text-lg font-black text-gray-900 dark:text-white tabular-nums">{detail.num_followers.toLocaleString()}</span>
              </div>
            </div>
          )} 
          {typeof detail.num_total_clips === 'number' && (
            <div className="flex flex-col items-center md:items-start" title={`Total Clips: ${detail.num_total_clips.toLocaleString()}`}>
              <span className="text-xs font-black uppercase tracking-widest text-gray-500 mb-1">Catalog</span>
              <div className="flex items-center gap-2">
                <ClipsIcon className="w-3 h-3 text-emerald-500" />
                <span className="text-lg font-black text-gray-900 dark:text-white tabular-nums">{detail.num_total_clips.toLocaleString()}</span>
              </div>
            </div>
          )} 
        </div> 
      </div> 
    </div>
  );
};

export const PlaylistInfoBox: React.FC<{ detail: SunoPlaylistDetail }> = ({ detail }) => {
  const { uiMode } = useTheme();

  if (uiMode === 'classic') {
    return (
      <div className="mb-6 bg-white dark:bg-gray-800 p-6 rounded-lg border-2 border-gray-200 dark:border-green-600/30 flex flex-col md:flex-row items-center md:items-center gap-8 shadow-md"> 
        <img src={detail.image_url || detail.creator_avatar_image_url || 'https://via.placeholder.com/128?text=No+Artwork'} alt={`${detail.name || 'Playlist'}'s artwork`} className="w-32 h-32 rounded-xl object-cover border-4 border-green-600 shadow-lg flex-shrink-0" /> 
        <div className="flex-1 text-center md:text-left min-w-0"> 
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white truncate mb-1" title={detail.name || 'Untitled Playlist'}> 
            <a href={detail.suno_playlist_url} target="_blank" rel="noopener noreferrer" className="hover:underline"> {detail.name || 'Untitled Playlist'} </a> 
          </h2> 
          {detail.creator_handle && detail.creator_display_name && (
            <p className="text-xl font-bold text-green-600 dark:text-green-600 mb-3 truncate" title={`Created by @${detail.creator_handle}`}> 
              by <a href={detail.suno_creator_url} target="_blank" rel="noopener noreferrer" className="hover:underline"> {detail.creator_display_name} (@{detail.creator_handle}) </a> 
            </p>
          )} 
          {detail.description && <p className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-4 leading-relaxed max-h-24 overflow-y-auto pr-2 scrollbar-thin">{detail.description}</p>} 
          <div className="flex items-center justify-center md:justify-start gap-x-6 gap-y-3 flex-wrap text-sm text-gray-700 dark:text-gray-200"> 
            <div className="flex items-center group" title={`Songs: ${detail.num_songs.toLocaleString()}`}>
              <PlaylistIcon className="w-4 h-4 text-green-600 mr-2" /> 
              <span className="font-bold tabular-nums">{detail.num_songs.toLocaleString()}</span>
              <span className="ml-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-500">Songs</span>
            </div> 
            <div className="flex items-center group" title={`Total Plays: ${detail.total_clip_plays.toLocaleString()}`}>
              <TotalPlaysIcon className="w-4 h-4 text-emerald-600 mr-2" /> 
              <span className="font-bold tabular-nums">{detail.total_clip_plays.toLocaleString()}</span>
              <span className="ml-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-500">Total Plays</span>
            </div> 
            <div className="flex items-center group" title={`Total Upvotes: ${detail.total_clip_upvotes.toLocaleString()}`}>
              <TotalUpvotesIcon className="w-4 h-4 text-yellow-600 mr-2" /> 
              <span className="font-bold tabular-nums">{detail.total_clip_upvotes.toLocaleString()}</span>
              <span className="ml-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-500">Upvotes</span>
            </div> 
          </div> 
        </div> 
      </div>
    );
  }

  return (
    <div className="mb-10 glass-card p-6 sm:p-8 flex flex-col md:flex-row items-center md:items-start gap-8 relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl group-hover:bg-emerald-500/10 transition-colors pointer-events-none"></div>
      <div className="relative flex-shrink-0 group/cover">
        <div className="absolute inset-0 bg-emerald-500/20 rounded-2xl blur-md opacity-0 group-hover/cover:opacity-100 transition-opacity"></div>
        <img 
          src={detail.image_url || detail.creator_avatar_image_url || 'https://via.placeholder.com/128?text=No+Artwork'} 
          alt={`${detail.name || 'Playlist'}'s artwork`} 
          className="w-32 h-32 sm:w-40 sm:h-40 rounded-2xl object-cover border-4 border-white/10 shadow-2xl relative z-10 grayscale-[0.2] group-hover/cover:grayscale-0 transition-all duration-500" 
        />
      </div> 
      <div className="flex-1 text-center md:text-left min-w-0 z-10"> 
        <h2 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none mb-1 truncate" title={detail.name || 'Untitled Playlist'}> 
          <a href={detail.suno_playlist_url} target="_blank" rel="noopener noreferrer" className="hover:text-emerald-500 transition-colors"> {detail.name || 'Untitled Playlist'} </a> 
        </h2> 
        {detail.creator_handle && detail.creator_display_name && (
          <p className="text-lg font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-500 mb-4 opacity-80 truncate" title={`Created by @${detail.creator_handle}`}> 
            by <a href={detail.suno_creator_url} target="_blank" rel="noopener noreferrer" className="hover:underline"> {detail.creator_display_name} (@{detail.creator_handle}) </a> 
          </p>
        )} 
        {detail.description && <p className="text-sm font-bold text-gray-600 dark:text-gray-400 mb-6 leading-relaxed max-w-2xl max-h-20 overflow-y-auto">{detail.description}</p>} 
        <div className="flex items-center justify-center md:justify-start gap-4 sm:gap-6 flex-wrap"> 
          {typeof detail.playlist_upvote_count === 'number' && (
            <div className="flex flex-col items-center md:items-start"> 
              <span className="text-xs font-black uppercase tracking-widest text-gray-500 mb-1">Upvotes</span>
              <div className="flex items-center gap-2">
                <TotalUpvotesIcon className="w-3 h-3 text-yellow-500" />
                <span className="text-lg font-black text-gray-900 dark:text-white tabular-nums">{detail.playlist_upvote_count.toLocaleString()}</span>
              </div>
            </div>
          )} 
          <div className="flex flex-col items-center md:items-start">
            <span className="text-xs font-black uppercase tracking-widest text-gray-500 mb-1">Songs</span>
            <div className="flex items-center gap-2">
              <PlaylistIcon className="w-3 h-3 text-emerald-500" />
              <span className="text-lg font-black text-gray-900 dark:text-white tabular-nums">{detail.num_songs.toLocaleString()}</span>
            </div>
          </div> 
          <div className="flex flex-col items-center md:items-start">
            <span className="text-xs font-black uppercase tracking-widest text-gray-500 mb-1">Flux</span>
            <div className="flex items-center gap-2">
              <TotalPlaysIcon className="w-3 h-3 text-emerald-500" />
              <span className="text-lg font-black text-gray-900 dark:text-white tabular-nums">{detail.total_clip_plays.toLocaleString()}</span>
            </div>
          </div> 
        </div> 
      </div> 
    </div>
  );
};
