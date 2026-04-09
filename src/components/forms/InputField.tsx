
import React from 'react';
import { useTheme } from '@/context/ThemeContext';

// Centralized InfoIcon to be used across form components
const InfoIcon: React.FC<{tooltip: string, className?: string}> = ({tooltip, className=""}) => {
    const { uiMode } = useTheme();
    return (
        <div className={`inline-block relative group ${className}`}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-4 h-4 text-gray-400 cursor-help ${uiMode === 'architect' ? 'hover:text-emerald-500' : 'hover:text-emerald-600'}`}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
            </svg>
            <div className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-60 p-2 text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-50 pointer-events-none text-left ${uiMode === 'architect' ? 'bg-slate-900/90 text-white border border-white/10 backdrop-blur-md' : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-white border border-gray-300 dark:border-gray-600'}`}>
                {tooltip}
            </div>
        </div>
    );
};


interface InputFieldProps {
  id: string;
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  inputClassName?: string;
  labelTextColor?: string;
  maxLength?: number;
  min?: number;
  max?: number;
  step?: string | number;
  info?: string; 
}

const InputField: React.FC<InputFieldProps> = ({
  id, label, value, onChange, placeholder = "", type = "text", required, disabled,
  className = "mb-4", inputClassName = "", labelTextColor,
  maxLength, min, max, step, info
}) => {
  const { uiMode } = useTheme();
  
  // Determine label color: use prop if provided, else default to theme-aware color
  const labelColorClass = labelTextColor 
    ? labelTextColor 
    : (uiMode === 'architect' ? "text-gray-900 dark:text-gray-300" : "text-gray-700 dark:text-emerald-400");

  const inputStyles = uiMode === 'architect'
    ? `bg-white/5 dark:bg-black/20 border border-white/10 dark:border-white/10 focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 placeholder-gray-500`
    : `bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-emerald-500 focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-emerald-500 dark:focus:border-emerald-400 placeholder-gray-400 dark:placeholder-gray-500 shadow-sm`;

  return (
    <div className={className}>
      <label htmlFor={id} className={`block text-xs font-black uppercase tracking-widest ${labelColorClass} mb-2 flex items-center`}>
        {label} {required && <span className="text-red-500 dark:text-red-400 ml-1">*</span>}
        {info && <InfoIcon tooltip={info} className="ml-1.5" />}
      </label>
      <input
        type={type}
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        maxLength={maxLength}
        min={min}
        max={max}
        step={step}
        className={`mt-1 block w-full px-4 py-3 rounded-xl transition-all duration-300 outline-none sm:text-sm text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100 dark:disabled:bg-gray-900 ${inputStyles} ${inputClassName}`}
      />
    </div>
  );
};

export default InputField;
