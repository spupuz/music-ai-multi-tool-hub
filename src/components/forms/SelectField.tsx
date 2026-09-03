import React from 'react';

interface SelectFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  disabled?: boolean;
  className?: string;
  labelTextColor?: string;
}

const SelectField: React.FC<SelectFieldProps> = ({
  id, label, value, onChange, options, disabled, className = "mb-4", labelTextColor
}) => {
  const labelColorClass = labelTextColor 
    ? labelTextColor 
    : "text-gray-900 dark:text-gray-300";

  return (
    <div className={className}>
      <label htmlFor={id} className={`block text-xs font-black uppercase tracking-widest ${labelColorClass} mb-2`}>
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`mt-1 block w-full px-4 py-3 rounded-xl transition-all duration-300 outline-none sm:text-sm text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100 dark:disabled:bg-gray-900
          bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10`}
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </div>
  );
};

export default SelectField;
