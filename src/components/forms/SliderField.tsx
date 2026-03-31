
import React from 'react';

interface SliderFieldProps {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  disabled?: boolean;
  className?: string;
}

const SliderField: React.FC<SliderFieldProps> = ({
  id, label, value, onChange, min = 0, max = 200, step = 1, unit = "%",
  disabled, className = "mb-4"
}) => (
  <div className={className}>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-green-400 mb-1">
      {label}: <span className="text-green-600 dark:text-green-200">{value}{unit}</span>
    </label>
    <input
      type="range"
      id={id}
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      min={min}
      max={max}
      step={step}
      disabled={disabled}
      className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-600 dark:accent-green-500 focus:outline-none focus:ring-1 focus:ring-green-400 disabled:opacity-50 disabled:cursor-not-allowed"
    />
  </div>
);

export default SliderField;
