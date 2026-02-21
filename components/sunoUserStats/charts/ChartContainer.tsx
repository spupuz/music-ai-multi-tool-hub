
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
    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-center mb-5">
        <h4 className="text-md font-semibold text-green-700 dark:text-green-200 text-center">{title}</h4>
        {tooltipText && <InfoIconWithTooltip text={tooltipText} className="ml-2" />}
      </div>
      <div className={`relative ${heightClassName ? heightClassName : 'h-60 sm:h-64 md:h-80'}`}>
        {children}
      </div>
    </div>
  );
};

export default ChartContainer;
