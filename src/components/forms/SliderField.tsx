import React from 'react';
import { useTheme } from '@/context/ThemeContext';

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
}) => {
  const { uiMode } = useTheme();
  
  return (
    <div className={className}>
      <label htmlFor={id} className={`block text-xs font-black uppercase tracking-widest mb-1 ${uiMode === 'architect' ? 'text-gray-500' : 'text-gray-700 dark:text-emerald-400'}`}>
        {label}: <span className={uiMode === 'architect' ? 'text-emerald-500 font-black' : 'text-emerald-600 dark:text-emerald-200'}>{value}{unit}</span>
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
        className={`w-full h-1.5 rounded-lg appearance-none cursor-pointer focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed
          ${uiMode === 'architect' 
            ? 'bg-white/10 dark:bg-white/10 accent-emerald-500 focus:ring-4 focus:ring-emerald-500/10' 
            : 'bg-gray-200 dark:bg-gray-700 accent-emerald-600 dark:accent-emerald-500 focus:ring-1 focus:ring-emerald-400'}`}
      />
    </div>
  );
};

export default SliderField;
