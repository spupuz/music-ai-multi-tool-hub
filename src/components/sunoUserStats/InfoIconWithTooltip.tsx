import React from 'react';

interface InfoIconWithTooltipProps {
  text: string;
  className?: string;
  position?: 'top' | 'bottom' | 'left' | 'right'; 
}

const InfoIconWithTooltip: React.FC<InfoIconWithTooltipProps> = ({
  text,
  className = '',
  position = 'bottom', 
}) => {
  return (
    <div className={`relative inline-flex items-center group ${className}`} role="tooltip" aria-label={text}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
        className="w-4 h-4 text-gray-400 group-hover:text-emerald-300 cursor-help flex-shrink-0"
        aria-hidden="true" 
        focusable="false" 
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z"
        />
      </svg>
      <span
        className={`absolute left-1/2 -translate-x-1/2 
                    mt-1 w-auto min-w-[220px] max-w-xs p-2.5 
                    bg-gray-900 text-gray-100 text-xs rounded-md shadow-xl 
                    opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 
                    invisible group-hover:visible group-focus-within:visible
                    transition-opacity duration-300 z-50 pointer-events-none
                    border border-emerald-500 whitespace-normal
                    ${position === 'bottom' ? 'top-full' : ''}
                    ${position === 'top' ? 'bottom-full mb-2' : ''}
                  `}
      >
        {text}
      </span>
    </div>
  );
};

export default InfoIconWithTooltip;
