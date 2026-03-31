import React, { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon } from '@/components/Icons';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  id?: string;
  label?: string;
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
  labelClassName?: string;
  containerClassName?: string;
  placeholder?: string;
  disabled?: boolean;
}

const Select: React.FC<SelectProps> = ({
  id,
  label,
  options,
  value,
  onChange,
  className = '',
  labelClassName = '',
  containerClassName = '',
  placeholder = 'Select an option',
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (!disabled) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [disabled]);

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className={`relative ${containerClassName}`} ref={dropdownRef}>
      {label && (
        <label 
          htmlFor={id} 
          className={`block text-xs font-black uppercase tracking-widest mb-2 opacity-70 ml-1 ${labelClassName}`}
        >
          {label}
        </label>
      )}
      
      <button
        id={id}
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        className={`
          w-full flex items-center justify-between px-4 py-2.5 rounded-xl
          transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)]
          border backdrop-blur-md shadow-lg font-bold text-sm
          ${disabled 
            ? 'opacity-40 cursor-not-allowed border-white/5 bg-black/10' 
            : isOpen 
              ? 'border-white/40 ring-4 ring-white/10 dark:ring-white/5 bg-white/20 dark:bg-white/10' 
              : 'border-white/20 hover:border-white/30 bg-white/10 dark:bg-white/5 hover:bg-white/15 dark:hover:bg-white/10'
          }
          dark:text-white text-gray-900 ${className}
        `}
      >
        <span className="truncate">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDownIcon 
          className={`w-5 h-5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''} opacity-60 ml-2`} 
        />
      </button>

      {isOpen && (
        <div className="absolute z-[100] w-full mt-2 overflow-hidden rounded-2xl border border-white/20 dark:border-white/10 bg-white/60 dark:bg-gray-900/40 backdrop-blur-xl shadow-2xl animate-fadeIn">
          <div className="max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 py-1">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`
                  w-full text-left px-4 py-3 text-sm font-bold transition-colors
                  ${value === option.value 
                    ? 'bg-white/30 dark:bg-white/20 text-green-600 dark:text-green-400' 
                    : 'hover:bg-white/20 dark:hover:bg-white/10 dark:text-white text-gray-800'
                  }
                `}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Select;
