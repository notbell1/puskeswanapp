import React from 'react';
import { cn } from '@/lib/utils';

/**
 * Custom Button Component
 * Varian warna solid: primary (purple brand), secondary (border/netral), danger (merah).
 * Mendukung status loading, icon di kiri/kanan, dan animasi transisi halus.
 */
export default function Button({
    type = 'button',
    variant = 'primary',
    size = 'md',
    isLoading = false,
    disabled = false,
    leftIcon = undefined,
    rightIcon = undefined,
    className = '',
    children = undefined,
    ...props
}) {
    const variantClasses = {
        primary:
            'bg-purple-600 text-white hover:bg-purple-700 active:bg-purple-800 focus-visible:ring-purple-500 shadow-sm border border-transparent',
        secondary:
            'bg-white text-gray-700 hover:bg-gray-50 active:bg-gray-100 border border-gray-300 focus-visible:ring-purple-500 shadow-sm',
        danger:
            'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 focus-visible:ring-red-500 shadow-sm border border-transparent',
        outline:
            'bg-transparent text-purple-700 hover:bg-purple-50 active:bg-purple-100 border border-purple-600 focus-visible:ring-purple-500',
        ghost:
            'bg-transparent text-purple-700 hover:bg-purple-50 active:bg-purple-100 border border-transparent focus-visible:ring-purple-500',
    };

    const sizeClasses = {
        sm: 'h-8 px-3 text-xs gap-1.5 rounded-lg',
        md: 'h-10 px-4 text-sm gap-2 rounded-xl',
        lg: 'h-12 px-6 text-base gap-2.5 rounded-xl',
    };

    const isButtonDisabled = disabled || isLoading;

    return (
        <button
            type={type}
            disabled={isButtonDisabled}
            aria-busy={isLoading}
            className={cn(
                'inline-flex items-center justify-center font-medium font-sans',
                'transition-all duration-200 ease-in-out select-none cursor-pointer',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
                'active:scale-[0.98]',
                'disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100 disabled:shadow-none',
                variantClasses[variant] || variantClasses.primary,
                sizeClasses[size] || sizeClasses.md,
                className
            )}
            {...props}
        >
            {isLoading ? (
                <>
                    <svg
                        className="animate-spin -ml-0.5 h-4 w-4 text-current"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        />
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                    </svg>
                    <span>Memproses...</span>
                </>
            ) : (
                <>
                    {leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>}
                    {children}
                    {rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
                </>
            )}
        </button>
    );
}

