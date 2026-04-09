
import React from 'react';
import Button from '@/components/common/Button';
import { useTheme } from '@/context/ThemeContext';

interface CookieConsentPopupProps {
  onAccept: () => void;
  onLearnMore: () => void;
}

const CookieConsentPopup: React.FC<CookieConsentPopupProps> = ({ onAccept, onLearnMore }) => {
  const { uiMode } = useTheme();

  return (
    <div 
      className={`fixed bottom-0 left-0 right-0 ${uiMode === 'architect' ? 'glass-card border-none rounded-none border-t border-white/10 shadow-[0_-20px_50px_rgba(0,0,0,0.5)]' : 'bg-white dark:bg-gray-800 border-t-2 border-green-600 dark:border-green-500 shadow-2xl'} z-[100] p-4 md:p-6 text-gray-800 dark:text-gray-200 transition-colors duration-300`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="cookie-consent-title"
      aria-describedby="cookie-consent-description"
    >
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex-grow">
          <h2 id="cookie-consent-title" className={`text-lg font-black uppercase tracking-tight ${uiMode === 'architect' ? 'text-emerald-500' : 'text-green-700 dark:text-green-400'} mb-1`}>
            Your Privacy & How We Use Local Storage
          </h2>
          <p id="cookie-consent-description" className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            We use your browser's `localStorage` to enhance your experience. This includes saving your preferences (like tool settings and favorites) and remembering this consent choice. We also store data about your interactions with our tools (e.g., features used, errors encountered) to help us identify areas for improvement if feedback is provided.
            <br />
            <strong>All this data is stored locally in your browser and is not sent to any server. We do not store or process your IP address.</strong>
            Please review our <Button onClick={onLearnMore} variant="ghost" className={`inline-flex h-auto p-0 ${uiMode === 'architect' ? 'text-emerald-500 hover:text-emerald-400' : 'text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300'} underline font-black uppercase tracking-widest text-[10px] bg-transparent border-none shadow-none`}>Privacy Policy</Button> for full details.
          </p>
        </div>
        <div className="flex-shrink-0 flex gap-3 mt-4 md:mt-0">
          <Button
            onClick={onLearnMore}
            variant="ghost"
            size="md"
            className={`px-6 py-2.5 text-xs font-black uppercase tracking-widest ${uiMode === 'architect' ? 'text-emerald-500 border-white/10 hover:bg-white/10' : 'text-green-700 dark:text-green-300 border-green-600 dark:border-green-500 hover:bg-green-600/10'}`}
            aria-label="Learn more about our privacy practices"
          >
            Learn More
          </Button>
          <Button
            onClick={onAccept}
            variant="primary"
            size="md" 
            backgroundColor="#10b981"
            className="px-6 py-2.5 text-xs font-black uppercase tracking-widest shadow-lg"
            aria-label="Accept use of local storage as described"
          >
            Accept & Continue
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsentPopup;
