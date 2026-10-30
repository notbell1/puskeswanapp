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

    // Generate pagination items dengan format konsisten selalu tepat 5 nomor halaman:
    // Contoh di awal: < 1 2 3 4 .. 20 >
    // Contoh di tengah (misal halaman 4 atau 5): < 1 .. 3 4 5 .. 20 > atau < 1 .. 4 5 6 .. 20 >
    // Contoh di akhir: < 1 .. 17 18 19 20 >
    const generatePaginationItems = (curr, total) => {
        if (total <= 5) {
            return Array.from({ length: total }, (_, i) => i + 1);
        }

        // Dekat awal: tepat 5 nomor halaman (1, 2, 3, 4, total)
        if (curr <= 3) {
            return [1, 2, 3, 4, 'ellipsis-end', total];
        }

        // Dekat akhir: tepat 5 nomor halaman (1, total-3, total-2, total-1, total)
        if (curr >= total - 2) {
            return [1, 'ellipsis-start', total - 3, total - 2, total - 1, total];
        }

        // Di tengah: tepat 5 nomor halaman (1, curr-1, curr, curr+1, total)
        return [
            1,
            'ellipsis-start',
            curr - 1,
            curr,
            curr + 1,
            'ellipsis-end',
            total,
        ];
    };

    const paginationItems = generatePaginationItems(current, computedTotalPages);

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
                prefetch
                cacheFor="1m"
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

                {paginationItems.map((item) => {
                    if (typeof item === 'string') {
                        return (
                            <span
                                key={item}
                                className="h-8 min-w-[28px] px-1 text-xs font-bold text-gray-400 inline-flex items-center justify-center select-none"
                                aria-hidden="true"
                            >
                                ..
                            </span>
                        );
                    }
                    return renderPageButton(item, String(item), item === current, false);
                })}

                {renderPageButton(current + 1, '>', false, !hasNext, nextUrl)}
            </nav>
        </div>
    );
}
