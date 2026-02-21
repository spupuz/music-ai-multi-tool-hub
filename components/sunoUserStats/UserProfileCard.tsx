
import React from 'react';
import type { SunoProfileDetail } from '../../types';

const LOGO_SVG_STRING = `<svg viewBox='0 0 100 100' fill='none' xmlns='http://www.w3.org/2000/svg'><path d='M50 10 L85 27.5 V72.5 L50 90 L15 72.5 V27.5 L50 10 Z' stroke='#059669' stroke-width='8' fill='transparent'/><circle cx='50' cy='35' r='7' fill='#14B8A6'/><circle cx='35' cy='65' r='6' fill='#14B8A6'/><circle cx='65' cy='65' r='6' fill='#14B8A6'/><line x1='50' y1='35' x2='35' y2='65' stroke='#10B981' stroke-width='5' stroke-linecap='round'/><line x1='50' y1='35' x2='65' y2='65' stroke='#10B981' stroke-width='5' stroke-linecap='round'/><line x1='38' y1='63' x2='62' y2='63' stroke='#10B981' stroke-width='5' stroke-linecap='round'/></svg>`;
const FALLBACK_IMAGE_DATA_URI = `data:image/svg+xml;base64,${btoa(LOGO_SVG_STRING)}`;

interface UserProfileCardProps {
  profile: SunoProfileDetail | null;
}

// Helper Icons (can be moved to a shared icons file if used elsewhere)
const ClipsIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" }) => ( 
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75l3 3m0 0l3-3m-3 3v-7.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const FollowersIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" }) => (
 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-9-5.175l-.008-.008C8.051 13.203 6 15.261 6 17.818m12 0A12.015 12.015 0 0012 6.75c-2.615 0-5.035.768-7.03 2.058m14.06 0L21 12m-9-3.25a.75.75 0 01.75.75V12a.75.75 0 01-1.5 0V9.5a.75.75 0 01.75-.75zm4.5 0a.75.75 0 01.75.75V12a.75.75 0 01-1.5 0V9.5a.75.75 0 01.75-.75z" />
  </svg>
);
const TotalPlaysIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
  </svg>
);
const TotalUpvotesIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" }) => (
 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
  </svg>
);
const TotalCommentsIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.068.158 2.148.279 3.238.364.466.037.893.281 1.153.671L12 21l2.652-1.978c.26-.191.687-.435 1.153-.67 1.09-.086 2.17-.206 3.238-.365 1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
  </svg>
);


const UserProfileCard: React.FC<UserProfileCardProps> = ({ profile }) => {
  if (!profile) {
    return (
      <div className="mb-6 bg-gray-100 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 text-center">
        <p className="text-gray-500 dark:text-gray-400">No profile data loaded.</p>
      </div>
    );
  }

  return (
    <div className="mb-6 bg-gray-50 dark:bg-gray-800 p-4 md:p-6 rounded-lg border border-gray-200 dark:border-gray-700 flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-6">
      <img 
        src={profile.image_url || FALLBACK_IMAGE_DATA_URI} 
        alt={`${profile.display_name}'s avatar`} 
        className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-2 border-green-500 shadow-md flex-shrink-0"
        onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_IMAGE_DATA_URI; }}
      />
      <div className="flex-1 text-center md:text-left min-w-0">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white truncate" title={profile.display_name}>
          {profile.display_name}
        </h2>
        <p className="text-lg text-green-600 dark:text-green-400 mb-1 truncate" title={`@${profile.handle}`}>
          <a href={`https://suno.com/@${profile.handle}`} target="_blank" rel="noopener noreferrer" className="hover:underline">
            @{profile.handle}
          </a>
        </p>
        {profile.bio && <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 leading-relaxed max-h-20 overflow-y-auto">{profile.bio}</p>}
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-x-4 gap-y-2 text-sm text-gray-700 dark:text-gray-200 mt-2">
          {typeof profile.total_plays === 'number' && (
            <div className="flex items-center" title={`Total Plays: ${profile.total_plays.toLocaleString()}`}>
              <TotalPlaysIcon /> 
              <span className="ml-1.5 truncate">{profile.total_plays.toLocaleString()}</span>
            </div>
          )}
          {typeof profile.total_upvotes === 'number' && (
            <div className="flex items-center" title={`Total Upvotes: ${profile.total_upvotes.toLocaleString()}`}>
              <TotalUpvotesIcon /> 
              <span className="ml-1.5 truncate">{profile.total_upvotes.toLocaleString()}</span>
            </div>
          )}
          {typeof profile.total_comments === 'number' && (
            <div className="flex items-center" title={`Total Comments: ${profile.total_comments.toLocaleString()}`}>
              <TotalCommentsIcon /> 
              <span className="ml-1.5 truncate">{profile.total_comments.toLocaleString()}</span>
            </div>
          )}
          {typeof profile.num_followers === 'number' && (
            <div className="flex items-center" title={`Followers: ${profile.num_followers.toLocaleString()}`}>
              <FollowersIcon /> 
              <span className="ml-1.5 truncate">{profile.num_followers.toLocaleString()}</span>
            </div>
          )}
          {typeof profile.num_total_clips === 'number' && (
            <div className="flex items-center" title={`Total Clips: ${profile.num_total_clips.toLocaleString()}`}>
              <ClipsIcon /> 
              <span className="ml-1.5 truncate">{profile.num_total_clips.toLocaleString()}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfileCard;
