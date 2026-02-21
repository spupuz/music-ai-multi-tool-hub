
import React from 'react';

interface CookieConsentPopupProps {
  onAccept: () => void;
  onLearnMore: () => void;
}

const CookieConsentPopup: React.FC<CookieConsentPopupProps> = ({ onAccept, onLearnMore }) => {
  return (
    <div 
      className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t-2 border-green-600 dark:border-green-500 shadow-2xl z-[100] p-4 md:p-6 text-gray-800 dark:text-gray-200 transition-colors duration-300"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cookie-consent-title"
      aria-describedby="cookie-consent-description"
    >
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex-grow">
          <h2 id="cookie-consent-title" className="text-lg font-semibold text-green-700 dark:text-green-400 mb-1">
            Your Privacy & How We Use Local Storage
          </h2>
          <p id="cookie-consent-description" className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            We use your browser's `localStorage` to enhance your experience. This includes saving your preferences (like tool settings and favorites) and remembering this consent choice. We also store data about your interactions with our tools (e.g., features used, errors encountered) to help us identify areas for improvement if feedback is provided.
            <br />
            <strong>All this data is stored locally in your browser and is not sent to any server. We do not store or process your IP address.</strong>
            Please review our <button onClick={onLearnMore} className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 underline font-medium transition-colors">Privacy Policy</button> for full details.
          </p>
        </div>
        <div className="flex-shrink-0 flex gap-3 mt-3 md:mt-0">
          <button
            onClick={onLearnMore}
            className="px-5 py-2.5 text-sm font-medium text-green-700 dark:text-green-300 bg-transparent border border-green-600 dark:border-green-500 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800"
            aria-label="Learn more about our privacy practices"
          >
            Learn More
          </button>
          <button
            onClick={onAccept}
            className="px-5 py-2.5 text-sm font-medium text-white dark:text-black bg-green-600 dark:bg-green-500 rounded-md hover:bg-green-700 dark:hover:bg-green-600 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800"
            aria-label="Accept use of local storage as described"
          >
            Accept & Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsentPopup;
