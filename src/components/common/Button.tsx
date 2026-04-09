import React from 'react';
import Spinner from '@/components/Spinner';
import { getAdjustedTextColor } from '@/utils/imageUtils';
import { useTheme } from '@/context/ThemeContext';

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
    const { uiMode } = useTheme();
    const isArchitect = uiMode === 'architect';

    // Base Styles - Modern, elevated look with transitions
    const baseStyles = `
        inline-flex items-center justify-center 
        ${isArchitect ? 'font-black uppercase tracking-widest' : 'font-bold'} 
        ${isArchitect ? 'rounded-2xl' : 'rounded-md'} 
        transition-all duration-300 
        transform active:scale-95 disabled:opacity-50 
        disabled:cursor-not-allowed disabled:active:scale-100 
        shadow-sm active:shadow-inner border
        ${isArchitect ? 'border-white/10' : 'border-2 border-black/10'}
        ${wide ? 'w-full' : ''}
    `.trim();
    
    // Size Styles - Better padding for a "premium" touch
    const sizeStyles = {
        xs: isArchitect ? 'px-3 py-1 text-[8px] gap-1' : 'px-2 py-1 text-[10px] gap-1',
        sm: isArchitect ? 'px-3 py-1 md:px-4 md:py-1.5 text-[9px] gap-1.5' : 'px-3 py-1.5 text-xs gap-1.5',
        md: isArchitect ? 'px-4 py-2.5 sm:px-5 text-[10px] gap-2' : 'px-4 py-2 sm:px-5 text-sm gap-2',
        lg: isArchitect ? 'px-3 py-2.5 sm:px-8 sm:py-4 text-xs gap-3' : 'px-6 py-3 text-base gap-3',
    };

    // Variant Styles - Premium gradients for Architect, solid colors for Classic
    const variantStyles = {
        primary: isArchitect 
            ? 'bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/40 border-blue-400/20'
            : 'bg-green-600 hover:bg-green-500 text-white border-green-700/30',
        secondary: isArchitect
            ? 'bg-gradient-to-br from-slate-600 to-slate-700 hover:from-slate-500 hover:to-slate-600 text-white shadow-slate-500/20 hover:shadow-lg hover:shadow-slate-500/40 border-slate-400/20'
            : 'bg-gray-600 hover:bg-gray-500 text-white border-gray-700/30',
        danger: isArchitect
            ? 'bg-gradient-to-br from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white shadow-red-500/20 hover:shadow-lg hover:shadow-red-500/40 border-red-400/20'
            : 'bg-red-600 hover:bg-red-500 text-white border-red-700/30',
        success: isArchitect
            ? 'bg-gradient-to-br from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white shadow-emerald-500/20 hover:shadow-lg hover:shadow-emerald-500/40 border-emerald-400/20'
            : 'bg-green-600 hover:bg-green-500 text-white border-green-700/30',
        warning: isArchitect
            ? 'bg-gradient-to-br from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black shadow-amber-500/20 hover:shadow-lg hover:shadow-amber-500/40 border-amber-300/40'
            : 'bg-yellow-500 hover:bg-yellow-400 text-black border-yellow-600/30',
        info: isArchitect
            ? 'bg-gradient-to-br from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/40 border-indigo-400/20'
            : 'bg-blue-600 hover:bg-blue-500 text-white border-blue-700/30',
        ghost: isArchitect
            ? 'bg-transparent hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300 shadow-none border-white/5 ring-0 outline-none focus:ring-0 focus:outline-none'
            : 'bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 shadow-none border-gray-300 dark:border-gray-600 ring-0 outline-none focus:ring-0 focus:outline-none',
        outline: isArchitect
            ? 'bg-transparent border border-white/10 hover:border-white/20 text-slate-700 dark:text-slate-300 shadow-none'
            : 'bg-transparent border-2 border-gray-300 dark:border-green-600 hover:bg-gray-50 dark:hover:bg-green-900/10 text-gray-700 dark:text-gray-300 shadow-none',
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
