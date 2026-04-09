import React from 'react';
import { useTheme } from '@/context/ThemeContext';

interface CheckboxFieldProps {
  id: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  description?: string;
  title?: string;
  labelTextColor?: string;
}

const CheckboxField: React.FC<CheckboxFieldProps> = ({
  id, label, checked, onChange, disabled,
  className = "mb-4", description, title, labelTextColor
}) => {
  const { uiMode } = useTheme();
  const labelColorClass = labelTextColor 
    ? labelTextColor 
    : (uiMode === 'architect' ? "text-gray-800 dark:text-gray-200" : "text-gray-700 dark:text-emerald-300");

  return (
    <div className={`flex items-start ${className}`}>
        <div className="flex items-center h-5">
            <input
                id={id}
                type="checkbox"
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
                disabled={disabled}
                className={`h-4 w-4 rounded transition-all disabled:opacity-50 disabled:cursor-not-allowed
                  ${uiMode === 'architect' 
                    ? 'text-emerald-600 border-white/20 focus:ring-emerald-500/30 bg-white/5' 
                    : 'text-emerald-600 dark:text-emerald-500 border-gray-300 dark:border-gray-600 focus:ring-emerald-500 dark:focus:ring-emerald-400 bg-white dark:bg-gray-700'}`}
                title={title}
                aria-describedby={description ? `${id}-description` : undefined}
            />
        </div>
        <div className="ml-3 text-sm">
            <label
              htmlFor={id}
              className={`text-xs font-black uppercase tracking-widest ${labelColorClass} ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
              title={title}
            >
                {label}
            </label>
            {description && <p id={`${id}-description`} className="text-gray-500 dark:text-gray-500 text-xs">{description}</p>}
        </div>
    </div>
  );
};

export default CheckboxField;
