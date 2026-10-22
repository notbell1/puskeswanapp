import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Link } from '@inertiajs/react';
import { cn } from '@/lib/utils';

const DropdownContext = createContext({
    isOpen: false,
    setIsOpen: () => {},
    close: () => {},
    size: 'md',
    matchWidth: false,
    direction: 'bottom',
});

/**
 * Custom Dropdown Component
 * - Ukuran tombol (trigger) dan opsi pilihan proporsional & konsisten.
 * - Responsif menyesuaikan secara fleksibel pada seluruh ukuran layar.
 * - Auto-flip ke atas jika berada di dekat batas bawah layar/modal ("anti-tenggelam").
 * - Mendukung matchWidth={true} agar lebar menu dan tombol 100% identik.
 * - Otomatis tertutup saat klik di luar (click outside) atau menekan tombol Escape.
 */
export default function Dropdown({
    children,
    size = 'md',
    matchWidth = false,
    fullWidthOnMobile = true,
    className = '',
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [direction, setDirection] = useState('bottom');
    const dropdownRef = useRef(null);

    const close = () => setIsOpen(false);

    useEffect(() => {
        if (isOpen && dropdownRef.current) {
            const rect = dropdownRef.current.getBoundingClientRect();
            const spaceBelow = window.innerHeight - rect.bottom;
            const spaceAbove = rect.top;
            if (spaceBelow < 260 && spaceAbove > spaceBelow) {
                setDirection('top');
            } else {
                setDirection('bottom');
            }
        }
    }, [isOpen]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        const handleEscapeKey = (event) => {
            if (event.key === 'Escape') {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('touchstart', handleClickOutside);
            document.addEventListener('keydown', handleEscapeKey);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
            document.removeEventListener('keydown', handleEscapeKey);
        };
    }, [isOpen]);

    return (
        <DropdownContext.Provider value={{ isOpen, setIsOpen, close, size, matchWidth, direction }}>
            <div
                ref={dropdownRef}
                className={cn(
                    'relative text-left',
                    matchWidth || className.includes('w-full')
                        ? 'w-full block'
                        : (fullWidthOnMobile ? 'w-full sm:w-auto inline-block sm:inline-block' : 'inline-block'),
                    className
                )}
            >
                {children}
            </div>
        </DropdownContext.Provider>
    );
}

/**
 * Dropdown Trigger
 */
function Trigger({ children, className = '' }) {
    const { isOpen, setIsOpen } = useContext(DropdownContext);

    return (
        <div
            onClick={() => setIsOpen(!isOpen)}
            className={cn('cursor-pointer select-none w-full', className)}
        >
            {children}
        </div>
    );
}

/**
 * Dropdown Menu Content
 * Menyesuaikan lebar secara adaptif dan konsisten dengan tombol trigger,
 * serta aman dari overflow layar kecil.
 */
function Content({
    align = 'left',
    width = '',
    matchWidth = undefined,
    placement = undefined,
    className = '',
    children = undefined,
}) {
    const { isOpen, matchWidth: contextMatchWidth, direction: contextDirection } = useContext(DropdownContext);

    if (!isOpen) return null;

    const shouldMatchWidth = matchWidth !== undefined ? matchWidth : contextMatchWidth;
    const finalDirection = placement || contextDirection || 'bottom';

    const directionClasses = {
        bottom: 'top-full mt-2 origin-top',
        top: 'bottom-full mb-2 origin-bottom',
    };

    const alignmentClasses = {
        left: 'left-0',
        right: 'right-0',
        center: 'left-1/2 -translate-x-1/2',
    };

    return (
        <div
            className={cn(
                'absolute z-50 rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 border border-gray-100 p-1.5 focus:outline-none',
                'transform transition-all duration-200 ease-out animate-dropdown',
                directionClasses[finalDirection] || directionClasses.bottom,
                shouldMatchWidth
                    ? 'w-full min-w-full max-w-full left-0 right-0'
                    : cn(
                        alignmentClasses[align] || alignmentClasses.left,
                        width || 'min-w-full w-max max-w-[calc(100vw-2rem)] sm:max-w-md'
                    ),
                'max-h-64 overflow-y-auto',
                className
            )}
            role="menu"
            aria-orientation="vertical"
        >
            <div className="space-y-1">
                {children}
            </div>
        </div>
    );
}

/**
 * Dropdown Header
 */
function Header({ children = undefined, className = '' }) {
    return (
        <div className={cn('px-4 py-2.5 text-xs font-semibold text-gray-500 border-b border-gray-100 mb-1', className)}>
            {children}
        </div>
    );
}

/**
 * Dropdown Item
 * Menghilangkan pemotongan teks (tanpa truncate paksa) sehingga seluruh isi opsi terbaca utuh.
 */
function Item({
    href = undefined,
    method = 'get',
    as = 'button',
    onClick = undefined,
    icon = undefined,
    size = undefined,
    danger = false,
    active = false,
    truncate = false,
    disabled = false,
    className = '',
    children = undefined,
    ...props
}) {
    const { close, size: contextSize } = useContext(DropdownContext);

    const handleClick = (e) => {
        if (disabled) {
            e.preventDefault();
            return;
        }
        close();
        if (onClick) onClick(e);
    };

    const currentSize = size || contextSize || 'md';

    const sizeClasses = {
        sm: 'min-h-[2rem] py-1.5 px-3 text-xs gap-2 rounded-lg',
        md: 'min-h-[2.5rem] py-2 px-3.5 text-xs sm:text-sm gap-2.5 rounded-xl',
        lg: 'min-h-[3rem] py-2.5 px-5 text-base gap-3 rounded-xl',
    };

    const itemClasses = cn(
        'w-full flex items-center justify-start text-left font-medium select-none cursor-pointer',
        'transition-all duration-150 ease-in-out',
        sizeClasses[currentSize] || sizeClasses.md,
        danger
            ? 'text-red-600 hover:bg-red-50 hover:text-red-700 active:bg-red-100'
            : active
            ? 'bg-purple-50 text-purple-700 font-bold'
            : 'text-gray-700 hover:bg-purple-50 hover:text-purple-700 active:bg-purple-100',
        className
    );

    const textClasses = cn(
        'flex-1 min-w-0 text-left leading-snug',
        truncate ? 'truncate' : 'whitespace-normal break-words'
    );

    if (href) {
        return (
            <Link
                href={href}
                method={method}
                as={as}
                onClick={handleClick}
                className={itemClasses}
                role="menuitem"
                {...props}
            >
                {icon && <span className="w-4 h-4 shrink-0 flex items-center justify-center">{icon}</span>}
                <span className={textClasses}>{children}</span>
            </Link>
        );
    }

    return (
        <button
            type="button"
            disabled={disabled}
            onClick={handleClick}
            className={itemClasses}
            role="menuitem"
            {...props}
        >
            {icon && <span className="w-4 h-4 shrink-0 flex items-center justify-center">{icon}</span>}
            <span className={textClasses}>{children}</span>
        </button>
    );
}

/**
 * Dropdown Divider
 */
function Divider({ className = '' }) {
    return <div className={cn('my-1 border-t border-gray-100', className)} />;
}

Dropdown.Trigger = Trigger;
Dropdown.Content = Content;
Dropdown.Header = Header;
Dropdown.Item = Item;
Dropdown.Divider = Divider;
