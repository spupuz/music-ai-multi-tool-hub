
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
  const labelColorClass = labelTextColor ? labelTextColor : "text-gray-700 dark:text-green-400";

  return (
    <div className={className}>
      <label htmlFor={id} className={`block text-sm font-medium ${labelColorClass} mb-1`}>
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-green-500 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-green-500 dark:focus:border-green-400 sm:text-sm text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100 dark:disabled:bg-gray-900"
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </div>
  );
};

export default SelectField;
