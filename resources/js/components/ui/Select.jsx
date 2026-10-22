import React from 'react';
import Dropdown from './Dropdown';
import { cn } from '@/lib/utils';

/**
 * Custom Select Component
 * - Menggunakan custom Dropdown internal sistem dengan styling konsisten.
 * - Memastikan seluruh opsi teks panjang terbaca utuh tanpa terpotong (no truncation).
 * - Lebar dropdown adaptif dan dilengkapi checkmark pada opsi terpilih.
 */
export default function Select({
    value,
    onChange,
    options = [],
    placeholder = 'Pilih opsi...',
    size = 'md',
    disabled = false,
    error = false,
    className = '',
    menuClassName = '',
    align = 'left',
    showCheckmark = false,
    id,
}) {
    const selectedOption = options.find((opt) => String(opt.value) === String(value));
    const displayLabel = selectedOption ? selectedOption.label : placeholder;

    const sizeClasses = {
        sm: 'h-8 px-2 text-[10.5px] sm:text-xs rounded-lg',
        md: 'h-9 sm:h-10 px-2.5 sm:px-3 text-[11px] sm:text-xs rounded-lg sm:rounded-xl',
        lg: 'h-11 sm:h-12 px-3.5 sm:px-4 text-xs sm:text-sm rounded-xl',
    };

    return (
        <Dropdown size={size} matchWidth={true} className={cn('w-full', className)}>
            <Dropdown.Trigger className="w-full">
                <div
                    id={id}
                    className={cn(
                        'w-full flex items-center justify-between text-left font-medium transition-all select-none',
                        'border bg-white',
                        sizeClasses[size] || sizeClasses.md,
                        error
                            ? 'border-rose-400 ring-1 ring-rose-200'
                            : 'border-gray-300 hover:border-purple-400 focus:ring-2 focus:ring-purple-600',
                        disabled ? 'opacity-60 cursor-not-allowed bg-gray-50' : 'cursor-pointer'
                    )}
                    tabIndex={disabled ? -1 : 0}
                >
                    <span
                        className={cn(
                            'flex-1 text-left truncate mr-2',
                            !selectedOption ? 'text-gray-400 font-normal' : 'text-gray-900 font-semibold'
                        )}
                        title={selectedOption?.label}
                    >
                        {displayLabel}
                    </span>
                    <svg
                        className="w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </Dropdown.Trigger>

            <Dropdown.Content
                align={align}
                matchWidth={true}
                className={cn(
                    'w-full min-w-full max-w-full max-h-60 overflow-y-auto shadow-2xl border border-gray-100 p-1.5',
                    menuClassName
                )}
            >
                {options.map((option) => {
                    const isSelected = String(option.value) === String(value);
                    return (
                        <Dropdown.Item
                            key={String(option.value)}
                            onClick={() => {
                                if (!option.disabled && onChange) {
                                    onChange(option.value);
                                }
                            }}
                            active={isSelected}
                            disabled={option.disabled}
                            danger={option.danger}
                            size={size}
                            className={cn(
                                'flex justify-between py-2 px-3 rounded-lg transition-colors',
                                option.sublabel ? 'items-start' : 'items-center',
                                option.disabled && !option.className && 'opacity-40 cursor-not-allowed hover:bg-transparent',
                                option.className
                            )}
                        >
                            <div className="flex-1 min-w-0">
                                <span className={cn(
                                    'block font-medium text-xs leading-snug whitespace-normal break-words',
                                    option.labelClassName
                                )}>
                                    {option.label}
                                </span>
                                {option.sublabel && (
                                    <span className={cn(
                                        'block text-[11px] text-gray-500 whitespace-normal break-words mt-0.5 leading-tight',
                                        option.sublabelClassName
                                    )}>
                                        {option.sublabel}
                                    </span>
                                )}
                            </div>
                        </Dropdown.Item>
                    );
                })}
            </Dropdown.Content>
        </Dropdown>
    );
}

