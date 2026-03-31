import React from 'react';
import Spinner from '@/components/Spinner';
import { getAdjustedTextColor } from '@/utils/imageUtils';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'ghost' | 'outline' | 'info';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    loading?: boolean;
    wide?: boolean;
    startIcon?: React.ReactNode;
    endIcon?: React.ReactNode;
    backgroundColor?: string;
    textColor?: string;
    as?: 'button' | 'a';
    href?: string;
    target?: string;
    rel?: string;
}

const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    size = 'md',
    loading = false,
    wide = false,
    startIcon,
    endIcon,
    backgroundColor,
    textColor,
    className = '',
    disabled,
    as: Component = 'button',
    ...props
}) => {
    // Base Styles - Modern, elevated look with transitions
    const baseStyles = `
        inline-flex items-center justify-center font-bold 
        rounded-lg transition-all duration-300 
        transform active:scale-95 disabled:opacity-50 
        disabled:cursor-not-allowed disabled:active:scale-100 
        shadow-sm active:shadow-inner border border-transparent
        ${wide ? 'w-full' : ''}
    `.trim();
    
    // Size Styles - Better padding for a "premium" touch
    const sizeStyles = {
        xs: 'px-3 py-1 text-[10px] gap-1',
        sm: 'px-3 py-1 md:px-4 md:py-1.5 text-xs gap-1.5',
        md: 'px-4 py-2.5 sm:px-5 text-sm gap-2',
        lg: 'px-3 py-2.5 sm:px-8 sm:py-4 text-base gap-3',
    };

    // Variant Styles - Premium gradients and deep shadows
    const variantStyles = {
        primary: 'bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/40 border-blue-400/20',
        secondary: 'bg-gradient-to-br from-slate-600 to-slate-700 hover:from-slate-500 hover:to-slate-600 text-white shadow-slate-500/20 hover:shadow-lg hover:shadow-slate-500/40 border-slate-400/20',
        danger: 'bg-gradient-to-br from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white shadow-red-500/20 hover:shadow-lg hover:shadow-red-500/40 border-red-400/20',
        success: 'bg-gradient-to-br from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white shadow-emerald-500/20 hover:shadow-lg hover:shadow-emerald-500/40 border-emerald-400/20',
        warning: 'bg-gradient-to-br from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black shadow-amber-500/20 hover:shadow-lg hover:shadow-amber-500/40 border-amber-300/40',
        info: 'bg-gradient-to-br from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/40 border-indigo-400/20',
        ghost: 'bg-transparent hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300 shadow-none border-0 ring-0 outline-none focus:ring-0 focus:outline-none',
        outline: 'bg-transparent border-2 border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500 text-slate-700 dark:text-slate-300 shadow-none',
    };

    // Style override if backgroundColor is provided
    const customStyle: React.CSSProperties = {};
    if (backgroundColor && backgroundColor !== 'transparent') {
        customStyle.background = `linear-gradient(135deg, ${backgroundColor}, ${backgroundColor}dd)`;
        customStyle.borderColor = `${backgroundColor}33`;
        customStyle.color = textColor || getAdjustedTextColor(backgroundColor, '#FFFFFF');
    }

    return (
        <Component
            className={`${baseStyles} ${sizeStyles[size]} ${!backgroundColor ? variantStyles[variant] : ''} ${className}`}
            style={customStyle}
            disabled={disabled || loading}
            {...(props as any)}
        >
            {loading && (
                <div className="mr-2">
                    <Spinner size={size === 'xs' ? 'w-3 h-3' : 'w-4 h-4'} color="inherit" />
                </div>
            )}
            {!loading && startIcon && <span className="flex-shrink-0">{startIcon}</span>}
            <span className="truncate leading-none">{children}</span>
            {!loading && endIcon && <span className="flex-shrink-0">{endIcon}</span>}
        </Component>
    );
};

export default Button;
