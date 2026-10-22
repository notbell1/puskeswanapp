import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { usePage } from '@inertiajs/react';
import { cn } from '@/lib/utils';

const ToastContext = createContext({
    toasts: [],
    addToast: (_options) => {},
    removeToast: (_id) => {},
    success: (_message = '', _title = '') => {},
    error: (_message = '', _title = '') => {},
    warning: (_message = '', _title = '') => {},
    info: (_message = '', _title = '') => {},
    blue: (_message = '', _title = '') => {},
    deleted: (_message = '', _title = '') => {},
    red: (_message = '', _title = '') => {},
});

export const useToast = () => useContext(ToastContext);

/**
 * Toast Item Component
 * Menampilkan 1 notifikasi alert dengan icon, pesan, dan tombol dismiss
 */
function ToastItem({ toast, onRemove }) {
    const { id, type = 'info', title, message } = toast;

    const typeConfig = {
        success: {
            bg: 'bg-white border-emerald-200 shadow-emerald-500/10',
            badgeBg: 'bg-emerald-100 text-emerald-600',
            textColor: 'text-emerald-950',
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
            ),
        },
        error: {
            bg: 'bg-white border-red-200 shadow-red-500/10',
            badgeBg: 'bg-red-100 text-red-600',
            textColor: 'text-red-950',
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
            ),
        },
        warning: {
            bg: 'bg-white border-amber-200 shadow-amber-500/10',
            badgeBg: 'bg-amber-100 text-amber-600',
            textColor: 'text-amber-950',
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
            ),
        },
        info: {
            bg: 'bg-white border-blue-200 shadow-blue-500/10',
            badgeBg: 'bg-blue-100 text-blue-600',
            textColor: 'text-blue-950',
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
        },
        blue: {
            bg: 'bg-white border-blue-200 shadow-blue-500/10',
            badgeBg: 'bg-blue-100 text-blue-600',
            textColor: 'text-blue-950',
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
            ),
        },
        deleted: {
            bg: 'bg-white border-rose-200 shadow-rose-500/10',
            badgeBg: 'bg-rose-100 text-rose-600',
            textColor: 'text-rose-950',
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
            ),
        },
        red: {
            bg: 'bg-white border-rose-200 shadow-rose-500/10',
            badgeBg: 'bg-rose-100 text-rose-600',
            textColor: 'text-rose-950',
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
            ),
        },
    };

    const currentStyle = typeConfig[type] || typeConfig.info;

    return (
        <div
            className={cn(
                'pointer-events-auto flex w-full max-w-sm items-start gap-2.5 sm:gap-3 rounded-2xl border p-3 sm:p-4 shadow-xl transition-all duration-200 ease-out animate-toast-in',
                currentStyle.bg
            )}
            role="alert"
        >
            <div className={cn('h-8 w-8 sm:h-9 sm:w-9 rounded-xl flex items-center justify-center shrink-0', currentStyle.badgeBg)}>
                {currentStyle.icon}
            </div>

            <div className="flex-1 pt-0.5 min-w-0">
                {title && (
                    <h4 className="text-xs sm:text-sm font-semibold text-gray-900 leading-tight">
                        {title}
                    </h4>
                )}
                <p className="mt-0.5 text-[11px] sm:text-xs text-gray-600 leading-relaxed font-medium break-words">
                    {message}
                </p>
            </div>

            <button
                type="button"
                onClick={() => onRemove(id)}
                className="shrink-0 p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                aria-label="Tutup notifikasi"
            >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
    );
}

/**
 * ToastProvider Component
 * Mengelola antrean toast, mencegah duplikasi pesan bertumpuk,
 * dan otomatis menutup notifikasi dalam 2.5 detik (rentang 2-3 detik).
 */
export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    let flash = null;
    try {
        const page = usePage();
        flash = page?.props?.flash || null;
    } catch {
        flash = null;
    }

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    const addToast = useCallback(
        ({ type = 'info', title = '', message = '', duration = 2500 }) => {
            if (!message) return;

            setToasts((prev) => {
                const isDuplicate = prev.some(
                    (item) => item.message === message && item.type === type
                );
                if (isDuplicate) {
                    return prev; // Jangan tambahkan jika pesan yang sama sudah ada di layar
                }

                const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                const newToast = { id, type, title, message, duration };

                setTimeout(() => {
                    removeToast(id);
                }, duration);

                return [...prev, newToast];
            });
        },
        [removeToast]
    );

    const success = useCallback((message, title = 'Berhasil!') => {
        addToast({ type: 'success', title, message });
    }, [addToast]);

    const error = useCallback((message, title = 'Terjadi Kesalahan!') => {
        addToast({ type: 'error', title, message });
    }, [addToast]);

    const warning = useCallback((message, title = 'Peringatan!') => {
        addToast({ type: 'warning', title, message });
    }, [addToast]);

    const info = useCallback((message, title = 'Informasi') => {
        addToast({ type: 'info', title, message });
    }, [addToast]);

    const blue = useCallback((message, title = 'Berhasil Diperbarui') => {
        addToast({ type: 'blue', title, message });
    }, [addToast]);

    const deleted = useCallback((message, title = 'Data Dihapus') => {
        addToast({ type: 'deleted', title, message });
    }, [addToast]);

    const red = useCallback((message, title = 'Data Dihapus') => {
        addToast({ type: 'deleted', title, message });
    }, [addToast]);

    useEffect(() => {
        if (!flash) return;

        if (flash.success) {
            success(flash.success);
        }
        if (flash.deleted) {
            deleted(flash.deleted);
        }
        if (flash.error) {
            error(flash.error);
        }
        if (flash.warning) {
            warning(flash.warning);
        }
        if (flash.info || flash.message) {
            info(flash.info || flash.message);
        }
        if (flash.blue) {
            blue(flash.blue);
        }
    }, [flash, success, error, warning, info, blue, deleted]);

    return (
        <ToastContext.Provider
            value={{ toasts, addToast, removeToast, success, error, warning, info, blue, deleted, red }}
        >
            {children}

            <div
                aria-live="assertive"
                className="pointer-events-none fixed top-4 right-4 z-[9999] flex flex-col items-end gap-2.5 max-w-sm w-full px-3 sm:px-0"
            >
                {toasts.map((toast) => (
                    <ToastItem
                        key={toast.id}
                        toast={toast}
                        onRemove={removeToast}
                    />
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export default ToastProvider;

