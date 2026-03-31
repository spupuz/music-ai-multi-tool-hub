import React from 'react';

export const InputField: React.FC<{
  id: string; label: string; value: string | number; onChange: (val: string) => void; placeholder?: string;
  type?: string; labelTextColor?: string; className?: string; min?: number; max?: number; step?: number;
}> = ({ id, label, value, onChange, placeholder, type = "text", labelTextColor, className, min, max, step }) => (
    <div className={className !== undefined ? className : "mb-4"}>
        <label htmlFor={id} className="block text-sm font-medium mb-1" style={{color: labelTextColor}}>{label}</label>
        <input type={type} id={id} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} min={min} max={max} step={step}
               className="mt-1 block w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border-2 border-gray-300 dark:border-green-500 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-green-500 dark:focus:border-green-400 sm:text-sm text-gray-900 dark:text-white" />
    </div>
);

export const TextAreaField: React.FC<{ id: string; label: string; value: string; onChange: (val: string) => void; placeholder?: string; rows?: number; labelTextColor?: string; readOnly?: boolean; }> =
    ({ id, label, value, onChange, placeholder, rows = 6, labelTextColor, readOnly = false }) => (
    <div className="mb-4">
        <label htmlFor={id} className="block text-sm font-medium mb-1" style={{color: labelTextColor}}>{label}</label>
        <textarea id={id} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows} readOnly={readOnly}
                  className={`mt-1 block w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border-2 border-gray-300 dark:border-green-500 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-green-500 dark:focus:border-green-400 sm:text-sm text-gray-900 dark:text-white resize-y ${readOnly ? 'opacity-70 cursor-not-allowed' : ''}`} />
    </div>
);

export const CheckboxField: React.FC<{ id: string; label: string; checked: boolean; onChange: (checked: boolean) => void; description?: string; labelTextColor?: string; className?: string; title?: string; }> = 
  ({ id, label, checked, onChange, description, labelTextColor, className = "mb-4", title }) => (
    <div className={`flex items-start ${className}`}>
        <div className="flex items-center h-5">
            <input 
                id={id} 
                type="checkbox" 
                checked={checked} 
                onChange={(e) => onChange(e.target.checked)} 
                className="h-4 w-4 text-green-600 dark:text-green-500 border-gray-300 dark:border-gray-600 rounded focus:ring-green-500 dark:focus:ring-green-400 bg-white dark:bg-gray-700 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-800" 
                title={title}
                aria-describedby={description ? `${id}-description` : undefined}
            />
        </div>
        <div className="ml-3 text-sm">
            <label htmlFor={id} className="font-medium" style={{color: labelTextColor}} title={title}>{label}</label>
            {description && <p id={`${id}-description`} className="text-gray-500 text-xs">{description}</p>}
        </div>
    </div>
);

export const SelectField: React.FC<{ id: string; label: string; value: string; onChange: (value: string) => void; options: Array<{ value: string; label: string }>; labelTextColor?: string; className?: string; }> = 
  ({ id, label, value, onChange, options, labelTextColor, className = "mb-2" }) => (
    <div className={className}>
        <label htmlFor={id} className="block text-xs font-medium mb-0.5" style={{color: labelTextColor}}>{label}</label>
        <select id={id} value={value} onChange={e => onChange(e.target.value)} className="w-full px-2 py-1 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white text-xs focus:ring-1 focus:ring-green-400">
            <option disabled value="">Select...</option>
            {options.map(opt => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
        </select>
    </div>
);

export const ConfirmationButton: React.FC<{
  onConfirm: () => void;
  label: string;
  confirmLabel?: string;
  className?: string;
  style?: React.CSSProperties;
  disabled?: boolean;
}> = ({ onConfirm, label, confirmLabel = "Are you sure?", className, style, disabled }) => {
  const [step, setStep] = React.useState(0);
  const timeoutRef = React.useRef<any>(null);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (disabled) return;

    if (step < 2) {
      setStep(s => s + 1);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setStep(0), 2500);
    } else {
      onConfirm();
      setStep(0);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    }
  };

  const displayLabel = step === 0 ? label : step === 1 ? `${label} (1/2)` : confirmLabel;

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`${className} transition-all relative overflow-hidden ${step > 0 ? 'scale-[1.02] brightness-110 shadow-lg' : ''}`}
      style={style}
    >
      <span className="relative z-10">{displayLabel}</span>
      {step > 0 && (
        <div 
          className="absolute bottom-0 left-0 h-1 bg-white/30 transition-all duration-[2500ms] ease-linear"
          style={{ width: step === 0 ? '0%' : '100%' }}
        />
      )}
    </button>
  );
};
