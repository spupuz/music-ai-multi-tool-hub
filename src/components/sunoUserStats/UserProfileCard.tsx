import React from 'react';
import type { SunoProfileDetail } from '@/types';
import { useTheme } from '@/context/ThemeContext';

const LOGO_SVG_STRING = `<svg viewBox='0 0 100 100' fill='none' xmlns='http://www.w3.org/2000/svg'><path d='M50 10 L85 27.5 V72.5 L50 90 L15 72.5 V27.5 L50 10 Z' stroke='#059669' stroke-width='8' fill='transparent'/><circle cx='50' cy='35' r='7' fill='#14B8A6'/><circle cx='35' cy='65' r='6' fill='#14B8A6'/><circle cx='65' cy='65' r='6' fill='#14B8A6'/><line x1='50' y1='35' x2='35' y2='65' stroke='#10B981' stroke-width='5' stroke-linecap='round'/><line x1='50' y1='35' x2='65' y2='65' stroke='#10B981' stroke-width='5' stroke-linecap='round'/><line x1='38' y1='63' x2='62' y2='63' stroke='#10B981' stroke-width='5' stroke-linecap='round'/></svg>`;
const FALLBACK_IMAGE_DATA_URI = `data:image/svg+xml;base64,${btoa(LOGO_SVG_STRING)}`;

interface UserProfileCardProps {
  profile: SunoProfileDetail | null;
}

// Helper Icons (can be moved to a shared icons file if used elsewhere)
const ClipsIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" }) => ( 
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75l3 3m0 0l3-3m-3 3v-7.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const FollowersIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" }) => (
 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-9-5.175l-.008-.008C8.051 13.203 6 15.261 6 17.818m12 0A12.015 12.015 0 0012 6.75c-2.615 0-5.035.768-7.03 2.058m14.06 0L21 12m-9-3.25a.75.75 0 01.75.75V12a.75.75 0 01-1.5 0V9.5a.75.75 0 01.75-.75zm4.5 0a.75.75 0 01.75.75V12a.75.75 0 01-1.5 0V9.5a.75.75 0 01.75-.75z" />
  </svg>
);
const TotalPlaysIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
  </svg>
);
const TotalUpvotesIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" }) => (
 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
  </svg>
);
const TotalCommentsIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.068.158 2.148.279 3.238.364.466.037.893.281 1.153.671L12 21l2.652-1.978c.26-.191.687-.435 1.153-.67 1.09-.086 2.17-.206 3.238-.365 1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
  </svg>
);


const UserProfileCard: React.FC<UserProfileCardProps> = ({ profile }) => {
  const { uiMode } = useTheme();

  if (!profile) {
    return (
      <div className="mb-10 bg-white/5 p-8 rounded-3xl border border-white/5 text-center animate-pulse">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">
          {uiMode === 'architect' ? 'Waiting for neural link... No profile data detected.' : 'Loading profile data...'}
        </p>
      </div>
    );
  }

  return (
    <div className="mb-10 glass-card p-8 md:p-10 border-white/10 flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-12 relative overflow-hidden group">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent"></div>
      
      <div className="relative shrink-0">
        <div className="absolute -inset-1 bg-gradient-to-tr from-emerald-500/20 to-emerald-500/20 rounded-full blur-sm group-hover:blur-md transition-all duration-500"></div>
        <img 
          src={profile.image_url || FALLBACK_IMAGE_DATA_URI} 
          alt={`${profile.display_name}'s avatar`} 
          className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-white/10 shadow-2xl relative z-10 brightness-90 group-hover:brightness-100 transition-all duration-500"
          onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_IMAGE_DATA_URI; }}
        />
      </div>

      <div className="flex-1 text-center md:text-left min-w-0 z-10">
        <div className="mb-2">
          <span className="text-[9px] font-black uppercase tracking-[0.4em] text-emerald-500/60 mb-1 block">
            {uiMode === 'architect' ? 'Creator Entity' : 'Suno Profile'}
          </span>
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter uppercase leading-none truncate" title={profile.display_name}>
            {profile.display_name}
          </h2>
        </div>
        
        <p className="text-sm font-black uppercase tracking-[0.2em] text-emerald-500/80 mb-6 truncate group-hover:text-emerald-400 transition-colors" title={`@${profile.handle}`}>
          <a href={`https://suno.com/@${profile.handle}`} target="_blank" rel="noopener noreferrer" className="hover:line-through decoration-2">
            @{profile.handle}
          </a>
        </p>

        {profile.bio && (
          <div className="mb-8 relative">
            <div className="absolute left-0 top-0 w-0.5 h-full bg-emerald-500/10 hidden md:block"></div>
            <p className="text-[11px] font-medium text-gray-400 leading-relaxed md:pl-6 italic max-w-xl">
              {profile.bio}
            </p>
          </div>
        )}
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 mt-2">
          {[
            { label: uiMode === 'architect' ? 'Signals' : 'Songs', value: profile.num_total_clips, icon: <ClipsIcon className="w-3 h-3" /> },
            { label: uiMode === 'architect' ? 'Observers' : 'Followers', value: profile.num_followers, icon: <FollowersIcon className="w-3 h-3" /> },
            { label: uiMode === 'architect' ? 'Flux' : 'Plays', value: profile.total_plays, icon: <TotalPlaysIcon className="w-3 h-3" /> },
            { label: uiMode === 'architect' ? 'Affinity' : 'Upvotes', value: profile.total_upvotes, icon: <TotalUpvotesIcon className="w-3 h-3" /> },
            { label: uiMode === 'architect' ? 'Echoes' : 'Comments', value: profile.total_comments, icon: <TotalCommentsIcon className="w-3 h-3" /> },
          ].map((stat, idx) => (
            <div key={idx} className="flex flex-col gap-1 group/stat">
              <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-[0.2em] text-gray-500 group-hover/stat:text-emerald-500 transition-colors">
                {stat.icon}
                {stat.label}
              </div>
              <div className="text-sm font-black text-white tracking-widest">
                {typeof stat.value === 'number' ? stat.value.toLocaleString() : '---'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserProfileCard;
