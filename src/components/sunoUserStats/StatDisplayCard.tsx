
import React from 'react';
import InfoIconWithTooltip from './InfoIconWithTooltip';

interface StatDisplayCardProps {
  title: string;
  value: string | number;
  description?: string;
  // Fix: Replaced JSX.Element with React.ReactElement
  icon?: React.ReactElement;
  children?: React.ReactNode;
  tooltipText?: string; 
}

const StatDisplayCard: React.FC<StatDisplayCardProps> = ({ title, value, description, icon, children, tooltipText }) => {
  return (
    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 min-h-[90px] flex flex-col">
      <div className="flex items-center mb-1">
        {icon && <div className="text-green-600 dark:text-green-400 mr-2 flex-shrink-0">{icon}</div>}
        <h3 className="text-sm font-medium text-green-700 dark:text-green-300 truncate flex-grow" title={title}>{title}</h3>
        {tooltipText && <InfoIconWithTooltip text={tooltipText} className="ml-1 flex-shrink-0" />}
      </div>
      {value !== undefined && value !== null && (
        <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1 truncate" title={String(value)}>{String(value)}</p>
      )}
      {description && <p className="text-xs text-gray-500 dark:text-gray-400 mt-auto">{description}</p>}
      {children && <div className="mt-1 text-sm text-gray-600 dark:text-gray-300 flex-grow">{children}</div>}
    </div>
  );
};

export default StatDisplayCard;
