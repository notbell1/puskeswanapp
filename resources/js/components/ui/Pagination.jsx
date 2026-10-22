import React from 'react';
import { Link } from '@inertiajs/react';
import { cn } from '@/lib/utils';

/**
 * Custom Pagination Component
 * 
 * Format yang didukung:
 * < 1 2 3 4 5 >
 * Jika berada di halaman 5 maka menjadi:
 * < 3 4 5 6 7 >
 * 
 * Fitur:
 * - Window sliding 5 halaman (halaman aktif berada di tengah jendela saat berpindah).
 * - Tombol navigasi '<' (Previous) dan '>' (Next) yang kompak.
 * - Tombol aktif menggunakan warna ungu utama (Primary Purple #7e22ce).
 * - Kompatibel dengan pagination bawaan Laravel Inertia maupun custom client-side onPageChange.
 */
export default function Pagination({
    links = [],
    currentPage = 1,
    totalPages = 1,
    from = undefined,
    to = undefined,
    total = undefined,
    windowSize = 5,
    className = '',
    onPageChange = undefined,
}) {
    let current = currentPage;
    let computedTotalPages = totalPages;

    let sampleUrl = '';
    const pageUrlMap = new Map();

    if (links && links.length > 0) {
        links.forEach((l) => {
            if (l.url) sampleUrl = l.url;
            const num = parseInt(l.label, 10);
            if (!isNaN(num)) {
                pageUrlMap.set(num, l.url);
            }
        });

        const activeLink = links.find((l) => l.active);
        if (activeLink) {
            const parsed = parseInt(activeLink.label, 10);
            if (!isNaN(parsed)) current = parsed;
        }

        const numericPages = Array.from(pageUrlMap.keys());
        if (numericPages.length > 0 && (!totalPages || totalPages <= 1)) {
            computedTotalPages = Math.max(...numericPages);
        }
    }

    current = Math.max(1, current || 1);
    computedTotalPages = Math.max(1, computedTotalPages || 1);

    if (computedTotalPages <= 1 && (!links || links.length <= 1)) {
        return null;
    }

    let startPage = Math.max(1, current - Math.floor(windowSize / 2));
    let endPage = Math.min(computedTotalPages, startPage + windowSize - 1);

    if (endPage - startPage + 1 < windowSize) {
        startPage = Math.max(1, endPage - windowSize + 1);
    }

    const visiblePages = [];
    for (let p = startPage; p <= endPage; p++) {
        visiblePages.push(p);
    }

    const getPageUrl = (pageNumber) => {
        if (pageUrlMap.has(pageNumber)) {
            return pageUrlMap.get(pageNumber);
        }
        if (sampleUrl) {
            if (sampleUrl.includes('page=')) {
                return sampleUrl.replace(/page=\d+/, `page=${pageNumber}`);
            }
            return sampleUrl.includes('?')
                ? `${sampleUrl}&page=${pageNumber}`
                : `${sampleUrl}?page=${pageNumber}`;
        }
        return `?page=${pageNumber}`;
    };

    const hasPrevious = current > 1;
    const hasNext = current < computedTotalPages;

    const prevUrl = hasPrevious ? getPageUrl(current - 1) : null;
    const nextUrl = hasNext ? getPageUrl(current + 1) : null;

    const renderPageButton = (pageNumber, label, isActive = false, isDisabled = false, customUrl = null) => {
        const commonClasses = cn(
            'h-8 min-w-[32px] px-2.5 text-xs font-semibold rounded-lg inline-flex items-center justify-center select-none transition-all duration-150',
            isActive
                ? 'bg-purple-700 text-white font-bold shadow-sm shadow-purple-600/30 hover:bg-purple-600 cursor-default'
                : isDisabled
                ? 'text-gray-300 bg-gray-50 border border-gray-100 cursor-not-allowed'
                : 'text-gray-700 bg-white border border-gray-200 hover:bg-purple-50 hover:text-purple-700 hover:border-purple-200 active:scale-95 cursor-pointer'
        );

        if (isDisabled || isActive) {
            return (
                <span key={label} className={commonClasses} aria-current={isActive ? 'page' : undefined}>
                    {label}
                </span>
            );
        }

        const targetUrl = customUrl || getPageUrl(pageNumber);

        if (onPageChange) {
            return (
                <button
                    key={label}
                    type="button"
                    onClick={() => onPageChange(pageNumber, targetUrl)}
                    className={commonClasses}
                    aria-label={`Buka halaman ${label}`}
                >
                    {label}
                </button>
            );
        }

        return (
            <Link
                key={label}
                href={targetUrl}
                preserveScroll
                preserveState
                className={commonClasses}
                aria-label={`Buka halaman ${label}`}
            >
                {label}
            </Link>
        );
    };

    return (
        <div className={cn('flex flex-col sm:flex-row items-center justify-between gap-3 py-3', className)}>
            {total !== undefined && total !== null && (
                <p className="text-xs text-gray-500 font-medium">
                    Menampilkan{' '}
                    <span className="font-semibold text-gray-800">{from || (current - 1) * 10 + 1}</span>
                    {' - '}
                    <span className="font-semibold text-gray-800">{to || Math.min(current * 10, total)}</span>
                    {' dari '}
                    <span className="font-semibold text-purple-700">{total}</span>
                    {' data'}
                </p>
            )}

            <nav className="inline-flex items-center gap-1.5" aria-label="Pagination">
                {renderPageButton(current - 1, '<', false, !hasPrevious, prevUrl)}

                {visiblePages.map((page) =>
                    renderPageButton(page, String(page), page === current, false)
                )}

                {renderPageButton(current + 1, '>', false, !hasNext, nextUrl)}
            </nav>
        </div>
    );
}
