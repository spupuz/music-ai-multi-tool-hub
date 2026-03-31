
import React from 'react';
import InfoIconWithTooltip from '../InfoIconWithTooltip';

interface ChartContainerProps {
  title: string;
  children: React.ReactNode;
  heightClassName?: string; 
  tooltipText?: string; 
}

const ChartContainer: React.FC<ChartContainerProps> = ({ title, children, heightClassName, tooltipText }) => {
  return (
    <div className="bg-gray-800/40 dark:bg-gray-850/40 backdrop-blur-sm rounded-xl p-1 sm:p-6 border border-gray-700/50 shadow-xl flex flex-col">
      <div className="flex items-center justify-center mb-5 gap-2 px-1">
        <h4 className="text-sm sm:text-md font-semibold text-green-700 dark:text-green-200 text-center line-clamp-2">{title}</h4>
        {tooltipText && <InfoIconWithTooltip text={tooltipText} className="flex-shrink-0" />}
      </div>
      <div className={`relative ${heightClassName ? heightClassName : 'h-60 sm:h-64 md:h-80'}`}>
        {children}
      </div>
    </div>
  );
};

export default ChartContainer;
