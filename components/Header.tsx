
import React from 'react';
import { useTheme } from '../context/ThemeContext';

interface HeaderProps {
  onToggleSidebar: () => void;
  appName: string;
}

const AppLogo: React.FC = () => (
  <svg width="28" height="28" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2 text-green-600 dark:text-green-500">
    {/* Open Hexagon for Hub - primary green */}
    <path d="M50 10 L85 27.5 V72.5 L50 90 L15 72.5 V27.5 L50 10 Z" stroke="currentColor" strokeWidth="8" fill="transparent"/>
    {/* 'A' like structure inside with nodes - accent */}
    <circle cx="50" cy="35" r="7" fill="currentColor" className="text-teal-500 dark:text-[#14B8A6]"/>
    <circle cx="35" cy="65" r="6" fill="currentColor" className="text-teal-500 dark:text-[#14B8A6]"/>
    <circle cx="65" cy="65" r="6" fill="currentColor" className="text-teal-500 dark:text-[#14B8A6]"/>
    <line x1="50" y1="35" x2="35" y2="65" stroke="currentColor" strokeWidth="5" strokeLinecap="round" className="text-emerald-500 dark:text-[#10B981]"/>
    <line x1="50" y1="35" x2="65" y2="65" stroke="currentColor" strokeWidth="5" strokeLinecap="round" className="text-emerald-500 dark:text-[#10B981]"/>
    <line x1="38" y1="63" x2="62" y2="63" stroke="currentColor" strokeWidth="5" strokeLinecap="round" className="text-emerald-500 dark:text-[#10B981]"/>
  </svg>
);

const SunIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
  </svg>
);

const MoonIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
  </svg>
);

const Header: React.FC<HeaderProps> = ({ onToggleSidebar, appName }) => {
  const { theme, toggleTheme } = useTheme();

  // Split the appName for styling
  const nameParts = appName.split(' '); // ["Music", "AI", "Multi-Tool", "Hub"]
  let styledName;

  if (nameParts.length >= 4 && nameParts[0] === "Music" && nameParts[1] === "AI") {
    styledName = (
      <>
        <span className="text-green-600 dark:text-green-400">{nameParts[0]}</span>{' '}
        <span className="text-green-500 dark:text-green-300">{nameParts[1]}</span>{' '}
        <span className="text-gray-700 dark:text-gray-200">{nameParts.slice(2, -1).join(' ')}</span>{' '}
        <span className="text-green-700 dark:text-green-500 font-bold">{nameParts.slice(-1)}</span>
      </>
    );
  } else { // Fallback if the name doesn't match expected structure
    styledName = <span className="text-gray-800 dark:text-gray-200">{appName}</span>;
  }

  return (
    <header 
      className="fixed top-0 left-0 right-0 z-50 shadow-md h-16 flex items-center px-4 sm:px-6 border-b border-gray-200 dark:border-green-700 transition-colors duration-300"
      style={{
        background: theme === 'dark' ? 'linear-gradient(to bottom, #0D1F23, #0A0D1F)' : '#ffffff', 
      }}
    >
      <button
        onClick={onToggleSidebar}
        className="p-2 rounded-md text-gray-600 hover:bg-gray-100 dark:text-green-400 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
        aria-label="Toggle sidebar"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
      </button>
      <div className="ml-1 sm:ml-3 flex items-center flex-grow overflow-hidden">
        <div className="hidden min-[340px]:block">
          <AppLogo />
        </div>
        <h1 className="text-sm min-[380px]:text-base sm:text-lg md:text-xl font-semibold whitespace-nowrap overflow-hidden text-ellipsis">
          {styledName}
        </h1>
      </div>
      
      <button
        onClick={toggleTheme}
        className="p-2 rounded-md text-gray-600 hover:bg-gray-100 dark:text-yellow-300 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
        aria-label="Toggle dark mode"
        title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
      >
        {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
      </button>
    </header>
  );
};

export default Header;
