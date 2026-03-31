
import React from 'react';

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
  const labelColorClass = labelTextColor ? labelTextColor : "text-gray-700 dark:text-green-300";

  return (
    <div className={`flex items-start ${className}`}>
        <div className="flex items-center h-5">
            <input
                id={id}
                type="checkbox"
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
                disabled={disabled}
                className="h-4 w-4 text-green-600 dark:text-green-500 border-gray-300 dark:border-gray-600 rounded focus:ring-green-500 dark:focus:ring-green-400 bg-white dark:bg-gray-700 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                title={title}
                aria-describedby={description ? `${id}-description` : undefined}
            />
        </div>
        <div className="ml-3 text-sm">
            <label
              htmlFor={id}
              className={`font-medium ${labelColorClass} ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
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
