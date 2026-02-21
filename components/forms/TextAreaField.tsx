
import React from 'react';

const InfoIcon: React.FC<{tooltip: string, className?: string}> = ({tooltip, className=""}) => (
    <div className={`inline-block relative group ${className}`}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-gray-400 hover:text-green-600 dark:hover:text-green-300 cursor-help">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
        </svg>
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-60 p-2 text-xs text-gray-800 dark:text-white bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-50 pointer-events-none text-left">
            {tooltip}
        </div>
    </div>
);

interface TextAreaFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean; 
  className?: string;
  textareaRef?: React.RefObject<HTMLTextAreaElement>;
  info?: string;
  labelTextColor?: string;
}

const TextAreaField: React.FC<TextAreaFieldProps> = ({
  id, label, value, onChange, placeholder, rows = 6, required, disabled,
  readOnly = false,
  className = "mb-4", textareaRef, info, labelTextColor
}) => {
  const labelColorClass = labelTextColor ? labelTextColor : "text-gray-700 dark:text-green-400";

  return (
    <div className={className}>
      <label htmlFor={id} className={`block text-sm font-medium ${labelColorClass} mb-1 flex items-center`}>
        {label} {required && <span className="text-red-500 dark:text-red-400 ml-1">*</span>}
        {info && <InfoIcon tooltip={info} className="ml-1.5" />}
      </label>
      <textarea
        id={id}
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        required={required}
        disabled={disabled}
        readOnly={readOnly}
        className={`mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-green-500 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-green-500 dark:focus:border-green-400 sm:text-sm text-gray-900 dark:text-white resize-y disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100 dark:disabled:bg-gray-900 ${readOnly ? 'opacity-70 cursor-not-allowed bg-gray-100 dark:bg-gray-700' : ''}`}
      />
    </div>
  );
};

export default TextAreaField;
