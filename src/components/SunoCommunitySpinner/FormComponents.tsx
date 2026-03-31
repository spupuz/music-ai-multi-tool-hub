import React from 'react';
import Button from '@/components/common/Button';

export const InputField: React.FC<{
  id: string; label: string; value: string | number; onChange: (val: string) => void; placeholder?: string;
  type?: string; labelTextColor?: string; className?: string; min?: number; max?: number; step?: number;
}> = ({ id, label, value, onChange, placeholder, type = "text", labelTextColor, className = "mb-6", min, max, step }) => (
    <div className={className}>
        <label htmlFor={id} className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-2 px-1" style={{color: labelTextColor}}>{label}</label>
        <input 
            type={type} 
            id={id} 
            value={value} 
            onChange={e => onChange(e.target.value)} 
            placeholder={placeholder} 
            min={min} 
            max={max} 
            step={step}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-[13px] font-bold text-white placeholder-white/20 focus:outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 transition-all shadow-inner" 
        />
    </div>
);

export const TextAreaField: React.FC<{ id: string; label: string; value: string; onChange: (val: string) => void; placeholder?: string; rows?: number; labelTextColor?: string; readOnly?: boolean; className?: string; }> =
    ({ id, label, value, onChange, placeholder, rows = 6, labelTextColor, readOnly = false, className = "mb-6" }) => (
    <div className={className}>
        <label htmlFor={id} className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-2 px-1" style={{color: labelTextColor}}>{label}</label>
        <textarea 
            id={id} 
            value={value} 
            onChange={e => onChange(e.target.value)} 
            placeholder={placeholder} 
            rows={rows} 
            readOnly={readOnly}
            className={`w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-[13px] font-bold text-white placeholder-white/20 focus:outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 transition-all shadow-inner resize-none scrollbar-thin ${readOnly ? 'opacity-50 cursor-not-allowed' : ''}`} 
        />
    </div>
);

export const CheckboxField: React.FC<{ id: string; label: string; checked: boolean; onChange: (checked: boolean) => void; description?: string; labelTextColor?: string; className?: string; title?: string; }> = 
  ({ id, label, checked, onChange, description, labelTextColor, className = "mb-4", title }) => (
    <div className={`flex items-start group cursor-pointer ${className}`} onClick={() => onChange(!checked)}>
        <div className="flex items-center h-6">
            <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${checked ? 'bg-emerald-500 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'bg-white/5 border-white/20 group-hover:border-white/40'}`}>
                {checked && (
                    <svg className="w-3.5 h-3.5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                )}
            </div>
            <input 
                id={id} 
                type="checkbox" 
                checked={checked} 
                onChange={(e) => onChange(e.target.checked)} 
                className="sr-only" 
                title={title}
            />
        </div>
        <div className="ml-4 text-sm mt-0.5">
            <label htmlFor={id} className="text-[11px] font-black uppercase tracking-widest text-white/80 transition-colors pointer-events-none" style={{color: labelTextColor}} title={title}>{label}</label>
            {description && <p id={`${id}-description`} className="text-white/40 text-[10px] mt-1 font-medium">{description}</p>}
        </div>
    </div>
);

export const SelectField: React.FC<{ id: string; label: string; value: string; onChange: (value: string) => void; options: Array<{ value: string; label: string }>; labelTextColor?: string; className?: string; }> = 
  ({ id, label, value, onChange, options, labelTextColor, className = "mb-6" }) => (
    <div className={className}>
        <label htmlFor={id} className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-2 px-1" style={{color: labelTextColor}}>{label}</label>
        <div className="relative group">
            <select 
                id={id} 
                value={value} 
                onChange={e => onChange(e.target.value)} 
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-[13px] font-bold text-white appearance-none focus:outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 transition-all shadow-inner"
            >
                <option disabled value="" className="bg-gray-900">Select Parameter...</option>
                {options.map(opt => (<option key={opt.value} value={opt.value} className="bg-gray-900">{opt.label}</option>))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-40 group-hover:opacity-100 transition-opacity">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
            </div>
        </div>
    </div>
);

export const ConfirmationButton: React.FC<{
  onConfirm: () => void;
  label: string;
  confirmLabel?: string;
  className?: string;
  style?: React.CSSProperties;
  disabled?: boolean;
  icon?: React.ReactNode;
}> = ({ onConfirm, label, confirmLabel = "Initiate?", className, style, disabled, icon }) => {
  const [step, setStep] = React.useState(0);
  const timeoutRef = React.useRef<any>(null);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (disabled) return;

    if (step < 2) {
      setStep(s => s + 1);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setStep(0), 4000);
    } else {
      onConfirm();
      setStep(0);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    }
  };

  const displayLabel = step === 0 ? label : step === 1 ? `Confirming (${label})` : confirmLabel;

  return (
    <Button
      onClick={handleClick}
      disabled={disabled}
      variant="ghost"
      className={`w-full group relative overflow-hidden transition-all active:scale-95 border-emerald-500/20 hover:bg-emerald-500/10 ${className} ${step > 0 ? 'bg-red-500/20 border-red-500/40 text-red-400 hover:bg-red-500/30' : ''}`}
      style={style}
    >
      <div className="relative z-10 flex items-center justify-center gap-3">
        {icon && <span className={`transition-transform duration-500 ${step > 0 ? 'scale-125' : ''}`}>{icon}</span>}
        <span className="font-black uppercase tracking-[0.2em]">{displayLabel}</span>
      </div>
      {step > 0 && (
        <div 
          className="absolute bottom-0 left-0 h-1 bg-red-500/40 transition-all duration-[4000ms] ease-linear"
          style={{ width: step === 0 ? '0%' : '100%' }}
        />
      )}
    </Button>
  );
};
