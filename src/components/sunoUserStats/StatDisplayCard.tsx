
import React from 'react';
import InfoIconWithTooltip from './InfoIconWithTooltip';
import { useCountUp } from '@/hooks/useCountUp';

interface StatDisplayCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactElement;
  children?: React.ReactNode;
  tooltipText?: string; 
}

const StatDisplayCard: React.FC<StatDisplayCardProps> = ({ title, value, description, icon, children, tooltipText }) => {
  const numericValue = typeof value === 'number' ? value : 0;
  const isNumeric = typeof value === 'number';
  const animatedValue = useCountUp(numericValue, 700, isNumeric);

  return (
    <div className="glass-card p-6 border-gray-200 dark:border-white/5 bg-white dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/10 hover:border-gray-300 dark:hover:border-white/20 transition-all duration-300 min-h-[110px] flex flex-col group relative overflow-hidden">
      <div className="absolute -right-4 -top-4 w-12 h-12 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors"></div>
      <div className="flex items-center gap-3 mb-4">
        {icon && (
          <div className="text-gray-400 group-hover:text-emerald-400 transition-colors shrink-0 scale-90 group-hover:scale-100 duration-300">
            {icon}
          </div>
        )}
        <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-500 group-hover:text-emerald-500 transition-colors truncate" title={title}>
          {title}
        </h3>
        {tooltipText && (
          <div className="opacity-0 group-hover:opacity-100 transition-opacity ml-auto shrink-0">
            <InfoIconWithTooltip text={tooltipText} className="w-3 h-3 text-gray-400 hover:text-gray-900 dark:hover:text-white" />
          </div>
        )}
      </div>
      <div className="flex flex-col gap-1 z-10">
        {value !== undefined && value !== null && (
          <div className="text-xl font-black text-gray-900 dark:text-white tracking-widest truncate group-hover:scale-[1.02] origin-left transition-transform duration-300 tabular-nums" title={String(value)}>
            {isNumeric ? animatedValue.toLocaleString() : String(value)}
          </div>
        )}
        {description && (
          <p className="text-[9px] font-black uppercase tracking-widest text-gray-600 group-hover:text-gray-500 transition-colors">
            {description}
          </p>
        )}
      </div>
      {children && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-white/5 text-[9px] font-medium text-gray-400 group-hover:text-gray-300 transition-colors flex-grow">
          {children}
        </div>
      )}
    </div>
  );
};

export default StatDisplayCard;
